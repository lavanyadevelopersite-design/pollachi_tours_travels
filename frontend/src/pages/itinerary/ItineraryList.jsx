import { useCallback, useMemo, useState } from 'react';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PreviewIcon from '@mui/icons-material/VisibilityOutlined';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/dataTable/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import StatusBadge from '../../components/common/StatusBadge';
import SelectFilter from '../../components/common/SelectFilter';
import { usePermission } from '../../hooks/usePermission';
import { useItineraries, useItineraryMutation } from '../../hooks/queries/useModules';
import { formatDate, mainCityName } from '../../utils/formatters';
import { resolveTripDates } from '../../utils/tripDates';
import { ITINERARY_STATUSES } from '../../utils/constants';

export default function ItineraryList() {
  const navigate = useNavigate();
  const canCreate = usePermission('itineraries.create');
  const canEdit = usePermission('itineraries.edit');
  const canDelete = usePermission('itineraries.delete');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const listParams = useMemo(() => {
    const params = { page, perPage, search, sortBy, sortOrder };
    if (statusFilter) params.status = statusFilter;
    return params;
  }, [page, perPage, search, sortBy, sortOrder, statusFilter]);

  const { data, isLoading } = useItineraries(listParams);
  const { remove, confirm } = useItineraryMutation();

  const rows = data?.rows || [];
  const total = data?.pagination?.total || rows.length;

  const handleSearch = useCallback((v) => {
    setSearch(v);
    setPage(1);
  }, []);

  const destinationLabel = (row) => {
    if (row.destinations?.length) {
      return row.destinations.map((d) => mainCityName(d.name) || d.name).filter(Boolean).join(', ');
    }
    return mainCityName(row.destination?.name || row.preferences?.destination) || '—';
  };

  const columns = useMemo(
    () => [
      { id: 'title', name: 'Itinerary Name', selector: (r) => r.title, sortable: true, grow: 1 },
      {
        id: 'destination',
        name: 'Destination',
        selector: (r) => destinationLabel(r),
        grow: 1,
      },
      {
        id: 'enquiry',
        name: 'Enquiry',
        selector: (r) => r.enquiry?.enquiry_code || '—',
        width: '120px',
      },
      {
        id: 'status',
        name: 'Status',
        width: '120px',
        cell: (r) => <StatusBadge status={r.status || 'draft'} />,
      },
      {
        id: 'dates',
        name: 'Travel Dates',
        selector: (r) => {
          const trip = resolveTripDates({ enquiry: r.enquiry, itinerary: r });
          return trip.from && trip.to
            ? `${formatDate(trip.from)} → ${formatDate(trip.to)}`
            : '—';
        },
        grow: 1,
      },
      {
        id: 'days',
        name: 'Duration',
        selector: (r) => `${r.days || 0}D / ${r.nights || 0}N`,
        width: '110px',
      },
      {
        id: 'actions',
        name: 'Actions',
        width: '180px',
        omitExport: true,
        cell: (row) => (
          <Box>
            <Tooltip title="Preview & Share"><IconButton size="small" sx={{ color: '#8b5cf6' }} onClick={() => navigate(`/itineraries/preview/${row.id}`)}>
                <PreviewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Planner"><IconButton size="small" color="info" onClick={() => navigate(`/itineraries/view/${row.id}`)}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {canEdit && (
              <Tooltip title="Edit"><IconButton
                  size="small" color="warning"
                  onClick={() => navigate(`/itineraries/generate?id=${row.id}`)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canEdit && row.status !== 'confirmed' && row.enquiry_id && (
              <Tooltip title="Confirm"><IconButton size="small" color="success" onClick={() => setConfirmId(row.id)}>
                  <CheckCircleIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteId(row.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      },
    ],
    [canEdit, canDelete, navigate]
  );

  const filters = (
    <SelectFilter
      label="Status"
      value={statusFilter}
      onChange={(v) => {
        setStatusFilter(v);
        setPage(1);
      }}
      options={ITINERARY_STATUSES}
    />
  );

  if (isLoading && !data) return <Loader />;

  return (
    <Box>
      <PageHeader
        title="Itineraries"
        subtitle="Premium travel planner itineraries"
        extra={
          canCreate ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/itineraries/generate')}
            >
              New Itinerary
            </Button>
          ) : null
        }
      />
      <DataTable
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
        tableKey="itineraries"
        exportFilename="itineraries"
        paginationServer
        loading={isLoading}
        filters={filters}
      />
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Itinerary"
        message="Are you sure you want to delete this itinerary?"
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          await remove.mutateAsync(deleteId);
          setDeleteId(null);
        }}
      />
      <ConfirmDialog
        open={!!confirmId}
        title="Confirm Itinerary"
        message="Mark this itinerary as confirmed for the client?"
        confirmLabel="Confirm"
        confirmColor="success"
        onCancel={() => setConfirmId(null)}
        onConfirm={async () => {
          await confirm.mutateAsync(confirmId);
          setConfirmId(null);
        }}
      />
    </Box>
  );
}
