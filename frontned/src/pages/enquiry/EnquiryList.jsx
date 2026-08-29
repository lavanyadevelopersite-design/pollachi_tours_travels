import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TransformIcon from '@mui/icons-material/Transform';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useSnackbar } from 'notistack';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/dataTable/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ContactNumberDisplay from '../../components/common/ContactNumberDisplay';
import Loader from '../../components/common/Loader';
import SelectFilter, { FilterGroup } from '../../components/common/SelectFilter';
import { usePermission, canSkipLeadStatusStages } from '../../hooks/usePermission';
import { useAuth } from '../../hooks/useAuth';
import { useEnquiries, useEnquiryMutation } from '../../hooks/queries/useEnquiry';
import { useLeadStatuses } from '../../hooks/queries/useMasters';
import { useUsers } from '../../hooks/queries/useUsers';
import enquiryService from '../../services/enquiry.service';
import { formatDate, formatDateTime, truncate, formatRouteLabel } from '../../utils/formatters';
import { getPendingLeadStatuses } from '../../utils/leadStatusPipeline';
import { ENQUIRY_TYPES } from '../../utils/constants';

function buildFeedbackShareMessage(enquiry, link) {
  const code = enquiry?.enquiry_code || enquiry?.id || 'your trip';
  const name = enquiry?.customer_name || 'Customer';
  return [
    `Hi ${name},`,
    ``,
    `Thank you for travelling with us (${code}).`,
    `Please share your feedback for this trip:`,
    link,
    ``,
    `Your feedback helps us improve our service.`,
  ].join('\n');
}

function CellStack({ children }) {
  return (
    <Box sx={{ py: 0.75, display: 'flex', flexDirection: 'column', gap: 0.35, lineHeight: 1.35 }}>
      {children}
    </Box>
  );
}

function SubLine({ children }) {
  return (
    <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.4 }}>
      {children}
    </Typography>
  );
}

function userDisplayName(user) {
  if (!user) return '';
  return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || '';
}

function assigneeLabel(row) {
  const name = userDisplayName(row.assignee);
  return name || 'Assign';
}

function displayText(value, maxLen = 80) {
  if (!value) return '—';
  const text = String(value);
  if (text.length <= maxLen) return text;
  return truncate(text, maxLen);
}

function destinationLabel(row) {
  return formatRouteLabel(row.travel_from_destination, row.travel_to_destination, '');
}

function typeLabel(type) {
  if (!type) return '—';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export default function EnquiryList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const canJumpLeadStatus = canSkipLeadStatusStages(user);
  const canCreate = usePermission('enquiries.create');
  const canEdit = usePermission('enquiries.edit');
  const canDelete = usePermission('enquiries.delete');
  const canFeedback = usePermission('feedback.create') || canEdit;
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get('lead_status_id') || '');
  const [typeFilter, setTypeFilter] = useState('');
  const dateFrom = searchParams.get('from') || '';
  const dateTo = searchParams.get('to') || '';
  const [deleteId, setDeleteId] = useState(null);
  const [statusRow, setStatusRow] = useState(null);
  const [leadStatusValue, setLeadStatusValue] = useState('');
  const [assignRow, setAssignRow] = useState(null);
  const [assignUserId, setAssignUserId] = useState('');
  const [feedbackRow, setFeedbackRow] = useState(null);
  const [feedbackLink, setFeedbackLink] = useState('');
  const [feedbackMeta, setFeedbackMeta] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackWhatsAppSending, setFeedbackWhatsAppSending] = useState(false);

  const { data, isLoading, refetch, isFetching } = useEnquiries({
    page,
    perPage,
    search,
    sortBy,
    sortOrder,
    ...(statusFilter ? { lead_status_id: statusFilter } : {}),
    ...(typeFilter ? { enquiry_type: typeFilter } : {}),
    ...(dateFrom ? { from: dateFrom } : {}),
    ...(dateTo ? { to: dateTo } : {}),
  });
  const { remove, convert, updateStatus, update } = useEnquiryMutation();
  const { data: leadStatusData, refetch: refetchLeadStatuses } = useLeadStatuses({
    page: 1,
    perPage: 200,
    is_active: true,
  });
  const { data: usersData } = useUsers({
    page: 1,
    perPage: 300,
    sortBy: 'first_name',
    sortOrder: 'asc',
  });

  const rows = data?.rows || [];
  const total = data?.pagination?.total || rows.length;
  const leadStatusOptions = leadStatusData?.rows || [];
  const users = usersData?.rows || [];

  const pendingStatusOptions = useMemo(
    () =>
      getPendingLeadStatuses(
        leadStatusOptions,
        statusRow?.lead_status_id || statusRow?.leadStatus?.id,
        statusRow?.leadStatus?.lead_status,
        { canSkipStages: canJumpLeadStatus }
      ),
    [leadStatusOptions, statusRow, canJumpLeadStatus]
  );

  const handleSearch = useCallback((v) => {
    setSearch(v);
    setPage(1);
  }, []);

  const openStatusDialog = useCallback(
    (row) => {
      setStatusRow(row);
      const pending = getPendingLeadStatuses(
        leadStatusOptions,
        row.lead_status_id || row.leadStatus?.id,
        row.leadStatus?.lead_status,
        { canSkipStages: canJumpLeadStatus }
      );
      setLeadStatusValue(pending[0]?.id || '');
    },
    [leadStatusOptions, canJumpLeadStatus]
  );

  const closeStatusDialog = () => {
    setStatusRow(null);
    setLeadStatusValue('');
  };

  const saveStatus = async () => {
    if (!statusRow) return;
    await updateStatus.mutateAsync({
      id: statusRow.id,
      lead_status_id: leadStatusValue || null,
    });
    closeStatusDialog();
  };

  const openAssignDialog = useCallback(
    (row) => {
      setAssignRow(row);
      setAssignUserId(row.assigned_to || row.assignee?.id || user?.id || '');
    },
    [user?.id]
  );

  const closeAssignDialog = () => {
    setAssignRow(null);
    setAssignUserId('');
  };

  const saveAssign = async () => {
    if (!assignRow) return;
    const assignedTo = assignUserId || user?.id || null;
    await update.mutateAsync({
      id: assignRow.id,
      assigned_to: assignedTo,
    });
    closeAssignDialog();
  };

  const openFeedbackShare = useCallback(async (row) => {
    setFeedbackRow(row);
    setFeedbackLink('');
    setFeedbackMeta(null);
    setFeedbackLoading(true);
    try {
      const { data } = await enquiryService.createFeedbackLink(row.id);
      const payload = data?.data ?? data;
      const link = `${window.location.origin}/feedback/${payload.token}`;
      setFeedbackLink(link);
      setFeedbackMeta(payload);
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || 'Unable to create feedback link', {
        variant: 'error',
      });
      setFeedbackRow(null);
    } finally {
      setFeedbackLoading(false);
    }
  }, [enqueueSnackbar]);

  const closeFeedbackShare = () => {
    setFeedbackRow(null);
    setFeedbackLink('');
    setFeedbackMeta(null);
  };

  const copyFeedbackLink = async () => {
    if (!feedbackLink) return;
    try {
      await navigator.clipboard.writeText(feedbackLink);
      enqueueSnackbar('Feedback link copied', { variant: 'success' });
    } catch {
      enqueueSnackbar('Unable to copy link', { variant: 'error' });
    }
  };

  const copyFeedbackMessage = async () => {
    if (!feedbackLink || !feedbackRow) return;
    const message = buildFeedbackShareMessage(feedbackRow, feedbackLink);
    try {
      await navigator.clipboard.writeText(message);
      enqueueSnackbar('Share message copied', { variant: 'success' });
    } catch {
      enqueueSnackbar('Unable to copy message', { variant: 'error' });
    }
  };

  const shareFeedbackWhatsApp = async () => {
    if (!feedbackLink || !feedbackRow || feedbackWhatsAppSending) return;

    const phone = String(feedbackRow?.phone || '').trim();
    if (!phone) {
      enqueueSnackbar('Customer has no contact number', { variant: 'warning' });
      return;
    }

    setFeedbackWhatsAppSending(true);
    try {
      await enquiryService.shareFeedbackWhatsApp(feedbackRow.id, {
        feedback_link: feedbackLink,
      });
      enqueueSnackbar('Feedback link shared on WhatsApp', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(
        err?.response?.data?.message || err?.message || 'Failed to share on WhatsApp',
        { variant: 'error' }
      );
    } finally {
      setFeedbackWhatsAppSending(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        id: 'enquiryNo',
        name: 'Enquiry No',
        sortable: true,
        sortField: 'enquiry_code',
        minWidth: '150px',
        wrap: true,
        cell: (r) => (
          <CellStack>
            <Link
              component="button"
              type="button"
              underline="hover"
              onClick={() => navigate(`/enquiry/view/${r.id}`)}
              sx={{ fontWeight: 700, textAlign: 'left', fontSize: 13, whiteSpace: 'normal' }}
            >
              {r.enquiry_code || '—'}
            </Link>
            <SubLine>
              Adult: {r.adults ?? 0} | Child: {r.children ?? 0}
            </SubLine>
            <SubLine>{formatDateTime(r.created_at || r.createdAt)}</SubLine>
          </CellStack>
        ),
      },
      {
        id: 'customer',
        name: 'Customer Name',
        sortable: true,
        sortField: 'customer_name',
        grow: 1,
        minWidth: '170px',
        wrap: true,
        cell: (r) => (
          <CellStack>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
            >
              {displayText(r.customer_name, 80)}
            </Typography>
            <ContactNumberDisplay value={r.phone} variant="whatsapp" />
            <ContactNumberDisplay
              value={r.emergency_contact_number}
              variant="alt"
              prefix="Alt: "
            />
            <SubLine>{typeLabel(r.enquiry_type)}</SubLine>
          </CellStack>
        ),
      },
      {
        id: 'destination',
        name: 'Destination',
        minWidth: '130px',
        wrap: true,
        cell: (r) => {
          const full = destinationLabel(r);
          return (
            <Typography
              variant="body2"
              title={full}
              sx={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.4 }}
            >
              {displayText(full, 80)}
            </Typography>
          );
        },
      },
      {
        id: 'travelDates',
        name: 'Travel Date',
        minWidth: '110px',
        width: '118px',
        wrap: true,
        cell: (r) => {
          const from = r.travel_from ? formatDate(r.travel_from, 'D-M-YYYY') : '';
          const to = r.travel_to ? formatDate(r.travel_to, 'D-M-YYYY') : '';
          if (!from && !to) return <Typography variant="body2">—</Typography>;
          return (
            <CellStack>
              <Typography variant="body2" fontWeight={600}>
                {from || '—'}
              </Typography>
              {to ? (
                <>
                  <Typography variant="caption" color="text.secondary">
                    to
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {to}
                  </Typography>
                </>
              ) : null}
            </CellStack>
          );
        },
      },
      {
        id: 'assignedTo',
        name: 'Assigned To',
        minWidth: '130px',
        wrap: true,
        cell: (r) => (
          <Button
            size="small"
            variant="text"
            startIcon={<PersonOutlinedIcon fontSize="small" />}
            onClick={() => (canEdit ? openAssignDialog(r) : navigate(`/enquiry/view/${r.id}`))}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              color: r.assignee ? '#0f766e' : '#94a3b8',
              whiteSpace: 'normal',
              height: 'auto',
              py: 0.5,
              px: 0.5,
              minWidth: 0,
              textAlign: 'left',
              lineHeight: 1.35,
              '& .MuiButton-startIcon': { color: 'inherit' },
              '&:hover': {
                color: r.assignee ? '#0d9488' : '#64748b',
                bgcolor: 'transparent',
              },
            }}
          >
            <Typography
              variant="body2"
              component="span"
              sx={{
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                fontWeight: 700,
                color: 'inherit',
              }}
            >
              {assigneeLabel(r)}
            </Typography>
          </Button>
        ),
      },
      {
        id: 'leadSource',
        name: 'Lead Source',
        wrap: true,
        minWidth: '110px',
        cell: (r) => (
          <Typography variant="body2" sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
            {displayText(r.leadSource?.lead_source_type, 80)}
          </Typography>
        ),
      },
      {
        id: 'service',
        name: 'Service',
        wrap: true,
        minWidth: '120px',
        cell: (r) => (
          <Typography variant="body2" sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
            {displayText(r.service_required, 80)}
          </Typography>
        ),
      },
      {
        id: 'leadStatus',
        name: 'Lead Status',
        wrap: true,
        minWidth: '140px',
        cell: (r) => {
          const label = r.leadStatus?.lead_status || '—';
          const color = r.leadStatus?.button_color || '#90a4ae';
          return (
            <Button
              size="small"
              disableElevation
              title={label}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                px: 1.5,
                py: 0.35,
                minWidth: 0,
                borderRadius: 999,
                color: '#fff',
                bgcolor: color,
                background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
                boxShadow: `0 4px 12px ${alpha(color, 0.3)}`,
                pointerEvents: 'none',
                whiteSpace: 'normal',
                lineHeight: 1.3,
                height: 'auto',
                '&:hover': { bgcolor: color },
              }}
            >
              {label}
            </Button>
          );
        },
      },
      {
        id: 'actions',
        name: 'Actions',
        width: '210px',
        omitExport: true,
        cell: (row) => (
          <Box sx={{ display: 'flex' }}>
            {canEdit && (
              <Tooltip title="Edit"><IconButton size="small" color="warning" onClick={() => navigate(`/enquiry/edit/${row.id}`)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canEdit && (
              <Tooltip title="Status Update"><IconButton size="small" color="primary" onClick={() => openStatusDialog(row)}>
                  <SyncAltIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canFeedback && (
              <Tooltip title="Share feedback link">
                <IconButton
                  size="small"
                  sx={{ color: '#db2777' }}
                  onClick={() => openFeedbackShare(row)}
                >
                  <RateReviewOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canEdit && !row.is_converted && (
              <Tooltip title="Convert to Lead"><IconButton
                  size="small"
                  color="success"
                  disabled={convert.isPending}
                  onClick={() => convert.mutate(row.id)}
                >
                  <TransformIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteId(row.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      },
    ],
    [canEdit, canDelete, canFeedback, navigate, convert, openStatusDialog, openAssignDialog, openFeedbackShare]
  );

  if (isLoading && !data) return <Loader />;

  return (
    <Box>
      <PageHeader
        title="Enquiries"
        subtitle="Manage customer travel enquiries and lead lifecycle"
        actionLabel={canCreate ? 'Add Enquiry' : undefined}
        actionPermission={canCreate}
        onAction={() => navigate('/enquiry/create')}
        extra={
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              refetch();
              refetchLeadStatuses();
            }}
            disabled={isFetching}
          >
            Refresh
          </Button>
        }
      />
      <DataTable
        title="Enquiries"
        columns={columns}
        data={rows}
        totalRows={total}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={(n) => {
          setPerPage(n);
          setPage(1);
        }}
        searchValue={search}
        onSearch={handleSearch}
        onSort={(field, dir) => {
          setSortBy(field);
          setSortOrder(dir);
        }}
        tableKey="enquiry-list"
        exportFilename="enquiries"
        paginationServer
        loading={isLoading}
        filters={
          <FilterGroup>
            <SelectFilter
              label="Type"
              value={typeFilter}
              onChange={(v) => {
                setTypeFilter(v);
                setPage(1);
              }}
              options={ENQUIRY_TYPES}
            />
            <SelectFilter
              label="Lead Status"
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
              options={leadStatusOptions.map((s) => ({ value: s.id, label: s.lead_status }))}
              minWidth={180}
            />
          </FilterGroup>
        }
      />
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Enquiry"
        message="Are you sure you want to delete this enquiry? This action cannot be undone."
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          await remove.mutateAsync(deleteId);
          setDeleteId(null);
        }}
        confirmLabel="Delete"
      />

      <Dialog open={!!statusRow} onClose={closeStatusDialog} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>
          Status Update{statusRow?.enquiry_code ? ` — ${statusRow.enquiry_code}` : ''}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            select
            fullWidth
            margin="normal"
            label="Lead Status"
            value={leadStatusValue}
            onChange={(e) => setLeadStatusValue(e.target.value)}
          >
            {pendingStatusOptions.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.lead_status}
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
          <Button onClick={closeStatusDialog} color="inherit" disabled={updateStatus.isPending}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={saveStatus}
            disabled={updateStatus.isPending || !leadStatusValue || pendingStatusOptions.length === 0}
          >
            {updateStatus.isPending ? 'Saving…' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!assignRow} onClose={closeAssignDialog} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>
          Assign To{assignRow?.enquiry_code ? ` — ${assignRow.enquiry_code}` : ''}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            select
            fullWidth
            margin="normal"
            label="User *"
            value={assignUserId}
            onChange={(e) => setAssignUserId(e.target.value)}
          >
            {users.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {userDisplayName(u)}
              </MenuItem>
            ))}
          </TextField>
          <Typography variant="caption" color="text.secondary">
            On save, this enquiry is assigned to the selected user. If empty, your session user is used.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeAssignDialog} color="inherit" disabled={update.isPending}>
            Cancel
          </Button>
          <Button variant="contained" onClick={saveAssign} disabled={update.isPending}>
            {update.isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!feedbackRow} onClose={closeFeedbackShare} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={800}>
          Share Feedback Link
          {feedbackRow?.enquiry_code ? ` — ${feedbackRow.enquiry_code}` : ''}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.75} sx={{ pt: 0.5 }}>
            <Alert severity="info">
              Share this link with the customer so they can rate the trip and leave feedback.
            </Alert>

            {feedbackMeta?.already_submitted && (
              <Alert severity="success">
                Customer has already submitted feedback for this trip.
              </Alert>
            )}

            <Box>
              <Typography variant="caption" color="text.secondary">
                Customer
              </Typography>
              <Typography fontWeight={700}>{feedbackRow?.customer_name || '—'}</Typography>
            </Box>

            <TextField
              label="Customer feedback link"
              value={feedbackLoading ? 'Generating link…' : feedbackLink}
              fullWidth
              multiline
              minRows={2}
              InputProps={{ readOnly: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, flexWrap: 'wrap', gap: 1 }}>
          <Button onClick={closeFeedbackShare} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Close
          </Button>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={copyFeedbackLink}
            disabled={feedbackLoading || !feedbackLink}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Copy link
          </Button>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={copyFeedbackMessage}
            disabled={feedbackLoading || !feedbackLink}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Copy message
          </Button>
          <Button
            variant="outlined"
            startIcon={<WhatsAppIcon />}
            onClick={shareFeedbackWhatsApp}
            disabled={feedbackLoading || !feedbackLink || feedbackWhatsAppSending}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              color: '#128C7E',
              borderColor: alpha('#128C7E', 0.45),
            }}
          >
            {feedbackWhatsAppSending ? 'Sending…' : 'WhatsApp'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
