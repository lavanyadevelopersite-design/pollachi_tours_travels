const { z } = require('zod');

const optionalPhone = z.union([z.string(), z.literal(''), z.null()]).optional();
const optionalUuid = z.union([z.string().uuid(), z.literal(''), z.null()]).optional();
const optionalString = z.union([z.string(), z.literal(''), z.null()]).optional();

const profileFields = {
  gender: optionalString,
  blood_group: optionalString,
  aadhar: optionalString,
  permanent_address: optionalString,
  has_work_experience: z.coerce.boolean().optional(),
  work_experience_years: z.coerce.number().int().min(0).optional().nullable(),
  previous_company_name: optionalString,
  previous_company_designation: optionalString,
  previous_company_duration: optionalString,
};

const createUserSchema = z.object({
  body: z.object({
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.string().email(),
    phone: optionalPhone,
    password: z.string().min(8),
    role_id: optionalUuid,
    branch_id: optionalUuid,
    department_id: optionalUuid,
    designation_id: optionalUuid,
    is_active: z.coerce.boolean().optional(),
    ...profileFields,
  }),
});

const updateUserSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    first_name: z.string().min(1).optional(),
    last_name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: optionalPhone,
    password: z.string().min(8).optional(),
    role_id: optionalUuid,
    branch_id: optionalUuid,
    department_id: optionalUuid,
    designation_id: optionalUuid,
    is_active: z.coerce.boolean().optional(),
    ...profileFields,
  }),
});

module.exports = { createUserSchema, updateUserSchema };
