import express from 'express';
import db from '../db/database.js';
import { sendBroadcastEmail } from '../services/email.js';

const router = express.Router();

// POST /api/survey/send - Send email to all active members
router.post('/send', async (req, res) => {
  const { subject, message } = req.body;

  if (!subject || !message) {
    return res.status(400).json({ error: 'subject and message are required' });
  }

  try {
    const members = db.prepare('SELECT name, email FROM members WHERE is_active = 1').all();

    if (members.length === 0) {
      return res.status(404).json({ error: 'No active members found' });
    }

    const result = await sendBroadcastEmail(members, subject, message);

    res.json({
      message: `Sent to ${result.successful} of ${result.total} members`,
      ...result
    });
  } catch (err) {
    console.error('Broadcast send error:', err);
    res.status(500).json({ error: 'Failed to send emails' });
  }
});

export default router;
