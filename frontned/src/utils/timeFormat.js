import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const PARSE_FORMATS = ['h:mm A', 'hh:mm A', 'H:mm', 'HH:mm', 'h:mm a', 'hh:mm a'];

/** Normalize time values to display format like "10:00 AM" / "5:00 PM" */
export function toAmPmTime(value) {
  if (!value) return '';
  const parsed = dayjs(String(value).trim(), PARSE_FORMATS, true);
  return parsed.isValid() ? parsed.format('h:mm A') : String(value);
}

/** Convert display/API time to 24-hour "HH:mm" for datetime payloads */
export function to24HourTime(value, fallback = '09:00') {
  if (!value) return fallback;
  const parsed = dayjs(String(value).trim(), PARSE_FORMATS, true);
  return parsed.isValid() ? parsed.format('HH:mm') : fallback;
}

export function timeToMinutes(value) {
  if (!value) return Number.MAX_SAFE_INTEGER;
  const parsed = dayjs(String(value).trim(), PARSE_FORMATS, true);
  if (!parsed.isValid()) return Number.MAX_SAFE_INTEGER;
  return parsed.hour() * 60 + parsed.minute();
}
