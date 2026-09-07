const dayjs = require('dayjs');
const { Op } = require('sequelize');
const { User } = require('../models');
const jwtConfig = require('../config/jwt');
const logger = require('../config/logger');
const loginHistoryService = require('../services/loginHistory.service');

const CHECK_INTERVAL_MS = 60 * 1000;

const flagInactiveSessions = async () => {
  try {
    const timeoutMinutes = jwtConfig.sessionInactiveTimeoutMinutes;
    const cutoff = dayjs().subtract(timeoutMinutes, 'minute').toDate();

    const inactiveUsers = await User.findAll({
      where: {
        is_active: true,
        last_activity_at: { [Op.lt]: cutoff, [Op.ne]: null },
      },
      attributes: ['id', 'last_activity_at'],
    });

    if (!inactiveUsers.length) return;

    let closed = 0;
    for (const user of inactiveUsers) {
      const autoLogoutAt = dayjs(user.last_activity_at).add(timeoutMinutes, 'minute');
      const logoutAt = autoLogoutAt.isAfter(dayjs()) ? new Date() : autoLogoutAt.toDate();
      const count = await loginHistoryService.endOpenSessionsForUser(user.id, 'timeout', logoutAt);
      closed += count;
    }

    if (closed > 0) {
      logger.info(
        'Auto-logged out %s idle session(s) after %s minutes of inactivity',
        closed,
        timeoutMinutes
      );
    }
  } catch (error) {
    logger.error('Session timeout check failed: %s', error.message);
  }
};

const startSessionTimeoutJob = () => {
  setInterval(flagInactiveSessions, CHECK_INTERVAL_MS);
  flagInactiveSessions();
  logger.info('Session timeout job scheduled (%s minute idle logout)', jwtConfig.sessionInactiveTimeoutMinutes);
};

module.exports = { startSessionTimeoutJob, flagInactiveSessions };
