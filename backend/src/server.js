require('./config/loadEnv');

const { envPath, envFileName } = require('./config/loadEnv');
const runtimeStatus = require('./config/runtimeStatus');
const logger = require('./config/logger');

runtimeStatus.envPath = envPath;
runtimeStatus.envFileName = envFileName;

const PORT = parseInt(process.env.PORT, 10) || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const listen = (appInstance) => {
  const server = appInstance.listen(PORT, HOST, () => {
    logger.info(`Server running on ${HOST}:${PORT} [${process.env.NODE_ENV || 'development'}]`);
    logger.info(
      'Env file: %s',
      envFileName || 'none (using defaults — create backend/.env or backend/env on the VPS)'
    );
    logger.info(`Health check: http://127.0.0.1:${PORT}/api/health`);
  });

  server.on('error', (error) => {
    logger.error('HTTP server error: %s', error.message);
    process.exit(1);
  });

  return server;
};

const startMinimal = (message) => {
  const express = require('express');
  const app = express();
  const payload = {
    success: false,
    message,
    data: {
      status: 'error',
      database: 'down',
      envFile: envFileName,
    },
    errors: null,
    pagination: null,
  };
  app.get('/health', (req, res) => res.status(503).json(payload));
  app.get('/api/health', (req, res) => res.status(503).json(payload));
  app.use((req, res) => res.status(503).json(payload));
  listen(app);
};

const start = () => {
  try {
    require('mysql2');
  } catch (nativeError) {
    runtimeStatus.nativeModulesOk = false;
    runtimeStatus.nativeModuleError = nativeError.message;
    logger.error(
      'Native MySQL driver failed to load (%s). On the VPS run: cd backend && rm -rf node_modules && npm install --omit=dev',
      nativeError.message
    );
    startMinimal(
      'Windows node_modules were uploaded. On the VPS run: cd backend && rm -rf node_modules && npm install --omit=dev'
    );
    return;
  }

  const app = require('./app');
  const { connectDatabase } = require('./config/database');
  const { startTokenCleanupJob } = require('./jobs/tokenCleanup.job');
  const { startSessionTimeoutJob } = require('./jobs/sessionTimeout.job');
  const integrationService = require('./services/integration.service');

  let jobsStarted = false;

  const startBackgroundJobs = () => {
    if (jobsStarted) return;
    jobsStarted = true;
    startTokenCleanupJob();
    startSessionTimeoutJob();
  };

  const connectWithRetry = async () => {
    try {
      await connectDatabase();
      runtimeStatus.dbReady = true;
      runtimeStatus.dbError = null;

      try {
        await integrationService.syncWhatsAppFromEnv();
        await integrationService.refreshWhatsAppCache();
        await integrationService.refreshMailCache();
      } catch (integrationError) {
        logger.warn('Integration sync skipped: %s', integrationError.message);
      }

      startBackgroundJobs();
    } catch (error) {
      runtimeStatus.dbReady = false;
      runtimeStatus.dbError = error.message;
      logger.error('Database not ready: %s (retrying in 10s)', error.message);
      setTimeout(connectWithRetry, 10000);
    }
  };

  listen(app);
  connectWithRetry();
};

start();
