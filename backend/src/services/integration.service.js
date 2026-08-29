const { Op } = require('sequelize');
const { Setting } = require('../models');
const logger = require('../config/logger');
const AppError = require('../utils/AppError');
const wasenderSession = require('./wasenderSession.service');
const { normalizeWhatsAppPhone } = require('../utils/phone.util');

const DEFAULT_WHATSAPP = {
  apiUrl: 'https://www.wasenderapi.com/api/send-message',
  uploadUrl: 'https://www.wasenderapi.com/api/upload',
};

const WHATSAPP_KEYS = {
  enabled: 'whatsapp_enabled',
  apiKey: 'whatsapp_api_key',
  apiUrl: 'whatsapp_api_url',
  uploadUrl: 'whatsapp_upload_url',
  personalAccessToken: 'whatsapp_personal_access_token',
  sessionId: 'whatsapp_session_id',
  sessionStatus: 'whatsapp_session_status',
  linkedPhone: 'whatsapp_linked_phone',
  sessionName: 'whatsapp_session_name',
};

const MAIL_KEYS = {
  enabled: 'mail_enabled',
  smtpHost: 'mail_smtp_host',
  smtpPort: 'mail_smtp_port',
  smtpSecure: 'mail_smtp_secure',
  smtpUser: 'mail_smtp_user',
  smtpPassword: 'mail_smtp_password',
  fromEmail: 'mail_from_email',
  fromName: 'mail_from_name',
};

let whatsappCache = null;
let mailCache = null;

const toBool = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') return fallback;
  return value === true || value === 'true' || value === '1';
};

const maskSecret = (value) => {
  if (!value) return '';
  const str = String(value);
  if (str.length <= 4) return '••••';
  return `${'•'.repeat(Math.min(str.length - 4, 12))}${str.slice(-4)}`;
};

const loadSettingsMap = async (keys) => {
  const rows = await Setting.findAll({
    where: { key: { [Op.in]: Object.values(keys) } },
  });
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
};

const upsertSettings = async (entries, actorId = null) => {
  for (const entry of entries) {
    const [setting] = await Setting.findOrCreate({
      where: { key: entry.key },
      defaults: {
        value: String(entry.value ?? ''),
        type: entry.type || 'string',
        group: entry.group,
        description: entry.description || null,
        updated_by: actorId,
      },
    });
    if (!setting.isNewRecord) {
      await setting.update({
        value: String(entry.value ?? ''),
        ...(entry.type && { type: entry.type }),
        ...(entry.group && { group: entry.group }),
        ...(entry.description !== undefined && { description: entry.description }),
        updated_by: actorId,
      });
    }
  }
};

const resolveWhatsAppConfig = (map = {}) => {
  const envEnabled = String(process.env.WASENDER_ENABLED || 'true').toLowerCase() !== 'false';
  const dbEnabled = map[WHATSAPP_KEYS.enabled] !== undefined ? toBool(map[WHATSAPP_KEYS.enabled]) : true;
  const apiKey = String(map[WHATSAPP_KEYS.apiKey] || process.env.WASENDER_API_KEY || '').trim();
  const enabled = envEnabled && dbEnabled && Boolean(apiKey);

  return {
    enabled,
    apiKey,
    apiUrl: String(map[WHATSAPP_KEYS.apiUrl] || process.env.WASENDER_API_URL || DEFAULT_WHATSAPP.apiUrl).trim(),
    uploadUrl: String(
      map[WHATSAPP_KEYS.uploadUrl] || process.env.WASENDER_UPLOAD_URL || DEFAULT_WHATSAPP.uploadUrl
    ).trim(),
    source: map[WHATSAPP_KEYS.apiKey]
      ? 'database'
      : process.env.WASENDER_API_KEY
        ? 'env'
        : 'none',
  };
};

const resolveMailConfig = (map = {}) => {
  const enabled = toBool(map[MAIL_KEYS.enabled]);
  const smtpHost = String(map[MAIL_KEYS.smtpHost] || process.env.SMTP_HOST || '').trim();
  const smtpPort = Number(map[MAIL_KEYS.smtpPort] || process.env.SMTP_PORT || 587);
  const smtpSecure = toBool(map[MAIL_KEYS.smtpSecure], smtpPort === 465);
  const smtpUser = String(map[MAIL_KEYS.smtpUser] || process.env.SMTP_USER || '').trim();
  const smtpPassword = String(map[MAIL_KEYS.smtpPassword] || process.env.SMTP_PASSWORD || '').trim();
  const fromEmail = String(map[MAIL_KEYS.fromEmail] || process.env.MAIL_FROM_EMAIL || smtpUser || '').trim();
  const fromName = String(map[MAIL_KEYS.fromName] || process.env.MAIL_FROM_NAME || '').trim();

  return {
    enabled: enabled && Boolean(smtpHost && fromEmail),
    smtpHost,
    smtpPort: Number.isFinite(smtpPort) ? smtpPort : 587,
    smtpSecure,
    smtpUser,
    smtpPassword,
    fromEmail,
    fromName,
    source: map[MAIL_KEYS.smtpHost] ? 'database' : process.env.SMTP_HOST ? 'env' : 'none',
  };
};

const refreshWhatsAppCache = async () => {
  try {
    const map = await loadSettingsMap(WHATSAPP_KEYS);
    whatsappCache = resolveWhatsAppConfig(map);
  } catch (error) {
    logger.warn('Failed to refresh WhatsApp integration cache: %s', error.message);
    whatsappCache = resolveWhatsAppConfig({});
  }
  return whatsappCache;
};

const syncWhatsAppFromEnv = async (actorId = null) => {
  const envKey = String(process.env.WASENDER_API_KEY || '').trim();
  if (!envKey) return getWhatsAppSettings();

  const map = await loadSettingsMap(WHATSAPP_KEYS);
  if (map[WHATSAPP_KEYS.apiKey]) {
    return getWhatsAppSettings();
  }

  await upsertSettings(
    [
      {
        key: WHATSAPP_KEYS.enabled,
        value: 'true',
        type: 'boolean',
        group: 'whatsapp',
        description: 'Enable WhatsApp integration',
      },
      {
        key: WHATSAPP_KEYS.apiKey,
        value: envKey,
        type: 'secret',
        group: 'whatsapp',
        description: 'Wasender API key',
      },
      {
        key: WHATSAPP_KEYS.apiUrl,
        value: String(process.env.WASENDER_API_URL || DEFAULT_WHATSAPP.apiUrl).trim(),
        group: 'whatsapp',
        description: 'Wasender send message API URL',
      },
      {
        key: WHATSAPP_KEYS.uploadUrl,
        value: String(process.env.WASENDER_UPLOAD_URL || DEFAULT_WHATSAPP.uploadUrl).trim(),
        group: 'whatsapp',
        description: 'Wasender media upload API URL',
      },
    ],
    actorId
  );

  await refreshWhatsAppCache();
  return getWhatsAppSettings();
};

const refreshMailCache = async () => {
  try {
    const map = await loadSettingsMap(MAIL_KEYS);
    mailCache = resolveMailConfig(map);
  } catch (error) {
    logger.warn('Failed to refresh mail integration cache: %s', error.message);
    mailCache = resolveMailConfig({});
  }
  return mailCache;
};

const getWhatsAppConfig = () => whatsappCache || resolveWhatsAppConfig({});
const getMailConfig = () => mailCache || resolveMailConfig({});

const getPersonalAccessToken = (map = {}) =>
  String(
    map[WHATSAPP_KEYS.personalAccessToken] || process.env.WASENDER_PERSONAL_ACCESS_TOKEN || ''
  ).trim();

const buildWhatsAppSettingsResponse = async (map = {}) => {
  const config = resolveWhatsAppConfig(map);
  const sessionStatus = map[WHATSAPP_KEYS.sessionStatus] || '';
  const sessionConnected = wasenderSession.isSessionConnected(sessionStatus);

  return {
    enabled: map[WHATSAPP_KEYS.enabled] !== undefined ? toBool(map[WHATSAPP_KEYS.enabled]) : true,
    apiKeyMasked: maskSecret(map[WHATSAPP_KEYS.apiKey] || process.env.WASENDER_API_KEY || ''),
    personalAccessTokenMasked: maskSecret(getPersonalAccessToken(map)),
    apiUrl: map[WHATSAPP_KEYS.apiUrl] || DEFAULT_WHATSAPP.apiUrl,
    uploadUrl: map[WHATSAPP_KEYS.uploadUrl] || DEFAULT_WHATSAPP.uploadUrl,
    configured: Boolean(config.apiKey),
    active: config.enabled,
    source: config.source,
    sessionId: map[WHATSAPP_KEYS.sessionId] || null,
    sessionStatus: sessionStatus || null,
    sessionConnected,
    linkedPhone: map[WHATSAPP_KEYS.linkedPhone] || null,
    sessionName: map[WHATSAPP_KEYS.sessionName] || 'Tours CRM WhatsApp',
    needsQrScan:
      Boolean(map[WHATSAPP_KEYS.sessionId]) &&
      !sessionConnected &&
      ['need_scan', 'disconnected', ''].includes(wasenderSession.normalizeSessionStatus(sessionStatus)),
  };
};

const getWhatsAppSettings = async () => {
  const map = await loadSettingsMap(WHATSAPP_KEYS);
  return buildWhatsAppSettingsResponse(map);
};

const persistSessionSnapshot = async (session = {}, actorId = null) => {
  const entries = [
    {
      key: WHATSAPP_KEYS.sessionId,
      value: session.id != null ? String(session.id) : '',
      group: 'whatsapp',
      description: 'Wasender session ID',
    },
    {
      key: WHATSAPP_KEYS.sessionStatus,
      value: session.status || '',
      group: 'whatsapp',
      description: 'Wasender session status',
    },
    {
      key: WHATSAPP_KEYS.linkedPhone,
      value: session.phone_number || '',
      group: 'whatsapp',
      description: 'Linked WhatsApp phone number',
    },
    {
      key: WHATSAPP_KEYS.sessionName,
      value: session.name || 'Tours CRM WhatsApp',
      group: 'whatsapp',
      description: 'Wasender session name',
    },
  ];

  if (session.api_key) {
    entries.push({
      key: WHATSAPP_KEYS.apiKey,
      value: session.api_key,
      type: 'secret',
      group: 'whatsapp',
      description: 'Wasender API key',
    });
    entries.push({
      key: WHATSAPP_KEYS.enabled,
      value: 'true',
      type: 'boolean',
      group: 'whatsapp',
      description: 'Enable WhatsApp integration',
    });
  }

  await upsertSettings(entries, actorId);
  await refreshWhatsAppCache();
};

const loadWasenderSessions = async (token) => {
  const listed = await wasenderSession.listSessions(token);
  return wasenderSession.normalizeSessionsList(listed);
};

const alignSessionForPhone = async ({ token, session, phoneNumber, sessionName }) => {
  if (!session?.id) return session;

  const currentPhone = normalizeWhatsAppPhone(session.phone_number);
  const targetPhone = normalizeWhatsAppPhone(phoneNumber);
  const nextName = String(sessionName || session.name || 'Tours CRM WhatsApp').trim();
  const updates = {};

  if (targetPhone && currentPhone !== targetPhone) {
    updates.phone_number = targetPhone;
  }
  if (nextName && session.name !== nextName) {
    updates.name = nextName;
  }

  if (!Object.keys(updates).length) return session;

  return wasenderSession.updateSession(token, session.id, updates);
};

const resolveOrCreateSession = async ({ token, phoneNumber, sessionName, existingMap = {} }) => {
  let session = null;
  let sessionId = existingMap[WHATSAPP_KEYS.sessionId];
  let sessions = [];

  if (sessionId) {
    try {
      session = await wasenderSession.getSession(token, sessionId);
    } catch {
      session = null;
      sessionId = null;
    }
  }

  if (!session) {
    sessions = await loadWasenderSessions(token);
    session = wasenderSession.pickReusableSession(sessions, phoneNumber);
    if (session) sessionId = session.id;
  }

  if (!session) {
    try {
      session = await wasenderSession.createSession(token, {
        name: sessionName || 'Tours CRM WhatsApp',
        phone_number: phoneNumber,
      });
      sessionId = session.id;
    } catch (error) {
      if (!wasenderSession.isSessionLimitError(error)) throw error;

      sessions = sessions.length ? sessions : await loadWasenderSessions(token);
      session = wasenderSession.pickReusableSession(sessions, phoneNumber);
      if (!session) {
        throw new AppError(
          'Your Wasender plan has no free session slots. Open wasenderapi.com → WhatsApp Sessions, delete an unused session, or upgrade your plan.',
          400
        );
      }
      sessionId = session.id;
    }
  }

  session = await alignSessionForPhone({ token, session, phoneNumber, sessionName });

  return { session, sessionId: session?.id ?? sessionId };
};

const syncWhatsAppSessionStatus = async (actorId = null) => {
  const map = await loadSettingsMap(WHATSAPP_KEYS);
  const token = getPersonalAccessToken(map);
  const sessionId = map[WHATSAPP_KEYS.sessionId];

  if (!token || !sessionId) {
    return getWhatsAppSettings();
  }

  try {
    const session = await wasenderSession.getSession(token, sessionId);
    await persistSessionSnapshot(session, actorId);
    return getWhatsAppSettings();
  } catch (error) {
    logger.warn('Failed to sync WhatsApp session status: %s', error.message);
    return getWhatsAppSettings();
  }
};

const startWhatsAppQrConnect = async (payload = {}, actorId = null) => {
  const phoneNumber = normalizeWhatsAppPhone(payload.phoneNumber || payload.phone_number);
  if (!phoneNumber) {
    throw new AppError('Enter a valid WhatsApp number with country code (e.g. +919876543210)', 400);
  }

  const existing = await loadSettingsMap(WHATSAPP_KEYS);
  const nextPat = String(payload.personalAccessToken ?? payload.personal_access_token ?? '').trim();
  const token = nextPat || getPersonalAccessToken(existing);
  if (!token) {
    throw new AppError(
      'Wasender Personal Access Token is required. Create one at wasenderapi.com → Settings → Personal Access Token.',
      400
    );
  }

  if (nextPat) {
    await upsertSettings(
      [
        {
          key: WHATSAPP_KEYS.personalAccessToken,
          value: nextPat,
          type: 'secret',
          group: 'whatsapp',
          description: 'Wasender personal access token',
        },
      ],
      actorId
    );
  }

  const sessionName = String(payload.sessionName || existing[WHATSAPP_KEYS.sessionName] || 'Tours CRM WhatsApp').trim();
  const { session, sessionId } = await resolveOrCreateSession({
    token,
    phoneNumber,
    sessionName,
    existingMap: existing,
  });

  await persistSessionSnapshot({ ...session, id: sessionId }, actorId);

  if (wasenderSession.isSessionConnected(session.status) && session.api_key) {
    return {
      sessionId,
      status: session.status,
      qrCode: null,
      phoneNumber: session.phone_number || phoneNumber,
      connected: true,
    };
  }

  const forceReconnect = Boolean(payload.forceReconnect ?? payload.force_reconnect);
  if (forceReconnect && sessionId) {
    try {
      await wasenderSession.disconnectSession(token, sessionId);
    } catch (error) {
      logger.warn('Wasender pre-connect disconnect failed: %s', error.message);
    }
  }

  const connectResult = await wasenderSession.connectSession(token, sessionId, 'qr');
  const { qrCode, status } = await wasenderSession.fetchSessionQrCode(token, sessionId, {
    connectResult,
    session,
  });

  if (!qrCode && !wasenderSession.isSessionConnected(status)) {
    throw new AppError(
      'Could not load QR code from Wasender. Click Refresh QR or disconnect the session at wasenderapi.com and try again.',
      502
    );
  }

  await upsertSettings(
    [
      {
        key: WHATSAPP_KEYS.sessionStatus,
        value: status,
        group: 'whatsapp',
        description: 'Wasender session status',
      },
      {
        key: WHATSAPP_KEYS.linkedPhone,
        value: phoneNumber,
        group: 'whatsapp',
        description: 'Linked WhatsApp phone number',
      },
    ],
    actorId
  );

  return {
    sessionId,
    status,
    qrCode,
    phoneNumber,
    connected: wasenderSession.isSessionConnected(status),
  };
};

const refreshWhatsAppQrCode = async (actorId = null) => {
  const map = await loadSettingsMap(WHATSAPP_KEYS);
  const token = getPersonalAccessToken(map);
  const sessionId = map[WHATSAPP_KEYS.sessionId];

  if (!token || !sessionId) {
    throw new AppError('Start WhatsApp connection before refreshing the QR code', 400);
  }

  const connectResult = await wasenderSession.connectSession(token, sessionId, 'qr');
  const { qrCode, status } = await wasenderSession.fetchSessionQrCode(token, sessionId, {
    connectResult,
  });

  if (!qrCode && !wasenderSession.isSessionConnected(status)) {
    throw new AppError(
      'Could not load QR code. Try Connect WhatsApp again or regenerate from Wasender dashboard.',
      502
    );
  }

  await upsertSettings(
    [
      {
        key: WHATSAPP_KEYS.sessionStatus,
        value: status,
        group: 'whatsapp',
        description: 'Wasender session status',
      },
    ],
    actorId
  );

  return {
    sessionId,
    status,
    qrCode,
    connected: wasenderSession.isSessionConnected(status),
  };
};

const disconnectWhatsAppSession = async (actorId = null) => {
  const map = await loadSettingsMap(WHATSAPP_KEYS);
  const token = getPersonalAccessToken(map);
  const sessionId = map[WHATSAPP_KEYS.sessionId];

  if (token && sessionId) {
    try {
      await wasenderSession.disconnectSession(token, sessionId);
    } catch (error) {
      logger.warn('Wasender disconnect failed: %s', error.message);
    }
  }

  await upsertSettings(
    [
      {
        key: WHATSAPP_KEYS.sessionStatus,
        value: 'DISCONNECTED',
        group: 'whatsapp',
        description: 'Wasender session status',
      },
      {
        key: WHATSAPP_KEYS.enabled,
        value: 'false',
        type: 'boolean',
        group: 'whatsapp',
        description: 'Enable WhatsApp integration',
      },
    ],
    actorId
  );

  await refreshWhatsAppCache();
  return getWhatsAppSettings();
};

const saveWhatsAppSettings = async (payload = {}, actorId = null) => {
  const existing = await loadSettingsMap(WHATSAPP_KEYS);
  const nextApiKey = String(payload.apiKey ?? payload.api_key ?? '').trim();
  const apiKeyToSave = nextApiKey || existing[WHATSAPP_KEYS.apiKey] || '';
  const nextPat = String(payload.personalAccessToken ?? payload.personal_access_token ?? '').trim();
  const patToSave = nextPat || existing[WHATSAPP_KEYS.personalAccessToken] || '';

  if (toBool(payload.enabled, true) && !apiKeyToSave && !process.env.WASENDER_API_KEY) {
    throw new AppError('Wasender API key is required to enable WhatsApp integration', 400);
  }

  await upsertSettings(
    [
      {
        key: WHATSAPP_KEYS.enabled,
        value: toBool(payload.enabled, true) ? 'true' : 'false',
        type: 'boolean',
        group: 'whatsapp',
        description: 'Enable WhatsApp integration',
      },
      {
        key: WHATSAPP_KEYS.apiKey,
        value: apiKeyToSave,
        type: 'secret',
        group: 'whatsapp',
        description: 'Wasender API key',
      },
      ...(patToSave
        ? [
            {
              key: WHATSAPP_KEYS.personalAccessToken,
              value: patToSave,
              type: 'secret',
              group: 'whatsapp',
              description: 'Wasender personal access token',
            },
          ]
        : []),
      {
        key: WHATSAPP_KEYS.apiUrl,
        value: String(payload.apiUrl || DEFAULT_WHATSAPP.apiUrl).trim(),
        group: 'whatsapp',
        description: 'Wasender send message API URL',
      },
      {
        key: WHATSAPP_KEYS.uploadUrl,
        value: String(payload.uploadUrl || DEFAULT_WHATSAPP.uploadUrl).trim(),
        group: 'whatsapp',
        description: 'Wasender media upload API URL',
      },
    ],
    actorId
  );

  await refreshWhatsAppCache();
  return getWhatsAppSettings();
};

const getMailSettings = async () => {
  const map = await loadSettingsMap(MAIL_KEYS);
  const config = resolveMailConfig(map);
  return {
    enabled: toBool(map[MAIL_KEYS.enabled]),
    smtpHost: map[MAIL_KEYS.smtpHost] || '',
    smtpPort: map[MAIL_KEYS.smtpPort] || '587',
    smtpSecure: toBool(map[MAIL_KEYS.smtpSecure]),
    smtpUser: map[MAIL_KEYS.smtpUser] || '',
    smtpPasswordMasked: maskSecret(map[MAIL_KEYS.smtpPassword] || process.env.SMTP_PASSWORD || ''),
    fromEmail: map[MAIL_KEYS.fromEmail] || '',
    fromName: map[MAIL_KEYS.fromName] || '',
    configured: Boolean(config.smtpHost && config.fromEmail),
    active: config.enabled,
    source: config.source,
  };
};

const saveMailSettings = async (payload = {}, actorId = null) => {
  const existing = await loadSettingsMap(MAIL_KEYS);
  const nextPassword = String(payload.smtpPassword ?? '').trim();
  const passwordToSave = nextPassword || existing[MAIL_KEYS.smtpPassword] || '';

  await upsertSettings(
    [
      {
        key: MAIL_KEYS.enabled,
        value: toBool(payload.enabled) ? 'true' : 'false',
        type: 'boolean',
        group: 'mail',
        description: 'Enable email integration',
      },
      {
        key: MAIL_KEYS.smtpHost,
        value: String(payload.smtpHost || '').trim(),
        group: 'mail',
        description: 'SMTP host',
      },
      {
        key: MAIL_KEYS.smtpPort,
        value: String(payload.smtpPort || 587),
        group: 'mail',
        description: 'SMTP port',
      },
      {
        key: MAIL_KEYS.smtpSecure,
        value: toBool(payload.smtpSecure) ? 'true' : 'false',
        type: 'boolean',
        group: 'mail',
        description: 'Use SSL/TLS for SMTP',
      },
      {
        key: MAIL_KEYS.smtpUser,
        value: String(payload.smtpUser || '').trim(),
        group: 'mail',
        description: 'SMTP username',
      },
      {
        key: MAIL_KEYS.smtpPassword,
        value: passwordToSave,
        type: 'secret',
        group: 'mail',
        description: 'SMTP password',
      },
      {
        key: MAIL_KEYS.fromEmail,
        value: String(payload.fromEmail || '').trim(),
        group: 'mail',
        description: 'From email address',
      },
      {
        key: MAIL_KEYS.fromName,
        value: String(payload.fromName || '').trim(),
        group: 'mail',
        description: 'From display name',
      },
    ],
    actorId
  );

  await refreshMailCache();
  return getMailSettings();
};

module.exports = {
  refreshWhatsAppCache,
  refreshMailCache,
  syncWhatsAppFromEnv,
  syncWhatsAppSessionStatus,
  startWhatsAppQrConnect,
  refreshWhatsAppQrCode,
  disconnectWhatsAppSession,
  getWhatsAppConfig,
  getMailConfig,
  getWhatsAppSettings,
  saveWhatsAppSettings,
  getMailSettings,
  saveMailSettings,
};
