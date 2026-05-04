const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const logActivity = require('../utils/logger');
const createNotification = require('../utils/notify');

const router = express.Router();

// Helper: Generate Unique Reference
function generateBookingReference() {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `TC-${year}-${random}`;
}

/**
 * 1. VERIFY TICKET (QR SCAN)
 */
router.get('/verify/:reference', authMiddleware, roleMiddleware('organizer', 'admin'), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT b.*, e.title AS event_title, e.organizer_id 
       FROM bookings b JOIN events e ON b.event_id = e.id 
       WHERE b.booking_reference = ? LIMIT 1`,
      [req.params.reference]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Ticket not found.' });
    
    const booking = rows[0];
    if (req.user.role !== 'admin' && booking.organizer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    return res.json({ valid: true, booking });
  } catch (error) {
    res.status(500).json({ error: 'Server error verifying ticket.' });
  }
});

/**
 * 2. CREATE NEW BOOKING
 */
router.post('/', authMiddleware, async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { event_id, attendee_name, attendee_email, attendee_phone, items } = req.body;
    await connection.beginTransaction();

    // Check Event Availability
    const [events] = await connection.query(
      `SELECT * FROM events WHERE id = ? AND approval_status = 'approved' AND publish_status = 'published' AND publish_status != 'concluded'`,
      [event_id]
    );
    if (events.length === 0) throw new Error('Event not available or has concluded!.');

<<<<<<< HEAD
    // Also check if event end date/time has passed
=======
>>>>>>> 1f8375c (feat: refactor ticket inventory, add support UI, and implement QR-based review system)
    const event = events[0];
    const now = new Date();
    const eventEndDateTime = new Date(`${event.end_date}T${event.end_time}`);
    if (now > eventEndDateTime) {
      throw new Error('Event has ended. No new bookings allowed.');
    }

    const reference = generateBookingReference();
    let totalAmount = 0;

    // Create Base Booking
    const [bookingResult] = await connection.query(
      `INSERT INTO bookings (booking_reference, user_id, event_id, booking_status, payment_status, attendee_name, attendee_email, attendee_phone, total_amount) 
       VALUES (?, ?, ?, 'pending', 'unpaid', ?, ?, ?, 0)`,
      [reference, req.user.id, event_id, attendee_name, attendee_email, attendee_phone]
    );
    const bookingId = bookingResult.insertId;

    // Process Items & Stock
    for (const item of items) {
<<<<<<< HEAD
      const [tickets] = await connection.query(`SELECT * FROM ticket_types WHERE id = ?`, [item.ticket_type_id]);
      const ticket = tickets[0];
=======
      const [tickets] = await connection.query(`SELECT * FROM tickets WHERE id = ?`, [item.ticket_type_id]);
      const ticket = tickets[0];

      if (!ticket) throw new Error('Ticket type not found in inventory.');

      if (ticket.quantity_available < item.quantity) {
        throw new Error(`Sold out na ang ${ticket.name}. Sorry, dol!`);
      }

>>>>>>> 1f8375c (feat: refactor ticket inventory, add support UI, and implement QR-based review system)
      const subtotal = ticket.price * item.quantity;
      totalAmount += subtotal;

      await connection.query(
        `INSERT INTO booking_items (booking_id, ticket_type_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)`,
        [bookingId, item.ticket_type_id, item.quantity, ticket.price, subtotal]
      );
<<<<<<< HEAD
      await connection.query(`UPDATE ticket_types SET quantity_sold = quantity_sold + ? WHERE id = ?`, [item.quantity, item.ticket_type_id]);
=======

      await connection.query(
        `UPDATE tickets 
         SET quantity_sold = quantity_sold + ?, 
             quantity_available = quantity_available - ? 
         WHERE id = ?`, 
        [item.quantity, item.quantity, item.ticket_type_id]
      );
>>>>>>> 1f8375c (feat: refactor ticket inventory, add support UI, and implement QR-based review system)
    }

    await connection.query(`UPDATE bookings SET total_amount = ? WHERE id = ?`, [totalAmount, bookingId]);
    await connection.commit();

    logActivity({ user_id: req.user.id, action: 'CREATE_BOOKING', entity_id: bookingId, description: `Reference: ${reference}`, req });
    createNotification({ user_id: req.user.id, title: 'Booking Created', message: `Ref: ${reference}`, type: 'success' });

    res.status(201).json({ booking_id: bookingId, booking_reference: reference, total_amount: totalAmount });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

/**
 * 3. RETRIEVAL ROUTES (MY BOOKINGS & DETAILS)
 */
router.get('/my-bookings', authMiddleware, async (req, res) => {
  const [rows] = await db.query(
    `SELECT b.*, e.title AS event_title, e.start_date, e.start_time, e.event_image 
     FROM bookings b JOIN events e ON b.event_id = e.id WHERE b.user_id = ? ORDER BY b.booked_at DESC`,
    [req.user.id]
  );
  res.json(rows);
});

router.get('/:id', authMiddleware, async (req, res) => {
  const [bookings] = await db.query(`SELECT b.*, e.title AS event_title FROM bookings b JOIN events e ON b.event_id = e.id WHERE b.id = ?`, [req.params.id]);
<<<<<<< HEAD
  const [items] = await db.query(`SELECT bi.*, tt.name AS ticket_name FROM booking_items bi JOIN ticket_types tt ON bi.ticket_type_id = tt.id WHERE bi.booking_id = ?`, [req.params.id]);
=======
  
  const [items] = await db.query(
    `SELECT bi.*, t.name AS ticket_name 
     FROM booking_items bi 
     JOIN tickets t ON bi.ticket_type_id = t.id 
     WHERE bi.booking_id = ?`, 
    [req.params.id]
  );
>>>>>>> 1f8375c (feat: refactor ticket inventory, add support UI, and implement QR-based review system)
  res.json({ ...bookings[0], items });
});

/**
 * 4. ORGANIZER: MANAGE EVENT BOOKINGS
 */
router.get('/event/:eventId/manage', authMiddleware, roleMiddleware('organizer', 'admin'), async (req, res) => {
  const [rows] = await db.query(`SELECT * FROM bookings WHERE event_id = ? ORDER BY booked_at DESC`, [req.params.eventId]);
  res.json(rows);
});

/**
 * 5. CHECK-IN ATTENDEE
 */
router.patch('/:id/check-in', authMiddleware, roleMiddleware('organizer', 'admin'), async (req, res) => {
  await db.query(`UPDATE bookings SET booking_status = 'checked_in', checked_in_at = NOW() WHERE id = ?`, [req.params.id]);
  logActivity({ user_id: req.user.id, action: 'CHECKIN', entity_id: req.params.id, description: `Manual Check-in`, req });
  res.json({ message: 'Checked in successfully.' });
});

/**
<<<<<<< HEAD
=======
 * NEW: UPDATE STATUS (CHECK-OUT / TIME-OUT LOGIC)
 * Kini nga route ang mo-handle sa pag-set sa 'attended' status.
 */
router.patch('/:id/status', authMiddleware, roleMiddleware('organizer', 'admin'), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // status: 'attended'

  try {
    const [result] = await db.query(
      "UPDATE bookings SET booking_status = ?, updated_at = NOW() WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    logActivity({ user_id: req.user.id, action: 'UPDATE_STATUS', entity_id: id, description: `Status updated to ${status}`, req });
    res.json({ message: `Status updated to ${status} successfully.` });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Server error updating status.' });
  }
});

/**
>>>>>>> 1f8375c (feat: refactor ticket inventory, add support UI, and implement QR-based review system)
 * 6. CANCEL BOOKING
 */
router.patch('/:id/cancel', authMiddleware, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [items] = await connection.query(`SELECT * FROM booking_items WHERE booking_id = ?`, [req.params.id]);
<<<<<<< HEAD
    for (const item of items) {
      await connection.query(`UPDATE ticket_types SET quantity_sold = quantity_sold - ? WHERE id = ?`, [item.quantity, item.ticket_type_id]);
    }
    await connection.query(`UPDATE bookings SET booking_status = 'cancelled' WHERE id = ?`, [req.params.id]);
    await connection.commit();
    res.json({ message: 'Cancelled.' });
=======
    
    for (const item of items) {
      await connection.query(
        `UPDATE tickets 
         SET quantity_sold = quantity_sold - ?, 
             quantity_available = quantity_available + ? 
         WHERE id = ?`, 
        [item.quantity, item.quantity, item.ticket_type_id]
      );
    }
    
    await connection.query(`UPDATE bookings SET booking_status = 'cancelled' WHERE id = ?`, [req.params.id]);
    await connection.commit();
    res.json({ message: 'Cancelled and stocks returned.' });
>>>>>>> 1f8375c (feat: refactor ticket inventory, add support UI, and implement QR-based review system)
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: 'Cancel failed.' });
  } finally {
    connection.release();
  }
});

module.exports = router;