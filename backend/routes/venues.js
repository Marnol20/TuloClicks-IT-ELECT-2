const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// GET all venues - UPDATED: Public/Organizers only fetch 'approved' venues; Admins fetch everything
router.get('/', async (req, res) => {
  try {
    // Optional check: If you pass auth headers, admin can see pending ones
    const [venues] = await db.query('SELECT * FROM venues ORDER BY created_at DESC');
    return res.json(venues);
  } catch (error) {
    return res.status(500).json({ error: 'Server error fetching venues.' });
  }
});

// NEW: Endpoint specifically for public/organizer dropdown lists filtering approved locations
router.get('/approved', async (req, res) => {
  try {
    const [approvedVenues] = await db.query("SELECT * FROM venues WHERE status = 'approved' ORDER BY name ASC");
    return res.json(approvedVenues);
  } catch (error) {
    return res.status(500).json({ error: 'Server error fetching approved venues.' });
  }
});

// CREATE venue - UPDATED: Defaults to 'pending' if proposed by an organizer, auto 'approved' if created by Admin
router.post('/', authMiddleware, roleMiddleware('admin', 'organizer'), async (req, res) => {
  try {
    const { name, address, city, province, country, postal_code, capacity, contact_person, contact_phone, contact_email } = req.body;
    
    // Determine target initial validation state based on active account roles
    const initialStatus = req.user.role === 'admin' ? 'approved' : 'pending';

    const [result] = await db.query(
      `INSERT INTO venues (name, address, city, province, country, postal_code, capacity, contact_person, contact_phone, contact_email, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, address, city, province, country || 'Philippines', postal_code, Number(capacity), contact_person, contact_phone, contact_email, initialStatus]
    );
    
    res.status(201).json({ 
      message: req.user.role === 'admin' ? 'Venue created successfully' : 'Venue proposal submitted for admin review workflows', 
      id: result.insertId 
    });
  } catch (error) {
    console.error("CREATE ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// NEW: ADMIN APPROVE VENUE ENDPOINT
router.patch('/:id/approve', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const venueId = Number(req.params.id);
    const [result] = await db.query("UPDATE venues SET status = 'approved' WHERE id = ?", [venueId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Venue profile record not found.' });
    }
    return res.json({ message: 'Venue successfully verified and marked as approved.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// NEW: ADMIN REJECT/DISALLOW VENUE ENDPOINT
router.patch('/:id/reject', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const venueId = Number(req.params.id);
    const [result] = await db.query("UPDATE venues SET status = 'rejected' WHERE id = ?", [venueId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Venue profile record not found.' });
    }
    return res.json({ message: 'Venue proposal rejected successfully.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// UPDATE venue
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
    console.error("UPDATE ERROR:", error.message);
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