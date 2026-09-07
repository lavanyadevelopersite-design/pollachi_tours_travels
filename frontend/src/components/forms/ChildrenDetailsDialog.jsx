import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';

export default function ChildrenDetailsDialog({
  open,
  count,
  initialDetails = [],
  onSave,
  onClose,
}) {
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (!open || count <= 0) return;
    const next = Array.from({ length: count }, (_, i) => {
      const prev = initialDetails[i];
      return {
        age: prev?.age != null && prev?.age !== '' ? String(prev.age) : '',
      };
    });
    setRows(next);
    setErrors([]);
  }, [open, count, initialDetails]);

  const updateAge = (index, value) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, age: value } : row)));
    setErrors((prev) => {
      if (!prev[index]) return prev;
      const next = [...prev];
      next[index] = undefined;
      return next;
    });
  };

  const handleSave = () => {
    const nextErrors = rows.map((row) => {
      const ageNum = Number(row.age);
      if (row.age === '' || row.age == null) return 'Age is required';
      if (!Number.isFinite(ageNum) || ageNum < 0 || ageNum > 17 || !Number.isInteger(ageNum)) {
        return 'Enter age 0-17';
      }
      return undefined;
    });

    if (nextErrors.some(Boolean)) {
      setErrors(nextErrors);
      return;
    }

    onSave(rows.map((row) => ({ age: Number(row.age) })));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle fontWeight={600}>Children Details</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter age for each child ({count} {count === 1 ? 'child' : 'children'}).
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {rows.map((row, index) => (
            <TextField
              key={index}
              label={`Children ${index + 1} Age *`}
              type="number"
              value={row.age}
              onChange={(e) => updateAge(index, e.target.value)}
              fullWidth
              size="small"
              error={!!errors[index]}
              helperText={errors[index]}
              inputProps={{ min: 0, max: 17 }}
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
