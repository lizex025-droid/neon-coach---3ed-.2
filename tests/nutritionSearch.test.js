import test from 'node:test';
import assert from 'node:assert/strict';
import {
  scalePer100,
  gramsForCaloriesValue,
  normalizeFoodSearchText,
  mealNameFromItems,
  hasFoodSearchInput
} from '../src/domain/nutritionCalculations.js';
import { searchFoods, foodById, macrosFor, IMPORTED_FOOD_COUNT, addCustomFood, getCustomFoods, deleteCustomFood } from '../src/data/foods.js';

test('حساب الماكروز بدقة لوزن 150غ من قيم 100غ', () => {
  const result = scalePer100({ kcal: 200, p: 20, c: 10, f: 5, fiber: 2 }, 150);
  assert.deepEqual(result, { kcal: 300, p: 30, c: 15, f: 7.5, fiber: 3 });
});

test('حساب الغرامات المطلوبة لتحقيق رقم سعرات مستهدف', () => {
  assert.equal(gramsForCaloriesValue(200, 300), 150);
  assert.equal(gramsForCaloriesValue(0, 300), null);
});

test('تطبيع النصوص العربية في البحث وتوحيد الهمزات', () => {
  assert.equal(normalizeFoodSearchText('أَرُز أبيض'), 'ارز ابيض');
  assert.equal(normalizeFoodSearchText('بطاطا مسلوقة'), 'بطاطا مسلوقه');
  assert.equal(hasFoodSearchInput('د'), true);
  assert.equal(hasFoodSearchInput('   '), false);
});

test('توليد اسم الوجبة من أصنافها المتعددة', () => {
  const items = [
    { nameAr: 'صدر دجاج مشوي' },
    { nameAr: 'أرز أبيض' },
    { nameAr: 'سلطة خضراء' }
  ];
  assert.equal(mealNameFromItems(items), 'صدر دجاج مشوي + أرز أبيض + سلطة خضراء');
});

test('قاعدة البيانات تحتوي على 552 صنفاً مع إمكانية البحث والماكروز', () => {
  assert.ok(IMPORTED_FOOD_COUNT >= 552, `Expected at least 552 foods, got ${IMPORTED_FOOD_COUNT}`);

  const results = searchFoods('دجاج', 5);
  assert.ok(results.length > 0, 'Should find chicken items');

  const food = results[0];
  assert.ok(food.id);
  assert.ok(food.per100.kcal > 0);

  const calculated = macrosFor(food.id, 200);
  assert.equal(calculated.kcal, +(food.per100.kcal * 2).toFixed(1));
});

test('إضافة أكلة يدوياً بالاسم والسعرات والماكروز والبحث عنها واحتساب كمياتها', () => {
  const testFood = addCustomFood({
    name: 'شاورما دايت مخصصة نيون',
    calories: 180,
    protein: 26,
    carbs: 5,
    fats: 6,
    servingSize: 100
  });

  assert.ok(testFood.id);
  assert.equal(testFood.name, 'شاورما دايت مخصصة نيون');
  assert.equal(testFood.isCustom, true);
  assert.equal(testFood.per100.kcal, 180);
  assert.equal(testFood.per100.p, 26);
  assert.equal(testFood.per100.c, 5);
  assert.equal(testFood.per100.f, 6);

  // التأكد من العثور عليها في البحث
  const searchResults = searchFoods('شاورما دايت مخصصة', 5);
  assert.ok(searchResults.length > 0, 'يجب العثور على الأكلة المضافة في البحث');
  assert.equal(searchResults[0].id, testFood.id);

  // احتساب الماكروز لوزن 200غ
  const macros200 = macrosFor(testFood.id, 200);
  assert.equal(macros200.kcal, 360);
  assert.equal(macros200.p, 52);
  assert.equal(macros200.c, 10);
  assert.equal(macros200.f, 12);

  // التأكد من وجودها في getCustomFoods
  const customList = getCustomFoods();
  assert.ok(customList.some(f => f.id === testFood.id));

  // تنظيف الاختبار
  deleteCustomFood(testFood.id);
});

test('قاعدة البيانات تضم الأصناف الـ 121 المعتمدة وتبحث عنها وتحسب ماكروزها بدقة', () => {
  const f006 = foodById('F006');
  assert.ok(f006, 'يجب العثور على دجاج مفروم F006');
  assert.equal(f006.nameAr, 'دجاج مفروم');
  assert.equal(f006.per100.kcal, 143);
  assert.equal(f006.per100.p, 17.4);

  // احتساب الماكروز لـ 150غ
  const m150 = macrosFor('F006', 150);
  assert.equal(m150.kcal, 214.5);
  assert.equal(m150.p, 26.1);

  // البحث بالعربي
  const searchHalloumi = searchFoods('جبنة حلوم', 3);
  assert.ok(searchHalloumi.length > 0);
  assert.equal(searchHalloumi[0].id, 'F031');

  // البحث بالإنجليزي
  const searchEnglish = searchFoods('Chia seeds', 3);
  assert.ok(searchEnglish.length > 0);
  assert.equal(searchEnglish[0].id, 'F068');
});
