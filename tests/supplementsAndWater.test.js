import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SUPPLEMENT_DB,
  SUBSTANCE_DB,
  STACK_WINDOWS,
  searchSupplementsDb
} from '../src/data/supplementsDb.js';

test('قاعدة بيانات المكملات تحتوي على أكثر من 70 مكملاً مع الجرعات والملاحظات', () => {
  assert.ok(SUPPLEMENT_DB.length >= 70, `عدد المكملات: ${SUPPLEMENT_DB.length}`);
  const creatine = SUPPLEMENT_DB.find(s => s.name.toLowerCase().includes('creatine'));
  assert.ok(creatine, 'يجب أن تحتوي على الكرياتين');
  assert.equal(creatine.dose, '5g');
  assert.equal(creatine.window, 'anytime');
});

test('البحث الذكي في المكملات باللغة الإنجليزية والأسماء البديلة والعربية', () => {
  const res1 = searchSupplementsDb('creatine');
  assert.ok(res1.length > 0);
  assert.ok(res1[0].name.toLowerCase().includes('creatine'));

  const res2 = searchSupplementsDb('كرياتين');
  assert.ok(res2.length > 0);
  assert.ok(res2[0].name.toLowerCase().includes('creatine'));

  const res3 = searchSupplementsDb('vit d');
  assert.ok(res3.some(s => s.name.toLowerCase().includes('vitamin d3')));
});

test('نوافذ التوقيت الأربعة للمكملات (Morning, Lunch, Evening, Anytime)', () => {
  const keys = STACK_WINDOWS.map(w => w.key);
  assert.deepEqual(keys, ['morning', 'lunch', 'evening', 'anytime']);
});

test('قاعدة بيانات المواد المؤثرة على الترطيب ومعدلات التعويض', () => {
  assert.ok(SUBSTANCE_DB.length >= 15);
  const adderall = SUBSTANCE_DB.find(s => s.id === 'adderall');
  assert.ok(adderall);
  assert.equal(adderall.defaultDose, 20);
  assert.equal(adderall.mlPerUnit, 25);
  // 20mg × 25ml = 500ml extra water
  assert.equal(adderall.defaultDose * adderall.mlPerUnit, 500);
});

test('تعديل هدف السعرات اليومي يدوياً وتحديث الماكروز تلقائياً', async () => {
  const { store } = await import('../src/state/store.js');
  store.setTargetCalories(2500);
  assert.equal(store.getState().today.targetCalories, 2500);
  assert.ok(store.getState().today.targetProtein > 0);
  assert.ok(store.getState().today.targetCarbs > 0);
  assert.ok(store.getState().today.targetFats > 0);

  // التأكد من مجموع السعرات الناتج عن الماكروز قريب جداً من المستهدف (ضمن هامش التقريب)
  const totalFromMacros = (store.getState().today.targetProtein * 4) +
                          (store.getState().today.targetCarbs * 4) +
                          (store.getState().today.targetFats * 9);
  assert.ok(Math.abs(totalFromMacros - 2500) < 30);
});

test('تعديل هدف السعرات يدوياً مع ماكروز مخصصة', async () => {
  const { store } = await import('../src/state/store.js');
  store.setTargetCalories(2200, { protein: 180, carbs: 220, fats: 65 });
  assert.equal(store.getState().today.targetCalories, 2200);
  assert.equal(store.getState().today.targetProtein, 180);
  assert.equal(store.getState().today.targetCarbs, 220);
  assert.equal(store.getState().today.targetFats, 65);
});

test('المكملات ثنائية اللغة (عربي / إنجليزي) وتقديم الجرعة المناسبة تلقائياً', () => {
  const resAr = searchSupplementsDb('اوم');
  assert.ok(resAr.length > 0);
  const omega = resAr[0];
  assert.ok(omega.displayName.includes('Omega-3') && omega.displayName.includes('أوميغا 3'));
  assert.ok(omega.dose.length > 0);

  const resEn = searchSupplementsDb('mag');
  assert.ok(resEn.length > 0);
  const mag = resEn[0];
  assert.ok(mag.displayName.includes('Magnesium') && mag.displayName.includes('مغنيسيوم'));
  assert.equal(mag.dose, '200–400mg');
});

test('تتبع شرب الماء والترطيب وإضافة الأكواب والزجاجات مع التراجع', async () => {
  const { store } = await import('../src/state/store.js');
  store.getState().today.consumedWaterLiters = 0;
  store.getState().today.consumedGlasses = 0;

  // إضافة كوب 250 مل
  store.addWaterCup(250);
  assert.equal(store.getState().today.consumedWaterLiters, 0.25); // Preserve the measured 250 ml
  assert.equal(store.getState().today.consumedGlasses, 1);

  // إضافة زجاجة 500 مل
  store.addWaterCup(500);
  assert.equal(store.getState().today.consumedWaterLiters, 0.75);
  assert.equal(store.getState().today.consumedGlasses, 3);

  // تراجع عن كوب 250 مل (0.8 - 0.25 = 0.55 => 0.6)
  store.undoWaterCup(250);
  assert.equal(store.getState().today.consumedWaterLiters, 0.5);
  assert.equal(store.getState().today.consumedGlasses, 2);
});

test('تسجيل قياسات التقدم الجديدة وتحديث فحص InBody بنجاح', async () => {
  const { store } = await import('../src/state/store.js');
  
  store.logProgressMeasurement({ weight: 115.5, waistCm: 104, benchPressKg: 85 });
  const rep = store.getState().progressReport;
  assert.equal(rep.currentDay.weight, 115.5);
  assert.equal(store.getState().userProfile.currentWeight, 115.5);
  assert.equal(rep.currentDay.waistCm, 104);
  assert.equal(rep.currentDay.benchPressKg, 85);
  assert.equal(rep.weightChangeKg, Math.round((115.5 - rep.firstDay.weight) * 10) / 10);

  store.updateInBodyResult({ bodyFatPercentage: 19.8, skeletalMuscleMassKg: 45.1, visceralFatLevel: 8, provider: 'Alpha Clinic' });
  const inBody = store.getState().progressReport.inBodyResult;
  assert.equal(inBody.hasResult, true);
  assert.equal(inBody.bodyFatPercentage, 19.8);
  assert.equal(inBody.skeletalMuscleMassKg, 45.1);
  assert.equal(inBody.visceralFatLevel, 8);
  assert.equal(inBody.provider, 'Alpha Clinic');
});

test('استرجاع وتحديث سجل تاريخ التمارين والتدريب (Workout History) لتقرير التقدم', async () => {
  const { store } = await import('../src/state/store.js');
  
  const history = store.getWorkoutHistory();
  assert.ok(Array.isArray(history));
  assert.equal(history.length, 0, 'A new account must not receive fabricated workout history');

  // إضافة جلسة تمرين جديدة وحفظها
  store.finishWorkoutSession({
    title: 'تمرين تجريبي للأكتاف',
    durationMinutes: 45,
    exercisesCount: 4,
    totalSets: 14,
    totalVolumeKg: 6500,
    exercises: [
      { nameAr: 'ضغط أكتاف بالبار', bestSet: '60 كغ × 8 تكرارات', setsCount: 4 }
    ]
  });

  const updatedHistory = store.getWorkoutHistory();
  assert.ok(updatedHistory.some(s => s.title === 'تمرين تجريبي للأكتاف'));
});



