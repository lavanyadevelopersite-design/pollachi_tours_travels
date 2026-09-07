export const buildWhatsAppUrl = (phone, message) => {
  const digits = String(phone || '').replace(/\D/g, '');
  const text = encodeURIComponent(String(message || ''));
  if (!digits) return `https://wa.me/?text=${text}`;
  const waPhone = digits.length === 10 ? `91${digits}` : digits.replace(/^0+/, '');
  return `https://wa.me/${waPhone}?text=${text}`;
};

export const isValidWhatsAppPhone = (phone) => {
  let digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return false;
  while (digits.length > 10 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  if (digits.length === 10) return true;
  if (digits.length >= 11 && digits.length <= 15 && !digits.startsWith('0')) return true;
  return false;
};

export const openWhatsAppShare = (phone, message) => {
  window.open(buildWhatsAppUrl(phone, message), '_blank', 'noopener,noreferrer');
};
