-- EngagePod Database Schema

CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 1
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL,
  linkedin_url TEXT NOT NULL,
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id)
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);

-- Index for faster member post lookups
CREATE INDEX IF NOT EXISTS idx_posts_member_id ON posts(member_id);
