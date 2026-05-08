const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const logActivity = require('../utils/logger');
const createNotification = require('../utils/notify');

const router = express.Router();

/**
 * USER: apply as organizer
 */
router.post('/apply', authMiddleware, async (req, res) => {
  try {
    const {
      organization_name,
      organization_type,
      branding_logo,
      branding_banner,
      description,
      website,
      facebook_link,
      instagram_link
    } = req.body;

    if (!organization_name) {
      return res.status(400).json({ error: 'Organization name is required.' });
    }

    const [existing] = await db.query(
      `SELECT id FROM organizer_profiles WHERE user_id = ? LIMIT 1`,
      [req.user.id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Organizer application already exists.' });
    }

    const [result] = await db.query(
      `
      INSERT INTO organizer_profiles
      (
        user_id,
        organization_name,
        organization_type,
        branding_logo,
        branding_banner,
        description,
        website,
        facebook_link,
        instagram_link,
        approval_status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `,
      [
        req.user.id,
        organization_name.trim(),
        organization_type || null,
        branding_logo || null,
        branding_banner || null,
        description || null,
        website || null,
        facebook_link || null,
        instagram_link || null
      ]
    );

    await db.query(
      `UPDATE users SET status = 'pending' WHERE id = ?`,
      [req.user.id]
    );

    await logActivity({
      user_id: req.user.id,
      action: 'APPLY_ORGANIZER',
      entity_type: 'organizer_profile',
      entity_id: result.insertId,
      description: `Submitted organizer application: ${organization_name.trim()}`,
      req
    });

    await createNotification({
      user_id: req.user.id,
      title: 'Organizer Application Submitted',
      message: 'Your organizer application has been submitted and is pending admin review.',
      type: 'info',
      related_type: 'organizer_profile',
      related_id: result.insertId
    });

    return res.status(201).json({
      message: 'Organizer application submitted successfully.'
    });
  } catch (error) {
    console.error('Apply organizer error:', error);
    return res.status(500).json({ error: 'Server error submitting organizer application.' });
  }
});

/**
 * CURRENT USER: get own organizer profile
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [profiles] = await db.query(
      `
      SELECT *
      FROM organizer_profiles
      WHERE user_id = ?
      LIMIT 1
      `,
      [req.user.id]
    );

    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Organizer profile not found.' });
    }

    return res.json(profiles[0]);
  } catch (error) {
    console.error('Get organizer me error:', error);
    return res.status(500).json({ error: 'Server error fetching organizer profile.' });
  }
});

/**
 * ADMIN: get all organizer applications
 */
router.get('/', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const [profiles] = await db.query(`
      SELECT
        op.*,
        u.name AS user_name,
        u.email,
        u.phone,
        u.role,
        u.status
      FROM organizer_profiles op
      JOIN users u ON op.user_id = u.id
      ORDER BY op.created_at DESC
    `);

    return res.json(profiles);
  } catch (error) {
    console.error('Get organizers error:', error);
    return res.status(500).json({ error: 'Server error fetching organizer applications.' });
  }
});

/**
 * ADMIN: approve organizer
 */
router.patch('/:id/approve', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const profileId = Number(req.params.id);

    const [profiles] = await db.query(
      `SELECT * FROM organizer_profiles WHERE id = ? LIMIT 1`,
      [profileId]
    );

    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Organizer application not found.' });
    }

    const profile = profiles[0];

    await db.query(
      `
      UPDATE organizer_profiles
      SET approval_status = 'approved',
          approved_by = ?,
          approved_at = NOW(),
          rejection_reason = NULL
      WHERE id = ?
      `,
      [req.user.id, profileId]
    );

    await db.query(
      `
      UPDATE users
      SET role = 'organizer',
          status = 'active'
      WHERE id = ?
      `,
      [profile.user_id]
    );

    await logActivity({
      user_id: req.user.id,
      action: 'APPROVE_ORGANIZER',
      entity_type: 'organizer_profile',
      entity_id: profileId,
      description: `Approved organizer application for user ID ${profile.user_id}`,
      req
    });

    await createNotification({
      user_id: profile.user_id,
      title: 'Organizer Application Approved',
      message: 'Your organizer application has been approved. You can now create and manage events.',
      type: 'success',
      related_type: 'organizer_profile',
      related_id: profileId
    });

    return res.json({ message: 'Organizer approved successfully.' });
  } catch (error) {
    console.error('Approve organizer error:', error);
    return res.status(500).json({ error: 'Server error approving organizer.' });
  }
});

/**
 * ADMIN: reject organizer
 */
router.patch('/:id/reject', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const profileId = Number(req.params.id);
    const { rejection_reason } = req.body;

    const [profiles] = await db.query(
      `SELECT * FROM organizer_profiles WHERE id = ? LIMIT 1`,
      [profileId]
    );

    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Organizer application not found.' });
    }

    const profile = profiles[0];

    await db.query(
      `
      UPDATE organizer_profiles
      SET approval_status = 'rejected',
          approved_by = ?,
          approved_at = NOW(),
          rejection_reason = ?
      WHERE id = ?
      `,
      [req.user.id, rejection_reason || 'Application rejected.', profileId]
    );

    await db.query(
      `
      UPDATE users
      SET role = 'user',
          status = 'rejected'
      WHERE id = ?
      `,
      [profile.user_id]
    );

    await logActivity({
      user_id: req.user.id,
      action: 'REJECT_ORGANIZER',
      entity_type: 'organizer_profile',
      entity_id: profileId,
      description: `Rejected organizer application for user ID ${profile.user_id}`,
      req
    });

    await createNotification({
      user_id: profile.user_id,
      title: 'Organizer Application Rejected',
      message: `Your organizer application was rejected. ${rejection_reason || 'Please contact support for more details.'}`,
      type: 'error',
      related_type: 'organizer_profile',
      related_id: profileId
    });

    return res.json({ message: 'Organizer application rejected.' });
  } catch (error) {
    console.error('Reject organizer error:', error);
    return res.status(500).json({ error: 'Server error rejecting organizer.' });
  }
});

module.exports = router;