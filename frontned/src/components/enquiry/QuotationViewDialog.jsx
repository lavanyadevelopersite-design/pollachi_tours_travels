import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import { useBranding } from '../../hooks/queries/useBranding';
import { useItinerary } from '../../hooks/queries/useModules';
import {
  coercePricing,
  formatInr,
  summarizePricing,
  syncLineItemsFromEvents,
} from '../../utils/itineraryPricing';
import { formatDate } from '../../utils/formatters';
import { resolveMediaUrl } from '../../utils/constants';
import Loader from '../common/Loader';
import CompanyBankSignatureBlock from '../common/CompanyBankSignatureBlock';

export default function QuotationViewDialog({
  open,
  onClose,
  enquiry,
  itinerary: listItem,
  quotation,
}) {
  const itineraryId = listItem?.id || quotation?.itinerary_id;
  const { data: itinerary, isLoading } = useItinerary(open ? itineraryId : null);
  const { data: branding } = useBranding();

  const days = itinerary?.itineraryDays || itinerary?.days_plan || [];
  const pricingSource = quotation?.pricing || itinerary?.pricing || {};
  const pricing = coercePricing(pricingSource);
  pricing.line_items = syncLineItemsFromEvents(
    Array.isArray(days) ? days : [],
    pricing.line_items || []
  );
  const summary = summarizePricing(pricing);

  const title = itinerary?.title || listItem?.title || 'Quotation';
  const logoUrl = resolveMediaUrl(branding?.company_logo);
  const companyName = branding?.company_name || 'Tours & Travels';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle fontWeight={800} sx={{ pr: 2 }}>
        Quotation View — {title}
      </DialogTitle>
      <DialogContent dividers sx={{ bgcolor: alpha('#0f172a', 0.02) }}>
        {isLoading ? (
          <Loader message="Loading quotation..." />
        ) : (
          <Box
            id="quotation-print-area"
            sx={{
              bgcolor: '#fff',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
              boxShadow: '0 12px 32px rgba(15,23,42,0.08)',
            }}
          >
            {/* Company header */}
            <Box
              sx={{
                px: 3,
                py: 2.5,
                background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 55%, #0d9488 140%)',
                color: '#fff',
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
              >
                <Stack direction="row" spacing={1.75} alignItems="center">
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 2,
                      bgcolor: alpha('#fff', 0.12),
                      border: '1px solid',
                      borderColor: alpha('#fff', 0.2),
                      backgroundImage: logoUrl ? `url(${logoUrl})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 800,
                      fontSize: 18,
                    }}
                  >
                    {!logoUrl && (companyName?.[0] || 'T')}
                  </Box>
                  <Box>
                    <Typography fontWeight={900} sx={{ fontSize: 20, lineHeight: 1.2 }}>
                      {companyName}
                    </Typography>
                    {branding?.company_address && (
                      <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.35, maxWidth: 360 }}>
                        {branding.company_address}
                      </Typography>
                    )}
                    <Typography variant="caption" sx={{ opacity: 0.85, display: 'block', mt: 0.25 }}>
                      {[branding?.company_phone, branding?.company_email].filter(Boolean).join(' · ')}
                    </Typography>
                  </Box>
                </Stack>
                <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Quotation
                  </Typography>
                  <Typography fontWeight={800}>
                    {quotation?.quotation_code || 'Draft preview'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Enquiry: {enquiry?.enquiry_code || '—'}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Box sx={{ p: 3 }}>
              <Stack spacing={0.75} mb={2.5}>
                <Typography fontWeight={800} sx={{ fontSize: 18 }}>
                  {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Customer: <strong>{enquiry?.customer_name || quotation?.customer_name || '—'}</strong>
                  {' · '}
                  Pax: {(itinerary?.adults ?? enquiry?.adults ?? 0)} Adult(s) /{' '}
                  {(itinerary?.children ?? enquiry?.children ?? 0)} Child(s)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Travel:{' '}
                  {itinerary?.from_date
                    ? formatDate(itinerary.from_date, 'DD MMM YYYY')
                    : '—'}{' '}
                  →{' '}
                  {itinerary?.to_date ? formatDate(itinerary.to_date, 'DD MMM YYYY') : '—'}
                  {' · '}
                  {itinerary?.days || listItem?.days || 0}D / {itinerary?.nights || listItem?.nights || 0}N
                </Typography>
              </Stack>

              <Divider sx={{ mb: 2 }} />

              {/* Line items summary */}
              <Typography fontWeight={800} mb={1.25}>
                Price Breakdown
              </Typography>
              <Box
                sx={{
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  overflow: 'hidden',
                  mb: 2.5,
                }}
              >
                <Stack spacing={0}>
                  {(pricing.line_items || []).slice(0, 12).map((item) => (
                    <Stack
                      key={item.key || `${item.item}-${item.day_number}`}
                      direction="row"
                      justifyContent="space-between"
                      sx={{
                        px: 1.75,
                        py: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 0 },
                      }}
                    >
                      <Typography variant="body2" fontWeight={600}>
                        {item.item || item.option || 'Service'}
                        {item.day_number ? ` (Day ${item.day_number})` : ''}
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {formatInr(
                          (Number(item.net) || 0) *
                            (1 + (Number(item.markup_percent) || 0) / 100)
                        )}
                      </Typography>
                    </Stack>
                  ))}
                  {!(pricing.line_items || []).length && (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                      No line items yet. Open Edit to set quotation pricing.
                    </Typography>
                  )}
                </Stack>
              </Box>

              {/* Highlighted price summary */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #152238 0%, #0f766e 120%)',
                  color: '#fff',
                  boxShadow: '0 16px 36px rgba(15,118,110,0.28)',
                }}
              >
                <Typography variant="h6" fontWeight={800} mb={1.5}>
                  Pricing Summary
                </Typography>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography sx={{ opacity: 0.9 }}>Subtotal</Typography>
                    <Typography fontWeight={700}>{formatInr(summary.subtotalNet)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography sx={{ opacity: 0.9 }}>Tax</Typography>
                    <Typography fontWeight={700}>{formatInr(summary.taxTotal)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography sx={{ opacity: 0.9 }}>Discount</Typography>
                    <Typography fontWeight={700}>{formatInr(summary.discount)}</Typography>
                  </Stack>
                  <Divider sx={{ borderColor: alpha('#fff', 0.2), my: 0.5 }} />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography fontWeight={800} sx={{ fontSize: 18 }}>
                      Grand Total
                    </Typography>
                    <Typography
                      fontWeight={900}
                      sx={{
                        fontSize: 28,
                        color: '#86efac',
                        textShadow: '0 2px 12px rgba(134,239,172,0.35)',
                      }}
                    >
                      {formatInr(summary.grandTotal)}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>

              <CompanyBankSignatureBlock branding={branding} companyName={companyName} />
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button
          variant="outlined"
          startIcon={<PrintOutlinedIcon />}
          onClick={() => window.print()}
          sx={{ textTransform: 'none', fontWeight: 700 }}
        >
          Print
        </Button>
      </DialogActions>
    </Dialog>
  );
}
