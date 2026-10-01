import test from 'node:test';
import assert from 'node:assert/strict';

import {
  generateNutritionPlan,
  replaceMeal,
  containsAllergen,
  containsDislikedFood,
  containsLikedFood
} from '../src/domain/nutritionPlanEngine.js';
import {
  calculateAdjustedDailyTargets,
  determineOffPlanSlots,
  MEAL_SLOT_CONFIGS,
  DEFAULT_PLAN_PREFERENCES
} from '../src/domain/nutritionPlanPolicy.js';
import { validateNutritionPlan } from '../src/domain/nutritionPlanValidation.js';
import { nutritionPlanService } from '../src/services/nutritionPlanService.js';
import { store } from '../src/state/store.js';

test('توليد خطة تغذية أسبوعية لـ 3 وجبات مع تطابق الماكروز وسلامة الأيام الـ 7', () => {
  const userProfile = {
    targetCalories: 2000,
    protein: 150,
    carbs: 220,
    fats: 60,
    allergens: [],
    likedFoods: ['صدر دجاج', 'أرز'],
    dislikedFoods: []
  };

  const preferences = {
    adherence: 'high',
    mealSlots: 'breakfast_lunch_dinner',
    offPlanMealsCount: 0,
    sweets: { enabled: false },
    dietStyle: 'flexible',
    planFormat: 'multiple_options'
  };

  const plan = generateNutritionPlan(userProfile, preferences);

  assert.ok(plan);
  assert.equal(plan.days.length, 7, 'يجب أن تحتوي الخطة على 7 أيام بدقة');

  // فحص كل يوم
  plan.days.forEach((day, idx) => {
    assert.equal(day.meals.length, 3, `اليوم ${idx + 1} يجب أن يحتوي على 3 وجبات`);
    const slots = day.meals.map(m => m.slot);
    assert.deepEqual(slots, ['breakfast', 'lunch', 'dinner']);

    // فحص تقارب السعرات لليوم مع الهدف
    assert.ok(
      Math.abs(day.plannedCalories - 2000) <= 150,
      `سعرات اليوم ${idx + 1} (${day.plannedCalories}) قريبة من الهدف (2000)`
    );

    // فحص المكونات
    day.meals.forEach(meal => {
      const activeOpt = meal.options[meal.activeOptionIndex];
      assert.ok(activeOpt.titleAr);
      assert.ok(activeOpt.calories > 0);
      assert.ok(activeOpt.protein > 0);
      assert.ok(activeOpt.ingredients.length > 0);
      activeOpt.ingredients.forEach(ing => {
        assert.ok(ing.name);
        assert.ok(ing.grams >= 0);
        assert.ok(ing.calories >= 0);
      });
    });
  });

  const validation = validateNutritionPlan(plan, userProfile, preferences);
  assert.equal(validation.valid, true, 'الخطة يجب أن تجتاز الفحص بالكامل');
});

test('توليد خطة لوجبتين (فطور وغداء) وتوزيع السعرات 40% / 60%', () => {
  const userProfile = {
    targetCalories: 1800,
    protein: 135,
    carbs: 200,
    fats: 50,
    allergens: []
  };

  const preferences = {
    adherence: 'medium',
    mealSlots: 'breakfast_lunch',
    offPlanMealsCount: 0,
    sweets: { enabled: false },
    dietStyle: 'flexible',
    planFormat: 'fixed'
  };

  const plan = generateNutritionPlan(userProfile, preferences);
  assert.equal(plan.days.length, 7);

  const firstDay = plan.days[0];
  assert.equal(firstDay.meals.length, 2);
  assert.equal(firstDay.meals[0].slot, 'breakfast');
  assert.equal(firstDay.meals[1].slot, 'lunch');

  // الفطور تقريباً 40% (~720 سعرة)، الغداء تقريباً 60% (~1080 سعرة)
  const bFastCals = firstDay.meals[0].options[0].calories;
  const lunchCals = firstDay.meals[1].options[0].calories;

  assert.ok(bFastCals >= 600 && bFastCals <= 850, `سعرات الفطور: ${bFastCals}`);
  assert.ok(lunchCals >= 950 && lunchCals <= 1250, `سعرات الغداء: ${lunchCals}`);
  assert.ok(lunchCals > bFastCals, 'وجبة الغداء يجب أن تكون أكبر من الفطور في نظام الوجبتين');
});

test('توليد خطة لوجبتين (غداء وعشاء) وتوزيع السعرات 50% / 50%', () => {
  const userProfile = {
    targetCalories: 2000,
    protein: 140,
    carbs: 220,
    fats: 60,
    allergens: []
  };

  const preferences = {
    adherence: 'high',
    mealSlots: 'lunch_dinner',
    offPlanMealsCount: 0,
    sweets: { enabled: false },
    dietStyle: 'flexible',
    planFormat: 'fixed'
  };

  const plan = generateNutritionPlan(userProfile, preferences);
  const firstDay = plan.days[0];
  assert.equal(firstDay.meals.length, 2);
  assert.equal(firstDay.meals[0].slot, 'lunch');
  assert.equal(firstDay.meals[1].slot, 'dinner');

  const lunchCals = firstDay.meals[0].options[0].calories;
  const dinnerCals = firstDay.meals[1].options[0].calories;

  assert.ok(Math.abs(lunchCals - 1000) <= 150);
  assert.ok(Math.abs(dinnerCals - 1000) <= 150);
});

test('الاستبعاد الصارم لمسببات الحساسية (حساسية البيض والسمك ومشتقات الحليب)', () => {
  const userProfile = {
    targetCalories: 2000,
    protein: 140,
    allergens: ['eggs', 'fish', 'dairy']
  };

  const preferences = {
    adherence: 'high',
    mealSlots: 'breakfast_lunch_dinner',
    offPlanMealsCount: 0,
    sweets: { enabled: false },
    dietStyle: 'flexible',
    planFormat: 'multiple_options'
  };

  const plan = generateNutritionPlan(userProfile, preferences);

  // التحقق من خلو كل وجبة وكل خيار وكل مكون من البيض والسمك والألبان
  plan.days.forEach(day => {
    day.meals.forEach(meal => {
      meal.options.forEach(opt => {
        const text = (opt.titleAr + ' ' + opt.ingredients.map(i => i.name).join(' ')).toLowerCase();
        assert.equal(containsAllergen(text, ['eggs', 'fish', 'dairy']), false, `وجبة "${opt.titleAr}" لا يجب أن تحوي مسببات الحساسية المستبعدة`);
        assert.ok(!text.includes('بيض'), 'لا يحتوي على بيض');
        assert.ok(!text.includes('سلمون') && !text.includes('تونا') && !text.includes('سمك'), 'لا يحتوي على سمك');
        assert.ok(!text.includes('حليب') && !text.includes('جبن') && !text.includes('زبادي'), 'لا يحتوي على ألبان');
      });
    });
  });

  const validation = validateNutritionPlan(plan, userProfile, preferences);
  assert.equal(validation.valid, true);
});

test('حساب واحتساب حصة السكريات والحلويات الأسبوعية وخصمها من السعرات اليومية', () => {
  const userProfile = {
    targetCalories: 2000,
    protein: 150,
    carbs: 220,
    fats: 60,
    allergens: []
  };

  // حلوى كنافة: 360 سعرة للحصة (100غ)، مرتان في الأسبوع = 720 سعرة أسبوعياً -> خصم ~103 سعرة يومياً
  const preferences = {
    adherence: 'high',
    mealSlots: 'breakfast_lunch_dinner',
    offPlanMealsCount: 0,
    sweets: {
      enabled: true,
      item: { nameAr: 'كنافة بالجبن', caloriesPer100g: 360 },
      portion: 100,
      unit: 'غم',
      servingsPerWeek: 2
    },
    dietStyle: 'flexible',
    planFormat: 'multiple_options'
  };

  const adjusted = calculateAdjustedDailyTargets(userProfile, preferences);
  assert.ok(adjusted.dailySweetCalories >= 90 && adjusted.dailySweetCalories <= 110, `سعرات الحلى اليومية: ${adjusted.dailySweetCalories}`);
  assert.equal(adjusted.foodCalories, 2000 - adjusted.dailySweetCalories);
  assert.equal(adjusted.protein, 150, 'يجب الحفاظ على هدف البروتين كاملاً');

  const plan = generateNutritionPlan(userProfile, preferences);
  assert.ok(plan.days[0].sweetServingData);
  assert.equal(plan.days[0].sweetServingData.name, 'كنافة بالجبن');
  assert.equal(plan.days[0].sweetServingData.servingsPerWeek, 2);

  // السعرات المخططة لليوم تحسب سعرات الوجبات + حصة الحلى اليومية = قريبة جداً من 2000
  assert.ok(Math.abs(plan.days[0].plannedCalories - 2000) <= 120);
});

test('تحديد وتوزيع الوجبات المفتوحة (Off-Plan Meals) في الخطة', () => {
  const userProfile = {
    targetCalories: 2000,
    protein: 140,
    allergens: []
  };

  const preferences = {
    adherence: 'high',
    mealSlots: 'breakfast_lunch_dinner',
    offPlanMealsCount: 2, // وجبتان مفتوحتان
    sweets: { enabled: false },
    dietStyle: 'flexible',
    planFormat: 'multiple_options'
  };

  const plan = generateNutritionPlan(userProfile, preferences);

  let offPlanCount = 0;
  plan.days.forEach(d => {
    d.meals.forEach(m => {
      if (m.isOffPlan) {
        offPlanCount++;
        assert.ok(m.options[0].titleAr.includes('مفتوحة'));
        assert.ok(m.options[0].note);
      }
    });
  });

  assert.equal(offPlanCount, 2, 'يجب تخصيص وجبتين حرتين بدقة في الأسبوع');
});

test('نمط الدايت الصارم (Strict) مقابل المرن (Flexible)', () => {
  const userProfile = {
    targetCalories: 2000,
    protein: 140,
    allergens: []
  };

  // صارم
  const strictPlan = generateNutritionPlan(userProfile, {
    ...DEFAULT_PLAN_PREFERENCES,
    dietStyle: 'strict'
  });

  // يجب أن تتطابق وجبات الفطور في الأيام المختلفة لتعزيز الروتين
  const day0Bfast = strictPlan.days[0].meals[0].options[0].titleAr;
  const day1Bfast = strictPlan.days[1].meals[0].options[0].titleAr;
  const day2Bfast = strictPlan.days[2].meals[0].options[0].titleAr;
  assert.equal(day0Bfast, day1Bfast);
  assert.equal(day1Bfast, day2Bfast);

  // مرن
  const flexPlan = generateNutritionPlan(userProfile, {
    ...DEFAULT_PLAN_PREFERENCES,
    dietStyle: 'flexible'
  });

  // التنوع في الأيام
  const flexTitles = flexPlan.days.map(d => d.meals[0].options[0].titleAr);
  const uniqueTitles = new Set(flexTitles);
  assert.ok(uniqueTitles.size >= 2, 'الدايت المرن يوفر تنوعاً في الوجبات عبر الأسبوع');
});

test('استبدال وجبة واختيار بديل آخر (replaceMeal)', () => {
  const userProfile = {
    targetCalories: 2000,
    protein: 140,
    allergens: []
  };

  const plan = generateNutritionPlan(userProfile, {
    ...DEFAULT_PLAN_PREFERENCES,
    planFormat: 'multiple_options'
  });

  const day0 = plan.days[0];
  const bfastMeal = day0.meals.find(m => m.slot === 'breakfast');
  assert.ok(bfastMeal.options.length > 1);
  assert.equal(bfastMeal.activeOptionIndex, 0);

  // تبديل للخيار 1
  const updatedPlan = replaceMeal(plan, 0, 'breakfast', 1);
  const updatedBfast = updatedPlan.days[0].meals.find(m => m.slot === 'breakfast');
  assert.equal(updatedBfast.activeOptionIndex, 1);
});

test('خدمة خطط التغذية (nutritionPlanService) وحفظ الخطة وتسجيل الوجبة باليوم', () => {
  const userProfile = {
    targetCalories: 1900,
    protein: 140,
    carbs: 210,
    fats: 55,
    allergens: []
  };

  const { plan, validation } = nutritionPlanService.generateAndSavePlan(userProfile, DEFAULT_PLAN_PREFERENCES);
  assert.ok(plan);
  assert.equal(validation.valid, true);

  // التحقق من الحفظ في المخزن
  const storedPlan = store.getNutritionPlan();
  assert.ok(storedPlan);
  assert.equal(storedPlan.days.length, 7);

  // جلب خطة يوم
  const day1Plan = nutritionPlanService.getDayPlan(1);
  assert.ok(day1Plan);
  assert.equal(day1Plan.dayIndex, 1);

  // تسجيل وجبة مخططة في اليوم
  const plannedMeal = day1Plan.meals[0].options[0];
  const initialLoggedCount = store.getState().loggedMeals.length;

  const logged = nutritionPlanService.logPlannedMealToToday(plannedMeal, day1Plan.meals[0].slotNameAr);
  assert.ok(logged);
  assert.ok(logged.id);
  assert.equal(logged.calories, plannedMeal.calories);
  assert.equal(store.getState().loggedMeals.length, initialLoggedCount + 1);
});
