import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import RefreshIcon from '@mui/icons-material/Refresh';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import PasswordTextField from '../forms/PasswordTextField';
import { DatePickerField } from '../forms/FormDatePicker';
import ConfirmDialog from '../common/ConfirmDialog';
import ContactNumberDisplay from '../common/ContactNumberDisplay';
import {
  useEnquiryVehicleAssignments,
  useEnquiryVehicleMutation,
  useAssignableResources,
} from '../../hooks/queries/useEnquiry';
import { usePermission } from '../../hooks/usePermission';
import { formatDate } from '../../utils/formatters';
import { formatInr } from '../../utils/itineraryPricing';
import OwnershipTag from '../common/OwnershipTag';
import masterService from '../../services/master.service';
import enquiryService from '../../services/enquiry.service';
import AssignedTripsDialog from '../masters/AssignedTripsDialog';

const ACCENT = '#0f766e';

function buildDriverShareLink(enquiry, assignment) {
  const enquiryKey = enquiry?.enquiry_code || enquiry?.id;
  const params = new URLSearchParams();
  if (enquiryKey) params.set('enquiry', enquiryKey);
  if (assignment?.id) params.set('trip', assignment.id);
  return `${window.location.origin}/driver/login?${params.toString()}`;
}

function buildDriverShareMessage(enquiry, assignment, credentials = {}) {
  const enquiryKey = enquiry?.enquiry_code || enquiry?.id || '—';
  const link = buildDriverShareLink(enquiry, assignment);
  const driverName = assignment?.driver?.full_name || credentials.driver_name || 'Driver';
  const username =
    credentials.username ||
    assignment?.driver?.phone ||
    assignment?.driver?.email ||
    '—';
  const password = credentials.password || '';
  return [
    `*Trip assignment*`,
    `Enquiry ID: ${enquiryKey}`,
    `Customer: ${enquiry?.customer_name || '—'}`,
    `Driver: ${driverName}`,
    `Vehicle: ${assignment?.vehicle?.name || '—'}`,
    `Dates: ${assignment?.start_date || '—'} to ${assignment?.end_date || '—'}`,
    ``,
    `*Driver login*`,
    `Username (phone/email): ${username}`,
    password ? `Password: ${password}` : null,
    ``,
    `Open trip update link:`,
    link,
    ``,
    `Login and update status & KM for this enquiry.`,
  ]
    .filter((line) => line != null)
    .join('\n');
}

const STATUS_OPTIONS = [
  { value: 'allocated', label: 'Allocated' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'on_trip', label: 'On Trip' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

function AvailabilityChip({ status, sx }) {
  const value = String(status || 'available').toLowerCase();
  const onTrip = value === 'on_trip';
  return (
    <Chip
      size="small"
      label={value.replace(/_/g, ' ')}
      sx={{
        height: 22,
        textTransform: 'capitalize',
        fontWeight: 700,
        bgcolor: onTrip ? alpha('#dc2626', 0.1) : alpha('#059669', 0.1),
        color: onTrip ? '#b91c1c' : '#047857',
        ...sx,
      }}
    />
  );
}

function isCompletedLeadStatus(label) {
  const name = String(label || '')
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return name.includes('completed') || name === 'feedback';
}

function isOpenAssignment(row, enquiry) {
  if (isCompletedLeadStatus(enquiry?.leadStatus?.lead_status)) return false;
  const status = String(row?.status || '').toLowerCase();
  const tripStatus = String(row?.trip_status || '').toLowerCase();
  return !['completed', 'cancelled'].includes(status) && tripStatus !== 'trip_closed';
}

function emptyForm(enquiry) {
  return {
    vehicle_id: '',
    driver_id: '',
    start_date: enquiry?.travel_from || dayjs().format('YYYY-MM-DD'),
    end_date: enquiry?.travel_to || dayjs().format('YYYY-MM-DD'),
    pickup_location: enquiry?.travel_from_destination || '',
    drop_location: enquiry?.travel_to_destination || '',
    amount: '',
    status: 'allocated',
    notes: '',
  };
}

export default function EnquiryVehiclePanel({ enquiry }) {
  const canEdit = usePermission('enquiries.edit');
  const { enqueueSnackbar } = useSnackbar();
  const enquiryId = enquiry?.id;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => emptyForm(enquiry));
  const [deleteId, setDeleteId] = useState(null);
  const [tripView, setTripView] = useState(null);
  const [shareTarget, setShareTarget] = useState(null);
  const [shareCredentials, setShareCredentials] = useState(null);
  const [sharePassword, setSharePassword] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [whatsappSending, setWhatsappSending] = useState(false);

  const { data: assignments = [], isLoading, isError: assignmentsError } = useEnquiryVehicleAssignments(enquiryId);
  const {
    data: assignable,
    isLoading: loadingResources,
    isError: resourcesError,
  } = useAssignableResources(Boolean(enquiryId));
  const { create, remove } = useEnquiryVehicleMutation();

  const vehicles = assignable?.vehicles || [];
  const drivers = assignable?.drivers || [];
  const visibleAssignments = useMemo(
    () => (assignments || []).filter((row) => isOpenAssignment(row, enquiry)),
    [assignments, enquiry]
  );

  const openDialog = () => {
    setForm(emptyForm(enquiry));
    setOpen(true);
  };

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleVehicleChange = (vehicleId) => {
    setForm((prev) => {
      const next = { ...prev, vehicle_id: vehicleId };
      if (!prev.driver_id) {
        const preferred = drivers.find((d) => d.vehicle_id === vehicleId);
        if (preferred) next.driver_id = preferred.id;
      }
      return next;
    });
  };

  const saveAssignment = async () => {
    if (!form.vehicle_id || !form.start_date || !form.end_date) return;
    await create.mutateAsync({
      id: enquiryId,
      vehicle_id: form.vehicle_id,
      driver_id: form.driver_id || null,
      start_date: form.start_date,
      end_date: form.end_date,
      pickup_location: form.pickup_location || null,
      drop_location: form.drop_location || null,
      amount: form.amount === '' ? 0 : Number(form.amount),
      status: form.status || 'allocated',
      notes: form.notes || null,
    });
    setOpen(false);
  };

  const formValid =
    Boolean(form.vehicle_id) &&
    Boolean(form.start_date) &&
    Boolean(form.end_date) &&
    form.end_date >= form.start_date;

  const shareLink = shareTarget ? buildDriverShareLink(enquiry, shareTarget) : '';
  const shareCreds = {
    ...(shareCredentials || {}),
    username:
      shareCredentials?.username ||
      shareTarget?.driver?.phone ||
      shareTarget?.driver?.email ||
      '',
    password: sharePassword || shareCredentials?.password || '',
  };
  const shareMessage = shareTarget
    ? buildDriverShareMessage(enquiry, shareTarget, shareCreds)
    : '';

  const loadShareCredentials = async (assignment, { resetPassword = true, password } = {}) => {
    if (!assignment?.driver_id) return;
    setShareLoading(true);
    try {
      const { data } = await masterService.drivers.preparePortalShare(assignment.driver_id, {
        reset_password: resetPassword,
        portal_password: password || undefined,
      });
      const creds = data?.data || data;
      setShareCredentials(creds);
      if (creds?.password) setSharePassword(creds.password);
      return creds;
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || 'Could not prepare portal login', {
        variant: 'error',
      });
      return null;
    } finally {
      setShareLoading(false);
    }
  };

  const openShareDialog = async (assignment) => {
    setShareTarget(assignment);
    setShareCredentials(null);
    setSharePassword('');
    await loadShareCredentials(assignment, { resetPassword: true });
  };

  const applySharePassword = async () => {
    if (!shareTarget?.driver_id) return;
    if (!sharePassword || sharePassword.length < 6) {
      enqueueSnackbar('Password must be at least 6 characters', { variant: 'warning' });
      return;
    }
    const creds = await loadShareCredentials(shareTarget, {
      resetPassword: true,
      password: sharePassword,
    });
    if (creds) enqueueSnackbar('Portal password saved for sharing', { variant: 'success' });
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      enqueueSnackbar('Driver link copied with enquiry ID', { variant: 'success' });
    } catch {
      enqueueSnackbar('Unable to copy link', { variant: 'error' });
    }
  };

  const copyShareMessage = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      enqueueSnackbar('Share message copied (includes username & password)', {
        variant: 'success',
      });
    } catch {
      enqueueSnackbar('Unable to copy message', { variant: 'error' });
    }
  };

  const shareWhatsApp = async () => {
    if (!shareTarget || !enquiryId || whatsappSending) return;

    const username = shareCreds.username || '';
    const password = shareCreds.password || '';
    if (!username || !password) {
      enqueueSnackbar('Generate or save a portal password before sharing on WhatsApp', {
        variant: 'warning',
      });
      return;
    }

    const phone = String(shareTarget?.driver?.phone || '').trim();
    if (!phone) {
      enqueueSnackbar('Assigned driver has no contact number', { variant: 'warning' });
      return;
    }

    setWhatsappSending(true);
    try {
      await enquiryService.shareDriverLoginWhatsApp(enquiryId, shareTarget.id, {
        username,
        password,
        login_link: shareLink,
      });
      enqueueSnackbar('Driver login credentials shared on WhatsApp', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(
        err?.response?.data?.message || err?.message || 'Failed to share on WhatsApp',
        { variant: 'error' }
      );
    } finally {
      setWhatsappSending(false);
    }
  };

  return (
    <Box sx={{ position: 'relative', pt: canEdit ? 0.5 : 0 }}>
      {canEdit && (
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
            bgcolor: ACCENT,
            boxShadow: '0 8px 20px rgba(15,118,110,0.28)',
            '&:hover': { bgcolor: '#0d9488' },
          }}
        >
          Assign Vehicle
        </Button>
      )}

      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          mb: 2,
          pb: 1.25,
          pr: canEdit ? 20 : 0,
          borderBottom: '2px solid',
          borderColor: alpha(ACCENT, 0.2),
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
            bgcolor: alpha(ACCENT, 0.12),
            color: ACCENT,
          }}
        >
          <DirectionsCarFilledOutlinedIcon sx={{ fontSize: 18 }} />
        </Box>
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{
            letterSpacing: 0.2,
            background: `linear-gradient(90deg, ${ACCENT}, #14b8a6)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Assign Vehicle &amp; Drivers
        </Typography>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, maxWidth: 720 }}>
        Assign a vehicle and driver for this enquiry. Use the view icon on any vehicle or driver to
        see trips already scheduled in the current month.
      </Typography>

      {/* Assigned for this enquiry */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: alpha(ACCENT, 0.15),
          bgcolor: alpha(ACCENT, 0.03),
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <EventAvailableOutlinedIcon sx={{ fontSize: 18, color: ACCENT }} />
          <Typography variant="subtitle2" fontWeight={800} color={ACCENT}>
            Assigned for this enquiry
          </Typography>
          <Chip
            size="small"
            label={`${visibleAssignments.length}`}
            sx={{ height: 22, fontWeight: 700, bgcolor: alpha(ACCENT, 0.12), color: ACCENT }}
          />
        </Stack>

        {assignmentsError ? (
          <Alert severity="error" sx={{ mb: 1 }}>
            Could not load vehicles assigned to this enquiry. Refresh and try again.
          </Alert>
        ) : null}
        {isLoading ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            Loading assignments…
          </Typography>
        ) : visibleAssignments.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            No vehicle assigned yet. Click Assign Vehicle to add one.
          </Typography>
        ) : (
          <TableContainer
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: '#fff',
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(ACCENT, 0.06) }}>
                  <TableCell sx={{ fontWeight: 800 }}>Vehicle</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Driver</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Dates</TableCell>
                  <TableCell sx={{ fontWeight: 800 }} align="right">
                    Amount
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, width: 120 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleAssignments.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {row.vehicle?.name || '—'}
                      </Typography>
                      {row.vehicle && (
                        <>
                          <Box sx={{ mt: 0.4 }}>
                            <OwnershipTag record={row.vehicle} />
                          </Box>
                          <AvailabilityChip sx={{ mt: 0.4 }} status={row.vehicle.availability_status} />
                        </>
                      )}
                      <Typography variant="caption" color="text.secondary" display="block">
                        {row.vehicle?.registration_number || row.vehicle?.code || ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {row.driver?.full_name || '—'}
                      </Typography>
                      {row.driver && (
                        <>
                          <Box sx={{ mt: 0.4 }}>
                            <OwnershipTag record={row.driver} />
                          </Box>
                          <AvailabilityChip sx={{ mt: 0.4 }} status={row.driver.availability_status} />
                        </>
                      )}
                      <ContactNumberDisplay
                        value={row.driver?.phone}
                        variant="phone"
                        typographyVariant="caption"
                      />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {formatDate(row.start_date)} – {formatDate(row.end_date)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {formatInr(Number(row.amount) || 0)}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                        {row.driver_id && (
                          <Tooltip title="Share driver login link with enquiry ID">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => openShareDialog(row)}
                            >
                              <ShareOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {canEdit && (
                          <Tooltip title="Remove">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteId(row.id)}
                            >
                              <DeleteOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Grid container spacing={2.5}>
        {/* Vehicles list */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              height: '100%',
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: alpha('#0f172a', 0.08),
              overflow: 'hidden',
              bgcolor: '#fff',
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                px: 2,
                py: 1.25,
                bgcolor: alpha('#0369a1', 0.06),
                borderBottom: '1px solid',
                borderColor: alpha('#0369a1', 0.12),
              }}
            >
              <DirectionsCarFilledOutlinedIcon sx={{ fontSize: 18, color: '#0369a1' }} />
              <Typography variant="subtitle2" fontWeight={800} color="#0369a1">
                All Vehicles
              </Typography>
              <Chip
                size="small"
                label={vehicles.length}
                sx={{ height: 22, fontWeight: 700, bgcolor: alpha('#0369a1', 0.12), color: '#0369a1' }}
              />
            </Stack>
            <TableContainer sx={{ maxHeight: 360 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>Vehicle</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Reg. No</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 800, width: 56 }} align="center">
                      View
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resourcesError ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'error.main' }}>
                        Could not load vehicles
                      </TableCell>
                    </TableRow>
                  ) : loadingResources ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        Loading vehicles…
                      </TableCell>
                    </TableRow>
                  ) : vehicles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        No vehicles found
                      </TableCell>
                    </TableRow>
                  ) : (
                    vehicles.map((v) => (
                      <TableRow key={v.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            {v.name}
                          </Typography>
                          <Box sx={{ mt: 0.4 }}>
                            <OwnershipTag record={v} />
                          </Box>
                        </TableCell>
                        <TableCell>{v.type || '—'}</TableCell>
                        <TableCell>{v.registration_number || '—'}</TableCell>
                        <TableCell>
                          <AvailabilityChip status={v.availability_status} />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View this month's trips">
                            <IconButton
                              size="small"
                              onClick={() =>
                                setTripView({
                                  type: 'vehicle',
                                  id: v.id,
                                  title: v.name,
                                  subtitle: v.registration_number || v.code,
                                })
                              }
                              sx={{
                                color: '#0369a1',
                                bgcolor: alpha('#0369a1', 0.08),
                                '&:hover': { bgcolor: alpha('#0369a1', 0.16) },
                              }}
                            >
                              <VisibilityOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Grid>

        {/* Drivers list */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              height: '100%',
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: alpha('#0f172a', 0.08),
              overflow: 'hidden',
              bgcolor: '#fff',
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                px: 2,
                py: 1.25,
                bgcolor: alpha('#b45309', 0.07),
                borderBottom: '1px solid',
                borderColor: alpha('#b45309', 0.12),
              }}
            >
              <PersonOutlinedIcon sx={{ fontSize: 18, color: '#b45309' }} />
              <Typography variant="subtitle2" fontWeight={800} color="#b45309">
                Drivers Info
              </Typography>
              <Chip
                size="small"
                label={drivers.length}
                sx={{ height: 22, fontWeight: 700, bgcolor: alpha('#b45309', 0.12), color: '#b45309' }}
              />
            </Stack>
            <TableContainer sx={{ maxHeight: 360 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>Driver</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 800, width: 56 }} align="center">
                      View
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resourcesError ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'error.main' }}>
                        Could not load drivers
                      </TableCell>
                    </TableRow>
                  ) : loadingResources ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        Loading drivers…
                      </TableCell>
                    </TableRow>
                  ) : drivers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        No drivers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    drivers.map((d) => (
                      <TableRow key={d.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            {d.full_name}
                          </Typography>
                          <Box sx={{ mt: 0.4 }}>
                            <OwnershipTag record={d} />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <ContactNumberDisplay value={d.phone} variant="phone" typographyVariant="body2" />
                        </TableCell>
                        <TableCell>
                          <AvailabilityChip status={d.availability_status} />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View this month's trips">
                            <IconButton
                              size="small"
                              onClick={() =>
                                setTripView({
                                  type: 'driver',
                                  id: d.id,
                                  title: d.full_name,
                                  subtitle: d.phone,
                                })
                              }
                              sx={{
                                color: '#b45309',
                                bgcolor: alpha('#b45309', 0.08),
                                '&:hover': { bgcolor: alpha('#b45309', 0.16) },
                              }}
                            >
                              <VisibilityOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Grid>
      </Grid>

      {/* Assign form dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle fontWeight={800} sx={{ pb: 1 }}>
          Assign Vehicle &amp; Driver
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select vehicle and driver for enquiry{' '}
            <Box component="span" fontWeight={700} color="text.primary">
              {enquiry?.enquiry_code || ''}
            </Box>
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                fullWidth
                required
                label="Vehicle *"
                value={form.vehicle_id}
                onChange={(e) => handleVehicleChange(e.target.value)}
              >
                <MenuItem value="">Select vehicle</MenuItem>
                {vehicles.map((v) => (
                  <MenuItem key={v.id} value={v.id} sx={{ whiteSpace: 'normal', py: 1 }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {v.name}
                        {v.registration_number ? ` (${v.registration_number})` : ''}
                        {v.type ? ` · ${v.type}` : ''}
                      </Typography>
                      <Box sx={{ mt: 0.4 }}>
                        <OwnershipTag record={v} />
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                fullWidth
                label="Driver"
                value={form.driver_id}
                onChange={(e) => setField('driver_id', e.target.value)}
              >
                <MenuItem value="">Select driver</MenuItem>
                {drivers.map((d) => (
                  <MenuItem key={d.id} value={d.id} sx={{ whiteSpace: 'normal', py: 1 }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {d.full_name}
                        {d.phone ? ` · ${d.phone}` : ''}
                      </Typography>
                      <Box sx={{ mt: 0.4 }}>
                        <OwnershipTag record={d} />
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <DatePickerField
                label="Start Date *"
                value={form.start_date}
                onChange={(v) => setField('start_date', v || '')}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <DatePickerField
                label="End Date *"
                value={form.end_date}
                onChange={(v) => setField('end_date', v || '')}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Pickup Location"
                value={form.pickup_location}
                onChange={(e) => setField('pickup_location', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Drop Location"
                value={form.drop_location}
                onChange={(e) => setField('drop_location', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Amount"
                value={form.amount}
                onChange={(e) => setField('amount', e.target.value)}
                inputProps={{ min: 0, step: '0.01' }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                fullWidth
                label="Status"
                value={form.status}
                onChange={(e) => setField('status', e.target.value)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Notes"
                value={form.notes}
                onChange={(e) => setField('notes', e.target.value)}
              />
            </Grid>
          </Grid>
          {form.start_date && form.end_date && form.end_date < form.start_date && (
            <Typography variant="caption" color="error" sx={{ mt: 1.5, display: 'block' }}>
              End date must be on or after start date.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disableElevation
            disabled={!formValid || create.isPending}
            onClick={saveAssignment}
            sx={{
              textTransform: 'none',
              fontWeight: 800,
              borderRadius: 2,
              px: 2.5,
              bgcolor: ACCENT,
              '&:hover': { bgcolor: '#0d9488' },
            }}
          >
            {create.isPending ? 'Saving…' : 'Save Assignment'}
          </Button>
        </DialogActions>
      </Dialog>

      <AssignedTripsDialog target={tripView} onClose={() => setTripView(null)} />

      {/* Share driver portal link */}
      <Dialog
        open={!!shareTarget}
        onClose={() => {
          setShareTarget(null);
          setShareCredentials(null);
          setSharePassword('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle fontWeight={800}>Share driver login link</DialogTitle>
        <DialogContent>
          <Stack spacing={1.75} sx={{ pt: 0.5 }}>
            <Alert severity="info">
              Share this link with the assigned driver. After login they can update trip status and
              KM for enquiry <strong>{enquiry?.enquiry_code || enquiry?.id}</strong>. Updates are
              saved against this enquiry.
            </Alert>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Enquiry ID
              </Typography>
              <Typography fontWeight={800}>{enquiry?.enquiry_code || enquiry?.id}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Driver
              </Typography>
              <Typography fontWeight={700}>
                {shareTarget?.driver?.full_name || shareCredentials?.driver_name || '—'}
              </Typography>
              {shareTarget?.driver && (
                <Box sx={{ mt: 0.5 }}>
                  <OwnershipTag record={shareTarget.driver} />
                </Box>
              )}
            </Box>

            <TextField
              label="Username (phone / email)"
              value={shareCreds.username || ''}
              fullWidth
              InputProps={{ readOnly: true }}
              helperText="Driver uses this phone or email to sign in"
            />

            <PasswordTextField
              label="Password"
              value={sharePassword}
              onChange={(e) => setSharePassword(e.target.value)}
              fullWidth
              helperText={
                shareLoading
                  ? 'Preparing portal login…'
                  : 'Password is prepared automatically and included when you share on WhatsApp'
              }
            />

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button
                size="small"
                variant="outlined"
                startIcon={<RefreshIcon />}
                disabled={shareLoading}
                onClick={() => loadShareCredentials(shareTarget, { resetPassword: true })}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Generate new password
              </Button>
              <Button
                size="small"
                variant="outlined"
                disabled={shareLoading}
                onClick={applySharePassword}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Save password
              </Button>
            </Stack>

            <TextField
              label="Driver portal link"
              value={shareLink}
              fullWidth
              multiline
              minRows={2}
              InputProps={{ readOnly: true }}
            />

            <Alert severity="warning" sx={{ py: 0.75 }}>
              Sharing will include username and password. Only this assigned driver can update this
              enquiry trip.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, flexWrap: 'wrap', gap: 1 }}>
          <Button
            onClick={() => {
              setShareTarget(null);
              setShareCredentials(null);
              setSharePassword('');
            }}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Close
          </Button>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={copyShareLink}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Copy link
          </Button>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={copyShareMessage}
            disabled={shareLoading}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Copy message
          </Button>
          <Button
            variant="outlined"
            startIcon={<WhatsAppIcon />}
            onClick={shareWhatsApp}
            disabled={shareLoading || whatsappSending}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              color: '#128C7E',
              borderColor: alpha('#128C7E', 0.5),
            }}
          >
            {whatsappSending ? 'Sending…' : 'WhatsApp'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title="Remove assignment?"
        message="This will remove the vehicle and driver assignment from this enquiry."
        confirmLabel="Remove"
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return;
          await remove.mutateAsync({ id: enquiryId, subId: deleteId });
          setDeleteId(null);
        }}
        loading={remove.isPending}
      />
    </Box>
  );
}
