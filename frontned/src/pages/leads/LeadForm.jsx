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
import { leadSchema, mapLeadFromApi, mapLeadToApi } from '../../schemas/lead.schema';

const defaults = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  source: 'website',
  destinationInterest: '',
  budget: null,
  travelDate: '',
  adults: 1,
  children: 0,
  status: 'new',
  notes: '',
};

export default function LeadForm({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEdit = mode === 'edit';
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(leadSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(initialData ? { ...defaults, ...mapLeadFromApi(initialData) } : defaults);
  }, [initialData, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(mapLeadToApi(values), initialData?.id);
  });

  return (
    <FormPageLayout
      title="Lead Management"
      subtitle={isEdit ? 'Update lead information' : 'Create a new lead'}
      sectionTitle={isEdit ? 'Edit Lead' : 'Create Lead'}
      onSubmit={submit}
      onCancel={onCancel}
      loading={loading}
      submitLabel={isEdit ? 'Update' : 'Save'}
    >
      <FormSection title="Lead Information">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="firstName" control={control} label="First Name" placeholder="Enter first name" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="lastName" control={control} label="Last Name" placeholder="Enter last name" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="phone" control={control} label="Phone" placeholder="Enter phone number" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="email" control={control} label="Email" placeholder="Enter email address" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="source"
              control={control}
              label="Source"
              options={[
                { value: 'website', label: 'Website' },
                { value: 'referral', label: 'Referral' },
                { value: 'social', label: 'Social Media' },
                { value: 'walk_in', label: 'Walk-in' },
                { value: 'phone', label: 'Phone' },
              ]}
            />
          </Grid>
        </FormGrid>
      </FormSection>

      <FormSection title="Travel Information">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="destinationInterest" control={control} label="Destination Interest" placeholder="Enter destination" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="budget" control={control} label="Budget" type="number" placeholder="Enter budget" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormDatePicker name="travelDate" control={control} label="Travel Date" />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormTextField name="adults" control={control} label="Adults" type="number" />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormTextField name="children" control={control} label="Children" type="number" />
          </Grid>
        </FormGrid>
      </FormSection>

      <FormSection title="Additional Information">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="status"
              control={control}
              label="Status"
              options={[
                { value: 'new', label: 'New' },
                { value: 'contacted', label: 'Contacted' },
                { value: 'qualified', label: 'Qualified' },
                { value: 'converted', label: 'Converted' },
                { value: 'lost', label: 'Lost' },
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormTextField name="notes" control={control} label="Notes" multiline rows={5} placeholder="Add notes or remarks" />
          </Grid>
        </FormGrid>
      </FormSection>
    </FormPageLayout>
  );
}
