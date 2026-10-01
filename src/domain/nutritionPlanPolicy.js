/**
 * NEON COACH - سياسات خطط التغذية (Nutrition Plan Policies)
 * يحدد توزيع نسب الوجبات، إدارة السكريات، والوجبات الحرة، وتأثير الالتزام ونمط الدايت
 */

export const DAYS_OF_WEEK = [
  { dayIndex: 0, key: 'saturday', dayNameAr: 'السبت', shortNameAr: 'سبت' },
  { dayIndex: 1, key: 'sunday', dayNameAr: 'الأحد', shortNameAr: 'أحد' },
  { dayIndex: 2, key: 'monday', dayNameAr: 'الإثنين', shortNameAr: 'إثنين' },
  { dayIndex: 3, key: 'tuesday', dayNameAr: 'الثلاثاء', shortNameAr: 'ثلاثاء' },
  { dayIndex: 4, key: 'wednesday', dayNameAr: 'الأربعاء', shortNameAr: 'أربعاء' },
  { dayIndex: 5, key: 'thursday', dayNameAr: 'الخميس', shortNameAr: 'خميس' },
  { dayIndex: 6, key: 'friday', dayNameAr: 'الجمعة', shortNameAr: 'جمعة' }
];

export const MEAL_SLOT_CONFIGS = {
  breakfast_lunch_dinner: {
    id: 'breakfast_lunch_dinner',
    titleAr: '3 وجبات رئيسية (فطور، غداء، عشاء)',
    slots: ['breakfast', 'lunch', 'dinner'],
    ratios: {
      breakfast: 0.30,
      lunch: 0.40,
      dinner: 0.30
    },
    labelsAr: {
      breakfast: 'الفطور',
      lunch: 'الغداء',
      dinner: 'العشاء'
    }
  },
  breakfast_lunch: {
    id: 'breakfast_lunch',
    titleAr: 'وجبتان (فطور، غداء)',
    slots: ['breakfast', 'lunch'],
    ratios: {
      breakfast: 0.40,
      lunch: 0.60
    },
    labelsAr: {
      breakfast: 'الفطور',
      lunch: 'الغداء'
    }
  },
  lunch_dinner: {
    id: 'lunch_dinner',
    titleAr: 'وجبتان (غداء، عشاء)',
    slots: ['lunch', 'dinner'],
    ratios: {
      lunch: 0.50,
      dinner: 0.50
    },
    labelsAr: {
      lunch: 'الغداء',
      dinner: 'العشاء'
    }
  }
};

export const DEFAULT_PLAN_PREFERENCES = {
  adherence: 'high', // 'high' | 'medium' | 'low'
  mealSlots: 'breakfast_lunch_dinner',
  offPlanMealsCount: 0, // 0 - 7
  sweets: {
    enabled: false,
    item: null,
    portion: 50,
    unit: 'غم',
    servingsPerWeek: 0
  },
  dietStyle: 'flexible', // 'flexible' | 'strict'
  planFormat: 'multiple_options' // 'multiple_options' | 'fixed'
};

/**
 * حساب ميزانية السعرات اليومية مع الأخذ بالاعتبار حصة الحلويات الأسبوعية
 */
export function calculateAdjustedDailyTargets(userTargets, preferences = DEFAULT_PLAN_PREFERENCES) {
  const baseCalories = Number(userTargets.targetCalories) || 2000;
  const baseProtein = Number(userTargets.protein ?? userTargets.targetProtein) || 140;
  const baseCarbs = Number(userTargets.carbs ?? userTargets.targetCarbs) || 220;
  const baseFats = Number(userTargets.fats ?? userTargets.targetFats) || 60;

  let dailySweetCalories = 0;
  let sweetServingData = null;

  if (preferences.sweets && preferences.sweets.enabled && preferences.sweets.servingsPerWeek > 0) {
    const servings = Math.min(7, Math.max(1, preferences.sweets.servingsPerWeek));
    const portion = Number(preferences.sweets.portion) || 50;
    const item = preferences.sweets.item;

    let calPerUnit = 4; // افتراضي لكل غرام
    if (item && item.caloriesPer100g) {
      calPerUnit = item.caloriesPer100g / 100;
    } else if (item && item.calories) {
      calPerUnit = item.calories / (item.servingSize || 100);
    }

    const singleServingCalories = Math.round(calPerUnit * portion);
    const weeklySweetCalories = singleServingCalories * servings;
    dailySweetCalories = Math.round(weeklySweetCalories / 7);

    sweetServingData = {
      name: item?.nameAr || item?.name || 'حلوى / سكريات',
      portion,
      unit: preferences.sweets.unit || 'غم',
      servingsPerWeek: servings,
      singleCalories: singleServingCalories,
      dailyDeductionCalories: dailySweetCalories
    };
  }

  // خصم سعرات الحلويات من الكارب والدهون اليومية للحفاظ على هدف البروتين كاملاً
  const foodCalories = Math.max(1100, baseCalories - dailySweetCalories);
  const remainingCalsForCarbsFats = Math.max(200, foodCalories - (baseProtein * 4));
  // توزيع المتبقي 65% كارب و 35% دهون
  const adjustedCarbs = Math.round((remainingCalsForCarbsFats * 0.65) / 4);
  const adjustedFats = Math.round((remainingCalsForCarbsFats * 0.35) / 9);

  return {
    targetCalories: baseCalories,
    foodCalories,
    dailySweetCalories,
    protein: baseProtein,
    carbs: adjustedCarbs,
    fats: adjustedFats,
    sweetServingData
  };
}

/**
 * تحديد الوجبات المفتوحة المقترحة على مدار أيام الأسبوع (حسب عدد الوجبات المفتوحة)
 */
export function determineOffPlanSlots(offPlanMealsCount, mealSlotConfig) {
  const count = Math.min(7, Math.max(0, Number(offPlanMealsCount) || 0));
  const offPlanSet = new Set();
  if (count <= 0) return offPlanSet;

  // تسلسل أيام الوجبات المفتوحة المعتادة (نهاية الأسبوع أولاً)
  const preferredSequence = [
    { dayIndex: 6, slot: 'dinner' },
    { dayIndex: 0, slot: 'lunch' },
    { dayIndex: 5, slot: 'dinner' },
    { dayIndex: 1, slot: 'lunch' },
    { dayIndex: 2, slot: 'dinner' },
    { dayIndex: 3, slot: 'lunch' },
    { dayIndex: 4, slot: 'dinner' }
  ];

  let assigned = 0;
  for (const candidate of preferredSequence) {
    if (assigned >= count) break;
    // التأكد من أن الوجبة موجودة في التوزيع المختار للمستخدم
    const targetSlot = mealSlotConfig.slots.includes(candidate.slot) 
      ? candidate.slot 
      : mealSlotConfig.slots[mealSlotConfig.slots.length - 1];
    
    const key = `${candidate.dayIndex}_${targetSlot}`;
    if (!offPlanSet.has(key)) {
      offPlanSet.add(key);
      assigned++;
    }
  }

  return offPlanSet;
}
