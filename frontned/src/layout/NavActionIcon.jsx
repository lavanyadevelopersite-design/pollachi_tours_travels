import { IconButton, Tooltip } from '@mui/material';

export default function NavActionIcon({
  title,
  onClick,
  color,
  hoverBg = 'rgba(33,150,243,0.1)',
  children,
}) {
  return (
    <Tooltip title={title}>
      <IconButton
        onClick={onClick}
        aria-label={title}
        sx={{
          color,
          transition: 'transform 0.25s ease, background-color 0.25s ease, box-shadow 0.25s ease',
          animation: 'navIconFloat 2.6s ease-in-out infinite',
          '@keyframes navIconFloat': {
            '0%, 100%': { transform: 'translateY(0) scale(1)' },
            '50%': { transform: 'translateY(-2px) scale(1.05)' },
          },
          '&:hover': {
            transform: 'translateY(-2px) scale(1.12)',
            bgcolor: hoverBg,
            boxShadow: `0 6px 18px ${hoverBg}`,
            animation: 'none',
          },
        }}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}
