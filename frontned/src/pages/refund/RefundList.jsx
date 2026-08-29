import { useCallback, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/dataTable/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import SelectFilter from '../../components/common/SelectFilter';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { usePermission } from '../../hooks/usePermission';
import { REFUND_STATUSES } from '../../utils/constants';

const DEMO = [
  { id: 1, refundNo: 'REF-101', customerName: 'Karan Shah', bookingNo: 'BK-0880', amount: 5000, status: 'pending', date: '2026-07-17' },
  { id: 2, refundNo: 'REF-102', customerName: 'Meera Nair', bookingNo: 'BK-0875', amount: 12000, status: 'completed', date: '2026-07-14' },
];

export default function RefundList() {
  const canCreate = usePermission('refunds.create');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const handleSearch = useCallback((v) => { setSearch(v); setPage(1); }, []);

  const columns = useMemo(() => [
    { id: 'refundNo', name: 'Refund #', selector: (r) => r.refundNo },
    { id: 'customerName', name: 'Customer', selector: (r) => r.customerName },
    { id: 'bookingNo', name: 'Booking', selector: (r) => r.bookingNo },
    { id: 'amount', name: 'Amount', selector: (r) => formatCurrency(r.amount) },
    { id: 'date', name: 'Date', selector: (r) => formatDate(r.date) },
    { id: 'status', name: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
  ], []);

  return (
    <Box>
      <PageHeader title="Refunds" subtitle="Customer refund requests" actionLabel={canCreate ? 'Add Refund' : undefined} actionPermission={canCreate} onAction={() => {}} />
      <DataTable
        columns={columns}
        data={DEMO.filter((r) => {
          const matchesSearch = !search || JSON.stringify(r).toLowerCase().includes(search.toLowerCase());
          const matchesStatus = !statusFilter || r.status === statusFilter;
          return matchesSearch && matchesStatus;
        })}
        totalRows={DEMO.length}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
        searchValue={search}
        onSearch={handleSearch}
        tableKey="refunds"
        exportFilename="refunds"
        paginationServer={false}
        filters={
          <SelectFilter
            label="Status"
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
            options={REFUND_STATUSES}
          />
        }
      />
    </Box>
  );
}
