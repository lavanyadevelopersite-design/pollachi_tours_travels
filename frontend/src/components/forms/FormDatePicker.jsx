import { useRef, useState } from 'react';
import { IconButton, InputAdornment, Popover, TextField } from '@mui/material';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ClearIcon from '@mui/icons-material/Clear';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { Controller } from 'react-hook-form';
import dayjs from 'dayjs';

export default function FormDatePicker({
  name,
  control,
  label,
  disabled,
  minDate,
  maxDate,
  startIcon,
  placeholder,
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <DatePickerField
          label={label}
          value={field.value}
          onChange={field.onChange}
          disabled={disabled}
          error={error}
          minDate={minDate}
          maxDate={maxDate}
          startIcon={startIcon}
          placeholder={placeholder}
        />
      )}
    />
  );
}

/** Standalone date field (DD/MM/YYYY display) for forms without react-hook-form. */
export function DatePickerField({
  label,
  value,
  onChange,
  disabled,
  error,
  minDate,
  maxDate,
  fullWidth = true,
  required,
  startIcon,
  placeholder,
}) {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const parsed = value ? dayjs(value) : null;
  const displayValue = parsed?.isValid() ? parsed.format('DD/MM/YYYY') : '';

  const handleSelect = (newValue) => {
    onChange(newValue?.isValid() ? newValue.format('YYYY-MM-DD') : '');
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <>
      <TextField
        ref={anchorRef}
        label={label}
        value={displayValue}
        placeholder={placeholder || ''}
        fullWidth={fullWidth}
        size="small"
        disabled={disabled}
        required={required}
        error={!!error}
        helperText={typeof error === 'string' ? error : error?.message}
        onClick={() => !disabled && setOpen(true)}
        InputProps={{
          readOnly: true,
          startAdornment: startIcon ? (
            <InputAdornment position="start">{startIcon}</InputAdornment>
          ) : undefined,
          endAdornment: (
            <InputAdornment position="end">
              {displayValue && !disabled && (
                <IconButton size="small" onClick={handleClear} edge="end" aria-label="Clear date">
                  <ClearIcon fontSize="small" />
                </IconButton>
              )}
              <IconButton
                size="small"
                onClick={() => !disabled && setOpen(true)}
                edge="end"
                disabled={disabled}
                aria-label="Open calendar"
              >
                <CalendarTodayOutlinedIcon fontSize="small" color="action" />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          cursor: disabled ? 'default' : 'pointer',
          '& .MuiOutlinedInput-root': { minHeight: 52 },
          '& .MuiOutlinedInput-input': { cursor: disabled ? 'default' : 'pointer' },
        }}
      />
      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { mt: 0.5, borderRadius: 2, boxShadow: 4 } } }}
      >
        <DateCalendar
          value={parsed?.isValid() ? parsed : null}
          onChange={handleSelect}
          minDate={minDate}
          maxDate={maxDate}
        />
      </Popover>
    </>
  );
}
