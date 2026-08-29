import { useMemo } from 'react';
import {
  Box,
  Button,
  Chip,
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
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { formatDate } from '../../utils/formatters';
import { formatInr, summarizePricing } from '../../utils/itineraryPricing';
import { useEnquiryQuotations } from '../../hooks/queries/useQuotations';
import { usePayments } from '../../hooks/queries/useModules';

function invoiceNumberFromQuotation(q, enquiry) {
  if (q?.quotation_code) return String(q.quotation_code).replace(/^QT/i, 'INV');
  if (enquiry?.enquiry_code) return String(enquiry.enquiry_code).replace(/^ENQ/i, 'INV');
  return '—';
}

function quotationAmount(q, itineraries = []) {
  if (!q) return 0;
  const fromTotal = Number(q.total_amount);
  if (Number.isFinite(fromTotal) && fromTotal > 0) return fromTotal;
  const fromPricing = summarizePricing(q.pricing || {}).grandTotal;
  if (fromPricing > 0) return fromPricing;
  const itinerary = itineraries.find((i) => i.id === q.itinerary_id);
  const linkedItinerary = q.itinerary || itinerary;
  return summarizePricing(linkedItinerary?.pricing || {}).grandTotal || 0;
}

function buildInvoiceRows({ quotations = [], itineraries = [], enquiry, enquiryId, totalPaid = 0 }) {
  const itineraryMap = new Map((itineraries || []).map((item) => [item.id, item]));
  const rows = [];
  const quotedItineraryIds = new Set();

  (quotations || []).forEach((q) => {
    const itinerary = q.itinerary_id ? itineraryMap.get(q.itinerary_id) : null;
    if (q.itinerary_id) quotedItineraryIds.add(q.itinerary_id);

    const amount = Math.round(quotationAmount(q, itineraries));
    const balance = Math.max(amount - totalPaid, 0);
    const paidStatus =
      amount > 0 && balance <= 0 ? 'paid' : totalPaid > 0 ? 'partial' : 'unpaid';

    rows.push({
      key: q.id,
      quotation: q,
      itinerary,
      title:
        itinerary?.title ||
        q.package?.name ||
        enquiry?.package?.name ||
        (q.itinerary_id ? 'Itinerary quotation' : 'Direct quotation'),
      invoiceNo: invoiceNumberFromQuotation(q, enquiry),
      amount,
      balance,
      paidStatus,
      invoicePath: q.itinerary_id
        ? `/enquiry/${enquiryId}/quotation/${q.itinerary_id}/invoice`
        : `/enquiry/${enquiryId}/quotation/direct/invoice`,
      date:
        q.updated_at ||
        q.created_at ||
        itinerary?.from_date ||
        enquiry?.travel_from ||
        null,
    });
  });

  (itineraries || []).forEach((item) => {
    if (quotedItineraryIds.has(item.id)) return;

    const amount = Math.round(summarizePricing(item.pricing || {}).grandTotal || 0);
    const balance = Math.max(amount - totalPaid, 0);
    const paidStatus =
      amount > 0 && balance <= 0 ? 'paid' : totalPaid > 0 ? 'partial' : 'unpaid';

    rows.push({
      key: `itinerary-${item.id}`,
      quotation: null,
      itinerary: item,
      title: item.title || 'Itinerary',
      invoiceNo: invoiceNumberFromQuotation(null, enquiry),
      amount,
      balance,
      paidStatus,
      invoicePath: `/enquiry/${enquiryId}/quotation/${item.id}/invoice`,
      date: item.from_date || enquiry?.travel_from || null,
    });
  });

  return rows;
}

export default function EnquiryInvoicePanel({ enquiry, itineraries = [] }) {
  const enquiryId = enquiry?.id;
  const { data: quotations = [] } = useEnquiryQuotations(enquiryId);
  const { data: paymentsData } = usePayments({
    page: 1,
    perPage: 200,
    enquiry_id: enquiryId,
    sortBy: 'payment_date',
    sortOrder: 'asc',
  });

  const payments = paymentsData?.rows || [];
  const totalPaid = useMemo(
    () => payments.reduce((sum, p) => sum + (Number(p.advance_amount) || 0), 0),
    [payments]
  );

  const rows = useMemo(
    () =>
      buildInvoiceRows({
        quotations,
        itineraries,
        enquiry,
        enquiryId,
        totalPaid,
      }),
    [quotations, itineraries, enquiry, enquiryId, totalPaid]
  );

  const openInvoice = (path) => {
    window.open(path, '_blank', 'noopener,noreferrer');
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          mb: 2,
          pb: 1.25,
          borderBottom: '2px solid',
          borderColor: alpha('#db2777', 0.2),
          minHeight: 40,
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            display: 'grid',
            placeItems: 'center',
            bgcolor: alpha('#db2777', 0.12),
            color: '#db2777',
          }}
        >
          <ReceiptLongOutlinedIcon sx={{ fontSize: 18 }} />
        </Box>
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{
            letterSpacing: 0.2,
            background: 'linear-gradient(90deg, #db2777, #f472b6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Invoice
        </Typography>
      </Stack>

      {rows.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          No invoices yet.
        </Typography>
      ) : (
        <TableContainer
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: alpha('#db2777', 0.06) }}>
                <TableCell sx={{ fontWeight: 800 }}>Invoice No.</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Package / Itinerary</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Quotation No.</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="right">
                  Amount
                </TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="center">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.key}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => openInvoice(row.invoicePath)}
                >
                  <TableCell sx={{ fontWeight: 800, color: '#be185d' }}>
                    {row.invoiceNo}
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={700}>{row.title}</Typography>
                  </TableCell>
                  <TableCell sx={{ color: '#2563eb', fontWeight: 700 }}>
                    {row.quotation?.quotation_code || '—'}
                  </TableCell>
                  <TableCell>{formatDate(row.date, 'DD MMM YYYY')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>
                    {formatInr(row.amount)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={
                        row.paidStatus === 'paid'
                          ? 'Paid'
                          : row.paidStatus === 'partial'
                            ? 'Partial'
                            : 'Unpaid'
                      }
                      sx={{
                        fontWeight: 700,
                        textTransform: 'capitalize',
                        bgcolor:
                          row.paidStatus === 'paid'
                            ? alpha('#059669', 0.12)
                            : row.paidStatus === 'partial'
                              ? alpha('#d97706', 0.12)
                              : alpha('#64748b', 0.12),
                        color:
                          row.paidStatus === 'paid'
                            ? '#047857'
                            : row.paidStatus === 'partial'
                              ? '#b45309'
                              : '#475569',
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityOutlinedIcon />}
                      onClick={() => openInvoice(row.invoicePath)}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        borderRadius: 2,
                        color: '#db2777',
                        borderColor: alpha('#db2777', 0.45),
                        '&:hover': {
                          borderColor: '#db2777',
                          bgcolor: alpha('#db2777', 0.08),
                        },
                      }}
                    >
                      Invoice
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
