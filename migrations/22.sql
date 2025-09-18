
CREATE TABLE influence_rewards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  platform TEXT NOT NULL,
  platform_username TEXT,
  follower_count INTEGER DEFAULT 0,
  phone_number TEXT,
  points_calculated INTEGER DEFAULT 0,
  points_awarded INTEGER DEFAULT 0,
  last_updated_at DATETIME,
  current_month TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  webhook_data TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_influence_rewards_user_month ON influence_rewards(user_id, current_month);
CREATE INDEX idx_influence_rewards_platform ON influence_rewards(platform, platform_username);
