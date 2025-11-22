
-- Fix the problematic migration by removing dependencies and simplifying inserts
-- This replaces migration #12 with a simpler version that avoids compound SELECT issues

-- First ensure we have some basic users data
INSERT OR IGNORE INTO users (id, mocha_user_id, email, username, display_name, user_type, points_balance, keys_balance, gems_balance) 
VALUES 
(1, 'user1_mocha', 'user1@example.com', 'creator1', 'Creative User 1', 'creator', 500, 5, 10.0),
(2, 'user2_mocha', 'user2@example.com', 'creator2', 'Creative User 2', 'creator', 750, 3, 15.0),
(3, 'user3_mocha', 'user3@example.com', 'user3', 'Regular User 3', 'regular', 1000, 2, 5.0),
(4, 'user4_mocha', 'user4@example.com', 'user4', 'Regular User 4', 'regular', 300, 1, 8.0),
(5, 'user5_mocha', 'user5@example.com', 'user5', 'Regular User 5', 'regular', 600, 4, 12.0);

-- Add some basic drops
INSERT OR IGNORE INTO drops (id, creator_id, title, description, drop_type, difficulty, key_cost, gem_reward_base, status) 
VALUES 
(1, 1, 'Tech Product Review', 'Create authentic review content for our new tech product', 'content_creation', 'medium', 2, 25.0, 'active'),
(2, 1, 'Gaming Content Drop', 'Showcase our gaming tool to your audience', 'engagement', 'easy', 1, 20.0, 'active'),
(3, 2, 'Wellness Journey', 'Document your wellness journey with our product', 'content_creation', 'hard', 3, 35.0, 'active'),
(4, 2, 'Product Survey', 'Complete detailed survey about user experience', 'survey', 'easy', 1, 15.0, 'active');
