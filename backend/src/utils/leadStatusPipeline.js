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
  let index = sorted.findIndex((s) => s.id === id);
  if (index < 0 && name) {
    index = sorted.findIndex(
      (s) => String(s.lead_status || '').toLowerCase() === String(name).toLowerCase()
    );
  }
  return index;
};

const assertLeadStatusTransition = ({
  allStatuses,
  currentId,
  currentName,
  nextId,
  roleCode,
}) => {
  if (canSkipLeadStatusStages(roleCode)) return;

  const sorted = sortLeadStatuses(allStatuses);
  const currentIndex = getLeadStatusIndex(sorted, currentId, currentName);
  const nextIndex = sorted.findIndex((s) => s.id === nextId);

  if (currentIndex < 0 || nextIndex < 0) {
    throw new Error('Invalid lead status transition');
  }

  if (nextIndex !== currentIndex + 1) {
    throw new Error('You can only advance to the next lead status stage');
  }
};

module.exports = {
  PIPELINE_ORDER,
  PRIVILEGED_STATUS_ROLES,
  canSkipLeadStatusStages,
  sortLeadStatuses,
  assertLeadStatusTransition,
};
