
-- Create wallets for all demo users
INSERT INTO wallets (user_id, currency_type, balance) VALUES
-- Andre Millwood wallets
(1, 'USD', 1250.75),
(1, 'PromoGem', 280.0),

-- David Tech wallets  
(12, 'USD', 2850.50),
(12, 'PromoGem', 450.0),

-- Luna Style wallets
(13, 'USD', 1850.25), 
(13, 'PromoGem', 320.0),

-- Jake Gaming wallets
(14, 'USD', 4250.80),
(14, 'PromoGem', 580.0),

-- Emma Wilson wallets
(15, 'USD', 1420.60),
(15, 'PromoGem', 285.0),

-- Robert Enterprise wallets
(16, 'USD', 5850.40),
(16, 'PromoGem', 520.0),

-- Sarah Chen wallets
(17, 'USD', 2250.90),
(17, 'PromoGem', 340.0),

-- Mike Rodriguez wallets
(18, 'USD', 3150.75),
(18, 'PromoGem', 410.0),

-- Zoe Williams wallets
(19, 'USD', 425.30),
(19, 'PromoGem', 150.0);

-- Create sample content pieces for each user
INSERT INTO content_pieces (creator_id, platform, platform_url, title, description, media_url, total_shares, available_shares, share_price) VALUES
-- David Tech content
(12, 'YouTube', 'https://youtube.com/watch?v=tech123', 'iPhone 15 Pro Deep Dive Review', 'Complete analysis of Apple''s latest flagship including performance benchmarks, camera tests, and real-world usage scenarios.', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop', 200, 120, 15.50),
(12, 'Twitter', 'https://twitter.com/davidtech/status/123', 'AI Tools That Will Change Your Workflow', 'Thread breaking down 10 AI productivity tools that developers and creators need to know about in 2024.', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop', 150, 90, 8.75),

-- Luna Style content
(13, 'Instagram', 'https://instagram.com/p/lunastyle123', 'Capsule Wardrobe Essentials', 'Building a timeless capsule wardrobe with 15 key pieces that work for any season. Sustainable fashion meets everyday elegance.', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=600&fit=crop', 300, 180, 12.25),
(13, 'TikTok', 'https://tiktok.com/@lunastyle/video/456', 'Thrift Flip Challenge', 'Transforming thrift store finds into runway-ready looks on a $50 budget. Sustainable fashion has never looked so chic!', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&h=600&fit=crop', 250, 125, 9.99),

-- Jake Gaming content
(14, 'Twitch', 'https://twitch.tv/jakegaming/clip/789', 'Clutch Victory in Championship Finals', 'Epic 1v4 clutch that secured our team the championship title. Breaking down the strategy and execution.', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop', 500, 300, 25.00),
(14, 'YouTube', 'https://youtube.com/watch?v=gaming456', 'Ultimate Gaming Setup Guide 2024', 'Complete guide to building the perfect gaming setup from budget builds to high-end rigs. Hardware reviews and optimization tips.', 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&h=600&fit=crop', 400, 240, 18.50),

-- Sarah Chen content
(17, 'Instagram', 'https://instagram.com/p/sarahfood789', '30-Minute Ramen Challenge', 'Creating restaurant-quality ramen at home in just 30 minutes. Secret ingredients and techniques revealed!', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop', 350, 210, 14.75),
(17, 'TikTok', 'https://tiktok.com/@sarahcooks/video/101112', 'Street Food Tour: Bangkok Edition', 'Exploring the best street food vendors in Bangkok. Authentic flavors and hidden gems you need to try!', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop', 280, 168, 11.50);

-- Create sample drops from advertiser accounts
INSERT INTO drops (creator_id, title, description, drop_type, difficulty, key_cost, gem_reward_base, gem_pool_total, gem_pool_remaining, follower_threshold, time_commitment, requirements, deliverables, is_proof_drop, is_paid_drop) VALUES
-- Jake Gaming drops (advertiser)
(14, 'Gaming Setup Showcase Challenge', 'Create content featuring your gaming setup and share your favorite peripherals. Perfect for tech and gaming creators!', 'ugc_creation', 'medium', 3, 150.0, 3000.0, 2850.0, 1000, '2-3 hours', 'Gaming setup, good lighting, decent camera/phone', 'High-quality photo or video of your setup with detailed breakdown', false, true),
(14, 'Stream Highlights Compilation', 'Create a highlights reel from your recent gaming streams. Show off your best plays and funny moments!', 'content_clipping', 'easy', 2, 75.0, 1500.0, 1425.0, 500, '1-2 hours', 'Recent gaming content, basic video editing skills', '30-60 second highlight compilation', false, true),

-- Mike Rodriguez drops (advertiser) 
(18, 'Fitness Transformation Story', 'Share your fitness journey and transformation story. Inspire others with your progress and tips!', 'ugc_creation', 'medium', 4, 200.0, 4000.0, 3600.0, 500, '3-4 hours', 'Before/after photos, workout routine details', 'Inspiring transformation post with actionable advice', false, true),
(18, 'Healthy Recipe Creation', 'Create and share a healthy recipe that supports fitness goals. Include nutritional information and prep tips.', 'content_clipping', 'easy', 2, 100.0, 2000.0, 1900.0, 100, '2 hours', 'Cooking skills, ingredients, camera for food photography', 'Recipe post with photos and detailed instructions', false, true),

-- Robert Enterprise drops (advertiser)
(16, 'Business Growth Case Study', 'Document a business challenge you''ve overcome and the strategies that led to success. Educational content for entrepreneurs.', 'ugc_creation', 'hard', 5, 300.0, 6000.0, 5700.0, 2000, '4-5 hours', 'Business experience, data/metrics to share, professional presentation', 'Detailed case study with actionable insights', false, true),
(16, 'LinkedIn Thought Leadership', 'Create engaging LinkedIn content about business trends, startup advice, or industry insights.', 'content_clipping', 'medium', 3, 175.0, 3500.0, 3325.0, 1000, '2-3 hours', 'LinkedIn account, business expertise, professional network', 'High-engagement LinkedIn post with meaningful discussion', false, true),

-- Andre Millwood drops (advertiser)
(1, 'Creator Economy Insights', 'Share your experience in the creator economy - challenges, opportunities, and advice for newcomers.', 'ugc_creation', 'medium', 3, 125.0, 2500.0, 2375.0, 500, '2-3 hours', 'Creator experience, authentic storytelling', 'Insightful post about creator economy trends', false, true);

-- Create some sample applications to show activity
INSERT INTO drop_applications (drop_id, user_id, application_message, status, gems_earned, applied_at, completed_at) VALUES
-- Applications to Jake Gaming's drops
(1, 12, 'I have an amazing RGB gaming setup with latest RTX 4090 and custom loop cooling. Would love to showcase it and share my component choices!', 'completed', 150.0, datetime('now', '-5 days'), datetime('now', '-2 days')),
(1, 17, 'My cozy gaming corner setup focuses on comfort and functionality. Perfect for long streaming sessions with ergonomic considerations.', 'pending', 0.0, datetime('now', '-3 days'), null),
(2, 13, 'I have tons of hilarious moments from my recent streams. Great at video editing and creating engaging highlight reels.', 'approved', 75.0, datetime('now', '-4 days'), datetime('now', '-1 day')),

-- Applications to Mike Rodriguez's drops  
(3, 15, 'Lost 30 pounds this year through consistent training and nutrition changes. Have detailed progress photos and workout logs to share.', 'completed', 200.0, datetime('now', '-6 days'), datetime('now', '-3 days')),
(4, 17, 'Love creating healthy Asian-fusion recipes that are both nutritious and delicious. Can provide detailed macro breakdowns.', 'approved', 100.0, datetime('now', '-2 days'), null),

-- Applications to Robert Enterprise's drops
(5, 14, 'Grew my gaming channel from 0 to 45k followers in 18 months. Have detailed analytics and growth strategies to share.', 'pending', 0.0, datetime('now', '-1 day'), null),
(6, 12, 'Active on LinkedIn with strong engagement on tech industry posts. Have experience creating viral business content.', 'completed', 175.0, datetime('now', '-7 days'), datetime('now', '-4 days'));
