const dayjs = require('dayjs');
const logger = require('../config/logger');

let puppeteer = null;
try {
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  puppeteer = require('puppeteer');
} catch {
  logger.warn('puppeteer is not available; invoice image capture will fail');
}

const formatDate = (value) => {
  if (!value) return '—';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('DD MMM YYYY') : String(value);
};

const formatMoney = (value) => {
  const num = Math.round(Number(value) || 0);
  return `₹${num.toLocaleString('en-IN')}`;
};

const userDisplayName = (user) => {
  if (!user) return '—';
  return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || '—';
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const buildInvoiceHtml = ({
  enquiry = {},
  quotation = null,
  itinerary = null,
  invoiceContext = {},
  branding = {},
}) => {
  const companyName = branding.company_name || 'Pollachi Tours and Travels';
  const invoiceNo = invoiceContext.invoice_number || '—';
  const invoiceDate = formatDate(invoiceContext.invoice_date || new Date());
  const customerName = enquiry.customer_name || quotation?.customer_name || 'Customer';
  const packageName =
    quotation?.package?.name || enquiry.package?.name || itinerary?.title || 'Tour Package';
  const travelFrom =
    invoiceContext.trip_from ||
    quotation?.travel_from ||
    itinerary?.from_date ||
    enquiry.travel_from;
  const travelTo =
    invoiceContext.trip_to || quotation?.travel_to || itinerary?.to_date || enquiry.travel_to;
  const travelDates =
    travelFrom || travelTo ? `${formatDate(travelFrom)} - ${formatDate(travelTo)}` : '—';

  const row = (label, value, color = '#0b2a4a') =>
    `<div class="row"><span class="label">${escapeHtml(label)}</span><span class="colon">:</span><span class="value" style="color:${color}">${escapeHtml(value || '—')}</span></div>`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 24px; background: #fff; font-family: Arial, sans-serif; color: #0f172a; }
  #enquiry-invoice-print { max-width: 860px; margin: 0 auto; border: 1px solid #dbe3ef; border-radius: 8px; padding: 28px 32px; background: #fff; }
  .company { text-align: center; color: #0b2a4a; font-size: 24px; font-weight: 800; }
  .address { text-align: center; color: #475569; font-size: 12px; margin-top: 6px; }
  .title { text-align: center; color: #0b2a4a; font-size: 20px; font-weight: 800; margin: 18px 0 22px; }
  .row { display: grid; grid-template-columns: 150px 12px 1fr; gap: 4px; padding: 4px 0; font-size: 13px; }
  .label { font-weight: 700; color: #334155; }
  .colon { font-weight: 700; color: #334155; }
  .value { font-weight: 800; word-break: break-word; }
  .section { margin-top: 18px; padding-top: 14px; border-top: 1px solid #e2e8f0; }
  .section-title { background: #0b2a4a; color: #fff; font-size: 12px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; padding: 8px 12px; border-radius: 4px; margin-bottom: 10px; }
  .footer { margin-top: 24px; text-align: center; color: #475569; font-size: 12px; }
</style>
</head>
<body>
  <div id="enquiry-invoice-print" data-pdf-ready="true">
    <div class="company">${escapeHtml(companyName)}</div>
    ${branding.company_address ? `<div class="address">${escapeHtml(branding.company_address)}</div>` : ''}
    <div class="title">TAX INVOICE</div>
    ${row('Invoice No.', invoiceNo, '#c62828')}
    ${row('Invoice Date', invoiceDate)}
    ${row('Enquiry No.', enquiry.enquiry_code)}
    ${row('Quotation No.', quotation?.quotation_code)}
    ${row('Customer Name', customerName)}
    ${row('Mobile', enquiry.phone || quotation?.phone)}
    ${row('Email', enquiry.email || quotation?.email)}
    ${row('Package / Tour', packageName)}
    ${row('Travel Dates', travelDates)}
    ${row('From Destination', enquiry.travel_from_destination)}
    ${row('To Destination', enquiry.travel_to_destination)}
    ${row('Sales Executive', userDisplayName(enquiry.assignee))}
    <div class="section">
      <div class="section-title">Amount Details</div>
      ${Number(invoiceContext.additional_charges) > 0 ? row('Additional Charges', formatMoney(invoiceContext.additional_charges)) : ''}
      ${row('Total Amount', formatMoney(invoiceContext.total_amount), '#1565c0')}
      ${row('Paid Amount', formatMoney(invoiceContext.paid_amount), '#047857')}
      ${row('Balance Amount', formatMoney(invoiceContext.balance_amount), '#047857')}
    </div>
    <div class="footer">Thank you for choosing ${escapeHtml(companyName)}.</div>
  </div>
</body>
</html>`;
};

const generateEnquiryInvoiceImageBuffer = async (params) => {
  if (!puppeteer) {
    throw new Error('puppeteer_not_installed');
  }

  const html = buildInvoiceHtml(params);
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 920, height: 1400, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.waitForSelector('#enquiry-invoice-print', { timeout: 15000 });
    await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 400)));

    const element = await page.$('#enquiry-invoice-print');
    if (!element) throw new Error('invoice_element_not_found');

    const screenshot = await element.screenshot({ type: 'png' });
    if (!screenshot || screenshot.length < 500) {
      throw new Error('invoice_image_empty');
    }

    return Buffer.from(screenshot);
  } finally {
    await browser.close();
  }
};

module.exports = {
  generateEnquiryInvoiceImageBuffer,
  buildInvoiceHtml,
};
