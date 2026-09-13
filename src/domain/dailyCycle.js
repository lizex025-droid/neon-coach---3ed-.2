import { localDate, TODAY_KINDS } from './actionAgent.js';

const clone = (value) => JSON.parse(JSON.stringify(value));
const number = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;

function mealsForDate(state, date) {
  return (state.loggedMeals || []).filter((meal) => meal.date === date);
}

function snapshotDay(state, date) {
  const today = state.today || {};
  const meals = mealsForDate(state, date);
  const sum = (field) => Math.round(meals.reduce((total, meal) => total + number(meal[field]), 0) * 10) / 10;
  const takenSupplements = (state.supplementsSchedule || []).filter((item) =>
    item?.schedule?.morning?.taken || item?.schedule?.evening?.taken
  ).length;

  return {
    date,
    calories: meals.length ? sum('calories') : number(today.consumedCalories),
    protein: meals.length ? sum('protein') : number(today.consumedProtein),
    carbs: meals.length ? sum('carbs') : number(today.consumedCarbs),
    fats: meals.length ? sum('fats') : number(today.consumedFats),
    targetCalories: number(today.targetCalories),
    targetProtein: number(today.targetProtein),
    targetCarbs: number(today.targetCarbs),
    targetFats: number(today.targetFats),
    consumedWaterLiters: number(today.consumedWaterLiters),
    targetWaterLiters: number(today.targetWaterLiters),
    consumedGlasses: number(today.consumedGlasses),
    targetGlasses: number(today.targetGlasses),
    mealCount: meals.length,
    supplementsTaken: takenSupplements,
    supplementsTotal: (state.supplementsSchedule || []).length,
    workoutCompleted: Boolean(today.isWorkoutCompleted || today.workoutStatus === 'completed'),
    workoutTitle: today.todayWorkoutTitleAr || state.activeWorkoutSession?.sessionNameAr || '',
    energyLevel: number(today.energyLevel),
  };
}

function resetSchedule(schedule) {
  return (schedule || []).map((item) => ({
    ...item,
    schedule: {
      ...item.schedule,
      morning: { ...item.schedule?.morning, taken: false, time: null },
      evening: { ...item.schedule?.evening, taken: false, time: null },
    },
  }));
}

function emptyWorkoutSession(current = {}) {
  return {
    ...current,
    sessionNameAr: '',
    startedAtTimestamp: null,
    elapsedSeconds: 0,
    currentExerciseIndex: 0,
    isResting: false,
    restTimeRemainingSec: 0,
    currentExercise: null,
    painReports: [],
  };
}

export function rolloverDailyState(sourceState, now = new Date()) {
  const currentDate = typeof now === 'string' ? now : localDate(now);
  const state = clone(sourceState || {});
  state.today ||= {};
  const previousDate = state.today.date;

  if (previousDate === currentDate) return { state: sourceState, changed: false, archived: null };

  state.loggedMeals = (state.loggedMeals || []).map((meal) => ({
    ...meal,
    date: meal.date || previousDate || currentDate,
  }));

  let archived = null;
  if (previousDate) {
    archived = snapshotDay(state, previousDate);
    const history = Array.isArray(state.dailyHistory) ? state.dailyHistory : [];
    state.dailyHistory = [
      archived,
      ...history.filter((item) => item?.date && item.date !== previousDate),
    ]
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .slice(0, 365);
  } else {
    state.dailyHistory = Array.isArray(state.dailyHistory) ? state.dailyHistory : [];
  }

  state.today = {
    ...state.today,
    date: currentDate,
    consumedCalories: 0,
    consumedProtein: 0,
    consumedCarbs: 0,
    consumedFats: 0,
    consumedWaterLiters: 0,
    consumedGlasses: 0,
    waterMl: 0,
    waterGlasses: 0,
    energyLevel: 0,
    todayWorkoutTitleAr: '',
    todayWorkoutDuration: '',
    todayWorkoutExercisesCount: 0,
    isWorkoutCompleted: false,
    workoutStatus: 'not_started',
    priorityFocus: null,
    actionOrder: [...TODAY_KINDS],
    meals: [],
  };
  state.activeWorkoutSession = emptyWorkoutSession(state.activeWorkoutSession);
  state.actionSupplementTaken = {};
  state.supplementsSchedule = resetSchedule(state.supplementsSchedule);

  return { state, changed: true, archived };
}

export function mergeDailyHistory(localHistory = [], remoteHistory = []) {
  const byDate = new Map();
  for (const item of localHistory) if (item?.date) byDate.set(item.date, { ...item });
  for (const item of remoteHistory) {
    if (!item?.date) continue;
    byDate.set(item.date, { ...(byDate.get(item.date) || {}), ...item });
  }
  return [...byDate.values()]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 365);
}

export function dailyHistoryWithin(history = [], days = 90, now = new Date()) {
  const end = new Date(`${localDate(now)}T12:00:00`);
  const start = new Date(end);
  start.setDate(start.getDate() - Math.max(1, Number(days) || 90));
  const startDate = localDate(start);
  return history
    .filter((item) => item?.date && item.date >= startDate && item.date < localDate(now))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}
