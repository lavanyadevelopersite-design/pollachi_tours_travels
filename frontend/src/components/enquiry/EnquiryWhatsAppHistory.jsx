import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { formatDateTime } from '../../utils/formatters';
import { useEnquiryWhatsAppMessages } from '../../hooks/queries/useEnquiry';

const WHATSAPP = '#25D366';

function senderName(user) {
  if (!user) return 'System API';
  return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || 'System API';
}

export default function EnquiryWhatsAppHistory({ enquiryId }) {
  const { data: messages = [], isLoading, isError } = useEnquiryWhatsAppMessages(enquiryId);
  const [selected, setSelected] = useState(null);

  return (
    <Box sx={{ mt: 3.5 }}>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          mb: 1.5,
          pb: 1,
          borderBottom: '2px solid',
          borderColor: alpha(WHATSAPP, 0.22),
        }}
      >
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1.5,
            display: 'grid',
            placeItems: 'center',
            bgcolor: alpha(WHATSAPP, 0.14),
            color: WHATSAPP,
          }}
        >
          <WhatsAppIcon sx={{ fontSize: 16 }} />
        </Box>
        <Typography fontWeight={800} sx={{ color: '#128C7E' }}>
          WhatsApp shared to customer
        </Typography>
      </Stack>

      {isLoading ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          Loading WhatsApp messages…
        </Typography>
      ) : isError ? (
        <Typography variant="body2" color="error" sx={{ py: 2, textAlign: 'center' }}>
          Could not load WhatsApp messages shared to this customer.
        </Typography>
      ) : messages.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          No WhatsApp messages have been shared to this customer yet.
        </Typography>
      ) : (
        <TableContainer
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(WHATSAPP, 0.08) }}>
                <TableCell sx={{ fontWeight: 800, width: 56 }}>S.No</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Date & Time</TableCell>
                <TableCell sx={{ fontWeight: 800, width: 88 }}>Message</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Sent By</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {messages.map((row, index) => (
                <TableRow key={row.id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {formatDateTime(row.sent_at || row.created_at || row.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View message">
                      <IconButton
                        size="small"
                        onClick={() => setSelected(row)}
                        sx={{
                          color: '#128C7E',
                          bgcolor: alpha(WHATSAPP, 0.12),
                          '&:hover': { bgcolor: alpha(WHATSAPP, 0.22) },
                        }}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={row.status || 'sent'}
                      sx={{
                        height: 22,
                        fontWeight: 700,
                        textTransform: 'capitalize',
                        bgcolor: alpha(WHATSAPP, 0.12),
                        color: '#128C7E',
                      }}
                    />
                  </TableCell>
                  <TableCell>{senderName(row.sender)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={800}>WhatsApp message</DialogTitle>
        <DialogContent>
          <Typography
            variant="body2"
            sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', pt: 0.5 }}
          >
            {selected?.body || '—'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSelected(null)} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
