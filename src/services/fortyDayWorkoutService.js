import { FORTY_DAY_DAYS, FORTY_DAY_PROGRAM, getFortyDay, fortyDayExerciseId } from '../data/fortyDayWorkout.js';
import { HASM_GROUPS, HASM_PROGRAM, getHasmGroup, hasmExerciseId } from '../data/hasmWorkout.js';
import { ANAS_DAYS, ANAS_PROGRAM, getAnasDay, anasExerciseId } from '../data/anasWorkout.js';
import { store } from '../state/store.js';
import { syncService } from './syncService.js';
import { localDate } from '../domain/actionAgent.js';
import { notificationService } from './notificationService.js';
import { validatePersonalizedTrainingDraft } from '../domain/personalizedTrainingPlan.js';

const STATE_KEY = 'neon_forty_day_workout_v2';
const LEGACY_SESSION_KEY = 'fortyDay_active_workout_v1';
const LEGACY_HISTORY_KEY = 'fortyDay_workout_history_v1';

const readJson = (key, fallback) => {
  try {
    if (typeof localStorage === 'undefined') return fallback;
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
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
    activePlan: 'hasm',
    activeDay: 'chestBiceps',
    programStartedAt: null,
    session: null,
    restUntil: null,
    restDuration: 0,
    trackers: {},
    customExercises: {},
    history: [],
    planVersions: [],
    pendingPlanDraft: null,
    activePlanVersionBySystem: {},
    activationRequests: {},
    updatedAt: null
  };
}

function normalizeTracker(raw, exercise) {
  const count = Math.max(1, Number(raw?.targetSets) || Number(exercise.sets) || 3);
  const weight = clampNumber(raw?.weight ?? '', 0, 1000);
  const defaultReps = targetReps(raw?.targetReps || exercise.reps);
  const sets = Array.isArray(raw?.sets) ? raw.sets.slice(0, 12).map(set => {
    const isDone = Boolean(set.done);
    const kg = clampNumber(set.kg, 0, 1000);
    let reps = '';
    if (isDone) {
      reps = clampNumber(set.reps, 0, 1000, true);
    } else if (kg !== '') {
      reps = clampNumber(set.reps, 0, 1000, true);
    } else if (set.reps !== '' && set.reps != null && String(set.reps) !== String(defaultReps) && String(set.reps) !== '8') {
      reps = clampNumber(set.reps, 0, 1000, true);
    } else {
      reps = '';
    }
    return {
      kg,
      reps,
      done: isDone
    };
  }) : [];
  while (sets.length < count) sets.push(blankSet('', ''));
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
    this.state = {
      ...defaultState(),
      ...saved,
      trackers: saved?.trackers || {},
      customExercises: saved?.customExercises || {},
      history: Array.isArray(saved?.history) ? saved.history : [],
      planVersions: Array.isArray(saved?.planVersions) ? saved.planVersions : [],
      pendingPlanDraft: saved?.pendingPlanDraft || null,
      activePlanVersionBySystem: saved?.activePlanVersionBySystem || {},
      activationRequests: saved?.activationRequests || {}
    };
    if (!this.state.session) {
      const legacy = readJson(LEGACY_SESSION_KEY, null);
      if (legacy?.startedAt) this.state.session = { startedAt: Number(legacy.startedAt), dayKey: this.state.activeDay, touchedExerciseIds: Object.keys(legacy.exerciseRecords || {}) };
    }
    if (this.state.trackers) {
      for (const tracker of Object.values(this.state.trackers)) {
        if (Array.isArray(tracker?.sets)) {
          for (const s of tracker.sets) {
            if (!s.done && (s.kg === '' || s.kg == null)) {
              s.kg = '';
              s.reps = '';
            }
          }
        }
      }
    }
    return this.state;
  }

  save() {
    if (typeof localStorage === 'undefined') return;
    this.load().updatedAt = new Date().toISOString();
    localStorage.setItem(STATE_KEY, JSON.stringify(this.load()));
    this._debouncedCloudSync();
  }

  _debouncedCloudSync() {
    if (typeof window === 'undefined') return;
    clearTimeout(this._cloudSyncTimer);
    this._cloudSyncTimer = setTimeout(async () => {
      try {
        const user = store.getState()?.auth?.user;
        if (user?.id) {
          await syncService.syncUserState(user.id, this.load());
        }
      } catch (err) {
        // silent offline fallback
      }
    }, 1500);
  }

  loadRemoteState(remotePayload) {
    if (!remotePayload || typeof remotePayload !== 'object') return;
    const local = this.load();
    if (remotePayload.trackers && typeof remotePayload.trackers === 'object') {
      for (const [id, remoteTracker] of Object.entries(remotePayload.trackers)) {
        if (!local.trackers[id]) {
          local.trackers[id] = remoteTracker;
        } else {
          if (Array.isArray(remoteTracker.history) && remoteTracker.history.length > 0) {
            const localHistIds = new Set((local.trackers[id].history || []).map(h => h.isoDate || h.date));
            const newHistory = [...(local.trackers[id].history || [])];
            for (const h of remoteTracker.history) {
              if (!localHistIds.has(h.isoDate || h.date)) {
                newHistory.push(h);
              }
            }
            local.trackers[id].history = newHistory;
          }
          const hasLocalWeights = local.trackers[id].sets?.some(s => s.kg !== '' || s.reps !== '');
          const hasRemoteWeights = remoteTracker.sets?.some(s => s.kg !== '' || s.reps !== '');
          if (!hasLocalWeights && hasRemoteWeights) {
            local.trackers[id].sets = remoteTracker.sets;
          }
        }
      }
    }
    if (Array.isArray(remotePayload.history) && remotePayload.history.length > 0) {
      const existingIds = new Set(local.history.map(h => h.id));
      for (const item of remotePayload.history) {
        if (!existingIds.has(item.id)) {
          local.history.push(item);
        }
      }
      local.history.sort((a, b) => (b.finishedAt || 0) - (a.finishedAt || 0));
    }
    if (Array.isArray(remotePayload.planVersions)) {
      const versionIds = new Set(local.planVersions.map(version => version.id));
      remotePayload.planVersions.forEach(version => {
        if (version?.id && !versionIds.has(version.id)) local.planVersions.push(version);
      });
      local.planVersions.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    }
    const remoteIsNewer = String(remotePayload.updatedAt || '') > String(local.updatedAt || '');
    if (remoteIsNewer) {
      if (remotePayload.customExercises && typeof remotePayload.customExercises === 'object') {
        local.customExercises = { ...local.customExercises, ...remotePayload.customExercises };
      }
      local.activePlanVersionBySystem = { ...local.activePlanVersionBySystem, ...(remotePayload.activePlanVersionBySystem || {}) };
      local.activationRequests = { ...local.activationRequests, ...(remotePayload.activationRequests || {}) };
      local.pendingPlanDraft = remotePayload.pendingPlanDraft || local.pendingPlanDraft;
      local.updatedAt = remotePayload.updatedAt;
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STATE_KEY, JSON.stringify(local));
    }
  }

  getSnapshot() { return structuredClone(this.load()); }

  getPendingPlanDraft() { return structuredClone(this.load().pendingPlanDraft); }

  savePlanDraft(draft) {
    const state = this.load();
    state.pendingPlanDraft = structuredClone(draft);
    this.save();
    return this.getPendingPlanDraft();
  }

  discardPendingPlanDraft(draftId = null) {
    const state = this.load();
    if (draftId && state.pendingPlanDraft?.id !== draftId) return false;
    state.pendingPlanDraft = null;
    this.save();
    return true;
  }

  getPlanVersions(planKey = null) {
    const versions = this.load().planVersions || [];
    return structuredClone(planKey ? versions.filter(version => version.splitKey === planKey) : versions);
  }

  getActivePlanVersion(planKey = this.getActivePlan()) {
    const state = this.load();
    const id = state.activePlanVersionBySystem?.[planKey];
    return structuredClone(state.planVersions.find(version => version.id === id) || null);
  }

  async activatePersonalizedPlan(draft, { requestId = draft?.requestId } = {}) {
    const validation = validatePersonalizedTrainingDraft(draft);
    if (!validation.valid || !draft?.canApprove) {
      return { ok: false, code: 'invalid_draft', errors: validation.errors };
    }
    const state = this.load();
    if (state.session) {
      return { ok: false, code: 'active_session', errors: ['أنهِ جلسة التدريب الحالية أو ألغها قبل اعتماد خطة جديدة.'] };
    }
    if (draft.splitKey !== this.getActivePlan()) {
      return { ok: false, code: 'split_changed', errors: ['تغير نظام التدريب منذ إنشاء المعاينة. أنشئ معاينة جديدة للنظام النشط.'] };
    }
    if (requestId && state.activationRequests[requestId]?.ok) {
      const existingVersion = state.planVersions.find(version => version.id === state.activationRequests[requestId].versionId);
      return { ...state.activationRequests[requestId], idempotent: true, version: structuredClone(existingVersion || null) };
    }

    const previousVersionId = state.activePlanVersionBySystem[draft.splitKey] || null;
    const versionId = `plan_${draft.splitKey}_${Date.now()}_${String(draft.id).slice(-7)}`;
    const version = {
      id: versionId,
      draftId: draft.id,
      requestId: requestId || null,
      splitKey: draft.splitKey,
      splitName: draft.splitName,
      status: 'active',
      createdAt: new Date().toISOString(),
      previousVersionId,
      rulesVersion: draft.rulesVersion,
      selectedLevel: draft.selectedLevel,
      suggestedStartingPoint: draft.suggestedStartingPoint,
      inputSnapshot: structuredClone(draft.inputSnapshot),
      reasons: [...(draft.reasons || [])],
      warnings: [...(draft.warnings || [])],
      days: structuredClone(draft.days)
    };
    state.planVersions.forEach(item => {
      if (item.splitKey === draft.splitKey && item.status === 'active') item.status = 'archived';
    });
    for (const day of draft.days) {
      state.customExercises[day.key] = day.exercises.map((exercise, index) => ({
        ...structuredClone(exercise),
        number: index + 1,
        rest: exercise.restSeconds
      }));
      for (const exercise of state.customExercises[day.key]) {
        state.trackers[exercise.id] = normalizeTracker(state.trackers[exercise.id], exercise);
        state.trackers[exercise.id].rest = exercise.restSeconds;
      }
    }
    state.planVersions.push(version);
    state.activePlanVersionBySystem[draft.splitKey] = versionId;
    state.pendingPlanDraft = null;
    const result = { ok: true, versionId, requestId: requestId || null, savedLocally: true, cloudSynced: false };
    if (requestId) state.activationRequests[requestId] = result;
    this.save();

    if (typeof localStorage !== 'undefined') {
      const verified = readJson(STATE_KEY, null);
      if (!verified?.planVersions?.some(item => item.id === versionId) || verified?.activePlanVersionBySystem?.[draft.splitKey] !== versionId) {
        return { ok: false, code: 'verification_failed', errors: ['تعذر التحقق من حفظ نسخة الخطة محلياً. أعد المحاولة.'] };
      }
    }
    const user = store.getState()?.auth?.user;
    if (user?.id) {
      const cloudResult = await syncService.syncUserState(user.id, state);
      result.cloudSynced = Boolean(cloudResult);
      if (requestId) state.activationRequests[requestId] = result;
      if (typeof localStorage !== 'undefined') localStorage.setItem(STATE_KEY, JSON.stringify(state));
    }
    return { ...result, version: structuredClone(version) };
  }

  async restorePlanVersion(versionId, { requestId = `restore_${versionId}_${Date.now()}` } = {}) {
    const version = this.load().planVersions.find(item => item.id === versionId);
    if (!version) return { ok: false, code: 'not_found', errors: ['نسخة الخطة غير موجودة.'] };
    const draft = { ...structuredClone(version), id: `restore_${version.id}`, requestId, status: 'draft', canApprove: true, blockers: [] };
    return this.activatePersonalizedPlan(draft, { requestId });
  }

  getActivePlan() {
    const profilePlan = store.getState()?.userProfile?.workoutPlan;
    if (profilePlan === 'hasm' || profilePlan === 'ppl' || profilePlan === 'fortyDay' || profilePlan === 'anas') {
      return (profilePlan === 'ppl' || profilePlan === 'fortyDay') ? 'ppl' : profilePlan;
    }
    return this.load().activePlan || 'hasm';
  }

  setActivePlan(planKey) {
    const normalized = (planKey === 'ppl' || planKey === 'fortyDay') ? 'ppl' : (planKey === 'anas' ? 'anas' : 'hasm');
    const state = this.load();
    state.activePlan = normalized;
    if (normalized === 'anas') {
      state.activeDay = 'saturdayPush';
    } else if (normalized === 'ppl') {
      state.activeDay = 'pushA';
    } else {
      state.activeDay = 'chestBiceps';
    }
    this.save();
    const profile = store.getState()?.userProfile;
    if (profile && profile.workoutPlan !== normalized) {
      store.setUserProfile({ ...profile, workoutPlan: normalized });
    }
  }

  getProgram(planKey = this.getActivePlan()) {
    if (planKey === 'anas') return ANAS_PROGRAM;
    if (planKey === 'ppl' || planKey === 'fortyDay') return FORTY_DAY_PROGRAM;
    return HASM_PROGRAM;
  }

  getDays(planKey = this.getActivePlan()) {
    if (planKey === 'anas') return ANAS_DAYS;
    if (planKey === 'ppl' || planKey === 'fortyDay') return FORTY_DAY_DAYS;
    return HASM_GROUPS;
  }

  getDay(dayKey, planKey = this.getActivePlan()) {
    let baseDay = null;
    if (ANAS_DAYS.some(day => day.key === dayKey)) {
      baseDay = getAnasDay(dayKey);
    } else if (HASM_GROUPS.some(day => day.key === dayKey)) {
      baseDay = getHasmGroup(dayKey);
    } else if (FORTY_DAY_DAYS.some(day => day.key === dayKey)) {
      baseDay = getFortyDay(dayKey);
    } else if (planKey === 'anas') {
      baseDay = getAnasDay(dayKey);
    } else if (planKey === 'ppl' || planKey === 'fortyDay') {
      baseDay = getFortyDay(dayKey);
    } else {
      baseDay = getHasmGroup(dayKey);
    }
    if (!baseDay) return null;

    const activeVersion = this.getActivePlanVersion(planKey);
    const versionDay = activeVersion?.days?.find(d => d.key === dayKey);
    const custom = this.load().customExercises?.[dayKey];
    if (Array.isArray(custom) && custom.length > 0) {
      return {
        ...baseDay,
        ...(versionDay ? { warmup: versionDay.warmup, estimatedMinutes: versionDay.estimatedMinutes, tone: versionDay.tone } : {}),
        exercises: custom
      };
    }
    if (versionDay) {
      return {
        ...baseDay,
        warmup: versionDay.warmup,
        estimatedMinutes: versionDay.estimatedMinutes,
        tone: versionDay.tone
      };
    }
    return baseDay;
  }

  getExerciseId(dayKey, exerciseIndex, planKey = this.getActivePlan()) {
    const day = this.getDay(dayKey, planKey);
    const exercise = day?.exercises?.[exerciseIndex];
    if (exercise?.id) {
      return exercise.id;
    }
    if (ANAS_DAYS.some(day => day.key === dayKey) || planKey === 'anas') {
      return anasExerciseId(dayKey, exerciseIndex);
    }
    if (HASM_GROUPS.some(day => day.key === dayKey) || planKey === 'hasm') {
      return hasmExerciseId(dayKey, exerciseIndex);
    }
    return fortyDayExerciseId(dayKey, exerciseIndex);
  }

  addExerciseToDay(dayKey, exercise) {
    const state = this.load();
    if (!state.customExercises) state.customExercises = {};
    if (!state.customExercises[dayKey]) {
      const baseDay = this.getDay(dayKey);
      state.customExercises[dayKey] = (baseDay?.exercises || []).map((ex, idx) => ({
        ...ex,
        id: ex.id || this.getExerciseId(dayKey, idx)
      }));
    }
    const list = state.customExercises[dayKey];
    const newIndex = list.length;
    const newId = exercise.id ? `${exercise.id}_${Date.now()}` : `custom_${dayKey}_${Date.now()}_${newIndex}`;
    const newEx = {
      id: newId,
      number: newIndex + 1,
      title: exercise.title || exercise.nameAr || exercise.name,
      sets: Number(exercise.sets) || 3,
      reps: String(exercise.reps || '8-12'),
      alternative: exercise.alternative || '',
      image: exercise.image || exercise.url || ''
    };
    list.push(newEx);
    state.trackers[newId] = normalizeTracker(null, newEx);
    this.save();
    return newEx;
  }

  reorderDayExercises(dayKey, fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    const state = this.load();
    if (!state.customExercises) state.customExercises = {};
    if (!state.customExercises[dayKey]) {
      const baseDay = this.getDay(dayKey);
      state.customExercises[dayKey] = (baseDay?.exercises || []).map((ex, idx) => ({
        ...ex,
        id: ex.id || this.getExerciseId(dayKey, idx)
      }));
    }
    const list = state.customExercises[dayKey];
    if (fromIndex < 0 || fromIndex >= list.length || toIndex < 0 || toIndex >= list.length) return;
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);
    list.forEach((ex, idx) => {
      ex.number = idx + 1;
    });
    this.save();
  }

  replaceExerciseInDay(dayKey, exerciseIndex, newExercise) {
    const state = this.load();
    if (!state.customExercises) state.customExercises = {};
    if (!state.customExercises[dayKey]) {
      const baseDay = this.getDay(dayKey);
      state.customExercises[dayKey] = (baseDay?.exercises || []).map((ex, idx) => ({
        ...ex,
        id: ex.id || this.getExerciseId(dayKey, idx)
      }));
    }
    const list = state.customExercises[dayKey];
    if (exerciseIndex < 0 || exerciseIndex >= list.length) return null;

    const oldExercise = list[exerciseIndex];
    const oldId = oldExercise.id || this.getExerciseId(dayKey, exerciseIndex);

    if (state.session?.touchedExerciseIds) {
      state.session.touchedExerciseIds = state.session.touchedExerciseIds.filter(id => id !== oldId);
    }

    const newId = newExercise.id ? `${newExercise.id}_${Date.now()}` : `custom_${dayKey}_${Date.now()}_${exerciseIndex}`;
    const replaced = {
      id: newId,
      number: exerciseIndex + 1,
      title: newExercise.title || newExercise.nameAr || newExercise.name,
      sets: Number(newExercise.sets) || 3,
      reps: String(newExercise.reps || '8-12'),
      alternative: newExercise.alternative || '',
      image: newExercise.image || newExercise.url || '',
      groupKey: newExercise.groupKey || ''
    };

    list[exerciseIndex] = replaced;
    state.trackers[newId] = normalizeTracker(null, replaced);
    this.save();
    return replaced;
  }

  deleteExerciseFromDay(dayKey, exerciseIndex) {
    const state = this.load();
    if (!state.customExercises) state.customExercises = {};
    if (!state.customExercises[dayKey]) {
      const baseDay = this.getDay(dayKey);
      state.customExercises[dayKey] = (baseDay?.exercises || []).map((ex, idx) => ({
        ...ex,
        id: ex.id || this.getExerciseId(dayKey, idx)
      }));
    }
    const list = state.customExercises[dayKey];
    if (exerciseIndex < 0 || exerciseIndex >= list.length) return false;

    const [deleted] = list.splice(exerciseIndex, 1);
    const deletedId = deleted?.id || this.getExerciseId(dayKey, exerciseIndex);

    if (state.session?.touchedExerciseIds) {
      state.session.touchedExerciseIds = state.session.touchedExerciseIds.filter(id => id !== deletedId);
    }

    list.forEach((ex, idx) => {
      ex.number = idx + 1;
    });

    this.save();
    return true;
  }

  resetDayToDefault(dayKey) {
    const state = this.load();
    if (state.customExercises && state.customExercises[dayKey]) {
      delete state.customExercises[dayKey];
      this.save();
      return true;
    }
    return false;
  }

  resetPlanToDefault(planKey = this.getActivePlan()) {
    const state = this.load();
    if (!state.customExercises) return false;
    const days = this.getDays(planKey);
    let removedAny = false;
    days.forEach(d => {
      if (state.customExercises[d.key]) {
        delete state.customExercises[d.key];
        removedAny = true;
      }
    });
    if (removedAny) this.save();
    return removedAny;
  }

  setActiveDay(dayKey) {
    const allDays = [...ANAS_DAYS, ...HASM_GROUPS, ...FORTY_DAY_DAYS];
    if (!allDays.some(day => day.key === dayKey)) return;
    this.load().activeDay = dayKey;
    this.save();
  }

  getTrackersForDay(dayKey) {
    const day = this.getDay(dayKey);
    const state = this.load();
    let shouldSave = false;
    const trackers = day.exercises.map((exercise, exerciseIndex) => {
      const id = this.getExerciseId(dayKey, exerciseIndex);
      if (!state.trackers[id]) {
        state.trackers[id] = normalizeTracker(readJson(`exercise_tracker_${id}`, null), exercise);
        shouldSave = true;
      } else {
        state.trackers[id] = normalizeTracker(state.trackers[id], exercise);
      }
      return state.trackers[id];
    });
    if (shouldSave) this.save();
    return trackers;
  }

  getTracker(dayKey, exerciseIndex) {
    const exercise = this.getDay(dayKey)?.exercises[exerciseIndex];
    if (!exercise) return null;
    const id = this.getExerciseId(dayKey, exerciseIndex);
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
    if (tracker.sets[setIndex].done && Number(tracker.sets[setIndex].kg) > 0) {
      this._syncExercisePr(dayKey, exerciseIndex);
    }
    return tracker.sets[setIndex].done;
  }

  async _syncExercisePr(dayKey, exerciseIndex) {
    try {
      const user = store.getState()?.auth?.user;
      if (!user?.id) return;
      const tracker = this.getTracker(dayKey, exerciseIndex);
      const day = this.getDay(dayKey);
      const exercise = day?.exercises?.[exerciseIndex];
      if (!tracker || !exercise) return;
      const completedSets = tracker.sets.filter(s => s.done && Number(s.kg) > 0);
      if (completedSets.length === 0) return;
      const best = completedSets.reduce((max, s) => Number(s.kg) > Number(max.kg) ? s : max, completedSets[0]);
      const exId = this.getExerciseId(dayKey, exerciseIndex);
      await syncService.syncExerciseRecord(user.id, {
        exercise_id: exId,
        exercise_name: exercise.title,
        max_weight_kg: Number(best.kg),
        max_reps: Number(best.reps) || 0,
        estimated_1rm: Math.round(Number(best.kg) * (1 + (Number(best.reps) || 10) / 30) * 10) / 10,
        achieved_date: localDate()
      });
    } catch (err) {}
  }

  markTouched(dayKey, exerciseIndex) {
    const state = this.load();
    if (!state.session) state.session = { startedAt: Date.now(), dayKey, touchedExerciseIds: [] };
    const id = this.getExerciseId(dayKey, exerciseIndex);
    if (!state.session.touchedExerciseIds.includes(id)) state.session.touchedExerciseIds.push(id);
  }

  addSet(dayKey, exerciseIndex) {
    const tracker = this.getTracker(dayKey, exerciseIndex);
    if (!tracker || tracker.sets.length >= 12) return;
    tracker.sets.push(blankSet('', ''));
    tracker.targetSets = tracker.sets.length;
    this.save();
  }

  resetExercise(dayKey, exerciseIndex) {
    const exercise = this.getDay(dayKey)?.exercises[exerciseIndex];
    if (!exercise) return;
    const tracker = this.getTracker(dayKey, exerciseIndex);
    const id = this.getExerciseId(dayKey, exerciseIndex);
    const state = this.load();
    state.trackers[id] = normalizeTracker({ history: tracker?.history || [] }, exercise);
    if (state.session?.touchedExerciseIds) {
      state.session.touchedExerciseIds = state.session.touchedExerciseIds.filter(tid => tid !== id);
    }
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
      const activeSessionDay = this.getDay(session.dayKey);
      let day = activeSessionDay;
      let exercise = activeSessionDay?.exercises?.find((ex, idx) => this.getExerciseId(session.dayKey, idx) === id);

      if (!exercise) {
        let dayKey = null;
        let exerciseIndex = null;
        const anasMatch = id.match(/^anas_(.+)_(\d+)$/);
        const hasmMatch = id.match(/^hasm_(.+)_(\d+)$/);
        const fortyMatch = id.match(/^fortyDay_(.+)_(\d+)$/);
        if (anasMatch) {
          dayKey = anasMatch[1];
          exerciseIndex = Number(anasMatch[2]);
        } else if (hasmMatch) {
          dayKey = hasmMatch[1];
          exerciseIndex = Number(hasmMatch[2]);
        } else if (fortyMatch) {
          dayKey = fortyMatch[1];
          exerciseIndex = Number(fortyMatch[2]);
        }
        if (dayKey) {
          day = this.getDay(dayKey);
          exercise = day?.exercises?.[exerciseIndex];
        }
      }
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
      tracker.sets = Array.from({ length: tracker.targetSets }, () => blankSet('', ''));
      exercises.push({
        id,
        exerciseId: id,
        title: exercise.title,
        nameAr: exercise.title,
        sets: played.length,
        setsCount: played.length,
        bestKg: record.bestKg,
        bestReps: record.bestReps,
        bestSet: record.bestKg ? `${record.bestKg} كغ × ${record.bestReps || '-'} تكرار` : `${record.bestReps || '-'} تكرار`,
        volume,
        isPersonalRecord,
        rounds: record.rounds
      });
    }
    const day = this.getDay(session.dayKey);
    const planPrefix = session.dayKey.startsWith('saturday') || session.dayKey.startsWith('sunday') || session.dayKey.startsWith('monday') || session.dayKey.startsWith('wednesday') || session.dayKey.startsWith('thursday')
      ? 'anas'
      : (session.dayKey.startsWith('push') || session.dayKey.startsWith('pull') || session.dayKey.startsWith('legs') ? 'fortyDay' : 'hasm');
    const summary = {
      id: `${planPrefix}_${finishedAt}`,
      title: day.label || day.short,
      workoutNumber: state.history.length + 1,
      startedAt: session.startedAt,
      finishedAt,
      durationSeconds: Math.max(1, Math.round((finishedAt - session.startedAt) / 1000)),
      dateLabel: new Intl.DateTimeFormat('ar-JO', { weekday: 'long', day: 'numeric', month: 'short' }).format(new Date(finishedAt)),
      exercises, totalSets, totalReps, totalVolume: Math.round(totalVolume), totalVolumeKg: Math.round(totalVolume), personalRecords,
      planVersionId: state.activePlanVersionBySystem?.[this.getActivePlan()] || null
    };
    state.history = [...state.history, summary].slice(-100);
    state.session = null;
    state.restUntil = null;
    state.restDuration = 0;
    this.save();
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(LEGACY_SESSION_KEY);
      localStorage.setItem(LEGACY_HISTORY_KEY, JSON.stringify(state.history));
    }
    store.finishWorkoutSession({ title: summary.title, dateLabel: summary.dateLabel, durationMinutes: Math.max(1, Math.round(summary.durationSeconds / 60)), totalVolumeKg: summary.totalVolume, totalSets, totalReps, exercises, skipSync: true });
    
    // حفظ ومزامنة الجلسة والأوزان في قاعدة بيانات Supabase سحابياً
    this._syncFinishedWorkoutToCloud(summary, exercises, planPrefix);

    return summary;
  }

  async _syncFinishedWorkoutToCloud(summary, exercises, planPrefix) {
    try {
      const userId = store.getUserId?.() || store.getState()?.auth?.user?.id;
      if (!userId) return;

      // 1. مزامنة الجلسة في جدول workout_logs
      await syncService.syncWorkoutLog(userId, {
        title: summary.title,
        programType: planPrefix,
        date: localDate(),
        durationMinutes: Math.max(1, Math.round(summary.durationSeconds / 60)),
        totalVolumeKg: summary.totalVolume,
        exercises: exercises.map(e => ({
          title: e.title,
          nameAr: e.nameAr || e.title,
          sets: e.sets,
          bestKg: e.bestKg,
          bestReps: e.bestReps,
          bestSet: e.bestSet,
          volume: e.volume,
          isPersonalRecord: e.isPersonalRecord,
          rounds: e.rounds || []
        })),
        notes: `تمارين منجزة: ${exercises.length}، إجمالي الجولات: ${summary.totalSets}`
      });

      // 2. تحديث وحفظ الأوزان القياسية في exercise_records
      const prRecords = exercises
        .filter(e => e.bestKg > 0)
        .map(e => ({
          exercise_id: e.exerciseId || e.id || e.title,
          exercise_name: e.title,
          max_weight_kg: e.bestKg,
          max_reps: e.bestReps || 0,
          estimated_1rm: Math.round(e.bestKg * (1 + (e.bestReps || 0) / 30) * 10) / 10,
          achieved_date: localDate()
        }));

      if (prRecords.length > 0) {
        await syncService.syncExerciseRecords(userId, prRecords);
      }

      // 3. تحديث حالة المتدرب العامة في user_state
      await syncService.syncUserState(userId, this.load());
    } catch (syncErr) {
      console.warn('تعذر حفظ الجلسة في قاعدة البيانات سحابياً:', syncErr);
    }
  }
}

export const fortyDayWorkoutService = new FortyDayWorkoutService();
