const { z } = require('zod');
const { LEAD_STATUSES } = require('../utils/constants');

const createLeadSchema = z.object({
  body: z.object({
    first_name: z.string().min(1),
    last_name: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    phone: z.string().min(5),
    source: z.string().optional().nullable(),
    status: z.enum(LEAD_STATUSES).optional(),
    destination_interest: z.string().optional().nullable(),
    budget: z.number().optional().nullable(),
    travel_date: z.string().optional().nullable(),
    adults: z.number().int().positive().optional(),
    children: z.number().int().min(0).optional(),
    notes: z.string().optional().nullable(),
    assigned_to: z.string().uuid().optional().nullable(),
    branch_id: z.string().uuid().optional().nullable(),
  }),
});

const updateLeadSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: createLeadSchema.shape.body.partial(),
});

module.exports = { createLeadSchema, updateLeadSchema };
