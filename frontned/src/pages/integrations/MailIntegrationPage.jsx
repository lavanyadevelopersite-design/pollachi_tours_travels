import { useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import PageHeader from '../../components/common/PageHeader';
import FormTextField from '../../components/forms/FormTextField';
import FormPasswordField from '../../components/forms/FormPasswordField';
import FormSwitch from '../../components/forms/FormSwitch';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../hooks/useAuth';
import {
  useIntegrationMutation,
  useMailIntegration,
} from '../../hooks/queries/useIntegrations';

const defaults = {
  enabled: false,
  smtpHost: '',
  smtpPort: '587',
  smtpSecure: false,
  smtpUser: '',
  smtpPassword: '',
  fromEmail: '',
  fromName: '',
};

export default function MailIntegrationPage() {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const { data, isLoading } = useMailIntegration();
  const { saveMail, testMail } = useIntegrationMutation();

  const { control, handleSubmit, reset, getValues } = useForm({ defaultValues: defaults });

  useEffect(() => {
    if (!data) return;
    reset({
      enabled: data.enabled === true,
      smtpHost: data.smtpHost || '',
      smtpPort: String(data.smtpPort || '587'),
      smtpSecure: data.smtpSecure === true,
      smtpUser: data.smtpUser || '',
      smtpPassword: '',
      fromEmail: data.fromEmail || '',
      fromName: data.fromName || '',
    });
  }, [data, reset]);

  if (isLoading) return <Loader message="Loading mail integration..." />;

  const onSubmit = handleSubmit(async (values) => {
    await saveMail.mutateAsync({
      ...values,
      smtpPort: Number(values.smtpPort) || 587,
    });
  });

  const handleTest = async () => {
    const to = user?.email;
    if (!to) {
      enqueueSnackbar('Your account email is required to send a test message', {
        variant: 'warning',
      });
      return;
    }
    await saveMail.mutateAsync({
      ...getValues(),
      smtpPort: Number(getValues('smtpPort')) || 587,
    });
    await testMail.mutateAsync({ to });
  };

  return (
    <Box sx={{ pb: 4 }}>
      <PageHeader
        title="Mail Integration"
        subtitle="Configure SMTP settings for system email notifications"
        breadcrumbs={[
          { label: 'Integrations' },
          { label: 'Mail' },
        ]}
      />

      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid rgba(25,118,210,0.22)',
          background: 'linear-gradient(135deg, rgba(25,118,210,0.1) 0%, rgba(66,165,245,0.05) 100%)',
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2.5,
                display: 'grid',
                placeItems: 'center',
                bgcolor: '#1976d2',
                color: '#fff',
                boxShadow: '0 8px 24px rgba(25,118,210,0.35)',
              }}
            >
              <EmailOutlinedIcon sx={{ fontSize: 30 }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 220 }}>
              <Typography variant="h6" fontWeight={800}>
                SMTP Email Service
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Used for password reset, notifications, and customer email delivery.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Chip
                label={data?.active ? 'Active' : 'Inactive'}
                color={data?.active ? 'success' : 'default'}
                sx={{ fontWeight: 700 }}
              />
              {data?.source && data.source !== 'none' && (
                <Chip
                  label={`Source: ${data.source}`}
                  variant="outlined"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Box component="form" onSubmit={onSubmit}>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12 }}>
                <FormSwitch name="enabled" control={control} label="Enable Mail Integration" />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormTextField name="smtpHost" control={control} label="SMTP Host" placeholder="smtp.gmail.com" />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormTextField name="smtpPort" control={control} label="SMTP Port" type="number" />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormSwitch name="smtpSecure" control={control} label="Use SSL/TLS" />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormTextField name="smtpUser" control={control} label="SMTP Username" />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormPasswordField
                  name="smtpPassword"
                  control={control}
                  label="SMTP Password"
                  autoComplete="new-password"
                  helperText={
                    data?.smtpPasswordMasked
                      ? `Current password: ${data.smtpPasswordMasked} (leave blank to keep)`
                      : undefined
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormTextField name="fromEmail" control={control} label="From Email" type="email" />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormTextField name="fromName" control={control} label="From Name" />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={1.5} sx={{ mt: 3 }} flexWrap="wrap" useFlexGap>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={saveMail.isPending}
              >
                {saveMail.isPending ? 'Saving…' : 'Save Integration'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<SendIcon />}
                onClick={handleTest}
                disabled={saveMail.isPending || testMail.isPending}
              >
                {testMail.isPending ? 'Sending…' : 'Send Test Email'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
