const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

/**
 * PUBLIC: get speakers for an approved + published event
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

    const [speakers] = await db.query(
      `
      SELECT
        es.id AS event_speaker_id,
        es.event_id,
        es.speaker_order,
        es.topic_title,
        es.topic_description,
        s.id AS speaker_id,
        s.name,
        s.email,
        s.phone,
        s.title,
        s.company,
        s.bio,
        s.photo
      FROM event_speakers es
      JOIN speakers s ON es.speaker_id = s.id
      WHERE es.event_id = ?
      ORDER BY es.speaker_order ASC, s.name ASC
      `,
      [eventId]
    );

    return res.json(speakers);
  } catch (error) {
    console.error('Get public event speakers error:', error);
    return res.status(500).json({ error: 'Server error fetching speakers.' });
  }
});

/**
 * ORGANIZER/ADMIN: get speakers for own event
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

    const [speakers] = await db.query(
      `
      SELECT
        es.id AS event_speaker_id,
        es.event_id,
        es.speaker_order,
        es.topic_title,
        es.topic_description,
        s.id AS speaker_id,
        s.name,
        s.email,
        s.phone,
        s.title,
        s.company,
        s.bio,
        s.photo
      FROM event_speakers es
      JOIN speakers s ON es.speaker_id = s.id
      WHERE es.event_id = ?
      ORDER BY es.speaker_order ASC, s.name ASC
      `,
      [eventId]
    );

    return res.json(speakers);
  } catch (error) {
    console.error('Manage event speakers error:', error);
    return res.status(500).json({ error: 'Server error fetching event speakers.' });
  }
});

/**
 * ORGANIZER/ADMIN: create speaker and assign to event
 */
router.post('/', authMiddleware, roleMiddleware('organizer', 'admin'), async (req, res) => {
  try {
    const {
      event_id,
      name,
      email,
      phone,
      title,
      company,
      bio,
      photo,
      speaker_order,
      topic_title,
      topic_description
    } = req.body;

    if (!event_id || !name) {
      return res.status(400).json({ error: 'Event and speaker name are required.' });
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
      return res.status(403).json({ error: 'You can only manage speakers for your own event.' });
    }

    const [speakerResult] = await db.query(
      `
      INSERT INTO speakers
      (name, email, phone, title, company, bio, photo)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        name.trim(),
        email || null,
        phone || null,
        title || null,
        company || null,
        bio || null,
        photo || null
      ]
    );

    const speakerId = speakerResult.insertId;

    await db.query(
      `
      INSERT INTO event_speakers
      (event_id, speaker_id, speaker_order, topic_title, topic_description)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        Number(event_id),
        speakerId,
        speaker_order ? Number(speaker_order) : 1,
        topic_title || null,
        topic_description || null
      ]
    );

    return res.status(201).json({
      message: 'Speaker created and assigned successfully.',
      speaker_id: speakerId
    });
  } catch (error) {
    console.error('Create speaker error:', error);
    return res.status(500).json({ error: 'Server error creating speaker.' });
  }
});

/**
 * ORGANIZER/ADMIN: delete speaker profile entirely
 */
router.delete('/:speakerId', authMiddleware, roleMiddleware('organizer', 'admin'), async (req, res) => {
  try {
    const speakerId = Number(req.params.speakerId);

   
    const [result] = await db.query(
      `DELETE FROM speakers WHERE id = ?`,
      [speakerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Speaker not found.' });
    }

    return res.json({ message: 'Speaker deleted successfully from the system.' });
  } catch (error) {
    console.error('Delete speaker error:', error);
    return res.status(500).json({ error: 'Server error deleting speaker profile.' });
  }
});

/**
 * ORGANIZER/ADMIN: assign existing speaker to event
 */
router.post('/assign', authMiddleware, roleMiddleware('organizer', 'admin'), async (req, res) => {
  try {
    const {
      event_id,
      speaker_id,
      speaker_order,
      topic_title,
      topic_description
    } = req.body;

    if (!event_id || !speaker_id) {
      return res.status(400).json({ error: 'Event and speaker are required.' });
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
      return res.status(403).json({ error: 'You can only assign speakers to your own event.' });
    }

    await db.query(
      `
      INSERT INTO event_speakers
      (event_id, speaker_id, speaker_order, topic_title, topic_description)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        Number(event_id),
        Number(speaker_id),
        speaker_order ? Number(speaker_order) : 1,
        topic_title || null,
        topic_description || null
      ]
    );

    return res.status(201).json({ message: 'Speaker assigned successfully.' });
  } catch (error) {
    console.error('Assign speaker error:', error);
    return res.status(500).json({ error: 'Server error assigning speaker.' });
  }
});

/**
 * ORGANIZER/ADMIN: update speaker profile
 */
router.put('/:speakerId', authMiddleware, roleMiddleware('organizer', 'admin'), async (req, res) => {
  try {
    const speakerId = Number(req.params.speakerId);
    const { name, email, phone, title, company, bio, photo } = req.body;

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(String(name).trim());
    }

    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email ? String(email).trim().toLowerCase() : null);
    }

    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone ? String(phone).trim() : null);
    }

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title ? String(title).trim() : null);
    }

    if (company !== undefined) {
      updates.push('company = ?');
      values.push(company ? String(company).trim() : null);
    }

    if (bio !== undefined) {
      updates.push('bio = ?');
      values.push(bio ? String(bio).trim() : null);
    }

    if (photo !== undefined) {
      updates.push('photo = ?');
      values.push(photo || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update.' });
    }

    values.push(speakerId);

    const [result] = await db.query(
      `UPDATE speakers SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Speaker not found.' });
    }

    return res.json({ message: 'Speaker updated successfully.' });
  } catch (error) {
    console.error('Update speaker error:', error);
    return res.status(500).json({ error: 'Server error updating speaker.' });
  }
});

/**
 * ORGANIZER/ADMIN: update speaker assignment details
 */
router.put('/assignment/:eventSpeakerId', authMiddleware, roleMiddleware('organizer', 'admin'), async (req, res) => {
  try {
    const eventSpeakerId = Number(req.params.eventSpeakerId);
    const { speaker_order, topic_title, topic_description } = req.body;

    const updates = [];
    const values = [];

    if (speaker_order !== undefined) {
      updates.push('speaker_order = ?');
      values.push(Number(speaker_order));
    }

    if (topic_title !== undefined) {
      updates.push('topic_title = ?');
      values.push(topic_title ? String(topic_title).trim() : null);
    }

    if (topic_description !== undefined) {
      updates.push('topic_description = ?');
      values.push(topic_description ? String(topic_description).trim() : null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid assignment fields provided.' });
    }

    values.push(eventSpeakerId);

    const [result] = await db.query(
      `UPDATE event_speakers SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Speaker assignment not found.' });
    }

    return res.json({ message: 'Speaker assignment updated successfully.' });
  } catch (error) {
    console.error('Update speaker assignment error:', error);
    return res.status(500).json({ error: 'Server error updating assignment.' });
  }
});

/**
 * ORGANIZER/ADMIN: remove speaker from event
 */
router.delete('/assignment/:eventSpeakerId', authMiddleware, roleMiddleware('organizer', 'admin'), async (req, res) => {
  try {
    const eventSpeakerId = Number(req.params.eventSpeakerId);

    const [result] = await db.query(
      `DELETE FROM event_speakers WHERE id = ?`,
      [eventSpeakerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Speaker assignment not found.' });
    }

    return res.json({ message: 'Speaker removed from event successfully.' });
  } catch (error) {
    console.error('Delete speaker assignment error:', error);
    return res.status(500).json({ error: 'Server error removing speaker from event.' });
  }
});

module.exports = router;