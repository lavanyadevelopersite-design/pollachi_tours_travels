import { Grid } from '@mui/material';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormPageLayout from '../../components/forms/layout/FormPageLayout';
import FormSection from '../../components/forms/layout/FormSection';
import FormGrid from '../../components/forms/layout/FormGrid';
import FormTextField from '../../components/forms/FormTextField';
import FormSelect from '../../components/forms/FormSelect';
import { agentSchema, mapAgentToApi, activeStatus } from '../../schemas/master.schema';

const defaults = {
  agentName: '',
  status: 'active',
};

export default function AgentForm({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEdit = mode === 'edit';
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(agentSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(
      initialData
        ? {
            ...defaults,
            agentName: initialData.agent_name ?? initialData.agentName ?? '',
            status: activeStatus(initialData),
          }
        : defaults
    );
  }, [initialData, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(mapAgentToApi(values), initialData?.id);
  });

  return (
    <FormPageLayout
      title="Agent Master"
      subtitle={isEdit ? 'Update agent name' : 'Create a new agent'}
      sectionTitle={isEdit ? 'Edit Agent' : 'Create Agent'}
      onSubmit={submit}
      onCancel={onCancel}
      loading={loading}
      submitLabel={isEdit ? 'Update' : 'Save'}
    >
      <FormSection title="Agent Information">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField
              name="agentName"
              control={control}
              label="Agent Name *"
              placeholder="Enter agent name"
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
        </FormGrid>
      </FormSection>
    </FormPageLayout>
  );
}
