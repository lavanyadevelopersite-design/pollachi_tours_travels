import { createTheme } from '@mui/material/styles';
import palette from './palette';
import typography from './typography';
import { colors } from './palette';

const theme = createTheme({
  palette,
  typography,
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(21,34,56,0.06)',
    '0 2px 8px rgba(21,34,56,0.07)',
    '0 4px 16px rgba(21,34,56,0.08)',
    '0 6px 20px rgba(21,34,56,0.09)',
    '0 8px 24px rgba(21,34,56,0.1)',
    '0 10px 28px rgba(21,34,56,0.1)',
    '0 12px 32px rgba(21,34,56,0.11)',
    '0 14px 36px rgba(21,34,56,0.11)',
    '0 16px 40px rgba(21,34,56,0.12)',
    '0 18px 44px rgba(21,34,56,0.12)',
    '0 20px 48px rgba(21,34,56,0.13)',
    '0 22px 52px rgba(21,34,56,0.13)',
    '0 24px 56px rgba(21,34,56,0.14)',
    '0 26px 60px rgba(21,34,56,0.14)',
    '0 28px 64px rgba(21,34,56,0.15)',
    '0 30px 68px rgba(21,34,56,0.15)',
    '0 32px 72px rgba(21,34,56,0.16)',
    '0 34px 76px rgba(21,34,56,0.16)',
    '0 36px 80px rgba(21,34,56,0.17)',
    '0 38px 84px rgba(21,34,56,0.17)',
    '0 40px 88px rgba(21,34,56,0.18)',
    '0 42px 92px rgba(21,34,56,0.18)',
    '0 44px 96px rgba(21,34,56,0.19)',
    '0 46px 100px rgba(21,34,56,0.19)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          '--color-primary': colors.primary,
          '--color-primary-dark': colors.primaryDark,
          '--color-accent': colors.accent,
          '--color-accent-hover': colors.accentHover,
          '--color-success': colors.success,
          '--color-warning': colors.warning,
          '--color-danger': colors.danger,
          '--color-info': colors.info,
          '--color-content-bg': colors.contentBg,
          '--color-sidebar-bg': colors.sidebarBg,
          '--color-topbar-bg': colors.topbarBg,
          '--color-text-primary': colors.textPrimary,
          '--color-text-secondary': colors.textSecondary,
          '--color-border': colors.border,
          '--sidebar-width': '260px',
          '--sidebar-collapsed-width': '72px',
          '--topbar-height': '64px',
        },
        body: {
          backgroundColor: colors.contentBg,
          fontFamily: '"Public Sans", "Poppins", sans-serif',
        },
        '*::-webkit-scrollbar': {
          width: 6,
          height: 6,
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(100,116,139,0.3)',
          borderRadius: 4,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: 'none',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          '&:hover': { boxShadow: 'none' },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentHover} 100%)`,
          color: '#fff',
          '&:hover': {
            background: `linear-gradient(135deg, ${colors.accentHover} 0%, #1565c0 100%)`,
            boxShadow: '0 4px 14px rgba(33,150,243,0.35)',
          },
          '&:disabled': {
            background: '#94a3b8',
            color: '#fff',
          },
        },
        containedSuccess: {
          background: `linear-gradient(135deg, ${colors.success} 0%, #16a34a 100%)`,
          '&:hover': { boxShadow: '0 4px 14px rgba(34,197,94,0.35)' },
        },
        containedError: {
          background: `linear-gradient(135deg, ${colors.danger} 0%, #dc2626 100%)`,
          '&:hover': { boxShadow: '0 4px 14px rgba(239,68,68,0.35)' },
        },
        outlinedPrimary: {
          borderColor: colors.accent,
          color: colors.accent,
          borderWidth: 1.5,
          '&:hover': {
            borderWidth: 1.5,
            bgcolor: 'rgba(33,150,243,0.06)',
            borderColor: colors.accentHover,
          },
        },
        outlinedInherit: {
          borderColor: colors.border,
          color: colors.textSecondary,
          '&:hover': {
            bgcolor: 'rgba(21,34,56,0.04)',
            borderColor: colors.textSecondary,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: colors.cardShadow,
          border: `1px solid ${colors.border}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 16 },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small', fullWidth: true },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          minHeight: 52,
          backgroundColor: '#fff',
          '& .MuiOutlinedInput-input': { py: 1.5 },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.accentLight,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.accent,
            borderWidth: 2,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { fontWeight: 500 },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          borderRadius: 10,
          boxShadow: '0 8px 24px rgba(21,34,56,0.12)',
          border: `1px solid ${colors.border}`,
        },
        option: {
          '&[aria-selected="true"]': {
            bgcolor: 'rgba(33,150,243,0.08)',
          },
          '&.Mui-focused': {
            bgcolor: 'rgba(33,150,243,0.12)',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.sidebarBg,
          color: '#fff',
          borderRight: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.topbarBg,
          color: colors.textPrimary,
          boxShadow: '0 1px 4px rgba(21,34,56,0.06)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600, fontSize: '0.75rem' },
        colorSuccess: {
          bgcolor: colors.successLight,
          color: '#15803d',
        },
        colorWarning: {
          bgcolor: colors.warningLight,
          color: '#b45309',
        },
        colorError: {
          bgcolor: colors.dangerLight,
          color: '#b91c1c',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f8fafc',
          '& .MuiTableCell-head': { fontWeight: 600, color: colors.textSecondary },
        },
      },
    },
  },
});

export default theme;
