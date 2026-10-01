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
