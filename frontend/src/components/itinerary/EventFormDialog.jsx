import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormTextField from '../forms/FormTextField';
import FormSelect from '../forms/FormSelect';
import FormTimePicker from '../forms/FormTimePicker';
import FormDatePicker from '../forms/FormDatePicker';
import ImageGalleryPicker from './ImageGalleryPicker';
import {
  eventSchema,
  EVENT_TYPE_OPTIONS,
  getEventTypeConfig,
  mapEventToApi,
  mapEventFromApi,
} from '../../schemas/itinerary.schema';
import { resolveMediaUrl } from '../../utils/constants';
import { useGuides, useHotels, useVehicles } from '../../hooks/queries/useMasters';

const MASTER_LIST_PARAMS = { perPage: 500, is_active: true, sortBy: 'name', sortOrder: 'asc' };
const GUIDE_LIST_PARAMS = { perPage: 500, is_active: true, sortBy: 'full_name', sortOrder: 'asc' };

const defaults = {
  eventType: '',
  name: '',
  eventTime: '',
  description: '',
  imageUrl: '',
  details: {},
};

function toOptions(rows, getLabel) {
  return (rows || []).map((row) => ({
    value: row.id,
    label: getLabel(row),
  }));
}

function hotelLabel(hotel) {
  const stars = hotel.star_rating || hotel.starRating;
  const extra = [
    hotel.code,
    stars ? `${stars}★` : '',
  ].filter(Boolean);
  return extra.length ? `${hotel.name} (${extra.join(' · ')})` : hotel.name;
}

function vehicleLabel(vehicle) {
  const extra = [vehicle.registration_number, vehicle.type, vehicle.code].filter(Boolean);
  return extra.length ? `${vehicle.name} (${extra.join(' · ')})` : vehicle.name;
}

function guideLabel(guide) {
  const extra = [guide.phone, guide.city, guide.specialization].filter(Boolean);
  return extra.length ? `${guide.full_name} (${extra.join(' · ')})` : guide.full_name;
}

function DetailField({ field, control, options, loading }) {
  const path = `details.${field.name}`;

  if (field.type === 'select') {
    return (
      <FormSelect
        name={path}
        control={control}
        label={field.label}
        options={options || field.options || []}
        loading={loading}
        placeholder={field.master ? `Search ${field.label.toLowerCase()}...` : 'Search...'}
      />
    );
  }
  if (field.type === 'time') {
    return <FormTimePicker name={path} control={control} label={field.label} />;
  }
  if (field.type === 'date') {
    return <FormDatePicker name={path} control={control} label={field.label} />;
  }
  return (
    <FormTextField
      name={path}
      control={control}
      label={field.label}
      placeholder={field.placeholder || ''}
    />
  );
}

export default function EventFormDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  destination,
  loading = false,
}) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const isEdit = !!initialData?.id;
  const prevTypeRef = useRef(null);
  const appliedHotelRef = useRef(null);
  const appliedVehicleRef = useRef(null);
  const appliedGuideRef = useRef(null);

  const { data: hotelsData, isLoading: hotelsLoading } = useHotels(MASTER_LIST_PARAMS);
  const { data: vehiclesData, isLoading: vehiclesLoading } = useVehicles(MASTER_LIST_PARAMS);
  const { data: guidesData, isLoading: guidesLoading } = useGuides(GUIDE_LIST_PARAMS);

  const hotels = hotelsData?.rows || [];
  const vehicles = vehiclesData?.rows || [];
  const guides = guidesData?.rows || [];

  const hotelOptions = useMemo(() => toOptions(hotels, hotelLabel), [hotels]);
  const vehicleOptions = useMemo(() => toOptions(vehicles, vehicleLabel), [vehicles]);
  const guideOptions = useMemo(() => toOptions(guides, guideLabel), [guides]);

  const { control, handleSubmit, reset, setValue } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (!open) {
      prevTypeRef.current = null;
      appliedHotelRef.current = null;
      appliedVehicleRef.current = null;
      appliedGuideRef.current = null;
      return;
    }
    if (initialData?.id) {
      const mapped = mapEventFromApi(initialData);
      reset(mapped);
      prevTypeRef.current = mapped.eventType;
      appliedHotelRef.current = mapped.details?.hotelId || null;
      appliedVehicleRef.current = mapped.details?.vehicleId || null;
      appliedGuideRef.current = mapped.details?.guideId || null;
    } else {
      const preset = initialData?.presetType || initialData?.event_type || '';
      reset({
        ...defaults,
        eventType: preset,
        details: {},
      });
      prevTypeRef.current = preset;
      appliedHotelRef.current = null;
      appliedVehicleRef.current = null;
      appliedGuideRef.current = null;
    }
  }, [open, initialData, reset]);

  const imageUrl = useWatch({ control, name: 'imageUrl' });
  const eventType = useWatch({ control, name: 'eventType' });
  const name = useWatch({ control, name: 'name' });
  const hotelId = useWatch({ control, name: 'details.hotelId' });
  const vehicleId = useWatch({ control, name: 'details.vehicleId' });
  const guideId = useWatch({ control, name: 'details.guideId' });

  useEffect(() => {
    if (!open || !eventType) return;
    if (prevTypeRef.current && prevTypeRef.current !== eventType) {
      setValue('details', {});
      setValue('name', '');
      setValue('eventTime', '');
      appliedHotelRef.current = null;
      appliedVehicleRef.current = null;
      appliedGuideRef.current = null;
    }
    prevTypeRef.current = eventType;
  }, [eventType, open, setValue]);

  useEffect(() => {
    if (!open || !hotelId || appliedHotelRef.current === hotelId) return;
    const hotel = hotels.find((h) => String(h.id) === String(hotelId));
    if (!hotel) return;
    appliedHotelRef.current = hotelId;
    if (eventType === 'accommodation') setValue('name', hotel.name);
    setValue('details.hotelName', hotel.name);
    setValue('details.address', hotel.address || '');
    setValue('details.stars', hotel.star_rating || hotel.starRating ? `${hotel.star_rating || hotel.starRating} star` : '');
  }, [hotelId, hotels, open, eventType, setValue]);

  useEffect(() => {
    if (!open || !vehicleId || appliedVehicleRef.current === vehicleId) return;
    const vehicle = vehicles.find((v) => String(v.id) === String(vehicleId));
    if (!vehicle) return;
    appliedVehicleRef.current = vehicleId;
    setValue('name', vehicle.name);
    if (vehicle.type) setValue('details.vehicleType', vehicle.type);
    setValue('details.registrationNumber', vehicle.registration_number || '');
    if (vehicle.image) setValue('imageUrl', vehicle.image);
  }, [vehicleId, vehicles, open, setValue]);

  useEffect(() => {
    if (!open || !guideId || appliedGuideRef.current === guideId) return;
    const guide = guides.find((g) => String(g.id) === String(guideId));
    if (!guide) return;
    appliedGuideRef.current = guideId;
    setValue('details.guideName', guide.full_name || '');
    setValue('details.guidePhone', guide.phone || guide.emergency_phone || '');
    setValue('details.guideWhatsapp', guide.whatsapp || '');
    if (guide.photo && eventType === 'activity') setValue('imageUrl', guide.photo);
  }, [guideId, guides, open, eventType, setValue]);

  const typeConfig = useMemo(() => getEventTypeConfig(eventType), [eventType]);
  const typeLabel = EVENT_TYPE_OPTIONS.find((o) => o.value === eventType)?.label;

  const masterMap = {
    hotels: { options: hotelOptions, loading: hotelsLoading },
    vehicles: { options: vehicleOptions, loading: vehiclesLoading },
    guides: { options: guideOptions, loading: guidesLoading },
  };

  const usesHotelPicker = eventType === 'accommodation';
  const usesVehiclePicker = eventType === 'transportation';
  const showNameField = !usesHotelPicker && !usesVehiclePicker;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {isEdit ? 'Edit Event' : 'New Event'}
          {typeLabel ? (
            <Typography
              component="span"
              variant="body2"
              color="text.secondary"
              sx={{ ml: 1, fontWeight: 600 }}
            >
              · {typeLabel}
            </Typography>
          ) : null}
        </DialogTitle>
        <DialogContent>
          <Box
            component="form"
            id="event-form"
            onSubmit={handleSubmit((v) => {
              const next = { ...v, details: { ...(v.details || {}) } };
              if (!next.name) {
                next.name =
                  next.details.hotelName ||
                  next.details.guideName ||
                  next.details.registrationNumber ||
                  '';
              }
              onSubmit?.(mapEventToApi(next));
            })}
            mt={1}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <FormSelect
                  name="eventType"
                  control={control}
                  label="Event Type"
                  options={EVENT_TYPE_OPTIONS}
                />
              </Grid>

              {eventType ? (
                <>
                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 0.5 }}>
                      <Typography variant="caption" fontWeight={700} color="text.secondary">
                        {typeLabel} Details
                      </Typography>
                    </Divider>
                  </Grid>

                  {showNameField ? (
                    <Grid size={{ xs: 12, sm: 7 }}>
                      <FormTextField name="name" control={control} label={typeConfig.nameLabel} />
                    </Grid>
                  ) : (
                    <Grid size={{ xs: 12 }} sx={{ display: 'none' }}>
                      <FormTextField name="name" control={control} label={typeConfig.nameLabel} />
                    </Grid>
                  )}
                  <Grid size={{ xs: 12, sm: showNameField ? 5 : 12 }}>
                    <FormTimePicker
                      name="eventTime"
                      control={control}
                      label={typeConfig.timeLabel}
                    />
                  </Grid>

                  {(typeConfig.fields || []).map((field) => {
                    const master = field.master ? masterMap[field.master] : null;
                    return (
                      <Grid key={field.name} size={{ xs: field.xs || 12, sm: field.sm || 12 }}>
                        <DetailField
                          field={field}
                          control={control}
                          options={master?.options}
                          loading={master?.loading}
                        />
                      </Grid>
                    );
                  })}

                  <Grid size={{ xs: 12 }}>
                    <FormTextField
                      name="description"
                      control={control}
                      label="Description / Notes"
                      multiline
                      rows={3}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 96,
                          height: 72,
                          borderRadius: 2,
                          bgcolor: 'rgba(33,150,243,0.08)',
                          backgroundImage: imageUrl
                            ? `url(${resolveMediaUrl(imageUrl)})`
                            : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          border: '1px dashed',
                          borderColor: 'divider',
                        }}
                      />
                      <Box>
                        <Typography variant="body2" fontWeight={600} mb={0.75}>
                          Event Image
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PhotoCameraOutlinedIcon />}
                          onClick={() => setGalleryOpen(true)}
                        >
                          {imageUrl ? 'Replace Image' : 'Select Image'}
                        </Button>
                      </Box>
                    </Stack>
                  </Grid>
                </>
              ) : (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" color="text.secondary" py={2} textAlign="center">
                    Select an event type to load related fields
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            form="event-form"
            variant="contained"
            disabled={loading || !eventType}
          >
            {loading ? 'Saving...' : isEdit ? 'Update Event' : 'Add Event'}
          </Button>
        </DialogActions>
      </Dialog>

      <ImageGalleryPicker
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        title="Choose Event Image"
        destination={destination}
        eventName={name}
        eventType={eventType}
        selectedUrl={imageUrl}
        onSelect={({ url }) => setValue('imageUrl', url)}
      />
    </>
  );
}
