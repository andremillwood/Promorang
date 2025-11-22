
-- Add some social connections for users
INSERT INTO social_connections (user_id, platform, platform_username, follower_count, verified_at) VALUES
-- Andre Millwood connections
(1, 'twitter', '@andremillwood', 2850, datetime('now', '-15 days')),
(1, 'instagram', '@andremillwood', 1200, datetime('now', '-12 days')),
(1, 'linkedin', 'andre-millwood', 4500, datetime('now', '-10 days')),

-- David Tech connections
(12, 'twitter', '@davidtech', 8500, datetime('now', '-20 days')),
(12, 'youtube', '@davidtechreviews', 25000, datetime('now', '-18 days')),
(12, 'github', 'davidtech', 1250, datetime('now', '-22 days')),

-- Luna Style connections
(13, 'instagram', '@lunastyle', 15200, datetime('now', '-25 days')),
(13, 'pinterest', 'lunastyleguide', 3500, datetime('now', '-20 days')),
(13, 'tiktok', '@lunastyle', 8900, datetime('now', '-15 days')),

-- Jake Gaming connections
(14, 'twitch', 'jakegaming', 45000, datetime('now', '-30 days')),
(14, 'youtube', '@jakegaming', 35000, datetime('now', '-28 days')),
(14, 'discord', 'JakeGaming#1337', 12000, datetime('now', '-25 days')),

-- Emma Wilson connections
(15, 'instagram', '@emmawellness', 9800, datetime('now', '-20 days')),
(15, 'youtube', '@emmawilson', 5500, datetime('now', '-18 days')),
(15, 'linkedin', 'emma-wilson-wellness', 3200, datetime('now', '-15 days')),

-- Sarah Chen connections
(17, 'instagram', '@sarahchenfoods', 18500, datetime('now', '-22 days')),
(17, 'tiktok', '@sarahcooks', 12000, datetime('now', '-20 days')),
(17, 'youtube', '@sarahchenkitchen', 7800, datetime('now', '-18 days'));

-- Add Instagram registrations for verification system demo
INSERT INTO instagram_registrations (user_id, instagram_username, dm_verified_at, last_points_granted_at, status) VALUES
(1, '@andremillwood', datetime('now', '-10 days'), date('now', 'start of month'), 'verified'),
(13, '@lunastyle', datetime('now', '-15 days'), date('now', 'start of month'), 'verified'),
(15, '@emmawellness', datetime('now', '-12 days'), date('now', 'start of month'), 'verified'),
(17, '@sarahchenfoods', datetime('now', '-18 days'), date('now', 'start of month'), 'verified'),
(19, '@zoecreatestudio', null, null, 'pending');

-- Add some social bets to showcase betting feature
INSERT INTO social_bets (creator_id, platform, content_url, bet_type, target_value, current_value, odds, pool_size, expires_at, status) VALUES
-- Jake Gaming betting on his own stream performance
(14, 'Twitch', 'https://twitch.tv/jakegaming', 'viewers', 5000, 3200, 2.5, 850.50, datetime('now', '+3 days'), 'active'),
-- David Tech betting on video performance  
(12, 'YouTube', 'https://youtube.com/watch?v=tech123', 'views', 100000, 75000, 1.8, 1200.75, datetime('now', '+5 days'), 'active'),
-- Luna Style betting on engagement
(13, 'Instagram', 'https://instagram.com/p/lunastyle123', 'likes', 10000, 8500, 1.5, 950.25, datetime('now', '+2 days'), 'active');

-- Add bet participations to show activity
INSERT INTO bet_participations (bet_id, user_id, bet_amount, bet_side, potential_payout, status) VALUES
-- Various users betting on Jake's stream
(1, 12, 100.00, 'over', 250.00, 'active'),
(1, 15, 50.00, 'under', 75.00, 'active'),
(1, 17, 75.00, 'over', 187.50, 'active'),

-- Users betting on David's video
(2, 13, 150.00, 'over', 270.00, 'active'),
(2, 18, 200.00, 'over', 360.00, 'active'),
(2, 19, 25.00, 'under', 31.25, 'active'),

-- Users betting on Luna's post
(3, 14, 300.00, 'over', 450.00, 'active'),
(3, 16, 250.00, 'over', 375.00, 'active'),
(3, 1, 100.00, 'over', 150.00, 'active');

-- Add some sample transactions for wallet activity
INSERT INTO transactions (user_id, transaction_type, amount, currency_type, status, reference_type, description) VALUES
-- Andre Millwood transactions
(1, 'deposit', 500.00, 'USD', 'completed', 'bank_transfer', 'Account funding'),
(1, 'withdrawal', -125.50, 'USD', 'completed', 'payout', 'Content earnings payout'),
(1, 'deposit', -100.00, 'USD', 'completed', 'bet', 'Bet over on Luna Style post'),

-- David Tech transactions  
(12, 'deposit', 1000.00, 'USD', 'completed', 'bank_transfer', 'Account funding'),
(12, 'deposit', -100.00, 'USD', 'completed', 'bet', 'Bet over on Jake Gaming stream'),
(12, 'deposit', 250.00, 'USD', 'completed', 'content_sale', 'Content investment returns'),

-- Jake Gaming transactions
(14, 'deposit', 2000.00, 'USD', 'completed', 'bank_transfer', 'Sponsorship payment'),
(14, 'deposit', -300.00, 'USD', 'completed', 'bet', 'Bet over on Luna Style post'),
(14, 'withdrawal', -500.00, 'USD', 'completed', 'payout', 'Monthly earnings withdrawal'),

-- Emma Wilson transactions
(15, 'deposit', 750.00, 'USD', 'completed', 'content_sale', 'Content share dividends'),
(15, 'deposit', -50.00, 'USD', 'completed', 'bet', 'Bet under on Jake Gaming stream'),

-- Robert Enterprise transactions
(16, 'deposit', 3000.00, 'USD', 'completed', 'bank_transfer', 'Business account funding'),
(16, 'deposit', -250.00, 'USD', 'completed', 'bet', 'Bet over on Luna Style post'),
(16, 'withdrawal', -1000.00, 'USD', 'completed', 'payout', 'Quarterly withdrawal'),

-- Sarah Chen transactions
(17, 'deposit', 800.00, 'USD', 'completed', 'content_sale', 'Recipe content licensing'),
(17, 'deposit', -75.00, 'USD', 'completed', 'bet', 'Bet over on Jake Gaming stream'),

-- Mike Rodriguez transactions
(18, 'deposit', 1500.00, 'USD', 'completed', 'bank_transfer', 'Client payment'),
(18, 'deposit', -200.00, 'USD', 'completed', 'bet', 'Bet over on David Tech video'),

-- Zoe Williams transactions
(19, 'deposit', 200.00, 'USD', 'completed', 'freelance', 'Design project payment'),
(19, 'deposit', -25.00, 'USD', 'completed', 'bet', 'Bet under on David Tech video');

-- Add some user level upgrades to show progression
INSERT INTO user_level_upgrades (user_id, from_tier, to_tier, cost_type, cost_amount) VALUES
(1, 'free', 'premium', 'points', 10000),
(12, 'premium', 'super', 'gems', 75),
(13, 'free', 'premium', 'points', 10000),
(14, 'premium', 'super', 'points', 15000),
(15, 'free', 'premium', 'gems', 50),
(16, 'premium', 'super', 'points', 15000),
(17, 'free', 'premium', 'gems', 50),
(18, 'free', 'premium', 'points', 10000);

-- Add some content investments to show sharing economy
INSERT INTO content_investments (content_id, investor_id, shares_owned, purchase_price, total_dividends) VALUES
-- Investments in David Tech content
(1, 13, 25, 15.50, 125.75),  -- Luna invested in iPhone review
(1, 15, 15, 15.50, 78.50),   -- Emma invested in iPhone review
(1, 17, 10, 15.50, 52.25),   -- Sarah invested in iPhone review

-- Investments in Luna Style content  
(3, 12, 30, 12.25, 95.00),   -- David invested in capsule wardrobe
(3, 18, 20, 12.25, 65.50),   -- Mike invested in capsule wardrobe
(3, 19, 5, 12.25, 18.75),    -- Zoe invested in capsule wardrobe

-- Investments in Jake Gaming content
(5, 16, 50, 25.00, 380.25),  -- Robert invested in clutch victory
(5, 1, 20, 25.00, 152.50),   -- Andre invested in clutch victory
(5, 15, 15, 25.00, 114.75),  -- Emma invested in clutch victory

-- Investments in Sarah Chen content
(7, 13, 35, 14.75, 165.80),  -- Luna invested in ramen challenge
(7, 14, 25, 14.75, 118.50),  -- Jake invested in ramen challenge
(7, 18, 20, 14.75, 94.75);   -- Mike invested in ramen challenge
