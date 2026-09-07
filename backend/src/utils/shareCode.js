const crypto = require('crypto');
const AppError = require('./AppError');

const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

const makeShareCode = (length = 8) => {
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
};

const publicAppBaseUrl = () =>
  String(process.env.PUBLIC_APP_URL || process.env.CORS_ORIGIN || 'http://localhost:5173').replace(
    /\/$/,
    ''
  );

const buildDriverShortLink = (shareCode) => `${publicAppBaseUrl()}/d/${shareCode}`;

const ensureAssignmentShareCode = async (assignment) => {
  if (!assignment) return null;
  if (assignment.share_code) return assignment.share_code;

  for (let i = 0; i < 8; i += 1) {
    const share_code = makeShareCode();
    try {
      await assignment.update({ share_code });
      return share_code;
    } catch (err) {
      if (err.name !== 'SequelizeUniqueConstraintError') throw err;
    }
  }

  throw new AppError('Could not create a short share link', 500);
};

module.exports = {
  makeShareCode,
  publicAppBaseUrl,
  buildDriverShortLink,
  ensureAssignmentShareCode,
};
