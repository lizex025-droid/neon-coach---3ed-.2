/**
 * NEON COACH - قاعدة الأطعمة والوجبات المعتمدة
 * تتضمن القيم الغذائية الحقيقية لكل 100غ، والوجبات المتكاملة الشائعة في الثقافة العربية والرياضية
 * القيم مصدرها قواعد بيانات وزارة الزراعة الأمريكية (USDA) والبيانات الغذائية المدققة
 */

import foodSource from './foods.json' with { type: 'json' };
import { scalePer100, normalizeFoodSearchText, hasFoodSearchInput } from '../domain/nutritionCalculations.js';

export const FOOD_ITEMS = [
  {
    id: 'chicken-breast-cooked',
    nameAr: 'صدر دجاج مشوي',
    nameEn: 'Grilled Chicken Breast',
    state: 'cooked', // cooked / raw
    caloriesPer100g: 165,
    proteinPer100g: 31,
    carbsPer100g: 0,
    fatsPer100g: 3.6,
    fiberPer100g: 0,
    category: 'protein',
    allergens: []
  },
  {
    id: 'chicken-breast-raw',
    nameAr: 'صدر دجاج نيء',
    nameEn: 'Raw Chicken Breast',
    state: 'raw',
    caloriesPer100g: 120,
    proteinPer100g: 22.5,
    carbsPer100g: 0,
    fatsPer100g: 2.6,
    fiberPer100g: 0,
    category: 'protein',
    allergens: []
  },
  {
    id: 'boiled-potatoes',
    nameAr: 'بطاطا مسلوقة',
    nameEn: 'Boiled Potatoes',
    state: 'cooked',
    caloriesPer100g: 87,
    proteinPer100g: 1.9,
    carbsPer100g: 20.1,
    fatsPer100g: 0.1,
    fiberPer100g: 1.8,
    category: 'carbs',
    allergens: []
  },
  {
    id: 'white-rice-cooked',
    nameAr: 'أرز أبيض مطبوخ',
    nameEn: 'Cooked White Rice',
    state: 'cooked',
    caloriesPer100g: 130,
    proteinPer100g: 2.7,
    carbsPer100g: 28.2,
    fatsPer100g: 0.3,
    fiberPer100g: 0.4,
    category: 'carbs',
    allergens: []
  },
  {
    id: 'green-salad',
    nameAr: 'سلطة خضراء طازجة (بدون زيت)',
    nameEn: 'Fresh Green Salad',
    state: 'raw',
    caloriesPer100g: 20,
    proteinPer100g: 1.2,
    carbsPer100g: 3.8,
    fatsPer100g: 0.2,
    fiberPer100g: 1.9,
    category: 'vegetables',
    allergens: []
  },
  {
    id: 'baked-salmon',
    nameAr: 'سلمون مشوي بالفرن',
    nameEn: 'Baked Salmon Fillet',
    state: 'cooked',
    caloriesPer100g: 206,
    proteinPer100g: 22.1,
    carbsPer100g: 0,
    fatsPer100g: 12.3,
    fiberPer100g: 0,
    category: 'protein',
    allergens: ['fish']
  },
  {
    id: 'rolled-oats',
    nameAr: 'شوفان كامل الحبة',
    nameEn: 'Rolled Oats',
    state: 'raw',
    caloriesPer100g: 389,
    proteinPer100g: 16.9,
    carbsPer100g: 66.3,
    fatsPer100g: 6.9,
    fiberPer100g: 10.6,
    category: 'carbs',
    allergens: ['gluten']
  },
  {
    id: 'greek-yogurt-0',
    nameAr: 'زبادي يوناني قليل الدسم',
    nameEn: 'Low Fat Greek Yogurt',
    state: 'ready',
    caloriesPer100g: 73,
    proteinPer100g: 10,
    carbsPer100g: 4,
    fatsPer100g: 1.9,
    fiberPer100g: 0,
    category: 'dairy',
    allergens: ['dairy']
  },
  {
    id: 'mixed-berries',
    nameAr: 'توت مشكل (فراولة وتوت أزرق)',
    nameEn: 'Mixed Berries',
    state: 'raw',
    caloriesPer100g: 57,
    proteinPer100g: 0.7,
    carbsPer100g: 14.5,
    fatsPer100g: 0.3,
    fiberPer100g: 2.4,
    category: 'fruit',
    allergens: []
  },
  {
    id: 'whole-eggs-boiled',
    nameAr: 'بيض مسلوق كامل',
    nameEn: 'Hard Boiled Egg',
    state: 'cooked',
    caloriesPer100g: 155,
    proteinPer100g: 12.6,
    carbsPer100g: 1.1,
    fatsPer100g: 10.6,
    fiberPer100g: 0,
    category: 'protein',
    allergens: ['eggs']
  },
  {
    id: 'olive-oil',
    nameAr: 'زيت زيتون بكر ممتاز',
    nameEn: 'Extra Virgin Olive Oil',
    state: 'raw',
    caloriesPer100g: 884,
    proteinPer100g: 0,
    carbsPer100g: 0,
    fatsPer100g: 100,
    fiberPer100g: 0,
    category: 'fats',
    allergens: []
  },
  {
    id: 'raw-almonds',
    nameAr: 'لوز نيء',
    nameEn: 'Raw Almonds',
    state: 'raw',
    caloriesPer100g: 579,
    proteinPer100g: 21.2,
    carbsPer100g: 21.6,
    fatsPer100g: 49.9,
    fiberPer100g: 12.5,
    category: 'fats',
    allergens: ['nuts']
  }
];

/**
 * الوجبات الجاهزة المعتمدة في الخطة اليومية المطابقة للصورة رقم 9924EA48
 */
export const DEFAULT_MEALS = [
  {
    id: 'meal-breakfast',
    type: 'breakfast',
    titleAr: 'الفطور',
    calories: 420,
    protein: 26,
    carbs: 58,
    fats: 9,
    image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400&q=80',
    ingredients: [
      { name: 'شوفان كامل', amount: '60غ', calories: 233, protein: 10, carbs: 40, fats: 4 },
      { name: 'حليب خالي الدسم', amount: '150مل', calories: 52, protein: 5, carbs: 8, fats: 0 },
      { name: 'توت مشكل', amount: '80غ', calories: 45, protein: 1, carbs: 10, fats: 0 },
      { name: 'لوز مبشور', amount: '15غ', calories: 90, protein: 3, carbs: 3, fats: 7 }
    ],
    swaps: [
      {
        titleAr: 'أومليت بيض مع خبز شوفان',
        calories: 415,
        protein: 27,
        carbs: 45,
        fats: 14,
        description: '3 بياض بيض + بيضة كاملة مع رغيف خبز شوفان وخضار'
      },
      {
        titleAr: 'زبادي يوناني مع موز وعسل',
        calories: 425,
        protein: 24,
        carbs: 62,
        fats: 8,
        description: '200غ زبادي يوناني 2% مع موزة ملعقة صغيرة عسل'
      }
    ]
  },
  {
    id: 'meal-lunch',
    type: 'lunch',
    titleAr: 'الغداء',
    calories: 489,
    protein: 64,
    carbs: 40,
    fats: 7,
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&q=80',
    ingredients: [
      { name: 'صدر دجاج مشوي', amount: '190غ', calories: 313, protein: 59, carbs: 0, fats: 7, icon: 'chicken' },
      { name: 'بطاطا مسلوقة', amount: '170غ', calories: 148, protein: 3, carbs: 34, fats: 0, icon: 'potato' },
      { name: 'سلطة خضراء', amount: 'صحن صغير', calories: 28, protein: 2, carbs: 6, fats: 0, icon: 'salad' }
    ],
    swaps: [
      {
        titleAr: 'صدر دجاج 180غ مع 150غ أرز أبيض وسلطة',
        calories: 492,
        protein: 60,
        carbs: 45,
        fats: 6,
        description: 'تطابق بروتيني تام مع استبدال البطاطا بالأرز الأبيض'
      },
      {
        titleAr: 'فيليه سمك بلطي مشوي 230غ مع بطاطا مشوية',
        calories: 480,
        protein: 61,
        carbs: 38,
        fats: 8,
        description: 'خيار سمك خفيف قليل الدهون وسريع الهضم'
      }
    ]
  },
  {
    id: 'meal-dinner',
    type: 'dinner',
    titleAr: 'العشاء',
    calories: 380,
    protein: 42,
    carbs: 22,
    fats: 13,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80',
    ingredients: [
      { name: 'فيليه سلمون مشوي', amount: '150غ', calories: 290, protein: 34, carbs: 0, fats: 16 },
      { name: 'بروكلي وخضار سوتيه', amount: '150غ', calories: 60, protein: 4, carbs: 12, fats: 1 },
      { name: 'نصف شريحة خبز أسمر', amount: '25غ', calories: 65, protein: 3, carbs: 12, fats: 1 }
    ],
    swaps: [
      {
        titleAr: 'تونا مصفاة 160غ مع سلطة كينوا خضراء',
        calories: 375,
        protein: 44,
        carbs: 24,
        fats: 9,
        description: 'وجبة عشاء غنية بالبروتين وأوميغا 3 وسريعة التحضير'
      },
      {
        titleAr: 'جبن قريش 200غ مع زعتر وزيت زيتون وشرائح خيار',
        calories: 370,
        protein: 36,
        carbs: 14,
        fats: 18,
        description: 'بروتين كازين بطيء الامتصاص للمساعدة في البناء الليلي'
      }
    ]
  },
  {
    id: 'meal-snack',
    type: 'snack',
    titleAr: 'سناك',
    calories: 131,
    protein: 15,
    carbs: 14,
    fats: 1,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80',
    ingredients: [
      { name: 'زبادي يوناني لايت', amount: '150غ', calories: 95, protein: 14, carbs: 5, fats: 1 },
      { name: 'توت أزرق طازج', amount: '50غ', calories: 36, protein: 1, carbs: 9, fats: 0 }
    ],
    swaps: [
      {
        titleAr: 'حفنة لوز 20غ مع تفاحة خضراء صغيرة',
        calories: 145,
        protein: 4,
        carbs: 16,
        fats: 10,
        description: 'سناك صحي غني بالألياف والدهون غير المشبعة'
      }
    ]
  }
];

export function getFoodItemById(id) {
  return FOOD_ITEMS.find(f => f.id === id) || foodById(id);
}

// معالجة وتجهيز قاعدة الأطعمة الموسعة (أكثر من 600 صنف غذائي معتمد)
const seenFoodKeys = new Set();
export const IMPORTED_FOODS = (foodSource?.foods || []).map(row => {
  const key = normalizeFoodSearchText(`${row.arabic_name}|${row.english_name}`);
  const duplicate = seenFoodKeys.has(key);
  seenFoodKeys.add(key);
  const kcal = Number(row.calories_kcal) || 0;
  return {
    id: `egy_${String(row.id).padStart(3, '0')}`,
    name: row.arabic_name,
    nameAr: row.arabic_name,
    nameEn: row.english_name || '',
    baseWeight: 100,
    per100: {
      kcal,
      p: Number(row.protein_g) || 0,
      c: Number(row.carbohydrates_g) || 0,
      f: Number(row.fat_g) || 0,
      fiber: Number(row.fiber_g) || 0
    },
    source: foodSource.source || 'egyfitness',
    state: 'as-listed',
    allergens: [],
    available: kcal > 0 && !duplicate
  };
});

export const IMPORTED_FOOD_COUNT = IMPORTED_FOODS.length;

// تكييف الأطعمة المحلية الافتراضية
const ADAPTED_FOOD_ITEMS = FOOD_ITEMS.map(f => ({
  id: f.id,
  name: f.nameAr,
  nameAr: f.nameAr,
  nameEn: f.nameEn || '',
  baseWeight: 100,
  per100: {
    kcal: f.caloriesPer100g,
    p: f.proteinPer100g,
    c: f.carbsPer100g,
    f: f.fatsPer100g,
    fiber: f.fiberPer100g || 0
  },
  allergens: f.allergens || [],
  available: true
}));

// قاعدة الأطعمة الموحدة
export const FOODS = [...IMPORTED_FOODS, ...ADAPTED_FOOD_ITEMS];
const FOOD_INDEX = new Map(FOODS.map(f => [f.id, f]));

export function foodById(id) {
  return FOOD_INDEX.get(id) || FOOD_ITEMS.find(f => f.id === id);
}

/**
 * حساب الماكروز لوزن معين من صنف غذائي
 */
export function macrosFor(food, grams) {
  const f = typeof food === 'string' ? foodById(food) : food;
  if (!f) return { kcal: 0, p: 0, c: 0, f: 0, fiber: 0 };
  const per100 = f.per100 || {
    kcal: f.caloriesPer100g || 0,
    p: f.proteinPer100g || 0,
    c: f.carbsPer100g || 0,
    f: f.fatsPer100g || 0,
    fiber: f.fiberPer100g || 0
  };
  return scalePer100(per100, grams);
}

/**
 * محرك البحث في قاعدة الأطعمة العربية
 */
export function searchFoods(query, limit = 18) {
  if (!query) return [];
  const q = normalizeFoodSearchText(query);
  if (!hasFoodSearchInput(q)) return [];
  const terms = q.split(' ').filter(Boolean);

  return FOODS.filter(food => food.available !== false).map(food => {
    const ar = normalizeFoodSearchText(food.name || food.nameAr || '');
    const en = normalizeFoodSearchText(food.nameEn || '');
    const haystack = `${ar} ${en}`;
    let score = 0;
    if (ar === q || en === q) score = 100;
    else if (ar.startsWith(q) || en.startsWith(q)) score = 75;
    else if (ar.includes(q) || en.includes(q)) score = 55;
    if (terms.every(term => haystack.includes(term))) score += 25;
    return { food, score };
  }).filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.food.id.localeCompare(b.food.id))
    .slice(0, limit)
    .map(item => item.food);
}
