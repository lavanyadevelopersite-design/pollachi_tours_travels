const refundService = require('../services/refund.service');
const createCrudController = require('./crud.factory');

module.exports = createCrudController(refundService, 'Refund');
