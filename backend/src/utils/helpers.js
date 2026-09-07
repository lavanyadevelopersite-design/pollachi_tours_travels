const crypto = require('crypto');

const generateCode = (prefix = '', length = 8) => {
  const random = crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length).toUpperCase();
  return prefix ? `${prefix}-${random}` : random;
};

/**
 * Sequential document numbers: ENQ2026-000001
 */
const generateRunningNumber = async (Model, field, prefix, pad = 6) => {
  const { Op } = require('sequelize');
  const year = new Date().getFullYear();
  const base = `${prefix}${year}-`;
  const last = await Model.findOne({
    where: { [field]: { [Op.like]: `${base}%` } },
    order: [[field, 'DESC']],
    paranoid: false,
    attributes: [field],
  });

  let next = 1;
  if (last?.[field]) {
    const parts = String(last[field]).split('-');
    const num = parseInt(parts[parts.length - 1], 10);
    if (!Number.isNaN(num)) next = num + 1;
  }

  return `${base}${String(next).padStart(pad, '0')}`;
};

const omit = (obj, keys = []) => {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
};

const pick = (obj, keys = []) => {
  const result = {};
  keys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
  });
  return result;
};

const buildSearchWhere = (search, fields = [], Op) => {
  if (!search || !fields.length) return {};
  return {
    [Op.or]: fields.map((field) => ({
      [field]: { [Op.like]: `%${search}%` },
    })),
  };
};

const sanitizeUser = (user) => {
  if (!user) return null;
  const data = user.toJSON ? user.toJSON() : { ...user };
  delete data.password;
  delete data.reset_token;
  delete data.reset_token_expires;

  const role = data.role || null;
  const permissionCodes = (role?.permissions || []).map((p) => (typeof p === 'string' ? p : p.code));

  data.permissions =
    role?.code === 'super_admin' ? ['*', ...permissionCodes] : permissionCodes;
  data.role_code = role?.code || null;
  data.role_name = role?.name || null;
  data.is_driver = role?.code === 'driver' || Boolean(data.driver_id);
  data.name =
    [data.first_name, data.last_name].filter(Boolean).join(' ') || data.email;

  // Keep role metadata only — full permission objects bloat storage and can break login
  if (data.role) {
    data.role = {
      id: data.role.id,
      name: data.role.name,
      code: data.role.code,
      is_active: data.role.is_active,
    };
  }

  return data;
};

const mainCityName = (place) => {
  if (place == null) return '';
  const text = String(place).trim();
  if (!text || text === '—' || text === '-') return '';
  return text.split(',')[0].trim();
};

const formatRouteLabel = (from, to, empty = null) => {
  const fromText = from == null ? '' : String(from).trim();
  const toText = to == null ? '' : String(to).trim();

  if (!toText && /→|->/.test(fromText)) {
    const [left, ...rest] = fromText.split(/\s*(?:→|->)\s*/);
    return formatRouteLabel(left, rest.join(' → '), empty);
  }

  const fromCity = mainCityName(fromText);
  const toCity = mainCityName(toText);
  if (fromCity && toCity) {
    if (fromCity.toLowerCase() === toCity.toLowerCase()) return fromCity;
    return `${fromCity} - ${toCity}`;
  }
  return fromCity || toCity || empty;
};

module.exports = {
  generateCode,
  generateRunningNumber,
  omit,
  pick,
  buildSearchWhere,
  sanitizeUser,
  mainCityName,
  formatRouteLabel,
};
