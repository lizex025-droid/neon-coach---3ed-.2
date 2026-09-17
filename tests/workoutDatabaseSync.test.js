import test from 'node:test';
import assert from 'node:assert/strict';

import { fortyDayWorkoutService } from '../src/services/fortyDayWorkoutService.js';
import { syncService } from '../src/services/syncService.js';
import { store } from '../src/state/store.js';

test('workout weights and sets are properly collected and synced on completion', async () => {
  fortyDayWorkoutService.setActivePlan('hasm');
  const dayKey = 'chestBiceps';

  // Start with clean state
  fortyDayWorkoutService.resetExercise(dayKey, 0);

  // Fill weights and reps for exercise 0
  fortyDayWorkoutService.updateSet(dayKey, 0, 0, 'kg', 85);
  fortyDayWorkoutService.updateSet(dayKey, 0, 0, 'reps', 10);
  fortyDayWorkoutService.toggleSet(dayKey, 0, 0);

  fortyDayWorkoutService.updateSet(dayKey, 0, 1, 'kg', 90);
  fortyDayWorkoutService.updateSet(dayKey, 0, 1, 'reps', 8);
  fortyDayWorkoutService.toggleSet(dayKey, 0, 1);

  // Verify tracker has entered weights
  const tracker = fortyDayWorkoutService.getTracker(dayKey, 0);
  assert.equal(tracker.sets[0].kg, 85);
  assert.equal(tracker.sets[0].reps, 10);
  assert.equal(tracker.sets[0].done, true);
  assert.equal(tracker.sets[1].kg, 90);
  assert.equal(tracker.sets[1].reps, 8);
  assert.equal(tracker.sets[1].done, true);

  // Mock sync calls to verify payloads
  const workoutSyncs = [];
  const exerciseRecordSyncs = [];
  const userStateSyncs = [];

  const originalSyncWorkoutLog = syncService.syncWorkoutLog;
  const originalSyncExerciseRecords = syncService.syncExerciseRecords;
  const originalSyncUserState = syncService.syncUserState;

  syncService.syncWorkoutLog = async (userId, data) => {
    workoutSyncs.push({ userId, data });
    return [{ id: 'mock_workout_id' }];
  };
  syncService.syncExerciseRecords = async (userId, records) => {
    exerciseRecordSyncs.push({ userId, records });
    return records;
  };
  syncService.syncUserState = async (userId, payload) => {
    userStateSyncs.push({ userId, payload });
    return [{ id: userId }];
  };

  // Set mock user in store
  store.setState({
    auth: {
      isAuthenticated: true,
      user: { id: 'test_user_uuid_12345', name: 'بطل نيون' }
    }
  }, { notify: false });

  // Finish workout
  const summary = fortyDayWorkoutService.finishWorkout();
  assert.ok(summary, 'Summary should be generated');
  assert.ok(summary.totalVolume > 0, 'Total volume should be computed');
  assert.equal(summary.exercises.length, 1);

  const ex = summary.exercises[0];
  assert.equal(ex.bestKg, 90);
  assert.equal(ex.bestReps, 8);
  assert.equal(ex.rounds.length, 2);
  assert.equal(ex.rounds[0].kg, 85);
  assert.equal(ex.rounds[1].kg, 90);

  // Allow async sync tasks to execute
  await new Promise(resolve => setTimeout(resolve, 50));

  // Verify syncWorkoutLog payload
  assert.equal(workoutSyncs.length, 1);
  assert.equal(workoutSyncs[0].userId, 'test_user_uuid_12345');
  assert.equal(workoutSyncs[0].data.exercises[0].bestKg, 90);
  assert.equal(workoutSyncs[0].data.exercises[0].rounds.length, 2);

  // Verify syncExerciseRecords payload
  assert.equal(exerciseRecordSyncs.length, 1);
  assert.equal(exerciseRecordSyncs[0].records[0].max_weight_kg, 90);
  assert.equal(exerciseRecordSyncs[0].records[0].max_reps, 8);

  // Restore mocks
  syncService.syncWorkoutLog = originalSyncWorkoutLog;
  syncService.syncExerciseRecords = originalSyncExerciseRecords;
  syncService.syncUserState = originalSyncUserState;
});

test('loadRemoteState restores cloud trackers and weights', () => {
  const remotePayload = {
    activePlan: 'anas',
    trackers: {
      anas_saturdayPush_0: {
        targetSets: 3,
        sets: [
          { kg: 75, reps: 12, done: true },
          { kg: 80, reps: 10, done: true },
          { kg: '', reps: '', done: false }
        ],
        history: [{ date: '16 Sep', weight: 80, reps: 10, volume: 1700 }]
      }
    },
    history: [
      { id: 'anas_123456789', title: 'Push', totalVolume: 1700, finishedAt: 1726500000000 }
    ]
  };

  fortyDayWorkoutService.loadRemoteState(remotePayload);
  const tracker = fortyDayWorkoutService.getTracker('saturdayPush', 0);
  assert.ok(tracker);
  assert.equal(tracker.sets[0].kg, 75);
  assert.equal(tracker.sets[1].kg, 80);
});

test('body weight logging triggers inbody_records sync in store', async () => {
  const inbodySyncs = [];
  const originalSyncInbody = syncService.syncInbodyRecord;

  syncService.syncInbodyRecord = async (userId, data) => {
    inbodySyncs.push({ userId, data });
    return [{ id: 'mock_inbody_id' }];
  };

  store.setState({
    auth: {
      isAuthenticated: true,
      user: { id: 'test_user_uuid_999' }
    },
    progressReport: {
      firstDay: { weight: 85 },
      currentDay: { weight: 85 },
      weightTrendData: []
    }
  }, { notify: false });

  store.logProgressMeasurement({ weight: 82.5, waistCm: 88 });

  assert.equal(inbodySyncs.length, 1);
  assert.equal(inbodySyncs[0].userId, 'test_user_uuid_999');
  assert.equal(inbodySyncs[0].data.weight, 82.5);
  assert.equal(inbodySyncs[0].data.waistCm, 88);

  syncService.syncInbodyRecord = originalSyncInbody;
});
