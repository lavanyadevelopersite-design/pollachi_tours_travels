const logger = require('../config/logger');
const integrationService = require('./integration.service');

let nodemailer = null;
try {
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  nodemailer = require('nodemailer');
} catch {
  nodemailer = null;
}

const sendViaSmtp = async ({ config, to, subject, html, text }) => {
  if (!nodemailer) {
    return {
      success: false,
      error: 'Nodemailer is not installed. Run npm install nodemailer in the backend folder.',
    };
  }

  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: config.smtpUser
      ? {
          user: config.smtpUser,
          pass: config.smtpPassword,
        }
      : undefined,
  });

  const info = await transporter.sendMail({
    from: config.fromName ? `"${config.fromName}" <${config.fromEmail}>` : config.fromEmail,
    to,
    subject,
    text,
    html,
  });

  return {
    success: true,
    messageId: info.messageId,
    to,
    subject,
    preview: text || html,
    delivery: 'smtp',
  };
};

const sendEmail = async ({ to, subject, html, text }) => {
  const config = integrationService.getMailConfig();

  if (config.enabled) {
    try {
      return await sendViaSmtp({ config, to, subject, html, text });
    } catch (error) {
      logger.error('SMTP send failed: %s', error.message);
      return { success: false, error: error.message };
    }
  }

  logger.info('Email queued (mock): to=%s subject=%s', to, subject);
  return {
    success: true,
    messageId: `mock-${Date.now()}`,
    to,
    subject,
    preview: text || html,
    delivery: 'mock',
  };
};

const sendPasswordReset = async (email, resetToken) => {
  const resetUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  return sendEmail({
    to: email,
    subject: 'Password Reset - Tours & Travels CRM',
    text: `Reset your password using this link (valid 1 hour): ${resetUrl}`,
    html: `<p>Reset your password using this link (valid 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });
};

module.exports = { sendEmail, sendPasswordReset };
