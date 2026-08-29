const authService = require('../services/auth.service');
const masterService = require('../services/master.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body, {
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: req.body.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
  });
  res.json(
    ApiResponse.success('Login successful', {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    })
  );
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.body.refreshToken || req.cookies.refreshToken;
  await authService.logout(req.token, refreshToken, req.user?.id);
  res.clearCookie('refreshToken');
  res.json(ApiResponse.success('Logged out successfully'));
});

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.body.refreshToken || req.cookies.refreshToken;
  const result = await authService.refresh(refreshToken, {
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    rememberMe: req.body.rememberMe,
  });
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.json(
    ApiResponse.success('Token refreshed', {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    })
  );
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  res.json(ApiResponse.success(result.message));
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  res.json(ApiResponse.success('Password reset successful'));
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.me(req.user.id);
  res.json(ApiResponse.success('Profile retrieved', user));
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);
  res.json(ApiResponse.success('Profile updated', user));
});

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.id, req.body);
  res.json(ApiResponse.success('Password updated successfully'));
});

const branding = asyncHandler(async (req, res) => {
  const data = await masterService.getBranding();
  res.json(ApiResponse.success('Branding retrieved', data));
});

module.exports = { login, logout, refresh, forgotPassword, resetPassword, me, updateProfile, changePassword, branding };
