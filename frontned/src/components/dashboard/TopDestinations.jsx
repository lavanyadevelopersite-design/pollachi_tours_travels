import { Box, Card, CardContent, CardHeader, Typography } from '@mui/material';
import { useState } from 'react';
import { normalizeTopDestinations, dashboardGlassCardLightSx } from '../../utils/dashboardData';
import { publicAssetUrl } from '../../utils/constants';

const DEFAULT_IMAGE = publicAssetUrl('dashboard/goa.svg');

export default function TopDestinations({ data, title = 'Top Destinations', transparent = false }) {
  const destinations = normalizeTopDestinations(data);
  const maxBookings = Math.max(...destinations.map((d) => d.bookings ?? d.value ?? 0), 1);
  const [brokenImages, setBrokenImages] = useState({});

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        ...(transparent ? dashboardGlassCardLightSx : {}),
      }}
    >
      <CardHeader
        title={title}
        titleTypographyProps={{ variant: 'h6', fontWeight: 700, fontSize: '1rem' }}
        sx={{ pb: 0, position: 'relative', zIndex: 2 }}
      />
      <CardContent sx={{ pt: 1, position: 'relative', zIndex: 2 }}>
        <Box display="flex" flexDirection="column" gap={2.2}>
          {destinations.map((dest, index) => {
            const bookings = dest.bookings ?? dest.value ?? 0;
            const imageKey = `${dest.name}-${index}`;
            const image = brokenImages[imageKey] ? DEFAULT_IMAGE : dest.image;

            return (
              <Box key={imageKey} display="flex" alignItems="center" gap={1.5}>
                <Typography variant="body2" color="text.secondary" fontWeight={700} minWidth={14}>
                  {index + 1}
                </Typography>
                <Box
                  component="img"
                  src={image}
                  alt={dest.name}
                  loading="lazy"
                  onError={() => {
                    setBrokenImages((prev) =>
                      prev[imageKey] ? prev : { ...prev, [imageKey]: true }
                    );
                  }}
                  sx={{
                    width: 56,
                    height: 40,
                    borderRadius: 1.5,
                    objectFit: 'cover',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(21,34,56,0.12)',
                    bgcolor: 'rgba(33,150,243,0.08)',
                  }}
                />
                <Box flex={1} minWidth={0}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {dest.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {bookings} bookings
                  </Typography>
                  <Box
                    sx={{
                      mt: 0.75,
                      height: 4,
                      borderRadius: 2,
                      bgcolor: 'rgba(33,150,243,0.12)',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        width: `${(bookings / maxBookings) * 100}%`,
                        height: '100%',
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}
