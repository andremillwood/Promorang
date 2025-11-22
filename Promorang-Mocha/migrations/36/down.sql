
-- Drop indexes
DROP INDEX IF EXISTS idx_user_saved_content_user;
DROP INDEX IF EXISTS idx_user_content_likes_content;
DROP INDEX IF EXISTS idx_content_comments_parent;
DROP INDEX IF EXISTS idx_content_comments_user_id;
DROP INDEX IF EXISTS idx_content_comments_content_id;

-- Drop tables
DROP TABLE IF EXISTS user_saved_content;
DROP TABLE IF EXISTS user_content_likes;
DROP TABLE IF EXISTS content_comments;
