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
} = require('../models');
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

const userAttendance = async (query = {}) => {
  const range = parseRange(query);
  const result = await loginHistoryService.listByUser({
    ...query,
    from: range.from,
    to: range.to,
    group_by: 'user',
  });
  return {
    from: range.from,
    to: range.to,
    ...result,
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
};
