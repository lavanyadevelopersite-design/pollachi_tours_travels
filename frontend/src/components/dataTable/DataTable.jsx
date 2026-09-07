import { useEffect, useMemo, useState } from 'react';
import DataTableBase from 'react-data-table-component';
import { Box, Card, CircularProgress, Menu, MenuItem, Checkbox, ListItemText } from '@mui/material';
import TableToolbar from './TableToolbar';
import EmptyState from '../common/EmptyState';
import { exportToCsv, exportToExcel } from '../../utils/exportHelpers';
import { PAGINATION } from '../../utils/constants';
import { useTableColumnPreference } from '../../hooks/queries/useTableColumnPreference';

const DEFAULT_HEADER_BACKGROUND = '#1e3a5f';
const DEFAULT_HEADER_COLOR = '#ffffff';

const buildCustomStyles = ({ headerBackground, headerColor, showFullText } = {}) => ({
  table: {
    style: {
      backgroundColor: 'transparent',
      ...(showFullText ? { minWidth: 'max-content' } : {}),
    },
  },
  headRow: {
    style: {
      backgroundColor: headerBackground || DEFAULT_HEADER_BACKGROUND,
      borderBottom: '1px solid transparent',
      minHeight: '48px',
      position: 'sticky',
      top: 0,
      zIndex: 1,
    },
  },
  headCells: {
    style: {
      fontSize: '12px',
      fontWeight: 600,
      color: headerColor || DEFAULT_HEADER_COLOR,
      textTransform: 'capitalize',
      letterSpacing: '0.02em',
      paddingLeft: '16px',
      paddingRight: '16px',
      ...(showFullText
        ? { whiteSpace: 'nowrap', overflow: 'visible', textOverflow: 'clip' }
        : {}),
    },
  },
  cells: {
    style: {
      paddingLeft: '16px',
      paddingRight: '16px',
      whiteSpace: showFullText ? 'nowrap' : 'normal',
      overflow: 'visible',
      textOverflow: 'clip',
    },
  },
  rows: {
    style: {
      minHeight: '52px',
      fontSize: '13.5px',
      '&:not(:last-of-type)': {
        borderBottom: '1px solid #e3e8ef',
      },
      '&:hover': {
        backgroundColor: '#f4f7fa',
      },
    },
  },
  pagination: {
    style: {
      borderTop: '1px solid #e3e8ef',
      minHeight: '56px',
    },
  },
});

const columnId = (col) => col?.id || col?.name;

export default function DataTable({
  title,
  columns = [],
  data = [],
  loading = false,
  totalRows = 0,
  page = 1,
  perPage = PAGINATION.DEFAULT_PER_PAGE,
  onPageChange,
  onPerPageChange,
  onSort,
  sortServer = true,
  searchable = true,
  searchValue = '',
  onSearch,
  exportable = true,
  exportFilename = 'export',
  tableKey,
  selectableRows = false,
  onSelectedRowsChange,
  actions,
  filters,
  paginationServer = true,
  headerBackground,
  headerColor,
  showFullText = false,
  emptyTitle = 'No records found',
}) {
  const preferenceKey = tableKey || exportFilename || title || 'default';

  const [columnMenu, setColumnMenu] = useState(null);
  const [hiddenColumns, setHiddenColumns] = useState([]);

  const customStyles = useMemo(
    () => buildCustomStyles({ headerBackground, headerColor, showFullText }),
    [headerBackground, headerColor, showFullText]
  );

  const { preference, isFetched, saveHiddenColumns } = useTableColumnPreference(preferenceKey);

  // Sync from DB / React Query cache (optimistic saves update the cache immediately).
  useEffect(() => {
    if (!isFetched) return;
    const remote = Array.isArray(preference?.hidden_columns) ? preference.hidden_columns : [];
    setHiddenColumns(remote);
  }, [isFetched, preference, preferenceKey]);

  // Keep all named columns in the menu (including unchecked) so they can be re-enabled.
  const toggleableColumns = useMemo(
    () => columns.filter((col) => col.name && !col.omitColumnToggle),
    [columns]
  );

  const visibleColumns = useMemo(
    () => columns.filter((col) => !hiddenColumns.includes(columnId(col))),
    [columns, hiddenColumns]
  );

  const toggleColumn = (id) => {
    if (!id) return;
    setHiddenColumns((prev) => {
      const next = prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id];
      saveHiddenColumns(next);
      return next;
    });
  };

  const handleExport = (type) => {
    const exportCols = visibleColumns.filter((c) => c.name && !c.omitExport);
    if (type === 'csv') exportToCsv(data, exportCols, exportFilename);
    else if (type === 'excel') exportToExcel(data, exportCols, exportFilename);
  };

  return (
    <Card sx={{ overflow: 'hidden' }}>
      <TableToolbar
        searchable={searchable}
        searchValue={searchValue}
        onSearch={onSearch}
        exportable={exportable}
        onExport={handleExport}
        onColumnToggle={(e) => setColumnMenu(e.currentTarget)}
        actions={actions}
        filters={filters}
      />
      <Box
        sx={{
          overflowX: 'auto',
          width: '100%',
          ...(showFullText
            ? {
                '& .rdt_Table': { minWidth: 'max-content' },
                '& .rdt_TableCol, & .rdt_TableCell': {
                  overflow: 'visible !important',
                  textOverflow: 'clip !important',
                  whiteSpace: 'nowrap !important',
                },
              }
            : {}),
        }}
      >
        <DataTableBase
          columns={visibleColumns}
          data={data}
          progressPending={loading}
          progressComponent={
            <Box py={6} display="flex" justifyContent="center">
              <CircularProgress size={36} />
            </Box>
          }
          noDataComponent={<EmptyState title={emptyTitle} description="" />}
          pagination
          paginationServer={paginationServer}
          paginationTotalRows={totalRows}
          paginationDefaultPage={page}
          paginationPerPage={perPage}
          paginationRowsPerPageOptions={PAGINATION.PER_PAGE_OPTIONS}
          onChangePage={onPageChange}
          onChangeRowsPerPage={(newPerPage, newPage) => {
            onPerPageChange?.(newPerPage);
            onPageChange?.(newPage);
          }}
          sortServer={sortServer}
          onSort={(column, direction) => {
            onSort?.(column.sortField || column.id || column.name, direction);
          }}
          selectableRows={selectableRows}
          onSelectedRowsChange={onSelectedRowsChange}
          customStyles={customStyles}
          persistTableHead
          highlightOnHover
          responsive={!showFullText}
        />
      </Box>

      <Menu
        anchorEl={columnMenu}
        open={Boolean(columnMenu)}
        onClose={() => setColumnMenu(null)}
      >
        {toggleableColumns.map((col) => {
          const id = columnId(col);
          return (
            <MenuItem key={id} dense onClick={() => toggleColumn(id)}>
              <Checkbox checked={!hiddenColumns.includes(id)} size="small" />
              <ListItemText primary={col.name} />
            </MenuItem>
          );
        })}
      </Menu>
    </Card>
  );
}
