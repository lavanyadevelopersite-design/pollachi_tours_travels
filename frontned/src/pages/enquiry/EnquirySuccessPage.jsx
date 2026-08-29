import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeIcon from '@mui/icons-material/Home';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { APP_NAME } from '../../utils/constants';

export default function EnquirySuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const enquiryCode = location.state?.enquiryCode || '—';
  const customerName = location.state?.customerName;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: `
          radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.18) 0%, transparent 50%),
          linear-gradient(180deg, #e8eef5 0%, #f0f4f8 50%, #ffffff 100%)
        `,
        py: 6,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            textAlign: 'center',
            bgcolor: '#fff',
            borderRadius: 4,
            p: { xs: 3, md: 5 },
            boxShadow: '0 16px 48px rgba(21,34,56,0.1)',
          }}
        >
          <Box
            sx={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              mx: 'auto',
              mb: 2.5,
              display: 'grid',
              placeItems: 'center',
              bgcolor: alpha('#22c55e', 0.12),
              color: '#16a34a',
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 52 }} />
          </Box>

          <Typography variant="overline" color="text.secondary" letterSpacing={2}>
            {APP_NAME}
          </Typography>
          <Typography variant="h4" fontWeight={800} color="secondary.main" sx={{ mt: 0.5, mb: 1 }}>
            Thank You{customerName ? `, ${customerName.split(' ')[0]}` : ''}!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 420, mx: 'auto' }}>
            Your enquiry has been submitted successfully. Our travel consultant will contact you
            shortly.
          </Typography>

          <Box
            sx={{
              display: 'inline-block',
              px: 3,
              py: 1.5,
              mb: 4,
              borderRadius: 2,
              bgcolor: alpha('#2196f3', 0.08),
              border: '1px dashed',
              borderColor: alpha('#2196f3', 0.35),
            }}
          >
            <Typography variant="caption" color="text.secondary" display="block">
              Reference Number / Enquiry Number
            </Typography>
            <Typography variant="h6" fontWeight={800} color="primary.main" letterSpacing={1}>
              {enquiryCode}
            </Typography>
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            justifyContent="center"
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<AddCircleIcon />}
              onClick={() => navigate('/enquiries')}
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #2196f3 0%, #1565c0 100%)',
              }}
            >
              Submit Another Enquiry
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/login')}
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              Back to Home
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
