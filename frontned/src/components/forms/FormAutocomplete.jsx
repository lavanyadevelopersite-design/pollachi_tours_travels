import { Autocomplete, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';

export default function FormAutocomplete({
  name,
  control,
  label,
  options = [],
  getOptionLabel = (o) => o?.label || o?.name || String(o || ''),
  isOptionEqualToValue = (a, b) => a?.value === b?.value || a === b,
  multiple = false,
  disabled,
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          options={options}
          multiple={multiple}
          disabled={disabled}
          getOptionLabel={getOptionLabel}
          isOptionEqualToValue={isOptionEqualToValue}
          value={
            multiple
              ? options.filter((o) => (field.value || []).includes(o.value ?? o.id))
              : options.find((o) => (o.value ?? o.id) === field.value) || null
          }
          onChange={(_, val) => {
            if (multiple) {
              field.onChange((val || []).map((v) => v.value ?? v.id));
            } else {
              field.onChange(val?.value ?? val?.id ?? null);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              error={!!error}
              helperText={error?.message}
              size="small"
            />
          )}
        />
      )}
    />
  );
}
