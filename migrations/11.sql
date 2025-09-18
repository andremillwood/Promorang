
-- Add diverse content pieces with properly escaped quotes
INSERT INTO content_pieces (creator_id, platform, platform_url, title, description, media_url, total_shares, available_shares, share_price)
SELECT u.id, 'Instagram', 'https://instagram.com/p/demo1', 
  'AI Revolution: 5 Tools Changing Everything', 
  'Deep dive into the latest AI tools that are transforming how we work and create. From ChatGPT to Midjourney - here''s what you need to know!',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600',
  100, 45, 2.50
FROM users u WHERE u.username = 'techguru'
UNION ALL
SELECT u.id, 'YouTube', 'https://youtube.com/watch?v=demo2', 
  'Sustainable Fashion: Building a Capsule Wardrobe', 
  'Learn how to create a timeless wardrobe with just 30 pieces. Sustainable, stylish, and budget-friendly tips included!',
  'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600',
  80, 32, 1.75
FROM users u WHERE u.username = 'fashionista'
UNION ALL
SELECT u.id, 'TikTok', 'https://tiktok.com/@demo3', 
  'Valorant Pro Tips: Rank Up Fast', 
  'Master these 10 advanced techniques to climb the ladder quickly. Perfect aim, perfect timing, perfect victory!',
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600',
  120, 58, 3.25
FROM users u WHERE u.username = 'gamerpro'
UNION ALL
SELECT u.id, 'Instagram', 'https://instagram.com/p/demo4', 
  'Morning Workout: 15-Minute HIIT', 
  'Start your day strong with this energizing HIIT routine. No equipment needed - just you and 15 minutes to greatness!',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',
  60, 28, 1.50
FROM users u WHERE u.username = 'emmafitness'
UNION ALL
SELECT u.id, 'LinkedIn', 'https://linkedin.com/posts/demo5', 
  'Growth Hacking: 0 to 100K Users', 
  'The exact strategies we used to scale our startup from zero to 100,000 users in 6 months. Real numbers, real tactics.',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600',
  90, 41, 4.00
FROM users u WHERE u.username = 'bizboss';

-- Add active drops from advertisers
INSERT INTO drops (creator_id, title, description, drop_type, difficulty, key_cost, gem_reward_base, gem_pool_total, gem_pool_remaining, is_proof_drop, is_paid_drop, platform, content_url)
SELECT u.id, 
  'Create Tech Review Video',
  'We need authentic reviews of our new AI productivity tool. Share your honest experience and help others discover how AI can transform their workflow!',
  'ugc_creation', 'medium', 2, 45.0, 450.0, 380.0, FALSE, TRUE, 'YouTube', 'https://productai.demo'
FROM users u WHERE u.username = 'mikeviral'
UNION ALL
SELECT u.id,
  'Fashion Brand Collaboration',
  'Looking for fashion influencers to showcase our sustainable clothing line. Create styling content that highlights eco-friendly fashion choices.',
  'content_clipping', 'easy', 1, 25.0, 250.0, 200.0, FALSE, TRUE, 'Instagram', 'https://ecofashion.demo'
FROM users u WHERE u.username = 'bizboss'
UNION ALL
SELECT u.id,
  'Gaming Tournament Highlights',
  'Capture epic moments from our upcoming esports tournament. Create highlight reels that showcase the best plays and most exciting moments!',
  'ugc_creation', 'hard', 3, 75.0, 750.0, 675.0, FALSE, TRUE, 'TikTok', 'https://esports.demo'
FROM users u WHERE u.username = 'mikeviral'
UNION ALL
SELECT u.id,
  'Fitness Challenge Documentation',
  'Document your 30-day fitness transformation using our workout app. Share your journey, struggles, and victories to inspire others!',
  'reviews', 'medium', 2, 35.0, 350.0, 315.0, FALSE, TRUE, 'Instagram', 'https://fitnessapp.demo'
FROM users u WHERE u.username = 'bizboss'
UNION ALL
SELECT u.id,
  'Business Tool Review (Proof Drop)',
  'Quick proof drop: Test our project management tool and share a 60-second review. Great for building your master key progress!',
  'reviews', 'easy', 0, 0.0, 0.0, 0.0, TRUE, FALSE, 'LinkedIn', 'https://projecttool.demo'
FROM users u WHERE u.username = 'mikeviral';
