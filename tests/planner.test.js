import test from 'node:test';
import assert from 'node:assert/strict';

import { generateTrainingPlan, suggestProgression } from '../src/domain/planner.js';

test('توليد خطة تدريبية لـ 4 أيام تتطابق مع عدد الأيام بدقة', () => {
  const plan = generateTrainingPlan({
    workoutDaysCount: 4,
    equipment: 'gym',
    injuries: []
  });

  assert.equal(plan.daysPerWeek, 4);
  assert.equal(plan.workouts.length, 4);
  assert.equal(plan.templateNameAr, 'توزيع علوي / سفلي 4 أيام (Upper / Lower)');
});

test('توليد خطط لباقي الأيام من 1 إلى 6 أيام', () => {
  for (let days = 1; days <= 6; days++) {
    const plan = generateTrainingPlan({ workoutDaysCount: days });
    assert.equal(plan.workouts.length, days, `عدد الأيام ${days} يجب أن يطابق الجلسات تماماً`);
  }
});

test('استبعاد التمارين المسببة لألم عند وجود إصابة كتف أو ركبة', () => {
  const planWithShoulderInjury = generateTrainingPlan({
    workoutDaysCount: 4,
    injuries: ['shoulder']
  });

  // يجب ألا يحوي أي تمرين ضغط كتف بالدمبل
  const allExercises = planWithShoulderInjury.workouts.flatMap(w => w.exercises);
  const hasShoulderPress = allExercises.some(e => e.exerciseId === 'seated-dumbbell-shoulder-press');
  assert.equal(hasShoulderPress, false, 'يجب استبعاد تمرين ضغط الأكتاف عند وجود إصابة كتف');
});

test('اقتراح زيادة الوزن بناء على أداء المتدرب الفعلي وRPE', () => {
  const goodPerformance = {
    sets: [
      { completed: true, rpe: 8, weight: 70 },
      { completed: true, rpe: 8, weight: 70 },
      { completed: true, rpe: 7.5, weight: 70 }
    ]
  };
  const prog = suggestProgression(goodPerformance);
  assert.equal(prog.shouldIncrease, true);
  assert.equal(prog.recommendedWeightIncreaseKg, 2.5);

  const hardPerformance = {
    sets: [
      { completed: true, rpe: 9.5, weight: 70 },
      { completed: false, rpe: 10, weight: 70 }
    ]
  };
  const progHard = suggestProgression(hardPerformance);
  assert.equal(progHard.shouldIncrease, false);
});
