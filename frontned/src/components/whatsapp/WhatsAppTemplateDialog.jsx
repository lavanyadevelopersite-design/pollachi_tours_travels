import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

const defaultForm = {
  template_name: '',
  template_content: '',
  is_active: true,
};

export default function WhatsAppTemplateDialog({ open, template, onClose, onSave, saving }) {
  const [form, setForm] = useState(defaultForm);
  const isEdit = Boolean(template?.id);

  useEffect(() => {
    if (!open) return;
    setForm({
      template_name: template?.template_name || '',
      template_content: template?.template_content || '',
      is_active: template?.is_active !== false,
    });
  }, [open, template]);

  const handleChange = (field) => (event) => {
    const value =
      event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (isEdit) {
      onSave({
        template_content: form.template_content.trim(),
        is_active: form.is_active,
      });
      return;
    }

    onSave({
      template_name: form.template_name.trim(),
      template_content: form.template_content.trim(),
      is_active: form.is_active,
    });
  };

  const canSubmit =
    form.template_content.trim() && !saving && (isEdit || form.template_name.trim());

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>
        {isEdit ? 'Edit WhatsApp Template' : 'Add WhatsApp Template'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Template name"
            value={form.template_name}
            onChange={handleChange('template_name')}
            fullWidth
            required
            placeholder="e.g. Booking Confirmed"
            helperText={
              isEdit
                ? 'Template name cannot be changed after creation'
                : 'Use a clear name to identify this template'
            }
            InputProps={isEdit ? { readOnly: true } : undefined}
            sx={
              isEdit
                ? {
                    '& .MuiInputBase-input': {
                      cursor: 'default',
                      color: 'text.secondary',
                    },
                  }
                : undefined
            }
          />

          <TextField
            label="Template content"
            value={form.template_content}
            onChange={handleChange('template_content')}
            fullWidth
            required
            multiline
            minRows={6}
            placeholder={`Dear {{Customer}},\n\nYour Booking has been Confirmed.\n\nYour trip Id is {{trip_id}}\n\nThanks for reaching Pollachi Tours & Travels`}
            helperText="Use {{Customer}} or {{customer_name}}, {{trip_id}} or {{enquiry_code}}, {{phone}}, {{travel_dates}}, {{vehicle}}, {{destination}}"
          />

          <FormControlLabel
            control={<Switch checked={form.is_active} onChange={handleChange('is_active')} />}
            label={form.is_active ? 'Active' : 'Inactive'}
          />

          {!form.is_active && (
            <Typography variant="caption" color="text.secondary">
              Inactive templates will not be used when sending WhatsApp messages.
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit}
          sx={{ fontWeight: 700 }}
        >
          {saving ? 'Saving…' : isEdit ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
