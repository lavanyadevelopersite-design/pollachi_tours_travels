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
import FormTimePicker from '../../components/forms/FormTimePicker';
import { followUpSchema, mapFollowUpFromApi, mapFollowUpToApi } from '../../schemas/followUp.schema';

const defaults = {
  relatedType: 'lead',
  relatedId: '',
  followUpDate: '',
  followUpTime: '',
  type: 'call',
  status: 'pending',
  notes: '',
};

export default function FollowUpForm({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEdit = mode === 'edit';
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(followUpSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(initialData ? { ...defaults, ...mapFollowUpFromApi(initialData) } : defaults);
  }, [initialData, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(mapFollowUpToApi(values), initialData?.id);
  });

  return (
    <FormPageLayout
      title="Follow-up Management"
      subtitle={isEdit ? 'Update follow-up information' : 'Create a new follow-up'}
      sectionTitle={isEdit ? 'Edit Follow-up' : 'Create Follow-up'}
      onSubmit={submit}
      onCancel={onCancel}
      loading={loading}
      submitLabel={isEdit ? 'Update' : 'Save'}
    >
      <FormSection title="Follow-up Details">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="relatedType"
              control={control}
              label="Related Type"
              options={[
                { value: 'lead', label: 'Lead' },
                { value: 'enquiry', label: 'Enquiry' },
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="relatedId" control={control} label="Related ID" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormDatePicker name="followUpDate" control={control} label="Follow-up Date" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTimePicker name="followUpTime" control={control} label="Time" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="type"
              control={control}
              label="Channel"
              options={[
                { value: 'task', label: 'Task' },
                { value: 'call', label: 'Call' },
                { value: 'meeting', label: 'Meeting' },
                { value: 'email', label: 'Email' },
                { value: 'visit', label: 'Visit' },
                { value: 'whatsapp', label: 'WhatsApp' },
                { value: 'other', label: 'Other' },
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="status"
              control={control}
              label="Status"
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'completed', label: 'Completed' },
                { value: 'missed', label: 'Missed' },
                { value: 'rescheduled', label: 'Rescheduled' },
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
