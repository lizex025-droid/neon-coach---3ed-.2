/**
 * NEON Metabolic Engine v1. Sources and limitations: docs/metabolic-engine.md.
 * Physiology equations are separate from conservative, unvalidated product guardrails.
 * Never infer intake completeness, fasting, tissue composition or measured RMR from a photo.
 */
import { calculateBMR, resolveActivityFactor } from '../utils/calorieEngine.js';

export const ENGINE_VERSION = 'neon-metabolic-1';
export const DAY_MS = 86400000;
export const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
export const finite = value => value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value));
const positive = value => finite(value) && Number(value) > 0;
const median = values => {
  const a = [...values].sort((a, b) => a - b), n = a.length;
  return n ? (a[Math.floor((n - 1) / 2)] + a[Math.ceil((n - 1) / 2)]) / 2 : 0;
};
export function dayNumber(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const t = Date.parse(date + 'T00:00:00Z');
  return Number.isFinite(t) && new Date(t).toISOString().slice(0, 10) === date ? t / DAY_MS : null;
}
export const dateFromDay = day => new Date(day * DAY_MS).toISOString().slice(0, 10);
export function normalizeWeights(entries = []) {
  const byDate = new Map();
  for (const e of entries) {
    const date = e.date || e.dateKey, raw = e.weightKg ?? e.weight;
    if (dayNumber(date) === null || !positive(raw)) continue;
    const weight = Number(raw) / (e.unit === 'lb' || e.units === 'lb' ? 2.2046226218 : 1);
    if (weight >= 20 && weight <= 500) byDate.set(date, { date, weight, day: dayNumber(date) });
  }
  return [...byDate.values()].sort((a, b) => a.day - b.day);
}

export function estimateRestingMetabolism(profile = {}) {
  const method = profile.rmrMethod || 'mifflin_st_jeor';
  const weight = Number(profile.currentWeight || profile.weight);
  const height = Number(profile.height || profile.heightCm), age = Number(profile.age);
  const sex = profile.gender || profile.sex;
  const validProfile = weight >= 20 && weight <= 500 && height >= 100 && height <= 250 && age >= 18 && age <= 100 && ['male','female','m','f','ذكر','أنثى','انثى'].includes(sex);
  const warnings = [];
  if (method === 'measured' && Number(profile.measuredRmr) >= 500 && Number(profile.measuredRmr) <= 6000 && dayNumber(profile.rmrMeasuredAt) !== null) {
    return { rmr: Number(profile.measuredRmr), method: 'indirect_calorimetry', measured: true, valid: validProfile, measuredAt: profile.rmrMeasuredAt, warnings };
  }
  const ffm = Number(profile.fatFreeMassKg);
  const trustedFfm = ffm > 0 && ffm < weight && profile.ffmReliable === true && ['dexa','bodpod','bia','clinical'].includes(profile.ffmSource) && dayNumber(profile.ffmMeasuredAt) !== null;
  if (method === 'cunningham' && trustedFfm) return { rmr: 500 + 22 * ffm, method, measured: false, valid: validProfile, warnings };
  if (method !== 'mifflin_st_jeor') warnings.push('RMR_METHOD_FALLBACK');
  return { rmr: validProfile ? calculateBMR(weight, height, age, sex) : null, method: 'mifflin_st_jeor', measured: false, valid: validProfile, warnings };
}

export function estimateInitialExpenditure(profile = {}) {
  const resting = estimateRestingMetabolism(profile);
  if (!resting.valid || !resting.rmr) return { ...resting, tdee: null, source: 'missing_profile' };
  if (Number(profile.knownTdee) >= 500 && Number(profile.knownTdee) <= 10000) return { ...resting, tdee: Number(profile.knownTdee), source: 'user_estimate' };
  let pal = resolveActivityFactor(profile.activityLevel || 'moderate');
  // Optional component estimate. Step and occupational activity overlap: take max, not sum.
  // Legacy PAL already includes training. Only the component mode adds incremental exercise.
  if (profile.activityModel === 'components') {
    const steps = Math.max(0, Number(profile.dailySteps) || 0);
    const stepPal = steps < 3000 ? 1.2 : steps < 6000 ? 1.3 : steps < 9000 ? 1.4 : steps < 12000 ? 1.5 : 1.6;
    const jobPal = { seated: 1.2, standing: 1.3, moving: 1.5, physical: 1.7 }[profile.jobActivity] || 1.2;
    const met = { resistance: 3.5, cardio: 6, mixed: 4.5 }[profile.exerciseType] || 3.5;
    const sessions = clamp(Number(profile.workoutDaysCount) || 0, 0, 7);
    const minutes = clamp(Number(profile.sessionDurationMin) || 0, 0, 180);
    const incrementalExercise = (met - 1) * Number(profile.currentWeight || profile.weight) * (minutes / 60) * sessions / 7;
    pal = clamp(Math.max(stepPal, jobPal) + incrementalExercise / resting.rmr, 1.2, 2.4);
  }
  return { ...resting, pal, tdee: resting.rmr * pal, source: 'activity_estimate' };
}

function robustLine(points) {
  if (points.length < 2) return { slope: 0, intercept: points[0]?.weight || 0 };
  const origin = points[0].day, slopes = [];
  for (let i = 0; i < points.length; i++) for (let j = i + 1; j < points.length; j++) {
    if (points[j].day !== points[i].day) slopes.push((points[j].weight - points[i].weight) / (points[j].day - points[i].day));
  }
  const slope = median(slopes);
  return { slope, intercept: median(points.map(p => p.weight - slope * (p.day - origin))), origin };
}
export function calculateWeightTrend(entries = [], { endDate, windowDays = 28, timeConstantDays = 7 } = {}) {
  const all = normalizeWeights(entries);
  const end = dayNumber(endDate) ?? all.at(-1)?.day;
  const points = all.filter(p => p.day <= end && p.day >= end - windowDays);
  if (!points.length) return { points: [], observations: [], slopeKgPerDay: null, weeklyChangeKg: null, outliers: 0 };
  const line = robustLine(points);
  const residuals = points.map(p => Math.abs(p.weight - line.intercept - line.slope * (p.day - (line.origin ?? p.day))));
  const cutoff = Math.max(1.5, 6 * median(residuals));
  const clean = points.filter((_, i) => residuals[i] <= cutoff);
  const fit = robustLine(clean);
  let trend = clean[0]?.weight, previousDay = clean[0]?.day;
  const smoothed = clean.map(p => {
    const alpha = 1 - Math.exp(-(p.day - previousDay) / timeConstantDays);
    trend = alpha * p.weight + (1 - alpha) * trend;
    previousDay = p.day;
    return { ...p, trend };
  });
  // Regression uses robust observed weights, avoiding EWMA phase-lag in energy estimation.
  return { points: smoothed, observations: clean, slopeKgPerDay: clean.length >= 2 ? fit.slope : null,
    weeklyChangeKg: clean.length >= 2 ? fit.slope * 7 : null, outliers: points.length - clean.length,
    trendWeight: clean.length ? fit.intercept + fit.slope * (clean.at(-1).day - (fit.origin ?? clean[0].day)) : null };
}

export function tissueEnergyDensity(profile = {}, weight) {
  const ffm = Number(profile.fatFreeMassKg);
  const bf = Number(profile.bodyFatPercent);
  const fatMass = profile.ffmReliable && ffm > 0 && ffm < weight ? weight - ffm : bf > 3 && bf < 65 ? weight * bf / 100 : null;
  // Hall/Forbes dL/dF = 10.4/F; rho_F=39.5 MJ/kg; rho_L=7.6 MJ/kg.
  // This models tissue energy, NOT daily water/glycogen or a measurement of lost fat.
  if (!fatMass) return { kcalPerKg: 7700, model: 'fixed_approximation', fatMass: null };
  const alpha = 10.4 / fatMass;
  return { kcalPerKg: (39500 + alpha * 7600) / ((1 + alpha) * 4.184), model: 'hall_forbes_tissue_approximation', fatMass };
}

export function estimateAdaptiveExpenditure({ profile = {}, weights = [], nutrition = [], events = [], previous = null, endDate } = {}) {
  const initial = estimateInitialExpenditure(profile);
  const end = dayNumber(endDate);
  const previousTdee = positive(previous?.tdee) ? Number(previous.tdee) : initial.tdee;
  const base = { version: ENGINE_VERSION, tdee: previousTdee, initialTdee: initial.tdee, rmr: initial.rmr, rmrMethod: initial.method,
    status: previous?.lastUpdatedDate ? 'holding' : 'initial', reasons: [], lastUpdatedDate: previous?.lastUpdatedDate || null,
    calibrated: Boolean(previous?.calibrated), endDate, quality: {}, trend: calculateWeightTrend(weights, { endDate }) };
  const hold = reason => ({ ...base, reasons: [reason] });
  if (!initial.valid || !initial.tdee || end === null) return hold('PROFILE_REQUIRED');
  if (profile.pregnant || profile.breastfeeding || Number(profile.age) < 18) return hold('OUTSIDE_MODEL_POPULATION');
  const daily = new Map();
  for (const r of nutrition) if (dayNumber(r.date) !== null) daily.set(r.date, r);
  // Require every day's intake for the selected weight-change interval. No silent zero/imputation.
  let start = end;
  while (start > end - 28) {
    const row = daily.get(dateFromDay(start - 1));
    if (!row || !['complete','estimated','fasting'].includes(row.status) || !finite(row.calories) || Number(row.calories) < 0 || Number(row.calories) > 15000 || (row.status !== 'fasting' && Number(row.calories) === 0) || (row.status === 'fasting' && Number(row.calories) !== 0)) break;
    start--;
  }
  base.quality.completeDays = end - start;
  if (end - start < 21) return hold('NEED_21_CONSECUTIVE_COMPLETE_DAYS');
  const trend = calculateWeightTrend(weights, { endDate, windowDays: end - start });
  const obs = trend.observations;
  base.trend = trend;
  base.quality.weighIns = obs.length;
  if (obs.length < 6 || obs[0].day > start + 2 || obs.at(-1).day < end - 3 || obs.at(-1).day - obs[0].day < 18) return hold('INSUFFICIENT_WEIGHT_COVERAGE');
  if (obs.some((p, i) => i > 0 && p.day - obs[i - 1].day > 7)) return hold('WEIGHT_GAP');
  if (events.some(e => dayNumber(e.date) !== null && dayNumber(e.date) <= end && dayNumber(e.date) >= end - 14)) return hold('RECENT_WATER_TRANSITION');
  if (obs.some((p, i) => i > 0 && p.day >= end - 14 && p.day - obs[i - 1].day <= 3 && Math.abs(p.weight / obs[i - 1].weight - 1) > 0.02)) return hold('ABRUPT_WEIGHT_CHANGE');
  if (Math.abs(trend.weeklyChangeKg) / trend.trendWeight > 0.025) return hold('RAPID_WEIGHT_CHANGE');
  // Align food interval exactly with the days bounded by the weight observations.
  const first = obs[0].day, last = obs.at(-1).day;
  const rows = Array.from({ length: last - first }, (_, i) => daily.get(dateFromDay(first + i)));
  if (rows.some(r => !r || !['complete','estimated','fasting'].includes(r.status))) return hold('INCOMPLETE_ALIGNED_INTERVAL');
  const meanIntake = rows.reduce((s, r) => s + Number(r.calories), 0) / rows.length;
  const density = tissueEnergyDensity(profile, trend.trendWeight);
  const candidateTdee = meanIntake - trend.slopeKgPerDay * density.kcalPerKg;
  base.quality.estimatedDays = rows.filter(r => r.status === 'estimated').length;
  base.meanIntake = meanIntake;
  base.candidateTdee = candidateTdee;
  base.energyModel = density.model;
  if (candidateTdee < 500 || candidateTdee > 10000) return hold('IMPLAUSIBLE_ENERGY_BALANCE');
  // Repeated rendering or same-day check-ins must never compound the correction.
  if (previous?.lastUpdatedDate && end - dayNumber(previous.lastUpdatedDate) < 7) return { ...base, status: previous.status || 'calibrating', reasons: ['NEXT_WEEKLY_UPDATE_PENDING'] };
  const limit = Math.min(150, previousTdee * 0.05);
  const correction = clamp((candidateTdee - previousTdee) * 0.35, -limit, limit);
  const stable = density.fatMass && end - start === 28 && obs.length >= 12 && base.quality.estimatedDays <= 3 && Math.abs(candidateTdee - previousTdee) < previousTdee * 0.1;
  return { ...base, tdee: previousTdee + correction, status: stable ? 'stable' : 'calibrating', reasons: [], calibrated: true,
    lastUpdatedDate: endDate, correction, interval: { startDate: dateFromDay(first), endDate: dateFromDay(last) } };
}

export function allocateMacros(calories, profile = {}) {
  const target = Math.max(0, Math.round(Number(calories) || 0));
  const weight = Number(profile.currentWeight || profile.weight) || 75;
  const preference = profile.proteinPreference || 'moderate';
  const diet = profile.macroStyle || 'standard';
  const bf = Number(profile.bodyFatPercent), ffm = Number(profile.fatFreeMassKg);
  const lean = profile.ffmReliable && ffm > 0 && ffm < weight ? ffm : bf > 3 && bf < 65 ? weight * (1 - bf / 100) : null;
  const factor = { low: 1.6, moderate: 2, high: 2.2 }[preference] || 2;
  const leanFactor = { low: 2, moderate: 2.3, high: 2.7 }[preference] || 2.3;
  const idealProtein = Math.round(positive(profile.proteinGrams) ? Number(profile.proteinGrams) : lean && (profile.ffmReliable || bf >= 35) ? lean * leanFactor : weight * factor);
  let protein = idealProtein;
  let remaining = target - protein * 4;
  const warnings = [];
  if (remaining < 180) { protein = Math.max(0, Math.floor((target - 180) / 4)); remaining = target - protein * 4; warnings.push('MACRO_BUDGET_INFEASIBLE'); }
  const ratio = { standard: 1 / 3, balanced: 0.5, low_fat: 0.25, low_carb: 0.65 }[diet] ?? 0.5;
  const carbLimit = clamp(Number(profile.ketoCarbs) || 30, 10, 50);
  const rawFat = diet === 'keto' ? Math.max(0, (remaining - carbLimit * 4) / 9) : remaining * ratio / 9;
  // Integer display with exact 4/4/9 target for generated plans; food-label calories remain independent.
  const fats = Array.from({ length: Math.floor(remaining / 9) + 1 }, (_, f) => f)
    .filter(f => (remaining - 9 * f) % 4 === 0 && (diet !== 'keto' || f >= rawFat))
    .reduce((best, f) => Math.abs(f - rawFat) < Math.abs(best - rawFat) ? f : best, 0);
  const carbs = Math.max(0, Math.floor((remaining - fats * 9) / 4));
  return { protein, carbs, fats, idealProtein, macroStyle: diet, warnings, feasible: warnings.length === 0, macroCalories: protein * 4 + carbs * 4 + fats * 9 };
}

export function distributeWeeklyCalories(dailyAverage, { trainingDays = [], shift = 0, floor = 0 } = {}) {
  const weekly = Math.round(Number(dailyAverage) * 7);
  if (!Number.isFinite(weekly) || weekly < 0 || weekly < 7 * floor) throw new Error('WEEKLY_BUDGET_BELOW_FLOOR');
  const train = new Set(trainingDays.map(Number).filter(d => Number.isInteger(d) && d >= 0 && d < 7));
  const amount = clamp(Number(shift) || 0, 0, 500);
  const values = Array.from({ length: 7 }, (_, i) => Math.max(floor, dailyAverage + (train.size && train.size < 7 ? train.has(i) ? amount : -amount * train.size / (7 - train.size) : 0)));
  // Project onto a floor-constrained weekly budget, then distribute rounding residual exactly.
  let excess = values.reduce((s, v) => s + v, 0) - weekly;
  while (excess > 1e-7) {
    const free = values.map((v, i) => v > floor + 1e-7 ? i : -1).filter(i => i >= 0);
    if (!free.length) break;
    const step = Math.min(excess / free.length, ...free.map(i => values[i] - floor));
    free.forEach(i => { values[i] -= step; });
    excess -= step * free.length;
  }
  const rounded = values.map(Math.floor);
  const order = values.map((v, i) => ({ i, fraction: v - rounded[i] })).sort((a, b) => b.fraction - a.fraction);
  let remainder = weekly - rounded.reduce((s, v) => s + v, 0);
  for (let j = 0; remainder > 0; j++, remainder--) rounded[order[j % 7].i]++;
  return rounded;
}

/** Hall 2011 appendix equations 11-15: linearized, post-water-transition, modest-change model.
 * NOT the full NIH simulator. No predictions beyond 10% body-weight change or for acute water shifts.
 */
export function projectWeight({ profile = {}, tdee, intake, days = 90 } = {}) {
  const weight = Number(profile.currentWeight || profile.weight), r = estimateRestingMetabolism(profile);
  const density = tissueEnergyDensity(profile, weight);
  if (!r.valid || !density.fatMass || !positive(tdee) || !positive(intake)) return null;
  const alpha = 10.4 / density.fatMass, beta = 0.24;
  const delta = Math.max(0, (0.9 * tdee - r.rmr) / weight); // kcal/kg/day, appendix eq.8 generalized to supplied TDEE.
  const rho = (750 + 39500 + alpha * (960 + 7600)) / ((1 - beta) * (1 + alpha) * 4.184);
  const epsilon = ((13 + alpha * 92) / ((1 + alpha) * 4.184) + delta) / (1 - beta);
  const points = [];
  for (let day = 0; day <= clamp(days, 0, 365); day++) {
    const change = (intake - tdee) / epsilon * (1 - Math.exp(-day * epsilon / rho));
    if (Math.abs(change) > weight * 0.1) break;
    points.push({ day, weight: weight + change });
  }
  return { model: 'hall_2011_linearized', points, excludesEarlyWaterChanges: true, maxRelativeChange: 0.1 };
}
