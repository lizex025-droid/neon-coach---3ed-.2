/**
 * NEON COACH - خدمة المزامنة السحابية المركزية (Cloud Sync Service)
 * تتولى المزامنة التلقائية والآمنة 100% بين ذاكرة التطبيق (Store) وقاعدة بيانات Supabase
 * مع دعم الوضع المحلي (Offline-first / Demo Mode) دون أي توقف.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { localDate } from '../domain/actionAgent.js';

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
    if (!isSupabaseConfigured() || !userId) {
      return { success: false, reason: 'unconfigured_or_guest' };
    }

    try {
      this.isSyncing = true;
      const store = this.getStore();
      // The authenticated backend snapshot includes weight, empty/deleted resources,
      // profile timezone and current totals; never overwrite it with stale local state.
      const { restoreNeonConversation } = await import('./submitNeonCommand.js');
      const restored = await restoreNeonConversation();
      if (restored.status === 'error') throw new Error(restored.reply);
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
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          name: profileData.name,
          age: profileData.age,
          gender: profileData.gender,
          height: profileData.height,
          current_weight: profileData.currentWeight || profileData.weight,
          target_weight: profileData.targetWeight,
          weekly_loss_percent: profileData.weeklyLossPercent,
          weekly_loss_kg: profileData.weeklyLossKg,
          daily_calorie_deficit: profileData.dailyCalorieDeficit,
          requested_calories: profileData.requestedCalories,
          estimated_goal_weeks: profileData.estimatedGoalWeeks,
          weight_loss_risk_level: profileData.weightLossRiskLevel,
          activity_level: profileData.activityLevel || 'light',
          fitness_goal: profileData.goal || 'fat_loss',
          training_days_per_week: profileData.workoutDaysCount || 4,
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
        });
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
    try {
      const { data, error } = await supabase
        .from('meal_logs')
        .insert({
          user_id: userId,
          date: meal.date || localDate(),
          meal_type: meal.meal_type || 'meal',
          name: meal.name,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fats: meal.fats,
          items: meal.items || [],
        });
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('فشل مزامنة الوجبة:', err);
      return null;
    }
  }

  async persistManualMeal(userId, id, update = null) {
    if (!isSupabaseConfigured() || !userId) throw new Error('سجّل الدخول لحفظ تعديل الوجبة.');
    const query = update ? supabase.from('meal_logs').update({ name: update.titleAr, calories: update.calories, protein: update.protein, carbs: update.carbs, fats: update.fats, items: update.items }) : supabase.from('meal_logs').delete();
    const { data, error } = await query.eq('user_id', userId).eq('id', id).select('id');
    if (error || data?.length !== 1) throw new Error('تعذر حفظ تعديل الوجبة في الحساب.');
    const { data: readback, error: readError } = await supabase.from('meal_logs').select('*').eq('user_id', userId).eq('id', id).maybeSingle();
    if (readError || (update ? !readback : !!readback)) throw new Error('تعذر تأكيد نتيجة تعديل الوجبة.');
    return readback;
  }

  /**
   * مزامنة استهلاك الماء اليومي
   */
  async syncWaterLog(userId, consumedMl, glassesCount, targetGlasses = 10) {
    if (!isSupabaseConfigured() || !userId) return null;
    try {
      const todayStr = localDate();
      const { data, error } = await supabase
        .from('water_logs')
        .upsert({
          user_id: userId,
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
   * مزامنة جلسة تمرين منجزة
   */
  async syncWorkoutLog(userId, workout) {
    if (!isSupabaseConfigured() || !userId) return null;
    try {
      const { data, error } = await supabase
        .from('workout_logs')
        .insert({
          user_id: userId,
          workout_title: workout.title || 'جلسة تدريبية',
          program_type: workout.programType || 'forty_days',
          date: workout.date || localDate(),
          duration_minutes: workout.durationMinutes || 50,
          total_volume_kg: workout.totalVolumeKg || 0,
          rpe: workout.rpe || null,
          completed: true,
          exercises: workout.exercises || [],
          notes: workout.notes || '',
        });
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('فشل مزامنة التمرين:', err);
      return null;
    }
  }

  /**
   * مزامنة قياسات وفحص InBody
   */
  async syncInbodyRecord(userId, record) {
    if (!isSupabaseConfigured() || !userId) return null;
    try {
      const { data, error } = await supabase
        .from('inbody_records')
        .insert({
          user_id: userId,
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
    const user = this.getStore()?.state?.auth?.user;
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('custom_foods')
        .insert({
          id: food.id,
          user_id: user.id,
          name: food.nameAr || food.name,
          category: food.category || 'عام',
          calories: food.per100?.kcal || food.caloriesPer100g || 0,
          protein: food.per100?.p || food.proteinPer100g || 0,
          carbs: food.per100?.c || food.carbsPer100g || 0,
          fats: food.per100?.f || food.fatsPer100g || 0,
          serving_size: food.baseWeight || 100,
          serving_unit: 'g'
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
    const user = this.getStore()?.state?.auth?.user;
    if (!user?.id) return null;

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
        .match({ id: foodId, user_id: user.id });
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
    const user = this.getStore()?.state?.auth?.user;
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('custom_foods')
        .delete()
        .match({ id: foodId, user_id: user.id });
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('فشل حذف الصنف المخصص سحابياً في Supabase:', err);
      return null;
    }
  }
}

export const syncService = new SyncService();
