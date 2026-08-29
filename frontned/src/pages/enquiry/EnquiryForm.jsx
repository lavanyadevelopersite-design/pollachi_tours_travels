import { useEffect, useMemo, useRef, useState } from 'react';
import { Grid, CircularProgress, Box, Typography, Button, TextField, alpha } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import FormPageLayout from '../../components/forms/layout/FormPageLayout';
import FormSection from '../../components/forms/layout/FormSection';
import FormGrid from '../../components/forms/layout/FormGrid';
import FormTextField from '../../components/forms/FormTextField';
import FormSelect from '../../components/forms/FormSelect';
import FormDatePicker from '../../components/forms/FormDatePicker';
import LocationAutocomplete from '../../components/forms/LocationAutocomplete';
import ChildrenDetailsDialog from '../../components/forms/ChildrenDetailsDialog';
import {
  enquirySchema,
  mapEnquiryFromApi,
  mapEnquiryToApi,
  ENQUIRY_TYPE_OPTIONS,
  SERVICE_REQUIRED_OPTIONS,
  VACATION_TYPE_OPTIONS,
} from '../../schemas/enquiry.schema';
import enquiryService from '../../services/enquiry.service';
import { formatTripDuration } from '../../utils/formatters';
import {
  useCountries,
  useLeadSourceTypes,
  useLeadStatuses,
} from '../../hooks/queries/useMasters';

const defaults = {
  enquiryType: 'client',
  customerName: '',
  phone: '',
  emergencyContactNumber: '',
  email: '',
  countryId: '',
  stateName: '',
  cityName: '',
  travelFrom: '',
  travelTo: '',
  travelFromDestination: '',
  travelToDestination: '',
  travelFromLat: null,
  travelFromLng: null,
  travelToLat: null,
  travelToLng: null,
  approxDistanceKm: null,
  adults: 1,
  children: 0,
  childrenDetails: [],
  infants: 0,
  leadSourceId: '',
  serviceRequired: '',
  vacationType: '',
  requirements: '',
  status: 'open',
};

function buildFormValues(initialData) {
  return initialData ? { ...defaults, ...mapEnquiryFromApi(initialData) } : { ...defaults };
}

export default function EnquiryForm({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  onRefresh,
  loading = false,
}) {
  const isEdit = mode === 'edit';
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [childrenDialogOpen, setChildrenDialogOpen] = useState(false);

  const formDefaults = useMemo(() => buildFormValues(initialData), [initialData]);

  const { control, handleSubmit, reset, setValue, getValues } = useForm({
    resolver: zodResolver(enquirySchema),
    defaultValues: formDefaults,
  });

  const travelFrom = useWatch({ control, name: 'travelFrom' });
  const travelTo = useWatch({ control, name: 'travelTo' });
  const fromDest = useWatch({ control, name: 'travelFromDestination' });
  const toDest = useWatch({ control, name: 'travelToDestination' });
  const fromLat = useWatch({ control, name: 'travelFromLat' });
  const fromLng = useWatch({ control, name: 'travelFromLng' });
  const toLat = useWatch({ control, name: 'travelToLat' });
  const toLng = useWatch({ control, name: 'travelToLng' });
  const childrenCount = useWatch({ control, name: 'children' });
  const childrenDetails = useWatch({ control, name: 'childrenDetails' }) || [];

  const { data: countryData, refetch: refetchCountries } = useCountries({
    page: 1,
    perPage: 300,
    is_active: true,
  });
  const { data: sourceData, refetch: refetchSources } = useLeadSourceTypes({
    page: 1,
    perPage: 200,
    is_active: true,
  });
  const { data: leadStatusData } = useLeadStatuses({
    page: 1,
    perPage: 100,
    is_active: true,
  });

  const leadStatusDisplay = useMemo(() => {
    const fromEnquiry =
      initialData?.leadStatus || initialData?.lead_status || null;
    if (fromEnquiry?.lead_status) {
      return {
        label: fromEnquiry.lead_status,
        color: fromEnquiry.button_color || '#3B82F6',
      };
    }
    const newEnquiry = (leadStatusData?.rows || []).find(
      (s) => String(s.lead_status || '').toLowerCase() === 'new enquiry'
    );
    return {
      label: newEnquiry?.lead_status || 'New Enquiry',
      color: newEnquiry?.button_color || '#3B82F6',
    };
  }, [initialData, leadStatusData]);

  const countryOptions = useMemo(
    () => (countryData?.rows || []).map((c) => ({ value: String(c.id), label: c.name })),
    [countryData]
  );
  const leadSourceOptions = useMemo(
    () =>
      (sourceData?.rows || []).map((s) => ({
        value: String(s.id),
        label: s.lead_source_type,
      })),
    [sourceData]
  );
  const vacationTypeOptions = useMemo(
    () => VACATION_TYPE_OPTIONS.map((v) => ({ value: v, label: v })),
    []
  );

  const prevChildrenRef = useRef(Number(formDefaults.children) || 0);
  const skipChildrenDialogRef = useRef(true);

  const today = useMemo(() => dayjs().startOf('day'), []);
  const travelToMinDate = useMemo(() => {
    if (travelFrom) {
      const from = dayjs(travelFrom).startOf('day');
      return from.isAfter(today) ? from : today;
    }
    return today;
  }, [travelFrom, today]);

  const tripDuration = useMemo(
    () => formatTripDuration(travelFrom, travelTo),
    [travelFrom, travelTo]
  );

  useEffect(() => {
    const mapped = buildFormValues(initialData);
    reset(mapped);
    prevChildrenRef.current = Number(mapped.children) || 0;
    skipChildrenDialogRef.current = true;
  }, [initialData, reset]);

  useEffect(() => {
    const count = Number(childrenCount) || 0;
    if (skipChildrenDialogRef.current) {
      skipChildrenDialogRef.current = false;
      prevChildrenRef.current = count;
      return;
    }

    if (count <= 0) {
      setValue('childrenDetails', []);
      setChildrenDialogOpen(false);
      prevChildrenRef.current = 0;
      return;
    }

    if (count !== prevChildrenRef.current) {
      setChildrenDialogOpen(true);
      prevChildrenRef.current = count;
    }
  }, [childrenCount, setValue]);

  const handleRefresh = async () => {
    await Promise.all([refetchCountries(), refetchSources(), onRefresh?.()]);
  };

  useEffect(() => {
    const canCalc =
      (fromLat != null && fromLng != null && toLat != null && toLng != null) ||
      (fromDest && toDest && fromDest.trim().toLowerCase() !== toDest.trim().toLowerCase());
    if (!canCalc) return undefined;

    const timer = setTimeout(async () => {
      setDistanceLoading(true);
      try {
        const { data } = await enquiryService.calculateDistance({
          travel_from_lat: fromLat,
          travel_from_lng: fromLng,
          travel_to_lat: toLat,
          travel_to_lng: toLng,
          travel_from_destination: fromDest,
          travel_to_destination: toDest,
        });
        const result = data?.data;
        if (result?.distanceKm != null) {
          setValue('approxDistanceKm', result.distanceKm, { shouldValidate: true });
        }
      } catch {
        /* ignore */
      } finally {
        setDistanceLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [fromDest, toDest, fromLat, fromLng, toLat, toLng, setValue]);

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(mapEnquiryToApi(values), initialData?.id);
  });

  const childCountNum = Number(childrenCount) || 0;

  return (
    <FormPageLayout
      title="Enquiry Management"
      subtitle={isEdit ? 'Update enquiry information' : 'Create a new enquiry'}
      sectionTitle={isEdit ? 'Edit Enquiry' : 'Create Enquiry'}
      onSubmit={submit}
      onCancel={onCancel}
      loading={loading}
      submitLabel={isEdit ? 'Update' : 'Save'}
      extra={
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>
          Refresh
        </Button>
      }
    >
      <FormSection title="Customer Information">
        <FormGrid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormSelect name="enquiryType" control={control} label="Type *" options={ENQUIRY_TYPE_OPTIONS} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField name="customerName" control={control} label="Name *" placeholder="Enter name" />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField name="phone" control={control} label="WhatsApp Contact Number *" placeholder="10-15 digits" />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField
              name="emergencyContactNumber"
              control={control}
              label="Another Contact"
              placeholder="10-15 digits"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField name="email" control={control} label="Email" placeholder="Enter email" />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormSelect name="countryId" control={control} label="Country *" options={countryOptions} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField name="stateName" control={control} label="State *" placeholder="Enter state" />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField name="cityName" control={control} label="City *" placeholder="Enter city" />
          </Grid>
        </FormGrid>
      </FormSection>

      <FormSection title="Travel Information">
        <FormGrid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormDatePicker
              name="travelFrom"
              control={control}
              label="Travel From Date *"
              minDate={today}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormDatePicker
              name="travelTo"
              control={control}
              label="Travel To Date *"
              minDate={travelToMinDate}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Trip Duration Info"
              value={tripDuration}
              placeholder="Select from & to dates"
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField
              name="approxDistanceKm"
              control={control}
              label="Approx Distance (KM) *"
              type="number"
              InputProps={{
                endAdornment: distanceLoading ? <CircularProgress size={18} /> : null,
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <LocationAutocomplete
              name="travelFromDestination"
              control={control}
              label="Travel From Destination *"
              latName="travelFromLat"
              lngName="travelFromLng"
              setValue={setValue}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <LocationAutocomplete
              name="travelToDestination"
              control={control}
              label="Travel To Destination *"
              latName="travelToLat"
              lngName="travelToLng"
              setValue={setValue}
            />
          </Grid>
        </FormGrid>
      </FormSection>

      <FormSection title="Travellers">
        <FormGrid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField name="adults" control={control} label="Adults *" type="number" />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField name="children" control={control} label="Children" type="number" />
          </Grid>
          {childCountNum > 0 && (
            <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<EditNoteIcon />}
                onClick={() => setChildrenDialogOpen(true)}
                fullWidth
                sx={{ minHeight: 52 }}
              >
                {childrenDetails.length === childCountNum
                  ? `Edit Children Details (${childCountNum})`
                  : `Add Children Details (${childCountNum})`}
              </Button>
            </Grid>
          )}
          {childCountNum > 0 && childrenDetails.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1.5,
                }}
              >
                {childrenDetails.map((child, idx) => (
                  <Typography key={idx} variant="body2">
                    <strong>Children {idx + 1} Age:</strong> {child.age} yrs
                  </Typography>
                ))}
              </Box>
            </Grid>
          )}
        </FormGrid>
      </FormSection>

      <FormSection title="Enquiry Details">
        <FormGrid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormSelect
              name="vacationType"
              control={control}
              label="Vacation Type"
              options={vacationTypeOptions}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormSelect name="leadSourceId" control={control} label="Lead Source" options={leadSourceOptions} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormSelect
              name="serviceRequired"
              control={control}
              label="Service Required"
              options={SERVICE_REQUIRED_OPTIONS.map((s) => ({ value: s, label: s }))}
            />
          </Grid>
          {isEdit && (
            <Grid size={{ xs: 12, md: 4 }}>
              <FormSelect
                name="status"
                control={control}
                label="Status"
                options={[
                  { value: 'open', label: 'Open' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'quoted', label: 'Quoted' },
                  { value: 'booked', label: 'Booked' },
                  { value: 'closed', label: 'Closed' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
              />
            </Grid>
          )}
          <Grid size={{ xs: 12 }}>
            <FormTextField
              name="requirements"
              control={control}
              label="Additional Requirements"
              multiline
              rows={4}
              placeholder="Enter additional requirements"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.75 }}>
              Lead Status{isEdit ? '' : ' (auto-assigned on save)'}
            </Typography>
            <Button
              disableElevation
              sx={{
                textTransform: 'none',
                fontWeight: 800,
                px: 2.5,
                py: 1,
                borderRadius: 999,
                color: '#fff',
                background: `linear-gradient(135deg, ${leadStatusDisplay.color} 0%, ${alpha(leadStatusDisplay.color, 0.75)} 100%)`,
                boxShadow: `0 8px 18px ${alpha(leadStatusDisplay.color, 0.35)}`,
                pointerEvents: 'none',
                '&:hover': {
                  background: `linear-gradient(135deg, ${leadStatusDisplay.color} 0%, ${alpha(leadStatusDisplay.color, 0.75)} 100%)`,
                },
              }}
            >
              {leadStatusDisplay.label}
            </Button>
          </Grid>
        </FormGrid>
      </FormSection>

      <ChildrenDetailsDialog
        open={childrenDialogOpen}
        count={childCountNum}
        initialDetails={getValues('childrenDetails') || []}
        onClose={() => setChildrenDialogOpen(false)}
        onSave={(details) => {
          setValue('childrenDetails', details, { shouldValidate: true });
          setChildrenDialogOpen(false);
        }}
      />
    </FormPageLayout>
  );
}
