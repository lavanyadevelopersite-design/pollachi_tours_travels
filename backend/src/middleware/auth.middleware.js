const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { User, Role, Permission, TokenBlacklist } = require('../models');
const loginHistoryService = require('../services/loginHistory.service');

const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401);
  }

  const token = authHeader.split(' ')[1];

  const blacklisted = await TokenBlacklist.findOne({ where: { token } });
  if (blacklisted) {
    throw new AppError('Token has been revoked', 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, jwtConfig.accessSecret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Access token expired', 401);
    }
    throw new AppError('Invalid access token', 401);
  }

  const user = await User.findByPk(decoded.sub, {
    include: [
      {
        model: Role,
        as: 'role',
        include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
      },
    ],
  });

  if (!user || !user.is_active) {
    throw new AppError('User not found or inactive', 401);
  }

  if (user.last_activity_at) {
    const inactiveMs = Date.now() - new Date(user.last_activity_at).getTime();
    const timeoutMs = jwtConfig.sessionInactiveTimeoutMinutes * 60 * 1000;
    if (inactiveMs > timeoutMs) {
      await loginHistoryService.endOpenSessionsForUser(user.id, 'timeout');
      throw new AppError('Session timed out due to inactivity', 401);
    }
  }

  await user.update({ last_activity_at: new Date() });

  req.user = user;
  req.token = token;
  next();
});

const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  return authenticate(req, res, next);
});

module.exports = { authenticate, optionalAuth };
