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
  departmentSchema,
  mapDepartmentToApi,
  activeStatus,
} from '../../schemas/master.schema';

const defaults = {
  departmentName: '',
  departmentCode: '',
  departmentHead: '',
  displayOrder: 0,
  description: '',
  status: 'active',
};

export default function DepartmentForm({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEdit = mode === 'edit';
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(departmentSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(
      initialData
        ? {
            ...defaults,
            departmentName: initialData.department_name ?? '',
            departmentCode: initialData.department_code ?? '',
            departmentHead: initialData.department_head ?? '',
            displayOrder: initialData.display_order ?? 0,
            description: initialData.description ?? '',
            status: activeStatus(initialData),
          }
        : defaults
    );
  }, [initialData, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(mapDepartmentToApi(values), initialData?.id);
  });

  return (
    <FormPageLayout
      title="Department Management"
      subtitle={isEdit ? 'Update department information' : 'Create a new department'}
      sectionTitle={isEdit ? 'Edit Department' : 'Create Department'}
      onSubmit={submit}
      onCancel={onCancel}
      loading={loading}
      submitLabel={isEdit ? 'Update' : 'Save'}
    >
      <FormSection title="Department Information">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="departmentName" control={control} label="Department Name *" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="departmentCode" control={control} label="Department Code *" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="departmentHead"
              control={control}
              label="Department Head"
              options={[]}
              placeholder="Employee master coming soon"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField
              name="displayOrder"
              control={control}
              label="Display Order"
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
