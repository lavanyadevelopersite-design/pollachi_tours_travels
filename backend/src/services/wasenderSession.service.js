const AppError = require('../utils/AppError');
const logger = require('../config/logger');
const { normalizeWhatsAppPhone } = require('../utils/phone.util');

const WASENDER_API_BASE = String(process.env.WASENDER_API_BASE || 'https://www.wasenderapi.com/api').replace(
  /\/$/,
  ''
);

const mapWasenderHttpStatus = (httpStatus) => {
  if (httpStatus === 401 || httpStatus === 403) return httpStatus;
  if (httpStatus === 404) return 404;
  if (httpStatus === 429) return 429;
  return 422;
};

const wasenderRequest = async (path, { method = 'GET', token, body, timeoutMs = 20000 } = {}) => {
  if (!token) {
    throw new AppError('Wasender Personal Access Token is required', 400);
  }

  let response;
  try {
    response = await fetch(`${WASENDER_API_BASE}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw new AppError(
        'Wasender did not respond in time. Confirm the live server can reach wasenderapi.com, then try Connect again.',
        422
      );
    }
    throw new AppError(
      `Could not reach Wasender (${error.message}). Check outbound HTTPS from the live server to wasenderapi.com.`,
      422
    );
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  const success = payload?.success !== false && response.ok;
  if (!success) {
    const message =
      payload?.message ||
      payload?.error ||
      payload?.data?.message ||
      payload?.data?.error ||
      `Wasender API request failed (${response.status})`;
    logger.warn('Wasender %s %s failed: %s', method, path, message);
    throw new AppError(message, mapWasenderHttpStatus(response.status));
  }

  return payload?.data ?? payload;
};

const listSessions = (token) => wasenderRequest('/whatsapp-sessions', { token });

const getSession = (token, sessionId) =>
  wasenderRequest(`/whatsapp-sessions/${sessionId}`, { token });

const createSession = (token, payload) =>
  wasenderRequest('/whatsapp-sessions', {
    method: 'POST',
    token,
    body: {
      name: payload.name || 'Tours CRM WhatsApp',
      phone_number: payload.phone_number,
      account_protection: true,
      log_messages: true,
      read_incoming_messages: false,
      webhook_enabled: false,
    },
  });

const connectSession = (token, sessionId, linkMethod = 'qr') =>
  wasenderRequest(`/whatsapp-sessions/${sessionId}/connect`, {
    method: 'POST',
    token,
    body: { linkMethod },
    timeoutMs: 25000,
  });

const getQrCode = (token, sessionId) =>
  wasenderRequest(`/whatsapp-sessions/${sessionId}/qrcode`, { token, timeoutMs: 10000 });

const disconnectSession = (token, sessionId) =>
  wasenderRequest(`/whatsapp-sessions/${sessionId}/disconnect`, {
    method: 'POST',
    token,
  });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeSessionStatus = (status) => String(status || '').toLowerCase();

const isSessionConnected = (status) => {
  const normalized = normalizeSessionStatus(status);
  return normalized === 'connected' || normalized === 'open' || normalized === 'authenticated';
};

const needsQrScan = (status) => {
  const normalized = normalizeSessionStatus(status);
  return [
    'need_scan',
    'disconnected',
    'logged_out',
    'connecting',
    'close',
    'closed',
    'timeout',
    'conflict',
    '',
  ].includes(normalized);
};

const findSessionByPhone = (sessions, phoneNumber) => {
  const target = normalizeWhatsAppPhone(phoneNumber);
  if (!target) return null;
  return (sessions || []).find((session) => normalizeWhatsAppPhone(session.phone_number) === target);
};

const normalizeSessionsList = (listed) => {
  if (Array.isArray(listed)) return listed;
  if (Array.isArray(listed?.data)) return listed.data;
  if (Array.isArray(listed?.sessions)) return listed.sessions;
  return [];
};

const isSessionLimitError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return message.includes('session limit') || message.includes('upgrade your plan');
};

const pickReusableSession = (sessions, phoneNumber) => {
  const list = normalizeSessionsList(sessions);
  if (!list.length) return null;

  const byPhone = findSessionByPhone(list, phoneNumber);
  if (byPhone) return byPhone;

  if (list.length === 1) return list[0];

  const disconnected = list.find((session) => !isSessionConnected(session.status));
  if (disconnected) return disconnected;

  return list[0];
};

const updateSession = (token, sessionId, payload) =>
  wasenderRequest(`/whatsapp-sessions/${sessionId}`, {
    method: 'PUT',
    token,
    body: payload,
  });

const extractQrCode = (payload) => {
  if (!payload) return null;
  if (typeof payload === 'string' && payload.trim()) return payload.trim();

  const candidates = [
    payload.qrCode,
    payload.qrcode,
    payload.qr_code,
    payload.qr,
    payload.image,
    payload.data?.qrCode,
    payload.data?.qrcode,
    payload.data?.qr_code,
    payload.data?.qr,
    payload.data?.image,
  ];

  for (const raw of candidates) {
    if (!raw) continue;
    if (typeof raw === 'string' && raw.trim()) return raw.trim();
    if (typeof raw === 'object') {
      const nested = raw.qrCode || raw.qr || raw.data || raw.image || raw.base64;
      if (typeof nested === 'string' && nested.trim()) return nested.trim();
    }
  }

  return null;
};

const fetchSessionQrCode = async (token, sessionId, { connectResult, session } = {}) => {
  let qrCode = extractQrCode(connectResult);
  const connectStatus = connectResult?.status;
  let status =
    connectStatus ||
    (session?.status && !isSessionConnected(session.status) ? session.status : 'NEED_SCAN');

  if (qrCode || isSessionConnected(status)) {
    return { qrCode, status };
  }

  const tryGetQr = async () => {
    const qrResult = await getQrCode(token, sessionId);
    qrCode = extractQrCode(qrResult) || qrCode;
    status = qrResult?.status || status;
  };

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await tryGetQr();
    } catch (error) {
      const msg = String(error?.message || '').toLowerCase();
      if (
        msg.includes('not in need_scan') ||
        msg.includes('already initialized') ||
        msg.includes('already connected') ||
        msg.includes('no qr code needed')
      ) {
        status = 'CONNECTED';
        break;
      }
    }
    if (qrCode || isSessionConnected(status)) break;
    if (attempt < 2) await sleep(800);
  }

  return { qrCode, status };
};

module.exports = {
  listSessions,
  getSession,
  createSession,
  updateSession,
  connectSession,
  getQrCode,
  disconnectSession,
  isSessionConnected,
  needsQrScan,
  normalizeSessionStatus,
  normalizeSessionsList,
  isSessionLimitError,
  findSessionByPhone,
  pickReusableSession,
  extractQrCode,
  fetchSessionQrCode,
};
