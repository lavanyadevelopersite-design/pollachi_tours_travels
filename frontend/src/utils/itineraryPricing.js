import { getEventTypeMeta } from '../components/itinerary/EventCard';
import { toAmPmTime } from './timeFormat';
import dayjs from 'dayjs';

export const defaultPricing = () => ({
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

/**
 * Normalize pricing from API (object or JSON string).
 * Prevents spreading a string into state which wipes line_items.
 */
export const coercePricing = (raw) => {
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
  // Pure corruption with no salvageable line items
  if (value['0'] != null && !lineItems.length && value.line_items === undefined) {
    return defaultPricing();
  }

  // Return only known pricing fields (strip character-key corruption)
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

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const round2 = (n) => Math.round((toNum(n) + Number.EPSILON) * 100) / 100;

export const calcLineGross = (net, markupPercent) => {
  const n = toNum(net);
  const m = toNum(markupPercent);
  return round2(n + (n * m) / 100);
};

/** Build / merge line items from itinerary events. */
export const syncLineItemsFromEvents = (days = [], existingItems = []) => {
  const byKey = new Map((existingItems || []).map((item) => [item.key, item]));
  const next = [];

  [...days]
    .sort((a, b) => (a.day_number || 0) - (b.day_number || 0))
    .forEach((day) => {
      const events = [...(day.events || [])].sort(
        (a, b) => (a.display_order || 0) - (b.display_order || 0)
      );
      events.forEach((event) => {
        const key = `event:${event.id}`;
        const prev = byKey.get(key);
        const { label } = getEventTypeMeta(event.event_type);
        const timeLabel = event.event_time ? toAmPmTime(event.event_time) : '';
        const dateLabel = day.date ? dayjs(day.date).format('DD-MM-YYYY') : `Day ${day.day_number}`;
        const option = [dateLabel, timeLabel].filter(Boolean).join(' · ');
        const net = toNum(prev?.net);
        const markup_percent = toNum(prev?.markup_percent);
        next.push({
          key,
          event_id: event.id,
          day_number: day.day_number,
          item: event.name || label,
          option,
          type: label,
          event_type: event.event_type,
          net,
          markup_percent,
          gross: calcLineGross(net, markup_percent),
        });
      });
    });

  return next;
};

/** Keep manual line items when there is no itinerary day/event list. */
export const resolveLineItems = (days = [], existingItems = []) => {
  if (!Array.isArray(days) || days.length === 0) return existingItems || [];
  return syncLineItemsFromEvents(days, existingItems);
};

export const summarizePricing = (pricing = {}) => {
  const p = coercePricing(pricing);
  const items = Array.isArray(p.line_items) ? p.line_items : [];
  const subtotalNet = round2(items.reduce((sum, i) => sum + toNum(i.net), 0));
  const subtotalGross = round2(
    items.reduce((sum, i) => sum + calcLineGross(i.net, i.markup_percent), 0)
  );
  const baseMarkupAmount = round2((subtotalNet * toNum(p.base_markup_percent)) / 100);
  const extraMarkup = toNum(p.extra_markup);
  const taxable = round2(subtotalGross + baseMarkupAmount + extraMarkup);
  const cgst = round2((taxable * toNum(p.cgst_percent)) / 100);
  const sgst = round2((taxable * toNum(p.sgst_percent)) / 100);
  const igst = round2((taxable * toNum(p.igst_percent)) / 100);
  const tcs = round2((taxable * toNum(p.tcs_percent)) / 100);
  const discount = toNum(p.discount);
  const taxTotal = round2(cgst + sgst + igst + tcs);
  const grandTotal = round2(Math.max(taxable + taxTotal - discount, 0));

  return {
    subtotalNet,
    subtotalGross,
    baseMarkupAmount,
    extraMarkup,
    taxable,
    cgst,
    sgst,
    igst,
    tcs,
    discount,
    taxTotal,
    grandTotal,
  };
};

export const formatInr = (value) =>
  `₹ ${round2(value).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
