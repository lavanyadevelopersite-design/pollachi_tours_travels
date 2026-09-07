import { Box } from '@mui/material';
import PageHeader from '../../common/PageHeader';
import FormContainer from './FormContainer';
import FormFooter from './FormFooter';

export default function FormPageLayout({
  title,
  subtitle,
  sectionTitle,
  onSubmit,
  onCancel,
  onReset,
  loading = false,
  cancelLabel = 'Cancel',
  submitLabel = 'Save',
  resetLabel = 'Reset',
  showReset = false,
  saveDraftLabel,
  onSaveDraft,
  onSaveAndNew,
  showSaveDraft = false,
  showSaveAndNew = false,
  extra,
  children,
}) {
  return (
    <Box
      sx={{
        maxWidth: '100%',
        mx: 'auto',
        animation: 'fadeIn 200ms ease-out',
        '@keyframes fadeIn': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        '@keyframes formSlideUp': {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <PageHeader title={title} subtitle={subtitle} extra={extra} />
      <FormContainer title={sectionTitle} onClose={onCancel}>
        <Box component="form" onSubmit={onSubmit} noValidate>
          {children}
          <FormFooter
            onCancel={onCancel}
            onReset={onReset}
            onSaveDraft={onSaveDraft}
            onSaveAndNew={onSaveAndNew}
            loading={loading}
            cancelLabel={cancelLabel}
            submitLabel={submitLabel}
            resetLabel={resetLabel}
            showReset={showReset}
            saveDraftLabel={saveDraftLabel}
            showSaveDraft={showSaveDraft}
            showSaveAndNew={showSaveAndNew}
          />
        </Box>
      </FormContainer>
    </Box>
  );
}
