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

// Multer storage setup for event images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/events/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `event-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/**
 * Helper: Fetch event by ID
 */
async function getEventById(id) {
  const [events] = await db.query(
    `SELECT * FROM events WHERE id = ? LIMIT 1`,
    [id]
  );
  return events.length > 0 ? events[0] : null;
}

/**
 * Helper: Check if user owns event (for non-admin)
 */
function checkOwnership(event, user) {
  return user.role === 'admin' || event.organizer_id === user.id;
}

function makeSlug(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * PUBLIC: get approved and published events
 */
router.get('/', async (req, res) => {
  try {
    const [events] = await db.query(`
      SELECT
        e.id,
        e.organizer_id,
        e.category_id,
        e.venue_id,
        e.title,
        e.slug,
        e.description,
        e.event_image,
        e.start_date,
        e.end_date,
        e.start_time,
        e.end_time,
        e.location_type,
        e.custom_location,
        e.online_link,
        e.approval_status,
        e.publish_status,
        e.featured,
        e.featured_until,
        e.platform_fee,
        e.total_revenue,
        e.created_at,
        c.name AS category_name,
        v.name AS venue_name,
        u.name AS organizer_name
      FROM events e
      LEFT JOIN event_categories c ON e.category_id = c.id
      LEFT JOIN venues v ON e.venue_id = v.id
      LEFT JOIN users u ON e.organizer_id = u.id
      WHERE e.approval_status = 'approved'
        AND e.publish_status = 'published'
      ORDER BY e.created_at DESC
    `);

    return res.json(events);
  } catch (error) {
    console.error('Get public events error:', error);
    return res.status(500).json({ error: 'Server error fetching events.' });
  }
});

/**
 * ADMIN: get all events
 */
router.get('/admin/all', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const [events] = await db.query(`
      SELECT
        e.*,
        c.name AS category_name,
        v.name AS venue_name,
        u.name AS organizer_name
      FROM events e
      LEFT JOIN event_categories c ON e.category_id = c.id
      LEFT JOIN venues v ON e.venue_id = v.id
      LEFT JOIN users u ON e.organizer_id = u.id
      ORDER BY e.created_at DESC
    `);

    return res.json(events);
  } catch (error) {
    console.error('Get admin events error:', error);
    return res.status(500).json({ error: 'Server error fetching all events.' });
  }
});

/**
 * ORGANIZER: get own events
 */
router.get('/organizer/my-events', authMiddleware, roleMiddleware('organizer', 'admin'), async (req, res) => {
  try {
    const ownerId = req.user.role === 'admin' && req.query.organizer_id
      ? Number(req.query.organizer_id)
      : req.user.id;

    const [events] = await db.query(
      `
      SELECT
        e.*,
        c.name AS category_name,
        v.name AS venue_name
      FROM events e
      LEFT JOIN event_categories c ON e.category_id = c.id
      LEFT JOIN venues v ON e.venue_id = v.id
      WHERE e.organizer_id = ?
      ORDER BY e.created_at DESC
      `,
      [ownerId]
    );

    return res.json(events);
  } catch (error) {
    console.error('Get organizer events error:', error);
    return res.status(500).json({ error: 'Server error fetching organizer events.' });
  }
});

/**
 * GET one event by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const eventId = Number(req.params.id);

    const [events] = await db.query(
      `
      SELECT
        e.*,
        c.name AS category_name,
        v.name AS venue_name,
        v.address AS venue_address,
        v.city AS venue_city,
        v.province AS venue_province,
        u.name AS organizer_name
      FROM events e
      LEFT JOIN event_categories c ON e.category_id = c.id
      LEFT JOIN venues v ON e.venue_id = v.id
      LEFT JOIN users u ON e.organizer_id = u.id
      WHERE e.id = ?
      LIMIT 1
      `,
      [eventId]
    );

    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const event = events[0];

    if (
      event.approval_status !== 'approved' ||
      event.publish_status !== 'published'
    ) {
      return res.status(403).json({ error: 'This event is not publicly available.' });
    }

    return res.json(event);
  } catch (error) {
    console.error('Get one event error:', error);
    return res.status(500).json({ error: 'Server error fetching event.' });
  }
});

/**
 * ORGANIZER: create event
 */
router.post('/', authMiddleware, roleMiddleware('organizer', 'admin'), upload.single('event_image'), async (req, res) => {
  try {
    const {
      category_id,
      venue_id,
      title,
      description,
      start_date,
      end_date,
      start_time,
      end_time,
      location_type,
      custom_location,
      online_link
    } = req.body;

    const event_image = req.file ? req.file.filename : null;

    if (!category_id || !title || !description || !start_date || !start_time) {
      return res.status(400).json({
        error: 'Category, title, description, start date, and start time are required.'
      });
    }

    if (location_type === 'physical' && !venue_id && !custom_location) {
      return res.status(400).json({
        error: 'Venue or custom location is required for physical events.'
      });
    }

    const baseSlug = makeSlug(title);
    const uniqueSlug = `${baseSlug}-${Date.now()}`;

    const [result] = await db.query(
      `
      INSERT INTO events
      (
        organizer_id,
        category_id,
        venue_id,
        title,
        slug,
        description,
        event_image,
        start_date,
        end_date,
        start_time,
        end_time,
        location_type,
        custom_location,
        online_link,
        approval_status,
        publish_status,
        featured,
        platform_fee,
        total_revenue
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'draft', 0, 0.00, 0.00)
      `,
      [
        req.user.id,
        Number(category_id),
        venue_id ? Number(venue_id) : null,
        title.trim(),
        uniqueSlug,
        description.trim(),
        event_image || null,
        start_date,
        end_date || null,
        start_time,
        end_time || null,
        location_type || 'physical',
        custom_location || null,
        online_link || null
      ]
    );

    await logActivity({
      user_id: req.user.id,
      action: 'CREATE_EVENT',
      entity_type: 'event',
      entity_id: result.insertId,
      description: `Created event: ${title.trim()}`,
      req
    });

    await createNotification({
      user_id: req.user.id,
      title: 'Event Created',
      message: `Your event "${title.trim()}" has been created as a draft and is waiting for submission.`,
      type: 'info',
      related_type: 'event',
      related_id: result.insertId
    });

    return res.status(201).json({
      message: 'Event created successfully.',
      id: result.insertId
    });
  } catch (error) {
    console.error('Create event error:', error);
    return res.status(500).json({ error: 'Server error creating event.' });
  }
});

/**
 * ORGANIZER: update own event
 */
router.put('/:id', authMiddleware, roleMiddleware('organizer', 'admin'), upload.single('event_image'), async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const event = await getEventById(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    if (!checkOwnership(event, req.user)) {
      return res.status(403).json({ error: 'You can only update your own events.' });
    }

    const {
      category_id,
      venue_id,
      title,
      description,
      start_date,
      end_date,
      start_time,
      end_time,
      location_type,
      custom_location,
      online_link,
      publish_status
    } = req.body;

    const updates = [];
    const values = [];

    if (category_id !== undefined) {
      updates.push('category_id = ?');
      values.push(Number(category_id));
    }

    if (venue_id !== undefined) {
      updates.push('venue_id = ?');
      values.push(venue_id ? Number(venue_id) : null);
    }

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(String(title).trim());

      updates.push('slug = ?');
      values.push(`${makeSlug(String(title).trim())}-${Date.now()}`);
    }

    if (description !== undefined) {
      updates.push('description = ?');
      values.push(String(description).trim());
    }

    if (req.file) {
      updates.push('event_image = ?');
      values.push(req.file.filename);
    }

    if (start_date !== undefined) {
      updates.push('start_date = ?');
      values.push(start_date);
    }

    if (end_date !== undefined) {
      updates.push('end_date = ?');
      values.push(end_date || null);
    }

    if (start_time !== undefined) {
      updates.push('start_time = ?');
      values.push(start_time);
    }

    if (end_time !== undefined) {
      updates.push('end_time = ?');
      values.push(end_time || null);
    }

    if (location_type !== undefined) {
      updates.push('location_type = ?');
      values.push(location_type);
    }

    if (custom_location !== undefined) {
      updates.push('custom_location = ?');
      values.push(custom_location || null);
    }

    if (online_link !== undefined) {
      updates.push('online_link = ?');
      values.push(online_link || null);
    }

    if (publish_status !== undefined) {
      const allowedPublishStatus = ['draft', 'published', 'unpublished', 'cancelled', 'completed'];
      if (!allowedPublishStatus.includes(publish_status)) {
        return res.status(400).json({ error: 'Invalid publish status.' });
      }
      updates.push('publish_status = ?');
      values.push(publish_status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update.' });
    }

    values.push(eventId);

    await db.query(
      `UPDATE events SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    await logActivity({
      user_id: req.user.id,
      action: 'UPDATE_EVENT',
      entity_type: 'event',
      entity_id: eventId,
      description: `Updated event ID ${eventId}`,
      req
    });

    return res.json({ message: 'Event updated successfully.' });
  } catch (error) {
    console.error('Update event error:', error);
    return res.status(500).json({ error: 'Server error updating event.' });
  }
});

/**
 * ORGANIZER: submit event for approval
 */
router.patch('/:id/submit', authMiddleware, roleMiddleware('organizer', 'admin'), async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const event = await getEventById(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    if (!checkOwnership(event, req.user)) {
      return res.status(403).json({ error: 'You can only submit your own event.' });
    }

    await db.query(
      `
      UPDATE events
      SET approval_status = 'pending',
          publish_status = 'draft',
          approval_notes = NULL,
          approved_by = NULL,
          approved_at = NULL,
          rejected_by = NULL,
          rejected_at = NULL
      WHERE id = ?
      `,
      [eventId]
    );

    await logActivity({
      user_id: req.user.id,
      action: 'SUBMIT_EVENT',
      entity_type: 'event',
      entity_id: eventId,
      description: `Submitted event ID ${eventId} for approval`,
      req
    });

    await createNotification({
      user_id: req.user.id,
      title: 'Event Submitted',
      message: `Your event "${event.title}" was submitted for admin approval.`,
      type: 'info',
      related_type: 'event',
      related_id: eventId
    });

    return res.json({ message: 'Event submitted for approval.' });
  } catch (error) {
    console.error('Submit event error:', error);
    return res.status(500).json({ error: 'Server error submitting event.' });
  }
});

/**
 * ADMIN: approve event
 */
router.patch('/:id/approve', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const { approval_notes } = req.body;

    const event = await getEventById(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const [result] = await db.query(
      `
      UPDATE events
      SET approval_status = 'approved',
          publish_status = 'published',
          approval_notes = ?,
          approved_by = ?,
          approved_at = NOW(),
          rejected_by = NULL,
          rejected_at = NULL
      WHERE id = ?
      `,
      [approval_notes || null, req.user.id, eventId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    await logActivity({
      user_id: req.user.id,
      action: 'APPROVE_EVENT',
      entity_type: 'event',
      entity_id: eventId,
      description: `Approved event ID ${eventId}`,
      req
    });

    await createNotification({
      user_id: event.organizer_id,
      title: 'Event Approved',
      message: `Your event "${event.title}" has been approved and published.`,
      type: 'success',
      related_type: 'event',
      related_id: eventId
    });

    return res.json({ message: 'Event approved successfully.' });
  } catch (error) {
    console.error('Approve event error:', error);
    return res.status(500).json({ error: 'Server error approving event.' });
  }
});

/**
 * ADMIN: reject event
 */
router.patch('/:id/reject', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const { approval_notes } = req.body;

    const event = await getEventById(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const [result] = await db.query(
      `
      UPDATE events
      SET approval_status = 'rejected',
          publish_status = 'draft',
          approval_notes = ?,
          rejected_by = ?,
          rejected_at = NOW()
      WHERE id = ?
      `,
      [approval_notes || 'Event rejected.', req.user.id, eventId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    await logActivity({
      user_id: req.user.id,
      action: 'REJECT_EVENT',
      entity_type: 'event',
      entity_id: eventId,
      description: `Rejected event ID ${eventId}`,
      req
    });

    await createNotification({
      user_id: event.organizer_id,
      title: 'Event Rejected',
      message: `Your event "${event.title}" was rejected. ${approval_notes || 'Please review admin notes.'}`,
      type: 'error',
      related_type: 'event',
      related_id: eventId
    });

    return res.json({ message: 'Event rejected successfully.' });
  } catch (error) {
    console.error('Reject event error:', error);
    return res.status(500).json({ error: 'Server error rejecting event.' });
  }
});

/**
 * ADMIN: feature or unfeature event
 */
router.patch('/:id/feature', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const { featured, featured_until } = req.body;

    const [result] = await db.query(
      `
      UPDATE events
      SET featured = ?,
          featured_until = ?
      WHERE id = ?
      `,
      [featured ? 1 : 0, featured_until || null, eventId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    await logActivity({
      user_id: req.user.id,
      action: featured ? 'FEATURE_EVENT' : 'UNFEATURE_EVENT',
      entity_type: 'event',
      entity_id: eventId,
      description: `${featured ? 'Featured' : 'Unfeatured'} event ID ${eventId}`,
      req
    });

    return res.json({ message: 'Event feature status updated successfully.' });
  } catch (error) {
    console.error('Feature event error:', error);
    return res.status(500).json({ error: 'Server error updating featured status.' });
  }
});

/**
 * ORGANIZER/ADMIN: delete event
 */
router.delete('/:id', authMiddleware, roleMiddleware('organizer', 'admin'), async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    const event = await getEventById(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    if (!checkOwnership(event, req.user)) {
      return res.status(403).json({ error: 'You can only delete your own events.' });
    }

    const [result] = await db.query(
      `DELETE FROM events WHERE id = ?`,
      [eventId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    await logActivity({
      user_id: req.user.id,
      action: 'DELETE_EVENT',
      entity_type: 'event',
      entity_id: eventId,
      description: `Deleted event ID ${eventId}`,
      req
    });

    return res.json({ message: 'Event deleted successfully.' });
  } catch (error) {
    console.error('Delete event error:', error);
    return res.status(500).json({ error: 'Server error deleting event.' });
  }
});

module.exports = router;
