const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// GET all venues
router.get('/', async (req, res) => {
  try {
    const [venues] = await db.query('SELECT * FROM venues ORDER BY created_at DESC');
    return res.json(venues);
  } catch (error) {
    return res.status(500).json({ error: 'Server error fetching venues.' });
  }
});

// CREATE venue
router.post('/', authMiddleware, roleMiddleware('admin', 'organizer'), async (req, res) => {
  try {
    const { name, address, city, province, country, postal_code, capacity, contact_person, contact_phone, contact_email } = req.body;
    const [result] = await db.query(
      `INSERT INTO venues (name, address, city, province, country, postal_code, capacity, contact_person, contact_phone, contact_email) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, address, city, province, country || 'Philippines', postal_code, Number(capacity), contact_person, contact_phone, contact_email]
    );
    res.status(201).json({ message: 'Venue created successfully', id: result.insertId });
  } catch (error) {
    console.error("CREATE ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE venue - Naka PUT na kini aron mo-match sa frontend
router.put('/:id', authMiddleware, roleMiddleware('admin', 'organizer'), async (req, res) => {
  try {
    const venueId = Number(req.params.id);
    const { name, address, city, province, country, postal_code, capacity, contact_person, contact_phone, contact_email } = req.body;

    const [result] = await db.query(
      `UPDATE venues 
       SET name=?, address=?, city=?, province=?, country=?, postal_code=?, capacity=?, contact_person=?, contact_phone=?, contact_email=? 
       WHERE id=?`,
      [name, address, city, province, country, postal_code, Number(capacity), contact_person, contact_phone, contact_email, venueId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    res.json({ message: 'Venue updated successfully' });
  } catch (error) {
    console.error("UPDATE ERROR:", error.message); // Tan-awa kini sa terminal kon mo-fail
    res.status(500).json({ error: error.message });
  }
});

// DELETE venue
router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM venues WHERE id = ?', [req.params.id]);
    res.json({ message: 'Venue deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete venue' });
  }
});

module.exports = router;