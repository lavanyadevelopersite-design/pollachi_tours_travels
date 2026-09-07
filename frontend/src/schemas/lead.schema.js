import { z } from 'zod';

export const leadSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional().or(z.literal('')),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  phone: z.string().min(1, 'Phone is required').min(10, 'Enter a valid phone'),
  source: z.string().min(1, 'Source is required'),
  destinationInterest: z.string().optional().or(z.literal('')),
  budget: z.coerce.number().optional().nullable(),
  travelDate: z.string().optional().or(z.literal('')),
  adults: z.coerce.number().min(1).default(1),
  children: z.coerce.number().min(0).default(0),
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']).default('new'),
  assignedTo: z.union([z.string(), z.number()]).optional().nullable(),
  notes: z.string().optional().or(z.literal('')),
  branchId: z.union([z.string(), z.number()]).optional().nullable(),
});

export const mapLeadToApi = (values) => ({
  first_name: values.firstName,
  last_name: values.lastName || null,
  email: values.email || null,
  phone: values.phone,
  source: values.source,
  status: values.status,
  destination_interest: values.destinationInterest || null,
  budget: values.budget ?? null,
  travel_date: values.travelDate || null,
  adults: values.adults ?? 1,
  children: values.children ?? 0,
  notes: values.notes || null,
  assigned_to: values.assignedTo || null,
  branch_id: values.branchId || null,
});

export const mapLeadFromApi = (row) => {
  if (!row) return null;
  return {
    ...row,
    firstName: row.first_name || row.firstName || '',
    lastName: row.last_name || row.lastName || '',
    destinationInterest: row.destination_interest || row.destinationInterest || '',
    travelDate: row.travel_date || row.travelDate || '',
    assignedTo: row.assigned_to || row.assignedTo || null,
    branchId: row.branch_id || row.branchId || null,
  };
};
