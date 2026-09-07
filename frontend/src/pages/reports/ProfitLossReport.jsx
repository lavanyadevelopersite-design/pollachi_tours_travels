import { useMemo } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PaymentsIcon from '@mui/icons-material/Payments';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/dataTable/DataTable';
import Loader from '../../components/common/Loader';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useProfitLossReport } from '../../hooks/queries/useReports';
import ReportFilters, { useReportDates } from './ReportFilters';

export default function ProfitLossReport() {
  const { from, to, setFrom, setTo, appliedFrom, appliedTo, apply } = useReportDates();
  const { data, isLoading } = useProfitLossReport({ from: appliedFrom, to: appliedTo });
  const summary = data?.summary || {};
  const profit = Number(summary.profit || 0);

  const dailyColumns = useMemo(
    () => [
      { id: 'date', name: 'Date', selector: (r) => formatDate(r.date), sortable: true },
      { id: 'income', name: 'Income', selector: (r) => formatCurrency(r.income), sortable: true },
      { id: 'expense', name: 'Expense', selector: (r) => formatCurrency(r.expense), sortable: true },
      {
        id: 'profit',
        name: 'Profit / Loss',
        selector: (r) => formatCurrency(r.profit),
        sortable: true,
      },
    ],
    []
  );

  const incomeColumns = useMemo(
    () => [
      { id: 'date', name: 'Date', selector: (r) => formatDate(r.date), sortable: true },
      { id: 'type', name: 'Type', selector: (r) => r.type || '—' },
      { id: 'reference', name: 'Reference', selector: (r) => r.reference || '—' },
      { id: 'customer', name: 'Customer', selector: (r) => r.customer || '—', grow: 1 },
      { id: 'payment_mode', name: 'Payment mode', selector: (r) => r.payment_mode || '—' },
      { id: 'amount', name: 'Amount', selector: (r) => formatCurrency(r.amount), sortable: true },
    ],
    []
  );

  const expenseColumns = useMemo(
    () => [
      { id: 'date', name: 'Date', selector: (r) => formatDate(r.date), sortable: true },
      { id: 'code', name: 'Expense #', selector: (r) => r.code || '—' },
      { id: 'title', name: 'Title', selector: (r) => r.title || '—', grow: 1 },
      { id: 'category', name: 'Category', selector: (r) => r.category || '—' },
      { id: 'amount', name: 'Amount', selector: (r) => formatCurrency(r.amount), sortable: true },
      { id: 'status', name: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
    ],
    []
  );

  const dailyRows = useMemo(() => (Array.isArray(data?.daily) ? data.daily : []), [data]);
  const incomeRows = useMemo(() => (Array.isArray(data?.income) ? data.income : []), [data]);
  const expenseRows = useMemo(
    () => (Array.isArray(data?.expenses) ? data.expenses : []),
    [data]
  );

  return (
    <Box>
      <PageHeader
        title="Profit and Loss Report"
        subtitle="Date-wise income, expenses, and profit for the selected period"
      />
      <ReportFilters from={from} to={to} onFromChange={setFrom} onToChange={setTo} onApply={apply} />

      {isLoading ? (
        <Loader message="Loading report..." />
      ) : (
        <>
          <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Enquiry collections"
                value={formatCurrency(summary.enquiry_collections || 0)}
                icon={<PaymentsIcon />}
                color="#0284c7"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Invoice collections"
                value={formatCurrency(summary.invoice_collections || 0)}
                icon={<PaymentsIcon />}
                color="#7c3aed"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Expenses"
                value={formatCurrency(summary.expenses || 0)}
                icon={<AccountBalanceWalletIcon />}
                color="#ea580c"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title={profit >= 0 ? 'Net profit' : 'Net loss'}
                value={formatCurrency(Math.abs(profit))}
                icon={profit >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                color={profit >= 0 ? '#059669' : '#dc2626'}
              />
            </Grid>
          </Grid>

          <Typography fontWeight={800} mb={1.25}>
            Date-wise summary
          </Typography>
          <Box sx={{ mb: 2.5 }}>
            <DataTable
              columns={dailyColumns}
              data={dailyRows}
              loading={false}
              paginationServer={false}
              sortServer={false}
              searchable={false}
              exportFilename="profit-loss-daily"
              tableKey="report-profit-loss-daily"
            />
          </Box>

          <Typography fontWeight={800} mb={1.25}>
            Income details
          </Typography>
          <Box sx={{ mb: 2.5 }}>
            <DataTable
              columns={incomeColumns}
              data={incomeRows}
              loading={false}
              paginationServer={false}
              sortServer={false}
              searchable={false}
              exportFilename="profit-loss-income"
              tableKey="report-profit-loss-income"
            />
          </Box>

          <Typography fontWeight={800} mb={1.25}>
            Expense details
          </Typography>
          <DataTable
            columns={expenseColumns}
            data={expenseRows}
            loading={false}
            paginationServer={false}
            sortServer={false}
            searchable={false}
            exportFilename="profit-loss-expenses"
            tableKey="report-profit-loss-expenses"
          />
        </>
      )}
    </Box>
  );
}
