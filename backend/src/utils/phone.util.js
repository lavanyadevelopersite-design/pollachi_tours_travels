const DEFAULT_COUNTRY_CODE = String(process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || '91').replace(
  /\D/g,
  ''
);

/**
 * Normalize a phone value to E.164 (+CC...) for WhatsApp providers (Wasender, etc.).
 * Handles common Indian formats: 9876543210, 09876543210, 919876543210, +91 98765 43210.
 */
const normalizeWhatsAppPhone = (phone, countryCode = DEFAULT_COUNTRY_CODE) => {
  if (phone == null || phone === '') return '';

  let digits = String(phone).replace(/\D/g, '');
  if (!digits) return '';

  const cc = String(countryCode || DEFAULT_COUNTRY_CODE).replace(/\D/g, '') || '91';

  while (digits.length > 10 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  if (digits.length === 10) {
    digits = `${cc}${digits}`;
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = `${cc}${digits.slice(1)}`;
  } else if (digits.startsWith(`${cc}${cc}`)) {
    const local = digits.slice(cc.length * 2);
    const normalizedLocal = local.startsWith('0') ? local.slice(1) : local;
    if (normalizedLocal.length === 10) {
      digits = `${cc}${normalizedLocal}`;
    }
  }

  if (digits.length < 11 || digits.length > 15 || digits.startsWith('0')) {
    return '';
  }

  return `+${digits}`;
};

const isValidWhatsAppPhone = (phone) => Boolean(normalizeWhatsAppPhone(phone));

module.exports = {
  DEFAULT_COUNTRY_CODE,
  normalizeWhatsAppPhone,
  isValidWhatsAppPhone,
};
