import { Grid } from '@mui/material';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormPageLayout from '../../components/forms/layout/FormPageLayout';
import FormSection from '../../components/forms/layout/FormSection';
import FormGrid from '../../components/forms/layout/FormGrid';
import FormTextField from '../../components/forms/FormTextField';
import FormSelect from '../../components/forms/FormSelect';
import FormSwitch from '../../components/forms/FormSwitch';
import { currencySchema, mapCurrencyToApi, activeStatus } from '../../schemas/master.schema';

const defaults = {
  name: '',
  code: '',
  symbol: '',
  decimalPlaces: 2,
  exchangeRate: 1,
  isDefault: false,
  description: '',
  status: 'active',
};

export default function CurrencyForm({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEdit = mode === 'edit';
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(currencySchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(
      initialData
        ? {
            ...defaults,
            name: initialData.name ?? '',
            code: initialData.code ?? '',
            symbol: initialData.symbol ?? '',
            decimalPlaces: initialData.decimal_places ?? 2,
            exchangeRate: initialData.exchange_rate ?? 1,
            isDefault: !!initialData.is_default,
            description: initialData.description ?? '',
            status: activeStatus(initialData),
          }
        : defaults
    );
  }, [initialData, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(mapCurrencyToApi(values), initialData?.id);
  });

  return (
    <FormPageLayout
      title="Currency Management"
      subtitle={isEdit ? 'Update currency information' : 'Create a new currency'}
      sectionTitle={isEdit ? 'Edit Currency' : 'Create Currency'}
      onSubmit={submit}
      onCancel={onCancel}
      loading={loading}
      submitLabel={isEdit ? 'Update' : 'Save'}
    >
      <FormSection title="Currency Information">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="name" control={control} label="Currency Name *" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="code" control={control} label="Currency Code *" placeholder="INR" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="symbol" control={control} label="Currency Symbol *" placeholder="₹" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField
              name="decimalPlaces"
              control={control}
              label="Decimal Places"
              type="number"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField
              name="exchangeRate"
              control={control}
              label="Exchange Rate"
              type="number"
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
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSwitch name="isDefault" control={control} label="Default Currency" />
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
