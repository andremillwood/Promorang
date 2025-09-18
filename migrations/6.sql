
-- Add move_cost_points and key_reward_amount to track social action economics
ALTER TABLE drops ADD COLUMN move_cost_points INTEGER DEFAULT 0;
ALTER TABLE drops ADD COLUMN key_reward_amount INTEGER DEFAULT 0;

-- Add is_proof_drop flag to distinguish proof drops from paid drops
ALTER TABLE drops ADD COLUMN is_proof_drop BOOLEAN DEFAULT FALSE;
ALTER TABLE drops ADD COLUMN is_paid_drop BOOLEAN DEFAULT FALSE;

-- Create advertiser_inventory table to track monthly/weekly allocations
CREATE TABLE advertiser_inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  advertiser_id INTEGER NOT NULL,
  period_type TEXT NOT NULL, -- 'monthly_sample', 'weekly'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  moves_allocated INTEGER DEFAULT 0,
  moves_used INTEGER DEFAULT 0,
  proof_drops_allocated INTEGER DEFAULT 0,
  proof_drops_used INTEGER DEFAULT 0,
  paid_drops_allocated INTEGER DEFAULT 0,
  paid_drops_used INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create move_transactions table to track social action costs and rewards
CREATE TABLE move_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  move_type TEXT NOT NULL, -- 'like', 'comment', 'share', 'save'
  points_cost INTEGER NOT NULL,
  keys_earned INTEGER NOT NULL,
  content_id INTEGER,
  drop_id INTEGER,
  reference_type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create sponsored_content table for gem allocation to sponsor posts
CREATE TABLE sponsored_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  advertiser_id INTEGER NOT NULL,
  content_id INTEGER,
  drop_id INTEGER,
  gems_allocated REAL NOT NULL,
  boost_multiplier REAL DEFAULT 1.5,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_advertiser_inventory_advertiser_period ON advertiser_inventory(advertiser_id, period_type, period_start);
CREATE INDEX idx_move_transactions_user_date ON move_transactions(user_id, created_at);
CREATE INDEX idx_sponsored_content_advertiser ON sponsored_content(advertiser_id);
