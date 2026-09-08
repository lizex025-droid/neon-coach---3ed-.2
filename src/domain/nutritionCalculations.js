/**
 * NEON COACH - عمليات وحسابات التغذية وقاعدة الأطعمة
 */

const NUTRIENT_KEYS = ['kcal', 'p', 'c', 'f', 'fiber'];

/**
 * حساب قيم الماكروز لوزن معين بناء على قيم الـ 100 غرام
 */
export function scalePer100(per100 = {}, grams = 0) {
  const safeGrams = Math.max(0, Number(grams) || 0);
  const factor = safeGrams / 100;
  return Object.fromEntries(
    NUTRIENT_KEYS.map((key) => [key, +((Number(per100[key]) || 0) * factor).toFixed(1)]),
  );
}

/**
 * حساب الغرامات المطلوبة لتحقيق رقم سعرات محدد
 */
export function gramsForCaloriesValue(caloriesPer100, targetCalories) {
  const density = Number(caloriesPer100);
  const target = Number(targetCalories);
  if (!(density > 0) || !(target >= 0)) return null;
  return +((target * 100) / density).toFixed(1);
}

/**
 * تطبيع النص العربي للبحث (إزالة التشكيل، توحيد الهمزات والألف والياء والتاء المربوطة)
 */
export function normalizeFoodSearchText(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/**
 * تكوين اسم الوجبة من أصنافها (مثال: صدر دجاج + بطاطا مسلوقة)
 */
export function mealNameFromItems(items = [], fallback = 'وجبة مسجلة') {
  const names = items
    .map((item) => String(item?.name || item?.nameAr || '').trim())
    .filter(Boolean);

  return names.length ? names.join(' + ') : fallback;
}

/**
 * التحقق من وجود مدخل بحث كافٍ
 */
export function hasFoodSearchInput(value = '') {
  return normalizeFoodSearchText(value).length >= 1;
}
