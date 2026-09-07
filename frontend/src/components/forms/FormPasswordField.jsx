import { useState } from 'react';
import { TextField } from '@mui/material';
import { Controller } from 'react-hook-form';
import { PasswordVisibilityToggle } from './PasswordTextField';
import { EXISTING_PASSWORD_MASK, isExistingPasswordMask } from '../../utils/passwordMask';

export default function FormPasswordField({
  name,
  control,
  label,
  rules,
  disabled,
  placeholder,
  helperText,
  autoComplete = 'off',
  InputProps,
  slotProps,
  ...rest
}) {
  const [show, setShow] = useState(false);
  const [savedHint, setSavedHint] = useState('');

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => {
        const existingMask = isExistingPasswordMask(field.value);
        const displayValue = existingMask ? EXISTING_PASSWORD_MASK : (field.value ?? '');
        const inputType = existingMask ? 'text' : show ? 'text' : 'password';
        const adornment = (
          <PasswordVisibilityToggle
            show={show && !existingMask}
            onToggle={() => {
              if (existingMask) {
                setShow(false);
                setSavedHint('Saved password cannot be shown. Type a new password to change it.');
                return;
              }
              setSavedHint('');
              setShow((value) => !value);
            }}
          />
        );

        return (
          <TextField
            {...field}
            {...rest}
            value={displayValue}
            onChange={(event) => {
              const next = event.target.value;
              setSavedHint('');
              if (existingMask) {
                const typed = next.replace(/[•*]/g, '');
                field.onChange(typed);
                return;
              }
              field.onChange(next);
            }}
            label={label}
            type={inputType}
            disabled={disabled}
            placeholder={placeholder}
            autoComplete="off"
            error={!!error}
            helperText={error?.message || savedHint || helperText}
            fullWidth
            InputProps={{
              ...InputProps,
              endAdornment: adornment,
            }}
            slotProps={{
              ...slotProps,
              input: {
                ...InputProps,
                ...slotProps?.input,
                endAdornment: adornment,
              },
              htmlInput: {
                ...slotProps?.htmlInput,
                autoComplete: 'off',
                name: existingMask ? `${name}-saved` : name,
              },
            }}
            sx={{
              '& input::-ms-reveal, & input::-ms-clear': { display: 'none' },
              ...(existingMask ? { '& input': { letterSpacing: '0.18em' } } : {}),
              ...rest.sx,
            }}
          />
        );
      }}
    />
  );
}
