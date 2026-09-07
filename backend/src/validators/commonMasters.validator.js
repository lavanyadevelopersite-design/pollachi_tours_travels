const { z } = require('zod');

const uuidParam = z.object({ id: z.string().uuid() });
const optionalString = z.string().trim().optional().nullable().or(z.literal(''));
const activeFlag = z.boolean().optional();

const currencyBody = z.object({
  name: z.string().trim().min(1, 'Name is required').max(150),
  code: z.string().trim().max(10).optional().or(z.literal('')),
  symbol: z.string().trim().max(10).optional().or(z.literal('')),
  decimal_places: z.coerce.number().int().min(0).max(6).optional(),
  exchange_rate: z.coerce.number().positive('Rate must be greater than 0'),
  is_default: z.boolean().optional(),
  description: optionalString,
  is_active: activeFlag,
});

const countryBody = z.object({
  name: z.string().trim().min(1, 'Country name is required').max(150),
  code: z.string().trim().min(1, 'Country code is required').max(10),
  iso_numeric_code: optionalString,
  currency_code: z.string().trim().min(1, 'Currency is required').max(10),
  currency_per_rupees: z.coerce.number().min(0, 'Currency per rupees must be 0 or greater').default(1),
  nationality: optionalString,
  phone_code: optionalString,
  description: optionalString,
  is_active: activeFlag,
});

const stateBody = z.object({
  country_id: z.string().uuid('Country is required'),
  name: z.string().trim().min(1, 'State name is required').max(150),
  code: optionalString,
  description: optionalString,
  is_active: activeFlag,
});

const cityBody = z.object({
  country_id: z.string().uuid('Country is required'),
  state_id: z.string().uuid('State is required'),
  name: z.string().trim().min(1, 'City name is required').max(150),
  code: optionalString,
  airport_code: optionalString,
  description: optionalString,
  is_active: activeFlag,
});

const paymentModeBody = z.object({
  name: z.string().trim().min(1, 'Payment mode name is required').max(150),
  code: optionalString,
  display_order: z.coerce.number().int().optional().nullable(),
  icon: optionalString,
  description: optionalString,
  is_active: activeFlag,
});

const taxBody = z.object({
  name: z.string().trim().min(1, 'Tax name is required').max(150),
  code: optionalString,
  tax_percentage: z.coerce.number().min(0, 'Tax percentage must be 0 or greater'),
  tax_type: z.enum(['GST', 'VAT', 'CGST', 'SGST', 'IGST', 'Service Tax', 'Other']),
  applicable_on: z.enum(['Package', 'Hotel', 'Transport', 'Visa', 'Insurance', 'Activities', 'Other']),
  description: optionalString,
  is_active: activeFlag,
});

const seasonPricingBody = z.object({
  name: z.string().trim().min(1, 'Season name is required').max(150),
  code: optionalString,
  price_per_km: z.coerce.number().min(0, 'Price per km must be 0 or greater'),
  is_active: activeFlag,
});

const expensesTypeBody = z.object({
  name: z.string().trim().min(1, 'Expense type is required').max(150),
  code: optionalString,
  description: optionalString,
  is_active: activeFlag,
});

const departmentBody = z.object({
  department_name: z.string().trim().min(1, 'Department name is required').max(150),
  department_code: z.string().trim().max(50).optional().nullable().or(z.literal('')),
  department_head: z.union([z.string().uuid(), z.literal(''), z.null()]).optional(),
  display_order: z.coerce.number().int().optional().nullable(),
  description: optionalString,
  is_active: activeFlag,
});

const designationBody = z.object({
  designation_name: z.string().trim().min(1, 'Designation name is required').max(150),
  designation_code: z.string().trim().min(1, 'Designation code is required').max(50),
  department_id: z.string().uuid('Department is required'),
  hierarchy_level: z.coerce.number().int().optional().nullable(),
  description: optionalString,
  is_active: activeFlag,
});

const driverProofBody = z.object({
  id: z.union([z.string().uuid(), z.literal(''), z.null()]).optional(),
  proof_type: z.string().trim().min(1, 'Proof type is required').max(50),
  proof_number: optionalString,
  license_type: optionalString,
  expiry_date: optionalString,
  notes: optionalString,
  display_order: z.coerce.number().int().optional().nullable(),
  images: z.array(z.string()).optional(),
  existing_images: z.array(z.string()).optional(),
  existingImages: z.array(z.string()).optional(),
  proofType: optionalString,
  proofNumber: optionalString,
  licenseType: optionalString,
  expiryDate: optionalString,
});

const driverBody = z.object({
  full_name: z.string().trim().min(1, 'Driver name is required').max(150),
  code: optionalString,
  photo: optionalString,
  license_number: z.string().trim().min(1, 'License number is required').max(50),
  license_type: optionalString,
  license_expiry: optionalString,
  id_proof_type: optionalString,
  id_proof_number: optionalString,
  proof_document: optionalString,
  proofs: z.array(driverProofBody).optional(),
  phone: z.string().trim().min(1, 'Phone is required').max(20),
  alternate_phone: optionalString,
  email: z.string().email('Invalid email').optional().nullable().or(z.literal('')),
  address: optionalString,
  city: optionalString,
  emergency_contact_name: optionalString,
  emergency_contact_phone: optionalString,
  emergency_contact_relation: optionalString,
  employment_type: optionalString,
  experience_years: z.coerce.number().int().min(0).optional().nullable(),
  joining_date: optionalString,
  blood_group: optionalString,
  vehicle_id: z.union([z.string().uuid(), z.literal(''), z.null()]).optional(),
  driver_type: z.enum(['own', 'vendor']).optional().or(z.literal('')),
  supplier_id: z.union([z.string().uuid(), z.literal(''), z.null()]).optional(),
  availability_status: optionalString,
  notes: optionalString,
  portal_password: z
    .string()
    .trim()
    .min(6, 'Portal password must be at least 6 characters')
    .max(100)
    .optional()
    .or(z.literal('')),
  is_active: activeFlag,
});

const guideBody = z.object({
  full_name: z.string().trim().min(1, 'Guide name is required').max(150),
  code: optionalString,
  photo: optionalString,
  phone: z.string().trim().min(1, 'Phone is required').max(20),
  alternate_phone: optionalString,
  whatsapp: optionalString,
  email: z.string().email('Invalid email').optional().nullable().or(z.literal('')),
  address: optionalString,
  city: optionalString,
  emergency_phone: optionalString,
  languages: optionalString,
  specialization: optionalString,
  license_number: optionalString,
  license_expiry: optionalString,
  id_proof_type: optionalString,
  id_proof_number: optionalString,
  proof_document: optionalString,
  experience_years: z.coerce.number().int().min(0).optional().nullable(),
  daily_rate: z.coerce.number().min(0).optional().nullable(),
  joining_date: optionalString,
  destination_ids: optionalString,
  coverage_areas: optionalString,
  availability_status: optionalString,
  bio: optionalString,
  notes: optionalString,
  is_active: activeFlag,
});

const makeCreate = (body) => z.object({ body });
const makeUpdate = (body) =>
  z.object({
    params: uuidParam,
    body: body.partial(),
  });

module.exports = {
  createCurrencySchema: makeCreate(currencyBody),
  updateCurrencySchema: makeUpdate(currencyBody),
  createCountrySchema: makeCreate(countryBody),
  updateCountrySchema: makeUpdate(countryBody),
  createStateSchema: makeCreate(stateBody),
  updateStateSchema: makeUpdate(stateBody),
  createCitySchema: makeCreate(cityBody),
  updateCitySchema: makeUpdate(cityBody),
  createPaymentModeSchema: makeCreate(paymentModeBody),
  updatePaymentModeSchema: makeUpdate(paymentModeBody),
  createTaxSchema: makeCreate(taxBody),
  updateTaxSchema: makeUpdate(taxBody),
  createSeasonPricingSchema: makeCreate(seasonPricingBody),
  updateSeasonPricingSchema: makeUpdate(seasonPricingBody),
  createExpensesTypeSchema: makeCreate(expensesTypeBody),
  updateExpensesTypeSchema: makeUpdate(expensesTypeBody),
  createDepartmentSchema: makeCreate(departmentBody),
  updateDepartmentSchema: makeUpdate(departmentBody),
  createDesignationSchema: makeCreate(designationBody),
  updateDesignationSchema: makeUpdate(designationBody),
  createDriverSchema: makeCreate(driverBody),
  updateDriverSchema: makeUpdate(driverBody),
  createGuideSchema: makeCreate(guideBody),
  updateGuideSchema: makeUpdate(guideBody),
};
