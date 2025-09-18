
-- Add demo drop applications to show interaction
INSERT INTO drop_applications (drop_id, user_id, status, application_message, gems_earned, applied_at, completed_at) VALUES
((SELECT id FROM drops WHERE title = '[Demo] Create TikTok Dance Tutorial'), 1, 'completed', 'I have 3 years of dance experience and love creating tutorials! My TikTok has gained over 50K followers with dance content.', 0, datetime('now', '-3 days'), datetime('now', '-1 day')),
((SELECT id FROM drops WHERE title = '[Demo] Product Review Challenge'), 1, 'approved', 'I specialize in tech reviews and have a YouTube channel with 25K subscribers. I can provide honest, detailed feedback.', 125, datetime('now', '-2 days'), NULL),
((SELECT id FROM drops WHERE title = '[Demo] Fitness Content Creation'), 2, 'pending', 'Certified personal trainer with 5+ years experience. I create motivational fitness content that inspires people to stay active.', 0, datetime('now', '-1 day'), NULL),
((SELECT id FROM drops WHERE title = '[Demo] Social Media Engagement Move'), 3, 'completed', 'Active on all major social platforms with high engagement rates. Ready to help boost your content visibility!', 0, datetime('now', '-4 hours'), datetime('now', '-2 hours')),
((SELECT id FROM drops WHERE title = '[Demo] Gaming Community Survey'), 9, 'submitted', 'Hardcore gamer for 10+ years across multiple platforms. Happy to share insights about gaming community needs and preferences.', 0, datetime('now', '-6 hours'), NULL);

-- Add demo task applications
INSERT INTO task_applications (task_id, user_id, status, application_message, applied_at, completed_at) VALUES
((SELECT id FROM tasks WHERE title = '[Demo] Design Instagram Story Templates'), 6, 'completed', 'Graphic designer with 4 years experience in social media design. My templates have been used by 100+ brands.', datetime('now', '-5 days'), datetime('now', '-2 days')),
((SELECT id FROM tasks WHERE title = '[Demo] Gaming Thumbnail Creation'), 9, 'pending', 'YouTube content creator specializing in gaming thumbnails. I understand what makes thumbnails click-worthy and engaging.', datetime('now', '-1 day'), NULL),
((SELECT id FROM tasks WHERE title = '[Demo] Social Media Content Writing'), 8, 'approved', 'Content writer and social media manager with 3+ years experience. I know how to craft captions that drive engagement.', datetime('now', '-3 days'), NULL);

-- Add demo wallets for main user
INSERT OR IGNORE INTO wallets (user_id, currency_type, balance) VALUES
(1, 'USD', 247.85),
(1, 'EUR', 89.50),
(1, 'GBP', 156.20);

-- Add demo transactions to show earning history
INSERT INTO transactions (user_id, transaction_type, amount, currency_type, status, description, created_at) VALUES
(1, 'task_completion', 150.00, 'USD', 'completed', '[Demo] Earned from Instagram Story Templates task', datetime('now', '-2 days')),
(1, 'drop_reward', 125.00, 'USD', 'completed', '[Demo] Reward from Product Review Challenge', datetime('now', '-1 day')),
(1, 'content_investment', -50.00, 'USD', 'completed', '[Demo] Bought shares in Viral Dance Tutorial', datetime('now', '-4 hours')),
(1, 'tip_received', 25.50, 'USD', 'completed', '[Demo] Tip received for Morning Routine content', datetime('now', '-6 hours')),
(1, 'forecast_participation', -30.00, 'USD', 'pending', '[Demo] Prediction on Gaming Stream Highlights', datetime('now', '-2 hours'));

-- Add demo points transactions
INSERT INTO points_transactions (user_id, action_type, points_earned, base_points, multiplier, user_level, reference_type, created_at) VALUES
(1, 'like', 2, 1, 2.0, 'premium', 'content', datetime('now', '-1 hour')),
(1, 'comment', 5, 3, 1.5, 'premium', 'content', datetime('now', '-2 hours')),
(1, 'share', 8, 5, 1.5, 'premium', 'content', datetime('now', '-3 hours')),
(1, 'external_move', 25, 15, 1.5, 'premium', 'content', datetime('now', '-4 hours')),
(1, 'daily_login', 10, 10, 1.0, 'premium', 'system', datetime('now', '-12 hours'));

-- Add demo achievements
INSERT OR IGNORE INTO achievements (name, description, icon, category, criteria_type, criteria_value, criteria_field, gold_reward, xp_reward) VALUES
('First Steps', 'Complete your first drop application', '🎯', 'Getting Started', 'count', 1, 'drop_applications', 50, 100),
('Social Butterfly', 'Perform 10 social media actions', '🦋', 'Social', 'count', 10, 'social_actions', 75, 150),
('Content Creator', 'Upload your first piece of content', '🎨', 'Creation', 'count', 1, 'content_pieces', 100, 200),
('[Demo] Platform Tester', '[Demo] Engage with demo content - testing achievement system', '🧪', 'Demo', 'count', 5, 'demo_actions', 25, 50);

-- Add demo user achievements
INSERT INTO user_achievements (user_id, achievement_id, earned_at, progress, is_completed) VALUES
(1, (SELECT id FROM achievements WHERE name = 'First Steps'), datetime('now', '-3 days'), 1, true),
(1, (SELECT id FROM achievements WHERE name = 'Social Butterfly'), datetime('now', '-1 day'), 10, true),
(1, (SELECT id FROM achievements WHERE name = '[Demo] Platform Tester'), datetime('now', '-2 hours'), 5, true),
(1, (SELECT id FROM achievements WHERE name = 'Content Creator'), NULL, 0, false);

-- Add demo master key activation
INSERT OR IGNORE INTO master_key_activations (user_id, activation_date, proof_drops_required, proof_drops_completed, is_activated) VALUES
(1, date('now'), 3, 3, true),
(2, date('now'), 3, 1, false),
(3, date('now'), 3, 2, false);

-- Add demo currency conversions
INSERT INTO currency_conversions (user_id, from_currency, to_currency, from_amount, to_amount, conversion_rate, created_at) VALUES
(1, 'gems', 'USD', 100.0, 50.0, 0.5, datetime('now', '-1 day')),
(1, 'points', 'keys', 50.0, 5.0, 0.1, datetime('now', '-3 hours'));

-- Add demo external moves
INSERT INTO external_moves (user_id, move_type, content_id, content_platform, content_url, proof_url, proof_type, points_earned, keys_earned, verification_status, created_at) VALUES
(1, 'like', (SELECT id FROM content_pieces WHERE title = '[Demo] Viral Dance Challenge Tutorial'), 'TikTok', 'https://tiktok.com/@democreator/viral-dance', 'https://example.com/demo-proof-like.jpg', 'screenshot', 25, 3, 'verified', datetime('now', '-4 hours')),
(1, 'share', (SELECT id FROM content_pieces WHERE title = '[Demo] Morning Routine for Productivity'), 'Instagram', 'https://instagram.com/p/demo-morning-routine', 'https://example.com/demo-proof-share.jpg', 'screenshot', 40, 5, 'verified', datetime('now', '-2 hours')),
(1, 'comment', (SELECT id FROM content_pieces WHERE title = '[Demo] Epic Gaming Stream Highlights'), 'Twitch', 'https://twitch.tv/demogamer/epic-stream', 'https://example.com/demo-proof-comment.jpg', 'screenshot', 30, 4, 'pending', datetime('now', '-1 hour'));
