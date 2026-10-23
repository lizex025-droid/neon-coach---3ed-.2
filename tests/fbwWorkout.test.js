import test from 'node:test';
import assert from 'node:assert/strict';
import { FBW_DAYS, FBW_PROGRAM } from '../src/data/fbwWorkout.js';
import { fortyDayWorkoutService as service } from '../src/services/fortyDayWorkoutService.js';
import { store } from '../src/state/store.js';

test('FBW preserves the requested weekly volume, days, prescriptions and three finishers', () => {
  assert.equal(FBW_PROGRAM.id, 'fbw');
  assert.deepEqual(FBW_DAYS.map(d => d.short), ['السبت · A', 'الأحد · B', 'الثلاثاء · C']);
  assert.deepEqual(FBW_DAYS.map(d => d.exercises.reduce((s, e) => s + e.sets, 0)), [15, 16, 17]);
  const exercises = FBW_DAYS.flatMap(d => d.exercises);
  assert.equal(exercises.length, 28);
  assert.equal(new Set(exercises.map(e => e.id)).size, 28);
  assert.deepEqual(exercises.filter(e => e.dropSet).map(e => e.id), ['fbw_fbwA_4', 'fbw_fbwB_3', 'fbw_fbwC_5']);
  assert.equal(FBW_DAYS[1].exercises[2].rir, '2–3');
  assert.equal(FBW_DAYS[0].exercises[1].restLabel, '2–3 دقائق');
  for (const e of exercises) {
    assert.match(e.image, /^https:\/\/pub-.*\.r2\.dev\//);
    assert.ok(e.rir && e.reps && e.restSeconds);
    if (e.dropSet) assert.match(e.coachingNote, /25–35%/);
  }
});

test('FBW uses existing plan selection, trackers, rest timers and saved workout history', () => {
  // Keep this test local: no profile sync to the remote backend.
  const syncProfile = store.setUserProfile;
  store.setUserProfile = profile => { store.state.userProfile = profile; };
  const oldState = store.state;
  const oldWorkoutState = service.state;
  store.state = structuredClone(oldState);
  service.state = null;
  try {
    service.setActivePlan('fbw');
    assert.equal(service.getActivePlan(), 'fbw');
    assert.equal(service.getDays().length, 3);
    for (const day of FBW_DAYS) {
      service.setActiveDay(day.key);
      assert.equal(service.load().activeDay, day.key);
      const trackers = service.getTrackersForDay(day.key);
      trackers.forEach((tracker, i) => {
        assert.equal(tracker.sets.length, day.exercises[i].sets);
        assert.equal(tracker.rest, day.exercises[i].restSeconds);
      });
    }
    const id = service.getExerciseId('fbwB', 0);
    service.load().trackers[id].sets[0] = { kg: 30, reps: 8, done: true };
    service.load().session = { dayKey: 'fbwB', startedAt: Date.now() - 10000, touchedExerciseIds: [id] };
    const summary = service.finishWorkout();
    assert.match(summary.id, /^fbw_/);
    assert.equal(summary.totalSets, 1);
    assert.equal(summary.totalVolume, 240);
    assert.match(summary.title, /Full Body B/);
    assert.equal(service.getDay('saturdayPush').key, 'saturdayPush');
    service.setActivePlan('anas');
    assert.equal(service.getDays().length, 5);
    assert.equal(service.getDay('fbwC').exercises.length, 9);
    service.setActivePlan('fbw');
    assert.equal(service.getTracker('fbwB', 0).history.length, 1);
  } finally {
    store.setUserProfile = syncProfile;
    store.state = oldState;
    service.state = oldWorkoutState;
  }
});
