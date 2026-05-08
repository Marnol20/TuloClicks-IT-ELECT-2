const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// SUBMIT REVIEW
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { event_id, rating, comment } = req.body;
    const user_id = req.user.id;

    /**
     * GI-UPDATE NGA LOGIC CHECK:
     * Tugotan ang user nga mo-review kon ang status kay 'checked_in' O 'attended'.
     * Kini nagsiguro nga bisag human na ang checkout (Time-out), maka-review gihapon sila.[cite: 1]
     */
    const [bookings] = await db.query(
      `SELECT id FROM bookings 
       WHERE user_id = ? AND event_id = ? 
       AND (booking_status = 'checked_in' OR booking_status = 'attended') 
       LIMIT 1`,
      [user_id, event_id]
    );

    if (bookings.length === 0) {
      return res.status(403).json({ error: 'Review is only allowed after attending the event.' });
    }

    await db.query(
      `INSERT INTO reviews (user_id, event_id, rating, comment) VALUES (?, ?, ?, ?)`,
      [user_id, event_id, rating, comment]
    );

    res.status(201).json({ message: 'Review submitted successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Server error submitting review.' });
  }
});

// GET REVIEWS FOR EVENT
router.get('/event/:eventId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, u.name AS user_name 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.event_id = ? ORDER BY r.created_at DESC`,
      [req.params.eventId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching reviews.' });
  }
});

module.exports = router;