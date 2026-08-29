const { z } = require('zod');

const packageTermsBodySchema = z.object({
  heading: z
    .string()
    .trim()
    .min(1, 'Heading is required')
    .max(150, 'Heading must be at most 150 characters'),
  description: z.string().trim().min(1, 'Description is required'),
  is_active: z.boolean().optional(),
});

const createPackageTermsSchema = z.object({
  body: packageTermsBodySchema,
});

const updatePackageTermsSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: packageTermsBodySchema.partial(),
});

module.exports = { createPackageTermsSchema, updatePackageTermsSchema };
