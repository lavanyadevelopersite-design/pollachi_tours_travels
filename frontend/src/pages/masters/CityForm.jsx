import { Grid } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormPageLayout from '../../components/forms/layout/FormPageLayout';
import FormSection from '../../components/forms/layout/FormSection';
import FormGrid from '../../components/forms/layout/FormGrid';
import FormTextField from '../../components/forms/FormTextField';
import FormSelect from '../../components/forms/FormSelect';
import { useCountries, useStates } from '../../hooks/queries/useMasters';
import { citySchema, mapCityToApi, activeStatus } from '../../schemas/master.schema';

const defaults = {
  countryId: '',
  stateId: '',
  name: '',
  code: '',
  airportCode: '',
  description: '',
  status: 'active',
};

export default function CityForm({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEdit = mode === 'edit';
  const { control, handleSubmit, reset, watch, setValue } = useForm({
    resolver: zodResolver(citySchema),
    defaultValues: defaults,
  });

  const countryId = watch('countryId');
  const stateId = watch('stateId');

  const { data: countryData, isLoading: countryLoading } = useCountries({
    page: 1,
    perPage: 300,
    is_active: true,
  });
  const { data: stateData, isLoading: stateLoading } = useStates({
    page: 1,
    perPage: 500,
    is_active: true,
    ...(countryId ? { country_id: countryId } : {}),
  });

  const countryOptions = useMemo(
    () =>
      (countryData?.rows || []).map((c) => ({
        value: c.id,
        label: `${c.name} (${c.code})`,
      })),
    [countryData]
  );

  const stateOptions = useMemo(
    () =>
      (stateData?.rows || [])
        .filter((s) => !countryId || s.country_id === countryId)
        .map((s) => ({
          value: s.id,
          label: s.name,
        })),
    [stateData, countryId]
  );

  useEffect(() => {
    reset(
      initialData
        ? {
            ...defaults,
            countryId: initialData.country_id ?? '',
            stateId: initialData.state_id ?? '',
            name: initialData.name ?? '',
            code: initialData.code ?? '',
            airportCode: initialData.airport_code ?? '',
            description: initialData.description ?? '',
            status: activeStatus(initialData),
          }
        : defaults
    );
  }, [initialData, reset]);

  useEffect(() => {
    if (!countryId || !stateId || stateLoading) return;
    const isValidState = (stateData?.rows || []).some(
      (s) => s.id === stateId && s.country_id === countryId
    );
    if (!isValidState) setValue('stateId', '');
  }, [countryId, stateId, stateData, stateLoading, setValue]);

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(mapCityToApi(values), initialData?.id);
  });

  return (
    <FormPageLayout
      title="City Management"
      subtitle={isEdit ? 'Update city information' : 'Create a new city'}
      sectionTitle={isEdit ? 'Edit City' : 'Create City'}
      onSubmit={submit}
      onCancel={onCancel}
      loading={loading}
      submitLabel={isEdit ? 'Update' : 'Save'}
    >
      <FormSection title="City Information">
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
            <FormSelect
              name="stateId"
              control={control}
              label="State *"
              options={stateOptions}
              loading={stateLoading}
              disabled={!countryId}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="name" control={control} label="City Name *" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="code" control={control} label="City Code" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField
              name="airportCode"
              control={control}
              label="Airport Code"
              placeholder="MAA"
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
            />
          </Grid>
        </FormGrid>
      </FormSection>
    </FormPageLayout>
  );
}
