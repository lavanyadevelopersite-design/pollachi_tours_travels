const { Receipt, Invoice, Booking } = require('../models');
const createCrudService = require('./crud.factory');

const base = createCrudService(Receipt, {
  searchFields: ['receipt_number', 'customer_name', 'transaction_ref'],
  defaultIncludes: [
    { model: Invoice, as: 'invoice', attributes: ['id', 'invoice_number', 'total_amount'] },
    { model: Booking, as: 'booking', attributes: ['id', 'booking_code'] },
  ],
  codeField: 'receipt_number',
  codePrefix: 'RCP',
});

const create = async (payload, userId = null) => {
  const receipt = await base.create(payload, userId);

  if (payload.invoice_id) {
    const invoice = await Invoice.findByPk(payload.invoice_id);
    if (invoice) {
      const paid = parseFloat(invoice.paid_amount || 0) + parseFloat(payload.amount || 0);
      const total = parseFloat(invoice.total_amount || 0);
      let status = invoice.status;
      if (paid >= total) status = 'paid';
      else if (paid > 0) status = 'partial';
      await invoice.update({ paid_amount: paid, status, updated_by: userId });
    }
  }

  if (payload.booking_id) {
    const booking = await Booking.findByPk(payload.booking_id);
    if (booking) {
      const paid = parseFloat(booking.paid_amount || 0) + parseFloat(payload.amount || 0);
      await booking.update({ paid_amount: paid, updated_by: userId });
    }
  }

  return receipt;
};

module.exports = { ...base, create };
