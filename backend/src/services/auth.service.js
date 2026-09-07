const dayjs = require('dayjs');
const { User, Role, Permission } = require('../models');
const AppError = require('../utils/AppError');
const { sanitizeUser } = require('../utils/helpers');
const tokenService = require('./token.service');
const emailService = require('./email.service');
const loginHistoryService = require('./loginHistory.service');

const getUserWithRole = async (where) =>
  User.findOne({
    where,
    include: [
      {
        model: Role,
        as: 'role',
        include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
      },
    ],
  });

const login = async ({ email, password, rememberMe = false }, meta = {}) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const user = await getUserWithRole({ email: normalizedEmail });
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  if (!user.is_active) {
    throw new AppError('Account is deactivated', 403);
  }

  const accessToken = tokenService.generateAccessToken(user);
  const refreshToken = tokenService.generateRefreshToken(user, rememberMe);
  const refreshRecord = await tokenService.saveRefreshToken(user.id, refreshToken, {
    rememberMe,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  await loginHistoryService.startSession({
    userId: user.id,
    refreshTokenId: refreshRecord.id,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  await user.update({
    last_login_at: new Date(),
    last_activity_at: new Date(),
  });

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
};

const logout = async (accessToken, refreshToken, userId, reason = 'logout') => {
  const logoutReason = reason === 'timeout' ? 'timeout' : 'logout';
  if (refreshToken) {
    await tokenService.revokeRefreshToken(refreshToken, { endSession: true, reason: logoutReason });
  } else if (userId) {
    await loginHistoryService.endOpenSessionsForUser(userId, logoutReason);
  }
  if (accessToken) {
    await tokenService.blacklistToken(accessToken, userId, dayjs().add(1, 'day').toDate(), logoutReason);
  }
  return true;
};

const refresh = async (refreshToken, meta = {}) => {
  const decoded = tokenService.verifyRefreshToken(refreshToken);
  const user = await getUserWithRole({ id: decoded.sub });
  if (!user || !user.is_active) {
    throw new AppError('User not found or inactive', 401);
  }

  const newRefreshToken = await tokenService.rotateRefreshToken(refreshToken, user, meta);
  const accessToken = tokenService.generateAccessToken(user);

  await user.update({ last_activity_at: new Date() });

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken: newRefreshToken,
  };
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return { message: 'If the email exists, a reset link has been sent' };
  }

  const resetToken = tokenService.generateResetToken();
  await user.update({
    reset_token: resetToken,
    reset_token_expires: dayjs().add(1, 'hour').toDate(),
  });

  await emailService.sendPasswordReset(user.email, resetToken);

  return { message: 'If the email exists, a reset link has been sent' };
};

const resetPassword = async ({ token, password }) => {
  const user = await User.findOne({ where: { reset_token: token } });
  if (!user || !user.reset_token_expires || dayjs(user.reset_token_expires).isBefore(dayjs())) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  await user.update({
    password,
    reset_token: null,
    reset_token_expires: null,
  });

  await tokenService.revokeAllUserRefreshTokens(user.id);
  return true;
};

const me = async (userId) => {
  const user = await getUserWithRole({ id: userId });
  if (!user) throw new AppError('User not found', 404);
  return sanitizeUser(user);
};

const updateProfile = async (userId, payload = {}) => {
  const user = await User.findByPk(userId);
  if (!user) throw new AppError('User not found', 404);

  const email = String(payload.email || '').trim().toLowerCase();
  const data = {
    first_name: String(payload.first_name || '').trim(),
    last_name: String(payload.last_name || '').trim(),
    email,
    phone: payload.phone ? String(payload.phone).trim() : null,
  };

  if (!data.first_name || !data.last_name) {
    throw new AppError('First name and last name are required', 400);
  }

  if (email !== user.email) {
    const existing = await User.findOne({ where: { email } });
    if (existing) throw new AppError('Email already registered', 409);
  }

  await user.update(data);
  const updated = await getUserWithRole({ id: userId });
  return sanitizeUser(updated);
};

const changePassword = async (userId, { current_password, new_password }) => {
  const user = await User.findByPk(userId);
  if (!user) throw new AppError('User not found', 404);

  if (!(await user.comparePassword(current_password))) {
    throw new AppError('Current password is incorrect', 400);
  }

  await user.update({ password: new_password });
  await tokenService.revokeAllUserRefreshTokens(user.id);
  return true;
};

module.exports = {
  login,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
  me,
  updateProfile,
  changePassword,
};
