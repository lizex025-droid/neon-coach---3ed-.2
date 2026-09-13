import test from 'node:test';
import assert from 'node:assert/strict';
import { rolloverDailyState, mergeDailyHistory, dailyHistoryWithin } from '../src/domain/dailyCycle.js';

function previousDayState() {
  return {
    today: {
      date: '2026-09-13',
      targetCalories: 2200,
      targetProtein: 170,
      targetCarbs: 230,
      targetFats: 65,
      targetWaterLiters: 3,
      targetGlasses: 12,
      consumedCalories: 500,
      consumedProtein: 52,
      consumedCarbs: 40,
      consumedFats: 14,
      consumedWaterLiters: 1.75,
      consumedGlasses: 7,
      energyLevel: 4,
      todayWorkoutTitleAr: 'صدر وترايسبس',
      todayWorkoutExercisesCount: 5,
      isWorkoutCompleted: true,
      workoutStatus: 'completed',
      priorityFocus: 'nutrition',
    },
    loggedMeals: [
      { id: 'meal-old', calories: 480, protein: 50, carbs: 39, fats: 13 },
      { id: 'meal-older', date: '2026-09-12', calories: 700, protein: 60, carbs: 70, fats: 20 },
    ],
    supplementsSchedule: [
      { id: 'creatine', schedule: { morning: { taken: true, time: '08:00' }, evening: { taken: true, time: '08:00' } } },
      { id: 'omega', schedule: { morning: { taken: false, time: null }, evening: { taken: false, time: null } } },
    ],
    activeWorkoutSession: {
      sessionNameAr: 'صدر', startedAtTimestamp: 123, elapsedSeconds: 1800,
      currentExerciseIndex: 2, isResting: true, restTimeRemainingSec: 40,
      currentExercise: { nameAr: 'بنش' }, painReports: [{ location: 'كتف' }],
    },
    actionSupplementTaken: { creatine: 123 },
    dailyHistory: [{ date: '2026-09-12', calories: 700 }],
    progressReport: { periodDays: 30, weightTrendData: [{ date: '2026-09-12', weight: 80 }] },
    workoutHistory: [{ id: 'workout-old', date: '2026-09-13' }],
  };
}

test('new day archives yesterday, resets daily counters, and preserves historical records', () => {
  const source = previousDayState();
  const result = rolloverDailyState(source, '2026-09-14');
  const state = result.state;

  assert.equal(result.changed, true);
  assert.equal(state.today.date, '2026-09-14');
  for (const field of ['consumedCalories', 'consumedProtein', 'consumedCarbs', 'consumedFats', 'consumedWaterLiters', 'consumedGlasses', 'energyLevel', 'todayWorkoutExercisesCount']) {
    assert.equal(state.today[field], 0, `${field} must restart at zero`);
  }
  assert.equal(state.today.targetCalories, 2200);
  assert.equal(state.today.targetProtein, 170);
  assert.equal(state.today.targetWaterLiters, 3);
  assert.equal(state.today.isWorkoutCompleted, false);
  assert.equal(state.today.workoutStatus, 'not_started');
  assert.equal(state.activeWorkoutSession.elapsedSeconds, 0);
  assert.equal(state.activeWorkoutSession.currentExercise, null);
  assert.deepEqual(state.actionSupplementTaken, {});
  assert.equal(state.supplementsSchedule[0].schedule.morning.taken, false);

  const archived = state.dailyHistory.find((item) => item.date === '2026-09-13');
  assert.ok(archived);
  assert.equal(archived.calories, 480);
  assert.equal(archived.protein, 50);
  assert.equal(archived.consumedWaterLiters, 1.75);
  assert.equal(archived.supplementsTaken, 1);
  assert.equal(archived.workoutCompleted, true);
  assert.equal(state.loggedMeals[0].date, '2026-09-13');
  assert.equal(state.loggedMeals.length, 2);
  assert.deepEqual(state.progressReport, source.progressReport);
  assert.deepEqual(state.workoutHistory, source.workoutHistory);
});

test('daily rollover is idempotent and never duplicates an archived date', () => {
  const first = rolloverDailyState(previousDayState(), '2026-09-14');
  const second = rolloverDailyState(first.state, '2026-09-14');
  assert.equal(second.changed, false);
  assert.equal(second.state.dailyHistory.filter((item) => item.date === '2026-09-13').length, 1);
});

test('local and cloud daily histories merge by date and obey the selected period', () => {
  const merged = mergeDailyHistory(
    [{ date: '2026-09-13', calories: 100, supplementsTaken: 2 }],
    [{ date: '2026-09-13', calories: 200 }, { date: '2026-09-10', calories: 300 }],
  );
  assert.deepEqual(merged[0], { date: '2026-09-13', calories: 200, supplementsTaken: 2 });
  assert.equal(dailyHistoryWithin(merged, 2, new Date('2026-09-14T12:00:00')).length, 1);
});
