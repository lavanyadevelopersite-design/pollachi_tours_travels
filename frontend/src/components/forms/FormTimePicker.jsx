import { MenuItem, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';
import dayjs from 'dayjs';
import { toAmPmTime } from '../../utils/timeFormat';

/** 12-hour options: 12:00 AM … 11:45 PM */
const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, i) => {
  const totalMinutes = i * 15;
  const hour24 = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return dayjs().hour(hour24).minute(minute).format('h:mm A');
});

export default function FormTimePicker({ name, control, label = 'Event Time', disabled }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TimePickerField
          label={label}
          value={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          name={field.name}
          inputRef={field.ref}
          disabled={disabled}
          error={error}
        />
      )}
    />
  );
}

/** Standalone time field (h:mm A select) for forms without react-hook-form. */
export function TimePickerField({
  label = 'Time',
  value,
  onChange,
  onBlur,
  name,
  inputRef,
  disabled,
  error,
  fullWidth = true,
  optionalLabel = 'Optional',
}) {
  const normalized = toAmPmTime(value);
  const known = TIME_OPTIONS.includes(normalized) ? normalized : '';

  return (
    <TextField
      select
      label={label}
      fullWidth={fullWidth}
      size="small"
      disabled={disabled}
      error={!!error}
      helperText={typeof error === 'string' ? error : error?.message}
      value={known || normalized || ''}
      onChange={(e) => onChange?.(e.target.value)}
      onBlur={onBlur}
      name={name}
      inputRef={inputRef}
      sx={{ '& .MuiOutlinedInput-root': { minHeight: 52 } }}
    >
      <MenuItem value="">
        <em>{optionalLabel}</em>
      </MenuItem>
      {TIME_OPTIONS.map((t) => (
        <MenuItem key={t} value={t}>
          {t}
        </MenuItem>
      ))}
      {normalized && !TIME_OPTIONS.includes(normalized) ? (
        <MenuItem value={normalized}>{normalized}</MenuItem>
      ) : null}
    </TextField>
  );
}
