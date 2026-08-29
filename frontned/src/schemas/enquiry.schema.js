import { z } from 'zod';

export const SERVICE_REQUIRED_OPTIONS = [
  'Transport',
  'Hotel',
  'Full Package',
  'Transport + Hotel',
  'Transport + Sightseeing',
  'Hotel + Sightseeing',
  'Flight Booking',
  'Bus Booking',
  'Train Booking',
  'Visa Assistance',
  'Custom Package',
];

export const VACATION_TYPE_OPTIONS = [
  'Family Tour',
  'Honeymoon Trip',
  'Friends Trip',
  'Corporate Trip',
  'Adventure Tour',
  'Pilgrimage Tour',
  'Weekend Getaway',
  'Solo Trip',
  'Group Tour',
  'International Tour',
  'Domestic Tour',
];

export const ENQUIRY_TYPE_OPTIONS = [
  { value: 'client', label: 'Client' },
  { value: 'agent', label: 'Agent' },
  { value: 'corporate', label: 'Corporate' },
];

const childDetailSchema = z.object({
  name: z.string().optional().or(z.literal('')),
  age: z.coerce.number().int().min(0, 'Age must be 0 or more').max(17, 'Child age must be 17 or less'),
});

export const enquirySchema = z
  .object({
    enquiryType: z.enum(['client', 'agent', 'corporate'], {
      required_error: 'Enquiry Type is required',
    }),
    customerName: z.string().min(1, 'Name is required'),
    phone: z
      .string()
      .min(1, 'Mobile Number is required')
      .regex(/^\d{10,15}$/, 'Mobile must be 10-15 digits'),
    emergencyContactNumber: z
      .string()
      .optional()
      .or(z.literal(''))
      .refine((val) => !val || /^\d{10,15}$/.test(val), {
        message: 'Another contact must be 10-15 digits',
      }),
    email: z
      .string()
      .optional()
      .or(z.literal(''))
      .refine((val) => !val || z.string().email().safeParse(val).success, {
        message: 'Enter a valid email',
      }),
    countryId: z.string().min(1, 'Country is required'),
    stateName: z.string().trim().min(1, 'State is required'),
    cityName: z.string().trim().min(1, 'City is required'),
    travelFrom: z.string().min(1, 'Travel From Date is required'),
    travelTo: z.string().min(1, 'Travel To Date is required'),
    travelFromDestination: z.string().min(1, 'Travel From Destination is required'),
    travelToDestination: z.string().min(1, 'Travel To Destination is required'),
    travelFromLat: z.coerce.number().optional().nullable(),
    travelFromLng: z.coerce.number().optional().nullable(),
    travelToLat: z.coerce.number().optional().nullable(),
    travelToLng: z.coerce.number().optional().nullable(),
    approxDistanceKm: z.coerce
      .number({ invalid_type_error: 'Approx distance is required' })
      .positive('Approx distance must be greater than 0'),
    adults: z.coerce.number().min(1, 'Adults minimum is 1').default(1),
    children: z.coerce.number().min(0).default(0),
    childrenDetails: z.array(childDetailSchema).optional().default([]),
    infants: z.coerce.number().min(0).optional().default(0),
    leadSourceId: z.string().optional().or(z.literal('')),
    serviceRequired: z.string().optional().or(z.literal('')),
    vacationType: z.string().optional().or(z.literal('')),
    requirements: z.string().optional().or(z.literal('')),
    status: z.string().optional(),
    destinationId: z.union([z.string(), z.number()]).optional().nullable(),
    packageId: z.union([z.string(), z.number()]).optional().nullable(),
    assignedTo: z.union([z.string(), z.number()]).optional().nullable(),
    leadId: z.union([z.string(), z.number()]).optional().nullable(),
    branchId: z.union([z.string(), z.number()]).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.travelFrom && data.travelTo && data.travelTo < data.travelFrom) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Travel To Date must be greater than Travel From Date',
        path: ['travelTo'],
      });
    }
    if (
      data.travelFromDestination &&
      data.travelToDestination &&
      data.travelFromDestination.trim().toLowerCase() ===
        data.travelToDestination.trim().toLowerCase()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Travel destinations cannot be the same',
        path: ['travelToDestination'],
      });
    }

    const childCount = Number(data.children) || 0;
    const details = data.childrenDetails || [];
    if (childCount > 0) {
      if (details.length !== childCount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Please enter details for all ${childCount} children`,
          path: ['children'],
        });
      }
    }
  });

export const mapEnquiryToApi = (values) => ({
  enquiry_type: values.enquiryType,
  customer_name: values.customerName,
  email: values.email || null,
  phone: values.phone,
  emergency_contact_number: values.emergencyContactNumber || null,
  country_id: values.countryId || null,
  state_id: null,
  state_name: values.stateName?.trim() || null,
  city_id: null,
  city_name: values.cityName?.trim() || null,
  travel_from: values.travelFrom || null,
  travel_to: values.travelTo || null,
  travel_from_destination: values.travelFromDestination || null,
  travel_to_destination: values.travelToDestination || null,
  travel_from_lat: values.travelFromLat ?? null,
  travel_from_lng: values.travelFromLng ?? null,
  travel_to_lat: values.travelToLat ?? null,
  travel_to_lng: values.travelToLng ?? null,
  approx_distance_km: values.approxDistanceKm ?? null,
  adults: values.adults ?? 1,
  children: values.children ?? 0,
  children_details:
    Number(values.children) > 0
      ? (values.childrenDetails || []).map((c) => ({ age: Number(c.age) }))
      : [],
  infants: 0,
  lead_source_id: values.leadSourceId || null,
  service_required: values.serviceRequired || null,
  vacation_type: values.vacationType || null,
  requirements: values.requirements || null,
  destination_id: values.destinationId || null,
  package_id: values.packageId || null,
  status: values.status || undefined,
  assigned_to: values.assignedTo || null,
  lead_id: values.leadId || null,
  branch_id: values.branchId || null,
});

const toId = (v) => (v == null || v === '' ? '' : String(v));
const toDate = (v) => {
  if (!v) return '';
  const s = String(v);
  return s.length >= 10 ? s.slice(0, 10) : s;
};

const parseChildrenDetails = (row) => {
  const raw = row.children_details ?? row.childrenDetails ?? [];
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return Array.isArray(raw) ? raw : [];
};

export const mapEnquiryFromApi = (row) => {
  if (!row) return null;
  return {
    ...row,
    enquiryType: row.enquiry_type || row.enquiryType || 'client',
    customerName: row.customer_name || row.customerName || '',
    phone: row.phone || '',
    emergencyContactNumber:
      row.emergency_contact_number || row.emergencyContactNumber || '',
    email: row.email || '',
    countryId: toId(row.country_id ?? row.countryId),
    stateName: row.state_name || row.stateName || row.state?.name || '',
    cityName: row.city_name || row.cityName || row.city?.name || '',
    travelFrom: toDate(row.travel_from || row.travelFrom),
    travelTo: toDate(row.travel_to || row.travelTo),
    travelFromDestination: row.travel_from_destination || row.travelFromDestination || '',
    travelToDestination: row.travel_to_destination || row.travelToDestination || '',
    travelFromLat: row.travel_from_lat ?? row.travelFromLat ?? null,
    travelFromLng: row.travel_from_lng ?? row.travelFromLng ?? null,
    travelToLat: row.travel_to_lat ?? row.travelToLat ?? null,
    travelToLng: row.travel_to_lng ?? row.travelToLng ?? null,
    approxDistanceKm: row.approx_distance_km ?? row.approxDistanceKm ?? null,
    adults: row.adults ?? 1,
    children: row.children ?? 0,
    childrenDetails: parseChildrenDetails(row),
    infants: 0,
    leadSourceId: toId(row.lead_source_id ?? row.leadSourceId),
    serviceRequired: row.service_required || row.serviceRequired || '',
    vacationType: row.vacation_type || row.vacationType || '',
    requirements: row.requirements || '',
    status: row.status || 'open',
    destinationId: row.destination_id || row.destinationId || null,
    packageId: row.package_id || row.packageId || null,
    assignedTo: row.assigned_to || row.assignedTo || null,
    leadId: row.lead_id || row.leadId || null,
    branchId: row.branch_id || row.branchId || null,
  };
};
