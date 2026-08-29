import { useState } from 'react';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export function PasswordVisibilityToggle({ show, onToggle }) {
  return (
    <InputAdornment position="end">
      <IconButton
        type="button"
        onClick={onToggle}
        edge="end"
        size="small"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>
  );
}

export function usePasswordVisibility(initial = false) {
  const [showPassword, setShowPassword] = useState(initial);
  const togglePasswordVisibility = () => setShowPassword((value) => !value);
  const passwordVisibilityAdornment = (
    <PasswordVisibilityToggle show={showPassword} onToggle={togglePasswordVisibility} />
  );

  return {
    showPassword,
    setShowPassword,
    togglePasswordVisibility,
    passwordVisibilityAdornment,
    passwordInputType: showPassword ? 'text' : 'password',
  };
}

export default function PasswordTextField({ slotProps, InputProps, ...rest }) {
  const { passwordInputType, passwordVisibilityAdornment } = usePasswordVisibility(false);

  return (
    <TextField
      {...rest}
      type={passwordInputType}
      slotProps={{
        ...slotProps,
        input: {
          ...InputProps,
          ...slotProps?.input,
          endAdornment: passwordVisibilityAdornment,
        },
      }}
    />
  );
}
