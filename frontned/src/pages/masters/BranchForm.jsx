import { Grid } from '@mui/material';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormPageLayout from '../../components/forms/layout/FormPageLayout';
import FormSection from '../../components/forms/layout/FormSection';
import FormGrid from '../../components/forms/layout/FormGrid';
import FormTextField from '../../components/forms/FormTextField';
import FormSelect from '../../components/forms/FormSelect';
import { branchSchema, mapBranchToApi, activeStatus } from '../../schemas/master.schema';

const defaults = {
  name: '',
  code: '',
  city: '',
  phone: '',
  email: '',
  address: '',
  status: 'active',
};

export default function BranchForm({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEdit = mode === 'edit';
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(branchSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(
      initialData
        ? {
            ...defaults,
            name: initialData.name ?? '',
            code: initialData.code ?? '',
            city: initialData.city ?? '',
            phone: initialData.phone ?? '',
            email: initialData.email ?? '',
            address: initialData.address ?? '',
            status: activeStatus(initialData),
          }
        : defaults
    );
  }, [initialData, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(mapBranchToApi(values), initialData?.id);
  });

  return (
    <FormPageLayout
      title="Branch Management"
      subtitle={isEdit ? 'Update branch information' : 'Create a new branch'}
      sectionTitle={isEdit ? 'Edit Branch' : 'Create Branch'}
      onSubmit={submit}
      onCancel={onCancel}
      loading={loading}
      submitLabel={isEdit ? 'Update' : 'Save'}
    >
      <FormSection title="Branch Information">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="name" control={control} label="Name" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="code" control={control} label="Code" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="city" control={control} label="City" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="phone" control={control} label="Phone" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="email" control={control} label="Email" />
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
            <FormTextField name="address" control={control} label="Address" multiline rows={2} />
          </Grid>
        </FormGrid>
      </FormSection>
    </FormPageLayout>
  );
}
