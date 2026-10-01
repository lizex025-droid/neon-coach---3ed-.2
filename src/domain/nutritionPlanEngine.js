/**
 * NEON COACH - محرك توليد خطط التغذية الأسبوعية الذكي (Nutrition Plan Engine)
 * خوارزمية ذكية محلية بالكامل Offline-First:
 * - توازن الماكروز والسعرات بدقة
 * - تستبعد الحساسيات والمكروهات بدقة صارمة
 * - تدعم الخيارات المتعددة أو الخيار الثابت
 * - تراعي السكريات والوجبات المفتوحة
 */

import { RECIPES_DATA } from '../data/recipesData.js';
import { FOOD_ITEMS } from '../data/foods.js';
import {
  DAYS_OF_WEEK,
  MEAL_SLOT_CONFIGS,
  DEFAULT_PLAN_PREFERENCES,
  calculateAdjustedDailyTargets,
  determineOffPlanSlots
} from './nutritionPlanPolicy.js';

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'plan_' + Math.random().toString(36).substring(2, 11);
}

/**
 * فحص استبعاد مسببات الحساسية المحددة
 */
export function containsAllergen(text, allergens = []) {
  if (!allergens || allergens.length === 0 || !text) return false;
  const lower = text.toLowerCase();
  for (const allergen of allergens) {
    if (allergen === 'dairy' && (lower.includes('حليب') || lower.includes('زبادي') || lower.includes('جبن') || lower.includes('فيتا') || lower.includes('شيدر') || lower.includes('لبن') || lower.includes('واي بروتين'))) {
      return true;
    }
    if (allergen === 'fish' && (lower.includes('سمك') || lower.includes('سلمون') || lower.includes('تونا') || lower.includes('تونة') || lower.includes('فيليه سمك') || lower.includes('جمبري') || lower.includes('مأكولات بحرية'))) {
      return true;
    }
    if (allergen === 'eggs' && (lower.includes('بيض') || lower.includes('بياض') || lower.includes('صفار') || lower.includes('أومليت') || lower.includes('بان كيك'))) {
      return true;
    }
    if (allergen === 'nuts' && (lower.includes('فول') || lower.includes('سوداني') || lower.includes('لوز') || lower.includes('جوز') || lower.includes('مكسرات') || lower.includes('كاجو'))) {
      return true;
    }
    if (allergen === 'gluten' && (lower.includes('شوفان') || lower.includes('خبز') || lower.includes('قمح') || lower.includes('تورتيلا') || lower.includes('برجر') || lower.includes('طحين') || lower.includes('معكرونة'))) {
      return true;
    }
  }
  return false;
}

/**
 * فحص احتوائه على أطعمة مستبعدة بناء على رغبة المستخدم
 */
export function containsDislikedFood(text, dislikedFoods = []) {
  if (!dislikedFoods || dislikedFoods.length === 0 || !text) return false;
  const lower = text.toLowerCase();
  for (const disliked of dislikedFoods) {
    if (!disliked) continue;
    const cleanDisliked = disliked.trim().toLowerCase();
    if (cleanDisliked && lower.includes(cleanDisliked)) {
      return true;
    }
  }
  return false;
}

/**
 * فحص احتوائه على أطعمة مفضلة للمستخدم
 */
export function containsLikedFood(text, likedFoods = []) {
  if (!likedFoods || likedFoods.length === 0 || !text) return false;
  const lower = text.toLowerCase();
  for (const liked of likedFoods) {
    if (!liked) continue;
    const cleanLiked = liked.trim().toLowerCase();
    if (cleanLiked && lower.includes(cleanLiked)) {
      return true;
    }
  }
  return false;
}

/**
 * قاعدة نماذج وجبات رياضية جاهزة إضافية غنية بالمكونات ومحسوبة الماكروز
 */
const BASE_MEAL_TEMPLATES = {
  breakfast: [
    {
      titleAr: 'شوفان بحليب اللوز والتوت وزبدة الفول',
      category: 'breakfast',
      calories: 420,
      protein: 26,
      carbs: 56,
      fats: 10,
      ingredients: [
        { name: 'شوفان حبة كاملة', amount: '60غم', grams: 60, unit: 'غم', calories: 233, protein: 10, carbs: 40, fats: 4 },
        { name: 'حليب لوز غير محلى', amount: '180مل', grams: 180, unit: 'مل', calories: 30, protein: 1, carbs: 1, fats: 2 },
        { name: 'توت مشكل طازج', amount: '80غم', grams: 80, unit: 'غم', calories: 45, protein: 1, carbs: 10, fats: 0 },
        { name: 'سكوب بروتين معزول', amount: '25غم', grams: 25, unit: 'غم', calories: 95, protein: 22, carbs: 1, fats: 1 },
        { name: 'زبدة فول سوداني طبيعية', amount: '12غم', grams: 12, unit: 'غم', calories: 72, protein: 3, carbs: 2, fats: 6 }
      ]
    },
    {
      titleAr: 'أومليت البيض الكامل وبياض البيض مع خبز الشوفان',
      category: 'breakfast',
      calories: 390,
      protein: 34,
      carbs: 35,
      fats: 12,
      ingredients: [
        { name: 'بيض كامل', amount: '2 عدد', grams: 100, count: 2, unit: 'عدد', isCountBased: true, pieceWeight: 50, calories: 143, protein: 13, carbs: 1, fats: 10 },
        { name: 'بياض بيض', amount: '3 عدد', grams: 99, count: 3, unit: 'عدد', isCountBased: true, pieceWeight: 33, calories: 51, protein: 11, carbs: 1, fats: 0 },
        { name: 'خبز شوفان أو بر الحبة الكاملة', amount: '60غم', grams: 60, unit: 'غم', calories: 150, protein: 6, carbs: 28, fats: 2 },
        { name: 'خضار مشكلة (طماطم وفلفل)', amount: '100غم', grams: 100, unit: 'غم', calories: 25, protein: 1, carbs: 5, fats: 0 }
      ]
    },
    {
      titleAr: 'جبن قريش مع موز وعسل وجوز ولوز',
      category: 'breakfast',
      calories: 380,
      protein: 32,
      carbs: 46,
      fats: 8,
      ingredients: [
        { name: 'جبن قريش قليل الدسم', amount: '200غم', grams: 200, unit: 'غم', calories: 160, protein: 26, carbs: 6, fats: 3 },
        { name: 'موزة طازجة متوسطة', amount: '100غم', grams: 100, unit: 'غم', calories: 89, protein: 1, carbs: 23, fats: 0 },
        { name: 'عسل نحل طبيعي', amount: '15غم', grams: 15, unit: 'غم', calories: 45, protein: 0, carbs: 12, fats: 0 },
        { name: 'لوز نيء مبشور', amount: '15غم', grams: 15, unit: 'غم', calories: 86, protein: 3, carbs: 3, fats: 7 }
      ]
    },
    {
      titleAr: 'ساندويش تونة خفيف مع توست الحبة الكاملة',
      category: 'breakfast',
      calories: 360,
      protein: 38,
      carbs: 36,
      fats: 6,
      ingredients: [
        { name: 'تونة مصفاة بالماء', amount: '140غم', grams: 140, unit: 'غم', calories: 150, protein: 32, carbs: 0, fats: 2 },
        { name: 'توست بر حبة كاملة', amount: '2 شريحة (55غم)', grams: 55, unit: 'غم', calories: 140, protein: 5, carbs: 26, fats: 2 },
        { name: 'خيار وخس وليمون', amount: '80غم', grams: 80, unit: 'غم', calories: 20, protein: 1, carbs: 4, fats: 0 },
        { name: 'زيت زيتون بكر', amount: '5غم', grams: 5, unit: 'غم', calories: 45, protein: 0, carbs: 0, fats: 5 }
      ]
    }
  ],
  lunch: [
    {
      titleAr: 'صدر دجاج مشوي مع أرز بسمتي وخضار مشكلة',
      category: 'lunch',
      calories: 520,
      protein: 55,
      carbs: 58,
      fats: 7,
      ingredients: [
        { name: 'صدر دجاج مشوي', amount: '180غم', grams: 180, unit: 'غم', calories: 297, protein: 56, carbs: 0, fats: 6 },
        { name: 'أرز بسمتي أبيض مطبوخ', amount: '170غم', grams: 170, unit: 'غم', calories: 220, protein: 5, carbs: 48, fats: 1 },
        { name: 'بروكلي وجزر وسلطة', amount: '120غم', grams: 120, unit: 'غم', calories: 35, protein: 2, carbs: 7, fats: 0 }
      ]
    },
    {
      titleAr: 'فيليه سالمون مشوي مع بطاطا مسلوقة وسلطة',
      category: 'lunch',
      calories: 530,
      protein: 44,
      carbs: 45,
      fats: 18,
      ingredients: [
        { name: 'فيليه سالمون مشوي', amount: '180غم', grams: 180, unit: 'غم', calories: 360, protein: 38, carbs: 0, fats: 22 },
        { name: 'بطاطا مسلوقة', amount: '180غم', grams: 180, unit: 'غم', calories: 156, protein: 3, carbs: 36, fats: 0 },
        { name: 'سلطة خضراء وعصير ليمون', amount: '100غم', grams: 100, unit: 'غم', calories: 28, protein: 2, carbs: 6, fats: 0 }
      ]
    },
    {
      titleAr: 'ستيك لحم بقري صافي مع بطاطا حلوة مشوية',
      category: 'lunch',
      calories: 540,
      protein: 50,
      carbs: 48,
      fats: 16,
      ingredients: [
        { name: 'لحم عجل أحمر صافي مشوي', amount: '180غم', grams: 180, unit: 'غم', calories: 320, protein: 46, carbs: 0, fats: 14 },
        { name: 'بطاطا حلوة مشوية', amount: '180غم', grams: 180, unit: 'غم', calories: 155, protein: 3, carbs: 36, fats: 0 },
        { name: 'فاصوليا خضراء مسلوقة', amount: '100غم', grams: 100, unit: 'غم', calories: 31, protein: 2, carbs: 7, fats: 0 }
      ]
    },
    {
      titleAr: 'فاهيتا صدر دجاج بخبز التورتيلا والليمون',
      category: 'lunch',
      calories: 505,
      protein: 48,
      carbs: 48,
      fats: 12,
      ingredients: [
        { name: 'صدر دجاج متبل فاهيتا', amount: '170غم', grams: 170, unit: 'غم', calories: 280, protein: 52, carbs: 0, fats: 6 },
        { name: 'خبز تورتيلا الحبة الكاملة', amount: 'رغيف (60غم)', grams: 60, unit: 'غم', calories: 170, protein: 5, carbs: 32, fats: 3 },
        { name: 'فلفل ألوان وبصل مشوي', amount: '100غم', grams: 100, unit: 'غم', calories: 35, protein: 1, carbs: 8, fats: 0 },
        { name: 'زيت زيتون', amount: '4غم', grams: 4, unit: 'غم', calories: 36, protein: 0, carbs: 0, fats: 4 }
      ]
    }
  ],
  dinner: [
    {
      titleAr: 'سلطة التونة بالبيض المسلوق وزيت الزيتون',
      category: 'dinner',
      calories: 370,
      protein: 45,
      carbs: 14,
      fats: 14,
      ingredients: [
        { name: 'تونة مصفاة من الماء', amount: '140غم', grams: 140, unit: 'غم', calories: 150, protein: 32, carbs: 0, fats: 2 },
        { name: 'بيض مسلوق كامل', amount: '2 عدد', grams: 100, count: 2, unit: 'عدد', isCountBased: true, pieceWeight: 50, calories: 143, protein: 13, carbs: 1, fats: 10 },
        { name: 'سلطة خضار وجرجير وخيار', amount: '120غم', grams: 120, unit: 'غم', calories: 32, protein: 2, carbs: 7, fats: 0 },
        { name: 'زيت زيتون وليمون', amount: '5غم', grams: 5, unit: 'غم', calories: 45, protein: 0, carbs: 0, fats: 5 }
      ]
    },
    {
      titleAr: 'أومليت بياض بيض بالخضار والجبن اللايت مع خبز حبوب',
      category: 'dinner',
      calories: 360,
      protein: 36,
      carbs: 32,
      fats: 9,
      ingredients: [
        { name: 'بياض بيض', amount: '4 عدد', grams: 132, count: 4, unit: 'عدد', isCountBased: true, pieceWeight: 33, calories: 68, protein: 15, carbs: 1, fats: 0 },
        { name: 'بيض كامل', amount: '1 عدد', grams: 50, count: 1, unit: 'عدد', isCountBased: true, pieceWeight: 50, calories: 72, protein: 6, carbs: 0, fats: 5 },
        { name: 'جبن فيتا لايت أو قريش', amount: '50غم', grams: 50, unit: 'غم', calories: 70, protein: 8, carbs: 2, fats: 4 },
        { name: 'توست بر حبة كاملة', amount: '1 شريحة (35غم)', grams: 35, unit: 'غم', calories: 90, protein: 3, carbs: 17, fats: 1 },
        { name: 'طماطم وسبانخ طازجة', amount: '80غم', grams: 80, unit: 'غم', calories: 20, protein: 1, carbs: 4, fats: 0 }
      ]
    },
    {
      titleAr: 'صدر دجاج مشوي خفيف مع سلطة يونانية وزيتون',
      category: 'dinner',
      calories: 380,
      protein: 48,
      carbs: 12,
      fats: 15,
      ingredients: [
        { name: 'صدر دجاج مشوي بالأعشاب', amount: '160غم', grams: 160, unit: 'غم', calories: 264, protein: 50, carbs: 0, fats: 6 },
        { name: 'سلطة يونانية (خيار، طماطم، خس)', amount: '120غم', grams: 120, unit: 'غم', calories: 35, protein: 2, carbs: 7, fats: 0 },
        { name: 'زيتون وزيت زيتون بكر', amount: '10غم', grams: 10, unit: 'غم', calories: 81, protein: 0, carbs: 1, fats: 9 }
      ]
    },
    {
      titleAr: 'زبادي يوناني مع بذور الشيا والتوت واللوز',
      category: 'dinner',
      calories: 340,
      protein: 30,
      carbs: 32,
      fats: 9,
      ingredients: [
        { name: 'زبادي يوناني خالي الدسم', amount: '220غم', grams: 220, unit: 'غم', calories: 130, protein: 22, carbs: 8, fats: 0 },
        { name: 'سكوب بروتين كازين أو واي', amount: '15غم', grams: 15, unit: 'غم', calories: 60, protein: 12, carbs: 1, fats: 0 },
        { name: 'توت بري مشكل', amount: '80غم', grams: 80, unit: 'غم', calories: 45, protein: 1, carbs: 10, fats: 0 },
        { name: 'لوز مبشور وبذور الشيا', amount: '15غم', grams: 15, unit: 'غم', calories: 85, protein: 3, carbs: 3, fats: 7 }
      ]
    }
  ]
};

/**
 * موازنة وضبط كميات المكونات لتقترب تماماً من السعرات والبروتين المستهدف للوجبة
 */
export function scaleMealToTarget(mealTemplate, targetCals, targetProtein) {
  const baseCals = mealTemplate.calories || 400;
  const factor = Math.max(0.3, Math.min(3.5, targetCals / baseCals));

  const scaledIngredients = (mealTemplate.ingredients || []).map(ing => {
    let scaledGrams = Math.round((ing.grams || 100) * factor);
    // تقريب لأقرب 5 غرام لسهولة الوزن المنزلي
    scaledGrams = Math.max(5, Math.round(scaledGrams / 5) * 5);

    let count = ing.count;
    let amountStr = `${scaledGrams}${ing.unit || 'غم'}`;

    if (ing.isCountBased && ing.pieceWeight) {
      count = Math.max(1, Math.round(scaledGrams / ing.pieceWeight));
      scaledGrams = count * ing.pieceWeight;
      amountStr = `${count} ${ing.unit || 'عدد'}`;
    }

    const itemFactor = scaledGrams / (ing.grams || 100);
    return {
      name: ing.name,
      amount: amountStr,
      grams: scaledGrams,
      count: count || undefined,
      unit: ing.unit || 'غم',
      isCountBased: ing.isCountBased,
      pieceWeight: ing.pieceWeight,
      calories: Math.round(ing.calories * itemFactor),
      protein: Math.round((ing.protein || 0) * itemFactor),
      carbs: Math.round((ing.carbs || 0) * itemFactor),
      fats: Math.round((ing.fats || 0) * itemFactor)
    };
  });

  // ضبط المكونات الأساسية لتطابق سعرات الوجبة المستهدفة بدقة متناهية
  let currentTotalCals = scaledIngredients.reduce((s, i) => s + i.calories, 0);
  const diff = targetCals - currentTotalCals;

  if (Math.abs(diff) >= 15 && scaledIngredients.length > 0) {
    const adjustable = scaledIngredients.find(i => !i.isCountBased && (i.name.includes('أرز') || i.name.includes('بطاطا') || i.name.includes('شوفان') || i.name.includes('دجاج') || i.name.includes('لحم') || i.name.includes('توست') || i.name.includes('تونة'))) || scaledIngredients[0];
    if (adjustable && adjustable.grams > 15) {
      const calPerG = (adjustable.calories / adjustable.grams) || 1.2;
      const gramDelta = Math.round(diff / calPerG / 5) * 5;
      const newGrams = Math.max(15, adjustable.grams + gramDelta);
      const ratio = newGrams / adjustable.grams;
      adjustable.grams = newGrams;
      adjustable.amount = `${newGrams}${adjustable.unit || 'غم'}`;
      adjustable.calories = Math.round(adjustable.calories * ratio);
      adjustable.protein = Math.round(adjustable.protein * ratio);
      adjustable.carbs = Math.round(adjustable.carbs * ratio);
      adjustable.fats = Math.round(adjustable.fats * ratio);
    }
  }

  const finalCals = scaledIngredients.reduce((s, i) => s + i.calories, 0);
  const finalProtein = scaledIngredients.reduce((s, i) => s + i.protein, 0);
  const finalCarbs = scaledIngredients.reduce((s, i) => s + i.carbs, 0);
  const finalFats = scaledIngredients.reduce((s, i) => s + i.fats, 0);

  return {
    id: mealTemplate.id || generateId(),
    titleAr: mealTemplate.titleAr,
    calories: finalCals,
    protein: finalProtein,
    carbs: finalCarbs,
    fats: finalFats,
    ingredients: scaledIngredients
  };
}

/**
 * جمع وتصفية كل القوالب الصالحة لوجبة معينة مع فحص الحساسيات والأطعمة المستبعدة
 */
function getEligibleTemplates(slotKey, allergens = [], dislikedFoods = [], likedFoods = []) {
  const baseList = BASE_MEAL_TEMPLATES[slotKey] || BASE_MEAL_TEMPLATES.lunch;
  
  // دمج مع الوصفات من RECIPES_DATA
  const recipeMatches = RECIPES_DATA.filter(r => {
    if (slotKey === 'breakfast' && r.category === 'breakfast') return true;
    if (slotKey === 'lunch' && r.category === 'lunch') return true;
    if (slotKey === 'dinner' && (r.category === 'dinner' || r.category === 'lunch')) return true;
    return false;
  }).map(r => ({
    id: r.id,
    titleAr: r.titleAr,
    category: r.category,
    calories: r.calories,
    protein: r.protein,
    carbs: r.carbs,
    fats: r.fats,
    ingredients: (r.ingredients || []).map(str => {
      // تفكيك نص المكون إلى غرام واسم
      const gMatch = str.match(/(\d+)\s*(?:غم|غ|جم)/);
      const grams = gMatch ? Number(gMatch[1]) : 100;
      return {
        name: str.replace(/^\d+\s*(?:غم|غ|جم)\s*/, ''),
        amount: `${grams}غم`,
        grams,
        unit: 'غم',
        calories: Math.round((r.calories / (r.ingredients.length || 1))),
        protein: Math.round((r.protein / (r.ingredients.length || 1))),
        carbs: Math.round((r.carbs / (r.ingredients.length || 1))),
        fats: Math.round((r.fats / (r.ingredients.length || 1)))
      };
    })
  }));

  const allCandidates = [...baseList, ...recipeMatches];

  // تصفية صارمة لمسببات الحساسية والمكروهات
  const filtered = allCandidates.filter(item => {
    const fullText = (item.titleAr + ' ' + (item.ingredients || []).map(i => i.name).join(' ')).toLowerCase();
    if (containsAllergen(fullText, allergens)) return false;
    if (containsDislikedFood(fullText, dislikedFoods)) return false;
    return true;
  });

  // إذا تم استبعاد كل شيء بسبب حساسية صارمة جداً، نستخدم قالباً نظيفاً خالياً من الحساسيات
  if (filtered.length === 0) {
    return [
      {
        titleAr: slotKey === 'breakfast' ? 'شوفان بالماء وبودرة البروتين النباتي' : 'صدر دجاج مشوي مع أرز وخضار مسلوقة',
        category: slotKey,
        calories: 400,
        protein: 40,
        carbs: 45,
        fats: 6,
        ingredients: [
          { name: slotKey === 'breakfast' ? 'شوفان حبة كاملة' : 'صدر دجاج مشوي', amount: '150غم', grams: 150, unit: 'غم', calories: 250, protein: 35, carbs: 10, fats: 4 },
          { name: slotKey === 'breakfast' ? 'موز وعسل' : 'أرز أبيض مسلوق', amount: '150غم', grams: 150, unit: 'غم', calories: 150, protein: 5, carbs: 35, fats: 2 }
        ]
      }
    ];
  }

  // ترتيب المرشحين لإعطاء أولوية للمفضلة
  filtered.sort((a, b) => {
    const aText = (a.titleAr + ' ' + (a.ingredients || []).map(i => i.name).join(' ')).toLowerCase();
    const bText = (b.titleAr + ' ' + (b.ingredients || []).map(i => i.name).join(' ')).toLowerCase();
    const aLiked = containsLikedFood(aText, likedFoods) ? 1 : 0;
    const bLiked = containsLikedFood(bText, likedFoods) ? 1 : 0;
    return bLiked - aLiked;
  });

  return filtered;
}

/**
 * المحرك الرئيسي لتوليد الخطة الأسبوعية لـ 7 أيام
 */
export function generateNutritionPlan(userProfile, userPreferences = {}) {
  const preferences = { ...DEFAULT_PLAN_PREFERENCES, ...userPreferences };
  const dailyTargets = calculateAdjustedDailyTargets(userProfile, preferences);
  const slotConfig = MEAL_SLOT_CONFIGS[preferences.mealSlots] || MEAL_SLOT_CONFIGS.breakfast_lunch_dinner;
  const offPlanSlots = determineOffPlanSlots(preferences.offPlanMealsCount, slotConfig);

  const allergens = userProfile.allergens || [];
  const dislikedFoods = userProfile.dislikedFoods || [];
  const likedFoods = userProfile.likedFoods || [];

  const days = DAYS_OF_WEEK.map((dayMeta, dayIndex) => {
    const isStrict = preferences.dietStyle === 'strict';
    const dayMeals = slotConfig.slots.map(slotKey => {
      const slotRatio = slotConfig.ratios[slotKey] || (1 / slotConfig.slots.length);
      const slotLabel = slotConfig.labelsAr[slotKey] || slotKey;
      const offPlanKey = `${dayIndex}_${slotKey}`;
      const isOffPlan = offPlanSlots.has(offPlanKey);

      const targetCals = Math.round(dailyTargets.foodCalories * slotRatio);
      const targetProtein = Math.round(dailyTargets.protein * slotRatio);

      // في حال الوجبة الحرة
      if (isOffPlan) {
        return {
          id: `meal_${dayMeta.key}_${slotKey}`,
          slot: slotKey,
          slotNameAr: slotLabel,
          isOffPlan: true,
          activeOptionIndex: 0,
          options: [
            {
              id: `opt_offplan_${dayIndex}_${slotKey}`,
              titleAr: 'وجبة مفتوحة / مرنة (Free Meal)',
              calories: targetCals,
              protein: targetProtein,
              carbs: Math.round(dailyTargets.carbs * slotRatio),
              fats: Math.round(dailyTargets.fats * slotRatio),
              note: 'تناول وجبتك المفضلة خارج الخطة بوعي مع الحفاظ على ترطيب الجسم وتناول مصدر بروتين كافٍ.',
              ingredients: [
                { name: 'وجبة حرة باختيارك', amount: 'حصة معتدلة', grams: 0, unit: 'وجبة', calories: targetCals, protein: targetProtein, carbs: 0, fats: 0 }
              ]
            }
          ]
        };
      }

      // الحصول على القوالب الصالحة
      const templates = getEligibleTemplates(slotKey, allergens, dislikedFoods, likedFoods);

      // اختيار القالب الرئيسي حسب نمط الدايت (صارم = يكرر الأول دائماً، مرن = يدوّر حسب رقم اليوم)
      const primaryIndex = isStrict ? 0 : (dayIndex % templates.length);
      const primaryTemplate = templates[primaryIndex] || templates[0];
      const scaledPrimary = scaleMealToTarget(primaryTemplate, targetCals, targetProtein);

      // تجهيز الخيارات (إذا كانت الخطة خيارات متعددة 2-3 خيارات، أو خيار واحد فقط إذا كانت ثابتة)
      const options = [scaledPrimary];

      if (preferences.planFormat === 'multiple_options' && templates.length > 1) {
        const secondIndex = (primaryIndex + 1) % templates.length;
        options.push(scaleMealToTarget(templates[secondIndex], targetCals, targetProtein));
        if (templates.length > 2) {
          const thirdIndex = (primaryIndex + 2) % templates.length;
          options.push(scaleMealToTarget(templates[thirdIndex], targetCals, targetProtein));
        }
      }

      return {
        id: `meal_${dayMeta.key}_${slotKey}`,
        slot: slotKey,
        slotNameAr: slotLabel,
        isOffPlan: false,
        activeOptionIndex: 0,
        options
      };
    });

    const dayTotalCalories = dayMeals.reduce((sum, m) => {
      const activeOpt = m.options[m.activeOptionIndex] || m.options[0];
      return sum + (activeOpt?.calories || 0);
    }, 0) + (dailyTargets.dailySweetCalories || 0);

    const dayTotalProtein = dayMeals.reduce((sum, m) => {
      const activeOpt = m.options[m.activeOptionIndex] || m.options[0];
      return sum + (activeOpt?.protein || 0);
    }, 0);

    return {
      dayIndex,
      dayKey: dayMeta.key,
      dayNameAr: dayMeta.dayNameAr,
      shortNameAr: dayMeta.shortNameAr,
      hasOffPlanMeal: dayMeals.some(m => m.isOffPlan),
      targetCalories: dailyTargets.targetCalories,
      plannedCalories: dayTotalCalories,
      plannedProtein: dayTotalProtein,
      sweetServingData: dailyTargets.sweetServingData,
      meals: dayMeals
    };
  });

  return {
    id: generateId(),
    version: 1,
    generatedAt: new Date().toISOString(),
    preferences,
    dailyTargets,
    days
  };
}

/**
 * استبدال الوجبة النشطة أو اختيار بديل آخر ضمن اليوم المحدد
 */
export function replaceMeal(plan, dayIndex, slotKey, newOptionIndex) {
  if (!plan || !plan.days || !plan.days[dayIndex]) return plan;
  const day = plan.days[dayIndex];
  const meal = day.meals.find(m => m.slot === slotKey);
  if (!meal || !meal.options) return plan;

  const validIndex = Math.max(0, Math.min(meal.options.length - 1, newOptionIndex));
  meal.activeOptionIndex = validIndex;

  // إعادة احتساب مجموع اليوم
  day.plannedCalories = day.meals.reduce((sum, m) => {
    const activeOpt = m.options[m.activeOptionIndex] || m.options[0];
    return sum + (activeOpt?.calories || 0);
  }, 0) + (plan.dailyTargets?.dailySweetCalories || 0);

  day.plannedProtein = day.meals.reduce((sum, m) => {
    const activeOpt = m.options[m.activeOptionIndex] || m.options[0];
    return sum + (activeOpt?.protein || 0);
  }, 0);

  return plan;
}
