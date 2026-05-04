const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const logActivity = require('../utils/logger');
const createNotification = require('../utils/notify');

const router = express.Router();

// 1. I-setup ang Multer para sa GCash Screenshot Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/payments/';
    // Siguruha nga nag-exist ang folder, kon wala, i-create kini
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // I-save ang file nga naay unique timestamp para dili mag-overwrite
    cb(null, `proof-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit sa 5MB ang image
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only images (jpeg, jpg, png) are allowed!'));
  }
});

/**
 * USER: Upload GCash Proof of Payment
 */
router.post('/upload-proof', authMiddleware, upload.single('proof'), async (req, res) => {
  try {
    const { booking_id } = req.body;
    const proof_image = req.file ? req.file.filename : null;

    if (!booking_id || !proof_image) {
      return res.status(400).json({ error: 'Booking ID and proof image are required.' });
    }

    // I-update ang payment record aron i-attach ang image path
    // Gigamit nato ang booking_id para ma-link sa saktong transaction
    const [result] = await db.query(
      `UPDATE payments SET attachment = ?, payment_status = 'pending' WHERE booking_id = ?`,
      [proof_image, Number(booking_id)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Payment record not found for this booking.' });
    }

    await logActivity({
      user_id: req.user.id,
      action: 'UPLOAD_PAYMENT_PROOF',
      entity_type: 'payment',
      description: `Uploaded GCash proof for booking #${booking_id}`,
      req
    });

    return res.json({ 
      message: 'Proof of payment uploaded successfully!',
      filename: proof_image 
    });
  } catch (error) {
    console.error('Upload proof error:', error);
    return res.status(500).json({ error: 'Server error during file upload.' });
  }
});

/**
 * USER/ADMIN: create payment record for a booking
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      booking_id,
      provider,
      payment_method,
      payment_reference,
      amount
    } = req.body;

    if (!booking_id || amount === undefined || amount === null) {
      return res.status(400).json({ error: 'Booking and amount are required.' });
    }

    const [bookings] = await db.query(
      `SELECT * FROM bookings WHERE id = ? LIMIT 1`,
      [Number(booking_id)]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    const booking = bookings[0];

    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const [result] = await db.query(
      `
      INSERT INTO payments
      (booking_id, payment_reference, provider, payment_method, amount, currency, payment_status)
      VALUES (?, ?, ?, ?, ?, 'PHP', 'pending')
      `,
      [Number(booking_id), payment_reference || null, provider || null, payment_method || null, Number(amount)]
    );

    await logActivity({
      user_id: req.user.id,
      action: 'CREATE_PAYMENT',
      entity_type: 'payment',
      entity_id: result.insertId,
      description: `Created payment for booking ID ${booking_id}`,
      req
    });

    return res.status(201).json({
      message: 'Payment record created successfully.',
      id: result.insertId
    });
  } catch (error) {
    console.error('Create payment error:', error);
    return res.status(500).json({ error: 'Server error.' });
  }
});

/**
 * ADMIN: get all payments (Updated to include attachment)
 */
router.get('/admin/all', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const [payments] = await db.query(
      `
      SELECT
        p.*,
        b.booking_reference,
        b.attendee_name,
        b.attendee_email,
        e.title AS event_title
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN events e ON b.event_id = e.id
      ORDER BY p.created_at DESC
      `
    );
    return res.json(payments);
  } catch (error) {
    console.error('Get all payments error:', error);
    return res.status(500).json({ error: 'Server error fetching payments.' });
  }
});

/**
 * ADMIN: mark payment success
 */
router.patch('/:id/success', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  const connection = await db.getConnection();
  try {
    const paymentId = Number(req.params.id);
    await connection.beginTransaction();

    const [payments] = await connection.query(`SELECT * FROM payments WHERE id = ? LIMIT 1`, [paymentId]);
    if (payments.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Payment not found.' });
    }

    const payment = payments[0];
    const [bookingRows] = await connection.query(`SELECT * FROM bookings WHERE id = ? LIMIT 1`, [payment.booking_id]);
    const booking = bookingRows[0];

    await connection.query(`UPDATE payments SET payment_status = 'success', paid_at = NOW() WHERE id = ?`, [paymentId]);
    await connection.query(`UPDATE bookings SET payment_status = 'paid', booking_status = 'confirmed' WHERE id = ?`, [payment.booking_id]);

    await connection.commit();
    await logActivity({ user_id: req.user.id, action: 'PAYMENT_SUCCESS', entity_type: 'payment', entity_id: paymentId, description: `Approved payment ID ${paymentId}`, req });
    await createNotification({ user_id: booking.user_id, title: 'Payment Successful', message: `Verified payment for ${booking.booking_reference || booking.id}.`, type: 'success', related_id: paymentId });

    return res.json({ message: 'Payment marked as successful.' });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ error: 'Server error.' });
  } finally {
    connection.release();
  }
});

/**
 * ADMIN: mark payment failed
 */
router.patch('/:id/fail', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  const connection = await db.getConnection();
  try {
    const paymentId = Number(req.params.id);
    await connection.beginTransaction();

    const [payments] = await connection.query(`SELECT * FROM payments WHERE id = ? LIMIT 1`, [paymentId]);
    const payment = payments[0];
    const [bookingRows] = await connection.query(`SELECT * FROM bookings WHERE id = ? LIMIT 1`, [payment.booking_id]);
    const booking = bookingRows[0];

    await connection.query(`UPDATE payments SET payment_status = 'failed' WHERE id = ?`, [paymentId]);
    await connection.query(`UPDATE bookings SET payment_status = 'pending', booking_status = 'pending' WHERE id = ?`, [payment.booking_id]);

    await connection.commit();
    await createNotification({ user_id: booking.user_id, title: 'Payment Rejected', message: `Payment for ${booking.booking_reference} failed. Please try again.`, type: 'error', related_id: paymentId });

    return res.json({ message: 'Payment rejected. Booking remains pending.' });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ error: 'Server error' });
  } finally {
    connection.release();
  }
});

/**
 * ADMIN: refund payment
 */
router.patch('/:id/refund', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  const connection = await db.getConnection();
  try {
    const paymentId = Number(req.params.id);
    const { refund_reason } = req.body;
    await connection.beginTransaction();

    const [payments] = await connection.query(`SELECT * FROM payments WHERE id = ? LIMIT 1`, [paymentId]);
    const payment = payments[0];

    await connection.query(`UPDATE payments SET payment_status = 'refunded', refund_reason = ? WHERE id = ?`, [refund_reason || 'Refunded', paymentId]);
    await connection.query(`UPDATE bookings SET payment_status = 'refunded', booking_status = 'refunded' WHERE id = ?`, [payment.booking_id]);

    await connection.commit();
    return res.json({ message: 'Payment refunded successfully.' });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ error: 'Server error' });
  } finally {
    connection.release();
  }
});

module.exports = router;