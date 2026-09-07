import { useEffect, useMemo, useState } from 'react';
import { Autocomplete, Box, CircularProgress, InputAdornment, TextField, Typography } from '@mui/material';
import { Controller } from 'react-hook-form';
import enquiryService from '../../services/enquiry.service';

const storedValueFromPlace = (place, valueFrom) => {
  if (place == null) return '';
  if (typeof place === 'string') return place;
  if (valueFrom === 'name') return place.name || place.label || '';
  return place.label || place.name || '';
};

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
  placeType,
  searchContext = '',
  valueFrom = 'label',
  onPicked,
  placeholder,
  startIcon,
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
        const query = [inputValue.trim(), searchContext].filter(Boolean).join(' ');
        const { data } = await enquiryService.publicPlaces(query, placeType);
        setOptions(data?.data || []);
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [inputValue, publicApi, placeType, searchContext]);

  const memoOptions = useMemo(() => options, [options]);
  const showPlaceDetail = Boolean(placeType);

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
            getOptionLabel={(o) => storedValueFromPlace(o, valueFrom) || (typeof o === 'string' ? o : o?.label || '')}
            isOptionEqualToValue={(a, b) => {
              const aLabel = storedValueFromPlace(a, valueFrom);
              const bLabel = storedValueFromPlace(b, valueFrom);
              return aLabel === bLabel;
            }}
            filterOptions={(x) => x}
            inputValue={inputValue || fieldValue}
            onInputChange={(_, v, reason) => {
              if (reason === 'input') {
                setInputValue(v);
                field.onChange(v);
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
              const nextValue = storedValueFromPlace(val, valueFrom);
              setInputValue(nextValue);
              field.onChange(nextValue);
              if (latName) setValue?.(latName, val?.lat ?? null);
              if (lngName) setValue?.(lngName, val?.lng ?? null);
              onPicked?.(val);
            }}
            renderOption={
              showPlaceDetail
                ? (props, option) => {
                    const { key, ...liProps } = props;
                    const title = storedValueFromPlace(option, 'name') || option.label;
                    const detail = option.label && option.label !== title ? option.label : '';
                    return (
                      <Box component="li" key={key} {...liProps}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {title}
                          </Typography>
                          {detail ? (
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {detail}
                            </Typography>
                          ) : null}
                        </Box>
                      </Box>
                    );
                  }
                : undefined
            }
            renderInput={(params) => {
              const inputSlotProps = params.slotProps?.input ?? params.InputProps ?? {};

              return (
                <TextField
                  {...params}
                  label={label}
                  placeholder={placeholder}
                  error={!!error}
                  helperText={error?.message}
                  fullWidth
                  size="small"
                  slotProps={{
                    ...params.slotProps,
                    input: {
                      ...inputSlotProps,
                      startAdornment: startIcon ? (
                        <InputAdornment position="start">{startIcon}</InputAdornment>
                      ) : (
                        inputSlotProps.startAdornment
                      ),
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
