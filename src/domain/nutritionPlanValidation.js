/**
 * NEON COACH - التحقق من صحة وسلامة خطة التغذية (Nutrition Plan Validation)
 */

import { containsAllergen } from './nutritionPlanEngine.js';

export function validateNutritionPlan(plan, userProfile = {}, preferences = {}) {
  const errors = [];
  const warnings = [];

  if (!plan) {
    return { valid: false, errors: ['الخطة غير موجودة أو فارغة'], warnings };
  }

  // 1. التحقق من هيكل الأيام
  if (!Array.isArray(plan.days) || plan.days.length !== 7) {
    errors.push(`عدد الأيام في الخطة يجب أن يكون 7 أيام بدقة، وجد: ${plan.days?.length || 0}`);
  }

  const userAllergens = userProfile.allergens || [];
  const targetCalories = plan.dailyTargets?.targetCalories || userProfile.targetCalories || 2000;
  const targetProtein = plan.dailyTargets?.protein || userProfile.protein || 140;

  let totalOffPlanCount = 0;

  (plan.days || []).forEach((day, dayIndex) => {
    if (!day.meals || !Array.isArray(day.meals) || day.meals.length === 0) {
      errors.push(`اليوم ${dayIndex + 1} لا يحتوي على وجبات صالحة`);
      return;
    }

    day.meals.forEach(meal => {
      if (meal.isOffPlan) {
        totalOffPlanCount++;
        return;
      }

      if (!meal.options || meal.options.length === 0) {
        errors.push(`الوجبة ${meal.slotNameAr || meal.slot} في اليوم ${dayIndex + 1} لا تحتوي على خيارات`);
        return;
      }

      const activeOpt = meal.options[meal.activeOptionIndex] || meal.options[0];
      if (!activeOpt) {
        errors.push(`الخيار النشط غير متاح للوجبة ${meal.slot} باليوم ${dayIndex + 1}`);
        return;
      }

      // فحص الحساسيات في الخيارات
      meal.options.forEach(opt => {
        const text = (opt.titleAr + ' ' + (opt.ingredients || []).map(i => i.name).join(' ')).toLowerCase();
        if (containsAllergen(text, userAllergens)) {
          errors.push(`تم رصد مسبب حساسية مستبعد في وجبة "${opt.titleAr}" باليوم ${dayIndex + 1}`);
        }

        // فحص صحة المكونات
        (opt.ingredients || []).forEach(ing => {
          if (isNaN(ing.calories) || ing.calories < 0) {
            errors.push(`سعرات المكون ${ing.name} غير صحيحة (${ing.calories})`);
          }
          if (isNaN(ing.grams) || ing.grams < 0) {
            errors.push(`كمية المكون ${ing.name} غير صحيحة (${ing.grams})`);
          }
        });
      });
    });

    // فحص تقارب السعرات لليوم غير المفتوح
    if (!day.hasOffPlanMeal && targetCalories > 0) {
      const diff = Math.abs(day.plannedCalories - targetCalories);
      const diffPct = (diff / targetCalories) * 100;
      if (diffPct > 10) {
        warnings.push(`اليوم ${dayIndex + 1}: فارق السعرات (${diff} سعرة / ${diffPct.toFixed(1)}%) أعلى من النطاق الموصى به`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: {
      daysCount: plan.days?.length || 0,
      offPlanMealsCount: totalOffPlanCount,
      targetCalories,
      targetProtein
    }
  };
}
