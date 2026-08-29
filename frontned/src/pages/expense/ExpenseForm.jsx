import { Grid } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import FormPageLayout from '../../components/forms/layout/FormPageLayout';
import FormSection from '../../components/forms/layout/FormSection';
import FormGrid from '../../components/forms/layout/FormGrid';
import FormTextField from '../../components/forms/FormTextField';
import FormSelect from '../../components/forms/FormSelect';
import FormDatePicker from '../../components/forms/FormDatePicker';
import { expenseSchema, mapExpenseFromApi, mapExpenseToApi } from '../../schemas/expense.schema';
import { useExpenseCategories } from '../../hooks/queries/useModules';
import {
  useBranches,
  usePaymentModes,
  useSuppliers,
} from '../../hooks/queries/useMasters';

const defaults = {
  category: '',
  title: '',
  amount: '',
  expenseDate: dayjs().format('YYYY-MM-DD'),
  status: 'pending',
  paymentMode: '',
  supplierId: '',
  branchId: '',
  notes: '',
};

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'paid', label: 'Paid' },
];

export default function ExpenseForm({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const isEdit = mode === 'edit';
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: defaults,
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useExpenseCategories();
  const { data: modesData } = usePaymentModes({ page: 1, perPage: 100, sortBy: 'name', sortOrder: 'asc' });
  const { data: suppliersData } = useSuppliers({ page: 1, perPage: 100, sortBy: 'name', sortOrder: 'asc' });
  const { data: branchesData } = useBranches({ page: 1, perPage: 100, sortBy: 'name', sortOrder: 'asc' });

  const categoryOptions = useMemo(
    () =>
      (categoriesData || []).map((r) => ({
        value: r.name,
        label: r.name,
      })),
    [categoriesData]
  );

  const paymentModeOptions = useMemo(() => {
    const rows = modesData?.rows || [];
    return rows
      .filter((r) => r.is_active !== false && r.status !== 'inactive')
      .map((r) => ({ value: r.name, label: r.name }));
  }, [modesData]);

  const supplierOptions = useMemo(
    () =>
      (suppliersData?.rows || []).map((r) => ({
        value: r.id,
        label: r.name || r.code || r.id,
      })),
    [suppliersData]
  );

  const branchOptions = useMemo(
    () =>
      (branchesData?.rows || []).map((r) => ({
        value: r.id,
        label: r.name || r.code || r.id,
      })),
    [branchesData]
  );

  useEffect(() => {
    reset(initialData ? { ...defaults, ...mapExpenseFromApi(initialData) } : defaults);
  }, [initialData, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(mapExpenseToApi(values), initialData?.id);
  });

  return (
    <FormPageLayout
      title="Expense Management"
      subtitle={isEdit ? 'Update expense information' : 'Create a new expense'}
      sectionTitle={isEdit ? 'Edit Expense' : 'Create Expense'}
      onSubmit={submit}
      onCancel={onCancel}
      loading={loading}
      submitLabel={isEdit ? 'Update' : 'Save'}
    >
      <FormSection title="Expense Details">
        <FormGrid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="category"
              control={control}
              label="Category *"
              options={categoryOptions}
              loading={categoriesLoading}
              clearable={false}
              placeholder="Select category"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="title" control={control} label="Title *" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField name="amount" control={control} label="Amount *" type="number" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormDatePicker name="expenseDate" control={control} label="Expense Date *" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="status"
              control={control}
              label="Status"
              clearable={false}
              options={STATUS_OPTIONS}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            {paymentModeOptions.length ? (
              <FormSelect
                name="paymentMode"
                control={control}
                label="Payment Mode"
                options={paymentModeOptions}
              />
            ) : (
              <FormTextField name="paymentMode" control={control} label="Payment Mode" />
            )}
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="supplierId"
              control={control}
              label="Vendor"
              options={supplierOptions}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              name="branchId"
              control={control}
              label="Branch"
              options={branchOptions}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormTextField
              name="notes"
              control={control}
              label="Notes"
              multiline
              minRows={3}
            />
          </Grid>
        </FormGrid>
      </FormSection>
    </FormPageLayout>
  );
}
