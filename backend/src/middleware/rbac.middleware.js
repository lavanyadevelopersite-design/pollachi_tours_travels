const AppError = require('../utils/AppError');

const authorize = (...requiredPermissions) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  const role = req.user.role;
  if (!role) {
    return next(new AppError('No role assigned', 403));
  }

  if (role.code === 'super_admin') {
    return next();
  }

  const userPermissions = (role.permissions || []).map((p) => p.code);

  const hasPermission = requiredPermissions.some((perm) => userPermissions.includes(perm));
  if (!hasPermission) {
    return next(new AppError('Insufficient permissions', 403));
  }

  return next();
};

const authorizeAny = authorize;
const authorizeAll = (...requiredPermissions) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  const role = req.user.role;
  if (!role) {
    return next(new AppError('No role assigned', 403));
  }

  if (role.code === 'super_admin') {
    return next();
  }

  const userPermissions = (role.permissions || []).map((p) => p.code);
  const hasAll = requiredPermissions.every((perm) => userPermissions.includes(perm));

  if (!hasAll) {
    return next(new AppError('Insufficient permissions', 403));
  }

  return next();
};

module.exports = { authorize, authorizeAny, authorizeAll };
