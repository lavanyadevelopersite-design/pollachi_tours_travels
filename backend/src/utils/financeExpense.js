const { Op } = require('sequelize');
const { EnquiryVehicleAssignment, Enquiry } = require('../models');

const money = (value) => Number.parseFloat(value || 0) || 0;

const fetchVehicleAssignmentExpenses = async ({ from, to, branchId } = {}) => {
  const enquiryInclude = {
    model: Enquiry,
    as: 'enquiry',
    attributes: ['id', 'enquiry_code', 'customer_name', 'branch_id'],
    required: Boolean(branchId),
    ...(branchId ? { where: { branch_id: branchId } } : {}),
  };

  return EnquiryVehicleAssignment.findAll({
    where: {
      status: { [Op.notIn]: ['cancelled'] },
      start_date: { [Op.between]: [from, to] },
      amount: { [Op.gt]: 0 },
    },
    attributes: ['id', 'amount', 'start_date', 'end_date', 'status', 'enquiry_id'],
    include: [enquiryInclude],
  });
};

const assignmentExpenseTotal = (rows = []) =>
  rows.reduce((sum, row) => sum + money(row.amount), 0);

module.exports = {
  money,
  fetchVehicleAssignmentExpenses,
  assignmentExpenseTotal,
};
