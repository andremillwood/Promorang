
-- Update Andre Millwood's profile with comprehensive information
UPDATE users SET 
  username = 'andremillwood',
  bio = 'Entrepreneur and tech enthusiast building the future of social commerce. Passionate about connecting creators with brands and fostering authentic engagement in the digital space.',
  user_tier = 'premium',
  user_type = 'advertiser',
  points_balance = 15000,
  keys_balance = 45,
  gems_balance = 280.0,
  gold_collected = 12,
  level = 8,
  xp_points = 8500,
  follower_count = 2850,
  following_count = 385,
  total_earnings_usd = 1250.75,
  points_streak_days = 21,
  last_activity_date = date('now'),
  website_url = 'https://andremillwood.com',
  social_links = '{"twitter":"@andremillwood","instagram":"@andremillwood","linkedin":"andre-millwood"}',
  banner_url = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=400&fit=crop',
  updated_at = CURRENT_TIMESTAMP
WHERE id = 1;

-- Create David Tech profile
INSERT INTO users (
  mocha_user_id, email, username, display_name, bio, user_tier, user_type,
  points_balance, keys_balance, gems_balance, gold_collected, level, xp_points,
  follower_count, following_count, total_earnings_usd, points_streak_days,
  last_activity_date, website_url, social_links, referral_code,
  avatar_url, banner_url
) VALUES (
  'demo_david_tech_001', 'david@techreviews.com', 'davidtech',
  'David Tech', 'Senior Software Engineer and tech reviewer. I break down complex technology for everyday users. Specialized in mobile apps, AI, and emerging tech trends.',
  'super', 'regular', 25000, 75, 450.0, 28, 12, 12500,
  8500, 1250, 2850.50, 45, date('now'),
  'https://davidtech.dev', '{"twitter":"@davidtech","youtube":"@davidtechreviews","github":"davidtech"}',
  'DTECH01',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=400&fit=crop'
);

-- Create Luna Style profile  
INSERT INTO users (
  mocha_user_id, email, username, display_name, bio, user_tier, user_type,
  points_balance, keys_balance, gems_balance, gold_collected, level, xp_points,
  follower_count, following_count, total_earnings_usd, points_streak_days,
  last_activity_date, website_url, social_links, referral_code,
  avatar_url, banner_url
) VALUES (
  'demo_luna_style_001', 'luna@styleguide.com', 'lunastyle',
  'Luna Style', 'Fashion influencer and style consultant. Creating affordable luxury looks and sustainable fashion content. Your go-to for timeless elegance meets modern trends.',
  'premium', 'regular', 18500, 62, 320.0, 18, 9, 9200,
  15200, 890, 1850.25, 32, date('now'),
  'https://lunastyle.co', '{"instagram":"@lunastyle","pinterest":"lunastyleguide","tiktok":"@lunastyle"}',
  'LUNA02',
  'https://images.unsplash.com/photo-1494790108755-2616b612b1ef?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=400&fit=crop'
);

-- Create Jake Gaming profile
INSERT INTO users (
  mocha_user_id, email, username, display_name, bio, user_tier, user_type,
  points_balance, keys_balance, gems_balance, gold_collected, level, xp_points,
  follower_count, following_count, total_earnings_usd, points_streak_days,
  last_activity_date, website_url, social_links, referral_code,
  avatar_url, banner_url
) VALUES (
  'demo_jake_gaming_001', 'jake@gamercentral.com', 'jakegaming',
  'Jake Gaming', 'Pro gamer and content creator streaming the latest games. Specializing in competitive FPS and battle royale content. Building the ultimate gaming community!',
  'super', 'advertiser', 32000, 95, 580.0, 35, 15, 15800,
  45000, 2500, 4250.80, 67, date('now'),
  'https://jakegaming.tv', '{"twitch":"jakegaming","youtube":"@jakegaming","discord":"JakeGaming#1337"}',
  'JAKE03',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=400&fit=crop'
);

-- Create Emma Wilson profile
INSERT INTO users (
  mocha_user_id, email, username, display_name, bio, user_tier, user_type,
  points_balance, keys_balance, gems_balance, gold_collected, level, xp_points,
  follower_count, following_count, total_earnings_usd, points_streak_days,
  last_activity_date, website_url, social_links, referral_code,
  avatar_url, banner_url
) VALUES (
  'demo_emma_wilson_001', 'emma@wellnessjourney.com', 'emmawilson',
  'Emma Wilson', 'Wellness coach and mindfulness advocate. Sharing daily practices for mental health, fitness, and self-care. Let''s build healthier habits together! 🧘‍♀️',
  'premium', 'regular', 14200, 48, 285.0, 15, 7, 7500,
  9800, 1100, 1420.60, 28, date('now'),
  'https://emmawellness.com', '{"instagram":"@emmawellness","youtube":"@emmawilson","linkedin":"emma-wilson-wellness"}',
  'EMMA04',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop'
);

-- Create Robert Enterprise profile
INSERT INTO users (
  mocha_user_id, email, username, display_name, bio, user_tier, user_type,
  points_balance, keys_balance, gems_balance, gold_collected, level, xp_points,
  follower_count, following_count, total_earnings_usd, points_streak_days,
  last_activity_date, website_url, social_links, referral_code,
  avatar_url, banner_url
) VALUES (
  'demo_robert_enterprise_001', 'robert@bizstrategy.com', 'robertenterprise',
  'Robert Enterprise', 'Business strategist and entrepreneur mentor. Helping startups scale and established companies innovate. 20+ years in corporate strategy and growth.',
  'super', 'advertiser', 28500, 88, 520.0, 42, 14, 14200,
  12500, 3200, 5850.40, 52, date('now'),
  'https://robertenterprise.consulting', '{"linkedin":"robert-enterprise","twitter":"@robertbiz","medium":"@robertenterprise"}',
  'ROB05',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=400&fit=crop'
);

-- Create Sarah Chen profile
INSERT INTO users (
  mocha_user_id, email, username, display_name, bio, user_tier, user_type,
  points_balance, keys_balance, gems_balance, gold_collected, level, xp_points,
  follower_count, following_count, total_earnings_usd, points_streak_days,
  last_activity_date, website_url, social_links, referral_code,
  avatar_url, banner_url
) VALUES (
  'demo_sarah_chen_001', 'sarah@foodieadventures.com', 'sarahchen',
  'Sarah Chen', 'Food enthusiast and culinary artist. Exploring global cuisines and sharing easy recipes for busy professionals. From street food to fine dining! 🍜',
  'premium', 'regular', 16800, 56, 340.0, 22, 8, 8800,
  18500, 1850, 2250.90, 38, date('now'),
  'https://sarahcooks.com', '{"instagram":"@sarahchenfoods","tiktok":"@sarahcooks","youtube":"@sarahchenkitchen"}',
  'SARAH06',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=400&fit=crop'
);

-- Create Mike Rodriguez profile
INSERT INTO users (
  mocha_user_id, email, username, display_name, bio, user_tier, user_type,
  points_balance, keys_balance, gems_balance, gold_collected, level, xp_points,
  follower_count, following_count, total_earnings_usd, points_streak_days,
  last_activity_date, website_url, social_links, referral_code,
  avatar_url, banner_url
) VALUES (
  'demo_mike_rodriguez_001', 'mike@fitnesslife.com', 'mikerodriguez',
  'Mike Rodriguez', 'Personal trainer and fitness motivator. Transforming lives through strength training and nutrition. Your journey to a stronger you starts here! 💪',
  'premium', 'advertiser', 21500, 68, 410.0, 25, 11, 11200,
  25000, 1500, 3150.75, 41, date('now'),
  'https://mikefitnesscoach.com', '{"instagram":"@mikerodriguezfit","youtube":"@mikefitnesscoach","facebook":"MikeRodriguezFitness"}',
  'MIKE07',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=400&fit=crop'
);

-- Create Zoe Williams profile
INSERT INTO users (
  mocha_user_id, email, username, display_name, bio, user_tier, user_type,
  points_balance, keys_balance, gems_balance, gold_collected, level, xp_points,
  follower_count, following_count, total_earnings_usd, points_streak_days,
  last_activity_date, website_url, social_links, referral_code,
  avatar_url, banner_url
) VALUES (
  'demo_zoe_williams_001', 'zoe@creativestudio.com', 'zoewilliams',
  'Zoe Williams', 'Digital artist and creative director. Specializing in brand identity, illustration, and visual storytelling. Bringing ideas to life through design! 🎨',
  'free', 'regular', 8500, 28, 150.0, 8, 5, 5200,
  5200, 680, 425.30, 18, date('now'),
  'https://zoecreative.design', '{"behance":"zoewilliams","instagram":"@zoecreatestudio","dribbble":"zoewilliams"}',
  'ZOE08',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&h=400&fit=crop'
);
