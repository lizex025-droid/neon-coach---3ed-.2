import test from 'node:test';
import assert from 'node:assert/strict';

import { parseArabicMealText, findMealSwaps } from '../src/domain/nutritionEngine.js';
import { DEFAULT_MEALS } from '../src/data/foods.js';
import { store } from '../src/state/store.js';

test('تحليل نص الوجبة باللغة العربية واستخراج المكونات والغرامات', () => {
  const result = parseArabicMealText('أكلت 190غ صدر دجاج و170غ بطاطا وسلطة');

  assert.equal(result.success, true);
  assert.equal(result.items.length, 3);

  const chicken = result.items.find(i => i.nameAr.includes('دجاج'));
  assert.ok(chicken);
  assert.equal(chicken.grams, 190);
  assert.ok(chicken.protein >= 55);

  const potato = result.items.find(i => i.nameAr.includes('بطاطا'));
  assert.ok(potato);
  assert.equal(potato.grams, 170);

  assert.ok(result.totalCalories > 400 && result.totalCalories < 550, `إجمالي السعرات: ${result.totalCalories}`);
});

test('استبعاد مسببات الحساسية من بدائل الوجبات المقترحة', () => {
  const lunchMeal = DEFAULT_MEALS.find(m => m.type === 'lunch');
  assert.ok(lunchMeal);

  // بدون حساسية
  const allSwaps = findMealSwaps(lunchMeal, []);
  assert.ok(allSwaps.length > 0);

  // مع حساسية السمك
  const noFishSwaps = findMealSwaps(lunchMeal, ['fish']);
  const hasFish = noFishSwaps.some(s => s.titleAr.includes('سمك') || s.titleAr.includes('سلمون'));
  assert.equal(hasFish, false, 'يجب استبعاد السمك عند وجود حساسية مأكولات بحرية');
});

test('إدارة وحفظ أسماء وتصنيفات الوجبات المخصصة بذاكرة التطبيق', () => {
  // الخيارات الافتراضية
  const defaults = store.getAllMealCategoryNames();
  assert.ok(defaults.includes('فطور'));
  assert.ok(defaults.includes('غداء'));
  assert.ok(defaults.includes('عشاء'));
  assert.ok(defaults.includes('سناك'));

  // حفظ اسم مخصص جديد (مثلاً "وجبة بعد التمرين")
  store.saveCustomMealName('وجبة بعد التمرين');
  const customList = store.getCustomMealNames();
  assert.ok(customList.includes('وجبة بعد التمرين'));

  const allNames = store.getAllMealCategoryNames();
  assert.ok(allNames.includes('وجبة بعد التمرين'));
  assert.ok(allNames.length >= 5);

  // حذف الاسم المخصص
  store.deleteCustomMealName('وجبة بعد التمرين');
  assert.ok(!store.getCustomMealNames().includes('وجبة بعد التمرين'));
});

test('تسجيل وجبة جديدة وحذفها وتحديث المجاميع اليومية بدقة', async () => {
  const initialCals = store.getState().today.consumedCalories || 0;
  const initialProtein = store.getState().today.consumedProtein || 0;

  // 1. تسجيل وجبة جديدة
  const newMeal = store.logMeal({
    titleAr: 'وجبة تجريبية',
    calories: 500,
    protein: 40,
    carbs: 50,
    fats: 15,
    items: [
      { nameAr: 'صدر دجاج', grams: 150, calories: 250, protein: 35, carbs: 0, fats: 5 },
      { nameAr: 'أرز مسلوق', grams: 150, calories: 250, protein: 5, carbs: 50, fats: 10 }
    ]
  });

  // يجب أن يمتلك الـ ID تركيبة UUID صحيحة
  assert.ok(newMeal.id);
  assert.match(newMeal.id, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

  // التأكد من تواجدها في السجل وتحديث المجاميع
  const afterLog = store.getState();
  assert.ok(afterLog.loggedMeals.some(m => m.id === newMeal.id));
  assert.equal(afterLog.today.consumedCalories, initialCals + 500);
  assert.equal(afterLog.today.consumedProtein, initialProtein + 40);

  // 2. تحديث الوجبة
  await store.updateLoggedMeal(newMeal.id, {
    titleAr: 'وجبة معدلة',
    calories: 600,
    protein: 50
  });

  const afterUpdate = store.getState();
  const updated = afterUpdate.loggedMeals.find(m => m.id === newMeal.id);
  assert.equal(updated.titleAr, 'وجبة معدلة');
  assert.equal(updated.calories, 600);
  assert.equal(afterUpdate.today.consumedCalories, initialCals + 600);
  assert.equal(afterUpdate.today.consumedProtein, initialProtein + 50);

  // 3. حذف الوجبة
  await store.deleteLoggedMeal(newMeal.id);

  const afterDelete = store.getState();
  assert.equal(afterDelete.loggedMeals.some(m => m.id === newMeal.id), false, 'يجب إزالة الوجبة بالكامل بعد الحذف');
  assert.equal(afterDelete.today.consumedCalories, initialCals, 'يجب استرجاع السعرات المستهلكة لما كانت عليه قبل إضافة الوجبة');
  assert.equal(afterDelete.today.consumedProtein, initialProtein, 'يجب استرجاع البروتين لما كان عليه');
});

