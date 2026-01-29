import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';

const router = Router();

// Simple email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * GET /api/members
 * List all active members
 */
router.get('/', (req, res) => {
  try {
    const members = db.prepare(`
      SELECT id, name, email, created_at, is_active
      FROM members
      WHERE is_active = 1
      ORDER BY created_at DESC
    `).all();

    res.json({ members });
  } catch (err) {
    console.error('Error fetching members:', err);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

/**
 * POST /api/members
 * Register a new member
 */
router.post('/', (req, res) => {
  try {
    const { name, email } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        error: 'Name and email are required'
      });
    }

    // Validate name length
    if (name.trim().length < 2) {
      return res.status(400).json({
        error: 'Name must be at least 2 characters'
      });
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM members WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return res.status(409).json({
        error: 'A member with this email already exists'
      });
    }

    // Create member
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO members (id, name, email)
      VALUES (?, ?, ?)
    `);
    stmt.run(id, name.trim(), email.toLowerCase());

    res.status(201).json({
      message: 'Member registered successfully',
      member: {
        id,
        name: name.trim(),
        email: email.toLowerCase()
      }
    });
  } catch (err) {
    console.error('Error creating member:', err);
    res.status(500).json({ error: 'Failed to register member' });
  }
});

/**
 * GET /api/members/:email
 * Get a member by email (for post submission lookup)
 */
router.get('/:email', (req, res) => {
  try {
    const { email } = req.params;

    const member = db.prepare(`
      SELECT id, name, email, created_at, is_active
      FROM members
      WHERE email = ? AND is_active = 1
    `).get(email.toLowerCase());

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ member });
  } catch (err) {
    console.error('Error fetching member:', err);
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});

export default router;
