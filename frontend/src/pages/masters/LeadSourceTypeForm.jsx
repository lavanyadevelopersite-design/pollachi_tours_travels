import { Grid } from '@mui/material';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormPageLayout from '../../components/forms/layout/FormPageLayout';
import FormSection from '../../components/forms/layout/FormSection';
import FormGrid from '../../components/forms/layout/FormGrid';
import FormTextField from '../../components/forms/FormTextField';
import FormSelect from '../../components/forms/FormSelect';
import {
  leadSourceTypeSchema,
  mapLeadSourceTypeToApi,
  activeStatus,
} from '../../schemas/master.schema';

const defaults = {
  leadSourceType: '',
  description: '',
  status: 'active',
};

export default function LeadSourceTypeForm({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEdit = mode === 'edit';
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(leadSourceTypeSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(
      initialData
        ? {
            ...defaults,
            leadSourceType:
              initialData.lead_source_type ?? initialData.leadSourceType ?? '',
            description: initialData.description ?? '',
            status: activeStatus(initialData),
          }
        : defaults
    );
  }, [initialData, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(mapLeadSourceTypeToApi(values), initialData?.id);
  });

  return (
    <FormPageLayout
      title="Lead Source Type Management"
      subtitle={
        isEdit ? 'Update lead source type information' : 'Create a new lead source type'
      }
      sectionTitle={isEdit ? 'Edit Lead Source Type' : 'Create Lead Source Type'}
      onSubmit={submit}
      onCancel={onCancel}
      loading={loading}
      submitLabel={isEdit ? 'Update' : 'Save'}
    >
      <FormSection title="Lead Source Type Information">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField
              name="leadSourceType"
              control={control}
              label="Lead Source Type *"
              placeholder="e.g. Instagram, Newspaper, Reference"
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
          <Grid size={{ xs: 12 }}>
            <FormTextField
              name="description"
              control={control}
              label="Description"
              multiline
              rows={2}
              placeholder="Optional notes about this lead source"
            />
          </Grid>
        </FormGrid>
      </FormSection>
    </FormPageLayout>
  );
}
