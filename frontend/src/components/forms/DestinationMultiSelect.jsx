import { useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Controller } from 'react-hook-form';
import itineraryService from '../../services/itinerary.service';

/**
 * Async multi-select destination search with chip display and route preview.
 */
export default function DestinationMultiSelect({
  name,
  control,
  label = 'Destination',
  disabled,
}) {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!inputValue || inputValue.trim().length < 2) {
      setOptions([]);
      return undefined;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await itineraryService.searchPlaces(inputValue.trim());
        setOptions(data?.data || []);
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const memoOptions = useMemo(() => options, [options]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const selected = Array.isArray(field.value) ? field.value : [];

        return (
          <Box>
            <Autocomplete
              multiple
              filterSelectedOptions
              options={memoOptions}
              loading={loading}
              disabled={disabled}
              value={selected}
              inputValue={inputValue}
              filterOptions={(x) => x}
              getOptionLabel={(o) => o?.label || o?.name || ''}
              isOptionEqualToValue={(a, b) =>
                (a?.place_id && b?.place_id && a.place_id === b.place_id) ||
                (a?.name && b?.name && a.name === b.name)
              }
              onInputChange={(_, v, reason) => {
                if (reason === 'input') setInputValue(v);
                if (reason === 'clear') setInputValue('');
              }}
              onChange={(_, val) => {
                field.onChange(
                  (val || []).map((item) => ({
                    name: item.name || item.label,
                    label: item.label || item.name,
                    latitude: item.latitude ?? null,
                    longitude: item.longitude ?? null,
                    country: item.country ?? null,
                    state: item.state ?? null,
                    city: item.city ?? null,
                    place_id: item.place_id ?? null,
                  }))
                );
                setInputValue('');
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={`${option.place_id || option.name}-${index}`}
                    label={option.name}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(33,150,243,0.12)',
                      color: 'primary.dark',
                      fontWeight: 600,
                    }}
                  />
                ))
              }
              renderInput={(params) => {
                const inputSlotProps = params.slotProps?.input ?? params.InputProps ?? {};
                return (
                  <TextField
                    {...params}
                    label={label}
                    error={!!error}
                    helperText={error?.message}
                    placeholder="Search destinations..."
                    fullWidth
                    size="small"
                    slotProps={{
                      ...params.slotProps,
                      input: {
                        ...inputSlotProps,
                        endAdornment: (
                          <>
                            {loading ? <CircularProgress color="inherit" size={18} /> : null}
                            {inputSlotProps.endAdornment}
                          </>
                        ),
                      },
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { minHeight: 52 } }}
                  />
                );
              }}
            />

            {selected.length > 1 && (
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
                sx={{ mt: 1.5, px: 0.5 }}
              >
                {selected.map((d, i) => (
                  <Box key={`${d.name}-${i}`} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: 'secondary.main',
                        px: 1.25,
                        py: 0.5,
                        borderRadius: 2,
                        bgcolor: 'rgba(21,34,56,0.06)',
                      }}
                    >
                      {d.name}
                    </Typography>
                    {i < selected.length - 1 && (
                      <Typography color="text.disabled" sx={{ fontSize: 18, lineHeight: 1 }}>
                        ↓
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        );
      }}
    />
  );
}
