import { Grid } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormPageLayout from '../../components/forms/layout/FormPageLayout';
import FormSection from '../../components/forms/layout/FormSection';
import FormGrid from '../../components/forms/layout/FormGrid';
import FormTextField from '../../components/forms/FormTextField';
import FormSelect from '../../components/forms/FormSelect';
import { useCountries } from '../../hooks/queries/useMasters';
import { stateSchema, mapStateToApi, activeStatus } from '../../schemas/master.schema';

const defaults = {
  countryId: '',
  name: '',
  code: '',
  description: '',
  status: 'active',
};

export default function StateForm({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEdit = mode === 'edit';
  const { data: countryData, isLoading: countryLoading } = useCountries({
    page: 1,
    perPage: 300,
    is_active: true,
  });
  const countryOptions = useMemo(
    () =>
      (countryData?.rows || []).map((c) => ({
        value: c.id,
        label: `${c.name} (${c.code})`,
      })),
    [countryData]
  );

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(stateSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(
      initialData
        ? {
            ...defaults,
            countryId: initialData.country_id ?? '',
            name: initialData.name ?? '',
            code: initialData.code ?? '',
            description: initialData.description ?? '',
            status: activeStatus(initialData),
          }
        : defaults
    );
  }, [initialData, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(mapStateToApi(values), initialData?.id);
  });

  return (
    <FormPageLayout
      title="State Management"
      subtitle={isEdit ? 'Update state information' : 'Create a new state'}
      sectionTitle={isEdit ? 'Edit State' : 'Create State'}
      onSubmit={submit}
      onCancel={onCancel}
      loading={loading}
      submitLabel={isEdit ? 'Update' : 'Save'}
    >
      <FormSection title="State Information">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="countryId"
              control={control}
              label="Country *"
              options={countryOptions}
              loading={countryLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="name" control={control} label="State Name *" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="code" control={control} label="State Code" />
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
            />
          </Grid>
        </FormGrid>
      </FormSection>
    </FormPageLayout>
  );
}
