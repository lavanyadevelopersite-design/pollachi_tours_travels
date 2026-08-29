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
