import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Divider,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  alpha,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import dayjs from 'dayjs';
import html2canvas from 'html2canvas';
import { useSnackbar } from 'notistack';
import { useQueryClient } from '@tanstack/react-query';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { useEnquiry } from '../../hooks/queries/useEnquiry';
import { useItinerary, usePayments } from '../../hooks/queries/useModules';
import {
  useQuotationByEnquiryItinerary,
  useStandaloneQuotation,
} from '../../hooks/queries/useQuotations';
import { useBranding } from '../../hooks/queries/useBranding';
import { formatDate } from '../../utils/formatters';
import {
  calcLineGross,
  coercePricing,
  formatInr,
  resolveLineItems,
  round2,
  summarizePricing,
  syncLineItemsFromEvents,
} from '../../utils/itineraryPricing';
import { resolveMediaUrl } from '../../utils/constants';
import { amountToIndianWords } from '../../utils/amountInWords';
import { isValidWhatsAppPhone } from '../../utils/whatsappShare';
import ContactNumberDisplay from '../../components/common/ContactNumberDisplay';
import enquiryService from '../../services/enquiry.service';

const NAVY = '#0b2a4a';
const BLUE = '#1565c0';
const RED = '#c62828';

/** Round off to nearest rupee (no paise). */
const roundOffAmount = (value) => Math.round(Number(value) || 0);

function MetaRow({ label, value, valueColor, labelWidth = 140 }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `${labelWidth}px 10px 1fr`,
        columnGap: 0.5,
        py: 0.3,
      }}
    >
      <Typography variant="body2" fontWeight={700} color="#334155">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700}>
        :
      </Typography>
      <Typography variant="body2" fontWeight={800} sx={{ color: valueColor || NAVY }}>
        {value || '—'}
      </Typography>
    </Box>
  );
}

function SectionBox({ title, children, minHeight }) {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: alpha(NAVY, 0.22),
        borderRadius: 1,
        overflow: 'hidden',
        height: '100%',
        minHeight,
        bgcolor: '#fff',
      }}
    >
      <Box sx={{ bgcolor: NAVY, px: 1.5, py: 0.85 }}>
        <Typography
          sx={{
            color: '#fff',
            fontWeight: 800,
            fontSize: 12,
            letterSpacing: 0.7,
            textTransform: 'capitalize',
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box sx={{ p: 1.5 }}>{children}</Box>
    </Box>
  );
}

function invoiceNumberFromQuotation(q, enquiry) {
  if (q?.quotation_code) return String(q.quotation_code).replace(/^QT/i, 'INV');
  if (enquiry?.enquiry_code) return String(enquiry.enquiry_code).replace(/^ENQ/i, 'INV');
  return '—';
}

async function captureInvoiceImage(element) {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error('Failed to capture invoice image'));
        else resolve(blob);
      },
      'image/png',
      0.95
    );
  });
}

export default function EnquiryInvoiceView() {
  const { enquiryId, itineraryId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [sharing, setSharing] = useState(false);
  const isDirect = itineraryId === 'direct';
  const { data: branding } = useBranding();
  const { data: enquiry, isLoading: loadingEnquiry } = useEnquiry(enquiryId);
  const { data: itinerary, isLoading: loadingItinerary } = useItinerary(isDirect ? null : itineraryId);
  const { data: itineraryQuotation, isLoading: loadingItineraryQuotation } =
    useQuotationByEnquiryItinerary(enquiryId, itineraryId, !isDirect);
  const { data: standaloneQuotation, isLoading: loadingStandalone } = useStandaloneQuotation(
    enquiryId,
    isDirect
  );
  const quotation = isDirect ? standaloneQuotation : itineraryQuotation;
  const { data: paymentsData } = usePayments({
    page: 1,
    perPage: 200,
    enquiry_id: enquiryId,
    sortBy: 'payment_date',
    sortOrder: 'asc',
  });

  const payments = paymentsData?.rows || [];
  const logoUrl = resolveMediaUrl(branding?.company_logo);
  const companyName = branding?.company_name || 'Tours & Travels';
  const invoiceNotes = String(branding?.invoice_note || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const invoice = useMemo(() => {
    if (!enquiry) return null;
    if (!isDirect && !itinerary) return null;

    let days = [];
    let pricingSource = {};
    let packageTitle = 'Tour Package';
    let travelFrom = enquiry.travel_from;
    let travelTo = enquiry.travel_to;
    let adults = enquiry.adults ?? 0;
    let children = enquiry.children ?? 0;
    let duration = '—';

    if (isDirect) {
      pricingSource = quotation?.pricing || {};
      packageTitle =
        quotation?.package?.name || enquiry.package?.name || enquiry.enquiry_code || 'Tour Package';
      travelFrom = enquiry.travel_from || quotation?.travel_from;
      travelTo = enquiry.travel_to || quotation?.travel_to;
      adults = quotation?.adults ?? enquiry.adults ?? 0;
      children = quotation?.children ?? enquiry.children ?? 0;
    } else {
      days = [...(itinerary.itineraryDays || [])].sort(
        (a, b) => (a.day_number || 0) - (b.day_number || 0)
      );
      pricingSource = quotation?.pricing || itinerary.pricing || {};
      packageTitle =
        quotation?.package?.name ||
        enquiry.package?.name ||
        itinerary.title ||
        'Tour Package';
      travelFrom = enquiry.travel_from || quotation?.travel_from || itinerary.from_date;
      travelTo = enquiry.travel_to || quotation?.travel_to || itinerary.to_date;
      adults = quotation?.adults ?? enquiry.adults ?? itinerary.adults ?? 0;
      children = quotation?.children ?? enquiry.children ?? itinerary.children ?? 0;
      duration = `${itinerary.days || 0} Days / ${itinerary.nights || 0} Nights`;
    }

    const pricing = coercePricing(pricingSource);
    pricing.line_items = isDirect
      ? resolveLineItems([], pricing.line_items || [])
      : syncLineItemsFromEvents(days, pricing.line_items || []);
    const summary = summarizePricing(pricing);

    const lineRows = (pricing.line_items || [])
      .map((item) => {
        const amount = calcLineGross(item.net, item.markup_percent);
        if (!amount && !item.item) return null;
        return {
          description: item.item || item.type || 'Service',
          detail: item.option || '',
          qty: 1,
          rate: amount,
          amount,
        };
      })
      .filter(Boolean);

    const computedTotal =
      Number(quotation?.total_amount) || summary.grandTotal || 0;
    const totalBeforeRound = round2(computedTotal);
    const packageTotal = roundOffAmount(totalBeforeRound);
    const roundOff = round2(packageTotal - totalBeforeRound);
    const additionalCharges = round2(
      payments.reduce((sum, p) => sum + (Number(p.additional_charges) || 0), 0)
    );
    const totalInvoice = roundOffAmount(packageTotal + additionalCharges);
    const packagePaid = round2(
      payments.reduce((sum, p) => sum + (Number(p.advance_amount) || 0), 0)
    );
    const advancePaid = round2(packagePaid + additionalCharges);
    const balance = Math.max(roundOffAmount(totalInvoice - advancePaid), 0);

    const customerAddress = [enquiry.city_name || enquiry.city?.name, enquiry.state_name || enquiry.state?.name, enquiry.country_name || enquiry.country?.name]
      .filter(Boolean)
      .join(', ');

    const travelFromResolved = travelFrom;
    const travelToResolved = travelTo;

    return {
      invoiceNo: invoiceNumberFromQuotation(quotation, enquiry),
      invoiceDate: formatDate(dayjs(), 'DD MMM YYYY'),
      dueDate: formatDate(
        travelFromResolved ? dayjs(travelFromResolved).subtract(5, 'day') : dayjs().add(2, 'day'),
        'DD MMM YYYY'
      ),
      enquiryCode: enquiry.enquiry_code,
      customerName: enquiry.customer_name || quotation?.customer_name || '—',
      customerPhone: enquiry.phone || quotation?.phone || '—',
      customerEmail: enquiry.email || quotation?.email || '—',
      customerAddress: customerAddress || '—',
      packageName: packageTitle,
      travelDates:
        travelFromResolved || travelToResolved
          ? `${formatDate(travelFromResolved, 'DD MMM YYYY')} - ${formatDate(travelToResolved, 'DD MMM YYYY')}`
          : '—',
      duration,
      travellers: [
        adults ? `${adults} Adult${adults > 1 ? 's' : ''}` : null,
        children ? `${children} Child${children > 1 ? 'ren' : ''}` : null,
      ]
        .filter(Boolean)
        .join(', ') || '—',
      lineRows,
      summary,
      pricing,
      totalBeforeRound,
      roundOff,
      packageTotal,
      additionalCharges,
      totalInvoice,
      advancePaid,
      balance,
    };
  }, [enquiry, itinerary, quotation, payments, isDirect]);

  const isLoading =
    loadingEnquiry ||
    (isDirect ? loadingStandalone : loadingItinerary || loadingItineraryQuotation);

  if (isLoading && !invoice) return <Loader message="Loading invoice..." />;
  if (!invoice) {
    return (
      <EmptyState
        title="Invoice not found"
        actionLabel="Back"
        onAction={() => navigate(`/enquiry/view/${enquiryId}`)}
      />
    );
  }

  const handleShareInvoice = async () => {
    const element = document.getElementById('enquiry-invoice-print');
    if (!element || sharing || !enquiryId) return;

    setSharing(true);
    try {
      const blob = await captureInvoiceImage(element);
      const formData = new FormData();
      const fileName = `${String(invoice.invoiceNo || 'invoice').replace(/\//g, '-')}.png`;
      formData.append('invoice_image', blob, fileName);
      formData.append('invoice_number', invoice.invoiceNo || '');
      formData.append('trip_id', invoice.enquiryCode || '');
      formData.append('grand_total', String(invoice.totalInvoice ?? ''));
      formData.append('travel_from_destination', enquiry?.travel_from_destination || '');
      formData.append('travel_to_destination', enquiry?.travel_to_destination || '');
      await enquiryService.shareInvoiceWhatsApp(enquiryId, formData);
      enqueueSnackbar('Invoice shared to customer on WhatsApp', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['enquiry-whatsapp-messages', enquiryId] });
    } catch (err) {
      enqueueSnackbar(
        err?.response?.data?.message || err?.message || 'Failed to share invoice on WhatsApp',
        { variant: 'error' }
      );
    } finally {
      setSharing(false);
    }
  };

  return (
    <Box className="print-document" sx={{ maxWidth: 980, mx: 'auto', pb: 4 }}>
      <Stack
        className="no-print"
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={1.5}
        mb={2.5}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/enquiry/view/${enquiryId}`)}
          sx={{ textTransform: 'none', fontWeight: 700 }}
        >
          Back to Enquiry
        </Button>
        <Button
          variant="outlined"
          startIcon={<WhatsAppIcon />}
          disabled={
            sharing ||
            !isValidWhatsAppPhone(invoice.customerPhone) ||
            invoice.customerPhone === '—'
          }
          onClick={handleShareInvoice}
          sx={{
            textTransform: 'none',
            fontWeight: 800,
            color: '#128C7E',
            borderColor: alpha('#128C7E', 0.55),
            '&:hover': {
              borderColor: '#128C7E',
              bgcolor: alpha('#128C7E', 0.08),
            },
          }}
        >
          {sharing ? 'Sharing…' : 'Share WhatsApp'}
        </Button>
      </Stack>

      <Box
        id="enquiry-invoice-print"
        sx={{
          position: 'relative',
          bgcolor: '#fff',
          border: '1px solid',
          borderColor: alpha('#0f172a', 0.12),
          borderRadius: 1,
          overflow: 'hidden',
          boxShadow: '0 12px 36px rgba(15,23,42,0.08)',
          px: { xs: 2, sm: 3 },
          py: { xs: 2.5, sm: 3 },
        }}
      >
        {/* Header */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Stack direction="row" spacing={1.75} alignItems="flex-start" sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                width: 78,
                height: 78,
                borderRadius: '50%',
                flexShrink: 0,
                bgcolor: alpha(NAVY, 0.06),
                border: '2px solid',
                borderColor: alpha(NAVY, 0.2),
                backgroundImage: logoUrl ? `url(${logoUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 900,
                color: NAVY,
                fontSize: 26,
              }}
            >
              {!logoUrl && (companyName?.[0] || 'T')}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 900,
                  color: NAVY,
                  fontSize: { xs: 15, sm: 17 },
                  textTransform: 'capitalize',
                  letterSpacing: 0.3,
                  lineHeight: 1.25,
                }}
              >
                {companyName}
              </Typography>
              {branding?.company_address && (
                <Typography variant="body2" sx={{ mt: 0.5, color: '#475569', lineHeight: 1.4 }}>
                  {branding.company_address}
                </Typography>
              )}
              <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap sx={{ mt: 0.75 }}>
                {branding?.company_phone && (
                  <Stack direction="row" spacing={0.4} alignItems="center">
                    <PhoneOutlinedIcon sx={{ fontSize: 13, color: BLUE }} />
                    <Typography variant="caption" fontWeight={700}>
                      {branding.company_phone}
                    </Typography>
                  </Stack>
                )}
                {branding?.company_email && (
                  <Stack direction="row" spacing={0.4} alignItems="center">
                    <EmailOutlinedIcon sx={{ fontSize: 13, color: BLUE }} />
                    <Typography variant="caption" fontWeight={700}>
                      {branding.company_email}
                    </Typography>
                  </Stack>
                )}
              </Stack>
              {branding?.gstin && (
                <Typography variant="caption" fontWeight={800} sx={{ mt: 0.5, display: 'block' }}>
                  GSTIN: {branding.gstin}
                </Typography>
              )}
            </Box>
          </Stack>

          <Box sx={{ minWidth: { md: 260 } }}>
            <Typography
              sx={{
                fontWeight: 900,
                color: NAVY,
                fontSize: 34,
                letterSpacing: 1.5,
                lineHeight: 1,
                mb: 1,
              }}
            >
              INVOICE
            </Typography>
            <MetaRow label="Invoice No." value={invoice.invoiceNo} valueColor={RED} />
            <MetaRow label="Invoice Date" value={invoice.invoiceDate} />
            <MetaRow label="Booking/Enquiry No." value={invoice.enquiryCode} />
            <MetaRow label="Due Date" value={invoice.dueDate} />
          </Box>
        </Stack>

        {/* Info boxes */}
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <SectionBox title="Billed To">
              <Typography fontWeight={800} sx={{ mb: 0.5 }}>
                {invoice.customerName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                {invoice.customerAddress}
              </Typography>
              <ContactNumberDisplay
                value={invoice.customerPhone}
                variant="whatsapp"
                typographyVariant="body2"
                color="text.primary"
                emptyText=""
              />
              <Typography variant="body2" fontWeight={600}>
                {invoice.customerEmail}
              </Typography>
            </SectionBox>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <SectionBox title="Travel Details">
              <MetaRow label="Package Name" value={invoice.packageName} labelWidth={150} />
              <MetaRow label="Travel Date" value={invoice.travelDates} />
              <MetaRow label="Duration" value={invoice.duration} />
              <MetaRow label="No. of Travellers" value={invoice.travellers} />
            </SectionBox>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <SectionBox title="Currency">
              <Typography fontWeight={800}>INR</Typography>
            </SectionBox>
          </Grid>
        </Grid>

        {/* Line items from quotation pricing */}
        <TableContainer
          sx={{
            border: '1px solid',
            borderColor: alpha(NAVY, 0.25),
            borderRadius: 1,
            mb: 2,
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: NAVY }}>
                <TableCell sx={{ color: '#fff', fontWeight: 800, width: 48 }}>#</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 800 }}>Description</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 800 }} align="center" width={70}>
                  Qty
                </TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 800 }} align="right" width={120}>
                  Rate (₹)
                </TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 800 }} align="right" width={130}>
                  Amount (₹)
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoice.lineRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No quotation line items found. Add pricing in Quotation Edit.
                  </TableCell>
                </TableRow>
              ) : (
                invoice.lineRows.map((row, idx) => (
                  <TableRow key={`${row.description}-${idx}`} hover>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      <Typography fontWeight={700}>{row.description}</Typography>
                      {row.detail ? (
                        <Typography variant="caption" color="text.secondary">
                          {row.detail}
                        </Typography>
                      ) : null}
                    </TableCell>
                    <TableCell align="center">{row.qty}</TableCell>
                    <TableCell align="right">{formatInr(row.rate)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {formatInr(row.amount)}
                    </TableCell>
                  </TableRow>
                ))
              )}
              <TableRow>
                <TableCell colSpan={3} sx={{ borderBottom: 'none', verticalAlign: 'top', pt: 1.5 }}>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: BLUE }}>
                    Amount in Words: {amountToIndianWords(invoice.totalInvoice)}
                  </Typography>
                </TableCell>
                <TableCell
                  colSpan={2}
                  sx={{ borderBottom: 'none', bgcolor: alpha(NAVY, 0.03), p: 0 }}
                >
                  <Box sx={{ px: 1.5, py: 1 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ py: 0.35 }}>
                      <Typography variant="body2" fontWeight={700}>
                        Sub Total
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {formatInr(invoice.summary.taxable)}
                      </Typography>
                    </Stack>
                    {invoice.pricing.cgst_percent > 0 && (
                      <Stack direction="row" justifyContent="space-between" sx={{ py: 0.35 }}>
                        <Typography variant="body2">
                          CGST ({invoice.pricing.cgst_percent}%)
                        </Typography>
                        <Typography variant="body2">{formatInr(invoice.summary.cgst)}</Typography>
                      </Stack>
                    )}
                    {invoice.pricing.sgst_percent > 0 && (
                      <Stack direction="row" justifyContent="space-between" sx={{ py: 0.35 }}>
                        <Typography variant="body2">
                          SGST ({invoice.pricing.sgst_percent}%)
                        </Typography>
                        <Typography variant="body2">{formatInr(invoice.summary.sgst)}</Typography>
                      </Stack>
                    )}
                    {invoice.pricing.igst_percent > 0 && (
                      <Stack direction="row" justifyContent="space-between" sx={{ py: 0.35 }}>
                        <Typography variant="body2">
                          IGST ({invoice.pricing.igst_percent}%)
                        </Typography>
                        <Typography variant="body2">{formatInr(invoice.summary.igst)}</Typography>
                      </Stack>
                    )}
                    {invoice.summary.discount > 0 && (
                      <Stack direction="row" justifyContent="space-between" sx={{ py: 0.35 }}>
                        <Typography variant="body2">Discount</Typography>
                        <Typography variant="body2">
                          - {formatInr(invoice.summary.discount)}
                        </Typography>
                      </Stack>
                    )}
                    {invoice.roundOff !== 0 && (
                      <Stack direction="row" justifyContent="space-between" sx={{ py: 0.35 }}>
                        <Typography variant="body2">Round Off</Typography>
                        <Typography variant="body2">
                          {invoice.roundOff > 0 ? '+ ' : '- '}
                          {formatInr(Math.abs(invoice.roundOff))}
                        </Typography>
                      </Stack>
                    )}
                    {invoice.additionalCharges > 0 && (
                      <Stack direction="row" justifyContent="space-between" sx={{ py: 0.35 }}>
                        <Typography variant="body2">Additional Charges</Typography>
                        <Typography variant="body2">
                          {formatInr(invoice.additionalCharges)}
                        </Typography>
                      </Stack>
                    )}
                  </Box>
                  <Box
                    sx={{
                      bgcolor: NAVY,
                      color: '#fff',
                      px: 1.5,
                      py: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography fontWeight={800}>Total Amount</Typography>
                    <Typography fontWeight={900}>{formatInr(invoice.totalInvoice)}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Payment / Bank / Scan */}
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <SectionBox title="Payment Summary">
              <Stack spacing={0.75}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Package Amount</Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {formatInr(invoice.packageTotal)}
                  </Typography>
                </Stack>
                {invoice.additionalCharges > 0 && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Additional Charges</Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {formatInr(invoice.additionalCharges)}
                    </Typography>
                  </Stack>
                )}
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Total Invoice Amount</Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {formatInr(invoice.totalInvoice)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Advance Paid</Typography>
                  <Typography variant="body2" fontWeight={700} color={BLUE}>
                    {formatInr(invoice.advancePaid)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Balance Amount</Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {formatInr(invoice.balance)}
                  </Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" fontWeight={900}>
                    Amount Payable
                  </Typography>
                  <Typography variant="body2" fontWeight={900} color={RED}>
                    {formatInr(invoice.balance)}
                  </Typography>
                </Stack>
              </Stack>
            </SectionBox>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <SectionBox title="Bank Details">
              <MetaRow label="Bank Name" value={branding?.bank_name || '—'} labelWidth={110} />
              <MetaRow
                label="Account Name"
                value={branding?.bank_account_name || companyName}
                labelWidth={110}
              />
              <MetaRow
                label="Account Number"
                value={branding?.bank_account_number || '—'}
                labelWidth={110}
              />
              <MetaRow label="IFSC Code" value={branding?.bank_ifsc || '—'} labelWidth={110} />
            </SectionBox>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <SectionBox title="Payment Status">
              <Box
                sx={{
                  minHeight: 140,
                  display: 'grid',
                  placeItems: 'center',
                  py: 1,
                }}
              >
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    border: '6px solid #2e7d32',
                    display: 'grid',
                    placeItems: 'center',
                    transform: 'rotate(-18deg)',
                    bgcolor: alpha('#2e7d32', 0.06),
                    boxShadow: `inset 0 0 0 3px ${alpha('#2e7d32', 0.22)}`,
                  }}
                >
                  <Typography
                    sx={{
                      color: '#2e7d32',
                      fontWeight: 900,
                      fontSize: 26,
                      letterSpacing: 2,
                      lineHeight: 1,
                    }}
                  >
                    PAID
                  </Typography>
                </Box>
              </Box>
            </SectionBox>
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.75 }}>
              Notes
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.25, color: '#475569' }}>
              {invoiceNotes.length > 0 ? (
                invoiceNotes.map((line, index) => (
                  <Typography key={`${index}-${line}`} component="li" variant="caption" display="block">
                    {line}
                  </Typography>
                ))
              ) : (
                <>
                  <Typography component="li" variant="caption" display="block">
                    This is a computer generated invoice.
                  </Typography>
                  <Typography component="li" variant="caption" display="block">
                    Payment must be completed before travel as per agreed terms.
                  </Typography>
                  <Typography component="li" variant="caption" display="block">
                    Line items are based on quotation pricing configured for this enquiry.
                  </Typography>
                </>
              )}
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ textAlign: 'right', pt: 1 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: 160,
                }}
              >
                <Box
                  sx={{
                    width: 200,
                    height: 110,
                    display: 'grid',
                    placeItems: 'center',
                    mb: 0.25,
                    color: BLUE,
                    fontWeight: 800,
                    fontSize: 12,
                    textAlign: 'center',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    backgroundColor: 'transparent',
                    backgroundImage: branding?.digital_signature
                      ? `url(${resolveMediaUrl(branding.digital_signature)})`
                      : 'none',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center bottom',
                  }}
                >
                  {!branding?.digital_signature &&
                    companyName.split(' ').slice(0, 2).join(' ')}
                </Box>
                <Divider sx={{ width: '100%', mb: 0.35 }} />
                <Typography variant="caption" fontWeight={700}>
                  Authorised Signatory
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Box
          sx={{
            bgcolor: NAVY,
            color: '#fff',
            px: 2,
            py: 1,
            borderRadius: 1,
            textAlign: 'center',
          }}
        >
          <Typography variant="caption" fontWeight={600}>
            {[branding?.company_phone, branding?.company_email, branding?.company_address]
              .filter(Boolean)
              .join('  |  ')}
          </Typography>
        </Box>
        <Typography
          variant="body2"
          textAlign="center"
          sx={{ mt: 1.5, color: '#475569', fontWeight: 600 }}
        >
          Thank you for choosing {companyName}. We look forward to serving you again!
        </Typography>
      </Box>
    </Box>
  );
}
