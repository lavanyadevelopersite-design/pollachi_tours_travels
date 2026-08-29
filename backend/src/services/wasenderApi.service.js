const AppError = require('../utils/AppError');

const WASENDER_API_BASE = String(process.env.WASENDER_API_BASE || 'https://www.wasenderapi.com/api').replace(
  /\/$/,
  ''
);

const apiRequest = async (path, { method = 'GET', apiKey, body, query = {} } = {}) => {
  if (!apiKey) {
    throw new AppError('WhatsApp session API key is not configured', 400);
  }

  const url = new URL(`${WASENDER_API_BASE}${path}`);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
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

const normalizePaginatedList = (listed) => {
  if (Array.isArray(listed)) return listed;
  if (Array.isArray(listed?.data)) return listed.data;
  if (Array.isArray(listed?.items)) return listed.items;
  return [];
};

const getContacts = async (apiKey, { paginated = true, page = 1, limit = 100 } = {}) => {
  const listed = await apiRequest('/contacts', {
    apiKey,
    query: paginated ? { paginated: 'true', page, limit } : {},
  });
  return normalizePaginatedList(listed);
};

const getMessageLogs = async (apiKey, sessionId, { page = 1, perPage = 50 } = {}) => {
  const listed = await apiRequest(`/whatsapp-sessions/${sessionId}/message-logs`, {
    apiKey,
    query: { page, per_page: perPage },
  });
  return normalizePaginatedList(listed);
};

const getContactPicture = async (apiKey, phoneNumber) => {
  try {
    const encoded = encodeURIComponent(String(phoneNumber).replace(/\D/g, ''));
    const data = await apiRequest(`/contacts/${encoded}/picture`, { apiKey });
    return data?.url || data?.picture || data?.imgUrl || null;
  } catch {
    return null;
  }
};

module.exports = {
  getContacts,
  getMessageLogs,
  getContactPicture,
  normalizePaginatedList,
};
