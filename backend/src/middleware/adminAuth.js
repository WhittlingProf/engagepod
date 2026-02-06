import crypto from 'crypto';

// Rate limiting: max 5 failed attempts per IP per minute
const failedAttempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 1000;

function cleanupAttempts() {
  const now = Date.now();
  for (const [ip, record] of failedAttempts) {
    if (now - record.firstAttempt > WINDOW_MS) {
      failedAttempts.delete(ip);
    }
  }
}

// Clean up every 5 minutes
setInterval(cleanupAttempts, 5 * 60 * 1000);

export function requireAdmin(req, res, next) {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    console.error('ADMIN_PASSWORD not set — blocking admin access');
    return res.status(500).json({ error: 'Admin auth not configured' });
  }

  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const now = Date.now();

  // Check rate limit
  const record = failedAttempts.get(ip);
  if (record && now - record.firstAttempt < WINDOW_MS && record.count >= MAX_ATTEMPTS) {
    return res.status(429).json({ error: 'Too many attempts. Try again in a minute.' });
  }

  const provided = req.headers['x-admin-password'] || '';

  // Timing-safe comparison
  const match =
    provided.length === password.length &&
    crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(password));

  if (!match) {
    // Track failed attempt
    if (record && now - record.firstAttempt < WINDOW_MS) {
      record.count++;
    } else {
      failedAttempts.set(ip, { count: 1, firstAttempt: now });
    }
    return res.status(401).json({ error: 'Invalid admin password' });
  }

  // Successful — clear any failed attempts for this IP
  failedAttempts.delete(ip);
  next();
}
