const receiptService = require('../services/receipt.service');
const createCrudController = require('./crud.factory');

module.exports = createCrudController(receiptService, 'Receipt');
