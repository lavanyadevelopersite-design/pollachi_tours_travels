CREATE TABLE IF NOT EXISTS login_history (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  refresh_token_id CHAR(36) NULL,
  login_at DATETIME NOT NULL,
  logout_at DATETIME NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(500) NULL,
  device VARCHAR(50) NULL,
  logout_reason VARCHAR(50) NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_login_history_user_id (user_id),
  INDEX idx_login_history_login_at (login_at),
  INDEX idx_login_history_logout_at (logout_at),
  INDEX idx_login_history_refresh_token_id (refresh_token_id)
);
