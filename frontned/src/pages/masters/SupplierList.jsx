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
import { useSuppliers, useSupplierMutation } from '../../hooks/queries/useMasters';
import { activeStatus } from '../../schemas/master.schema';

export default function SupplierList() {
  const navigate = useNavigate();
  const canCreate = usePermission('suppliers.create');
  const canEdit = usePermission('suppliers.edit');
  const canDelete = usePermission('suppliers.delete');
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

  const { data, isLoading } = useSuppliers(listParams);
  const { remove } = useSupplierMutation();
  const rows = data?.rows || [];
  const total = data?.pagination?.total || rows.length;

  const handleSearch = useCallback((v) => {
    setSearch(v);
    setPage(1);
  }, []);

  const columns = useMemo(
    () => [
      { id: 'name', name: 'Name', selector: (r) => r.name },
      { id: 'location', name: 'Location', selector: (r) => r.address || r.location || '—' },
      {
        id: 'phone',
        name: 'Phone',
        cell: (r) => <ContactNumberDisplay value={r.phone} variant="phone" typographyVariant="body2" />,
      },
      { id: 'status', name: 'Status', cell: (r) => <StatusBadge status={activeStatus(r)} /> },
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
                  onClick={() => navigate(`/masters/suppliers/edit/${row.id}`)}
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
        title="Vendor"
        subtitle="Manage vendors"
        actionLabel={canCreate ? 'Add Vendor' : undefined}
        actionPermission={canCreate}
        onAction={() => navigate('/masters/suppliers/create')}
      />
      <DataTable
        title="Vendor"
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
        onSort={(f, d) => {
          setSortBy(f);
          setSortOrder(d);
        }}
        tableKey="suppliers"
        exportFilename="suppliers"
        exportable={false}
        paginationServer
        loading={isLoading}
        filters={filters}
      />
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Vendor"
        message="Are you sure you want to delete this vendor?"
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
