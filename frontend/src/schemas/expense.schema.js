import { z } from 'zod';

export const expenseSchema = z.object({
  category: z.string().trim().min(1, 'Category is required'),
  title: z.string().trim().min(1, 'Title is required'),
  amount: z.coerce.number({ invalid_type_error: 'Amount is required' }).positive('Amount must be greater than 0'),
  expenseDate: z.string().min(1, 'Expense date is required'),
  status: z.enum(['pending', 'approved', 'rejected', 'paid']).default('pending'),
  paymentMode: z.string().optional().or(z.literal('')),
  supplierId: z.union([z.string(), z.number()]).optional().nullable().or(z.literal('')),
  branchId: z.union([z.string(), z.number()]).optional().nullable().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export const mapExpenseToApi = (values) => ({
  category: values.category,
  title: values.title,
  amount: Number(values.amount) || 0,
  expense_date: values.expenseDate,
  status: values.status || 'pending',
  payment_mode: values.paymentMode || null,
  supplier_id: values.supplierId || null,
  branch_id: values.branchId || null,
  notes: values.notes || null,
});

export const mapExpenseFromApi = (row) => {
  if (!row) return null;
  return {
    category: row.category || '',
    title: row.title || '',
    amount: row.amount ?? '',
    expenseDate: row.expense_date || row.expenseDate || '',
    status: row.status || 'pending',
    paymentMode: row.payment_mode || '',
    supplierId: row.supplier_id || row.supplier?.id || '',
    branchId: row.branch_id || row.branch?.id || '',
    notes: row.notes || '',
  };
};
