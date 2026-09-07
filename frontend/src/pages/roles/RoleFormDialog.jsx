import { useEffect } from 'react';
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
} from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useForm } from 'react-hook-form';

const slugify = (value = '') =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

export default function RoleFormDialog({
  open,
  role,
  onClose,
  onSubmit,
  onDelete,
  loading = false,
  canDelete = false,
}) {
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
      is_active: true,
    },
  });

  const nameValue = watch('name');
  const isActive = watch('is_active') !== false;
  const canRemove = isEdit && canDelete && role?.code !== 'super_admin';

  useEffect(() => {
    if (!open) return;
    reset({
      name: role?.name || '',
      code: role?.code || '',
      description: role?.description || '',
      is_active: role?.is_active !== false,
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
            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(e) => setValue('is_active', e.target.checked)}
                  disabled={role?.code === 'super_admin'}
                />
              }
              label={isActive ? 'Active' : 'Inactive'}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: 'space-between' }}>
          {canRemove ? (
            <Button
              color="error"
              startIcon={<DeleteOutlinedIcon />}
              onClick={onDelete}
              disabled={loading}
            >
              Delete
            </Button>
          ) : (
            <span />
          )}
          <Stack direction="row" spacing={1}>
            <Button onClick={onClose} disabled={loading} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Update' : 'Create'}
            </Button>
          </Stack>
        </DialogActions>
      </form>
    </Dialog>
  );
}
