import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Link,
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
import { Link as RouterLink } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { useAssignedTrips } from '../../hooks/queries/useEnquiry';
import { formatCurrency, formatDate, formatRouteLabel } from '../../utils/formatters';
import OwnershipTag from '../common/OwnershipTag';

const ACCENT = '#0f766e';

/**
 * Popup listing assigned trips for a vehicle or driver.
 * @param {{ type: 'vehicle'|'driver', id: string, title: string, subtitle?: string } | null} target
 */
export default function AssignedTripsDialog({ target, onClose }) {
  const open = Boolean(target?.id);
  const params =
    target?.type === 'vehicle'
      ? { vehicle_id: target.id }
      : target?.type === 'driver'
        ? { driver_id: target.id }
        : null;

  const { data, isLoading } = useAssignedTrips(params, open);
  const trips = data?.trips || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack spacing={0.5}>
          <Typography variant="h6" fontWeight={800}>
            Assigned Trip List — {target?.type === 'vehicle' ? 'Vehicle' : 'Driver'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {target?.title}
            {target?.subtitle ? ` · ${target.subtitle}` : ''}
          </Typography>
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent>
        {isLoading ? (
          <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
            Loading assigned trips…
          </Typography>
        ) : trips.length === 0 ? (
          <Box
            sx={{
              py: 5,
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: alpha('#0f172a', 0.03),
            }}
          >
            <Typography fontWeight={700} sx={{ mb: 0.5 }}>
              No assigned trips
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This {target?.type} has no trip assignments yet.
            </Typography>
          </Box>
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
                <TableRow sx={{ bgcolor: alpha(ACCENT, 0.06) }}>
                  <TableCell sx={{ fontWeight: 800 }}>S.No</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Enquiry ID</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Trip Dates</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>
                    {target?.type === 'vehicle' ? 'Driver' : 'Vehicle'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Route</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Source</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trips.map((t, index) => {
                  const enquiryId = t.enquiry?.id;
                  const enquiryCode = t.enquiry?.enquiry_code || t.reference_code || '—';
                  return (
                    <TableRow key={`${t.source}-${t.id}`} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {enquiryId ? (
                          <Link
                            component={RouterLink}
                            to={`/enquiry/view/${enquiryId}`}
                            underline="hover"
                            fontWeight={700}
                            variant="body2"
                            onClick={onClose}
                          >
                            {enquiryCode}
                          </Link>
                        ) : (
                          <Typography variant="body2" fontWeight={700}>
                            {enquiryCode}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {t.customer_name || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {formatDate(t.start_date)} – {formatDate(t.end_date)}
                      </TableCell>
                      <TableCell>
                        {target?.type === 'vehicle' ? (
                          t.driver?.full_name || t.vendor_driver_name ? (
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {t.driver?.full_name || t.vendor_driver_name}
                              </Typography>
                              <Box sx={{ mt: 0.4 }}>
                                {t.driver ? (
                                  <OwnershipTag record={t.driver} />
                                ) : (
                                  <OwnershipTag type="vendor" />
                                )}
                              </Box>
                            </Box>
                          ) : (
                            '—'
                          )
                        ) : t.vehicle?.name || t.vehicle?.registration_number ? (
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {t.vehicle?.name || t.vehicle?.registration_number}
                            </Typography>
                            <Box sx={{ mt: 0.4 }}>
                              <OwnershipTag record={t.vehicle} />
                            </Box>
                          </Box>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {formatRouteLabel(
                            t.pickup_location,
                            t.drop_location,
                            t.travel_from || t.travel_to
                              ? `${formatDate(t.travel_from)} – ${formatDate(t.travel_to)}`
                              : '—'
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {formatCurrency(t.amount)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={t.source === 'booking' ? 'Booking' : 'Enquiry'}
                          sx={{
                            height: 22,
                            fontWeight: 700,
                            textTransform: 'capitalize',
                            bgcolor:
                              t.source === 'booking'
                                ? alpha('#7c3aed', 0.1)
                                : alpha(ACCENT, 0.12),
                            color: t.source === 'booking' ? '#6d28d9' : ACCENT,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={t.status || 'allocated'} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="contained" sx={{ textTransform: 'none', fontWeight: 700 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
