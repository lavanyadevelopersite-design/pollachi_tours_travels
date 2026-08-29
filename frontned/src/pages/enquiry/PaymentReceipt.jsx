import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Divider,
  Grid,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import html2canvas from 'html2canvas';
import { useSnackbar } from 'notistack';
import { useQuery } from '@tanstack/react-query';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ContactNumberDisplay from '../../components/common/ContactNumberDisplay';
import { paymentService } from '../../services/common.service';
import { useBranding } from '../../hooks/queries/useBranding';
import { formatDate } from '../../utils/formatters';
import { formatInr } from '../../utils/itineraryPricing';
import { resolveMediaUrl } from '../../utils/constants';
import { amountToIndianWords } from '../../utils/amountInWords';

const NAVY = '#0b2a4a';
const GREEN = '#1f7a4d';
const LABEL = '#334155';

function brandLogoSrc(path) {
  const url = resolveMediaUrl(path);
  if (!url) return null;
  const version = encodeURIComponent(String(path).split('/').pop() || '1');
  return `${url}${url.includes('?') ? '&' : '?'}v=${version}`;
}

function InfoRow({ label, value, valueColor, labelWidth = 130 }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `${labelWidth}px 12px 1fr`,
        columnGap: 0.5,
        py: 0.45,
        alignItems: 'start',
      }}
    >
      <Typography variant="body2" fontWeight={700} color={LABEL}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700} color={LABEL}>
        :
      </Typography>
      <Typography variant="body2" fontWeight={700} sx={{ color: valueColor || NAVY, wordBreak: 'break-word' }}>
        {value || '—'}
      </Typography>
    </Box>
  );
}

function DetailBox({ title, children }) {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: alpha(NAVY, 0.25),
        borderRadius: 1,
        overflow: 'hidden',
        height: '100%',
      }}
    >
      <Box sx={{ bgcolor: NAVY, px: 1.75, py: 1 }}>
        <Typography
          sx={{
            color: '#fff',
            fontWeight: 800,
            fontSize: 13,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box sx={{ p: 1.75, bgcolor: '#fff' }}>{children}</Box>
    </Box>
  );
}

function userDisplayName(user) {
  if (!user) return '—';
  return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || '—';
}

async function captureReceiptImage(element) {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error('Failed to capture receipt image'));
        else resolve(blob);
      },
      'image/png',
      0.95
    );
  });
}

export default function PaymentReceipt() {
  const { enquiryId, paymentId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { data: branding } = useBranding();
  const [logoFailed, setLogoFailed] = useState(false);
  const [sharing, setSharing] = useState(false);

  const { data: payment, isLoading } = useQuery({
    queryKey: ['payments', paymentId],
    queryFn: async () => {
      const { data } = await paymentService.get(paymentId);
      return data?.data || data;
    },
    enabled: !!paymentId,
  });

  const logoUrl = brandLogoSrc(branding?.company_logo);
  const showLogo = Boolean(logoUrl) && !logoFailed;
  const companyName = branding?.company_name || 'Tours & Travels';

  useEffect(() => {
    setLogoFailed(false);
  }, [logoUrl]);

  const receipt = useMemo(() => {
    if (!payment) return null;
    const enquiry = payment.enquiry || {};
    const quotation = payment.quotation || {};
    const itinerary = quotation.itinerary || {};
    const pkgName =
      quotation.package?.name ||
      enquiry.package?.name ||
      itinerary.title ||
      'Tour Package';

    const travelFrom = quotation.travel_from || enquiry.travel_from || itinerary.from_date;
    const travelTo = quotation.travel_to || enquiry.travel_to || itinerary.to_date;
    const days = itinerary.days;
    const nights = itinerary.nights;
    let travelLabel = '—';
    if (travelFrom || travelTo) {
      travelLabel = `${formatDate(travelFrom, 'DD MMM YYYY')} - ${formatDate(travelTo, 'DD MMM YYYY')}`;
      if (days || nights) {
        travelLabel += ` (${days || 0} Days / ${nights || 0} Nights)`;
      }
    }

    const adults = quotation.adults ?? enquiry.adults ?? itinerary.adults ?? 0;
    const children = quotation.children ?? enquiry.children ?? itinerary.children ?? 0;
    const travellers = [
      adults ? `${adults} Adult${adults > 1 ? 's' : ''}` : null,
      children ? `${children} Child${children > 1 ? 'ren' : ''}` : null,
    ]
      .filter(Boolean)
      .join(', ') || '—';

    const totalQuotation =
      Number(payment.quotation_amount) || Number(quotation.total_amount) || 0;
    const alreadyPaid = Number(payment.already_paid) || 0;
    const received = Number(payment.advance_amount) || 0;
    const balance =
      payment.balance_amount != null
        ? Number(payment.balance_amount)
        : Math.max(totalQuotation - alreadyPaid - received, 0);

    return {
      paymentCode: payment.payment_code,
      paymentDate: formatDate(payment.payment_date, 'DD MMM YYYY'),
      paymentMode: payment.payment_mode || '—',
      paymentType:
        String(payment.payment_type || 'advance').toLowerCase() === 'remaining'
          ? 'remaining'
          : 'advance',
      transactionId: payment.transaction_id || '—',
      referenceNo: payment.reference_no || '—',
      enquiryCode: enquiry.enquiry_code || '—',
      quotationCode: quotation.quotation_code || '—',
      customerName: enquiry.customer_name || quotation.customer_name || '—',
      mobile: enquiry.phone || quotation.phone || '—',
      email: enquiry.email || quotation.email || '—',
      packageName: pkgName,
      fromDestination: enquiry.travel_from_destination || '—',
      toDestination: enquiry.travel_to_destination || '—',
      travelLabel,
      travellers,
      salesExecutive: userDisplayName(enquiry.assignee || payment.receiver),
      totalQuotation,
      alreadyPaid,
      received,
      balance,
    };
  }, [payment]);

  const handleShareReceipt = async () => {
    const element = document.getElementById('payment-receipt-print');
    if (!element || sharing || !paymentId) return;

    setSharing(true);
    try {
      const blob = await captureReceiptImage(element);
      const formData = new FormData();
      const fileName = `${String(receipt?.paymentCode || 'receipt').replace(/\//g, '-')}.png`;
      formData.append('receipt_image', blob, fileName);
      await paymentService.shareReceipt(paymentId, formData);
      enqueueSnackbar('Receipt shared to customer on WhatsApp', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(
        err?.response?.data?.message || err?.message || 'Failed to share receipt on WhatsApp',
        { variant: 'error' }
      );
    } finally {
      setSharing(false);
    }
  };

  if (isLoading) return <Loader message="Loading receipt..." />;
  if (!payment || !receipt) {
    return (
      <EmptyState
        title="Payment not found"
        actionLabel="Back"
        onAction={() => navigate(enquiryId ? `/enquiry/view/${enquiryId}` : '/enquiry')}
      />
    );
  }

  return (
    <Box className="print-document" sx={{ maxWidth: 920, mx: 'auto', pb: 4 }}>
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
          onClick={() => navigate(enquiryId ? `/enquiry/view/${enquiryId}` : '/enquiry')}
          sx={{ textTransform: 'none', fontWeight: 700 }}
        >
          Back to Enquiry
        </Button>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} useFlexGap>
          <Button
            variant="outlined"
            startIcon={<WhatsAppIcon />}
            disabled={sharing || !receipt.mobile || receipt.mobile === '—'}
            onClick={handleShareReceipt}
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
            {sharing ? 'Sharing…' : 'Share Receipt'}
          </Button>
        </Stack>
      </Stack>

      <Box
        id="payment-receipt-print"
        sx={{
          bgcolor: '#fff',
          border: '1px solid',
          borderColor: alpha('#0f172a', 0.12),
          borderRadius: 1,
          overflow: 'hidden',
          boxShadow: '0 12px 36px rgba(15,23,42,0.08)',
          px: { xs: 2, sm: 3.5 },
          py: { xs: 2.5, sm: 3.5 },
        }}
      >
        {/* Header */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'flex-start' }}
          spacing={2}
          sx={{ mb: 2.5 }}
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
            {showLogo ? (
              <Box
                component="img"
                src={logoUrl}
                alt={companyName}
                crossOrigin="anonymous"
                onError={() => setLogoFailed(true)}
                sx={{
                  width: 88,
                  height: 88,
                  borderRadius: '50%',
                  flexShrink: 0,
                  objectFit: 'cover',
                  border: '2px solid',
                  borderColor: alpha(GREEN, 0.35),
                  bgcolor: '#fff',
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 88,
                  height: 88,
                  borderRadius: '50%',
                  flexShrink: 0,
                  bgcolor: alpha(NAVY, 0.06),
                  border: '2px solid',
                  borderColor: alpha(GREEN, 0.35),
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 900,
                  color: NAVY,
                  fontSize: 28,
                }}
              >
                {companyName?.[0] || 'T'}
              </Box>
            )}
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 900,
                  color: NAVY,
                  fontSize: { xs: 16, sm: 18 },
                  letterSpacing: 0.3,
                  textTransform: 'uppercase',
                  lineHeight: 1.25,
                }}
              >
                {companyName}
              </Typography>
              {branding?.company_address && (
                <Typography
                  variant="body2"
                  sx={{ mt: 0.75, color: '#475569', lineHeight: 1.45, maxWidth: 420 }}
                >
                  {branding.company_address}
                </Typography>
              )}
              <Stack
                direction="row"
                spacing={1.5}
                flexWrap="wrap"
                useFlexGap
                sx={{ mt: 1 }}
              >
                {branding?.company_phone && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <PhoneOutlinedIcon sx={{ fontSize: 14, color: GREEN }} />
                    <Typography variant="caption" fontWeight={700} color={LABEL}>
                      {branding.company_phone}
                    </Typography>
                  </Stack>
                )}
                {branding?.company_email && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <EmailOutlinedIcon sx={{ fontSize: 14, color: GREEN }} />
                    <Typography variant="caption" fontWeight={700} color={LABEL}>
                      {branding.company_email}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Box>
          </Stack>

          <Box
            sx={{
              bgcolor: NAVY,
              color: '#fff',
              px: 2.5,
              py: 1.25,
              borderRadius: 0.75,
              alignSelf: { xs: 'stretch', md: 'flex-start' },
              textAlign: 'center',
              minWidth: 180,
            }}
          >
            <Typography
              sx={{
                fontWeight: 900,
                letterSpacing: 1.2,
                fontSize: 15,
                textTransform: 'uppercase',
              }}
            >
              Payment Receipt
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 2.5, borderColor: alpha(NAVY, 0.15) }} />

        {/* Receipt + Customer info */}
        <Grid container spacing={3} sx={{ mb: 2.5 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <InfoRow label="Receipt No." value={receipt.paymentCode} valueColor="#c62828" />
            <InfoRow label="Receipt Date" value={receipt.paymentDate} />
            <InfoRow label="Payment Mode" value={receipt.paymentMode} />
            <InfoRow label="Transaction ID" value={receipt.transactionId} />
            <InfoRow label="Reference No." value={receipt.referenceNo} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InfoRow label="Enquiry No." value={receipt.enquiryCode} />
            <InfoRow label="Quotation No." value={receipt.quotationCode} />
            <InfoRow label="Customer Name" value={receipt.customerName} />
            <InfoRow
              label="Mobile"
              value={
                <ContactNumberDisplay
                  value={receipt.mobile}
                  variant="whatsapp"
                  typographyVariant="body2"
                  color={NAVY}
                  fontWeight={700}
                />
              }
            />
            <InfoRow label="Email" value={receipt.email} />
          </Grid>
        </Grid>

        {/* Package + Amount boxes */}
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <DetailBox title="Package Details">
              <InfoRow label="Tour / Package Name" value={receipt.packageName} labelWidth={150} />
              <InfoRow label="From Destination" value={receipt.fromDestination} labelWidth={150} />
              <InfoRow label="To Destination" value={receipt.toDestination} labelWidth={150} />
              <InfoRow label="Travel Date" value={receipt.travelLabel} labelWidth={150} />
              <InfoRow label="No. of Travellers" value={receipt.travellers} labelWidth={150} />
              <InfoRow label="Sales Executive" value={receipt.salesExecutive} labelWidth={150} />
            </DetailBox>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <DetailBox title="Amount Details">
              <InfoRow
                label="Total Quotation Amount"
                value={formatInr(receipt.totalQuotation)}
                labelWidth={160}
              />
              <InfoRow
                label="Already Paid Amount"
                value={formatInr(receipt.alreadyPaid)}
                labelWidth={160}
              />
              <InfoRow
                label="Received Amount"
                value={formatInr(receipt.received)}
                valueColor="#1565c0"
                labelWidth={160}
              />
              <Divider sx={{ my: 1 }} />
              <InfoRow
                label="Balance Amount"
                value={formatInr(receipt.balance)}
                valueColor={GREEN}
                labelWidth={160}
              />
            </DetailBox>
          </Grid>
        </Grid>

        {/* Thanks banner */}
        <Box
          sx={{
            mt: 1,
            px: 2,
            py: 1.75,
            borderRadius: 1,
            bgcolor: alpha(GREEN, 0.08),
            border: '1px solid',
            borderColor: alpha(GREEN, 0.2),
          }}
        >
          <Typography variant="body2" sx={{ color: '#1e293b', lineHeight: 1.7 }}>
            Received with thanks from{' '}
            <Box component="span" fontWeight={800} sx={{ color: GREEN }}>
              {receipt.customerName}
            </Box>{' '}
            a sum of{' '}
            <Box component="span" fontWeight={800} sx={{ color: GREEN }}>
              {formatInr(receipt.received)} ({amountToIndianWords(receipt.received)})
            </Box>{' '}
            towards{' '}
            {receipt.paymentType === 'remaining' ? 'remaining / balance payment' : 'advance payment'}{' '}
            against the above referenced tour package.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
