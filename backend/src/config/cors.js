const cors = require('cors');

const stripSlash = (value) => String(value || '').trim().replace(/\/+$/, '');

const collectAllowedOrigins = () => {
  const raw = [process.env.CORS_ORIGIN, process.env.PUBLIC_APP_URL]
    .filter(Boolean)
    .join(',');
  const fallback = 'http://localhost:5173,http://localhost:5174';
  return (raw || fallback)
    .split(',')
    .map(stripSlash)
    .filter(Boolean);
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowed = collectAllowedOrigins();

    // curl, health checks, same-origin navigation without Origin
    if (!origin) {
      return callback(null, true);
    }

    const normalized = stripSlash(origin);
    if (allowed.includes('*') || allowed.includes(normalized)) {
      return callback(null, true);
    }

    const isLocalDev =
      /^http:\/\/localhost:\d+$/.test(normalized) ||
      /^http:\/\/127\.0\.0\.1:\d+$/.test(normalized);

    if (process.env.NODE_ENV !== 'production' && isLocalDev) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

module.exports = cors(corsOptions);
