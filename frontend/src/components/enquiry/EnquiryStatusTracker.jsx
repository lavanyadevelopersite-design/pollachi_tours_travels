import { useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import { formatDate } from '../../utils/formatters';

const PIPELINE_ORDER = [
  'New Enquiry',
  'Assign Enquiry',
  'Contacted Customer',
  'Verified/ Qualified',
  'Itinerary Preparation',
  'Proposal send',
  'Follow up -1',
  'Follow up- 2',
  'Negotiation',
  'Awaiting Advance',
  'Booking In progress',
  'Booking Confirmed',
  'Trip Ongoing',
  'Fully Paid',
  'Trip Completed',
];

const COLORS = {
  completed: '#16a34a',
  completedSoft: '#dcfce7',
  current: '#ea580c',
  currentSoft: '#ffedd5',
  skipped: '#7c3aed',
  skippedSoft: '#ede9fe',
  pending: '#94a3b8',
  line: '#cbd5e1',
  blue: '#2563eb',
  blueSoft: '#dbeafe',
};

const SKIP_FALLBACKS = [
  '#7c3aed',
  '#0ea5e9',
  '#db2777',
  '#d97706',
  '#6366f1',
  '#14b8a6',
  '#e11d48',
  '#0891b2',
];

function normalizeVisitedIds(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function skipAccent(step, index) {
  return step?.button_color || SKIP_FALLBACKS[index % SKIP_FALLBACKS.length];
}

function isClosedLeadStatus(name = '') {
  return /trip\s*completed/i.test(String(name || ''));
}

function sortLeadStatuses(rows = []) {
  const rank = new Map(PIPELINE_ORDER.map((name, i) => [name.toLowerCase(), i]));
  return [...rows].sort((a, b) => {
    const aRank = rank.has(String(a.lead_status || '').toLowerCase())
      ? rank.get(String(a.lead_status || '').toLowerCase())
      : 999;
    const bRank = rank.has(String(b.lead_status || '').toLowerCase())
      ? rank.get(String(b.lead_status || '').toLowerCase())
      : 999;
    if (aRank !== bRank) return aRank - bRank;
    return String(a.lead_status || '').localeCompare(String(b.lead_status || ''));
  });
}

function StatusPill({ label, tone, accent }) {
  const map = {
    completed: { bg: COLORS.completedSoft, color: COLORS.completed },
    current: { bg: COLORS.currentSoft, color: COLORS.current },
    skipped: {
      bg: alpha(accent || COLORS.skipped, 0.14),
      color: accent || COLORS.skipped,
    },
    pending: { bg: alpha('#64748b', 0.1), color: '#64748b' },
  };
  const style = map[tone] || map.pending;
  return (
    <Chip
      size="small"
      label={label}
      sx={{
        height: 22,
        fontSize: 11,
        fontWeight: 700,
        bgcolor: style.bg,
        color: style.color,
        borderRadius: 999,
        '& .MuiChip-label': { px: 1 },
      }}
    />
  );
}

function StepNode({ step, index, state, dateValue, isLast, accentColor }) {
  const isCompleted = state === 'completed';
  const isCurrent = state === 'current';
  const isSkipped = state === 'skipped';
  const accent = isCompleted
    ? COLORS.completed
    : isCurrent
      ? COLORS.current
      : isSkipped
        ? accentColor || COLORS.skipped
        : COLORS.pending;

  return (
    <Box
      data-step-state={state}
      sx={{
        position: 'relative',
        flex: '0 0 auto',
        width: { xs: 150, sm: 170 },
        minHeight: 150,
        px: 1,
      }}
    >
      {!isLast && (
        <Box
          sx={{
            position: 'absolute',
            top: 22,
            left: 'calc(50% + 22px)',
            width: 'calc(100% - 20px)',
            height: 3,
            borderRadius: 999,
            zIndex: 0,
            ...(isCompleted
              ? { bgcolor: COLORS.completed }
              : isSkipped
                ? {
                    bgcolor: 'transparent',
                    borderTop: `2px dashed ${accent}`,
                    height: 0,
                    mt: '1px',
                  }
                : isCurrent
                ? {
                    background: `linear-gradient(90deg, ${COLORS.completed} 0%, ${COLORS.current} 45%, ${COLORS.line} 100%)`,
                  }
                : {
                    bgcolor: 'transparent',
                    borderTop: `2px dashed ${COLORS.line}`,
                    height: 0,
                    mt: '1px',
                  }),
          }}
        />
      )}

      <Stack alignItems="center" spacing={1} sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              fontSize: 15,
              color: isCompleted || isCurrent || isSkipped ? '#fff' : COLORS.blue,
              bgcolor: isCompleted || isCurrent || isSkipped ? accent : '#fff',
              border: `2px ${isCurrent || isSkipped || index === 0 ? 'dashed' : 'solid'}`,
              borderColor: isCompleted
                ? COLORS.completed
                : isCurrent
                  ? COLORS.current
                  : isSkipped
                    ? accent
                    : COLORS.blue,
              boxShadow: isCurrent
                ? `0 0 0 4px ${alpha(COLORS.current, 0.18)}`
                : isCompleted
                  ? `0 0 0 4px ${alpha(COLORS.completed, 0.12)}`
                  : isSkipped
                    ? `0 0 0 4px ${alpha(accent, 0.16)}`
                    : `0 0 0 4px ${alpha(COLORS.blue, 0.08)}`,
            }}
          >
            {index + 1}
          </Box>
          {isCompleted && (
            <CheckCircleIcon
              sx={{
                position: 'absolute',
                right: -3,
                bottom: -3,
                fontSize: 18,
                color: COLORS.completed,
                bgcolor: '#fff',
                borderRadius: '50%',
              }}
            />
          )}
        </Box>

        <Typography
          variant="body2"
          fontWeight={800}
          textAlign="center"
          sx={{
            color: isCurrent ? COLORS.current : isSkipped ? accent : '#0f172a',
            lineHeight: 1.25,
            minHeight: 36,
            px: 0.5,
          }}
        >
          {step.lead_status}
        </Typography>

        <StatusPill
          tone={state}
          accent={accent}
          label={
            isCompleted
              ? 'Completed'
              : isCurrent
                ? 'In Progress'
                : isSkipped
                  ? 'Skipped'
                  : 'Pending'
          }
        />

        {isCurrent ? (
          <Stack spacing={0.25} alignItems="center">
            <Stack direction="row" spacing={0.5} alignItems="center">
              <AccessTimeOutlinedIcon sx={{ fontSize: 13, color: COLORS.current }} />
              <Typography variant="caption" fontWeight={700} color={COLORS.current}>
                In Progress
              </Typography>
            </Stack>
            {dateValue && (
              <Typography variant="caption" color="text.secondary">
                Since: {formatDate(dateValue, 'DD MMM YYYY')}
              </Typography>
            )}
          </Stack>
        ) : isSkipped ? (
          <Typography variant="caption" fontWeight={700} sx={{ color: accent }}>
            Jumped stage
          </Typography>
        ) : isCompleted && dateValue ? (
          <Stack spacing={0.25} alignItems="center">
            <Stack direction="row" spacing={0.5} alignItems="center">
              <CalendarMonthOutlinedIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {formatDate(dateValue, 'DD MMM YYYY')}
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {formatDate(dateValue, 'hh:mm A')}
            </Typography>
          </Stack>
        ) : (
          <Typography variant="caption" color="text.disabled">
            —
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

/** Statuses come from Lead Status Master via parent props. */
export default function EnquiryStatusTracker({ enquiry, leadStatuses = [] }) {
  const scrollerRef = useRef(null);
  const steps = useMemo(
    () =>
      sortLeadStatuses(leadStatuses).filter(
        (step) => !/cancell?ed|feedback/i.test(String(step.lead_status || ''))
      ),
    [leadStatuses]
  );

  const currentId = enquiry?.lead_status_id || enquiry?.leadStatus?.id || null;
  const currentIndex = useMemo(() => {
    if (!steps.length) return 0;
    const idx = steps.findIndex((s) => s.id === currentId);
    if (idx >= 0) return idx;
    const byName = steps.findIndex(
      (s) =>
        String(s.lead_status || '').toLowerCase() ===
        String(enquiry?.leadStatus?.lead_status || '').toLowerCase()
    );
    return byName >= 0 ? byName : 0;
  }, [steps, currentId, enquiry?.leadStatus?.lead_status]);

  const visitedIds = useMemo(
    () => normalizeVisitedIds(enquiry?.visited_lead_status_ids),
    [enquiry?.visited_lead_status_ids]
  );
  const hasVisitHistory = visitedIds.length > 0;

  const createdAt = enquiry?.created_at || enquiry?.createdAt;
  const updatedAt = enquiry?.updated_at || enquiry?.updatedAt || createdAt;

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const node = root.querySelector('[data-step-state="current"]');
    if (node?.scrollIntoView) {
      node.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [currentIndex, steps.length]);

  if (!steps.length || !enquiry) return null;

  return (
    <Card
      elevation={0}
      sx={{
        mb: 0,
        borderRadius: 3,
        border: '1px solid',
        borderColor: alpha('#0f172a', 0.06),
        bgcolor: '#fff',
        boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1}
          sx={{ mb: 2.5 }}
        >
          <Typography variant="h6" fontWeight={800} color="#0f172a">
            Enquiry Status Tracker
          </Typography>
          <Chip
            icon={<LinkOutlinedIcon sx={{ fontSize: '16px !important' }} />}
            label={`Enquiry ID: ${enquiry?.enquiry_code || '—'}`}
            sx={{
              bgcolor: COLORS.blueSoft,
              color: COLORS.blue,
              fontWeight: 700,
              borderRadius: 999,
              '& .MuiChip-icon': { color: COLORS.blue },
            }}
          />
        </Stack>

        <Box
          ref={scrollerRef}
          sx={{
            display: 'flex',
            overflowX: 'auto',
            pb: 1.5,
            mb: 1,
            scrollBehavior: 'smooth',
            '&::-webkit-scrollbar': { height: 6 },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: alpha('#64748b', 0.35),
              borderRadius: 999,
            },
          }}
        >
          {steps.map((step, index) => {
            const currentName =
              steps[currentIndex]?.lead_status || enquiry?.leadStatus?.lead_status || '';
            const closeAllStages = isClosedLeadStatus(currentName);
            const closeThroughCurrent = isClosedLeadStatus(currentName);
            let state = 'pending';
            if (closeAllStages) {
              state = 'completed';
            } else if (closeThroughCurrent && index <= currentIndex) {
              state = 'completed';
            } else if (index === currentIndex) {
              state = 'current';
            } else if (index < currentIndex) {
              const visited = !hasVisitHistory || visitedIds.includes(String(step.id));
              state = visited ? 'completed' : 'skipped';
            }
            const dateValue =
              index === 0
                ? createdAt
                : state === 'current' || state === 'completed'
                  ? updatedAt
                  : null;
            return (
              <StepNode
                key={step.id}
                step={step}
                index={index}
                state={state}
                dateValue={dateValue}
                isLast={index === steps.length - 1}
                accentColor={skipAccent(step, index)}
              />
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}
