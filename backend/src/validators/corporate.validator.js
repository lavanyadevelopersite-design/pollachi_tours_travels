const { z } = require('zod');

const corporateBodySchema = z.object({
  corporate_name: z
    .string()
    .trim()
    .min(1, 'Corporate name is required')
    .max(150, 'Corporate name must be at most 150 characters'),
  is_active: z.boolean().optional(),
});

const createCorporateSchema = z.object({
  body: corporateBodySchema,
});

const updateCorporateSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: corporateBodySchema.partial(),
});

module.exports = { createCorporateSchema, updateCorporateSchema };
