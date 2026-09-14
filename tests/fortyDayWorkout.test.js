import test from 'node:test';
import assert from 'node:assert/strict';

import {
  FORTY_DAY_DAYS,
  FORTY_DAY_PROGRAM,
  fortyDayExerciseId,
  getFortyDay
} from '../src/data/fortyDayWorkout.js';

test('the integrated 40-day program keeps all seven days and 39 exercises', () => {
  assert.equal(FORTY_DAY_PROGRAM.durationDays, 40);
  assert.equal(FORTY_DAY_DAYS.length, 7);
  assert.equal(
    FORTY_DAY_DAYS.reduce((total, day) => total + day.exercises.length, 0),
    39
  );
  assert.equal(getFortyDay('pullA').key, 'pullA');
  assert.equal(getFortyDay('missing').key, 'pushA');
  assert.equal(fortyDayExerciseId('pushA', 0), 'fortyDay_pushA_0');
});
