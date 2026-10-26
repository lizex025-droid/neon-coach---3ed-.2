/**
 * NEON COACH - حسابات تقدير التكوين البدني ومنحنيات الوزن (Composition Estimate & Weight Tracking Domain)
 * مستخرج ومبني بدقة بناءً على نموذج Lyle McDonald الرياضي من gym.html
 */

export const WT_KEY = 'po_coach_weights';

export function wtDateKey(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function wtParseKey(key) {
  if (!key) return new Date();
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function photoFmtDate(key) {
  if (!key) return '';
  const d = wtParseKey(key);
  return `${MONTHS_EN[d.getMonth()]} ${d.getDate()}`;
}

export function estimate1RM(weight, reps) {
  const w = Number(weight) || 0;
  const r = Number(reps) || 0;
  if (r < 2) return w;
  return w * (1 + r / 30);
}

export function wtLoad(initialDefaultWeight = null) {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(WT_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length > 0) {
          return arr
            .filter(e => e && e.dateKey && !isNaN(Number(e.weight)))
            .map(e => ({ dateKey: e.dateKey, weight: Number(e.weight) }))
            .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
        }
      }
    }
  } catch {}

  // إذا لم تكن هناك سجلات سابقة ويوجد وزن افتراضي
  if (initialDefaultWeight && !isNaN(Number(initialDefaultWeight))) {
    const todayKey = wtDateKey(new Date());
    return [{ dateKey: todayKey, weight: Number(initialDefaultWeight) }];
  }

  return [];
}

export function wtSave(arr) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(WT_KEY, JSON.stringify(arr));
    }
  } catch {}
}

export function wtSaveEntry(entries, weight, date = new Date()) {
  const key = wtDateKey(date);
  const w = Number(weight);
  if (isNaN(w) || w <= 0) return entries;

  const copy = Array.isArray(entries) ? [...entries] : [];
  const existing = copy.find(e => e.dateKey === key);
  if (existing) {
    existing.weight = w;
  } else {
    copy.push({ dateKey: key, weight: w });
  }
  copy.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  wtSave(copy);
  return copy;
}

export function calculateStreak(entries, cursorDate = new Date()) {
  if (!Array.isArray(entries) || entries.length === 0) return 0;
  let streak = 0;
  const cursor = new Date(cursorDate);

  if (!entries.find(e => e.dateKey === wtDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (entries.find(e => e.dateKey === wtDateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function calculate7DayDelta(entries, units = 'kg') {
  if (!Array.isArray(entries) || entries.length < 2) return null;
  const last = entries[entries.length - 1];
  const lastDate = wtParseKey(last.dateKey);
  const cutoff = new Date(lastDate);
  cutoff.setDate(cutoff.getDate() - 7);

  const baseline = entries.find(e => wtParseKey(e.dateKey) >= cutoff) || entries[0];
  const diff = Math.round((last.weight - baseline.weight) * 10) / 10;
  if (Math.abs(diff) < 0.05) return null;

  const arrow = diff > 0 ? '▲' : '▼';
  const sign = diff > 0 ? '+' : '';
  const text = `${arrow} ${sign}${diff.toFixed(1)} ${units} · last 7d`;
  const cls = diff > 0 ? 'up' : 'down';
  return { diff, text, cls };
}

export function smoothSvgPath(points) {
  if (!points || !points.length) return '';
  if (points.length === 1) return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cx = (prev.x + curr.x) / 2;
    const cy = (prev.y + curr.y) / 2;
    d += ` Q ${cx.toFixed(2)} ${prev.y.toFixed(2)}, ${cx.toFixed(2)} ${cy.toFixed(2)}`;
    d += ` T ${curr.x.toFixed(2)} ${curr.y.toFixed(2)}`;
  }
  return d;
}

/**
 * حساب تقدير التكوين البدني (عضل vs دهون)
 * مع نسبة التغير وتقدير نسبة الزيادة والنقصان
 */
export function calculateCompositionEstimate({
  entries = [],
  workoutHistory = [],
  logs = {},
  units = 'kg',
  windowDays = 30,
  yearsTraining = 1
} = {}) {
  if (!Array.isArray(entries) || entries.length < 2) {
    return { visible: false };
  }

  const now = wtParseKey(entries[entries.length - 1].dateKey);
  const start = new Date(now);
  start.setDate(start.getDate() - windowDays);

  const startEntry = entries.find(e => wtParseKey(e.dateKey) >= start);
  const endEntry = entries[entries.length - 1];
  if (!startEntry || startEntry === endEntry) {
    return { visible: false };
  }

  const weightDelta = Math.round((endEntry.weight - startEntry.weight) * 10) / 10;
  const actualDays = Math.max(1, Math.round((wtParseKey(endEntry.dateKey) - wtParseKey(startEntry.dateKey)) / 86400000));
  const weeks = actualDays / 7;

  // فحص تغيرات القوة من سجلات التمارين
  const strengthRatios = [];
  const workoutDays = new Set();

  if (Array.isArray(workoutHistory) && workoutHistory.length > 0) {
    workoutHistory.forEach(sess => {
      const sessDate = sess.date ? new Date(sess.date) : (sess.dateKey ? wtParseKey(sess.dateKey) : null);
      if (sessDate && sessDate >= start) {
        workoutDays.add(sessDate.toISOString().slice(0, 10));
      }
    });
  }

  if (logs && typeof logs === 'object') {
    Object.keys(logs).forEach(exId => {
      const exLogs = (logs[exId] || []).slice();
      const inWin = exLogs.filter(l => new Date(l.date) >= start);
      const before = exLogs.filter(l => new Date(l.date) < start);

      inWin.forEach(l => {
        workoutDays.add((l.date || '').slice(0, 10));
      });

      if (inWin.length && before.length) {
        const avg = arr => arr.reduce((s, l) => s + estimate1RM(l.weight, l.reps), 0) / arr.length;
        const a = avg(before);
        const b = avg(inWin);
        if (a > 0) {
          strengthRatios.push(b / a);
        }
      }
    });
  }

  const strengthDelta = strengthRatios.length
    ? (strengthRatios.reduce((s, r) => s + r, 0) / strengthRatios.length) - 1
    : 0;

  // Scale weight and strength cannot identify fat/lean tissue mass. Do not fabricate kilograms.
  const hasStrengthData = strengthRatios.length > 0;
  return {
    visible: true, actualDays, weightDelta, strengthDelta,
    estMuscle: null, estFat: null, musclePct: 0, fatPct: 0,
    sessionsPerWeek: (workoutDays.size / actualDays) * 7,
    headlineCls: 'warn',
    headline: `${weightDelta > 0 ? '+' : ''}${weightDelta.toFixed(1)} ${units} · weight change`,
    footText: hasStrengthData
      ? `Strength ${strengthDelta >= 0 ? '+' : ''}${(strengthDelta * 100).toFixed(1)}%. Weight and strength do not measure fat or muscle change.`
      : 'Insufficient body composition data. Weight alone cannot separate fat, muscle and water.'
  };
}
