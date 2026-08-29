import { useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { useForm } from 'react-hook-form';

const slugify = (value = '') =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

export default function RoleFormDialog({ open, role, onClose, onSubmit, loading = false }) {
  const isEdit = !!role?.id;
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      code: '',
      description: '',
    },
  });

  const nameValue = watch('name');

  useEffect(() => {
    if (!open) return;
    reset({
      name: role?.name || '',
      code: role?.code || '',
      description: role?.description || '',
    });
  }, [open, role, reset]);

  useEffect(() => {
    if (!open || isEdit) return;
    setValue('code', slugify(nameValue), { shouldValidate: true });
  }, [nameValue, open, isEdit, setValue]);

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={700}>{isEdit ? 'Edit Role' : 'Add Role'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2.5} pt={0.5}>
            <TextField
              label="Role Name"
              fullWidth
              autoFocus
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register('name', { required: 'Role name is required' })}
            />
            <TextField
              label="Role Code"
              fullWidth
              disabled={isEdit && role?.code === 'super_admin'}
              error={!!errors.code}
              helperText={errors.code?.message || 'Unique identifier, e.g. sales_agent'}
              {...register('code', {
                required: 'Role code is required',
                pattern: {
                  value: /^[a-z0-9_]+$/,
                  message: 'Use lowercase letters, numbers, and underscores only',
                },
              })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={2}
              {...register('description')}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} disabled={loading} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving…' : isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
