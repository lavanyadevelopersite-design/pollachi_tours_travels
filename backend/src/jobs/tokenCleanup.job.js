const dayjs = require('dayjs');
const { Op } = require('sequelize');
const { RefreshToken, TokenBlacklist } = require('../models');
const logger = require('../config/logger');

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

const cleanupExpiredTokens = async () => {
  try {
    const now = new Date();
    const [refreshDeleted, blacklistDeleted] = await Promise.all([
      RefreshToken.destroy({
        where: {
          [Op.or]: [
            { expires_at: { [Op.lt]: now } },
            { is_revoked: true, updated_at: { [Op.lt]: dayjs().subtract(7, 'day').toDate() } },
          ],
        },
      }),
      TokenBlacklist.destroy({
        where: { expires_at: { [Op.lt]: now } },
      }),
    ]);
    logger.info(
      'Token cleanup completed (refresh: %s, blacklist: %s)',
      refreshDeleted,
      blacklistDeleted
    );
  } catch (error) {
    logger.error('Token cleanup failed: %s', error.message);
  }
};

const startTokenCleanupJob = () => {
  cleanupExpiredTokens();
  setInterval(cleanupExpiredTokens, CLEANUP_INTERVAL_MS);
  logger.info('Token cleanup job scheduled');
};

module.exports = { startTokenCleanupJob, cleanupExpiredTokens };
