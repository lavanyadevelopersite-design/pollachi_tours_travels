const logger = require('../config/logger');

const WHATCHIMP_BASE_URL = process.env.WHATCHIMP_BASE_URL || 'https://app.whatchimp.com/api/v1/whatsapp';

const isEnabled = () => String(process.env.WHATCHIMP_ENABLED || '').toLowerCase() === 'true';

const getConfig = () => ({
  apiToken: process.env.WHATCHIMP_API_TOKEN || '',
  phoneNumberId: process.env.WHATCHIMP_PHONE_NUMBER_ID || '',
  templateName: process.env.WHATCHIMP_TEMPLATE_NAME || 'trip_booking_confirmation',
  templateId: process.env.WHATCHIMP_TEMPLATE_ID || '',
  languageCode: process.env.WHATCHIMP_LANGUAGE_CODE || 'en_US',
});

const { normalizeWhatsAppPhone } = require('../utils/phone.util');

/** Digits only; prepend India country code when 10-digit local number is passed. */
const normalizePhone = (phone, defaultCountryCode = '91') => {
  const normalized = normalizeWhatsAppPhone(phone, defaultCountryCode);
  if (!normalized) return null;
  return normalized.slice(1);
};

const postForm = async (path, fields = {}) => {
  const body = new URLSearchParams();
  Object.entries(fields).forEach(([key, value]) => {
    if (value != null && value !== '') body.append(key, String(value));
  });

  const response = await fetch(`${WHATCHIMP_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`WhatChimp returned invalid JSON (HTTP ${response.status})`);
  }

  if (!response.ok || String(data.status) !== '1') {
    const message =
      typeof data.message === 'string'
        ? data.message
        : data.message?.message || JSON.stringify(data.message || data);
    throw new Error(message || `WhatChimp request failed (HTTP ${response.status})`);
  }

  return data;
};

/** Send plain text (only works within WhatsApp 24-hour session window). */
const sendTextMessage = async ({ phoneNumber, message }) => {
  const { apiToken, phoneNumberId } = getConfig();
  if (!apiToken || !phoneNumberId) {
    throw new Error('WhatChimp API token or phone_number_id is missing');
  }

  const phone = normalizePhone(phoneNumber);
  if (!phone) throw new Error('Customer phone number is invalid');

  return postForm('/send', {
    apiToken,
    phone_number_id: phoneNumberId,
    phone_number: phone,
    message,
  });
};

/**
 * Send an approved WhatsApp template (works outside 24-hour window).
 * variables: { variable1: '...', variable2: '...' } or templateVariable-* keys from console.
 */
const sendTemplateMessage = async ({
  phoneNumber,
  variables = {},
  headerMediaUrl,
  templateName,
  languageCode,
}) => {
  const { apiToken, phoneNumberId, templateName: defaultTemplate, languageCode: defaultLang } =
    getConfig();
  if (!apiToken || !phoneNumberId) {
    throw new Error('WhatChimp API token or phone_number_id is missing');
  }

  const phone = normalizePhone(phoneNumber);
  if (!phone) throw new Error('Customer phone number is invalid');

  return postForm('/send', {
    apiToken,
    phone_number_id: phoneNumberId,
    phone_number: phone,
    template_name: templateName || defaultTemplate,
    language_code: languageCode || defaultLang,
    template_header_media_url: headerMediaUrl || undefined,
    ...variables,
  });
};

const listTemplates = async () => {
  const { apiToken, phoneNumberId } = getConfig();
  if (!apiToken || !phoneNumberId) {
    throw new Error('WhatChimp API token or phone_number_id is missing');
  }

  const params = new URLSearchParams({
    apiToken,
    phone_number_id: phoneNumberId,
  });
  const response = await fetch(`${WHATCHIMP_BASE_URL}/template/list?${params.toString()}`);
  const data = await response.json();
  if (String(data.status) !== '1') {
    throw new Error(
      typeof data.message === 'string' ? data.message : 'Unable to fetch WhatChimp templates'
    );
  }
  return data.message || data.data || [];
};

module.exports = {
  isEnabled,
  getConfig,
  normalizePhone,
  sendTextMessage,
  sendTemplateMessage,
  listTemplates,
};
