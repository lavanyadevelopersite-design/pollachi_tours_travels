import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
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
import RoomServiceOutlinedIcon from '@mui/icons-material/RoomServiceOutlined';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { FaWhatsapp } from 'react-icons/fa';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import EnquiryFormSection from '../../components/enquiry/EnquiryFormSection';
import FormGrid from '../../components/forms/layout/FormGrid';
import FormTextField from '../../components/forms/FormTextField';
import FormSelect from '../../components/forms/FormSelect';
import FormDatePicker from '../../components/forms/FormDatePicker';
import LocationAutocomplete from '../../components/forms/LocationAutocomplete';
import ChildrenDetailsDialog from '../../components/forms/ChildrenDetailsDialog';
import {
  enquirySchema,
  mapEnquiryToApi,
  sanitizePhoneInput,
  SERVICE_REQUIRED_OPTIONS,
} from '../../schemas/enquiry.schema';
import enquiryService from '../../services/enquiry.service';
import { useBranding } from '../../hooks/queries/useBranding';
import { APP_NAME, PUBLIC_ENQUIRY_THANKS_PATH, resolveMediaUrl } from '../../utils/constants';
import { formatTripDuration } from '../../utils/formatters';

function brandLogoSrc(path) {
  const url = resolveMediaUrl(path);
  if (!url) return null;
  const version = encodeURIComponent(String(path).split('/').pop() || '1');
  return `${url}${url.includes('?') ? '&' : '?'}v=${version}`;
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
  serviceRequired: '',
  vacationType: '',
  requirements: '',
};

function FieldIcon({ color, children }) {
  return (
    <Box sx={{ display: 'inline-flex', color, '& svg': { fontSize: 20 } }}>
      {children}
    </Box>
  );
}

export default function PublicEnquiryPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { data: branding } = useBranding();
  const [saving, setSaving] = useState(false);
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [childrenDialogOpen, setChildrenDialogOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const logoUrl = brandLogoSrc(branding?.company_logo);
  const showLogo = Boolean(logoUrl) && !logoFailed;
  const companyName = branding?.company_name || APP_NAME;

  useEffect(() => {
    setLogoFailed(false);
  }, [logoUrl]);

  useEffect(() => {
    const previewTitle = 'pollachi tours & travels';
    document.title = previewTitle;

    const removeMeta = (attr, key) => {
      document.querySelectorAll(`meta[${attr}="${key}"]`).forEach((el) => el.remove());
    };
    const setMeta = (attr, key, content) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    removeMeta('name', 'description');
    removeMeta('property', 'og:description');
    removeMeta('name', 'twitter:description');
    setMeta('property', 'og:title', previewTitle);
    setMeta('property', 'og:type', 'website');
  }, []);

  const { control, handleSubmit, setValue, reset, getValues } = useForm({
    resolver: zodResolver(enquirySchema),
    defaultValues: defaults,
  });

  const countryName = useWatch({ control, name: 'countryName' });
  const stateName = useWatch({ control, name: 'stateName' });
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

  const prevChildrenRef = useRef(0);
  const skipChildrenDialogRef = useRef(true);
  const childCountNum = Number(childrenCount) || 0;

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
    const canCalc =
      (fromLat != null && fromLng != null && toLat != null && toLng != null) ||
      (fromDest && toDest && fromDest.trim().toLowerCase() !== toDest.trim().toLowerCase());

    if (!canCalc) return undefined;

    const timer = setTimeout(async () => {
      setDistanceLoading(true);
      try {
        const { data } = await enquiryService.publicDistance({
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
          if (result.from) {
            setValue('travelFromLat', result.from.lat);
            setValue('travelFromLng', result.from.lng);
          }
          if (result.to) {
            setValue('travelToLat', result.to.lat);
            setValue('travelToLng', result.to.lng);
          }
        }
      } catch {
        /* keep prior value */
      } finally {
        setDistanceLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [fromDest, toDest, fromLat, fromLng, toLat, toLng, setValue]);

  const onSubmit = handleSubmit(
    async (values) => {
      setSaving(true);
      try {
        const { data } = await enquiryService.publicSubmit(mapEnquiryToApi(values));
        const payload = data?.data || {};
        navigate(PUBLIC_ENQUIRY_THANKS_PATH, {
          state: {
            enquiryCode: payload.enquiry_code,
            customerName: payload.customer_name || values.customerName,
          },
        });
        reset(defaults);
        skipChildrenDialogRef.current = true;
        prevChildrenRef.current = 0;
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.errors?.[0]?.message ||
          'Unable to submit enquiry';
        enqueueSnackbar(msg, { variant: 'error' });
      } finally {
        setSaving(false);
      }
    },
    () => {
      enqueueSnackbar('Please fill all required fields', { variant: 'warning' });
    }
  );

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      minHeight: 52,
      borderRadius: 2.25,
      bgcolor: '#fff',
    },
    '& .MuiFormLabel-asterisk': { color: '#ef4444' },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse at 8% 0%, rgba(37,99,235,0.16) 0%, transparent 46%),
          radial-gradient(ellipse at 96% 8%, rgba(13,148,136,0.14) 0%, transparent 42%),
          linear-gradient(180deg, #eef4fb 0%, #f5f8fc 42%, #ffffff 100%)
        `,
        pb: { xs: 14, md: 8 },
      }}
    >
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 52%, #0d9488 140%)',
          color: '#fff',
          py: { xs: 4, md: 5.5 },
          mb: { xs: 2.5, md: 3.5 },
        }}
      >
        <Container maxWidth="md">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 2, sm: 2.5 }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            sx={{ mb: 1.5 }}
          >
            {showLogo ? (
              <Box
                sx={{
                  width: { xs: 72, md: 88 },
                  height: { xs: 72, md: 88 },
                  borderRadius: 2.5,
                  bgcolor: 'rgba(255,255,255,0.96)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  boxShadow: '0 10px 24px rgba(15, 23, 42, 0.22)',
                  flexShrink: 0,
                }}
              >
                <Box
                  component="img"
                  src={logoUrl}
                  alt={companyName}
                  onError={() => setLogoFailed(true)}
                  sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 0.75 }}
                />
              </Box>
            ) : null}
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="overline" sx={{ letterSpacing: 2, opacity: 0.8, fontWeight: 700 }}>
                {companyName}
              </Typography>
              <Typography
                variant="h3"
                fontWeight={800}
                sx={{ fontSize: { xs: '1.7rem', sm: '2.15rem', md: '2.55rem' }, mt: 0.25, mb: 1 }}
              >
                Tell us about your trip
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.92, maxWidth: 560, lineHeight: 1.6 }}>
                Fill in your details below. Our team will review your enquiry and get back to you
                shortly.
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="md" sx={fieldSx}>
        <Box component="form" onSubmit={onSubmit} noValidate>
          <EnquiryFormSection
            title="Customer Information"
            subtitle="Please fill in your contact details"
            icon={<GroupsOutlinedIcon />}
            accent="#2563eb"
            decoration="flight"
          >
            <FormGrid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormTextField
                  name="phone"
                  control={control}
                  label="WhatsApp Contact Number *"
                  placeholder="Enter WhatsApp number"
                  sanitize={sanitizePhoneInput}
                  startIcon={<FieldIcon color="#22c55e"><FaWhatsapp /></FieldIcon>}
                  slotProps={{
                    htmlInput: { inputMode: 'tel', autoComplete: 'tel', maxLength: 16 },
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
                  placeholder="Share any special requests or notes"
                />
              </Grid>
            </FormGrid>
          </EnquiryFormSection>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="flex-end"
            sx={{ display: { xs: 'none', md: 'flex' }, mt: 1 }}
          >
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={saving || distanceLoading}
              sx={{
                px: 4.5,
                py: 1.4,
                borderRadius: 2.5,
                fontWeight: 800,
                textTransform: 'none',
                fontSize: '1.05rem',
                background: 'linear-gradient(135deg, #0d9488 0%, #2563eb 100%)',
                boxShadow: '0 10px 24px rgba(13,148,136,0.28)',
              }}
            >
              {saving ? <CircularProgress size={22} color="inherit" /> : 'Submit Enquiry'}
            </Button>
          </Stack>

          <Box
            sx={{
              display: { xs: 'block', md: 'none' },
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              p: 1.75,
              bgcolor: 'rgba(255,255,255,0.96)',
              borderTop: '1px solid',
              borderColor: 'divider',
              zIndex: 20,
              backdropFilter: 'blur(10px)',
            }}
          >
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={saving || distanceLoading}
              sx={{
                py: 1.45,
                borderRadius: 2.5,
                fontWeight: 800,
                fontSize: 16,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #0d9488 0%, #2563eb 100%)',
              }}
            >
              {saving ? <CircularProgress size={22} color="inherit" /> : 'Submit Enquiry'}
            </Button>
          </Box>
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
      </Container>
    </Box>
  );
}
