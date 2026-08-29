const { z } = require('zod');

const destinationSchema = z.object({
  name: z.string().min(1).max(255),
  label: z.string().max(500).optional().nullable(),
  latitude: z.union([z.number(), z.string()]).optional().nullable(),
  longitude: z.union([z.number(), z.string()]).optional().nullable(),
  lat: z.union([z.number(), z.string()]).optional().nullable(),
  lng: z.union([z.number(), z.string()]).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  place_id: z.string().max(255).optional().nullable(),
  placeId: z.string().max(255).optional().nullable(),
  display_order: z.coerce.number().int().optional(),
});

const createItinerarySchema = z.object({
  body: z
    .object({
      title: z.string().min(3, 'Itinerary name must be at least 3 characters').max(200),
      from_date: z.string().min(1, 'From date is required'),
      to_date: z.string().min(1, 'To date is required'),
      destinations: z.array(destinationSchema).min(1, 'Select at least one destination'),
      cover_image: z.string().max(500).optional().nullable(),
      package_term_ids: z.array(z.string().uuid()).optional().nullable(),
      inclusion_ids: z.array(z.string().uuid()).optional().nullable(),
      exclusion_ids: z.array(z.string().uuid()).optional().nullable(),
      booking_id: z.string().uuid().optional().nullable(),
      quotation_id: z.string().uuid().optional().nullable(),
      enquiry_id: z.string().uuid().optional().nullable(),
      destination_id: z.string().uuid().optional().nullable(),
      package_id: z.string().uuid().optional().nullable(),
      adults: z.coerce.number().int().optional(),
      children: z.coerce.number().int().optional(),
      budget: z.union([z.number(), z.string()]).optional().nullable(),
      pricing: z.any().optional().nullable(),
      preferences: z.any().optional().nullable(),
      status: z.string().max(50).optional(),
      is_ai_generated: z.boolean().optional(),
      regenerate_days: z.boolean().optional(),
    })
    .refine((b) => !b.from_date || !b.to_date || b.to_date >= b.from_date, {
      message: 'To date cannot be smaller than From date',
      path: ['to_date'],
    }),
});

const updateItinerarySchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z
    .object({
      title: z.string().min(3).max(200).optional(),
      from_date: z.string().optional().nullable(),
      to_date: z.string().optional().nullable(),
      destinations: z.array(destinationSchema).min(1).optional(),
      cover_image: z.string().max(500).optional().nullable(),
      package_term_ids: z.array(z.string().uuid()).optional().nullable(),
      inclusion_ids: z.array(z.string().uuid()).optional().nullable(),
      exclusion_ids: z.array(z.string().uuid()).optional().nullable(),
      booking_id: z.string().uuid().optional().nullable(),
      quotation_id: z.string().uuid().optional().nullable(),
      enquiry_id: z.string().uuid().optional().nullable(),
      destination_id: z.string().uuid().optional().nullable(),
      package_id: z.string().uuid().optional().nullable(),
      adults: z.coerce.number().int().optional(),
      children: z.coerce.number().int().optional(),
      budget: z.union([z.number(), z.string()]).optional().nullable(),
      pricing: z.any().optional().nullable(),
      preferences: z.any().optional().nullable(),
      status: z.string().max(50).optional(),
      is_ai_generated: z.boolean().optional(),
      regenerate_days: z.boolean().optional(),
    })
    .refine(
      (b) =>
        !b.from_date ||
        !b.to_date ||
        b.to_date >= b.from_date,
      {
        message: 'To date cannot be smaller than From date',
        path: ['to_date'],
      }
    ),
});

const updateDaySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    dayId: z.string().uuid(),
  }),
  body: z.object({
    destination: z.string().max(255).optional().nullable(),
    subject: z.string().min(1, 'Subject is required').max(255).optional(),
    description: z.string().optional().nullable(),
    status: z.string().max(50).optional(),
    display_order: z.coerce.number().int().optional(),
  }),
});

const EVENT_TYPES = [
  'accommodation',
  'activity',
  'transportation',
  'visa',
  'meal',
  'flight',
  'leisure',
  'cruise',
];

const createEventSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    dayId: z.string().uuid(),
  }),
  body: z.object({
    event_type: z.enum(EVENT_TYPES, { required_error: 'Event type is required' }),
    name: z.string().min(1, 'Event name is required').max(200),
    event_time: z.string().max(20).optional().nullable(),
    description: z.string().max(5000).optional().nullable(),
    image_url: z.string().max(500).optional().nullable(),
    details: z.record(z.any()).optional().nullable(),
    display_order: z.coerce.number().int().optional(),
    status: z.string().max(50).optional(),
  }),
});

const updateEventSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    eventId: z.string().uuid(),
  }),
  body: z.object({
    event_type: z.enum(EVENT_TYPES).optional(),
    name: z.string().min(1).max(200).optional(),
    event_time: z.string().max(20).optional().nullable(),
    description: z.string().max(5000).optional().nullable(),
    image_url: z.string().max(500).optional().nullable(),
    details: z.record(z.any()).optional().nullable(),
    display_order: z.coerce.number().int().optional(),
    status: z.string().max(50).optional(),
  }),
});

const reorderEventsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    dayId: z.string().uuid(),
  }),
  body: z.object({
    ordered_ids: z.array(z.string().uuid()).min(1),
  }),
});

const placesSearchSchema = z.object({
  query: z.object({
    q: z.string().min(2),
    limit: z.coerce.number().int().min(1).max(20).optional(),
  }),
});

const imagesSearchSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    destination: z.string().optional(),
    eventName: z.string().optional(),
    eventType: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(20).optional(),
  }),
});

const idParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

const assignEnquirySchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    enquiry_id: z.string().uuid({ message: 'Enquiry is required' }),
  }),
});

const publicItineraryTokenSchema = z.object({
  params: z.object({
    token: z.string().min(16).max(64),
  }),
});

module.exports = {
  createItinerarySchema,
  updateItinerarySchema,
  updateDaySchema,
  createEventSchema,
  updateEventSchema,
  reorderEventsSchema,
  placesSearchSchema,
  imagesSearchSchema,
  idParamSchema,
  assignEnquirySchema,
  publicItineraryTokenSchema,
  EVENT_TYPES,
};
