import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { sendAdminNewMemberNotification } from '../services/email.js';

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

    const newMember = {
      id,
      name: name.trim(),
      email: email.toLowerCase()
    };

    // Notify admin of new registration (don't await - fire and forget)
    sendAdminNewMemberNotification(newMember).catch(err => {
      console.error('Failed to send admin notification:', err);
    });

    res.status(201).json({
      message: 'Member registered successfully',
      member: newMember
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

/**
 * DELETE /api/members/:id
 * Delete a member by ID (also deletes their posts)
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Delete member's posts first (cascade)
    const postsDeleted = db.prepare('DELETE FROM posts WHERE member_id = ?').run(id);
    db.prepare('DELETE FROM members WHERE id = ?').run(id);

    res.json({
      message: 'Member deleted',
      member,
      posts_deleted: postsDeleted.changes
    });
  } catch (err) {
    console.error('Error deleting member:', err);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

/**
 * PUT /api/members/:id
 * Update a member
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, is_active } = req.body;

    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name.trim());
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email.toLowerCase());
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    db.prepare(`UPDATE members SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const updated = db.prepare('SELECT * FROM members WHERE id = ?').get(id);
    res.json({ message: 'Member updated', member: updated });
  } catch (err) {
    console.error('Error updating member:', err);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

export default router;
