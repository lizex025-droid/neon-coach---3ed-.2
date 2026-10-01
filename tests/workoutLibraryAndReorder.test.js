import test from 'node:test';
import assert from 'node:assert/strict';

import {
  EXERCISE_GROUPS,
  ALL_LIBRARY_EXERCISES,
  getExerciseGroups,
  getExercisesByGroup,
  searchExercises,
  detectExerciseMuscleGroup
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

test('fortyDayWorkoutService: quick move reorders exercises sequentially up and down', () => {
  const day = fortyDayWorkoutService.getDay('chestBiceps');
  const count = day.exercises.length;
  assert.ok(count >= 3);

  const originalOrder = day.exercises.map(e => e.title);

  // Quick move down: index 0 -> 1
  fortyDayWorkoutService.reorderDayExercises('chestBiceps', 0, 1);
  const afterDown = fortyDayWorkoutService.getDay('chestBiceps').exercises.map(e => e.title);
  assert.equal(afterDown[0], originalOrder[1]);
  assert.equal(afterDown[1], originalOrder[0]);

  // Quick move up: index 1 -> 0
  fortyDayWorkoutService.reorderDayExercises('chestBiceps', 1, 0);
  const afterUp = fortyDayWorkoutService.getDay('chestBiceps').exercises.map(e => e.title);
  assert.deepEqual(afterUp, originalOrder);
});

test('detectExerciseMuscleGroup accurately resolves muscle groups', () => {
  assert.equal(detectExerciseMuscleGroup({ title: 'Barbell Bench Press | بنش مستوي' }), 'chest');
  assert.equal(detectExerciseMuscleGroup({ title: 'Lat Pulldown | سحب ظهر واسع' }), 'back');
  assert.equal(detectExerciseMuscleGroup({ title: 'Barbell Squat | سكوات خلفي' }), 'legs');
  assert.equal(detectExerciseMuscleGroup({ title: 'Overhead Shoulder Press | ضغط كتف' }), 'shoulders');
  assert.equal(detectExerciseMuscleGroup({ title: 'Bicep Barbell Curl | تبادل باي' }), 'biceps');
  assert.equal(detectExerciseMuscleGroup({ title: 'Triceps Cable Pushdown | تراي كابل' }), 'triceps');
  assert.equal(detectExerciseMuscleGroup({ title: 'Ab Crunch Machine' }), 'abs');
  assert.equal(detectExerciseMuscleGroup({ title: 'Wrist Curl | ساعد' }), 'forearms');
  assert.equal(detectExerciseMuscleGroup({ title: 'Random Unknown Exercise' }, 'chestBiceps'), 'chest');
});

test('fortyDayWorkoutService: resetExercise clears logged sets and reps while preserving exercise in plan', () => {
  const dayKey = 'chestBiceps';
  // Fill in some data
  fortyDayWorkoutService.updateSet(dayKey, 0, 0, 'kg', 100);
  fortyDayWorkoutService.updateSet(dayKey, 0, 0, 'reps', 12);
  fortyDayWorkoutService.toggleSet(dayKey, 0, 0);

  const trackerBefore = fortyDayWorkoutService.getTracker(dayKey, 0);
  assert.equal(trackerBefore.sets[0].kg, 100);
  assert.equal(trackerBefore.sets[0].reps, 12);
  assert.equal(trackerBefore.sets[0].done, true);

  // Reset exercise
  fortyDayWorkoutService.resetExercise(dayKey, 0);

  const trackerAfter = fortyDayWorkoutService.getTracker(dayKey, 0);
  assert.equal(trackerAfter.sets[0].kg, '');
  assert.equal(trackerAfter.sets[0].reps, '');
  assert.equal(trackerAfter.sets[0].done, false);

  // Exercise itself is still in the day!
  const day = fortyDayWorkoutService.getDay(dayKey);
  assert.ok(day.exercises[0]);
});

test('fortyDayWorkoutService: replaceExerciseInDay replaces exercise in place with new tracker', () => {
  const dayKey = 'chestBiceps';
  const initialCount = fortyDayWorkoutService.getDay(dayKey).exercises.length;

  const replacement = {
    id: 'chest_press_machine_test',
    title: 'Chest Press Machine | جهاز ضغط الصدر',
    sets: 4,
    reps: '10-12',
    image: 'https://example.com/chest_machine.png'
  };

  const replaced = fortyDayWorkoutService.replaceExerciseInDay(dayKey, 1, replacement);
  assert.ok(replaced);
  assert.equal(replaced.title, replacement.title);
  assert.equal(replaced.number, 2);

  const dayAfter = fortyDayWorkoutService.getDay(dayKey);
  assert.equal(dayAfter.exercises.length, initialCount); // Length unchanged!
  assert.equal(dayAfter.exercises[1].title, replacement.title);

  // Check that new tracker was created with 4 sets
  const tracker = fortyDayWorkoutService.getTracker(dayKey, 1);
  assert.ok(tracker);
  assert.equal(tracker.sets.length, 4);
});

test('fortyDayWorkoutService: deleteExerciseFromDay removes exercise and re-indexes numbers', () => {
  const dayKey = 'chestBiceps';
  const initialCount = fortyDayWorkoutService.getDay(dayKey).exercises.length;
  assert.ok(initialCount >= 2);

  const ex0 = fortyDayWorkoutService.getDay(dayKey).exercises[0];
  const ex1 = fortyDayWorkoutService.getDay(dayKey).exercises[1];

  // Delete exercise at index 0
  const success = fortyDayWorkoutService.deleteExerciseFromDay(dayKey, 0);
  assert.equal(success, true);

  const dayAfter = fortyDayWorkoutService.getDay(dayKey);
  assert.equal(dayAfter.exercises.length, initialCount - 1);
  assert.equal(dayAfter.exercises[0].title, ex1.title);
  assert.equal(dayAfter.exercises[0].number, 1); // Re-indexed to 1!
});

test('fortyDayWorkoutService: resetDayToDefault restores default exercises after additions and modifications', () => {
  const dayKey = 'backTriceps';
  const originalExercises = fortyDayWorkoutService.getDay(dayKey).exercises.map(e => e.title);

  // Add a custom exercise
  fortyDayWorkoutService.addExerciseToDay(dayKey, {
    title: 'Custom Add Test Exercise',
    sets: 3,
    reps: '10'
  });
  assert.equal(fortyDayWorkoutService.getDay(dayKey).exercises.length, originalExercises.length + 1);

  // Now reset day to default
  const resetSuccess = fortyDayWorkoutService.resetDayToDefault(dayKey);
  assert.equal(resetSuccess, true);

  const restoredDay = fortyDayWorkoutService.getDay(dayKey);
  assert.equal(restoredDay.exercises.length, originalExercises.length);
  assert.deepEqual(restoredDay.exercises.map(e => e.title), originalExercises);
});

test('fortyDayWorkoutService: resetPlanToDefault resets all customized days of the active plan', () => {
  const planKey = 'hasm';
  const dayKey1 = 'chestBiceps';
  const dayKey2 = 'backAbs';

  // Customize day1
  fortyDayWorkoutService.addExerciseToDay(dayKey1, { title: 'Test 1' });
  // Customize day2
  fortyDayWorkoutService.addExerciseToDay(dayKey2, { title: 'Test 2' });

  assert.ok(fortyDayWorkoutService.load().customExercises?.[dayKey1]);
  assert.ok(fortyDayWorkoutService.load().customExercises?.[dayKey2]);

  // Reset plan to default
  const resetPlanSuccess = fortyDayWorkoutService.resetPlanToDefault(planKey);
  assert.equal(resetPlanSuccess, true);

  assert.equal(fortyDayWorkoutService.load().customExercises?.[dayKey1], undefined);
  assert.equal(fortyDayWorkoutService.load().customExercises?.[dayKey2], undefined);
});



