const AppError = require('../utils/AppError');
const { normalizeWhatsAppPhone } = require('../utils/phone.util');

const WASENDER_API_BASE = String(process.env.WASENDER_API_BASE || 'https://www.wasenderapi.com/api').replace(
  /\/$/,
  ''
);

const wasenderRequest = async (path, { method = 'GET', token, body } = {}) => {
  if (!token) {
    throw new AppError('Wasender Personal Access Token is required', 400);
  }

  const response = await fetch(`${WASENDER_API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(45000),
  });

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
      `Wasender API request failed (${response.status})`;
    throw new AppError(message, response.status >= 400 && response.status < 600 ? response.status : 502);
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
  });

const getQrCode = (token, sessionId) =>
  wasenderRequest(`/whatsapp-sessions/${sessionId}/qrcode`, { token });

const disconnectSession = (token, sessionId) =>
  wasenderRequest(`/whatsapp-sessions/${sessionId}/disconnect`, {
    method: 'POST',
    token,
  });

const normalizeSessionStatus = (status) => String(status || '').toLowerCase();

const isSessionConnected = (status) => {
  const normalized = normalizeSessionStatus(status);
  return normalized === 'connected' || normalized === 'open';
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
  const raw =
    payload.qrCode ?? payload.qrcode ?? payload.qr_code ?? payload.qr ?? payload.image ?? null;
  if (!raw) return null;
  const str = String(raw).trim();
  return str || null;
};

const fetchSessionQrCode = async (token, sessionId, { connectResult, session } = {}) => {
  let qrCode = extractQrCode(connectResult);
  let status = connectResult?.status || session?.status || 'NEED_SCAN';

  const tryGetQr = async () => {
    const qrResult = await getQrCode(token, sessionId);
    qrCode = extractQrCode(qrResult) || qrCode;
    status = qrResult?.status || status;
  };

  if (!qrCode && !isSessionConnected(status)) {
    try {
      await tryGetQr();
    } catch (error) {
      // connect may need to run before qrcode endpoint accepts the request
    }
  }

  if (!qrCode && isSessionConnected(status)) {
    try {
      await disconnectSession(token, sessionId);
      const reconnect = await connectSession(token, sessionId, 'qr');
      qrCode = extractQrCode(reconnect);
      status = reconnect?.status || 'NEED_SCAN';
      if (!qrCode && !isSessionConnected(status)) {
        await tryGetQr();
      }
    } catch (error) {
      // fall through — caller handles missing QR
    }
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
  normalizeSessionStatus,
  normalizeSessionsList,
  isSessionLimitError,
  findSessionByPhone,
  pickReusableSession,
  extractQrCode,
  fetchSessionQrCode,
};
