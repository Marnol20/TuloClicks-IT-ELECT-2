const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const logActivity = require('../utils/logger');
const createNotification = require('../utils/notify');

const router = express.Router();

/**
 * USER / ORGANIZER / ADMIN: create support ticket
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { booking_id, event_id, subject, issue_type, description } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ error: 'Subject and description are required.' });
    }

    const allowedIssueTypes = ['complaint', 'refund', 'technical', 'other'];
    if (issue_type && !allowedIssueTypes.includes(issue_type)) {
      return res.status(400).json({ error: 'Invalid issue type.' });
    }

    const [result] = await db.query(
      `INSERT INTO support_tickets (user_id, booking_id, event_id, subject, issue_type, description, status)
       VALUES (?, ?, ?, ?, ?, ?, 'open')`,
      [
        req.user.id,
        booking_id ? Number(booking_id) : null,
        event_id ? Number(event_id) : null,
        subject.trim(),
        issue_type || 'other',
        description.trim()
      ]
    );

    await logActivity({
      user_id: req.user.id,
      action: 'CREATE_SUPPORT',
      entity_type: 'support_ticket',
      entity_id: result.insertId,
      description: `Created support ticket: ${subject.trim()}`,
      req
    });

    return res.status(201).json({ message: 'Support ticket submitted successfully.', id: result.insertId });
  } catch (error) {
    console.error('Create support ticket error:', error);
    return res.status(500).json({ error: 'Server error creating support ticket.' });
  }
});

/**
 * ADMIN: get all support tickets para sa dashboard
 */
router.get('/admin/all', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const [tickets] = await db.query(
      `SELECT st.*, u.name AS user_name, u.email AS user_email
       FROM support_tickets st JOIN users u ON st.user_id = u.id
       ORDER BY st.created_at DESC`
    );
    return res.json(tickets);
  } catch (error) {
    console.error('Get all support tickets error:', error);
    return res.status(500).json({ error: 'Server error fetching support tickets.' });
  }
});

/**
 * ADMIN: update ticket status (e.g., from 'open' to 'resolved')
 */
router.patch('/:id/status', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const ticketId = req.params.id;

    const allowedStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    await db.query(
      'UPDATE support_tickets SET status = ? WHERE id = ?',
      [status, ticketId]
    );

    await logActivity({
      user_id: req.user.id,
      action: 'UPDATE_SUPPORT_STATUS',
      entity_type: 'support_ticket',
      entity_id: ticketId,
      description: `Updated ticket #${ticketId} status to ${status}`,
      req
    });

    return res.json({ message: 'Ticket status updated successfully.' });
  } catch (error) {
    console.error('Update support status error:', error);
    return res.status(500).json({ error: 'Server error updating ticket status.' });
  }
});

/**
 * USER: get my own support tickets
 */
router.get('/my-tickets', authMiddleware, async (req, res) => {
  try {
    const [tickets] = await db.query(
      'SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    return res.json(tickets);
  } catch (error) {
    console.error('Get my tickets error:', error);
    return res.status(500).json({ error: 'Server error fetching your tickets.' });
  }
});

module.exports = router;