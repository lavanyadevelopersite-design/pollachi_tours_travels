import { FormControlLabel, FormHelperText, Switch } from '@mui/material';
import { Controller } from 'react-hook-form';

export default function FormSwitch({ name, control, label, disabled }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <>
          <FormControlLabel
            control={
              <Switch
                checked={!!field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                disabled={disabled}
                color="primary"
              />
            }
            label={label}
          />
          {error && <FormHelperText error>{error.message}</FormHelperText>}
        </>
      )}
    />
  );
}
