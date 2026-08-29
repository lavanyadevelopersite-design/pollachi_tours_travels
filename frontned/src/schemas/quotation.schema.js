import { z } from 'zod';

export const quotationSchema = z.object({
  enquiryId: z.union([z.string(), z.number()]).optional().nullable(),
  leadId: z.union([z.string(), z.number()]).optional().nullable(),
  customerName: z.string().min(1, 'Customer name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  packageId: z.union([z.string(), z.number()]).optional().nullable(),
  destinationId: z.union([z.string(), z.number()]).optional().nullable(),
  travelFrom: z.string().optional().or(z.literal('')),
  travelTo: z.string().optional().or(z.literal('')),
  adults: z.coerce.number().min(1).default(1),
  children: z.coerce.number().min(0).default(0),
  amount: z.coerce.number().min(0, 'Amount is required'),
  discount: z.coerce.number().min(0).default(0),
  tax: z.coerce.number().min(0).default(0),
  validUntil: z.string().optional().or(z.literal('')),
  status: z.string().default('draft'),
  notes: z.string().optional().or(z.literal('')),
});

export const mapQuotationToApi = (values) => {
  const subtotal = Number(values.amount) || 0;
  const discount = Number(values.discount) || 0;
  const taxAmount = Number(values.tax) || 0;
  return {
    enquiry_id: values.enquiryId || null,
    lead_id: values.leadId || null,
    customer_name: values.customerName,
    email: values.email || null,
    phone: values.phone || null,
    package_id: values.packageId || null,
    destination_id: values.destinationId || null,
    travel_from: values.travelFrom || null,
    travel_to: values.travelTo || null,
    adults: values.adults ?? 1,
    children: values.children ?? 0,
    subtotal,
    tax_amount: taxAmount,
    discount,
    total_amount: subtotal - discount + taxAmount,
    status: values.status,
    valid_until: values.validUntil || null,
    notes: values.notes || null,
  };
};

export const mapQuotationFromApi = (row) => {
  if (!row) return null;
  return {
    ...row,
    customerName: row.customer_name || row.customerName || '',
    enquiryId: row.enquiry_id || row.enquiryId || null,
    leadId: row.lead_id || row.leadId || null,
    packageId: row.package_id || row.packageId || null,
    destinationId: row.destination_id || row.destinationId || null,
    travelFrom: row.travel_from || row.travelFrom || '',
    travelTo: row.travel_to || row.travelTo || '',
    amount: Number(row.subtotal ?? row.amount ?? row.total_amount ?? 0),
    tax: Number(row.tax_amount ?? row.tax ?? 0),
    discount: Number(row.discount ?? 0),
    validUntil: row.valid_until || row.validUntil || '',
  };
};
