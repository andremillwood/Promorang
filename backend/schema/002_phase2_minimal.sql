-- Phase 2: Economy + Content + Drops (Minimal - No FK constraints)

-- Content table
CREATE TABLE IF NOT EXISTS content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  platform TEXT NOT NULL,
  platform_url TEXT,
  image_url TEXT,
  share_price REAL DEFAULT 0.0,
  total_shares INTEGER DEFAULT 100,
  available_shares INTEGER DEFAULT 100,
  current_revenue REAL DEFAULT 0.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Content shares ledger
CREATE TABLE IF NOT EXISTS content_shares (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_id INTEGER NOT NULL,
  buyer_id TEXT NOT NULL,
  shares_count INTEGER NOT NULL,
  price_each REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Drops (tasks/campaigns)
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

-- Drop applications
CREATE TABLE IF NOT EXISTS drop_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  drop_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  submission_url TEXT,
  status TEXT DEFAULT 'pending',
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Transactions (unified history)
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  transaction_type TEXT NOT NULL,
  currency_type TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_users_google_sub ON users(google_sub);
CREATE INDEX IF NOT EXISTS idx_content_creator ON content(creator_id);
CREATE INDEX IF NOT EXISTS idx_content_shares_content ON content_shares(content_id);
CREATE INDEX IF NOT EXISTS idx_content_shares_buyer ON content_shares(buyer_id);
CREATE INDEX IF NOT EXISTS idx_drops_status ON drops(status);
CREATE INDEX IF NOT EXISTS idx_drops_deadline ON drops(deadline_at);
CREATE INDEX IF NOT EXISTS idx_drop_applications_drop ON drop_applications(drop_id);
CREATE INDEX IF NOT EXISTS idx_drop_applications_user ON drop_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_drop_applications_user ON drop_applications(drop_id, user_id);
