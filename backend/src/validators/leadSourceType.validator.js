const { z } = require('zod');

const leadSourceTypeBodySchema = z.object({
  lead_source_type: z
    .string()
    .trim()
    .min(1, 'Lead source type is required')
    .max(100, 'Lead source type must be at most 100 characters'),
  description: z.string().trim().max(1000).optional().nullable().or(z.literal('')),
  is_active: z.boolean().optional(),
});

const createLeadSourceTypeSchema = z.object({
  body: leadSourceTypeBodySchema,
});

const updateLeadSourceTypeSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: leadSourceTypeBodySchema.partial(),
});

module.exports = { createLeadSourceTypeSchema, updateLeadSourceTypeSchema };
