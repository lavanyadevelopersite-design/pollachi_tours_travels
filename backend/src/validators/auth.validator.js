const { z } = require('zod');

const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
    password: z.string().min(6),
    rememberMe: z.boolean().optional(),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: z.string().min(8),
  }),
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(),
    rememberMe: z.boolean().optional(),
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    first_name: z.string().trim().min(1, 'First name is required'),
    last_name: z.string().trim().min(1, 'Last name is required'),
    email: z.string().trim().email('Enter a valid email'),
    phone: z.string().trim().optional().nullable(),
  }),
});

const changePasswordSchema = z.object({
  body: z
    .object({
      current_password: z.string().min(1, 'Current password is required'),
      new_password: z.string().min(8, 'New password must be at least 8 characters'),
      confirm_password: z.string().min(1, 'Please confirm password'),
    })
    .refine((data) => data.new_password === data.confirm_password, {
      message: 'Passwords do not match',
      path: ['confirm_password'],
    }),
});

module.exports = {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshSchema,
  updateProfileSchema,
  changePasswordSchema,
};
