import { z } from 'zod';

export const bookingSchema = z.object({
  quotationId: z.union([z.string(), z.number()]).optional().nullable(),
  enquiryId: z.union([z.string(), z.number()]).optional().nullable(),
  customerName: z.string().min(1, 'Customer name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(1, 'Phone is required'),
  packageId: z.union([z.string(), z.number()]).optional().nullable(),
  destinationId: z.union([z.string(), z.number()]).optional().nullable(),
  travelFrom: z.string().min(1, 'Travel start date is required'),
  travelTo: z.string().min(1, 'Travel end date is required'),
  adults: z.coerce.number().min(1).default(1),
  children: z.coerce.number().min(0).default(0),
  totalAmount: z.coerce.number().min(0, 'Total amount is required'),
  paidAmount: z.coerce.number().min(0).default(0),
  status: z.string().default('pending'),
  branchId: z.union([z.string(), z.number()]).optional().nullable(),
  notes: z.string().optional().or(z.literal('')),
});

export const mapBookingToApi = (values) => ({
  quotation_id: values.quotationId || null,
  enquiry_id: values.enquiryId || null,
  customer_name: values.customerName,
  email: values.email || null,
  phone: values.phone,
  package_id: values.packageId || null,
  destination_id: values.destinationId || null,
  travel_from: values.travelFrom,
  travel_to: values.travelTo,
  adults: values.adults ?? 1,
  children: values.children ?? 0,
  total_amount: values.totalAmount ?? 0,
  paid_amount: values.paidAmount ?? 0,
  status: values.status,
  branch_id: values.branchId || null,
  notes: values.notes || null,
});

export const mapBookingFromApi = (row) => {
  if (!row) return null;
  return {
    ...row,
    customerName: row.customer_name || row.customerName || '',
    quotationId: row.quotation_id || row.quotationId || null,
    enquiryId: row.enquiry_id || row.enquiryId || null,
    packageId: row.package_id || row.packageId || null,
    destinationId: row.destination_id || row.destinationId || null,
    travelFrom: row.travel_from || row.travelFrom || '',
    travelTo: row.travel_to || row.travelTo || '',
    totalAmount: Number(row.total_amount ?? row.totalAmount ?? 0),
    paidAmount: Number(row.paid_amount ?? row.paidAmount ?? 0),
    branchId: row.branch_id || row.branchId || null,
  };
};
