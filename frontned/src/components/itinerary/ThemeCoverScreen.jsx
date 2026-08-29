import { useEffect, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { APP_NAME, resolveMediaUrl } from '../../utils/constants';
import { THEME_COVER_IMAGES } from '../../utils/itineraryThemes';

export default function ThemeCoverScreen({ branding, data, variant = 'dream_vacay' }) {
  const [active, setActive] = useState(variant === 'scenic_escape' ? 1 : 0);
  const logo = resolveMediaUrl(branding?.company_logo);
  const company = branding?.company_name || APP_NAME;
  const guest = data?.enquiry?.customer_name;
  const trip = data?.title || routeFallback(data);

  useEffect(() => {
    const timer = setInterval(() => setActive((n) => (n === 0 ? 1 : 0)), 5200);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box className="theme-cover-screen">
      <Box sx={{ display: 'none', '@media print': { display: 'block' } }}>
        {THEME_COVER_IMAGES.map((src) => (
          <Box
            key={`print-${src}`}
            component="img"
            src={src}
            alt=""
            sx={{ width: '100%', height: 'auto', display: 'block', pageBreakAfter: 'always' }}
          />
        ))}
      </Box>

      <Box
        className="no-print"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          minHeight: { xs: 460, sm: 560, md: 680 },
          bgcolor: '#fff4dc',
        }}
      >
        {THEME_COVER_IMAGES.map((src, i) => (
          <Box
            key={src}
            className={i === active ? 'theme-cover-slide is-active' : 'theme-cover-slide'}
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${src})`,
              backgroundSize: { xs: 'cover', md: 'cover' },
              backgroundPosition: 'center',
              opacity: i === active ? 1 : 0,
              transform: i === active ? 'scale(1.05)' : 'scale(1.12)',
              transition: 'opacity 1.1s ease, transform 6.5s ease',
            }}
          />
        ))}

        <Box className="theme-cover-wash" />

        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            minHeight: { xs: 460, sm: 560, md: 680 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: { xs: 1.5, sm: 3 },
            py: { xs: 1.5, md: 2.5 },
          }}
        >
          {logo ? (
            <Box className="theme-logo-orbit" sx={{ width: { xs: 86, sm: 110 }, height: { xs: 86, sm: 110 } }}>
              <Box className="theme-logo-badge">
                <Box component="img" src={logo} alt={company} className="theme-logo-img" />
              </Box>
            </Box>
          ) : (
            <Box />
          )}

          {(guest || trip) && (
            <Box className="theme-cover-chip">
              <Typography fontWeight={800} sx={{ fontSize: { xs: 13, sm: 15 } }}>
                {guest ? `${guest} · ` : ''}
                {trip}
              </Typography>
            </Box>
          )}
        </Box>

        <Stack
          direction="row"
          spacing={0.8}
          sx={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 3 }}
        >
          {THEME_COVER_IMAGES.map((_, i) => (
            <Box
              key={i}
              onClick={() => setActive(i)}
              sx={{
                width: i === active ? 22 : 8,
                height: 8,
                borderRadius: 8,
                bgcolor: i === active ? '#ff8a00' : 'rgba(255,255,255,0.85)',
                cursor: 'pointer',
                transition: 'all .25s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

function routeFallback(data) {
  return (data?.destinations || []).map((d) => d.name).filter(Boolean).join(' · ') || 'Your journey';
}
