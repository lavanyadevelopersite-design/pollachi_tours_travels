export const EXISTING_PASSWORD_MASK = '••••••••';

export const isExistingPasswordMask = (value) =>
  value === EXISTING_PASSWORD_MASK || value === '********';
