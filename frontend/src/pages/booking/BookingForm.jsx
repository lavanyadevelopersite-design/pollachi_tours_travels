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
import { bookingSchema, mapBookingFromApi, mapBookingToApi } from '../../schemas/booking.schema';

const defaults = {
  customerName: '',
  email: '',
  phone: '',
  travelFrom: '',
  travelTo: '',
  adults: 1,
  children: 0,
  totalAmount: 0,
  paidAmount: 0,
  status: 'pending',
  notes: '',
};

export default function BookingForm({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEdit = mode === 'edit';
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(initialData ? { ...defaults, ...mapBookingFromApi(initialData) } : defaults);
  }, [initialData, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(mapBookingToApi(values), initialData?.id);
  });

  return (
    <FormPageLayout
      title="Booking Management"
      subtitle={isEdit ? 'Update booking information' : 'Create a new booking'}
      sectionTitle={isEdit ? 'Edit Booking' : 'Create Booking'}
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
        </FormGrid>
      </FormSection>

      <FormSection title="Travel Information">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormDatePicker name="travelFrom" control={control} label="Travel From" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormDatePicker name="travelTo" control={control} label="Travel To" />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormTextField name="adults" control={control} label="Adults" type="number" />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormTextField name="children" control={control} label="Children" type="number" />
          </Grid>
        </FormGrid>
      </FormSection>

      <FormSection title="Payment & Status">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="totalAmount" control={control} label="Total Amount" type="number" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="paidAmount" control={control} label="Paid Amount" type="number" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="status"
              control={control}
              label="Status"
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'on_hold', label: 'On Hold' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
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
