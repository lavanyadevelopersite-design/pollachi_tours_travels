import { useCallback, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import WifiOutlinedIcon from '@mui/icons-material/WifiOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import TimelapseOutlinedIcon from '@mui/icons-material/TimelapseOutlined';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/dataTable/DataTable';
import Loader from '../../components/common/Loader';
import StatCard from '../../components/common/StatCard';
import { useUsers } from '../../hooks/queries/useUsers';
import {
  useLoginHistory,
  useLoginHistorySummary,
  useLoginHistoryUserReport,
} from '../../hooks/queries/useLoginHistory';
import { formatDate, formatDateTime, getInitials } from '../../utils/formatters';
import { colors } from '../../theme/palette';

const ALL_USERS = 'all';

function HoursBadge({ value, hoursDecimal }) {
  const isFull = Number(hoursDecimal) >= 8;
  return (
    <Typography
      fontWeight={700}
      fontSize={13}
      color={isFull ? 'success.main' : 'warning.main'}
    >
      {value || '—'}
    </Typography>
  );
}

function StatusChip({ status }) {
  const online = status === 'Online';
  return (
    <Chip
      size="small"
      label={status}
      sx={{
        fontWeight: 600,
        borderRadius: 5,
        bgcolor: online ? colors.successLight : '#e2e8f0',
        color: online ? colors.success : colors.textSecondary,
      }}
    />
  );
}

function StatBar({ label, percent, valueLabel, color = colors.accent }) {
  return (
    <Box mb={2}>
      <Stack direction="row" justifyContent="space-between" mb={0.75}>
        <Typography variant="body2" fontWeight={600} color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          {valueLabel}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, Number(percent) || 0)}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: '#e8eef5',
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 },
        }}
      />
    </Box>
  );
}

function CircularProgressRing({ value = 0, label = '0 hrs' }) {
  const size = 160;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, value) / 100) * circumference;

  return (
    <Box position="relative" width={size} height={size} mx="auto" my={2}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e8eef5"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.accent}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <Box
        position="absolute"
        top={0}
        left={0}
        width="100%"
        height="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
      >
        <Typography variant="h5" fontWeight={700}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

function SessionDetailDialog({ open, onClose, userRow, filterParams }) {
  const detailParams = useMemo(
    () => ({
      page: 1,
      perPage: 100,
      sortBy: 'login_at',
      sortOrder: 'desc',
      user_id: userRow?.user_id,
      from: filterParams?.from,
      to: filterParams?.to,
    }),
    [userRow?.user_id, filterParams?.from, filterParams?.to]
  );

  const { data, isLoading } = useLoginHistory(detailParams, {
    enabled: open && Boolean(userRow?.user_id),
  });
  const sessions = data?.rows || [];

  const columns = useMemo(
    () => [
      {
        id: 'sno',
        name: 'S. No',
        width: '70px',
        cell: (_row, index) => index + 1,
      },
      {
        id: 'employee_id',
        name: 'Employee ID',
        selector: (r) => r.employee_id,
        minWidth: '120px',
      },
      {
        id: 'branch',
        name: 'Branch',
        selector: (r) => r.branch,
        minWidth: '110px',
      },
      {
        id: 'department',
        name: 'Department',
        selector: (r) => r.department,
        minWidth: '120px',
      },
      {
        id: 'login_at',
        name: 'Login Time',
        selector: (r) => (r.login_at ? formatDateTime(r.login_at) : '—'),
        minWidth: '160px',
      },
      {
        id: 'logout_at',
        name: 'Logout Time',
        selector: (r) => (r.logout_at ? formatDateTime(r.logout_at) : '—'),
        minWidth: '160px',
      },
      {
        id: 'working_hours',
        name: 'Working Hours',
        minWidth: '120px',
        cell: (row) => (
          <HoursBadge value={row.working_hours} hoursDecimal={row.working_hours_decimal} />
        ),
      },
      {
        id: 'break_time',
        name: 'Break Time',
        selector: (r) => r.break_time || '0m',
        minWidth: '100px',
      },
      {
        id: 'status',
        name: 'Status',
        minWidth: '100px',
        cell: (row) => <StatusChip status={row.status} />,
      },
      {
        id: 'ip_address',
        name: 'IP Address',
        selector: (r) => r.ip_address,
        minWidth: '120px',
      },
      {
        id: 'device',
        name: 'Device',
        selector: (r) => r.device,
        minWidth: '100px',
      },
    ],
    []
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar src={userRow?.avatar || undefined} sx={{ width: 40, height: 40 }}>
            {getInitials(userRow?.username || userRow?.employee_name)}
          </Avatar>
          <Box>
            <Typography fontWeight={700}>
              {userRow?.username || userRow?.employee_name || 'User'} — Session Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userRow?.date || '—'} · Total: {userRow?.total_working_hours || userRow?.working_hours || '0m'}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <DataTable
          title="Login Sessions"
          columns={columns}
          data={sessions}
          totalRows={sessions.length}
          page={1}
          perPage={Math.max(10, sessions.length)}
          searchable={false}
          exportable
          tableKey="login-session-details"
          exportFilename="login-session-details"
          paginationServer={false}
          loading={isLoading}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function AllUsersView({
  rows,
  total,
  page,
  perPage,
  setPage,
  setPerPage,
  search,
  handleSearch,
  onSort,
  loading,
  summary,
  summaryLoading,
  onRefresh,
  filterParams,
}) {
  const [viewRow, setViewRow] = useState(null);

  const columns = useMemo(
    () => [
      {
        id: 'sno',
        name: 'S. No',
        width: '70px',
        cell: (_row, index) => (page - 1) * perPage + index + 1,
      },
      {
        id: 'username',
        name: 'Username',
        minWidth: '220px',
        sortable: true,
        sortField: 'username',
        cell: (row) => (
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Avatar src={row.avatar || undefined} sx={{ width: 32, height: 32, fontSize: 13 }}>
              {getInitials(row.username || row.employee_name)}
            </Avatar>
            <Typography fontSize={13.5} fontWeight={600}>
              {row.username || row.employee_name}
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'date',
        name: 'Date',
        selector: (r) => r.date || '—',
        minWidth: '200px',
      },
      {
        id: 'total_working_hours',
        name: 'Total Working Hours',
        minWidth: '160px',
        sortable: true,
        sortField: 'working_hours',
        cell: (row) => (
          <HoursBadge
            value={row.total_working_hours || row.working_hours}
            hoursDecimal={row.working_hours_decimal}
          />
        ),
      },
      {
        id: 'actions',
        name: 'Action',
        width: '100px',
        omitExport: true,
        cell: (row) => (
          <Tooltip title="View details">
            <IconButton size="small" color="info" onClick={() => setViewRow(row)}>
              <VisibilityOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [page, perPage]
  );

  return (
    <Box>
      <Grid container spacing={2} mb={2.5}>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: true }}>
          <StatCard
            title="Total Users"
            value={summary?.total_users ?? '—'}
            icon={<PeopleAltOutlinedIcon />}
            color={colors.accent}
            bgColor="rgba(33,150,243,0.12)"
            loading={summaryLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: true }}>
          <StatCard
            title="Logged In Today"
            value={summary?.logged_in_today ?? '—'}
            icon={<LoginOutlinedIcon />}
            color={colors.success}
            bgColor="rgba(34,197,94,0.12)"
            loading={summaryLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: true }}>
          <StatCard
            title="Currently Online"
            value={summary?.currently_online ?? '—'}
            icon={<WifiOutlinedIcon />}
            color={colors.info}
            bgColor="rgba(6,182,212,0.12)"
            loading={summaryLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: true }}>
          <StatCard
            title="Average Working Hours"
            value={summary?.average_working_hours ?? '—'}
            icon={<ScheduleOutlinedIcon />}
            color={colors.orange}
            bgColor="rgba(249,115,22,0.12)"
            loading={summaryLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: true }}>
          <StatCard
            title="Total Working Hours"
            value={summary?.total_working_hours ?? '—'}
            icon={<TimelapseOutlinedIcon />}
            color={colors.purple}
            bgColor="rgba(139,92,246,0.12)"
            loading={summaryLoading}
          />
        </Grid>
      </Grid>

      <DataTable
        title="All Users Login History"
        columns={columns}
        data={rows}
        totalRows={total}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={(value) => {
          setPerPage(value);
          setPage(1);
        }}
        searchValue={search}
        onSearch={handleSearch}
        onSort={(field, direction) => onSort(field, direction)}
        tableKey="login-history"
        exportFilename="login-history"
        exportable
        paginationServer
        loading={loading}
        actions={
          <IconButton size="small" onClick={onRefresh} title="Refresh">
            <RefreshIcon fontSize="small" />
          </IconButton>
        }
      />

      <SessionDetailDialog
        open={Boolean(viewRow)}
        onClose={() => setViewRow(null)}
        userRow={viewRow}
        filterParams={filterParams}
      />
    </Box>
  );
}

function SingleUserView({ report, loading }) {
  if (loading && !report) return <Loader />;
  if (!report) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">No login history found for the selected user and date range.</Typography>
        </CardContent>
      </Card>
    );
  }

  const { time, statistics, activity, attendance, daily_records: chart, user } = report;

  const attendanceColumns = [
    { id: 'sno', name: 'S. No', width: '70px', selector: (r) => r.sno },
    {
      id: 'date',
      name: 'Date',
      selector: (r) => formatDate(r.date),
      minWidth: '120px',
    },
    {
      id: 'punch_in',
      name: 'Punch In',
      selector: (r) => (r.punch_in ? dayjs(r.punch_in).format('hh:mm A') : '—'),
      minWidth: '100px',
    },
    {
      id: 'punch_out',
      name: 'Punch Out',
      selector: (r) => (r.punch_out ? dayjs(r.punch_out).format('hh:mm A') : '—'),
      minWidth: '100px',
    },
    {
      id: 'production',
      name: 'Production',
      selector: (r) => r.production,
      minWidth: '100px',
    },
    {
      id: 'break_time',
      name: 'Break',
      selector: (r) => r.break_time,
      minWidth: '90px',
    },
    {
      id: 'overtime',
      name: 'Overtime',
      selector: (r) => r.overtime,
      minWidth: '90px',
    },
  ];

  return (
    <Box>
      <Stack direction="row" spacing={1.5} alignItems="center" mb={2.5}>
        <Avatar src={user?.avatar || undefined} sx={{ width: 44, height: 44 }}>
          {getInitials(user?.name)}
        </Avatar>
        <Box>
          <Typography fontWeight={700}>{user?.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.employee_id} · {user?.branch} · {user?.department}
          </Typography>
        </Box>
        <Chip
          size="small"
          label={`Total: ${report.total_working_hours || '0m'}`}
          sx={{ ml: 'auto', fontWeight: 600 }}
        />
      </Stack>

      <Grid container spacing={2.5} mb={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography fontWeight={700}>Timesheet</Typography>
                <Typography variant="body2" color="text.secondary">
                  {time?.date}
                </Typography>
              </Stack>
              <Box
                sx={{
                  bgcolor: '#f8fafc',
                  borderRadius: 2,
                  p: 1.5,
                  mb: 1,
                  border: '1px solid #e8eef5',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Punch In at
                </Typography>
                <Typography fontWeight={600} fontSize={14}>
                  {time?.punch_in_at ? formatDateTime(time.punch_in_at) : 'Not punched in today'}
                </Typography>
              </Box>
              <CircularProgressRing value={time?.progress || 0} label={time?.current_hours_label || '0 hrs'} />
              <Button
                fullWidth
                variant="contained"
                color={time?.is_punched_in ? 'error' : 'primary'}
                disabled
                sx={{ borderRadius: 2, mb: 2, textTransform: 'none', fontWeight: 700 }}
              >
                {time?.is_punched_in ? 'Punched In' : 'Punched Out'}
              </Button>
              <Stack direction="row" justifyContent="space-around">
                <Box textAlign="center">
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    BREAK
                  </Typography>
                  <Typography fontWeight={700}>{time?.break_label || '0 hrs'}</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    Overtime
                  </Typography>
                  <Typography fontWeight={700}>{time?.overtime_label || '0 hrs'}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography fontWeight={700} mb={2}>
                Statistics
              </Typography>
              <StatBar label="Today" percent={statistics?.today?.percent} valueLabel={statistics?.today?.label} />
              <StatBar label="This Week" percent={statistics?.week?.percent} valueLabel={statistics?.week?.label} color={colors.success} />
              <StatBar label="This Month" percent={statistics?.month?.percent} valueLabel={statistics?.month?.label} color={colors.info} />
              <StatBar label="Remaining" percent={statistics?.remaining?.percent} valueLabel={statistics?.remaining?.label} color={colors.warning} />
              <StatBar label="Overtime" percent={statistics?.overtime?.percent} valueLabel={statistics?.overtime?.label} color={colors.orange} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography fontWeight={700} mb={2}>
                Activity
              </Typography>
              {activity?.length ? (
                <Stack spacing={0}>
                  {activity.map((item, idx) => (
                    <Stack key={item.id} direction="row" spacing={1.5} alignItems="flex-start">
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: item.type === 'punch_in' ? colors.success : colors.danger,
                          mt: 0.7,
                          position: 'relative',
                          '&::after':
                            idx < activity.length - 1
                              ? {
                                  content: '""',
                                  position: 'absolute',
                                  left: '4px',
                                  top: 12,
                                  width: 2,
                                  height: 28,
                                  bgcolor: '#e2e8f0',
                                }
                              : undefined,
                        }}
                      />
                      <Box pb={2}>
                        <Typography fontSize={13.5} fontWeight={600}>
                          {item.label}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary" variant="body2">
                  No activity recorded for today.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <DataTable
            title="Attendance"
            columns={attendanceColumns}
            data={attendance || []}
            totalRows={(attendance || []).length}
            page={1}
            perPage={Math.max(10, (attendance || []).length)}
            searchable={false}
            exportable
            tableKey="user-attendance"
            exportFilename="user-attendance"
            paginationServer={false}
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography fontWeight={700} mb={2}>
                Daily Records
              </Typography>
              <Box height={280}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <ChartTooltip
                      formatter={(value, _name, props) => [
                        props?.payload?.label || `${value} min`,
                        'Working Time',
                      ]}
                    />
                    <Bar dataKey="minutes" fill={colors.accent} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default function LoginHistoryPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [userId, setUserId] = useState(ALL_USERS);
  const [sortBy, setSortBy] = useState('working_hours');
  const [sortOrder, setSortOrder] = useState('desc');

  const { data: usersData } = useUsers({ page: 1, perPage: 200, sortBy: 'first_name', sortOrder: 'asc' });
  const users = usersData?.rows || [];

  const filterParams = useMemo(
    () => ({
      from: fromDate || undefined,
      to: toDate || undefined,
      user_id: userId === ALL_USERS ? undefined : userId,
    }),
    [fromDate, toDate, userId]
  );

  const listParams = useMemo(
    () => ({
      page,
      perPage,
      search,
      sortBy,
      sortOrder,
      group_by: 'user',
      ...filterParams,
    }),
    [page, perPage, search, sortBy, sortOrder, filterParams]
  );

  const isAllUsers = userId === ALL_USERS;

  const {
    data: listData,
    isLoading: listLoading,
    refetch: refetchList,
  } = useLoginHistory(listParams, { enabled: isAllUsers });

  const {
    data: summary,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useLoginHistorySummary(filterParams, { enabled: isAllUsers });

  const {
    data: userReport,
    isLoading: reportLoading,
    refetch: refetchReport,
  } = useLoginHistoryUserReport(
    { ...filterParams, user_id: userId },
    { enabled: !isAllUsers }
  );

  const rows = listData?.rows || [];
  const total = listData?.pagination?.total || rows.length;

  const handleSearch = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleRefresh = () => {
    if (isAllUsers) {
      refetchList();
      refetchSummary();
    } else {
      refetchReport();
    }
  };

  return (
    <Box>
      <PageHeader
        title="Login History"
        subtitle="Track user login sessions and working hours by date range"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Login History' },
        ]}
        extra={
          <IconButton onClick={handleRefresh} title="Refresh">
            <RefreshIcon />
          </IconButton>
        }
      />

      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'stretch', md: 'center' }}
            flexWrap="wrap"
            useFlexGap
          >
            <TextField
              size="small"
              type="date"
              label="From Date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 170 }}
            />
            <TextField
              size="small"
              type="date"
              label="To Date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
              }}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: fromDate || undefined }}
              sx={{ minWidth: 170 }}
            />
            <FormControl size="small" sx={{ minWidth: 240 }}>
              <InputLabel id="login-history-user-label">Users</InputLabel>
              <Select
                labelId="login-history-user-label"
                label="Users"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value={ALL_USERS}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PeopleAltOutlinedIcon fontSize="small" />
                    <span>All Users</span>
                  </Stack>
                </MenuItem>
                {users.map((user) => {
                  const name =
                    [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email;
                  return (
                    <MenuItem key={user.id} value={user.id}>
                      {name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <Chip
              icon={<AccessTimeIcon />}
              label={
                isAllUsers
                  ? `Total hours: ${summary?.total_working_hours || '0m'}`
                  : `Total hours: ${userReport?.total_working_hours || '0m'}`
              }
              sx={{ fontWeight: 600, height: 36 }}
            />
          </Stack>
        </CardContent>
      </Card>

      {isAllUsers ? (
        <AllUsersView
          rows={rows}
          total={total}
          page={page}
          perPage={perPage}
          setPage={setPage}
          setPerPage={setPerPage}
          search={search}
          handleSearch={handleSearch}
          onSort={(field, direction) => {
            setSortBy(field);
            setSortOrder(direction);
          }}
          loading={listLoading}
          summary={summary}
          summaryLoading={summaryLoading}
          onRefresh={handleRefresh}
          filterParams={filterParams}
        />
      ) : (
        <SingleUserView report={userReport} loading={reportLoading} />
      )}
    </Box>
  );
}
