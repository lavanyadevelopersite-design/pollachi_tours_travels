require('dotenv').config();

module.exports = {
  accessSecret: process.env.JWT_ACCESS_SECRET || 'change_me_access_secret_min_32_chars',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'change_me_refresh_secret_min_32_chars',
  accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  refreshRememberExpiry: process.env.JWT_REFRESH_REMEMBER_EXPIRY || '30d',
  sessionInactiveTimeoutMinutes: parseInt(process.env.SESSION_INACTIVE_TIMEOUT_MINUTES, 10) || 30,
};
