
-- Add new currency columns to users table
ALTER TABLE users ADD COLUMN points_balance INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN keys_balance INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN master_key_activated_at DATETIME;
ALTER TABLE users ADD COLUMN gold_collected INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN user_tier TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN points_streak_days INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN last_activity_date DATE;

-- Rename promogem_balance to gems_balance for consistency
ALTER TABLE users ADD COLUMN gems_balance REAL DEFAULT 0.0;
UPDATE users SET gems_balance = promogem_balance;

-- Add leaderboard scores table
CREATE TABLE leaderboard_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  period_type TEXT NOT NULL,
  period_start DATE NOT NULL,
  points_earned INTEGER DEFAULT 0,
  gems_earned REAL DEFAULT 0.0,
  keys_used INTEGER DEFAULT 0,
  gold_earned INTEGER DEFAULT 0,
  composite_score REAL DEFAULT 0.0,
  rank_position INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Rename tasks table to drops and add new columns
CREATE TABLE drops (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  drop_type TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  key_cost INTEGER NOT NULL,
  gem_reward_base REAL NOT NULL,
  gem_pool_total REAL DEFAULT 0.0,
  gem_pool_remaining REAL DEFAULT 0.0,
  reward_logic TEXT,
  follower_threshold INTEGER DEFAULT 0,
  time_commitment TEXT,
  requirements TEXT,
  deliverables TEXT,
  deadline_at DATETIME,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  platform TEXT,
  content_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Copy data from tasks to drops
INSERT INTO drops (
  creator_id, title, description, drop_type, difficulty, key_cost, 
  gem_reward_base, follower_threshold, time_commitment, requirements, 
  deliverables, deadline_at, max_participants, current_participants, 
  status, created_at, updated_at
)
SELECT 
  creator_id, title, description, category as drop_type, difficulty,
  CASE difficulty
    WHEN 'easy' THEN 1
    WHEN 'medium' THEN 2 
    WHEN 'hard' THEN 3
  END as key_cost,
  reward_amount as gem_reward_base,
  follower_threshold, time_commitment, requirements, deliverables,
  deadline_at, max_participants, current_participants, status,
  created_at, updated_at
FROM tasks;

-- Update drop_applications table to reference drops
CREATE TABLE drop_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  drop_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  application_message TEXT,
  submission_url TEXT,
  submission_notes TEXT,
  review_score INTEGER,
  gems_earned REAL DEFAULT 0.0,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  paid_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Copy task applications to drop applications
INSERT INTO drop_applications (
  drop_id, user_id, status, application_message, submission_url,
  submission_notes, review_score, applied_at, completed_at, paid_at,
  created_at, updated_at
)
SELECT 
  task_id as drop_id, user_id, status, application_message, submission_url,
  submission_notes, review_score, applied_at, completed_at, paid_at,
  created_at, updated_at
FROM task_applications;

-- Add points transactions table for tracking social actions
CREATE TABLE points_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  points_earned INTEGER NOT NULL,
  reference_id INTEGER,
  reference_type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add currency conversion history
CREATE TABLE currency_conversions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  from_amount REAL NOT NULL,
  to_amount REAL NOT NULL,
  conversion_rate REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add master key activations tracking
CREATE TABLE master_key_activations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  activation_date DATE NOT NULL,
  proof_drops_required INTEGER NOT NULL,
  proof_drops_completed INTEGER DEFAULT 0,
  is_activated BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_leaderboard_period ON leaderboard_scores(period_type, period_start);
CREATE INDEX idx_drops_type ON drops(drop_type);
CREATE INDEX idx_drops_status ON drops(status);
CREATE INDEX idx_points_transactions_user ON points_transactions(user_id);
CREATE INDEX idx_currency_conversions_user ON currency_conversions(user_id);
CREATE INDEX idx_master_key_user_date ON master_key_activations(user_id, activation_date);
