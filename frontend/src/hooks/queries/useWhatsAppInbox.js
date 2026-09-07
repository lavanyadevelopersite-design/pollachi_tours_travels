import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import whatsappInboxService from '../../services/whatsappInbox.service';
import { useSnackbar } from 'notistack';

export const useWhatsAppInboxStatus = () =>
  useQuery({
    queryKey: ['whatsapp-inbox', 'status'],
    queryFn: async () => {
      const { data } = await whatsappInboxService.getStatus();
      return data?.data || data;
    },
    retry: 1,
  });

export const useWhatsAppConversations = (search = '', options = {}) =>
  useQuery({
    queryKey: ['whatsapp-inbox', 'conversations', search],
    queryFn: async () => {
      const { data } = await whatsappInboxService.listConversations({ search, limit: 100 });
      return {
        rows: data?.data || [],
        pagination: data?.pagination || null,
      };
    },
    refetchInterval: options.poll ? 5000 : false,
  });

export const useWhatsAppMessages = (conversationId, options = {}) =>
  useQuery({
    queryKey: ['whatsapp-inbox', 'messages', conversationId],
    queryFn: async () => {
      const { data } = await whatsappInboxService.getMessages(conversationId, { limit: 200 });
      return data?.data || data;
    },
    enabled: Boolean(conversationId),
    refetchInterval: options.poll ? 4000 : false,
  });

export const useWhatsAppInboxMutation = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['whatsapp-inbox'] });
  };

  const syncInbox = useMutation({
    mutationFn: () => whatsappInboxService.syncInbox(),
    onSuccess: () => {
      invalidate();
      enqueueSnackbar('Chats synced from WhatsApp', { variant: 'success' });
    },
    onError: (err) => {
      enqueueSnackbar(err?.response?.data?.message || 'Failed to sync chats', { variant: 'error' });
    },
  });

  const sendMessage = useMutation({
    mutationFn: ({ conversationId, message }) =>
      whatsappInboxService.sendMessage(conversationId, { message }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-inbox', 'messages', vars.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-inbox', 'conversations'] });
    },
    onError: (err) => {
      enqueueSnackbar(err?.response?.data?.message || 'Failed to send message', { variant: 'error' });
    },
  });

  const markRead = useMutation({
    mutationFn: (conversationId) => whatsappInboxService.markRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-inbox', 'conversations'] });
    },
  });

  const startConversation = useMutation({
    mutationFn: (payload) => whatsappInboxService.startConversation(payload),
    onSuccess: () => {
      invalidate();
      enqueueSnackbar('Conversation ready', { variant: 'success' });
    },
    onError: (err) => {
      enqueueSnackbar(err?.response?.data?.message || 'Failed to start chat', { variant: 'error' });
    },
  });

  return { syncInbox, sendMessage, markRead, startConversation };
};
