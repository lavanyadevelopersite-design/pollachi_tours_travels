const { Op } = require('sequelize');
const dayjs = require('dayjs');
const {
  LoginHistory,
  User,
  Branch,
  Department,
  RefreshToken,
} = require('../models');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

const STANDARD_DAY_MS = 8 * 60 * 60 * 1000;
const ONLINE_ACTIVITY_MINUTES = 15;

const parseDevice = (userAgent = '') => {
  const ua = String(userAgent || '').toLowerCase();
  if (!ua) return 'Unknown';
  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('mac os') || ua.includes('macintosh')) return 'Mac OS';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ios')) return 'iOS';
  if (ua.includes('linux')) return 'Linux';
  return 'Other';
};

const employeeCode = (userId = '') => {
  const compact = String(userId).replace(/-/g, '').slice(0, 6).toUpperCase();
  return compact ? `EMP${compact}` : '—';
};

const formatDuration = (ms) => {
  if (ms == null || ms < 0) return '0m';
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes}m`;
  if (minutes <= 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};

const formatHoursDecimal = (ms) => {
  if (!ms || ms < 0) return 0;
  return Math.round((ms / 3600000) * 100) / 100;
};

const sessionDurationMs = (session, endAt = new Date()) => {
  const start = dayjs(session.login_at);
  const end = session.logout_at ? dayjs(session.logout_at) : dayjs(endAt);
  return Math.max(0, end.diff(start));
};

const isOnlineSession = (session, now = dayjs()) => {
  if (session.logout_at) return false;
  const user = session.user;
  if (!user?.last_activity_at) return true;
  return now.diff(dayjs(user.last_activity_at), 'minute') <= ONLINE_ACTIVITY_MINUTES;
};

const startSession = async ({ userId, refreshTokenId = null, ipAddress = null, userAgent = null }) =>
  LoginHistory.create({
    user_id: userId,
    refresh_token_id: refreshTokenId,
    login_at: new Date(),
    ip_address: ipAddress,
    user_agent: userAgent,
    device: parseDevice(userAgent),
  });

const endSessionByRefreshToken = async (refreshToken, reason = 'logout') => {
  if (!refreshToken) return null;
  const stored = await RefreshToken.findOne({ where: { token: refreshToken } });
  if (!stored) return null;

  const [count] = await LoginHistory.update(
    { logout_at: new Date(), logout_reason: reason },
    { where: { refresh_token_id: stored.id, logout_at: null } }
  );

  if (count) return count;

  const openSession = await LoginHistory.findOne({
    where: { user_id: stored.user_id, logout_at: null },
    order: [['login_at', 'DESC']],
  });
  if (!openSession) return 0;
  await openSession.update({ logout_at: new Date(), logout_reason: reason });
  return 1;
};

const endOpenSessionsForUser = async (userId, reason = 'timeout') => {
  if (!userId) return 0;
  const [count] = await LoginHistory.update(
    { logout_at: new Date(), logout_reason: reason },
    { where: { user_id: userId, logout_at: null } }
  );
  return count;
};

const linkRefreshToken = async (oldRefreshTokenId, newRefreshTokenId) => {
  if (!oldRefreshTokenId || !newRefreshTokenId) return;
  await LoginHistory.update(
    { refresh_token_id: newRefreshTokenId },
    { where: { refresh_token_id: oldRefreshTokenId, logout_at: null } }
  );
};

const buildDateWhere = (query = {}) => {
  const from = query.from || query.date_from || query.start_date;
  const to = query.to || query.date_to || query.end_date;
  if (!from && !to) return {};
  const range = {};
  if (from) range[Op.gte] = dayjs(from).startOf('day').toDate();
  if (to) range[Op.lte] = dayjs(to).endOf('day').toDate();
  return { login_at: range };
};

const userInclude = [
  {
    model: User,
    as: 'user',
    attributes: [
      'id',
      'first_name',
      'last_name',
      'email',
      'avatar',
      'last_activity_at',
      'is_active',
    ],
    include: [
      { model: Branch, as: 'branch', attributes: ['id', 'name', 'code', 'city'] },
      { model: Department, as: 'department', attributes: ['id', 'department_name', 'department_code'] },
    ],
  },
];

const mapSessionRow = (session, index = 0, page = 1, limit = 10) => {
  const user = session.user || {};
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || '—';
  const durationMs = sessionDurationMs(session);
  const online = isOnlineSession(session);

  return {
    id: session.id,
    sno: (page - 1) * limit + index + 1,
    user_id: session.user_id,
    employee_name: name,
    employee_id: employeeCode(session.user_id),
    avatar: user.avatar || null,
    email: user.email || null,
    branch: user.branch?.name || user.branch?.city || '—',
    department: user.department?.department_name || '—',
    login_at: session.login_at,
    logout_at: session.logout_at,
    working_hours_ms: durationMs,
    working_hours: formatDuration(durationMs),
    working_hours_decimal: formatHoursDecimal(durationMs),
    break_time_ms: 0,
    break_time: '0m',
    status: online ? 'Online' : 'Offline',
    ip_address: session.ip_address || '—',
    device: session.device || parseDevice(session.user_agent),
    logout_reason: session.logout_reason || null,
  };
};

const buildListWhere = (query = {}) => {
  const where = {
    ...buildDateWhere(query),
  };

  const userId = query.user_id || query.userId;
  if (userId && userId !== 'all') {
    where.user_id = userId;
  }

  const search = String(query.search || '').trim();
  if (search) {
    where[Op.or] = [
      { ip_address: { [Op.like]: `%${search}%` } },
      { device: { [Op.like]: `%${search}%` } },
      { user_agent: { [Op.like]: `%${search}%` } },
      { '$user.first_name$': { [Op.like]: `%${search}%` } },
      { '$user.last_name$': { [Op.like]: `%${search}%` } },
      { '$user.email$': { [Op.like]: `%${search}%` } },
    ];
  }

  return where;
};

const formatDateRangeLabel = (query = {}) => {
  const from = query.from || query.date_from || query.start_date;
  const to = query.to || query.date_to || query.end_date;
  if (from && to) {
    if (dayjs(from).isSame(dayjs(to), 'day')) {
      return dayjs(from).format('DD MMM YYYY');
    }
    return `${dayjs(from).format('DD MMM YYYY')} - ${dayjs(to).format('DD MMM YYYY')}`;
  }
  if (from) return `From ${dayjs(from).format('DD MMM YYYY')}`;
  if (to) return `Until ${dayjs(to).format('DD MMM YYYY')}`;
  return 'All dates';
};

const listByUser = async (query = {}) => {
  const { page, limit, offset, sortBy, sortOrder } = getPagination(query);
  const where = buildListWhere(query);
  const dateLabel = formatDateRangeLabel(query);

  const sessions = await LoginHistory.findAll({
    where,
    include: userInclude,
    order: [['login_at', 'ASC']],
    subQuery: false,
  });

  const byUser = new Map();
  sessions.forEach((session) => {
    const key = session.user_id;
    if (!byUser.has(key)) {
      const user = session.user || {};
      const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || '—';
      byUser.set(key, {
        user_id: key,
        username: name,
        employee_name: name,
        employee_id: employeeCode(key),
        avatar: user.avatar || null,
        email: user.email || null,
        branch: user.branch?.name || user.branch?.city || '—',
        department: user.department?.department_name || '—',
        date: dateLabel,
        from_date: query.from || query.date_from || null,
        to_date: query.to || query.date_to || null,
        working_hours_ms: 0,
        sessions_count: 0,
        is_online: false,
      });
    }
    const row = byUser.get(key);
    row.working_hours_ms += sessionDurationMs(session);
    row.sessions_count += 1;
    if (isOnlineSession(session)) row.is_online = true;
  });

  let aggregated = Array.from(byUser.values()).map((row) => ({
    ...row,
    working_hours: formatDuration(row.working_hours_ms),
    working_hours_decimal: formatHoursDecimal(row.working_hours_ms),
    status: row.is_online ? 'Online' : 'Offline',
  }));

  const search = String(query.search || '').trim().toLowerCase();
  if (search) {
    aggregated = aggregated.filter(
      (row) =>
        row.username.toLowerCase().includes(search) ||
        (row.email || '').toLowerCase().includes(search)
    );
  }

  const sortField = sortBy === 'username' || sortBy === 'employee_name' ? 'username' : sortBy;
  aggregated.sort((a, b) => {
    let av = a[sortField];
    let bv = b[sortField];
    if (sortField === 'working_hours' || sortField === 'total_working_hours') {
      av = a.working_hours_ms;
      bv = b.working_hours_ms;
    }
    if (typeof av === 'string') {
      const cmp = av.localeCompare(bv || '');
      return sortOrder === 'ASC' ? cmp : -cmp;
    }
    const cmp = (av || 0) - (bv || 0);
    return sortOrder === 'ASC' ? cmp : -cmp;
  });

  const count = aggregated.length;
  const pageRows = aggregated.slice(offset, offset + limit).map((row, index) => ({
    ...row,
    sno: (page - 1) * limit + index + 1,
    total_working_hours: row.working_hours,
  }));

  return { data: pageRows, pagination: buildPaginationMeta(count, page, limit) };
};

const list = async (query = {}) => {
  if (query.group_by === 'user' || query.groupBy === 'user') {
    return listByUser(query);
  }

  const { page, limit, offset, sortBy, sortOrder } = getPagination(query);
  const where = buildListWhere(query);
  const orderField = ['login_at', 'logout_at', 'created_at'].includes(sortBy) ? sortBy : 'login_at';

  const { rows, count } = await LoginHistory.findAndCountAll({
    where,
    include: userInclude,
    limit,
    offset,
    order: [[orderField, sortOrder]],
    distinct: true,
    subQuery: false,
  });

  const data = rows.map((row, index) => mapSessionRow(row, index, page, limit));
  return { data, pagination: buildPaginationMeta(count, page, limit) };
};

const getSummary = async (query = {}) => {
  const where = buildDateWhere(query);
  const userId = query.user_id || query.userId;
  if (userId && userId !== 'all') where.user_id = userId;

  const sessions = await LoginHistory.findAll({
    where,
    include: userInclude,
    order: [['login_at', 'ASC']],
  });

  const now = dayjs();
  const todayStart = now.startOf('day');
  const todayEnd = now.endOf('day');

  const userIds = new Set(sessions.map((s) => s.user_id));
  const totalUsers = userId && userId !== 'all' ? (userIds.size || 1) : await User.count({ where: { is_active: true } });

  const loggedInToday = new Set(
    sessions
      .filter((s) => {
        const loginAt = dayjs(s.login_at);
        const loggedInOnDay =
          (loginAt.isAfter(todayStart) || loginAt.isSame(todayStart)) &&
          (loginAt.isBefore(todayEnd) || loginAt.isSame(todayEnd));
        const stillOpenFromEarlier = !s.logout_at && loginAt.isBefore(todayEnd);
        return loggedInOnDay || stillOpenFromEarlier;
      })
      .map((s) => s.user_id)
  ).size;

  const currentlyOnline = new Set(sessions.filter((s) => isOnlineSession(s, now)).map((s) => s.user_id)).size;

  let totalWorkingMs = 0;
  sessions.forEach((s) => {
    totalWorkingMs += sessionDurationMs(s, now.toDate());
  });

  const avgWorkingMs = sessions.length ? Math.floor(totalWorkingMs / sessions.length) : 0;

  return {
    total_users: totalUsers,
    logged_in_today: loggedInToday,
    currently_online: currentlyOnline,
    average_working_hours: formatDuration(avgWorkingMs),
    average_working_hours_ms: avgWorkingMs,
    total_working_hours: formatDuration(totalWorkingMs),
    total_working_hours_ms: totalWorkingMs,
    total_sessions: sessions.length,
  };
};

const aggregateDailyRecords = (sessions, from, to) => {
  const start = dayjs(from || sessions[0]?.login_at || undefined).startOf('day');
  const end = dayjs(to || undefined).endOf('day');
  const byDate = {};

  sessions.forEach((session) => {
    const dateKey = dayjs(session.login_at).format('YYYY-MM-DD');
    if (!byDate[dateKey]) byDate[dateKey] = [];
    byDate[dateKey].push(session);
  });

  const days = [];
  let cursor = start;
  const maxDays = 62;
  let guard = 0;
  while ((cursor.isBefore(end) || cursor.isSame(end, 'day')) && guard < maxDays) {
    const key = cursor.format('YYYY-MM-DD');
    const daySessions = (byDate[key] || []).sort(
      (a, b) => dayjs(a.login_at).valueOf() - dayjs(b.login_at).valueOf()
    );

    let productionMs = 0;
    let breakMs = 0;
    daySessions.forEach((session, idx) => {
      productionMs += sessionDurationMs(session);
      if (idx > 0) {
        const prevEnd = daySessions[idx - 1].logout_at;
        if (prevEnd) {
          breakMs += Math.max(0, dayjs(session.login_at).diff(dayjs(prevEnd)));
        }
      }
    });

    const firstIn = daySessions[0]?.login_at || null;
    const openSession = daySessions.find((s) => !s.logout_at);
    const lastOut = openSession
      ? null
      : daySessions.length
        ? daySessions[daySessions.length - 1].logout_at
        : null;
    const overtimeMs = Math.max(0, productionMs - STANDARD_DAY_MS);

    days.push({
      date: key,
      punch_in: firstIn,
      punch_out: lastOut,
      production_ms: productionMs,
      production: formatDuration(productionMs),
      production_hours: formatHoursDecimal(productionMs),
      break_ms: breakMs,
      break_time: formatDuration(breakMs),
      overtime_ms: overtimeMs,
      overtime: formatDuration(overtimeMs),
      sessions: daySessions.length,
    });

    cursor = cursor.add(1, 'day');
    guard += 1;
  }

  return days.filter((d) => d.sessions > 0 || dayjs(d.date).isSame(dayjs(), 'day'));
};

const getUserReport = async (query = {}) => {
  const userId = query.user_id || query.userId;
  if (!userId || userId === 'all') {
    return null;
  }

  const from = query.from || query.date_from || dayjs().startOf('month').format('YYYY-MM-DD');
  const to = query.to || query.date_to || dayjs().format('YYYY-MM-DD');

  const user = await User.findByPk(userId, {
    attributes: ['id', 'first_name', 'last_name', 'email', 'avatar', 'last_activity_at'],
    include: [
      { model: Branch, as: 'branch', attributes: ['id', 'name', 'city'] },
      { model: Department, as: 'department', attributes: ['id', 'department_name', 'department_code'] },
    ],
  });
  if (!user) return null;

  const sessions = await LoginHistory.findAll({
    where: {
      user_id: userId,
      login_at: {
        [Op.gte]: dayjs(from).startOf('day').toDate(),
        [Op.lte]: dayjs(to).endOf('day').toDate(),
      },
    },
    order: [['login_at', 'ASC']],
  });

  const now = dayjs();
  const todayKey = now.format('YYYY-MM-DD');
  const todaySessions = sessions.filter((s) => dayjs(s.login_at).format('YYYY-MM-DD') === todayKey);
  const openToday = [...todaySessions].reverse().find((s) => !s.logout_at) || null;

  let todayProductionMs = 0;
  let todayBreakMs = 0;
  todaySessions.forEach((session, idx) => {
    todayProductionMs += sessionDurationMs(session);
    if (idx > 0 && todaySessions[idx - 1].logout_at) {
      todayBreakMs += Math.max(
        0,
        dayjs(session.login_at).diff(dayjs(todaySessions[idx - 1].logout_at))
      );
    }
  });
  const todayOvertimeMs = Math.max(0, todayProductionMs - STANDARD_DAY_MS);

  const weekStart = now.startOf('week');
  const monthStart = now.startOf('month');
  const weekMs = sessions
    .filter((s) => !dayjs(s.login_at).isBefore(weekStart))
    .reduce((sum, s) => sum + sessionDurationMs(s), 0);
  const monthMs = sessions
    .filter((s) => !dayjs(s.login_at).isBefore(monthStart))
    .reduce((sum, s) => sum + sessionDurationMs(s), 0);

  const weekTarget = 40 * 3600000;
  const monthTarget = 160 * 3600000;
  const remainingMs = Math.max(0, monthTarget - monthMs);

  const dailyRecords = aggregateDailyRecords(sessions, from, to);
  const activity = todaySessions.map((s) => ({
    id: s.id,
    type: 'punch_in',
    label: `Punch In at ${dayjs(s.login_at).format('hh:mm A')}`,
    at: s.login_at,
  }));
  todaySessions.forEach((s) => {
    if (s.logout_at) {
      activity.push({
        id: `${s.id}-out`,
        type: 'punch_out',
        label: `Punch Out at ${dayjs(s.logout_at).format('hh:mm A')}`,
        at: s.logout_at,
      });
    }
  });
  activity.sort((a, b) => dayjs(a.at).valueOf() - dayjs(b.at).valueOf());

  const chart = dailyRecords.map((d) => ({
    date: d.date,
    day: dayjs(d.date).format('DD'),
    minutes: Math.round(d.production_ms / 60000),
    hours: d.production_hours,
    label: d.production,
  }));

  return {
    user: {
      id: user.id,
      name: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email,
      email: user.email,
      avatar: user.avatar,
      employee_id: employeeCode(user.id),
      branch: user.branch?.name || '—',
      department: user.department?.department_name || '—',
    },
    time: {
      date: now.format('DD MMM YYYY'),
      punch_in_at: openToday?.login_at || todaySessions[0]?.login_at || null,
      current_hours: formatHoursDecimal(todayProductionMs),
      current_hours_label: `${formatHoursDecimal(todayProductionMs)} hrs`,
      is_punched_in: Boolean(openToday),
      break_hours: formatHoursDecimal(todayBreakMs),
      break_label: `${formatHoursDecimal(todayBreakMs)} hrs`,
      overtime_hours: formatHoursDecimal(todayOvertimeMs),
      overtime_label: `${formatHoursDecimal(todayOvertimeMs)} hrs`,
      progress: Math.min(100, Math.round((todayProductionMs / STANDARD_DAY_MS) * 100)),
    },
    statistics: {
      today: { value: formatHoursDecimal(todayProductionMs), target: 8, label: `${formatHoursDecimal(todayProductionMs)} / 8 hrs`, percent: Math.min(100, Math.round((todayProductionMs / STANDARD_DAY_MS) * 100)) },
      week: { value: formatHoursDecimal(weekMs), target: 40, label: `${formatHoursDecimal(weekMs)} / 40 hrs`, percent: Math.min(100, Math.round((weekMs / weekTarget) * 100)) },
      month: { value: formatHoursDecimal(monthMs), target: 160, label: `${formatHoursDecimal(monthMs)} / 160 hrs`, percent: Math.min(100, Math.round((monthMs / monthTarget) * 100)) },
      remaining: { value: formatHoursDecimal(remainingMs), target: 160, label: `${formatHoursDecimal(remainingMs)} / 160 hrs`, percent: Math.min(100, Math.round((remainingMs / monthTarget) * 100)) },
      overtime: { value: formatHoursDecimal(Math.max(0, monthMs - monthTarget)), target: 0, label: `${formatHoursDecimal(Math.max(0, monthMs - monthTarget))} hrs`, percent: Math.min(100, Math.round((Math.max(0, monthMs - monthTarget) / (20 * 3600000)) * 100)) },
    },
    activity,
    attendance: dailyRecords
      .slice()
      .reverse()
      .map((d, index) => ({
        sno: index + 1,
        date: d.date,
        punch_in: d.punch_in,
        punch_out: d.punch_out,
        production: d.production,
        production_hours: d.production_hours,
        break_time: d.break_time,
        overtime: d.overtime,
      })),
    daily_records: chart,
    total_working_hours: formatDuration(
      sessions.reduce((sum, s) => sum + sessionDurationMs(s), 0)
    ),
    total_working_hours_ms: sessions.reduce((sum, s) => sum + sessionDurationMs(s), 0),
  };
};

module.exports = {
  startSession,
  endSessionByRefreshToken,
  endOpenSessionsForUser,
  linkRefreshToken,
  list,
  listByUser,
  getSummary,
  getUserReport,
  parseDevice,
  formatDuration,
};
