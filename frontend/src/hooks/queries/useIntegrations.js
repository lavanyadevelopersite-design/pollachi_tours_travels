import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import integrationService from '../../services/integration.service';
import { useSnackbar } from 'notistack';

export const useWhatsAppIntegration = (options = {}) =>
  useQuery({
    queryKey: ['integrations', 'whatsapp'],
    queryFn: async () => {
      const { data } = await integrationService.getWhatsApp();
      return data?.data || data;
    },
    retry: 1,
    enabled: options.enabled !== false,
    refetchInterval: options.poll ? 3000 : false,
  });

export const useMailIntegration = () =>
  useQuery({
    queryKey: ['integrations', 'mail'],
    queryFn: async () => {
      const { data } = await integrationService.getMail();
      return data?.data || data;
    },
  });

export const useIntegrationMutation = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const invalidateWhatsApp = () =>
    queryClient.invalidateQueries({ queryKey: ['integrations', 'whatsapp'] });

  const saveWhatsApp = useMutation({
    mutationFn: (payload) => integrationService.saveWhatsApp(payload),
    onSuccess: () => {
      invalidateWhatsApp();
      enqueueSnackbar('WhatsApp integration saved', { variant: 'success' });
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.message ||
        err?.message ||
        'Failed to save WhatsApp integration';
      enqueueSnackbar(message, { variant: 'error' });
    },
  });

  const connectWhatsApp = useMutation({
    mutationFn: (payload) => integrationService.connectWhatsApp(payload),
    onSuccess: (res) => {
      invalidateWhatsApp();
      const connected = res?.data?.data?.connected;
      enqueueSnackbar(
        connected ? 'WhatsApp is already connected' : 'Scan the QR code with your phone',
        { variant: connected ? 'success' : 'info' }
      );
    },
    onError: (err) => {
      enqueueSnackbar(
        err?.response?.data?.message || err?.message || 'Failed to start WhatsApp connection',
        { variant: 'error' }
      );
    },
  });

  const refreshWhatsAppQr = useMutation({
    mutationFn: () => integrationService.refreshWhatsAppQr(),
    onSuccess: () => {
      invalidateWhatsApp();
      enqueueSnackbar('QR code refreshed', { variant: 'info' });
    },
    onError: (err) => {
      enqueueSnackbar(err?.response?.data?.message || 'Failed to refresh QR code', {
        variant: 'error',
      });
    },
  });

  const syncWhatsAppSession = useMutation({
    mutationFn: () => integrationService.syncWhatsAppSession(),
    onSuccess: (res) => {
      invalidateWhatsApp();
      if (res?.data?.data?.sessionConnected || res?.data?.data?.active) {
        enqueueSnackbar('WhatsApp connected successfully', { variant: 'success' });
      }
    },
  });

  const disconnectWhatsApp = useMutation({
    mutationFn: () => integrationService.disconnectWhatsApp(),
    onSuccess: () => {
      invalidateWhatsApp();
      enqueueSnackbar('WhatsApp disconnected', { variant: 'success' });
    },
    onError: (err) => {
      enqueueSnackbar(err?.response?.data?.message || 'Failed to disconnect WhatsApp', {
        variant: 'error',
      });
    },
  });

  const saveMail = useMutation({
    mutationFn: (payload) => integrationService.saveMail(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', 'mail'] });
      enqueueSnackbar('Mail integration saved', { variant: 'success' });
    },
    onError: (err) => {
      enqueueSnackbar(err?.response?.data?.message || 'Failed to save mail integration', {
        variant: 'error',
      });
    },
  });

  const testMail = useMutation({
    mutationFn: (payload) => integrationService.testMail(payload),
    onSuccess: (res) => {
      const delivery = res?.data?.data?.delivery;
      enqueueSnackbar(
        delivery === 'mock'
          ? 'Test logged (enable mail integration for real SMTP delivery)'
          : 'Test email sent successfully',
        { variant: 'success' }
      );
    },
    onError: (err) => {
      enqueueSnackbar(err?.response?.data?.message || 'Failed to send test email', {
        variant: 'error',
      });
    },
  });

  return {
    saveWhatsApp,
    connectWhatsApp,
    refreshWhatsAppQr,
    syncWhatsAppSession,
    disconnectWhatsApp,
    saveMail,
    testMail,
  };
};
