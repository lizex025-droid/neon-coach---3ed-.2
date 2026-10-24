import { FBW_DAYS, FBW_PROGRAM, getFbwDay } from '../data/fbwWorkout.js';
import { ULF_DAYS, ULF_PROGRAM, getUlfDay } from '../data/ulfWorkout.js';
import { exerciseHistoryKey, getHistoricalExerciseIndex } from '../data/exerciseHistoryIdentity.js';
import { FORTY_DAY_DAYS, FORTY_DAY_PROGRAM, getFortyDay, fortyDayExerciseId } from '../data/fortyDayWorkout.js';
import { HASM_GROUPS, HASM_PROGRAM, getHasmGroup, hasmExerciseId } from '../data/hasmWorkout.js';
import { ANAS_DAYS, ANAS_PROGRAM, getAnasDay, anasExerciseId } from '../data/anasWorkout.js';
import { store } from '../state/store.js';
import { syncService } from './syncService.js';
import { localDate } from '../domain/actionAgent.js';
import { notificationService } from './notificationService.js';
import { validatePersonalizedTrainingDraft, generatePersonalizedTrainingDraft } from '../domain/personalizedTrainingPlan.js';
import { normalizeArabicNumerals } from '../utils/arabicNumerals.js';

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
  const normalized = normalizeArabicNumerals(String(value), true);
  const number = Number(normalized);
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
    rest: clampNumber(raw?.rest ?? exercise.restSeconds ?? 150, 0, 600, true) || 150,
    weight,
    history: Array.isArray(raw?.history) ? raw.history.slice(-100) : [],
    sharedSeedRef: raw?.sharedSeedRef || null,
    superset: raw?.superset?.exerciseId ? {
      exerciseId: String(raw.superset.exerciseId),
      title: String(raw.superset.title || ''),
      image: String(raw.superset.image || ''),
      groupKey: String(raw.superset.groupKey || ''),
      sets: Array.from({ length: count }, (_, i) => {
        const set = raw.superset.sets?.[i] || {};
        return { kg: clampNumber(set.kg ?? '', 0, 1000),
          reps: clampNumber(set.reps ?? '', 0, 1000, true), done: Boolean(set.done) };
      })
    } : null,
    dropSets: Array.isArray(raw?.dropSets) ? raw.dropSets.slice(0, 12).map(item => ({
      parentSetIndex: Math.min(count - 1, Math.max(0, Number(item.parentSetIndex) || 0)),
      kg: clampNumber(item.kg ?? '', 0, 1000),
      reps: clampNumber(item.reps ?? '', 0, 1000, true),
      done: Boolean(item.done)
    })) : []
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
            const newHistory = [...(local.trackers[id].history || [])];
            for (const remoteRecord of remoteTracker.history) {
              // Live entries have one stable session ID. Merge revisions rather
              // than re-adding a round that the user unchecked on another device.
              const index = newHistory.findIndex(localRecord => remoteRecord.sessionId
                ? localRecord.sessionId === remoteRecord.sessionId
                : !localRecord.sessionId && (localRecord.isoDate || localRecord.date) === (remoteRecord.isoDate || remoteRecord.date));
              if (index < 0) {
                newHistory.push(remoteRecord);
              } else if (remoteRecord.sessionId) {
                const current = newHistory[index];
                const remoteVersion = Number(remoteRecord.version || 0);
                const localVersion = Number(current.version || 0);
                if (remoteVersion > localVersion ||
                    (remoteVersion === localVersion && String(remoteRecord.updatedAt || '') > String(current.updatedAt || ''))) {
                  newHistory[index] = remoteRecord;
                }
              }
            }
            local.trackers[id].history = newHistory.slice(-100);
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
      if (draft.splitKey === 'personalized') {
        this.setActivePlan('personalized');
      } else {
        return { ok: false, code: 'split_changed', errors: ['تغير نظام التدريب منذ إنشاء المعاينة. أنشئ معاينة جديدة للنظام النشط.'] };
      }
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
    if (draft.splitKey === 'personalized' && state.customExercises) {
      const activeKeys = new Set(draft.days.map(d => d.key));
      for (const k of Object.keys(state.customExercises)) {
        if (k.startsWith('pers_') && !activeKeys.has(k)) {
          delete state.customExercises[k];
        }
      }
    }
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
    if (profilePlan === 'ulf' || profilePlan === 'fbw' || profilePlan === 'hasm' || profilePlan === 'ppl' || profilePlan === 'fortyDay' || profilePlan === 'anas' || profilePlan === 'personalized') {
      return (profilePlan === 'ppl' || profilePlan === 'fortyDay') ? 'ppl' : profilePlan;
    }
    return this.load().activePlan || 'hasm';
  }

  setActivePlan(planKey) {
    const normalized = planKey === 'ulf' ? 'ulf' : (planKey === 'fbw' ? 'fbw' : (planKey === 'ppl' || planKey === 'fortyDay') ? 'ppl' : (planKey === 'anas' ? 'anas' : (planKey === 'personalized' ? 'personalized' : 'hasm')));
    const state = this.load();
    state.activePlan = normalized;
    if (normalized === 'ulf') {
      state.activeDay = 'ulfUpper';
    } else if (normalized === 'fbw') {
      state.activeDay = 'fbwA';
    } else if (normalized === 'anas') {
      state.activeDay = 'saturdayPush';
    } else if (normalized === 'ppl') {
      state.activeDay = 'pushA';
    } else if (normalized === 'personalized') {
      const persDays = this.getDays('personalized');
      state.activeDay = persDays[0]?.key || 'pers_day_1';
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
    if (planKey === 'ulf') return ULF_PROGRAM;
    if (planKey === 'fbw') return FBW_PROGRAM;
    if (planKey === 'anas') return ANAS_PROGRAM;
    if (planKey === 'ppl' || planKey === 'fortyDay') return FORTY_DAY_PROGRAM;
    if (planKey === 'personalized') {
      const version = this.getActivePlanVersion('personalized');
      return {
        key: 'personalized',
        title: 'الخطة المقترحة من التطبيق',
        kicker: 'NEON AI SMART TRAINING',
        description: version
          ? `خطة تدريبية مقترحة لمستوى ${version.selectedLevel} (${version.days?.length || 4} أيام تدريبية) معدلة حسب خياراتك وإصاباتك.`
          : 'خطة تدريبية ذكية مقترحة ومفصلة خصيصاً وفقاً لأهدافك، إصاباتك، وأيام تمرينك المختارة.',
        cover: './hasm.jpg',
        durationDays: 40
      };
    }
    return HASM_PROGRAM;
  }

  _getDefaultPersonalizedDays() {
    const profile = store.getState()?.userProfile || {};
    try {
      const draft = generatePersonalizedTrainingDraft(
        {
          trainingLevel: profile.trainingLevel || profile.fitnessLevel || 'intermediate',
          trainingExperienceMonths: profile.trainingExperienceMonths || 12,
          workoutDaysCount: Number(profile.workoutDaysCount) || 4,
          sessionDurationMin: Number(profile.sessionDurationMin) || 60,
          equipment: profile.equipment || 'gym',
          goal: profile.goal || 'muscle_gain',
          injuries: profile.injuries || [],
          injuryDetails: profile.injuryDetails || {},
          focusAreas: profile.focusAreas || []
        },
        { splitKey: 'personalized', requestId: 'default-pers-seed' }
      );
      if (draft?.days?.length) {
        return draft.days.map((day, idx) => ({
          key: day.key,
          short: day.short || day.label || `اليوم ${idx + 1}`,
          label: day.label || day.short || `اليوم ${idx + 1}`,
          tone: day.tone || 'strength',
          warmup: day.warmup,
          estimatedMinutes: day.estimatedMinutes,
          exercises: day.exercises || []
        }));
      }
    } catch (_) {}
    return HASM_GROUPS.slice(0, 4).map((d, i) => ({
      ...d,
      key: `pers_${d.key}`,
      short: d.short,
      label: d.label
    }));
  }

  getDays(planKey = this.getActivePlan()) {
    if (planKey === 'ulf') return ULF_DAYS;
    if (planKey === 'fbw') return FBW_DAYS;
    if (planKey === 'anas') return ANAS_DAYS;
    if (planKey === 'ppl' || planKey === 'fortyDay') return FORTY_DAY_DAYS;
    if (planKey === 'personalized') {
      const version = this.getActivePlanVersion('personalized');
      if (version?.days?.length) {
        return version.days.map((day, idx) => ({
          key: day.key,
          short: day.short || day.label || `اليوم ${idx + 1}`,
          label: day.label || day.short || `اليوم ${idx + 1}`,
          tone: day.tone || 'strength',
          warmup: day.warmup,
          estimatedMinutes: day.estimatedMinutes,
          exercises: day.exercises || []
        }));
      }
      return this._getDefaultPersonalizedDays();
    }
    return HASM_GROUPS;
  }

  getDay(dayKey, planKey = this.getActivePlan()) {
    if (planKey === 'personalized' || String(dayKey).startsWith('pers_')) {
      const activeVersion = this.getActivePlanVersion('personalized');
      const versionDay = activeVersion?.days?.find(d => d.key === dayKey);
      const custom = this.load().customExercises?.[dayKey];
      if (versionDay) {
        return {
          ...versionDay,
          exercises: Array.isArray(custom) && custom.length > 0 ? custom : versionDay.exercises
        };
      }
      const defaultDays = this._getDefaultPersonalizedDays();
      const defDay = defaultDays.find(d => d.key === dayKey);
      if (defDay) {
        return {
          ...defDay,
          exercises: Array.isArray(custom) && custom.length > 0 ? custom : defDay.exercises
        };
      }
    }

    let baseDay = null;
    if (ULF_DAYS.some(day => day.key === dayKey)) {
      baseDay = getUlfDay(dayKey);
    } else if (FBW_DAYS.some(day => day.key === dayKey)) {
      baseDay = getFbwDay(dayKey);
    } else if (ANAS_DAYS.some(day => day.key === dayKey)) {
      baseDay = getAnasDay(dayKey);
    } else if (HASM_GROUPS.some(day => day.key === dayKey)) {
      baseDay = getHasmGroup(dayKey);
    } else if (FORTY_DAY_DAYS.some(day => day.key === dayKey)) {
      baseDay = getFortyDay(dayKey);
    } else if (planKey === 'ulf') {
      baseDay = getUlfDay(dayKey);
    } else if (planKey === 'fbw') {
      baseDay = getFbwDay(dayKey);
    } else if (planKey === 'anas') {
      baseDay = getAnasDay(dayKey);
    } else if (planKey === 'ppl' || planKey === 'fortyDay') {
      baseDay = getFortyDay(dayKey);
    } else {
      baseDay = getHasmGroup(dayKey);
    }
    if (!baseDay) return null;

    const activeVersion = this.getActivePlanVersion(planKey);
    const versionDay = (activeVersion?.splitKey === planKey) ? activeVersion?.days?.find(d => d.key === dayKey) : null;
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
    if (String(dayKey).startsWith('pers_') || planKey === 'personalized') {
      return `pers_${dayKey}_${exerciseIndex}`;
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
    const allDays = [...ULF_DAYS, ...FBW_DAYS, ...ANAS_DAYS, ...HASM_GROUPS, ...FORTY_DAY_DAYS, ...this.getDays('personalized')];
    if (!allDays.some(day => day.key === dayKey)) return;
    this.load().activeDay = dayKey;
    this.save();
  }

  // Build a read-only timeline from all plan-specific trackers. This leaves
  // original data in place and avoids duplicating histories with each switch.
  getSharedExerciseHistory(exercise) {
    const key = exerciseHistoryKey(exercise);
    if (!key) return [];
    const state = this.load();
    const seen = new Set();
    const rows = [];
    for (const entry of getHistoricalExerciseIndex(state.customExercises)) {
      // Older installations also kept separate per-exercise local records.
      const tracker = state.trackers[entry.id] || readJson(`exercise_tracker_${entry.id}`, null);
      if (!Array.isArray(tracker?.history)) continue;
      const primary = entry.key === key;
      const companion = tracker.superset?.title && exerciseHistoryKey({ title: tracker.superset.title }) === key;
      if (!primary && !companion) continue;
      for (const record of tracker.history) {
        if (!record || typeof record !== 'object' || record.cancelled) continue;
        // The companion gets its own searchable History without copying or
        // rewriting the parent tracker/plan ID.
        if (companion && Array.isArray(record.superRounds)) {
          const companionRounds = record.superRounds.filter(round =>
            round.exerciseId === tracker.superset.exerciseId);
          if (companionRounds.length) {
            const identity = `${entry.id}:superset|${record.sessionId || record.isoDate}|${JSON.stringify(companionRounds)}`;
            if (!seen.has(identity)) {
              seen.add(identity);
              const best = companionRounds.reduce((winner, round) => round.kg > (winner?.kg || 0) ? round : winner, companionRounds[0]);
              rows.push({
                isoDate: record.isoDate, date: record.date, sessionId: record.sessionId,
                live: record.live, sourceExerciseId: `${entry.id}:superset`,
                sets: companionRounds.length, reps: best?.reps || 0,
                weight: best?.kg || 0, bestKg: best?.kg || 0, bestReps: best?.reps || 0,
                volume: companionRounds.reduce((sum, round) => sum + round.kg * round.reps, 0),
                rounds: companionRounds.map(({ round, kg, reps }) => ({ round, kg, reps }))
              });
            }
          }
        }
        if (!primary) continue;
        const identity = `${entry.id}|${record.sessionId || record.isoDate || record.date || ''}|${JSON.stringify(record.rounds || [])}|${JSON.stringify(record.superRounds || [])}|${JSON.stringify(record.dropRounds || [])}`;
        if (seen.has(identity)) continue;
        seen.add(identity);
        rows.push({ ...record, sourceExerciseId: entry.id });
      }
    }
    rows.sort((a, b) => (Date.parse(a.isoDate || '') || 0) - (Date.parse(b.isoDate || '') || 0));
    return rows.slice(-100);
  }

  getSharedHistory(dayKey, exerciseIndex) {
    const exercise = this.getDay(dayKey)?.exercises?.[exerciseIndex];
    return exercise ? this.getSharedExerciseHistory(exercise) : [];
  }

  _prefillRecentPerformance(id, tracker, exercise, state) {
    const history = this.getSharedExerciseHistory(exercise);
    const latest = history.at(-1);
    if (!latest) return false;
    const reference = `${latest.sourceExerciseId}|${latest.isoDate || latest.date}|${JSON.stringify(latest.rounds || [])}`;
    if (tracker.sharedSeedRef === reference) return false;
    // Never discard an active workout, hand-entered values, or a tuned weight.
    if (state.session?.touchedExerciseIds?.includes(id) ||
        tracker.sets.some(set => set.done || set.kg !== '' || set.reps !== '') ||
        (tracker.weight !== '' && tracker.weight != null)) return false;
    const rounds = Array.isArray(latest.rounds) && latest.rounds.length
      ? latest.rounds
      : [{ kg: latest.bestKg ?? latest.weight, reps: latest.bestReps ?? latest.reps }];
    const valid = rounds.filter(round => Number(round.kg) > 0 || Number(round.reps) > 0);
    if (!valid.length) return false;
    tracker.sets = tracker.sets.map((set, index) => {
      const round = valid[Math.min(index, valid.length - 1)];
      return blankSet(
        round.kg == null || round.kg === '' ? '' : clampNumber(round.kg, 0, 1000),
        round.reps == null || round.reps === '' ? '' : clampNumber(round.reps, 0, 1000, true)
      );
    });
    tracker.sharedSeedRef = reference;
    return true;
  }

  _ensureTracker(dayKey, exerciseIndex, exercise, state) {
    const id = this.getExerciseId(dayKey, exerciseIndex);
    const old = state.trackers[id] || readJson(`exercise_tracker_${id}`, null);
    const created = !state.trackers[id];
    const tracker = normalizeTracker(old, exercise);
    // normalizeTracker deliberately returns a new object; keep seed metadata.
    if (old?.sharedSeedRef) tracker.sharedSeedRef = old.sharedSeedRef;
    state.trackers[id] = tracker;
    const seeded = this._prefillRecentPerformance(id, tracker, exercise, state);
    return { tracker, changed: created || seeded };
  }

  getTrackersForDay(dayKey) {
    const day = this.getDay(dayKey);
    if (!day) return [];
    const state = this.load();
    let changed = false;
    const trackers = day.exercises.map((exercise, index) => {
      const result = this._ensureTracker(dayKey, index, exercise, state);
      changed = changed || result.changed;
      return result.tracker;
    });
    if (changed) this.save();
    return trackers;
  }

  getTracker(dayKey, exerciseIndex) {
    const exercise = this.getDay(dayKey)?.exercises?.[exerciseIndex];
    if (!exercise) return null;
    const state = this.load();
    const { tracker, changed } = this._ensureTracker(dayKey, exerciseIndex, exercise, state);
    if (changed) this.save();
    return tracker;
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
    if (tracker.sets[setIndex].done) this._writeSessionExerciseHistory(tracker, this.load().session);
    this.save();
  }

  configureSuperset(dayKey, exerciseIndex, libraryExercise) {
    const tracker = this.getTracker(dayKey, exerciseIndex);
    const exercise = this.getDay(dayKey)?.exercises?.[exerciseIndex];
    if (!tracker || !libraryExercise?.id || !exercise) return false;
    if (exerciseHistoryKey(exercise) === exerciseHistoryKey(libraryExercise)) return false;
    const current = tracker.superset;
    tracker.superset = {
      exerciseId: libraryExercise.id,
      title: libraryExercise.title || `${libraryExercise.nameAr} | ${libraryExercise.nameEn}`,
      image: libraryExercise.image || '',
      groupKey: libraryExercise.groupKey || '',
      sets: current?.exerciseId === libraryExercise.id
        ? current.sets : tracker.sets.map(() => blankSet('', ''))
    };
    this.save();
    return true;
  }

  removeSuperset(dayKey, exerciseIndex) {
    const tracker = this.getTracker(dayKey, exerciseIndex);
    if (!tracker?.superset) return;
    if (this.load().session) {
      tracker.superset.sets.forEach(set => { set.done = false; });
      this._writeSessionExerciseHistory(tracker, this.load().session);
    }
    tracker.superset = null;
    this.save();
  }

  enableDropSet(dayKey, exerciseIndex) {
    const tracker = this.getTracker(dayKey, exerciseIndex);
    if (!tracker) return;
    if (!tracker.dropSets?.length) {
      tracker.dropSets = [{ parentSetIndex: tracker.sets.length - 1, ...blankSet('', '') }];
    }
    this.save();
  }

  addDropRound(dayKey, exerciseIndex) {
    const tracker = this.getTracker(dayKey, exerciseIndex);
    if (!tracker || tracker.dropSets.length >= 12) return;
    tracker.dropSets.push({
      parentSetIndex: tracker.dropSets.at(-1)?.parentSetIndex ?? tracker.sets.length - 1,
      ...blankSet('', '')
    });
    this.save();
  }

  removeDropSet(dayKey, exerciseIndex) {
    const tracker = this.getTracker(dayKey, exerciseIndex);
    if (!tracker?.dropSets?.length) return;
    if (this.load().session) {
      tracker.dropSets.forEach(set => { set.done = false; });
      this._writeSessionExerciseHistory(tracker, this.load().session);
    }
    tracker.dropSets = [];
    this.save();
  }

  _getLinkedSet(tracker, kind, roundIndex) {
    return kind === 'superset' ? tracker?.superset?.sets?.[roundIndex] :
      kind === 'drop' ? tracker?.dropSets?.[roundIndex] : null;
  }

  updateLinkedSet(dayKey, exerciseIndex, kind, roundIndex, field, value) {
    if (!['kg', 'reps'].includes(field) || !['superset', 'drop'].includes(kind)) return;
    const tracker = this.getTracker(dayKey, exerciseIndex);
    const set = this._getLinkedSet(tracker, kind, roundIndex);
    if (!set || set.done) return;
    set[field] = clampNumber(value, 0, 1000, field === 'reps');
    this.save();
  }

  toggleLinkedSet(dayKey, exerciseIndex, kind, roundIndex) {
    if (!['superset', 'drop'].includes(kind)) return null;
    const tracker = this.getTracker(dayKey, exerciseIndex);
    const set = this._getLinkedSet(tracker, kind, roundIndex);
    if (!set || (!set.done && !(Number(set.reps) > 0))) return null;
    this.startWorkout(dayKey);
    set.done = !set.done;
    this.markTouched(dayKey, exerciseIndex);
    this._writeSessionExerciseHistory(tracker, this.load().session);
    this.save();
    return set.done;
  }

  // Persist each checked set immediately, even if Finish Workout is never
  // pressed. One record per exercise+session is updated as more sets are checked.
  // Undo writes a cancellation tombstone so cloud sync cannot resurrect a set.
  _writeSessionExerciseHistory(tracker, session, { finalize = false } = {}) {
    if (!session?.startedAt || !tracker) return null;
    const sessionId = `workout:${session.startedAt}`;
    const history = tracker.history || (tracker.history = []);
    const index = history.findIndex(row => row.sessionId === sessionId);
    const previous = index >= 0 ? history[index] : null;
    const rounds = tracker.sets.flatMap((set, roundIndex) =>
      set.done && (set.kg !== '' || set.reps !== '')
        ? [{ round: roundIndex + 1, kg: Number(set.kg || 0), reps: Number(set.reps || 0) }]
        : []
    );
    const superRounds = (tracker.superset?.sets || []).flatMap((set, index) =>
      set.done && Number(set.reps) > 0
        ? [{ round: index + 1, kg: Number(set.kg || 0), reps: Number(set.reps || 0),
          exerciseId: tracker.superset.exerciseId, exerciseTitle: tracker.superset.title }]
        : []
    );
    const dropRounds = (tracker.dropSets || []).flatMap((set, index) =>
      set.done && Number(set.reps) > 0
        ? [{ round: index + 1, afterSet: set.parentSetIndex + 1,
          kg: Number(set.kg || 0), reps: Number(set.reps || 0) }]
        : []
    );
    if (!rounds.length && !superRounds.length && !dropRounds.length && !previous) return null;
    const best = rounds.reduce((winner, round) => round.kg > (winner?.kg || 0) ? round : winner, rounds[0]);
    const at = new Date();
    const record = {
      ...previous,
      sessionId,
      isoDate: previous?.isoDate || at.toISOString(),
      date: previous?.date || at.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      updatedAt: at.toISOString(),
      version: Number(previous?.version || 0) + 1,
      live: !finalize,
      cancelled: rounds.length + superRounds.length + dropRounds.length === 0,
      sets: rounds.length + superRounds.length + dropRounds.length,
      reps: best?.reps || 0,
      weight: best?.kg || 0,
      bestKg: best?.kg || 0,
      bestReps: best?.reps || 0,
      volume: [...rounds, ...superRounds, ...dropRounds].reduce((sum, round) => sum + round.kg * round.reps, 0),
      rounds,
      superRounds,
      dropRounds
    };
    if (index >= 0) history[index] = record;
    else history.push(record);
    tracker.history = history.slice(-100);
    return record;
  }

  toggleSet(dayKey, exerciseIndex, setIndex) {
    const tracker = this.getTracker(dayKey, exerciseIndex);
    const set = tracker?.sets[setIndex];
    if (!set) return null;
    // A blank set cannot be entered into History. Bodyweight sets may use 0 kg.
    if (!set.done && !(Number(set.reps) > 0)) return null;
    this.startWorkout(dayKey);
    set.done = !set.done;
    this.markTouched(dayKey, exerciseIndex);
    this._writeSessionExerciseHistory(tracker, this.load().session);
    if (set.done && tracker.rest > 0) {
      this.load().restDuration = tracker.rest;
      this.load().restUntil = Date.now() + tracker.rest * 1000;
    }
    this.save(); // LocalStorage immediately; cloud user_state sync is debounced.
    if (set.done && Number(set.kg) > 0) {
      this._syncExercisePr(dayKey, exerciseIndex);
    }
    return set.done;
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
    tracker.superset?.sets.push(blankSet('', ''));
    tracker.targetSets = tracker.sets.length;
    this.save();
  }

  resetExercise(dayKey, exerciseIndex) {
    const exercise = this.getDay(dayKey)?.exercises[exerciseIndex];
    if (!exercise) return;
    const tracker = this.getTracker(dayKey, exerciseIndex);
    const id = this.getExerciseId(dayKey, exerciseIndex);
    const state = this.load();
    // A reset during an unfinished workout also retracts its live rounds.
    if (state.session) {
      tracker.sets.forEach(set => { set.done = false; });
      tracker.superset?.sets.forEach(set => { set.done = false; });
      tracker.dropSets.forEach(set => { set.done = false; });
      this._writeSessionExerciseHistory(tracker, state.session);
    }
    const linked = {
      superset: tracker.superset ? { ...tracker.superset, sets: tracker.sets.map(() => blankSet('', '')) } : null,
      dropSets: tracker.dropSets.map(set => ({ parentSetIndex: set.parentSetIndex, ...blankSet('', '') }))
    };
    state.trackers[id] = normalizeTracker({ history: tracker?.history || [], ...linked }, exercise);
    // An explicit reset must not be undone by shared-history auto-prefill.
    const latest = this.getSharedExerciseHistory(exercise).at(-1);
    if (latest) state.trackers[id].sharedSeedRef = `${latest.sourceExerciseId}|${latest.isoDate || latest.date}|${JSON.stringify(latest.rounds || [])}`;
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
    if (tracker.superset) tracker.superset.sets = Array.from({ length: count },
      (_, i) => tracker.superset.sets[i] || blankSet('', ''));
    tracker.dropSets.forEach(item => { item.parentSetIndex = Math.min(item.parentSetIndex, count - 1); });
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
        // A session may span a plan/day switch. Resolve every supported
        // exercise ID (including FBW, ULF and custom exercises) before finish.
        exercise = getHistoricalExerciseIndex(state.customExercises)
          .find(entry => entry.id === id)?.exercise;
      }
      const tracker = state.trackers[id];
      if (!exercise || !tracker) continue;
      const played = tracker.sets.filter(set => set.done && (set.kg !== '' || set.reps !== ''));
      const superPlayed = (tracker.superset?.sets || []).filter(set => set.done && Number(set.reps) > 0);
      const dropPlayed = tracker.dropSets.filter(set => set.done && Number(set.reps) > 0);
      if (!played.length && !superPlayed.length && !dropPlayed.length) continue;
      const best = played.reduce((winner, set) => Number(set.kg || 0) > Number(winner?.kg || 0) ? set : winner, played[0]);
      const allPlayed = [...played, ...superPlayed, ...dropPlayed];
      const volume = allPlayed.reduce((sum, set) => sum + Number(set.kg || 0) * Number(set.reps || 0), 0);
      // Ignore this exercise's in-progress row when comparing against prior PRs.
      const currentSessionId = `workout:${session.startedAt}`;
      const previousBest = Math.max(0, ...this.getSharedExerciseHistory(exercise)
        .filter(row => row.sessionId !== currentSessionId)
        .map(row => Number(row.bestKg || row.weight || 0)));
      const isPersonalRecord = Boolean(Number(best?.kg || 0) && previousBest > 0 && Number(best?.kg || 0) > previousBest);
      if (isPersonalRecord) personalRecords += 1;
      totalSets += allPlayed.length;
      totalReps += allPlayed.reduce((sum, set) => sum + Number(set.reps || 0), 0);
      totalVolume += volume;
      // Sets were already saved when checked. Finalize the same record,
      // or create it here for older sessions that predate immediate logging.
      const record = this._writeSessionExerciseHistory(tracker, session, { finalize: true });
      tracker.sets = Array.from({ length: tracker.targetSets }, () => blankSet('', ''));
      if (tracker.superset) tracker.superset.sets = Array.from({ length: tracker.targetSets }, () => blankSet('', ''));
      tracker.dropSets = tracker.dropSets.map(set => ({ parentSetIndex: set.parentSetIndex, ...blankSet('', '') }));
      exercises.push({
        id,
        exerciseId: id,
        title: exercise.title,
        nameAr: exercise.title,
        sets: allPlayed.length,
        setsCount: allPlayed.length,
        bestKg: record.bestKg,
        bestReps: record.bestReps,
        bestSet: record.bestKg ? `${record.bestKg} كغ × ${record.bestReps || '-'} تكرار` : `${record.bestReps || '-'} تكرار`,
        volume,
        isPersonalRecord,
        rounds: record.rounds,
        superRounds: record.superRounds,
        dropRounds: record.dropRounds,
        supersetTitle: tracker.superset?.title || null
      });
    }
    const day = this.getDay(session.dayKey);
    const planPrefix = session.dayKey.startsWith('ulf') ? 'ulf' : session.dayKey.startsWith('fbw') ? 'fbw' : session.dayKey.startsWith('saturday') || session.dayKey.startsWith('sunday') || session.dayKey.startsWith('monday') || session.dayKey.startsWith('wednesday') || session.dayKey.startsWith('thursday')
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
          rounds: e.rounds || [],
          superRounds: e.superRounds || [],
          dropRounds: e.dropRounds || [],
          supersetTitle: e.supersetTitle || null
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
