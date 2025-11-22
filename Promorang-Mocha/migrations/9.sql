
-- Update demo users with realistic current economy data
UPDATE users SET 
  points_balance = 4200,
  keys_balance = 15,
  gems_balance = 89.5,
  gold_collected = 3,
  last_activity_date = date('now'),
  points_streak_days = 7,
  user_tier = 'premium'
WHERE username = 'sarahcreates';

UPDATE users SET 
  points_balance = 6800,
  keys_balance = 35,
  gems_balance = 156.0,
  gold_collected = 8,
  last_activity_date = date('now'),
  points_streak_days = 12,
  user_tier = 'super'
WHERE username = 'mikeviral';

UPDATE users SET 
  points_balance = 2100,
  keys_balance = 8,
  gems_balance = 45.0,
  gold_collected = 1,
  last_activity_date = date('now', '-1 day'),
  points_streak_days = 3,
  user_tier = 'free'
WHERE username = 'emmafitness';

UPDATE users SET 
  points_balance = 1800,
  keys_balance = 12,
  gems_balance = 67.5,
  gold_collected = 2,
  last_activity_date = date('now'),
  points_streak_days = 5,
  user_tier = 'premium'
WHERE username = 'alexbrands';

UPDATE users SET 
  points_balance = 3400,
  keys_balance = 22,
  gems_balance = 98.0,
  gold_collected = 4,
  last_activity_date = date('now', '-2 days'),
  points_streak_days = 0,
  user_tier = 'premium'
WHERE username = 'zoedance';

-- Add more demo users with diverse profiles
INSERT INTO users (
  mocha_user_id, email, username, display_name, bio, avatar_url, banner_url, website_url, social_links,
  user_type, user_tier, points_balance, keys_balance, gems_balance, gold_collected,
  xp_points, level, follower_count, following_count, total_earnings_usd,
  points_streak_days, last_activity_date, referral_code
) VALUES 
-- Tech influencer with super tier
('demo_user_6', 'tech@example.com', 'techguru', 'David Tech', 
 'Software engineer turned tech reviewer. Sharing the latest in AI, gadgets, and coding tutorials. Building the future, one line at a time! 👨‍💻🚀',
 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=300&fit=crop',
 'https://techguru.dev',
 '{"youtube":"TechGuruDavid","twitter":"@techguru","linkedin":"david-tech-guru","github":"techguru"}',
 'regular', 'super', 8500, 42, 189.5, 12,
 6780, 8, 3400, 2100, 3890.75, 21, date('now'), 'TECH303'),

-- Fashion influencer with premium tier
('demo_user_7', 'fashion@example.com', 'fashionista', 'Luna Style', 
 'Fashion stylist and sustainable fashion advocate. Curating timeless looks and promoting ethical fashion choices. Style with purpose! 👗🌱',
 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=400',
 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&h=300&fit=crop',
 'https://lunastyle.fashion',
 '{"instagram":"@lunastyle","pinterest":"lunastylefashion","tiktok":"@lunastyle","blog":"lunastyle.fashion"}',
 'regular', 'premium', 5200, 28, 134.0, 6,
 4560, 6, 2890, 1650, 2456.30, 14, date('now'), 'LUNA404'),

-- Gaming content creator with super tier
('demo_user_8', 'gaming@example.com', 'gamerpro', 'Jake Gaming', 
 'Professional esports player and content creator. Streaming daily, sharing gaming tips, and building the ultimate gaming community! 🎮🏆',
 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=300&fit=crop',
 'https://jakegaming.gg',
 '{"twitch":"jakegamingpro","youtube":"JakeGamingPro","discord":"JakeGaming#1234","steam":"jakegamingpro"}',
 'regular', 'super', 9200, 48, 205.0, 15,
 7234, 9, 4500, 3200, 4567.85, 28, date('now'), 'JAKE505'),

-- Food content creator with free tier (new user)
('demo_user_9', 'food@example.com', 'foodielove', 'Maria Cuisine', 
 'Home chef and food blogger sharing family recipes and cooking tips. Bringing love to every dish, one recipe at a time! 👩‍🍳❤️',
 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400',
 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=300&fit=crop',
 'https://mariacuisine.blog',
 '{"instagram":"@foodielove","youtube":"MariaCuisine","pinterest":"mariacuisine","facebook":"MariaCuisineOfficial"}',
 'regular', 'free', 850, 3, 12.5, 0,
 1200, 2, 340, 180, 125.40, 4, date('now', '-1 day'), 'MARIA606'),

-- Business/entrepreneurship advertiser with premium tier
('demo_user_10', 'business@example.com', 'bizboss', 'Robert Enterprise', 
 'Serial entrepreneur and business coach. Helping startups scale and achieve sustainable growth. Building empires, one venture at a time! 💼📈',
 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=300&fit=crop',
 'https://robertenterprise.com',
 '{"linkedin":"robert-enterprise","twitter":"@bizboss","medium":"@bizboss","youtube":"RobertEnterprise"}',
 'advertiser', 'premium', 3800, 19, 156.0, 7,
 3890, 5, 1890, 2340, 2890.60, 9, date('now'), 'ROB707');
