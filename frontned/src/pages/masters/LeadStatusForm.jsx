import { Grid } from '@mui/material';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormPageLayout from '../../components/forms/layout/FormPageLayout';
import FormSection from '../../components/forms/layout/FormSection';
import FormGrid from '../../components/forms/layout/FormGrid';
import FormTextField from '../../components/forms/FormTextField';
import FormSelect from '../../components/forms/FormSelect';
import FormColorPicker from '../../components/forms/FormColorPicker';
import {
  leadStatusSchema,
  mapLeadStatusToApi,
  activeStatus,
} from '../../schemas/master.schema';

const defaults = {
  leadStatus: '',
  buttonColor: '#007BFF',
  status: 'active',
};

export default function LeadStatusForm({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEdit = mode === 'edit';
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(leadStatusSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(
      initialData
        ? {
            ...defaults,
            leadStatus: initialData.lead_status ?? initialData.leadStatus ?? '',
            buttonColor: (
              initialData.button_color ??
              initialData.buttonColor ??
              '#007BFF'
            ).toUpperCase(),
            status: activeStatus(initialData),
          }
        : defaults
    );
  }, [initialData, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(mapLeadStatusToApi(values), initialData?.id);
  });

  return (
    <FormPageLayout
      title="Lead Status Management"
      subtitle={isEdit ? 'Update lead status information' : 'Create a new lead status'}
      sectionTitle={isEdit ? 'Edit Lead Status' : 'Create Lead Status'}
      onSubmit={submit}
      onCancel={onCancel}
      loading={loading}
      submitLabel={isEdit ? 'Update' : 'Save'}
    >
      <FormSection title="Lead Status Information">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField
              name="leadStatus"
              control={control}
              label="Lead Status *"
              placeholder="Enter Lead Status"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="status"
              control={control}
              label="Status"
              clearable={false}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormColorPicker name="buttonColor" control={control} label="Button Color *" />
          </Grid>
        </FormGrid>
      </FormSection>
    </FormPageLayout>
  );
}
