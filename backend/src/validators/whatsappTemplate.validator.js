const { z } = require('zod');

const templateBodySchema = z.object({
  template_name: z.string().trim().min(1, 'Template name is required').max(150),
  template_content: z.string().trim().min(1, 'Template content is required').max(5000),
  is_active: z.boolean().optional(),
});

const createTemplateSchema = z.object({
  body: templateBodySchema,
});

const updateTemplateSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid template id'),
  }),
  body: z
    .object({
      template_content: z.string().trim().min(1, 'Template content is required').max(5000).optional(),
      is_active: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Provide at least one field to update',
    }),
});

const templateIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid template id'),
  }),
});

const updateTemplateStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid template id'),
  }),
  body: z.object({
    is_active: z.boolean(),
  }),
});

module.exports = {
  createTemplateSchema,
  updateTemplateSchema,
  templateIdSchema,
  updateTemplateStatusSchema,
};
