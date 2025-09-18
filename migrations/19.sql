
CREATE TABLE user_payment_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  payment_method TEXT NOT NULL, -- 'crypto', 'paypal', 'payoneer', 'bank_account', 'cheque', 'western_union'
  is_default BOOLEAN DEFAULT FALSE,
  preference_data TEXT NOT NULL, -- JSON data for payment details
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE withdrawal_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  fee_amount REAL NOT NULL,
  net_amount REAL NOT NULL,
  payment_method TEXT NOT NULL,
  payment_details TEXT NOT NULL, -- JSON data
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'rejected', 'cancelled'
  admin_notes TEXT,
  processed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE withdrawal_methods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  method_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  min_amount REAL DEFAULT 200.0,
  fee_percentage REAL DEFAULT 2.5,
  processing_time TEXT DEFAULT '3-5 business days',
  is_active BOOLEAN DEFAULT TRUE,
  required_fields TEXT NOT NULL, -- JSON array of required field names
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_payment_preferences_user_id ON user_payment_preferences(user_id);
CREATE INDEX idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status);
