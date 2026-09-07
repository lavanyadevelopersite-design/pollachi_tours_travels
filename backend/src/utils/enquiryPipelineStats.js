const { Op } = require('sequelize');
const dayjs = require('dayjs');
const { Enquiry, LeadStatus } = require('../models');

const statusKey = (id) => (id == null || id === '' ? 'none' : String(id));

const countByLeadStatus = async (where = {}) => {
  const grouped = await Enquiry.findAll({
    attributes: [
      'lead_status_id',
      [Enquiry.sequelize.literal('COUNT(*)'), 'count'],
    ],
    where,
    group: ['lead_status_id'],
    raw: true,
  });

  const map = {};
  (grouped || []).forEach((row) => {
    map[statusKey(row.lead_status_id)] = Number(row.count || 0);
  });
  return map;
};

const getEnquiryPipelineStats = async (query = {}) => {
  const where = {};
  if (query.enquiry_type) where.enquiry_type = query.enquiry_type;
  if (query.branch_id) where.branch_id = query.branch_id;

  const from = query.from || query.date_from;
  const to = query.to || query.date_to;
  if (from || to) {
    where.created_at = {};
    if (from) where.created_at[Op.gte] = dayjs(from).startOf('day').toDate();
    if (to) where.created_at[Op.lte] = dayjs(to).endOf('day').toDate();
  }

  const todayStart = dayjs().startOf('day').toDate();
  const todayEnd = dayjs().endOf('day').toDate();
  const todayWhere = { ...where, created_at: { [Op.between]: [todayStart, todayEnd] } };

  const [total, todayQueries, statuses, countById] = await Promise.all([
    Enquiry.count({ where }),
    Enquiry.count({ where: todayWhere }),
    LeadStatus.findAll({
      where: { is_active: true },
      attributes: ['id', 'lead_status', 'button_color', 'created_at'],
      order: [['created_at', 'ASC']],
    }),
    countByLeadStatus(where),
  ]);

  return {
    todayQueries: Number(todayQueries || 0),
    totalQueries: Number(total || 0),
    total: Number(total || 0),
    statuses: (statuses || [])
      .filter((status) => !/cancell?ed|feedback/i.test(String(status.lead_status || '')))
      .map((status) => ({
      id: status.id,
      name: status.lead_status,
      color: status.button_color || '#64748b',
      count: countById[statusKey(status.id)] || 0,
    })),
  };
};

module.exports = {
  statusKey,
  countByLeadStatus,
  getEnquiryPipelineStats,
};
