import test from 'node:test';
import assert from 'node:assert/strict';
import { exerciseHistoryKey } from '../src/data/exerciseHistoryIdentity.js';
import { fortyDayWorkoutService as service } from '../src/services/fortyDayWorkoutService.js';
import { store } from '../src/state/store.js';

function withIsolatedWorkout(callback) {
  const oldState = service.state;
  const oldProfileState = store.state;
  const oldSetProfile = store.setUserProfile;
  store.state = structuredClone(oldProfileState);
  store.state.userProfile = { ...(store.state.userProfile || {}), workoutPlan: 'hasm' };
  store.setUserProfile = profile => { store.state.userProfile = profile; };
  service.state = null;
  try {
    return callback();
  } finally {
    store.setUserProfile = oldSetProfile;
    store.state = oldProfileState;
    service.state = oldState;
  }
}

test('Bench logs move from Hasm into ULF then FBW, with weights/reps but no completed sets', () => withIsolatedWorkout(() => {
  service.setActivePlan('hasm');
  service.updateSet('chestBiceps', 0, 0, 'kg', 32);
  service.updateSet('chestBiceps', 0, 0, 'reps', 10);
  service.toggleSet('chestBiceps', 0, 0);
  const first = service.finishWorkout();
  assert.equal(first.totalSets, 1);
  assert.equal(service.getTracker('chestBiceps', 0).history.length, 1);

  service.setActivePlan('ulf');
  assert.equal(service.getActivePlan(), 'ulf');
  const upper = service.getTracker('ulfUpper', 0);
  assert.equal(upper.sets.length, 3);
  assert.deepEqual(upper.sets[0], { kg: 32, reps: 10, done: false });
  assert.deepEqual(service.getSharedHistory('ulfUpper', 0)[0].rounds[0], { round: 1, kg: 32, reps: 10 });
  assert.equal(upper.history.length, 0, 'cross-plan rows must remain with the original tracker');

  service.updateSet('ulfUpper', 0, 0, 'kg', 34);
  service.updateSet('ulfUpper', 0, 0, 'reps', 9);
  service.toggleSet('ulfUpper', 0, 0);
  service.finishWorkout();

  service.setActivePlan('fbw');
  const fbw = service.getTracker('fbwA', 1);
  assert.deepEqual(fbw.sets[0], { kg: 34, reps: 9, done: false });
  assert.equal(service.getSharedHistory('fbwA', 1).length, 2);
  assert.equal(service.getSharedHistory('fbwA', 1).at(-1).rounds[0].kg, 34);
  assert.equal(service.getSharedHistory('ulfUpper', 0).length, 2);
  assert.equal(service.getTracker('chestBiceps', 0).history.length, 1);
}));

test('Leg press is shared between days, while different exercise variations stay isolated', () => withIsolatedWorkout(() => {
  service.setActivePlan('hasm');
  const legDay = service.getDay('legsCalves');
  const pressIndex = legDay.exercises.findIndex(ex => ex.title.endsWith('| Leg Press'));
  assert.ok(pressIndex >= 0);
  service.updateSet('legsCalves', pressIndex, 0, 'kg', 180);
  service.updateSet('legsCalves', pressIndex, 0, 'reps', 12);
  service.toggleSet('legsCalves', pressIndex, 0);
  service.finishWorkout();

  service.setActivePlan('ulf');
  assert.equal(service.getTracker('ulfLower', 2).sets[0].kg, 180);
  assert.equal(service.getTracker('ulfFull', 3).sets[0].reps, 12);
  assert.equal(service.getSharedHistory('ulfFull', 3).length, 1);
  assert.equal(service.getSharedHistory('ulfLower', 0).length, 0);
  assert.equal(service.getSharedHistory('ulfUpper', 0).length, 0);
  assert.equal(service.getSharedHistory('ulfFull', 4).length, 0);
}));

test('Dedicated barbell, dumbbell, machine and leg-curl movements are not mixed', () => {
  assert.notEqual(
    exerciseHistoryKey({ title: 'Bench Press' }),
    exerciseHistoryKey({ title: 'Flat DB Bench Press' })
  );
  assert.notEqual(
    exerciseHistoryKey({ title: 'Incline DB Press' }),
    exerciseHistoryKey({ title: 'Incline Machine Chest Press' })
  );
  assert.notEqual(
    exerciseHistoryKey({ title: 'Seated Leg Curl' }),
    exerciseHistoryKey({ title: 'Lying Leg Curl' })
  );
  assert.notEqual(
    exerciseHistoryKey({ title: 'Cable Lateral Raise' }),
    exerciseHistoryKey({ title: 'Dumbbell Lateral Raise' })
  );
});

test('Explicit reset clears current sets but retains shared workout history without reseeding', () => withIsolatedWorkout(() => {
  service.setActivePlan('hasm');
  service.updateSet('chestBiceps', 0, 0, 'kg', 30);
  service.updateSet('chestBiceps', 0, 0, 'reps', 11);
  service.toggleSet('chestBiceps', 0, 0);
  service.finishWorkout();
  service.setActivePlan('ulf');
  assert.equal(service.getTracker('ulfUpper', 0).sets[0].kg, 30);
  service.resetExercise('ulfUpper', 0);
  assert.equal(service.getTracker('ulfUpper', 0).sets[0].kg, '');
  assert.equal(service.getSharedHistory('ulfUpper', 0).length, 1);
}));

test('Hasm 45-degree incline is visible in Upper and retains its old sets', () => withIsolatedWorkout(() => {
  service.setActivePlan('hasm');
  const oldExercise = service.getDay('chestBiceps').exercises[1];
  const newExercise = service.getDay('ulfUpper', 'ulf').exercises[2];
  const machineExercise = service.getDay('ulfFull', 'ulf').exercises[0];
  assert.match(oldExercise.title, /Incline Bench Press/);
  assert.match(newExercise.title, /45°/);
  assert.equal(exerciseHistoryKey(oldExercise), exerciseHistoryKey(newExercise));
  assert.notEqual(exerciseHistoryKey(oldExercise), exerciseHistoryKey(machineExercise));
  service.updateSet('chestBiceps', 1, 0, 'kg', 28);
  service.updateSet('chestBiceps', 1, 0, 'reps', 9);
  service.toggleSet('chestBiceps', 1, 0);
  service.finishWorkout();
  service.setActivePlan('ulf');
  const tracker = service.getTracker('ulfUpper', 2);
  assert.deepEqual(tracker.sets[0], { kg: 28, reps: 9, done: false });
  const history = service.getSharedHistory('ulfUpper', 2);
  assert.equal(history.length, 1);
  assert.deepEqual(history[0].rounds[0], { round: 1, kg: 28, reps: 9 });
  assert.equal(service.getSharedHistory('ulfFull', 0).length, 0);
  assert.equal(service.getTracker('chestBiceps', 1).history.length, 1);
}));
