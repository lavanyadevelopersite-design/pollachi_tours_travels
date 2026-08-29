import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/dataTable/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import ContactNumberDisplay from '../../components/common/ContactNumberDisplay';
import { usePermission } from '../../hooks/usePermission';
import { useGuides, useGuideMutation } from '../../hooks/queries/useMasters';
import { activeStatus } from '../../schemas/master.schema';
import { resolveMediaUrl } from '../../utils/constants';

export default function GuideList() {
  const navigate = useNavigate();
  const canCreate = usePermission('guides.create');
  const canEdit = usePermission('guides.edit');
  const canDelete = usePermission('guides.delete');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [deleteId, setDeleteId] = useState(null);

  const listParams = useMemo(() => {
    const params = { page, perPage, search, sortBy, sortOrder };
    if (statusFilter === 'active') params.is_active = true;
    if (statusFilter === 'inactive') params.is_active = false;
    return params;
  }, [page, perPage, search, sortBy, sortOrder, statusFilter]);

  const { data, isLoading } = useGuides(listParams);
  const { remove, updateStatus } = useGuideMutation();
  const rows = data?.rows || [];
  const total = data?.pagination?.total || rows.length;

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
        id: 'photo',
        name: 'Photo',
        width: '70px',
        cell: (r) => (
          <Avatar src={resolveMediaUrl(r.photo) || undefined} alt={r.full_name} sx={{ width: 36, height: 36 }}>
            {(r.full_name || '?').charAt(0)}
          </Avatar>
        ),
      },
      {
        id: 'code',
        name: 'Code',
        selector: (r) => r.code || '—',
        sortable: true,
        sortField: 'code',
      },
      {
        id: 'full_name',
        name: 'Guide Name',
        selector: (r) => r.full_name,
        sortable: true,
        sortField: 'full_name',
      },
      {
        id: 'phone',
        name: 'Phone',
        cell: (r) => <ContactNumberDisplay value={r.phone} variant="phone" typographyVariant="body2" />,
      },
      {
        id: 'whatsapp',
        name: 'WhatsApp',
        cell: (r) => <ContactNumberDisplay value={r.whatsapp} variant="whatsapp" typographyVariant="body2" />,
      },
      {
        id: 'languages',
        name: 'Languages',
        selector: (r) => r.languages || '—',
      },
      {
        id: 'availability_status',
        name: 'Availability',
        selector: (r) =>
          (r.availability_status || '—').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      },
      {
        id: 'status',
        name: 'Status',
        cell: (r) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StatusBadge status={activeStatus(r)} />
            {canEdit && (
              <Switch
                size="small"
                checked={r.is_active !== false}
                onChange={() =>
                  updateStatus.mutate({ id: r.id, is_active: !(r.is_active !== false) })
                }
              />
            )}
          </Box>
        ),
      },
      {
        id: 'actions',
        name: 'Actions',
        width: '150px',
        omitExport: true,
        cell: (row) => (
          <Box>
            <Tooltip title="Documents"><IconButton
                size="small"
                color="primary"
                onClick={() => navigate(`/masters/guides/documents/${row.id}`)}
              >
                <FolderOpenOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {canEdit && (
              <Tooltip title="Edit"><IconButton
                  size="small" color="warning"
                  onClick={() => navigate(`/masters/guides/edit/${row.id}`)}
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
    [canEdit, canDelete, navigate, page, perPage, updateStatus]
  );

  const filters = (
    <FormControl size="small" sx={{ minWidth: 160 }}>
      <InputLabel id="guide-status-filter">Status</InputLabel>
      <Select
        labelId="guide-status-filter"
        value={statusFilter}
        label="Status"
        onChange={(e) => {
          setStatusFilter(e.target.value);
          setPage(1);
        }}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="active">Active</MenuItem>
        <MenuItem value="inactive">Inactive</MenuItem>
      </Select>
    </FormControl>
  );

  if (isLoading && !data) return <Loader />;

  return (
    <Box>
      <PageHeader
        title="Guide Info"
        subtitle="Tour guides as contact sources for tourists during trips"
        actionLabel={canCreate ? 'Add Guide' : undefined}
        actionPermission={canCreate}
        onAction={() => navigate('/masters/guides/create')}
      />
      <DataTable
        title="Guides"
        columns={columns}
        data={rows}
        totalRows={total}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={(value) => {
          setPerPage(value);
          setPage(1);
        }}
        searchValue={search}
        onSearch={handleSearch}
        onSort={(field, direction) => {
          setSortBy(field);
          setSortOrder(direction);
        }}
        tableKey="guides"
        exportFilename="guides"
        exportable={false}
        paginationServer
        loading={isLoading}
        filters={filters}
      />
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Guide"
        message="Are you sure you want to delete this guide?"
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
