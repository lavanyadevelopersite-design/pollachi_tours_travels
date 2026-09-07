import { useState } from 'react';
import { Box, Button, Stack, TextField, Typography, alpha } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SendIcon from '@mui/icons-material/Send';
import { useSnackbar } from 'notistack';
import { useQueryClient } from '@tanstack/react-query';
import ContactNumberDisplay from '../common/ContactNumberDisplay';
import { usePermission } from '../../hooks/usePermission';
import { isEnquiryActionsLocked } from '../../utils/leadStatusPipeline';
import { isValidWhatsAppPhone } from '../../utils/whatsappShare';
import enquiryService from '../../services/enquiry.service';

function sendErrorMessage(err) {
  const apiMessage = err?.response?.data?.message;
  if (apiMessage) return apiMessage;
  const raw = String(err?.message || '');
  if (err?.code === 'ECONNABORTED' || raw.toLowerCase().includes('timeout')) {
    return 'WhatsApp send timed out. Confirm Integrations → WhatsApp is connected and try again.';
  }
  if (err?.code === 'ERR_NETWORK' || raw === 'Network Error') {
    return 'Could not reach the server to send WhatsApp. Restart the backend and confirm Integrations → WhatsApp is connected.';
  }
  return raw || 'Failed to send WhatsApp message';
}

const WHATSAPP = '#25D366';

export default function EnquiryWhatsAppPanel({ enquiry }) {
  const canEdit = usePermission('enquiries.edit') && !isEnquiryActionsLocked(enquiry);
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const phone = enquiry?.phone || '';
  const hasPhone = isValidWhatsAppPhone(phone);
  const canSend = canEdit && hasPhone && Boolean(message.trim()) && !sending;

  const handleSend = async () => {
    const text = message.trim();
    if (!canSend || !enquiry?.id || !text) return;

    setSending(true);
    try {
      await enquiryService.sendCustomerWhatsApp(enquiry.id, { message: text });
      enqueueSnackbar('Message sent on WhatsApp', { variant: 'success' });
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['enquiry-whatsapp-messages', enquiry.id] });
    } catch (err) {
      enqueueSnackbar(sendErrorMessage(err), { variant: 'error' });
    } finally {
      setSending(false);
    }
  };

  return (
    <Box>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          mb: 2,
          pb: 1.25,
          borderBottom: '2px solid',
          borderColor: alpha(WHATSAPP, 0.22),
          minHeight: 40,
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            display: 'grid',
            placeItems: 'center',
            bgcolor: alpha(WHATSAPP, 0.14),
            color: WHATSAPP,
          }}
        >
          <WhatsAppIcon sx={{ fontSize: 18 }} />
        </Box>
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{
            letterSpacing: 0.2,
            background: 'linear-gradient(90deg, #128C7E, #25D366)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Whatsapp
        </Typography>
      </Stack>

      <Stack spacing={1.5} sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Message will be sent to the customer WhatsApp number.
        </Typography>
        <ContactNumberDisplay value={phone} variant="whatsapp" />
        {!hasPhone ? (
          <Typography variant="body2" color="error.main" fontWeight={600}>
            Customer WhatsApp number is missing or invalid. Update it on the enquiry first.
          </Typography>
        ) : null}
      </Stack>

      <TextField
        fullWidth
        multiline
        minRows={8}
        maxRows={16}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your WhatsApp message..."
        disabled={!canEdit || sending}
        inputProps={{ maxLength: 4000 }}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            bgcolor: alpha(WHATSAPP, 0.03),
          },
        }}
      />

      <Stack direction="row" justifyContent="flex-end">
        <Button
          variant="contained"
          disableElevation
          startIcon={<SendIcon />}
          onClick={handleSend}
          disabled={!canSend}
          sx={{
            textTransform: 'none',
            fontWeight: 800,
            borderRadius: 2.5,
            px: 2.5,
            py: 1,
            bgcolor: WHATSAPP,
            boxShadow: '0 8px 20px rgba(37,211,102,0.28)',
            '&:hover': { bgcolor: '#1ebe5d' },
            '&.Mui-disabled': {
              bgcolor: alpha(WHATSAPP, 0.35),
              color: '#fff',
            },
          }}
        >
          {sending ? 'Sending…' : 'Send'}
        </Button>
      </Stack>
    </Box>
  );
}
