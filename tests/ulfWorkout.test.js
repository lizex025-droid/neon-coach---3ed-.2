import test from 'node:test';
import assert from 'node:assert/strict';
import { ULF_DAYS, ULF_PROGRAM } from '../src/data/ulfWorkout.js';
import { FBW_DAYS } from '../src/data/fbwWorkout.js';
import { fortyDayWorkoutService as service } from '../src/services/fortyDayWorkoutService.js';
import { store } from '../src/state/store.js';

test('ULF matches all 24 exercises, 49 weekly sets, RIR and three drop sets', () => {
  assert.equal(ULF_PROGRAM.id, 'ulf');
  assert.deepEqual(ULF_DAYS.map(d => d.short), ['السبت · Upper', 'الأحد · Lower', 'الثلاثاء · Full']);
  assert.deepEqual(ULF_DAYS.map(d => d.exercises.length), [8, 6, 10]);
  assert.deepEqual(ULF_DAYS.map(d => d.exercises.reduce((sum, exercise) => sum + exercise.sets, 0)), [17, 13, 19]);
  const exercises = ULF_DAYS.flatMap(day => day.exercises);
  assert.equal(exercises.length, 24);
  assert.equal(new Set(exercises.map(ex => ex.id)).size, 24);
  assert.deepEqual(exercises.filter(ex => ex.dropSet).map(ex => ex.id),
    ['ulf_ulfUpper_4', 'ulf_ulfLower_3', 'ulf_ulfFull_6']);
  assert.equal(ULF_DAYS[1].exercises[1].rir, '2');
  assert.equal(ULF_DAYS[2].exercises[2].rir, '1');
  assert.equal(ULF_DAYS[2].exercises[2].sets, 1);
  assert.equal(ULF_DAYS[2].exercises[2].reps, '10–12');
  for (const ex of exercises) {
    assert.match(ex.image, /^https:\/\/pub-.*\.r2\.dev\//);
    assert.ok(ex.reps && ex.rir && ex.restSeconds > 0);
    if (ex.dropSet) assert.match(ex.coachingNote, /25–35%/);
  }
});

test('ULF selection, day switching, tracking and history are independent from FBW', () => {
  const originalSetUserProfile = store.setUserProfile;
  const originalStoreState = store.state;
  const originalWorkoutState = service.state;
  store.setUserProfile = profile => { store.state.userProfile = profile; };
  store.state = structuredClone(originalStoreState);
  service.state = null;
  try {
    service.setActivePlan('ulf');
    assert.equal(service.getActivePlan(), 'ulf');
    assert.equal(service.getProgram().id, 'ulf');
    assert.equal(service.getDays().length, 3);
    for (const day of ULF_DAYS) {
      service.setActiveDay(day.key);
      assert.equal(service.load().activeDay, day.key);
      service.getTrackersForDay(day.key).forEach((tracker, i) => {
        assert.equal(tracker.sets.length, day.exercises[i].sets);
        assert.equal(tracker.rest, day.exercises[i].restSeconds);
      });
    }
    const id = service.getExerciseId('ulfLower', 0);
    service.load().trackers[id].sets[0] = { kg: 40, reps: 8, done: true };
    service.load().session = { dayKey: 'ulfLower', startedAt: Date.now() - 10000, touchedExerciseIds: [id] };
    const summary = service.finishWorkout();
    assert.match(summary.id, /^ulf_/);
    assert.equal(summary.totalSets, 1);
    assert.equal(summary.totalVolume, 320);
    assert.match(summary.title, /Lower Body/);
    service.setActivePlan('fbw');
    assert.equal(service.getDays().length, 3);
    assert.equal(FBW_DAYS.length, 3);
    service.setActivePlan('ulf');
    assert.equal(service.getTracker('ulfLower', 0).history.length, 1);
  } finally {
    store.setUserProfile = originalSetUserProfile;
    store.state = originalStoreState;
    service.state = originalWorkoutState;
  }
});
