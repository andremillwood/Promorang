
-- Add realistic drop applications with properly escaped quotes
INSERT INTO drop_applications (drop_id, user_id, status, application_message, gems_earned, applied_at, completed_at)
SELECT d.id, u.id, 'completed', 
  'I would love to create authentic content for this project! I have experience with similar tools and can provide honest, detailed feedback.',
  25.0, datetime('now', '-2 days'), datetime('now', '-1 day')
FROM drops d 
JOIN users u ON u.username = 'sarahcreates'
WHERE d.title LIKE '%Fashion Brand%'
UNION ALL
SELECT d.id, u.id, 'approved', 
  'Excited to participate! I will create engaging content that showcases the product features and benefits to my gaming audience.',
  0.0, datetime('now', '-1 day'), NULL
FROM drops d 
JOIN users u ON u.username = 'gamerpro'
WHERE d.title LIKE '%Tech Review%'
UNION ALL
SELECT d.id, u.id, 'pending', 
  'This aligns perfectly with my content style. I can create professional review content that highlights key features and use cases.',
  0.0, datetime('now', '-6 hours'), NULL
FROM drops d 
JOIN users u ON u.username = 'techguru'
WHERE d.title LIKE '%Gaming Tournament%'
UNION ALL
SELECT d.id, u.id, 'completed', 
  'Perfect fit for my wellness content! I will document the entire journey with before/after comparisons and honest progress updates.',
  35.0, datetime('now', '-3 days'), datetime('now', '-1 day')
FROM drops d 
JOIN users u ON u.username = 'emmafitness'
WHERE d.title LIKE '%Fitness Challenge%';

-- Add recent points transactions showing various activities
INSERT INTO points_transactions (user_id, action_type, points_earned, base_points, multiplier, user_level, reference_type, created_at)
SELECT u.id, 'share', 25, 15, 1.5, u.user_tier, 'content_share', datetime('now', '-2 hours')
FROM users u WHERE u.username = 'sarahcreates'
UNION ALL
SELECT u.id, 'external_move', 50, 30, 2.0, u.user_tier, 'external_action', datetime('now', '-4 hours')
FROM users u WHERE u.username = 'techguru'
UNION ALL
SELECT u.id, 'registration', 100, 100, 1.0, u.user_tier, 'signup', datetime('now', '-1 day')
FROM users u WHERE u.username = 'foodielove'
UNION ALL
SELECT u.id, 'share', 30, 15, 2.0, u.user_tier, 'content_share', datetime('now', '-6 hours')
FROM users u WHERE u.username = 'gamerpro'
UNION ALL
SELECT u.id, 'external_move', 40, 20, 2.0, u.user_tier, 'external_action', datetime('now', '-1 day')
FROM users u WHERE u.username = 'fashionista'
UNION ALL
SELECT u.id, 'share', 15, 15, 1.0, u.user_tier, 'content_share', datetime('now', '-8 hours')
FROM users u WHERE u.username = 'foodielove'
UNION ALL
SELECT u.id, 'external_move', 60, 30, 2.0, u.user_tier, 'external_action', datetime('now', '-3 hours')
FROM users u WHERE u.username = 'mikeviral';

-- Add currency conversions showing active economy usage
INSERT INTO currency_conversions (user_id, from_currency, to_currency, from_amount, to_amount, conversion_rate, created_at)
SELECT u.id, 'points', 'keys', 1500, 3, 500, datetime('now', '-1 day')
FROM users u WHERE u.username = 'sarahcreates'
UNION ALL
SELECT u.id, 'gems', 'keys', 4, 2, 2, datetime('now', '-2 days')
FROM users u WHERE u.username = 'techguru'
UNION ALL
SELECT u.id, 'points', 'keys', 1000, 2, 500, datetime('now', '-3 hours')
FROM users u WHERE u.username = 'gamerpro';
