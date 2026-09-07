const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { sequelize } = require('../models');

const health = asyncHandler(async (req, res) => {
  let dbStatus = 'up';
  try {
    await sequelize.authenticate();
  } catch {
    dbStatus = 'down';
  }

  res.json(
    ApiResponse.success('Service is healthy', {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: dbStatus,
      environment: process.env.NODE_ENV || 'development',
    })
  );
});

module.exports = { health };
