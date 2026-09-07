import { Box, FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import SearchBar from './SearchBar';

export default function FilterBar({
  search,
  onSearch,
  searchPlaceholder = 'Search...',
  filters = [],
  filterValues = {},
  onFilterChange,
  children,
}) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={1.5}
      alignItems={{ xs: 'stretch', md: 'center' }}
      sx={{ mb: 2 }}
    >
      {onSearch && (
        <SearchBar value={search} onChange={onSearch} placeholder={searchPlaceholder} />
      )}
      <Box display="flex" flexWrap="wrap" gap={1.5} flex={1}>
        {filters.map((filter) => (
          <FormControl key={filter.key} size="small" sx={{ minWidth: 140 }}>
            <InputLabel>{filter.label}</InputLabel>
            <Select
              label={filter.label}
              value={filterValues[filter.key] ?? ''}
              onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {filter.options?.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}
        {children}
      </Box>
    </Stack>
  );
}
