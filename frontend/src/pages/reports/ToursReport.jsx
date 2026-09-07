import { useCallback, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Chip,
  Grid,
  Link,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/dataTable/DataTable';
import { useToursReport } from '../../hooks/queries/useReports';

const SCOPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
];

const SUMMARY_CARDS = [
  { key: 'total', title: 'Total Tours', color: '#2563eb', end: '#60a5fa' },
  { key: 'completed', title: 'Completed Tours', color: '#16a34a', end: '#4ade80' },
  { key: 'upcoming', title: 'Upcoming Tours', color: '#ea580c', end: '#fdba74' },
];

const filterFieldSx = {
  minWidth: 170,
  '& .MuiOutlinedInput-root': {
    bgcolor: '#f3f4f6',
    borderRadius: 1.5,
  },
};

export default function ToursReport() {
  const [from, setFrom] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [to, setTo] = useState(dayjs().add(2, 'month').format('YYYY-MM-DD'));
  const [appliedFrom, setAppliedFrom] = useState(from);
  const [appliedTo, setAppliedTo] = useState(to);
  const [name, setName] = useState('');
  const [scope, setScope] = useState('all');
  const [appliedName, setAppliedName] = useState('');
  const [appliedScope, setAppliedScope] = useState('all');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('travel_from');
  const [sortOrder, setSortOrder] = useState('asc');

  const params = useMemo(
    () => ({
      page,
      perPage,
      search: appliedName,
      sortBy,
      sortOrder,
      from: appliedFrom,
      to: appliedTo,
      scope: appliedScope,
    }),
    [page, perPage, appliedName, sortBy, sortOrder, appliedFrom, appliedTo, appliedScope]
  );

  const { data, isLoading } = useToursReport(params);
  const rows = data?.rows || [];
  const total = data?.pagination?.total || 0;
  const summary = data?.summary || { total: 0, completed: 0, upcoming: 0 };

  const handleApply = () => {
    setAppliedFrom(from);
    setAppliedTo(to);
    setAppliedName(name);
    setAppliedScope(scope);
    setPage(1);
  };

  const handleSort = useCallback((field, order) => {
    setSortBy(field);
    setSortOrder(order);
  }, []);

  const columns = useMemo(
    () => [
      {
        id: 'query_id',
        name: 'Query ID',
        selector: (r) => r.query_id || '—',
        sortable: true,
        sortField: 'query_id',
        cell: (r) => (
          <Link component={RouterLink} to={`/enquiry/view/${r.id}`} underline="hover" fontWeight={700}>
            {r.query_id || '—'}
          </Link>
        ),
        grow: 1,
      },
      {
        id: 'package_name',
        name: 'Package',
        selector: (r) => r.package_name || '—',
        sortable: true,
        sortField: 'package_name',
        grow: 1,
      },
      {
        id: 'client',
        name: 'Client',
        selector: (r) => r.client || '—',
        sortable: true,
        sortField: 'client',
        grow: 1,
      },
      {
        id: 'status',
        name: 'Status',
        sortable: true,
        sortField: 'status',
        cell: (r) => (
          <Chip
            size="small"
            label={r.status || '—'}
            sx={{
              fontWeight: 700,
              color: '#fff',
              bgcolor: r.status_color || '#90a4ae',
            }}
          />
        ),
      },
      {
        id: 'assigned',
        name: 'Assigned',
        selector: (r) => r.assigned || '—',
        sortable: true,
        sortField: 'assigned',
        grow: 1,
      },
    ],
    []
  );

  return (
    <Box>
      <PageHeader title="Tours" subtitle="Tours in the selected travel period" />
      <Card sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3, boxShadow: '0 10px 28px rgba(21,34,56,0.06)' }}>
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ mb: 2.5 }}
        >
          <TextField
            type="date"
            size="small"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={filterFieldSx}
          />
          <TextField
            type="date"
            size="small"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: from || undefined }}
            sx={filterFieldSx}
          />
          <TextField
            size="small"
            placeholder="Search by name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleApply();
            }}
            sx={{ ...filterFieldSx, minWidth: 200, flex: 1 }}
          />
          <TextField
            select
            size="small"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            sx={{ ...filterFieldSx, minWidth: 140 }}
          >
            {SCOPE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="outlined"
            startIcon={<SearchIcon />}
            onClick={handleApply}
            sx={{
              height: 40,
              px: 2.5,
              borderRadius: 1.5,
              fontWeight: 700,
              textTransform: 'none',
              color: '#0d9488',
              borderColor: '#0d9488',
              bgcolor: '#fff',
              '&:hover': {
                borderColor: '#0f766e',
                bgcolor: 'rgba(13,148,136,0.06)',
              },
            }}
          >
            Search
          </Button>
        </Stack>

        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          {SUMMARY_CARDS.map((card) => (
            <Grid key={card.key} size={{ xs: 12, sm: 4 }}>
              <Box
                sx={{
                  borderRadius: 2.5,
                  px: 3,
                  py: 2.25,
                  color: '#fff',
                  background: `linear-gradient(90deg, ${card.color} 0%, ${card.end} 100%)`,
                  boxShadow: `0 10px 20px ${card.color}33`,
                }}
              >
                <Typography variant="h4" fontWeight={800} lineHeight={1.1}>
                  {summary[card.key] ?? 0}
                </Typography>
                <Typography mt={0.75} fontWeight={600} sx={{ opacity: 0.95 }}>
                  {card.title}
                </Typography>
                {card.key === 'upcoming' ? (
                  <Typography fontSize={12} fontWeight={600} sx={{ opacity: 0.85, mt: 0.25 }}>
                    Next 7 days
                  </Typography>
                ) : null}
              </Box>
            </Grid>
          ))}
        </Grid>

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
          onSort={handleSort}
          searchable={false}
          exportFilename="tours-report"
          tableKey="report-tours"
          emptyTitle="Nothing Found"
          headerBackground="#e5e7eb"
          headerColor="#111827"
        />
      </Card>
    </Box>
  );
}
