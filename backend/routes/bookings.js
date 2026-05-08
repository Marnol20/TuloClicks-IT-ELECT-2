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
 * 2. CREATE NEW BOOKING (With Inventory Fix)
 */
router.post('/', authMiddleware, async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { event_id, attendee_name, attendee_email, attendee_phone, items } = req.body;
    await connection.beginTransaction();

    // Check Event Availability
    const [events] = await connection.query(
      `SELECT * FROM events WHERE id = ? AND approval_status = 'approved' AND publish_status = 'published'`,
      [event_id]
    );
    if (events.length === 0) throw new Error('Event not available or has concluded.');

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

    // Process Items & Stock using 'tickets' table
    for (const item of items) {
      const [tickets] = await connection.query(`SELECT * FROM tickets WHERE id = ?`, [item.ticket_type_id]);
      const ticket = tickets[0];

      if (!ticket) throw new Error('Ticket type not found in inventory.');

      if (ticket.quantity_available < item.quantity) {
        throw new Error(`Sold out na ang ${ticket.name}. Sorry, dol!`);
      }

      const subtotal = ticket.price * item.quantity;
      totalAmount += subtotal;

      await connection.query(
        `INSERT INTO booking_items (booking_id, ticket_type_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)`,
        [bookingId, item.ticket_type_id, item.quantity, ticket.price, subtotal]
      );

      // Deduct from availability and add to sold
      await connection.query(
        `UPDATE tickets 
         SET quantity_sold = quantity_sold + ?, 
             quantity_available = quantity_available - ? 
         WHERE id = ?`, 
        [item.quantity, item.quantity, item.ticket_type_id]
      );
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
 * 3. RETRIEVAL ROUTES
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
  
  const [items] = await db.query(
    `SELECT bi.*, t.name AS ticket_name 
     FROM booking_items bi 
     JOIN tickets t ON bi.ticket_type_id = t.id 
     WHERE bi.booking_id = ?`, 
    [req.params.id]
  );
  res.json({ ...bookings[0], items });
});

/**
 * NEW ROUTE: MANAGE BOOKINGS FOR ORGANIZER (Fix para sa 404 error)
 */
router.get('/event/:eventId/manage', authMiddleware, roleMiddleware('organizer', 'admin'), async (req, res) => {
  try {
    const { eventId } = req.params;
    const [rows] = await db.query(
      `SELECT * FROM bookings WHERE event_id = ? ORDER BY booked_at DESC`,
      [eventId]
    );

    // Optional: Check if the requester is the owner of the event
    const [eventRows] = await db.query("SELECT organizer_id FROM events WHERE id = ?", [eventId]);
    if (req.user.role !== 'admin' && eventRows[0].organizer_id !== req.user.id) {
      return res.status(403).json({ error: 'Dili nimo ni event, dol. Access denied.' });
    }

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching manage bookings.' });
  }
});

/**
 * 4. UPDATE STATUS (Check-out / Time-out Logic)
 */
router.patch('/:id/status', authMiddleware, roleMiddleware('organizer', 'admin'), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // expected: 'attended'

  try {
    const [result] = await db.query(
      "UPDATE bookings SET booking_status = ?, updated_at = NOW(), checked_out_at = NOW() WHERE id = ?",
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
 * 5. CHECK-IN ATTENDEE
 */
router.patch('/:id/check-in', authMiddleware, roleMiddleware('organizer', 'admin'), async (req, res) => {
  await db.query(`UPDATE bookings SET booking_status = 'checked_in', checked_in_at = NOW() WHERE id = ?`, [req.params.id]);
  logActivity({ user_id: req.user.id, action: 'CHECKIN', entity_id: req.params.id, description: `Manual Check-in`, req });
  res.json({ message: 'Checked in successfully.' });
});

/**
 * 6. CANCEL BOOKING (Return Stocks)
 * ✅ UPDATED: Added user ownership verification + extra validations
 */
router.patch('/:id/cancel', authMiddleware, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    // ✅ NEW: Verify user owns this booking
    const [bookings] = await connection.query(
      `SELECT user_id, booking_status FROM bookings WHERE id = ?`,
      [req.params.id]
    );
    
    if (bookings.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Booking not found.' });
    }
    
    // ✅ NEW: Check if user owns the booking
    if (bookings[0].user_id !== req.user.id) {
      await connection.rollback();
      return res.status(403).json({ error: 'You can only cancel your own bookings.' });
    }
    
    // ✅ NEW: Prevent double-cancellation
    if (bookings[0].booking_status === 'cancelled') {
      await connection.rollback();
      return res.status(400).json({ error: 'This booking is already cancelled.' });
    }
    
    const [items] = await connection.query(`SELECT * FROM booking_items WHERE booking_id = ?`, [req.params.id]);
    
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
    
    // ✅ NEW: Log activity and notify user
    logActivity({ user_id: req.user.id, action: 'CANCEL_BOOKING', entity_id: req.params.id, description: `Cancelled by user`, req });
    createNotification({ user_id: req.user.id, title: 'Booking Cancelled', message: `Your booking has been cancelled and tickets refunded.`, type: 'info' });
    
    res.json({ message: 'Cancelled and stocks returned.' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: 'Cancel failed.' });
  } finally {
    connection.release();
  }
});

module.exports = router;