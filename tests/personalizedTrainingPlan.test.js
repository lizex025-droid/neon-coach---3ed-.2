import test from 'node:test';
import assert from 'node:assert/strict';

import {
  generatePersonalizedTrainingDraft,
  normalizeTrainingInput,
  validatePersonalizedTrainingDraft
} from '../src/domain/personalizedTrainingPlan.js';
import { FORTY_DAY_DAYS } from '../src/data/fortyDayWorkout.js';

const base = {
  trainingLevel: 'intermediate',
  trainingExperienceMonths: 18,
  trainingBreakMonths: 0,
  workoutDaysCount: 4,
  sessionDurationMin: 60,
  equipment: 'gym',
  availableEquipment: ['machines', 'barbell', 'dumbbells', 'cables', 'bodyweight'],
  goal: 'muscle_gain',
  injuries: [],
  injuryDetails: {},
  focusAreas: []
};

test('keeps the selected training level and provides a separate conservative return suggestion', () => {
  const normalized = normalizeTrainingInput({ ...base, trainingLevel: 'advanced', trainingBreakMonths: 6 });
  const draft = generatePersonalizedTrainingDraft(normalized, { splitKey: 'hasm', requestId: 'returning-user' });
  assert.equal(draft.selectedLevel, 'advanced');
  assert.match(draft.suggestedStartingPoint, /محافظة/);
});

test('does not redesign or auto-switch an incompatible split schedule', () => {
  const draft = generatePersonalizedTrainingDraft({ ...base, workoutDaysCount: 4 }, { splitKey: 'ppl', requestId: 'ppl-four-days' });
  assert.equal(draft.splitKey, 'ppl');
  assert.equal(draft.canApprove, false);
  assert.deepEqual(draft.scheduleConflict.supportedDays, [3, 6]);
  assert.match(draft.blockers[0], /Push Pull Legs/);
});

test('preserves the exact PPL day order when a supported schedule is selected', () => {
  const draft = generatePersonalizedTrainingDraft({ ...base, workoutDaysCount: 6 }, { splitKey: 'ppl', requestId: 'ppl-six-days' });
  const expected = FORTY_DAY_DAYS.filter(day => day.exercises?.length).slice(0, 6).map(day => day.key);
  assert.deepEqual(draft.days.map(day => day.key), expected);
  assert.equal(draft.canApprove, true);
});

test('male and female users receive identical training decisions for identical capabilities', () => {
  const male = generatePersonalizedTrainingDraft({ ...base, gender: 'male' }, { splitKey: 'hasm', requestId: 'same-input-m' });
  const female = generatePersonalizedTrainingDraft({ ...base, gender: 'female' }, { splitKey: 'hasm', requestId: 'same-input-f' });
  const project = draft => draft.days.map(day => ({
    key: day.key,
    exercises: day.exercises.map(({ id, title, sets, reps, restSeconds, rir, movementPattern }) => ({ id, title, sets, reps, restSeconds, rir, movementPattern }))
  }));
  assert.deepEqual(project(male), project(female));
});

test('requires injury details instead of guessing a diagnosis', () => {
  const draft = generatePersonalizedTrainingDraft({ ...base, injuries: ['knee'], injuryDetails: {} }, { splitKey: 'hasm', requestId: 'missing-health-detail' });
  assert.equal(draft.canApprove, false);
  assert.ok(draft.blockers.some(item => item.includes('أكمل تفاصيل')));
});

test('blocks all plan activation when a global medical ban is recorded', () => {
  const draft = generatePersonalizedTrainingDraft({
    ...base,
    injuries: ['lower_back'],
    injuryDetails: { lower_back: { status: 'تعليمات مختص', medicalBan: 'all' } }
  }, { splitKey: 'hasm', requestId: 'medical-ban-all' });
  assert.equal(draft.canApprove, false);
  assert.ok(draft.blockers.some(item => item.includes('منع طبي شامل')));
});

test('severe or worsening constraints remove loaded movements and never call an alternative guaranteed safe', () => {
  const draft = generatePersonalizedTrainingDraft({
    ...base,
    injuries: ['lower_back'],
    injuryDetails: { lower_back: { status: 'ألم', painSeverity: 8, worsening: true, medicalBan: 'none' } }
  }, { splitKey: 'hasm', requestId: 'severe-back' });
  assert.ok(draft.warnings.some(item => item.includes('تقييماً مختصاً')));
  assert.equal(draft.days.flatMap(day => day.exercises).some(exercise => exercise.loadedRegions.includes('lower_back')), false);
  assert.equal(draft.warnings.some(item => /مضمون|آمن 100/.test(item)), false);
});

test('uses only real exercises with images and complete dosage metadata', () => {
  const draft = generatePersonalizedTrainingDraft(base, { splitKey: 'hasm', requestId: 'complete-dose' });
  const validation = validatePersonalizedTrainingDraft(draft);
  assert.equal(validation.valid, true, validation.errors.join('\n'));
  for (const exercise of draft.days.flatMap(day => day.exercises)) {
    assert.ok(exercise.id);
    assert.match(exercise.image, /^https:\/\//);
    assert.ok(exercise.sets >= 1);
    assert.ok(exercise.reps);
    assert.ok(exercise.restSeconds >= 0);
    assert.ok(exercise.rir >= 0);
    assert.ok(exercise.reason);
  }
});

test('acceptance: beginner 3 days without injuries produces conservative volume and RIR 3', () => {
  const draft = generatePersonalizedTrainingDraft({
    ...base,
    trainingLevel: 'beginner',
    workoutDaysCount: 3,
    injuries: [],
    injuryDetails: {}
  }, { splitKey: 'hasm', requestId: 'beginner-3d' });

  assert.equal(draft.canApprove, true);
  assert.equal(draft.days.length, 3);
  for (const day of draft.days) {
    for (const ex of day.exercises) {
      assert.equal(ex.sets, 2, 'Beginner should receive 2 sets per exercise');
      assert.equal(ex.rir, 3, 'Beginner should have RIR 3 for conservative reserve');
      assert.match(ex.coachingNote, /RIR 3/);
    }
  }
});

test('acceptance: intermediate 4 days with shoulder pain upon overhead pressing replaces trigger movement with clear reason', () => {
  const draft = generatePersonalizedTrainingDraft({
    ...base,
    trainingLevel: 'intermediate',
    workoutDaysCount: 4,
    injuries: ['shoulder'],
    injuryDetails: {
      shoulder: {
        status: 'ألم حالي',
        side: 'right',
        painSeverity: 6,
        triggerMovements: 'overhead, press, كتف',
        medicalBan: 'none'
      }
    }
  }, { splitKey: 'hasm', requestId: 'intermediate-shoulder' });

  assert.equal(draft.canApprove, true);
  const allExercises = draft.days.flatMap(day => day.exercises);
  const replaced = allExercises.filter(ex => ex.reason.includes('عدّلنا هذا التمرين لأنك ذكرت أنه يسبب أثراً أو ألماً في الكتف'));
  assert.ok(replaced.length > 0, 'Should replace shoulder trigger exercises and provide Arabic explanation');
  for (const ex of allExercises) {
    assert.equal(ex.movementPattern === 'vertical_push', false, 'Overhead pressing must be excluded');
  }
});

test('acceptance: advanced with concurrent knee and lower back constraints respects both simultaneously', () => {
  const draft = generatePersonalizedTrainingDraft({
    ...base,
    trainingLevel: 'advanced',
    workoutDaysCount: 4,
    injuries: ['knee', 'lower_back'],
    injuryDetails: {
      knee: {
        status: 'إصابة مشخصة',
        painSeverity: 8,
        triggerMovements: 'squat, ركبة',
        worsening: true,
        medicalBan: 'none'
      },
      lower_back: {
        status: 'ألم حالي',
        painSeverity: 8,
        triggerMovements: 'deadlift, bent, ظهر',
        worsening: true,
        medicalBan: 'none'
      }
    }
  }, { splitKey: 'hasm', requestId: 'adv-knee-back' });

  const allExercises = draft.days.flatMap(day => day.exercises);
  for (const ex of allExercises) {
    assert.equal(ex.loadedRegions.includes('knee'), false, 'Knee should not be loaded');
    assert.equal(ex.loadedRegions.includes('lower_back'), false, 'Lower back should not be loaded');
  }
});

test('acceptance: home training with limited equipment excludes unavailable machines and cables', () => {
  const draft = generatePersonalizedTrainingDraft({
    ...base,
    equipment: 'home',
    availableEquipment: ['bodyweight', 'dumbbells', 'bands'],
    workoutDaysCount: 4
  }, { splitKey: 'hasm', requestId: 'home-limited' });

  assert.equal(draft.canApprove, true);
  const allExercises = draft.days.flatMap(day => day.exercises);
  for (const ex of allExercises) {
    assert.equal(['machines', 'cables'].includes(ex.equipment), false, `No machines/cables at home: ${ex.title}`);
  }
});

test('acceptance: short session duration (30-40 min) caps exercises per day to fit time window', () => {
  const draft = generatePersonalizedTrainingDraft({
    ...base,
    sessionDurationMin: 40,
    workoutDaysCount: 3
  }, { splitKey: 'hasm', requestId: 'short-session-40' });

  assert.equal(draft.canApprove, true);
  for (const day of draft.days) {
    assert.ok(day.exercises.length <= 4, `Day ${day.key} should have at most 4 exercises for a 40 min session`);
    assert.ok(day.estimatedMinutes <= 50, `Estimated minutes ${day.estimatedMinutes} should stay within bounds`);
  }
});

test('acceptance: no compatible alternative in library produces blocker requiring professional evaluation', () => {
  // If someone restricts all equipment to empty and bans all exercises
  const draft = generatePersonalizedTrainingDraft({
    ...base,
    availableEquipment: ['non_existent_equipment_xyz'],
    workoutDaysCount: 3
  }, { splitKey: 'hasm', requestId: 'no-compatible-alt' });

  assert.equal(draft.canApprove, false);
  assert.ok(draft.blockers.some(b => b.includes('لا يوجد بديل متوافق في المكتبة')));
});

test('acceptance: duplicate clicks with same requestId are idempotent and prevent duplicate plans', async () => {
  const { fortyDayWorkoutService } = await import('../src/services/fortyDayWorkoutService.js');
  fortyDayWorkoutService.setActivePlan('hasm');

  const draft = generatePersonalizedTrainingDraft(base, { splitKey: 'hasm', requestId: 'idempotent-req-001' });
  const firstActivation = await fortyDayWorkoutService.activatePersonalizedPlan(draft, { requestId: 'idempotent-req-001' });
  assert.equal(firstActivation.ok, true);
  assert.equal(Boolean(firstActivation.idempotent), false);

  // Repeated click
  const secondActivation = await fortyDayWorkoutService.activatePersonalizedPlan(draft, { requestId: 'idempotent-req-001' });
  assert.equal(secondActivation.ok, true);
  assert.equal(secondActivation.idempotent, true);
  assert.equal(secondActivation.versionId, firstActivation.versionId);
});

test('acceptance: plan is retained in service and reflected in getActivePlanVersion and getDay', async () => {
  const { fortyDayWorkoutService } = await import('../src/services/fortyDayWorkoutService.js');
  fortyDayWorkoutService.setActivePlan('hasm');

  const draft = generatePersonalizedTrainingDraft({
    ...base,
    trainingLevel: 'intermediate',
    workoutDaysCount: 4
  }, { splitKey: 'hasm', requestId: 'refresh-persist-002' });

  const activation = await fortyDayWorkoutService.activatePersonalizedPlan(draft, { requestId: 'refresh-persist-002' });
  assert.equal(activation.ok, true);

  const activeVersion = fortyDayWorkoutService.getActivePlanVersion('hasm');
  assert.ok(activeVersion);
  assert.equal(activeVersion.id, activation.versionId);
  assert.equal(activeVersion.days.length, 4);

  const firstDay = fortyDayWorkoutService.getDay(activeVersion.days[0].key, 'hasm');
  assert.ok(firstDay);
  assert.ok(firstDay.warmup);
  assert.ok(firstDay.estimatedMinutes > 0);
  assert.equal(firstDay.exercises.length, activeVersion.days[0].exercises.length);
});

