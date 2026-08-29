const logger = require('../config/logger');
const { normalizeWhatsAppPhone } = require('../utils/phone.util');
const integrationService = require('./integration.service');

const DEFAULT_API_URL = 'https://www.wasenderapi.com/api/send-message';
const DEFAULT_UPLOAD_URL = 'https://www.wasenderapi.com/api/upload';

const normalizePhone = (phone) => normalizeWhatsAppPhone(phone);

const getConfig = () => {
  const config = integrationService.getWhatsAppConfig();
  return {
    enabled: config.enabled,
    apiKey: config.apiKey,
    apiUrl: config.apiUrl || DEFAULT_API_URL,
    uploadUrl: config.uploadUrl || DEFAULT_UPLOAD_URL,
  };
};

const isEnabled = () => getConfig().enabled;

const isApiSuccess = (data) => {
  if (!data || typeof data !== 'object') return false;
  if (data.success === true) return true;
  if (data.data?.success === true) return true;
  if (data.data?.data?.msgId) return true;
  return false;
};

const uploadMedia = async (buffer, mimeType = 'application/pdf') => {
  const { enabled, apiKey, uploadUrl } = getConfig();
  if (!enabled) {
    return { skipped: true, reason: 'disabled' };
  }
  if (!buffer || !Buffer.isBuffer(buffer)) {
    return { skipped: true, reason: 'empty_file' };
  }

  try {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': mimeType,
      },
      body: buffer,
      signal: AbortSignal.timeout(60000),
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    const publicUrl = data?.publicUrl || data?.data?.publicUrl;
    if (!response.ok || !publicUrl) {
      logger.error('Wasender upload failed', { status: response.status, data });
      return {
        success: false,
        error: data?.message || data?.error || `HTTP ${response.status}`,
        data,
      };
    }

    return { success: true, publicUrl, data };
  } catch (error) {
    logger.error('Wasender upload failed', { message: error.message });
    return { success: false, error: error.message };
  }
};

const sendDocumentMessage = async ({ phoneNumber, message, documentUrl, fileName }) => {
  const { enabled, apiKey, apiUrl } = getConfig();
  if (!enabled) {
    return { skipped: true, reason: 'disabled' };
  }

  const to = normalizePhone(phoneNumber);
  const text = String(message || '').trim();
  const docUrl = String(documentUrl || '').trim();
  const name = String(fileName || 'itinerary.pdf').trim();

  if (!to || to.length < 12) {
    return { skipped: true, reason: 'invalid_phone' };
  }
  if (!docUrl) {
    return { skipped: true, reason: 'missing_document_url' };
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        to,
        text: text || 'Your travel itinerary is attached.',
        documentUrl: docUrl,
        fileName: name,
      }),
      signal: AbortSignal.timeout(30000),
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok || !isApiSuccess(data)) {
      logger.error('Wasender document send failed', { status: response.status, to, data });
      return {
        success: false,
        to,
        error: data?.message || data?.error || data?.data?.message || `HTTP ${response.status}`,
        status: response.status,
        data,
      };
    }

    return { success: true, to, data };
  } catch (error) {
    logger.error('Wasender document send failed', { to, message: error.message });
    return { success: false, to, error: error.message };
  }
};

const postJson = async (payload) => {
  const { apiKey, apiUrl } = getConfig();
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30000),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return { response, data };
};

const sendTextMessage = async ({ phoneNumber, message }) => {
  if (!isEnabled()) {
    return { skipped: true, reason: 'disabled' };
  }

  const to = normalizePhone(phoneNumber);
  const text = String(message || '').trim();

  if (!to || to.length < 12) {
    return { skipped: true, reason: 'invalid_phone' };
  }
  if (!text) {
    return { skipped: true, reason: 'empty_message' };
  }

  try {
    const { response, data } = await postJson({ to, text });
    if (!response.ok || !isApiSuccess(data)) {
      logger.error('Wasender send failed', {
        status: response.status,
        to,
        data,
      });
      return {
        success: false,
        to,
        error: data?.message || data?.error || data?.data?.message || `HTTP ${response.status}`,
        status: response.status,
        data,
      };
    }

    return {
      success: true,
      to,
      data,
    };
  } catch (error) {
    logger.error('Wasender send failed', {
      to,
      message: error.message,
    });
    return {
      success: false,
      to,
      error: error.message,
    };
  }
};

const sendItineraryLinkMessage = async ({ phoneNumber, message, linkUrl, linkLabel = 'Show itinerary' }) => {
  if (!isEnabled()) {
    return { skipped: true, reason: 'disabled' };
  }

  const to = normalizePhone(phoneNumber);
  const body = String(message || '').trim();
  const url = String(linkUrl || '').trim();
  const label = String(linkLabel || 'Show itinerary').trim();

  if (!to || to.length < 12) {
    return { skipped: true, reason: 'invalid_phone' };
  }
  if (!body || !url) {
    return { skipped: true, reason: 'missing_message_or_link' };
  }

  const fullMessage = `${body}\n\n👉 *${label}*\n${url}`;

  const result = await sendTextMessage({ phoneNumber, message: fullMessage });
  if (!result.success) {
    return result;
  }

  return { success: true, to: result.to || to, mode: 'text_link', data: result.data, fullMessage };
};

const sendImageMessage = async ({ phoneNumber, message, imageUrl, fileName = 'receipt.png' }) => {
  const { enabled, apiKey, apiUrl } = getConfig();
  if (!enabled) {
    return { skipped: true, reason: 'disabled' };
  }

  const to = normalizePhone(phoneNumber);
  const text = String(message || '').trim();
  const url = String(imageUrl || '').trim();
  const name = String(fileName || 'receipt.png').trim();

  if (!to || to.length < 12) {
    return { skipped: true, reason: 'invalid_phone' };
  }
  if (!url) {
    return { skipped: true, reason: 'missing_image_url' };
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        to,
        text: text || 'Your payment receipt is attached.',
        imageUrl: url,
        fileName: name,
      }),
      signal: AbortSignal.timeout(30000),
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok || !isApiSuccess(data)) {
      logger.warn('Wasender image send failed, trying document fallback', {
        status: response.status,
        to,
        data,
      });
      return sendDocumentMessage({
        phoneNumber,
        message: text,
        documentUrl: url,
        fileName: name,
      });
    }

    return { success: true, to, mode: 'image', data };
  } catch (error) {
    logger.error('Wasender image send failed', { to, message: error.message });
    return { success: false, to, error: error.message };
  }
};

module.exports = {
  normalizePhone,
  isEnabled,
  uploadMedia,
  sendDocumentMessage,
  sendImageMessage,
  sendTextMessage,
  sendItineraryLinkMessage,
};
