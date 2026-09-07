const { Op } = require('sequelize');
const {
  WhatsAppConversation,
  WhatsAppMessage,
  Enquiry,
  LeadStatus,
  User,
} = require('../models');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');
const { normalizeWhatsAppPhone } = require('../utils/phone.util');
const wasender = require('./wasender.service');
const wasenderApi = require('./wasenderApi.service');
const integrationService = require('./integration.service');

const WHATSAPP_KEYS = {
  sessionId: 'whatsapp_session_id',
};

const parseLogContent = (content) => {
  if (!content) return '';
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      return parsed?.text || parsed?.caption || content;
    } catch {
      return content;
    }
  }
  if (typeof content === 'object') {
    return content.text || content.caption || JSON.stringify(content);
  }
  return String(content);
};

const jidToPhone = (jid) => {
  if (!jid) return '';
  const raw = String(jid).split('@')[0].replace(/\D/g, '');
  return normalizeWhatsAppPhone(raw);
};

const contactPhone = (contact) =>
  normalizeWhatsAppPhone(contact?.phone_number || contact?.phone || jidToPhone(contact?.jid));

const contactName = (contact) =>
  String(contact?.notify || contact?.verifiedName || contact?.name || '').trim() || null;

const mapLogStatus = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (['sent', 'delivered', 'read'].includes(normalized)) return normalized;
  if (normalized === 'failed') return 'failed';
  if (normalized === 'in_progress') return 'pending';
  return 'sent';
};

const ensureWhatsAppReady = () => {
  const config = integrationService.getWhatsAppConfig();
  if (!config.enabled || !config.apiKey) {
    throw new AppError('WhatsApp is not connected. Link your number under Integrations → WhatsApp.', 400);
  }
  return config;
};

const linkEnquiryToConversation = async (conversation) => {
  if (conversation.enquiry_id) return conversation;

  const enquiries = await Enquiry.findAll({
    where: { phone: { [Op.ne]: null } },
    attributes: ['id', 'customer_name', 'phone'],
    order: [['updated_at', 'DESC']],
    limit: 300,
  });

  const enquiry = enquiries.find(
    (row) => normalizeWhatsAppPhone(row.phone) === conversation.phone_number
  );

  if (!enquiry) return conversation;

  await conversation.update({
    enquiry_id: enquiry.id,
    contact_name: conversation.contact_name || enquiry.customer_name,
  });

  return conversation.reload();
};

const findOrCreateConversation = async (
  phoneNumber,
  { contactName, profileImageUrl, enquiryId, userId, sessionId } = {}
) => {
  const phone = normalizeWhatsAppPhone(phoneNumber);
  if (!phone) return null;

  let conversation = await WhatsAppConversation.findOne({ where: { phone_number: phone } });

  if (!conversation) {
    conversation = await WhatsAppConversation.create({
      phone_number: phone,
      contact_name: contactName || null,
      profile_image_url: profileImageUrl || null,
      enquiry_id: enquiryId || null,
      wasender_session_id: sessionId || null,
      created_by: userId || null,
      updated_by: userId || null,
    });
  } else {
    const updates = {};
    if (contactName && !conversation.contact_name) updates.contact_name = contactName;
    if (profileImageUrl && !conversation.profile_image_url) updates.profile_image_url = profileImageUrl;
    if (enquiryId && !conversation.enquiry_id) updates.enquiry_id = enquiryId;
    if (sessionId) updates.wasender_session_id = sessionId;
    if (userId) updates.updated_by = userId;
    if (Object.keys(updates).length) {
      await conversation.update(updates);
    }
  }

  return linkEnquiryToConversation(conversation);
};

const updateConversationPreview = async (conversation, message) => {
  const preview = String(message.body || '').slice(0, 500);
  const updates = {
    last_message_at: message.sent_at || message.created_at || new Date(),
    last_message_preview: preview,
    last_message_direction: message.direction,
  };

  if (message.direction === 'inbound') {
    updates.unread_count = (conversation.unread_count || 0) + 1;
  }

  await conversation.update(updates);
};

const upsertMessage = async ({
  conversation,
  direction,
  body,
  messageType = 'text',
  status = 'sent',
  wasenderMsgId,
  rawPayload,
  sentBy,
  sentAt,
  enquiryId = null,
  errorMessage = null,
}) => {
  if (wasenderMsgId) {
    const existing = await WhatsAppMessage.findOne({
      where: { wasender_msg_id: wasenderMsgId },
    });
    if (existing) return existing;
  }

  const message = await WhatsAppMessage.create({
    conversation_id: conversation.id,
    direction,
    message_type: messageType,
    body: body || '',
    status,
    wasender_msg_id: wasenderMsgId || null,
    raw_payload: rawPayload || null,
    sent_by: sentBy || null,
    sent_at: sentAt || new Date(),
    enquiry_id: enquiryId || conversation.enquiry_id || null,
    error_message: errorMessage || null,
  });

  await updateConversationPreview(conversation, message);
  return message;
};

const seedEnquiryConversations = async (userId, sessionId) => {
  const enquiries = await Enquiry.findAll({
    where: {
      phone: { [Op.ne]: null },
    },
    attributes: ['id', 'customer_name', 'phone'],
    order: [['updated_at', 'DESC']],
    limit: 200,
  });

  for (const enquiry of enquiries) {
    const phone = normalizeWhatsAppPhone(enquiry.phone);
    if (!phone) continue;
    await findOrCreateConversation(phone, {
      contactName: enquiry.customer_name,
      enquiryId: enquiry.id,
      userId,
      sessionId,
    });
  }
};

const syncInboxFromWasender = async (userId = null) => {
  const config = ensureWhatsAppReady();
  const settings = await integrationService.getWhatsAppSettings();
  const sessionId = settings.sessionId;

  await seedEnquiryConversations(userId, sessionId);

  try {
    const contacts = await wasenderApi.getContacts(config.apiKey, { page: 1, limit: 100 });
    for (const contact of contacts) {
      const phone = contactPhone(contact);
      if (!phone) continue;
      await findOrCreateConversation(phone, {
        contactName: contactName(contact),
        profileImageUrl: contact?.imgUrl || null,
        userId,
        sessionId,
      });
    }
  } catch (error) {
    logger.warn('WhatsApp contact sync failed: %s', error.message);
  }

  if (sessionId) {
    try {
      let page = 1;
      let hasMore = true;

      while (hasMore && page <= 5) {
        const logs = await wasenderApi.getMessageLogs(config.apiKey, sessionId, {
          page,
          perPage: 50,
        });

        if (!logs.length) {
          hasMore = false;
          break;
        }

        for (const log of logs) {
          const phone = normalizeWhatsAppPhone(log.to);
          if (!phone) continue;

          const conversation = await findOrCreateConversation(phone, { userId, sessionId });
          const body = parseLogContent(log.content);
          const wasenderMsgId = log.id != null ? String(log.id) : null;

          await upsertMessage({
            conversation,
            direction: 'outbound',
            body,
            status: mapLogStatus(log.status),
            wasenderMsgId,
            rawPayload: log,
            sentAt: log.created_at ? new Date(log.created_at) : new Date(),
          });
        }

        hasMore = logs.length >= 50;
        page += 1;
      }
    } catch (error) {
      logger.warn('WhatsApp message log sync failed: %s', error.message);
    }
  }

  return listConversations({ limit: 50 });
};

const listConversations = async ({ search = '', limit = 50, offset = 0 } = {}) => {
  const where = { status: { [Op.ne]: 'archived' } };

  if (search.trim()) {
    const term = `%${search.trim()}%`;
    where[Op.or] = [
      { contact_name: { [Op.like]: term } },
      { phone_number: { [Op.like]: term } },
      { '$enquiry.customer_name$': { [Op.like]: term } },
      { '$enquiry.enquiry_code$': { [Op.like]: term } },
    ];
  }

  const { rows, count } = await WhatsAppConversation.findAndCountAll({
    where,
    include: [
      {
        model: Enquiry,
        as: 'enquiry',
        attributes: [
          'id',
          'customer_name',
          'enquiry_code',
          'phone',
          'email',
          'travel_from',
          'travel_to',
          'travel_from_destination',
          'travel_to_destination',
          'lead_status_id',
          'assigned_to',
        ],
        required: false,
        include: [
          { model: LeadStatus, as: 'leadStatus', attributes: ['id', 'lead_status', 'button_color'] },
          { model: User, as: 'assignee', attributes: ['id', 'first_name', 'last_name'] },
        ],
      },
    ],
    order: [
      ['last_message_at', 'DESC'],
      ['updated_at', 'DESC'],
    ],
    distinct: true,
    subQuery: false,
    limit: Math.min(Number(limit) || 50, 100),
    offset: Number(offset) || 0,
  });

  return { rows, count };
};

const getConversationMessages = async (conversationId, { limit = 50, before } = {}) => {
  const conversation = await WhatsAppConversation.findByPk(conversationId, {
    include: [
      {
        model: Enquiry,
        as: 'enquiry',
        attributes: [
          'id',
          'customer_name',
          'enquiry_code',
          'phone',
          'email',
          'travel_from',
          'travel_to',
          'travel_from_destination',
          'travel_to_destination',
          'lead_status_id',
          'assigned_to',
        ],
        required: false,
        include: [
          { model: LeadStatus, as: 'leadStatus', attributes: ['id', 'lead_status', 'button_color'] },
          { model: User, as: 'assignee', attributes: ['id', 'first_name', 'last_name'] },
        ],
      },
    ],
  });

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  const where = { conversation_id: conversationId };
  if (before) {
    where.sent_at = { [Op.lt]: new Date(before) };
  }

  const messages = await WhatsAppMessage.findAll({
    where,
    order: [['sent_at', 'ASC']],
    limit: Math.min(Number(limit) || 50, 200),
  });

  return { conversation, messages };
};

const markConversationRead = async (conversationId) => {
  const conversation = await WhatsAppConversation.findByPk(conversationId);
  if (!conversation) throw new AppError('Conversation not found', 404);
  await conversation.update({ unread_count: 0 });
  return conversation;
};

const sendConversationMessage = async (conversationId, { message, userId }) => {
  const text = String(message || '').trim();
  if (!text) throw new AppError('Message is required', 400);

  ensureWhatsAppReady();

  const conversation = await WhatsAppConversation.findByPk(conversationId);
  if (!conversation) throw new AppError('Conversation not found', 404);

  const pending = await WhatsAppMessage.create({
    conversation_id: conversation.id,
    direction: 'outbound',
    message_type: 'text',
    body: text,
    status: 'pending',
    sent_by: userId || null,
    sent_at: new Date(),
    enquiry_id: conversation.enquiry_id || null,
  });

  const result = await wasender.sendTextMessage({
    phoneNumber: conversation.phone_number,
    message: text,
  });

  if (!result.success) {
    await pending.update({
      status: 'failed',
      error_message: result.error || result.reason || 'Send failed',
    });
    throw new AppError(result.error || 'Failed to send WhatsApp message', 400);
  }

  const msgId =
    result.data?.data?.msgId ||
    result.data?.msgId ||
    result.data?.data?.data?.msgId ||
    null;

  await pending.update({
    status: 'sent',
    wasender_msg_id: msgId ? String(msgId) : null,
    raw_payload: result.data || null,
  });

  await updateConversationPreview(conversation, pending);
  return pending;
};

const startConversation = async ({ phoneNumber, contactName, message, userId }) => {
  const config = ensureWhatsAppReady();
  const settings = await integrationService.getWhatsAppSettings();
  const conversation = await findOrCreateConversation(phoneNumber, {
    contactName,
    userId,
    sessionId: settings.sessionId,
  });

  if (!conversation) {
    throw new AppError('Enter a valid phone number with country code', 400);
  }

  if (message?.trim()) {
    await sendConversationMessage(conversation.id, { message, userId });
  }

  return getConversationMessages(conversation.id);
};

const handleIncomingWebhook = async (payload = {}) => {
  const event = String(payload.event || '').toLowerCase();
  if (!event.includes('message')) return { handled: false };

  const messages = payload.data?.messages;
  const msg = Array.isArray(messages) ? messages[0] : messages;
  if (!msg) return { handled: false };

  const fromMe = Boolean(msg?.key?.fromMe);
  if (fromMe) return { handled: false, reason: 'outbound_ignored' };

  const phone = normalizeWhatsAppPhone(
    msg?.key?.cleanedSenderPn || msg?.key?.cleanedParticipantPn || jidToPhone(msg?.key?.remoteJid)
  );
  if (!phone) return { handled: false, reason: 'missing_phone' };

  const settings = await integrationService.getWhatsAppSettings();
  const conversation = await findOrCreateConversation(phone, {
    contactName: msg?.pushName || null,
    sessionId: settings.sessionId,
  });

  const body = String(msg?.messageBody || msg?.message?.conversation || '').trim();
  const wasenderMsgId = msg?.key?.id ? String(msg.key.id) : null;

  await upsertMessage({
    conversation,
    direction: 'inbound',
    body,
    status: 'received',
    wasenderMsgId,
    rawPayload: payload,
    sentAt: payload.timestamp ? new Date(payload.timestamp * 1000) : new Date(),
  });

  return { handled: true, conversationId: conversation.id };
};

const getInboxStatus = async () => {
  const settings = await integrationService.getWhatsAppSettings();
  const config = integrationService.getWhatsAppConfig();
  const conversationCount = await WhatsAppConversation.count();

  return {
    connected: Boolean(settings.sessionConnected),
    configured: Boolean(config.apiKey),
    linkedPhone: settings.linkedPhone,
    conversationCount,
  };
};

const recordOutboundCustomerMessage = async ({
  phoneNumber,
  message,
  enquiryId,
  contactName,
  userId,
  wasenderMsgId,
  status = 'sent',
  messageType = 'text',
  errorMessage,
}) => {
  const conversation = await findOrCreateConversation(phoneNumber, {
    contactName,
    enquiryId,
    userId,
  });
  if (!conversation) return null;

  return upsertMessage({
    conversation,
    direction: 'outbound',
    body: message,
    messageType,
    status,
    wasenderMsgId,
    sentBy: userId,
    sentAt: new Date(),
    enquiryId,
    errorMessage,
  });
};

module.exports = {
  recordOutboundCustomerMessage,
  listConversations,
  getConversationMessages,
  markConversationRead,
  sendConversationMessage,
  startConversation,
  syncInboxFromWasender,
  handleIncomingWebhook,
  getInboxStatus,
};
