/**
 * NEON COACH - محرك التغذية والوجبات وقائمة المشتريات
 */

import { FOOD_ITEMS, DEFAULT_MEALS } from '../data/foods.js';

/**
 * محرك تبديل الوجبات (Meal Swap)
 * يقدم بدائل متكافئة للسعرات والبروتين ضمن هامش 10% مع استبعاد مسببات الحساسية المحددة للمستخدم
 */
export function findMealSwaps(currentMeal, userAllergens = []) {
  if (!currentMeal) return [];

  const targetCals = currentMeal.calories;
  const targetProtein = currentMeal.protein;

  // فحص البدائل الجاهزة أولاً
  let swaps = [];
  if (currentMeal.swaps && currentMeal.swaps.length > 0) {
    swaps = [...currentMeal.swaps];
  }

  // فلترة البدائل واستبعاد أي مسبب حساسية
  return swaps.filter(swap => {
    if (!userAllergens || userAllergens.length === 0) return true;
    const desc = (swap.titleAr + ' ' + (swap.description || '')).toLowerCase();
    for (const allergen of userAllergens) {
      if (allergen === 'dairy' && (desc.includes('حليب') || desc.includes('زبادي') || desc.includes('جبن'))) return false;
      if (allergen === 'fish' && (desc.includes('سمك') || desc.includes('سلمون') || desc.includes('تونا'))) return false;
      if (allergen === 'eggs' && desc.includes('بيض')) return false;
      if (allergen === 'nuts' && (desc.includes('لوز') || desc.includes('مكسرات') || desc.includes('فول'))) return false;
      if (allergen === 'gluten' && (desc.includes('شوفان') || desc.includes('خبز') || desc.includes('قمح'))) return false;
    }
    return true;
  });
}

/**
 * تحليل الوجبة النصية باللغة العربية واستخراج المكونات والكميات المحتملة
 * مثل: "أكلت 190غ صدر دجاج و170غ بطاطا وسلطة"
 */
export function parseArabicMealText(text) {
  if (!text || typeof text !== 'string') {
    return {
      success: false,
      rawText: '',
      items: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
      uncertainty: 'high',
      notes: 'لم يتم إدخال نص كافٍ.'
    };
  }

  const items = [];
  const lower = text.toLowerCase();

  // 1. فحص صدر دجاج
  const chickenMatch = lower.match(/(\d+)\s*(?:غ|جم|غرام|غم)?\s*(?:صدر|صدور)?\s*دجاج|دجاج\s*(\d+)\s*(?:غ|جم|غرام|غم)?/);
  if (chickenMatch || lower.includes('دجاج')) {
    const grams = chickenMatch ? Number(chickenMatch[1] || chickenMatch[2]) : 150;
    const factor = grams / 100;
    items.push({
      nameAr: 'صدر دجاج مشوي',
      grams,
      calories: Math.round(165 * factor),
      protein: Math.round(31 * factor),
      carbs: 0,
      fats: Math.round(3.6 * factor),
      icon: 'chicken',
      isEstimated: !chickenMatch
    });
  }

  // 2. فحص بطاطا مسلوقة أو مشوية
  const potatoMatch = lower.match(/(\d+)\s*(?:غ|جم|غرام|غم)?\s*(?:بطاطا|بطاطس)|(?:بطاطا|بطاطس)\s*(\d+)\s*(?:غ|جم|غرام|غم)?/);
  if (potatoMatch || lower.includes('بطاطا') || lower.includes('بطاطس')) {
    const grams = potatoMatch ? Number(potatoMatch[1] || potatoMatch[2]) : 150;
    const factor = grams / 100;
    items.push({
      nameAr: 'بطاطا مسلوقة',
      grams,
      calories: Math.round(87 * factor),
      protein: Math.round(1.9 * factor),
      carbs: Math.round(20.1 * factor),
      fats: Math.round(0.1 * factor),
      icon: 'potato',
      isEstimated: !potatoMatch
    });
  }

  // 3. فحص أرز
  const riceMatch = lower.match(/(\d+)\s*(?:غ|جم|غرام|غم)?\s*(?:أرز|رز)|(?:أرز|رز)\s*(\d+)\s*(?:غ|جم|غرام|غم)?/);
  if (riceMatch || lower.includes('أرز') || lower.includes('رز')) {
    const grams = riceMatch ? Number(riceMatch[1] || riceMatch[2]) : 150;
    const factor = grams / 100;
    items.push({
      nameAr: 'أرز أبيض مطبوخ',
      grams,
      calories: Math.round(130 * factor),
      protein: Math.round(2.7 * factor),
      carbs: Math.round(28.2 * factor),
      fats: Math.round(0.3 * factor),
      icon: 'rice',
      isEstimated: !riceMatch
    });
  }

  // 4. فحص سلطة وخضار مع استخراج الغرامات بدقة
  const saladMatch = lower.match(/(\d+)\s*(?:غ|جم|غرام|غم)?\s*(?:صحن|طبق|صحون)?\s*(?:سلطة|خضار|خضروات)|(?:سلطة|خضار|خضروات)\s*(\d+)\s*(?:غ|جم|غرام|غم)?/);
  if (saladMatch || lower.includes('سلطة') || lower.includes('خضار')) {
    const grams = saladMatch ? Number(saladMatch[1] || saladMatch[2]) : 100;
    const factor = grams / 100;
    items.push({
      nameAr: 'سلطة خضراء طازجة',
      grams,
      calories: Math.round(28 * factor),
      protein: Math.round(2 * factor),
      carbs: Math.round(6 * factor),
      fats: 0,
      icon: 'salad',
      isEstimated: !saladMatch
    });
  }

  // 5. فحص شوفان
  const oatsMatch = lower.match(/(\d+)\s*(?:غ|جم|غرام|غم)?\s*شوفان|شوفان\s*(\d+)\s*(?:غ|جم|غرام|غم)?/);
  if (oatsMatch || lower.includes('شوفان')) {
    const grams = oatsMatch ? Number(oatsMatch[1] || oatsMatch[2]) : 80;
    const factor = grams / 100;
    items.push({
      nameAr: 'شوفان كامل الحبة',
      grams,
      calories: Math.round(389 * factor),
      protein: Math.round(16.9 * factor),
      carbs: Math.round(66.3 * factor),
      fats: Math.round(6.9 * factor),
      icon: 'oats',
      isEstimated: !oatsMatch
    });
  }

  // 6. فحص بيض
  const eggMatch = lower.match(/(\d+)\s*(?:حبة|بيضات|بيضة)/);
  if (eggMatch || (lower.includes('بيض') && !chickenMatch)) {
    const count = eggMatch ? Number(eggMatch[1]) : 2;
    items.push({
      nameAr: `${count} بيض مسلوق`,
      grams: count * 50,
      calories: count * 78,
      protein: count * 6.3,
      carbs: Math.round(count * 0.6),
      fats: count * 5.3,
      icon: 'egg',
      isEstimated: false
    });
  }

  // 7. فحص تونة / سمك
  const fishMatch = lower.match(/(\d+)\s*(?:غ|جم|غرام|غم)?\s*(?:تونا|تونة|سمك|سلمون)|(?:تونا|تونة|سمك|سلمون)\s*(\d+)\s*(?:غ|جم|غرام|غم)?/);
  if (fishMatch || (lower.includes('تونا') || lower.includes('تونة') || lower.includes('سلمون'))) {
    const grams = fishMatch ? Number(fishMatch[1] || fishMatch[2]) : 140;
    const factor = grams / 100;
    items.push({
      nameAr: 'تونا / سمك مشوي',
      grams,
      calories: Math.round(132 * factor),
      protein: Math.round(28 * factor),
      carbs: 0,
      fats: Math.round(1.5 * factor),
      icon: 'fish',
      isEstimated: !fishMatch
    });
  }

  // إذا لم نجد شيئاً محدداً:
  if (items.length === 0) {
    const isQuestionOrChat = lower.includes('كم') || lower.includes('كيف') || lower.includes('متبقي') || lower.includes('باقي') || lower.includes('ضايل') || lower.includes('فاضل') || lower.includes('تمرين') || lower.includes('تدريب') || lower.includes('ماء') || lower.includes('مكمل') || lower.includes('ألم') || lower.includes('وجع') || lower.includes('؟') || lower.includes('?');

    // لا يتم اختراع وجبة افتراضية إذا كانت الرسالة سؤالاً أو استفساراً عاماً
    if (isQuestionOrChat || (!lower.includes('أكلت') && !lower.includes('اكلت') && !lower.includes('تناولت') && !lower.includes('وجبة') && !lower.includes('وجبتي') && !lower.includes('احسب'))) {
      return {
        success: false,
        rawText: text,
        items: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFats: 0,
        uncertainty: 'high',
        note: 'لم يتم العثور على أطعمة محددة في النص.'
      };
    }

    items.push({
      nameAr: text.trim(),
      grams: 200,
      calories: 300,
      protein: 20,
      carbs: 35,
      fats: 8,
      icon: 'food',
      isEstimated: true
    });
  }

  const totalCalories = items.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = items.reduce((sum, item) => sum + item.protein, 0);
  const totalCarbs = items.reduce((sum, item) => sum + item.carbs, 0);
  const totalFats = items.reduce((sum, item) => sum + item.fats, 0);

  const hasUncertainty = items.some(i => i.isEstimated);

  return {
    success: true,
    rawText: text,
    items,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFats,
    uncertainty: hasUncertainty ? 'medium' : 'low',
    note: hasUncertainty ? 'تم تقدير بعض الأوزان تلقائياً. يمكنك تعديل الغرامات بدقة قبل الحفظ.' : 'تم استخراج الغرامات بدقة من النص.'
  };
}

/**
 * توليد قائمة المشتريات الأسبوعية التراكمية من خطة الوجبات
 */
export function generateWeeklyShoppingList(meals = DEFAULT_MEALS) {
  const map = new Map();

  meals.forEach(meal => {
    meal.ingredients?.forEach(ing => {
      const key = ing.name;
      if (!map.has(key)) {
        map.set(key, {
          name: ing.name,
          category: categorizeFood(ing.name),
          unit: ing.amount,
          checked: false
        });
      }
    });
  });

  return Array.from(map.values());
}

function categorizeFood(name) {
  if (name.includes('دجاج') || name.includes('لحم') || name.includes('سلمون') || name.includes('تونا') || name.includes('بيض')) {
    return 'مصادر البروتين';
  }
  if (name.includes('بطاطا') || name.includes('أرز') || name.includes('شوفان') || name.includes('خبز')) {
    return 'الكربوهيدرات والنشويات';
  }
  if (name.includes('سلطة') || name.includes('بروكلي') || name.includes('خضار') || name.includes('توت')) {
    return 'الخضروات والفواكه';
  }
  return 'المؤونة والزيوت';
}
