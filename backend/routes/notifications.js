const express = require('express')
const db = require('../db')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

/**
 * CURRENT USER: get my notifications
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT *
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
      `,
      [req.user.id]
    )

    return res.json(rows || [])
  } catch (error) {
    console.error('Get notifications error:', error)
    return res.status(500).json({ error: 'Failed to fetch notifications.' })
  }
})

/**
 * CURRENT USER: unread count
 */
router.get('/me/unread-count', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM notifications
      WHERE user_id = ?
        AND is_read = 0
      `,
      [req.user.id]
    )

    return res.json({ unread_count: rows[0]?.total || 0 })
  } catch (error) {
    console.error('Get unread count error:', error)
    return res.status(500).json({ error: 'Failed to fetch unread count.' })
  }
})

/**
 * CURRENT USER: mark one as read
 */
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notificationId = Number(req.params.id)

    const [result] = await db.query(
      `
      UPDATE notifications
      SET is_read = 1
      WHERE id = ?
        AND user_id = ?
      `,
      [notificationId, req.user.id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notification not found.' })
    }

    return res.json({ message: 'Notification marked as read.' })
  } catch (error) {
    console.error('Mark notification read error:', error)
    return res.status(500).json({ error: 'Failed to update notification.' })
  }
})

/**
 * CURRENT USER: mark all as read
 */
router.patch('/me/read-all', authMiddleware, async (req, res) => {
  try {
    await db.query(
      `
      UPDATE notifications
      SET is_read = 1
      WHERE user_id = ?
        AND is_read = 0
      `,
      [req.user.id]
    )

    return res.json({ message: 'All notifications marked as read.' })
  } catch (error) {
    console.error('Mark all notifications read error:', error)
    return res.status(500).json({ error: 'Failed to update notifications.' })
  }
})

module.exports = router