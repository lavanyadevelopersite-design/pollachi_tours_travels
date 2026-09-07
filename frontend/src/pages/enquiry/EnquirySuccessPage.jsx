import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Container, Stack, Typography, alpha } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useBranding } from '../../hooks/queries/useBranding';
import { APP_NAME, PUBLIC_ENQUIRY_PATH, resolveMediaUrl } from '../../utils/constants';

function brandLogoSrc(path) {
  const url = resolveMediaUrl(path);
  if (!url) return null;
  const version = encodeURIComponent(String(path).split('/').pop() || '1');
  return `${url}${url.includes('?') ? '&' : '?'}v=${version}`;
}

export default function EnquirySuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: branding } = useBranding();
  const [logoFailed, setLogoFailed] = useState(false);
  const enquiryCode = location.state?.enquiryCode || '';
  const customerName = location.state?.customerName;
  const firstName = customerName ? String(customerName).trim().split(' ')[0] : '';
  const logoUrl = brandLogoSrc(branding?.company_logo);
  const showLogo = Boolean(logoUrl) && !logoFailed;
  const companyName = branding?.company_name || APP_NAME;

  useEffect(() => {
    setLogoFailed(false);
  }, [logoUrl]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: `
          radial-gradient(ellipse at 50% 0%, rgba(13,148,136,0.2) 0%, transparent 52%),
          linear-gradient(180deg, #e8eef5 0%, #f4f8fc 48%, #ffffff 100%)
        `,
        py: { xs: 4, md: 6 },
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            textAlign: 'center',
            bgcolor: '#fff',
            borderRadius: 4,
            p: { xs: 3, md: 5 },
            boxShadow: '0 18px 48px rgba(15, 23, 42, 0.1)',
          }}
        >
          <Box
            sx={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              mx: 'auto',
              mb: 2.25,
              display: 'grid',
              placeItems: 'center',
              bgcolor: alpha('#0d9488', 0.12),
              color: '#0f766e',
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 52 }} />
          </Box>

          {showLogo ? (
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 2.5,
                mx: 'auto',
                mb: 2,
                bgcolor: '#fff',
                border: '1px solid',
                borderColor: 'rgba(15, 23, 42, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <Box
                component="img"
                src={logoUrl}
                alt={companyName}
                onError={() => setLogoFailed(true)}
                sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 0.75 }}
              />
            </Box>
          ) : null}

          <Typography variant="overline" color="text.secondary" letterSpacing={2} fontWeight={700}>
            {companyName}
          </Typography>
          <Typography
            variant="h4"
            fontWeight={800}
            color="#0f172a"
            sx={{ mt: 0.75, mb: 1.25, fontSize: { xs: '1.65rem', md: '2rem' } }}
          >
            Thanks for contacting us{firstName ? `, ${firstName}` : ''}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, maxWidth: 420, mx: 'auto', lineHeight: 1.7 }}
          >
            We have received your enquiry. Our team will get back to you shortly.
          </Typography>

          {enquiryCode ? (
            <Box
              sx={{
                display: 'inline-block',
                px: 3,
                py: 1.5,
                mb: 3.5,
                borderRadius: 2,
                bgcolor: alpha('#0d9488', 0.08),
                border: '1px dashed',
                borderColor: alpha('#0d9488', 0.35),
              }}
            >
              <Typography variant="caption" color="text.secondary" display="block">
                Enquiry reference
              </Typography>
              <Typography variant="h6" fontWeight={800} color="#0f766e" letterSpacing={1}>
                {enquiryCode}
              </Typography>
            </Box>
          ) : null}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              startIcon={<AddCircleIcon />}
              onClick={() => navigate(PUBLIC_ENQUIRY_PATH)}
              sx={{
                borderRadius: 2.5,
                fontWeight: 800,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #0d9488 0%, #2563eb 100%)',
              }}
            >
              Submit another enquiry
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
