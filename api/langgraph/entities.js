import { FOOD_ITEMS } from '../../src/data/foods.js';
import { EXERCISES } from '../../src/data/exercises.js';

export function normalizeText(text) {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '') // Remove Arabic tashkeel / diacritics
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)) // Convert Eastern Arabic digits ٠-٩ to 0-9
    .replace(/٫/g, '.') // Convert Arabic decimal comma to dot
    .trim();
}

export const FOOD_ALIASES = {
  'دجاج': 'chicken-breast-cooked',
  'صدر دجاج': 'chicken-breast-cooked',
  'صدور دجاج': 'chicken-breast-cooked',
  'صدر دجاج مشوي': 'chicken-breast-cooked',
  'صدر دجاج مطبوخ': 'chicken-breast-cooked',
  'دجاج مشوي': 'chicken-breast-cooked',
  'دجاج مطبوخ': 'chicken-breast-cooked',
  'دجاج بعد الطبخ': 'chicken-breast-cooked',
  'صدر دجاج بعد الطبخ': 'chicken-breast-cooked',
  'دجاج نيء': 'chicken-breast-raw',
  'دجاج ني': 'chicken-breast-raw',
  'صدر دجاج نيء': 'chicken-breast-raw',
  'صدر دجاج ني': 'chicken-breast-raw',
  'دجاج قبل الطبخ': 'chicken-breast-raw',
  'صدر دجاج قبل الطبخ': 'chicken-breast-raw',
  'رز': 'white-rice-cooked',
  'ارز': 'white-rice-cooked',
  'رز ابيض': 'white-rice-cooked',
  'ارز ابيض': 'white-rice-cooked',
  'رز مطبوخ': 'white-rice-cooked',
  'ارز مطبوخ': 'white-rice-cooked',
  'رز ابيض مطبوخ': 'white-rice-cooked',
  'ارز ابيض مطبوخ': 'white-rice-cooked',
  'بطاطا': 'boiled-potatoes',
  'بطاطس': 'boiled-potatoes',
  'بطاطا مسلوقة': 'boiled-potatoes',
  'بطاطا مسلوقه': 'boiled-potatoes',
  'شوفان': 'rolled-oats',
  'بيض': 'whole-eggs-boiled',
  'بيض مسلوق': 'whole-eggs-boiled',
  'بيض مقلي': 'whole-eggs-boiled',
  'زيت زيتون': 'olive-oil',
  'سلطة': 'green-salad',
  'سلطه': 'green-salad',
  'سلمون': 'baked-salmon',
  'لوز': 'raw-almonds',
  'موز': 'banana',
  'تفاح': 'apple',
  'تونا': 'canned-tuna',
  'تونة': 'canned-tuna',
  'لحم': 'beef-cooked',
  'لحمة': 'beef-cooked',
  'لحم عجل': 'beef-cooked'
};

export const EXERCISE_ALIASES = {
  'بنش': 'flat-barbell-bench-press',
  'بنش برس': 'flat-barbell-bench-press',
  'بنش بريس': 'flat-barbell-bench-press',
  'bench': 'flat-barbell-bench-press',
  'bench press': 'flat-barbell-bench-press',
  'flat bench': 'flat-barbell-bench-press',
  'بنش عالي': 'incline-bench-press',
  'بنش مائل': 'incline-bench-press',
  'سكوات': 'barbell-back-squat',
  'squat': 'barbell-back-squat',
  'ديدلفت': 'conventional-deadlift',
  'deadlift': 'conventional-deadlift',
  'سحب ظهر': 'lat-pulldown',
  'lat pulldown': 'lat-pulldown',
  'تجديف': 'barbell-bent-over-row',
  'row': 'barbell-bent-over-row',
  'ضغط كتف': 'overhead-press-barbell',
  'overhead press': 'overhead-press-barbell',
  'ohp': 'overhead-press-barbell',
  'بايسبس': 'barbell-biceps-curl',
  'باي': 'barbell-biceps-curl',
  'ترايسبس': 'cable-triceps-pushdown',
  'تراي': 'cable-triceps-pushdown'
};

export function matchFood(query, requestedState = null) {
  const norm = normalizeText(query);
  if (!norm) return null;

  // Determine explicit state from query if not specified
  let state = requestedState;
  if (!state) {
    if (/(?:نيء|ني|غير مطبوخ|قبل الطبخ|raw)/i.test(norm)) {
      state = 'raw';
    } else if (/(?:مشوي|مطبوخ|مسلوق|بعد الطبخ|cooked|grilled|boiled)/i.test(norm)) {
      state = 'cooked';
    }
  }

  // 0. Direct ID match
  const directId = FOOD_ITEMS.find(f => f.id === norm || f.id.toLowerCase() === norm.toLowerCase());
  if (directId) return directId;

  // 1. Direct alias match
  const aliasId = FOOD_ALIASES[norm];
  if (aliasId) {
    // If user explicitly requested raw or cooked, find the variant if possible
    if (state === 'raw' && aliasId.includes('cooked')) {
      const rawVariant = FOOD_ITEMS.find(f => f.id === aliasId.replace('cooked', 'raw'));
      if (rawVariant) return rawVariant;
    }
    const found = FOOD_ITEMS.find(f => f.id === aliasId);
    if (found) return found;
  }

  // 2. Filter by state if specified
  const candidatePool = state ? FOOD_ITEMS.filter(f => f.state === state) : FOOD_ITEMS;

  // Exact nameAr / nameEn match
  const exact = candidatePool.find(f =>
    normalizeText(f.nameAr) === norm || normalizeText(f.nameEn) === norm
  );
  if (exact) return exact;

  // Substring match
  const substring = candidatePool.find(f => {
    const ar = normalizeText(f.nameAr);
    const en = normalizeText(f.nameEn);
    return ar.includes(norm) || norm.includes(ar) || en.includes(norm) || norm.includes(en);
  });
  if (substring) return substring;

  // Fallback to all foods if state filter didn't find anything
  if (state) {
    const fallback = FOOD_ITEMS.find(f => {
      const ar = normalizeText(f.nameAr);
      const en = normalizeText(f.nameEn);
      return ar === norm || ar.includes(norm) || norm.includes(ar);
    });
    if (fallback) return fallback;
  }

  return null;
}

export function calculateFoodMacros(food, grams) {
  const g = Number(grams) || 0;
  const calsPer100 = Number(food.caloriesPer100g) || 0;
  const pPer100 = Number(food.proteinPer100g) || 0;
  const cPer100 = Number(food.carbsPer100g) || 0;
  const fPer100 = Number(food.fatsPer100g) || 0;
  const fibPer100 = Number(food.fiberPer100g) || 0;

  return {
    grams: g,
    calories: Math.round((calsPer100 * g) / 100),
    protein: Math.round(((pPer100 * g) / 100) * 10) / 10,
    carbs: Math.round(((cPer100 * g) / 100) * 10) / 10,
    fats: Math.round(((fPer100 * g) / 100) * 10) / 10,
    fiber: Math.round(((fibPer100 * g) / 100) * 10) / 10
  };
}

export function matchExercise(query) {
  const norm = normalizeText(query);
  if (!norm) return null;

  const aliasId = EXERCISE_ALIASES[norm];
  if (aliasId) {
    const found = EXERCISES.find(ex => ex.id === aliasId);
    if (found) return found;
  }

  const match = EXERCISES.find(ex => {
    const exAr = normalizeText(ex.nameAr);
    const exEn = normalizeText(ex.nameEn);
    return exAr === norm || exEn === norm || exAr.includes(norm) || norm.includes(exAr);
  });

  return match || { id: norm.replace(/\s+/g, '-'), nameAr: query, nameEn: query };
}

export function parseWaterAmount(text) {
  const norm = normalizeText(text);
  if (!norm) return null;

  if (norm.includes('لترين') || norm.includes('2 لتر') || norm.includes('2l') || norm.includes('2 liter')) return 2000;
  if (norm.includes('لتر ونصف') || norm.includes('لتر ونص') || norm.includes('1.5 لتر') || norm.includes('1.5l')) return 1500;
  if (norm.includes('نصف لتر') || norm.includes('نص لتر') || norm.includes('0.5 لتر') || norm.includes('half liter')) return 500;
  if (norm.includes('لتر') || norm.includes('1 لتر') || norm.includes('1l') || norm.includes('liter')) return 1000;
  if (norm.includes('كاستين') || norm.includes('كوبين') || norm.includes('2 كاس')) return 500;
  if (norm.includes('كاسه') || norm.includes('كاسة') || norm.includes('كوب') || norm.includes('glass') || norm.includes('cup')) return 250;

  const match = norm.match(/(\d+(?:\.\d+)?)\s*(مل|ملل|ملليلتر|لتر|كاسه|كاسة|كوب|ml|l|liter|liters)/);
  if (match) {
    const val = parseFloat(match[1]);
    const unit = match[2];
    if (unit.startsWith('لتر') || unit === 'l' || unit.startsWith('liter')) return Math.round(val * 1000);
    if (unit.startsWith('كاس') || unit.startsWith('كوب')) return Math.round(val * 250);
    return Math.round(val);
  }
  return null;
}

export function parseWeight(text) {
  const norm = normalizeText(text);
  if (!norm) return null;

  const match = norm.match(/(?:وزني(?: اليوم)?|سجل وزني|وزن اليوم|وزني هو|وزن)\s*(?:هو|صار)?\s*(\d+(?:\.\d+)?)\s*(?:كيلو|كغ|kg)?/i) ||
                norm.match(/^(\d{2,3}(?:\.\d+)?)\s*(?:كيلو|كغ|kg)?$/i);
  if (match) {
    const val = parseFloat(match[1]);
    if (val >= 20 && val <= 500) return val;
  }
  return null;
}
