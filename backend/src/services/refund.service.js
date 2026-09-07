const { Refund, Booking, Invoice, Cancellation } = require('../models');
const createCrudService = require('./crud.factory');

module.exports = createCrudService(Refund, {
  searchFields: ['refund_code', 'customer_name', 'reason'],
  defaultIncludes: [
    { model: Booking, as: 'booking', attributes: ['id', 'booking_code'] },
    { model: Invoice, as: 'invoice', attributes: ['id', 'invoice_number'] },
    { model: Cancellation, as: 'cancellation' },
  ],
  codeField: 'refund_code',
  codePrefix: 'REF',
});
