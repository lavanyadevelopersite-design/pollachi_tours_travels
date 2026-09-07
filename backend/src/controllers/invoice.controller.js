const invoiceService = require('../services/invoice.service');
const createCrudController = require('./crud.factory');

module.exports = createCrudController(invoiceService, 'Invoice');
