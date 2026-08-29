import { useCallback, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Link,
  Rating,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import CloseIcon from '@mui/icons-material/Close';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/dataTable/DataTable';
import Loader from '../../components/common/Loader';
import SelectFilter from '../../components/common/SelectFilter';
import { feedbackService } from '../../services/common.service';
import { normalizeListResponse } from '../../utils/apiParams';
import { formatDate, formatDateTime, truncate, formatRouteLabel } from '../../utils/formatters';
import { RATING_FILTERS } from '../../utils/constants';
import OwnershipTag from '../../components/common/OwnershipTag';
import ContactNumberDisplay from '../../components/common/ContactNumberDisplay';

const ACCENT = '#db2777';

const RATING_META = [
  {
    key: 'transportation_rating',
    label: 'Transportation',
    icon: DirectionsCarFilledIcon,
    color: '#0284c7',
    bg: '#e0f2fe',
  },
  {
    key: 'overall_rating',
    label: 'Overall Trip Experience',
    icon: StarRoundedIcon,
    color: '#d97706',
    bg: '#fef3c7',
  },
  {
    key: 'customer_support_rating',
    label: 'Customer Support',
    icon: SupportAgentIcon,
    color: '#7c3aed',
    bg: '#ede9fe',
  },
  {
    key: 'staff_behaviour_rating',
    label: 'Staff Behaviour',
    icon: FavoriteRoundedIcon,
    color: '#db2777',
    bg: '#fce7f3',
  },
];

function DetailItem({ label, value }) {
  return (
    <Box>
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          color: 'text.secondary',
          fontWeight: 700,
          letterSpacing: 0.3,
          textTransform: 'uppercase',
          mb: 0.35,
        }}
      >
        {label}
      </Typography>
      <Typography fontWeight={700} color="#0f172a" sx={{ wordBreak: 'break-word' }}>
        {value || '—'}
      </Typography>
    </Box>
  );
}

function RatingDetail({ meta, value }) {
  const Icon = meta.icon;
  return (
    <Stack
      direction="row"
      spacing={1.25}
      alignItems="center"
      sx={{
        p: 1.25,
        borderRadius: 2,
        bgcolor: meta.bg,
        border: `1px solid ${alpha(meta.color, 0.2)}`,
        height: '100%',
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.5,
          bgcolor: '#fff',
          display: 'grid',
          placeItems: 'center',
          color: meta.color,
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 18 }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" display="block">
          {meta.label}
        </Typography>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Rating
            value={Number(value) || 0}
            readOnly
            size="small"
            sx={{ color: meta.color, '& .MuiRating-iconFilled': { color: meta.color } }}
          />
          <Typography variant="body2" fontWeight={800} color={meta.color}>
            {value || '—'}/5
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
}

export default function FeedbackList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('submitted_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [ratingFilter, setRatingFilter] = useState('');
  const [viewRow, setViewRow] = useState(null);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['feedback', { page, perPage, search, sortBy, sortOrder, ratingFilter }],
    queryFn: async () => {
      const { data: res } = await feedbackService.list({
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
        ...(ratingFilter ? { rating: ratingFilter } : {}),
      });
      return normalizeListResponse(res);
    },
  });

  const rows = data?.rows || [];
  const total = data?.pagination?.total || 0;

  const handleSearch = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);

  const columns = useMemo(
    () => [
      {
        id: 'sno',
        name: 'S.No',
        width: '70px',
        cell: (_row, index) => (page - 1) * perPage + index + 1,
      },
      {
        id: 'enquiry',
        name: 'Enquiry',
        minWidth: '140px',
        cell: (row) => {
          const code = row.enquiry?.enquiry_code || '—';
          if (!row.enquiry_id || code === '—') {
            return (
              <Typography variant="body2" fontWeight={700}>
                {code}
              </Typography>
            );
          }
          return (
            <Link
              component={RouterLink}
              to={`/enquiry/view/${row.enquiry_id}`}
              underline="hover"
              fontWeight={700}
              variant="body2"
            >
              {code}
            </Link>
          );
        },
      },
      {
        id: 'customer_name',
        name: 'Customer',
        minWidth: '140px',
        sortable: true,
        sortField: 'customer_name',
        cell: (row) => (
          <Box>
            <Typography variant="body2" fontWeight={700}>
              {row.customer_name || row.enquiry?.customer_name || '—'}
            </Typography>
            {(row.phone || row.enquiry?.phone) && (
              <ContactNumberDisplay
                value={row.phone || row.enquiry?.phone}
                variant="whatsapp"
              />
            )}
          </Box>
        ),
      },
      {
        id: 'route',
        name: 'Trip Route',
        minWidth: '180px',
        grow: 1,
        cell: (row) => (
          <Typography variant="body2" fontWeight={600}>
            {formatRouteLabel(row.route_label)}
          </Typography>
        ),
      },
      {
        id: 'vehicle',
        name: 'Vehicle',
        minWidth: '150px',
        cell: (row) => (
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {row.vehicle_label || row.vehicle_name || '—'}
            </Typography>
            {(row.vehicle_label || row.vehicle_name) && (
              <Box sx={{ mt: 0.4 }}>
                <OwnershipTag type={row.vehicle_ownership} />
              </Box>
            )}
          </Box>
        ),
      },
      {
        id: 'driver',
        name: 'Driver',
        minWidth: '130px',
        cell: (row) => (
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {row.driver_name || '—'}
            </Typography>
            {row.driver_name && (
              <Box sx={{ mt: 0.4 }}>
                <OwnershipTag type={row.driver_type} />
              </Box>
            )}
          </Box>
        ),
      },
      {
        id: 'assigned_to',
        name: 'Assigned To',
        minWidth: '130px',
        cell: (row) => (
          <Typography variant="body2" fontWeight={600}>
            {row.assigned_to_name || '—'}
          </Typography>
        ),
      },
      {
        id: 'rating',
        name: 'Overall',
        width: '130px',
        sortable: true,
        sortField: 'rating',
        cell: (row) => (
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Rating
              value={Number(row.rating || row.overall_rating) || 0}
              readOnly
              size="small"
              sx={{ color: '#d97706' }}
            />
            <Typography variant="body2" fontWeight={800}>
              {row.rating || row.overall_rating || '—'}
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'submitted_at',
        name: 'Submitted',
        minWidth: '150px',
        sortable: true,
        sortField: 'submitted_at',
        cell: (row) => (
          <Typography variant="body2" fontWeight={600} sx={{ whiteSpace: 'nowrap' }}>
            {formatDateTime(row.submitted_at || row.created_at)}
          </Typography>
        ),
      },
      {
        id: 'comments',
        name: 'Comments',
        minWidth: '160px',
        grow: 1,
        cell: (row) => (
          <Typography variant="body2" color="text.secondary">
            {truncate(row.comments || '—', 60)}
          </Typography>
        ),
      },
      {
        id: 'actions',
        name: 'Action',
        width: '100px',
        omitExport: true,
        cell: (row) => (
          <Tooltip title="View full feedback">
            <IconButton
              size="small"
              onClick={() => setViewRow(row)}
              sx={{
                color: ACCENT,
                bgcolor: alpha(ACCENT, 0.08),
                '&:hover': { bgcolor: alpha(ACCENT, 0.16) },
              }}
            >
              <VisibilityOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [page, perPage]
  );

  const filters = (
    <SelectFilter
      label="Overall Rating"
      value={ratingFilter}
      onChange={(v) => {
        setRatingFilter(v);
        setPage(1);
      }}
      options={RATING_FILTERS}
      minWidth={170}
    />
  );

  if (isLoading && !data) return <Loader />;

  const tripDates =
    viewRow?.trip?.start_date || viewRow?.enquiry?.travel_from
      ? `${formatDate(viewRow?.trip?.start_date || viewRow?.enquiry?.travel_from)}${
          (viewRow?.trip?.end_date || viewRow?.enquiry?.travel_to) &&
          (viewRow?.trip?.end_date || viewRow?.enquiry?.travel_to) !==
            (viewRow?.trip?.start_date || viewRow?.enquiry?.travel_from)
            ? ` – ${formatDate(viewRow?.trip?.end_date || viewRow?.enquiry?.travel_to)}`
            : ''
        }`
      : '—';

  return (
    <Box>
      <PageHeader
        title="Feedback"
        subtitle="Customer trip reviews submitted from shared feedback links"
        extra={
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            disabled={isFetching}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Refresh
          </Button>
        }
      />

      <DataTable
        title="Customer Feedback"
        columns={columns}
        data={rows}
        totalRows={total}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={(n) => {
          setPerPage(n);
          setPage(1);
        }}
        searchValue={search}
        onSearch={handleSearch}
        onSort={(field, dir) => {
          setSortBy(field);
          setSortOrder(dir);
        }}
        tableKey="feedback-list"
        exportFilename="customer-feedback"
        paginationServer
        loading={isLoading || isFetching}
        filters={filters}
      />

      <Dialog
        open={!!viewRow}
        onClose={() => setViewRow(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, overflow: 'hidden' },
        }}
      >
        <DialogTitle
          sx={{
            pr: 6,
            background: `linear-gradient(135deg, ${alpha(ACCENT, 0.12)} 0%, ${alpha('#0f766e', 0.08)} 100%)`,
          }}
        >
          <Typography fontWeight={800} fontSize={20} color="#0f172a">
            Feedback Details
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {viewRow?.enquiry?.enquiry_code || 'Trip feedback'} ·{' '}
            {formatDateTime(viewRow?.submitted_at || viewRow?.created_at)}
          </Typography>
          <IconButton
            onClick={() => setViewRow(null)}
            sx={{ position: 'absolute', right: 12, top: 12 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2.5 }}>
          {viewRow && (
            <Stack spacing={2.5}>
              <Box
                sx={{
                  borderRadius: 2.5,
                  border: `1px solid ${alpha('#0f172a', 0.08)}`,
                  bgcolor: alpha('#0f172a', 0.02),
                  p: 2,
                }}
              >
                <Typography fontWeight={800} color="#0f172a" sx={{ mb: 1.5 }}>
                  Trip Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <DetailItem
                      label="Customer"
                      value={viewRow.customer_name || viewRow.enquiry?.customer_name}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <DetailItem
                      label="Enquiry"
                      value={viewRow.enquiry?.enquiry_code}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <DetailItem label="Assigned To" value={viewRow.assigned_to_name} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <DetailItem
                      label="Driver"
                      value={
                        viewRow.driver_name ? (
                          <>
                            {viewRow.driver_name}
                            <Box sx={{ mt: 0.5 }}>
                              <OwnershipTag type={viewRow.driver_type} />
                            </Box>
                          </>
                        ) : null
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <DetailItem
                      label="Vehicle"
                      value={
                        viewRow.vehicle_label || viewRow.vehicle_name ? (
                          <>
                            {viewRow.vehicle_label || viewRow.vehicle_name}
                            <Box sx={{ mt: 0.5 }}>
                              <OwnershipTag type={viewRow.vehicle_ownership} />
                            </Box>
                          </>
                        ) : null
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <DetailItem label="Travel Dates" value={tripDates} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <DetailItem label="Route" value={formatRouteLabel(viewRow.route_label)} />
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <Typography fontWeight={800} color="#0f172a" sx={{ mb: 1.25 }}>
                  Customer Ratings
                </Typography>
                <Grid container spacing={1.25}>
                  {RATING_META.map((meta) => (
                    <Grid key={meta.key} size={{ xs: 12, sm: 6 }}>
                      <RatingDetail meta={meta} value={viewRow[meta.key]} />
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Divider />

              <Box
                sx={{
                  borderRadius: 2.5,
                  border: `1px solid ${alpha('#0f766e', 0.2)}`,
                  bgcolor: alpha('#0f766e', 0.05),
                  p: 2,
                }}
              >
                <Typography fontWeight={800} color="#0f766e" sx={{ mb: 0.75 }}>
                  Customer Description
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight={600}
                  color={viewRow.comments ? '#0f172a' : 'text.secondary'}
                  sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                >
                  {viewRow.comments || 'No description provided'}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          {viewRow?.enquiry_id && (
            <Button
              variant="outlined"
              onClick={() => {
                const id = viewRow.enquiry_id;
                setViewRow(null);
                navigate(`/enquiry/view/${id}`);
              }}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              Open Enquiry
            </Button>
          )}
          <Button
            variant="contained"
            onClick={() => setViewRow(null)}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: ACCENT,
              '&:hover': { bgcolor: '#be185d' },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
