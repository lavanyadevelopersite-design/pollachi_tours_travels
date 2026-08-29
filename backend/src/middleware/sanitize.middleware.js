const xss = require('xss');

const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    return xss(value.trim());
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === 'object') {
    const sanitized = {};
    Object.keys(value).forEach((key) => {
      sanitized[key] = sanitizeValue(value[key]);
    });
    return sanitized;
  }
  return value;
};

const sanitize = (req, res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
};

module.exports = sanitize;
