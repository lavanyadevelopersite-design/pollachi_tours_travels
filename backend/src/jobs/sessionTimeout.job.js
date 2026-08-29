const dayjs = require('dayjs');
const { Op } = require('sequelize');
const { User } = require('../models');
const jwtConfig = require('../config/jwt');
const logger = require('../config/logger');

const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

const flagInactiveSessions = async () => {
  try {
    const cutoff = dayjs()
      .subtract(jwtConfig.sessionInactiveTimeoutMinutes, 'minute')
      .toDate();

    const inactiveCount = await User.count({
      where: {
        is_active: true,
        last_activity_at: { [Op.lt]: cutoff, [Op.ne]: null },
      },
    });

    if (inactiveCount > 0) {
      logger.info(
        '%s user(s) exceeded inactivity timeout of %s minutes',
        inactiveCount,
        jwtConfig.sessionInactiveTimeoutMinutes
      );
    }
  } catch (error) {
    logger.error('Session timeout check failed: %s', error.message);
  }
};

const startSessionTimeoutJob = () => {
  setInterval(flagInactiveSessions, CHECK_INTERVAL_MS);
  logger.info('Session timeout job scheduled');
};

module.exports = { startSessionTimeoutJob, flagInactiveSessions };
