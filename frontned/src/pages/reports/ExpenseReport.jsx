import { useMemo, useState } from 'react';
import { Grid } from '@mui/material';
import ReportTablePage from './ReportTablePage';
import StatCard from '../../components/common/StatCard';
import SelectFilter from '../../components/common/SelectFilter';
import StatusBadge from '../../components/common/StatusBadge';
import { useExpenseReport } from '../../hooks/queries/useReports';
import { useExpensesTypes } from '../../hooks/queries/useMasters';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { EXPENSE_STATUSES } from '../../utils/constants';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';

export default function ExpenseReport() {
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const { data: typesData } = useExpensesTypes({ page: 1, perPage: 200, sortBy: 'name', sortOrder: 'asc' });
  const categoryOptions = useMemo(
    () => (typesData?.rows || []).map((r) => ({ value: r.name, label: r.name })),
    [typesData]
  );

  const columns = useMemo(
    () => [
      { id: 'expense_code', name: 'Expense #', selector: (r) => r.expense_code || '—', sortable: true, sortField: 'expense_code' },
      { id: 'expense_date', name: 'Date', selector: (r) => formatDate(r.expense_date), sortable: true, sortField: 'expense_date' },
      { id: 'category', name: 'Category', selector: (r) => r.category || '—' },
      { id: 'title', name: 'Title', selector: (r) => r.title || '—', grow: 1 },
      { id: 'amount', name: 'Amount', selector: (r) => formatCurrency(r.amount), sortable: true, sortField: 'amount' },
      { id: 'status', name: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
    ],
    []
  );

  return (
    <ReportTablePage
      title="Expenses Report"
      subtitle="Expense entries for the selected period"
      columns={columns}
      useReport={useExpenseReport}
      extraFilterState={{ ...(category ? { category } : {}), ...(status ? { status } : {}) }}
      extraFilters={
        <>
          <SelectFilter label="Category" value={category} onChange={setCategory} options={categoryOptions} />
          <SelectFilter
            label="Status"
            value={status}
            onChange={setStatus}
            options={EXPENSE_STATUSES}
          />
        </>
      }
      summaryCards={(summary) => [
        <Grid key="count" size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Records" value={summary?.count ?? 0} icon={<ReceiptLongOutlinedIcon />} color="#0284c7" />
        </Grid>,
        <Grid key="total" size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total expenses"
            value={formatCurrency(summary?.total || 0)}
            icon={<AccountBalanceWalletOutlinedIcon />}
            color="#ea580c"
          />
        </Grid>,
      ]}
      exportFilename="expense-report"
      tableKey="report-expenses"
    />
  );
}
