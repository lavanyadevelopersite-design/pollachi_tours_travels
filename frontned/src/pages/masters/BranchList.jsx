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
import ContactNumberDisplay from '../../components/common/ContactNumberDisplay';
import SelectFilter, { ACTIVE_STATUS_OPTIONS, applyIsActiveParam } from '../../components/common/SelectFilter';
import { usePermission } from '../../hooks/usePermission';
import { useBranches, useBranchMutation } from '../../hooks/queries/useMasters';
import { activeStatus } from '../../schemas/master.schema';

export default function BranchList() {
  const navigate = useNavigate();
  const canCreate = usePermission('branches.create');
  const canEdit = usePermission('branches.edit');
  const canDelete = usePermission('branches.delete');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const listParams = useMemo(() => {
    const params = { page, perPage, search, sortBy, sortOrder };
    applyIsActiveParam(params, statusFilter);
    return params;
  }, [page, perPage, search, sortBy, sortOrder, statusFilter]);

  const { data, isLoading } = useBranches(listParams);
  const { remove } = useBranchMutation();

  const rows = data?.rows || [];
  const total = data?.pagination?.total || rows.length;

  const handleSearch = useCallback((v) => {
    setSearch(v);
    setPage(1);
  }, []);

  const columns = useMemo(
    () => [
      { id: 'name', name: 'Name', selector: (r) => r.name },
      { id: 'code', name: 'Code', selector: (r) => r.code },
      { id: 'city', name: 'City', selector: (r) => r.city },
      {
        id: 'phone',
        name: 'Phone',
        cell: (r) => <ContactNumberDisplay value={r.phone} variant="phone" typographyVariant="body2" />,
      },
      {
        id: 'status',
        name: 'Status',
        cell: (r) => <StatusBadge status={activeStatus(r)} />,
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
                  onClick={() => navigate(`/masters/branches/edit/${row.id}`)}
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
    <SelectFilter
      label="Status"
      value={statusFilter}
      onChange={(v) => {
        setStatusFilter(v);
        setPage(1);
      }}
      options={ACTIVE_STATUS_OPTIONS}
    />
  );

  if (isLoading && !data) return <Loader />;

  return (
    <Box>
      <PageHeader
        title="Branches"
        subtitle="Manage branches"
        actionLabel={canCreate ? 'Add Branch' : undefined}
        actionPermission={canCreate}
        onAction={() => navigate('/masters/branches/create')}
      />
      <DataTable
        title="Branches"
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
        tableKey="branches"
        exportFilename="branches"
        exportable={false}
        paginationServer
        loading={isLoading}
        filters={filters}
      />
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Branch"
        message="Are you sure you want to delete this branch? This action cannot be undone."
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
