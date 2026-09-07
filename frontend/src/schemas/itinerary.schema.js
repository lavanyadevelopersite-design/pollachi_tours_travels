import { z } from 'zod';

export const EVENT_TYPE_OPTIONS = [
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'activity', label: 'Activity' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'visa', label: 'Visa' },
  { value: 'meal', label: 'Meal' },
  { value: 'flight', label: 'Flight' },
  { value: 'leisure', label: 'Leisure' },
  { value: 'cruise', label: 'Cruise' },
];

/**
 * Type-specific event fields shown in the event popup.
 * Core fields: name, eventTime, description, imageUrl always apply with dynamic labels.
 */
export const EVENT_TYPE_FIELDS = {
  meal: {
    nameLabel: 'Meal Name',
    timeLabel: 'Food Allowance Time',
    fields: [
      { name: 'hotelId', label: 'Hotel', type: 'select', master: 'hotels', xs: 12, sm: 6, hideOnCard: true },
      { name: 'hotelName', label: 'Hotel Name', type: 'text', xs: 12, sm: 6 },
      {
        name: 'mealType',
        label: 'Meal Type',
        type: 'select',
        xs: 12,
        sm: 6,
        options: [
          { value: 'Breakfast', label: 'Breakfast' },
          { value: 'Lunch', label: 'Lunch' },
          { value: 'Dinner', label: 'Dinner' },
          { value: 'Snacks', label: 'Snacks' },
          { value: 'High Tea', label: 'High Tea' },
        ],
      },
      { name: 'cuisine', label: 'Cuisine', type: 'text', xs: 12, sm: 6 },
      { name: 'restaurantName', label: 'Restaurant Name', type: 'text', xs: 12, sm: 6 },
      { name: 'paxCount', label: 'No. of Guests', type: 'text', xs: 12, sm: 6 },
      { name: 'specialRequest', label: 'Special Request', type: 'text', xs: 12, sm: 6 },
    ],
  },
  accommodation: {
    nameLabel: 'Hotel / Property Name',
    timeLabel: 'Check-in Time',
    fields: [
      { name: 'hotelId', label: 'Select Hotel', type: 'select', master: 'hotels', xs: 12, hideOnCard: true },
      { name: 'stars', label: 'Star Rating', type: 'text', xs: 12, sm: 6 },
      { name: 'checkOutTime', label: 'Check-out Time', type: 'time', xs: 12, sm: 6 },
      { name: 'roomType', label: 'Room Type', type: 'text', xs: 12, sm: 6 },
      { name: 'rooms', label: 'No. of Rooms', type: 'text', xs: 12, sm: 6 },
      { name: 'confirmationNumber', label: 'Confirmation No.', type: 'text', xs: 12, sm: 6 },
      { name: 'address', label: 'Hotel Address', type: 'text', xs: 12 },
    ],
  },
  activity: {
    nameLabel: 'Activity Name',
    timeLabel: 'Start Time',
    fields: [
      { name: 'location', label: 'Activity Location', type: 'text', xs: 12, sm: 6 },
      { name: 'duration', label: 'Duration', type: 'text', xs: 12, sm: 6, placeholder: 'e.g. 2 hours' },
      { name: 'meetingPoint', label: 'Meeting Point', type: 'text', xs: 12, sm: 6 },
      { name: 'guideId', label: 'Select Guide', type: 'select', master: 'guides', xs: 12, sm: 6, hideOnCard: true },
      { name: 'guideName', label: 'Guide Name', type: 'text', xs: 12, sm: 6 },
      { name: 'guidePhone', label: 'Guide Phone', type: 'text', xs: 12, sm: 6 },
      { name: 'guideWhatsapp', label: 'Guide WhatsApp', type: 'text', xs: 12, sm: 6 },
    ],
  },
  transportation: {
    nameLabel: 'Transfer / Vehicle Name',
    timeLabel: 'Pickup Time',
    fields: [
      { name: 'vehicleId', label: 'Select Vehicle', type: 'select', master: 'vehicles', xs: 12, hideOnCard: true },
      {
        name: 'vehicleType',
        label: 'Vehicle Type',
        type: 'select',
        xs: 12,
        sm: 6,
        options: [
          { value: 'Cab', label: 'Cab' },
          { value: 'Bus', label: 'Bus' },
          { value: 'Tempo Traveller', label: 'Tempo Traveller' },
          { value: 'Train', label: 'Train' },
          { value: 'Self Drive', label: 'Self Drive' },
        ],
      },
      { name: 'registrationNumber', label: 'Registration No.', type: 'text', xs: 12, sm: 6 },
      { name: 'pickupLocation', label: 'Pickup Location', type: 'text', xs: 12, sm: 6 },
      { name: 'dropLocation', label: 'Drop Location', type: 'text', xs: 12, sm: 6 },
      { name: 'driverContact', label: 'Driver Contact', type: 'text', xs: 12, sm: 6 },
      { name: 'guideId', label: 'Select Guide', type: 'select', master: 'guides', xs: 12, sm: 6, hideOnCard: true },
      { name: 'guideName', label: 'Guide Name', type: 'text', xs: 12, sm: 6 },
      { name: 'guidePhone', label: 'Guide Phone', type: 'text', xs: 12, sm: 6 },
    ],
  },
  visa: {
    nameLabel: 'Visa Title',
    timeLabel: 'Appointment Time',
    fields: [
      { name: 'country', label: 'Country', type: 'text', xs: 12, sm: 6 },
      { name: 'visaType', label: 'Visa Type', type: 'text', xs: 12, sm: 6, placeholder: 'Tourist / Business' },
      { name: 'applicationRef', label: 'Application Ref. No.', type: 'text', xs: 12, sm: 6 },
      { name: 'appointmentDate', label: 'Appointment Date', type: 'date', xs: 12, sm: 6 },
    ],
  },
  flight: {
    nameLabel: 'Flight Route / Title',
    timeLabel: 'Departure Time',
    fields: [
      { name: 'airline', label: 'Airline', type: 'text', xs: 12, sm: 6 },
      { name: 'flightNumber', label: 'Flight Number', type: 'text', xs: 12, sm: 6 },
      { name: 'departureAirport', label: 'Departure Airport', type: 'text', xs: 12, sm: 6 },
      { name: 'arrivalAirport', label: 'Arrival Airport', type: 'text', xs: 12, sm: 6 },
      { name: 'arrivalTime', label: 'Arrival Time', type: 'time', xs: 12, sm: 6 },
      { name: 'pnr', label: 'PNR / Booking Ref.', type: 'text', xs: 12, sm: 6 },
    ],
  },
  leisure: {
    nameLabel: 'Leisure Activity',
    timeLabel: 'Start Time',
    fields: [
      { name: 'location', label: 'Location', type: 'text', xs: 12, sm: 6 },
      { name: 'duration', label: 'Duration', type: 'text', xs: 12, sm: 6 },
      { name: 'dressCode', label: 'Dress Code', type: 'text', xs: 12, sm: 6 },
      { name: 'notes', label: 'Notes', type: 'text', xs: 12, sm: 6 },
    ],
  },
  cruise: {
    nameLabel: 'Cruise Name',
    timeLabel: 'Boarding Time',
    fields: [
      { name: 'shipName', label: 'Ship Name', type: 'text', xs: 12, sm: 6 },
      { name: 'cabinType', label: 'Cabin Type', type: 'text', xs: 12, sm: 6 },
      { name: 'port', label: 'Boarding Port', type: 'text', xs: 12, sm: 6 },
      { name: 'deckNumber', label: 'Deck Number', type: 'text', xs: 12, sm: 6 },
    ],
  },
};

export const getEventTypeConfig = (type) =>
  EVENT_TYPE_FIELDS[type] || {
    nameLabel: 'Event Name',
    timeLabel: 'Event Time',
    fields: [],
  };

export const destinationItemSchema = z.object({
  name: z.string().min(1),
  label: z.string().optional().nullable(),
  latitude: z.union([z.number(), z.string()]).optional().nullable(),
  longitude: z.union([z.number(), z.string()]).optional().nullable(),
  country: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  place_id: z.string().optional().nullable(),
});

export const itinerarySchema = z
  .object({
    title: z
      .string()
      .min(3, 'Itinerary name must be at least 3 characters')
      .max(200, 'Itinerary name must be at most 200 characters'),
    fromDate: z.string().min(1, 'From date is required'),
    toDate: z.string().min(1, 'To date is required'),
    destinations: z.array(destinationItemSchema).min(1, 'Select at least one destination'),
    coverImage: z.string().optional().nullable(),
    packageTermIds: z.array(z.string()).optional().default([]),
    notes: z.string().optional().or(z.literal('')),
  })
  .refine((v) => !v.fromDate || !v.toDate || v.toDate >= v.fromDate, {
    message: 'To date cannot be smaller than From date',
    path: ['toDate'],
  });

export const eventSchema = z.object({
  eventType: z.string().min(1, 'Event type is required'),
  name: z.string().min(1, 'Name is required').max(200),
  eventTime: z.string().optional().nullable().or(z.literal('')),
  description: z.string().optional().nullable().or(z.literal('')),
  imageUrl: z.string().optional().nullable().or(z.literal('')),
  details: z.record(z.string(), z.any()).optional().default({}),
});

export const mapItineraryFromApi = (data = {}) => ({
  title: data.title || '',
  fromDate: data.from_date || '',
  toDate: data.to_date || '',
  destinations: (data.destinations || []).map((d) => ({
    name: d.name,
    label: d.name,
    latitude: d.latitude,
    longitude: d.longitude,
    country: d.country,
    state: d.state,
    city: d.city,
    place_id: d.place_id,
  })),
  coverImage: data.cover_image || '',
  packageTermIds: data.package_term_ids || [],
  notes: data.preferences?.notes || '',
  days: data.days || 1,
  nights: data.nights || 0,
});

export const mapItineraryToApi = (values, extras = {}) => ({
  title: values.title,
  from_date: values.fromDate,
  to_date: values.toDate,
  destinations: (values.destinations || []).map((d, index) => ({
    name: d.name,
    label: d.label || d.name,
    latitude: d.latitude ?? null,
    longitude: d.longitude ?? null,
    country: d.country ?? null,
    state: d.state ?? null,
    city: d.city ?? null,
    place_id: d.place_id ?? null,
    display_order: index,
  })),
  cover_image: values.coverImage || null,
  package_term_ids: values.packageTermIds || [],
  enquiry_id: extras.enquiryId || values.enquiryId || null,
  preferences: {
    notes: values.notes || null,
  },
  status: extras.status || values.status || 'draft',
});

export const mapEventToApi = (values) => {
  const config = getEventTypeConfig(values.eventType);
  const detailKeys = (config.fields || []).map((f) => f.name);
  const details = {};
  detailKeys.forEach((key) => {
    const val = values.details?.[key];
    if (val !== undefined && val !== null && val !== '') details[key] = val;
  });

  return {
    event_type: values.eventType,
    name: values.name,
    event_time: values.eventTime || null,
    description: values.description || null,
    image_url: values.imageUrl || null,
    details: Object.keys(details).length ? details : null,
  };
};

export const mapEventFromApi = (data = {}) => ({
  eventType: data.event_type || '',
  name: data.name || '',
  eventTime: data.event_time || '',
  description: data.description || '',
  imageUrl: data.image_url || '',
  details: data.details || {},
});
