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
  taxSchema,
  mapTaxToApi,
  activeStatus,
  TAX_TYPE_OPTIONS,
  TAX_APPLICABLE_ON_OPTIONS,
} from '../../schemas/master.schema';

const defaults = {
  name: '',
  taxPercentage: '',
  taxType: 'GST',
  applicableOn: 'Package',
  description: '',
  status: 'active',
};

export default function TaxForm({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEdit = mode === 'edit';
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(taxSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(
      initialData
        ? {
            ...defaults,
            name: initialData.name ?? '',
            taxPercentage: initialData.tax_percentage ?? '',
            taxType: initialData.tax_type ?? 'GST',
            applicableOn: initialData.applicable_on ?? 'Package',
            description: initialData.description ?? '',
            status: activeStatus(initialData),
          }
        : defaults
    );
  }, [initialData, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(mapTaxToApi(values), initialData?.id);
  });

  return (
    <FormPageLayout
      title="Tax Management"
      subtitle={isEdit ? 'Update tax information' : 'Create a new tax'}
      sectionTitle={isEdit ? 'Edit Tax' : 'Create Tax'}
      onSubmit={submit}
      onCancel={onCancel}
      loading={loading}
      submitLabel={isEdit ? 'Update' : 'Save'}
    >
      <FormSection title="Tax Information">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="name" control={control} label="Tax Name *" placeholder="GST 18%" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField
              name="taxPercentage"
              control={control}
              label="Tax Percentage *"
              type="number"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="taxType"
              control={control}
              label="Tax Type *"
              clearable={false}
              options={TAX_TYPE_OPTIONS.map((v) => ({ value: v, label: v }))}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="applicableOn"
              control={control}
              label="Applicable On *"
              clearable={false}
              options={TAX_APPLICABLE_ON_OPTIONS.map((v) => ({ value: v, label: v }))}
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
