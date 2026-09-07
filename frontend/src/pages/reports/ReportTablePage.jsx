import { useCallback, useMemo, useState } from 'react';
import { Box, Grid } from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/dataTable/DataTable';
import StatCard from '../../components/common/StatCard';
import ReportFilters, { useReportDates } from './ReportFilters';

export default function ReportTablePage({
  title,
  subtitle,
  columns,
  useReport,
  extraFilters,
  extraFilterState,
  summaryCards,
  exportFilename,
  tableKey,
  defaultSortBy = 'created_at',
  showFullText = false,
}) {
  const { from, to, setFrom, setTo, appliedFrom, appliedTo, apply } = useReportDates();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState(defaultSortBy);
  const [sortOrder, setSortOrder] = useState('desc');

  const extraKey = JSON.stringify(extraFilterState || {});
  const params = useMemo(
    () => ({
      page,
      perPage,
      search,
      sortBy,
      sortOrder,
      from: appliedFrom,
      to: appliedTo,
      ...(extraFilterState || {}),
    }),
    [page, perPage, search, sortBy, sortOrder, appliedFrom, appliedTo, extraKey, extraFilterState]
  );

  const { data, isLoading } = useReport(params);
  const rows = data?.rows || [];
  const total = data?.pagination?.total || rows.length;

  const handleSearch = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleApply = () => {
    apply();
    setPage(1);
  };

  return (
    <Box>
      <PageHeader title={title} subtitle={subtitle} />
      <ReportFilters
        from={from}
        to={to}
        onFromChange={setFrom}
        onToChange={setTo}
        onApply={handleApply}
        extra={extraFilters}
      />
      {summaryCards?.(data?.summary, rows) ? (
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          {summaryCards(data?.summary, rows)}
        </Grid>
      ) : null}
      <DataTable
        columns={columns}
        data={rows}
        loading={isLoading}
        totalRows={total}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={(value) => {
          setPerPage(value);
          setPage(1);
        }}
        onSort={(field, order) => {
          setSortBy(field);
          setSortOrder(order);
        }}
        searchValue={search}
        onSearch={handleSearch}
        exportFilename={exportFilename || tableKey || 'report'}
        tableKey={tableKey}
        showFullText={showFullText}
      />
    </Box>
  );
}
