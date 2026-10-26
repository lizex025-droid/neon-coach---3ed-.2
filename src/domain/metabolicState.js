import { normalizeWeights, dayNumber } from './metabolicEngine.js';

/** Merge date-keyed daily metadata with real logged intake. Unconfirmed days stay missing. */
export function metabolicInputs(state = {}, legacyWeights = []) {
  const meta = state.metabolicData || {};
  const byDate = new Map();
  for (const row of state.dailyHistory || []) byDate.set(row.date, { date: row.date, calories: row.calories, status: row.nutritionStatus || 'missing' });
  const mealTotals = new Map();
  for (const meal of state.loggedMeals || []) {
    if (dayNumber(meal.date) === null) continue;
    mealTotals.set(meal.date, (mealTotals.get(meal.date) || 0) + Math.max(0, Number(meal.calories) || 0));
  }
  for (const [date, calories] of mealTotals) byDate.set(date, { date, calories, status: byDate.get(date)?.status || 'missing' });
  for (const [date, record] of Object.entries(meta.nutritionDays || {})) {
    byDate.set(date, { ...byDate.get(date), ...record, date, calories: record.calories ?? byDate.get(date)?.calories ?? null });
  }
  const weights = normalizeWeights([...legacyWeights, ...(state.weightHistory || []), ...(meta.weights || [])]);
  return { weights, nutrition: [...byDate.values()], events: meta.events || [], previous: meta.estimate || null };
}

export function parseMetabolicCsv(text) {
  const lines = String(text).replace(/^\uFEFF/, '').trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2 || lines.length > 367) throw new Error('أدخل ملف CSV يحتوي على 1–365 يومًا.');
  const headers = lines.shift().toLowerCase().split(',').map(x => x.trim());
  if (!headers.includes('date')) throw new Error('الأعمدة: date,weight,calories,status');
  const rows = lines.map((line, i) => {
    const cells = line.split(',').map(x => x.trim());
    if (cells.length !== headers.length) throw new Error(`عدد الأعمدة غير صحيح بالسطر ${i + 2}`);
    const raw = Object.fromEntries(headers.map((h, j) => [h, cells[j]]));
    if (dayNumber(raw.date) === null) throw new Error(`تاريخ غير صالح بالسطر ${i + 2}`);
    const row = { date: raw.date };
    if (raw.weight) {
      const weight = Number(raw.weight);
      if (!(weight >= 20 && weight <= 500)) throw new Error(`الوزن بالكيلوغرام غير صالح بالسطر ${i + 2}`);
      row.weight = weight;
    }
    if (raw.calories !== undefined && raw.calories !== '') {
      const calories = Number(raw.calories), status = raw.status;
      if (!Number.isFinite(calories) || calories < 0 || calories > 15000 || !['complete','estimated','partial','missing','fasting'].includes(status) || (status === 'fasting' && calories !== 0) || (calories === 0 && ['complete','estimated'].includes(status))) throw new Error(`أكد calories وstatus بالسطر ${i + 2}`);
      row.calories = calories; row.status = status;
    }
    if (!row.weight && row.calories === undefined) throw new Error(`السطر ${i + 2} فارغ`);
    return row;
  });
  if (new Set(rows.map(r => r.date)).size !== rows.length) throw new Error('يوجد تاريخ مكرر داخل الملف.');
  return rows;
}
