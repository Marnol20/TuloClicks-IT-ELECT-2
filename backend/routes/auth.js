const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../db')
const authMiddleware = require('../middleware/authMiddleware')
const logActivity = require('../utils/logger')

const router = express.Router()

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' })
    }

    const cleanName = name.trim()
    const cleanEmail = email.trim().toLowerCase()
    const cleanPhone = phone ? phone.trim() : null

    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [cleanEmail]
    )

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Email already exists.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const [result] = await db.query(
      `
      INSERT INTO users (name, email, password, role, status, phone, email_verified)
      VALUES (?, ?, ?, 'user', 'active', ?, 0)
      `,
      [cleanName, cleanEmail, hashedPassword, cleanPhone]
    )

    await logActivity({
      user_id: result.insertId,
      action: 'SIGNUP',
      entity_type: 'user',
      entity_id: result.insertId,
      description: `New user registered: ${cleanEmail}`,
      req
    })

    return res.status(201).json({
      message: 'Account created successfully.',
      userId: result.insertId
    })
  } catch (error) {
    console.error('Signup error:', error)
    return res.status(500).json({ error: 'Server error during signup.' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' })
    }

    const cleanEmail = email.trim().toLowerCase()
    const enteredPassword = password || ''

    const [users] = await db.query(
      `
      SELECT id, name, email, password, role, status
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
      [cleanEmail]
    )

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const user = users[0]

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'This account is suspended.' })
    }

    if (user.status === 'rejected') {
      return res.status(403).json({ error: 'This account has been rejected.' })
    }

    let isMatch = false
    if (typeof enteredPassword === 'string' && enteredPassword.length > 0) {
      isMatch = await bcrypt.compare(enteredPassword, user.password)

      if (!isMatch && enteredPassword === user.password) {
        isMatch = true
        const hashedPassword = await bcrypt.hash(enteredPassword, 10)
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id])
      }
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    )

    await logActivity({
      user_id: user.id,
      action: 'LOGIN',
      entity_type: 'user',
      entity_id: user.id,
      description: `User logged in: ${user.email}`,
      req
    })

     return res.json({
       message: 'Login successful.',
       token,
       user: {
         id: user.id,
         name: user.name,
         email: user.email,
         phone: user.phone || null,
         role: user.role,
         status: user.status
       }
     })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'Server error during login.' })
  }
})

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [users] = await db.query(
      `
      SELECT id, name, email, role, status, phone, profile_image, email_verified, created_at
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [req.user.id]
    )

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found.' })
    }

    return res.json(users[0])
  } catch (error) {
    console.error('Fetch me error:', error)
    return res.status(500).json({ error: 'Server error fetching profile.' })
  }
})

module.exports = router