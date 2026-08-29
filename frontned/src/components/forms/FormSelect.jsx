import { useEffect, useState } from 'react';
import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';

const normalizeOptionValue = (value) =>
  value === null || value === undefined || value === '' ? '' : String(value);

const findOptionMatch = (options, inputText) => {
  const text = inputText.trim().toLowerCase();
  if (!text) return null;

  const exact = options.find((opt) => String(opt.label).toLowerCase() === text);
  if (exact) return exact;

  const partial = options.filter((opt) => String(opt.label).toLowerCase().includes(text));
  return partial.length === 1 ? partial[0] : null;
};

function FormSelectField({
  field,
  error,
  label,
  options,
  disabled,
  loading,
  placeholder,
  clearable,
  rest,
}) {
  const selected =
    options.find((opt) => normalizeOptionValue(opt.value) === normalizeOptionValue(field.value)) ||
    null;
  const [inputValue, setInputValue] = useState(selected?.label ?? '');

  useEffect(() => {
    setInputValue(selected?.label ?? '');
  }, [selected?.label, selected?.value]);

  const commitOption = (option) => {
    const nextValue = normalizeOptionValue(option?.value);
    field.onChange(nextValue);
    setInputValue(option?.label ?? '');
  };

  const resolveInputSelection = () => {
    if (field.value) return;
    const match = findOptionMatch(options, inputValue);
    if (match) {
      commitOption(match);
      return;
    }
    if (inputValue.trim()) {
      setInputValue('');
    }
  };

  return (
    <Autocomplete
      {...rest}
      options={options}
      value={selected}
      inputValue={inputValue}
      loading={loading}
      disabled={disabled}
      disableClearable={!clearable}
      blurOnSelect
      getOptionLabel={(opt) => opt?.label ?? ''}
      isOptionEqualToValue={(a, b) => normalizeOptionValue(a?.value) === normalizeOptionValue(b?.value)}
      onInputChange={(_, newInputValue, reason) => {
        if (reason === 'reset') return;
        if (reason === 'clear') {
          setInputValue('');
          field.onChange('');
          return;
        }
        setInputValue(newInputValue);
      }}
      onChange={(_, newValue) => {
        if (!newValue) {
          field.onChange('');
          setInputValue('');
          return;
        }
        commitOption(newValue);
      }}
      onBlur={() => {
        resolveInputSelection();
        field.onBlur();
      }}
      noOptionsText="No options found"
      renderInput={(params) => {
        const inputSlotProps = params.slotProps?.input ?? {};

        return (
          <TextField
            {...params}
            label={label}
            placeholder={selected ? '' : placeholder}
            error={!!error}
            helperText={error?.message}
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
      slotProps={{
        popper: { sx: { zIndex: 1400 } },
      }}
      sx={{
        '& .MuiAutocomplete-inputRoot': { minHeight: 52 },
      }}
    />
  );
}

export default function FormSelect({
  name,
  control,
  label,
  options = [],
  disabled,
  loading = false,
  placeholder = 'Search...',
  clearable = true,
  ...rest
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormSelectField
          field={field}
          error={error}
          label={label}
          options={options}
          disabled={disabled}
          loading={loading}
          placeholder={placeholder}
          clearable={clearable}
          rest={rest}
        />
      )}
    />
  );
}
