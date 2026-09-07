import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import dayjs from 'dayjs';
import { DatePickerField } from '../forms/FormDatePicker';
import { usePayments, usePaymentMutation } from '../../hooks/queries/useModules';
import { useEnquiryQuotations } from '../../hooks/queries/useQuotations';
import { usePaymentModes } from '../../hooks/queries/useMasters';
import { useUsers } from '../../hooks/queries/useUsers';
import { useAuth } from '../../hooks/useAuth';
import { usePermission } from '../../hooks/usePermission';
import { isEnquiryActionsLocked } from '../../utils/leadStatusPipeline';
import { formatDate } from '../../utils/formatters';
import { formatInr, summarizePricing } from '../../utils/itineraryPricing';

function userDisplayName(user) {
  if (!user) return '—';
  return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || 'User';
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

/** Match quotation tab logic: standalone, confirmed itinerary quote, then pricing fallbacks. */
function resolveEnquiryQuotationSource(quotations = [], itineraries = []) {
  const standalone = (quotations || []).find((q) => !q.itinerary_id) || null;
  if (standalone) {
    const amount = quotationAmount(standalone, itineraries);
    if (amount > 0) {
      return { quotation: standalone, amount };
    }
  }

  const confirmed = (itineraries || []).filter(
    (item) => String(item.status || '').toLowerCase() === 'confirmed'
  );

  for (const item of confirmed) {
    const linked = (quotations || []).find((q) => q.itinerary_id === item.id);
    const amount = linked
      ? quotationAmount(linked, itineraries)
      : summarizePricing(item.pricing || {}).grandTotal;
    if (amount > 0) {
      return { quotation: linked || null, amount, itinerary: item };
    }
  }

  for (const q of quotations || []) {
    const amount = quotationAmount(q, itineraries);
    if (amount > 0) {
      return { quotation: q, amount };
    }
  }

  for (const item of itineraries || []) {
    const amount = summarizePricing(item.pricing || {}).grandTotal;
    if (amount > 0) {
      return { quotation: null, amount, itinerary: item };
    }
  }

  return { quotation: null, amount: 0 };
}

const emptyForm = {
  payment_type: 'advance',
  payment_date: dayjs().format('YYYY-MM-DD'),
  payment_mode: '',
  bank_name: '',
  reference_no: '',
  notes: '',
  advance_amount: '',
  additional_charges: '',
  transaction_id: '',
  received_by: '',
  quotation_id: '',
};

export default function EnquiryPaymentPanel({ enquiry, itineraries = [] }) {
  const canEdit = usePermission('enquiries.edit') && !isEnquiryActionsLocked(enquiry);
  const canCreate = (usePermission('receipts.create') || canEdit) && !isEnquiryActionsLocked(enquiry);
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState('');
  const fileInputRef = useRef(null);

  const enquiryId = enquiry?.id;
  const { data: paymentsData, refetch } = usePayments({
    page: 1,
    perPage: 100,
    enquiry_id: enquiryId,
    sortBy: 'payment_date',
    sortOrder: 'desc',
  });
  const { data: quotations = [] } = useEnquiryQuotations(enquiryId);
  const { data: modesData } = usePaymentModes({
    page: 1,
    perPage: 100,
    is_active: true,
    sortBy: 'display_order',
    sortOrder: 'asc',
  });
  const { data: usersData } = useUsers({
    page: 1,
    perPage: 300,
    sortBy: 'first_name',
    sortOrder: 'asc',
  });
  const { create } = usePaymentMutation();

  const payments = paymentsData?.rows || [];
  const paymentModes = modesData?.rows || [];
  const users = usersData?.rows || [];

  const { quotation: primaryQuotation, amount: resolvedQuotationAmount } = useMemo(
    () => resolveEnquiryQuotationSource(quotations, itineraries),
    [quotations, itineraries]
  );

  const selectedQuotation = useMemo(() => {
    if (form.quotation_id) {
      return quotations.find((q) => q.id === form.quotation_id) || primaryQuotation;
    }
    return primaryQuotation;
  }, [form.quotation_id, quotations, primaryQuotation]);

  const totalQuotationAmount = useMemo(() => {
    if (form.quotation_id) {
      const picked = quotations.find((q) => q.id === form.quotation_id);
      const pickedAmount = quotationAmount(picked, itineraries);
      if (pickedAmount > 0) return pickedAmount;
    }
    if (resolvedQuotationAmount > 0) return resolvedQuotationAmount;
    return quotationAmount(selectedQuotation, itineraries);
  }, [
    form.quotation_id,
    quotations,
    itineraries,
    resolvedQuotationAmount,
    selectedQuotation,
  ]);
  const alreadyPaid = useMemo(
    () => payments.reduce((sum, p) => sum + (Number(p.advance_amount) || 0), 0),
    [payments]
  );
  const alreadyAdditional = useMemo(
    () => payments.reduce((sum, p) => sum + (Number(p.additional_charges) || 0), 0),
    [payments]
  );
  const remainingDue = Math.max(totalQuotationAmount - alreadyPaid, 0);
  const additionalCharges = Math.max(Number(form.additional_charges) || 0, 0);
  const hasAdvancePaid = alreadyPaid > 0;
  const isRemaining = form.payment_type === 'remaining';
  const paymentAmount = Number(form.advance_amount) || 0;
  const receivedNow = paymentAmount + additionalCharges;
  const paymentPercentage =
    totalQuotationAmount > 0
      ? Number(((paymentAmount / totalQuotationAmount) * 100).toFixed(2))
      : 0;
  const balanceAmount = Math.max(remainingDue - paymentAmount, 0);
  const progressAfterSave =
    totalQuotationAmount > 0
      ? Math.min(((alreadyPaid + paymentAmount) / totalQuotationAmount) * 100, 100)
      : 0;

  useEffect(() => {
    if (!proofFile) {
      setProofPreview('');
      return undefined;
    }
    if (!String(proofFile.type || '').startsWith('image/')) {
      setProofPreview('');
      return undefined;
    }
    const url = URL.createObjectURL(proofFile);
    setProofPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [proofFile]);

  const openDialog = () => {
    const defaultType = hasAdvancePaid && remainingDue > 0 ? 'remaining' : 'advance';
    const defaultAmount =
      defaultType === 'remaining' && remainingDue > 0 ? String(remainingDue) : '';
    setForm({
      ...emptyForm,
      payment_type: defaultType,
      payment_date: dayjs().format('YYYY-MM-DD'),
      payment_mode: paymentModes[0]?.name || '',
      received_by: user?.id || '',
      quotation_id: primaryQuotation?.id || '',
      advance_amount: defaultAmount,
    });
    setProofFile(null);
    setOpen(true);
  };

  const closeDialog = () => {
    if (create.isPending) return;
    setOpen(false);
    setProofFile(null);
  };

  const handlePaymentTypeChange = (type) => {
    setForm((prev) => ({
      ...prev,
      payment_type: type,
      advance_amount:
        type === 'remaining' && remainingDue > 0 ? String(remainingDue) : prev.advance_amount,
    }));
  };

  const savePayment = async () => {
    if (!form.payment_date || !form.payment_mode || !form.advance_amount || !form.received_by) {
      return;
    }
    if (paymentAmount <= 0) return;
    if (paymentAmount > remainingDue + 0.001) return;

    const fd = new FormData();
    fd.append('enquiry_id', enquiryId);
    if (form.quotation_id) fd.append('quotation_id', form.quotation_id);
    fd.append('payment_type', form.payment_type || 'advance');
    fd.append('payment_date', form.payment_date);
    fd.append('payment_mode', form.payment_mode);
    fd.append('bank_name', form.bank_name || '');
    fd.append('reference_no', form.reference_no || '');
    fd.append('notes', form.notes || '');
    fd.append('advance_amount', String(paymentAmount));
    fd.append('additional_charges', String(additionalCharges));
    fd.append('advance_percentage', String(paymentPercentage));
    fd.append('quotation_amount', String(totalQuotationAmount));
    fd.append('transaction_id', form.transaction_id || '');
    fd.append('received_by', form.received_by);
    if (proofFile) fd.append('proof_file', proofFile);

    await create.mutateAsync(fd);
    setOpen(false);
    setProofFile(null);
    refetch();
  };

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const dialogTitle = isRemaining ? 'Remaining Payment' : 'Advance Payment';
  const dialogSubtitle = isRemaining
    ? 'Collect remaining balance against quotation.'
    : 'Create advance payment for quotation.';
  const amountLabel = isRemaining ? 'Remaining Amount (₹) *' : 'Advance Amount (₹) *';
  const percentLabel = isRemaining ? 'Remaining Percentage' : 'Advance Percentage';
  const confirmNote = isRemaining
    ? remainingDue > 0 && paymentAmount >= remainingDue
      ? 'This will clear the full remaining balance for this quotation.'
      : 'This payment will reduce the outstanding balance.'
    : 'This is an advance payment. Balance amount can be collected later.';

  return (
    <Box sx={{ position: 'relative', pt: canCreate ? 0.5 : 0 }}>
      {canCreate && (
        <Button
          variant="contained"
          disableElevation
          startIcon={<AddIcon />}
          onClick={openDialog}
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 1,
            textTransform: 'none',
            fontWeight: 800,
            borderRadius: 2.5,
            px: 2.25,
            py: 1,
            bgcolor: '#7c3aed',
            boxShadow: '0 8px 20px rgba(124,58,237,0.28)',
            '&:hover': { bgcolor: '#6d28d9' },
          }}
        >
          Add Payment
        </Button>
      )}

      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          mb: 2,
          pb: 1.25,
          pr: canCreate ? 18 : 0,
          borderBottom: '2px solid',
          borderColor: alpha('#7c3aed', 0.2),
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
            bgcolor: alpha('#7c3aed', 0.12),
            color: '#7c3aed',
          }}
        >
          <PaymentsOutlinedIcon sx={{ fontSize: 18 }} />
        </Box>
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{
            letterSpacing: 0.2,
            background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Payment
        </Typography>
      </Stack>

      {/* Quick amount strip from quotation */}
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha('#7c3aed', 0.06),
              border: '1px solid',
              borderColor: alpha('#7c3aed', 0.15),
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              Quotation Amount
            </Typography>
            <Typography fontWeight={800} color="#5b21b6">
              {formatInr(totalQuotationAmount)}
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha('#2563eb', 0.06),
              border: '1px solid',
              borderColor: alpha('#2563eb', 0.15),
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              Total Paid
            </Typography>
            <Typography fontWeight={800} color="#1d4ed8">
              {formatInr(alreadyPaid + alreadyAdditional)}
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha('#059669', 0.06),
              border: '1px solid',
              borderColor: alpha('#059669', 0.15),
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              Balance
            </Typography>
            <Typography fontWeight={800} color="#047857">
              {formatInr(Math.max(totalQuotationAmount - alreadyPaid, 0))}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {payments.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          No payments recorded yet. Click Add Payment to create a payment.
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
              <TableRow sx={{ bgcolor: alpha('#7c3aed', 0.06) }}>
                <TableCell sx={{ fontWeight: 800 }}>Payment No.</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Mode</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="right">
                  Amount
                </TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Received By</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Reference</TableCell>
                <TableCell sx={{ fontWeight: 800, width: 120 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: '#5b21b6' }}>
                    {row.payment_code}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={
                        String(row.payment_type || 'advance').toLowerCase() === 'remaining'
                          ? 'Remaining'
                          : 'Advance'
                      }
                      sx={{
                        fontWeight: 700,
                        textTransform: 'capitalize',
                        bgcolor:
                          String(row.payment_type || '').toLowerCase() === 'remaining'
                            ? alpha('#059669', 0.12)
                            : alpha('#2563eb', 0.12),
                        color:
                          String(row.payment_type || '').toLowerCase() === 'remaining'
                            ? '#047857'
                            : '#1d4ed8',
                      }}
                    />
                  </TableCell>
                  <TableCell>{formatDate(row.payment_date, 'DD/MM/YYYY')}</TableCell>
                  <TableCell>{row.payment_mode || '—'}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {formatInr(row.advance_amount)}
                    {Number(row.additional_charges) > 0 ? (
                      <Typography variant="caption" display="block" color="text.secondary">
                        + {formatInr(row.additional_charges)} extra
                      </Typography>
                    ) : null}
                  </TableCell>
                  <TableCell>{userDisplayName(row.receiver)}</TableCell>
                  <TableCell sx={{ maxWidth: 160, wordBreak: 'break-word' }}>
                    {row.reference_no || row.transaction_id || '—'}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ReceiptLongOutlinedIcon sx={{ fontSize: 16 }} />}
                      onClick={() =>
                        window.open(
                          `/enquiry/${enquiryId}/payments/${row.id}/receipt`,
                          '_blank'
                        )
                      }
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        borderRadius: 2,
                        whiteSpace: 'nowrap',
                        color: '#7c3aed',
                        borderColor: alpha('#7c3aed', 0.45),
                        '&:hover': {
                          borderColor: '#7c3aed',
                          bgcolor: alpha('#7c3aed', 0.08),
                        },
                      }}
                    >
                      Receipt
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={closeDialog} maxWidth="md" fullWidth scroll="paper">
        <DialogTitle sx={{ pb: 1.25 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={1}
          >
            <Box>
              <Typography fontWeight={800} fontSize={20}>
                {dialogTitle}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dialogSubtitle}
              </Typography>
            </Box>
            <Chip
              label={isRemaining ? 'Remaining' : 'Advance'}
              size="small"
              sx={{
                fontWeight: 700,
                bgcolor: isRemaining ? alpha('#059669', 0.12) : alpha('#2563eb', 0.12),
                color: isRemaining ? '#047857' : '#1d4ed8',
              }}
            />
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ bgcolor: alpha('#0f172a', 0.02) }}>
          {/* Reference info */}
          <Box
            sx={{
              mb: 2,
              p: 1.75,
              borderRadius: 2.5,
              bgcolor: '#fff',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Enquiry ID
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {enquiry?.enquiry_code || '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Customer Name
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {enquiry?.customer_name || '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Quotation No.
                </Typography>
                {quotations.length > 1 ? (
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={form.quotation_id}
                    onChange={(e) => setField('quotation_id', e.target.value)}
                    sx={{ mt: 0.5 }}
                  >
                    {quotations.map((q) => (
                      <MenuItem key={q.id} value={q.id}>
                        {q.quotation_code}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : (
                  <Typography variant="body2" fontWeight={700} color="#2563eb">
                    {selectedQuotation?.quotation_code || '—'}
                  </Typography>
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Quotation Amount
                </Typography>
                <Typography variant="body2" fontWeight={800}>
                  {formatInr(totalQuotationAmount)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Status
                </Typography>
                <Box sx={{ mt: 0.35 }}>
                  <Chip
                    size="small"
                    label={selectedQuotation?.status || 'Draft'}
                    sx={{
                      textTransform: 'capitalize',
                      fontWeight: 700,
                      bgcolor: alpha('#059669', 0.12),
                      color: '#047857',
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: '#fff',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography fontWeight={800} sx={{ mb: 1.75 }}>
                  Payment Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Payment Type *"
                      value={form.payment_type}
                      onChange={(e) => handlePaymentTypeChange(e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { minHeight: 52 } }}
                    >
                      <MenuItem value="advance">Advance Payment</MenuItem>
                      <MenuItem value="remaining" disabled={!hasAdvancePaid || remainingDue <= 0}>
                        Remaining Payment
                        {hasAdvancePaid && remainingDue > 0
                          ? ` (Due: ${formatInr(remainingDue)})`
                          : ''}
                      </MenuItem>
                    </TextField>
                    {hasAdvancePaid && remainingDue > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        Advance already paid: {formatInr(alreadyPaid)}. Remaining due:{' '}
                        {formatInr(remainingDue)}.
                      </Typography>
                    )}
                    {remainingDue <= 0 && hasAdvancePaid && (
                      <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: 'block' }}>
                        Quotation is fully paid. No remaining balance.
                      </Typography>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DatePickerField
                      label="Payment Date *"
                      value={form.payment_date}
                      onChange={(v) => setField('payment_date', v)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Payment Mode *"
                      value={form.payment_mode}
                      onChange={(e) => setField('payment_mode', e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { minHeight: 52 } }}
                    >
                      {paymentModes.map((m) => (
                        <MenuItem key={m.id} value={m.name}>
                          {m.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Bank Name"
                      value={form.bank_name}
                      onChange={(e) => setField('bank_name', e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { minHeight: 52 } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label={amountLabel}
                      type="number"
                      inputProps={{ min: 0, max: remainingDue || undefined, step: '0.01' }}
                      value={form.advance_amount}
                      onChange={(e) => setField('advance_amount', e.target.value)}
                      helperText={
                        remainingDue > 0 ? `Max receivable now: ${formatInr(remainingDue)}` : undefined
                      }
                      sx={{ '& .MuiOutlinedInput-root': { minHeight: 52 } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Additional Charges (₹)"
                      type="number"
                      inputProps={{ min: 0, step: '0.01' }}
                      value={form.additional_charges}
                      onChange={(e) => setField('additional_charges', e.target.value)}
                      helperText="Optional extra amount. Not counted against quotation balance."
                      sx={{ '& .MuiOutlinedInput-root': { minHeight: 52 } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Reference No."
                      value={form.reference_no}
                      onChange={(e) => setField('reference_no', e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { minHeight: 52 } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label={percentLabel}
                      value={`${paymentPercentage.toFixed(2)}%`}
                      InputProps={{ readOnly: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          minHeight: 52,
                          bgcolor: alpha('#2563eb', 0.06),
                        },
                        '& .MuiInputBase-input': {
                          fontWeight: 800,
                          color: '#1d4ed8',
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Transaction ID / UTR No."
                      value={form.transaction_id}
                      onChange={(e) => setField('transaction_id', e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { minHeight: 52 } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Received By *"
                      value={form.received_by}
                      onChange={(e) => setField('received_by', e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { minHeight: 52 } }}
                    >
                      {users.map((u) => (
                        <MenuItem key={u.id} value={u.id}>
                          {userDisplayName(u)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      minRows={2}
                      label="Notes"
                      value={form.notes}
                      onChange={(e) => setField('notes', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: '#fff',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography fontWeight={800} sx={{ mb: 1.25 }}>
                  Payment Proof
                </Typography>
                <Box
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    border: '2px dashed',
                    borderColor: alpha('#7c3aed', 0.35),
                    borderRadius: 2,
                    p: 2.5,
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: alpha('#7c3aed', 0.03),
                    '&:hover': { bgcolor: alpha('#7c3aed', 0.06) },
                  }}
                >
                  <CloudUploadOutlinedIcon sx={{ color: '#7c3aed', mb: 0.5 }} />
                  <Typography variant="body2" fontWeight={700}>
                    Drag & drop files here or click to browse
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    JPG, PNG, PDF (Max 5MB)
                  </Typography>
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) return;
                      setProofFile(file);
                    }}
                  />
                </Box>
                {proofFile && (
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1.5 }}>
                    {proofPreview ? (
                      <Box
                        component="img"
                        src={proofPreview}
                        alt="Proof"
                        sx={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 1.5 }}
                      />
                    ) : (
                      <DescriptionOutlinedIcon color="action" />
                    )}
                    <Typography variant="body2" sx={{ flex: 1 }} noWrap>
                      {proofFile.name}
                    </Typography>
                    <IconButton size="small" onClick={() => setProofFile(null)}>
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: '#fff',
                  border: '1px solid',
                  borderColor: 'divider',
                  mb: 2,
                }}
              >
                <Typography fontWeight={800} sx={{ mb: 1.5 }}>
                  Amount Summary
                </Typography>
                <Stack spacing={1.1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Total Quotation Amount
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {formatInr(totalQuotationAmount)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Already Paid Amount
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {formatInr(alreadyPaid)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      {isRemaining ? 'Remaining Amount' : 'Advance Amount'}
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="#1d4ed8">
                      {formatInr(paymentAmount)}
                    </Typography>
                  </Stack>
                  {additionalCharges > 0 && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Additional Charges
                      </Typography>
                      <Typography variant="body2" fontWeight={700} color="#7c3aed">
                        {formatInr(additionalCharges)}
                      </Typography>
                    </Stack>
                  )}
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" fontWeight={800}>
                      Balance Amount
                    </Typography>
                    <Typography variant="body2" fontWeight={900} color="#047857">
                      {formatInr(balanceAmount)}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>

              <Box
                sx={{
                  p: 1.75,
                  borderRadius: 2.5,
                  bgcolor: alpha(isRemaining ? '#2563eb' : '#059669', 0.08),
                  border: '1px solid',
                  borderColor: alpha(isRemaining ? '#2563eb' : '#059669', 0.2),
                  mb: 2,
                }}
              >
                <Typography
                  variant="body2"
                  color={isRemaining ? '#1d4ed8' : '#047857'}
                  fontWeight={600}
                >
                  {confirmNote}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: '#fff',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography fontWeight={800} sx={{ mb: 1 }}>
                  Payment History
                </Typography>
                {payments.length === 0 ? (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha('#f59e0b', 0.08),
                      textAlign: 'center',
                    }}
                  >
                    <DescriptionOutlinedIcon sx={{ color: '#d97706', mb: 0.5 }} />
                    <Typography variant="caption" color="text.secondary" display="block">
                      No payments recorded yet. This will be your first payment.
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={1} sx={{ maxHeight: 180, overflowY: 'auto' }}>
                    {payments.slice(0, 5).map((p) => (
                      <Box
                        key={p.id}
                        sx={{
                          p: 1,
                          borderRadius: 1.5,
                          bgcolor: alpha('#0f172a', 0.03),
                        }}
                      >
                        <Typography variant="caption" fontWeight={700} display="block">
                          {p.payment_code}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(p.payment_date, 'DD/MM/YYYY')} · {formatInr(p.advance_amount)}
                          {Number(p.additional_charges) > 0
                            ? ` + ${formatInr(p.additional_charges)} extra`
                            : ''}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            </Grid>
          </Grid>

          {/* Footer progress */}
          <Box
            sx={{
              mt: 2,
              p: 1.75,
              borderRadius: 2.5,
              bgcolor: alpha('#2563eb', 0.06),
              border: '1px solid',
              borderColor: alpha('#2563eb', 0.15),
            }}
          >
            <Grid container spacing={1.5} alignItems="center">
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Total Quotation
                </Typography>
                <Typography variant="body2" fontWeight={800}>
                  {formatInr(totalQuotationAmount)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Total Paid
                </Typography>
                <Typography variant="body2" fontWeight={800} color="#1d4ed8">
                  {formatInr(alreadyPaid + alreadyAdditional + receivedNow)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Balance
                </Typography>
                <Typography variant="body2" fontWeight={800} color="#047857">
                  {formatInr(balanceAmount)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Payment Progress
                </Typography>
                <Typography variant="body2" fontWeight={800} sx={{ mb: 0.5 }}>
                  {progressAfterSave.toFixed(2)}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progressAfterSave}
                  sx={{
                    height: 6,
                    borderRadius: 99,
                    bgcolor: alpha('#2563eb', 0.15),
                    '& .MuiLinearProgress-bar': { bgcolor: '#2563eb', borderRadius: 99 },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeDialog} disabled={create.isPending} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={savePayment}
            disabled={
              create.isPending ||
              !form.payment_date ||
              !form.payment_mode ||
              !form.advance_amount ||
              !form.received_by ||
              paymentAmount <= 0 ||
              paymentAmount > remainingDue + 0.001 ||
              remainingDue <= 0
            }
            sx={{
              textTransform: 'none',
              fontWeight: 800,
              bgcolor: '#2563eb',
              '&:hover': { bgcolor: '#1d4ed8' },
            }}
          >
            {create.isPending ? 'Saving…' : 'Save Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
