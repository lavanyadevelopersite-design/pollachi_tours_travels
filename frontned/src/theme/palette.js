export const colors = {
  primary: '#152238',
  primaryDark: '#0d1526',
  accent: '#2196f3',
  accentHover: '#1976d2',
  accentLight: '#64b5f6',
  success: '#22c55e',
  successLight: '#dcfce7',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  danger: '#ef4444',
  dangerLight: '#fee2e2',
  info: '#06b6d4',
  infoLight: '#cffafe',
  purple: '#8b5cf6',
  purpleLight: '#ede9fe',
  orange: '#f97316',
  orangeLight: '#ffedd5',
  contentBg: '#f0f4f8',
  sidebarBg: '#152238',
  sidebarDark: '#0d1526',
  sidebarActive: '#2196f3',
  topbarBg: '#ffffff',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  white: '#ffffff',
  cardShadow: '0 4px 24px rgba(21, 34, 56, 0.06)',
};

const palette = {
  mode: 'light',
  primary: {
    main: colors.accent,
    dark: colors.accentHover,
    light: colors.accentLight,
    contrastText: '#ffffff',
  },
  secondary: {
    main: colors.primary,
    dark: colors.primaryDark,
    light: '#334155',
    contrastText: '#ffffff',
  },
  success: {
    main: colors.success,
    light: colors.successLight,
    contrastText: '#ffffff',
  },
  warning: {
    main: colors.warning,
    light: colors.warningLight,
    contrastText: '#1e293b',
  },
  error: {
    main: colors.danger,
    light: colors.dangerLight,
    contrastText: '#ffffff',
  },
  info: {
    main: colors.info,
    light: colors.infoLight,
    contrastText: '#ffffff',
  },
  background: {
    default: colors.contentBg,
    paper: colors.white,
  },
  text: {
    primary: colors.textPrimary,
    secondary: colors.textSecondary,
  },
  divider: colors.border,
};

export default palette;
