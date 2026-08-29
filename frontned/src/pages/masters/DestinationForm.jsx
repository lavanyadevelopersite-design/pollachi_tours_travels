import { Grid } from '@mui/material';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormPageLayout from '../../components/forms/layout/FormPageLayout';
import FormSection from '../../components/forms/layout/FormSection';
import FormGrid from '../../components/forms/layout/FormGrid';
import FormTextField from '../../components/forms/FormTextField';
import FormSelect from '../../components/forms/FormSelect';
import { destinationSchema, mapDestinationToApi, activeStatus } from '../../schemas/master.schema';

const defaults = {
  name: '',
  code: '',
  country: '',
  state: '',
  status: 'active',
  description: '',
};

export default function DestinationForm({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEdit = mode === 'edit';
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(destinationSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(
      initialData
        ? {
            ...defaults,
            name: initialData.name ?? '',
            code: initialData.code ?? '',
            country: initialData.country ?? '',
            state: initialData.state ?? '',
            description: initialData.description ?? '',
            status: activeStatus(initialData),
          }
        : defaults
    );
  }, [initialData, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(mapDestinationToApi(values), initialData?.id);
  });

  return (
    <FormPageLayout
      title="Destination Management"
      subtitle={isEdit ? 'Update destination information' : 'Create a new destination'}
      sectionTitle={isEdit ? 'Edit Destination' : 'Create Destination'}
      onSubmit={submit}
      onCancel={onCancel}
      loading={loading}
      submitLabel={isEdit ? 'Update' : 'Save'}
    >
      <FormSection title="Destination Information">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="name" control={control} label="Name" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="code" control={control} label="Code" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="state" control={control} label="State" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="country" control={control} label="Country" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="status"
              control={control}
              label="Status"
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormTextField name="description" control={control} label="Description" multiline rows={2} />
          </Grid>
        </FormGrid>
      </FormSection>
    </FormPageLayout>
  );
}
