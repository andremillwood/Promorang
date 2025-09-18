
DELETE FROM withdrawal_methods WHERE method_name IN (
  'crypto_bitcoin', 'crypto_ethereum', 'crypto_usdt', 'crypto_usdc',
  'paypal', 'payoneer', 'bank_account', 'cheque', 'western_union'
);
