import { useEffect, useMemo, useState } from 'react';
import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';
import enquiryService from '../../services/enquiry.service';

/**
 * Free place search via Nominatim (OSM) — no Google API key required.
 */
export default function LocationAutocomplete({
  name,
  control,
  label,
  latName,
  lngName,
  setValue,
  disabled,
  publicApi = true,
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
        const { data } = await enquiryService.publicPlaces(inputValue.trim());
        setOptions(data?.data || []);
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [inputValue, publicApi]);

  const memoOptions = useMemo(() => options, [options]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const fieldValue = field.value || '';

        return (
          <Autocomplete
            freeSolo
            options={memoOptions}
            loading={loading}
            disabled={disabled}
            value={fieldValue || null}
            getOptionLabel={(o) => (typeof o === 'string' ? o : o?.label || '')}
            isOptionEqualToValue={(a, b) => {
              const aLabel = typeof a === 'string' ? a : a?.label || '';
              const bLabel = typeof b === 'string' ? b : b?.label || '';
              return aLabel === bLabel;
            }}
            filterOptions={(x) => x}
            inputValue={inputValue || fieldValue}
            onInputChange={(_, v, reason) => {
              if (reason === 'input') {
                setInputValue(v);
                field.onChange(v);
                // Typed free text may not match prior coords — clear so distance can re-resolve
                if (latName) setValue?.(latName, null);
                if (lngName) setValue?.(lngName, null);
              }
              if (reason === 'clear') {
                setInputValue('');
                field.onChange('');
                if (latName) setValue?.(latName, null);
                if (lngName) setValue?.(lngName, null);
              }
              if (reason === 'reset') {
                setInputValue(v);
              }
            }}
            onChange={(_, val) => {
              if (val == null) {
                setInputValue('');
                field.onChange('');
                if (latName) setValue?.(latName, null);
                if (lngName) setValue?.(lngName, null);
                return;
              }
              if (typeof val === 'string') {
                setInputValue(val);
                field.onChange(val);
                return;
              }
              const nextLabel = val?.label || '';
              setInputValue(nextLabel);
              field.onChange(nextLabel);
              if (latName) setValue?.(latName, val?.lat ?? null);
              if (lngName) setValue?.(lngName, val?.lng ?? null);
            }}
            renderInput={(params) => {
              // MUI v6+ Autocomplete passes slotProps.input (InputProps may be undefined)
              const inputSlotProps = params.slotProps?.input ?? params.InputProps ?? {};

              return (
                <TextField
                  {...params}
                  label={label}
                  error={!!error}
                  helperText={error?.message}
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
                  sx={{
                    '& .MuiOutlinedInput-root': { minHeight: 52 },
                  }}
                />
              );
            }}
          />
        );
      }}
    />
  );
}
