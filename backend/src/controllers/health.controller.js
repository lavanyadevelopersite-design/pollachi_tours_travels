const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const runtimeStatus = require('../config/runtimeStatus');

const health = asyncHandler(async (req, res) => {
  let dbStatus = runtimeStatus.dbReady ? 'up' : 'down';

  if (runtimeStatus.nativeModulesOk) {
    try {
      const { sequelize } = require('../models');
      await sequelize.authenticate();
      dbStatus = 'up';
      runtimeStatus.dbReady = true;
      runtimeStatus.dbError = null;
    } catch (error) {
      dbStatus = 'down';
      runtimeStatus.dbReady = false;
      runtimeStatus.dbError = error.message;
    }
  }

  const healthy = runtimeStatus.nativeModulesOk && dbStatus === 'up';
  const payload = {
    status: healthy ? 'ok' : 'error',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development',
    envFile: runtimeStatus.envFileName,
    host: process.env.HOST || '0.0.0.0',
    port: parseInt(process.env.PORT, 10) || 5000,
  };

  if (!healthy) {
    payload.error = runtimeStatus.nativeModuleError || runtimeStatus.dbError || 'Service unavailable';
  }

  res.status(healthy ? 200 : 503).json(
    healthy
      ? ApiResponse.success('Service is healthy', payload)
      : ApiResponse.error(payload.error, null, payload)
  );
});

module.exports = { health };
