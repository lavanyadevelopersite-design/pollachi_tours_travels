import { FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';

export const ACTIVE_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export function applyIsActiveParam(params, statusFilter) {
  if (statusFilter === 'active') params.is_active = true;
  if (statusFilter === 'inactive') params.is_active = false;
  return params;
}

export function FilterGroup({ children }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
      {children}
    </Stack>
  );
}

export default function SelectFilter({
  id,
  label,
  value,
  onChange,
  options = [],
  minWidth = 160,
  allLabel = 'All',
  fullWidth = false,
}) {
  const labelId = id || `${String(label).replace(/\s+/g, '-').toLowerCase()}-filter`;
  return (
    <FormControl size="small" fullWidth={fullWidth} sx={{ minWidth, flexShrink: 0 }}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        value={value ?? ''}
        label={label}
        onChange={(e) => onChange(e.target.value)}
      >
        <MenuItem value="">{allLabel}</MenuItem>
        {options.map((opt) => {
          const val = typeof opt === 'string' ? opt : opt.value;
          const text = typeof opt === 'string' ? opt : opt.label;
          return (
            <MenuItem key={val} value={val}>
              {text}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}
