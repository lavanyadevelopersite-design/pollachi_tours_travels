const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

const corsMiddleware = require('./config/cors');
const swaggerSpec = require('./config/swagger');
const { globalLimiter } = require('./middleware/rateLimiter.middleware');
const sanitize = require('./middleware/sanitize.middleware');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler.middleware');
const routes = require('./routes');

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    // Allow the Vite/SPA origin to embed uploaded images from this API host
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(corsMiddleware);
app.use(globalLimiter);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sanitize);

const detectImageContentType = (filePath) => {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(16);
    fs.readSync(fd, buf, 0, 16, 0);
    fs.closeSync(fd);
    if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
      return 'image/webp';
    }
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
      return 'image/png';
    }
    if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
      return 'image/jpeg';
    }
    if (buf.toString('ascii', 0, 3) === 'GIF') {
      return 'image/gif';
    }
  } catch {
    return null;
  }
  return null;
};

app.use(
  '/uploads',
  express.static(path.join(__dirname, '../uploads'), {
    setHeaders(res, filePath) {
      const contentType = detectImageContentType(filePath);
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      // Avoid browsers keeping a wrongly-typed cached logo forever
      res.setHeader('Cache-Control', 'public, max-age=300, must-revalidate');
    },
  })
);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));

app.get('/', (req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tours &amp; Travels CRM API</title>
  <style>
    body { font-family: Segoe UI, system-ui, sans-serif; margin: 0; min-height: 100vh; display: grid; place-items: center;
      background: linear-gradient(135deg, #1c232f, #3f4d67); color: #fff; }
    main { max-width: 28rem; padding: 2rem; text-align: center; }
    h1 { margin: 0 0 .5rem; font-size: 1.5rem; }
    p { margin: 0 0 1.25rem; opacity: .8; line-height: 1.5; }
    a { color: #04a9f5; margin: 0 .5rem; }
  </style>
</head>
<body>
  <main>
    <h1>Tours &amp; Travels CRM API</h1>
    <p>Backend is running. This host serves the API only — use the frontend app to sign in.</p>
    <p>
      <a href="/api/docs">API Docs</a>
      <a href="http://localhost:5173">Open App</a>
    </p>
  </main>
</body>
</html>`);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'tours-travels-crm-api' });
});

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
