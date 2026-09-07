const { Lead, User, Branch } = require('../models');
const createCrudService = require('./crud.factory');

const base = createCrudService(Lead, {
  searchFields: ['first_name', 'last_name', 'email', 'phone', 'lead_code'],
  defaultIncludes: [
    { model: User, as: 'assignee', attributes: ['id', 'first_name', 'last_name', 'email'] },
    { model: Branch, as: 'branch', attributes: ['id', 'name', 'code'] },
  ],
  codeField: 'lead_code',
  codePrefix: 'LD',
});

module.exports = base;
