import { normalizeText } from '../entities.js';

export function getLocalDate(timezone = 'Asia/Amman', offsetDays = 0) {
  try {
    const now = new Date();
    if (offsetDays !== 0) {
      now.setDate(now.getDate() + offsetDays);
    }
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(now); // Returns YYYY-MM-DD
  } catch (_) {
    const d = new Date();
    if (offsetDays !== 0) d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  }
}

export async function normalizeInputNode(state) {
  if (state.isIdempotentReplay || state.errors?.length > 0) return {};

  const raw = state.originalText || '';
  const normalized = normalizeText(raw);
  const tz = state.timezone || 'Asia/Amman';

  let offsetDays = 0;
  if (/(?:مبارح|امس|البارحه|البارحة|yesterday)/i.test(normalized)) {
    offsetDays = -1;
  }

  const currentDate = getLocalDate(tz, offsetDays);

  return {
    normalizedText: normalized,
    clientState: {
      ...(state.clientState || {}),
      currentDate
    }
  };
}
