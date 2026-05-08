const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

/**
 * USER: update own settings (stubbed - requires schema update)
 */
// router.put('/settings', authMiddleware, async (req, res) => {
//   try {
//     // This endpoint requires additional columns in users table:
//     // email_notifications, sms_notifications, event_reminders,
//     // marketing_emails, theme, language, two_factor_auth
//     return res.status(501).json({ error: 'Settings update not implemented yet.' })
//   } catch (error) {
//     console.error('Update settings error:', error)
//     return res.status(500).json({ error: 'Server error updating settings.' })
//   }
// })

/**
 * USER: update own profile
 */
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const { name, phone } = req.body

    const updates = []
    const values = []

    if (name !== undefined) {
      updates.push('name = ?')
      values.push(String(name).trim())
    }

    if (phone !== undefined) {
      updates.push('phone = ?')
      values.push(phone ? String(phone).trim() : null)
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update.' })
    }

    values.push(userId)

    const [result] = await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found.' })
    }

    // Return updated user data
    const [users] = await db.query(
      `SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?`,
      [userId]
    )

    return res.json(users[0])
  } catch (error) {
    console.error('Update profile error:', error)
    return res.status(500).json({ error: 'Server error updating profile.' })
  }
})

/**
 * ADMIN: GET all users
 */
router.get('/', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT id, name, email, role, status, phone, email_verified, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    return res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ error: 'Server error fetching users.' });
  }
});

/**
 * ADMIN: GET one user
 */
router.get('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const userId = Number(req.params.id);

    const [users] = await db.query(
      `
      SELECT id, name, email, role, status, phone, profile_image, email_verified, created_at, updated_at
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json(users[0]);
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Server error fetching user.' });
  }
});

/**
 * ADMIN: update role or status
 */
router.put('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { role, status, phone, name } = req.body;

    const allowedRoles = ['admin', 'organizer', 'user'];
    const allowedStatuses = ['active', 'pending', 'suspended', 'rejected'];

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(String(name).trim());
    }

    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone ? String(phone).trim() : null);
    }

    if (role !== undefined) {
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role value.' });
      }
      updates.push('role = ?');
      values.push(role);
    }

    if (status !== undefined) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status value.' });
      }
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update.' });
    }

    values.push(userId);

    const [result] = await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({ message: 'User updated successfully.' });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ error: 'Server error updating user.' });
  }
});

/**
 * ADMIN: suspend user
 */
router.patch('/:id/suspend', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const userId = Number(req.params.id);

    const [result] = await db.query(
      `UPDATE users SET status = 'suspended' WHERE id = ?`,
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({ message: 'User suspended successfully.' });
  } catch (error) {
    console.error('Suspend user error:', error);
    return res.status(500).json({ error: 'Server error suspending user.' });
  }
});

/**
 * ADMIN: activate user
 */
router.patch('/:id/activate', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const userId = Number(req.params.id);

    const [result] = await db.query(
      `UPDATE users SET status = 'active' WHERE id = ?`,
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({ message: 'User activated successfully.' });
  } catch (error) {
    console.error('Activate user error:', error);
    return res.status(500).json({ error: 'Server error activating user.' });
  }
});

/**
 * ADMIN: delete user
 */
router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const userId = Number(req.params.id);

    const [result] = await db.query(
      `DELETE FROM users WHERE id = ?`,
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ error: 'Server error deleting user.' });
  }
});

module.exports = router;