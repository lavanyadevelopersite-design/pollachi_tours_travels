import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  Alert,
} from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../schemas/auth.schema';
import FormTextField from '../../components/forms/FormTextField';
import FormPasswordField from '../../components/forms/FormPasswordField';
import { useAuth } from '../../hooks/useAuth';
import { useBranding } from '../../hooks/queries/useBranding';
import { resolveMediaUrl } from '../../utils/constants';

const LOGIN_TITLE = 'Pollachi Tours and Travels';
const LOGIN_SUBTITLE = 'Great Journeys & Fascinating Places';

function brandLogoSrc(path) {
  const url = resolveMediaUrl(path);
  if (!url) return null;
  const version = encodeURIComponent(String(path).split('/').pop() || '1');
  return `${url}${url.includes('?') ? '&' : '?'}v=${version}`;
}

export default function Login() {
  const { login } = useAuth();
  const { data: branding } = useBranding();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const logoUrl = brandLogoSrc(branding?.company_logo);
  const showLogo = Boolean(logoUrl) && !logoFailed;
  const title = LOGIN_TITLE;

  useEffect(() => {
    setLogoFailed(false);
  }, [logoUrl]);

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values) => {
    setError('');
    setLoading(true);
    try {
      await login(values);
    } catch (err) {
      const apiMessage = err?.response?.data?.message;
      if (apiMessage) {
        setError(apiMessage);
      } else if (!err?.response) {
        setError('Unable to reach the server. Please check that the backend is running.');
      } else {
        setError('Invalid email or password');
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
        animation: 'fadeUp 0.5s ease',
        '@keyframes fadeUp': {
          from: { opacity: 0, transform: 'translateY(16px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          color: '#fff',
          px: 3,
          py: showLogo ? 4 : 3.5,
          minHeight: showLogo ? 168 : 'auto',
          textAlign: 'center',
          background: showLogo ? '#1c232f' : 'linear-gradient(135deg, #3f4d67 0%, #1c232f 100%)',
          overflow: 'hidden',
        }}
      >
        {showLogo && (
          <>
            <Box
              component="img"
              src={logoUrl}
              alt=""
              onError={() => setLogoFailed(true)}
              aria-hidden
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                pointerEvents: 'none',
                display: 'block',
              }}
            />
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(28,35,47,0.45) 0%, rgba(28,35,47,0.78) 52%, rgba(28,35,47,0.94) 100%)',
                pointerEvents: 'none',
              }}
            />
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(135deg, rgba(63,77,103,0.35) 0%, rgba(28,35,47,0.15) 50%, rgba(28,35,47,0.55) 100%)',
                pointerEvents: 'none',
              }}
            />
          </>
        )}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {!showLogo && (
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2.5,
                bgcolor: '#04a9f5',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
                boxShadow: '0 8px 24px rgba(4,169,245,0.4)',
              }}
            >
              <FlightTakeoffIcon sx={{ fontSize: 28 }} />
            </Box>
          )}
          <Typography
            variant="h4"
            fontWeight={700}
            letterSpacing="-0.02em"
            sx={{
              textShadow: showLogo ? '0 2px 12px rgba(0,0,0,0.45)' : 'none',
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              opacity: showLogo ? 0.92 : 0.75,
              mt: 0.75,
              textShadow: showLogo ? '0 1px 8px rgba(0,0,0,0.35)' : 'none',
            }}
          >
            {LOGIN_SUBTITLE}
          </Typography>
        </Box>
      </Box>

      <CardContent sx={{ p: 3.5 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2.25}>
            <FormTextField name="email" control={control} label="Email Address" type="email" />
            <FormPasswordField name="password" control={control} label="Password" />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{ py: 1.25, fontWeight: 600 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}
