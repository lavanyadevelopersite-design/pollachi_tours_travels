import { useEffect, useMemo, useState } from 'react';
import { Box, Chip, Grid, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import FormPageLayout from '../../components/forms/layout/FormPageLayout';
import FormSection from '../../components/forms/layout/FormSection';
import FormGrid from '../../components/forms/layout/FormGrid';
import FormTextField from '../../components/forms/FormTextField';
import FormDatePicker from '../../components/forms/FormDatePicker';
import FormAutocomplete from '../../components/forms/FormAutocomplete';
import DestinationMultiSelect from '../../components/forms/DestinationMultiSelect';
import ImageGalleryPicker, { CoverHeroBanner } from '../../components/itinerary/ImageGalleryPicker';
import Loader from '../../components/common/Loader';
import {
  itinerarySchema,
  mapItineraryFromApi,
  mapItineraryToApi,
} from '../../schemas/itinerary.schema';
import { useItinerary, useItineraryMutation } from '../../hooks/queries/useModules';
import { usePackageTerms } from '../../hooks/queries/useMasters';
import itineraryService from '../../services/itinerary.service';

const defaults = {
  title: '',
  fromDate: '',
  toDate: '',
  destinations: [],
  coverImage: '',
  packageTermIds: [],
  notes: '',
};

function calcDuration(fromDate, toDate) {
  if (!fromDate || !toDate) return { days: 0, nights: 0 };
  const start = dayjs(fromDate);
  const end = dayjs(toDate);
  if (!start.isValid() || !end.isValid() || end.isBefore(start)) return { days: 0, nights: 0 };
  const days = end.diff(start, 'day') + 1;
  return { days, nights: Math.max(days - 1, 0) };
}

export default function ItineraryGenerator() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const enquiryId = searchParams.get('enquiryId');
  const isEdit = !!editId;

  const { data: existing, isLoading: loadingExisting } = useItinerary(editId);
  const { create, update } = useItineraryMutation();
  const { data: termsData } = usePackageTerms({ page: 1, perPage: 200, is_active: true });

  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const [pendingCoverFile, setPendingCoverFile] = useState(null);

  const formDefaults = useMemo(() => {
    if (existing) return { ...defaults, ...mapItineraryFromApi(existing) };
    return { ...defaults };
  }, [existing]);

  const { control, handleSubmit, reset, setValue, watch } = useForm({
    resolver: zodResolver(itinerarySchema),
    defaultValues: formDefaults,
  });

  useEffect(() => {
    reset(formDefaults);
  }, [formDefaults, reset]);

  const title = useWatch({ control, name: 'title' });
  const fromDate = useWatch({ control, name: 'fromDate' });
  const toDate = useWatch({ control, name: 'toDate' });
  const destinations = useWatch({ control, name: 'destinations' }) || [];
  const coverImage = watch('coverImage');
  const { days, nights } = calcDuration(fromDate, toDate);

  const termOptions = useMemo(
    () =>
      (termsData?.rows || termsData?.data || []).map((t) => ({
        value: t.id,
        label: t.heading,
        description: t.description,
      })),
    [termsData]
  );

  const loading = create.isPending || update.isPending;

  const onSubmit = async (values) => {
    try {
      const payload = mapItineraryToApi(values, {
        enquiryId: enquiryId || existing?.enquiry_id || null,
        status: enquiryId && !isEdit ? 'proposed' : undefined,
      });
      if (isEdit) {
        payload.regenerate_days = false;
        const { data } = await update.mutateAsync({ id: editId, ...payload });
        const result = data?.data || data;
        if (pendingCoverFile) {
          await itineraryService.uploadCover(editId, pendingCoverFile);
        }
        navigate(enquiryId ? `/enquiry/view/${enquiryId}` : `/itineraries/view/${result?.id || editId}`);
      } else {
        const { data } = await create.mutateAsync(payload);
        const result = data?.data || data;
        if (pendingCoverFile && result?.id) {
          await itineraryService.uploadCover(result.id, pendingCoverFile);
        }
        navigate(enquiryId ? `/enquiry/view/${enquiryId}` : `/itineraries/view/${result.id}`);
      }
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || 'Failed to save itinerary', {
        variant: 'error',
      });
    }
  };

  if (isEdit && loadingExisting) return <Loader message="Loading itinerary..." />;

  return (
    <>
      <FormPageLayout
        title={isEdit ? 'Edit Itinerary' : 'Create Itinerary'}
        subtitle="Plan destinations, travel dates and cover photo"
        sectionTitle="Itinerary Details"
        onSubmit={handleSubmit(onSubmit)}
        onCancel={() => navigate(enquiryId ? `/enquiry/view/${enquiryId}` : '/itineraries')}
        loading={loading}
        submitLabel={isEdit ? 'Save Changes' : 'Save Itinerary'}
      >
        <CoverHeroBanner
          title={title || 'Your Itinerary'}
          coverImage={coverImage}
          subtitle={
            fromDate && toDate
              ? `${dayjs(fromDate).format('DD MMM YYYY')} → ${dayjs(toDate).format('DD MMM YYYY')} · ${days} Days / ${nights} Nights`
              : 'Add travel dates and destinations to craft your journey'
          }
          onChangeCover={() => setCoverPickerOpen(true)}
        >
          <Stack direction="row" spacing={1} mt={1.5} flexWrap="wrap" useFlexGap>
            {destinations.slice(0, 5).map((d) => (
              <Chip
                key={d.name}
                label={d.name}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }}
              />
            ))}
          </Stack>
        </CoverHeroBanner>

        <FormSection title="Basic Information">
          <FormGrid>
            <Grid size={{ xs: 12 }}>
              <FormTextField name="title" control={control} label="Itinerary Name" />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormDatePicker
                name="fromDate"
                control={control}
                label="From Date"
                minDate={dayjs().startOf('day')}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormDatePicker
                name="toDate"
                control={control}
                label="To Date"
                minDate={fromDate ? dayjs(fromDate) : dayjs().startOf('day')}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  height: 52,
                  display: 'flex',
                  alignItems: 'center',
                  px: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'rgba(33,150,243,0.06)',
                }}
              >
                <Typography fontWeight={700} color="primary.main">
                  {days > 0 ? `${days} Days · ${nights} Nights` : 'Select travel dates'}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <DestinationMultiSelect name="destinations" control={control} label="Destination" />
            </Grid>
          </FormGrid>
        </FormSection>

        <FormSection title="Package Terms">
          <FormGrid>
            <Grid size={{ xs: 12 }}>
              <FormAutocomplete
                name="packageTermIds"
                control={control}
                label="Select Package Terms"
                options={termOptions}
                multiple
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormTextField
                name="notes"
                control={control}
                label="Internal Notes"
                multiline
                rows={2}
              />
            </Grid>
          </FormGrid>
        </FormSection>
      </FormPageLayout>

      <ImageGalleryPicker
        open={coverPickerOpen}
        onClose={() => setCoverPickerOpen(false)}
        title="Change Cover Photo"
        query={title}
        destination={destinations[0]?.name}
        selectedUrl={coverImage}
        onSelect={({ url, file }) => {
          setValue('coverImage', url);
          setPendingCoverFile(file || null);
        }}
      />
    </>
  );
}
