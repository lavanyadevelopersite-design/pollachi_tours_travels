const integrationService = require('../services/integration.service');
const { sendEmail } = require('../services/email.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const getWhatsApp = asyncHandler(async (req, res) => {
  let data = await integrationService.getWhatsAppSettings();
  if (!data.configured && process.env.WASENDER_API_KEY) {
    data = await integrationService.syncWhatsAppFromEnv(req.user?.id || null);
  }
  if (data.sessionId) {
    data = await integrationService.syncWhatsAppSessionStatus(req.user?.id || null);
  }
  res.json(ApiResponse.success('WhatsApp integration retrieved', data));
});

const saveWhatsApp = asyncHandler(async (req, res) => {
  const data = await integrationService.saveWhatsAppSettings(req.body, req.user.id);
  res.json(ApiResponse.success('WhatsApp integration saved', data));
});

const connectWhatsApp = asyncHandler(async (req, res) => {
  const data = await integrationService.startWhatsAppQrConnect(req.body, req.user.id);
  res.json(ApiResponse.success('WhatsApp QR connection started', data));
});

const refreshWhatsAppQr = asyncHandler(async (req, res) => {
  const data = await integrationService.refreshWhatsAppQrCode(req.user.id);
  res.json(ApiResponse.success('WhatsApp QR refreshed', data));
});

const syncWhatsAppSession = asyncHandler(async (req, res) => {
  const data = await integrationService.syncWhatsAppSessionStatus(req.user.id);
  res.json(ApiResponse.success('WhatsApp session synced', data));
});

const disconnectWhatsApp = asyncHandler(async (req, res) => {
  const data = await integrationService.disconnectWhatsAppSession(req.user.id);
  res.json(ApiResponse.success('WhatsApp disconnected', data));
});

const getMail = asyncHandler(async (req, res) => {
  const data = await integrationService.getMailSettings();
  res.json(ApiResponse.success('Mail integration retrieved', data));
});

const saveMail = asyncHandler(async (req, res) => {
  const data = await integrationService.saveMailSettings(req.body, req.user.id);
  res.json(ApiResponse.success('Mail integration saved', data));
});

const testMail = asyncHandler(async (req, res) => {
  const to = String(req.body?.to || req.user?.email || '').trim();
  if (!to) throw new AppError('Recipient email is required', 400);

  const result = await sendEmail({
    to,
    subject: 'Mail Integration Test - Tours & Travels CRM',
    text: 'Your mail integration is working correctly.',
    html: '<p>Your <strong>mail integration</strong> is working correctly.</p>',
  });

  if (!result.success) {
    throw new AppError(result.error || 'Failed to send test email', 400);
  }

  res.json(ApiResponse.success('Test email sent', result));
});

module.exports = {
  getWhatsApp,
  saveWhatsApp,
  connectWhatsApp,
  refreshWhatsAppQr,
  syncWhatsAppSession,
  disconnectWhatsApp,
  getMail,
  saveMail,
  testMail,
};
