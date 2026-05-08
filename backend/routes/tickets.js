const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

/**
 * PUBLIC: Get all unique ticket names (e.g., VIP, Normal) for dropdown
 */
router.get('/types/list', async (req, res) => {
  try {
    const [types] = await db.query('SELECT DISTINCT name FROM ticket_types');
    return res.json(types);
  } catch (error) {
    console.error('Fetch ticket types list error:', error);
    return res.status(500).json({ error: 'Server error fetching ticket types.' });
  }
});

/**
 * PUBLIC: get active tickets for approved + published event from inventory
 */
router.get('/event/:eventId', async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);

    const [events] = await db.query(
      `
      SELECT id
      FROM events
      WHERE id = ?
        AND approval_status = 'approved'
        AND publish_status = 'published'
      LIMIT 1
      `,
      [eventId]
    );

    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found or not public.' });
    }

    // Gikan na sa 'tickets' table ang inventory
    const [tickets] = await db.query(
      `
      SELECT *
      FROM tickets
      WHERE event_id = ?
        AND is_active = 1
      ORDER BY created_at ASC
      `,
      [eventId]
    );

    return res.json(tickets);
  } catch (error) {
    console.error('Get public tickets error:', error);
    return res.status(500).json({ error: 'Server error fetching tickets.' });
  }
});

/**
 * ORGANIZER/ADMIN: get all tickets for own event from inventory
 */
router.get('/manage/event/:eventId', authMiddleware, roleMiddleware('organizer', 'admin'), async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);

    const [events] = await db.query(
      `SELECT * FROM events WHERE id = ? LIMIT 1`,
      [eventId]
    );

    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const event = events[0];

    if (req.user.role !== 'admin' && event.organizer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied for this event.' });
    }

    // SELECT gikan sa 'tickets' table
    const [tickets] = await db.query(
      `
      SELECT *
      FROM tickets
      WHERE event_id = ?
      ORDER BY created_at ASC
      `,
      [eventId]
    );

    return res.json(tickets);
  } catch (error) {
    console.error('Manage tickets error:', error);
    return res.status(500).json({ error: 'Server error fetching event tickets.' });
  }
});

/**
 * ORGANIZER/ADMIN: create ticket type in inventory
 */
router.post('/', authMiddleware, roleMiddleware('organizer', 'admin'), async (req, res) => {
  try {
    const {
      event_id,
      name,
      description,
      price,
      quantity_available,
      is_active
    } = req.body;

    if (!event_id || !name || price === undefined || quantity_available === undefined) {
      return res.status(400).json({
        error: 'Event, ticket name, price, and quantity are required.'
      });
    }

    const [events] = await db.query(
      `SELECT * FROM events WHERE id = ? LIMIT 1`,
      [Number(event_id)]
    );

    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const event = events[0];

    if (req.user.role !== 'admin' && event.organizer_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only manage tickets for your own event.' });
    }

    // INSERT sa 'tickets' table na gyud
    const [result] = await db.query(
      `
      INSERT INTO tickets
      (
        event_id,
        name,
        description,
        price,
        quantity_available,
        quantity_sold,
        is_active
      )
      VALUES (?, ?, ?, ?, ?, 0, ?)
      `,
      [
        Number(event_id),
        name.trim(),
        description || null,
        Number(price),
        Number(quantity_available),
        is_active === undefined ? 1 : (is_active ? 1 : 0)
      ]
    );

    return res.status(201).json({
      message: 'Ticket created in inventory successfully.',
      id: result.insertId
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    return res.status(500).json({ error: 'Server error creating ticket.' });
  }
});

/**
 * ORGANIZER/ADMIN: update ticket in inventory
 */
router.put('/:id', authMiddleware, roleMiddleware('organizer', 'admin'), async (req, res) => {
  try {
    const ticketId = Number(req.params.id);

    // I-update ang query sa 'tickets' table
    const [tickets] = await db.query(
      `SELECT * FROM tickets WHERE id = ? LIMIT 1`,
      [ticketId]
    );

    if (tickets.length === 0) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    const ticket = tickets[0];

    const [events] = await db.query(
      `SELECT * FROM events WHERE id = ? LIMIT 1`,
      [ticket.event_id]
    );

    if (events.length === 0) {
      return res.status(404).json({ error: 'Parent event not found.' });
    }

    const event = events[0];

    if (req.user.role !== 'admin' && event.organizer_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only update tickets for your own event.' });
    }

    const {
      name,
      description,
      price,
      quantity_available,
      quantity_sold,
      is_active
    } = req.body;

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(String(name).trim());
    }

    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description ? String(description).trim() : null);
    }

    if (price !== undefined) {
      updates.push('price = ?');
      values.push(Number(price));
    }

    if (quantity_available !== undefined) {
      updates.push('quantity_available = ?');
      values.push(Number(quantity_available));
    }

    if (quantity_sold !== undefined) {
      updates.push('quantity_sold = ?');
      values.push(Number(quantity_sold));
    }

    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update.' });
    }

    values.push(ticketId);

    // UPDATE sa 'tickets' table
    await db.query(
      `UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return res.json({ message: 'Ticket inventory updated successfully.' });
  } catch (error) {
    console.error('Update ticket error:', error);
    return res.status(500).json({ error: 'Server error updating ticket.' });
  }
});

/**
 * ORGANIZER/ADMIN: soft delete ticket from inventory
 */
router.delete('/:id', authMiddleware, roleMiddleware('organizer', 'admin'), async (req, res) => {
  try {
    const ticketId = Number(req.params.id);

    const [tickets] = await db.query(
      `SELECT * FROM tickets WHERE id = ? LIMIT 1`,
      [ticketId]
    );

    if (tickets.length === 0) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    const ticket = tickets[0];

    const [events] = await db.query(
      `SELECT * FROM events WHERE id = ? LIMIT 1`,
      [ticket.event_id]
    );

    if (events.length === 0) {
      return res.status(404).json({ error: 'Parent event not found.' });
    }

    const event = events[0];

    if (req.user.role !== 'admin' && event.organizer_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only deactivate tickets for your own event.' });
    }

    // SOFT DELETE sa 'tickets' table (set is_active to 0)
    await db.query(
      `UPDATE tickets SET is_active = 0 WHERE id = ?`,
      [ticketId]
    );

    return res.json({ message: 'Ticket deactivated successfully from inventory.' });
  } catch (error) {
    console.error('Delete ticket error:', error);
    return res.status(500).json({ error: 'Server error deactivating ticket.' });
  }
});

module.exports = router;