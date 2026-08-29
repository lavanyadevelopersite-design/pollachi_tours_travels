const whatsappInboxService = require('../services/whatsappInbox.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getStatus = asyncHandler(async (req, res) => {
  const data = await whatsappInboxService.getInboxStatus();
  res.json(ApiResponse.success('WhatsApp inbox status', data));
});

const listConversations = asyncHandler(async (req, res) => {
  const data = await whatsappInboxService.listConversations({
    search: req.query.search,
    limit: req.query.limit,
    offset: req.query.offset,
  });
  res.json(
    ApiResponse.paginated('Conversations retrieved', data.rows, {
      total: data.count,
      limit: Number(req.query.limit) || 50,
      offset: Number(req.query.offset) || 0,
    })
  );
});

const getMessages = asyncHandler(async (req, res) => {
  const data = await whatsappInboxService.getConversationMessages(req.params.id, {
    limit: req.query.limit,
    before: req.query.before,
  });
  res.json(ApiResponse.success('Messages retrieved', data));
});

const markRead = asyncHandler(async (req, res) => {
  const data = await whatsappInboxService.markConversationRead(req.params.id);
  res.json(ApiResponse.success('Conversation marked as read', data));
});

const sendMessage = asyncHandler(async (req, res) => {
  const data = await whatsappInboxService.sendConversationMessage(req.params.id, {
    message: req.body.message,
    userId: req.user.id,
  });
  res.json(ApiResponse.success('Message sent', data));
});

const startConversation = asyncHandler(async (req, res) => {
  const data = await whatsappInboxService.startConversation({
    phoneNumber: req.body.phoneNumber,
    contactName: req.body.contactName,
    message: req.body.message,
    userId: req.user.id,
  });
  res.json(ApiResponse.success('Conversation started', data));
});

const syncInbox = asyncHandler(async (req, res) => {
  const data = await whatsappInboxService.syncInboxFromWasender(req.user.id);
  res.json(ApiResponse.success('WhatsApp inbox synced', data));
});

const webhook = asyncHandler(async (req, res) => {
  const result = await whatsappInboxService.handleIncomingWebhook(req.body);
  res.json(ApiResponse.success('Webhook processed', result));
});

module.exports = {
  getStatus,
  listConversations,
  getMessages,
  markRead,
  sendMessage,
  startConversation,
  syncInbox,
  webhook,
};
