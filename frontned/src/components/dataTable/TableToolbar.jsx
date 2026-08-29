import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import TableChartIcon from '@mui/icons-material/TableChart';
import SearchBar from '../common/SearchBar';

export default function TableToolbar({
  searchable,
  searchValue,
  onSearch,
  exportable,
  onExport,
  onColumnToggle,
  actions,
  filters,
}) {
  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 1.5,
        alignItems: { xs: 'stretch', md: 'center' },
        justifyContent: 'space-between',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        flex={1}
        flexWrap="nowrap"
        useFlexGap
        sx={{ minWidth: 0 }}
      >
        {searchable && onSearch && (
          <Box sx={{ flex: '1 1 220px', minWidth: 180, maxWidth: { sm: 320 } }}>
            <SearchBar value={searchValue} onChange={onSearch} placeholder="Search records..." />
          </Box>
        )}
        {filters && (
          <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{filters}</Box>
        )}
      </Stack>

      <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end">
        {actions}
        {exportable && (
          <>
            <Tooltip title="Export CSV">
              <IconButton
                size="small"
                onClick={() => onExport?.('csv')}
                sx={{
                  color: '#1976d2',
                  '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.08)' },
                }}
              >
                <FileDownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export Excel">
              <IconButton
                size="small"
                onClick={() => onExport?.('excel')}
                sx={{
                  color: '#217346',
                  '&:hover': { bgcolor: 'rgba(33, 115, 70, 0.08)' },
                }}
              >
                <TableChartIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
        <Tooltip title="Columns">
          <IconButton
            size="small"
            onClick={onColumnToggle}
            sx={{
              color: '#64748b',
              '&:hover': { bgcolor: 'rgba(100, 116, 139, 0.08)' },
            }}
          >
            <ViewColumnIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}
