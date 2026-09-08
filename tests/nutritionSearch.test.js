import test from 'node:test';
import assert from 'node:assert/strict';
import {
  scalePer100,
  gramsForCaloriesValue,
  normalizeFoodSearchText,
  mealNameFromItems,
  hasFoodSearchInput
} from '../src/domain/nutritionCalculations.js';
import { searchFoods, foodById, macrosFor, IMPORTED_FOOD_COUNT } from '../src/data/foods.js';

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
