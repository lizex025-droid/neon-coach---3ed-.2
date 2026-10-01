import test from 'node:test';
import assert from 'node:assert/strict';

import {
  EXERCISE_GROUPS,
  ALL_LIBRARY_EXERCISES,
  getExerciseGroups,
  getExercisesByGroup,
  searchExercises
} from '../src/data/exerciseLibrary.js';

import { fortyDayWorkoutService } from '../src/services/fortyDayWorkoutService.js';

test('Exercise Library contains 8 muscle groups matching screenshot', () => {
  const groups = getExerciseGroups();
  assert.equal(groups.length, 8);
  const keys = groups.map(g => g.key);
  assert.deepEqual(keys, ['chest', 'legs', 'back', 'shoulders', 'biceps', 'triceps', 'abs', 'forearms']);

  // Check counts
  const chest = groups.find(g => g.key === 'chest');
  assert.equal(chest.count, 10);
  const legs = groups.find(g => g.key === 'legs');
  assert.equal(legs.count, 15);
  const back = groups.find(g => g.key === 'back');
  assert.equal(back.count, 18);
  const shoulders = groups.find(g => g.key === 'shoulders');
  assert.equal(shoulders.count, 14);
  const biceps = groups.find(g => g.key === 'biceps');
  assert.equal(biceps.count, 7);
  const triceps = groups.find(g => g.key === 'triceps');
  assert.equal(triceps.count, 9);
  const abs = groups.find(g => g.key === 'abs');
  assert.equal(abs.count, 6);
  const forearms = groups.find(g => g.key === 'forearms');
  assert.equal(forearms.count, 8);
});

test('Exercise Library has 87 total exercises with images and metadata', () => {
  assert.equal(ALL_LIBRARY_EXERCISES.length, 87);
  for (const ex of ALL_LIBRARY_EXERCISES) {
    assert.ok(ex.id, 'Exercise must have an ID');
    assert.ok(ex.title, 'Exercise must have a title');
    assert.ok(ex.nameAr, 'Exercise must have an Arabic name');
    assert.ok(ex.nameEn, 'Exercise must have an English name');
    assert.ok(ex.image.startsWith('https://'), 'Exercise must have an R2 URL');
    assert.ok(ex.sets >= 1, 'Exercise must have sets');
  }
});

test('getExercisesByGroup filters exercises properly', () => {
  const chestExs = getExercisesByGroup('chest');
  assert.equal(chestExs.length, 10);
  assert.ok(chestExs.every(e => e.groupKey === 'chest'));

  const bicepsExs = getExercisesByGroup('biceps');
  assert.equal(bicepsExs.length, 7);
});

test('searchExercises matches in Arabic and English', () => {
  const arMatches = searchExercises('بنش');
  assert.ok(arMatches.length > 0);
  assert.ok(arMatches.some(e => e.nameAr.includes('بنش')));

  const enMatches = searchExercises('SQUAT');
  assert.ok(enMatches.length > 0);
  assert.ok(enMatches.some(e => e.nameEn.toLowerCase().includes('squat')));
});

test('fortyDayWorkoutService: addExerciseToDay adds exercise to active day and initializes tracker', () => {
  const dayKey = 'testDayAdd_' + Date.now();
  // base day mock by borrowing chestBiceps
  const initialDay = fortyDayWorkoutService.getDay('chestBiceps');
  const initialCount = initialDay.exercises.length;

  const newExercise = {
    title: 'تمرين تجريبي مضاف | Custom Test Exercise',
    sets: 4,
    reps: '10-12',
    image: 'https://example.com/test.png'
  };

  const added = fortyDayWorkoutService.addExerciseToDay('chestBiceps', newExercise);
  assert.ok(added.id);
  assert.equal(added.title, newExercise.title);
  assert.equal(added.sets, 4);

  const updatedDay = fortyDayWorkoutService.getDay('chestBiceps');
  assert.equal(updatedDay.exercises.length, initialCount + 1);

  // Check tracker
  const tracker = fortyDayWorkoutService.getTracker('chestBiceps', updatedDay.exercises.length - 1);
  assert.ok(tracker);
  assert.equal(tracker.sets.length, 4);
});

test('fortyDayWorkoutService: reorderDayExercises swaps exercises without losing tracker data', () => {
  const day = fortyDayWorkoutService.getDay('chestBiceps');
  assert.ok(day.exercises.length >= 2);
  const ex0Before = day.exercises[0].title;
  const ex1Before = day.exercises[1].title;

  // Set a test weight on exercise 0
  fortyDayWorkoutService.updateSet('chestBiceps', 0, 0, 'kg', 85);
  fortyDayWorkoutService.updateSet('chestBiceps', 0, 0, 'reps', 10);

  // Reorder index 0 to index 1
  fortyDayWorkoutService.reorderDayExercises('chestBiceps', 0, 1);

  const dayAfter = fortyDayWorkoutService.getDay('chestBiceps');
  assert.equal(dayAfter.exercises[0].title, ex1Before);
  assert.equal(dayAfter.exercises[1].title, ex0Before);

  // Verify tracker of ex0Before (now at index 1) still has 85kg and 10 reps!
  const tracker1 = fortyDayWorkoutService.getTracker('chestBiceps', 1);
  assert.equal(tracker1.sets[0].kg, 85);
  assert.equal(tracker1.sets[0].reps, 10);
});
