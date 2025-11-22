INSERT OR IGNORE INTO achievements (name, description, icon, category, criteria_type, criteria_value, criteria_field, gold_reward, xp_reward) VALUES
('First Steps', 'Complete your first social action', 'star', 'engagement', 'count', 1, 'points_transactions', 10, 50),
('Social Butterfly', 'Perform 50 social actions', 'heart', 'engagement', 'count', 50, 'points_transactions', 50, 200),
('Content Creator', 'Create your first content piece', 'file-text', 'creation', 'count', 1, 'content_pieces', 25, 100),
('Drop Master', 'Complete 10 drops successfully', 'zap', 'engagement', 'count', 10, 'drop_applications', 75, 300),
('Point Collector', 'Accumulate 1000 total points', 'coins', 'earning', 'total', 1000, 'points_balance', 20, 100),
('Key Keeper', 'Collect 25 keys', 'key', 'currency', 'total', 25, 'keys_balance', 40, 150),
('Gem Gatherer', 'Earn 100 gems', 'diamond', 'currency', 'total', 100, 'gems_balance', 60, 200),
('Weekly Warrior', 'Maintain a 7-day activity streak', 'calendar', 'progression', 'total', 7, 'points_streak_days', 30, 120),
('Level Up', 'Reach level 5', 'arrow-up', 'progression', 'total', 5, 'level', 35, 150),
('Gold Rush', 'Collect your first 100 gold', 'crown', 'currency', 'total', 100, 'gold_collected', 50, 250);