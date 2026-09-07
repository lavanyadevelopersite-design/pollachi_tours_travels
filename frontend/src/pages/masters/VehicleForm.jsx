import {
  Avatar,
  Box,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormPageLayout from '../../components/forms/layout/FormPageLayout';
import FormSection from '../../components/forms/layout/FormSection';
import FormGrid from '../../components/forms/layout/FormGrid';
import FormTextField from '../../components/forms/FormTextField';
import FormSelect from '../../components/forms/FormSelect';
import FormFileUpload from '../../components/forms/FormFileUpload';
import { useSuppliers } from '../../hooks/queries/useMasters';
import { resolveMediaUrl } from '../../utils/constants';
import { vehicleSchema, mapVehicleToApi, activeStatus } from '../../schemas/master.schema';

const defaults = {
  name: '',
  code: '',
  type: '',
  capacity: '',
  registrationNo: '',
  ownership: 'own',
  supplierId: '',
  image: null,
  status: 'active',
};

export default function VehicleForm({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEdit = mode === 'edit';
  const { data: vendorsData, isLoading: vendorsLoading } = useSuppliers({
    page: 1,
    perPage: 300,
    is_active: true,
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const vendorOptions = (vendorsData?.rows || []).map((v) => ({
    value: String(v.id),
    label: v.name,
  }));

  const { control, handleSubmit, reset, setValue } = useForm({
    resolver: zodResolver(vehicleSchema),
    defaultValues: defaults,
  });

  const ownership = useWatch({ control, name: 'ownership' });

  useEffect(() => {
    reset(
      initialData
        ? {
            ...defaults,
            name: initialData.name ?? '',
            code: initialData.code ?? '',
            type: initialData.type ?? '',
            capacity: initialData.capacity ?? '',
            registrationNo: initialData.registration_number ?? initialData.registrationNo ?? '',
            ownership:
              initialData.ownership === 'vendor' || initialData.supplier_id ? 'vendor' : 'own',
            supplierId: initialData.supplier_id || initialData.supplier?.id || '',
            status: activeStatus(initialData),
          }
        : defaults
    );
  }, [initialData, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(mapVehicleToApi(values), initialData?.id);
  });

  const existingImage = resolveMediaUrl(initialData?.image);

  return (
    <FormPageLayout
      title="Vehicle Management"
      subtitle={isEdit ? 'Update vehicle information' : 'Create a new vehicle'}
      sectionTitle={isEdit ? 'Edit Vehicle' : 'Create Vehicle'}
      onSubmit={submit}
      onCancel={onCancel}
      loading={loading}
      submitLabel={isEdit ? 'Update' : 'Save'}
    >
      <FormSection title="Vehicle Information">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="name" control={control} label="Name *" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="type" control={control} label="Type" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField
              name="capacity"
              control={control}
              label="Seating Capacity *"
              type="number"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="registrationNo" control={control} label="Registration No" />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="ownership"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormControl error={!!error}>
                  <FormLabel sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                    Vehicle Ownership *
                  </FormLabel>
                  <RadioGroup
                    row
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      if (e.target.value !== 'vendor') setValue('supplierId', '');
                    }}
                  >
                    <FormControlLabel value="own" control={<Radio />} label="Own" />
                    <FormControlLabel value="vendor" control={<Radio />} label="Vendor" />
                  </RadioGroup>
                  {error && <FormHelperText>{error.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>
          {ownership === 'vendor' && (
            <Grid size={{ xs: 12, md: 6 }}>
              <FormSelect
                name="supplierId"
                control={control}
                label="Vendor Name *"
                options={vendorOptions}
                loading={vendorsLoading}
                placeholder="Select vendor"
              />
            </Grid>
          )}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormFileUpload
              name="image"
              control={control}
              label="Vehicle Image"
              accept="image/*"
            />
            {existingImage && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                <Avatar
                  src={existingImage}
                  alt="Vehicle"
                  variant="rounded"
                  sx={{ width: 72, height: 56 }}
                />
                <Typography variant="caption" color="text.secondary">
                  Current image
                </Typography>
              </Box>
            )}
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
        </FormGrid>
      </FormSection>
    </FormPageLayout>
  );
}
