/**
 * NEON COACH - خدمة المزامنة السحابية المركزية (Cloud Sync Service)
 * تتولى المزامنة التلقائية والآمنة 100% بين ذاكرة التطبيق (Store) وقاعدة بيانات Supabase
 * مع دعم الوضع المحلي (Offline-first / Demo Mode) دون أي توقف.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient.js';

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

      // 1. جلب البروفايل
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profile && store) {
        store.setUserProfile({
          name: profile.name || '',
          email: profile.email || '',
          age: profile.age || 25,
          gender: profile.gender || 'male',
          height: profile.height || 178,
          currentWeight: profile.current_weight || 75,
          targetWeight: profile.target_weight || 80,
          goal: profile.fitness_goal || 'fat_loss',
          weeklyLossPercent: profile.weekly_loss_percent !== undefined && profile.weekly_loss_percent !== null ? Number(profile.weekly_loss_percent) : 0.0075,
          weeklyLossKg: profile.weekly_loss_kg !== undefined && profile.weekly_loss_kg !== null ? Number(profile.weekly_loss_kg) : 0.53,
          dailyCalorieDeficit: profile.daily_calorie_deficit !== undefined && profile.daily_calorie_deficit !== null ? Number(profile.daily_calorie_deficit) : 578,
          requestedCalories: profile.requested_calories !== undefined && profile.requested_calories !== null ? Number(profile.requested_calories) : (profile.target_calories || 1822),
          estimatedGoalWeeks: profile.estimated_goal_weeks !== undefined && profile.estimated_goal_weeks !== null ? Number(profile.estimated_goal_weeks) : 10,
          weightLossRiskLevel: profile.weight_loss_risk_level || 'optimal',
          activityLevel: profile.activity_level || 'light',
          workoutDaysCount: profile.training_days_per_week || 4,
          equipment: profile.equipment || 'gym',
          injuries: profile.injuries || [],
          allergens: profile.allergies || [],
          likedFoods: profile.liked_foods || [],
          dislikedFoods: profile.disliked_foods || [],
          targetCalories: profile.target_calories || 2400,
          targetProtein: profile.target_protein || 180,
          targetCarbs: profile.target_carbs || 250,
          targetFats: profile.target_fats || 65,
          targetWaterLiters: profile.target_water_liters || 2.5,
          targetGlasses: profile.target_glasses || 10,
          onboardingCompleted: !!profile.onboarding_completed,
          onboarding_completed: !!profile.onboarding_completed,
        });
      }

      // 2. جلب وجبات اليوم
      const todayStr = new Date().toISOString().split('T')[0];
      const { data: meals } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('date', todayStr);

      if (meals && meals.length > 0 && store) {
        const totalCals = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
        const totalP = meals.reduce((sum, m) => sum + (Number(m.protein) || 0), 0);
        const totalC = meals.reduce((sum, m) => sum + (Number(m.carbs) || 0), 0);
        const totalF = meals.reduce((sum, m) => sum + (Number(m.fats) || 0), 0);

        store.setState({
          today: {
            ...store.getState().today,
            consumedCalories: totalCals,
            consumedProtein: Math.round(totalP),
            consumedCarbs: Math.round(totalC),
            consumedFats: Math.round(totalF),
          },
          loggedMeals: meals,
        });
      }

      // 3. جلب سجل الماء لليوم
      const { data: water } = await supabase
        .from('water_logs')
        .select('*')
        .eq('user_id', userId)
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
          date: meal.date || new Date().toISOString().split('T')[0],
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

  /**
   * مزامنة استهلاك الماء اليومي
   */
  async syncWaterLog(userId, consumedMl, glassesCount, targetGlasses = 10) {
    if (!isSupabaseConfigured() || !userId) return null;
    try {
      const todayStr = new Date().toISOString().split('T')[0];
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
          date: workout.date || new Date().toISOString().split('T')[0],
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
          date: record.date || new Date().toISOString().split('T')[0],
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
      const todayStr = new Date().toISOString().split('T')[0];
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
      console.warn('فشل حفظ رسالة AI سحابياً:', err);
      return null;
    }
  }
}

export const syncService = new SyncService();
