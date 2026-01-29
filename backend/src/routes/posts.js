import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { isValidLinkedInUrl, verifyLinkedInPost } from '../services/linkedin.js';
import { sendPostNotification } from '../services/email.js';

const router = Router();

/**
 * GET /api/posts
 * List recent posts (for dashboard/debugging)
 */
router.get('/', (req, res) => {
  try {
    const posts = db.prepare(`
      SELECT p.id, p.linkedin_url, p.note, p.created_at,
             m.name as member_name, m.email as member_email
      FROM posts p
      JOIN members m ON p.member_id = m.id
      ORDER BY p.created_at DESC
      LIMIT 50
    `).all();

    res.json({ posts });
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

/**
 * POST /api/posts
 * Submit a new LinkedIn post and notify pod members
 */
router.post('/', async (req, res) => {
  try {
    const { email, linkedin_url, note } = req.body;

    // Validate required fields
    if (!email || !linkedin_url) {
      return res.status(400).json({
        error: 'Email and LinkedIn URL are required'
      });
    }

    // Find the member by email
    const member = db.prepare(`
      SELECT id, name, email FROM members
      WHERE email = ? AND is_active = 1
    `).get(email.toLowerCase());

    if (!member) {
      return res.status(404).json({
        error: 'Member not found. Please register first.'
      });
    }

    // Validate LinkedIn URL format
    if (!isValidLinkedInUrl(linkedin_url)) {
      return res.status(400).json({
        error: 'Invalid LinkedIn URL. Please provide a valid LinkedIn post URL.'
      });
    }

    // Verify the post exists (optional deep validation)
    const validation = await verifyLinkedInPost(linkedin_url);
    if (!validation.valid) {
      return res.status(400).json({
        error: validation.error || 'Could not verify LinkedIn post'
      });
    }

    // Save the post
    const postId = uuidv4();
    const insertStmt = db.prepare(`
      INSERT INTO posts (id, member_id, linkedin_url, note)
      VALUES (?, ?, ?, ?)
    `);
    insertStmt.run(postId, member.id, linkedin_url, note || null);

    // Get all other active members to notify
    const recipients = db.prepare(`
      SELECT id, name, email FROM members
      WHERE is_active = 1 AND id != ?
    `).all(member.id);

    // Send notifications
    let emailResult = { successful: 0, failed: 0 };
    if (recipients.length > 0) {
      emailResult = await sendPostNotification(
        { name: member.name },
        recipients,
        linkedin_url,
        note
      );
    }

    res.status(201).json({
      message: 'Post submitted successfully',
      post: {
        id: postId,
        linkedin_url,
        note,
        created_at: new Date().toISOString()
      },
      notifications: {
        sent: emailResult.successful,
        failed: emailResult.failed,
        total_members: recipients.length
      },
      validation_warning: validation.warning || null
    });

  } catch (err) {
    console.error('Error submitting post:', err);
    res.status(500).json({ error: 'Failed to submit post' });
  }
});

export default router;
