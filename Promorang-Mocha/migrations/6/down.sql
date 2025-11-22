
DROP INDEX idx_sponsored_content_advertiser;
DROP INDEX idx_move_transactions_user_date;
DROP INDEX idx_advertiser_inventory_advertiser_period;
DROP TABLE sponsored_content;
DROP TABLE move_transactions;
DROP TABLE advertiser_inventory;
ALTER TABLE drops DROP COLUMN is_paid_drop;
ALTER TABLE drops DROP COLUMN is_proof_drop;
ALTER TABLE drops DROP COLUMN key_reward_amount;
ALTER TABLE drops DROP COLUMN move_cost_points;
