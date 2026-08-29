import { useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import dayjs from 'dayjs';
import { useInclusionExclusions } from '../../hooks/queries/useMasters';
import {
  coercePricing,
  formatInr,
  summarizePricing,
  resolveLineItems,
} from '../../utils/itineraryPricing';
import { getEventTypeMeta } from './EventCard';
import { toAmPmTime } from '../../utils/timeFormat';
import { APP_NAME, resolveMediaUrl } from '../../utils/constants';
import { getItineraryTheme } from '../../utils/itineraryThemes';

function ListCard({ title, icon, color, items, emptyText }) {
  return (
    <Box
      sx={{
        height: '100%',
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: alpha(color, 0.35),
        bgcolor: '#fff',
        boxShadow: `0 12px 28px ${alpha(color, 0.12)}`,
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.25,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          background: `linear-gradient(90deg, ${alpha(color, 0.16)}, ${alpha(color, 0.05)})`,
        }}
      >
        {icon}
        <Typography fontWeight={800} color={color}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ p: 2 }}>
        {!items?.length ? (
          <Typography variant="body2" color="text.secondary">
            {emptyText}
          </Typography>
        ) : (
          <Stack spacing={1.25}>
            {items.map((item) => (
              <Box
                key={item.id}
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  bgcolor: alpha(color, 0.05),
                  border: '1px solid',
                  borderColor: alpha(color, 0.12),
                }}
              >
                <Typography fontWeight={800}>{item.heading}</Typography>
                <Typography variant="body2" color="text.secondary" mt={0.35}>
                  {item.description}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

export default function ItineraryFinalTab({
  data,
  days = [],
  canEdit,
  saving,
  onSaveMeta,
  /** When true, hides share/print actions (quotation view pages). */
  printInPlace = false,
  shareUrlOverride = null,
  heroOverline = null,
}) {
  const { data: ieData } = useInclusionExclusions({ page: 1, perPage: 200, is_active: true });
  const allItems = ieData?.rows || ieData?.data || [];

  const inclusionOptions = useMemo(
    () => allItems.filter((i) => i.type === 'inclusion'),
    [allItems]
  );
  const exclusionOptions = useMemo(
    () => allItems.filter((i) => i.type === 'exclusion'),
    [allItems]
  );

  const [selectedInclusions, setSelectedInclusions] = useState([]);
  const [selectedExclusions, setSelectedExclusions] = useState([]);

  useEffect(() => {
    const inclusionIds = (data?.inclusion_ids || []).map(String);
    const exclusionIds = (data?.exclusion_ids || []).map(String);
    const fromApiInclusions = data?.inclusions || [];
    const fromApiExclusions = data?.exclusions || [];

    setSelectedInclusions(
      fromApiInclusions.length
        ? fromApiInclusions
        : inclusionOptions.filter((i) => inclusionIds.includes(String(i.id)))
    );
    setSelectedExclusions(
      fromApiExclusions.length
        ? fromApiExclusions
        : exclusionOptions.filter((i) => exclusionIds.includes(String(i.id)))
    );
  }, [data, inclusionOptions, exclusionOptions]);

  const pricing = useMemo(() => {
    const base = coercePricing(data?.pricing);
    return {
      ...base,
      line_items: resolveLineItems(days, base.line_items || []),
    };
  }, [data?.pricing, days]);

  const summary = useMemo(() => summarizePricing(pricing), [pricing]);
  const coverUrl = resolveMediaUrl(data?.cover_image);
  const routeLabel = (data?.destinations || []).map((d) => d.name).join(' → ') || '—';
  const dateLabel =
    data?.from_date && data?.to_date
      ? `${dayjs(data.from_date).format('DD MMM YYYY')} – ${dayjs(data.to_date).format('DD MMM YYYY')}`
      : '';

  const handleSaveSelections = () => {
    onSaveMeta?.({
      inclusion_ids: selectedInclusions.map((i) => i.id),
      exclusion_ids: selectedExclusions.map((i) => i.id),
    });
  };

  const shareUrl =
    shareUrlOverride ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/itineraries/preview/${data?.id}`
      : '');
  const selectedTheme = getItineraryTheme(data);

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `*${data?.title || 'Travel Itinerary'}*\n${dateLabel}\nTotal: ${formatInr(summary.grandTotal)}\n\n${shareUrl}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  const handleExportPrint = () => {
    if (printInPlace) {
      window.print();
      return;
    }
    window.open(`/itineraries/preview/${data?.id}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <Box>
      <Box
        sx={{
          mb: 2.5,
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          minHeight: 200,
          color: '#fff',
          background: coverUrl
            ? `linear-gradient(120deg, rgba(15,23,42,0.82), rgba(14,165,233,0.45)), url(${coverUrl}) center/cover`
            : 'linear-gradient(135deg, #7c3aed 0%, #2563eb 50%, #06b6d4 120%)',
          boxShadow: '0 16px 40px rgba(37,99,235,0.25)',
        }}
      >
        <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Typography variant="overline" sx={{ fontWeight: 800, opacity: 0.9 }}>
            {heroOverline || `Final Preview · ${APP_NAME}`}
          </Typography>
          <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, mb: 1 }}>
            {data?.title}
          </Typography>
          <Typography sx={{ opacity: 0.95, fontWeight: 600 }}>
            {dateLabel}
            {dateLabel ? ' · ' : ''}
            {data?.days || 0} Days / {data?.nights || 0} Nights · {routeLabel}
          </Typography>
          <Stack direction="row" spacing={1} mt={1.5} flexWrap="wrap" useFlexGap>
            <Chip
              label={`Adult: ${data?.adults ?? 1}`}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700 }}
            />
            <Chip
              label={`Child: ${data?.children ?? 0}`}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700 }}
            />
            <Chip
              label={`Total ${formatInr(summary.grandTotal)}`}
              size="small"
              sx={{ bgcolor: '#22c55e', color: '#fff', fontWeight: 800 }}
            />
          </Stack>
        </Box>
      </Box>

      {!printInPlace && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          mb={2.5}
          justifyContent="flex-end"
          className="no-print"
        >
          <Chip
            icon={<PaletteOutlinedIcon sx={{ fontSize: 16 }} />}
            label={`Theme: ${selectedTheme.name}`}
            sx={{ fontWeight: 800, bgcolor: alpha(selectedTheme.accent, 0.12), color: selectedTheme.heading }}
          />
          <Button
            variant="outlined"
            startIcon={<WhatsAppIcon />}
            onClick={handleWhatsApp}
            sx={{ color: '#128C7E', borderColor: alpha('#128C7E', 0.5), fontWeight: 700 }}
          >
            Share WhatsApp
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintOutlinedIcon />}
            onClick={handleExportPrint}
            sx={{ fontWeight: 700 }}
          >
            Export / Print
          </Button>
          <Button
            variant="contained"
            startIcon={<VisibilityOutlinedIcon />}
            onClick={() => window.open(`/itineraries/preview/${data?.id}`, '_blank', 'noopener,noreferrer')}
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            }}
          >
            Open Full Preview
          </Button>
        </Stack>
      )}

      {canEdit && (
        <Box
          sx={{
            mb: 2.5,
            p: 2.5,
            borderRadius: 3,
            bgcolor: '#fff',
            border: '1px solid',
            borderColor: alpha('#6366f1', 0.25),
            boxShadow: '0 10px 28px rgba(99,102,241,0.08)',
          }}
        >
          <Typography fontWeight={800} mb={1.5} color="#4338ca">
            Select Inclusions & Exclusions (from Master)
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                multiple
                options={inclusionOptions}
                value={selectedInclusions}
                onChange={(_, value) => setSelectedInclusions(value)}
                getOptionLabel={(o) => o.heading || ''}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                renderInput={(params) => (
                  <TextField {...params} label="Inclusions" placeholder="Select inclusions" />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                multiple
                options={exclusionOptions}
                value={selectedExclusions}
                onChange={(_, value) => setSelectedExclusions(value)}
                getOptionLabel={(o) => o.heading || ''}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                renderInput={(params) => (
                  <TextField {...params} label="Exclusions" placeholder="Select exclusions" />
                )}
              />
            </Grid>
          </Grid>
          <Button
            variant="contained"
            sx={{ mt: 2, fontWeight: 800, bgcolor: '#16a34a' }}
            disabled={saving}
            onClick={handleSaveSelections}
          >
            {saving ? 'Saving...' : 'Save Inclusions & Exclusions'}
          </Button>
        </Box>
      )}

      <Typography variant="h6" fontWeight={800} mb={1.5} color="#152238">
        Day-wise Plan
      </Typography>
      <Stack spacing={2} mb={3}>
        {days.map((day) => {
          const events = [...(day.events || [])].sort(
            (a, b) => (a.display_order || 0) - (b.display_order || 0)
          );
          return (
            <Box
              key={day.id}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: alpha('#2563eb', 0.18),
                bgcolor: '#fff',
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1.25,
                  background: 'linear-gradient(90deg, #1d4ed8 0%, #0ea5e9 100%)',
                  color: '#fff',
                }}
              >
                <Typography variant="caption" fontWeight={800} sx={{ opacity: 0.9 }}>
                  DAY {day.day_number}
                </Typography>
                <Typography fontWeight={800}>
                  {day.date ? dayjs(day.date).format('dddd, DD MMM YYYY') : `Day ${day.day_number}`}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.92 }}>
                  {day.subject || '—'}
                  {day.destination ? ` · ${day.destination}` : ''}
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                {events.length === 0 ? (
                  <Typography variant="body2" color="text.disabled">
                    No events for this day.
                  </Typography>
                ) : (
                  <Stack spacing={1.25} divider={<Divider flexItem />}>
                    {events.map((event) => {
                      const { label, Icon } = getEventTypeMeta(event.event_type);
                      return (
                        <Stack key={event.id} direction="row" spacing={1.25} alignItems="flex-start">
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 1.5,
                              display: 'grid',
                              placeItems: 'center',
                              bgcolor: alpha('#2563eb', 0.1),
                              color: '#1d4ed8',
                              flexShrink: 0,
                            }}
                          >
                            <Icon sx={{ fontSize: 18 }} />
                          </Box>
                          <Box>
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                              <Chip size="small" label={label} sx={{ fontWeight: 700 }} />
                              {event.event_time && (
                                <Typography variant="caption" fontWeight={800} color="primary.main">
                                  {toAmPmTime(event.event_time)}
                                </Typography>
                              )}
                            </Stack>
                            <Typography fontWeight={800}>{event.name}</Typography>
                            {event.description && (
                              <Typography variant="body2" color="text.secondary">
                                {event.description}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      );
                    })}
                  </Stack>
                )}
              </Box>
            </Box>
          );
        })}
      </Stack>

      <Box
        sx={{
          mb: 2.5,
          p: 2.5,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #152238 0%, #0f766e 120%)',
          color: '#fff',
        }}
      >
        <Typography variant="h6" fontWeight={800} mb={1}>
          Pricing Summary
        </Typography>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="space-between"
          flexWrap="wrap"
          useFlexGap
        >
          <Typography>
            Subtotal: <strong>{formatInr(summary.subtotalNet)}</strong>
          </Typography>
          <Typography>
            Tax: <strong>{formatInr(summary.taxTotal)}</strong>
          </Typography>
          <Typography>
            Discount: <strong>{formatInr(summary.discount)}</strong>
          </Typography>
          <Typography variant="h6" fontWeight={800} color="#86efac">
            Grand Total: {formatInr(summary.grandTotal)}
          </Typography>
        </Stack>
      </Box>

      <Grid container spacing={2.5} mb={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ListCard
            title="Inclusions"
            color="#16a34a"
            icon={<CheckCircleOutlinedIcon sx={{ color: '#16a34a' }} />}
            items={selectedInclusions}
            emptyText="No inclusions selected yet."
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ListCard
            title="Exclusions"
            color="#dc2626"
            icon={<HighlightOffIcon sx={{ color: '#dc2626' }} />}
            items={selectedExclusions}
            emptyText="No exclusions selected yet."
          />
        </Grid>
      </Grid>

      {(data?.package_terms || []).length > 0 && (
        <Box
          sx={{
            mb: 2.5,
            p: 2.5,
            borderRadius: 3,
            bgcolor: alpha('#f59e0b', 0.06),
            border: '1px solid',
            borderColor: alpha('#f59e0b', 0.25),
          }}
        >
          <Typography variant="h6" fontWeight={800} mb={1.5} color="#b45309">
            Package Terms
          </Typography>
          <Stack spacing={1.25}>
            {data.package_terms.map((term) => (
              <Box key={term.id}>
                <Typography fontWeight={800}>{term.heading}</Typography>
                <Typography variant="body2" color="text.secondary" whiteSpace="pre-wrap">
                  {term.description}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
