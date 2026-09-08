const rateLimit = require('express-rate-limit');

const skipHealth = (req) => {
  const path = req.path || '';
  return path === '/health' || path === '/docs' || path === '/docs.json' || path.startsWith('/docs/');
};

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipHealth,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    data: null,
    errors: null,
    pagination: null,
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    data: null,
    errors: null,
    pagination: null,
  },
});

module.exports = { globalLimiter, authLimiter };
