import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateAge,
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  calculateNutritionTargets,
  calculateE1RM,
  calculatePercentage,
  kgToLbs,
  lbsToKg,
  detectMuscleGroup,
  getExerciseStrengthScore,
  filterStrongestExercisePerMuscle
} from '../src/domain/calculations.js';

test('حساب العمر بدقة من تاريخ الميلاد', () => {
  const age = calculateAge('2001-08-24');
  assert.ok(age >= 24 && age <= 26, `العمر المحسوب: ${age}`);
});

test('حساب مؤشر كتلة الجسم (BMI) مع التصنيف', () => {
  const res = calculateBMI(103, 187);
  assert.equal(res.bmi, 29.5);
  assert.equal(res.category, 'زيادة في الوزن');
  assert.ok(res.note.includes('BMI هو مؤشر إحصائي عام'));
});

test('حساب BMR للذكور بمعادلة Mifflin-St Jeor', () => {
  // للذكور: (10 × 103) + (6.25 × 187) - (5 × 25) + 5 = 1030 + 1168.75 - 125 + 5 = 2078.75 ≈ 2079
  const bmr = calculateBMR(103, 187, 25, 'male');
  assert.ok(bmr >= 2070 && bmr <= 2085, `BMR: ${bmr}`);
});

test('تطابق السعرات الحرارية مع الماكروز حسابياً بدقة 100%', () => {
  const targets = calculateNutritionTargets({
    weight: 103,
    height: 187,
    birthDate: '2001-08-24',
    gender: 'male',
    activityLevel: 'light',
    goal: 'fat_loss'
  });

  const expectedCals = (targets.protein * 4) + (targets.carbs * 4) + (targets.fats * 9);
  assert.equal(targets.targetCalories, expectedCals, 'السعرات المستهدفة يجب أن تطابق مجموع الماكروز تماماً');
  assert.ok(targets.waterMl > 3000, 'الهدف اليومي للماء يجب أن يراعي وزن الجسم والنشاط');
});

test('حساب e1RM بمعادلة Epley', () => {
  // 70 كغ × 10 تكرارات = 70 × (1 + 10/30) = 70 × 1.3333 = 93.3 كغ
  const e1rm = calculateE1RM(70, 10);
  assert.equal(e1rm, 93.3);
});

test('حساب نسبة الحلقات الدائرية ومنع التجاوز', () => {
  assert.equal(calculatePercentage(1420, 2100), 68);
  assert.equal(calculatePercentage(0, 2100), 0);
  assert.equal(calculatePercentage(2500, 2100), 100);
});

test('تحويل الوحدات بين الكيلوغرام والباوند', () => {
  assert.equal(kgToLbs(100), 220.5);
  assert.equal(lbsToKg(220.5), 100);
});

test('تصنيف التمارين الرياضية لمجموعاتها العضلية بدقة', () => {
  assert.equal(detectMuscleGroup('ضغط بار مستوي (Bench Press)'), 'chest');
  assert.equal(detectMuscleGroup('ضغط دمبلز مائل (Incline DB Press)'), 'chest');
  assert.equal(detectMuscleGroup('تفتيح الصدر بالكابل'), 'chest');
  assert.equal(detectMuscleGroup('ضغط ترايسبس بالكيبل (Triceps Pushdown)'), 'triceps');
  assert.equal(detectMuscleGroup('ثني بايسبس بالدمبل (Bicep Curl)'), 'biceps');
  assert.equal(detectMuscleGroup('سحب ظهر بالبار منحنياً'), 'back');
  assert.equal(detectMuscleGroup('سكوات خلفي بالبار'), 'legs');
  assert.equal(detectMuscleGroup('ديدلفت روماني بالبار'), 'legs');
  assert.equal(detectMuscleGroup('رفرفة أكتاف جانبي بالدمبل'), 'shoulders');
  assert.equal(detectMuscleGroup('ضغط أكتاف جالس بالدمبل'), 'shoulders');
  assert.equal(detectMuscleGroup('بلانك (Plank)'), 'core');
});

test('فلترة التمارين في سجل التمرين لإظهار أقوى تمرين فقط لكل عضلة واستبعاد التمارين الأضعف', () => {
  const sessionExercises = [
    { nameAr: 'ضغط بار مستوي (Bench Press)', bestSet: '100 كغ × 8 تكرارات' },
    { nameAr: 'ضغط دمبلز مائل (Incline DB Press)', bestSet: '32 كغ × 10 تكرارات' },
    { nameAr: 'تفتيح الصدر بالكابل (Cable Chest Fly)', bestSet: '25 كغ × 12 تكرار' },
    { nameAr: 'ضغط ترايسبس بالكيبل (Triceps Pushdown)', bestSet: '35 كغ × 12 تكرار' },
    { nameAr: 'مد ترايسبس بالدمبل (Tricep Extension)', bestSet: '16 كغ × 10 تكرارات' },
    { nameAr: 'سحب ظهر بالبار (Barbell Row)', bestSet: '80 كغ × 8 تكرارات' },
    { nameAr: 'سحب ظهر أمامي واسع (Lat Pulldown)', bestSet: '65 كغ × 10 تكرارات' },
    { nameAr: 'ضغط أكتاف جالس بالدمبل (Seated DB Press)', bestSet: '30 كغ × 8 تكرارات' },
    { nameAr: 'رفرفة أكتاف جانبي (Lateral Raise)', bestSet: '12 كغ × 15 تكرار' }
  ];

  const result = filterStrongestExercisePerMuscle(sessionExercises);

  // يجب أن يتبقى 4 تمارين فقط: أقوى تمرين صدر، أقوى تمرين ترايسبس، أقوى تمرين ظهر، أقوى تمرين أكتاف
  assert.equal(result.length, 4);

  // للصدر: بنش برس (100 كغ × 8) هو الأقوى، ولا يظهر أي تمرين صدر آخر
  const chestEx = result.filter(e => detectMuscleGroup(e.nameAr) === 'chest');
  assert.equal(chestEx.length, 1);
  assert.equal(chestEx[0].nameAr, 'ضغط بار مستوي (Bench Press)');

  // للترايسبس: ضغط ترايسبس بالكيبل هو الأقوى
  const tricepsEx = result.filter(e => detectMuscleGroup(e.nameAr) === 'triceps');
  assert.equal(tricepsEx.length, 1);
  assert.equal(tricepsEx[0].nameAr, 'ضغط ترايسبس بالكيبل (Triceps Pushdown)');

  // للظهر: سحب ظهر بالبار هو الأقوى
  const backEx = result.filter(e => detectMuscleGroup(e.nameAr) === 'back');
  assert.equal(backEx.length, 1);
  assert.equal(backEx[0].nameAr, 'سحب ظهر بالبار (Barbell Row)');

  // للأكتاف: ضغط أكتاف هو الأقوى
  const shoulderEx = result.filter(e => detectMuscleGroup(e.nameAr) === 'shoulders');
  assert.equal(shoulderEx.length, 1);
  assert.equal(shoulderEx[0].nameAr, 'ضغط أكتاف جالس بالدمبل (Seated DB Press)');
});
