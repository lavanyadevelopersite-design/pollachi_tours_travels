import { Grid } from '@mui/material';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormPageLayout from '../../components/forms/layout/FormPageLayout';
import FormSection from '../../components/forms/layout/FormSection';
import FormGrid from '../../components/forms/layout/FormGrid';
import FormTextField from '../../components/forms/FormTextField';
import FormSelect from '../../components/forms/FormSelect';
import FormDatePicker from '../../components/forms/FormDatePicker';
import {
  quotationSchema,
  mapQuotationFromApi,
  mapQuotationToApi,
} from '../../schemas/quotation.schema';

const defaults = {
  customerName: '',
  email: '',
  phone: '',
  adults: 1,
  children: 0,
  amount: 0,
  discount: 0,
  tax: 0,
  validUntil: '',
  status: 'draft',
  notes: '',
};

export default function QuotationForm({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEdit = mode === 'edit';
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(quotationSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(initialData ? { ...defaults, ...mapQuotationFromApi(initialData) } : defaults);
  }, [initialData, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(mapQuotationToApi(values), initialData?.id);
  });

  return (
    <FormPageLayout
      title="Quotation Management"
      subtitle={isEdit ? 'Update quotation information' : 'Create a new quotation'}
      sectionTitle={isEdit ? 'Edit Quotation' : 'Create Quotation'}
      onSubmit={submit}
      onCancel={onCancel}
      loading={loading}
      submitLabel={isEdit ? 'Update' : 'Save'}
    >
      <FormSection title="Customer Information">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="customerName" control={control} label="Customer Name" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="phone" control={control} label="Phone" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="email" control={control} label="Email" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormDatePicker name="validUntil" control={control} label="Valid Until" />
          </Grid>
        </FormGrid>
      </FormSection>

      <FormSection title="Pricing">
        <FormGrid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField name="amount" control={control} label="Subtotal" type="number" />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField name="discount" control={control} label="Discount" type="number" />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField name="tax" control={control} label="Tax" type="number" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="status"
              control={control}
              label="Status"
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'sent', label: 'Sent' },
                { value: 'accepted', label: 'Accepted' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'expired', label: 'Expired' },
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormTextField name="notes" control={control} label="Notes" multiline rows={3} />
          </Grid>
        </FormGrid>
      </FormSection>
    </FormPageLayout>
  );
}
