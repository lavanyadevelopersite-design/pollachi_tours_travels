const logger = require('../config/logger');

const sendSms = async ({ to, message }) => {
  // Mock SMS sender — replace with Twilio / MSG91 in production
  logger.info('SMS queued: to=%s message=%s', to, message);
  return {
    success: true,
    messageId: `sms-mock-${Date.now()}`,
    to,
    message,
  };
};

module.exports = { sendSms };
