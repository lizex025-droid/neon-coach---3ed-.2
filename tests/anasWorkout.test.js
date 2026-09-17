import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ANAS_DAYS,
  ANAS_PROGRAM,
  getAnasDay,
  anasExerciseId,
  getAllAnasExercises
} from '../src/data/anasWorkout.js';
import { fortyDayWorkoutService } from '../src/services/fortyDayWorkoutService.js';

test('Anas System (نظام أنس) workout data has 5 days and 29 exercises matching anas.html?book=anas', () => {
  assert.equal(ANAS_PROGRAM.id, 'anas');
  assert.equal(ANAS_PROGRAM.title, 'نظام أنس');
  assert.equal(ANAS_PROGRAM.filterHeading, 'اختر نوع التمرين');
  assert.equal(ANAS_DAYS.length, 5);

  const dayKeys = ANAS_DAYS.map(d => d.key);
  assert.deepEqual(dayKeys, ['saturdayPush', 'sundayPull', 'mondayLegs', 'wednesdayUpper', 'thursdayAccessories']);

  // Check 1: Saturday Push (7 exercises)
  const push = getAnasDay('saturdayPush');
  assert.equal(push.short, 'Push');
  assert.equal(push.exercises.length, 7);
  assert.match(push.exercises[0].title, /صدر إنكلاين علوي/);
  assert.match(push.exercises[1].title, /صدر مستوي/);
  assert.match(push.exercises[2].title, /كتف جانبي/);
  assert.match(push.exercises[3].title, /كتف أمامي/);
  assert.match(push.exercises[4].title, /ترايسبس بالحبل/);
  assert.match(push.exercises[5].title, /ترايسبس سنغل آرم/);
  assert.match(push.exercises[6].title, /ترايسبس من فوق الرأس/);
  assert.ok(push.exercises[0].image.startsWith('https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/'));

  // Check 2: Sunday Pull (6 exercises)
  const pull = getAnasDay('sundayPull');
  assert.equal(pull.short, 'Pull');
  assert.equal(pull.exercises.length, 6);
  assert.match(pull.exercises[0].title, /سحب ظهر من فوق/);
  assert.match(pull.exercises[1].title, /تمرين ظهر على الجهاز/);
  assert.match(pull.exercises[2].title, /سحب أرضي/);
  assert.match(pull.exercises[3].title, /كتف خلفي/);
  assert.match(pull.exercises[4].title, /بايسبس بار/);
  assert.match(pull.exercises[5].title, /بايسبس عزل/);

  // Check 3: Monday Legs (5 exercises)
  const legs = getAnasDay('mondayLegs');
  assert.equal(legs.short, 'Legs');
  assert.equal(legs.exercises.length, 5);
  assert.match(legs.exercises[0].title, /تمارين أرجل/);

  // Check 4: Wednesday Upper (6 exercises)
  const upper = getAnasDay('wednesdayUpper');
  assert.equal(upper.short, 'Upper');
  assert.equal(upper.exercises.length, 6);
  assert.match(upper.exercises[0].title, /صدر بالفراشة/);
  assert.match(upper.exercises[1].title, /صدر سفلي/);
  assert.match(upper.exercises[2].title, /ديد ليفت للظهر/);
  assert.match(upper.exercises[3].title, /سحب ظهر بالكابل/);
  assert.match(upper.exercises[4].title, /بايسبس/);
  assert.match(upper.exercises[5].title, /ترايسبس/);

  // Check 5: Thursday Accessories (5 exercises)
  const accessories = getAnasDay('thursdayAccessories');
  assert.equal(accessories.short, 'كتف');
  assert.equal(accessories.exercises.length, 5);
  assert.match(accessories.exercises[0].title, /كتف جانبي/);
  assert.match(accessories.exercises[1].title, /كتف خلفي/);
  assert.match(accessories.exercises[2].title, /كتف أمامي/);
  assert.match(accessories.exercises[3].title, /تمارين سواعد/);
  assert.match(accessories.exercises[4].title, /تمارين بطن/);

  // Total exercises
  const allExercises = getAllAnasExercises();
  assert.equal(allExercises.length, 29);

  // Exercise ID generation
  assert.equal(anasExerciseId('saturdayPush', 0), 'anas_saturdayPush_0');
  assert.equal(anasExerciseId('thursdayAccessories', 4), 'anas_thursdayAccessories_4');

  // Verify all exercises have images and pageImages
  for (const ex of allExercises) {
    assert.ok(ex.image, `Exercise ${ex.title} should have an image`);
    assert.ok(ex.pageImage, `Exercise ${ex.title} should have a pageImage`);
  }
});

test('fortyDayWorkoutService dynamically integrates Anas System', () => {
  // Switch to Anas
  fortyDayWorkoutService.setActivePlan('anas');
  assert.equal(fortyDayWorkoutService.getActivePlan(), 'anas');
  assert.equal(fortyDayWorkoutService.getProgram().title, 'نظام أنس');
  assert.equal(fortyDayWorkoutService.getDays().length, 5);
  assert.equal(fortyDayWorkoutService.getDay('saturdayPush').short, 'Push');
  assert.equal(fortyDayWorkoutService.getDay('sundayPull').short, 'Pull');
  assert.equal(fortyDayWorkoutService.getDay('mondayLegs').short, 'Legs');
  assert.equal(fortyDayWorkoutService.getDay('wednesdayUpper').short, 'Upper');
  assert.equal(fortyDayWorkoutService.getDay('thursdayAccessories').short, 'كتف');

  // Verify trackers for Anas start completely blank
  const trackers = fortyDayWorkoutService.getTrackersForDay('saturdayPush');
  assert.equal(trackers.length, 7);
  for (const tracker of trackers) {
    for (const set of tracker.sets) {
      assert.equal(set.kg, '', 'Weight should be blank by default');
      assert.equal(set.reps, '', 'Reps should be blank by default');
      assert.equal(set.done, false, 'Done should be false by default');
    }
  }

  // Adding set in Anas workout
  fortyDayWorkoutService.addSet('saturdayPush', 0);
  const updatedTracker = fortyDayWorkoutService.getTracker('saturdayPush', 0);
  const newSet = updatedTracker.sets.at(-1);
  assert.equal(newSet.kg, '');
  assert.equal(newSet.reps, '');
  assert.equal(newSet.done, false);

  // Switch back to Hasm
  fortyDayWorkoutService.setActivePlan('hasm');
  assert.equal(fortyDayWorkoutService.getActivePlan(), 'hasm');
  assert.equal(fortyDayWorkoutService.getProgram().title, 'نظام الحسم');
});
