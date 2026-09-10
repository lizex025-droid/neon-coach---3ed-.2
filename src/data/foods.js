/**
 * NEON COACH - قاعدة الأطعمة والوجبات المعتمدة
 * تتضمن القيم الغذائية الحقيقية لكل 100غ، والوجبات المتكاملة الشائعة في الثقافة العربية والرياضية
 * القيم مصدرها قواعد بيانات وزارة الزراعة الأمريكية (USDA) والبيانات الغذائية المدققة
 */

import foodSource from './foods.json' with { type: 'json' };
import { CURATED_121_FOODS } from './curatedFoods121.js';
import { scalePer100, normalizeFoodSearchText, hasFoodSearchInput } from '../domain/nutritionCalculations.js';

export const FOOD_ITEMS = [
  ...CURATED_121_FOODS,
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

export const IMPORTED_FOOD_COUNT = IMPORTED_FOODS.length + CURATED_121_FOODS.length;

// تكييف الأطعمة المعتمدة والمحلية
const ADAPTED_FOOD_ITEMS = FOOD_ITEMS.map(f => ({
  id: f.id,
  name: f.nameAr,
  nameAr: f.nameAr,
  nameEn: f.nameEn || '',
  category: f.category || '',
  state: f.state || '',
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

// استرجاع الأطعمة المخصصة المحفوظة محلياً بواسطة المستخدم
let _inMemoryCustomFoods = [];

export function getCustomFoods() {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('neon_custom_foods_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse custom foods:', e);
  }
  return _inMemoryCustomFoods;
}

// قاعدة الأطعمة الموحدة (تبدأ بالأطعمة المخصصة ثم الأصناف الـ 121 المعتمدة ثم المستوردة)
export const FOODS = [...getCustomFoods(), ...ADAPTED_FOOD_ITEMS, ...IMPORTED_FOODS];
const FOOD_INDEX = new Map(FOODS.map(f => [f.id, f]));

export function foodById(id) {
  return FOOD_INDEX.get(id) || FOOD_ITEMS.find(f => f.id === id);
}

/**
 * إضافة أكلة جديدة يدوياً إلى قاعدة البيانات وتثبيتها محلياً وسحابياً
 * @param {Object} foodData
 * @param {string} foodData.name اسم الأكلة
 * @param {number} foodData.calories السعرات لكل 100غ
 * @param {number} foodData.protein البروتين (غ)
 * @param {number} foodData.carbs الكربوهيدرات (غ)
 * @param {number} foodData.fats الدهون (غ)
 * @param {number} [foodData.servingSize=100] حجم الحصة الافتراضي بالغرام
 * @returns {Object} الصنف المضاف
 */
export function addCustomFood({ name, calories, protein, carbs, fats, servingSize = 100 }) {
  const trimmedName = (name || '').trim();
  if (!trimmedName) {
    throw new Error('يرجى كتابة اسم الأكلة');
  }

  // معالجة الأرقام وتحويل الأرقام العربية إلى غربية إن وجدت
  const cleanNum = (v) => {
    if (typeof v === 'string') {
      v = v.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
    }
    return Math.max(0, Number(v) || 0);
  };

  const kcal = Math.round(cleanNum(calories));
  const p = Math.round(cleanNum(protein) * 10) / 10;
  const c = Math.round(cleanNum(carbs) * 10) / 10;
  const f = Math.round(cleanNum(fats) * 10) / 10;
  const baseWeight = Math.max(1, Math.round(cleanNum(servingSize) || 100));

  const id = `cust_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const newFood = {
    id,
    name: trimmedName,
    nameAr: trimmedName,
    nameEn: '',
    baseWeight,
    per100: {
      kcal,
      p,
      c,
      f,
      fiber: 0
    },
    caloriesPer100g: kcal,
    proteinPer100g: p,
    carbsPer100g: c,
    fatsPer100g: f,
    source: 'custom',
    isCustom: true,
    available: true,
    createdAt: new Date().toISOString()
  };

  // إضافتها في بداية قاعدة الأطعمة المفتوحة في الذاكرة لتكون أول ما يظهر بالبحث
  FOODS.unshift(newFood);
  FOOD_INDEX.set(id, newFood);
  _inMemoryCustomFoods = _inMemoryCustomFoods.filter(item => item.id !== id);
  _inMemoryCustomFoods.unshift(newFood);

  // حفظها محلياً في localStorage
  try {
    if (typeof localStorage !== 'undefined') {
      const existing = getCustomFoods();
      // منع التكرار بنفس المعرف
      const filtered = existing.filter(item => item.id !== id);
      filtered.unshift(newFood);
      localStorage.setItem('neon_custom_foods_v1', JSON.stringify(filtered));
    }
  } catch (e) {
    console.warn('Failed to save custom food to localStorage:', e);
  }

  // مزامنتها مع Supabase في الخلفية إن توفرت الجلسة
  try {
    import('../services/syncService.js').then(({ syncService }) => {
      syncService?.saveCustomFood?.(newFood);
    }).catch(() => {});
  } catch (e) {}

  return newFood;
}

/**
 * تعديل أكلة مخصصة محفوظة في قاعدة البيانات
 */
export function updateCustomFood(id, { name, calories, protein, carbs, fats, servingSize = 100 }) {
  if (!id) throw new Error('معرف الصنف مطلوب للتعديل');
  const trimmedName = (name || '').trim();
  if (!trimmedName) throw new Error('يرجى كتابة اسم الأكلة');

  const cleanNum = (v) => {
    if (typeof v === 'string') {
      v = v.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
    }
    return Math.max(0, Number(v) || 0);
  };

  const kcal = Math.round(cleanNum(calories));
  const p = Math.round(cleanNum(protein) * 10) / 10;
  const c = Math.round(cleanNum(carbs) * 10) / 10;
  const f = Math.round(cleanNum(fats) * 10) / 10;
  const baseWeight = Math.max(1, Math.round(cleanNum(servingSize) || 100));

  const existingFood = foodById(id);
  const updatedFood = {
    ...(existingFood || {}),
    id,
    name: trimmedName,
    nameAr: trimmedName,
    baseWeight,
    per100: {
      kcal,
      p,
      c,
      f,
      fiber: existingFood?.per100?.fiber || 0
    },
    caloriesPer100g: kcal,
    proteinPer100g: p,
    carbsPer100g: c,
    fatsPer100g: f,
    source: 'custom',
    isCustom: true,
    available: true,
    updatedAt: new Date().toISOString()
  };

  // تحديث في الذاكرة
  const idx = FOODS.findIndex(f => f.id === id);
  if (idx !== -1) {
    FOODS[idx] = updatedFood;
  } else {
    FOODS.unshift(updatedFood);
  }
  FOOD_INDEX.set(id, updatedFood);

  _inMemoryCustomFoods = _inMemoryCustomFoods.map(item => item.id === id ? updatedFood : item);
  if (!_inMemoryCustomFoods.some(item => item.id === id)) {
    _inMemoryCustomFoods.unshift(updatedFood);
  }

  // تحديث في localStorage
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = getCustomFoods();
      const newStored = stored.map(item => item.id === id ? updatedFood : item);
      if (!newStored.some(item => item.id === id)) newStored.unshift(updatedFood);
      localStorage.setItem('neon_custom_foods_v1', JSON.stringify(newStored));
    }
  } catch (e) {
    console.warn('Failed to update custom food in localStorage:', e);
  }

  // مزامنة مع Supabase في الخلفية
  try {
    import('../services/syncService.js').then(({ syncService }) => {
      syncService?.updateCustomFood?.(id, updatedFood);
    }).catch(() => {});
  } catch (e) {}

  return updatedFood;
}

/**
 * حذف أكلة مخصصة من قاعدة البيانات
 */
export function deleteCustomFood(id) {
  if (!id) return false;
  const idx = FOODS.findIndex(f => f.id === id);
  if (idx !== -1) {
    FOODS.splice(idx, 1);
  }
  FOOD_INDEX.delete(id);
  _inMemoryCustomFoods = _inMemoryCustomFoods.filter(item => item.id !== id);

  try {
    if (typeof localStorage !== 'undefined') {
      const existing = getCustomFoods().filter(f => f.id !== id);
      localStorage.setItem('neon_custom_foods_v1', JSON.stringify(existing));
    }
  } catch (e) {}

  // حذف من Supabase في الخلفية
  try {
    import('../services/syncService.js').then(({ syncService }) => {
      syncService?.deleteCustomFood?.(id);
    }).catch(() => {});
  } catch (e) {}

  return true;
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
 * محرك البحث في قاعدة الأطعمة العربية (مع أولوية للأطعمة المخصصة المضافة يدوياً)
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
    // منح الأطعمة المخصصة التي أضافها المتدرب أولوية بالبحث
    if (food.isCustom && score > 0) score += 15;
    return { food, score };
  }).filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.food.id.localeCompare(b.food.id))
    .slice(0, limit)
    .map(item => item.food);
}
