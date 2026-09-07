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
import { invoiceSchema, mapInvoiceFromApi, mapInvoiceToApi } from '../../schemas/master.schema';

const defaults = {
  customerName: '',
  amount: 0,
  tax: 0,
  dueDate: '',
  status: 'draft',
  notes: '',
};

export default function InvoiceForm({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEdit = mode === 'edit';
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(initialData ? { ...defaults, ...mapInvoiceFromApi(initialData) } : defaults);
  }, [initialData, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(mapInvoiceToApi(values), initialData?.id);
  });

  return (
    <FormPageLayout
      title="Invoice Management"
      subtitle={isEdit ? 'Update invoice information' : 'Create a new invoice'}
      sectionTitle={isEdit ? 'Edit Invoice' : 'Create Invoice'}
      onSubmit={submit}
      onCancel={onCancel}
      loading={loading}
      submitLabel={isEdit ? 'Update' : 'Save'}
    >
      <FormSection title="Invoice Details">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="customerName" control={control} label="Customer Name" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="amount" control={control} label="Amount" type="number" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="tax" control={control} label="Tax" type="number" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormDatePicker name="dueDate" control={control} label="Due Date" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="status"
              control={control}
              label="Status"
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'sent', label: 'Sent' },
                { value: 'partial', label: 'Partially Paid' },
                { value: 'paid', label: 'Paid' },
                { value: 'overdue', label: 'Overdue' },
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
