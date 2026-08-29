import { Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PhoneInTalkOutlinedIcon from '@mui/icons-material/PhoneInTalkOutlined';

export const CONTACT_VARIANTS = {
  whatsapp: {
    Icon: WhatsAppIcon,
    color: '#128C7E',
    bg: alpha('#128C7E', 0.1),
  },
  alt: {
    Icon: PhoneInTalkOutlinedIcon,
    color: '#ed6c02',
    bg: alpha('#ed6c02', 0.1),
  },
  phone: {
    Icon: PhoneInTalkOutlinedIcon,
    color: '#1565c0',
    bg: alpha('#1565c0', 0.1),
  },
};

export default function ContactNumberDisplay({
  value,
  variant = 'whatsapp',
  prefix = '',
  iconSize = 14,
  boxed = false,
  emptyText = '—',
  typographyVariant = 'caption',
  fontWeight = 600,
  color = 'text.secondary',
}) {
  const display = String(value ?? '').trim();
  const config = CONTACT_VARIANTS[variant] || CONTACT_VARIANTS.phone;
  const { Icon, color: iconColor, bg } = config;

  if (!display) {
    return (
      <Typography
        variant={typographyVariant}
        component="span"
        color={color}
        fontWeight={fontWeight}
        sx={{ lineHeight: 1.4, display: 'block' }}
      >
        {prefix}
        {emptyText}
      </Typography>
    );
  }

  const row = (
    <Stack direction="row" spacing={0.6} alignItems="center" sx={{ minWidth: 0 }}>
      <Icon sx={{ fontSize: iconSize, color: iconColor, flexShrink: 0 }} />
      <Typography
        variant={typographyVariant}
        component="span"
        fontWeight={fontWeight}
        color={color}
        sx={{ lineHeight: 1.4, wordBreak: 'break-word' }}
      >
        {prefix}
        {display}
      </Typography>
    </Stack>
  );

  if (boxed) {
    return (
      <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 1, borderRadius: 2, bgcolor: bg }}>
        {row}
      </Stack>
    );
  }

  return row;
}
