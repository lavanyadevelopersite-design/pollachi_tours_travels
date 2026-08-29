import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import RichTextEditor from '../../components/forms/RichTextEditor';
import ImageGalleryPicker, { CoverHeroBanner } from '../../components/itinerary/ImageGalleryPicker';
import DaySidebar from '../../components/itinerary/DaySidebar';
import DaySummary from '../../components/itinerary/DaySummary';
import DayTimeline from '../../components/itinerary/DayTimeline';
import EventCard, { getEventTypeMeta } from '../../components/itinerary/EventCard';
import EventFormDialog from '../../components/itinerary/EventFormDialog';
import ItineraryPricingTab from '../../components/itinerary/ItineraryPricingTab';
import ItineraryThemeTab from '../../components/itinerary/ItineraryThemeTab';
import ItineraryFinalTab from '../../components/itinerary/ItineraryFinalTab';
import { useItinerary, useItineraryMutation } from '../../hooks/queries/useModules';
import { usePermission } from '../../hooks/usePermission';
import { EVENT_TYPE_OPTIONS } from '../../schemas/itinerary.schema';
import itineraryService from '../../services/itinerary.service';
import { mergePreviewTheme } from '../../utils/itineraryThemes';

export default function ItineraryView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const canEdit = usePermission('itineraries.edit');

  const { data, isLoading, refetch } = useItinerary(id);
  const {
    updateDay,
    createEvent,
    updateEvent,
    deleteEvent,
    reorderEvents,
    update,
  } = useItineraryMutation();

  const days = useMemo(
    () => [...(data?.itineraryDays || [])].sort((a, b) => a.day_number - b.day_number),
    [data]
  );

  const [selectedDayId, setSelectedDayId] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');
  const [saveLabel, setSaveLabel] = useState('');
  const [eventMenuAnchor, setEventMenuAnchor] = useState(null);
  const [eventDialog, setEventDialog] = useState({ open: false, data: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [coverOpen, setCoverOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const dragIndex = useRef(null);
  const selectedDayIdRef = useRef(null);
  const autosaveTimerRef = useRef(null);
  const formSnapshotRef = useRef({ subject: '', destination: '', description: '' });

  const selectedDay = useMemo(
    () => days.find((d) => d.id === selectedDayId) || null,
    [days, selectedDayId]
  );

  useEffect(() => {
    selectedDayIdRef.current = selectedDayId;
  }, [selectedDayId]);

  useEffect(() => {
    formSnapshotRef.current = { subject, destination, description };
  }, [subject, destination, description]);

  useEffect(() => {
    if (!selectedDayId && days[0]?.id) setSelectedDayId(days[0].id);
  }, [days, selectedDayId]);

  useEffect(() => {
    if (!selectedDay) return;
    setSubject(selectedDay.subject || '');
    setDestination(selectedDay.destination || '');
    setDescription(selectedDay.description || '');
  }, [selectedDay]);

  const markSaved = () => {
    setSaveLabel('Saved');
    setTimeout(() => setSaveLabel(''), 1500);
  };

  const cancelAutosave = useCallback(() => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }
  }, []);

  const persistDay = useCallback(
    async (dayId, payload) => {
      if (!canEdit || !id || !dayId) return;
      await updateDay.mutateAsync({ id, dayId, ...payload });
      markSaved();
    },
    [canEdit, id, updateDay]
  );

  const scheduleAutosave = useCallback(
    (dayId, payload) => {
      if (!canEdit || !id || !dayId) return;
      cancelAutosave();
      autosaveTimerRef.current = setTimeout(async () => {
        // Prevent writing Day N edits onto another day after sidebar switch
        if (selectedDayIdRef.current !== dayId) return;
        try {
          await persistDay(dayId, payload);
        } catch {
          /* snackbar handled in mutation */
        }
      }, 800);
    },
    [canEdit, id, cancelAutosave, persistDay]
  );

  const onSubjectChange = (value) => {
    setSubject(value);
    if (selectedDay?.id) {
      scheduleAutosave(selectedDay.id, {
        subject: value,
        destination,
        description,
      });
    }
  };

  const onDestinationChange = (value) => {
    setDestination(value);
    if (selectedDay?.id) {
      scheduleAutosave(selectedDay.id, {
        subject,
        destination: value,
        description,
      });
    }
  };

  const onDescriptionChange = (value) => {
    setDescription(value);
    if (selectedDay?.id) {
      scheduleAutosave(selectedDay.id, {
        subject,
        destination,
        description: value,
      });
    }
  };

  const handleSelectDay = async (day) => {
    if (!day?.id || day.id === selectedDayId) return;
    const previousDayId = selectedDayId;
    cancelAutosave();

    // Flush current day edits to the correct day before switching
    if (canEdit && previousDayId) {
      const snap = formSnapshotRef.current;
      try {
        await persistDay(previousDayId, {
          subject: snap.subject,
          destination: snap.destination,
          description: snap.description,
        });
      } catch {
        /* keep switching even if save fails */
      }
    }

    setSelectedDayId(day.id);
  };

  const events = selectedDay?.events || [];

  const progress = useMemo(() => {
    if (!days.length) return 0;
    const withSubject = days.filter((d) => (d.subject || '').trim()).length;
    const withEvents = days.filter((d) => (d.events || []).length > 0).length;
    return Math.round(((withSubject + withEvents) / (days.length * 2)) * 100);
  }, [days]);

  const dateLabel =
    data?.from_date && data?.to_date
      ? `${dayjs(data.from_date).format('DD MMM YYYY')} – ${dayjs(data.to_date).format('DD MMM YYYY')}`
      : '';

  const handleCreateEvent = async (payload) => {
    await createEvent.mutateAsync({ id, dayId: selectedDay.id, ...payload });
    setEventDialog({ open: false, data: null });
    refetch();
  };

  const handleUpdateEvent = async (payload) => {
    await updateEvent.mutateAsync({
      id,
      eventId: eventDialog.data.id,
      ...payload,
    });
    setEventDialog({ open: false, data: null });
    refetch();
  };

  const handleDeleteEvent = async () => {
    if (!deleteTarget) return;
    await deleteEvent.mutateAsync({ id, eventId: deleteTarget.id });
    setDeleteTarget(null);
    refetch();
  };

  const handleReorder = async (from, to) => {
    if (from === to || from == null || to == null) return;
    const next = [...events];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    await reorderEvents.mutateAsync({
      id,
      dayId: selectedDay.id,
      orderedIds: next.map((e) => e.id),
    });
    refetch();
  };

  const handleCoverSelect = async ({ url, file }) => {
    try {
      if (file) {
        await itineraryService.uploadCover(id, file);
      } else {
        await update.mutateAsync({ id, cover_image: url });
      }
      enqueueSnackbar('Cover photo updated', { variant: 'success' });
      refetch();
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || 'Failed to update cover', {
        variant: 'error',
      });
    }
  };

  const handleSavePricing = async (pricing) => {
    try {
      await update.mutateAsync({ id, pricing });
      enqueueSnackbar('Pricing saved', { variant: 'success' });
      refetch();
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || 'Failed to save pricing', {
        variant: 'error',
      });
    }
  };

  const handleSaveFinalMeta = async (payload) => {
    try {
      await update.mutateAsync({ id, ...payload });
      enqueueSnackbar('Inclusions & exclusions saved', { variant: 'success' });
      refetch();
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || 'Failed to save', {
        variant: 'error',
      });
    }
  };

  const handleSaveTheme = async (themeId) => {
    try {
      await update.mutateAsync({
        id,
        preferences: mergePreviewTheme(data?.preferences, themeId),
      });
      refetch();
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || 'Failed to save theme', {
        variant: 'error',
      });
    }
  };

  if (isLoading && !data) return <Loader message="Loading itinerary..." />;
  if (!data) return <EmptyState title="Itinerary not found" />;

  return (
    <Box>
      <PageHeader
        title={data.title}
        subtitle="Travel planner"
        extra={
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            {saveLabel && (
              <Chip size="small" color="success" label={saveLabel} sx={{ fontWeight: 700 }} />
            )}
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/itineraries')}
              variant="outlined"
            >
              Back
            </Button>
            {canEdit && (
              <Button
                startIcon={<EditOutlinedIcon />}
                variant="contained"
                onClick={() => navigate(`/itineraries/generate?id=${id}`)}
              >
                Edit Details
              </Button>
            )}
          </Stack>
        }
      />

      <Box
        sx={{
          mb: 2.5,
          borderRadius: 3,
          bgcolor: '#fff',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 8px 24px rgba(21,34,56,0.06)',
          overflow: 'hidden',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 56,
            px: 1,
            '& .MuiTab-root': {
              minHeight: 56,
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.95rem',
              px: 2.5,
            },
            '& .Mui-selected': { color: '#0f766e' },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: 2,
              background: 'linear-gradient(90deg, #0f766e, #0ea5e9)',
            },
          }}
        >
          <Tab icon={<ConstructionOutlinedIcon />} iconPosition="start" label="Build" />
          <Tab icon={<PaymentsOutlinedIcon />} iconPosition="start" label="Pricing" />
          <Tab icon={<PaletteOutlinedIcon />} iconPosition="start" label="Theme" />
          <Tab icon={<FactCheckOutlinedIcon />} iconPosition="start" label="Final" />
        </Tabs>
      </Box>

      {activeTab === 1 && (
        <ItineraryPricingTab
          data={data}
          days={days}
          canEdit={canEdit}
          saving={update.isPending}
          onSave={handleSavePricing}
        />
      )}

      {activeTab === 2 && (
        <ItineraryThemeTab
          data={data}
          canEdit={canEdit}
          saving={update.isPending}
          onSaveTheme={handleSaveTheme}
          onOpenPreview={() => window.open(`/itineraries/preview/${id}`, '_blank', 'noopener,noreferrer')}
        />
      )}

      {activeTab === 3 && (
        <ItineraryFinalTab
          data={data}
          days={days}
          canEdit={canEdit}
          saving={update.isPending}
          onSaveMeta={handleSaveFinalMeta}
        />
      )}

      {activeTab === 0 && (
        <>
      <CoverHeroBanner
        title={data.title}
        coverImage={data.cover_image}
        subtitle={`${dateLabel}${dateLabel ? ' · ' : ''}${data.days || 0} Days / ${data.nights || 0} Nights`}
        onChangeCover={canEdit ? () => setCoverOpen(true) : undefined}
      >
        <Stack direction="row" spacing={1} mt={1.5} flexWrap="wrap" useFlexGap>
          {(data.destinations || []).map((d) => (
            <Chip
              key={d.id || d.name}
              label={d.name}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }}
            />
          ))}
        </Stack>
        <Box sx={{ mt: 2, maxWidth: 360 }}>
          <Stack direction="row" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" fontWeight={700}>
              Plan Progress
            </Typography>
            <Typography variant="caption" fontWeight={700}>
              {progress}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'rgba(255,255,255,0.25)',
              '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: '#fff' },
            }}
          />
        </Box>
      </CoverHeroBanner>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 3 }}>
          <DaySidebar
            days={days}
            selectedDayId={selectedDay?.id}
            onSelect={handleSelectDay}
            mobileOpen={mobileOpen}
            onMobileOpen={() => setMobileOpen(true)}
            onMobileClose={() => setMobileOpen(false)}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 9 }}>
          {!selectedDay ? (
            <EmptyState title="No days generated" description="Edit travel dates to generate day plans." />
          ) : (
            <Stack spacing={2.5}>
              <Box
                sx={{
                  p: { xs: 2, md: 2.5 },
                  borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,0.92)',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 10px 30px rgba(21,34,56,0.06)',
                  position: 'sticky',
                  top: 0,
                  zIndex: 2,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'stretch', sm: 'flex-start' },
                    justifyContent: 'space-between',
                    gap: 1.5,
                    width: '100%',
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="overline" color="primary.main" fontWeight={800}>
                      DAY {selectedDay.day_number}
                    </Typography>
                    <Typography variant="h5" fontWeight={800}>
                      {dayjs(selectedDay.date).isValid()
                        ? dayjs(selectedDay.date).format('dddd, DD MMM YYYY')
                        : `Day ${selectedDay.day_number}`}
                    </Typography>
                  </Box>
                  {canEdit && (
                    <Box sx={{ flexShrink: 0, alignSelf: { xs: 'stretch', sm: 'flex-start' }, ml: { sm: 'auto' } }}>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={(e) => setEventMenuAnchor(e.currentTarget)}
                        fullWidth={false}
                        sx={{
                          width: { xs: '100%', sm: 'auto' },
                          px: 2.5,
                          py: 1.1,
                          fontWeight: 800,
                          borderRadius: 2,
                          color: '#fff',
                          background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                          boxShadow: '0 8px 20px rgba(245,158,11,0.35)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                            boxShadow: '0 10px 24px rgba(245,158,11,0.45)',
                          },
                        }}
                      >
                        New Event
                      </Button>
                      <Menu
                        anchorEl={eventMenuAnchor}
                        open={!!eventMenuAnchor}
                        onClose={() => setEventMenuAnchor(null)}
                        TransitionProps={{ timeout: 180 }}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                      >
                        {EVENT_TYPE_OPTIONS.map((opt) => {
                          const { Icon } = getEventTypeMeta(opt.value);
                          return (
                            <MenuItem
                              key={opt.value}
                              onClick={() => {
                                setEventMenuAnchor(null);
                                setEventDialog({
                                  open: true,
                                  data: { presetType: opt.value },
                                });
                              }}
                            >
                              <ListItemIcon>
                                <Icon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText>{opt.label}</ListItemText>
                            </MenuItem>
                          );
                        })}
                      </Menu>
                    </Box>
                  )}
                </Box>

                <Divider sx={{ my: 2.5 }} />

                <Grid container spacing={2} alignItems="flex-start">
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Subject"
                      value={subject}
                      onChange={(e) => onSubjectChange(e.target.value)}
                      fullWidth
                      size="small"
                      disabled={!canEdit}
                      sx={{ '& .MuiOutlinedInput-root': { minHeight: 52, bgcolor: '#fff' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Destination"
                      value={destination}
                      onChange={(e) => onDestinationChange(e.target.value)}
                      fullWidth
                      size="small"
                      disabled={!canEdit}
                      sx={{ '& .MuiOutlinedInput-root': { minHeight: 52, bgcolor: '#fff' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" fontWeight={700} mb={0.75}>
                      Description
                    </Typography>
                    <RichTextEditor
                      key={selectedDay.id}
                      value={description}
                      onChange={onDescriptionChange}
                      disabled={!canEdit}
                    />
                  </Grid>
                </Grid>
              </Box>

              <DaySummary events={events} />

              <Box
                sx={{
                  p: { xs: 2, md: 2.5 },
                  borderRadius: 3,
                  bgcolor: '#fff',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="subtitle1" fontWeight={800} mb={1.5}>
                  Events
                </Typography>
                {!events.length ? (
                  <EmptyState
                    title="No events yet"
                    description="Use + New Event to add accommodation, activities, meals and more."
                  />
                ) : (
                  <Stack spacing={1.5}>
                    {events.map((event, index) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onEdit={(ev) => setEventDialog({ open: true, data: ev })}
                        onDelete={(ev) => setDeleteTarget(ev)}
                        onDragStart={() => {
                          dragIndex.current = index;
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          handleReorder(dragIndex.current, index);
                          dragIndex.current = null;
                        }}
                      />
                    ))}
                  </Stack>
                )}
              </Box>

              <Box
                sx={{
                  p: { xs: 2, md: 2.5 },
                  borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,0.95)',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="subtitle1" fontWeight={800} mb={1}>
                  Day Timeline
                </Typography>
                <Divider sx={{ mb: 1 }} />
                <DayTimeline events={events} />
              </Box>

              {(data.package_terms || []).length > 0 && (
                <Box
                  sx={{
                    p: { xs: 2, md: 2.5 },
                    borderRadius: 3,
                    bgcolor: '#fff',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={800} mb={1.5}>
                    Package Terms
                  </Typography>
                  <Stack spacing={1.5}>
                    {data.package_terms.map((term) => (
                      <Box key={term.id}>
                        <Typography fontWeight={700}>{term.heading}</Typography>
                        <Typography variant="body2" color="text.secondary" whiteSpace="pre-wrap">
                          {term.description}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          )}
        </Grid>
      </Grid>
        </>
      )}

      <EventFormDialog
        open={eventDialog.open}
        initialData={eventDialog.data}
        destination={destination || data.destinations?.[0]?.name}
        loading={createEvent.isPending || updateEvent.isPending}
        onClose={() => setEventDialog({ open: false, data: null })}
        onSubmit={eventDialog.data?.id ? handleUpdateEvent : handleCreateEvent}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Event"
        message={`Delete "${deleteTarget?.name}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteEvent}
      />

      <ImageGalleryPicker
        open={coverOpen}
        onClose={() => setCoverOpen(false)}
        title="Change Cover Photo"
        query={data.title}
        destination={data.destinations?.[0]?.name}
        selectedUrl={data.cover_image}
        onSelect={handleCoverSelect}
      />
    </Box>
  );
}
