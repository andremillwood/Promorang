
-- Add fields to social_bets table to support user-generated forecasts
ALTER TABLE social_bets ADD COLUMN creator_initial_amount REAL DEFAULT 0.0;
ALTER TABLE social_bets ADD COLUMN creator_side TEXT;
ALTER TABLE social_bets ADD COLUMN content_id INTEGER;

-- Rename bet_participations table fields to be more forecast-focused
CREATE TABLE forecast_participations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  forecast_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  prediction_amount REAL NOT NULL,
  prediction_side TEXT NOT NULL,
  potential_payout REAL NOT NULL,
  actual_payout REAL DEFAULT 0.0,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Copy existing data from bet_participations to forecast_participations
INSERT INTO forecast_participations (
  forecast_id, user_id, prediction_amount, prediction_side, 
  potential_payout, actual_payout, status, created_at, updated_at
)
SELECT 
  bet_id, user_id, bet_amount, bet_side, 
  potential_payout, actual_payout, status, created_at, updated_at
FROM bet_participations;

-- Rename social_bets to social_forecasts for consistency
CREATE TABLE social_forecasts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id INTEGER NOT NULL,
  platform TEXT NOT NULL,
  content_url TEXT NOT NULL,
  content_id INTEGER,
  forecast_type TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  odds REAL NOT NULL,
  pool_size REAL DEFAULT 0.0,
  creator_initial_amount REAL DEFAULT 0.0,
  creator_side TEXT,
  expires_at DATETIME NOT NULL,
  status TEXT DEFAULT 'active',
  result TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Copy existing data from social_bets to social_forecasts
INSERT INTO social_forecasts (
  creator_id, platform, content_url, forecast_type, target_value, 
  current_value, odds, pool_size, expires_at, status, result, created_at, updated_at
)
SELECT 
  creator_id, platform, content_url, bet_type, target_value,
  current_value, odds, pool_size, expires_at, status, result, created_at, updated_at
FROM social_bets;
