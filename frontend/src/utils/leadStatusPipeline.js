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

export function sortLeadStatuses(rows = []) {
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

/**
 * Status options for update dialogs.
 * Privileged roles can jump to any future stage; others only get the next stage.
 */
export function getPendingLeadStatuses(
  rows = [],
  currentId = null,
  currentName = null,
  { canSkipStages = false } = {}
) {
  const sorted = sortLeadStatuses(rows);
  if (!sorted.length) return [];

  let currentIndex = sorted.findIndex((s) => s.id === currentId);
  if (currentIndex < 0 && currentName) {
    currentIndex = sorted.findIndex(
      (s) => String(s.lead_status || '').toLowerCase() === String(currentName).toLowerCase()
    );
  }
  if (currentIndex < 0) return canSkipStages ? sorted : sorted.slice(0, 1);

  const future = sorted.slice(currentIndex + 1);
  if (canSkipStages) return future;
  return future.length ? [future[0]] : [];
}

export { PIPELINE_ORDER };

export const PIPELINE_GROUPS = [
  {
    key: 'lead',
    title: 'LEAD',
    color: '#2563EB',
    patterns: [/new\s*enquir/i, /assign\s*enquir/i, /contacted/i, /verified/i],
  },
  {
    key: 'sales',
    title: 'SALES',
    color: '#F59E0B',
    patterns: [/proposal/i, /negotiation/i, /follow\s*-?\s*up/i],
  },
  {
    key: 'booking',
    title: 'BOOKING',
    color: '#16A34A',
    patterns: [/awaiting/i, /booking/i, /itinerary/i],
  },
  {
    key: 'trip',
    title: 'TRIP',
    color: '#0D9488',
    patterns: [/trip/i, /fully\s*paid/i],
  },
];

export const isHiddenLeadStatus = (status) =>
  /cancell?ed|feedback/i.test(String(status?.lead_status || status?.name || status || ''));

function normalizeLeadStatusName(label) {
  return String(label || '')
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isLockedEnquiryLeadStatus(label) {
  const name = normalizeLeadStatusName(label);
  return name.includes('completed') || /cancell?ed/.test(name) || name === 'feedback';
}

export function isBookingConfirmedOrLater(label) {
  const name = normalizeLeadStatusName(label);
  if (!name) return false;
  if (/cancell?ed/.test(name) || name === 'feedback') return true;

  const bookingIndex = PIPELINE_ORDER.findIndex(
    (status) => normalizeLeadStatusName(status) === 'booking confirmed'
  );
  const rank = PIPELINE_ORDER.findIndex((status) => normalizeLeadStatusName(status) === name);
  if (bookingIndex >= 0 && rank >= 0) return rank >= bookingIndex;

  return (
    /booking\s*confirmed/.test(name) ||
    name.includes('trip ongoing') ||
    name.includes('fully paid') ||
    name.includes('trip completed')
  );
}

export function isEnquiryActionsLocked(enquiry) {
  return (
    isLockedEnquiryLeadStatus(enquiry?.leadStatus?.lead_status || enquiry?.lead_status) ||
    /cancell?ed/i.test(String(enquiry?.status || ''))
  );
}

/** Hide enquiry Edit / Delete / Cancel once booking is confirmed. */
export function isEnquiryRecordLocked(enquiry) {
  return (
    isBookingConfirmedOrLater(enquiry?.leadStatus?.lead_status || enquiry?.lead_status) ||
    /cancell?ed/i.test(String(enquiry?.status || ''))
  );
}

export function isEnquiryTripCompleted(enquiry) {
  const leadLabel = enquiry?.leadStatus?.lead_status || enquiry?.lead_status;
  const name = normalizeLeadStatusName(leadLabel);
  if (name.includes('trip completed') || name.includes('completed') || name === 'feedback') {
    return true;
  }
  const assignments = enquiry?.vehicleAssignments || enquiry?.vehicle_assignments || [];
  return assignments.some((row) => String(row?.trip_status || '').toLowerCase() === 'trip_closed');
}

export function isEnquiryCancelled(enquiry) {
  return (
    /cancell?ed/i.test(String(enquiry?.status || '')) ||
    /cancell?ed/i.test(String(enquiry?.leadStatus?.lead_status || enquiry?.lead_status || ''))
  );
}

/** List Cancel action: all enquiries except completed trips and already-cancelled rows. */
export function canCancelEnquiry(enquiry) {
  return !isEnquiryTripCompleted(enquiry) && !isEnquiryCancelled(enquiry);
}

export const excludeCancelledLeadStatuses = (rows = []) =>
  rows.filter((status) => !isHiddenLeadStatus(status));

function statusLabel(status) {
  return String(status?.name || status?.lead_status || '').trim();
}

function groupForStatus(status) {
  const label = statusLabel(status);
  return PIPELINE_GROUPS.find((group) => group.patterns.some((pattern) => pattern.test(label))) || null;
}

export function groupStatusesByPipeline(statuses = []) {
  const buckets = Object.fromEntries(PIPELINE_GROUPS.map((group) => [group.key, []]));
  const other = [];

  excludeCancelledLeadStatuses(statuses).forEach((status) => {
    const group = groupForStatus(status);
    if (group) buckets[group.key].push(status);
    else other.push(status);
  });

  const rank = new Map(PIPELINE_ORDER.map((name, i) => [name.toLowerCase(), i]));
  const sortStatuses = (rows) =>
    [...rows].sort((a, b) => {
      const aName = statusLabel(a).toLowerCase();
      const bName = statusLabel(b).toLowerCase();
      const aRank = rank.has(aName) ? rank.get(aName) : 999;
      const bRank = rank.has(bName) ? rank.get(bName) : 999;
      if (aRank !== bRank) return aRank - bRank;
      return statusLabel(a).localeCompare(statusLabel(b));
    });

  const groups = PIPELINE_GROUPS.map((group) => ({
    ...group,
    statuses: sortStatuses(buckets[group.key]),
  })).filter((group) => group.statuses.length);

  if (other.length) {
    groups.push({
      key: 'other',
      title: 'OTHER',
      color: '#94A3B8',
      statuses: sortStatuses(other),
    });
  }

  return groups;
}
