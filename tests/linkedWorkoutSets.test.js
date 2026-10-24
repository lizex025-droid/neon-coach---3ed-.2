import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_LIBRARY_EXERCISES } from '../src/data/exerciseLibrary.js';
import { fortyDayWorkoutService as service } from '../src/services/fortyDayWorkoutService.js';
import { store } from '../src/state/store.js';

function isolate(run) {
  const before = { workout: service.state, store: store.state, setUserProfile: store.setUserProfile };
  store.state = structuredClone(before.store);
  store.state.userProfile = { ...(store.state.userProfile || {}), workoutPlan: 'ulf' };
  store.setUserProfile = profile => { store.state.userProfile = profile; };
  service.state = null;
  try { return run(); }
  finally {
    service.state = before.workout;
    store.state = before.store;
    store.setUserProfile = before.setUserProfile;
  }
}
function chooseRow() {
  const row = ALL_LIBRARY_EXERCISES.find(e => e.rawName === 'SEATED CABLE ROW');
  assert.ok(row, 'the real training exercise library contains seated cable row');
  return row;
}
function logLinked(day, index, kind, roundIndex, kg, reps) {
  service.updateLinkedSet(day, index, kind, roundIndex, 'kg', kg);
  service.updateLinkedSet(day, index, kind, roundIndex, 'reps', reps);
  assert.equal(service.toggleLinkedSet(day, index, kind, roundIndex), true);
}

test('Manage Super Set binds an actual library exercise, and each round is saved with its name', () => isolate(() => {
  service.setActivePlan('ulf');
  const day = 'ulfUpper';
  const row = chooseRow();
  assert.equal(service.configureSuperset(day, 0, row), true);
  assert.equal(service.getTracker(day, 0).superset.sets.length, 3);
  assert.equal(service.getTracker(day, 0).superset.exerciseId, row.id);
  assert.equal(service.toggleLinkedSet(day, 0, 'superset', 0), null, 'empty rounds are not saved');
  logLinked(day, 0, 'superset', 0, 42, 11);
  const history = service.getSharedHistory(day, 0);
  assert.equal(history.length, 1);
  assert.equal(history[0].live, true);
  assert.deepEqual(history[0].superRounds[0], {
    round: 1, kg: 42, reps: 11, exerciseId: row.id, exerciseTitle: row.title
  });
  assert.equal(history[0].rounds.length, 0);
  assert.equal(history[0].volume, 462);
  assert.equal(service.getSharedHistory('ulfFull', 1).length, 1,
    'the chosen secondary exercise should have its own shared history timeline');
  const summary = service.finishWorkout();
  assert.equal(summary.totalSets, 1);
  assert.equal(summary.totalReps, 11);
  assert.equal(summary.totalVolume, 462);
  assert.equal(summary.exercises[0].superRounds.length, 1);
  assert.equal(service.getSharedHistory(day, 0).length, 1, 'no duplicate when finished');
  assert.equal(service.getTracker(day, 0).superset.sets[0].done, false);
}));

test('Drop Set saves a separate round after its chosen base set and both count in summary', () => isolate(() => {
  service.setActivePlan('ulf');
  service.enableDropSet('ulfUpper', 0);
  const tracker = service.getTracker('ulfUpper', 0);
  assert.equal(tracker.dropSets[0].parentSetIndex, 0, 'new Drop Set follows the first pending working set');
  service.updateSet('ulfUpper', 0, 2, 'kg', 34);
  service.updateSet('ulfUpper', 0, 2, 'reps', 8);
  service.toggleSet('ulfUpper', 0, 2);
  logLinked('ulfUpper', 0, 'drop', 0, 25, 8);
  const history = service.getSharedHistory('ulfUpper', 0);
  assert.equal(history.length, 1);
  assert.equal(history[0].sets, 2);
  assert.equal(history[0].dropRounds[0].afterSet, 1);
  assert.equal(history[0].volume, 472);
  service.addDropRound('ulfUpper', 0);
  assert.equal(service.getTracker('ulfUpper', 0).dropSets.length, 2);
  logLinked('ulfUpper', 0, 'drop', 1, 20, 7);
  const summary = service.finishWorkout();
  assert.equal(summary.totalSets, 3);
  assert.equal(summary.totalReps, 23);
  assert.equal(summary.totalVolume, 612);
  assert.equal(service.getSharedHistory('ulfUpper', 0)[0].dropRounds.length, 2);
  assert.equal(service.getTracker('ulfUpper', 0).dropSets[1].done, false);
}));

test('Superset and Drop Set can coexist, undo and reset retract without erasing old history', () => isolate(() => {
  service.setActivePlan('ulf');
  assert.equal(service.configureSuperset('ulfUpper', 0, chooseRow()), true);
  service.enableDropSet('ulfUpper', 0);
  logLinked('ulfUpper', 0, 'superset', 0, 35, 12);
  logLinked('ulfUpper', 0, 'drop', 0, 22, 10);
  assert.equal(service.getSharedHistory('ulfUpper', 0)[0].sets, 2);
  assert.equal(service.toggleLinkedSet('ulfUpper', 0, 'drop', 0), false);
  assert.equal(service.getSharedHistory('ulfUpper', 0)[0].sets, 1);
  service.resetExercise('ulfUpper', 0);
  assert.equal(service.getSharedHistory('ulfUpper', 0).length, 0);
  assert.ok(service.getTracker('ulfUpper', 0).superset);
  assert.equal(service.getTracker('ulfUpper', 0).dropSets.length, 1);
  assert.equal(service.getTracker('ulfUpper', 0).superset.sets[0].done, false);
}));

test('Removing Superset after a finished session retains its exercise-specific history', () => isolate(() => {
  service.setActivePlan('ulf');
  const row = chooseRow();
  service.configureSuperset('ulfUpper', 0, row);
  logLinked('ulfUpper', 0, 'superset', 0, 60, 10);
  service.finishWorkout();
  service.removeSuperset('ulfUpper', 0);
  assert.equal(service.getTracker('ulfUpper', 0).superset, null);
  assert.equal(service.getSharedHistory('ulfUpper', 0).length, 1);
  assert.equal(service.getSharedHistory('ulfFull', 1)[0].rounds[0].kg, 60);
}));

test('Changing a live checked Superset cannot silently drop checked rounds', () => isolate(() => {
  service.setActivePlan('ulf');
  const first = chooseRow();
  const second = ALL_LIBRARY_EXERCISES.find(e => e.rawName === 'LAT PULLDOWN') ||
    ALL_LIBRARY_EXERCISES.find(e => e.id !== first.id && e.groupKey === 'back');
  assert.ok(second);
  service.configureSuperset('ulfUpper', 0, first);
  logLinked('ulfUpper', 0, 'superset', 0, 45, 10);
  assert.equal(service.configureSuperset('ulfUpper', 0, second), false);
  assert.equal(service.getTracker('ulfUpper', 0).superset.exerciseId, first.id);
  assert.equal(service.getSharedHistory('ulfUpper', 0)[0].superRounds.length, 1);
}));

test('Adding or tuning working sets keeps Super Set rounds aligned', () => isolate(() => {
  service.setActivePlan('ulf');
  service.configureSuperset('ulfUpper', 0, chooseRow());
  service.addSet('ulfUpper', 0);
  assert.equal(service.getTracker('ulfUpper', 0).superset.sets.length, 4);
  logLinked('ulfUpper', 0, 'superset', 3, 50, 8);
  assert.equal(service.getSharedHistory('ulfUpper', 0)[0].superRounds[0].round, 4);
  const tr = service.getTracker('ulfUpper', 0);
  service.tuneExercise('ulfUpper', 0, {
    targetSets: 5, targetReps: '8-12', weight: tr.weight, rest: tr.rest
  });
  assert.equal(service.getTracker('ulfUpper', 0).superset.sets.length, 5);
  assert.equal(service.getTracker('ulfUpper', 0).superset.sets[3].done, true);
}));


test('Drop Set may be assigned to any working set, with immediate history relocation and no data loss', () => isolate(() => {
  service.setActivePlan('ulf');
  const day = 'ulfUpper';
  // Place a Drop Set explicitly after set 1 (index 0).
  assert.equal(service.enableDropSet(day, 0, 0), true);
  logLinked(day, 0, 'drop', 0, 18, 13);
  let tracker = service.getTracker(day, 0);
  assert.equal(tracker.dropSets[0].parentSetIndex, 0);
  assert.equal(service.getSharedHistory(day, 0)[0].dropRounds[0].afterSet, 1);
  // User drags this logged round to set 3.
  assert.equal(service.moveDropRound(day, 0, 0, 2), true);
  tracker = service.getTracker(day, 0);
  assert.deepEqual(
    { kg: tracker.dropSets[0].kg, reps: tracker.dropSets[0].reps, done: tracker.dropSets[0].done },
    { kg: 18, reps: 13, done: true }
  );
  let timeline = service.getSharedHistory(day, 0);
  assert.equal(timeline.length, 1, 'relink must revise current record rather than create a new session');
  assert.equal(timeline[0].dropRounds[0].afterSet, 3);
  assert.equal(timeline[0].volume, 234);
  assert.equal(service.moveDropRound(day, 0, 0, 1), true);
  timeline = service.getSharedHistory(day, 0);
  assert.equal(timeline[0].dropRounds[0].afterSet, 2);
  assert.equal(service.moveDropRound(day, 0, 0, 1), false);
  assert.equal(service.moveDropRound(day, 0, 0, 3), false, 'cannot attach outside actual sets');
  const summary = service.finishWorkout();
  assert.equal(summary.totalSets, 1);
  assert.equal(summary.totalVolume, 234);
  assert.equal(summary.exercises[0].dropRounds[0].afterSet, 2);
  assert.equal(service.getSharedHistory(day, 0).length, 1);
}));

test('Add Drop to any chosen set and keep its position when a new Drop Round is added', () => isolate(() => {
  service.setActivePlan('ulf');
  assert.equal(service.addDropRound('ulfUpper', 0, 2), true);
  assert.equal(service.getTracker('ulfUpper', 0).dropSets[0].parentSetIndex, 2);
  assert.equal(service.addDropRound('ulfUpper', 0, 0), true);
  assert.deepEqual(service.getTracker('ulfUpper', 0).dropSets.map(x => x.parentSetIndex), [2, 0]);
  assert.equal(service.addDropRound('ulfUpper', 0, 1), true);
  assert.deepEqual(service.getTracker('ulfUpper', 0).dropSets.map(x => x.parentSetIndex), [2, 0, 1]);
  service.updateLinkedSet('ulfUpper', 0, 'drop', 1, 'kg', 16);
  service.updateLinkedSet('ulfUpper', 0, 'drop', 1, 'reps', 10);
  service.toggleLinkedSet('ulfUpper', 0, 'drop', 1);
  assert.equal(service.getSharedHistory('ulfUpper', 0)[0].dropRounds[0].afterSet, 1);
  assert.deepEqual(service.getTracker('ulfUpper', 0).dropSets.map(x => x.parentSetIndex), [2, 0, 1]);
}));

test('Default Drop Set follows the round just played (Set 1), not the next pending round', () => isolate(() => {
  service.setActivePlan('ulf');
  assert.equal(service.enableDropSet('ulfUpper', 0), true);
  assert.equal(service.getTracker('ulfUpper', 0).dropSets[0].parentSetIndex, 0,
    'before starting, drop should be positioned under Set 1');
  service.removeDropSet('ulfUpper', 0);
  service.updateSet('ulfUpper', 0, 0, 'kg', 30);
  service.updateSet('ulfUpper', 0, 0, 'reps', 10);
  service.toggleSet('ulfUpper', 0, 0);
  assert.equal(service.enableDropSet('ulfUpper', 0), true);
  assert.equal(service.getTracker('ulfUpper', 0).dropSets[0].parentSetIndex, 0,
    'after checking Set 1, the drop stays below Set 1 rather than jumping to Set 2');
  service.addDropRound('ulfUpper', 0);
  assert.equal(service.getTracker('ulfUpper', 0).dropSets[1].parentSetIndex, 0,
    'another implicit drop round attaches to Set 1');
  service.updateSet('ulfUpper', 0, 1, 'kg', 28);
  service.updateSet('ulfUpper', 0, 1, 'reps', 9);
  service.toggleSet('ulfUpper', 0, 1);
  assert.equal(service.addDropRound('ulfUpper', 0), true);
  assert.equal(service.getTracker('ulfUpper', 0).dropSets[2].parentSetIndex, 1,
    'after completing Set 2, the next implicit drop attaches to Set 2');
  assert.equal(service.moveDropRound('ulfUpper', 0, 0, 2), true,
    'manual dragging stays supported');
  assert.equal(service.getTracker('ulfUpper', 0).dropSets[0].parentSetIndex, 2);
  assert.equal(service.addDropRound('ulfUpper', 0, 0), true,
    'explicit per-round selection also remains supported');
  assert.equal(service.getTracker('ulfUpper', 0).dropSets[3].parentSetIndex, 0);
}));
