import { Grid } from '@mui/material';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormPageLayout from '../../components/forms/layout/FormPageLayout';
import FormSection from '../../components/forms/layout/FormSection';
import FormGrid from '../../components/forms/layout/FormGrid';
import FormTextField from '../../components/forms/FormTextField';
import FormSelect from '../../components/forms/FormSelect';
import { hotelSchema, mapHotelToApi, activeStatus } from '../../schemas/master.schema';

const defaults = {
  name: '',
  code: '',
  starRating: 3,
  address: '',
  status: 'active',
};

export default function HotelForm({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEdit = mode === 'edit';
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(hotelSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(
      initialData
        ? {
            ...defaults,
            name: initialData.name ?? '',
            code: initialData.code ?? '',
            address: initialData.address ?? '',
            starRating: initialData.star_rating ?? initialData.starRating ?? defaults.starRating,
            destinationId: initialData.destination_id ?? initialData.destinationId ?? null,
            status: activeStatus(initialData),
          }
        : defaults
    );
  }, [initialData, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(mapHotelToApi(values), initialData?.id);
  });

  return (
    <FormPageLayout
      title="Hotel Management"
      subtitle={isEdit ? 'Update hotel information' : 'Create a new hotel'}
      sectionTitle={isEdit ? 'Edit Hotel' : 'Create Hotel'}
      onSubmit={submit}
      onCancel={onCancel}
      loading={loading}
      submitLabel={isEdit ? 'Update' : 'Save'}
    >
      <FormSection title="Hotel Information">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="name" control={control} label="Name" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="code" control={control} label="Code" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="starRating" control={control} label="Star Rating" type="number" />
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
