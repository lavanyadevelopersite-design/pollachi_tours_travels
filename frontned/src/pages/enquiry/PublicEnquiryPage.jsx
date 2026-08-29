import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import RoomServiceOutlinedIcon from '@mui/icons-material/RoomServiceOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import EditNoteIcon from '@mui/icons-material/EditNote';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import FormTextField from '../../components/forms/FormTextField';
import FormSelect from '../../components/forms/FormSelect';
import FormDatePicker from '../../components/forms/FormDatePicker';
import LocationAutocomplete from '../../components/forms/LocationAutocomplete';
import ChildrenDetailsDialog from '../../components/forms/ChildrenDetailsDialog';
import {
  enquirySchema,
  mapEnquiryToApi,
  ENQUIRY_TYPE_OPTIONS,
  SERVICE_REQUIRED_OPTIONS,
  VACATION_TYPE_OPTIONS,
} from '../../schemas/enquiry.schema';
import enquiryService from '../../services/enquiry.service';
import { usePublicEnquiryMasters } from '../../hooks/queries/useEnquiry';
import { APP_NAME } from '../../utils/constants';
import { formatTripDuration } from '../../utils/formatters';

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
};

const steps = [
  { label: 'Customer', icon: <PersonOutlinedIcon fontSize="small" /> },
  { label: 'Travel', icon: <FlightTakeoffIcon fontSize="small" /> },
  { label: 'Travellers', icon: <GroupsOutlinedIcon fontSize="small" /> },
  { label: 'Service', icon: <RoomServiceOutlinedIcon fontSize="small" /> },
];

function SectionHeader({ icon, title, subtitle }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2.5 }}>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          display: 'grid',
          placeItems: 'center',
          bgcolor: alpha('#2196f3', 0.12),
          color: '#1565c0',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h6" fontWeight={700} color="secondary.main">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

export default function PublicEnquiryPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [saving, setSaving] = useState(false);
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [childrenDialogOpen, setChildrenDialogOpen] = useState(false);

  const { control, handleSubmit, setValue, reset, getValues } = useForm({
    resolver: zodResolver(enquirySchema),
    defaultValues: defaults,
  });

  const countryId = useWatch({ control, name: 'countryId' });
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

  const { data: masters } = usePublicEnquiryMasters();

  const countryOptions = useMemo(
    () => (masters?.countries || []).map((c) => ({ value: c.id, label: c.name })),
    [masters]
  );
  const leadSourceOptions = useMemo(
    () =>
      (masters?.leadSources || []).map((s) => ({
        value: s.id,
        label: s.lead_source_type,
      })),
    [masters]
  );
  const serviceOptions = SERVICE_REQUIRED_OPTIONS.map((s) => ({ value: s, label: s }));
  const vacationTypeOptions = VACATION_TYPE_OPTIONS.map((v) => ({ value: v, label: v }));

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

  const onSubmit = handleSubmit(async (values) => {
    setSaving(true);
    try {
      const { data } = await enquiryService.publicSubmit(mapEnquiryToApi(values));
      const payload = data?.data || {};
      enqueueSnackbar('Enquiry submitted successfully', { variant: 'success' });
      navigate('/enquiries/success', {
        state: {
          enquiryCode: payload.enquiry_code,
          customerName: payload.customer_name,
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
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse at 10% 0%, rgba(33,150,243,0.18) 0%, transparent 45%),
          radial-gradient(ellipse at 90% 10%, rgba(21,34,56,0.12) 0%, transparent 40%),
          linear-gradient(180deg, #e8eef5 0%, #f0f4f8 40%, #ffffff 100%)
        `,
        pb: { xs: 12, md: 6 },
      }}
    >
      <Box
        sx={{
          background: 'linear-gradient(135deg, #152238 0%, #1e3a5f 55%, #2196f3 140%)',
          color: '#fff',
          py: { xs: 4, md: 5 },
          mb: { xs: 3, md: 4 },
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="overline"
            sx={{ letterSpacing: 2, opacity: 0.85, fontWeight: 600 }}
          >
            {APP_NAME}
          </Typography>
          <Typography
            variant="h3"
            fontWeight={800}
            sx={{
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              mt: 0.5,
              mb: 1,
            }}
          >
            Plan Your Next Journey
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 520 }}>
            Share your travel details and our experts will craft the perfect itinerary for you.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md">
        <Stepper
          alternativeLabel
          activeStep={1}
          sx={{
            mb: 3,
            display: { xs: 'none', sm: 'flex' },
            '& .MuiStepLabel-label': { fontSize: 13, fontWeight: 600 },
          }}
        >
          {steps.map((s) => (
            <Step key={s.label} completed={false} active>
              <StepLabel icon={s.icon}>{s.label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box component="form" onSubmit={onSubmit} noValidate>
          <Stack spacing={2.5}>
            <Card elevation={0} sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(21,34,56,0.08)' }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <SectionHeader
                  icon={<PersonOutlinedIcon />}
                  title="Customer Information"
                  subtitle="Tell us who you are"
                />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormSelect
                      name="enquiryType"
                      control={control}
                      label="Type *"
                      options={ENQUIRY_TYPE_OPTIONS}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormTextField
                      name="customerName"
                      control={control}
                      label="Name *"
                      placeholder="Your full name"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormTextField
                      name="phone"
                      control={control}
                      label="Mobile Number *"
                      placeholder="10-15 digit mobile"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormTextField
                      name="emergencyContactNumber"
                      control={control}
                      label="Another Contact"
                      placeholder="10-15 digit mobile"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormTextField
                      name="email"
                      control={control}
                      label="Email *"
                      placeholder="you@example.com"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormSelect
                      name="countryId"
                      control={control}
                      label="Country *"
                      options={countryOptions}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormTextField name="stateName" control={control} label="State *" placeholder="Enter state" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormTextField name="cityName" control={control} label="City *" placeholder="Enter city" />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card elevation={0} sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(21,34,56,0.08)' }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <SectionHeader
                  icon={<CalendarMonthOutlinedIcon />}
                  title="Travel Information"
                  subtitle="When and where you want to travel"
                />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormDatePicker
                      name="travelFrom"
                      control={control}
                      label="Travel From Date *"
                      minDate={today}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormDatePicker
                      name="travelTo"
                      control={control}
                      label="Travel To Date *"
                      minDate={travelToMinDate}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label="Trip Duration Info"
                      value={tripDuration}
                      placeholder="Select from & to dates"
                      fullWidth
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormTextField
                      name="approxDistanceKm"
                      control={control}
                      label="Approx Distance (KM) *"
                      type="number"
                      InputProps={{
                        endAdornment: distanceLoading ? (
                          <CircularProgress size={18} />
                        ) : (
                          <PlaceOutlinedIcon fontSize="small" color="action" />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <LocationAutocomplete
                      name="travelFromDestination"
                      control={control}
                      label="Travel From Destination *"
                      latName="travelFromLat"
                      lngName="travelFromLng"
                      setValue={setValue}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <LocationAutocomplete
                      name="travelToDestination"
                      control={control}
                      label="Travel To Destination *"
                      latName="travelToLat"
                      lngName="travelToLng"
                      setValue={setValue}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card elevation={0} sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(21,34,56,0.08)' }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <SectionHeader
                  icon={<GroupsOutlinedIcon />}
                  title="Travellers"
                  subtitle="How many people are travelling"
                />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormTextField name="adults" control={control} label="Adults *" type="number" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormTextField name="children" control={control} label="Children" type="number" />
                  </Grid>
                  {childCountNum > 0 && (
                    <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', alignItems: 'center' }}>
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
                </Grid>
              </CardContent>
            </Card>

            <Card elevation={0} sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(21,34,56,0.08)' }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <SectionHeader
                  icon={<RoomServiceOutlinedIcon />}
                  title="Enquiry Details"
                  subtitle="Lead source and services you need"
                />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormSelect
                      name="vacationType"
                      control={control}
                      label="Vacation Type"
                      options={vacationTypeOptions}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormSelect
                      name="leadSourceId"
                      control={control}
                      label="Lead Source"
                      options={leadSourceOptions}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormSelect
                      name="serviceRequired"
                      control={control}
                      label="Service Required"
                      options={serviceOptions}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <FormTextField
                      name="requirements"
                      control={control}
                      label="Additional Requirements"
                      multiline
                      rows={4}
                      placeholder="Share any special requests, preferences, or notes"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                justifyContent: 'flex-end',
                gap: 2,
              }}
            >
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={saving || distanceLoading}
                sx={{
                  px: 5,
                  py: 1.4,
                  borderRadius: 2,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #2196f3 0%, #1565c0 100%)',
                }}
              >
                {saving ? <CircularProgress size={22} color="inherit" /> : 'Submit Enquiry'}
              </Button>
            </Box>
          </Stack>

          {/* Sticky mobile submit */}
          <Box
            sx={{
              display: { xs: 'block', md: 'none' },
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              p: 2,
              bgcolor: alpha('#fff', 0.96),
              borderTop: '1px solid',
              borderColor: 'divider',
              zIndex: 20,
              backdropFilter: 'blur(8px)',
            }}
          >
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={saving || distanceLoading}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: 700,
                fontSize: 16,
                background: 'linear-gradient(135deg, #2196f3 0%, #1565c0 100%)',
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
