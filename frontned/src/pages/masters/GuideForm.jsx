import { Avatar, Box, Grid, Link, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormPageLayout from '../../components/forms/layout/FormPageLayout';
import FormSection from '../../components/forms/layout/FormSection';
import FormGrid from '../../components/forms/layout/FormGrid';
import FormTextField from '../../components/forms/FormTextField';
import FormSelect from '../../components/forms/FormSelect';
import FormDatePicker from '../../components/forms/FormDatePicker';
import FormFileUpload from '../../components/forms/FormFileUpload';
import { resolveMediaUrl } from '../../utils/constants';
import {
  guideSchema,
  mapGuideToApi,
  activeStatus,
  AVAILABILITY_STATUS_OPTIONS,
  ID_PROOF_TYPES,
} from '../../schemas/master.schema';

const defaults = {
  fullName: '',
  code: '',
  photo: null,
  phone: '',
  alternatePhone: '',
  whatsapp: '',
  email: '',
  address: '',
  city: '',
  emergencyPhone: '',
  languages: '',
  specialization: '',
  licenseNumber: '',
  licenseExpiry: '',
  idProofType: '',
  idProofNumber: '',
  proofDocument: null,
  experienceYears: 0,
  dailyRate: 0,
  joiningDate: '',
  coverageAreas: '',
  availabilityStatus: 'available',
  bio: '',
  notes: '',
  status: 'active',
};

export default function GuideForm({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEdit = mode === 'edit';
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(guideSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(
      initialData
        ? {
            ...defaults,
            fullName: initialData.full_name ?? '',
            code: initialData.code ?? '',
            phone: initialData.phone ?? '',
            alternatePhone: initialData.alternate_phone ?? '',
            whatsapp: initialData.whatsapp ?? '',
            email: initialData.email ?? '',
            address: initialData.address ?? '',
            city: initialData.city ?? '',
            emergencyPhone: initialData.emergency_phone ?? '',
            languages: initialData.languages ?? '',
            specialization: initialData.specialization ?? '',
            licenseNumber: initialData.license_number ?? '',
            licenseExpiry: initialData.license_expiry ?? '',
            idProofType: initialData.id_proof_type ?? '',
            idProofNumber: initialData.id_proof_number ?? '',
            experienceYears: initialData.experience_years ?? 0,
            dailyRate: initialData.daily_rate ?? 0,
            joiningDate: initialData.joining_date ?? '',
            coverageAreas: initialData.coverage_areas ?? '',
            availabilityStatus: initialData.availability_status ?? 'available',
            bio: initialData.bio ?? '',
            notes: initialData.notes ?? '',
            status: activeStatus(initialData),
            photo: null,
            proofDocument: null,
          }
        : defaults
    );
  }, [initialData, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(mapGuideToApi(values), initialData?.id);
  });

  const existingPhoto = resolveMediaUrl(initialData?.photo);
  const existingProof = resolveMediaUrl(initialData?.proof_document);

  return (
    <FormPageLayout
      title="Guide Info Management"
      subtitle={
        isEdit
          ? 'Update guide information for tourist contact during tours'
          : 'Add a tour guide as a contact source for tourists'
      }
      sectionTitle={isEdit ? 'Edit Guide' : 'Create Guide'}
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
              label="Guide Code"
              placeholder="Auto-generated if empty"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormFileUpload name="photo" control={control} label="Guide Photo" accept="image/*" />
            {existingPhoto && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                <Avatar src={existingPhoto} alt="Guide" sx={{ width: 56, height: 56 }} />
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
          <Grid size={{ xs: 12 }}>
            <FormTextField
              name="bio"
              control={control}
              label="Bio (shown to tourists)"
              multiline
              rows={2}
              placeholder="Short introduction for tourists during the tour"
            />
          </Grid>
        </FormGrid>
      </FormSection>

      <FormSection title="Tourist Contact Source">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="phone" control={control} label="Primary Phone *" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField
              name="whatsapp"
              control={control}
              label="WhatsApp"
              placeholder="Number tourists can message during tour"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField
              name="emergencyPhone"
              control={control}
              label="Emergency / 24x7 Phone"
              placeholder="Shared with tourists for urgent help"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="alternatePhone" control={control} label="Alternate Phone" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="email" control={control} label="Email" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="city" control={control} label="City / Base Location" />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormTextField name="address" control={control} label="Address" multiline rows={2} />
          </Grid>
        </FormGrid>
      </FormSection>

      <FormSection title="Guide Profile & Proofs">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField
              name="languages"
              control={control}
              label="Languages"
              placeholder="English, Hindi, Tamil"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField
              name="specialization"
              control={control}
              label="Specialization"
              placeholder="Heritage, Adventure, Wildlife"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField
              name="coverageAreas"
              control={control}
              label="Coverage Areas"
              placeholder="Regions / destinations covered"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="licenseNumber" control={control} label="Guide License No" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormDatePicker name="licenseExpiry" control={control} label="License Expiry" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="idProofType"
              control={control}
              label="ID Proof Type"
              options={ID_PROOF_TYPES.map((v) => ({ value: v, label: v }))}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="idProofNumber" control={control} label="ID Proof Number" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormFileUpload
              name="proofDocument"
              control={control}
              label="Proof Document"
              accept="image/*,.pdf"
            />
            {existingProof && (
              <Typography variant="caption" display="block" mt={1}>
                Current:{' '}
                <Link href={existingProof} target="_blank" rel="noopener noreferrer">
                  View document
                </Link>
              </Typography>
            )}
          </Grid>
        </FormGrid>
      </FormSection>

      <FormSection title="Working Details">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField
              name="experienceYears"
              control={control}
              label="Experience (Years)"
              type="number"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="dailyRate" control={control} label="Daily Rate" type="number" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormDatePicker name="joiningDate" control={control} label="Joining Date" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="availabilityStatus"
              control={control}
              label="Availability"
              clearable={false}
              options={AVAILABILITY_STATUS_OPTIONS.filter((v) => v !== 'on_trip').map((v) => ({
                value: v,
                label: v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
              }))}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormTextField name="notes" control={control} label="Internal Notes" multiline rows={2} />
          </Grid>
        </FormGrid>
      </FormSection>
    </FormPageLayout>
  );
}
