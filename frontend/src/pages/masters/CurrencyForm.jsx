import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormTextField from '../../components/forms/FormTextField';
import FormSelect from '../../components/forms/FormSelect';
import { currencySchema, mapCurrencyToApi, activeStatus } from '../../schemas/master.schema';

const defaults = {
  name: '',
  rate: '',
  status: 'active',
};

export default function CurrencyForm({
  open = true,
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEdit = mode === 'edit';
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(currencySchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      initialData
        ? {
            name: initialData.name ?? '',
            rate: initialData.exchange_rate ?? '',
            status: activeStatus(initialData),
          }
        : defaults
    );
  }, [initialData, open, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(mapCurrencyToApi(values), initialData?.id);
  });

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 800, pr: 6 }}>
        {isEdit ? 'Edit Currency' : 'Add Currency'}
        <IconButton
          onClick={onCancel}
          aria-label="Close"
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <FormTextField name="name" control={control} label="Name *" fullWidth />
          <FormTextField name="rate" control={control} label="Rate *" type="number" fullWidth />
          <FormSelect
            name="status"
            control={control}
            label="Status *"
            clearable={false}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={submit}
          disabled={loading}
          variant="contained"
          sx={{
            bgcolor: '#8BC34A',
            color: '#fff',
            fontWeight: 700,
            px: 3,
            '&:hover': { bgcolor: '#7CB342' },
          }}
        >
          {loading ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
