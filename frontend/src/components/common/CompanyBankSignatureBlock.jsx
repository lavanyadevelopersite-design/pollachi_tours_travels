import { Box, Divider, Stack, Typography } from '@mui/material';
import { resolveMediaUrl } from '../../utils/constants';

function mediaSrc(path) {
  const url = resolveMediaUrl(path);
  if (!url) return null;
  const version = encodeURIComponent(String(path).split('/').pop() || '1');
  return `${url}${url.includes('?') ? '&' : '?'}v=${version}`;
}

/**
 * Bank details + digital signature block for quotation / invoice prints.
 */
export default function CompanyBankSignatureBlock({ branding, companyName }) {
  const name = companyName || branding?.company_name || 'Tours & Travels';
  const signatureUrl = mediaSrc(branding?.digital_signature);
  const hasBank =
    branding?.bank_name ||
    branding?.bank_account_name ||
    branding?.bank_account_number ||
    branding?.bank_ifsc;

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2.5}
      justifyContent="space-between"
      alignItems={{ xs: 'stretch', md: 'flex-end' }}
      sx={{ mt: 3, pt: 2.5, borderTop: '1px solid', borderColor: 'divider' }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
          Bank Details
        </Typography>
        {hasBank ? (
          <Stack spacing={0.4}>
            <Typography variant="body2">
              <Box component="span" color="text.secondary" sx={{ mr: 0.75 }}>
                Bank Name:
              </Box>
              <strong>{branding?.bank_name || '—'}</strong>
            </Typography>
            <Typography variant="body2">
              <Box component="span" color="text.secondary" sx={{ mr: 0.75 }}>
                Account Name:
              </Box>
              <strong>{branding?.bank_account_name || name}</strong>
            </Typography>
            <Typography variant="body2">
              <Box component="span" color="text.secondary" sx={{ mr: 0.75 }}>
                Account Number:
              </Box>
              <strong>{branding?.bank_account_number || '—'}</strong>
            </Typography>
            <Typography variant="body2">
              <Box component="span" color="text.secondary" sx={{ mr: 0.75 }}>
                IFSC Code:
              </Box>
              <strong>{branding?.bank_ifsc || '—'}</strong>
            </Typography>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Bank details not configured in Settings.
          </Typography>
        )}
      </Box>

      <Box sx={{ textAlign: 'center', minWidth: 200 }}>
        <Box
          sx={{
            width: 200,
            height: 110,
            mx: 'auto',
            mb: 0.25,
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            backgroundColor: 'transparent',
            backgroundImage: signatureUrl ? `url(${signatureUrl})` : 'none',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center bottom',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {!signatureUrl && (
            <Typography variant="caption" color="text.secondary" sx={{ px: 1, textAlign: 'center' }}>
              {name.split(' ').slice(0, 2).join(' ')}
            </Typography>
          )}
        </Box>
        <Divider sx={{ width: '100%', mb: 0.35 }} />
        <Typography variant="caption" fontWeight={700}>
          Authorised Signatory
        </Typography>
      </Box>
    </Stack>
  );
}
