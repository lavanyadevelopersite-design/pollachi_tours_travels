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

const PRIVILEGED_STATUS_ROLES = new Set(['super_admin', 'system_admin']);

const canSkipLeadStatusStages = (roleCode) =>
  PRIVILEGED_STATUS_ROLES.has(String(roleCode || '').toLowerCase());

const sortLeadStatuses = (rows = []) => {
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
};

const getLeadStatusIndex = (sorted, id, name) => {
  let index = sorted.findIndex((s) => String(s.id) === String(id || ''));
  if (index < 0 && name) {
    index = sorted.findIndex(
      (s) => String(s.lead_status || '').toLowerCase() === String(name).toLowerCase()
    );
  }
  return index;
};

const normalizeLeadStatusName = (label) =>
  String(label || '')
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const isClosingLeadStatus = (name = '') => {
  const label = normalizeLeadStatusName(name);
  return label.includes('trip completed') || /cancell?ed/.test(label);
};

const isBookingConfirmedOrLater = (label) => {
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
};

const isEnquiryRecordLocked = (enquiry) =>
  isBookingConfirmedOrLater(enquiry?.leadStatus?.lead_status || enquiry?.lead_status) ||
  /cancell?ed/i.test(String(enquiry?.status || ''));

const assertLeadStatusTransition = ({
  allStatuses,
  currentId,
  currentName,
  nextId,
  nextName,
  roleCode,
}) => {
  if (canSkipLeadStatusStages(roleCode)) return;
  if (isClosingLeadStatus(nextName)) return;

  const sorted = sortLeadStatuses(allStatuses);
  const currentIndex = getLeadStatusIndex(sorted, currentId, currentName);
  const nextIndex = getLeadStatusIndex(sorted, nextId, nextName);

  if (nextIndex < 0) {
    throw new Error('Invalid lead status transition');
  }

  if (currentIndex < 0) return;

  if (nextIndex !== currentIndex + 1) {
    throw new Error('You can only advance to the next lead status stage');
  }
};

const normalizeIdList = (value) => {
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
};

const mergeVisitedLeadStatusIds = ({
  previousVisited,
  allStatuses = [],
  currentId,
  currentName,
  nextId,
}) => {
  const previous = normalizeIdList(previousVisited);
  const set = new Set(previous);

  if (previous.length === 0 && allStatuses.length) {
    const sorted = sortLeadStatuses(allStatuses);
    const currentIndex = getLeadStatusIndex(sorted, currentId, currentName);
    sorted.slice(0, Math.max(currentIndex, 0) + 1).forEach((status) => {
      if (status?.id) set.add(String(status.id));
    });
  }

  if (currentId) set.add(String(currentId));
  if (nextId) set.add(String(nextId));

  const nextName = String(
    allStatuses.find((status) => String(status.id) === String(nextId))?.lead_status || ''
  );
  if (/trip\s*completed/i.test(nextName)) {
    const sorted = sortLeadStatuses(allStatuses);
    sorted.forEach((status) => {
      if (status?.id && !/cancell?ed|feedback/i.test(String(status.lead_status || ''))) {
        set.add(String(status.id));
      }
    });
  }

  return [...set];
};

module.exports = {
  PIPELINE_ORDER,
  PRIVILEGED_STATUS_ROLES,
  canSkipLeadStatusStages,
  sortLeadStatuses,
  assertLeadStatusTransition,
  normalizeIdList,
  mergeVisitedLeadStatusIds,
  isBookingConfirmedOrLater,
  isEnquiryRecordLocked,
};
