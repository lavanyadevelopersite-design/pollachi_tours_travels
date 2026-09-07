import { useState } from 'react';
import { Button, Stack, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import dayjs from 'dayjs';

export function useReportDates() {
  const [from, setFrom] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [to, setTo] = useState(dayjs().format('YYYY-MM-DD'));
  const [appliedFrom, setAppliedFrom] = useState(from);
  const [appliedTo, setAppliedTo] = useState(to);

  const apply = () => {
    setAppliedFrom(from);
    setAppliedTo(to);
  };

  return { from, to, setFrom, setTo, appliedFrom, appliedTo, apply };
}

export default function ReportFilters({
  from,
  to,
  onFromChange,
  onToChange,
  onApply,
  extra,
}) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 2.5 }}>
      <TextField
        type="date"
        size="small"
        label="From"
        value={from}
        onChange={(e) => onFromChange(e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ minWidth: 170 }}
      />
      <TextField
        type="date"
        size="small"
        label="To"
        value={to}
        onChange={(e) => onToChange(e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ minWidth: 170 }}
      />
      {extra}
      <Button
        variant="contained"
        startIcon={<SearchIcon />}
        onClick={onApply}
        sx={{
          height: 40,
          px: 2.75,
          borderRadius: 2,
          fontWeight: 700,
          letterSpacing: 0.2,
          textTransform: 'none',
          bgcolor: '#1e3a5f',
          boxShadow: '0 6px 16px rgba(30, 58, 95, 0.28)',
          '&:hover': {
            bgcolor: '#152a45',
            boxShadow: '0 8px 20px rgba(30, 58, 95, 0.36)',
          },
        }}
      >
        Search
      </Button>
    </Stack>
  );
}
