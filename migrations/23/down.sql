
-- Drop new tables
DROP INDEX idx_user_engagement_shares_content_id;
DROP INDEX idx_user_engagement_shares_user_id;
DROP TABLE content_funding;
DROP TABLE content_tips;
DROP TABLE user_engagement_shares;

-- Remove engagement shares columns from content_pieces table
ALTER TABLE content_pieces DROP COLUMN engagement_shares_remaining;
ALTER TABLE content_pieces DROP COLUMN engagement_shares_total;
