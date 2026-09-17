import test from 'node:test';
import assert from 'node:assert/strict';

import {
  HASM_GROUPS,
  HASM_PROGRAM,
  getHasmGroup,
  hasmExerciseId,
  getAllHasmExercises
} from '../src/data/hasmWorkout.js';
import { fortyDayWorkoutService } from '../src/services/fortyDayWorkoutService.js';

test('Nizam Al-Hasm (نظام الحسم) workout data has 4 groups and 30 exercises', () => {
  assert.equal(HASM_PROGRAM.id, 'hasm');
  assert.equal(HASM_PROGRAM.title, 'نظام الحسم');
  assert.equal(HASM_GROUPS.length, 4);

  const groupKeys = HASM_GROUPS.map(g => g.key);
  assert.deepEqual(groupKeys, ['chestBiceps', 'backAbs', 'shouldersTrapsTriceps', 'legsCalves']);

  // Check exercises count per muscle group
  const chestBiceps = getHasmGroup('chestBiceps');
  assert.equal(chestBiceps.exercises.length, 7);

  const backAbs = getHasmGroup('backAbs');
  assert.equal(backAbs.exercises.length, 7);

  const shouldersTrapsTriceps = getHasmGroup('shouldersTrapsTriceps');
  assert.equal(shouldersTrapsTriceps.exercises.length, 8);

  const legsCalves = getHasmGroup('legsCalves');
  assert.equal(legsCalves.exercises.length, 8);

  // Total exercises
  const allExercises = getAllHasmExercises();
  assert.equal(allExercises.length, 30);

  // Verify first exercise of chest and biceps
  assert.equal(chestBiceps.exercises[0].number, 1);
  assert.match(chestBiceps.exercises[0].title, /بنش بريس للصدر أو دامبل بريس/);
  assert.ok(chestBiceps.exercises[0].image.startsWith('https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/'));

  // Verify exercise ID generation
  assert.equal(hasmExerciseId('chestBiceps', 0), 'hasm_chestBiceps_0');
  assert.equal(hasmExerciseId('legsCalves', 7), 'hasm_legsCalves_7');
});

test('fortyDayWorkoutService dynamically supports both Hasm and PPL programs', () => {
  // Switch to Hasm
  fortyDayWorkoutService.setActivePlan('hasm');
  assert.equal(fortyDayWorkoutService.getActivePlan(), 'hasm');
  assert.equal(fortyDayWorkoutService.getProgram().title, 'نظام الحسم');
  assert.equal(fortyDayWorkoutService.getDays().length, 4);
  assert.equal(fortyDayWorkoutService.getDay('chestBiceps').short, 'صدر وبايسبس');

  // Switch to PPL
  fortyDayWorkoutService.setActivePlan('ppl');
  assert.equal(fortyDayWorkoutService.getActivePlan(), 'ppl');
  assert.equal(fortyDayWorkoutService.getProgram().title, 'تمرين الـ40 يوم');
  assert.equal(fortyDayWorkoutService.getDays().length, 7);
  assert.equal(fortyDayWorkoutService.getDay('pushA').short, 'Push A');

  // Reset back to Hasm
  fortyDayWorkoutService.setActivePlan('hasm');
  assert.equal(fortyDayWorkoutService.getActivePlan(), 'hasm');
});

test('fortyDayWorkout and EXERCISES contain verified R2 image links with pageImage fallbacks', async () => {
  const { FORTY_DAY_DAYS } = await import('../src/data/fortyDayWorkout.js');
  const { EXERCISES } = await import('../src/data/exercises.js');

  // Verify Forty Day exercises have images and pageImages
  let r2ExerciseCount = 0;
  for (const day of FORTY_DAY_DAYS) {
    for (const ex of day.exercises) {
      assert.ok(ex.image, `Exercise ${ex.title} should have an image`);
      assert.ok(ex.pageImage, `Exercise ${ex.title} should have a pageImage`);
      if (ex.image.startsWith('https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/')) {
        r2ExerciseCount++;
      }
    }
  }
  // At least 25 core exercises in 40-day workout have direct R2 demonstration images
  assert.ok(r2ExerciseCount >= 25, `Expected >= 25 R2 images, found ${r2ExerciseCount}`);

  // Verify EXERCISES have R2 image links
  for (const ex of EXERCISES) {
    assert.ok(ex.image, `EXERCISE ${ex.id} should have an image`);
    assert.ok(ex.image.startsWith('https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/'));
  }
});

