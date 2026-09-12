/**
 * NEON ACTION AGENT - خدمة البحث والتحقق من القيمة الغذائية (Food Search Abstraction)
 * تفحص أولاً قاعدة بيانات NEON المعتمدة، ثم تبحث في المصادر الخارجية (OpenFoodFacts)
 * أو تقدم تقديراً معتمداً مع التمييز الصارم بين (known values) و (estimated values).
 */

import { FOOD_ITEMS } from '../data/foods.js';
import { normalizeText } from '../domain/actionParser.js';

export async function searchFoodNutrition(query, grams = 100) {
  const norm = normalizeText(query);
  if (!norm) return null;

  // 1. البحث في قاعدة بيانات NEON المحلية
  const localMatch = FOOD_ITEMS.find(food => {
    const ar = normalizeText(food.nameAr);
    const en = normalizeText(food.nameEn);
    return ar === norm || en === norm || ar.includes(norm) || norm.includes(ar);
  });

  if (localMatch) {
    const scale = grams / 100;
    return {
      name: localMatch.nameAr,
      nameEn: localMatch.nameEn,
      source: 'NEON Verified Database (USDA)',
      servingGrams: grams,
      calories: Math.round((localMatch.caloriesPer100g || 0) * scale),
      protein: Math.round((localMatch.proteinPer100g || 0) * scale * 10) / 10,
      carbs: Math.round((localMatch.carbsPer100g || 0) * scale * 10) / 10,
      fats: Math.round((localMatch.fatsPer100g || 0) * scale * 10) / 10,
      fiber: Math.round((localMatch.fiberPer100g || 0) * scale * 10) / 10,
      isEstimated: false,
      confidence: 'high'
    };
  }

  // 2. محاولة البحث الخارجي عبر OpenFoodFacts (إذا كان هناك اتصال بالإنترنت)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=1`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const product = data?.products?.[0];
      if (product && product.nutriments) {
        const n = product.nutriments;
        const calsPer100 = n['energy-kcal_100g'] || (n['energy_100g'] ? Math.round(n['energy_100g'] / 4.184) : 0);
        const pPer100 = n['proteins_100g'] || 0;
        const cPer100 = n['carbohydrates_100g'] || 0;
        const fPer100 = n['fat_100g'] || 0;
        const scale = grams / 100;

        if (calsPer100 > 0 || pPer100 > 0) {
          return {
            name: product.product_name_ar || product.product_name || query,
            source: 'Open Food Facts Global Database',
            servingGrams: grams,
            calories: Math.round(calsPer100 * scale),
            protein: Math.round(pPer100 * scale * 10) / 10,
            carbs: Math.round(cPer100 * scale * 10) / 10,
            fats: Math.round(fPer100 * scale * 10) / 10,
            fiber: Math.round((n['fiber_100g'] || 0) * scale * 10) / 10,
            isEstimated: false,
            confidence: 'verified_external'
          };
        }
      }
    }
  } catch (_) {
    // تجاوز أخطاء الشبكة بهدوء واستخدام التقدير المعتدل
  }

  // 3. التقدير الذكي المعلن صراحة (Estimated fallback)
  const scale = grams / 100;
  let estCals = 160;
  let estP = 8;
  let estC = 20;
  let estF = 4;

  if (norm.includes('بروتين') || norm.includes('دجاج') || norm.includes('لحم') || norm.includes('سمك') || norm.includes('تونا')) {
    estCals = 180;
    estP = 26;
    estC = 0;
    estF = 6;
  } else if (norm.includes('رز') || norm.includes('بطاطا') || norm.includes('خبز') || norm.includes('شوفان') || norm.includes('مكرونة')) {
    estCals = 135;
    estP = 3;
    estC = 28;
    estF = 1;
  } else if (norm.includes('مكسرات') || norm.includes('زيت') || norm.includes('زبدة') || norm.includes('فول سوداني')) {
    estCals = 580;
    estP = 18;
    estC = 16;
    estF = 48;
  }

  return {
    name: query,
    source: 'NEON Nutrition Estimator (تقريبي)',
    servingGrams: grams,
    calories: Math.round(estCals * scale),
    protein: Math.round(estP * scale * 10) / 10,
    carbs: Math.round(estC * scale * 10) / 10,
    fats: Math.round(estF * scale * 10) / 10,
    fiber: 1,
    isEstimated: true,
    confidence: 'estimated'
  };
}
