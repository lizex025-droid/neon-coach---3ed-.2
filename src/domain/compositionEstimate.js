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

  const sessionsPerWeek = (workoutDays.size / actualDays) * 7;
  const frequencyFactor = Math.max(0.4, Math.min(1.2, sessionsPerWeek / 4));

  // معدل بناء العضلات الأقصى في الأسبوع بحسب نموذج Lyle McDonald
  let maxMuscleKgPerWeek;
  if (yearsTraining <= 1) maxMuscleKgPerWeek = 0.45;
  else if (yearsTraining === 2) maxMuscleKgPerWeek = 0.23;
  else maxMuscleKgPerWeek = 0.11;

  const unitConv = (units === 'lb') ? 2.20462 : 1;
  const maxMusclePerWeek = maxMuscleKgPerWeek * unitConv;

  const strengthBoost = Math.max(0.5, Math.min(1.5, 1 + strengthDelta * 4));
  let estMuscle = maxMusclePerWeek * weeks * strengthBoost * frequencyFactor;
  let estFat = 0;
  let headlineCls = '';
  let headline = '';

  if (weightDelta > 0) {
    estMuscle = Math.min(estMuscle, weightDelta);
    estFat = Math.max(0, weightDelta - estMuscle);
    const musclePct = estMuscle / weightDelta;
    if (musclePct >= 0.6 && strengthDelta > 0) {
      headlineCls = 'good';
      headline = `+${weightDelta.toFixed(1)} ${units} - mostly muscle, strength up.`;
    } else if (musclePct >= 0.35) {
      headlineCls = 'warn';
      headline = `+${weightDelta.toFixed(1)} ${units} - mixed. Tighten kcal or push lifts harder.`;
    } else {
      headlineCls = 'bad';
      headline = `+${weightDelta.toFixed(1)} ${units} - mostly fat. Strength flat. Cut kcal.`;
    }
  } else {
    const wDown = Math.abs(weightDelta);
    if (strengthDelta >= 0) {
      estMuscle = Math.min(maxMusclePerWeek * weeks * 0.3, 0.5);
      estFat = wDown + estMuscle;
      headlineCls = 'good';
      headline = `-${wDown.toFixed(1)} ${units} - strength holding, fat dropping.`;
    } else {
      const lossPct = Math.min(0.4, Math.abs(strengthDelta) * 2);
      estMuscle = -wDown * lossPct;
      estFat = -(wDown + estMuscle);
      headlineCls = 'warn';
      headline = `-${wDown.toFixed(1)} ${units} - strength slipping. You may be losing muscle.`;
    }
  }

  const totalAbs = Math.abs(estMuscle) + Math.abs(estFat) || 1;
  const musclePct = Math.min(100, Math.max(0, (Math.abs(estMuscle) / totalAbs) * 100));
  const fatPct = Math.min(100, Math.max(0, (Math.abs(estFat) / totalAbs) * 100));

  const sd = strengthDelta * 100;
  const sdStr = (sd >= 0 ? '+' : '') + sd.toFixed(1) + '%';
  const muscleSign = estMuscle >= 0 ? '+' : '';
  const fatSign = estFat >= 0 ? '+' : '';
  const freqStr = `${sessionsPerWeek.toFixed(1)} sessions/wk`;
  const liftStr = strengthRatios.length ? '' : ' (no lift data)';

  const footText = `~${muscleSign}${estMuscle.toFixed(1)} ${units} muscle · ~${fatSign}${estFat.toFixed(1)} ${units} fat · strength ${sdStr} · ${freqStr}${liftStr}`;

  return {
    visible: true,
    actualDays,
    weightDelta,
    estMuscle,
    estFat,
    strengthDelta,
    sessionsPerWeek,
    headline,
    headlineCls,
    musclePct,
    fatPct,
    footText
  };
}
