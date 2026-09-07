import { useEffect, useMemo, useRef, useState } from 'react';
import { Grid, CircularProgress, Box, Typography, Button, TextField, InputAdornment } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditNoteIcon from '@mui/icons-material/EditNote';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import AltRouteOutlinedIcon from '@mui/icons-material/AltRouteOutlined';
import RoomServiceOutlinedIcon from '@mui/icons-material/RoomServiceOutlined';
import { FaWhatsapp } from 'react-icons/fa';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import FormPageLayout from '../../components/forms/layout/FormPageLayout';
import EnquiryFormSection from '../../components/enquiry/EnquiryFormSection';
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
  sanitizePhoneInput,
  ENQUIRY_TYPE_OPTIONS,
  SERVICE_REQUIRED_OPTIONS,
  VACATION_TYPE_OPTIONS,
} from '../../schemas/enquiry.schema';
import enquiryService from '../../services/enquiry.service';
import { formatTripDuration } from '../../utils/formatters';
import {
  useLeadSourceTypes,
  useAgents,
  useCorporates,
} from '../../hooks/queries/useMasters';

function FieldIcon({ color, children }) {
  return (
    <Box sx={{ display: 'inline-flex', color, '& svg': { fontSize: 20 } }}>
      {children}
    </Box>
  );
}

function last10PhoneDigits(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : '';
}

const defaults = {
  enquiryType: 'client',
  customerName: '',
  phone: '',
  emergencyContactNumber: '',
  email: '',
  countryId: '',
  countryName: '',
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
  agentId: '',
  corporateId: '',
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
  prefill = {},
  onSubmit,
  onCancel,
  onRefresh,
  loading = false,
}) {
  const isEdit = mode === 'edit';
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [childrenDialogOpen, setChildrenDialogOpen] = useState(false);
  const [phoneLookup, setPhoneLookup] = useState({ loading: false, found: false });
  const autofillRef = useRef(null);
  const lastLookupKeyRef = useRef('');

  const formDefaults = useMemo(
    () => ({ ...buildFormValues(initialData), ...prefill }),
    [initialData, prefill]
  );

  const { control, handleSubmit, reset, setValue, getValues, setError } = useForm({
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
  const countryName = useWatch({ control, name: 'countryName' });
  const stateName = useWatch({ control, name: 'stateName' });
  const enquiryType = useWatch({ control, name: 'enquiryType' });
  const phone = useWatch({ control, name: 'phone' });

  const { data: sourceData, refetch: refetchSources } = useLeadSourceTypes({
    page: 1,
    perPage: 200,
    is_active: true,
  });
  const { data: agentData, refetch: refetchAgents } = useAgents({
    page: 1,
    perPage: 500,
    is_active: true,
  });
  const { data: corporateData, refetch: refetchCorporates } = useCorporates({
    page: 1,
    perPage: 500,
    is_active: true,
  });
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
  const agentOptions = useMemo(() => {
    const rows = [...(agentData?.rows || [])];
    const current = initialData?.agent;
    if (current?.id && !rows.some((row) => String(row.id) === String(current.id))) {
      rows.unshift({ id: current.id, agent_name: current.agent_name });
    }
    return rows.map((row) => ({
      value: String(row.id),
      label: row.agent_name,
    }));
  }, [agentData, initialData]);
  const corporateOptions = useMemo(() => {
    const rows = [...(corporateData?.rows || [])];
    const current = initialData?.corporate;
    if (current?.id && !rows.some((row) => String(row.id) === String(current.id))) {
      rows.unshift({ id: current.id, corporate_name: current.corporate_name });
    }
    return rows.map((row) => ({
      value: String(row.id),
      label: row.corporate_name,
    }));
  }, [corporateData, initialData]);

  const applyCustomerDetails = (customer) => {
    const next = {
      customerName: customer?.customer_name || '',
      emergencyContactNumber: customer?.emergency_contact_number || '',
      email: customer?.email || '',
      countryId: customer?.country_id || '',
      countryName: customer?.country_name || '',
      stateName: customer?.state_name || '',
      cityName: customer?.city_name || '',
    };
    setValue('customerName', next.customerName, { shouldValidate: Boolean(next.customerName) });
    setValue('emergencyContactNumber', next.emergencyContactNumber);
    setValue('email', next.email);
    setValue('countryId', next.countryId);
    setValue('countryName', next.countryName, { shouldValidate: Boolean(next.countryName) });
    setValue('stateName', next.stateName, { shouldValidate: Boolean(next.stateName) });
    setValue('cityName', next.cityName, { shouldValidate: Boolean(next.cityName) });
    autofillRef.current = customer ? next : null;
  };

  const clearAutofillIfUnchanged = () => {
    const snapshot = autofillRef.current;
    if (!snapshot) return;
    const current = getValues();
    const unchanged =
      (current.customerName || '') === (snapshot.customerName || '') &&
      (current.emergencyContactNumber || '') === (snapshot.emergencyContactNumber || '') &&
      (current.email || '') === (snapshot.email || '') &&
      (current.countryName || '') === (snapshot.countryName || '') &&
      (current.stateName || '') === (snapshot.stateName || '') &&
      (current.cityName || '') === (snapshot.cityName || '');
    if (unchanged) applyCustomerDetails(null);
    autofillRef.current = null;
  };

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

  useEffect(() => {
    if (enquiryType === 'agent') {
      setValue('corporateId', '');
    } else if (enquiryType === 'corporate') {
      setValue('agentId', '');
    } else {
      setValue('agentId', '');
      setValue('corporateId', '');
    }
  }, [enquiryType, setValue]);

  useEffect(() => {
    if (isEdit) return undefined;
    const key = last10PhoneDigits(phone);

    const timer = setTimeout(async () => {
      if (!key) {
        if (lastLookupKeyRef.current) {
          clearAutofillIfUnchanged();
          lastLookupKeyRef.current = '';
        }
        setPhoneLookup({ loading: false, found: false });
        return;
      }
      if (lastLookupKeyRef.current === key && autofillRef.current) return;

      lastLookupKeyRef.current = key;
      setPhoneLookup({ loading: true, found: false });
      try {
        const { data } = await enquiryService.findCustomerByPhone(phone);
        const customer = data?.data ?? null;
        if (lastLookupKeyRef.current !== key) return;
        if (customer) {
          applyCustomerDetails(customer);
          setPhoneLookup({ loading: false, found: true });
        } else {
          clearAutofillIfUnchanged();
          setPhoneLookup({ loading: false, found: false });
        }
      } catch {
        if (lastLookupKeyRef.current !== key) return;
        setPhoneLookup({ loading: false, found: false });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [phone, isEdit]);

  const handleRefresh = async () => {
    await Promise.all([refetchSources(), refetchAgents(), refetchCorporates(), onRefresh?.()]);
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
    if (isEdit && values.enquiryType === 'agent' && !values.agentId) {
      setError('agentId', { type: 'manual', message: 'Agent name is required' });
      return;
    }
    if (isEdit && values.enquiryType === 'corporate' && !values.corporateId) {
      setError('corporateId', { type: 'manual', message: 'Corporate name is required' });
      return;
    }
    await onSubmit?.(mapEnquiryToApi(values), initialData?.id);
  });

  const childCountNum = Number(childrenCount) || 0;

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      minHeight: 52,
      borderRadius: 2.25,
      bgcolor: '#fff',
    },
  };

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
      <Box sx={{ ...fieldSx, '& .MuiFormLabel-asterisk': { color: '#ef4444' } }}>
      <EnquiryFormSection
        title="Customer Information"
        subtitle="Please fill in the customer details to continue"
        icon={<GroupsOutlinedIcon />}
        accent="#2563eb"
        decoration="flight"
      >
        <FormGrid>
          {isEdit && (
            <Grid size={{ xs: 12, md: 4 }}>
              <FormSelect
                name="enquiryType"
                control={control}
                label="Type *"
                options={ENQUIRY_TYPE_OPTIONS}
                startIcon={<FieldIcon color="#7c3aed"><PersonOutlinedIcon /></FieldIcon>}
              />
            </Grid>
          )}
          {isEdit && enquiryType === 'agent' && (
            <Grid size={{ xs: 12, md: 4 }}>
              <FormSelect
                name="agentId"
                control={control}
                label="Agent Name *"
                placeholder="Select agent name"
                options={agentOptions}
                startIcon={<FieldIcon color="#7c3aed"><PersonOutlinedIcon /></FieldIcon>}
              />
            </Grid>
          )}
          {isEdit && enquiryType === 'corporate' && (
            <Grid size={{ xs: 12, md: 4 }}>
              <FormSelect
                name="corporateId"
                control={control}
                label="Corporate Name *"
                placeholder="Select corporate name"
                options={corporateOptions}
                startIcon={<FieldIcon color="#7c3aed"><PersonOutlinedIcon /></FieldIcon>}
              />
            </Grid>
          )}
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField
              name="phone"
              control={control}
              label="WhatsApp Contact Number *"
              placeholder="Enter WhatsApp number"
              sanitize={sanitizePhoneInput}
              startIcon={<FieldIcon color="#22c55e"><FaWhatsapp /></FieldIcon>}
              helperText={
                !isEdit && phoneLookup.found
                  ? 'Existing customer details loaded'
                  : undefined
              }
              slotProps={{
                htmlInput: { inputMode: 'tel', autoComplete: 'tel', maxLength: 16 },
                input: {
                  endAdornment: !isEdit && phoneLookup.loading ? <CircularProgress size={18} /> : null,
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField
              name="customerName"
              control={control}
              label="Name *"
              placeholder="Enter customer name"
              startIcon={<FieldIcon color="#7c3aed"><PersonOutlinedIcon /></FieldIcon>}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField
              name="emergencyContactNumber"
              control={control}
              label="Another Contact"
              placeholder="Enter another contact number"
              startIcon={<FieldIcon color="#2563eb"><PhoneOutlinedIcon /></FieldIcon>}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField
              name="email"
              control={control}
              label="Email"
              placeholder="Enter email address"
              startIcon={<FieldIcon color="#ef4444"><EmailOutlinedIcon /></FieldIcon>}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <LocationAutocomplete
              name="countryName"
              control={control}
              label="Country *"
              placeholder="Select country"
              placeType="country"
              valueFrom="name"
              setValue={setValue}
              startIcon={<FieldIcon color="#0d9488"><PublicOutlinedIcon /></FieldIcon>}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <LocationAutocomplete
              name="stateName"
              control={control}
              label="State *"
              placeholder="Select state"
              placeType="state"
              valueFrom="name"
              searchContext={countryName}
              setValue={setValue}
              startIcon={<FieldIcon color="#ea580c"><MapOutlinedIcon /></FieldIcon>}
              onPicked={(place) => {
                if (place?.country && !getValues('countryName')) {
                  setValue('countryName', place.country, { shouldValidate: true });
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <LocationAutocomplete
              name="cityName"
              control={control}
              label="City *"
              placeholder="Enter city name"
              placeType="city"
              valueFrom="name"
              searchContext={[stateName, countryName].filter(Boolean).join(' ')}
              setValue={setValue}
              startIcon={<FieldIcon color="#7c3aed"><PlaceOutlinedIcon /></FieldIcon>}
              onPicked={(place) => {
                if (place?.state && !getValues('stateName')) {
                  setValue('stateName', place.state, { shouldValidate: true });
                }
                if (place?.country && !getValues('countryName')) {
                  setValue('countryName', place.country, { shouldValidate: true });
                }
              }}
            />
          </Grid>
        </FormGrid>
      </EnquiryFormSection>

      <EnquiryFormSection
        title="Travel Information"
        subtitle="Provide travel details for your trip"
        icon={<FlightTakeoffOutlinedIcon />}
        accent="#0d9488"
        decoration="landscape"
      >
        <FormGrid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormDatePicker
              name="travelFrom"
              control={control}
              label="Travel From Date *"
              minDate={today}
              placeholder="Select travel from date"
              startIcon={<FieldIcon color="#2563eb"><CalendarMonthOutlinedIcon /></FieldIcon>}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormDatePicker
              name="travelTo"
              control={control}
              label="Travel To Date *"
              minDate={travelToMinDate}
              placeholder="Select travel to date"
              startIcon={<FieldIcon color="#7c3aed"><CalendarMonthOutlinedIcon /></FieldIcon>}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Trip Duration Info"
              value={tripDuration}
              placeholder="Enter trip duration (e.g., 5 Days / 4 Nights)"
              fullWidth
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <FieldIcon color="#ea580c">
                      <AccessTimeOutlinedIcon />
                    </FieldIcon>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <LocationAutocomplete
              name="travelFromDestination"
              control={control}
              label="Travel From Destination *"
              placeholder="Enter departure destination"
              latName="travelFromLat"
              lngName="travelFromLng"
              setValue={setValue}
              startIcon={<FieldIcon color="#0d9488"><PlaceOutlinedIcon /></FieldIcon>}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <LocationAutocomplete
              name="travelToDestination"
              control={control}
              label="Travel To Destination *"
              placeholder="Enter arrival destination"
              latName="travelToLat"
              lngName="travelToLng"
              setValue={setValue}
              startIcon={<FieldIcon color="#ef4444"><PlaceOutlinedIcon /></FieldIcon>}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField
              name="approxDistanceKm"
              control={control}
              label="Approx Distance (KM)"
              type="number"
              placeholder="Enter approximate distance in KM"
              startIcon={<FieldIcon color="#7c3aed"><AltRouteOutlinedIcon /></FieldIcon>}
              InputProps={{
                endAdornment: distanceLoading ? <CircularProgress size={18} /> : null,
              }}
            />
          </Grid>
        </FormGrid>
      </EnquiryFormSection>

      <EnquiryFormSection
        title="Travellers"
        subtitle="Add traveller details"
        icon={<GroupsOutlinedIcon />}
        accent="#7c3aed"
      >
        <FormGrid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField
              name="adults"
              control={control}
              label="Adults *"
              type="number"
              startIcon={<FieldIcon color="#7c3aed"><PersonOutlinedIcon /></FieldIcon>}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField
              name="children"
              control={control}
              label="Children"
              type="number"
              startIcon={<FieldIcon color="#2563eb"><GroupsOutlinedIcon /></FieldIcon>}
            />
          </Grid>
          {childCountNum > 0 && (
            <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<EditNoteIcon />}
                onClick={() => setChildrenDialogOpen(true)}
                fullWidth
                sx={{ minHeight: 52, borderRadius: 2.25, textTransform: 'none', fontWeight: 700 }}
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
                  bgcolor: '#fff',
                  border: '1px solid',
                  borderColor: 'rgba(124, 58, 237, 0.16)',
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
      </EnquiryFormSection>

      <EnquiryFormSection
        title="Enquiry Details"
        subtitle="Service and additional requirements"
        icon={<RoomServiceOutlinedIcon />}
        accent="#0369a1"
      >
        <FormGrid>
          {isEdit && (
            <Grid size={{ xs: 12, md: 4 }}>
              <FormSelect
                name="vacationType"
                control={control}
                label="Vacation Type"
                options={vacationTypeOptions}
              />
            </Grid>
          )}
          {isEdit && (
            <Grid size={{ xs: 12, md: 4 }}>
              <FormSelect name="leadSourceId" control={control} label="Lead Source" options={leadSourceOptions} />
            </Grid>
          )}
          <Grid size={{ xs: 12, md: 4 }}>
            <FormSelect
              name="serviceRequired"
              control={control}
              label="Service Required"
              options={SERVICE_REQUIRED_OPTIONS.map((s) => ({ value: s, label: s }))}
              startIcon={<FieldIcon color="#0369a1"><RoomServiceOutlinedIcon /></FieldIcon>}
            />
          </Grid>
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
        </FormGrid>
      </EnquiryFormSection>
      </Box>

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
