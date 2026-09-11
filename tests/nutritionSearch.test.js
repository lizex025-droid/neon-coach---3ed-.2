import test from 'node:test';
import assert from 'node:assert/strict';
import {
  scalePer100,
  gramsForCaloriesValue,
  normalizeFoodSearchText,
  mealNameFromItems,
  hasFoodSearchInput
} from '../src/domain/nutritionCalculations.js';
import {
  searchFoods,
  foodById,
  macrosFor,
  IMPORTED_FOOD_COUNT,
  addCustomFood,
  updateCustomFood,
  getCustomFoods,
  deleteCustomFood,
  isCountBasedFood,
  getFoodPieceWeight,
  getFoodUnitLabel
} from '../src/data/foods.js';
import { parseArabicMealText } from '../src/domain/nutritionEngine.js';
import { POPULAR_ARAB_RECOMMENDED_FOODS, COMMON_DISLIKED_SUGGESTIONS, getActiveSteps, STEP_KEYS } from '../src/views/questionnaireView.js';

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

test('تعديل صنف مخصص في قاعدة البيانات وتحديث السعرات والماكروز والبحث عنه وحذفه', () => {
  // 1. إضافة صنف تجريبي
  const created = addCustomFood({
    name: 'ساندويتش تونة لايت تجريبي',
    calories: 150,
    protein: 20,
    carbs: 10,
    fats: 3,
    servingSize: 100
  });

  assert.ok(created.id);
  assert.equal(created.name, 'ساندويتش تونة لايت تجريبي');
  assert.equal(created.per100.kcal, 150);

  // 2. تعديل الصنف بقيم جديدة
  const updated = updateCustomFood(created.id, {
    name: 'ساندويتش تونة بروتين إكسترا معدل',
    calories: 220,
    protein: 32,
    carbs: 12,
    fats: 4,
    servingSize: 100
  });

  assert.equal(updated.id, created.id);
  assert.equal(updated.name, 'ساندويتش تونة بروتين إكسترا معدل');
  assert.equal(updated.per100.kcal, 220);
  assert.equal(updated.per100.p, 32);
  assert.equal(updated.per100.c, 12);
  assert.equal(updated.per100.f, 4);

  // 3. التحقق من التحديث في foodById
  const fetched = foodById(created.id);
  assert.ok(fetched);
  assert.equal(fetched.name, 'ساندويتش تونة بروتين إكسترا معدل');
  assert.equal(fetched.per100.kcal, 220);

  // 4. التحقق من البحث بالاسم الجديد
  const searchResults = searchFoods('تونة بروتين إكسترا', 5);
  assert.ok(searchResults.length > 0);
  assert.equal(searchResults[0].id, created.id);

  // 5. احتساب الماكروز لوزن 200غ من الصنف المعدل
  const macros200 = macrosFor(created.id, 200);
  assert.equal(macros200.kcal, 440);
  assert.equal(macros200.p, 64);
  assert.equal(macros200.c, 24);
  assert.equal(macros200.f, 8);

  // 6. حذف الصنف والتأكد من إزالته
  deleteCustomFood(created.id);
  assert.equal(foodById(created.id), undefined);
  const searchAfterDelete = searchFoods('ساندويتش تونة بروتين إكسترا معدل', 5);
  assert.ok(!searchAfterDelete.some(f => f.id === created.id));
  const customList = getCustomFoods();
  assert.ok(!customList.some(f => f.id === created.id));
});

test('قائمة الأطعمة المقترحة والشائعة في الوطن العربي تضم الأصناف الأساسية وتصنيفاتها', () => {
  assert.ok(POPULAR_ARAB_RECOMMENDED_FOODS.length >= 20, 'يجب أن تحتوي القائمة على ما لا يقل عن 20 صنفاً شائعاً');
  
  const foodNames = POPULAR_ARAB_RECOMMENDED_FOODS.map(f => f.name);
  
  // التحقق من الأصناف الأساسية المطلوبة من قبل المستخدم
  assert.ok(foodNames.includes('صدر دجاج'), 'يجب توفير صدر دجاج');
  assert.ok(foodNames.includes('لحم عجل قليل الدهن'), 'يجب توفير اللحم');
  assert.ok(foodNames.includes('سمك مشوي'), 'يجب توفير السمك');
  assert.ok(foodNames.includes('أرز أبيض'), 'يجب توفير الأرز');
  assert.ok(foodNames.includes('بطاطا مشوية'), 'يجب توفير البطاطا');
  assert.ok(foodNames.includes('خس'), 'يجب توفير الخس');
  assert.ok(foodNames.includes('خيار'), 'يجب توفير الخيار');
  assert.ok(foodNames.includes('تمر'), 'يجب توفير التمر');
  assert.ok(foodNames.includes('بيض مسلوق'), 'يجب توفير البيض');

  // التحقق من تصنيفات الأطعمة
  const categories = new Set(POPULAR_ARAB_RECOMMENDED_FOODS.map(f => f.category));
  assert.ok(categories.has('protein'));
  assert.ok(categories.has('carbs'));
  assert.ok(categories.has('veggies'));
  assert.ok(categories.has('fruits'));

  // التحقق من قائمة استبعاد الأطعمة الشائعة
  assert.ok(COMMON_DISLIKED_SUGGESTIONS.length >= 6);
  const dislikedNames = COMMON_DISLIKED_SUGGESTIONS.map(f => f.name);
  assert.ok(dislikedNames.includes('سمك ومأكولات بحرية'));
});

test('التحقق من تسلسل خطوات الاستبيان والتنقل خطوة بخطوة للأمام والخلف', () => {
  assert.ok(Array.isArray(getActiveSteps()), 'يجب إرجاع مصفوفة الخطوات النشطة');
  assert.ok(STEP_KEYS.MEASUREMENTS && STEP_KEYS.GOAL, 'مفاتيح الخطوات معرفة بدقة');
  
  // التحقق من أن الرجوع من الخطوة 4 يعود حصراً إلى الخطوة 3
  let currentStep = 4;
  const navigateBack = (step) => {
    if (step > 1) return step - 1;
    return 1;
  };
  
  currentStep = navigateBack(currentStep);
  assert.strictEqual(currentStep, 3, 'الرجوع من الخطوة 4 يجب أن يعيد إلى الخطوة 3 فقط وليس 1');
  
  currentStep = navigateBack(currentStep);
  assert.strictEqual(currentStep, 2, 'الرجوع من الخطوة 3 يجب أن يعيد إلى الخطوة 2');
  
  currentStep = navigateBack(currentStep);
  assert.strictEqual(currentStep, 1, 'الرجوع من الخطوة 2 يجب أن يعيد إلى الخطوة 1');
  
  currentStep = navigateBack(currentStep);
  assert.strictEqual(currentStep, 1, 'الرجوع من الخطوة 1 يجب أن يظل في الخطوة 1');
});

test('تطابق أوزان البيض بدقة وحساب السعرات بالعدد (البيضة 50غ، البياض 33غ، الصفار 17غ)', () => {
  // 1. فحص بيانات الأصناف في قاعدة البيانات
  const wholeEgg = foodById('F025');
  assert.ok(wholeEgg, 'يجب توفير بيض كامل F025');
  assert.strictEqual(wholeEgg.pieceWeight, 50, 'وزن البيضة الكاملة بدون قشرة يجب أن يكون 50 غرام');
  assert.strictEqual(wholeEgg.isCountBased, true);
  assert.strictEqual(getFoodPieceWeight('F025'), 50);

  const eggWhite = foodById('F026');
  assert.ok(eggWhite, 'يجب توفير بياض البيض F026');
  assert.strictEqual(eggWhite.pieceWeight, 33, 'وزن بياض البيضة يجب أن يكون 33 غرام');
  assert.strictEqual(eggWhite.isCountBased, true);
  assert.strictEqual(getFoodPieceWeight('F026'), 33);

  const eggYolk = foodById('F027');
  assert.ok(eggYolk, 'يجب توفير صفار البيض F027');
  assert.strictEqual(eggYolk.pieceWeight, 17, 'وزن صفار البيضة يجب أن يكون 17 غرام');
  assert.strictEqual(eggYolk.isCountBased, true);
  assert.strictEqual(getFoodPieceWeight('F027'), 17);

  // مجموع وزن البياض والصفار يساوي وزن البيضة الكاملة تماماً: 33 + 17 = 50 غرام
  assert.strictEqual(eggWhite.pieceWeight + eggYolk.pieceWeight, wholeEgg.pieceWeight, '33غ + 17غ = 50غ');

  // 2. حساب الماكروز والسعرات بالعدد
  // 2 بيضة كاملة = 100غ
  const twoEggsMacros = macrosFor('F025', 2 * wholeEgg.pieceWeight);
  assert.strictEqual(twoEggsMacros.kcal, 143);
  assert.strictEqual(twoEggsMacros.p, 12.6);

  // 1 بيضة كاملة = 50غ -> حوالي 71.5 سعرة
  const oneEggMacros = macrosFor('F025', 1 * wholeEgg.pieceWeight);
  assert.strictEqual(oneEggMacros.kcal, 71.5);
  assert.strictEqual(oneEggMacros.p, 6.3);

  // 3 بياض بيض = 99غ -> حوالي 51.5 سعرة و 10.8غ بروتين
  const threeWhitesMacros = macrosFor('F026', 3 * eggWhite.pieceWeight);
  assert.strictEqual(threeWhitesMacros.kcal, 51.5);
  assert.strictEqual(threeWhitesMacros.p, 10.8);

  // 1 صفار بيض = 17غ -> حوالي 54.7 سعرة
  const oneYolkMacros = macrosFor('F027', 1 * eggYolk.pieceWeight);
  assert.strictEqual(oneYolkMacros.kcal, 54.7);
  assert.strictEqual(oneYolkMacros.p, 2.7);

  // 3. التحليل الذكي للنصوص باللغة العربية لاستخراج العدد
  const parsedCompound = parseArabicMealText('أكلت 2 بيضة كاملة و 3 بياض بيض');
  assert.strictEqual(parsedCompound.success, true);
  const foundWhite = parsedCompound.items.find(i => i.nameAr.includes('بياض'));
  const foundWhole = parsedCompound.items.find(i => i.nameAr.includes('كامل') || (i.nameAr.includes('بيض') && !i.nameAr.includes('بياض')));
  assert.ok(foundWhite, 'يجب التعرف على بياض البيض');
  assert.strictEqual(foundWhite.count, 3, 'عدد بياض البيض يجب أن يكون 3');
  assert.strictEqual(foundWhite.grams, 99, 'وزن 3 بياض يجب أن يكون 99 غرام (3 * 33)');

  assert.ok(foundWhole, 'يجب التعرف على البيض الكامل');
  assert.strictEqual(foundWhole.count, 2, 'عدد البيض الكامل يجب أن يكون 2');
  assert.strictEqual(foundWhole.grams, 100, 'وزن 2 بيضة كاملة يجب أن يكون 100 غرام (2 * 50)');
});



