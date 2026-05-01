const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
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
       VALUES (?, ?, ?, 'user', 'active', ?, 0)`,
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

    // Generate access token (short-lived - 24h)
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Generate refresh token (long-lived - 7 days)
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
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
      token: accessToken,
      refreshToken,
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

/**
 * LOGOUT ENDPOINT - Blacklist the token
 */
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const { addToBlacklist } = require('../middleware/authMiddleware');
    addToBlacklist(req.token);

    await logActivity({
      user_id: req.user.id,
      action: 'LOGOUT',
      entity_type: 'user',
      entity_id: req.user.id,
      description: `User logged out`,
      req
    });

    return res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Server error during logout.' });
  }
});

/**
 * GET CURRENT USER - Refresh user data and check status
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role, status, phone FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = users[0];

    // Check if account was disabled
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is disabled.' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ error: 'Server error fetching user.' });
  }
});

/**
 * REFRESH TOKEN ENDPOINT - Get new access token using refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required.' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const [users] = await db.query(
      'SELECT id, email, role, status FROM users WHERE id = ? LIMIT 1',
      [decoded.id]
    );

    if (users.length === 0 || users[0].status !== 'active') {
      return res.status(403).json({ error: 'User not found or account disabled.' });
    }

    const user = users[0];

    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({ token: newAccessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(401).json({ error: 'Invalid or expired refresh token.' });
  }
});

/**
 * CHANGE PASSWORD ENDPOINT
 */
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters.' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ error: 'New password cannot be the same as current password.' });
    }

    const [users] = await db.query(
      'SELECT id, password FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    );

    await logActivity({
      user_id: req.user.id,
      action: 'CHANGE_PASSWORD',
      entity_type: 'user',
      entity_id: req.user.id,
      description: `User changed password`,
      req
    });

    return res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ error: 'Server error changing password.' });
  }
});

module.exports = router;