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
  inclusionExclusionSchema,
  mapInclusionExclusionToApi,
  activeStatus,
} from '../../schemas/master.schema';

const defaults = {
  type: 'inclusion',
  heading: '',
  description: '',
  status: 'active',
};

export default function InclusionExclusionForm({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEdit = mode === 'edit';
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(inclusionExclusionSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(
      initialData
        ? {
            ...defaults,
            type: initialData.type || 'inclusion',
            heading: initialData.heading ?? '',
            description: initialData.description ?? '',
            status: activeStatus(initialData),
          }
        : defaults
    );
  }, [initialData, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(mapInclusionExclusionToApi(values), initialData?.id);
  });

  return (
    <FormPageLayout
      title="Inclusions & Exclusions"
      subtitle={isEdit ? 'Update inclusion / exclusion item' : 'Create inclusion or exclusion'}
      sectionTitle={isEdit ? 'Edit Item' : 'Create Item'}
      onSubmit={submit}
      onCancel={onCancel}
      loading={loading}
      submitLabel={isEdit ? 'Update' : 'Save'}
    >
      <FormSection title="Item Details">
        <FormGrid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormSelect
              name="type"
              control={control}
              label="Type *"
              clearable={false}
              options={[
                { value: 'inclusion', label: 'Inclusion' },
                { value: 'exclusion', label: 'Exclusion' },
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField
              name="heading"
              control={control}
              label="Heading *"
              placeholder="e.g. Daily Breakfast"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
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
              rows={5}
              placeholder="Enter detailed description..."
            />
          </Grid>
        </FormGrid>
      </FormSection>
    </FormPageLayout>
  );
}
