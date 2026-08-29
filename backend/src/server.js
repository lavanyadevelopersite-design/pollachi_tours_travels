require('dotenv').config();

const app = require('./app');
const { connectDatabase } = require('./config/database');
const logger = require('./config/logger');
const { startTokenCleanupJob } = require('./jobs/tokenCleanup.job');
const { startSessionTimeoutJob } = require('./jobs/sessionTimeout.job');

const PORT = process.env.PORT || 5000;

const integrationService = require('./services/integration.service');

const start = async () => {
  try {
    await connectDatabase();
    await integrationService.syncWhatsAppFromEnv();
    await integrationService.refreshWhatsAppCache();
    await integrationService.refreshMailCache();

    startTokenCleanupJob();
    startSessionTimeoutJob();

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
      logger.info(`API docs: http://localhost:${PORT}/api/docs`);
    });
  } catch (error) {
    logger.error('Failed to start server: %s', error.message);
    process.exit(1);
  }
};

start();
