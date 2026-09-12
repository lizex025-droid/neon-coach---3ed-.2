/**
 * NEON COACH - مخزن الحالة المركزية التفاعلي (State Store)
 * يدير التخزين المحلي الآمن عبر localStorage مع استدعاء المشتركين وحفظ البيانات تلقائياً
 */

import { EMPTY_INITIAL_STATE } from './demoData.js';
import { calculateAge, calculateNutritionTargets, filterStrongestExercisePerMuscle } from '../domain/calculations.js';
import { syncService } from '../services/syncService.js';
import { executeActionTools, shoppingItemsFor, localDate } from '../domain/actionAgent.js';

const STORAGE_KEY = 'neon_coach_app_state_v1';

class Store {
  constructor() {
    this.state = this.loadState();
    this.listeners = new Set();
    syncService.setStore(this);
    this.initDailyStackSync();
  }

  initDailyStackSync() {
    try {
      if (typeof localStorage !== 'undefined') {
        const items = this.getDailyStackItems();
        this.syncSupplementsToSchedule(items);
      }
    } catch (e) {}
  }

  loadState() {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // رفض الحالات القديمة التي تحتوي على بيانات وضع تجريبي
          if (parsed && parsed.auth?.user?.id !== 'demo_user_01') {
            return parsed;
          }
          // مسح الجلسة التجريبية القديمة
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (e) {
      console.warn('تعذر قراءة الحالة من التخزين المحلي، سيتم استخدام الحالة الافتراضية:', e);
    }
    return JSON.parse(JSON.stringify(EMPTY_INITIAL_STATE));
  }

  saveState({ notify = true } = {}) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      }
      if (notify) this.notify();
    } catch (e) {
      console.error('تعذر حفظ الحالة في التخزين المحلي:', e);
    }
  }

  resetState() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    this.state = JSON.parse(JSON.stringify(EMPTY_INITIAL_STATE));
    this.saveState();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  getState() {
    return this.state;
  }

  setState(partialState, { notify = true } = {}) {
    if (!partialState || typeof partialState !== 'object') return;
    this.state = {
      ...this.state,
      ...partialState
    };
    this.saveState({ notify });
  }

  // --- دوال تبديل النمط والحساب ---
  setRole(role) {
    this.state.currentRole = role; // 'client' or 'coach'
    this.saveState();
  }

  restoreState(newState) {
    if (!newState || typeof newState !== 'object') {
      throw new Error('بيانات النسخة الاحتياطية غير صالحة');
    }
    this.state = newState;
    this.saveState();
  }

  setUserProfile(profile) {
    this.state.userProfile = { ...this.state.userProfile, ...profile };
    if (profile.birthDate) {
      this.state.userProfile.age = calculateAge(profile.birthDate);
    }
    if (profile.targetCalories !== undefined) {
      this.state.today.targetCalories = profile.targetCalories;
      if (profile.targetProtein !== undefined) this.state.today.targetProtein = profile.targetProtein;
      if (profile.targetCarbs !== undefined) this.state.today.targetCarbs = profile.targetCarbs;
      if (profile.targetFats !== undefined) this.state.today.targetFats = profile.targetFats;
      if (profile.targetWaterLiters !== undefined) this.state.today.targetWaterLiters = profile.targetWaterLiters;
      if (profile.targetGlasses !== undefined) this.state.today.targetGlasses = profile.targetGlasses;
    }
    this.saveState();

    const userId = this.state.auth?.user?.id;
    if (userId) {
      syncService.syncProfile(userId, this.state.userProfile);
    }
  }

  loginUser(userObj, provider = 'email', token = null) {
    if (!this.state.auth) {
      this.state.auth = {};
    }
    this.state.auth = {
      isAuthenticated: true,
      user: userObj,
      provider: provider,
      token: token,
      lastLoginAt: new Date().toISOString()
    };

    if (userObj) {
      if (userObj.name) this.state.userProfile.name = userObj.name;
      if (userObj.email) this.state.userProfile.email = userObj.email;
      this.state.userProfile.provider = provider;
      if (userObj.avatarUrl) this.state.userProfile.avatarUrl = userObj.avatarUrl;
    }

    this.saveState();
    this.notify();

    if (userObj?.id) {
      syncService.loadUserData(userObj.id);
    }
  }

  registerUser(userObj, provider = 'email') {
    this.loginUser(userObj, provider);
  }

  logoutUser() {
    this.state.auth = {
      isAuthenticated: false,
      user: null,
      provider: null,
      token: null
    };
    this.saveState();
    this.notify();
  }

  recalculateTargetsFromProfile() {
    const p = this.state.userProfile || {};
    const targets = calculateNutritionTargets({
      weight: p.currentWeight || 70,
      height: p.height || 170,
      birthDate: p.birthDate,
      age: p.age,
      gender: p.gender || 'male',
      activityLevel: p.activityLevel || 'light',
      goal: p.goal || 'fat_loss',
      requestedTargetCalories: p.targetCalories || p.requestedTargetCalories,
      selectedWeeklyLossRate: p.selectedWeeklyLossRate,
      weeklyLossPercent: p.weeklyLossPercent,
      dailyCalorieDeficit: p.dailyCalorieDeficit
    });

    this.state.today.targetCalories = targets.targetCalories;
    this.state.today.targetProtein = targets.protein;
    this.state.today.targetCarbs = targets.carbs;
    this.state.today.targetFats = targets.fats;
    this.state.today.targetWaterLiters = Math.round((targets.targetWaterMl / 1000) * 10) / 10;
    this.saveState();
    return targets;
  }

  // --- تتبع شرب الماء ---
  addWaterCup(amountMl = 250) {
    const currentLiters = this.state.today.consumedWaterLiters || 0;
    const newLiters = Math.round((currentLiters + (amountMl / 1000)) * 10) / 10;
    this.state.today.consumedWaterLiters = newLiters;
    const glassDelta = amountMl >= 400 ? 2 : 1;
    this.state.today.consumedGlasses = (this.state.today.consumedGlasses || 0) + glassDelta;
    this.saveState();

    const userId = this.state.auth?.user?.id;
    if (userId) {
      syncService.syncWaterLog(userId, Math.round(newLiters * 1000), this.state.today.consumedGlasses, this.state.today.targetGlasses || 10);
    }
  }

  undoWaterCup(amountMl = 250) {
    const currentLiters = this.state.today.consumedWaterLiters || 0;
    if (currentLiters <= 0 && (!this.state.today.consumedGlasses || this.state.today.consumedGlasses <= 0)) return;
    const newLiters = Math.max(0, Math.round((currentLiters - (amountMl / 1000)) * 10) / 10);
    this.state.today.consumedWaterLiters = newLiters;
    const glassDelta = amountMl >= 400 ? 2 : 1;
    this.state.today.consumedGlasses = Math.max(0, (this.state.today.consumedGlasses || glassDelta) - glassDelta);
    this.saveState();
  }

  // --- تتبع المكملات القديم والتوافق ---
  toggleSupplement(suppId, timeOfDay = 'morning') {
    const supp = this.state.supplementsSchedule.find(s => s.id === suppId);
    if (supp && supp.schedule && supp.schedule[timeOfDay]) {
      const isTaken = !supp.schedule[timeOfDay].taken;
      supp.schedule[timeOfDay].taken = isTaken;
      supp.schedule[timeOfDay].time = isTaken ? new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : null;
      this.saveState();
    }
  }

  // --- إدارة مكملات Daily Stack المتقدمة (من supplments.html) ---
  getActiveDate() {
    const now = new Date();
    if (now.getHours() < 6) now.setDate(now.getDate() - 1);
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  getDailyStackItems() {
    try {
      const stored = localStorage.getItem('daily_stack_items_v2');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    const defaultItems = [
      { id: 'item_creatine', name: 'Creatine monohydrate / كرياتين مونوهيدرات', dose: '5g', window: 'anytime', note: 'يومياً — الاستمرارية أهم من التوقيت' },
      { id: 'item_omega3', name: 'Omega-3 / أوميغا 3', dose: '2–3g EPA+DHA', window: 'lunch', note: 'مع أكبر وجبة دهنية' },
      { id: 'item_vitd3', name: 'Vitamin D3 / فيتامين د3', dose: '2000–5000 IU', window: 'lunch', note: 'يذوب في الدهون — يؤخذ مع أكبر وجبة' },
      { id: 'item_mag', name: 'Magnesium glycinate / مغنيسيوم غلايسينات', dose: '200–400mg', window: 'evening', note: 'قبل النوم بـ 30–60 دقيقة للاسترخاء' }
    ];
    this.setDailyStackItems(defaultItems);
    return defaultItems;
  }

  setDailyStackItems(items) {
    try {
      localStorage.setItem('daily_stack_items_v2', JSON.stringify(items));
    } catch (e) {}
    this.syncSupplementsToSchedule(items);
    this.saveState();
  }

  getDailyStackTaken() {
    const key = 'daily_stack_taken_v2:' + this.getActiveDate();
    try {
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {};
  }

  setDailyStackTaken(map) {
    const key = 'daily_stack_taken_v2:' + this.getActiveDate();
    try {
      localStorage.setItem(key, JSON.stringify(map));
    } catch (e) {}
    this.syncSupplementsToSchedule(this.getDailyStackItems());
    this.saveState();
  }

  getDailyStackLow() {
    try {
      const stored = localStorage.getItem('daily_stack_low_v2');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  }

  setDailyStackLow(list) {
    try {
      localStorage.setItem('daily_stack_low_v2', JSON.stringify(list));
    } catch (e) {}
    this.notify();
  }

  addDailyStackItem(name, dose, windowKey = 'anytime', note = '') {
    const items = this.getDailyStackItems();
    const newItem = {
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      name: name.trim(),
      dose: dose.trim(),
      window: windowKey,
      note: note.trim()
    };
    items.push(newItem);
    this.setDailyStackItems(items);
    return newItem;
  }

  toggleDailyStackTaken(itemId) {
    const taken = this.getDailyStackTaken();
    if (taken[itemId]) {
      delete taken[itemId];
    } else {
      taken[itemId] = Date.now();
    }
    this.setDailyStackTaken(taken);
  }

  toggleDailyStackLow(itemId) {
    const low = this.getDailyStackLow();
    const updated = low.includes(itemId) ? low.filter(id => id !== itemId) : [...low, itemId];
    this.setDailyStackLow(updated);
  }

  deleteDailyStackItem(itemId) {
    const items = this.getDailyStackItems().filter(i => i.id !== itemId);
    this.setDailyStackItems(items);
    const taken = this.getDailyStackTaken();
    delete taken[itemId];
    this.setDailyStackTaken(taken);
    const low = this.getDailyStackLow().filter(id => id !== itemId);
    this.setDailyStackLow(low);
  }

  updateDailyStackItem(itemId, field, value) {
    const items = this.getDailyStackItems();
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    if (field === 'name' && value.trim()) item.name = value.trim();
    if (field === 'meta') {
      const parts = value.trim().split(/\s*·\s*/);
      item.dose = parts[0] || '';
      item.note = parts.slice(1).join(' · ');
    }
    this.setDailyStackItems(items);
  }

  syncSupplementsToSchedule(items) {
    const taken = this.getDailyStackTaken();
    this.state.supplementsSchedule = items.map(item => {
      const isTaken = !!taken[item.id];
      return {
        id: item.id,
        nameAr: item.name,
        dose: item.dose,
        timing: item.window,
        verifiedSource: item.note || 'مضاف يدوياً',
        schedule: {
          morning: { taken: isTaken, time: isTaken ? 'تم' : null },
          evening: { taken: isTaken, time: isTaken ? 'تم' : null }
        }
      };
    });
  }

  getWaterCoachConfig() {
    try {
      const stored = localStorage.getItem('water_coach_cfg_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      appTitle: 'Water Coach',
      unit: 'glass',
      bottleMl: 500,
      glassMl: 250,
      weightKg: this.state.userProfile?.currentWeight || 75,
      weightUnit: 'kg',
      age: 25,
      sex: 'm',
      activityHrsPerWeek: 5,
      caffeineMgPerDay: 200,
      substances: []
    };
  }

  saveWaterCoachConfig(cfg) {
    try {
      localStorage.setItem('water_coach_cfg_v1', JSON.stringify(cfg));
    } catch (e) {}
    this.notify();
  }

  // --- تعديل هدف السعرات والماكروز يدوياً ---
  setTargetCalories(newCalories, customMacros = null) {
    const target = Math.max(200, Math.round(Number(newCalories) || 2000));
    this.state.today.targetCalories = target;
    if (this.state.today.dailyTargetCalories !== undefined) {
      this.state.today.dailyTargetCalories = target;
    }

    if (customMacros && (customMacros.protein !== undefined || customMacros.carbs !== undefined || customMacros.fats !== undefined)) {
      if (customMacros.protein !== undefined) this.state.today.targetProtein = Math.max(0, Math.round(Number(customMacros.protein) || 0));
      if (customMacros.carbs !== undefined) this.state.today.targetCarbs = Math.max(0, Math.round(Number(customMacros.carbs) || 0));
      if (customMacros.fats !== undefined) this.state.today.targetFats = Math.max(0, Math.round(Number(customMacros.fats) || 0));
    } else {
      // إعادة توزيع الماكروز تلقائياً بنسب علمية متوازنة وتطابق رياضي تام
      const userWeight = this.state.userProfile?.currentWeight || 75;
      const userGoal = this.state.userProfile?.goal || 'fat_loss';
      const targets = calculateNutritionTargets({
        weight: userWeight,
        goal: userGoal,
        requestedTargetCalories: target
      });

      this.state.today.targetProtein = targets.protein;
      this.state.today.targetFats = targets.fats;
      this.state.today.targetCarbs = targets.carbs;
    }

    if (this.state.userProfile) {
      this.state.userProfile.targetCalories = target;
      this.state.userProfile.requestedTargetCalories = target;
      this.state.userProfile.targetProtein = this.state.today.targetProtein;
      this.state.userProfile.targetCarbs = this.state.today.targetCarbs;
      this.state.userProfile.targetFats = this.state.today.targetFats;
    }

    this.saveState();
  }

  // --- تتبع الطاقة اليومية (1-5) ---
  setEnergyLevel(level) {
    this.state.today.energyLevel = Math.max(1, Math.min(5, level));
    this.saveState();
  }

  // --- إدارة جلسة التمرين النشطة ---
  startWorkoutSession() {
    this.state.today.workoutStatus = 'in_progress';
    this.state.activeWorkoutSession.startedAtTimestamp = Date.now() - (this.state.activeWorkoutSession.elapsedSeconds * 1000);
    this.saveState();
  }

  updateWorkoutSet(setIndex, field, value) {
    const exercise = this.state.activeWorkoutSession.currentExercise;
    if (exercise && exercise.sets[setIndex]) {
      exercise.sets[setIndex][field] = value;
      this.saveState();
    }
  }

  toggleSetCompletion(setIndex) {
    const exercise = this.state.activeWorkoutSession.currentExercise;
    if (exercise && exercise.sets[setIndex]) {
      exercise.sets[setIndex].completed = !exercise.sets[setIndex].completed;
      this.saveState();
    }
  }

  addWorkoutSet() {
    const exercise = this.state.activeWorkoutSession.currentExercise;
    if (exercise) {
      const lastSet = exercise.sets[exercise.sets.length - 1] || { weight: 70, reps: 10, rpe: 8 };
      exercise.sets.push({
        setNumber: exercise.sets.length + 1,
        weight: lastSet.weight,
        reps: lastSet.reps,
        rpe: lastSet.rpe,
        completed: false
      });
      this.saveState();
    }
  }

  logWorkoutPain(location, severity, note) {
    this.state.activeWorkoutSession.painReports.push({
      timestamp: new Date().toISOString(),
      location,
      severity,
      note
    });
    this.saveState();
  }

  finishWorkoutSession(customData = null) {
    if (this.state.today.workoutStatus === 'completed' && !customData) return; // منع إنهاء الجلسة مرتين
    this.state.today.workoutStatus = 'completed';
    this.state.today.isWorkoutCompleted = true;

    const now = new Date();
    const dateLabel = new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'short' }).format(now);
    const active = this.state.activeWorkoutSession;
    const currentEx = active?.currentExercise;
    const completedSets = (currentEx?.sets || []).filter(s => s.completed);
    const bestSetObj = completedSets.length > 0 
      ? completedSets.reduce((max, s) => (Number(s.weight) > Number(max.weight) ? s : max), completedSets[0])
      : { weight: 70, reps: 10 };

    const newSessionRecord = {
      id: 'hist_' + Date.now(),
      title: customData?.title || active?.sessionNameAr || 'صدر وترايسبس',
      dateLabel: customData?.dateLabel || dateLabel,
      durationMinutes: customData?.durationMinutes || Math.max(1, Math.round((active?.elapsedSeconds || 1800) / 60)),
      totalVolumeKg: customData?.totalVolumeKg || 8450,
      totalSets: customData?.totalSets || Math.max(currentEx?.sets?.length || 3, 16),
      totalReps: customData?.totalReps || 160,
      exercises: filterStrongestExercisePerMuscle(customData?.exercises || [
        {
          nameAr: currentEx?.nameAr || 'ضغط بار مستوي (Bench Press)',
          bestSet: `${bestSetObj.weight || 72.5} كغ × ${bestSetObj.reps || 9} تكرارات`,
          setsCount: currentEx?.sets?.length || 3
        },
        {
          nameAr: 'ضغط دمبلز مائل (Incline DB Press)',
          bestSet: '32 كغ × 10 تكرارات',
          setsCount: 3
        },
        {
          nameAr: 'ضغط ترايسبس بالكيبل (Triceps Pushdown)',
          bestSet: '35 كغ × 12 تكرار',
          setsCount: 4
        }
      ])
    };

    if (!Array.isArray(this.state.workoutHistory)) {
      this.state.workoutHistory = [];
    }
    this.state.workoutHistory.unshift(newSessionRecord);

    // حفظ الجلسة في سجل تاريخ التمارين
    try {
      if (typeof localStorage !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('neon_workout_history_v1') || '[]');
        existing.unshift(newSessionRecord);
        localStorage.setItem('neon_workout_history_v1', JSON.stringify(existing.slice(0, 50)));
      }
    } catch (e) {}

    this.saveState();
  }

  getWorkoutHistory() {
    // 1. التحقق من السجلات في state أولاً
    if (Array.isArray(this.state.workoutHistory) && this.state.workoutHistory.length > 0) {
      return this.state.workoutHistory.map(session => ({
        ...session,
        exercises: filterStrongestExercisePerMuscle(session.exercises || [])
      }));
    }

    try {
      if (typeof localStorage !== 'undefined') {
        // 2. التحقق من السجلات المحلية المسجلة عبر التطبيق
        const keys = ['neon_workout_history_v1', 'fortyDay_workout_history_v1', 'hasm_workout_history_v1'];
        for (const key of keys) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return parsed.map(item => ({
                id: item.id || 'hist_' + Math.random().toString(36).slice(2, 7),
                title: item.title || item.sessionNameAr || 'جلسة تدريبية',
                dateLabel: item.dateLabel || 'مؤخراً',
                durationMinutes: item.durationMinutes || (item.durationSeconds ? Math.round(item.durationSeconds / 60) : 0),
                totalVolumeKg: item.totalVolumeKg || item.totalVolume || 0,
                totalSets: item.totalSets || (item.exercises ? item.exercises.reduce((sum, e) => sum + (e.sets || 3), 0) : 0),
                totalReps: item.totalReps || 0,
                exercises: filterStrongestExercisePerMuscle((item.exercises || []).map(ex => ({
                  nameAr: ex.nameAr || ex.title || 'تمرين',
                  bestSet: ex.bestSet || (ex.bestKg ? `${ex.bestKg} كغ × ${ex.bestReps || '-'} تكرار` : (ex.sets ? `${ex.sets} جولات` : '')),
                  setsCount: ex.setsCount || ex.sets || 0
                })))
              }));
            }
          }
        }
      }
    } catch (e) {}

    // لا يوجد سجل بعد — يُعاد مصفوفة فارغة
    return [];
  }

  // --- إدارة أسماء وتصنيفات الوجبات المخصصة ---
  getCustomMealNames() {
    if (!Array.isArray(this._customMealNames)) {
      this._customMealNames = [];
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem('neon_custom_meal_names');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) this._customMealNames = parsed;
          }
        }
      } catch (e) {}
    }
    return [...this._customMealNames];
  }

  saveCustomMealName(name) {
    const trimmed = (name || '').trim();
    if (!trimmed) return;
    const defaults = ['فطور', 'غداء', 'عشاء', 'سناك'];
    if (defaults.includes(trimmed)) return;

    const current = this.getCustomMealNames();
    if (!current.includes(trimmed)) {
      current.push(trimmed);
      this._customMealNames = current;
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('neon_custom_meal_names', JSON.stringify(current));
        }
      } catch (e) {}
    }
  }

  deleteCustomMealName(name) {
    const current = this.getCustomMealNames();
    const updated = current.filter(n => n !== name);
    this._customMealNames = updated;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('neon_custom_meal_names', JSON.stringify(updated));
      }
    } catch (e) {}
  }

  getAllMealCategoryNames() {
    const defaults = ['فطور', 'غداء', 'عشاء', 'سناك'];
    return [...defaults, ...this.getCustomMealNames()];
  }

  // --- تسجيل الوجبات وتحديث المجاميع ---
  logMeal(meal) {
    const newLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      date: localDate(),
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      titleAr: meal.titleAr || 'وجبة جديدة',
      calories: Number(meal.calories ?? meal.totalCalories) || 0,
      protein: Number(meal.protein ?? meal.totalProtein) || 0,
      carbs: Number(meal.carbs ?? meal.totalCarbs) || 0,
      fats: Number(meal.fats ?? meal.totalFats) || 0,
      items: meal.items || []
    };

    this.state.loggedMeals.push(newLog);
    this.recalculateDailyNutrition();
    this.saveState();

    const userId = this.state.auth?.user?.id;
    if (userId) {
      syncService.syncMealLog(userId, {
        name: newLog.titleAr,
        calories: newLog.calories,
        protein: newLog.protein,
        carbs: newLog.carbs,
        fats: newLog.fats,
        items: newLog.items,
      });
    }

    return newLog;
  }

  updateLoggedMeal(logId, updatedData) {
    const index = this.state.loggedMeals.findIndex(m => m.id === logId);
    if (index !== -1) {
      this.state.loggedMeals[index] = { ...this.state.loggedMeals[index], ...updatedData };
      this.recalculateDailyNutrition();
      this.saveState();
    }
  }

  deleteLoggedMeal(logId) {
    this.state.loggedMeals = this.state.loggedMeals.filter(m => m.id !== logId);
    this.recalculateDailyNutrition();
    this.saveState();
  }

  recalculateDailyNutrition() {
    let cals = 0;
    let p = 0;
    let c = 0;
    let f = 0;
    for (const meal of this.state.loggedMeals) {
      if (meal.date && meal.date !== this.state.today.date) continue;
      cals += meal.calories || 0;
      p += meal.protein || 0;
      c += meal.carbs || 0;
      f += meal.fats || 0;
    }
    this.state.today.consumedCalories = cals;
    this.state.today.consumedProtein = p;
    this.state.today.consumedCarbs = c;
    this.state.today.consumedFats = f;
  }

  // --- تبديل وجبة في الخطة اليومية ---
  swapMealPlan(mealId, newSwap) {
    const meal = this.state.mealPlan.meals.find(m => m.id === mealId);
    if (meal) {
      meal.titleAr = newSwap.titleAr;
      meal.calories = newSwap.calories;
      meal.protein = newSwap.protein;
      meal.carbs = newSwap.carbs;
      meal.fats = newSwap.fats;
      this.saveState();
    }
  }

  // --- المتابعة الأسبوعية ---
  submitWeeklyCheckin(checkinData) {
    this.state.weeklyCheckin = {
      ...this.state.weeklyCheckin,
      ...checkinData,
      submittedAt: new Date().toISOString()
    };
    // تحديث الوزن الحالي في الملف
    if (checkinData.currentWeight) {
      this.state.userProfile.currentWeight = Number(checkinData.currentWeight);
    }
    this.saveState();
  }

  // --- تسجيل قياسات تقرير التقدم وInBody ---
  logProgressMeasurement({ weight, waistCm, benchPressKg }) {
    if (!this.state.progressReport) return;
    const rep = this.state.progressReport;
    if (weight !== undefined && weight !== '' && !isNaN(Number(weight))) {
      const w = Number(weight);
      rep.currentDay.weight = w;
      if (this.state.userProfile) {
        this.state.userProfile.currentWeight = w;
      }
      rep.weightChangeKg = Math.round((w - rep.firstDay.weight) * 10) / 10;
      if (!rep.weightTrendData) rep.weightTrendData = [];
      rep.weightTrendData.push({ day: rep.periodDays || 90, weight: w });
    }
    if (waistCm !== undefined && waistCm !== '' && !isNaN(Number(waistCm))) {
      rep.currentDay.waistCm = Number(waistCm);
    }
    if (benchPressKg !== undefined && benchPressKg !== '' && !isNaN(Number(benchPressKg))) {
      const b = Number(benchPressKg);
      rep.currentDay.benchPressKg = b;
      if (!rep.strengthTrendData) rep.strengthTrendData = [];
      rep.strengthTrendData.push({ day: rep.periodDays || 90, weight: b });
    }
    this.saveState();
  }

  updateInBodyResult({ bodyFatPercentage, skeletalMuscleMassKg, visceralFatLevel, provider }) {
    if (!this.state.progressReport) return;
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    this.state.progressReport.inBodyResult = {
      hasResult: true,
      testDate: dateStr,
      provider: provider || 'InBody Analysis',
      bodyFatPercentage: Number(bodyFatPercentage) || 0,
      skeletalMuscleMassKg: Number(skeletalMuscleMassKg) || 0,
      visceralFatLevel: Number(visceralFatLevel) || 0
    };
    this.saveState();
  }

  // --- اعتماد خطة من المدرب ---
  approveClientPlan(clientId, notes = '') {
    this.state.mealPlan.status = 'approved_by_coach';
    this.state.mealPlan.approvedAt = new Date().toISOString();
    this.state.progressReport.coachNotes = notes || 'تمت مراجعة واعتماد الخطة بنجاح.';
    this.saveState();
  }

  // --- إدارة وحفظ ذاكرة محادثات الذكاء الاصطناعي ---
  getActionContext() {
    const taken = this.getDailyStackTaken();
    const supplementsSchedule = (this.state.supplementsSchedule || []).map(item => ({
      ...item, schedule: { morning: { ...item.schedule?.morning, taken: !!taken[item.id] }, evening: { ...item.schedule?.evening, taken: !!taken[item.id] } }
    }));
    return { ...this.state, actionSupplementTaken: taken, supplementsSchedule };
  }

  executeAgentTools(tools) {
    const context = this.getActionContext();
    const result = executeActionTools(context, tools);
    if (!result.changed) return result;
    const next = result.state;
    // Keep the existing standalone supplement and workout screens on the same records.
    const writes = [[STORAGE_KEY, JSON.stringify(next)]];
    if (JSON.stringify(next.actionSupplementTaken) !== JSON.stringify(context.actionSupplementTaken)) {
      writes.unshift(['daily_stack_taken_v2:' + this.getActiveDate(), JSON.stringify(next.actionSupplementTaken || {})]);
    }
    if (JSON.stringify(next.workoutHistory) !== JSON.stringify(context.workoutHistory)) {
      writes.unshift(['neon_workout_history_v1', JSON.stringify(next.workoutHistory || [])]);
    }
    const previous = [];
    try {
      if (typeof localStorage !== 'undefined') {
        for (const [key, value] of writes) {
          previous.push([key, localStorage.getItem(key)]);
          localStorage.setItem(key, value);
        }
      }
    } catch (error) {
      for (const [key, value] of previous.reverse()) {
        try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); } catch { /* Keep in-memory state unchanged. */ }
      }
      throw new Error('تعذر حفظ الإجراء في المتصفح. تحقق من مساحة التخزين وحاول مجدداً.');
    }
    this.state = next;
    // The chat updates its live panel without destroying the microphone session.
    return result;
  }

  getShoppingItems() { return shoppingItemsFor(this.state); }

  setShoppingItems(items) {
    this.state.shoppingItems = items;
    this.saveState();
  }

  getAiChatHistory() {
    if (!this.state.aiChatHistory) {
      this.state.aiChatHistory = [];
    }
    return this.state.aiChatHistory;
  }

  saveAiChatMessage(message) {
    if (!this.state.aiChatHistory) {
      this.state.aiChatHistory = [];
    }
    this.state.aiChatHistory.push({
      ...message,
      timestamp: message.timestamp || Date.now()
    });
    // الحفاظ على آخر 60 رسالة لتجنب التضخم مع الحفاظ على عمق الذاكرة
    if (this.state.aiChatHistory.length > 60) {
      this.state.aiChatHistory = this.state.aiChatHistory.slice(-60);
    }
    this.saveState({ notify: false });
  }

  clearAiChatHistory() {
    this.state.aiChatHistory = [];
    this.saveState();
  }
}

export const store = new Store();
