import { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import LocalTaxiOutlinedIcon from '@mui/icons-material/LocalTaxiOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import driverPortalService from '../../services/driverPortal.service';
import OwnershipTag from '../../components/common/OwnershipTag';
import { resolveMediaUrl } from '../../utils/constants';

const STATUS_FLOW = [
  {
    value: 'on_the_way',
    label: 'On the way to customer place',
    hint: 'Tap when you start heading to the pickup point',
    color: '#0284c7',
  },
  {
    value: 'customer_place_reached',
    label: 'Customer place reached',
    hint: 'Tap when you arrive at the customer location',
    color: '#d97706',
  },
  {
    value: 'trip_ongoing',
    label: 'Trip ongoing',
    hint: 'Enter starting KM + screenshot, then start the trip',
    color: '#059669',
    needsStartingKm: true,
  },
  {
    value: 'trip_closed',
    label: 'Trip closed',
    hint: 'Enter closing KM to finish and auto-calculate total KM',
    color: '#475569',
    needsClosingKm: true,
  },
];

const buildFormData = (fields, files = {}) => {
  const hasFiles = files.startingKmPhoto || files.closingKmPhoto;
  if (!hasFiles) return fields;

  const fd = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      fd.append(key, String(value));
    }
  });
  if (files.startingKmPhoto) fd.append('starting_km_photo', files.startingKmPhoto);
  if (files.closingKmPhoto) fd.append('closing_km_photo', files.closingKmPhoto);
  return fd;
};

function KmPhotoUpload({ label, helperText, existingUrl, previewUrl, onChange, required, disabled }) {
  const inputRef = useRef(null);
  const displayUrl = previewUrl || resolveMediaUrl(existingUrl);

  return (
    <Box>
      <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
        {label}
        {required && !disabled ? ' *' : ''}
      </Typography>
      <Stack direction="row" spacing={1.5} alignItems="center">
        {!disabled && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<PhotoCameraOutlinedIcon />}
            onClick={() => inputRef.current?.click()}
            sx={{ borderRadius: 2, fontWeight: 600, flexShrink: 0 }}
          >
            {displayUrl ? 'Change photo' : 'Upload photo'}
          </Button>
        )}
        {disabled && (
          <Chip
            label="Saved — cannot edit"
            size="small"
            color="success"
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          disabled={disabled}
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            onChange(file);
            e.target.value = '';
          }}
        />
        {displayUrl && (
          <Box
            component="img"
            src={displayUrl}
            alt={label}
            sx={{
              width: 56,
              height: 56,
              objectFit: 'cover',
              borderRadius: 1.5,
              border: '1px solid rgba(28,35,47,0.12)',
            }}
          />
        )}
      </Stack>
      {helperText && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {disabled ? 'Saved — cannot be changed' : helperText}
        </Typography>
      )}
    </Box>
  );
}

export default function DriverTripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const [startingKm, setStartingKm] = useState('');
  const [closingKm, setClosingKm] = useState('');
  const [notes, setNotes] = useState('');
  const [activeAction, setActiveAction] = useState(null);
  const [startingKmPhoto, setStartingKmPhoto] = useState(null);
  const [closingKmPhoto, setClosingKmPhoto] = useState(null);
  const [startingKmPreview, setStartingKmPreview] = useState(null);
  const [closingKmPreview, setClosingKmPreview] = useState(null);
  const startingKmSectionRef = useRef(null);
  const closingKmSectionRef = useRef(null);

  const { data: trip, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['driver-trip', id],
    queryFn: async () => {
      const res = await driverPortalService.getTrip(id);
      const row = res.data?.data || res.data;
      setStartingKm(row.starting_km != null ? String(row.starting_km) : '');
      setClosingKm(row.closing_km != null ? String(row.closing_km) : '');
      setNotes(row.driver_update_notes || '');
      setStartingKmPhoto(null);
      setClosingKmPhoto(null);
      setStartingKmPreview(null);
      setClosingKmPreview(null);
      return row;
    },
    enabled: Boolean(id),
  });

  const mutation = useMutation({
    mutationFn: (payload) => driverPortalService.updateTrip(id, payload),
    onSuccess: async (res) => {
      const row = res.data?.data || res.data;
      await queryClient.invalidateQueries({ queryKey: ['driver-trips'] });
      await queryClient.setQueryData(['driver-trip', id], row);
      setStartingKm(row.starting_km != null ? String(row.starting_km) : '');
      setClosingKm(row.closing_km != null ? String(row.closing_km) : '');
      setStartingKmPhoto(null);
      setClosingKmPhoto(null);
      setStartingKmPreview(null);
      setClosingKmPreview(null);
      enqueueSnackbar('Trip updated', { variant: 'success' });
      setActiveAction(null);
    },
    onError: (err) => {
      enqueueSnackbar(err?.response?.data?.message || 'Update failed', { variant: 'error' });
      setActiveAction(null);
    },
  });

  const currentIndex = useMemo(() => {
    if (!trip?.trip_status) return -1;
    return STATUS_FLOW.findIndex((s) => s.value === trip.trip_status);
  }, [trip?.trip_status]);

  const previewTotal = useMemo(() => {
    const start = Number(startingKm);
    const end = Number(closingKm);
    if (Number.isNaN(start) || Number.isNaN(end) || closingKm === '' || startingKm === '') {
      return null;
    }
    if (end < start) return null;
    return Number((end - start).toFixed(2));
  }, [startingKm, closingKm]);

  const hasStartingPhoto = Boolean(
    startingKmPhoto || trip?.starting_km_photo || startingKmPreview
  );

  const startingKmLocked = Boolean(trip?.starting_km != null && trip?.starting_km_photo);
  const tripLocked = Boolean(trip?.is_closed);
  const fieldsLocked = tripLocked || startingKmLocked;
  const startingKmEntered =
    startingKmLocked || (startingKm !== '' && !Number.isNaN(Number(startingKm)));
  const startingKmReady = startingKmLocked || (startingKmEntered && hasStartingPhoto);
  const closingKmEntered = closingKm !== '' && !Number.isNaN(Number(closingKm));
  const closingKmReady =
    closingKmEntered &&
    startingKmEntered &&
    Number(closingKm) >= Number(startingKm);
  const canViewRoute = ['trip_ongoing', 'trip_closed'].includes(String(trip?.trip_status || ''));

  const focusStartingKm = () => {
    startingKmSectionRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  };

  const focusClosingKm = () => {
    closingKmSectionRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  };

  const handleStartingPhoto = (file) => {
    if (fieldsLocked) return;
    setStartingKmPhoto(file);
    if (startingKmPreview) URL.revokeObjectURL(startingKmPreview);
    setStartingKmPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleClosingPhoto = (file) => {
    if (tripLocked) return;
    setClosingKmPhoto(file);
    if (closingKmPreview) URL.revokeObjectURL(closingKmPreview);
    setClosingKmPreview(file ? URL.createObjectURL(file) : null);
  };

  const validateStartingKm = ({ forTripOngoing = false } = {}) => {
    if (startingKmLocked) return true;
    const suffix = forTripOngoing ? ' before Trip ongoing' : '';
    if (!startingKmEntered) {
      enqueueSnackbar(`Enter starting KM${suffix}`, { variant: 'warning' });
      focusStartingKm();
      return false;
    }
    if (!hasStartingPhoto) {
      enqueueSnackbar(`Upload starting KM screenshot${suffix}`, { variant: 'warning' });
      focusStartingKm();
      return false;
    }
    return true;
  };

  const validateClosingKm = () => {
    if (!closingKmEntered) {
      enqueueSnackbar('Enter closing KM before Trip closed', { variant: 'warning' });
      focusClosingKm();
      return false;
    }
    if (startingKmEntered && Number(closingKm) < Number(startingKm)) {
      enqueueSnackbar('Closing KM cannot be less than starting KM', { variant: 'warning' });
      focusClosingKm();
      return false;
    }
    return true;
  };

  const submitUpdate = (fields, actionKey) => {
    if (tripLocked) {
      enqueueSnackbar('This trip is completed and cannot be updated', { variant: 'warning' });
      return;
    }
    const payload = buildFormData(fields, {
      startingKmPhoto: startingKmLocked ? null : startingKmPhoto,
      closingKmPhoto,
    });
    setActiveAction(actionKey);
    mutation.mutate(payload);
  };

  const applyStatus = (statusDef) => {
    if (tripLocked) {
      enqueueSnackbar('This trip is completed and cannot be updated', { variant: 'warning' });
      return;
    }
    const payload = { trip_status: statusDef.value };
    if (statusDef.needsStartingKm) {
      if (!validateStartingKm({ forTripOngoing: true })) return;
      if (startingKmEntered) payload.starting_km = Number(startingKm);
    }
    if (statusDef.needsClosingKm) {
      if (!validateStartingKm({ forTripOngoing: true })) return;
      if (!validateClosingKm()) return;
      if (startingKmEntered) payload.starting_km = Number(startingKm);
      payload.closing_km = Number(closingKm);
    }
    if (notes.trim()) payload.driver_update_notes = notes.trim();
    submitUpdate(payload, statusDef.value);
  };

  const saveKmOnly = () => {
    if (tripLocked) {
      enqueueSnackbar('This trip is completed and cannot be updated', { variant: 'warning' });
      return;
    }
    const payload = {};

    if (!startingKmLocked) {
      if (!validateStartingKm()) return;
      payload.starting_km = Number(startingKm);
    }

    if (closingKm !== '' && !Number.isNaN(Number(closingKm))) {
      payload.closing_km = Number(closingKm);
    }
    if (notes.trim()) payload.driver_update_notes = notes.trim();

    if (!Object.keys(payload).length) {
      enqueueSnackbar('Nothing to save', { variant: 'info' });
      return;
    }

    submitUpdate(payload, 'save_km');
  };

  if (isLoading) {
    return (
      <Stack alignItems="center" py={8}>
        <CircularProgress />
      </Stack>
    );
  }

  if (isError || !trip) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => refetch()}>
            Retry
          </Button>
        }
      >
        {error?.response?.data?.message || 'Trip not found'}
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <IconButton onClick={() => navigate('/driver/trips')} aria-label="Back">
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" fontWeight={800} noWrap>
            {trip.enquiry_code || 'Trip update'}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            Updates save against enquiry · {trip.enquiry_code || trip.enquiry_id}
            {trip.enquiry_lead_status ? ` · ${trip.enquiry_lead_status}` : ''}
          </Typography>
        </Box>
        <Chip
          label={trip.trip_status_label || 'Assigned'}
          color={trip.is_closed ? 'default' : 'success'}
          sx={{ fontWeight: 700 }}
        />
      </Stack>

      <Alert severity={tripLocked ? 'success' : 'info'} sx={{ borderRadius: 2 }}>
        {tripLocked ? (
          <>
            This trip is completed. KM values, notes and status can no longer be changed.
          </>
        ) : (
          <>
            Enquiry <strong>{trip.enquiry_code || trip.enquiry_id}</strong> — status, starting KM,
            closing KM and notes you save here are stored against this enquiry.
          </>
        )}
      </Alert>

      <Box
        sx={{
          bgcolor: '#fff',
          borderRadius: 3,
          p: 2,
          border: '1px solid rgba(28,35,47,0.08)',
          boxShadow: '0 8px 24px rgba(28,35,47,0.05)',
        }}
      >
        <Typography variant="subtitle1" fontWeight={800}>
          {trip.customer_name || 'Customer'}
        </Typography>
        {trip.customer_phone && (
          <Button
            href={`tel:${trip.customer_phone}`}
            startIcon={<PhoneOutlinedIcon />}
            size="small"
            sx={{ mt: 0.75, px: 0, justifyContent: 'flex-start' }}
          >
            {trip.customer_phone}
          </Button>
        )}

        <Stack spacing={1} sx={{ mt: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <PlaceOutlinedIcon sx={{ fontSize: 20, color: 'text.secondary', mt: 0.2 }} />
            <Typography variant="body2">
              <strong>Pickup:</strong> {trip.pickup_location || '—'}
              <br />
              <strong>Drop:</strong> {trip.drop_location || '—'}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Dates: {dayjs(trip.start_date).format('DD MMM YYYY')}
            {trip.end_date && trip.end_date !== trip.start_date
              ? ` – ${dayjs(trip.end_date).format('DD MMM YYYY')}`
              : ''}
          </Typography>
          {trip.vehicle && (
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <LocalTaxiOutlinedIcon sx={{ fontSize: 20, color: 'text.secondary', mt: 0.2 }} />
              <Box>
                <Typography variant="body2">
                  {trip.vehicle.name}
                  {trip.vehicle.registration_number
                    ? ` · ${trip.vehicle.registration_number}`
                    : ''}
                </Typography>
                <Box sx={{ mt: 0.4 }}>
                  <OwnershipTag record={trip.vehicle} />
                </Box>
              </Box>
            </Stack>
          )}
        </Stack>
      </Box>

      <Box
        sx={{
          bgcolor: '#fff',
          borderRadius: 3,
          p: 2,
          border: '1px solid rgba(28,35,47,0.08)',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <SpeedOutlinedIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={800}>
            Trip KM
          </Typography>
        </Stack>

        <Stack spacing={1.5} ref={startingKmSectionRef}>
          <TextField
            label="Starting KM"
            type="number"
            value={startingKm}
            onChange={(e) => setStartingKm(e.target.value)}
            fullWidth
            required={!startingKmLocked && !tripLocked}
            disabled={tripLocked || startingKmLocked}
            inputProps={{ min: 0, step: '0.1', inputMode: 'decimal' }}
            helperText={
              tripLocked
                ? 'Trip completed — KM values are locked'
                : startingKmLocked
                  ? 'Starting KM is saved and locked'
                  : 'Enter odometer reading when trip starts'
            }
          />
          <KmPhotoUpload
            label="Starting KM screenshot"
            required={!startingKmLocked && !tripLocked}
            disabled={tripLocked || startingKmLocked}
            existingUrl={trip.starting_km_photo}
            previewUrl={startingKmPreview}
            onChange={handleStartingPhoto}
            helperText="Upload a clear photo of the odometer when trip starts"
          />

          <Box ref={closingKmSectionRef}>
            <TextField
              label="Closing KM"
              type="number"
              value={closingKm}
              onChange={(e) => setClosingKm(e.target.value)}
              fullWidth
              required={!tripLocked}
              disabled={tripLocked}
              inputProps={{ min: 0, step: '0.1', inputMode: 'decimal' }}
              helperText={
                tripLocked
                  ? 'Trip completed — KM values are locked'
                  : 'Required to close the trip — enter odometer reading when trip ends'
              }
            />
          </Box>
          <KmPhotoUpload
            label="Closing KM screenshot"
            required={false}
            disabled={tripLocked}
            existingUrl={trip.closing_km_photo}
            previewUrl={closingKmPreview}
            onChange={handleClosingPhoto}
            helperText={
              hasStartingPhoto
                ? 'Optional — not required if starting KM screenshot is uploaded'
                : 'Upload closing odometer photo (optional if starting screenshot exists)'
            }
          />

          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'rgba(15,118,110,0.08)',
              border: '1px dashed rgba(15,118,110,0.35)',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Auto calculated total trip KM
            </Typography>
            <Typography variant="h5" fontWeight={800} color="#0f766e">
              {trip.total_km != null
                ? `${trip.total_km} km`
                : previewTotal != null
                  ? `${previewTotal} km (preview)`
                  : '—'}
            </Typography>
          </Box>

          <TextField
            label="Driver notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            disabled={tripLocked}
          />

          {!tripLocked && (
          <Button
            variant="contained"
            size="large"
            onClick={saveKmOnly}
            disabled={mutation.isPending}
            startIcon={
              activeAction === 'save_km' && mutation.isPending ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <SaveOutlinedIcon />
              )
            }
            sx={{
              mt: 0.5,
              py: 1.35,
              fontWeight: 800,
              borderRadius: 2.5,
              textTransform: 'none',
              fontSize: '1rem',
              color: '#fff',
              background: 'linear-gradient(135deg, #0f766e 0%, #059669 50%, #0284c7 100%)',
              boxShadow: '0 8px 20px rgba(15,118,110,0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0d6b63 0%, #047857 50%, #0369a1 100%)',
                boxShadow: '0 10px 24px rgba(15,118,110,0.45)',
              },
              '&.Mui-disabled': {
                color: 'rgba(255,255,255,0.7)',
                background: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
              },
            }}
          >
            {activeAction === 'save_km' && mutation.isPending ? 'Saving…' : 'Save KM / Notes'}
          </Button>
          )}
          {canViewRoute && (
            <Button
              variant="contained"
              size="large"
              startIcon={<MapOutlinedIcon />}
              disabled={!trip.pickup_location || !trip.drop_location}
              onClick={() => navigate(`/driver/trips/${trip.id}/route`)}
              sx={{
                py: 1.35,
                fontWeight: 800,
                borderRadius: 2.5,
                textTransform: 'none',
                fontSize: '1rem',
                color: '#fff',
                background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 55%, #0ea5e9 100%)',
                boxShadow: '0 8px 20px rgba(3,105,161,0.32)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #075985 0%, #0369a1 55%, #0284c7 100%)',
                },
              }}
            >
              View route map
            </Button>
          )}
        </Stack>
      </Box>

      <Box
        sx={{
          bgcolor: '#fff',
          borderRadius: 3,
          p: 2,
          border: '1px solid rgba(28,35,47,0.08)',
        }}
      >
        <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 0.5 }}>
          Update trip status
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {tripLocked
            ? 'Trip is completed. Status steps are locked and cannot be changed.'
            : 'Tap the next step only. Completed steps cannot be changed back. Enter starting KM before Trip ongoing, and closing KM before Trip closed.'}
        </Typography>

        <Stack spacing={1.25}>
          {STATUS_FLOW.map((step, index) => {
            const done = currentIndex > index;
            const isCurrent = trip.trip_status === step.value;
            const isNext = currentIndex + 1 === index || (currentIndex === -1 && index === 0);
            const clickable = isNext && !trip.is_closed;
            const blockedByStartingKm = clickable && step.needsStartingKm && !startingKmReady;
            const blockedByClosingKm = clickable && step.needsClosingKm && !closingKmReady;

            return (
              <Box key={step.value}>
                <Button
                  fullWidth
                  variant={done || isCurrent ? 'contained' : 'outlined'}
                  disabled={!clickable || mutation.isPending}
                  onClick={() => clickable && applyStatus(step)}
                  startIcon={done || isCurrent ? <CheckCircleOutlinedIcon /> : null}
                  sx={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    py: 1.5,
                    px: 2,
                    borderRadius: 2.5,
                    fontWeight: 700,
                    textTransform: 'none',
                    bgcolor: done || isCurrent ? step.color : 'transparent',
                    borderColor: step.color,
                    color: done || isCurrent ? '#fff' : step.color,
                    opacity: done || isCurrent ? 1 : clickable ? 1 : 0.55,
                    cursor: clickable ? 'pointer' : 'default',
                    '&:hover': {
                      bgcolor:
                        clickable && !(done || isCurrent)
                          ? `${step.color}14`
                          : done || isCurrent
                            ? step.color
                            : 'transparent',
                      borderColor: step.color,
                    },
                    '&.Mui-disabled': {
                      bgcolor: done || isCurrent ? step.color : 'transparent',
                      color: done || isCurrent ? '#fff' : 'rgba(0,0,0,0.38)',
                      borderColor: done || isCurrent ? step.color : 'rgba(0,0,0,0.12)',
                      opacity: done || isCurrent ? 0.92 : 0.55,
                    },
                  }}
                >
                  <Box>
                    <Typography fontWeight={800} color="inherit">
                      {index + 1}. {step.label}
                      {done && !isCurrent ? ' ✓' : ''}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
                      {blockedByStartingKm
                        ? 'Enter starting KM + screenshot above first, then tap here'
                        : blockedByClosingKm
                          ? 'Enter closing KM above first, then tap here'
                          : step.hint}
                    </Typography>
                  </Box>
                </Button>
                {step.value === 'trip_ongoing' && (done || isCurrent) && (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<MapOutlinedIcon />}
                    disabled={!trip.pickup_location || !trip.drop_location}
                    onClick={() => navigate(`/driver/trips/${trip.id}/route`)}
                    sx={{
                      mt: 1,
                      py: 1.2,
                      fontWeight: 800,
                      borderRadius: 2.5,
                      textTransform: 'none',
                      borderColor: '#0284c7',
                      color: '#0369a1',
                    }}
                  >
                    View route map
                  </Button>
                )}
                {index < STATUS_FLOW.length - 1 && (
                  <Divider
                    sx={{
                      my: 0.75,
                      mx: 2,
                      borderStyle: 'dashed',
                      opacity: 0.5,
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Stack>
      </Box>
    </Stack>
  );
}
