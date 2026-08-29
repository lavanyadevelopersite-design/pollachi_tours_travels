import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

export default function DashboardInfoCard({
  title,
  accent = '#4f46e5',
  icon: Icon,
  items = [],
  loading = false,
  empty = 'No records yet',
  maxHeight = 320,
}) {
  return (
    <Box
      sx={{
        height: '100%',
        overflow: 'hidden',
        borderRadius: 3,
        border: `1px solid ${alpha(accent, 0.22)}`,
        boxShadow: `0 10px 28px ${alpha(accent, 0.16)}`,
        bgcolor: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.35,
          display: 'flex',
          alignItems: 'center',
          gap: 1.1,
          background: `linear-gradient(135deg, ${accent} 0%, ${alpha(accent, 0.78)} 100%)`,
          color: '#fff',
        }}
      >
        {Icon ? (
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              display: 'grid',
              placeItems: 'center',
              bgcolor: alpha('#fff', 0.18),
            }}
          >
            <Icon sx={{ fontSize: 18 }} />
          </Box>
        ) : null}
        <Typography variant="h6" fontWeight={800} fontSize="1.05rem" lineHeight={1.2}>
          {title}
        </Typography>
      </Box>

      <Box sx={{ p: 1.25, maxHeight, overflowY: 'auto', flex: 1 }}>
        {loading ? (
          <Typography variant="body2" color="text.secondary" py={2} textAlign="center">
            Loading…
          </Typography>
        ) : items.length ? (
          items.map((item, index) => {
            const content = (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  px: 1.25,
                  py: 1,
                  borderRadius: 1.5,
                  bgcolor: index % 2 ? alpha(accent, 0.06) : 'transparent',
                  textDecoration: 'none',
                  color: 'inherit',
                  '&:hover': item.to ? { bgcolor: alpha(accent, 0.12) } : undefined,
                }}
              >
                {item.dot ? (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: item.dot,
                      flexShrink: 0,
                    }}
                  />
                ) : null}
                <Typography
                  variant="body2"
                  noWrap
                  title={item.label}
                  sx={{ flex: 1, minWidth: 0, fontWeight: 600, color: '#0f172a', fontSize: 13 }}
                >
                  {item.label}
                </Typography>
                {item.value != null && item.value !== '' ? (
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{
                      fontWeight: 800,
                      fontSize: 13,
                      color: item.valueColor || accent,
                      flexShrink: 0,
                    }}
                  >
                    {item.value}
                  </Typography>
                ) : null}
              </Box>
            );

            return item.to ? (
              <Box key={item.id || `${item.label}-${index}`} component={RouterLink} to={item.to} sx={{ display: 'block' }}>
                {content}
              </Box>
            ) : (
              <Box key={item.id || `${item.label}-${index}`}>{content}</Box>
            );
          })
        ) : (
          <Typography variant="body2" color="text.secondary" py={2} textAlign="center">
            {empty}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
