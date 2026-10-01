/**
 * NEON COACH - خدمة خطط التغذية (Nutrition Plan Service)
 * تدير إنشاء وتخزين وتحديث خطة التغذية الأسبوعية والتكامل مع المخزن المركزي
 */

import { store } from '../state/store.js';
import { generateNutritionPlan, replaceMeal as engineReplaceMeal } from '../domain/nutritionPlanEngine.js';
import { validateNutritionPlan } from '../domain/nutritionPlanValidation.js';
import { DEFAULT_PLAN_PREFERENCES } from '../domain/nutritionPlanPolicy.js';

class NutritionPlanService {
  /**
   * توليد خطة جديدة بالكامل وحفظها في الحالة المحلية
   */
  generateAndSavePlan(userProfile = null, preferences = null) {
    const state = store.getState();
    const profile = userProfile || state.userProfile || {};
    const prefs = preferences || state.nutritionPlanPreferences || DEFAULT_PLAN_PREFERENCES;

    const plan = generateNutritionPlan(profile, prefs);
    const validation = validateNutritionPlan(plan, profile, prefs);

    if (!validation.valid) {
      console.warn('تحذيرات فحص خطة التغذية:', validation.errors);
    }

    store.setNutritionPlan(plan);
    store.setNutritionPlanPreferences(prefs);

    return { plan, validation };
  }

  /**
   * جلب الخطة الأسبوعية الحالية، أو توليد واحدة إذا لم تكن موجودة
   */
  getWeeklyPlan() {
    const state = store.getState();
    if (state.nutritionPlan && state.nutritionPlan.days) {
      return state.nutritionPlan;
    }

    // توليد خطة أولية إذا كان ملف المستخدم يحتوي على أهداف سعرات
    if (state.userProfile && state.userProfile.targetCalories) {
      const { plan } = this.generateAndSavePlan(state.userProfile, state.nutritionPlanPreferences);
      return plan;
    }

    return null;
  }

  /**
   * جلب خطة يوم محدد (0 إلى 6)
   */
  getDayPlan(dayIndex = 0) {
    const plan = this.getWeeklyPlan();
    if (!plan || !plan.days) return null;
    return plan.days[dayIndex] || plan.days[0];
  }

  /**
   * استبدال الوجبة النشطة أو اختيار بديل آخر
   */
  replaceMeal(dayIndex, slotKey, optionIndex) {
    const state = store.getState();
    if (!state.nutritionPlan) return null;

    const updated = engineReplaceMeal(state.nutritionPlan, dayIndex, slotKey, optionIndex);
    store.setNutritionPlan(updated);
    return updated;
  }

  /**
   * تسجيل الوجبة المخططة بضغطة زر واحدة في سجل الوجبات المأكولة اليوم
   */
  logPlannedMealToToday(mealOption, slotName = 'وجبة من الخطة') {
    if (!mealOption) return null;

    const items = (mealOption.ingredients || []).map(ing => ({
      nameAr: ing.name,
      name: ing.name,
      grams: ing.grams || 100,
      count: ing.count,
      unitLabel: ing.unit || 'غم',
      calories: ing.calories || 0,
      protein: ing.protein || 0,
      carbs: ing.carbs || 0,
      fats: ing.fats || 0
    }));

    const logged = store.logMeal({
      titleAr: mealOption.titleAr || slotName,
      calories: mealOption.calories || 0,
      protein: mealOption.protein || 0,
      carbs: mealOption.carbs || 0,
      fats: mealOption.fats || 0,
      items
    });

    return logged;
  }
}

export const nutritionPlanService = new NutritionPlanService();
