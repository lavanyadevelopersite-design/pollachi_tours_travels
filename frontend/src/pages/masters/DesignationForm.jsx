import { Grid } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormPageLayout from '../../components/forms/layout/FormPageLayout';
import FormSection from '../../components/forms/layout/FormSection';
import FormGrid from '../../components/forms/layout/FormGrid';
import FormTextField from '../../components/forms/FormTextField';
import FormSelect from '../../components/forms/FormSelect';
import { useDepartments } from '../../hooks/queries/useMasters';
import {
  designationSchema,
  mapDesignationToApi,
  activeStatus,
} from '../../schemas/master.schema';

const defaults = {
  designationName: '',
  designationCode: '',
  departmentId: '',
  hierarchyLevel: '',
  description: '',
  status: 'active',
};

export default function DesignationForm({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEdit = mode === 'edit';
  const { data: departmentData, isLoading: departmentLoading } = useDepartments({
    page: 1,
    perPage: 300,
    is_active: true,
  });
  const departmentOptions = useMemo(
    () =>
      (departmentData?.rows || []).map((d) => ({
        value: d.id,
        label: d.department_code
          ? `${d.department_name} (${d.department_code})`
          : d.department_name,
      })),
    [departmentData]
  );

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(designationSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(
      initialData
        ? {
            ...defaults,
            designationName: initialData.designation_name ?? '',
            designationCode: initialData.designation_code ?? '',
            departmentId: initialData.department_id ?? '',
            hierarchyLevel: initialData.hierarchy_level ?? '',
            description: initialData.description ?? '',
            status: activeStatus(initialData),
          }
        : defaults
    );
  }, [initialData, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(mapDesignationToApi(values), initialData?.id);
  });

  return (
    <FormPageLayout
      title="Designation Management"
      subtitle={isEdit ? 'Update designation information' : 'Create a new designation'}
      sectionTitle={isEdit ? 'Edit Designation' : 'Create Designation'}
      onSubmit={submit}
      onCancel={onCancel}
      loading={loading}
      submitLabel={isEdit ? 'Update' : 'Save'}
    >
      <FormSection title="Designation Information">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="designationName" control={control} label="Designation Name *" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="designationCode" control={control} label="Designation Code" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="departmentId"
              control={control}
              label="Department *"
              options={departmentOptions}
              loading={departmentLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField
              name="hierarchyLevel"
              control={control}
              label="Hierarchy Level"
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
