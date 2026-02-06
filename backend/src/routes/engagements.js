import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';

const router = Router();

/**
 * POST /api/engagements
 * Record that a member liked or commented on a post
 */
router.post('/', (req, res) => {
  try {
    const { post_id, member_id, engagement_type } = req.body;

    if (!post_id || !member_id || !engagement_type) {
      return res.status(400).json({ error: 'post_id, member_id, and engagement_type are required' });
    }

    if (!['liked', 'commented'].includes(engagement_type)) {
      return res.status(400).json({ error: 'engagement_type must be "liked" or "commented"' });
    }

    // Verify post exists
    const post = db.prepare('SELECT id, member_id FROM posts WHERE id = ?').get(post_id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Verify member exists and is active
    const member = db.prepare('SELECT id FROM members WHERE id = ? AND is_active = 1').get(member_id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Prevent self-engagement
    if (post.member_id === member_id) {
      return res.status(400).json({ error: 'Cannot engage with your own post' });
    }

    // Check if already recorded
    const existing = db.prepare(
      'SELECT id FROM engagements WHERE post_id = ? AND member_id = ? AND engagement_type = ?'
    ).get(post_id, member_id, engagement_type);

    if (existing) {
      return res.status(409).json({ error: 'Already recorded' });
    }

    const id = uuidv4();
    db.prepare(
      'INSERT INTO engagements (id, post_id, member_id, engagement_type) VALUES (?, ?, ?, ?)'
    ).run(id, post_id, member_id, engagement_type);

    res.status(201).json({
      message: 'Engagement recorded',
      engagement: { id, post_id, member_id, engagement_type },
    });
  } catch (err) {
    console.error('Error recording engagement:', err);
    res.status(500).json({ error: 'Failed to record engagement' });
  }
});

/**
 * DELETE /api/engagements
 * Remove an engagement (un-toggle)
 */
router.delete('/', (req, res) => {
  try {
    const { post_id, member_id, engagement_type } = req.body;

    if (!post_id || !member_id || !engagement_type) {
      return res.status(400).json({ error: 'post_id, member_id, and engagement_type are required' });
    }

    const result = db.prepare(
      'DELETE FROM engagements WHERE post_id = ? AND member_id = ? AND engagement_type = ?'
    ).run(post_id, member_id, engagement_type);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Engagement not found' });
    }

    res.json({ message: 'Engagement removed' });
  } catch (err) {
    console.error('Error removing engagement:', err);
    res.status(500).json({ error: 'Failed to remove engagement' });
  }
});

export default router;
