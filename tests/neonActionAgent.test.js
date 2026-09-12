import test from 'node:test';
import assert from 'node:assert/strict';
import { parseNaturalAction } from '../src/domain/actionParser.js';
import { ALL_ACTION_TOOLS, validateToolArgs } from '../src/domain/actionToolsRegistry.js';
import { searchFoodNutrition } from '../src/services/foodSearchService.js';

test('1. Single Action: Water (شربت نص لتر مي)', () => {
  const result = parseNaturalAction('شربت نص لتر مي');
  assert.ok(result);
  assert.equal(result.type, 'actions');
  assert.equal(result.actions.length, 1);
  assert.equal(result.actions[0].tool, 'logWater');
  assert.equal(result.actions[0].arguments.milliliters, 500);
});

test('2. Single Action: Weight (وزني اليوم 78.4)', () => {
  const result = parseNaturalAction('وزني اليوم 78.4');
  assert.ok(result);
  assert.equal(result.type, 'actions');
  assert.equal(result.actions.length, 1);
  assert.equal(result.actions[0].tool, 'logWeight');
  assert.equal(result.actions[0].arguments.weightKg, 78.4);
});

test('3. Single Action: Supplement (أخذت الكرياتين)', () => {
  const result = parseNaturalAction('أخذت الكرياتين');
  assert.ok(result);
  assert.equal(result.type, 'actions');
  assert.equal(result.actions.length, 1);
  assert.equal(result.actions[0].tool, 'markSupplementTaken');
  assert.match(result.actions[0].arguments.supplement, /كرياتين/);
});

test('4. Single Action: Meal (أكلت 200 غ دجاج و150 غ رز)', () => {
  const result = parseNaturalAction('أكلت 200 غ دجاج و150 غ رز');
  assert.ok(result);
  assert.equal(result.type, 'actions');
  assert.equal(result.actions.length, 1);
  assert.equal(result.actions[0].tool, 'logMeal');
  const items = result.actions[0].arguments.items;
  assert.equal(items.length, 2);
  assert.equal(items[0].grams, 200);
  assert.equal(items[1].grams, 150);
  assert.ok(items[0].calories > 0);
  assert.ok(items[1].calories > 0);
});

test('5. Single Action: Workout Sets (عملت بنش بريس 80 كيلو 3 جولات 8 عدات)', () => {
  const result = parseNaturalAction('عملت بنش بريس 80 كيلو 3 جولات 8 عدات');
  assert.ok(result);
  assert.equal(result.type, 'actions');
  assert.equal(result.actions.length, 1);
  assert.equal(result.actions[0].tool, 'logWorkoutSets');
  assert.equal(result.actions[0].arguments.weightKg, 80);
  assert.equal(result.actions[0].arguments.sets, 3);
  assert.equal(result.actions[0].arguments.reps, 8);
});

test('6. Clarification Follow-up & Correction (لا قصدي 85 كيلو)', () => {
  const sessionContext = {
    lastExercise: 'ضغط صدر مستوي بالبار',
    lastSets: 3,
    lastReps: 8,
    lastWeight: 80
  };
  const result = parseNaturalAction('لا قصدي 85 كيلو', sessionContext);
  assert.ok(result);
  assert.equal(result.type, 'actions');
  assert.equal(result.actions[0].tool, 'logWorkoutSets');
  assert.equal(result.actions[0].arguments.weightKg, 85);
  assert.equal(result.actions[0].arguments.sets, 3);
  assert.equal(result.actions[0].arguments.reps, 8);
});

test('7. Water Correction (قصدي نص لتر بدل لتر)', () => {
  const sessionContext = {
    lastWaterMl: 1000
  };
  const result = parseNaturalAction('لا قصدي نص لتر', sessionContext);
  assert.ok(result);
  assert.equal(result.type, 'actions');
  assert.equal(result.actions[0].tool, 'updateWater');
  assert.equal(result.actions[0].arguments.milliliters, 500);
});

test('8. Weight Correction (وزني 79.2 ثم قصدي 78.9)', () => {
  const sessionContext = {
    lastWeight: 79.2
  };
  const result = parseNaturalAction('قصدي 78.9', sessionContext);
  assert.ok(result);
  assert.equal(result.type, 'actions');
  assert.equal(result.actions[0].tool, 'updateWeight');
  assert.equal(result.actions[0].arguments.weightKg, 78.9);
});

test('9. Query Action (شو باقيلي بروتين؟)', () => {
  const result = parseNaturalAction('شو باقيلي بروتين؟');
  assert.ok(result);
  assert.equal(result.actions[0].tool, 'getTodayNutrition');
  assert.equal(result.actions[0].arguments.query, 'remaining_protein');
});

test('10. Undo Action (رجع آخر شغلة)', () => {
  const result = parseNaturalAction('رجع آخر شغلة');
  assert.ok(result);
  assert.equal(result.actions[0].tool, 'undoLastAction');
});

test('11. Stop Voice Session (نيون وقف استماع)', () => {
  const result = parseNaturalAction('نيون وقف استماع');
  assert.ok(result);
  assert.equal(result.actions[0].tool, 'stopVoiceSession');
});

test('12. Multi-Action in single utterance', () => {
  const utterance = 'وزني اليوم 78.5، شربت لترين، أكلت 200 غ دجاج و150 غ رز، ولعبت بنش 85 كيلو 3 جولات 6 عدات';
  const result = parseNaturalAction(utterance);
  assert.ok(result);
  assert.equal(result.type, 'actions');
  assert.ok(result.actions.length >= 4, `Expected at least 4 actions, got ${result.actions.length}`);

  const tools = result.actions.map(a => a.tool);
  assert.ok(tools.includes('logWeight'));
  assert.ok(tools.includes('logWater'));
  assert.ok(tools.includes('logMeal'));
  assert.ok(tools.includes('logWorkoutSets'));
});

test('13. Validation of all tool schemas', () => {
  assert.doesNotThrow(() => validateToolArgs('logWater', { milliliters: 500 }));
  assert.doesNotThrow(() => validateToolArgs('logWeight', { weightKg: 78.5 }));
  assert.doesNotThrow(() => validateToolArgs('logWorkoutSets', { exercise: 'bench', weightKg: 80, sets: 3, reps: 8 }));
  assert.throws(() => validateToolArgs('logWater', { milliliters: -50 }));
  assert.throws(() => validateToolArgs('logWorkoutSets', { exercise: 'bench', weightKg: 80, sets: -1, reps: 8 }));
  assert.throws(() => validateToolArgs('executeSQL', { query: 'DROP TABLE' }));
});

test('14. Food Search abstraction with verified vs estimated fallback', async () => {
  const chicken = await searchFoodNutrition('صدر دجاج مشوي', 200);
  assert.ok(chicken);
  assert.equal(chicken.isEstimated, false);
  assert.equal(chicken.protein, 62);

  const unknown = await searchFoodNutrition('كوكيز شوفان بالبروتين غير معروف', 100);
  assert.ok(unknown);
  assert.equal(unknown.isEstimated, true);
  assert.ok(unknown.calories > 0);
});
