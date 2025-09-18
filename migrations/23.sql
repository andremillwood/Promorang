
-- Add engagement shares columns to content_pieces table
ALTER TABLE content_pieces ADD COLUMN engagement_shares_total INTEGER DEFAULT 50;
ALTER TABLE content_pieces ADD COLUMN engagement_shares_remaining INTEGER DEFAULT 50;

-- Create user_engagement_shares table to track engagement share ownership
CREATE TABLE user_engagement_shares (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  content_id INTEGER NOT NULL,
  shares_count INTEGER DEFAULT 1,
  earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for efficient queries
CREATE INDEX idx_user_engagement_shares_user_id ON user_engagement_shares(user_id);
CREATE INDEX idx_user_engagement_shares_content_id ON user_engagement_shares(content_id);

-- Create content_tips table to track tipping activity
CREATE TABLE content_tips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipper_id INTEGER NOT NULL,
  content_id INTEGER NOT NULL,
  tip_amount REAL NOT NULL,
  currency_type TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create content_funding table to track creator funding activity
CREATE TABLE content_funding (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id INTEGER NOT NULL,
  content_id INTEGER NOT NULL,
  funding_amount REAL NOT NULL,
  currency_type TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
