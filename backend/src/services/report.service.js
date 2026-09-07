const { Op } = require('sequelize');
const dayjs = require('dayjs');
const {
  Lead,
  Booking,
  Invoice,
  Receipt,
  Expense,
  Enquiry,
  Quotation,
  Payment,
  LeadStatus,
  Vehicle,
  Driver,
  EnquiryVehicleAssignment,
  FollowUp,
  User,
  Branch,
  Itinerary,
  Destination,
  Package,
} = require('../models');
const { coercePricing, resolvePackageAmount } = require('../utils/invoiceAmount');
const quotationService = require('./quotation.service');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const loginHistoryService = require('./loginHistory.service');
const followUpService = require('./followUp.service');
const {
  fetchVehicleAssignmentExpenses,
  assignmentExpenseTotal,
} = require('../utils/financeExpense');

const parseRange = (query = {}, fallback = 'month') => {
  const fromRaw = query.from || query.date_from || query.start_date;
  const toRaw = query.to || query.date_to || query.end_date;
  const start = fromRaw ? dayjs(fromRaw).startOf('day') : dayjs().startOf(fallback);
  const end = toRaw ? dayjs(toRaw).endOf('day') : dayjs().endOf('day');
  return {
    from: start.format('YYYY-MM-DD'),
    to: end.format('YYYY-MM-DD'),
    start,
    end,
    dateWhere: (field) => ({ [field]: { [Op.between]: [start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')] } }),
    datetimeWhere: (field) => ({ [field]: { [Op.between]: [start.toDate(), end.toDate()] } }),
  };
};

const money = (value) => Number.parseFloat(value || 0) || 0;
const round2 = (n) => Math.round((money(n) + Number.EPSILON) * 100) / 100;

const normalizeStatusName = (label) =>
  String(label || '')
    .toLowerCase()
    .replace(/[-_/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const isCancelledStatus = (label) => normalizeStatusName(label).includes('cancel');

const isMisBookingStatus = (label) => {
  const name = normalizeStatusName(label);
  if (!name || isCancelledStatus(name)) return false;
  return (
    name.includes('booking confirmed') ||
    name.includes('trip ongoing') ||
    name.includes('fully paid') ||
    name.includes('trip completed') ||
    name.includes('trip complete') ||
    name === 'feedback' ||
    name.startsWith('feedback')
  );
};

const mainCity = (place) => {
  const text = String(place || '').trim();
  if (!text || text === '—' || text === '-') return '';
  return text.split(',')[0].trim();
};

const MIS_EVENT_TYPES = [
  { key: 'accommodation', aliases: ['hotel', 'resort', 'stay'] },
  { key: 'activity', aliases: ['tour', 'sightseeing', 'excursion'] },
  { key: 'transportation', aliases: ['transfer', 'vehicle', 'cab', 'taxi', 'transport'] },
  { key: 'visa', aliases: [] },
  { key: 'meal', aliases: ['breakfast', 'lunch', 'dinner', 'food'] },
  { key: 'flight', aliases: ['airfare', 'airline'] },
  { key: 'leisure', aliases: ['spa'] },
  { key: 'cruise', aliases: ['ship'] },
];

const eventCostField = (key) => `${key}_cost`;

const emptyEventCosts = () =>
  MIS_EVENT_TYPES.reduce((acc, type) => {
    acc[eventCostField(type.key)] = 0;
    return acc;
  }, {});

const classifyLineCost = (item = {}) => {
  const eventType = String(item.event_type || '').toLowerCase().trim();
  const exact = MIS_EVENT_TYPES.find((type) => type.key === eventType);
  if (exact) return eventCostField(exact.key);

  const raw = `${item.event_type || ''} ${item.type || ''} ${item.item || ''}`.toLowerCase();
  const matched = MIS_EVENT_TYPES.find(
    (type) => raw.includes(type.key) || type.aliases.some((alias) => raw.includes(alias))
  );
  return eventCostField(matched?.key || 'activity');
};

const breakdownPricingCosts = (pricing) => {
  const normalized = coercePricing(pricing);
  const totals = quotationService.summarizeTotals(normalized);
  const buckets = emptyEventCosts();
  (normalized.line_items || []).forEach((item) => {
    buckets[classifyLineCost(item)] += money(item.net);
  });
  Object.keys(buckets).forEach((key) => {
    buckets[key] = round2(buckets[key]);
  });
  return {
    ...buckets,
    total_cost: round2(Object.values(buckets).reduce((sum, value) => sum + value, 0)),
    gst: money(totals.tax_amount),
    selling_with_gst: money(totals.total_amount),
  };
};

const pickPrimaryQuotation = (quotations = [], itineraries = []) => {
  const confirmed = (itineraries || []).filter(
    (item) => String(item.status || '').toLowerCase() === 'confirmed'
  );
  for (const item of confirmed) {
    const linked = (quotations || []).find((q) => q.itinerary_id === item.id);
    if (linked) return linked;
  }
  const standalone = (quotations || []).find((q) => !q.itinerary_id);
  if (standalone) return standalone;
  return quotations?.[0] || null;
};

const pickPrimaryItinerary = (itineraries = [], quotation = null) => {
  if (quotation?.itinerary) return quotation.itinerary;
  if (quotation?.itinerary_id) {
    const linked = (itineraries || []).find((item) => item.id === quotation.itinerary_id);
    if (linked) return linked;
  }
  const confirmed = (itineraries || []).find(
    (item) => String(item.status || '').toLowerCase() === 'confirmed'
  );
  return confirmed || itineraries?.[0] || null;
};

const resolveBookingDate = (enquiry, booking = null, itinerary = null) => {
  if (itinerary?.confirmed_at) return itinerary.confirmed_at;
  if (booking?.created_at) return booking.created_at;
  const payments = [...(enquiry.payments || [])]
    .filter((p) => p.payment_date)
    .sort((a, b) => dayjs(a.payment_date).valueOf() - dayjs(b.payment_date).valueOf());
  if (payments[0]?.payment_date) return payments[0].payment_date;
  return enquiry.updated_at || enquiry.created_at;
};

const userName = (user) => {
  if (!user) return '—';
  return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || '—';
};

const paginateRows = (rows, query = {}) => {
  const { page, limit, offset } = getPagination(query);
  const total = rows.length;
  return {
    data: rows.slice(offset, offset + limit),
    pagination: buildPaginationMeta(total, page, limit),
  };
};

const salesSummary = async (query = {}) => {
  const range = parseRange(query);
  const bookings = await Booking.findAll({
    where: {
      created_at: { [Op.between]: [range.start.toDate(), range.end.toDate()] },
      ...(query.branch_id && { branch_id: query.branch_id }),
    },
    attributes: ['status', 'total_amount', 'paid_amount', 'travel_from', 'travel_to'],
  });

  const byStatus = {};
  let totalSales = 0;
  let totalPaid = 0;
  bookings.forEach((b) => {
    byStatus[b.status] = (byStatus[b.status] || 0) + 1;
    totalSales += money(b.total_amount);
    totalPaid += money(b.paid_amount);
  });

  return {
    from: range.from,
    to: range.to,
    bookingCount: bookings.length,
    byStatus,
    totalSales,
    totalPaid,
    outstanding: totalSales - totalPaid,
  };
};

const leadConversion = async (query = {}) => {
  const range = parseRange(query);
  const dateWhere = { created_at: { [Op.between]: [range.start.toDate(), range.end.toDate()] } };

  const [leads, converted, enquiries, quotations, bookings] = await Promise.all([
    Lead.count({ where: dateWhere }),
    Lead.count({ where: { ...dateWhere, status: 'converted' } }),
    Enquiry.count({ where: dateWhere }),
    Quotation.count({ where: dateWhere }),
    Booking.count({ where: dateWhere }),
  ]);

  return {
    from: range.from,
    to: range.to,
    leads,
    converted,
    conversionRate: leads ? Number(((converted / leads) * 100).toFixed(2)) : 0,
    funnel: { leads, enquiries, quotations, bookings },
  };
};

const financialSummary = async (query = {}) => {
  const range = parseRange(query);
  const branchFilter = query.branch_id ? { branch_id: query.branch_id } : {};

  const [invoices, receipts, expenses] = await Promise.all([
    Invoice.findAll({
      where: { invoice_date: { [Op.between]: [range.from, range.to] }, ...branchFilter },
      attributes: ['total_amount', 'paid_amount', 'status'],
    }),
    Receipt.findAll({
      where: { payment_date: { [Op.between]: [range.from, range.to] }, ...branchFilter },
      attributes: ['amount'],
    }),
    Expense.findAll({
      where: { expense_date: { [Op.between]: [range.from, range.to] }, ...branchFilter },
      attributes: ['amount', 'category'],
    }),
  ]);

  const expenseByCategory = {};
  expenses.forEach((e) => {
    expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + money(e.amount);
  });

  return {
    from: range.from,
    to: range.to,
    invoiced: invoices.reduce((s, i) => s + money(i.total_amount), 0),
    collected: receipts.reduce((s, r) => s + money(r.amount), 0),
    expenses: expenses.reduce((s, e) => s + money(e.amount), 0),
    expenseByCategory,
  };
};

const profitAndLoss = async (query = {}) => {
  const range = parseRange(query);
  const branchFilter = query.branch_id ? { branch_id: query.branch_id } : {};

  const [payments, receipts, expenses, assignmentExpenses] = await Promise.all([
    Payment.findAll({
      where: { payment_date: { [Op.between]: [range.from, range.to] } },
      attributes: ['id', 'advance_amount', 'payment_mode', 'payment_date', 'payment_type', 'status'],
      include: [{ model: Enquiry, as: 'enquiry', attributes: ['enquiry_code', 'customer_name', 'branch_id'] }],
    }),
    Receipt.findAll({
      where: { payment_date: { [Op.between]: [range.from, range.to] }, ...branchFilter },
      attributes: ['id', 'amount', 'payment_mode', 'payment_date', 'customer_name', 'receipt_number'],
    }),
    Expense.findAll({
      where: { expense_date: { [Op.between]: [range.from, range.to] }, ...branchFilter },
      attributes: ['id', 'amount', 'category', 'title', 'expense_date', 'expense_code', 'status'],
    }),
    fetchVehicleAssignmentExpenses({
      from: range.from,
      to: range.to,
      branchId: query.branch_id,
    }),
  ]);

  const enquiryIncome = payments
    .filter((p) => String(p.status || 'received').toLowerCase() !== 'cancelled')
    .reduce((s, p) => s + money(p.advance_amount), 0);
  const invoiceIncome = receipts.reduce((s, r) => s + money(r.amount), 0);
  const expenseTotal =
    expenses.reduce((s, e) => s + money(e.amount), 0) +
    assignmentExpenseTotal(assignmentExpenses);
  const incomeTotal = enquiryIncome + invoiceIncome;
  const profit = incomeTotal - expenseTotal;

  const validPayments = payments.filter(
    (p) => String(p.status || 'received').toLowerCase() !== 'cancelled'
  );

  const dayMap = {};
  const bumpDay = (date, key, amount) => {
    const label = dayjs(date).format('YYYY-MM-DD');
    if (!dayMap[label]) dayMap[label] = { date: label, income: 0, expense: 0, profit: 0 };
    dayMap[label][key] += amount;
    dayMap[label].profit = dayMap[label].income - dayMap[label].expense;
  };

  validPayments.forEach((p) => bumpDay(p.payment_date, 'income', money(p.advance_amount)));
  receipts.forEach((r) => bumpDay(r.payment_date, 'income', money(r.amount)));
  expenses.forEach((e) => bumpDay(e.expense_date, 'expense', money(e.amount)));
  assignmentExpenses.forEach((a) => bumpDay(a.start_date, 'expense', money(a.amount)));

  const daily = Object.values(dayMap)
    .filter((row) => row.income !== 0 || row.expense !== 0)
    .map((row) => ({
      date: row.date,
      income: Number(row.income.toFixed(2)),
      expense: Number(row.expense.toFixed(2)),
      profit: Number((row.income - row.expense).toFixed(2)),
    }))
    .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

  const income = [
    ...validPayments.map((p) => ({
      id: p.id,
      date: p.payment_date,
      type: p.payment_type === 'remaining' ? 'Remaining payment' : 'Enquiry payment',
      reference: p.enquiry?.enquiry_code || '—',
      customer: p.enquiry?.customer_name || '—',
      payment_mode: p.payment_mode || '—',
      amount: money(p.advance_amount),
    })),
    ...receipts.map((r) => ({
      id: r.id,
      date: r.payment_date,
      type: 'Receipt',
      reference: r.receipt_number || '—',
      customer: r.customer_name || '—',
      payment_mode: r.payment_mode || '—',
      amount: money(r.amount),
    })),
  ].sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

  const expenseRows = [
    ...expenses.map((e) => ({
      id: e.id,
      date: e.expense_date,
      code: e.expense_code || '—',
      title: e.title || '—',
      category: e.category || 'Uncategorised',
      amount: money(e.amount),
      status: e.status || '—',
    })),
    ...assignmentExpenses.map((a) => ({
      id: a.id,
      date: a.start_date,
      code: a.enquiry?.enquiry_code || '—',
      title: 'Vehicle & driver assignment',
      category: 'Trip assignment',
      amount: money(a.amount),
      status: a.status || '—',
    })),
  ].sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

  return {
    from: range.from,
    to: range.to,
    summary: {
      enquiry_collections: enquiryIncome,
      invoice_collections: invoiceIncome,
      income: incomeTotal,
      expenses: expenseTotal,
      profit,
    },
    daily,
    income,
    expenses: expenseRows,
  };
};

const enquiryReport = async (query = {}) => {
  const range = parseRange(query);
  const { page, limit, offset, sortBy, sortOrder } = getPagination(query);
  const where = { ...range.datetimeWhere('created_at') };
  if (query.branch_id) where.branch_id = query.branch_id;
  if (query.lead_status_id) where.lead_status_id = query.lead_status_id;
  if (query.assigned_to) where.assigned_to = query.assigned_to;
  if (query.search) {
    const term = `%${String(query.search).trim()}%`;
    where[Op.or] = [
      { enquiry_code: { [Op.like]: term } },
      { customer_name: { [Op.like]: term } },
      { phone: { [Op.like]: term } },
      { email: { [Op.like]: term } },
    ];
  }

  const orderField = ['created_at', 'enquiry_code', 'customer_name', 'travel_from'].includes(sortBy)
    ? sortBy
    : 'created_at';

  const { rows, count } = await Enquiry.findAndCountAll({
    where,
    include: [
      { model: LeadStatus, as: 'leadStatus', attributes: ['id', 'lead_status', 'button_color'] },
      { model: User, as: 'assignee', attributes: ['id', 'first_name', 'last_name', 'email'] },
      { model: Branch, as: 'branch', attributes: ['id', 'name'] },
    ],
    limit,
    offset,
    order: [[orderField, sortOrder]],
    distinct: true,
  });

  return {
    from: range.from,
    to: range.to,
    data: rows,
    pagination: buildPaginationMeta(count, page, limit),
  };
};

const expenseReport = async (query = {}) => {
  const range = parseRange(query);
  const { page, limit, offset, sortBy, sortOrder } = getPagination(query);
  const where = { ...range.dateWhere('expense_date') };
  if (query.branch_id) where.branch_id = query.branch_id;
  if (query.category) where.category = query.category;
  if (query.status) where.status = query.status;
  if (query.search) {
    const term = `%${String(query.search).trim()}%`;
    where[Op.or] = [
      { expense_code: { [Op.like]: term } },
      { title: { [Op.like]: term } },
      { category: { [Op.like]: term } },
    ];
  }

  const orderField = ['expense_date', 'amount', 'category', 'title', 'expense_code'].includes(sortBy)
    ? sortBy
    : 'expense_date';

  const { rows, count } = await Expense.findAndCountAll({
    where,
    limit,
    offset,
    order: [[orderField, sortOrder]],
  });

  const totalAmount = rows.reduce((s, e) => s + money(e.amount), 0);
  const allAmount = await Expense.sum('amount', { where }) || 0;

  return {
    from: range.from,
    to: range.to,
    summary: { count, total: money(allAmount), page_total: totalAmount },
    data: rows,
    pagination: buildPaginationMeta(count, page, limit),
  };
};

const customerReport = async (query = {}) => {
  const range = parseRange(query);
  const where = { ...range.datetimeWhere('created_at') };
  if (query.branch_id) where.branch_id = query.branch_id;
  if (query.search) {
    const term = `%${String(query.search).trim()}%`;
    where[Op.or] = [
      { customer_name: { [Op.like]: term } },
      { phone: { [Op.like]: term } },
      { email: { [Op.like]: term } },
    ];
  }

  const rows = await Enquiry.findAll({
    where,
    attributes: ['id', 'customer_name', 'phone', 'email', 'created_at', 'budget', 'estimated_trip_cost'],
    order: [['created_at', 'DESC']],
  });

  const map = new Map();
  rows.forEach((row) => {
    const key = String(row.phone || row.email || row.customer_name || row.id).trim().toLowerCase();
    if (!map.has(key)) {
      map.set(key, {
        customer_name: row.customer_name,
        phone: row.phone,
        email: row.email,
        enquiry_count: 0,
        last_enquiry_at: row.created_at,
        first_enquiry_at: row.created_at,
        estimated_value: 0,
      });
    }
    const item = map.get(key);
    item.enquiry_count += 1;
    item.estimated_value += money(row.estimated_trip_cost || row.budget);
    if (dayjs(row.created_at).isAfter(dayjs(item.last_enquiry_at))) {
      item.last_enquiry_at = row.created_at;
      item.customer_name = row.customer_name || item.customer_name;
      item.email = row.email || item.email;
    }
    if (dayjs(row.created_at).isBefore(dayjs(item.first_enquiry_at))) {
      item.first_enquiry_at = row.created_at;
    }
  });

  const list = Array.from(map.values());
  const paged = paginateRows(list, query);
  return {
    from: range.from,
    to: range.to,
    summary: { customers: list.length, enquiries: rows.length },
    ...paged,
  };
};

const assignmentDateWhere = (range) => ({
  [Op.and]: [{ start_date: { [Op.lte]: range.to } }, { end_date: { [Op.gte]: range.from } }],
});

const vehicleReport = async (query = {}) => {
  const range = parseRange(query);
  const vehicles = await Vehicle.findAll({
    where: query.search
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${query.search}%` } },
            { code: { [Op.like]: `%${query.search}%` } },
            { registration_number: { [Op.like]: `%${query.search}%` } },
          ],
        }
      : {},
    attributes: [
      'id',
      'name',
      'code',
      'type',
      'ownership',
      'registration_number',
      'availability_status',
      'is_active',
    ],
    order: [['name', 'ASC']],
  });

  const assignments = await EnquiryVehicleAssignment.findAll({
    where: assignmentDateWhere(range),
    attributes: ['vehicle_id', 'amount', 'total_km', 'status', 'start_date', 'end_date'],
  });

  const byVehicle = new Map();
  assignments.forEach((row) => {
    if (!row.vehicle_id) return;
    if (!byVehicle.has(row.vehicle_id)) {
      byVehicle.set(row.vehicle_id, { trips: 0, amount: 0, km: 0 });
    }
    const item = byVehicle.get(row.vehicle_id);
    item.trips += 1;
    item.amount += money(row.amount);
    item.km += money(row.total_km);
  });

  const rows = vehicles.map((vehicle) => {
    const stats = byVehicle.get(vehicle.id) || { trips: 0, amount: 0, km: 0 };
    return {
      id: vehicle.id,
      name: vehicle.name,
      code: vehicle.code,
      type: vehicle.type,
      ownership: vehicle.ownership,
      registration_number: vehicle.registration_number,
      availability_status: vehicle.availability_status,
      is_active: vehicle.is_active,
      trips: stats.trips,
      total_km: stats.km,
      total_amount: stats.amount,
    };
  });

  const paged = paginateRows(rows, query);
  return {
    from: range.from,
    to: range.to,
    summary: {
      vehicles: rows.length,
      trips: rows.reduce((s, r) => s + r.trips, 0),
      amount: rows.reduce((s, r) => s + r.total_amount, 0),
    },
    ...paged,
  };
};

const driverReport = async (query = {}) => {
  const range = parseRange(query);
  const drivers = await Driver.findAll({
    where: query.search
      ? {
          [Op.or]: [
            { full_name: { [Op.like]: `%${query.search}%` } },
            { code: { [Op.like]: `%${query.search}%` } },
            { phone: { [Op.like]: `%${query.search}%` } },
          ],
        }
      : {},
    attributes: [
      'id',
      'code',
      'full_name',
      'phone',
      'driver_type',
      'availability_status',
      'is_active',
    ],
    order: [['full_name', 'ASC']],
  });

  const assignments = await EnquiryVehicleAssignment.findAll({
    where: {
      ...assignmentDateWhere(range),
      driver_id: { [Op.ne]: null },
    },
    attributes: ['driver_id', 'amount', 'total_km', 'status'],
  });

  const byDriver = new Map();
  assignments.forEach((row) => {
    if (!byDriver.has(row.driver_id)) {
      byDriver.set(row.driver_id, { trips: 0, amount: 0, km: 0 });
    }
    const item = byDriver.get(row.driver_id);
    item.trips += 1;
    item.amount += money(row.amount);
    item.km += money(row.total_km);
  });

  const rows = drivers.map((driver) => {
    const stats = byDriver.get(driver.id) || { trips: 0, amount: 0, km: 0 };
    return {
      id: driver.id,
      code: driver.code,
      full_name: driver.full_name,
      phone: driver.phone,
      driver_type: driver.driver_type,
      availability_status: driver.availability_status,
      is_active: driver.is_active,
      trips: stats.trips,
      total_km: stats.km,
      total_amount: stats.amount,
    };
  });

  const paged = paginateRows(rows, query);
  return {
    from: range.from,
    to: range.to,
    summary: {
      drivers: rows.length,
      trips: rows.reduce((s, r) => s + r.trips, 0),
      amount: rows.reduce((s, r) => s + r.total_amount, 0),
    },
    ...paged,
  };
};

const userFollowUps = async (query = {}) => {
  const range = parseRange(query);
  const result = await followUpService.list({
    ...query,
    from: range.from,
    to: range.to,
  });

  const grouped = {};
  (result.data || []).forEach((row) => {
    const json = row.toJSON ? row.toJSON() : row;
    const id = json.assigned_to || json.created_by || 'unassigned';
    const name = userName(json.assignee || json.creator) || 'Unassigned';
    if (!grouped[id]) grouped[id] = { user_id: id, user_name: name, total: 0, pending: 0, completed: 0 };
    grouped[id].total += 1;
    const status = String(json.status || '').toLowerCase();
    if (status === 'pending') grouped[id].pending += 1;
    if (status === 'completed' || status === 'done') grouped[id].completed += 1;
  });

  return {
    from: range.from,
    to: range.to,
    summary: Object.values(grouped),
    data: result.data,
    pagination: result.pagination,
  };
};

const attendancePeriodRange = (query = {}) => {
  const period = String(query.period || '').toLowerCase();
  const now = dayjs();
  if (period === 'yesterday') {
    const day = now.subtract(1, 'day');
    return { from: day.format('YYYY-MM-DD'), to: day.format('YYYY-MM-DD'), period: 'yesterday' };
  }
  if (period === 'this_week' || period === 'week') {
    return {
      from: now.startOf('week').format('YYYY-MM-DD'),
      to: now.format('YYYY-MM-DD'),
      period: 'this_week',
    };
  }
  if (period === 'this_month' || period === 'month') {
    return {
      from: now.startOf('month').format('YYYY-MM-DD'),
      to: now.format('YYYY-MM-DD'),
      period: 'this_month',
    };
  }
  if (period === 'last_month') {
    const last = now.subtract(1, 'month');
    return {
      from: last.startOf('month').format('YYYY-MM-DD'),
      to: last.endOf('month').format('YYYY-MM-DD'),
      period: 'last_month',
    };
  }
  if (period === 'custom' || query.from || query.to) {
    const range = parseRange(query, 'day');
    return { from: range.from, to: range.to, period: period || 'custom' };
  }
  return { from: now.format('YYYY-MM-DD'), to: now.format('YYYY-MM-DD'), period: 'today' };
};

const userAttendance = async (query = {}) => {
  const range = attendancePeriodRange(query);
  const result = await loginHistoryService.listByUser({
    ...query,
    from: range.from,
    to: range.to,
    group_by: 'user',
  });
  const dateLabel = dayjs(range.from).isSame(dayjs(range.to), 'day')
    ? dayjs(range.from).format('dddd, D MMMM YYYY')
    : `${dayjs(range.from).format('D MMMM YYYY')} – ${dayjs(range.to).format('D MMMM YYYY')}`;
  return {
    from: range.from,
    to: range.to,
    period: range.period,
    date_label: dateLabel,
    ...result,
  };
};

const misReport = async (query = {}) => {
  const range = parseRange(query);
  const { page, limit, offset, sortBy, sortOrder } = getPagination(query);

  const statuses = await LeadStatus.findAll({ attributes: ['id', 'lead_status'] });
  const includeIds = statuses.filter((s) => isMisBookingStatus(s.lead_status)).map((s) => s.id);

  const where = {};
  if (query.branch_id) where.branch_id = query.branch_id;
  if (includeIds.length) {
    where.lead_status_id = { [Op.in]: includeIds };
  }

  const enquiries = await Enquiry.findAll({
    where,
    include: [
      { model: LeadStatus, as: 'leadStatus', attributes: ['id', 'lead_status'] },
      { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name', 'email', 'phone'] },
      { model: User, as: 'assignee', attributes: ['id', 'first_name', 'last_name', 'email', 'phone'] },
      { model: Destination, as: 'destination', attributes: ['id', 'name', 'city'] },
      {
        model: Quotation,
        as: 'quotations',
        attributes: ['id', 'total_amount', 'tax_amount', 'pricing', 'itinerary_id', 'created_at'],
        required: false,
        include: [
          {
            model: Itinerary,
            as: 'itinerary',
            attributes: ['id', 'pricing', 'status', 'confirmed_at', 'adults', 'children'],
            required: false,
          },
        ],
      },
      {
        model: Itinerary,
        as: 'itineraries',
        attributes: ['id', 'pricing', 'status', 'confirmed_at', 'adults', 'children', 'from_date'],
        required: false,
      },
      {
        model: Payment,
        as: 'payments',
        attributes: ['payment_date', 'quotation_amount', 'additional_charges', 'status'],
        required: false,
      },
    ],
    order: [['updated_at', 'DESC']],
  });

  const enquiryIds = enquiries.map((row) => row.id);
  const bookings = enquiryIds.length
    ? await Booking.findAll({
        where: { enquiry_id: { [Op.in]: enquiryIds } },
        attributes: ['id', 'enquiry_id', 'created_at', 'booking_code', 'adults', 'children', 'total_amount'],
        order: [['created_at', 'ASC']],
      })
    : [];
  const bookingByEnquiry = new Map();
  bookings.forEach((row) => {
    if (!bookingByEnquiry.has(row.enquiry_id)) bookingByEnquiry.set(row.enquiry_id, row);
  });

  const mapped = enquiries
    .map((record) => {
      const enquiry = record.toJSON ? record.toJSON() : record;
      if (isCancelledStatus(enquiry.leadStatus?.lead_status) || isCancelledStatus(enquiry.status)) {
        return null;
      }
      if (includeIds.length) {
        if (!isMisBookingStatus(enquiry.leadStatus?.lead_status)) return null;
      } else if (!(enquiry.quotations || []).length && !(enquiry.itineraries || []).length) {
        return null;
      }

      const quotation = pickPrimaryQuotation(enquiry.quotations || [], enquiry.itineraries || []);
      const itinerary = pickPrimaryItinerary(enquiry.itineraries || [], quotation);
      const booking = bookingByEnquiry.get(enquiry.id) || null;
      const bookingDate = resolveBookingDate(enquiry, booking, itinerary);
      if (!bookingDate) return null;

      const bookingDay = dayjs(bookingDate);
      if (bookingDay.isBefore(range.start, 'day') || bookingDay.isAfter(range.end, 'day')) {
        return null;
      }

      const costs = breakdownPricingCosts(quotation?.pricing || itinerary?.pricing);
      const packageAmount = resolvePackageAmount({
        quotation,
        itinerary,
        enquiry,
        payments: enquiry.payments || [],
      });
      const sellingWithGst = costs.selling_with_gst || money(quotation?.total_amount) || packageAmount;
      const gst = costs.gst || money(quotation?.tax_amount);
      const sellingCost =
        gst > 0 && sellingWithGst >= gst ? round2(sellingWithGst - gst) : round2(sellingWithGst);
      const totalCost = costs.total_cost;
      const grossProfit = round2(sellingCost - totalCost);
      const bookedByUser = enquiry.creator || enquiry.assignee;
      const pax =
        (Number(itinerary?.adults) || Number(enquiry.adults) || 0) +
        (Number(itinerary?.children) || Number(enquiry.children) || 0) +
        (Number(enquiry.infants) || 0);

      const destination =
        mainCity(enquiry.travel_to_destination) ||
        enquiry.destination?.city ||
        enquiry.destination?.name ||
        mainCity(enquiry.travel_from_destination) ||
        '—';

      return {
        id: enquiry.id,
        sr: 0,
        booked_by: userName(bookedByUser),
        booked_by_email: bookedByUser?.email || '—',
        mobile: enquiry.phone || '—',
        client_email: enquiry.email || '—',
        enquiry_code: enquiry.enquiry_code || booking?.booking_code || '—',
        booking_date: bookingDay.format('YYYY-MM-DD'),
        client: enquiry.customer_name || '—',
        destination,
        no_of_pax: pax,
        selling_cost: sellingCost,
        ...emptyEventCosts(),
        ...MIS_EVENT_TYPES.reduce((acc, type) => {
          const field = eventCostField(type.key);
          acc[field] = costs[field] || 0;
          return acc;
        }, {}),
        total_cost: totalCost,
        gross_profit: grossProfit,
        gst,
      };
    })
    .filter(Boolean);

  if (query.search) {
    const term = String(query.search).trim().toLowerCase();
    if (term) {
      for (let i = mapped.length - 1; i >= 0; i -= 1) {
        const row = mapped[i];
        const haystack = [
          row.booked_by,
          row.booked_by_email,
          row.mobile,
          row.client_email,
          row.enquiry_code,
          row.client,
          row.destination,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(term)) mapped.splice(i, 1);
      }
    }
  }

  const sortField = [
    'booking_date',
    'client',
    'enquiry_code',
    'selling_cost',
    ...MIS_EVENT_TYPES.map((type) => eventCostField(type.key)),
    'total_cost',
    'gross_profit',
    'gst',
    'no_of_pax',
    'destination',
  ].includes(sortBy)
    ? sortBy
    : 'booking_date';
  const direction = sortOrder === 'ASC' ? 1 : -1;
  mapped.sort((a, b) => {
    const av = a[sortField];
    const bv = b[sortField];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * direction;
    return String(av).localeCompare(String(bv), undefined, { numeric: true }) * direction;
  });

  const numbered = mapped.map((row, index) => ({ ...row, sr: index + 1 }));
  const pageRows = numbered.slice(offset, offset + limit);

  const summary = numbered.reduce(
    (acc, row) => {
      acc.selling_cost += row.selling_cost;
      acc.total_cost += row.total_cost;
      acc.gross_profit += row.gross_profit;
      acc.gst += row.gst;
      acc.pax += row.no_of_pax;
      return acc;
    },
    { count: numbered.length, selling_cost: 0, total_cost: 0, gross_profit: 0, gst: 0, pax: 0 }
  );
  Object.keys(summary).forEach((key) => {
    if (key !== 'count' && key !== 'pax') summary[key] = round2(summary[key]);
  });

  return {
    from: range.from,
    to: range.to,
    summary,
    data: pageRows,
    pagination: buildPaginationMeta(numbered.length, page, limit),
  };
};

const isCompletedTourStatus = (label) => {
  const name = normalizeStatusName(label);
  return (
    name.includes('trip completed') ||
    name.includes('trip complete') ||
    name.includes('trip closed') ||
    name === 'feedback' ||
    name.startsWith('feedback')
  );
};

const isDashboardUpcomingTour = (row, today, until) => {
  const status = row.leadStatus?.lead_status;
  if (isCancelledStatus(status) || isCancelledStatus(row.status) || isCompletedTourStatus(status)) {
    return false;
  }
  if (!row.travel_from) return false;
  if (dayjs(row.travel_from).isAfter(until, 'day')) return false;
  if (row.travel_to) return !dayjs(row.travel_to).isBefore(today, 'day');
  return !dayjs(row.travel_from).isBefore(today, 'day');
};

const tourOverlapsRange = (row, start, end) => {
  if (!row.travel_from) return false;
  if (dayjs(row.travel_from).isAfter(end, 'day')) return false;
  if (row.travel_to) return !dayjs(row.travel_to).isBefore(start, 'day');
  return !dayjs(row.travel_from).isBefore(start, 'day');
};

const tourBucket = (row, today, until) => {
  const status = row.leadStatus?.lead_status;
  if (isCancelledStatus(status) || isCancelledStatus(row.status)) return 'cancelled';
  if (isDashboardUpcomingTour(row, today, until)) return 'upcoming';
  if (isCompletedTourStatus(status)) return 'completed';
  if (row.travel_to && dayjs(row.travel_to).isBefore(today, 'day')) return 'completed';
  return 'ongoing';
};

const toursReport = async (query = {}) => {
  const range = parseRange(query);
  const { page, limit, offset, sortBy, sortOrder } = getPagination({
    ...query,
    sortBy: query.sortBy || 'travel_from',
  });
  const today = dayjs().startOf('day');
  const until = dayjs().add(7, 'day').endOf('day');
  const todayStr = today.format('YYYY-MM-DD');
  const untilStr = until.format('YYYY-MM-DD');
  const scope = String(query.scope || query.status || 'all').toLowerCase();

  const rangeWhere = {
    [Op.and]: [
      { travel_from: { [Op.ne]: null, [Op.lte]: range.to } },
      {
        [Op.or]: [
          { travel_to: { [Op.gte]: range.from } },
          { travel_to: null, travel_from: { [Op.gte]: range.from } },
        ],
      },
    ],
  };
  const upcomingWhere = {
    [Op.and]: [
      { travel_from: { [Op.ne]: null, [Op.lte]: untilStr } },
      {
        [Op.or]: [
          { travel_to: { [Op.gte]: todayStr } },
          { travel_to: null, travel_from: { [Op.gte]: todayStr } },
        ],
      },
    ],
  };
  const where = {
    [Op.or]: [rangeWhere, upcomingWhere],
    ...(query.branch_id ? { branch_id: query.branch_id } : {}),
  };

  const enquiries = await Enquiry.findAll({
    where,
    include: [
      { model: LeadStatus, as: 'leadStatus', attributes: ['id', 'lead_status', 'button_color'] },
      { model: User, as: 'assignee', attributes: ['id', 'first_name', 'last_name', 'email'] },
      { model: Package, as: 'package', attributes: ['id', 'name'] },
      {
        model: Itinerary,
        as: 'itineraries',
        attributes: ['id', 'title', 'status'],
        required: false,
      },
    ],
    order: [['travel_from', 'ASC']],
  });

  const mapped = enquiries
    .map((record) => {
      const enquiry = record.toJSON ? record.toJSON() : record;
      const bucket = tourBucket(enquiry, today, until);
      if (bucket === 'cancelled') return null;

      const itinerary = (enquiry.itineraries || []).find(
        (item) => String(item.status || '').toLowerCase() === 'confirmed'
      ) || enquiry.itineraries?.[0];

      return {
        id: enquiry.id,
        query_id: enquiry.enquiry_code || '—',
        package_name: enquiry.package?.name || itinerary?.title || '—',
        client: enquiry.customer_name || '—',
        status: enquiry.leadStatus?.lead_status || '—',
        status_color: enquiry.leadStatus?.button_color || '#90a4ae',
        assigned: userName(enquiry.assignee),
        travel_from: enquiry.travel_from,
        travel_to: enquiry.travel_to,
        bucket,
        in_range: tourOverlapsRange(enquiry, range.start, range.end),
      };
    })
    .filter(Boolean);

  const searched = query.search
    ? mapped.filter((row) => {
        const term = String(query.search).trim().toLowerCase();
        if (!term) return true;
        return [row.query_id, row.package_name, row.client, row.assigned, row.status]
          .join(' ')
          .toLowerCase()
          .includes(term);
      })
    : mapped;

  const inRange = searched.filter((row) => row.in_range);
  const summary = {
    total: inRange.length,
    completed: inRange.filter((row) => row.bucket === 'completed').length,
    upcoming: searched.filter((row) => row.bucket === 'upcoming').length,
  };

  const scoped =
    scope === 'upcoming'
      ? searched.filter((row) => row.bucket === 'upcoming')
      : scope === 'completed'
        ? inRange.filter((row) => row.bucket === 'completed')
        : inRange;

  const sortField = ['query_id', 'package_name', 'client', 'status', 'assigned', 'travel_from'].includes(
    sortBy
  )
    ? sortBy
    : 'travel_from';
  const direction = sortOrder === 'ASC' ? 1 : -1;
  scoped.sort((a, b) => {
    const av = a[sortField];
    const bv = b[sortField];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    return String(av).localeCompare(String(bv), undefined, { numeric: true }) * direction;
  });

  return {
    from: range.from,
    to: range.to,
    summary,
    data: scoped.slice(offset, offset + limit),
    pagination: buildPaginationMeta(scoped.length, page, limit),
  };
};

module.exports = {
  salesSummary,
  leadConversion,
  financialSummary,
  profitAndLoss,
  enquiryReport,
  expenseReport,
  customerReport,
  vehicleReport,
  driverReport,
  userFollowUps,
  userAttendance,
  misReport,
  toursReport,
};
