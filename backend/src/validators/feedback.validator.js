const { z } = require('zod');

const ratingField = z.coerce
  .number({ invalid_type_error: 'Rating is required' })
  .int()
  .min(1, 'Minimum rating is 1')
  .max(5, 'Maximum rating is 5');

const publicFeedbackTokenSchema = z.object({
  params: z.object({
    token: z.string().trim().min(16, 'Invalid feedback token'),
  }),
});

const publicFeedbackSubmitSchema = z.object({
  params: z.object({
    token: z.string().trim().min(16, 'Invalid feedback token'),
  }),
  body: z.object({
    transportation_rating: ratingField,
    overall_rating: ratingField,
    customer_support_rating: ratingField,
    staff_behaviour_rating: ratingField,
    comments: z.string().trim().min(3, 'Please enter a short description').max(2000),
    customer_name: z.string().trim().max(150).optional(),
    email: z.string().trim().email().optional().or(z.literal('')),
    phone: z.string().trim().max(20).optional().or(z.literal('')),
  }),
});

const shareFeedbackWhatsAppSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z
    .object({
      feedback_link: z.string().url().optional(),
    })
    .optional()
    .default({}),
});

module.exports = {
  publicFeedbackTokenSchema,
  publicFeedbackSubmitSchema,
  shareFeedbackWhatsAppSchema,
};
