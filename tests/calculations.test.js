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
  lbsToKg
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
