const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

/**
 * PUBLIC: get active categories
 */
router.get('/', async (req, res) => {
  try {
    const [categories] = await db.query(`
      SELECT id, name, description, is_active, created_at
      FROM event_categories
      WHERE is_active = 1
      ORDER BY name ASC
    `);

    return res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ error: 'Server error fetching categories.' });
  }
});

/**
 * ADMIN: get all categories
 */
router.get('/admin/all', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const [categories] = await db.query(`
      SELECT id, name, description, is_active, created_at
      FROM event_categories
      ORDER BY created_at DESC
    `);

    return res.json(categories);
  } catch (error) {
    console.error('Get all categories error:', error);
    return res.status(500).json({ error: 'Server error fetching all categories.' });
  }
});

/**
 * ADMIN: create category
 */
router.post('/', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required.' });
    }

    const [existing] = await db.query(
      `SELECT id FROM event_categories WHERE name = ? LIMIT 1`,
      [name.trim()]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Category already exists.' });
    }

    const [result] = await db.query(
      `
      INSERT INTO event_categories (name, description, is_active)
      VALUES (?, ?, 1)
      `,
      [name.trim(), description || null]
    );

    return res.status(201).json({
      message: 'Category created successfully.',
      id: result.insertId
    });
  } catch (error) {
    console.error('Create category error:', error);
    return res.status(500).json({ error: 'Server error creating category.' });
  }
});

/**
 * ADMIN: update category
 */
router.put('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const categoryId = Number(req.params.id);
    const { name, description, is_active } = req.body;

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(String(name).trim());
    }

    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description ? String(description).trim() : null);
    }

    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update.' });
    }

    values.push(categoryId);

    const [result] = await db.query(
      `UPDATE event_categories SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    return res.json({ message: 'Category updated successfully.' });
  } catch (error) {
    console.error('Update category error:', error);
    return res.status(500).json({ error: 'Server error updating category.' });
  }
});

/**
 * ADMIN: delete category
 */
router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const categoryId = Number(req.params.id);

    const [result] = await db.query(
      `DELETE FROM event_categories WHERE id = ?`,
      [categoryId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    return res.json({ message: 'Category deleted successfully.' });
  } catch (error) {
    console.error('Delete category error:', error);
    return res.status(500).json({ error: 'Server error deleting category.' });
  }
});

module.exports = router;