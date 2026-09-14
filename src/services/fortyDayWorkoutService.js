import { FORTY_DAY_DAYS, getFortyDay, fortyDayExerciseId } from '../data/fortyDayWorkout.js';
import { store } from '../state/store.js';

const STATE_KEY = 'neon_forty_day_workout_v2';
const LEGACY_SESSION_KEY = 'fortyDay_active_workout_v1';
const LEGACY_HISTORY_KEY = 'fortyDay_workout_history_v1';

const readJson = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const blankSet = (weight = '', reps = '') => ({ kg: weight, reps, done: false });
const targetReps = value => String(value || '').match(/\d+/)?.[0] || '';
const clampNumber = (value, min, max, integer = false) => {
  if (value === '' || value == null) return '';
  const number = Number(value);
  if (!Number.isFinite(number)) return '';
  const safe = Math.max(min, Math.min(max, number));
  return integer ? Math.floor(safe) : safe;
};

function defaultState() {
  return {
    activeDay: 'pushA',
    programStartedAt: null,
    session: null,
    restUntil: null,
    restDuration: 0,
    trackers: {},
    history: []
  };
}

function normalizeTracker(raw, exercise) {
  const count = Math.max(1, Number(raw?.targetSets) || Number(exercise.sets) || 3);
  const weight = clampNumber(raw?.weight ?? '', 0, 1000);
  const reps = targetReps(raw?.targetReps || exercise.reps);
  const sets = Array.isArray(raw?.sets) ? raw.sets.slice(0, 12).map(set => ({
    kg: clampNumber(set.kg, 0, 1000),
    reps: clampNumber(set.reps, 0, 1000, true),
    done: Boolean(set.done)
  })) : [];
  while (sets.length < count) sets.push(blankSet(weight, reps));
  return {
    sets,
    targetSets: count,
    targetReps: raw?.targetReps || exercise.reps || '',
    rest: clampNumber(raw?.rest || 150, 0, 600, true) || 150,
    weight,
    history: Array.isArray(raw?.history) ? raw.history.slice(-100) : []
  };
}

class FortyDayWorkoutService {
  constructor() { this.state = null; }

  load() {
    if (this.state) return this.state;
    const saved = readJson(STATE_KEY, defaultState());
    this.state = { ...defaultState(), ...saved, trackers: saved?.trackers || {}, history: Array.isArray(saved?.history) ? saved.history : [] };
    if (!this.state.session) {
      const legacy = readJson(LEGACY_SESSION_KEY, null);
      if (legacy?.startedAt) this.state.session = { startedAt: Number(legacy.startedAt), dayKey: this.state.activeDay, touchedExerciseIds: Object.keys(legacy.exerciseRecords || {}) };
    }
    return this.state;
  }

  save() {
    localStorage.setItem(STATE_KEY, JSON.stringify(this.load()));
  }

  getSnapshot() { return structuredClone(this.load()); }

  setActiveDay(dayKey) {
    if (!FORTY_DAY_DAYS.some(day => day.key === dayKey)) return;
    this.load().activeDay = dayKey;
    this.save();
  }

  getTracker(dayKey, exerciseIndex) {
    const exercise = getFortyDay(dayKey).exercises[exerciseIndex];
    if (!exercise) return null;
    const id = fortyDayExerciseId(dayKey, exerciseIndex);
    if (!this.load().trackers[id]) {
      const legacy = readJson(`exercise_tracker_${id}`, null);
      this.load().trackers[id] = normalizeTracker(legacy, exercise);
      this.save();
    } else {
      this.load().trackers[id] = normalizeTracker(this.load().trackers[id], exercise);
    }
    return this.load().trackers[id];
  }

  startWorkout(dayKey = this.load().activeDay) {
    const state = this.load();
    if (!state.programStartedAt) state.programStartedAt = Date.now();
    if (!state.session) state.session = { startedAt: Date.now(), dayKey, touchedExerciseIds: [] };
    this.save();
    store.startWorkoutSession();
    return state.session;
  }

  updateSet(dayKey, exerciseIndex, setIndex, field, value) {
    const tracker = this.getTracker(dayKey, exerciseIndex);
    if (!tracker?.sets[setIndex] || !['kg', 'reps'].includes(field)) return;
    tracker.sets[setIndex][field] = clampNumber(value, 0, 1000, field === 'reps');
    this.markTouched(dayKey, exerciseIndex);
    this.save();
  }

  toggleSet(dayKey, exerciseIndex, setIndex) {
    const tracker = this.getTracker(dayKey, exerciseIndex);
    if (!tracker?.sets[setIndex]) return null;
    this.startWorkout(dayKey);
    tracker.sets[setIndex].done = !tracker.sets[setIndex].done;
    this.markTouched(dayKey, exerciseIndex);
    if (tracker.sets[setIndex].done && tracker.rest > 0) {
      this.load().restDuration = tracker.rest;
      this.load().restUntil = Date.now() + tracker.rest * 1000;
    }
    this.save();
    return tracker.sets[setIndex].done;
  }

  markTouched(dayKey, exerciseIndex) {
    const state = this.load();
    if (!state.session) state.session = { startedAt: Date.now(), dayKey, touchedExerciseIds: [] };
    const id = fortyDayExerciseId(dayKey, exerciseIndex);
    if (!state.session.touchedExerciseIds.includes(id)) state.session.touchedExerciseIds.push(id);
  }

  addSet(dayKey, exerciseIndex) {
    const tracker = this.getTracker(dayKey, exerciseIndex);
    if (!tracker || tracker.sets.length >= 12) return;
    const last = tracker.sets.at(-1) || blankSet(tracker.weight, targetReps(tracker.targetReps));
    tracker.sets.push(blankSet(last.kg, last.reps));
    tracker.targetSets = tracker.sets.length;
    this.save();
  }

  resetExercise(dayKey, exerciseIndex) {
    const exercise = getFortyDay(dayKey).exercises[exerciseIndex];
    if (!exercise) return;
    const tracker = this.getTracker(dayKey, exerciseIndex);
    this.load().trackers[fortyDayExerciseId(dayKey, exerciseIndex)] = normalizeTracker({ history: tracker.history }, exercise);
    this.save();
  }

  tuneExercise(dayKey, exerciseIndex, settings) {
    const tracker = this.getTracker(dayKey, exerciseIndex);
    if (!tracker) return;
    const count = clampNumber(settings.targetSets, 1, 8, true) || tracker.targetSets;
    const weight = clampNumber(settings.weight, 0, 1000);
    const reps = targetReps(settings.targetReps);
    tracker.targetSets = count;
    tracker.targetReps = String(settings.targetReps || '');
    tracker.rest = clampNumber(settings.rest, 0, 600, true);
    tracker.weight = weight;
    tracker.sets = Array.from({ length: count }, (_, index) => {
      const existing = tracker.sets[index];
      return {
        kg: existing && existing.kg !== '' ? existing.kg : weight,
        reps: existing && existing.reps !== '' ? existing.reps : reps,
        done: existing?.done || false
      };
    });
    this.save();
  }

  adjustRest(seconds) {
    const state = this.load();
    if (!state.restUntil) return;
    state.restUntil = Math.max(Date.now(), state.restUntil + seconds * 1000);
    this.save();
  }

  skipRest() { this.load().restUntil = null; this.load().restDuration = 0; this.save(); }

  finishWorkout() {
    const state = this.load();
    const session = state.session;
    if (!session) return null;
    const finishedAt = Date.now();
    const exercises = [];
    let totalSets = 0, totalReps = 0, totalVolume = 0, personalRecords = 0;
    for (const id of session.touchedExerciseIds || []) {
      const match = id.match(/^fortyDay_(.+)_(\d+)$/);
      if (!match) continue;
      const dayKey = match[1];
      const exerciseIndex = Number(match[2]);
      const exercise = getFortyDay(dayKey).exercises[exerciseIndex];
      const tracker = state.trackers[id];
      if (!exercise || !tracker) continue;
      const played = tracker.sets.filter(set => set.done && (set.kg !== '' || set.reps !== ''));
      if (!played.length) continue;
      const best = played.reduce((winner, set) => Number(set.kg || 0) > Number(winner.kg || 0) ? set : winner, played[0]);
      const volume = played.reduce((sum, set) => sum + Number(set.kg || 0) * Number(set.reps || 0), 0);
      const previousBest = Math.max(0, ...(tracker.history || []).map(row => Number(row.bestKg || row.weight || 0)));
      const isPersonalRecord = Boolean(Number(best.kg || 0) && previousBest > 0 && Number(best.kg || 0) > previousBest);
      if (isPersonalRecord) personalRecords += 1;
      totalSets += played.length;
      totalReps += played.reduce((sum, set) => sum + Number(set.reps || 0), 0);
      totalVolume += volume;
      const record = {
        isoDate: new Date(finishedAt).toISOString(),
        date: new Date(finishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        sets: played.length,
        reps: Number(best.reps || 0),
        weight: Number(best.kg || 0),
        bestKg: Number(best.kg || 0),
        bestReps: Number(best.reps || 0),
        volume,
        rounds: played.map((set, index) => ({ round: index + 1, kg: Number(set.kg || 0), reps: Number(set.reps || 0) }))
      };
      tracker.history = [...(tracker.history || []), record].slice(-100);
      tracker.sets = Array.from({ length: tracker.targetSets }, () => blankSet(tracker.weight, targetReps(tracker.targetReps)));
      exercises.push({ title: exercise.title, nameAr: exercise.title, sets: played.length, setsCount: played.length, bestKg: record.bestKg, bestReps: record.bestReps, bestSet: record.bestKg ? `${record.bestKg} كغ × ${record.bestReps || '-'} تكرار` : `${record.bestReps || '-'} تكرار`, volume, isPersonalRecord });
    }
    const day = getFortyDay(session.dayKey);
    const summary = {
      id: `fortyDay_${finishedAt}`,
      title: day.label,
      workoutNumber: state.history.length + 1,
      startedAt: session.startedAt,
      finishedAt,
      durationSeconds: Math.max(1, Math.round((finishedAt - session.startedAt) / 1000)),
      dateLabel: new Intl.DateTimeFormat('ar-JO', { weekday: 'long', day: 'numeric', month: 'short' }).format(new Date(finishedAt)),
      exercises, totalSets, totalReps, totalVolume: Math.round(totalVolume), totalVolumeKg: Math.round(totalVolume), personalRecords
    };
    state.history = [...state.history, summary].slice(-100);
    state.session = null;
    state.restUntil = null;
    state.restDuration = 0;
    this.save();
    localStorage.removeItem(LEGACY_SESSION_KEY);
    localStorage.setItem(LEGACY_HISTORY_KEY, JSON.stringify(state.history));
    store.finishWorkoutSession({ title: summary.title, dateLabel: summary.dateLabel, durationMinutes: Math.max(1, Math.round(summary.durationSeconds / 60)), totalVolumeKg: summary.totalVolume, totalSets, totalReps, exercises });
    return summary;
  }
}

export const fortyDayWorkoutService = new FortyDayWorkoutService();
