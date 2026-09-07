import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/dataTable/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import SelectFilter, { FilterGroup } from '../../components/common/SelectFilter';
import { usePermission } from '../../hooks/usePermission';
import { useLeads, useLeadMutation } from '../../hooks/queries/useLeads';
import { formatDate, formatCurrency, mainCityName } from '../../utils/formatters';
import { LEAD_SOURCES, LEAD_STATUSES } from '../../utils/constants';
import ContactNumberDisplay from '../../components/common/ContactNumberDisplay';

export default function LeadList() {
  const navigate = useNavigate();
  const canCreate = usePermission('leads.create');
  const canEdit = usePermission('leads.edit');
  const canDelete = usePermission('leads.delete');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const listParams = useMemo(() => {
    const params = { page, perPage, search, sortBy, sortOrder };
    if (statusFilter) params.status = statusFilter;
    if (sourceFilter) params.source = sourceFilter;
    return params;
  }, [page, perPage, search, sortBy, sortOrder, statusFilter, sourceFilter]);

  const { data, isLoading } = useLeads(listParams);
  const { remove } = useLeadMutation();

  const rows = data?.rows || [];
  const total = data?.pagination?.total || rows.length;

  const handleSearch = useCallback((v) => {
    setSearch(v);
    setPage(1);
  }, []);

  const columns = useMemo(
    () => [
      {
        id: 'name',
        name: 'Name',
        selector: (r) =>
          [r.first_name, r.last_name].filter(Boolean).join(' ') || r.name || '—',
        sortable: true,
        sortField: 'first_name',
      },
      {
        id: 'phone',
        name: 'Phone',
        cell: (r) => <ContactNumberDisplay value={r.phone} variant="whatsapp" typographyVariant="body2" />,
      },
      { id: 'email', name: 'Email', selector: (r) => r.email, grow: 1 },
      {
        id: 'source',
        name: 'Source',
        cell: (r) => (
          <StatusBadge status={r.source} label={(r.source || '').replace('_', ' ')} />
        ),
      },
      {
        id: 'destination',
        name: 'Destination',
        selector: (r) =>
          mainCityName(r.destination_interest || r.destination) || '—',
      },
      {
        id: 'budget',
        name: 'Budget',
        selector: (r) => formatCurrency(r.budget),
        sortable: true,
        sortField: 'budget',
      },
      { id: 'status', name: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
      {
        id: 'createdAt',
        name: 'Created',
        selector: (r) => formatDate(r.created_at || r.createdAt),
        sortable: true,
        sortField: 'created_at',
      },
      {
        id: 'actions',
        name: 'Actions',
        width: '120px',
        omitExport: true,
        cell: (row) => (
          <Box>
            {canEdit && (
              <Tooltip title="Edit"><IconButton
                  size="small" color="warning"
                  onClick={() => navigate(`/leads/edit/${row.id}`)}
                >
                  <EditIcon fontSize="small" />
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
    <FilterGroup>
      <SelectFilter
        label="Source"
        value={sourceFilter}
        onChange={(v) => {
          setSourceFilter(v);
          setPage(1);
        }}
        options={LEAD_SOURCES}
      />
      <SelectFilter
        label="Status"
        value={statusFilter}
        onChange={(v) => {
          setStatusFilter(v);
          setPage(1);
        }}
        options={LEAD_STATUSES}
      />
    </FilterGroup>
  );

  if (isLoading && !data) return <Loader />;

  return (
    <Box>
      <PageHeader
        title="Leads"
        subtitle="Manage and track sales leads"
        actionLabel={canCreate ? 'Add Lead' : undefined}
        actionPermission={canCreate}
        onAction={() => navigate('/leads/create')}
      />
      <DataTable
        title="Leads"
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
        tableKey="leads"
        exportFilename="leads"
        paginationServer
        loading={isLoading}
        filters={filters}
      />
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Lead"
        message="Are you sure you want to delete this lead? This action cannot be undone."
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          await remove.mutateAsync(deleteId);
          setDeleteId(null);
        }}
        confirmLabel="Delete"
      />
    </Box>
  );
}
