const { z } = require('zod');

const driverLoginSchema = z.object({
  body: z.object({
    login: z.string().trim().min(3, 'Phone or email is required'),
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
  }),
});

const numericField = z.preprocess((val) => {
  if (val === '' || val === undefined || val === null) return null;
  const n = Number(val);
  return Number.isNaN(n) ? val : n;
}, z.union([z.number(), z.null()]).optional());

const updateTripSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid trip id'),
  }),
  body: z
    .object({
      trip_status: z
        .enum(['on_the_way', 'customer_place_reached', 'trip_ongoing', 'trip_closed'])
        .optional(),
      starting_km: numericField,
      closing_km: numericField,
      driver_update_notes: z.string().max(2000).optional().nullable(),
    })
    .refine(
      (data) =>
        data.trip_status !== undefined ||
        data.starting_km !== undefined ||
        data.closing_km !== undefined ||
        data.driver_update_notes !== undefined,
      { message: 'Provide at least one field to update' }
    ),
});
const tripIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid trip id'),
  }),
});

module.exports = {
  driverLoginSchema,
  updateTripSchema,
  tripIdSchema,
};
