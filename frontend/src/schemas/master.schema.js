import { z } from 'zod';

export const masterItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const branchSchema = masterItemSchema.extend({
  address: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
});

export const destinationSchema = masterItemSchema.extend({
  country: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
});

export const packageSchema = masterItemSchema.extend({
  destinationId: z.union([z.string(), z.number()]).optional().nullable(),
  durationDays: z.coerce.number().min(1).default(1),
  price: z.coerce.number().min(0).default(0),
});

export const hotelSchema = masterItemSchema.extend({
  destinationId: z.union([z.string(), z.number()]).optional().nullable(),
  starRating: z.coerce.number().min(1).max(5).default(3),
  address: z.string().optional().or(z.literal('')),
});

export const vehicleSchema = masterItemSchema
  .extend({
    type: z.string().optional().or(z.literal('')),
    capacity: z.preprocess(
      (v) => (v === '' || v == null ? undefined : v),
      z.coerce.number({ required_error: 'Seating capacity is required' }).int().min(1, 'Seating capacity is required')
    ),
    registrationNo: z.string().optional().or(z.literal('')),
    ownership: z.enum(['own', 'vendor']),
    supplierId: z.union([z.string(), z.number()]).optional().nullable().or(z.literal('')),
    image: z.any().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.ownership === 'vendor' && !data.supplierId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Vendor name is required',
        path: ['supplierId'],
      });
    }
  });

export const supplierSchema = masterItemSchema.extend({
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
});

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export const leadStatusSchema = z.object({
  leadStatus: z
    .string()
    .trim()
    .min(1, 'Lead status is required')
    .max(100, 'Lead status must be at most 100 characters'),
  buttonColor: z
    .string()
    .trim()
    .min(1, 'Button color is required')
    .regex(hexColorRegex, 'Button color must be a valid HEX color'),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const leadSourceTypeSchema = z.object({
  leadSourceType: z
    .string()
    .trim()
    .min(1, 'Lead source type is required')
    .max(100, 'Lead source type must be at most 100 characters'),
  description: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const agentSchema = z.object({
  agentName: z
    .string()
    .trim()
    .min(1, 'Agent name is required')
    .max(150, 'Agent name must be at most 150 characters'),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const corporateSchema = z.object({
  corporateName: z
    .string()
    .trim()
    .min(1, 'Corporate name is required')
    .max(150, 'Corporate name must be at most 150 characters'),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const packageTermsSchema = z.object({
  heading: z
    .string()
    .trim()
    .min(1, 'Heading is required')
    .max(150, 'Heading must be at most 150 characters'),
  description: z.string().trim().min(1, 'Description is required'),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const inclusionExclusionSchema = z.object({
  type: z.enum(['inclusion', 'exclusion']),
  heading: z
    .string()
    .trim()
    .min(1, 'Heading is required')
    .max(150, 'Heading must be at most 150 characters'),
  description: z.string().trim().min(1, 'Description is required'),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const currencySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(150),
  rate: z.coerce.number().positive('Rate must be greater than 0'),
  status: z.enum(['active', 'inactive']),
});

export const countrySchema = z.object({
  name: z.string().trim().min(1, 'Country name is required').max(150),
  code: z.string().trim().min(1, 'Country code is required').max(10),
  isoNumericCode: z.string().optional().or(z.literal('')),
  currencyCode: z.string().trim().min(1, 'Currency is required').max(10),
  currencyPerRupees: z.coerce.number().min(0, 'Currency per rupees is required').default(1),
  nationality: z.string().optional().or(z.literal('')),
  phoneCode: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const stateSchema = z.object({
  countryId: z.string().min(1, 'Country is required'),
  name: z.string().trim().min(1, 'State name is required').max(150),
  code: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const citySchema = z.object({
  countryId: z.string().min(1, 'Country is required'),
  stateId: z.string().min(1, 'State is required'),
  name: z.string().trim().min(1, 'City name is required').max(150),
  code: z.string().optional().or(z.literal('')),
  airportCode: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const paymentModeSchema = z.object({
  name: z.string().trim().min(1, 'Payment mode name is required').max(150),
  displayOrder: z.coerce.number().int().optional().or(z.literal('')),
  icon: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const TAX_TYPE_OPTIONS = ['GST', 'VAT', 'CGST', 'SGST', 'IGST', 'Service Tax', 'Other'];
export const TAX_APPLICABLE_ON_OPTIONS = [
  'Package',
  'Hotel',
  'Transport',
  'Visa',
  'Insurance',
  'Activities',
  'Other',
];

export const taxSchema = z.object({
  name: z.string().trim().min(1, 'Tax name is required').max(150),
  taxPercentage: z.coerce.number().min(0, 'Tax percentage is required'),
  taxType: z.enum(TAX_TYPE_OPTIONS),
  applicableOn: z.enum(TAX_APPLICABLE_ON_OPTIONS),
  description: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const seasonPricingSchema = z.object({
  name: z.string().trim().min(1, 'Season name is required').max(150),
  pricePerKm: z.coerce.number().min(0, 'Price per km is required'),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const expensesTypeSchema = z.object({
  name: z.string().trim().min(1, 'Expense type is required').max(150),
  code: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const departmentSchema = z.object({
  departmentName: z.string().trim().min(1, 'Department name is required').max(150),
  departmentCode: z.string().trim().max(50).optional().or(z.literal('')),
  departmentHead: z.string().optional().nullable().or(z.literal('')),
  displayOrder: z.coerce.number().int().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const designationSchema = z.object({
  designationName: z.string().trim().min(1, 'Designation name is required').max(150),
  designationCode: z.string().trim().min(1, 'Designation code is required').max(50),
  departmentId: z.string().min(1, 'Department is required'),
  hierarchyLevel: z.coerce.number().int().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const DRIVER_LICENSE_TYPES = ['LMV', 'HMV', 'MCWG', 'MCWOG', 'Other'];
export const DRIVER_EMPLOYMENT_TYPES = ['permanent', 'contract', 'freelance'];
export const AVAILABILITY_STATUS_OPTIONS = ['available', 'on_trip', 'on_tour', 'leave', 'inactive'];
export const ID_PROOF_TYPES = ['Aadhaar', 'PAN', 'Passport', 'Voter ID', 'Driving License', 'Other'];
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const driverProofItemSchema = z
  .object({
    id: z.string().optional().nullable().or(z.literal('')),
    proofType: z.string().optional().or(z.literal('')),
    proofNumber: z.string().optional().or(z.literal('')),
    licenseType: z.string().optional().or(z.literal('')),
    expiryDate: z.string().optional().or(z.literal('')),
    notes: z.string().optional().or(z.literal('')),
    images: z.any().optional().nullable(),
    existingImages: z.array(z.string()).optional().default([]),
  })
  .superRefine((val, ctx) => {
    const hasFiles = Array.isArray(val.images)
      ? val.images.length > 0
      : Boolean(val.images);
    const hasExisting = Array.isArray(val.existingImages) && val.existingImages.length > 0;
    const hasAny =
      Boolean(String(val.proofNumber || '').trim()) ||
      Boolean(String(val.licenseType || '').trim()) ||
      Boolean(String(val.expiryDate || '').trim()) ||
      Boolean(String(val.notes || '').trim()) ||
      hasFiles ||
      hasExisting;
    if (hasAny && !String(val.proofType || '').trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Proof type is required',
        path: ['proofType'],
      });
    }
  });

export const driverSchema = z.object({
  fullName: z.string().trim().min(1, 'Driver name is required').max(150),
  code: z.string().optional().or(z.literal('')),
  photo: z.any().optional().nullable(),
  licenseNumber: z.string().trim().min(1, 'License number is required').max(50),
  licenseType: z.string().optional().or(z.literal('')),
  licenseExpiry: z.string().optional().or(z.literal('')),
  proofs: z.array(driverProofItemSchema).default([]),
  phone: z.string().trim().min(1, 'Phone is required').max(20),
  alternatePhone: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  emergencyContactName: z.string().optional().or(z.literal('')),
  emergencyContactPhone: z.string().optional().or(z.literal('')),
  emergencyContactRelation: z.string().optional().or(z.literal('')),
  employmentType: z.string().optional().or(z.literal('')),
  experienceYears: z.coerce.number().int().min(0).optional().or(z.literal('')),
  joiningDate: z.string().optional().or(z.literal('')),
  bloodGroup: z.string().optional().or(z.literal('')),
  vehicleId: z.string().optional().nullable().or(z.literal('')),
  driverType: z.enum(['own', 'vendor']).default('own'),
  supplierId: z.union([z.string(), z.number()]).optional().nullable().or(z.literal('')),
  availabilityStatus: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  portalPassword: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || String(v).length >= 6, {
      message: 'Portal password must be at least 6 characters',
    }),
  status: z.enum(['active', 'inactive']).default('active'),
})
  .superRefine((data, ctx) => {
    if (data.driverType === 'vendor' && !data.supplierId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Vendor name is required',
        path: ['supplierId'],
      });
    }
  });

export const guideSchema = z.object({
  fullName: z.string().trim().min(1, 'Guide name is required').max(150),
  code: z.string().optional().or(z.literal('')),
  photo: z.any().optional().nullable(),
  phone: z.string().trim().min(1, 'Phone is required').max(20),
  alternatePhone: z.string().optional().or(z.literal('')),
  whatsapp: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  emergencyPhone: z.string().optional().or(z.literal('')),
  languages: z.string().optional().or(z.literal('')),
  specialization: z.string().optional().or(z.literal('')),
  licenseNumber: z.string().optional().or(z.literal('')),
  licenseExpiry: z.string().optional().or(z.literal('')),
  idProofType: z.string().optional().or(z.literal('')),
  idProofNumber: z.string().optional().or(z.literal('')),
  proofDocument: z.any().optional().nullable(),
  experienceYears: z.coerce.number().int().min(0).optional().or(z.literal('')),
  dailyRate: z.coerce.number().min(0).optional().or(z.literal('')),
  joiningDate: z.string().optional().or(z.literal('')),
  coverageAreas: z.string().optional().or(z.literal('')),
  availabilityStatus: z.string().optional().or(z.literal('')),
  bio: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const invoiceSchema = z.object({
  bookingId: z.union([z.string(), z.number()]).optional().nullable(),
  customerName: z.string().min(1, 'Customer name is required'),
  amount: z.coerce.number().min(0),
  tax: z.coerce.number().min(0).default(0),
  dueDate: z.string().optional().or(z.literal('')),
  status: z.string().default('draft'),
  notes: z.string().optional().or(z.literal('')),
});

export const mapMasterStatus = (values) => {
  const { status, ...rest } = values;
  return {
    ...rest,
    is_active: status !== 'inactive',
  };
};

export const mapBranchToApi = (values) => ({
  name: values.name,
  code: values.code,
  address: values.address || null,
  city: values.city || null,
  phone: values.phone || null,
  email: values.email || null,
  is_active: values.status !== 'inactive',
});

export const mapDestinationToApi = (values) => ({
  name: values.name,
  code: values.code,
  country: values.country || null,
  state: values.state || null,
  description: values.description || null,
  is_active: values.status !== 'inactive',
});

export const mapPackageToApi = (values) => ({
  name: values.name,
  code: values.code,
  description: values.description || null,
  destination_id: values.destinationId || null,
  duration_days: values.durationDays ?? 1,
  base_price: values.price ?? 0,
  is_active: values.status !== 'inactive',
});

export const mapHotelToApi = (values) => ({
  name: values.name,
  code: values.code || null,
  destination_id: values.destinationId || null,
  star_rating: values.starRating ?? 3,
  address: values.address || null,
  is_active: values.status !== 'inactive',
});

export const mapVehicleToApi = (values) => {
  const payload = {
    name: values.name,
    code: values.code || null,
    type: values.type || null,
    capacity: values.capacity,
    registration_number: values.registrationNo || null,
    ownership: values.ownership || 'own',
    supplier_id: values.ownership === 'vendor' ? values.supplierId || null : null,
    is_active: values.status !== 'inactive',
  };

  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    formData.append(key, String(value));
  });
  if (values.image instanceof File) formData.append('image', values.image);
  return formData;
};

export const mapSupplierToApi = (values) => ({
  name: values.name,
  code: values.code || null,
  phone: values.phone || null,
  email: values.email || null,
  address: values.location || null,
  is_active: values.status !== 'inactive',
});

export const mapLeadStatusToApi = (values) => ({
  lead_status: values.leadStatus.trim(),
  button_color: values.buttonColor.toUpperCase(),
  is_active: values.status !== 'inactive',
});

export const mapLeadSourceTypeToApi = (values) => ({
  lead_source_type: values.leadSourceType.trim(),
  description: values.description || null,
  is_active: values.status !== 'inactive',
});

export const mapAgentToApi = (values) => ({
  agent_name: values.agentName.trim(),
  is_active: values.status !== 'inactive',
});

export const mapCorporateToApi = (values) => ({
  corporate_name: values.corporateName.trim(),
  is_active: values.status !== 'inactive',
});

export const mapPackageTermsToApi = (values) => ({
  heading: values.heading.trim(),
  description: values.description.trim(),
  is_active: values.status !== 'inactive',
});

export const mapInclusionExclusionToApi = (values) => ({
  type: values.type,
  heading: values.heading.trim(),
  description: values.description.trim(),
  is_active: values.status !== 'inactive',
});

export const mapCurrencyToApi = (values) => ({
  name: values.name.trim(),
  exchange_rate: Number(values.rate),
  is_active: values.status !== 'inactive',
});

export const mapCountryToApi = (values) => ({
  name: values.name.trim(),
  code: values.code.trim().toUpperCase(),
  iso_numeric_code: values.isoNumericCode || null,
  currency_code: values.currencyCode.trim().toUpperCase(),
  currency_per_rupees:
    values.currencyPerRupees === '' || values.currencyPerRupees == null
      ? 1
      : Number(values.currencyPerRupees),
  nationality: values.nationality || null,
  phone_code: values.phoneCode || null,
  description: values.description || null,
  is_active: values.status !== 'inactive',
});

export const mapStateToApi = (values) => ({
  country_id: values.countryId,
  name: values.name.trim(),
  code: values.code || null,
  description: values.description || null,
  is_active: values.status !== 'inactive',
});

export const mapCityToApi = (values) => ({
  country_id: values.countryId,
  state_id: values.stateId,
  name: values.name.trim(),
  code: values.code || null,
  airport_code: values.airportCode ? values.airportCode.trim().toUpperCase() : null,
  description: values.description || null,
  is_active: values.status !== 'inactive',
});

export const mapPaymentModeToApi = (values) => ({
  name: values.name.trim(),
  display_order:
    values.displayOrder === '' || values.displayOrder == null ? 0 : Number(values.displayOrder),
  icon: values.icon || null,
  description: values.description || null,
  is_active: values.status !== 'inactive',
});

export const mapTaxToApi = (values) => ({
  name: values.name.trim(),
  tax_percentage: Number(values.taxPercentage),
  tax_type: values.taxType,
  applicable_on: values.applicableOn,
  description: values.description || null,
  is_active: values.status !== 'inactive',
});

export const mapSeasonPricingToApi = (values) => ({
  name: values.name.trim(),
  price_per_km:
    values.pricePerKm === '' || values.pricePerKm == null ? 0 : Number(values.pricePerKm),
  is_active: values.status !== 'inactive',
});

/**
 * Convert currency master exchange_rate into "rupees per 1 currency unit".
 * exchange_rate is stored as foreign units per 1 INR (e.g. USD 0.012 → ₹83.3333).
 */
export const exchangeRateToCurrencyPerRupees = (exchangeRate) => {
  const rate = Number(exchangeRate);
  if (!Number.isFinite(rate) || rate <= 0) return 1;
  return Number((1 / rate).toFixed(4));
};

/**
 * Auto-calculate travel amount from lead km using season per-km rate and country currency.
 * Formula: km * price_per_km * currency_per_rupees
 * Example: 10 km × ₹10/km × 90 = ₹9,000
 */
export const calculateLeadAmountByKm = (km, season, country) => {
  const distance = Number(km) || 0;
  const seasonRate = Number(season?.price_per_km ?? season?.pricePerKm ?? 0);
  const currencyPerRupees = Number(
    country?.currency_per_rupees ?? country?.currencyPerRupees ?? 1
  );
  const multiplier = Number.isFinite(currencyPerRupees) ? currencyPerRupees : 1;
  return Math.max(0, distance * seasonRate * multiplier);
};

export const mapExpensesTypeToApi = (values) => ({
  name: values.name.trim(),
  code: values.code || null,
  description: values.description || null,
  is_active: values.status !== 'inactive',
});

export const mapDepartmentToApi = (values) => ({
  department_name: values.departmentName.trim(),
  department_code: values.departmentCode?.trim()
    ? values.departmentCode.trim().toUpperCase()
    : null,
  department_head: values.departmentHead || null,
  display_order:
    values.displayOrder === '' || values.displayOrder == null
      ? 0
      : Number(values.displayOrder),
  description: values.description || null,
  is_active: values.status !== 'inactive',
});

export const mapDesignationToApi = (values) => ({
  designation_name: values.designationName.trim(),
  designation_code: values.designationCode.trim().toUpperCase(),
  department_id: values.departmentId,
  hierarchy_level:
    values.hierarchyLevel === '' || values.hierarchyLevel == null
      ? null
      : Number(values.hierarchyLevel),
  description: values.description || null,
  is_active: values.status !== 'inactive',
});

export const emptyDriverProof = () => ({
  id: '',
  proofType: '',
  proofNumber: '',
  licenseType: '',
  expiryDate: '',
  notes: '',
  images: [],
  existingImages: [],
});

export const mapDriverProofsFromApi = (row) => {
  const proofs = Array.isArray(row?.proofs) ? row.proofs : [];
  if (proofs.length) {
    return proofs.map((proof) => ({
      id: proof.id || '',
      proofType: proof.proof_type || proof.proofType || '',
      proofNumber: proof.proof_number || proof.proofNumber || '',
      licenseType: proof.license_type || proof.licenseType || '',
      expiryDate: proof.expiry_date || proof.expiryDate || '',
      notes: proof.notes || '',
      images: [],
      existingImages: Array.isArray(proof.images)
        ? proof.images.filter(Boolean)
        : proof.images
          ? [proof.images]
          : [],
    }));
  }

  // Legacy single proof fields → one editable row
  if (row?.id_proof_type || row?.id_proof_number || row?.proof_document) {
    return [
      {
        ...emptyDriverProof(),
        proofType: row.id_proof_type || 'Other',
        proofNumber: row.id_proof_number || '',
        existingImages: row.proof_document ? [row.proof_document] : [],
      },
    ];
  }

  return [emptyDriverProof()];
};

export const mapDriverToApi = (values) => {
  const proofs = (values.proofs || [])
    .filter((proof) => String(proof.proofType || '').trim())
    .map((proof, index) => ({
      id: proof.id || null,
      proof_type: String(proof.proofType).trim(),
      proof_number: proof.proofNumber || null,
      license_type: proof.licenseType || null,
      expiry_date: proof.expiryDate || null,
      notes: proof.notes || null,
      display_order: index,
      existing_images: Array.isArray(proof.existingImages)
        ? proof.existingImages.filter(Boolean)
        : [],
    }));

  const payload = {
    full_name: values.fullName.trim(),
    code: values.code || null,
    license_number: values.licenseNumber.trim(),
    license_type: values.licenseType || null,
    license_expiry: values.licenseExpiry || null,
    phone: values.phone.trim(),
    alternate_phone: values.alternatePhone || null,
    email: values.email || null,
    address: values.address || null,
    city: values.city || null,
    emergency_contact_name: values.emergencyContactName || null,
    emergency_contact_phone: values.emergencyContactPhone || null,
    emergency_contact_relation: values.emergencyContactRelation || null,
    employment_type: values.employmentType || null,
    experience_years:
      values.experienceYears === '' || values.experienceYears == null
        ? 0
        : Number(values.experienceYears),
    joining_date: values.joiningDate || null,
    blood_group: values.bloodGroup || null,
    vehicle_id: values.vehicleId || null,
    driver_type: values.driverType || 'own',
    supplier_id: values.driverType === 'vendor' ? values.supplierId || null : null,
    availability_status: values.availabilityStatus || 'available',
    notes: values.notes || null,
    is_active: values.status !== 'inactive',
  };

  if (values.portalPassword) {
    payload.portal_password = values.portalPassword;
  }

  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    formData.append(key, String(value));
  });
  formData.append('proofs', JSON.stringify(proofs));
  if (values.photo instanceof File) formData.append('photo', values.photo);

  (values.proofs || [])
    .filter((proof) => String(proof.proofType || '').trim())
    .forEach((proof, index) => {
      const files = Array.isArray(proof.images)
        ? proof.images
        : proof.images instanceof File
          ? [proof.images]
          : [];
      files.forEach((file) => {
        if (file instanceof File) formData.append(`proof_${index}_images`, file);
      });
    });

  return formData;
};

export const mapGuideToApi = (values) => {
  const payload = {
    full_name: values.fullName.trim(),
    code: values.code || null,
    phone: values.phone.trim(),
    alternate_phone: values.alternatePhone || null,
    whatsapp: values.whatsapp || null,
    email: values.email || null,
    address: values.address || null,
    city: values.city || null,
    emergency_phone: values.emergencyPhone || null,
    languages: values.languages || null,
    specialization: values.specialization || null,
    license_number: values.licenseNumber || null,
    license_expiry: values.licenseExpiry || null,
    id_proof_type: values.idProofType || null,
    id_proof_number: values.idProofNumber || null,
    experience_years:
      values.experienceYears === '' || values.experienceYears == null
        ? 0
        : Number(values.experienceYears),
    daily_rate:
      values.dailyRate === '' || values.dailyRate == null ? 0 : Number(values.dailyRate),
    joining_date: values.joiningDate || null,
    coverage_areas: values.coverageAreas || null,
    availability_status: values.availabilityStatus || 'available',
    bio: values.bio || null,
    notes: values.notes || null,
    is_active: values.status !== 'inactive',
  };

  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    formData.append(key, String(value));
  });
  if (values.photo instanceof File) formData.append('photo', values.photo);
  if (values.proofDocument instanceof File) formData.append('proof_document', values.proofDocument);
  return formData;
};

export const mapInvoiceToApi = (values) => {
  const subtotal = Number(values.amount) || 0;
  const taxAmount = Number(values.tax) || 0;
  return {
    booking_id: values.bookingId || null,
    customer_name: values.customerName,
    invoice_date: new Date().toISOString().slice(0, 10),
    due_date: values.dueDate || null,
    subtotal,
    tax_amount: taxAmount,
    total_amount: subtotal + taxAmount,
    status: values.status,
    notes: values.notes || null,
  };
};

export const mapInvoiceFromApi = (row) => {
  if (!row) return null;
  return {
    ...row,
    customerName: row.customer_name || row.customerName || '',
    bookingId: row.booking_id || row.bookingId || null,
    amount: Number(row.subtotal ?? row.amount ?? row.total_amount ?? 0),
    tax: Number(row.tax_amount ?? row.tax ?? 0),
    dueDate: row.due_date || row.dueDate || '',
  };
};

export const activeStatus = (row) =>
  row?.is_active === false || row?.status === 'inactive' ? 'inactive' : 'active';
