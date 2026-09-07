import { Box, Stack, Typography } from '@mui/material';

function FlightDecoration() {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        right: { xs: 8, md: 20 },
        top: 8,
        width: { xs: 120, md: 200 },
        height: 72,
        pointerEvents: 'none',
        opacity: 0.85,
      }}
    >
      <svg viewBox="0 0 200 72" width="100%" height="100%" fill="none">
        <path
          d="M8 58 C70 8, 130 8, 192 40"
          stroke="#90caf9"
          strokeWidth="1.6"
          strokeDasharray="4 6"
        />
        <circle cx="192" cy="40" r="5" fill="#42a5f5" />
        <circle cx="192" cy="40" r="9" fill="#42a5f5" opacity="0.2" />
        <g transform="translate(86 10)">
          <path
            d="M2 10 L22 6 L26 10 L22 9 L14 18 L10 17 L14 10 L6 12 Z"
            fill="#64b5f6"
          />
        </g>
      </svg>
    </Box>
  );
}

function LandscapeDecoration() {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        right: 0,
        top: 0,
        width: { xs: 140, md: 220 },
        height: 88,
        pointerEvents: 'none',
        opacity: 0.9,
      }}
    >
      <svg viewBox="0 0 220 88" width="100%" height="100%" fill="none">
        <path d="M40 88 L90 38 L130 62 L160 42 L220 88 Z" fill="#c8efe8" />
        <path d="M110 88 L150 48 L190 70 L220 52 L220 88 Z" fill="#b3e8de" />
        <path d="M168 70 V42" stroke="#0f766e" strokeWidth="2.2" />
        <path d="M168 46 C156 46, 158 34, 168 28 C178 34, 180 46, 168 46 Z" fill="#14b8a6" />
        <path d="M168 40 C160 38, 162 30, 168 26 C174 30, 176 38, 168 40 Z" fill="#2dd4bf" />
        <path d="M196 76 V52" stroke="#0f766e" strokeWidth="2" />
        <path d="M196 56 C186 56, 188 46, 196 40 C204 46, 206 56, 196 56 Z" fill="#14b8a6" />
      </svg>
    </Box>
  );
}

export default function EnquiryFormSection({
  title,
  subtitle,
  icon,
  accent = '#2563eb',
  decoration,
  headerAction,
  children,
}) {
  return (
    <Box
      sx={{
        mb: 2.5,
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'rgba(148, 163, 184, 0.28)',
        bgcolor: '#f7fbff',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          px: { xs: 2, md: 2.5 },
          py: 2,
          bgcolor: '#fff',
          borderBottom: '1px solid',
          borderColor: 'rgba(148, 163, 184, 0.18)',
        }}
      >
        {decoration === 'flight' && <FlightDecoration />}
        {decoration === 'landscape' && <LandscapeDecoration />}
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          justifyContent="space-between"
          useFlexGap
          flexWrap="wrap"
          sx={{ position: 'relative', zIndex: 1 }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                bgcolor: accent,
                color: '#fff',
                flexShrink: 0,
                boxShadow: `0 8px 16px ${accent}40`,
              }}
            >
              {icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" fontWeight={800} color="#0f172a" sx={{ lineHeight: 1.2 }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Stack>
          {headerAction}
        </Stack>
      </Box>
      <Box sx={{ px: { xs: 2, md: 2.5 }, py: 2.25 }}>{children}</Box>
    </Box>
  );
}
