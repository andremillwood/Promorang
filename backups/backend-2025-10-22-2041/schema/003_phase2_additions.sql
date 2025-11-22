-- Phase 2: Add only missing tables

-- Content shares ledger (new)
CREATE TABLE IF NOT EXISTS content_shares (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_id TEXT NOT NULL,
  buyer_id TEXT NOT NULL,
  shares_count INTEGER NOT NULL,
  price_each REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Drops (tasks/campaigns) - new
CREATE TABLE IF NOT EXISTS drops (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  drop_type TEXT NOT NULL,
  difficulty TEXT,
  platform TEXT,
  content_url TEXT,
  reward_points INTEGER DEFAULT 0,
  reward_keys INTEGER DEFAULT 0,
  reward_gems INTEGER DEFAULT 0,
  max_participants INTEGER,
  deadline_at DATETIME,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Drop applications - new
CREATE TABLE IF NOT EXISTS drop_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  drop_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  submission_url TEXT,
  status TEXT DEFAULT 'pending',
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Transactions (unified history) - new
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  transaction_type TEXT NOT NULL,
  currency_type TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indices for new tables
CREATE INDEX IF NOT EXISTS idx_content_shares_content ON content_shares(content_id);
CREATE INDEX IF NOT EXISTS idx_content_shares_buyer ON content_shares(buyer_id);
CREATE INDEX IF NOT EXISTS idx_drops_status ON drops(status);
CREATE INDEX IF NOT EXISTS idx_drops_deadline ON drops(deadline_at);
CREATE INDEX IF NOT EXISTS idx_drops_creator ON drops(creator_id);
CREATE INDEX IF NOT EXISTS idx_drop_applications_drop ON drop_applications(drop_id);
CREATE INDEX IF NOT EXISTS idx_drop_applications_user ON drop_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_drop_applications_user ON drop_applications(drop_id, user_id);
