import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

export default function DashboardRankTable({
  title,
  columns = [],
  rows = [],
  loading = false,
  maxHeight = 320,
  accent = '#4f46e5',
  icon: Icon,
  showTotal = false,
}) {
  const headerBg = `linear-gradient(135deg, ${accent} 0%, ${alpha(accent, 0.78)} 100%)`;
  const totals = showTotal
    ? columns.reduce((acc, col) => {
        if (col.id === 'name') {
          acc[col.id] = 'Total';
        } else {
          acc[col.id] = rows.reduce((sum, row) => sum + Number(row[col.id] || 0), 0);
        }
        return acc;
      }, {})
    : null;

  return (
    <Card
      sx={{
        height: '100%',
        overflow: 'hidden',
        borderRadius: 3,
        border: `1px solid ${alpha(accent, 0.22)}`,
        boxShadow: `0 10px 28px ${alpha(accent, 0.16)}`,
        bgcolor: '#fff',
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.35,
          display: 'flex',
          alignItems: 'center',
          gap: 1.1,
          background: headerBg,
          color: '#fff',
        }}
      >
        {Icon ? (
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              display: 'grid',
              placeItems: 'center',
              bgcolor: alpha('#fff', 0.18),
            }}
          >
            <Icon sx={{ fontSize: 18 }} />
          </Box>
        ) : null}
        <Typography variant="h6" fontWeight={800} fontSize="1.05rem" lineHeight={1.2}>
          {title}
        </Typography>
      </Box>

      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <TableContainer sx={{ maxHeight, overflowY: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    align={col.align || 'left'}
                    sx={{
                      fontWeight: 800,
                      fontSize: 12.5,
                      letterSpacing: 0.3,
                      textTransform: 'uppercase',
                      color: accent,
                      bgcolor: alpha(accent, 0.12),
                      borderBottom: `2px solid ${alpha(accent, 0.35)}`,
                      py: 1.1,
                    }}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <Typography variant="body2" color="text.secondary" py={2} textAlign="center">
                      Loading…
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : rows.length ? (
                rows.map((row, index) => (
                  <TableRow
                    key={row.id || `${row.name}-${index}`}
                    sx={{
                      bgcolor: index % 2 ? alpha(accent, 0.04) : '#fff',
                      '&:hover': { bgcolor: alpha(accent, 0.08) },
                      '& td': { borderBottom: `1px solid ${alpha(accent, 0.08)}`, py: 1, fontSize: 13.5 },
                    }}
                  >
                    {columns.map((col) => {
                      const isName = col.id === 'name';
                      const isConfirmed = col.id === 'confirmed';
                      const value = isName
                        ? `${index + 1}. ${row.name || '—'}`
                        : col.render
                          ? col.render(row)
                          : row[col.id] ?? 0;

                      return (
                        <TableCell
                          key={col.id}
                          align={col.align || 'left'}
                          sx={{
                            fontWeight: isName || isConfirmed ? 700 : 600,
                            color: isConfirmed && Number(row.confirmed) > 0 ? '#059669' : isName ? '#0f172a' : '#475569',
                          }}
                        >
                          {value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <Typography variant="body2" color="text.secondary" py={2} textAlign="center">
                      No records yet
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {showTotal && totals && rows.length ? (
                <TableRow
                  sx={{
                    bgcolor: alpha(accent, 0.1),
                    '& td': {
                      borderBottom: 'none',
                      py: 1.1,
                      fontSize: 13.5,
                      fontWeight: 800,
                      color: accent,
                    },
                  }}
                >
                  {columns.map((col) => (
                    <TableCell key={col.id} align={col.align || 'left'}>
                      {totals[col.id]}
                    </TableCell>
                  ))}
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
