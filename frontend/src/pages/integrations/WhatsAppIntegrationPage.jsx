import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import QRCode from 'qrcode';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import FormTextField from '../../components/forms/FormTextField';
import FormPasswordField from '../../components/forms/FormPasswordField';
import FormSwitch from '../../components/forms/FormSwitch';
import Loader from '../../components/common/Loader';
import {
  useIntegrationMutation,
  useWhatsAppIntegration,
} from '../../hooks/queries/useIntegrations';

const defaults = {
  phoneNumber: '',
  personalAccessToken: '',
  enabled: true,
  apiKey: '',
  apiUrl: 'https://www.wasenderapi.com/api/send-message',
  uploadUrl: 'https://www.wasenderapi.com/api/upload',
};

const extractConnectPayload = (result) => result?.data?.data || result?.data || {};

const extractQrValue = (payload) =>
  payload?.qrCode || payload?.qrcode || payload?.qr_code || payload?.qr || '';

const isDirectQrImage = (value) =>
  Boolean(value) &&
  (String(value).startsWith('data:image') || /^https?:\/\//i.test(String(value)));

export default function WhatsAppIntegrationPage() {
  const navigate = useNavigate();
  const [qrImage, setQrImage] = useState('');
  const [pendingQr, setPendingQr] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [waitingForScan, setWaitingForScan] = useState(false);
  const formInitializedRef = useRef(false);

  const { data, isLoading, refetch } = useWhatsAppIntegration({ poll: waitingForScan });
  const {
    saveWhatsApp,
    connectWhatsApp,
    refreshWhatsAppQr,
    syncWhatsAppSession,
    disconnectWhatsApp,
  } = useIntegrationMutation();

  const { control, handleSubmit, reset, getValues } = useForm({ defaultValues: defaults });

  useEffect(() => {
    if (!data || formInitializedRef.current) return;
    reset({
      phoneNumber: data.linkedPhone || '',
      personalAccessToken: '',
      enabled: data.enabled !== false,
      apiKey: '',
      apiUrl: data.apiUrl || defaults.apiUrl,
      uploadUrl: data.uploadUrl || defaults.uploadUrl,
    });
    formInitializedRef.current = true;
  }, [data, reset]);

  useEffect(() => {
    if (!data?.sessionConnected) return;
    setWaitingForScan(false);
    setPendingQr('');
    if (data.linkedPhone) {
      reset({
        phoneNumber: data.linkedPhone,
        personalAccessToken: '',
        enabled: data.enabled !== false,
        apiKey: '',
        apiUrl: data.apiUrl || defaults.apiUrl,
        uploadUrl: data.uploadUrl || defaults.uploadUrl,
      });
    }
  }, [data?.sessionConnected, data?.linkedPhone, data?.enabled, data?.apiUrl, data?.uploadUrl, reset]);

  useEffect(() => {
    const qrString = pendingQr;
    if (!qrString) {
      setQrImage('');
      return undefined;
    }

    if (isDirectQrImage(qrString)) {
      setQrImage(qrString);
      return undefined;
    }

    let active = true;
    QRCode.toDataURL(qrString, { margin: 2, width: 280, errorCorrectionLevel: 'M' })
      .then((url) => {
        if (active) setQrImage(url);
      })
      .catch(() => {
        if (active) setQrImage('');
      });

    return () => {
      active = false;
    };
  }, [pendingQr]);

  useEffect(() => {
    if (!waitingForScan || data?.sessionConnected) return undefined;

    const timer = setInterval(() => {
      syncWhatsAppSession.mutate();
    }, 3000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waitingForScan, data?.sessionConnected]);

  useEffect(() => {
    if (data?.sessionConnected) {
      setWaitingForScan(false);
      setPendingQr('');
    }
  }, [data?.sessionConnected]);

  const sessionLinked = Boolean(data?.sessionConnected);
  const messagingReady = Boolean(data?.active);

  const statusLabel = useMemo(() => {
    if (sessionLinked) return 'Connected';
    if (waitingForScan) return 'Waiting for scan';
    if (messagingReady) return 'API ready — link number';
    return 'Not Connected';
  }, [sessionLinked, waitingForScan, messagingReady]);

  if (isLoading && !data) return <Loader message="Loading WhatsApp integration..." />;

  const onSubmitAdvanced = handleSubmit(async (values) => {
    await saveWhatsApp.mutateAsync(values);
  });

  const handleConnect = async () => {
    const values = getValues();
    const result = await connectWhatsApp.mutateAsync({
      phoneNumber: values.phoneNumber,
      personalAccessToken: values.personalAccessToken,
      forceReconnect: waitingForScan,
    });
    const payload = extractConnectPayload(result);
    if (payload?.connected) {
      setWaitingForScan(false);
      setPendingQr('');
      await refetch();
      return;
    }

    let qr = extractQrValue(payload);
    if (!qr) {
      const refresh = await refreshWhatsAppQr.mutateAsync();
      qr = extractQrValue(extractConnectPayload(refresh));
    }

    setPendingQr(qr);
    setWaitingForScan(true);
  };

  const handleRefreshQr = async () => {
    const result = await refreshWhatsAppQr.mutateAsync();
    const payload = extractConnectPayload(result);
    setPendingQr(extractQrValue(payload));
    setWaitingForScan(true);
  };

  return (
    <Box sx={{ pb: 4 }}>
      <PageHeader
        title="WhatsApp Integration"
        subtitle="Link your WhatsApp number using QR scan"
        breadcrumbs={[
          { label: 'Integrations' },
          { label: 'WhatsApp' },
        ]}
      />

      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid rgba(37,211,102,0.25)',
          background: 'linear-gradient(135deg, rgba(37,211,102,0.12) 0%, rgba(18,140,126,0.06) 100%)',
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
                bgcolor: '#25D366',
                color: '#fff',
                boxShadow: '0 8px 24px rgba(37,211,102,0.35)',
              }}
            >
              <WhatsAppIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 220 }}>
              <Typography variant="h6" fontWeight={800}>
                Link Your WhatsApp
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Connect your business WhatsApp to send itineraries, receipts, and invoices automatically.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label={statusLabel}
                color={sessionLinked ? 'success' : waitingForScan ? 'info' : 'warning'}
                sx={{ fontWeight: 700 }}
              />
              {data?.linkedPhone && (
                <Chip label={data.linkedPhone} variant="outlined" sx={{ fontWeight: 600 }} />
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
                Step 1 — Enter details
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <FormTextField
                    name="phoneNumber"
                    control={control}
                    label="WhatsApp Number *"
                    placeholder="+919876543210"
                    helperText="Include country code. Example: +91 for India"
                    disabled={sessionLinked}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormPasswordField
                    name="personalAccessToken"
                    control={control}
                    label="Wasender Personal Access Token *"
                    autoComplete="off"
                    helperText={
                      data?.personalAccessTokenMasked
                        ? `Saved token: ${data.personalAccessTokenMasked} (leave blank to keep)`
                        : 'Create at wasenderapi.com → Settings → Personal Access Token'
                    }
                    disabled={sessionLinked}
                  />
                </Grid>
              </Grid>

              <Stack direction="row" spacing={1.5} sx={{ mt: 3 }} flexWrap="wrap" useFlexGap>
                {!sessionLinked && (
                  <Button
                    variant="contained"
                    startIcon={
                      connectWhatsApp.isPending ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <QrCodeScannerIcon />
                      )
                    }
                    disabled={connectWhatsApp.isPending}
                    onClick={handleConnect}
                    sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#1ebe57' } }}
                  >
                    {waitingForScan ? 'Regenerate QR' : 'Connect WhatsApp'}
                  </Button>
                )}
                {sessionLinked && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<LinkOffIcon />}
                    disabled={disconnectWhatsApp.isPending}
                    onClick={() => disconnectWhatsApp.mutate()}
                  >
                    Disconnect
                  </Button>
                )}
                {waitingForScan && !sessionLinked && (
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    disabled={refreshWhatsAppQr.isPending}
                    onClick={handleRefreshQr}
                  >
                    Refresh QR
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
                Step 2 — Scan QR code
              </Typography>

              {sessionLinked ? (
                <Box
                  sx={{
                    py: 4,
                    px: 2,
                    textAlign: 'center',
                    borderRadius: 3,
                    bgcolor: 'rgba(76,175,80,0.08)',
                    border: '1px solid rgba(76,175,80,0.25)',
                  }}
                >
                  <WhatsAppIcon sx={{ fontSize: 56, color: '#25D366', mb: 1 }} />
                  <Typography variant="h6" fontWeight={800} color="success.dark">
                    WhatsApp Connected
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {data?.linkedPhone || 'Your number is linked and ready to send messages.'}
                  </Typography>
                </Box>
              ) : waitingForScan ? (
                <Stack alignItems="center" spacing={2}>
                  {qrImage ? (
                    <Box
                      component="img"
                      src={qrImage}
                      alt="WhatsApp QR code"
                      sx={{
                        width: 280,
                        height: 280,
                        borderRadius: 2,
                        border: '8px solid #fff',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 280,
                        height: 280,
                        borderRadius: 2,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: 'rgba(21,34,56,0.03)',
                        border: '1px dashed',
                        borderColor: 'divider',
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  )}
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={18} />
                    <Typography variant="body2" color="text.secondary">
                      {qrImage ? 'Waiting for scan…' : 'Loading QR code…'}
                    </Typography>
                  </Stack>
                  {!qrImage && (
                    <Typography variant="caption" color="text.secondary" textAlign="center">
                      If the QR does not appear, click Refresh QR or Disconnect and connect again.
                    </Typography>
                  )}
                </Stack>
              ) : qrImage ? (
                <Stack alignItems="center" spacing={2}>
                  <Box
                    component="img"
                    src={qrImage}
                    alt="WhatsApp QR code"
                    sx={{
                      width: 280,
                      height: 280,
                      borderRadius: 2,
                      border: '8px solid #fff',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                    }}
                  />
                  {waitingForScan && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={18} />
                      <Typography variant="body2" color="text.secondary">
                        Waiting for scan…
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              ) : (
                <Box
                  sx={{
                    py: 5,
                    px: 2,
                    textAlign: 'center',
                    borderRadius: 3,
                    bgcolor: 'rgba(21,34,56,0.03)',
                    border: '1px dashed',
                    borderColor: 'divider',
                  }}
                >
                  <QrCodeScannerIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Click Connect WhatsApp to generate your QR code.
                  </Typography>
                </Box>
              )}

              <List dense sx={{ mt: 2 }}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <PhoneAndroidIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Open WhatsApp on your phone"
                    secondary="Settings → Linked Devices → Link a Device"
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <QrCodeScannerIcon sx={{ color: '#25D366' }} fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Scan the QR code shown here" secondary="Connection completes in a few seconds" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card elevation={0} sx={{ mt: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
          <Button
            onClick={() => setShowAdvanced((v) => !v)}
            endIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Advanced API settings
          </Button>
          <Collapse in={showAdvanced}>
            <Divider sx={{ my: 2 }} />
            <Box component="form" onSubmit={onSubmitAdvanced}>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12 }}>
                  <FormSwitch name="enabled" control={control} label="Enable WhatsApp Integration" />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormPasswordField
                    name="apiKey"
                    control={control}
                    label="Session API Key (optional override)"
                    autoComplete="off"
                    helperText={
                      data?.apiKeyMasked
                        ? `Current key: ${data.apiKeyMasked} (leave blank to keep)`
                        : 'Auto-filled after QR connection'
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormTextField name="apiUrl" control={control} label="Send Message API URL" />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormTextField name="uploadUrl" control={control} label="Media Upload API URL" />
                </Grid>
              </Grid>
              <Stack direction="row" spacing={1.5} sx={{ mt: 3 }} flexWrap="wrap" useFlexGap>
                <Button
                  type="submit"
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  disabled={saveWhatsApp.isPending}
                >
                  Save Advanced Settings
                </Button>
                <Button
                  variant="text"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate('/whatsapp-templates')}
                >
                  WhatsApp Templates
                </Button>
              </Stack>
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    </Box>
  );
}
