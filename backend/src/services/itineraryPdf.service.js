const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const dayjs = require('dayjs');
const logger = require('../config/logger');

let puppeteer = null;
try {
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  puppeteer = require('puppeteer');
} catch {
  logger.warn('puppeteer is not available; using text-based itinerary PDF fallback');
}

const THEME_COLORS = {
  dream_vacay: { primary: '#0d9488', secondary: '#134e4a' },
  scenic_escape: { primary: '#1d4ed8', secondary: '#1e3a8a' },
  classic_voyage: { primary: '#0f766e', secondary: '#115e59' },
};

const getThemeId = (itinerary = {}) => {
  const prefs = itinerary.preferences || {};
  const theme = prefs.preview_theme || prefs.theme || 'classic_voyage';
  return THEME_COLORS[theme] ? theme : 'classic_voyage';
};

const formatDate = (value) => {
  if (!value) return '—';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('DD MMM YYYY') : String(value);
};

const formatMoney = (value) => {
  const num = Number(value || 0);
  return `INR ${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const sortDays = (itinerary = {}) =>
  [...(itinerary.itineraryDays || [])].sort((a, b) => (a.day_number || 0) - (b.day_number || 0));

const sortEvents = (day = {}) =>
  [...(day.events || [])].sort((a, b) => {
    if (a.event_time && b.event_time) return String(a.event_time).localeCompare(String(b.event_time));
    return (a.display_order || 0) - (b.display_order || 0);
  });

const ensurePdfDir = () => {
  const dir = path.join(__dirname, '../../uploads/itineraries');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const buildPdfFileName = (itinerary = {}) => {
  const destination = itinerary.destination?.name || itinerary.title || 'Itinerary';
  const safe = String(destination).replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
  return `${safe || 'Itinerary'}-${String(itinerary.id || 'trip').slice(0, 8)}.pdf`;
};

const getPublicAppBaseUrl = () =>
  String(process.env.PUBLIC_APP_URL || process.env.CORS_ORIGIN || 'http://localhost:5173').replace(
    /\/$/,
    ''
  );

const buildPreviewPdfUrl = (shareToken) =>
  `${getPublicAppBaseUrl()}/i/${encodeURIComponent(shareToken)}?pdf=1`;

const generatePdfFromPreview = async (shareToken) => {
  if (!puppeteer) {
    throw new Error('puppeteer_not_installed');
  }
  if (!shareToken) {
    throw new Error('missing_share_token');
  }

  const url = buildPreviewPdfUrl(shareToken);
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 120000 });
    await page
      .waitForSelector('[data-pdf-ready="true"]', { timeout: 90000 })
      .catch(() => logger.warn('Itinerary PDF page did not signal ready in time', { url }));

    await page.emulateMediaType('print');
    await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 1200)));

    const buffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '12mm', right: '14mm', bottom: '12mm', left: '14mm' },
    });

    if (!buffer || buffer.length < 500) {
      throw new Error('preview_pdf_empty');
    }

    return Buffer.from(buffer);
  } finally {
    await browser.close();
  }
};

const generateItineraryPdfBuffer = ({ itinerary = {}, branding = {} }) =>
  new Promise((resolve, reject) => {
    try {
      const themeId = getThemeId(itinerary);
      const colors = THEME_COLORS[themeId];
      const doc = new PDFDocument({ size: 'A4', margin: 48 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const companyName = branding.company_name || 'Pollachi Tours and Travels';
      const destination = itinerary.destination?.name || itinerary.title || 'Travel Itinerary';
      const adults = itinerary.adults ?? 1;
      const children = itinerary.children ?? 0;

      doc.fillColor(colors.primary).fontSize(22).text(companyName, { align: 'center' });
      doc.moveDown(0.4);
      doc.fillColor('#111827').fontSize(18).text(destination, { align: 'center' });
      doc.moveDown(0.3);
      doc
        .fontSize(11)
        .fillColor('#374151')
        .text(
          `${formatDate(itinerary.from_date)} to ${formatDate(itinerary.to_date)}  |  ${itinerary.days || 0} Days / ${itinerary.nights || 0} Nights`,
          { align: 'center' }
        );
      doc.text(`${adults} Adult(s), ${children} Child(ren)`, { align: 'center' });
      doc.moveDown(1);

      doc.fillColor(colors.primary).fontSize(14).text('Day-wise Itinerary');
      doc.moveDown(0.5);

      const days = sortDays(itinerary);
      if (!days.length) {
        doc.fontSize(11).fillColor('#6b7280').text('Itinerary details will be shared separately.');
      }

      days.forEach((day) => {
        doc
          .fillColor(colors.secondary)
          .fontSize(12)
          .text(`Day ${day.day_number || '—'} — ${day.subject || day.destination || 'Plan'}`);
        if (day.date) {
          doc.fontSize(10).fillColor('#6b7280').text(formatDate(day.date));
        }
        if (day.description) {
          doc.moveDown(0.2);
          doc.fontSize(10).fillColor('#374151').text(String(day.description), { align: 'left' });
        }

        sortEvents(day).forEach((event) => {
          doc.moveDown(0.25);
          const time = event.event_time ? `${event.event_time} — ` : '';
          doc
            .fontSize(10)
            .fillColor('#111827')
            .text(`${time}${event.title || event.name || event.event_type || 'Activity'}`);
          if (event.description) {
            doc.fontSize(9).fillColor('#4b5563').text(String(event.description));
          }
        });

        doc.moveDown(0.8);
      });

      const pricing = itinerary.pricing || {};
      const grandTotal = pricing.grand_total ?? pricing.grandTotal ?? itinerary.budget;
      if (grandTotal != null && Number(grandTotal) > 0) {
        doc.fillColor(colors.primary).fontSize(12).text(`Estimated Total: ${formatMoney(grandTotal)}`);
        doc.moveDown(0.8);
      }

      if (Array.isArray(itinerary.inclusions) && itinerary.inclusions.length) {
        doc.fillColor(colors.primary).fontSize(12).text('Inclusions');
        itinerary.inclusions.forEach((row) => {
          doc.fontSize(10).fillColor('#374151').text(`• ${row.heading || row.description || 'Included item'}`);
        });
        doc.moveDown(0.6);
      }

      if (Array.isArray(itinerary.exclusions) && itinerary.exclusions.length) {
        doc.fillColor(colors.primary).fontSize(12).text('Exclusions');
        itinerary.exclusions.forEach((row) => {
          doc.fontSize(10).fillColor('#374151').text(`• ${row.heading || row.description || 'Excluded item'}`);
        });
        doc.moveDown(0.6);
      }

      doc.moveDown(1);
      doc
        .fontSize(10)
        .fillColor('#374151')
        .text(`Thank you for choosing ${companyName}.`, { align: 'center' });
      const contact = branding.company_phone || branding.company_email || '';
      if (contact) {
        doc.text(`Contact: ${contact}`, { align: 'center' });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });

const generateItineraryPdf = async ({ itinerary = {}, branding = {}, shareToken = null }) => {
  const token = shareToken || itinerary.share_token || null;
  let buffer = null;
  let source = 'fallback';

  if (token) {
    try {
      buffer = await generatePdfFromPreview(token);
      source = 'preview';
    } catch (error) {
      logger.warn('Preview-style PDF generation failed, using fallback PDF', {
        itineraryId: itinerary.id,
        message: error.message,
      });
    }
  }

  if (!buffer) {
    buffer = await generateItineraryPdfBuffer({ itinerary, branding });
    source = 'fallback';
  }

  const dir = ensurePdfDir();
  const fileName = buildPdfFileName(itinerary);
  const filePath = path.join(dir, fileName);
  fs.writeFileSync(filePath, buffer);

  return {
    buffer,
    fileName,
    filePath,
    relativePath: `/uploads/itineraries/${fileName}`,
    source,
  };
};

module.exports = {
  generateItineraryPdf,
  generateItineraryPdfBuffer,
  generatePdfFromPreview,
  buildPdfFileName,
  buildPreviewPdfUrl,
};
