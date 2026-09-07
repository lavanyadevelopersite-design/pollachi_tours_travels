require('dotenv').config();
const { sequelize, Itinerary } = require('../src/models');

const parseJsonField = (value, fallback = null) => {
  if (value == null || value === '') return fallback;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return fallback;
  try {
    let parsed = JSON.parse(value);
    if (typeof parsed === 'string') {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        /* keep */
      }
    }
    return parsed;
  } catch {
    return fallback;
  }
};

const normalizePricing = (value) => {
  const parsed = parseJsonField(value, null);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
  const lineItems = Array.isArray(parsed.line_items) ? parsed.line_items : null;
  if (parsed['0'] != null && !lineItems) return null;
  return {
    gst_mode: parsed.gst_mode || 'gst_on_total',
    base_markup_percent: Number(parsed.base_markup_percent) || 0,
    extra_markup: Number(parsed.extra_markup) || 0,
    cgst_percent: Number(parsed.cgst_percent) || 0,
    sgst_percent: Number(parsed.sgst_percent) || 0,
    igst_percent: Number(parsed.igst_percent) || 0,
    tcs_percent: Number(parsed.tcs_percent) || 0,
    discount: Number(parsed.discount) || 0,
    line_items: lineItems || [],
  };
};

(async () => {
  await sequelize.authenticate();
  const rows = await Itinerary.findAll({ attributes: ['id', 'title', 'pricing'] });
  let fixed = 0;
  for (const row of rows) {
    const before = row.pricing;
    const clean = normalizePricing(before);
    if (!clean) {
      if (before != null) {
        await row.update({ pricing: null });
        console.log('cleared', row.title, row.id);
        fixed += 1;
      }
      continue;
    }
    const beforeKeys = before && typeof before === 'object' ? Object.keys(before).length : 0;
    if (beforeKeys > 20 || typeof before === 'string') {
      await row.update({ pricing: clean });
      console.log(
        'repaired',
        row.title,
        'line_items=',
        clean.line_items.length,
        'sample_net=',
        clean.line_items[0]?.net
      );
      fixed += 1;
    }
  }
  console.log('DONE fixed=', fixed);
  await sequelize.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
