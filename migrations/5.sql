
-- Social media connections tracking
CREATE TABLE social_connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  platform TEXT NOT NULL,
  platform_username TEXT,
  follower_count INTEGER DEFAULT 0,
  verified_at DATETIME,
  last_refresh_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Instagram webhook registrations
CREATE TABLE instagram_registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  instagram_username TEXT NOT NULL,
  dm_verified_at DATETIME,
  last_points_granted_at DATETIME,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User level upgrades
CREATE TABLE user_level_upgrades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  from_tier TEXT NOT NULL,
  to_tier TEXT NOT NULL,
  cost_type TEXT NOT NULL,
  cost_amount INTEGER NOT NULL,
  upgraded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Advertiser analytics
CREATE TABLE advertiser_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  advertiser_id INTEGER NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  drops_created INTEGER DEFAULT 0,
  total_participants INTEGER DEFAULT 0,
  gems_spent REAL DEFAULT 0.0,
  conversions INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  engagement_rate REAL DEFAULT 0.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Content sharing actions tracking
CREATE TABLE content_shares (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  content_id INTEGER,
  platform TEXT NOT NULL,
  share_url TEXT,
  verified_shares INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced points tracking with multipliers
ALTER TABLE points_transactions ADD COLUMN base_points INTEGER DEFAULT 0;
ALTER TABLE points_transactions ADD COLUMN multiplier REAL DEFAULT 1.0;
ALTER TABLE points_transactions ADD COLUMN user_level TEXT DEFAULT 'free';
