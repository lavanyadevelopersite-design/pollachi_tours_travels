import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink } from 'react-router-dom';
import { forgotPasswordSchema } from '../../schemas/auth.schema';
import FormTextField from '../../components/forms/FormTextField';
import authService from '../../services/auth.service';
import { APP_NAME } from '../../utils/constants';

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values) => {
    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword(values.email);
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}>
      <Box
        sx={{
          px: 3,
          py: 3,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #3f4d67 0%, #1c232f 100%)',
          color: '#fff',
        }}
      >
        <FlightTakeoffIcon sx={{ fontSize: 36, color: '#04a9f5', mb: 1 }} />
        <Typography variant="h5" fontWeight={700}>
          Reset Password
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.75, mt: 0.5 }}>
          {APP_NAME}
        </Typography>
      </Box>
      <CardContent sx={{ p: 3.5 }}>
        {sent ? (
          <Alert severity="success">
            If an account exists for that email, a reset link has been sent.
          </Alert>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2.25}>
              {error && <Alert severity="error">{error}</Alert>}
              <Typography variant="body2" color="text.secondary">
                Enter your email and we&apos;ll send you a link to reset your password.
              </Typography>
              <FormTextField name="email" control={control} label="Email Address" type="email" />
              <Button type="submit" variant="contained" size="large" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </Stack>
          </form>
        )}
        <Box mt={2.5} textAlign="center">
          <Link
            component={RouterLink}
            to="/login"
            underline="hover"
            variant="body2"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
          >
            <ArrowBackIcon fontSize="small" /> Back to login
          </Link>
        </Box>
      </CardContent>
    </Card>
  );
}
