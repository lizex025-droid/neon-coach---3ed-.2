/**
 * NEON COACH - خدمة المزامنة السحابية المركزية (Cloud Sync Service)
 * تتولى المزامنة التلقائية والآمنة 100% بين ذاكرة التطبيق (Store) وقاعدة بيانات Supabase
 * مع دعم الوضع المحلي (Offline-first / Demo Mode) دون أي توقف.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { localDate } from '../domain/actionAgent.js';
import { getOrCreateGuestUserId } from '../utils/userId.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function resolveValidUserId(userId) {
  if (userId && UUID_REGEX.test(userId)) return userId;
  return getOrCreateGuestUserId();
}

let storeInstance = null;

class SyncService {
  constructor() {
    this.isSyncing = false;
  }

  setStore(store) {
    storeInstance = store;
  }

  getStore() {
    return storeInstance;
  }

  /**
   * جلب كافة بيانات المتدرب من Supabase وتحديث الـ Store
   */
  async loadUserData(userId) {
    const store = this.getStore();
    const effectiveUserId = (userId && userId !== 'guest') ? userId : store?.getUserId?.();
    if (!isSupabaseConfigured() || !effectiveUserId) {
      return { success: false, reason: 'unconfigured_or_guest' };
    }

    try {
      this.isSyncing = true;

      // المحاولة الأولى: عبر خادم الأوامر واللقطة السحابية المركزية
      try {
        const { restoreNeonConversation } = await import('./submitNeonCommand.js');
        const restored = await restoreNeonConversation();
        if (restored && restored.status !== 'error') {
          store?.notify();
          return { success: true };
        }
      } catch (backendErr) {
        // الخادم المخصص غير متاح — الانتقال للمزامنة المباشرة من جداول Supabase
      }

      // المحاولة الثانية: استعلامات Supabase المباشرة للملف والوجبات وسجل الماء
      const todayStr = localDate();

      // 1. جلب الملف الشخصي
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', effectiveUserId)
        .maybeSingle();

      if (profile && store) {
        const local = store.getState().userProfile || {};
        store.setUserProfile({
          name: profile.name || local.name || '',
          email: profile.email || local.email || '',
          age: profile.age ?? local.age ?? 0,
          gender: profile.gender || local.gender || 'male',
          height: profile.height ?? local.height ?? 0,
          currentWeight: profile.current_weight ?? local.currentWeight ?? 0,
          targetWeight: profile.target_weight ?? local.targetWeight ?? 0,
          goal: profile.fitness_goal || local.goal || 'fat_loss',
          weeklyLossPercent: profile.weekly_loss_percent != null ? Number(profile.weekly_loss_percent) : local.weeklyLossPercent,
          weeklyLossKg: profile.weekly_loss_kg != null ? Number(profile.weekly_loss_kg) : local.weeklyLossKg,
          dailyCalorieDeficit: profile.daily_calorie_deficit != null ? Number(profile.daily_calorie_deficit) : local.dailyCalorieDeficit,
          requestedCalories: profile.requested_calories != null ? Number(profile.requested_calories) : local.requestedCalories,
          estimatedGoalWeeks: profile.estimated_goal_weeks != null ? Number(profile.estimated_goal_weeks) : local.estimatedGoalWeeks,
          weightLossRiskLevel: profile.weight_loss_risk_level || local.weightLossRiskLevel,
          activityLevel: profile.activity_level || local.activityLevel || 'light',
          workoutDaysCount: profile.training_days_per_week || local.workoutDaysCount || 0,
          equipment: profile.equipment || local.equipment || 'gym',
          injuries: profile.injuries || local.injuries || [],
          allergens: profile.allergies || local.allergens || [],
          likedFoods: profile.liked_foods || local.likedFoods || [],
          dislikedFoods: profile.disliked_foods || local.dislikedFoods || [],
          targetCalories: profile.target_calories || local.targetCalories || 0,
          targetProtein: profile.target_protein || local.targetProtein || 0,
          targetCarbs: profile.target_carbs || local.targetCarbs || 0,
          targetFats: profile.target_fats || local.targetFats || 0,
          targetWaterLiters: profile.target_water_liters || local.targetWaterLiters || 0,
          targetGlasses: profile.target_glasses || local.targetGlasses || 0,
          onboardingCompleted: !!(profile.onboarding_completed || local.onboardingCompleted),
          onboarding_completed: !!(profile.onboarding_completed || local.onboardingCompleted),
        }, { skipSync: true });
      }

      // 2. جلب وجبات اليوم
      const { data: meals } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('user_id', effectiveUserId)
        .eq('date', todayStr);

      if (meals && meals.length > 0 && store) {
        const formattedMeals = meals.map(m => ({
          ...m,
          titleAr: m.titleAr || m.name || 'وجبة مسجلة'
        }));
        const totalCals = formattedMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
        const totalP = formattedMeals.reduce((sum, m) => sum + (Number(m.protein) || 0), 0);
        const totalC = formattedMeals.reduce((sum, m) => sum + (Number(m.carbs) || 0), 0);
        const totalF = formattedMeals.reduce((sum, m) => sum + (Number(m.fats) || 0), 0);

        store.setState({
          today: {
            ...store.getState().today,
            consumedCalories: totalCals,
            consumedProtein: Math.round(totalP),
            consumedCarbs: Math.round(totalC),
            consumedFats: Math.round(totalF),
          },
          loggedMeals: formattedMeals,
        });
      }

      // 3. جلب سجل الماء لليوم
      const { data: water } = await supabase
        .from('water_logs')
        .select('*')
        .eq('user_id', effectiveUserId)
        .eq('date', todayStr)
        .maybeSingle();

      if (water && store) {
        store.setState({
          today: {
            ...store.getState().today,
            consumedGlasses: water.consumed_glasses || 0,
            consumedWaterLiters: Number(((water.consumed_ml || 0) / 1000).toFixed(2)),
          },
        });
      }

      // 4. جلب سجلات التمارين والجلسات السابقة من Supabase
      try {
        const { data: workouts } = await supabase
          .from('workout_logs')
          .select('*')
          .eq('user_id', effectiveUserId)
          .order('date', { ascending: false })
          .limit(50);

        if (workouts && workouts.length > 0 && store) {
          const formattedHistory = workouts.map(w => ({
            id: w.id || 'hist_' + Date.now(),
            title: w.workout_title || 'جلسة تدريبية',
            programType: w.program_type || 'hasm',
            dateLabel: w.date || 'مؤخراً',
            durationMinutes: w.duration_minutes || 45,
            totalVolumeKg: Number(w.total_volume_kg || 0),
            totalSets: Array.isArray(w.exercises) ? w.exercises.reduce((sum, e) => sum + (e.sets || e.setsCount || 0), 0) : 0,
            totalReps: Array.isArray(w.exercises) ? w.exercises.reduce((sum, e) => sum + (e.totalReps || 0), 0) : 0,
            exercises: (w.exercises || []).map(ex => ({
              nameAr: ex.nameAr || ex.title || 'تمرين',
              bestSet: ex.bestSet || (ex.bestKg ? `${ex.bestKg} كغ × ${ex.bestReps || '-'} تكرار` : ''),
              setsCount: ex.setsCount || ex.sets || 0,
              bestKg: ex.bestKg || 0,
              bestReps: ex.bestReps || 0,
              volume: ex.volume || 0,
              rounds: ex.rounds || []
            }))
          }));

          store.setState({ workoutHistory: formattedHistory }, { notify: false });
        }
      } catch (wErr) {
        console.warn('فشل جلب سجلات التمارين من السحابة:', wErr);
      }

      // 5. جلب حالة المستخدم وأوزان التمارين النشطة من user_state
      try {
        const { data: userStateRow } = await supabase
          .from('user_state')
          .select('payload')
          .eq('user_id', effectiveUserId)
          .maybeSingle();

        if (userStateRow?.payload) {
          const { fortyDayWorkoutService } = await import('./fortyDayWorkoutService.js');
          fortyDayWorkoutService.loadRemoteState(userStateRow.payload);
        }
      } catch (sErr) {
        console.warn('فشل جلب حالة التمارين النشطة من السحابة:', sErr);
      }

      store?.notify();
      return { success: true };

    } catch (err) {
      console.warn('تعذر استكمال المزامنة السحابية:', err);
      return { success: false, error: err.message };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * حفظ أو تحديث البروفايل والأهداف
   */
  async syncProfile(userId, profileData) {
    if (!isSupabaseConfigured() || !userId) return null;
    const validUserId = resolveValidUserId(userId);
    try {
      // نبني الـ payload فقط بالأعمدة الموجودة فعلاً في جدول profiles
      const payload = {
        id: validUserId,
        name: profileData.name,
        email: profileData.email,
        age: profileData.age,
        gender: profileData.gender,
        height: profileData.height,
        current_weight: profileData.currentWeight ?? profileData.weight,
        target_weight: profileData.targetWeight,
        activity_level: profileData.activityLevel || 'light',
        fitness_goal: profileData.goal || 'fat_loss',
        training_days_per_week: profileData.workoutDaysCount,
        equipment: profileData.equipment || 'gym',
        injuries: Array.isArray(profileData.injuries) ? profileData.injuries : [],
        allergies: Array.isArray(profileData.allergens) ? profileData.allergens : [],
        liked_foods: Array.isArray(profileData.likedFoods) ? profileData.likedFoods : [],
        disliked_foods: Array.isArray(profileData.dislikedFoods) ? profileData.dislikedFoods : [],
        target_calories: profileData.targetCalories,
        target_protein: profileData.targetProtein,
        target_carbs: profileData.targetCarbs,
        target_fats: profileData.targetFats,
        target_water_liters: profileData.targetWaterLiters,
        target_glasses: profileData.targetGlasses,
        onboarding_completed: profileData.onboardingCompleted ?? true,
        updated_at: new Date().toISOString(),
      };

      // إضافة الأعمدة الاختيارية فقط إذا كانت موجودة (لتجنب فشل الأعمدة غير الموجودة)
      if (profileData.birthDate !== undefined) payload.birthdate = profileData.birthDate;
      if (profileData.weeklyLossPercent !== undefined) payload.weekly_loss_percent = profileData.weeklyLossPercent;
      if (profileData.weeklyLossKg !== undefined) payload.weekly_loss_kg = profileData.weeklyLossKg;
      if (profileData.dailyCalorieDeficit !== undefined) payload.daily_calorie_deficit = profileData.dailyCalorieDeficit;
      if (profileData.requestedCalories !== undefined) payload.requested_calories = profileData.requestedCalories;
      if (profileData.estimatedGoalWeeks !== undefined) payload.estimated_goal_weeks = profileData.estimatedGoalWeeks;
      if (profileData.weightLossRiskLevel !== undefined) payload.weight_loss_risk_level = profileData.weightLossRiskLevel;

      const { data, error } = await supabase
        .from('profiles')
        .upsert(payload);
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('فشل مزامنة البروفايل:', err);
      return null;
    }
  }

  /**
   * مزامنة وجبة جديدة
   */
  async syncMealLog(userId, meal) {
    if (!isSupabaseConfigured() || !userId) return null;
    const validUserId = resolveValidUserId(userId);
    try {
      const isUuid = meal.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(meal.id);
      const payload = {
        user_id: validUserId,
        date: meal.date || localDate(),
        meal_type: meal.meal_type || 'meal',
        name: meal.name || meal.titleAr || 'وجبة جديدة',
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fats: meal.fats,
        items: meal.items || [],
      };
      if (isUuid) {
        payload.id = meal.id;
      }
      const { data, error } = await supabase
        .from('meal_logs')
        .insert(payload)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('فشل مزامنة الوجبة:', err);
      return null;
    }
  }

  async persistManualMeal(userId, id, update = null) {
    if (!isSupabaseConfigured() || !userId) return null;
    const validUserId = resolveValidUserId(userId);
    const isMealUuid = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isMealUuid) return null;

    try {
      const query = update 
        ? supabase.from('meal_logs').update({ 
            name: update.titleAr || update.name || 'وجبة معدلة', 
            calories: update.calories, 
            protein: update.protein, 
            carbs: update.carbs, 
            fats: update.fats, 
            items: update.items 
          }) 
        : supabase.from('meal_logs').delete();

      const { data, error } = await query.eq('user_id', validUserId).eq('id', id).select('id');
      if (error) {
        console.warn('خطأ في مزامنة الوجبة سحابياً:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.warn('تعذر حفظ تعديل/حذف الوجبة سحابياً:', err);
      return null;
    }
  }

  /**
   * مزامنة استهلاك الماء اليومي
   */
  async syncWaterLog(userId, consumedMl, glassesCount, targetGlasses = 10) {
    if (!isSupabaseConfigured() || !userId) return null;
    const validUserId = resolveValidUserId(userId);
    try {
      const todayStr = localDate();
      const { data, error } = await supabase
        .from('water_logs')
        .upsert({
          user_id: validUserId,
          date: todayStr,
          consumed_ml: consumedMl,
          consumed_glasses: glassesCount,
          target_glasses: targetGlasses,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,date' });
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('فشل مزامنة الماء:', err);
      return null;
    }
  }

  /**
   * مزامنة جلسة تمرين منجزة بكامل تفاصيل الأوزان والجولات
   */
  async syncWorkoutLog(userId, workout) {
    if (!isSupabaseConfigured() || !userId) return null;
    const validUserId = resolveValidUserId(userId);
    try {
      const { data, error } = await supabase
        .from('workout_logs')
        .insert({
          user_id: validUserId,
          workout_title: workout.title || workout.workout_title || 'جلسة تدريبية',
          program_type: workout.programType || workout.program_type || 'hasm',
          date: workout.date || localDate(),
          duration_minutes: workout.durationMinutes || workout.duration_minutes || 50,
          total_volume_kg: workout.totalVolumeKg || workout.total_volume_kg || 0,
          completed: true,
          exercises: workout.exercises || [],
          notes: workout.notes || '',
        })
        .select();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('فشل مزامنة التمرين في workout_logs:', err);
      return null;
    }
  }

  /**
   * مزامنة الأوزان القياسية (PRs) وسجل التمرين الفردي
   */
  async syncExerciseRecord(userId, record) {
    if (!isSupabaseConfigured() || !userId || !record?.exercise_id) return null;
    const validUserId = resolveValidUserId(userId);
    try {
      const { data, error } = await supabase
        .from('exercise_records')
        .upsert({
          user_id: validUserId,
          exercise_id: record.exercise_id,
          exercise_name: record.exercise_name || 'تمرين',
          max_weight_kg: Number(record.max_weight_kg || 0),
          max_reps: Number(record.max_reps || 0),
          estimated_1rm: Number(record.estimated_1rm || 0),
          achieved_date: record.achieved_date || localDate(),
          notes: record.notes || '',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,exercise_id' })
        .select();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('فشل مزامنة سجل التمرين في exercise_records:', err);
      return null;
    }
  }

  /**
   * مزامنة جماعية لسجلات أوزان التمارين في exercise_records
   */
  async syncExerciseRecords(userId, records) {
    if (!isSupabaseConfigured() || !userId || !Array.isArray(records) || records.length === 0) return null;
    const validUserId = resolveValidUserId(userId);
    try {
      const rows = records.map(r => ({
        user_id: validUserId,
        exercise_id: r.exercise_id,
        exercise_name: r.exercise_name || 'تمرين',
        max_weight_kg: Number(r.max_weight_kg || 0),
        max_reps: Number(r.max_reps || 0),
        estimated_1rm: Number(r.estimated_1rm || 0),
        achieved_date: r.achieved_date || localDate(),
        notes: r.notes || '',
        updated_at: new Date().toISOString(),
      }));
      const { data, error } = await supabase
        .from('exercise_records')
        .upsert(rows, { onConflict: 'user_id,exercise_id' })
        .select();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('فشل المزامنة الجماعية لسجلات التمارين:', err);
      return null;
    }
  }

  /**
   * حفظ حالة التمارين المفتوحة والمدخلات الحالية للأوزان في user_state
   */
  async syncUserState(userId, payload) {
    if (!isSupabaseConfigured() || !userId || !payload) return null;
    const validUserId = resolveValidUserId(userId);
    try {
      const safePayload = typeof payload === 'object' ? payload : { data: payload };
      const { data, error } = await supabase
        .from('user_state')
        .upsert({
          user_id: validUserId,
          payload: safePayload,
          revision: Date.now(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('فشل مزامنة user_state:', err);
      return null;
    }
  }

  /**
   * مزامنة قياسات وفحص InBody ووزن الجسم
   */
  async syncInbodyRecord(userId, record) {
    if (!isSupabaseConfigured() || !userId) return null;
    const validUserId = resolveValidUserId(userId);
    try {
      const { data, error } = await supabase
        .from('inbody_records')
        .insert({
          user_id: validUserId,
          date: record.date || localDate(),
          weight: record.weight,
          body_fat_pct: record.bodyFatPct || null,
          muscle_mass_kg: record.muscleMassKg || null,
          water_pct: record.waterPct || null,
          visceral_fat: record.visceralFat || null,
          chest_cm: record.chestCm || null,
          waist_cm: record.waistCm || null,
          hips_cm: record.hipsCm || null,
          arms_cm: record.armsCm || null,
          thighs_cm: record.thighsCm || null,
          photo_urls: record.photoUrls || [],
          inbody_pdf_url: record.pdfUrl || null,
          notes: record.notes || '',
        });
      if (error) throw error;

      // تحديث وزن المستخدم الحالي في ملف profiles تلقائياً
      if (record.weight) {
        await supabase
          .from('profiles')
          .update({ current_weight: record.weight })
          .eq('id', userId);
      }

      return data;
    } catch (err) {
      console.warn('فشل مزامنة InBody:', err);
      return null;
    }
  }

  /**
   * مزامنة تقييم طاقة اليوم
   */
  async syncEnergyLog(userId, energyLevel, sleepHours = null, mood = '') {
    if (!isSupabaseConfigured() || !userId) return null;
    try {
      const todayStr = localDate();
      const { data, error } = await supabase
        .from('daily_energy_logs')
        .upsert({
          user_id: userId,
          date: todayStr,
          energy_level: energyLevel,
          sleep_hours: sleepHours,
          mood: mood,
        }, { onConflict: 'user_id,date' });
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('فشل مزامنة الطاقة:', err);
      return null;
    }
  }

  /**
   * مزامنة رسائل وشات NEON AI
   */
  async syncAiMessage(userId, conversationId, role, content, metadata = {}) {
    if (!isSupabaseConfigured() || !userId || !conversationId) return null;
    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .insert({
          conversation_id: conversationId,
          user_id: userId,
          role: role,
          content: content,
          metadata: metadata,
        });
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('فشل مزامنة رسالة الذكاء الاصطناعي:', err);
      return null;
    }
  }

  /**
   * مزامنة صنف غذائي مخصص لقاعدة بيانات Supabase
   */
  async saveCustomFood(food) {
    if (!isSupabaseConfigured() || !food) return null;
    const userId = this.getStore()?.getUserId?.() || this.getStore()?.state?.auth?.user?.id;
    if (!userId) return null;

    try {
      const cal = Math.round(Number(food.per100?.kcal ?? food.caloriesPer100g ?? 0));
      const p = Number(food.per100?.p ?? food.proteinPer100g ?? 0);
      const c = Number(food.per100?.c ?? food.carbsPer100g ?? 0);
      const f = Number(food.per100?.f ?? food.fatsPer100g ?? 0);
      const size = Number(food.baseWeight ?? food.servingSize ?? 100);

      const { data, error } = await supabase
        .from('custom_foods')
        .insert({
          id: food.id,
          user_id: userId,
          name: food.nameAr || food.name,
          category: food.category || 'عام',
          calories: cal,
          calories_per_100g: cal,
          protein: p,
          protein_per_100g: p,
          carbs: c,
          carbs_per_100g: c,
          fats: f,
          fats_per_100g: f,
          serving_size: size,
          serving_size_g: size,
          serving_unit: food.servingUnit || 'g'
        });
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('فشل حفظ الصنف المخصص سحابياً في Supabase:', err);
      return null;
    }
  }

  /**
   * تحديث صنف مخصص في Supabase
   */
  async updateCustomFood(foodId, food) {
    if (!isSupabaseConfigured() || !foodId || !food) return null;
    const userId = this.getStore()?.getUserId?.() || this.getStore()?.state?.auth?.user?.id;
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('custom_foods')
        .update({
          name: food.nameAr || food.name,
          category: food.category || 'عام',
          calories: food.per100?.kcal || food.caloriesPer100g || 0,
          protein: food.per100?.p || food.proteinPer100g || 0,
          carbs: food.per100?.c || food.carbsPer100g || 0,
          fats: food.per100?.f || food.fatsPer100g || 0,
          serving_size: food.baseWeight || 100
        })
        .match({ id: foodId, user_id: userId });
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('فشل تحديث الصنف المخصص سحابياً في Supabase:', err);
      return null;
    }
  }

  /**
   * حذف صنف مخصص من Supabase
   */
  async deleteCustomFood(foodId) {
    if (!isSupabaseConfigured() || !foodId) return null;
    const userId = this.getStore()?.getUserId?.() || this.getStore()?.state?.auth?.user?.id;
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('custom_foods')
        .delete()
        .match({ id: foodId, user_id: userId });
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('فشل حذف الصنف المخصص سحابياً في Supabase:', err);
      return null;
    }
  }
}

export const syncService = new SyncService();
