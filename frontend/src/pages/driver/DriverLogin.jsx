import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useSearchParams } from 'react-router-dom';
import FormTextField from '../../components/forms/FormTextField';
import FormPasswordField from '../../components/forms/FormPasswordField';
import { useAuth } from '../../hooks/useAuth';
import { useBranding } from '../../hooks/queries/useBranding';
import { resolveMediaUrl } from '../../utils/constants';
import enquiryService from '../../services/enquiry.service';

const schema = z.object({
  login: z.string().trim().min(3, 'Enter phone or email'),
  password: z.string().min(1, 'Password is required'),
});

function brandLogoSrc(path) {
  const url = resolveMediaUrl(path);
  if (!url) return null;
  const version = encodeURIComponent(String(path).split('/').pop() || '1');
  return `${url}${url.includes('?') ? '&' : '?'}v=${version}`;
}

export default function DriverLogin() {
  const { loginDriver } = useAuth();
  const { data: branding } = useBranding();
  const { code: shareCode } = useParams();
  const [searchParams] = useSearchParams();
  const queryEnquiry = searchParams.get('enquiry') || '';
  const queryTrip = searchParams.get('trip') || '';

  const [shareMeta, setShareMeta] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    if (!shareCode) {
      setShareMeta(null);
      return;
    }
    let cancelled = false;
    enquiryService
      .publicDriverShare(shareCode)
      .then((res) => {
        if (cancelled) return;
        setShareMeta(res.data?.data || res.data || null);
      })
      .catch(() => {
        if (!cancelled) setShareMeta(null);
      });
    return () => {
      cancelled = true;
    };
  }, [shareCode]);

  const enquiryParam = shareMeta?.enquiry_code || queryEnquiry;
  const tripParam = shareMeta?.trip_id || queryTrip;

  const logoUrl = brandLogoSrc(branding?.company_logo);
  const showLogo = Boolean(logoUrl) && !logoFailed;

  useEffect(() => {
    setLogoFailed(false);
  }, [logoUrl]);

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { login: '', password: '' },
  });

  const onSubmit = async (values) => {
    setError('');
    setLoading(true);
    try {
      await loginDriver(values, {
        tripId: tripParam || undefined,
        enquiry: enquiryParam || undefined,
        shareCode: shareCode || undefined,
      });
    } catch (err) {
      const apiMessage = err?.response?.data?.message;
      if (apiMessage) setError(apiMessage);
      else if (!err?.response) {
        setError('Unable to reach the server. Please check that the backend is running.');
      } else {
        setError('Invalid phone/email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <Box
        sx={{
          color: '#fff',
          px: 3,
          py: 3.5,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #0f766e 0%, #1c232f 100%)',
        }}
      >
        <Box
          sx={{
            width: showLogo ? 72 : 56,
            height: showLogo ? 72 : 56,
            borderRadius: 2.5,
            bgcolor: showLogo ? 'rgba(255,255,255,0.08)' : '#14b8a6',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1.5,
            overflow: 'hidden',
          }}
        >
          {showLogo ? (
            <Box
              component="img"
              src={logoUrl}
              alt="Logo"
              onError={() => setLogoFailed(true)}
              sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 0.75 }}
            />
          ) : (
            <DirectionsCarFilledOutlinedIcon sx={{ fontSize: 28 }} />
          )}
        </Box>
        <Typography variant="h5" fontWeight={700}>
          Driver Login
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.75 }}>
          Only assigned drivers can update trip details
        </Typography>
        {enquiryParam && (
          <Chip
            icon={<ConfirmationNumberOutlinedIcon sx={{ color: '#fff !important' }} />}
            label={`Enquiry: ${enquiryParam}`}
            sx={{
              mt: 1.5,
              fontWeight: 700,
              color: '#fff',
              bgcolor: 'rgba(255,255,255,0.16)',
              '& .MuiChip-icon': { color: '#fff' },
            }}
          />
        )}
      </Box>

      <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        {enquiryParam && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Sign in to update trip status and KM for enquiry <strong>{enquiryParam}</strong>.
            Updates are saved against this enquiry.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2.25}>
            <FormTextField
              name="login"
              control={control}
              label="Phone or Email"
              autoComplete="username"
              inputProps={{ inputMode: 'tel' }}
            />
            <FormPasswordField name="password" control={control} label="Password" />
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{
                py: 1.35,
                fontWeight: 700,
                bgcolor: '#0f766e',
                '&:hover': { bgcolor: '#0d9488' },
              }}
            >
              {loading ? 'Signing in...' : enquiryParam ? 'Open Enquiry Trip' : 'Sign In to Trips'}
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}
