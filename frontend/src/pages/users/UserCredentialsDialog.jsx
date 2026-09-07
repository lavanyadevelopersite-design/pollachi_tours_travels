import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useSnackbar } from 'notistack';

export default function UserCredentialsDialog({ open, email, password, onClose }) {
  const { enqueueSnackbar } = useSnackbar();
  const [copied, setCopied] = useState(false);

  const copyAll = async () => {
    const text = `Email: ${email}\nPassword: ${password}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      enqueueSnackbar('Credentials copied', { variant: 'success' });
    } catch {
      enqueueSnackbar('Could not copy credentials', { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={700}>User credentials</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Copy these details now. The password cannot be shown again after you leave this screen.
        </Typography>
        <Stack spacing={2}>
          <TextField label="Email" value={email || ''} fullWidth InputProps={{ readOnly: true }} />
          <TextField label="Password" value={password || ''} fullWidth InputProps={{ readOnly: true }} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          startIcon={<ContentCopyIcon />}
          onClick={copyAll}
          color={copied ? 'success' : 'primary'}
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
        <Button variant="contained" onClick={onClose}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
