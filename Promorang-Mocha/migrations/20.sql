
INSERT INTO withdrawal_methods (method_name, display_name, min_amount, fee_percentage, processing_time, required_fields) VALUES
('crypto_bitcoin', 'Bitcoin (BTC)', 200.0, 2.5, '1-3 business days', '["wallet_address", "network"]'),
('crypto_ethereum', 'Ethereum (ETH)', 200.0, 2.5, '1-3 business days', '["wallet_address", "network"]'),
('crypto_usdt', 'USDT (Tether)', 200.0, 2.5, '1-3 business days', '["wallet_address", "network"]'),
('crypto_usdc', 'USDC (USD Coin)', 200.0, 2.5, '1-3 business days', '["wallet_address", "network"]'),
('paypal', 'PayPal', 200.0, 2.5, '3-5 business days', '["email_address"]'),
('payoneer', 'Payoneer', 200.0, 2.5, '3-5 business days', '["email_address"]'),
('bank_account', 'Bank Transfer', 200.0, 2.5, '5-7 business days', '["account_holder_name", "bank_name", "account_number", "routing_number", "swift_code", "country"]'),
('cheque', 'Cheque', 200.0, 2.5, '7-14 business days', '["full_name", "address_line_1", "address_line_2", "city", "state", "postal_code", "country"]'),
('western_union', 'Western Union', 200.0, 2.5, '1-2 business days', '["full_name", "phone_number", "address_line_1", "city", "state", "postal_code", "country"]');
