const { z } = require('zod');

const inclusionExclusionBodySchema = z.object({
  type: z.enum(['inclusion', 'exclusion']),
  heading: z.string().trim().min(1).max(150),
  description: z.string().trim().min(1),
  is_active: z.boolean().optional(),
});

const createInclusionExclusionSchema = z.object({
  body: inclusionExclusionBodySchema,
});

const updateInclusionExclusionSchema = z.object({
  body: inclusionExclusionBodySchema.partial(),
});

module.exports = {
  createInclusionExclusionSchema,
  updateInclusionExclusionSchema,
};
