const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const logActivity = require('../utils/logger');

const router = express.Router();

/**
 * SIGNUP ENDPOINT
 */
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const cleanPhone = phone.trim();
    if (!/^09\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({ error: 'Phone number must be 11 digits starting with 09.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [cleanEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO users (name, email, password, role, status, phone, email_verified)
       VALUES (?, ?, ?, 'attendee', 'active', ?, 0)`,
      [cleanName, cleanEmail, hashedPassword, cleanPhone]
    );

    await logActivity({
      user_id: result.insertId,
      action: 'SIGNUP',
      entity_type: 'user',
      entity_id: result.insertId,
      description: `New user registered: ${cleanEmail}`,
      req
    });

    return res.status(201).json({
      message: 'Account created successfully.',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Server error during signup.' });
  }
});

/**
 * LOGIN ENDPOINT (Updated/Added)
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Pangitaon ang user sa database
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [cleanEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = users[0];

    // 2. I-verify ang password gamit ang bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 3. I-check kon active ba ang status
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is disabled. Please contact admin.' });
    }

    // 4. Generate JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: '24h' }
    );

    // I-log ang login activity
    await logActivity({
      user_id: user.id,
      action: 'LOGIN',
      entity_type: 'user',
      entity_id: user.id,
      description: `User logged in: ${cleanEmail}`,
      req
    });

    // 5. I-return ang token ug user info (ayaw i-apil ang password)
    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error during login.' });
  }
});

module.exports = router;