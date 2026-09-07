import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Radio,
  RadioGroup,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  MenuItem,
  Chip,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ContactNumberDisplay from '../../components/common/ContactNumberDisplay';
import AddIcon from '@mui/icons-material/Add';
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SendIcon from '@mui/icons-material/Send';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import Loader from '../../components/common/Loader';
import {
  excludeCancelledLeadStatuses,
  getPendingLeadStatuses,
  isEnquiryActionsLocked,
} from '../../utils/leadStatusPipeline';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EnquiryStatusTracker from '../../components/enquiry/EnquiryStatusTracker';
import EnquiryQuotationPanel from '../../components/enquiry/EnquiryQuotationPanel';
import EnquiryPaymentPanel from '../../components/enquiry/EnquiryPaymentPanel';
import EnquiryVehiclePanel from '../../components/enquiry/EnquiryVehiclePanel';
import EnquiryInvoicePanel from '../../components/enquiry/EnquiryInvoicePanel';
import EnquiryWhatsAppPanel from '../../components/enquiry/EnquiryWhatsAppPanel';
import EnquiryWhatsAppHistory from '../../components/enquiry/EnquiryWhatsAppHistory';
import EnquiryTripDetailsPanel, {
  enquiryHasTripDetails,
} from '../../components/enquiry/EnquiryTripDetailsPanel';
import {
  useEnquiry,
  useEnquiryHistory,
  useEnquiryMutation,
  useEnquiryNotes,
  useEnquiryVehicleAssignments,
} from '../../hooks/queries/useEnquiry';
import {
  useFollowUpMutation,
  useFollowUps,
  useItineraries,
  useItineraryMutation,
} from '../../hooks/queries/useModules';
import { useLeadStatuses } from '../../hooks/queries/useMasters';
import { useUsers } from '../../hooks/queries/useUsers';
import { usePermission, canSkipLeadStatusStages } from '../../hooks/usePermission';
import { useAuth } from '../../hooks/useAuth';
import { formatDate, formatDateTime, formatTripDuration, formatRouteLabel } from '../../utils/formatters';
import { resolveTripDates } from '../../utils/tripDates';
import { FOLLOW_UP_STATUSES, resolveMediaUrl } from '../../utils/constants';
import { formatInr, summarizePricing } from '../../utils/itineraryPricing';
import { isValidWhatsAppPhone } from '../../utils/whatsappShare';
import { DatePickerField } from '../../components/forms/FormDatePicker';
import { TimePickerField } from '../../components/forms/FormTimePicker';
import { mapFollowUpToApi } from '../../schemas/followUp.schema';

const FOLLOWUP_TYPE_OPTIONS = [
  { value: 'task', label: 'Task' },
  { value: 'call', label: 'Call' },
  { value: 'meeting', label: 'Meeting' },
];

const emptyFollowUpForm = {
  type: 'task',
  notes: '',
  followUpDate: '',
  followUpTime: '',
  reminder: 'yes',
  assignedTo: '',
};

const emptyStatusForm = {
  status: 'pending',
  outcome: '',
};

const BASE_DETAIL_TABS = [
  { key: 'itinerary', label: 'Itinerary', color: '#0d9488' },
  { key: 'quotation', label: 'Quotation', color: '#2563eb' },
  { key: 'whatsapp', label: 'Whatsapp', color: '#25D366' },
  { key: 'followup', label: 'Followup', color: '#d97706' },
  { key: 'vehicles', label: 'Vehicle & Drivers', color: '#0f766e' },
  { key: 'payment', label: 'Payment', color: '#7c3aed' },
  { key: 'invoice', label: 'Invoice', color: '#db2777' },
  { key: 'history', label: 'History', color: '#475569' },
];

const TRIP_DETAILS_TAB = {
  key: 'trip_details',
  label: 'Trip Details',
  color: '#ea580c',
};

const panelSx = {
  mb: 2,
  borderRadius: 3,
  border: '1px solid',
  borderColor: alpha('#0f172a', 0.06),
  bgcolor: '#fff',
  boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)',
  overflow: 'hidden',
};

function SectionHeading({ icon, title, accent = '#1565c0' }) {
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        mb: 1.75,
        pb: 1,
        borderBottom: '2px solid',
        borderColor: alpha(accent, 0.18),
      }}
    >
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: 1.5,
          display: 'grid',
          placeItems: 'center',
          bgcolor: alpha(accent, 0.12),
          color: accent,
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="subtitle1"
        fontWeight={800}
        sx={{
          letterSpacing: 0.3,
          background: `linear-gradient(90deg, ${accent}, ${alpha(accent, 0.7)})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {title}
      </Typography>
    </Stack>
  );
}

function InfoRow({ label, value, endAdornment }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '108px 1fr auto',
        gap: 1,
        py: 0.7,
        alignItems: 'center',
        borderBottom: '1px dashed',
        borderColor: alpha('#0f172a', 0.06),
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'capitalize', letterSpacing: 0.4 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ wordBreak: 'break-word' }}>
        {value ?? '—'}
      </Typography>
      {endAdornment || <span />}
    </Box>
  );
}

function assigneeName(enquiry) {
  const a = enquiry?.assignee;
  if (!a) return '—';
  return [a.first_name, a.last_name].filter(Boolean).join(' ') || '—';
}

function creatorName(user) {
  if (!user) return 'System';
  return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || 'User';
}

function userDisplayName(user) {
  if (!user) return '—';
  return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || 'User';
}

export default function EnquiryView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const canEdit = usePermission('enquiries.edit');
  const { user } = useAuth();
  const canJumpLeadStatus = canSkipLeadStatusStages(user);
  const canFollowUpCreate = usePermission('follow_ups.create') || canEdit;
  const canFollowUpEdit = usePermission('follow_ups.edit') || canEdit;
  const canItineraryCreate = usePermission('itineraries.create');
  const canItineraryEdit = usePermission('itineraries.edit');
  const canItineraryDelete = usePermission('itineraries.delete') || canEdit;
  const [tabKey, setTabKey] = useState('itinerary');
  const [childrenOpen, setChildrenOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [insertOpen, setInsertOpen] = useState(false);
  const [selectedItineraryId, setSelectedItineraryId] = useState(null);
  const [deleteItineraryId, setDeleteItineraryId] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [leadStatusValue, setLeadStatusValue] = useState('');
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [followUpForm, setFollowUpForm] = useState(emptyFollowUpForm);
  const [followUpStatusRow, setFollowUpStatusRow] = useState(null);
  const [followUpStatusForm, setFollowUpStatusForm] = useState(emptyStatusForm);

  const { data: enquiry, isLoading, refetch, isFetching } = useEnquiry(id);
  const { data: notes = [], refetch: refetchNotes } = useEnquiryNotes(id);
  const { data: history = [] } = useEnquiryHistory(id);
  const { data: vehicleAssignments = [] } = useEnquiryVehicleAssignments(id, {
    refetchInterval: 15000,
  });
  const { addNote, updateStatus } = useEnquiryMutation();
  const showTripDetailsTab = enquiryHasTripDetails(vehicleAssignments, enquiry);
  const detailTabs = useMemo(() => {
    if (!showTripDetailsTab) return BASE_DETAIL_TABS;
    const tabs = [...BASE_DETAIL_TABS];
    const invoiceIndex = tabs.findIndex((t) => t.key === 'invoice');
    tabs.splice(invoiceIndex + 1, 0, TRIP_DETAILS_TAB);
    return tabs;
  }, [showTripDetailsTab]);
  const tab = useMemo(() => {
    const idx = detailTabs.findIndex((t) => t.key === tabKey);
    return idx >= 0 ? idx : 0;
  }, [detailTabs, tabKey]);
  const activeTabKey = detailTabs[tab]?.key || 'itinerary';

  useEffect(() => {
    if (!detailTabs.some((t) => t.key === tabKey)) {
      setTabKey(detailTabs[0]?.key || 'itinerary');
    }
  }, [detailTabs, tabKey]);
  const { data: leadStatusData } = useLeadStatuses({
    page: 1,
    perPage: 200,
    is_active: true,
  });
  const { data: assignedData, refetch: refetchAssigned } = useItineraries({
    page: 1,
    perPage: 50,
    enquiry_id: id,
    sortBy: 'updated_at',
    sortOrder: 'desc',
  });
  const { data: allItinerariesData, isLoading: loadingAllItineraries } = useItineraries({
    page: 1,
    perPage: 300,
    sortBy: 'updated_at',
    sortOrder: 'desc',
  });
  const { data: followUpsData, refetch: refetchFollowUps } = useFollowUps({
    page: 1,
    perPage: 100,
    enquiry_id: id,
    sortBy: 'follow_up_date',
    sortOrder: 'desc',
  });
  const { data: usersData } = useUsers({
    page: 1,
    perPage: 300,
    sortBy: 'first_name',
    sortOrder: 'asc',
  });
  const { assignEnquiry, unassignEnquiry, confirm, sendWhatsApp } = useItineraryMutation();
  const { create: createFollowUp, update: updateFollowUp } = useFollowUpMutation();

  const assignedItineraries = assignedData?.rows || [];
  const allItineraries = allItinerariesData?.rows || [];
  const followUps = followUpsData?.rows || [];
  const users = usersData?.rows || [];
  const leadStatuses = excludeCancelledLeadStatuses(leadStatusData?.rows || []);
  const pendingStatusOptions = useMemo(
    () =>
      getPendingLeadStatuses(
        leadStatuses,
        enquiry?.lead_status_id || enquiry?.leadStatus?.id,
        enquiry?.leadStatus?.lead_status,
        { canSkipStages: canJumpLeadStatus }
      ),
    [leadStatuses, enquiry, canJumpLeadStatus]
  );
  const hasConfirmedItinerary = useMemo(
    () =>
      assignedItineraries.some(
        (item) => String(item.status || '').toLowerCase() === 'confirmed'
      ),
    [assignedItineraries]
  );

  const travelMonth = useMemo(() => {
    if (!enquiry?.travel_from) return '—';
    return formatDate(enquiry.travel_from, 'MMMM');
  }, [enquiry?.travel_from]);

  const childrenDetails = useMemo(() => {
    const raw = enquiry?.children_details;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }, [enquiry?.children_details]);

  if (isLoading || !enquiry) return <Loader />;

  const destination = formatRouteLabel(
    enquiry.travel_from_destination,
    enquiry.travel_to_destination
  );
  const leadStatusLabel = enquiry.leadStatus?.lead_status || 'New Enquiry';
  const leadStatusColor = enquiry.leadStatus?.button_color || '#3B82F6';
  const actionsLocked = isEnquiryActionsLocked(enquiry);
  const canMutate = canEdit && !actionsLocked;
  const canAddFollowUp = canFollowUpCreate && !actionsLocked;
  const canChangeFollowUp = canFollowUpEdit && !actionsLocked;
  const canAddItinerary = canItineraryCreate && !actionsLocked;
  const canChangeItinerary = (canEdit || canItineraryEdit) && !actionsLocked;
  const canRemoveItinerary = canItineraryDelete && !actionsLocked;
  const childCount = Number(enquiry.children) || 0;
  const showChildrenIcon = childCount > 0;

  const saveNote = async () => {
    const text = noteText.trim();
    if (!text) return;
    await addNote.mutateAsync({ id, note: text });
    setNoteText('');
    setNoteOpen(false);
    refetchNotes();
  };

  const openFollowUpDialog = () => {
    setFollowUpForm({
      ...emptyFollowUpForm,
      assignedTo: enquiry?.assigned_to || enquiry?.assignee?.id || '',
    });
    setFollowUpOpen(true);
  };

  const saveFollowUp = async () => {
    if (!followUpForm.followUpDate) return;
    const payload = mapFollowUpToApi({
      relatedType: 'enquiry',
      relatedId: id,
      type: followUpForm.type,
      notes: followUpForm.notes,
      followUpDate: followUpForm.followUpDate,
      followUpTime: followUpForm.followUpTime,
      status: 'pending',
      assignedTo: followUpForm.assignedTo || null,
      reminder: followUpForm.reminder === 'yes',
    });
    await createFollowUp.mutateAsync(payload);
    setFollowUpOpen(false);
    setFollowUpForm(emptyFollowUpForm);
    refetchFollowUps();
  };

  const openFollowUpStatusDialog = (row) => {
    setFollowUpStatusRow(row);
    setFollowUpStatusForm({
      status: row.status || 'pending',
      outcome: row.outcome || '',
    });
  };

  const saveFollowUpStatus = async () => {
    if (!followUpStatusRow?.id || !followUpStatusForm.status) return;
    await updateFollowUp.mutateAsync({
      id: followUpStatusRow.id,
      status: followUpStatusForm.status,
      outcome: followUpStatusForm.outcome?.trim() || null,
    });
    setFollowUpStatusRow(null);
    setFollowUpStatusForm(emptyStatusForm);
    refetchFollowUps();
  };

  return (
    <Box
      sx={{
        pb: 4,
        minHeight: '100%',
        background: `radial-gradient(1200px 400px at 10% -10%, ${alpha('#2196f3', 0.08)}, transparent 60%),
                     radial-gradient(900px 320px at 100% 0%, ${alpha('#00897b', 0.06)}, transparent 55%)`,
      }}
    >
      {/* Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => navigate('/enquiry')}
              sx={{ bgcolor: '#fff', boxShadow: '0 4px 12px rgba(15,23,42,0.08)' }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography variant="h5" fontWeight={800} color="secondary.main">
              Enquiry Number: {enquiry.enquiry_code}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ pl: 5 }}>
            Created : {formatDate(enquiry.created_at || enquiry.createdAt, 'DD-MM-YYYY')}
            {'  |  '}
            Last Updated :{' '}
            {formatDateTime(enquiry.updated_at || enquiry.updatedAt).replace(',', ' -')}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={() => refetch()}
          disabled={isFetching}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, bgcolor: '#fff' }}
        >
          Refresh
        </Button>
      </Stack>

      {/* Current status + stages stay visible while the rest of the page scrolls */}
      <Box
        sx={{
          position: 'sticky',
          top: { xs: -16, md: -24 },
          zIndex: 8,
          mx: { xs: -2, md: -3 },
          px: { xs: 2, md: 3 },
          pt: 1,
          pb: 0.5,
          mb: 1,
          bgcolor: 'background.default',
          background: `linear-gradient(180deg, ${alpha('#f8fafc', 1)} 70%, ${alpha('#f8fafc', 0.92)} 100%)`,
          boxShadow: '0 8px 18px rgba(15, 23, 42, 0.06)',
        }}
      >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={1.5}
        sx={{ mb: 2.5 }}
      >
        <Button
          disableElevation
          sx={{
            textTransform: 'none',
            fontWeight: 800,
            px: 2.5,
            py: 1,
            borderRadius: 999,
            color: '#fff',
            alignSelf: { xs: 'flex-start', sm: 'center' },
            background: `linear-gradient(135deg, ${leadStatusColor} 0%, ${alpha(leadStatusColor, 0.75)} 100%)`,
            boxShadow: `0 10px 24px ${alpha(leadStatusColor, 0.35)}`,
            pointerEvents: 'none',
            '&:hover': {
              background: `linear-gradient(135deg, ${leadStatusColor} 0%, ${alpha(leadStatusColor, 0.75)} 100%)`,
            },
          }}
        >
          {leadStatusLabel}
        </Button>

        {canMutate && (
          <Button
            variant="contained"
            disableElevation
            startIcon={<SyncAltIcon />}
            onClick={() => {
              const pending = getPendingLeadStatuses(
                leadStatuses,
                enquiry.lead_status_id || enquiry.leadStatus?.id,
                enquiry.leadStatus?.lead_status,
                { canSkipStages: canJumpLeadStatus }
              );
              setLeadStatusValue(pending[0]?.id || '');
              setStatusDialogOpen(true);
            }}
            sx={{
              textTransform: 'none',
              fontWeight: 800,
              borderRadius: 999,
              px: 2.25,
              py: 1,
              bgcolor: '#1e40af',
              boxShadow: '0 8px 20px rgba(30,64,175,0.28)',
              '&:hover': { bgcolor: '#1d4ed8' },
            }}
          >
            Update Lead Status
          </Button>
        )}
      </Stack>

      <EnquiryStatusTracker enquiry={enquiry} leadStatuses={leadStatuses} />
      </Box>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4, lg: 3.5 }}>
          {/* Related Customer */}
          <Card elevation={0} sx={panelSx}>
            <Box
              sx={{
                height: 4,
                background: 'linear-gradient(90deg, #00897b, #4db6ac)',
              }}
            />
            <CardContent sx={{ pt: 2, pb: 2 }}>
              <SectionHeading
                icon={<PersonOutlinedIcon sx={{ fontSize: 18 }} />}
                title="Related Customer"
                accent="#00897b"
              />
              <Typography fontWeight={800} sx={{ mb: 1.25, fontSize: 16 }}>
                {enquiry.customer_name}
              </Typography>
              <Stack spacing={1}>
                <ContactNumberDisplay
                  value={enquiry.phone}
                  variant="whatsapp"
                  boxed
                  typographyVariant="body2"
                  color="text.primary"
                />
                {enquiry.emergency_contact_number && (
                  <ContactNumberDisplay
                    value={enquiry.emergency_contact_number}
                    variant="alt"
                    prefix="Alt: "
                    boxed
                    typographyVariant="body2"
                    color="text.primary"
                  />
                )}
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ p: 1, borderRadius: 2, bgcolor: alpha('#1565c0', 0.05) }}
                >
                  <EmailOutlinedIcon sx={{ fontSize: 16, color: '#1565c0' }} />
                  <Typography variant="body2" fontWeight={600}>
                    {enquiry.email || '—'}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Type:{' '}
                  {enquiry.enquiry_type
                    ? enquiry.enquiry_type.charAt(0).toUpperCase() + enquiry.enquiry_type.slice(1)
                    : '—'}
                  {enquiry.enquiry_type === 'agent' && enquiry.agent?.agent_name
                    ? ` · ${enquiry.agent.agent_name}`
                    : ''}
                  {enquiry.enquiry_type === 'corporate' && enquiry.corporate?.corporate_name
                    ? ` · ${enquiry.corporate.corporate_name}`
                    : ''}
                </Typography>
                {(enquiry.city_name || enquiry.city?.name || enquiry.state_name || enquiry.state?.name || enquiry.country_name || enquiry.country?.name) && (
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <PlaceOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {[enquiry.city_name || enquiry.city?.name, enquiry.state_name || enquiry.state?.name, enquiry.country_name || enquiry.country?.name]
                        .filter(Boolean)
                        .join(', ')}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card elevation={0} sx={panelSx}>
            <Box
              sx={{
                height: 4,
                background: 'linear-gradient(90deg, #6a1b9a, #ab47bc)',
              }}
            />
            <CardContent sx={{ pt: 2, pb: 2 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={1}
                sx={{
                  mb: 1.75,
                  pb: 1,
                  borderBottom: '2px solid',
                  borderColor: alpha('#6a1b9a', 0.18),
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: 1.5,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: alpha('#6a1b9a', 0.12),
                      color: '#6a1b9a',
                    }}
                  >
                    <NoteAltOutlinedIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight={800}
                    sx={{
                      letterSpacing: 0.3,
                      background: 'linear-gradient(90deg, #6a1b9a, #ab47bc)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Notes
                  </Typography>
                </Stack>
                {canMutate && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                    onClick={() => setNoteOpen(true)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      borderRadius: 999,
                      px: 1.5,
                      py: 0.4,
                      minHeight: 32,
                      color: '#6a1b9a',
                      borderColor: alpha('#6a1b9a', 0.45),
                      bgcolor: alpha('#6a1b9a', 0.06),
                      whiteSpace: 'nowrap',
                      '&:hover': {
                        borderColor: '#6a1b9a',
                        bgcolor: alpha('#6a1b9a', 0.12),
                      },
                    }}
                  >
                    Add Note
                  </Button>
                )}
              </Stack>

              {notes.length === 0 ? (
                <Typography variant="body2" color="text.disabled" sx={{ py: 1 }}>
                  No Notes
                </Typography>
              ) : (
                <Stack spacing={1.25} sx={{ maxHeight: 320, overflowY: 'auto', pr: 0.5 }}>
                  {notes.map((n) => {
                    const stageLabel = n.lead_status_name || n.leadStatus?.lead_status || '';
                    const stageColor =
                      n.lead_status_color || n.leadStatus?.button_color || '#6a1b9a';
                    return (
                    <Box
                      key={n.id}
                      sx={{
                        p: 1.25,
                        borderRadius: 2,
                        bgcolor: alpha('#6a1b9a', 0.04),
                        border: '1px solid',
                        borderColor: alpha('#6a1b9a', 0.12),
                      }}
                    >
                      {stageLabel ? (
                        <Chip
                          size="small"
                          label={stageLabel}
                          sx={{
                            mb: 0.75,
                            height: 22,
                            fontWeight: 800,
                            fontSize: 11,
                            color: '#fff',
                            bgcolor: stageColor,
                            '& .MuiChip-label': { px: 1 },
                          }}
                        />
                      ) : null}
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 0.75 }}>
                        {n.note}
                      </Typography>
                      <Divider sx={{ mb: 0.75 }} />
                      <Typography variant="caption" color="text.secondary" display="block">
                        By {creatorName(n.creator)} — {formatDateTime(n.created_at || n.createdAt)}
                      </Typography>
                    </Box>
                    );
                  })}
                </Stack>
              )}
            </CardContent>
          </Card>

          {/* Query Information */}
          <Card elevation={0} sx={{ ...panelSx, mb: 0 }}>
            <Box
              sx={{
                height: 4,
                background: 'linear-gradient(90deg, #1565c0, #42a5f5)',
              }}
            />
            <CardContent sx={{ pt: 2, pb: 2 }}>
              <SectionHeading
                icon={<InfoOutlinedIcon sx={{ fontSize: 18 }} />}
                title="Query Information"
                accent="#1565c0"
              />
              <InfoRow label="Destination" value={destination} />
              <InfoRow
                label="From Date"
                value={formatDate(enquiry.travel_from, 'DD-MM-YYYY')}
              />
              <InfoRow label="To Date" value={formatDate(enquiry.travel_to, 'DD-MM-YYYY')} />
              <InfoRow
                label="Trip Duration Info"
                value={formatTripDuration(enquiry.travel_from, enquiry.travel_to) || '—'}
              />
              <InfoRow label="Travel Month" value={travelMonth} />
              <InfoRow
                label="Lead Source"
                value={enquiry.leadSource?.lead_source_type || '—'}
              />
              <InfoRow label="Services" value={enquiry.service_required || '—'} />
              <InfoRow
                label="Pax"
                value={`Adult: ${enquiry.adults ?? 0} - Child: ${enquiry.children ?? 0}`}
                endAdornment={
                  showChildrenIcon ? (
                    <Tooltip title="View children details">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => setChildrenOpen(true)}
                        sx={{
                          bgcolor: alpha('#1565c0', 0.1),
                          '&:hover': { bgcolor: alpha('#1565c0', 0.18) },
                        }}
                      >
                        <ChildCareIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : null
                }
              />
              <InfoRow label="Assign To" value={assigneeName(enquiry)} />
              {enquiry.approx_distance_km != null && (
                <InfoRow label="Distance" value={`${enquiry.approx_distance_km} KM`} />
              )}
              {(enquiry.travel_from_destination || enquiry.travel_to_destination) && (
                <InfoRow
                  label="Route"
                  value={formatRouteLabel(
                    enquiry.travel_from_destination,
                    enquiry.travel_to_destination
                  )}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Main tabs */}
        <Grid size={{ xs: 12, md: 8, lg: 8.5 }}>
          <Card elevation={0} sx={{ ...panelSx, mb: 0 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 1, bgcolor: alpha('#0f172a', 0.015) }}>
              <Tabs
                value={tab}
                onChange={(_, v) => setTabKey(detailTabs[v]?.key || 'itinerary')}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: 48,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 700,
                    minHeight: 48,
                    fontSize: 13,
                    color: '#64748b',
                    borderRadius: '10px 10px 0 0',
                    mx: 0.25,
                    transition: 'color 0.2s, background-color 0.2s',
                  },
                  '& .MuiTabs-indicator': {
                    bgcolor: detailTabs[tab]?.color || '#0d9488',
                    height: 3,
                    borderRadius: 2,
                  },
                }}
              >
                {detailTabs.map((item) => (
                  <Tab
                    key={item.key}
                    label={item.label}
                    sx={{
                      '&.Mui-selected': {
                        color: `${item.color} !important`,
                        bgcolor: alpha(item.color, 0.12),
                      },
                      '&:hover': {
                        color: item.color,
                        bgcolor: alpha(item.color, 0.06),
                      },
                    }}
                  />
                ))}
              </Tabs>
            </Box>

            <CardContent sx={{ minHeight: 420 }}>
              {activeTabKey === 'itinerary' && (
                <Stack spacing={2} alignItems="stretch">
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    {canAddItinerary && (
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => navigate(`/itineraries/generate?enquiryId=${id}`)}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 800,
                          borderRadius: 2.5,
                          px: 2.25,
                          py: 1,
                          color: '#059669',
                          borderColor: '#059669',
                          bgcolor: 'transparent',
                          boxShadow: 'none',
                          '&:hover': {
                            bgcolor: 'transparent',
                            borderColor: '#047857',
                            color: '#047857',
                          },
                        }}
                      >
                        Add Itinerary
                      </Button>
                    )}
                    {canChangeItinerary && (
                      <Button
                        variant="outlined"
                        startIcon={<FileDownloadOutlinedIcon />}
                        onClick={() => {
                          setSelectedItineraryId(null);
                          setInsertOpen(true);
                        }}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 800,
                          borderRadius: 2.5,
                          px: 2.25,
                          py: 1,
                          color: '#0f766e',
                          borderColor: '#0f766e',
                          bgcolor: 'transparent',
                          boxShadow: 'none',
                          '&:hover': {
                            bgcolor: 'transparent',
                            borderColor: '#0d9488',
                            color: '#0d9488',
                          },
                        }}
                      >
                        Insert itinerary
                      </Button>
                    )}
                  </Stack>

                  {assignedItineraries.length > 0 && !hasConfirmedItinerary && (
                    <Typography variant="body2" color="warning.main" fontWeight={600}>
                      Confirm one itinerary using Make Confirm. Only one confirmed itinerary is
                      allowed per enquiry.
                    </Typography>
                  )}

                  {assignedItineraries.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      No itineraries assigned to this enquiry yet. Create a new one or insert an
                      existing itinerary.
                    </Typography>
                  ) : (
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5 }}>
                        Assigned Itineraries
                      </Typography>
                      <Grid container spacing={2}>
                        {assignedItineraries.map((item) => {
                          const coverUrl = resolveMediaUrl(item.cover_image);
                          const isConfirmed = String(item.status || '').toLowerCase() === 'confirmed';
                          const adults = enquiry.adults ?? item.adults ?? 0;
                          const children = enquiry.children ?? item.children ?? 0;
                          const price = summarizePricing(item.pricing || {}).grandTotal;
                          const shortId = String(item.id || '').slice(0, 8).toUpperCase();
                          const placeLabel =
                            item.destination?.name ||
                            item.title ||
                            'Itinerary';
                          const tripDates = resolveTripDates({ enquiry, itinerary: item });

                          return (
                            <Grid key={item.id} size={{ xs: 12, sm: 6, xl: 4 }}>
                              <Box
                                sx={{
                                  borderRadius: 3,
                                  overflow: 'hidden',
                                  border: '1px solid',
                                  borderColor: alpha('#0f172a', 0.08),
                                  bgcolor: '#fff',
                                  boxShadow: '0 10px 28px rgba(15,23,42,0.08)',
                                  height: '100%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                }}
                              >
                                <Box
                                  sx={{
                                    position: 'relative',
                                    height: 160,
                                    background: coverUrl
                                      ? `center/cover no-repeat url(${coverUrl})`
                                      : `linear-gradient(135deg, ${alpha('#0d9488', 0.85)}, ${alpha('#1e3a5f', 0.95)})`,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      inset: 0,
                                      background:
                                        'linear-gradient(180deg, rgba(15,23,42,0.05) 20%, rgba(15,23,42,0.78) 100%)',
                                    }}
                                  />
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      px: 1.75,
                                      py: 1.25,
                                      bgcolor: alpha('#0f172a', 0.72),
                                    }}
                                  >
                                    <Typography
                                      fontWeight={800}
                                      sx={{ color: '#fff', fontSize: 20, lineHeight: 1.2 }}
                                    >
                                      {placeLabel}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: alpha('#fff', 0.85) }}>
                                      {item.title && item.title !== placeLabel
                                        ? `${item.title} · `
                                        : ''}
                                      ID: {shortId}
                                      {' · '}
                                      {item.days || 0}D / {item.nights || 0}N
                                    </Typography>
                                  </Box>
                                </Box>

                                <Box sx={{ p: 1.75, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                  <Stack spacing={0.65} sx={{ mb: 1.5 }}>
                                    <Typography variant="body2" fontWeight={600} color="#334155">
                                      Pax: {adults} Adult(s) - {children} Child(s)
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600} color="#334155">
                                      Date:{' '}
                                      {tripDates.from
                                        ? formatDate(tripDates.from, 'DD MMM YYYY')
                                        : '—'}{' '}
                                      Till:{' '}
                                      {tripDates.to
                                        ? formatDate(tripDates.to, 'DD MMM YYYY')
                                        : '—'}
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600} color="#334155">
                                      Created:{' '}
                                      {formatDate(
                                        item.created_at || item.createdAt,
                                        'DD/MM/YYYY'
                                      )}
                                    </Typography>
                                  </Stack>

                                  <Divider sx={{ mb: 1.25 }} />

                                  <Typography
                                    fontWeight={900}
                                    sx={{ fontSize: 22, color: '#0f172a', mb: 1.5 }}
                                  >
                                    {formatInr(price || item.budget || 0)}
                                  </Typography>

                                  <Stack spacing={1} sx={{ mt: 'auto' }}>
                                    {isConfirmed ? (
                                      <Button
                                        fullWidth
                                        variant="contained"
                                        disableElevation
                                        startIcon={<CheckCircleIcon />}
                                        sx={{
                                          textTransform: 'none',
                                          fontWeight: 800,
                                          borderRadius: 2,
                                          py: 1,
                                          bgcolor: '#34d399',
                                          color: '#fff',
                                          pointerEvents: 'none',
                                          '&:hover': { bgcolor: '#34d399' },
                                        }}
                                      >
                                        Confirmed
                                      </Button>
                                    ) : (
                                      canChangeItinerary && (
                                        <Button
                                          fullWidth
                                          variant="contained"
                                          disableElevation
                                          startIcon={<CheckCircleIcon />}
                                          disabled={confirm.isPending}
                                          onClick={async () => {
                                            await confirm.mutateAsync(item.id);
                                            refetchAssigned();
                                            refetch();
                                          }}
                                          sx={{
                                            textTransform: 'none',
                                            fontWeight: 800,
                                            borderRadius: 2,
                                            py: 1,
                                            bgcolor: '#d97706',
                                            color: '#fff',
                                            '&:hover': { bgcolor: '#b45309' },
                                          }}
                                        >
                                          {confirm.isPending ? 'Confirming…' : 'Make Confirm'}
                                        </Button>
                                      )
                                    )}

                                    {canMutate && (
                                    <Stack direction="row" spacing={1}>
                                      <Button
                                        fullWidth
                                        variant="contained"
                                        disableElevation
                                        startIcon={<SendIcon />}
                                        disabled={
                                          sendWhatsApp.isPending || !isValidWhatsAppPhone(enquiry?.phone)
                                        }
                                        onClick={async () => {
                                          await sendWhatsApp.mutateAsync(item.id);
                                        }}
                                        sx={{
                                          textTransform: 'none',
                                          fontWeight: 800,
                                          borderRadius: 2,
                                          py: 1,
                                          bgcolor: '#16a34a',
                                          '&:hover': { bgcolor: '#15803d' },
                                        }}
                                      >
                                        {sendWhatsApp.isPending ? 'Sending…' : 'Send'}
                                      </Button>
                                    </Stack>
                                    )}

                                    <Stack direction="row" spacing={1}>
                                      <Button
                                        fullWidth
                                        variant="contained"
                                        disableElevation
                                        startIcon={<VisibilityOutlinedIcon />}
                                        onClick={() =>
                                          window.open(
                                            `/itineraries/preview/${item.id}`,
                                            '_blank',
                                            'noopener,noreferrer'
                                          )
                                        }
                                        sx={{
                                          textTransform: 'none',
                                          fontWeight: 800,
                                          borderRadius: 2,
                                          py: 1,
                                          bgcolor: '#2563eb',
                                          '&:hover': { bgcolor: '#1d4ed8' },
                                        }}
                                      >
                                        Preview
                                      </Button>
                                      <Button
                                        fullWidth
                                        variant="contained"
                                        disableElevation
                                        startIcon={<OpenInNewIcon />}
                                        onClick={() =>
                                          window.open(
                                            `/itineraries/view/${item.id}`,
                                            '_blank',
                                            'noopener,noreferrer'
                                          )
                                        }
                                        sx={{
                                          textTransform: 'none',
                                          fontWeight: 800,
                                          borderRadius: 2,
                                          py: 1,
                                          bgcolor: '#0f766e',
                                          '&:hover': { bgcolor: '#0d9488' },
                                        }}
                                      >
                                        Open
                                      </Button>
                                    </Stack>

                                    {canRemoveItinerary && !isConfirmed && (
                                      <Button
                                        fullWidth
                                        variant="outlined"
                                        color="error"
                                        startIcon={<DeleteOutlinedIcon />}
                                        disabled={unassignEnquiry.isPending}
                                        onClick={() => setDeleteItineraryId(item.id)}
                                        sx={{
                                          textTransform: 'none',
                                          fontWeight: 700,
                                          borderRadius: 2,
                                        }}
                                      >
                                        Delete
                                      </Button>
                                    )}
                                  </Stack>
                                </Box>
                              </Box>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  )}
                </Stack>
              )}

              {activeTabKey === 'quotation' && (
                <EnquiryQuotationPanel enquiry={enquiry} itineraries={assignedItineraries} />
              )}

              {activeTabKey === 'whatsapp' && <EnquiryWhatsAppPanel enquiry={enquiry} />}

              {activeTabKey === 'followup' && (
                <Box sx={{ position: 'relative', pt: canAddFollowUp ? 0.5 : 0 }}>
                  {canAddFollowUp && (
                    <Button
                      variant="contained"
                      disableElevation
                      startIcon={<AddIcon />}
                      onClick={openFollowUpDialog}
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
                        bgcolor: '#d97706',
                        boxShadow: '0 8px 20px rgba(217,119,6,0.28)',
                        '&:hover': { bgcolor: '#b45309' },
                      }}
                    >
                      Add Task
                    </Button>
                  )}

                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{
                      mb: 2,
                      pb: 1.25,
                      pr: canAddFollowUp ? 16 : 0,
                      borderBottom: '2px solid',
                      borderColor: alpha('#d97706', 0.2),
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
                        bgcolor: alpha('#d97706', 0.12),
                        color: '#d97706',
                      }}
                    >
                      <EventNoteOutlinedIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Typography
                      variant="h6"
                      fontWeight={800}
                      sx={{
                        letterSpacing: 0.2,
                        background: 'linear-gradient(90deg, #d97706, #f59e0b)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      Follow - up
                    </Typography>
                  </Stack>

                  {followUps.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                      {canAddFollowUp
                        ? 'No follow-up tasks yet. Click Add Task to create one.'
                        : 'No follow-up tasks for this enquiry.'}
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
                          <TableRow sx={{ bgcolor: alpha('#d97706', 0.06) }}>
                            <TableCell sx={{ fontWeight: 800 }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Description</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Date & Time</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Reminder</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>User</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 800, minWidth: 160 }}>Updated By</TableCell>
                            {canChangeFollowUp && (
                              <TableCell sx={{ fontWeight: 800, width: 120 }}>Action</TableCell>
                            )}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {followUps.map((row) => (
                            <TableRow key={row.id} hover>
                              <TableCell sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
                                {row.type || '—'}
                              </TableCell>
                              <TableCell sx={{ maxWidth: 280, wordBreak: 'break-word' }}>
                                {row.notes || '—'}
                              </TableCell>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                {formatDateTime(row.follow_up_date || row.followUpDate)}
                              </TableCell>
                              <TableCell>{row.reminder ? 'Yes' : 'No'}</TableCell>
                              <TableCell>{userDisplayName(row.assignee)}</TableCell>
                              <TableCell>
                                <Stack spacing={0.5} alignItems="flex-start">
                                  <StatusBadge status={row.status || 'pending'} />
                                  {row.outcome ? (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{ maxWidth: 180, whiteSpace: 'pre-wrap' }}
                                    >
                                      Note: {row.outcome}
                                    </Typography>
                                  ) : null}
                                </Stack>
                              </TableCell>
                              <TableCell>
                                {row.updater || row.updated_by ? (
                                  <Stack spacing={0.25}>
                                    <Typography variant="body2" fontWeight={600}>
                                      {userDisplayName(row.updater)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {formatDateTime(row.updated_at || row.updatedAt)}
                                    </Typography>
                                  </Stack>
                                ) : (
                                  <Typography variant="body2" color="text.disabled">
                                    —
                                  </Typography>
                                )}
                              </TableCell>
                              {canChangeFollowUp && (
                                <TableCell>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => openFollowUpStatusDialog(row)}
                                    sx={{
                                      textTransform: 'none',
                                      fontWeight: 700,
                                      borderRadius: 2,
                                      whiteSpace: 'nowrap',
                                      color: '#d97706',
                                      borderColor: alpha('#d97706', 0.5),
                                      '&:hover': {
                                        borderColor: '#d97706',
                                        bgcolor: alpha('#d97706', 0.08),
                                      },
                                    }}
                                  >
                                    Update Status
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}

                  <EnquiryWhatsAppHistory enquiryId={id} />
                </Box>
              )}

              {activeTabKey === 'history' && (
                <Box>
                  <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
                    Enquiry History
                  </Typography>
                  <TableContainer
                    sx={{
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
                    }}
                  >
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: alpha('#0f172a', 0.03) }}>
                          <TableCell sx={{ fontWeight: 800 }}>Date & Time</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Action</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Details</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>User</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {history.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                              No history records
                            </TableCell>
                          </TableRow>
                        ) : (
                          history.map((row) => (
                            <TableRow key={row.id} hover>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                {formatDateTime(row.date)}
                              </TableCell>
                              <TableCell>
                                <Box
                                  component="span"
                                  sx={{
                                    display: 'inline-block',
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: 1,
                                    fontSize: 12,
                                    fontWeight: 700,
                                    bgcolor: alpha('#1565c0', 0.1),
                                    color: '#1565c0',
                                  }}
                                >
                                  {row.action}
                                </Box>
                              </TableCell>
                              <TableCell sx={{ maxWidth: 360, wordBreak: 'break-word' }}>
                                {row.details}
                              </TableCell>
                              <TableCell>{row.user}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {activeTabKey === 'vehicles' && <EnquiryVehiclePanel enquiry={enquiry} />}

              {activeTabKey === 'payment' && (
                <EnquiryPaymentPanel enquiry={enquiry} itineraries={assignedItineraries} />
              )}

              {activeTabKey === 'invoice' && (
                <EnquiryInvoicePanel enquiry={enquiry} itineraries={assignedItineraries} />
              )}

              {activeTabKey === 'trip_details' && (
                <EnquiryTripDetailsPanel enquiry={enquiry} />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Children details dialog */}
      <Dialog open={childrenOpen} onClose={() => setChildrenOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={800}>Children Details</DialogTitle>
        <DialogContent>
          {childrenDetails.length === 0 ? (
            <Typography color="text.secondary">
              No children age details were captured for this enquiry.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Age</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {childrenDetails.map((child, idx) => (
                  <TableRow key={idx}>
                    <TableCell>Children {idx + 1}</TableCell>
                    <TableCell>{child.age != null ? `${child.age} yrs` : '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setChildrenOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add note dialog */}
      <Dialog open={noteOpen} onClose={() => setNoteOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={800}>Add Note</DialogTitle>
        <DialogContent>
          {leadStatusLabel ? (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1, mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                Current stage
              </Typography>
              <Chip
                size="small"
                label={leadStatusLabel}
                sx={{
                  height: 22,
                  fontWeight: 800,
                  fontSize: 11,
                  color: '#fff',
                  bgcolor: leadStatusColor,
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            </Stack>
          ) : null}
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={4}
            margin="normal"
            label="Note *"
            placeholder="Write enquiry note..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setNoteOpen(false)} disabled={addNote.isPending}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={saveNote}
            disabled={addNote.isPending || !noteText.trim()}
          >
            {addNote.isPending ? 'Saving…' : 'Save Note'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Insert existing itinerary from module */}
      <Dialog
        open={insertOpen}
        onClose={() => setInsertOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle fontWeight={800}>Insert Itinerary</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={1.5}>
            Select an itinerary to add to this enquiry. Travel dates will use this enquiry
            ({enquiry?.travel_from ? formatDate(enquiry.travel_from) : '—'}
            {' → '}
            {enquiry?.travel_to ? formatDate(enquiry.travel_to) : '—'}
            ). If it is already used on another enquiry, a copy is created.
          </Typography>
          {loadingAllItineraries ? (
            <Loader message="Loading itineraries..." />
          ) : allItineraries.length === 0 ? (
            <Typography color="text.secondary">
              No itineraries found. Create one first.
            </Typography>
          ) : (
            <List dense sx={{ maxHeight: 360, overflow: 'auto' }}>
              {allItineraries.map((item) => {
                const alreadyAdded = item.enquiry_id === id;
                return (
                  <ListItemButton
                    key={item.id}
                    selected={selectedItineraryId === item.id}
                    disabled={alreadyAdded}
                    onClick={() => !alreadyAdded && setSelectedItineraryId(item.id)}
                    sx={{ borderRadius: 2, mb: 0.5 }}
                  >
                    <Radio
                      checked={selectedItineraryId === item.id}
                      value={item.id}
                      edge="start"
                      tabIndex={-1}
                      disableRipple
                      disabled={alreadyAdded}
                    />
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography fontWeight={700}>{item.title}</Typography>
                          <StatusBadge status={item.status || 'draft'} />
                          {alreadyAdded && (
                            <Typography variant="caption" color="success.main" fontWeight={700}>
                              Added
                            </Typography>
                          )}
                        </Stack>
                      }
                      secondary={`${item.days || 0}D / ${item.nights || 0}N${
                        item.from_date ? ` · ${formatDate(item.from_date)}` : ''
                      }${
                        item.enquiry?.enquiry_code && item.enquiry_id !== id
                          ? ` · Linked to ${item.enquiry.enquiry_code}`
                          : ''
                      }`}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setInsertOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!selectedItineraryId || assignEnquiry.isPending}
            onClick={async () => {
              await assignEnquiry.mutateAsync({
                id: selectedItineraryId,
                enquiryId: id,
              });
              setInsertOpen(false);
              setSelectedItineraryId(null);
              refetchAssigned();
              refetch();
            }}
          >
            {assignEnquiry.isPending ? 'Adding…' : 'Add Itinerary'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle fontWeight={800}>
          Update Lead Status
          {enquiry?.enquiry_code ? ` — ${enquiry.enquiry_code}` : ''}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            select
            fullWidth
            margin="normal"
            label="Lead Status"
            value={leadStatusValue}
            onChange={(e) => setLeadStatusValue(e.target.value)}
            disabled={pendingStatusOptions.length === 0}
          >
            {pendingStatusOptions.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: s.button_color || '#90a4ae',
                      flexShrink: 0,
                    }}
                  />
                  <span>{s.lead_status}</span>
                </Stack>
              </MenuItem>
            ))}
          </TextField>
          {pendingStatusOptions.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              No pending stages left for this enquiry.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setStatusDialogOpen(false)}
            color="inherit"
            disabled={updateStatus.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={
              updateStatus.isPending || !leadStatusValue || pendingStatusOptions.length === 0
            }
            onClick={async () => {
              await updateStatus.mutateAsync({
                id,
                lead_status_id: leadStatusValue,
              });
              setStatusDialogOpen(false);
              refetch();
            }}
          >
            {updateStatus.isPending ? 'Updating…' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add follow-up task dialog */}
      <Dialog
        open={followUpOpen}
        onClose={() => setFollowUpOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle fontWeight={800}>Add Task</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              fullWidth
              label="Followup Type *"
              value={followUpForm.type}
              onChange={(e) =>
                setFollowUpForm((prev) => ({ ...prev, type: e.target.value }))
              }
            >
              {FOLLOWUP_TYPE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Description"
              placeholder="Enter follow-up description..."
              value={followUpForm.notes}
              onChange={(e) =>
                setFollowUpForm((prev) => ({ ...prev, notes: e.target.value }))
              }
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <DatePickerField
                  label="Reminder Date *"
                  value={followUpForm.followUpDate}
                  onChange={(date) =>
                    setFollowUpForm((prev) => ({ ...prev, followUpDate: date }))
                  }
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <TimePickerField
                  label="Time"
                  value={followUpForm.followUpTime}
                  onChange={(time) =>
                    setFollowUpForm((prev) => ({ ...prev, followUpTime: time }))
                  }
                />
              </Box>
            </Stack>

            <FormControl>
              <FormLabel sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                Reminder
              </FormLabel>
              <RadioGroup
                row
                value={followUpForm.reminder}
                onChange={(e) =>
                  setFollowUpForm((prev) => ({ ...prev, reminder: e.target.value }))
                }
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>

            <TextField
              select
              fullWidth
              label="Followup User"
              value={followUpForm.assignedTo}
              onChange={(e) =>
                setFollowUpForm((prev) => ({ ...prev, assignedTo: e.target.value }))
              }
            >
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {userDisplayName(u)}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setFollowUpOpen(false)}
            disabled={createFollowUp.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={saveFollowUp}
            disabled={createFollowUp.isPending || !followUpForm.followUpDate}
            sx={{ bgcolor: '#d97706', '&:hover': { bgcolor: '#b45309' } }}
          >
            {createFollowUp.isPending ? 'Saving…' : 'Save Task'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update follow-up status dialog */}
      <Dialog
        open={!!followUpStatusRow}
        onClose={() => {
          if (updateFollowUp.isPending) return;
          setFollowUpStatusRow(null);
          setFollowUpStatusForm(emptyStatusForm);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle fontWeight={800}>Update Status</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              fullWidth
              label="Status *"
              value={followUpStatusForm.status}
              onChange={(e) =>
                setFollowUpStatusForm((prev) => ({ ...prev, status: e.target.value }))
              }
            >
              {FOLLOW_UP_STATUSES.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Note *"
              placeholder="Add a note for this status update..."
              value={followUpStatusForm.outcome}
              onChange={(e) =>
                setFollowUpStatusForm((prev) => ({ ...prev, outcome: e.target.value }))
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setFollowUpStatusRow(null);
              setFollowUpStatusForm(emptyStatusForm);
            }}
            disabled={updateFollowUp.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={saveFollowUpStatus}
            disabled={
              updateFollowUp.isPending ||
              !followUpStatusForm.status ||
              !followUpStatusForm.outcome.trim()
            }
            sx={{ bgcolor: '#d97706', '&:hover': { bgcolor: '#b45309' } }}
          >
            {updateFollowUp.isPending ? 'Updating…' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteItineraryId}
        title="Delete Itinerary"
        message="Remove this itinerary from the enquiry section? It will stay available in the Itinerary module."
        confirmLabel="Delete"
        onCancel={() => setDeleteItineraryId(null)}
        onConfirm={async () => {
          await unassignEnquiry.mutateAsync(deleteItineraryId);
          setDeleteItineraryId(null);
          refetchAssigned();
          refetch();
        }}
      />
    </Box>
  );
}
