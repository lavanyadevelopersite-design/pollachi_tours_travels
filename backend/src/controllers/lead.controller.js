const leadService = require('../services/lead.service');
const createCrudController = require('./crud.factory');

module.exports = createCrudController(leadService, 'Lead');
