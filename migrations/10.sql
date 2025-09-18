
-- Add advertiser inventory for current month and week
INSERT INTO advertiser_inventory (
  advertiser_id, period_type, period_start, period_end,
  moves_allocated, moves_used, proof_drops_allocated, proof_drops_used, paid_drops_allocated, paid_drops_used
)
SELECT u.id, 'monthly_sample', date('now', 'start of month'), date('now', 'start of month', '+1 month', '-1 day'),
  50, 12, 5, 2, 0, 0
FROM users u WHERE u.username = 'mikeviral' AND u.user_type = 'advertiser'
UNION ALL
SELECT u.id, 'weekly', date('now', 'weekday 0', '-6 days'), date('now', 'weekday 0'),
  500, 85, 25, 8, 15, 3
FROM users u WHERE u.username = 'mikeviral' AND u.user_type = 'advertiser'
UNION ALL
SELECT u.id, 'monthly_sample', date('now', 'start of month'), date('now', 'start of month', '+1 month', '-1 day'),
  50, 8, 5, 1, 0, 0
FROM users u WHERE u.username = 'bizboss' AND u.user_type = 'advertiser'
UNION ALL
SELECT u.id, 'weekly', date('now', 'weekday 0', '-6 days'), date('now', 'weekday 0'),
  200, 34, 15, 5, 8, 2
FROM users u WHERE u.username = 'bizboss' AND u.user_type = 'advertiser'
UNION ALL
SELECT u.id, 'monthly_sample', date('now', 'start of month'), date('now', 'start of month', '+1 month', '-1 day'),
  50, 15, 5, 3, 0, 0
FROM users u WHERE u.username = 'alexbrands' AND u.user_type = 'advertiser';

-- Add some external moves showing proof verification
INSERT INTO external_moves (user_id, move_type, content_platform, content_url, proof_url, proof_type, points_earned, keys_earned, verification_status, created_at)
SELECT u.id, 'share', 'Instagram', 'https://instagram.com/p/real_post_1', 
  'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400', 'screenshot', 100, 5, 'verified', datetime('now', '-2 hours')
FROM users u WHERE u.username = 'sarahcreates'
UNION ALL
SELECT u.id, 'comment', 'YouTube', 'https://youtube.com/watch?v=real_video_1', 
  'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400', 'screenshot', 60, 3, 'verified', datetime('now', '-4 hours')
FROM users u WHERE u.username = 'techguru'
UNION ALL
SELECT u.id, 'repost', 'TikTok', 'https://tiktok.com/@real_creator/video/1', 
  'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400', 'screenshot', 120, 6, 'pending', datetime('now', '-1 hour')
FROM users u WHERE u.username = 'gamerpro';

-- Add content shares showing sharing economy activity
INSERT INTO content_shares (user_id, content_id, platform, share_url, verified_shares, points_earned, created_at)
SELECT u.id, c.id, 'Twitter', 'https://twitter.com/user/status/demo1', 5, 25, datetime('now', '-3 hours')
FROM users u, content_pieces c
WHERE u.username = 'fashionista' AND c.title LIKE '%AI Revolution%'
UNION ALL
SELECT u.id, c.id, 'LinkedIn', 'https://linkedin.com/posts/user_demo2', 8, 40, datetime('now', '-6 hours')
FROM users u, content_pieces c
WHERE u.username = 'bizboss' AND c.title LIKE '%Sustainable Fashion%'
UNION ALL
SELECT u.id, c.id, 'Instagram', 'https://instagram.com/stories/user_demo3', 3, 15, datetime('now', '-1 day')
FROM users u, content_pieces c
WHERE u.username = 'emmafitness' AND c.title LIKE '%Growth Hacking%';

-- Update drop participation counts
UPDATE drops SET current_participants = current_participants + 1 
WHERE title LIKE '%Fashion Brand%' OR title LIKE '%Tech Review%' OR title LIKE '%Gaming Tournament%' OR title LIKE '%Fitness Challenge%';
