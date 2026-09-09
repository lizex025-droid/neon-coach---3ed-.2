import { INITIAL_DEMO_DATA } from './demoData.js';
export function localDate() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function createInitialState() {
  const state = structuredClone(INITIAL_DEMO_DATA);
  state.auth = { isAuthenticated: false, user: null };
  state.userProfile = { ...state.userProfile, id: null, name: '', email: '', birthDate: '',
    age: null, height: null, startWeight: null, currentWeight: null, targetWeight: null,
    likedFoods: [], dislikedFoods: [], registeredAt: null };
  state.today.date = localDate();
  for (const key of Object.keys(state.today)) if (key.startsWith('consumed')) state.today[key] = 0;
  state.today.waterStreakDays = 0;
  state.today.energyLevel = null;
  state.loggedMeals = [];
  state.coachClients = [];
  state.aiChatHistory = [];
  state.mealPlan.status = 'draft';
  state.mealPlan.approvedAt = null;
  state.activeWorkoutSession.elapsedSeconds = 0;
  state.activeWorkoutSession.currentExerciseIndex = 0;
  state.activeWorkoutSession.restTimeRemainingSec = 0;
  state.activeWorkoutSession.painReports = [];
  state.activeWorkoutSession.currentExercise.previousBest = '';
  for (const set of state.activeWorkoutSession.currentExercise.sets) {
    set.weight = 0;
    set.completed = false;
  }
  state.supplementsSchedule = [];
  state.weeklyCheckin = { ...state.weeklyCheckin, weekNumber: 1, completedTasksCount: 0,
    currentWeight: null, weightChangeVsLastWeek: 0, workoutsCompleted: 0,
    waterGlassesAvg: 0, coachFeedback: '' };
  state.progressReport = { ...state.progressReport, periodDays: 0,
    firstDay: { date: localDate(), weight: 0, waistCm: 0, benchPressKg: 0 },
    currentDay: { date: localDate(), weight: 0, waistCm: 0, benchPressKg: 0 },
    weightChangeKg: 0, weightTrendData: [], strengthTrendData: [],
    adherence: { trainingPct: 0, nutritionPct: 0, waterPct: 0 },
    inBodyResult: { hasResult: false }, coachNotes: '' };
  return state;
}
export function cleanSnapshot(input) {
  // JSON copies must never carry authentication or authorization into the store.
  const data = JSON.parse(JSON.stringify(input), (key, value) =>
    ['__proto__', 'prototype', 'constructor', 'token', 'password'].includes(key) ? undefined : value);
  delete data.auth;
  delete data.currentRole;
  delete data.coachClients;
  delete data.isDemoMode;
  return data;
}
