import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormPageLayout from '../../components/forms/layout/FormPageLayout';
import FormSection from '../../components/forms/layout/FormSection';
import FormGrid from '../../components/forms/layout/FormGrid';
import FormTextField from '../../components/forms/FormTextField';
import FormPasswordField from '../../components/forms/FormPasswordField';
import FormSelect from '../../components/forms/FormSelect';
import FormDatePicker from '../../components/forms/FormDatePicker';
import FormFileUpload from '../../components/forms/FormFileUpload';
import { useSuppliers, useVehicles } from '../../hooks/queries/useMasters';
import { resolveMediaUrl } from '../../utils/constants';
import {
  driverSchema,
  mapDriverToApi,
  mapDriverProofsFromApi,
  emptyDriverProof,
  activeStatus,
  DRIVER_LICENSE_TYPES,
  DRIVER_EMPLOYMENT_TYPES,
  AVAILABILITY_STATUS_OPTIONS,
  ID_PROOF_TYPES,
  BLOOD_GROUPS,
} from '../../schemas/master.schema';

const defaults = {
  fullName: '',
  code: '',
  photo: null,
  licenseNumber: '',
  licenseType: '',
  licenseExpiry: '',
  proofs: [emptyDriverProof()],
  phone: '',
  alternatePhone: '',
  email: '',
  address: '',
  city: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelation: '',
  employmentType: '',
  experienceYears: 0,
  joiningDate: '',
  bloodGroup: '',
  vehicleId: '',
  driverType: 'own',
  supplierId: '',
  availabilityStatus: 'available',
  notes: '',
  portalPassword: '',
  status: 'active',
};

function ProofImagesPreview({ control, index, onRemoveExisting }) {
  const existingImages = useWatch({ control, name: `proofs.${index}.existingImages` }) || [];

  if (!existingImages.length) return null;

  return (
    <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
      {existingImages.map((url) => {
        const src = resolveMediaUrl(url);
        const isImage = /\.(jpe?g|png|gif|webp)$/i.test(url);
        return (
          <Chip
            key={url}
            label={isImage ? 'Image' : 'Document'}
            avatar={isImage ? <Avatar src={src} alt="Proof" /> : undefined}
            onClick={() => window.open(src, '_blank', 'noopener,noreferrer')}
            onDelete={() => onRemoveExisting(url)}
            variant="outlined"
            size="small"
          />
        );
      })}
    </Stack>
  );
}

export default function DriverForm({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEdit = mode === 'edit';
  const { data: vehiclesData } = useVehicles({ perPage: 200, is_active: true });
  const { data: vendorsData, isLoading: vendorsLoading } = useSuppliers({
    page: 1,
    perPage: 100,
    is_active: true,
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const vehicleOptions = useMemo(
    () =>
      (vehiclesData?.rows || []).map((v) => ({
        value: v.id,
        label: `${v.name}${v.registration_number ? ` (${v.registration_number})` : ''} · ${v.ownership === 'vendor' ? 'Vendor' : 'Own'}`,
      })),
    [vehiclesData]
  );
  const vendorOptions = useMemo(
    () => (vendorsData?.rows || []).map((v) => ({ value: String(v.id), label: v.name })),
    [vendorsData]
  );

  const { control, handleSubmit, reset, setValue, getValues } = useForm({
    resolver: zodResolver(driverSchema),
    defaultValues: defaults,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'proofs',
  });
  const driverType = useWatch({ control, name: 'driverType' });

  useEffect(() => {
    reset(
      initialData
        ? {
            ...defaults,
            fullName: initialData.full_name ?? '',
            code: initialData.code ?? '',
            licenseNumber: initialData.license_number ?? '',
            licenseType: initialData.license_type ?? '',
            licenseExpiry: initialData.license_expiry ?? '',
            proofs: mapDriverProofsFromApi(initialData),
            phone: initialData.phone ?? '',
            alternatePhone: initialData.alternate_phone ?? '',
            email: initialData.email ?? '',
            address: initialData.address ?? '',
            city: initialData.city ?? '',
            emergencyContactName: initialData.emergency_contact_name ?? '',
            emergencyContactPhone: initialData.emergency_contact_phone ?? '',
            emergencyContactRelation: initialData.emergency_contact_relation ?? '',
            employmentType: initialData.employment_type ?? '',
            experienceYears: initialData.experience_years ?? 0,
            joiningDate: initialData.joining_date ?? '',
            bloodGroup: initialData.blood_group ?? '',
            vehicleId: initialData.vehicle_id ?? '',
            driverType:
              initialData.driver_type === 'vendor' || initialData.supplier_id ? 'vendor' : 'own',
            supplierId: initialData.supplier_id || initialData.supplier?.id || '',
            availabilityStatus: initialData.availability_status ?? 'available',
            notes: initialData.notes ?? '',
            portalPassword: '',
            status: activeStatus(initialData),
            photo: null,
          }
        : defaults
    );
  }, [initialData, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(mapDriverToApi(values), initialData?.id);
  });

  const existingPhoto = resolveMediaUrl(initialData?.photo);

  const removeExistingImage = (proofIndex, url) => {
    const current = getValues(`proofs.${proofIndex}.existingImages`) || [];
    setValue(
      `proofs.${proofIndex}.existingImages`,
      current.filter((item) => item !== url),
      { shouldDirty: true }
    );
  };

  return (
    <FormPageLayout
      title="Driver Management"
      subtitle={isEdit ? 'Update driver information' : 'Add a new driver'}
      sectionTitle={isEdit ? 'Edit Driver' : 'Create Driver'}
      onSubmit={submit}
      onCancel={onCancel}
      loading={loading}
      submitLabel={isEdit ? 'Update' : 'Save'}
    >
      <FormSection title="Basic Information">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="fullName" control={control} label="Full Name *" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField
              name="code"
              control={control}
              label="Driver Code"
              placeholder="Auto-generated if empty"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="driverType"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormControl error={!!error}>
                  <FormLabel sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                    Driver Type *
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
                    <FormControlLabel value="vendor" control={<Radio />} label="Vendor Vehicle" />
                  </RadioGroup>
                  {error && <FormHelperText>{error.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>
          {driverType === 'vendor' && (
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
            <FormFileUpload name="photo" control={control} label="Driver Photo" accept="image/*" />
            {existingPhoto && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                <Avatar src={existingPhoto} alt="Driver" sx={{ width: 56, height: 56 }} />
                <Typography variant="caption" color="text.secondary">
                  Current photo
                </Typography>
              </Box>
            )}
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

      <FormSection title="Primary License">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="licenseNumber" control={control} label="License Number *" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="licenseType"
              control={control}
              label="License Type"
              options={DRIVER_LICENSE_TYPES.map((v) => ({ value: v, label: v }))}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormDatePicker name="licenseExpiry" control={control} label="License Expiry" />
          </Grid>
        </FormGrid>
      </FormSection>

      <FormSection title="Proof Details">
        <Stack direction="row" justifyContent="flex-end" mb={2}>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => append(emptyDriverProof())}
            variant="outlined"
          >
            Add Proof
          </Button>
        </Stack>
        <Stack spacing={2}>
          {fields.map((field, index) => (
            <Box
              key={field.id}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 2,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="subtitle2">Proof {index + 1}</Typography>
                <IconButton
                  size="small"
                  color="error"
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                  aria-label={`Remove proof ${index + 1}`}
                >
                  <DeleteOutlinedIcon fontSize="small" />
                </IconButton>
              </Stack>
              <FormGrid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormSelect
                    name={`proofs.${index}.proofType`}
                    control={control}
                    label="Proof Type *"
                    options={ID_PROOF_TYPES.map((v) => ({ value: v, label: v }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormTextField
                    name={`proofs.${index}.proofNumber`}
                    control={control}
                    label="Proof Number"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormSelect
                    name={`proofs.${index}.licenseType`}
                    control={control}
                    label="License Type (if DL)"
                    options={DRIVER_LICENSE_TYPES.map((v) => ({ value: v, label: v }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormDatePicker
                    name={`proofs.${index}.expiryDate`}
                    control={control}
                    label="Expiry Date"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormTextField
                    name={`proofs.${index}.notes`}
                    control={control}
                    label="Notes"
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormFileUpload
                    name={`proofs.${index}.images`}
                    control={control}
                    label="Proof Images / Documents"
                    accept="image/*,.pdf"
                    multiple
                  />
                  <ProofImagesPreview
                    control={control}
                    index={index}
                    onRemoveExisting={(url) => removeExistingImage(index, url)}
                  />
                </Grid>
              </FormGrid>
              {index < fields.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))}
        </Stack>
      </FormSection>

      <FormSection title="Contact Details">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="phone" control={control} label="Phone *" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="alternatePhone" control={control} label="Alternate Phone" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="email" control={control} label="Email" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="city" control={control} label="City" />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormTextField name="address" control={control} label="Address" multiline rows={2} />
          </Grid>
        </FormGrid>
      </FormSection>

      <FormSection title="Driver Portal Login">
        <FormGrid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Drivers sign in at <strong>/driver/login</strong> using phone (or email) and this
              password. Leave blank to keep the current password.
              {initialData?.has_portal_access
                ? ` Portal enabled. Login: ${initialData.portal_login || initialData.phone || '—'}`
                : ' Portal not enabled yet — set a password to activate.'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormPasswordField
              name="portalPassword"
              control={control}
              label={isEdit ? 'New Portal Password' : 'Portal Password'}
              placeholder={isEdit ? 'Leave blank to keep existing' : 'Min 6 characters'}
              autoComplete="new-password"
            />
          </Grid>
        </FormGrid>
      </FormSection>

      <FormSection title="Emergency Contact">
        <FormGrid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField name="emergencyContactName" control={control} label="Contact Name" />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField name="emergencyContactPhone" control={control} label="Contact Phone" />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField
              name="emergencyContactRelation"
              control={control}
              label="Relation"
              placeholder="Spouse, Parent, etc."
            />
          </Grid>
        </FormGrid>
      </FormSection>

      <FormSection title="Working Details">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="employmentType"
              control={control}
              label="Employment Type"
              options={DRIVER_EMPLOYMENT_TYPES.map((v) => ({
                value: v,
                label: v.charAt(0).toUpperCase() + v.slice(1),
              }))}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField
              name="experienceYears"
              control={control}
              label="Experience (Years)"
              type="number"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormDatePicker name="joiningDate" control={control} label="Joining Date" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="bloodGroup"
              control={control}
              label="Blood Group"
              options={BLOOD_GROUPS.map((v) => ({ value: v, label: v }))}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="vehicleId"
              control={control}
              label="Assigned Vehicle"
              options={vehicleOptions}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="availabilityStatus"
              control={control}
              label="Availability"
              clearable={false}
              options={AVAILABILITY_STATUS_OPTIONS.filter((v) => v !== 'on_tour').map((v) => ({
                value: v,
                label: v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
              }))}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormTextField name="notes" control={control} label="Notes" multiline rows={2} />
          </Grid>
        </FormGrid>
      </FormSection>
    </FormPageLayout>
  );
}
