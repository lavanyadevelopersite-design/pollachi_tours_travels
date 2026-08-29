import { Avatar, Box, Grid, Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormPageLayout from '../../components/forms/layout/FormPageLayout';
import FormSection from '../../components/forms/layout/FormSection';
import FormGrid from '../../components/forms/layout/FormGrid';
import FormTextField from '../../components/forms/FormTextField';
import FormPasswordField from '../../components/forms/FormPasswordField';
import FormSelect from '../../components/forms/FormSelect';
import FormFileUpload from '../../components/forms/FormFileUpload';
import { useRoles } from '../../hooks/queries/useRoles';
import {
  useBranches,
  useDepartments,
  useDesignations,
} from '../../hooks/queries/useMasters';
import {
  userSchema,
  userCreateSchema,
  mapUserFromApi,
  mapUserToApi,
  BLOOD_GROUP_OPTIONS,
  GENDER_OPTIONS,
} from '../../schemas/user.schema';
import { resolveMediaUrl } from '../../utils/constants';

const defaults = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  roleId: '',
  branchId: '',
  departmentId: '',
  designationId: '',
  status: 'active',
  password: '',
  gender: '',
  bloodGroup: '',
  aadhar: '',
  permanentAddress: '',
  hasWorkExperience: 'no',
  workExperienceYears: '',
  previousCompanyName: '',
  previousCompanyDesignation: '',
  previousCompanyDuration: '',
  avatar: null,
};

export default function UserForm({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEdit = mode === 'edit';
  const schema = isEdit ? userSchema : userCreateSchema;

  const { control, handleSubmit, reset, watch, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  const departmentId = watch('departmentId');
  const designationId = watch('designationId');
  const hasWorkExperience = watch('hasWorkExperience');

  const { data: roleData, isLoading: rolesLoading } = useRoles({
    page: 1,
    perPage: 200,
    is_active: true,
  });
  const { data: branchData, isLoading: branchesLoading } = useBranches({
    page: 1,
    perPage: 300,
    is_active: true,
  });
  const { data: departmentData, isLoading: departmentsLoading } = useDepartments({
    page: 1,
    perPage: 300,
    is_active: true,
  });
  const { data: designationData, isLoading: designationsLoading } = useDesignations({
    page: 1,
    perPage: 500,
    is_active: true,
    ...(departmentId ? { department_id: departmentId } : {}),
  });

  const roleOptions = useMemo(
    () =>
      (roleData?.rows || []).map((r) => ({
        value: r.id,
        label: r.code ? `${r.name} (${r.code})` : r.name,
      })),
    [roleData]
  );

  const branchOptions = useMemo(
    () =>
      (branchData?.rows || []).map((b) => ({
        value: b.id,
        label: b.code ? `${b.name} (${b.code})` : b.name,
      })),
    [branchData]
  );

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

  const designationOptions = useMemo(
    () =>
      (designationData?.rows || [])
        .filter((d) => !departmentId || d.department_id === departmentId)
        .map((d) => ({
          value: d.id,
          label: d.designation_code
            ? `${d.designation_name} (${d.designation_code})`
            : d.designation_name,
        })),
    [designationData, departmentId]
  );

  useEffect(() => {
    reset(
      initialData
        ? { ...defaults, ...mapUserFromApi(initialData), password: '' }
        : defaults
    );
  }, [initialData, reset]);

  useEffect(() => {
    if (!departmentId || !designationId || designationsLoading) return;
    const isValid = (designationData?.rows || []).some(
      (d) => d.id === designationId && d.department_id === departmentId
    );
    if (!isValid) setValue('designationId', '');
  }, [departmentId, designationId, designationData, designationsLoading, setValue]);

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(mapUserToApi(values), initialData?.id);
  });

  const existingPhoto = resolveMediaUrl(initialData?.avatar);

  return (
    <FormPageLayout
      title="User Management"
      subtitle={isEdit ? 'Update user information' : 'Create a new user'}
      sectionTitle={isEdit ? 'Edit User' : 'Create User'}
      onSubmit={submit}
      onCancel={onCancel}
      loading={loading}
      submitLabel={isEdit ? 'Update' : 'Save'}
    >
      <FormSection title="User Information">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="firstName" control={control} label="First Name" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="lastName" control={control} label="Last Name" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="email" control={control} label="Email" type="email" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="phone" control={control} label="Phone" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="roleId"
              control={control}
              label="Role *"
              options={roleOptions}
              loading={rolesLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="branchId"
              control={control}
              label="Branch"
              options={branchOptions}
              loading={branchesLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="departmentId"
              control={control}
              label="Department"
              options={departmentOptions}
              loading={departmentsLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="designationId"
              control={control}
              label="Designation"
              options={designationOptions}
              loading={designationsLoading}
              disabled={!departmentId}
              placeholder={departmentId ? 'Search...' : 'Select department first'}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="status"
              control={control}
              label="Status"
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormPasswordField
              name="password"
              control={control}
              label={isEdit ? 'New Password (optional)' : 'Password'}
              autoComplete="new-password"
            />
          </Grid>
        </FormGrid>
      </FormSection>

      <FormSection title="Employee Details (Optional)">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="gender"
              control={control}
              label="Gender"
              options={GENDER_OPTIONS.map((g) => ({ value: g, label: g }))}
              placeholder="Select gender"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="bloodGroup"
              control={control}
              label="Blood Group"
              options={BLOOD_GROUP_OPTIONS.map((b) => ({ value: b, label: b }))}
              placeholder="Select blood group"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="aadhar" control={control} label="Aadhar Number" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormFileUpload
              name="avatar"
              control={control}
              label="Employee Photo"
              accept="image/*"
            />
            {existingPhoto && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                <Avatar src={existingPhoto} alt="Employee" sx={{ width: 56, height: 56 }} />
                <Typography variant="caption" color="text.secondary">
                  Current photo
                </Typography>
              </Box>
            )}
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormTextField
              name="permanentAddress"
              control={control}
              label="Permanent Address"
              multiline
              rows={3}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="hasWorkExperience"
              control={control}
              label="Prior Work Experience"
              clearable={false}
              options={[
                { value: 'no', label: 'No' },
                { value: 'yes', label: 'Yes' },
              ]}
            />
          </Grid>
          {hasWorkExperience === 'yes' && (
            <>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormTextField
                  name="workExperienceYears"
                  control={control}
                  label="Total Experience (Years)"
                  type="number"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormTextField
                  name="previousCompanyName"
                  control={control}
                  label="Previous Company Name"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormTextField
                  name="previousCompanyDesignation"
                  control={control}
                  label="Previous Designation"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormTextField
                  name="previousCompanyDuration"
                  control={control}
                  label="Duration at Previous Company"
                  placeholder="e.g. 2 years 6 months"
                />
              </Grid>
            </>
          )}
        </FormGrid>
      </FormSection>
    </FormPageLayout>
  );
}
