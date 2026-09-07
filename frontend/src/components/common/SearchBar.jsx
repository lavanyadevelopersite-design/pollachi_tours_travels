import { InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useState } from 'react';
import { useDebounce } from '../../hooks/useDebounce';

export default function SearchBar({
  value: controlledValue,
  onChange,
  placeholder = 'Search...',
  debounceMs = 400,
  sx,
}) {
  const [local, setLocal] = useState(controlledValue ?? '');
  const debounced = useDebounce(local, debounceMs);

  useEffect(() => {
    if (controlledValue !== undefined && controlledValue !== local) {
      setLocal(controlledValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlledValue]);

  useEffect(() => {
    onChange?.(debounced);
  }, [debounced, onChange]);

  return (
    <TextField
      size="small"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      placeholder={placeholder}
      sx={{ minWidth: { xs: '100%', sm: 260 }, ...sx }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" color="action" />
          </InputAdornment>
        ),
      }}
    />
  );
}
