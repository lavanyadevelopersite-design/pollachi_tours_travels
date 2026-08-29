import { Box, Stack } from '@mui/material';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

export default function FormFooter({
  onCancel,
  onReset,
  onSaveDraft,
  onSaveAndNew,
  loading = false,
  cancelLabel = 'Cancel',
  submitLabel = 'Save',
  resetLabel = 'Reset',
  saveDraftLabel = 'Save Draft',
  saveAndNewLabel = 'Save & New',
  showReset = false,
  showSaveDraft = false,
  showSaveAndNew = false,
}) {
  return (
    <Box
      sx={{
        mt: 4,
        pt: 3,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack
        direction={{ xs: 'column-reverse', sm: 'row' }}
        spacing={1.5}
        justifyContent="flex-end"
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        <SecondaryButton onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </SecondaryButton>
        {showReset && onReset && (
          <SecondaryButton onClick={onReset} disabled={loading}>
            {resetLabel}
          </SecondaryButton>
        )}
        {showSaveDraft && onSaveDraft && (
          <SecondaryButton onClick={onSaveDraft} disabled={loading}>
            {saveDraftLabel}
          </SecondaryButton>
        )}
        {showSaveAndNew && onSaveAndNew && (
          <SecondaryButton onClick={onSaveAndNew} disabled={loading}>
            {saveAndNewLabel}
          </SecondaryButton>
        )}
        <PrimaryButton type="submit" loading={loading}>
          {submitLabel}
        </PrimaryButton>
      </Stack>
    </Box>
  );
}
