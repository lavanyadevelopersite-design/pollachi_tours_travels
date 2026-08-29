import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/dataTable/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import { usePermission } from '../../hooks/usePermission';
import {
  useCities,
  useCityMutation,
  useCountries,
  useStates,
} from '../../hooks/queries/useMasters';
import { activeStatus } from '../../schemas/master.schema';

export default function CityList() {
  const navigate = useNavigate();
  const canCreate = usePermission('cities.create');
  const canEdit = usePermission('cities.edit');
  const canDelete = usePermission('cities.delete');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [deleteId, setDeleteId] = useState(null);

  const { data: countryData } = useCountries({ page: 1, perPage: 300, is_active: true });
  const { data: stateData } = useStates({
    page: 1,
    perPage: 500,
    is_active: true,
    ...(countryFilter ? { country_id: countryFilter } : {}),
  });

  const listParams = useMemo(() => {
    const params = { page, perPage, search, sortBy, sortOrder };
    if (statusFilter === 'active') params.is_active = true;
    if (statusFilter === 'inactive') params.is_active = false;
    if (countryFilter) params.country_id = countryFilter;
    if (stateFilter) params.state_id = stateFilter;
    return params;
  }, [page, perPage, search, sortBy, sortOrder, statusFilter, countryFilter, stateFilter]);

  const { data, isLoading } = useCities(listParams);
  const { remove, updateStatus } = useCityMutation();
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
      { id: 'country', name: 'Country', selector: (r) => r.country?.name || '—' },
      { id: 'state', name: 'State', selector: (r) => r.state?.name || '—' },
      { id: 'name', name: 'City Name', selector: (r) => r.name, sortable: true, sortField: 'name' },
      { id: 'code', name: 'City Code', selector: (r) => r.code || '—' },
      { id: 'airport_code', name: 'Airport Code', selector: (r) => r.airport_code || '—' },
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
        width: '120px',
        omitExport: true,
        cell: (row) => (
          <Box>
            {canEdit && (
              <Tooltip title="Edit"><IconButton size="small" color="warning" onClick={() => navigate(`/masters/cities/edit/${row.id}`)}>
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
    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="city-country-filter">Country</InputLabel>
        <Select
          labelId="city-country-filter"
          value={countryFilter}
          label="Country"
          onChange={(e) => {
            setCountryFilter(e.target.value);
            setStateFilter('');
            setPage(1);
          }}
        >
          <MenuItem value="">All</MenuItem>
          {(countryData?.rows || []).map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="city-state-filter">State</InputLabel>
        <Select
          labelId="city-state-filter"
          value={stateFilter}
          label="State"
          onChange={(e) => {
            setStateFilter(e.target.value);
            setPage(1);
          }}
        >
          <MenuItem value="">All</MenuItem>
          {(stateData?.rows || []).map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {s.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel id="city-status-filter">Status</InputLabel>
        <Select
          labelId="city-status-filter"
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
    </Box>
  );

  if (isLoading && !data) return <Loader />;

  return (
    <Box>
      <PageHeader
        title="City"
        subtitle="Manage cities with country and state mapping"
        actionLabel={canCreate ? 'Add City' : undefined}
        actionPermission={canCreate}
        onAction={() => navigate('/masters/cities/create')}
      />
      <DataTable
        title="City"
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
        tableKey="cities"
        exportFilename="cities"
        exportable={false}
        paginationServer
        loading={isLoading}
        filters={filters}
      />
      <ConfirmDialog
        open={!!deleteId}
        title="Delete City"
        message="Are you sure you want to delete this city?"
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
