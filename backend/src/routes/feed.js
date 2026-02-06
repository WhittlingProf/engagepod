import { Router } from 'express';
import db from '../db/database.js';

const router = Router();

/**
 * GET /api/feed
 * Recent posts with engagement data for the feed page
 */
router.get('/', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const limit = parseInt(req.query.limit) || 20;

    // Get recent posts with member info
    const posts = db.prepare(`
      SELECT p.id, p.member_id, p.linkedin_url, p.note, p.created_at,
             m.name as member_name
      FROM posts p
      JOIN members m ON p.member_id = m.id
      WHERE p.created_at >= datetime('now', '-' || ? || ' days')
      ORDER BY p.created_at DESC
      LIMIT ?
    `).all(days, limit);

    if (posts.length === 0) {
      const totalMembers = db.prepare('SELECT COUNT(*) as count FROM members WHERE is_active = 1').get().count;
      return res.json({ posts: [], total_members: totalMembers });
    }

    // Get all engagements for these posts in one query
    const postIds = posts.map(p => p.id);
    const placeholders = postIds.map(() => '?').join(',');
    const engagements = db.prepare(`
      SELECT e.post_id, e.member_id, e.engagement_type,
             m.name as member_name
      FROM engagements e
      JOIN members m ON e.member_id = m.id
      WHERE e.post_id IN (${placeholders})
    `).all(...postIds);

    // Group engagements by post_id
    const engagementsByPost = {};
    for (const e of engagements) {
      if (!engagementsByPost[e.post_id]) {
        engagementsByPost[e.post_id] = { liked: [], commented: [] };
      }
      engagementsByPost[e.post_id][e.engagement_type].push({
        member_id: e.member_id,
        member_name: e.member_name,
      });
    }

    const totalMembers = db.prepare('SELECT COUNT(*) as count FROM members WHERE is_active = 1').get().count;

    // Assemble response
    const result = posts.map(post => {
      const postEngagements = engagementsByPost[post.id] || { liked: [], commented: [] };
      // Count unique members who engaged (liked or commented or both)
      const engagedMemberIds = new Set([
        ...postEngagements.liked.map(e => e.member_id),
        ...postEngagements.commented.map(e => e.member_id),
      ]);

      return {
        ...post,
        engagements: postEngagements,
        total_engaged: engagedMemberIds.size,
        total_members: totalMembers,
      };
    });

    res.json({ posts: result, total_members: totalMembers });
  } catch (err) {
    console.error('Error fetching feed:', err);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

export default router;
