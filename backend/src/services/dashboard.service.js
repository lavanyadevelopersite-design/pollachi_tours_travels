const { Op } = require('sequelize');
const logger = require('../config/logger');
const {
  Lead,
  Enquiry,
  Booking,
  Quotation,
  Invoice,
  Receipt,
  Payment,
  Expense,
  FollowUp,
  Feedback,
  Package,
  Branch,
  AuditLog,
  LeadStatus,
  User,
  LeadSourceType,
  Itinerary,
  EnquiryVehicleAssignment,
  Destination,
} = require('../models');
const dayjs = require('dayjs');
const {
  fetchVehicleAssignmentExpenses,
  assignmentExpenseTotal,
} = require('../utils/financeExpense');
const { getEnquiryPipelineStats } = require('../utils/enquiryPipelineStats');
const { resolveInvoiceTotalAmount } = require('../utils/invoiceAmount');

const getStats = async (query = {}) => {
  const branchFilter = query.branch_id ? { branch_id: query.branch_id } : {};
  const from = query.from ? dayjs(query.from).startOf('day').toDate() : dayjs().startOf('month').toDate();
  const to = query.to ? dayjs(query.to).endOf('day').toDate() : dayjs().endOf('day').toDate();
  const dateFilter = { created_at: { [Op.between]: [from, to] } };
  const todayStart = dayjs().startOf('day').toDate();
  const todayEnd = dayjs().endOf('day').toDate();
  const prevFrom = dayjs(from).subtract(1, 'month').toDate();
  const prevTo = dayjs(to).subtract(1, 'month').toDate();

  const fromDate = dayjs(from).format('YYYY-MM-DD');
  const toDate = dayjs(to).format('YYYY-MM-DD');
  const todayDate = dayjs().format('YYYY-MM-DD');
  const paymentStatusFilter = { status: { [Op.notIn]: ['cancelled', 'failed', 'rejected'] } };
  const paymentInclude = query.branch_id
    ? [
        {
          model: Enquiry,
          as: 'enquiry',
          attributes: ['id', 'branch_id'],
          where: { branch_id: query.branch_id },
          required: true,
        },
      ]
    : [];

  const emptyFinance = {
    totalLeads: 0,
    prevLeads: 0,
    totalEnquiries: 0,
    totalBookings: 0,
    prevBookings: 0,
    totalQuotations: 0,
    pendingFollowUps: 0,
    invoices: [],
    prevInvoices: [],
    receipts: [],
    todayReceipts: [],
    monthPayments: [],
    todayPayments: [],
    expenses: [],
    avgFeedback: [],
    uniqueCustomers: 0,
    assignmentExpenses: [],
  };

  const [pipeline, finance] = await Promise.all([
    getEnquiryPipelineStats({ branch_id: query.branch_id }).catch((error) => {
      logger.warn('Dashboard pipeline stats failed: %s', error.message);
      return { todayQueries: 0, totalQueries: 0, total: 0, statuses: [] };
    }),
    Promise.all([
      Lead.count({ where: { ...branchFilter, ...dateFilter } }),
      Lead.count({ where: { ...branchFilter, created_at: { [Op.between]: [prevFrom, prevTo] } } }),
      Enquiry.count({ where: { ...branchFilter, ...dateFilter } }),
      Booking.count({ where: { ...branchFilter, ...dateFilter } }),
      Booking.count({ where: { ...branchFilter, created_at: { [Op.between]: [prevFrom, prevTo] } } }),
      Quotation.count({ where: { ...branchFilter, ...dateFilter } }),
      FollowUp.count({ where: { status: 'pending' } }),
      Invoice.findAll({
        where: { ...branchFilter, ...dateFilter },
        attributes: ['total_amount', 'paid_amount', 'status'],
      }),
      Invoice.findAll({
        where: { ...branchFilter, created_at: { [Op.between]: [prevFrom, prevTo] } },
        attributes: ['total_amount', 'paid_amount'],
      }),
      Receipt.findAll({
        where: { ...branchFilter, payment_date: { [Op.between]: [fromDate, toDate] } },
        attributes: ['amount'],
      }),
      Receipt.findAll({
        where: { ...branchFilter, payment_date: todayDate },
        attributes: ['amount'],
      }),
      Payment.findAll({
        where: {
          ...paymentStatusFilter,
          [Op.or]: [
            { created_at: { [Op.between]: [from, to] } },
            { payment_date: { [Op.between]: [fromDate, toDate] } },
          ],
        },
        attributes: ['advance_amount', 'payment_date', 'created_at', 'status'],
        include: paymentInclude,
      }),
      Payment.findAll({
        where: {
          ...paymentStatusFilter,
          [Op.or]: [
            { created_at: { [Op.between]: [todayStart, todayEnd] } },
            { payment_date: todayDate },
          ],
        },
        attributes: ['advance_amount', 'payment_date', 'created_at', 'status'],
        include: paymentInclude,
      }),
      Expense.findAll({
        where: { ...branchFilter, expense_date: { [Op.between]: [from, to] } },
        attributes: ['amount'],
      }),
      Feedback.findAll({
        attributes: ['rating'],
        where: { rating: { [Op.ne]: null } },
      }),
      Enquiry.count({ distinct: true, col: 'phone', where: branchFilter }),
      fetchVehicleAssignmentExpenses({
        from: fromDate,
        to: toDate,
        branchId: query.branch_id,
      }),
    ])
      .then(
        ([
          totalLeads,
          prevLeads,
          totalEnquiries,
          totalBookings,
          prevBookings,
          totalQuotations,
          pendingFollowUps,
          invoices,
          prevInvoices,
          receipts,
          todayReceipts,
          monthPayments,
          todayPayments,
          expenses,
          avgFeedback,
          uniqueCustomers,
          assignmentExpenses,
        ]) => ({
          totalLeads,
          prevLeads,
          totalEnquiries,
          totalBookings,
          prevBookings,
          totalQuotations,
          pendingFollowUps,
          invoices,
          prevInvoices,
          receipts,
          todayReceipts,
          monthPayments,
          todayPayments,
          expenses,
          avgFeedback,
          uniqueCustomers,
          assignmentExpenses,
        })
      )
      .catch((error) => {
        logger.warn('Dashboard finance stats failed: %s', error.message);
        return emptyFinance;
      }),
  ]);

  const {
    totalLeads,
    prevLeads,
    totalEnquiries,
    totalBookings,
    prevBookings,
    totalQuotations,
    pendingFollowUps,
    invoices,
    prevInvoices,
    receipts,
    todayReceipts,
    monthPayments,
    todayPayments,
    expenses,
    avgFeedback,
    uniqueCustomers,
    assignmentExpenses,
  } = finance;
  const todayQueries = pipeline.todayQueries || 0;
  const totalQueries = pipeline.totalQueries || 0;
  const pipelineStatuses = pipeline.statuses || [];

  const invoiceTotal = invoices.reduce((s, i) => s + parseFloat(i.total_amount || 0), 0);
  const invoicePaid = invoices.reduce((s, i) => s + parseFloat(i.paid_amount || 0), 0);
  const prevInvoiceTotal = prevInvoices.reduce((s, i) => s + parseFloat(i.total_amount || 0), 0);
  const receiptTotal = receipts.reduce((s, r) => s + parseFloat(r.amount || 0), 0);
  const enquiryPaymentTotal = monthPayments.reduce((s, p) => s + parseFloat(p.advance_amount || 0), 0);
  const monthlyRevenue = enquiryPaymentTotal + receiptTotal;
  const todayCollection =
    todayReceipts.reduce((s, r) => s + parseFloat(r.amount || 0), 0) +
    todayPayments.reduce((s, p) => s + parseFloat(p.advance_amount || 0), 0);
  const expenseTotal =
    expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0) +
    assignmentExpenseTotal(assignmentExpenses);
  const feedbackAvg =
    avgFeedback.length > 0
      ? avgFeedback.reduce((s, f) => s + Number(f.rating || 0), 0) / avgFeedback.length
      : 0;

  const pct = (current, previous) => {
    if (!previous) return current ? 100 : 0;
    return Number((((current - previous) / previous) * 100).toFixed(1));
  };

  return {
    period: { from, to },
    revenue: monthlyRevenue,
    bookings: totalBookings,
    customers: uniqueCustomers,
    leads: totalLeads,
    pendingFollowUps,
    todayCollection,
    monthlyRevenue,
    revenueTrend: pct(monthlyRevenue, prevInvoiceTotal),
    bookingsTrend: pct(totalBookings, prevBookings),
    leadsTrend: pct(totalLeads, prevLeads),
    counts: {
      leads: totalLeads,
      enquiries: totalEnquiries,
      quotations: totalQuotations,
      bookings: totalBookings,
      pendingFollowUps,
    },
    finance: {
      invoiceTotal,
      invoicePaid,
      outstanding: invoiceTotal - invoicePaid,
      receipts: receiptTotal,
      enquiryPayments: enquiryPaymentTotal,
      expenses: expenseTotal,
      net: monthlyRevenue - expenseTotal,
    },
    feedbackAverage: Number(feedbackAvg.toFixed(2)),
    pipeline: {
      todayQueries,
      totalQueries,
      statuses: pipelineStatuses,
    },
  };
};

const getRevenueChart = async (query = {}) => {
  const months = Number(query.months) || 6;
  const series = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const start = dayjs().subtract(i, 'month').startOf('month');
    const end = dayjs().subtract(i, 'month').endOf('month');
    const invoices = await Invoice.findAll({
      where: { created_at: { [Op.between]: [start.toDate(), end.toDate()] } },
      attributes: ['total_amount', 'paid_amount'],
    });
    const revenue = invoices.reduce((s, inv) => s + parseFloat(inv.total_amount || 0), 0);
    const collected = invoices.reduce((s, inv) => s + parseFloat(inv.paid_amount || 0), 0);
    series.push({
      month: start.format('MMM YYYY'),
      revenue,
      collected,
    });
  }
  return series;
};

const getBookingStatus = async () => {
  const pipeline = await getEnquiryPipelineStats();
  const fromEnquiries = (pipeline.statuses || [])
    .filter((row) => Number(row.count || 0) > 0)
    .map((status) => ({
      name: status.name,
      status: status.name,
      value: Number(status.count || 0),
      count: Number(status.count || 0),
      color: status.color || null,
    }));

  if (fromEnquiries.length) return fromEnquiries;

  const bookingStatuses = ['confirmed', 'pending', 'cancelled', 'completed', 'on_hold'];
  const fromBookings = await Promise.all(
    bookingStatuses.map(async (status) => {
      const value = await Booking.count({ where: { status } });
      return {
        name: status.replace('_', ' '),
        status,
        value,
        count: value,
      };
    })
  );

  return fromBookings.filter((row) => row.value > 0);
};

const getLeadSources = async () => {
  const leads = await Lead.findAll({ attributes: ['source'] });
  const map = {};
  leads.forEach((lead) => {
    const key = lead.source || 'unknown';
    map[key] = (map[key] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
};

const getTopPackages = async () => {
  const { Destination } = require('../models');
  const packages = await Package.findAll({
    limit: 10,
    order: [['created_at', 'DESC']],
    attributes: ['id', 'name', 'image'],
    include: [
      {
        model: Destination,
        as: 'destination',
        attributes: ['name', 'image'],
        required: false,
      },
    ],
  });
  const result = await Promise.all(
    packages.map(async (pkg) => ({
      name: pkg.destination?.name || pkg.name,
      bookings: await Booking.count({ where: { package_id: pkg.id } }),
      image: pkg.image || pkg.destination?.image || null,
    }))
  );
  return result.sort((a, b) => b.bookings - a.bookings).slice(0, 5);
};

const getTopDestinations = async () => {
  try {
    const rows = await Enquiry.findAll({
      attributes: ['id', 'travel_to_destination', 'destination_id'],
      where: {
        [Op.or]: [
          { travel_to_destination: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: '' }] } },
          { destination_id: { [Op.ne]: null } },
        ],
      },
      include: [
        {
          model: Destination,
          as: 'destination',
          attributes: ['id', 'name', 'city', 'image'],
          required: false,
        },
      ],
    });

    const cityFromPlace = (value) => {
      const text = String(value || '').trim();
      if (!text) return '';
      return text.split(',')[0].trim();
    };

    const map = new Map();
    rows.forEach((row) => {
      const city =
        cityFromPlace(row.destination?.city) ||
        cityFromPlace(row.travel_to_destination) ||
        cityFromPlace(row.destination?.name);
      if (!city) return;
      const key = city.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name: city,
          queries: 0,
          image: row.destination?.image || null,
        });
      }
      const item = map.get(key);
      item.queries += 1;
      if (!item.image && row.destination?.image) item.image = row.destination.image;
    });

    return Array.from(map.values())
      .filter((item) => Number(item.queries) > 0)
      .sort((a, b) => b.queries - a.queries || a.name.localeCompare(b.name))
      .slice(0, 10);
  } catch (error) {
    logger.warn('Top destinations failed: %s', error.message);
    return [];
  }
};

const getUpcomingTours = async () => {
  try {
    const today = dayjs().format('YYYY-MM-DD');
    const until = dayjs().add(7, 'day').format('YYYY-MM-DD');
    const statuses = await LeadStatus.findAll({ attributes: ['id', 'lead_status'] });
    const excludeIds = statuses
      .filter((status) => {
        const name = String(status.lead_status || '').toLowerCase();
        return (
          name.includes('cancel') ||
          name.includes('trip closed') ||
          name.includes('trip completed') ||
          name.includes('feedback')
        );
      })
      .map((status) => status.id);

    const where = {
      travel_from: { [Op.lte]: until },
      [Op.or]: [
        { travel_to: { [Op.gte]: today } },
        { travel_to: null, travel_from: { [Op.gte]: today } },
      ],
    };
    if (excludeIds.length) {
      where[Op.and] = [
        {
          [Op.or]: [
            { lead_status_id: { [Op.notIn]: excludeIds } },
            { lead_status_id: null },
          ],
        },
      ];
    }

    const rows = await Enquiry.findAll({
      where,
      attributes: [
        'id',
        'enquiry_code',
        'customer_name',
        'travel_from',
        'travel_to',
        'travel_from_destination',
        'travel_to_destination',
        'adults',
        'children',
      ],
      include: [
        {
          model: LeadStatus,
          as: 'leadStatus',
          attributes: ['lead_status', 'button_color'],
          required: false,
        },
      ],
      order: [['travel_from', 'ASC']],
      limit: 8,
    });

    const cityName = (value) => {
      const text = String(value || '').trim();
      return text ? text.split(',')[0].trim() : '';
    };

    return rows.map((row) => ({
      id: row.id,
      enquiryId: row.id,
      code: row.enquiry_code || '',
      customer: row.customer_name || 'Guest',
      fromCity: cityName(row.travel_from_destination),
      toCity: cityName(row.travel_to_destination),
      travelFrom: row.travel_from,
      travelTo: row.travel_to,
      pax: Number(row.adults || 0) + Number(row.children || 0),
      status: row.leadStatus?.lead_status || '',
      statusColor: row.leadStatus?.button_color || '#4C1D95',
    }));
  } catch (error) {
    logger.warn('Upcoming tours failed: %s', error.message);
    return [];
  }
};

const getRecentActivities = async () => {
  const { User } = require('../models');
  const logs = await AuditLog.findAll({
    include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name'], required: false }],
    order: [['created_at', 'DESC']],
    limit: 10,
  });

  return logs.map((log) => ({
    id: log.id,
    title: `${log.action} ${log.module || ''}`.trim(),
    description: log.description || log.entity_id || '',
    createdAt: log.created_at,
    user: log.user
      ? [log.user.first_name, log.user.last_name].filter(Boolean).join(' ')
      : 'System',
  }));
};

const getBranchPerformance = async () => {
  const branches = await Branch.findAll({
    where: { is_active: true },
    attributes: ['id', 'name'],
  });

  const result = await Promise.all(
    branches.map(async (branch) => {
      const bookings = await Booking.count({ where: { branch_id: branch.id } });
      return { name: branch.name, value: bookings };
    })
  );

  const max = Math.max(...result.map((r) => r.value), 1);
  return result
    .map((r) => ({ ...r, value: Math.round((r.value / max) * 100) }))
    .sort((a, b) => b.value - a.value);
};

const isCompletedLeadStatus = (label) => {
  const name = String(label || '')
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return (
    name.includes('completed') ||
    name.includes('complete') ||
    name === 'feedback' ||
    name.startsWith('feedback')
  );
};

const getCompletedLeadStatusIds = async () => {
  const statuses = await LeadStatus.findAll({ attributes: ['id', 'lead_status'] });
  return new Set(
    statuses.filter((status) => isCompletedLeadStatus(status.lead_status)).map((status) => status.id)
  );
};

const isEnquiryCompleted = (row, completedIds) => {
  if (row.lead_status_id && completedIds.has(row.lead_status_id)) return true;
  return isCompletedLeadStatus(row.leadStatus?.lead_status);
};

const getSalesReps = async () => {
  try {
    const completedIds = await getCompletedLeadStatusIds();
    const rows = await Enquiry.findAll({
      attributes: ['id', 'assigned_to', 'lead_status_id'],
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'first_name', 'last_name'], required: false },
        { model: LeadStatus, as: 'leadStatus', attributes: ['id', 'lead_status'], required: false },
      ],
    });

    const map = new Map();
    rows.forEach((row) => {
      const user = row.assignee;
      if (!user) return;
      if (!map.has(user.id)) {
        map.set(user.id, {
          id: user.id,
          name: [user.first_name, user.last_name].filter(Boolean).join(' ') || '—',
          assigned: 0,
          confirmed: 0,
        });
      }
      const item = map.get(user.id);
      item.assigned += 1;
      if (isEnquiryCompleted(row, completedIds)) item.confirmed += 1;
    });

    return Array.from(map.values()).sort((a, b) => b.assigned - a.assigned);
  } catch (error) {
    logger.warn('Sales reps failed: %s', error.message);
    return [];
  }
};

const getTopLeadSources = async () => {
  try {
    const completedIds = await getCompletedLeadStatusIds();
    const rows = await Enquiry.findAll({
      attributes: ['id', 'lead_source_id', 'lead_status_id'],
      include: [
        {
          model: LeadSourceType,
          as: 'leadSource',
          attributes: ['id', 'lead_source_type'],
          required: false,
        },
        { model: LeadStatus, as: 'leadStatus', attributes: ['id', 'lead_status'], required: false },
      ],
    });

    const map = new Map();
    rows.forEach((row) => {
      const sourceName = row.leadSource?.lead_source_type || 'Unknown';
      const key = row.lead_source_id || 'unknown';
      if (!map.has(key)) {
        map.set(key, { id: key, name: sourceName, total: 0, confirmed: 0 });
      }
      const item = map.get(key);
      item.total += 1;
      if (isEnquiryCompleted(row, completedIds)) item.confirmed += 1;
    });

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  } catch (error) {
    logger.warn('Top lead sources failed: %s', error.message);
    return [];
  }
};

const getPendingFollowUps = async () => {
  const rows = await FollowUp.findAll({
    where: { status: { [Op.in]: ['pending', 'missed'] } },
    include: [
      {
        model: Enquiry,
        as: 'enquiry',
        attributes: ['id', 'enquiry_code', 'customer_name'],
        required: false,
      },
      {
        model: Lead,
        as: 'lead',
        attributes: ['id', 'lead_code', 'first_name', 'last_name'],
        required: false,
      },
      {
        model: User,
        as: 'assignee',
        attributes: ['id', 'first_name', 'last_name'],
        required: false,
      },
    ],
    order: [['follow_up_date', 'ASC']],
    limit: 10,
  });

  const today = dayjs().startOf('day');

  return rows.map((row) => {
    const due = dayjs(row.follow_up_date);
    const overdue = due.isValid() && due.isBefore(today);
    const isToday = due.isValid() && due.isSame(today, 'day');
    const name =
      row.enquiry?.customer_name ||
      [row.lead?.first_name, row.lead?.last_name].filter(Boolean).join(' ') ||
      'Follow-up';
    const code = row.enquiry?.enquiry_code || row.lead?.lead_code || '';
    const assignee = row.assignee
      ? [row.assignee.first_name, row.assignee.last_name].filter(Boolean).join(' ')
      : '';

    return {
      id: row.id,
      label: code ? `${code} · ${name}` : name,
      date: row.follow_up_date,
      type: row.type || '',
      assignee,
      status: overdue ? 'overdue' : isToday ? 'today' : 'upcoming',
    };
  });
};

const getTodayFollowUps = async () => {
  try {
    const from = dayjs().startOf('day').toDate();
    const to = dayjs().endOf('day').toDate();
    const rows = await FollowUp.findAll({
      where: { created_at: { [Op.between]: [from, to] } },
      include: [
        {
          model: Enquiry,
          as: 'enquiry',
          attributes: ['id', 'enquiry_code', 'customer_name'],
          required: false,
        },
        {
          model: Lead,
          as: 'lead',
          attributes: ['id', 'lead_code', 'first_name', 'last_name'],
          required: false,
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'first_name', 'last_name'],
          required: false,
        },
      ],
      order: [['created_at', 'DESC']],
      limit: 8,
    });

    return rows.map((row) => {
      const customer =
        row.enquiry?.customer_name ||
        [row.lead?.first_name, row.lead?.last_name].filter(Boolean).join(' ') ||
        'Follow-up';
      const code = row.enquiry?.enquiry_code || row.lead?.lead_code || '';
      const assignee = row.assignee
        ? [row.assignee.first_name, row.assignee.last_name].filter(Boolean).join(' ')
        : '';

      return {
        id: row.id,
        enquiryId: row.enquiry_id || null,
        customer,
        code,
        type: row.type || 'task',
        status: row.status || 'pending',
        notes: row.notes || '',
        assignee,
        createdAt: row.created_at || row.createdAt,
        followUpDate: row.follow_up_date,
      };
    });
  } catch (error) {
    logger.warn('Today follow-ups failed: %s', error.message);
    return [];
  }
};

const getProfitLossTrend = async (query = {}) => {
  const from = query.from
    ? dayjs(query.from).startOf('day')
    : dayjs().subtract(5, 'month').startOf('month');
  const to = query.to ? dayjs(query.to).endOf('day') : dayjs().endOf('day');
  const fromDate = from.format('YYYY-MM-DD');
  const toDate = to.format('YYYY-MM-DD');
  const paymentStatusFilter = { status: { [Op.notIn]: ['cancelled', 'failed', 'rejected'] } };

  const [payments, receipts, expenses, assignmentExpenses] = await Promise.all([
    Payment.findAll({
      where: {
        ...paymentStatusFilter,
        [Op.or]: [
          { created_at: { [Op.between]: [from.toDate(), to.toDate()] } },
          { payment_date: { [Op.between]: [fromDate, toDate] } },
        ],
      },
      attributes: ['advance_amount', 'payment_date', 'created_at', 'status'],
    }),
    Receipt.findAll({
      where: { payment_date: { [Op.between]: [fromDate, toDate] } },
      attributes: ['amount', 'payment_date'],
    }),
    Expense.findAll({
      where: { expense_date: { [Op.between]: [fromDate, toDate] } },
      attributes: ['amount', 'expense_date'],
    }),
    fetchVehicleAssignmentExpenses({ from: fromDate, to: toDate }),
  ]);

  const monthMap = {};
  const bump = (date, key, amount) => {
    const label = dayjs(date).format('MMM YYYY');
    if (!monthMap[label]) monthMap[label] = { month: label, income: 0, expense: 0, profit: 0 };
    monthMap[label][key] += Number.parseFloat(amount || 0) || 0;
    monthMap[label].profit = monthMap[label].income - monthMap[label].expense;
  };

  payments.forEach((p) => bump(p.payment_date || p.created_at, 'income', p.advance_amount));
  receipts.forEach((r) => bump(r.payment_date, 'income', r.amount));
  expenses.forEach((e) => bump(e.expense_date, 'expense', e.amount));
  assignmentExpenses.forEach((a) => bump(a.start_date, 'expense', a.amount));

  const monthly = [];
  let cursor = from.startOf('month');
  const endMonth = to.startOf('month');
  while (cursor.isBefore(endMonth) || cursor.isSame(endMonth, 'month')) {
    const label = cursor.format('MMM YYYY');
    const row = monthMap[label] || { month: label, income: 0, expense: 0, profit: 0 };
    monthly.push({
      month: label,
      income: Number(row.income.toFixed(2)),
      expense: Number(row.expense.toFixed(2)),
      profit: Number((row.income - row.expense).toFixed(2)),
    });
    cursor = cursor.add(1, 'month');
  }

  const income = monthly.reduce((s, row) => s + row.income, 0);
  const expense = monthly.reduce((s, row) => s + row.expense, 0);

  return {
    from: fromDate,
    to: toDate,
    monthly,
    summary: {
      income,
      expense,
      profit: income - expense,
    },
  };
};

const normalizeStatusName = (label) =>
  String(label || '')
    .toLowerCase()
    .replace(/[-_/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const isBookingConfirmedStatus = (label) => {
  const name = normalizeStatusName(label);
  return name.includes('booking confirmed') || name === 'confirmed';
};

const isTripClosedStatus = (label) => {
  const name = normalizeStatusName(label);
  return (
    name.includes('trip closed') ||
    name.includes('trip completed') ||
    name.includes('trip complete') ||
    name === 'closed' ||
    name === 'completed' ||
    name === 'feedback' ||
    name.startsWith('feedback')
  );
};

const isReceivedPayment = (payment) => {
  const status = String(payment?.status || '').toLowerCase();
  return !['cancelled', 'failed', 'rejected'].includes(status);
};

const pickPrimaryQuotation = (quotations = [], itineraries = []) => {
  const standalone = (quotations || []).find((q) => !q.itinerary_id);
  if (standalone) return standalone;

  const confirmed = (itineraries || []).filter(
    (item) => String(item.status || '').toLowerCase() === 'confirmed'
  );
  for (const item of confirmed) {
    const linked = (quotations || []).find((q) => q.itinerary_id === item.id);
    if (linked) return linked;
  }

  return quotations?.[0] || null;
};

const getPaymentCollection = async () => {
  try {
    const statuses = await LeadStatus.findAll({
      attributes: ['id', 'lead_status', 'button_color'],
    });
    const includeIds = statuses
      .filter(
        (status) =>
          isBookingConfirmedStatus(status.lead_status) && !isTripClosedStatus(status.lead_status)
      )
      .map((status) => status.id);

    if (!includeIds.length) {
      return { totalDue: 0, count: 0, rows: [] };
    }

    const rows = await Enquiry.findAll({
      where: { lead_status_id: { [Op.in]: includeIds } },
      attributes: [
        'id',
        'enquiry_code',
        'customer_name',
        'travel_from',
        'travel_to',
        'estimated_trip_cost',
        'lead_status_id',
      ],
      include: [
        {
          model: LeadStatus,
          as: 'leadStatus',
          attributes: ['id', 'lead_status', 'button_color'],
          required: false,
        },
        {
          model: Payment,
          as: 'payments',
          attributes: ['advance_amount', 'additional_charges', 'quotation_amount', 'status'],
          required: false,
        },
        {
          model: Quotation,
          as: 'quotations',
          attributes: ['id', 'total_amount', 'pricing', 'itinerary_id'],
          required: false,
          include: [
            {
              model: Itinerary,
              as: 'itinerary',
              attributes: ['id', 'pricing', 'status'],
              required: false,
            },
          ],
        },
        {
          model: Itinerary,
          as: 'itineraries',
          attributes: ['id', 'pricing', 'status'],
          required: false,
        },
        {
          model: EnquiryVehicleAssignment,
          as: 'vehicleAssignments',
          attributes: ['id', 'trip_status'],
          required: false,
        },
      ],
      order: [
        ['travel_from', 'ASC'],
        ['created_at', 'DESC'],
      ],
    });

    const collection = [];
    rows.forEach((row) => {
      const statusName = row.leadStatus?.lead_status || '';
      if (isTripClosedStatus(statusName)) return;

      const assignments = row.vehicleAssignments || [];
      const tripClosed = assignments.some(
        (assignment) => normalizeStatusName(assignment.trip_status) === 'trip closed'
      );
      if (tripClosed) return;

      const payments = (row.payments || []).filter(isReceivedPayment);
      const itineraries = row.itineraries || [];
      const quotation = pickPrimaryQuotation(row.quotations || [], itineraries);
      const totalAmount = resolveInvoiceTotalAmount({
        quotation,
        itinerary: quotation?.itinerary || itineraries.find((item) => item.id === quotation?.itinerary_id),
        enquiry: row,
        payments,
      });
      const paidAmount = payments.reduce(
        (sum, payment) => sum + (Number(payment.advance_amount) || 0),
        0
      );
      const dueAmount = Math.max(Math.round(totalAmount - paidAmount), 0);
      if (dueAmount <= 0) return;

      collection.push({
        id: row.id,
        tripId: row.enquiry_code || row.id,
        customerName: row.customer_name || '',
        payment: dueAmount,
        totalAmount: Math.round(totalAmount),
        paidAmount: Math.round(paidAmount),
        travelFrom: row.travel_from || null,
        travelTo: row.travel_to || null,
        status: statusName || 'Booking Confirmed',
        statusColor: row.leadStatus?.button_color || '#0d9488',
      });
    });

    const totalDue = collection.reduce((sum, item) => sum + Number(item.payment || 0), 0);
    return {
      totalDue,
      count: collection.length,
      rows: collection,
    };
  } catch (error) {
    logger.warn('Payment collection failed: %s', error.message);
    return { totalDue: 0, count: 0, rows: [] };
  }
};

module.exports = {
  getStats,
  getRevenueChart,
  getBookingStatus,
  getLeadSources,
  getTopPackages,
  getTopDestinations,
  getUpcomingTours,
  getPendingFollowUps,
  getTodayFollowUps,
  getRecentActivities,
  getBranchPerformance,
  getSalesReps,
  getTopLeadSources,
  getProfitLossTrend,
  getPaymentCollection,
};
