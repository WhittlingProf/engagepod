export function requireAdmin(req, res, next) {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    console.error('ADMIN_PASSWORD not set — blocking admin access');
    return res.status(500).json({ error: 'Admin auth not configured' });
  }

  const provided = req.headers['x-admin-password'];

  if (provided !== password) {
    return res.status(401).json({ error: 'Invalid admin password' });
  }

  next();
}
