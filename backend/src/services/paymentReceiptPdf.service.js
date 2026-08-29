const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const dayjs = require('dayjs');

const formatDate = (value) => {
  if (!value) return '—';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('DD MMM YYYY') : String(value);
};

const formatMoney = (value) => {
  const num = Number(value || 0);
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

const userDisplayName = (user) => {
  if (!user) return '—';
  return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || '—';
};

const ensureReceiptPdfDir = () => {
  const dir = path.join(__dirname, '../../uploads/receipts');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const buildPdfFileName = (payment = {}) => {
  const code = String(payment.payment_code || payment.id || 'receipt')
    .replace(/[^\w-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `${code || 'payment-receipt'}.pdf`;
};

const generatePaymentReceiptPdfBuffer = ({ payment = {}, branding = {} }) =>
  new Promise((resolve, reject) => {
    try {
      const enquiry = payment.enquiry || {};
      const quotation = payment.quotation || {};
      const companyName = branding.company_name || 'Pollachi Tours and Travels';
      const received = Number(payment.advance_amount) || 0;
      const quotationAmount =
        Number(payment.quotation_amount) || Number(quotation.total_amount) || 0;
      const alreadyPaid = Number(payment.already_paid) || 0;
      const balance =
        payment.balance_amount != null
          ? Number(payment.balance_amount)
          : Math.max(quotationAmount - alreadyPaid - received, 0);

      const doc = new PDFDocument({ size: 'A4', margin: 48 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fillColor('#0f766e').fontSize(22).text(companyName, { align: 'center' });
      doc.moveDown(0.35);
      doc.fillColor('#111827').fontSize(18).text('Payment Receipt', { align: 'center' });
      doc.moveDown(1);

      const leftX = doc.x;
      const labelWidth = 150;

      const row = (label, value, valueColor = '#111827') => {
        const y = doc.y;
        doc.fontSize(10).fillColor('#6b7280').text(label, leftX, y, { width: labelWidth });
        doc.fontSize(11).fillColor(valueColor).text(String(value || '—'), leftX + labelWidth, y);
        doc.moveDown(0.55);
      };

      row('Receipt No.', payment.payment_code, '#c62828');
      row('Receipt Date', formatDate(payment.payment_date));
      row('Payment Mode', payment.payment_mode);
      row('Transaction ID', payment.transaction_id);
      row('Reference No.', payment.reference_no);
      row('Enquiry No.', enquiry.enquiry_code);
      row('Quotation No.', quotation.quotation_code);
      row('Customer Name', enquiry.customer_name);
      row('Mobile', enquiry.phone);
      row('Email', enquiry.email);

      doc.moveDown(0.5);
      doc.fillColor('#0f766e').fontSize(13).text('Payment Summary');
      doc.moveDown(0.4);
      row('Quotation Amount', formatMoney(quotationAmount));
      row('Already Paid', formatMoney(alreadyPaid));
      row('Amount Received', formatMoney(received), '#047857');
      row('Balance Amount', formatMoney(balance));

      doc.moveDown(1);
      doc
        .fontSize(10)
        .fillColor('#374151')
        .text(
          `Received with thanks from ${enquiry.customer_name || 'Customer'} a sum of ${formatMoney(received)}.`,
          { align: 'left' }
        );
      doc.moveDown(0.35);
      doc.text(`Received by: ${userDisplayName(payment.receiver || payment.creator)}`);

      doc.moveDown(1.2);
      doc.fontSize(10).fillColor('#374151').text(`Thank you for choosing ${companyName}.`, {
        align: 'center',
      });
      const contact = branding.company_phone || branding.company_email || '';
      if (contact) {
        doc.text(`Contact: ${contact}`, { align: 'center' });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });

const savePaymentReceiptPdf = async ({ payment = {}, branding = {} }) => {
  const buffer = await generatePaymentReceiptPdfBuffer({ payment, branding });
  const dir = ensureReceiptPdfDir();
  const fileName = buildPdfFileName(payment);
  const filePath = path.join(dir, fileName);
  fs.writeFileSync(filePath, buffer);
  return { buffer, filePath, fileName };
};

module.exports = {
  generatePaymentReceiptPdfBuffer,
  savePaymentReceiptPdf,
  buildPdfFileName,
};
