import { Grid } from '@mui/material';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormPageLayout from '../../components/forms/layout/FormPageLayout';
import FormSection from '../../components/forms/layout/FormSection';
import FormGrid from '../../components/forms/layout/FormGrid';
import FormTextField from '../../components/forms/FormTextField';
import FormSelect from '../../components/forms/FormSelect';
import { packageSchema, mapPackageToApi, activeStatus } from '../../schemas/master.schema';

const defaults = {
  name: '',
  code: '',
  durationDays: 1,
  price: 0,
  status: 'active',
  description: '',
};

export default function PackageForm({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEdit = mode === 'edit';
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(packageSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(
      initialData
        ? {
            ...defaults,
            name: initialData.name ?? '',
            code: initialData.code ?? '',
            description: initialData.description ?? '',
            durationDays: initialData.duration_days ?? initialData.durationDays ?? defaults.durationDays,
            price: Number(initialData.base_price ?? initialData.price ?? defaults.price),
            destinationId: initialData.destination_id ?? initialData.destinationId ?? null,
            status: activeStatus(initialData),
          }
        : defaults
    );
  }, [initialData, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(mapPackageToApi(values), initialData?.id);
  });

  return (
    <FormPageLayout
      title="Package Management"
      subtitle={isEdit ? 'Update package information' : 'Create a new package'}
      sectionTitle={isEdit ? 'Edit Package' : 'Create Package'}
      onSubmit={submit}
      onCancel={onCancel}
      loading={loading}
      submitLabel={isEdit ? 'Update' : 'Save'}
    >
      <FormSection title="Package Information">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="name" control={control} label="Name" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="code" control={control} label="Code" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="durationDays" control={control} label="Duration (Days)" type="number" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="price" control={control} label="Price" type="number" />
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
