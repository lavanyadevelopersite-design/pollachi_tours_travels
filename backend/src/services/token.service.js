const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const dayjs = require('dayjs');
const jwtConfig = require('../config/jwt');
const { RefreshToken, TokenBlacklist } = require('../models');
const AppError = require('../utils/AppError');

const getLoginHistoryService = () => require('./loginHistory.service');

const generateAccessToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role_id: user.role_id,
    },
    jwtConfig.accessSecret,
    { expiresIn: jwtConfig.accessExpiry }
  );

const generateRefreshToken = (user, rememberMe = false) => {
  const expiresIn = rememberMe ? jwtConfig.refreshRememberExpiry : jwtConfig.refreshExpiry;
  return jwt.sign({ sub: user.id, type: 'refresh' }, jwtConfig.refreshSecret, { expiresIn });
};

const getRefreshExpiryDate = (rememberMe = false) => {
  const expiry = rememberMe ? jwtConfig.refreshRememberExpiry : jwtConfig.refreshExpiry;
  const match = expiry.match(/^(\d+)([dhms])$/);
  if (!match) return dayjs().add(7, 'day').toDate();
  const [, amount, unit] = match;
  const unitMap = { d: 'day', h: 'hour', m: 'minute', s: 'second' };
  return dayjs().add(parseInt(amount, 10), unitMap[unit]).toDate();
};

const saveRefreshToken = async (userId, token, meta = {}) => {
  const { rememberMe = false, ipAddress = null, userAgent = null } = meta;
  return RefreshToken.create({
    user_id: userId,
    token,
    expires_at: getRefreshExpiryDate(rememberMe),
    ip_address: ipAddress,
    user_agent: userAgent,
  });
};

const rotateRefreshToken = async (oldToken, user, meta = {}) => {
  const stored = await RefreshToken.findOne({ where: { token: oldToken } });
  if (!stored || stored.is_revoked) {
    throw new AppError('Invalid refresh token', 401);
  }
  if (dayjs(stored.expires_at).isBefore(dayjs())) {
    throw new AppError('Refresh token expired', 401);
  }

  const newToken = generateRefreshToken(user, meta.rememberMe);
  await stored.update({ is_revoked: true, replaced_by: newToken });
  const newRecord = await saveRefreshToken(user.id, newToken, meta);
  await getLoginHistoryService().linkRefreshToken(stored.id, newRecord.id);
  return newToken;
};

const revokeRefreshToken = async (token, options = {}) => {
  const { endSession = false, reason = 'logout' } = options;
  const stored = await RefreshToken.findOne({ where: { token } });
  if (stored) {
    await stored.update({ is_revoked: true });
    if (endSession) {
      await getLoginHistoryService().endSessionByRefreshToken(token, reason);
    }
  }
};

const revokeAllUserRefreshTokens = async (userId) => {
  await RefreshToken.update(
    { is_revoked: true },
    { where: { user_id: userId, is_revoked: false } }
  );
  await getLoginHistoryService().endOpenSessionsForUser(userId, 'force');
};

const blacklistToken = async (token, userId, expiresAt, reason = 'logout') => {
  await TokenBlacklist.findOrCreate({
    where: { token },
    defaults: {
      user_id: userId,
      expires_at: expiresAt || dayjs().add(1, 'day').toDate(),
      reason,
    },
  });
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.refreshSecret);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }
};

const generateResetToken = () => crypto.randomBytes(32).toString('hex');

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
  blacklistToken,
  verifyRefreshToken,
  generateResetToken,
  getRefreshExpiryDate,
};
