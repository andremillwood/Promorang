
-- Users table with additional Promorang-specific fields
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mocha_user_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  user_type TEXT DEFAULT 'regular', -- regular, merchant, advertiser
  xp_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  total_earnings_usd REAL DEFAULT 0.0,
  promogem_balance REAL DEFAULT 0.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Wallets for tracking earnings and transactions
CREATE TABLE wallets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  currency_type TEXT NOT NULL, -- USD, PromoGem
  balance REAL DEFAULT 0.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tasks marketplace
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- Content Creation, Social Sharing, Review, Design, Engagement
  difficulty TEXT NOT NULL, -- easy, medium, hard
  reward_amount REAL NOT NULL,
  currency_type TEXT DEFAULT 'USD',
  follower_threshold INTEGER DEFAULT 0,
  time_commitment TEXT,
  requirements TEXT,
  deliverables TEXT,
  deadline_at DATETIME,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- active, paused, completed, cancelled
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Task applications and completions
CREATE TABLE task_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, completed, paid
  application_message TEXT,
  submission_url TEXT,
  submission_notes TEXT,
  review_score INTEGER,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  paid_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Transactions for all earnings and spending
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- task_payment, referral_bonus, withdrawal, deposit, staking_reward
  amount REAL NOT NULL,
  currency_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, completed, failed
  reference_id INTEGER, -- task_id, campaign_id, etc.
  reference_type TEXT, -- task, campaign, referral, etc.
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Content pieces for content shares feature
CREATE TABLE content_pieces (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id INTEGER NOT NULL,
  platform TEXT NOT NULL, -- instagram, tiktok, youtube, linkedin, twitter
  platform_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT,
  total_shares INTEGER DEFAULT 100,
  available_shares INTEGER DEFAULT 50,
  share_price REAL DEFAULT 1.0,
  current_revenue REAL DEFAULT 0.0,
  performance_metrics TEXT, -- JSON string of views, likes, shares, comments
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Content share investments
CREATE TABLE content_investments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_id INTEGER NOT NULL,
  investor_id INTEGER NOT NULL,
  shares_owned INTEGER NOT NULL,
  purchase_price REAL NOT NULL,
  purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_dividends REAL DEFAULT 0.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Social bets on content performance
CREATE TABLE social_bets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id INTEGER NOT NULL,
  platform TEXT NOT NULL,
  content_url TEXT NOT NULL,
  bet_type TEXT NOT NULL, -- views, likes, shares, comments
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  odds REAL NOT NULL,
  pool_size REAL DEFAULT 0.0,
  expires_at DATETIME NOT NULL,
  status TEXT DEFAULT 'active', -- active, expired, resolved
  result TEXT, -- won, lost, null
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Individual bet participations
CREATE TABLE bet_participations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bet_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  bet_amount REAL NOT NULL,
  bet_side TEXT NOT NULL, -- over, under
  potential_payout REAL NOT NULL,
  actual_payout REAL DEFAULT 0.0,
  status TEXT DEFAULT 'active', -- active, won, lost
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_mocha_user_id ON users(mocha_user_id);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_tasks_creator_id ON tasks(creator_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_task_applications_task_id ON task_applications(task_id);
CREATE INDEX idx_task_applications_user_id ON task_applications(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_content_pieces_creator_id ON content_pieces(creator_id);
CREATE INDEX idx_content_investments_content_id ON content_investments(content_id);
CREATE INDEX idx_content_investments_investor_id ON content_investments(investor_id);
CREATE INDEX idx_social_bets_creator_id ON social_bets(creator_id);
CREATE INDEX idx_bet_participations_bet_id ON bet_participations(bet_id);
CREATE INDEX idx_bet_participations_user_id ON bet_participations(user_id);
