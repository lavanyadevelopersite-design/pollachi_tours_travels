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
  'Feedback',
];

const COLORS = {
  completed: '#16a34a',
  completedSoft: '#dcfce7',
  current: '#ea580c',
  currentSoft: '#ffedd5',
  pending: '#94a3b8',
  line: '#cbd5e1',
  blue: '#2563eb',
  blueSoft: '#dbeafe',
};

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

function StatusPill({ label, tone }) {
  const map = {
    completed: { bg: COLORS.completedSoft, color: COLORS.completed },
    current: { bg: COLORS.currentSoft, color: COLORS.current },
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

function StepNode({ step, index, state, dateValue, isLast }) {
  const isCompleted = state === 'completed';
  const isCurrent = state === 'current';
  const accent = isCompleted ? COLORS.completed : isCurrent ? COLORS.current : COLORS.pending;

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
              color: isCompleted || isCurrent ? '#fff' : COLORS.blue,
              bgcolor: isCompleted || isCurrent ? accent : '#fff',
              border: `2px ${isCurrent || index === 0 ? 'dashed' : 'solid'}`,
              borderColor: isCompleted
                ? COLORS.completed
                : isCurrent
                  ? COLORS.current
                  : COLORS.blue,
              boxShadow: isCurrent
                ? `0 0 0 4px ${alpha(COLORS.current, 0.18)}`
                : isCompleted
                  ? `0 0 0 4px ${alpha(COLORS.completed, 0.12)}`
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
            color: isCurrent ? COLORS.current : '#0f172a',
            lineHeight: 1.25,
            minHeight: 36,
            px: 0.5,
          }}
        >
          {step.lead_status}
        </Typography>

        <StatusPill
          tone={state}
          label={isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
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
  const steps = useMemo(() => sortLeadStatuses(leadStatuses), [leadStatuses]);

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
        mb: 2.5,
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
            const state =
              index < currentIndex ? 'completed' : index === currentIndex ? 'current' : 'pending';
            const dateValue =
              index === 0
                ? createdAt
                : index === currentIndex || index < currentIndex
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
              />
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}
