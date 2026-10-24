import { FBW_DAYS } from './fbwWorkout.js';
import { ULF_DAYS } from './ulfWorkout.js';
import { HASM_GROUPS, hasmExerciseId } from './hasmWorkout.js';
import { ANAS_DAYS, anasExerciseId } from './anasWorkout.js';
import { FORTY_DAY_DAYS, fortyDayExerciseId } from './fortyDayWorkout.js';

// History must identify the movement, not the plan/day/array position.
// Do not use the exercise illustration: alternatives often reuse one image.
const aliases = new Map(Object.entries({
  'flat db bench press': 'flat-dumbbell-bench-press',
  'dumbbell bench press': 'flat-dumbbell-bench-press',
  // Hasm explicitly offers DB Press at this same position. Legacy logs did
  // not distinguish the selected implement, so they are best-effort matches.
  'bench press dumbbell press': 'flat-dumbbell-bench-press',
  'incline db press': 'incline-dumbbell-bench-press',
  'incline dumbbell bench press': 'incline-dumbbell-bench-press',
  'lat pulldown': 'lat-pulldown',
  'seated cable row': 'seated-cable-row',
  'leg press': 'leg-press',
  'overhead triceps extension': 'overhead-cable-triceps-extension',
  'overhead cable rope extension': 'overhead-cable-triceps-extension',
  'overhead cable rope triceps extension': 'overhead-cable-triceps-extension',
  'chest supported row': 'chest-supported-row',
  'chest supported dumbbell row': 'chest-supported-row',
  'cable biceps curl': 'cable-biceps-curl',
  'rope triceps pressdown': 'triceps-rope-pressdown',
  'cable lateral raise': 'cable-lateral-raise',
  'incline machine chest press': 'incline-machine-chest-press',
  'db romanian deadlift': 'dumbbell-romanian-deadlift',
  'romanian dumbbell deadlift': 'dumbbell-romanian-deadlift',
  'reverse pec deck': 'reverse-pec-deck',
  'seated leg curl': 'seated-leg-curl',
  'lying leg curl': 'lying-leg-curl',
  'standing calf raise': 'standing-calf-raise',
  'seated calf raise': 'seated-calf-raise',
  'cable crunch': 'cable-crunch',
  'hack squat': 'hack-squat'
}));

function englishName(exercise) {
  const title = String(exercise?.title || exercise?.nameEn || exercise?.name || exercise?.nameAr || '').trim();
  const segments = title.split('|');
  return segments[segments.length - 1].toLowerCase()
    .replace(/[‐‑‒–—−]/g, '-')
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function exerciseHistoryKey(exercise) {
  if (exercise?.historyKey) return String(exercise.historyKey);
  const name = englishName(exercise);
  return name ? (aliases.get(name) || `exact:${name}`) : null;
}

// Index historical IDs from every built-in plan and user-customized exercise.
// Tracker IDs are never rewritten, preserving remote sync and old workout logs.
export function getHistoricalExerciseIndex(customExercises = {}) {
  const entries = [];
  const register = (day, getId) => day.exercises.forEach((exercise, index) => {
    const id = exercise.id || getId(day.key, index);
    entries.push({ id, exercise, key: exerciseHistoryKey(exercise) });
  });
  ULF_DAYS.forEach(day => register(day, (key, i) => `ulf_${key}_${i}`));
  FBW_DAYS.forEach(day => register(day, (key, i) => `fbw_${key}_${i}`));
  HASM_GROUPS.forEach(day => register(day, hasmExerciseId));
  ANAS_DAYS.forEach(day => register(day, anasExerciseId));
  FORTY_DAY_DAYS.forEach(day => register(day, fortyDayExerciseId));
  Object.entries(customExercises || {}).forEach(([dayKey, exercises]) => {
    if (!Array.isArray(exercises)) return;
    exercises.forEach((exercise, index) => {
      const id = exercise.id || `custom_${dayKey}_${index}`;
      entries.push({ id, exercise, key: exerciseHistoryKey(exercise) });
    });
  });
  // Current custom metadata wins only for an identical ID; older built-ins
  // retain their identity even when users replace an exercise with a new ID.
  return [...new Map(entries.map(entry => [entry.id, entry])).values()];
}
