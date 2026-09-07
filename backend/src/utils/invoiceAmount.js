const quotationService = require('../services/quotation.service');

const defaultPricing = () => ({
  gst_mode: 'gst_on_total',
  base_markup_percent: 0,
  extra_markup: 0,
  cgst_percent: 0,
  sgst_percent: 0,
  igst_percent: 0,
  tcs_percent: 0,
  discount: 0,
  line_items: [],
});

/** Match frontend coercePricing — handles JSON strings and double-encoding. */
const coercePricing = (raw) => {
  let value = raw;
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
      if (typeof value === 'string') {
        try {
          value = JSON.parse(value);
        } catch {
          /* keep first parse */
        }
      }
    } catch {
      return defaultPricing();
    }
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return defaultPricing();
  }

  const lineItems = Array.isArray(value.line_items) ? value.line_items : [];
  if (value['0'] != null && !lineItems.length && value.line_items === undefined) {
    return defaultPricing();
  }

  return {
    ...defaultPricing(),
    gst_mode: value.gst_mode || 'gst_on_total',
    base_markup_percent: Number(value.base_markup_percent) || 0,
    extra_markup: Number(value.extra_markup) || 0,
    cgst_percent: Number(value.cgst_percent) || 0,
    sgst_percent: Number(value.sgst_percent) || 0,
    igst_percent: Number(value.igst_percent) || 0,
    tcs_percent: Number(value.tcs_percent) || 0,
    discount: Number(value.discount) || 0,
    line_items: lineItems,
  };
};

const pricingGrandTotal = (pricing) => {
  const normalized = coercePricing(pricing);
  const summarized = quotationService.summarizeTotals(normalized);
  if (summarized.total_amount > 0) return Math.round(summarized.total_amount);

  const grand = normalized.grand_total ?? normalized.grandTotal;
  if (grand != null && Number(grand) > 0) return Math.round(Number(grand));

  return 0;
};

/** Match frontend EnquiryInvoicePanel quotationAmount logic. */
const resolveQuotationAmount = (quotation, itinerary = null) => {
  if (!quotation) return 0;

  const fromTotal = Number(quotation.total_amount);
  if (Number.isFinite(fromTotal) && fromTotal > 0) return Math.round(fromTotal);

  const fromPricing = pricingGrandTotal(quotation.pricing);
  if (fromPricing > 0) return fromPricing;

  const linkedItinerary = quotation.itinerary || itinerary;
  return pricingGrandTotal(linkedItinerary?.pricing) || 0;
};

const sumAdditionalCharges = (payments = []) =>
  Math.round(
    (payments || []).reduce((sum, row) => sum + (Number(row?.additional_charges) || 0), 0)
  );

const resolvePackageAmount = ({
  quotation = null,
  itinerary = null,
  enquiry = null,
  payments = [],
}) => {
  const fromQuotation = resolveQuotationAmount(quotation, itinerary);
  if (fromQuotation > 0) return fromQuotation;

  if (itinerary?.pricing) {
    const fromItinerary = pricingGrandTotal(itinerary.pricing);
    if (fromItinerary > 0) return fromItinerary;
  }

  const maxPaymentQuotation = (payments || []).reduce((max, row) => {
    const amt = Number(row?.quotation_amount) || 0;
    return amt > max ? amt : max;
  }, 0);
  if (maxPaymentQuotation > 0) return Math.round(maxPaymentQuotation);

  if (enquiry?.estimated_trip_cost) {
    const estimated = Number(enquiry.estimated_trip_cost);
    if (estimated > 0) return Math.round(estimated);
  }

  return 0;
};

const resolveInvoiceTotalAmount = (args = {}) => {
  const packageAmount = resolvePackageAmount(args);
  return Math.round(packageAmount + sumAdditionalCharges(args.payments));
};

module.exports = {
  coercePricing,
  pricingGrandTotal,
  resolveQuotationAmount,
  resolvePackageAmount,
  sumAdditionalCharges,
  resolveInvoiceTotalAmount,
};
