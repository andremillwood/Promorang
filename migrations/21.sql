
-- Insert default withdrawal methods
INSERT OR IGNORE INTO withdrawal_methods (method_name, display_name, min_amount, fee_percentage, processing_time, is_active, required_fields) VALUES
('crypto_bitcoin', 'Bitcoin (BTC)', 200.0, 2.5, '1-3 business days', TRUE, '["wallet_address"]'),
('crypto_ethereum', 'Ethereum (ETH)', 200.0, 2.5, '1-3 business days', TRUE, '["wallet_address"]'),
('crypto_usdt', 'USDT (Tether)', 200.0, 2.5, '1-3 business days', TRUE, '["wallet_address", "network"]'),
('crypto_usdc', 'USDC (USD Coin)', 200.0, 2.5, '1-3 business days', TRUE, '["wallet_address", "network"]'),
('paypal', 'PayPal', 200.0, 2.5, '3-5 business days', TRUE, '["email"]'),
('payoneer', 'Payoneer', 200.0, 2.5, '3-7 business days', TRUE, '["email"]'),
('bank_account', 'Direct Bank Transfer', 200.0, 2.5, '5-7 business days', TRUE, '["bank_name", "account_number", "routing_number", "account_holder_name"]'),
('cheque', 'Physical Cheque', 500.0, 3.0, '10-14 business days', TRUE, '["full_name", "mailing_address", "city", "state", "postal_code", "country"]'),
('western_union', 'Western Union', 300.0, 3.5, '1-2 business days', TRUE, '["full_name", "phone_number", "country", "city"]');
