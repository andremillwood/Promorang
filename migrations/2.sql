
-- Insert demo users
INSERT INTO users (mocha_user_id, email, username, display_name, bio, avatar_url, user_type, xp_points, level, referral_code, follower_count, following_count, total_earnings_usd) VALUES
('demo_user_1', 'sarah@example.com', 'sarahcreates', 'Sarah Chen', 'Content creator focused on lifestyle and wellness. 📸✨', 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400', 'regular', 2400, 3, 'SARAH123', 15200, 890, 342.50),
('demo_user_2', 'mike@example.com', 'mikeviral', 'Mike Rodriguez', 'Making content that breaks the internet 🚀 Tech & Gaming enthusiast', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'regular', 3800, 4, 'MIKE456', 28500, 1250, 875.25),
('demo_user_3', 'emma@example.com', 'emmafitness', 'Emma Thompson', 'Fitness coach helping you reach your goals 💪 Certified trainer & nutritionist', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', 'regular', 1800, 2, 'EMMA789', 9600, 420, 189.75),
('demo_user_4', 'alex@example.com', 'alexbrands', 'Alex Marketing', 'Brand strategist & campaign manager. Creating viral moments for top brands.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 'merchant', 5200, 5, 'ALEX101', 3200, 2100, 1250.00),
('demo_user_5', 'zoe@example.com', 'zoedance', 'Zoe Williams', 'Professional dancer & choreographer 💃 Teaching moves that go viral!', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', 'regular', 3200, 4, 'ZOE202', 45000, 1800, 567.30);

-- Create wallets for demo users
INSERT INTO wallets (user_id, currency_type, balance) VALUES
(1, 'USD', 125.50),
(1, 'PromoGem', 2400),
(2, 'USD', 234.75),
(2, 'PromoGem', 3800),
(3, 'USD', 89.25),
(3, 'PromoGem', 1800),
(4, 'USD', 450.00),
(4, 'PromoGem', 5200),
(5, 'USD', 178.90),
(5, 'PromoGem', 3200);

-- Insert demo content pieces
INSERT INTO content_pieces (creator_id, platform, platform_url, title, description, media_url, total_shares, available_shares, share_price, current_revenue, performance_metrics) VALUES
(1, 'instagram', 'https://instagram.com/p/demo1', 'Morning Skincare Routine', 'My 5-step morning routine for glowing skin ✨', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400', 500, 320, 2.50, 847.30, '{"views": 125000, "likes": 8400, "shares": 1200, "comments": 450}'),
(2, 'tiktok', 'https://tiktok.com/@mikeviral/video1', 'iPhone 15 Hidden Features', 'Mind-blowing iPhone tricks Apple doesn''t tell you about! 🤯', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', 1000, 650, 3.75, 1250.80, '{"views": 850000, "likes": 67000, "shares": 15000, "comments": 3200}'),
(3, 'youtube', 'https://youtube.com/watch?v=demo3', '30-Min HIIT Workout', 'Burn 400 calories with this intense home workout - no equipment needed!', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', 750, 480, 4.20, 2100.45, '{"views": 245000, "likes": 12000, "shares": 3400, "comments": 890}'),
(1, 'instagram', 'https://instagram.com/p/demo4', 'Sunset Photography Tips', 'How to capture magical golden hour photos with your phone 📸', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', 300, 180, 3.00, 456.20, '{"views": 89000, "likes": 5600, "shares": 890, "comments": 320}'),
(5, 'tiktok', 'https://tiktok.com/@zoedance/video2', 'Viral Dance Tutorial', 'Learn the dance that''s taking over TikTok! Step by step breakdown 💃', 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400', 800, 520, 2.80, 1680.90, '{"views": 2100000, "likes": 180000, "shares": 45000, "comments": 8900}'),
(2, 'youtube', 'https://youtube.com/watch?v=demo6', 'Gaming Setup Tour 2024', 'My $15K gaming setup that maxes out every game!', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400', 600, 375, 5.50, 3200.60, '{"views": 567000, "likes": 28000, "shares": 8900, "comments": 2100}'),
(3, 'instagram', 'https://instagram.com/p/demo7', 'Healthy Meal Prep', 'Prep 5 days of meals in 1 hour! Healthy, delicious & budget-friendly 🥗', 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400', 400, 250, 2.25, 620.40, '{"views": 156000, "likes": 9800, "shares": 2100, "comments": 680}');

-- Insert demo social bets
INSERT INTO social_bets (creator_id, platform, content_url, bet_type, target_value, current_value, odds, pool_size, expires_at, status) VALUES
(1, 'instagram', 'https://instagram.com/p/newpost1', 'views', 50000, 12500, 2.4, 450.00, datetime('now', '+2 days'), 'active'),
(2, 'tiktok', 'https://tiktok.com/@mikeviral/newvideo', 'likes', 25000, 8900, 1.8, 890.50, datetime('now', '+18 hours'), 'active'),
(5, 'tiktok', 'https://tiktok.com/@zoedance/trending', 'shares', 5000, 1200, 3.2, 1250.75, datetime('now', '+3 days'), 'active'),
(3, 'youtube', 'https://youtube.com/watch?v=newworkout', 'comments', 500, 124, 2.7, 675.25, datetime('now', '+1 day'), 'active'),
(2, 'instagram', 'https://instagram.com/p/techreview', 'views', 100000, 45600, 1.9, 2100.00, datetime('now', '+4 days'), 'active'),
(1, 'tiktok', 'https://tiktok.com/@sarahcreates/lifestyle', 'likes', 15000, 3400, 2.1, 320.50, datetime('now', '+6 hours'), 'active');

-- Insert demo tasks
INSERT INTO tasks (creator_id, title, description, category, difficulty, reward_amount, follower_threshold, time_commitment, requirements, deliverables, deadline_at, max_participants, current_participants) VALUES
(4, 'Create Instagram Reel for New Skincare Brand', 'We need authentic creators to showcase our new vitamin C serum in a 30-60 second Instagram Reel. Show your morning routine featuring our product.', 'Content Creation', 'easy', 75, 1000, '2-3 hours', 'Must have 1000+ Instagram followers, skincare niche preferred', 'High-quality Instagram Reel, product tags, honest review', datetime('now', '+7 days'), 5, 2),
(4, 'TikTok Product Review - Gaming Headset', 'Looking for gaming content creators to review our new wireless gaming headset. Create an engaging TikTok showing the features and sound quality.', 'Review', 'medium', 120, 2500, '3-4 hours', 'Gaming content creator with 2500+ TikTok followers', 'TikTok video review, product demonstration, honest feedback', datetime('now', '+5 days'), 3, 1),
(1, 'Design Social Media Templates', 'Need 5 Instagram story templates for a wellness brand. Modern, minimalist design with earth tones and inspirational quotes.', 'Design', 'medium', 150, 0, '4-6 hours', 'Graphic design experience, portfolio required', '5 Instagram story templates in PSD/AI format', datetime('now', '+10 days'), 2, 0),
(2, 'YouTube Thumbnail Design', 'Create eye-catching thumbnails for my tech review channel. Need someone who understands YouTube best practices and can make clickable designs.', 'Design', 'easy', 45, 0, '1-2 hours', 'Experience with YouTube thumbnails, Photoshop skills', '3 thumbnail options in high resolution', datetime('now', '+3 days'), 10, 6),
(5, 'Dance Challenge Promotion', 'Help promote my new dance challenge across social platforms! Share the tutorial video and create your own version of the dance.', 'Social Sharing', 'easy', 35, 500, '30 minutes', 'Active on TikTok/Instagram, willing to dance on camera', 'Share original video + create your own dance video', datetime('now', '+14 days'), 20, 8),
(4, 'Fitness App Beta Testing', 'Test our new fitness tracking app and provide detailed feedback. We need users to try all features and report bugs or suggestions.', 'Review', 'hard', 200, 0, '6-8 hours', 'Fitness enthusiast, experience with mobile apps', 'Detailed testing report with screenshots and feedback', datetime('now', '+12 days'), 8, 3),
(1, 'Instagram Story Takeover', 'Take over my Instagram Stories for a day! Share your daily routine, tips, and behind-the-scenes content in my wellness niche.', 'Content Creation', 'medium', 100, 3000, '4-5 hours', '3000+ followers, wellness/lifestyle content creator', '8-10 Instagram stories throughout the day', datetime('now', '+2 days'), 1, 0),
(2, 'Tech Product Unboxing', 'Create an exciting unboxing video for our latest smartphone accessory. Focus on first impressions and initial setup experience.', 'Content Creation', 'easy', 85, 1500, '2-3 hours', 'Tech content creator, good video quality', 'Unboxing video for YouTube/TikTok', datetime('now', '+6 days'), 4, 2);

-- Insert some demo investments
INSERT INTO content_investments (content_id, investor_id, shares_owned, purchase_price, total_dividends) VALUES
(1, 2, 50, 2.50, 12.50),
(2, 1, 25, 3.75, 8.75),
(3, 4, 100, 4.20, 45.20),
(1, 5, 30, 2.50, 7.50),
(5, 3, 75, 2.80, 28.50),
(2, 3, 15, 3.75, 5.25),
(6, 1, 40, 5.50, 22.00),
(4, 2, 20, 3.00, 6.00);

-- Insert some demo bet participations
INSERT INTO bet_participations (bet_id, user_id, bet_amount, bet_side, potential_payout, status) VALUES
(1, 2, 25.00, 'over', 60.00, 'active'),
(1, 3, 15.00, 'under', 36.00, 'active'),
(2, 1, 50.00, 'over', 90.00, 'active'),
(3, 4, 75.00, 'over', 240.00, 'active'),
(4, 2, 30.00, 'over', 81.00, 'active'),
(5, 1, 40.00, 'under', 76.00, 'active'),
(6, 5, 20.00, 'over', 42.00, 'active');

-- Insert some demo transactions
INSERT INTO transactions (user_id, transaction_type, amount, currency_type, status, reference_id, reference_type, description) VALUES
(1, 'task_payment', 75.00, 'USD', 'completed', 1, 'task', 'Instagram Reel creation payment'),
(2, 'task_payment', 120.00, 'USD', 'completed', 2, 'task', 'Gaming headset review payment'),
(3, 'staking_reward', 12.50, 'USD', 'completed', NULL, 'staking', 'PromoGem staking rewards'),
(1, 'deposit', -100.00, 'USD', 'completed', 3, 'investment', 'Bought 25 shares of content'),
(4, 'referral_bonus', 25.00, 'USD', 'completed', NULL, 'referral', 'New user referral bonus'),
(2, 'deposit', -25.00, 'USD', 'completed', 1, 'bet', 'Bet over on Instagram views'),
(5, 'task_payment', 35.00, 'USD', 'completed', 5, 'task', 'Dance challenge promotion payment'),
(3, 'deposit', -15.00, 'USD', 'completed', 1, 'bet', 'Bet under on Instagram views');

-- Insert some task applications
INSERT INTO task_applications (task_id, user_id, status, application_message) VALUES
(1, 1, 'approved', 'I''d love to feature your skincare product! I have 15K followers in the beauty/wellness space and consistently get high engagement on my skincare content.'),
(1, 3, 'pending', 'Hi! I''m a certified esthetician with 9.6K followers who are very engaged with skincare content. I''d be excited to try your vitamin C serum!'),
(2, 2, 'completed', 'I run a gaming channel with 28K followers and would love to review your headset! I have professional setup for high-quality content.'),
(4, 5, 'approved', 'I''ve designed thumbnails for several YouTubers and understand what makes content clickable. Would love to help your channel grow!'),
(5, 1, 'completed', 'This dance looks so fun! I''d be happy to help promote it - my audience loves dance content and challenges.'),
(6, 3, 'pending', 'As a certified fitness trainer, I''d be perfect for testing your app! I work with clients daily and can provide detailed professional feedback.'),
(8, 2, 'approved', 'I create tech unboxing content regularly and have great camera setup. Excited to showcase your smartphone accessory!');
