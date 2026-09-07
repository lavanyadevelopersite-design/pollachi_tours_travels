import { useState } from 'react';
import { InputAdornment, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';
import { PasswordVisibilityToggle } from './PasswordTextField';

export default function FormTextField({
  name,
  control,
  label,
  type = 'text',
  multiline,
  rows,
  rules,
  disabled,
  placeholder,
  helperText,
  InputProps,
  slotProps,
  sanitize,
  startIcon,
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';
  const resolvedType = isPasswordField && showPassword ? 'text' : type;
  const passwordAdornment = isPasswordField ? (
    <PasswordVisibilityToggle
      show={showPassword}
      onToggle={() => setShowPassword((value) => !value)}
    />
  ) : slotProps?.input?.endAdornment;
  const startAdornment =
    startIcon != null ? (
      <InputAdornment position="start">{startIcon}</InputAdornment>
    ) : (
      slotProps?.input?.startAdornment || InputProps?.startAdornment
    );

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...rest}
          value={field.value ?? ''}
          onChange={(event) => {
            const next = sanitize ? sanitize(event.target.value) : event.target.value;
            field.onChange(next);
          }}
          label={label}
          type={resolvedType}
          multiline={multiline}
          rows={rows}
          disabled={disabled}
          placeholder={placeholder}
          error={!!error}
          helperText={error?.message || helperText}
          fullWidth
          InputProps={{
            ...InputProps,
            ...(isPasswordField ? { endAdornment: passwordAdornment } : {}),
          }}
          slotProps={{
            ...slotProps,
            input: {
              ...InputProps,
              ...slotProps?.input,
              ...(startAdornment ? { startAdornment } : {}),
              ...(isPasswordField ? { endAdornment: passwordAdornment } : {}),
            },
          }}
          sx={{
            ...(isPasswordField
              ? { '& input::-ms-reveal, & input::-ms-clear': { display: 'none' } }
              : {}),
            ...rest.sx,
          }}
        />
      )}
    />
  );
}
