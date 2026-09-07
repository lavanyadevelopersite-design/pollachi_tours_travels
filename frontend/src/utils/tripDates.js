/** Prefer the enquiry/trip travel dates over shared itinerary or quotation snapshots. */
export function resolveTripDates({ enquiry, itinerary, quotation } = {}) {
  const from =
    enquiry?.travel_from || quotation?.travel_from || itinerary?.from_date || null;
  const to = enquiry?.travel_to || quotation?.travel_to || itinerary?.to_date || null;
  return { from, to };
}

/** Prefer enquiry passenger counts so itinerary cards match the enquiry. */
export function resolveTripPax({ enquiry, itinerary, quotation } = {}) {
  const adults = enquiry?.adults ?? quotation?.adults ?? itinerary?.adults ?? 0;
  const children = enquiry?.children ?? quotation?.children ?? itinerary?.children ?? 0;
  return {
    adults: Number(adults) || 0,
    children: Number(children) || 0,
  };
}

/** Overlay enquiry travel dates and pax onto itinerary/quotation view data. */
export function withEnquiryTripFields(record, enquiry) {
  if (!record) return record;
  const trip = resolveTripDates({ enquiry, itinerary: record, quotation: record });
  const pax = resolveTripPax({ enquiry, itinerary: record, quotation: record });
  return {
    ...record,
    from_date: trip.from || record.from_date,
    to_date: trip.to || record.to_date,
    adults: pax.adults,
    children: pax.children,
  };
}
