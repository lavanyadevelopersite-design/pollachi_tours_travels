import { useMemo } from 'react';
import {
  Box,
  Button,
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
import AddIcon from '@mui/icons-material/Add';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { formatDate, formatTripDuration } from '../../utils/formatters';
import { resolveTripDates } from '../../utils/tripDates';
import { formatInr, summarizePricing } from '../../utils/itineraryPricing';
import { useEnquiryQuotations } from '../../hooks/queries/useQuotations';
import { usePermissions } from '../../hooks/usePermission';
import { isEnquiryActionsLocked } from '../../utils/leadStatusPipeline';

const viewBtnSx = {
  textTransform: 'none',
  fontWeight: 700,
  borderRadius: 2,
  color: '#2563eb',
  borderColor: '#2563eb',
  bgcolor: 'transparent',
  '&:hover': {
    bgcolor: 'transparent',
    borderColor: '#1d4ed8',
    color: '#1d4ed8',
  },
};

const editBtnSx = {
  textTransform: 'none',
  fontWeight: 700,
  borderRadius: 2,
  color: '#d97706',
  borderColor: '#d97706',
  bgcolor: 'transparent',
  '&:hover': {
    bgcolor: 'transparent',
    borderColor: '#b45309',
    color: '#b45309',
  },
};

export default function EnquiryQuotationPanel({ enquiry, itineraries = [] }) {
  const enquiryId = enquiry?.id;
  const { can } = usePermissions();
  const canEdit =
    !isEnquiryActionsLocked(enquiry) &&
    (can('enquiries.edit') || can('quotations.create') || can('quotations.edit'));
  const { data: quotations = [] } = useEnquiryQuotations(enquiryId);

  const confirmed = useMemo(
    () =>
      (itineraries || []).filter(
        (item) => String(item.status || '').toLowerCase() === 'confirmed'
      ),
    [itineraries]
  );

  const quotationByItinerary = useMemo(() => {
    const map = new Map();
    (quotations || []).forEach((q) => {
      if (q.itinerary_id) map.set(q.itinerary_id, q);
    });
    return map;
  }, [quotations]);

  const standalone = useMemo(
    () => (quotations || []).find((q) => !q.itinerary_id) || null,
    [quotations]
  );

  const openInNewTab = (path) => {
    window.open(path, '_blank', 'noopener,noreferrer');
  };

  const openDirectEdit = () => openInNewTab(`/enquiry/${enquiryId}/quotation/direct/edit`);
  const hasRows = Boolean(standalone) || confirmed.length > 0;

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'flex-start' }}
        spacing={1.5}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Typography
            component="h3"
            sx={{
              fontWeight: 900,
              fontSize: { xs: 22, sm: 26 },
              letterSpacing: 0.2,
              color: '#1e3a8a',
              lineHeight: 1.25,
              mb: 1,
            }}
          >
            Quotation
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: 560, lineHeight: 1.6 }}
          >
            Create a quotation without an itinerary, using the same pricing page as itinerary
            costing. Confirmed itinerary quotations also appear here.
          </Typography>
        </Box>
        {canEdit && (
          <Button
            variant="contained"
            disableElevation
            startIcon={<AddIcon />}
            onClick={openDirectEdit}
            sx={{
              textTransform: 'none',
              fontWeight: 800,
              borderRadius: 2.5,
              px: 2.25,
              py: 1,
              bgcolor: '#2563eb',
              boxShadow: '0 8px 20px rgba(37,99,235,0.28)',
              '&:hover': { bgcolor: '#1d4ed8' },
              alignSelf: { xs: 'stretch', sm: 'center' },
              whiteSpace: 'nowrap',
            }}
          >
            {standalone ? 'Edit Quotation' : 'Add Quotation'}
          </Button>
        )}
      </Stack>

      {!hasRows ? (
        <Box
          sx={{
            py: 6,
            textAlign: 'center',
            borderRadius: 3,
            border: '1px dashed',
            borderColor: alpha('#2563eb', 0.28),
            bgcolor: alpha('#2563eb', 0.04),
          }}
        >
          <Typography fontWeight={800} color="#2563eb" mb={1}>
            No quotation yet
          </Typography>
          <Typography variant="body2" color="text.secondary" maxWidth={420} mx="auto" mb={2}>
            Add a quotation now, without creating an itinerary. You can still attach itinerary
            quotations later after an itinerary is confirmed.
          </Typography>
          {canEdit && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openDirectEdit}
              sx={{ textTransform: 'none', fontWeight: 800 }}
            >
              Add Quotation
            </Button>
          )}
        </Box>
      ) : (
        <TableContainer
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: alpha('#2563eb', 0.18),
            bgcolor: '#fff',
            boxShadow: '0 10px 28px rgba(37,99,235,0.08)',
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: alpha('#2563eb', 0.06) }}>
                <TableCell sx={{ fontWeight: 800 }}>Quotation</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Travel Dates</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="right">
                  Amount
                </TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="center">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {standalone && (
                <TableRow hover>
                  <TableCell>
                    <Typography fontWeight={800}>
                      {standalone.quotation_code || 'Quotation'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Direct quotation
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {formatDate(standalone.travel_from || enquiry?.travel_from)}
                    {' → '}
                    {formatDate(standalone.travel_to || enquiry?.travel_to)}
                  </TableCell>
                  <TableCell>
                    {formatTripDuration(
                      standalone.travel_from || enquiry?.travel_from,
                      standalone.travel_to || enquiry?.travel_to
                    ) || '—'}
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={800} color="#0f766e">
                      {formatInr(
                        Number(standalone.total_amount) ||
                          summarizePricing(standalone.pricing || {}).grandTotal
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityOutlinedIcon />}
                        onClick={() =>
                          openInNewTab(`/enquiry/${enquiryId}/quotation/direct`)
                        }
                        sx={viewBtnSx}
                      >
                        View
                      </Button>
                      {canEdit && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditOutlinedIcon />}
                        onClick={openDirectEdit}
                        sx={editBtnSx}
                      >
                        Edit
                      </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              )}
              {confirmed.map((item) => {
                const q = quotationByItinerary.get(item.id);
                const amount = q
                  ? Number(q.total_amount) || summarizePricing(q.pricing || {}).grandTotal
                  : summarizePricing(item.pricing || {}).grandTotal;
                const trip = resolveTripDates({ enquiry, itinerary: item, quotation: q });

                return (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Typography fontWeight={800}>{item.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Itinerary quotation
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {trip.from ? formatDate(trip.from) : '—'}
                      {' → '}
                      {trip.to ? formatDate(trip.to) : '—'}
                    </TableCell>
                    <TableCell>
                      {formatTripDuration(trip.from, trip.to) ||
                        `${item.days || 0}D / ${item.nights || 0}N`}
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={800} color="#0f766e">
                        {formatInr(amount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<VisibilityOutlinedIcon />}
                          onClick={() =>
                            openInNewTab(`/enquiry/${enquiryId}/quotation/${item.id}`)
                          }
                          sx={viewBtnSx}
                        >
                          View
                        </Button>
                        {canEdit && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditOutlinedIcon />}
                          onClick={() =>
                            openInNewTab(`/enquiry/${enquiryId}/quotation/${item.id}/edit`)
                          }
                          sx={editBtnSx}
                        >
                          Edit
                        </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
