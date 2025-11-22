-- Phase 5: Analytics, Automation, Community & Admin
-- Safe to run multiple times

-- Analytics snapshots for performance tracking
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  snapshot_date DATE NOT NULL UNIQUE,
  dau INTEGER DEFAULT 0,                    -- Daily Active Users
  wau INTEGER DEFAULT 0,                    -- Weekly Active Users
  mau INTEGER DEFAULT 0,                    -- Monthly Active Users
  arpu REAL DEFAULT 0.0,                    -- Average Revenue Per User (USD)
  total_users INTEGER DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  total_gems_purchased INTEGER DEFAULT 0,
  total_gems_spent INTEGER DEFAULT 0,
  total_stakes INTEGER DEFAULT 0,
  total_funding_projects INTEGER DEFAULT 0,
  task_completion_rate REAL DEFAULT 0.0,    -- % of drops completed
  average_session_duration INTEGER DEFAULT 0, -- seconds
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cron job tracking for automation
CREATE TABLE IF NOT EXISTS cron_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_name TEXT NOT NULL UNIQUE,
  last_run_at DATETIME,
  next_run_at DATETIME,
  status TEXT DEFAULT 'active', -- active | paused | failed
  error_message TEXT,
  execution_time_ms INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Community activity feed
CREATE TABLE IF NOT EXISTS community_feed (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  activity_type TEXT NOT NULL, -- stake | funding | drop_complete | tier_upgrade | leaderboard_rank
  activity_data JSON,          -- Flexible data field for activity details
  points_earned INTEGER DEFAULT 0,
  gems_earned INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Admin action logs
CREATE TABLE IF NOT EXISTS admin_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id TEXT NOT NULL,
  action_type TEXT NOT NULL, -- content_moderate | drop_approve | reward_audit | user_ban
  target_id TEXT,            -- ID of affected resource
  action_details JSON,       -- Details of the action taken
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- User subscriptions for recurring payments
CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  tier TEXT NOT NULL, -- premium | super
  status TEXT DEFAULT 'active', -- active | canceled | past_due | incomplete
  current_period_start DATETIME,
  current_period_end DATETIME,
  cancel_at_period_end BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Promo codes for marketing campaigns
CREATE TABLE IF NOT EXISTS promo_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL, -- percentage | fixed_amount
  discount_value REAL NOT NULL,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from DATETIME,
  valid_until DATETIME,
  applicable_tiers TEXT, -- comma-separated: free,premium,super
  status TEXT DEFAULT 'active',
  created_by TEXT, -- admin_id
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Referral system tracking
CREATE TABLE IF NOT EXISTS referrals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  referrer_id TEXT NOT NULL,
  referee_id TEXT NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending', -- pending | completed | expired
  bonus_paid BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (referrer_id) REFERENCES users(id),
  FOREIGN KEY (referee_id) REFERENCES users(id),
  UNIQUE(referrer_id, referee_id)
);

-- Performance indices for analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_date ON analytics_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_metrics ON analytics_snapshots(dau, wau, mau, arpu);

CREATE INDEX IF NOT EXISTS idx_cron_jobs_name ON cron_jobs(job_name);
CREATE INDEX IF NOT EXISTS idx_cron_jobs_next_run ON cron_jobs(next_run_at);

CREATE INDEX IF NOT EXISTS idx_community_feed_user ON community_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_community_feed_type ON community_feed(activity_type);
CREATE INDEX IF NOT EXISTS idx_community_feed_created ON community_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_feed_points ON community_feed(points_earned DESC);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_type ON admin_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_status ON promo_codes(status);
CREATE INDEX IF NOT EXISTS idx_promo_codes_validity ON promo_codes(valid_from, valid_until);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
