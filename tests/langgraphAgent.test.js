import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { executeLangGraphAgent } from '../api/langgraph/graph.js';
import { DurableFileCheckpointer } from '../api/langgraph/checkpointer.js';

const TEST_CHECKPOINT_FILE = path.join(process.cwd(), '.test_langgraph_checkpoints.json');

function createFreshCheckpointer() {
  if (fs.existsSync(TEST_CHECKPOINT_FILE)) {
    try { fs.unlinkSync(TEST_CHECKPOINT_FILE); } catch (_) {}
  }
  return new DurableFileCheckpointer({ filePath: TEST_CHECKPOINT_FILE, debounceMs: 10 });
}

function cleanCheckpointer() {
  if (fs.existsSync(TEST_CHECKPOINT_FILE)) {
    try { fs.unlinkSync(TEST_CHECKPOINT_FILE); } catch (_) {}
  }
}

test('Scenario 1: Water Logging (سجل 500 مل مي)', async () => {
  const checkpointer = createFreshCheckpointer();
  const threadId = 'test_thread_water';
  const userId = 'user_s1';
  const requestId = 'req_w1';

  const res = await executeLangGraphAgent({
    requestId,
    threadId,
    userId,
    message: 'سجل 500 مل مي',
    context: {
      today: { consumedWaterLiters: 1.0, consumedGlasses: 4, targetWaterLiters: 3.0 }
    }
  }, checkpointer);

  assert.equal(res.status, 'success');
  assert.equal(res.actions.length, 1);
  assert.equal(res.actions[0].tool, 'logWater');
  assert.equal(res.actions[0].args.milliliters, 500);
  assert.equal(res.updatedState.today.consumedWaterLiters, 1.5);
  assert.equal(res.updatedState.today.consumedGlasses, 6);
  assert.ok(res.changedResources.includes('water'));
  cleanCheckpointer();
});

test('Scenario 2: Weight Logging (وزني اليوم 79.9)', async () => {
  const checkpointer = createFreshCheckpointer();
  const threadId = 'test_thread_weight';
  const userId = 'user_s2';

  const res = await executeLangGraphAgent({
    requestId: 'req_wt1',
    threadId,
    userId,
    message: 'وزني اليوم 79.9',
    context: {
      profile: { weight: 80.5 }
    }
  }, checkpointer);

  assert.equal(res.status, 'success');
  assert.equal(res.actions[0].tool, 'logWeight');
  assert.equal(res.actions[0].args.weightKg, 79.9);
  assert.equal(res.updatedState.userProfile.weight, 79.9);
  assert.ok(res.updatedState.weightHistory.length >= 1);
  cleanCheckpointer();
});

test('Scenario 3: Multi-item Meal with USDA Cooked Macros (سجل بالغدا 200 غ صدر دجاج مشوي مطبوخ و150 غ رز مطبوخ)', async () => {
  const checkpointer = createFreshCheckpointer();
  const threadId = 'test_thread_meal';
  const userId = 'user_s3';

  const res = await executeLangGraphAgent({
    requestId: 'req_m1',
    threadId,
    userId,
    message: 'سجل بالغدا 200 غ صدر دجاج مشوي مطبوخ و150 غ رز مطبوخ',
    context: {
      today: { consumedCalories: 0, consumedProtein: 0 }
    }
  }, checkpointer);

  assert.equal(res.status, 'success');
  assert.equal(res.actions.length, 1);
  assert.equal(res.actions[0].tool, 'logMeal');
  const items = res.actions[0].args.items;
  assert.equal(items.length, 2);

  // Check USDA cooked chicken breast macros (approx 165 kcal / 31g protein per 100g -> 330 kcal / 62g protein per 200g)
  const chicken = items.find(i => i.nameAr.includes('دجاج'));
  assert.ok(chicken);
  assert.equal(chicken.grams, 200);
  assert.ok(chicken.protein >= 60, `Chicken protein was ${chicken.protein}, expected >= 60`);

  // Check today totals updated
  assert.ok(res.updatedState.today.consumedCalories > 400);
  assert.ok(res.updatedState.today.consumedProtein >= 60);
  assert.equal(res.updatedState.loggedMeals.length, 1);
  cleanCheckpointer();
});

test('Scenario 4: Read-only Protein Query (كم بقي بروتين اليوم؟)', async () => {
  const checkpointer = createFreshCheckpointer();
  const threadId = 'test_thread_query';
  const userId = 'user_s4';

  const res = await executeLangGraphAgent({
    requestId: 'req_q1',
    threadId,
    userId,
    message: 'كم بقي بروتين اليوم؟',
    context: {
      today: { consumedProtein: 100, targetProtein: 160 }
    }
  }, checkpointer);

  assert.equal(res.status, 'success');
  assert.equal(res.actions[0].tool, 'getTodayNutrition');
  assert.match(res.reply, /60/);
  // Must NOT mutate meals
  assert.equal(res.changedResources.length, 0);
  cleanCheckpointer();
});

test('Scenario 5: Multi-turn Clarification Surviving Reload (سجل دجاج بالغدا -> reload -> 200 بعد الطبخ)', async () => {
  const checkpointer = createFreshCheckpointer();
  const threadId = 'test_thread_multiturn';
  const userId = 'user_s5';

  // Turn 1: Incomplete meal missing weight
  const res1 = await executeLangGraphAgent({
    requestId: 'req_mt1',
    threadId,
    userId,
    message: 'سجل دجاج بالغدا',
    context: { today: { consumedCalories: 0, consumedProtein: 0 } }
  }, checkpointer);

  assert.equal(res1.status, 'clarification');
  assert.match(res1.reply, /غرام/);
  assert.ok(res1.cards?.[0]?.options?.length > 0);

  // Force checkpoint persistence to disk
  await checkpointer.flush();

  // Reload new checkpointer instance from file
  const reloadedCheckpointer = new DurableFileCheckpointer({ filePath: TEST_CHECKPOINT_FILE, debounceMs: 10 });

  // Turn 2: User provides grams and cooking state
  const res2 = await executeLangGraphAgent({
    requestId: 'req_mt2',
    threadId,
    userId,
    message: '200 بعد الطبخ',
    context: { today: { consumedCalories: 0, consumedProtein: 0 } }
  }, reloadedCheckpointer);

  assert.equal(res2.status, 'success');
  assert.equal(res2.actions[0].tool, 'logMeal');
  const loggedItem = res2.actions[0].args.items[0];
  assert.equal(loggedItem.grams, 200);
  assert.equal(loggedItem.state, 'cooked');
  assert.ok(loggedItem.protein >= 60);
  cleanCheckpointer();
});

test('Scenario 6: Cancellation of Pending Clarification (سجل دجاج بالغدا -> كنسل)', async () => {
  const checkpointer = createFreshCheckpointer();
  const threadId = 'test_thread_cancel';
  const userId = 'user_s6';

  // Turn 1: Starts clarification
  await executeLangGraphAgent({
    requestId: 'req_c1',
    threadId,
    userId,
    message: 'سجل دجاج بالغدا',
    context: {}
  }, checkpointer);

  // Turn 2: Cancel
  const res2 = await executeLangGraphAgent({
    requestId: 'req_c2',
    threadId,
    userId,
    message: 'كنسل',
    context: {}
  }, checkpointer);

  assert.equal(res2.status, 'success');
  assert.match(res2.reply, /إلغاء|ألغيت/);
  assert.equal(res2.actions.length, 0);
  cleanCheckpointer();
});

test('Scenario 7: Idempotent Replay (Same requestId returns cached response)', async () => {
  const checkpointer = createFreshCheckpointer();
  const threadId = 'test_thread_idempotency';
  const userId = 'user_s7';
  const requestId = 'req_unique_idemp_1';

  const res1 = await executeLangGraphAgent({
    requestId,
    threadId,
    userId,
    message: 'سجل 250 مل مي',
    context: { today: { consumedWaterLiters: 0 } }
  }, checkpointer);

  assert.equal(res1.status, 'success');
  assert.equal(res1.updatedState.today.consumedWaterLiters, 0.25);

  // Replay exactly same requestId
  const res2 = await executeLangGraphAgent({
    requestId,
    threadId,
    userId,
    message: 'سجل 250 مل مي',
    context: { today: { consumedWaterLiters: 0.25 } }
  }, checkpointer);

  assert.equal(res2.status, 'success');
  // Must return the cached result without adding another 250ml
  assert.equal(res2.updatedState.today.consumedWaterLiters, 0.25);
  cleanCheckpointer();
});

test('Scenario 8: Multi-tenant Thread Isolation (User B cannot access User A thread)', async () => {
  const checkpointer = createFreshCheckpointer();
  const threadId = 'test_thread_tenant';

  // User A creates thread
  await executeLangGraphAgent({
    requestId: 'req_ua1',
    threadId,
    userId: 'user_A',
    message: 'سجل 500 مل مي',
    context: {}
  }, checkpointer);

  // User B tries to send message to User A's thread
  const resB = await executeLangGraphAgent({
    requestId: 'req_ub1',
    threadId,
    userId: 'user_B',
    message: 'وزني 75',
    context: {}
  }, checkpointer);

  assert.equal(resB.status, 'error');
  assert.match(resB.error, /غير مصرح/);
  cleanCheckpointer();
});

test('Scenario 9: Meal Quantity Edit (عدّل كمية الدجاج إلى 150)', async () => {
  const checkpointer = createFreshCheckpointer();
  const threadId = 'test_thread_edit';
  const userId = 'user_s9';

  const initialMeals = [{
    id: 'm1',
    date: new Date().toISOString().split('T')[0],
    mealType: 'lunch',
    calories: 330,
    protein: 62,
    carbs: 0,
    fats: 7,
    items: [{
      foodId: 'chicken-breast-cooked',
      nameAr: 'صدر دجاج مشوي مطبوخ',
      grams: 200,
      state: 'cooked',
      calories: 330,
      protein: 62,
      carbs: 0,
      fats: 7
    }]
  }];

  const res = await executeLangGraphAgent({
    requestId: 'req_edit1',
    threadId,
    userId,
    message: 'عدّل كمية الدجاج إلى 150',
    context: {
      today: { consumedCalories: 330, consumedProtein: 62 },
      loggedMeals: initialMeals
    }
  }, checkpointer);

  assert.equal(res.status, 'success');
  assert.equal(res.actions[0].tool, 'updateMeal');
  const updatedItem = res.updatedState.loggedMeals[0].items[0];
  assert.equal(updatedItem.grams, 150);
  assert.ok(updatedItem.calories < 330);
  assert.ok(updatedItem.protein < 62);
  cleanCheckpointer();
});

test('Scenario 10: Ambiguous Deletion asks for Clarification (احذف الوجبة with >1 meal)', async () => {
  const checkpointer = createFreshCheckpointer();
  const threadId = 'test_thread_ambig';
  const userId = 'user_s10';

  const todayStr = new Date().toISOString().split('T')[0];
  const multipleMeals = [
    { id: 'm1', date: todayStr, titleAr: 'بيض مسلوق', items: [{ nameAr: 'بيض مسلوق' }] },
    { id: 'm2', date: todayStr, titleAr: 'صدر دجاج', items: [{ nameAr: 'صدر دجاج' }] }
  ];

  const res = await executeLangGraphAgent({
    requestId: 'req_del1',
    threadId,
    userId,
    message: 'احذف الوجبة',
    context: {
      today: {},
      loggedMeals: multipleMeals
    }
  }, checkpointer);

  assert.equal(res.status, 'clarification');
  assert.match(res.reply, /أي وجبة/);
  assert.ok(res.cards[0].options.length >= 2);
  cleanCheckpointer();
});

test('Scenario 11: Food Calorie Inquiry (كم سعرة في 200 غ دجاج؟ - does NOT log a meal)', async () => {
  const checkpointer = createFreshCheckpointer();
  const threadId = 'test_thread_info';
  const userId = 'user_s11';

  const res = await executeLangGraphAgent({
    requestId: 'req_info1',
    threadId,
    userId,
    message: 'كم سعرة في 200 غ دجاج؟',
    context: {
      today: { consumedCalories: 0 },
      loggedMeals: []
    }
  }, checkpointer);

  assert.equal(res.status, 'success');
  assert.equal(res.actions[0].tool, 'queryFoodNutrition');
  assert.match(res.reply, /سعرة/);
  // Logged meals must remain empty
  assert.equal(res.updatedState.loggedMeals.length, 0);
  assert.equal(res.updatedState.today.consumedCalories, 0);
  cleanCheckpointer();
});

test('Scenario 12: Manual UI Edit Sync followed by AI Query', async () => {
  const checkpointer = createFreshCheckpointer();
  const threadId = 'test_thread_sync';
  const userId = 'user_s12';

  // Suppose user manually logged 120g protein in UI
  const res = await executeLangGraphAgent({
    requestId: 'req_sync1',
    threadId,
    userId,
    message: 'كم بقي بروتين اليوم؟',
    context: {
      today: { consumedProtein: 120, targetProtein: 160 }
    }
  }, checkpointer);

  assert.equal(res.status, 'success');
  assert.match(res.reply, /40/);
  cleanCheckpointer();
});

test('Scenario 13: Workout Sets Logging (عملت بنش بريس 80 كيلو 3 جولات 8 عدات)', async () => {
  const checkpointer = createFreshCheckpointer();
  const threadId = 'test_thread_workout_set';
  const userId = 'user_s13';

  const res = await executeLangGraphAgent({
    requestId: 'req_ws1',
    threadId,
    userId,
    message: 'عملت بنش بريس 80 كيلو 3 جولات 8 عدات',
    context: {
      workoutHistory: []
    }
  }, checkpointer);

  assert.equal(res.status, 'success');
  assert.equal(res.actions[0].tool, 'logWorkoutSets');
  assert.equal(res.actions[0].args.weightKg, 80);
  assert.equal(res.actions[0].args.sets, 3);
  assert.equal(res.actions[0].args.reps, 8);
  assert.equal(res.updatedState.workoutHistory.length, 1);
  cleanCheckpointer();
});

test('Scenario 14: Workout Completion (خلصت تمرين Push)', async () => {
  const checkpointer = createFreshCheckpointer();
  const threadId = 'test_thread_workout_done';
  const userId = 'user_s14';

  const res = await executeLangGraphAgent({
    requestId: 'req_wd1',
    threadId,
    userId,
    message: 'خلصت تمرين Push',
    context: {
      today: { isWorkoutCompleted: false }
    }
  }, checkpointer);

  assert.equal(res.status, 'success');
  assert.equal(res.actions[0].tool, 'completeWorkout');
  assert.equal(res.updatedState.today.isWorkoutCompleted, true);
  assert.ok(res.changedResources.includes('workout'));
  cleanCheckpointer();
});

test('Scenario 15: Undo Action (تراجع عن آخر عملية)', async () => {
  const checkpointer = createFreshCheckpointer();
  const threadId = 'test_thread_undo';
  const userId = 'user_s15';

  const res = await executeLangGraphAgent({
    requestId: 'req_un1',
    threadId,
    userId,
    message: 'تراجع عن آخر عملية',
    context: {}
  }, checkpointer);

  assert.equal(res.status, 'success');
  assert.equal(res.actions[0].tool, 'undoLastAction');
  cleanCheckpointer();
});
