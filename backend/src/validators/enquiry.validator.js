const { z } = require('zod');
const { ENQUIRY_STATUSES, ENQUIRY_TYPES, SERVICE_REQUIRED_OPTIONS, VACATION_TYPE_OPTIONS } = require('../utils/constants');

const phoneRegex = /^\d{10,15}$/;

const enquiryBodyBase = {
  enquiry_type: z.enum(ENQUIRY_TYPES),
  customer_name: z.string().min(1, 'Name is required'),
  phone: z.string().regex(phoneRegex, 'Mobile must be 10-15 digits'),
  emergency_contact_number: z
    .union([
      z.string().regex(phoneRegex, 'Another contact must be 10-15 digits'),
      z.literal(''),
      z.null(),
    ])
    .optional(),
  email: z
    .union([z.string().email('Enter a valid email'), z.literal(''), z.null()])
    .optional(),
  country_id: z.string().uuid('Country is required'),
  state_id: z.union([z.string().uuid(), z.literal(''), z.null()]).optional(),
  state_name: z.string().trim().min(1, 'State is required'),
  city_id: z.union([z.string().uuid(), z.literal(''), z.null()]).optional(),
  city_name: z.string().trim().min(1, 'City is required'),
  travel_from: z.string().min(1, 'Travel From Date is required'),
  travel_to: z.string().min(1, 'Travel To Date is required'),
  travel_from_destination: z.string().min(1, 'Travel From Destination is required'),
  travel_to_destination: z.string().min(1, 'Travel To Destination is required'),
  travel_from_lat: z.coerce.number().optional().nullable(),
  travel_from_lng: z.coerce.number().optional().nullable(),
  travel_to_lat: z.coerce.number().optional().nullable(),
  travel_to_lng: z.coerce.number().optional().nullable(),
  approx_distance_km: z.coerce
    .number({ invalid_type_error: 'Approx distance is required' })
    .positive('Approx distance must be greater than 0'),
  estimated_trip_cost: z.coerce.number().optional().nullable(),
  adults: z.coerce.number().int().min(1, 'Adults minimum is 1').default(1),
  children: z.coerce.number().int().min(0).optional().default(0),
  children_details: z
    .array(
      z.object({
        name: z.string().optional().nullable().or(z.literal('')),
        age: z.coerce.number().int().min(0).max(17),
      })
    )
    .optional()
    .nullable()
    .default([]),
  infants: z.coerce.number().int().min(0).optional().default(0),
  lead_source_id: z.union([z.string().uuid(), z.literal(''), z.null()]).optional(),
  service_required: z
    .union([z.enum(SERVICE_REQUIRED_OPTIONS), z.literal(''), z.null()])
    .optional(),
  vacation_type: z
    .union([z.enum(VACATION_TYPE_OPTIONS), z.literal(''), z.null()])
    .optional(),
  requirements: z.string().optional().nullable(),
  lead_id: z.string().uuid().optional().nullable(),
  destination_id: z.string().uuid().optional().nullable(),
  package_id: z.string().uuid().optional().nullable(),
  budget: z.number().optional().nullable(),
  status: z.enum(ENQUIRY_STATUSES).optional(),
  assigned_to: z.string().uuid().optional().nullable(),
  branch_id: z.string().uuid().optional().nullable(),
};

const refineEnquiry = (data, ctx, { enforceFutureDates = true } = {}) => {
  const today = new Date().toISOString().slice(0, 10);

  if (enforceFutureDates) {
    if (data.travel_from && data.travel_from < today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Travel From Date cannot be in the past',
        path: ['travel_from'],
      });
    }

    if (data.travel_to && data.travel_to < today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Travel To Date cannot be in the past',
        path: ['travel_to'],
      });
    }
  }

  if (data.travel_from && data.travel_to && data.travel_to < data.travel_from) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Travel To Date must be greater than Travel From Date',
      path: ['travel_to'],
    });
  }
  if (
    data.travel_from_destination &&
    data.travel_to_destination &&
    data.travel_from_destination.trim().toLowerCase() ===
      data.travel_to_destination.trim().toLowerCase()
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Travel destinations cannot be the same',
      path: ['travel_to_destination'],
    });
  }

  if (data.children != null) {
    const childCount = Number(data.children) || 0;
    const details = Array.isArray(data.children_details) ? data.children_details : [];
    if (childCount > 0 && details.length !== childCount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Please provide details for all ${childCount} children`,
        path: ['children_details'],
      });
    }
  }
};

const createEnquirySchema = z.object({
  body: z.object(enquiryBodyBase).superRefine((data, ctx) => refineEnquiry(data, ctx, { enforceFutureDates: true })),
});

const publicEnquirySchema = z.object({
  body: z.object(enquiryBodyBase).superRefine((data, ctx) => refineEnquiry(data, ctx, { enforceFutureDates: true })),
});

const updateEnquirySchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z
    .object({
      ...Object.fromEntries(
        Object.entries(enquiryBodyBase).map(([k, v]) => [k, v.optional()])
      ),
      lead_status_id: z.string().uuid().optional().nullable(),
    })
    .superRefine((data, ctx) => {
      if (data.travel_from || data.travel_to || data.children != null || data.children_details != null) {
        refineEnquiry(data, ctx, { enforceFutureDates: false });
      }
    }),
});

const distanceSchema = z.object({
  body: z
    .object({
      from_lat: z.number().optional().nullable(),
      from_lng: z.number().optional().nullable(),
      to_lat: z.number().optional().nullable(),
      to_lng: z.number().optional().nullable(),
      from_place: z.string().optional().nullable(),
      to_place: z.string().optional().nullable(),
      travel_from_lat: z.number().optional().nullable(),
      travel_from_lng: z.number().optional().nullable(),
      travel_to_lat: z.number().optional().nullable(),
      travel_to_lng: z.number().optional().nullable(),
      travel_from_destination: z.string().optional().nullable(),
      travel_to_destination: z.string().optional().nullable(),
    })
    .transform((b) => ({
      fromLat: b.from_lat ?? b.travel_from_lat,
      fromLng: b.from_lng ?? b.travel_from_lng,
      toLat: b.to_lat ?? b.travel_to_lat,
      toLng: b.to_lng ?? b.travel_to_lng,
      fromPlace: b.from_place ?? b.travel_from_destination,
      toPlace: b.to_place ?? b.travel_to_destination,
    })),
});

const tripCostSchema = z.object({
  body: z.object({
    country_id: z.string().uuid(),
    travel_date: z.string().min(1),
  }),
});

const placesSchema = z.object({
  query: z.object({
    q: z.string().min(2),
  }),
});

const updateEnquiryStatusSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z
    .object({
      status: z.enum(ENQUIRY_STATUSES).optional(),
      lead_status_id: z.string().uuid().optional().nullable(),
    })
    .refine((b) => b.status != null || b.lead_status_id != null, {
      message: 'Provide status or lead_status_id',
    }),
});

const enquiryNoteSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    note: z.string().min(1, 'Note is required').max(5000),
  }),
});

const enquiryIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

const vehicleAssignmentSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    vehicle_id: z.string().uuid('Vehicle is required'),
    driver_id: z.string().uuid().optional().nullable(),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
    pickup_location: z.string().max(255).optional().nullable(),
    drop_location: z.string().max(255).optional().nullable(),
    amount: z.coerce.number().min(0).optional().nullable(),
    status: z
      .enum(['allocated', 'confirmed', 'on_trip', 'completed', 'cancelled'])
      .optional()
      .default('allocated'),
    notes: z.string().max(2000).optional().nullable(),
  }),
});

const vehicleAssignmentUpdateSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    subId: z.string().uuid(),
  }),
  body: z.object({
    vehicle_id: z.string().uuid().optional(),
    driver_id: z.string().uuid().optional().nullable(),
    start_date: z.string().min(1).optional(),
    end_date: z.string().min(1).optional(),
    pickup_location: z.string().max(255).optional().nullable(),
    drop_location: z.string().max(255).optional().nullable(),
    amount: z.coerce.number().min(0).optional().nullable(),
    status: z
      .enum(['allocated', 'confirmed', 'on_trip', 'completed', 'cancelled'])
      .optional(),
    notes: z.string().max(2000).optional().nullable(),
  }),
});

const vehicleAssignmentIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    subId: z.string().uuid(),
  }),
});

const shareDriverLoginSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    subId: z.string().uuid(),
  }),
  body: z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    login_link: z.string().url().optional(),
  }),
});

const monthlyTripsSchema = z.object({
  query: z
    .object({
      vehicle_id: z.string().uuid().optional(),
      driver_id: z.string().uuid().optional(),
      year: z.coerce.number().int().min(2000).max(2100).optional(),
      month: z.coerce.number().int().min(1).max(12).optional(),
    })
    .refine((q) => q.vehicle_id || q.driver_id, {
      message: 'Provide vehicle_id or driver_id',
    }),
});

const assignedTripsSchema = z.object({
  query: z
    .object({
      vehicle_id: z.string().uuid().optional(),
      driver_id: z.string().uuid().optional(),
    })
    .refine((q) => q.vehicle_id || q.driver_id, {
      message: 'Provide vehicle_id or driver_id',
    }),
});

module.exports = {
  createEnquirySchema,
  updateEnquirySchema,
  updateEnquiryStatusSchema,
  publicEnquirySchema,
  distanceSchema,
  tripCostSchema,
  placesSchema,
  enquiryNoteSchema,
  enquiryIdParamSchema,
  vehicleAssignmentSchema,
  vehicleAssignmentUpdateSchema,
  vehicleAssignmentIdSchema,
  shareDriverLoginSchema,
  monthlyTripsSchema,
  assignedTripsSchema,
};
