const { z } = require('zod');

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

const leadStatusBodySchema = z.object({
  lead_status: z
    .string()
    .trim()
    .min(1, 'Lead status is required')
    .max(100, 'Lead status must be at most 100 characters'),
  button_color: z
    .string()
    .trim()
    .min(1, 'Button color is required')
    .regex(hexColorRegex, 'Button color must be a valid HEX color'),
  is_active: z.boolean().optional(),
});

const createLeadStatusSchema = z.object({
  body: leadStatusBodySchema,
});

const updateLeadStatusSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: leadStatusBodySchema.partial(),
});

module.exports = { createLeadStatusSchema, updateLeadStatusSchema };
