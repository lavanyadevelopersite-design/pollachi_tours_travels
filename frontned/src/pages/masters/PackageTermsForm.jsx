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
  packageTermsSchema,
  mapPackageTermsToApi,
  activeStatus,
} from '../../schemas/master.schema';

const defaults = {
  heading: '',
  description: '',
  status: 'active',
};

export default function PackageTermsForm({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEdit = mode === 'edit';
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(packageTermsSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(
      initialData
        ? {
            ...defaults,
            heading: initialData.heading ?? '',
            description: initialData.description ?? '',
            status: activeStatus(initialData),
          }
        : defaults
    );
  }, [initialData, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(mapPackageTermsToApi(values), initialData?.id);
  });

  return (
    <FormPageLayout
      title="Package Terms Management"
      subtitle={isEdit ? 'Update package terms information' : 'Create new package terms'}
      sectionTitle={isEdit ? 'Edit Package Terms' : 'Create Package Terms'}
      onSubmit={submit}
      onCancel={onCancel}
      loading={loading}
      submitLabel={isEdit ? 'Update' : 'Save'}
    >
      <FormSection title="Package Terms Information">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField
              name="heading"
              control={control}
              label="Heading *"
              placeholder="Enter Heading"
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
              label="Description *"
              multiline
              rows={6}
              placeholder="Enter detailed package terms..."
            />
          </Grid>
        </FormGrid>
      </FormSection>
    </FormPageLayout>
  );
}
