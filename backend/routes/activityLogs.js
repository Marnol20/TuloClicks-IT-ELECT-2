const express = require('express')
const db = require('../db')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/admin/all', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' })
    }

    const [rows] = await db.query(`
      SELECT
        al.id,
        al.action,
        al.entity_type,
        al.entity_id,
        al.description,
        al.ip_address,
        al.created_at,
        u.name AS user_name,
        u.email AS user_email
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 200
    `)

    return res.json(rows || [])
  } catch (error) {
    console.error('Fetch activity logs error:', error)
    return res.status(500).json({ error: 'Failed to fetch activity logs' })
  }
})

module.exports = router