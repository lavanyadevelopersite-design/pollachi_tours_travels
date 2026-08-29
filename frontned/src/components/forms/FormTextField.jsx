import { useState } from 'react';
import { TextField } from '@mui/material';
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
          label={label}
          type={resolvedType}
          multiline={multiline}
          rows={rows}
          disabled={disabled}
          placeholder={placeholder}
          error={!!error}
          helperText={error?.message || helperText}
          fullWidth
          slotProps={{
            ...slotProps,
            input: {
              ...InputProps,
              ...slotProps?.input,
              ...(isPasswordField ? { endAdornment: passwordAdornment } : {}),
            },
          }}
        />
      )}
    />
  );
}
