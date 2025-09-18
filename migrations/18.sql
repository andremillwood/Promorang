
-- Add achievements system
CREATE TABLE achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  criteria_type TEXT NOT NULL, -- 'count', 'streak', 'amount', 'level'
  criteria_value INTEGER NOT NULL,
  criteria_field TEXT NOT NULL, -- field to check against
  gold_reward INTEGER DEFAULT 0,
  xp_reward INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  achievement_id INTEGER NOT NULL,
  earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE
);

-- Add content engagement tracking
CREATE TABLE content_engagement_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  content_id INTEGER NOT NULL,
  engagement_type TEXT NOT NULL, -- 'view', 'like', 'comment', 'share', 'move'
  subsequent_earnings REAL DEFAULT 0.0,
  attributed_revenue REAL DEFAULT 0.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add drop submissions
CREATE TABLE drop_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  drop_id INTEGER NOT NULL,
  submission_type TEXT NOT NULL, -- 'url', 'text', 'file'
  submission_data TEXT NOT NULL, -- URL, text content, or file reference
  submission_notes TEXT,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME,
  review_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'revision_needed'
  review_notes TEXT,
  reviewer_id INTEGER
);

-- Add gold utility features
CREATE TABLE gold_purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  item_type TEXT NOT NULL, -- 'tier_upgrade', 'key_multiplier', 'xp_boost', 'profile_badge'
  item_name TEXT NOT NULL,
  gold_cost INTEGER NOT NULL,
  effect_data TEXT, -- JSON for effect details
  expires_at DATETIME,
  purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add referral tracking
CREATE TABLE referral_rewards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  referrer_id INTEGER NOT NULL,
  referred_id INTEGER NOT NULL,
  reward_type TEXT NOT NULL, -- 'signup', 'first_drop', 'tier_upgrade'
  reward_amount REAL NOT NULL,
  currency_type TEXT NOT NULL,
  claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default achievements
INSERT INTO achievements (name, description, icon, category, criteria_type, criteria_value, criteria_field, gold_reward, xp_reward) VALUES
('First Steps', 'Complete your first social action', 'star', 'engagement', 'count', 1, 'points_transactions', 10, 100),
('Content Creator', 'Create your first piece of content', 'file-text', 'creation', 'count', 1, 'content_pieces', 25, 200),
('Drop Hunter', 'Apply to your first drop', 'zap', 'earning', 'count', 1, 'drop_applications', 15, 150),
('Social Butterfly', 'Perform 100 social actions', 'heart', 'engagement', 'count', 100, 'points_transactions', 50, 500),
('Streak Master', 'Maintain a 7-day activity streak', 'calendar', 'engagement', 'streak', 7, 'points_streak_days', 75, 750),
('Content Empire', 'Create 10 pieces of content', 'crown', 'creation', 'count', 10, 'content_pieces', 100, 1000),
('Drop Master', 'Complete 25 drop applications', 'trophy', 'earning', 'count', 25, 'drop_applications_completed', 200, 2000),
('Level Up', 'Reach level 5', 'arrow-up', 'progression', 'level', 5, 'level', 150, 1500),
('Golden Touch', 'Collect 1000 gold', 'coins', 'currency', 'amount', 1000, 'gold_collected', 0, 5000),
('Influencer', 'Get 100 followers', 'users', 'social', 'count', 100, 'follower_count', 300, 3000);
