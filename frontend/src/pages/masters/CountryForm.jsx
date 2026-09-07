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
  countrySchema,
  mapCountryToApi,
  activeStatus,
} from '../../schemas/master.schema';

const defaults = {
  name: '',
  code: '',
  isoNumericCode: '',
  currencyCode: '',
  currencyPerRupees: 1,
  nationality: '',
  phoneCode: '',
  description: '',
  status: 'active',
};

export default function CountryForm({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEdit = mode === 'edit';

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(countrySchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(
      initialData
        ? {
            ...defaults,
            name: initialData.name ?? '',
            code: initialData.code ?? '',
            isoNumericCode: initialData.iso_numeric_code ?? '',
            currencyCode: initialData.currency?.code ?? '',
            currencyPerRupees:
              initialData.currency_per_rupees == null
                ? 1
                : Number(initialData.currency_per_rupees),
            nationality: initialData.nationality ?? '',
            phoneCode: initialData.phone_code ?? '',
            description: initialData.description ?? '',
            status: activeStatus(initialData),
          }
        : defaults
    );
  }, [initialData, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(mapCountryToApi(values), initialData?.id);
  });

  return (
    <FormPageLayout
      title="Country Management"
      subtitle={isEdit ? 'Update country information' : 'Create a new country'}
      sectionTitle={isEdit ? 'Edit Country' : 'Create Country'}
      onSubmit={submit}
      onCancel={onCancel}
      loading={loading}
      submitLabel={isEdit ? 'Update' : 'Save'}
    >
      <FormSection title="Country Information">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="name" control={control} label="Country Name *" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="code" control={control} label="Country Code *" placeholder="IN" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="isoNumericCode" control={control} label="ISO Numeric Code" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField
              name="currencyCode"
              control={control}
              label="Currency *"
              placeholder="USD"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField
              name="currencyPerRupees"
              control={control}
              label="Currency Per Rupees *"
              type="number"
              placeholder="e.g. 90"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="nationality" control={control} label="Nationality" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="phoneCode" control={control} label="Phone Code" placeholder="+91" />
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
