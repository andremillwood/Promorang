
-- Growth Hub Staking Channels
CREATE TABLE growth_channels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  lock_period_days INTEGER NOT NULL,
  base_multiplier REAL NOT NULL,
  risk_level TEXT NOT NULL,
  min_deposit INTEGER NOT NULL,
  max_deposit INTEGER NOT NULL,
  total_deposited REAL DEFAULT 0.0,
  participant_count INTEGER DEFAULT 0,
  expected_apr REAL NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  features TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User staking positions
CREATE TABLE staking_positions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  channel_id TEXT NOT NULL,
  amount REAL NOT NULL,
  multiplier REAL NOT NULL,
  staked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  lock_until DATETIME NOT NULL,
  earned_so_far REAL DEFAULT 0.0,
  last_reward_at DATETIME,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Funding projects (Kickstarter-style)
CREATE TABLE funding_projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  funding_goal REAL NOT NULL,
  current_funding REAL DEFAULT 0.0,
  backer_count INTEGER DEFAULT 0,
  min_pledge REAL NOT NULL,
  deadline_at DATETIME NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active',
  reward_tiers TEXT,
  media_urls TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Funding pledges/backing
CREATE TABLE funding_pledges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  pledge_amount REAL NOT NULL,
  reward_tier_id TEXT,
  reward_tier_amount REAL,
  reward_tier_title TEXT,
  reward_tier_description TEXT,
  estimated_delivery TEXT,
  status TEXT DEFAULT 'active',
  fulfilled_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Social Shield policies
CREATE TABLE social_shield_policies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  monthly_premium REAL NOT NULL,
  max_coverage REAL NOT NULL,
  deductible REAL NOT NULL,
  min_followers INTEGER NOT NULL,
  coverage_details TEXT NOT NULL,
  supported_platforms TEXT NOT NULL,
  terms_conditions TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User shield subscriptions
CREATE TABLE shield_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  policy_id TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  monthly_premium REAL NOT NULL,
  status TEXT DEFAULT 'active',
  auto_renew BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Shield claims
CREATE TABLE shield_claims (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscription_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  claim_type TEXT NOT NULL,
  platform TEXT NOT NULL,
  incident_date DATE NOT NULL,
  description TEXT NOT NULL,
  evidence_urls TEXT,
  claim_amount REAL NOT NULL,
  approved_amount REAL DEFAULT 0.0,
  status TEXT DEFAULT 'pending',
  reviewed_by INTEGER,
  reviewed_at DATETIME,
  review_notes TEXT,
  paid_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Growth Hub analytics tracking
CREATE TABLE growth_hub_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL,
  total_staked REAL DEFAULT 0.0,
  active_stakers INTEGER DEFAULT 0,
  rewards_distributed REAL DEFAULT 0.0,
  active_projects INTEGER DEFAULT 0,
  funding_volume REAL DEFAULT 0.0,
  shield_premiums_collected REAL DEFAULT 0.0,
  shield_claims_paid REAL DEFAULT 0.0,
  new_users INTEGER DEFAULT 0,
  platform_revenue REAL DEFAULT 0.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Staking rewards distribution log
CREATE TABLE staking_rewards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  position_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  channel_id TEXT NOT NULL,
  reward_amount REAL NOT NULL,
  reward_type TEXT DEFAULT 'daily',
  distributed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Platform economic metrics
CREATE TABLE economic_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric_date DATE NOT NULL,
  total_value_locked REAL DEFAULT 0.0,
  circulating_gems REAL DEFAULT 0.0,
  staking_apr_average REAL DEFAULT 0.0,
  funding_success_rate REAL DEFAULT 0.0,
  shield_claim_rate REAL DEFAULT 0.0,
  user_retention_rate REAL DEFAULT 0.0,
  platform_growth_rate REAL DEFAULT 0.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default growth channels
INSERT INTO growth_channels VALUES 
('stable', 'Stable Growth', 'Low-risk staking with steady returns. Perfect for conservative investors.', 30, 1.2, 'low', 100, 10000, 125000, 234, 12.5, 'Shield', 'green', '["Principal protection", "Daily rewards", "Auto-compound", "Early withdrawal (penalty)"]', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('growth', 'Growth Accelerator', 'Medium-risk channel focused on platform growth metrics and user acquisition.', 90, 1.8, 'medium', 250, 25000, 89000, 156, 28.7, 'TrendingUp', 'blue', '["Growth bonuses", "Platform rewards", "Referral multipliers", "Quarterly bonuses"]', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('venture', 'Venture Pool', 'High-risk, high-reward pool investing in emerging creators and technologies.', 180, 3.2, 'high', 500, 50000, 67000, 89, 45.8, 'Rocket', 'purple', '["Creator equity", "Tech innovation rewards", "Exclusive opportunities", "Governance rights"]', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('creator', 'Creator Fund', 'Support emerging creators while earning from their success.', 60, 2.1, 'medium', 200, 15000, 45000, 78, 32.1, 'Star', 'orange', '["Creator revenue share", "Content access", "Meet & greet events", "Portfolio tracking"]', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert default social shield policies
INSERT INTO social_shield_policies VALUES
('basic', 'Basic Shield', 'Essential protection for growing creators', 29.0, 1000.0, 50.0, 1000, '{"platformBan": false, "algorithmChange": true, "contentStrike": true, "monetizationLoss": false, "followerLoss": false}', '["Instagram", "TikTok"]', 'Basic terms and conditions apply', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('pro', 'Pro Shield', 'Comprehensive protection for established creators', 79.0, 5000.0, 100.0, 5000, '{"platformBan": true, "algorithmChange": true, "contentStrike": true, "monetizationLoss": true, "followerLoss": false}', '["Instagram", "TikTok", "YouTube", "Twitter"]', 'Professional terms and conditions apply', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('enterprise', 'Enterprise Shield', 'Maximum protection for professional creators', 199.0, 25000.0, 250.0, 25000, '{"platformBan": true, "algorithmChange": true, "contentStrike": true, "monetizationLoss": true, "followerLoss": true}', '["Instagram", "TikTok", "YouTube", "Twitter", "LinkedIn", "Twitch"]', 'Enterprise terms and conditions apply', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
