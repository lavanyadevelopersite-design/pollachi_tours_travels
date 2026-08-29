import { IconButton, Tooltip } from '@mui/material';
import { colors } from '../../theme/palette';

/** Consistent action icon colors used across all tables/pages */
export const ACTION_ICON_COLORS = {
  view: { color: 'info' },
  preview: { sx: { color: colors.purple } },
  edit: { color: 'warning' },
  delete: { color: 'error' },
  confirm: { color: 'success' },
  convert: { color: 'success' },
  status: { color: 'primary' },
  documents: { color: 'primary' },
  download: { color: 'info' },
  assign: { sx: { color: colors.orange } },
};

/**
 * Colored action IconButton with tooltip.
 * @param {'view'|'preview'|'edit'|'delete'|'confirm'|'convert'|'status'|'documents'|'download'|'assign'} action
 */
export default function ActionIconButton({
  action = 'view',
  title,
  children,
  size = 'small',
  sx,
  ...props
}) {
  const style = ACTION_ICON_COLORS[action] || {};
  const button = (
    <IconButton
      size={size}
      color={style.color}
      sx={{ ...style.sx, ...sx }}
      {...props}
    >
      {children}
    </IconButton>
  );

  if (!title) return button;
  return <Tooltip title={title}>{button}</Tooltip>;
}
