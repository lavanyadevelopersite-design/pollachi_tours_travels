const cors = require('cors');

const corsOptions = {
  origin: (origin, callback) => {
    const allowed = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174')
      .split(',')
      .map((o) => o.trim());
    const publicApp = String(process.env.PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
    if (publicApp) allowed.push(publicApp);

    // Allow local Vite/dev ports when origin is localhost
    const isLocalDev =
      !origin ||
      /^http:\/\/localhost:\d+$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);

    if (allowed.includes('*') || allowed.includes(origin) || (process.env.NODE_ENV !== 'production' && isLocalDev)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

module.exports = cors(corsOptions);