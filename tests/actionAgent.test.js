import test from 'node:test';
import assert from 'node:assert/strict';
import { EMPTY_INITIAL_STATE } from '../src/state/demoData.js';
import { executeActionTools, parseActionCommand, localDate, todaySnapshot } from '../src/domain/actionAgent.js';
import { interpretAction } from '../src/services/actionAssistant.js';

const now = new Date(2026, 8, 12, 12);
const options = { now, createId: (() => { let id = 0; return () => `record-${++id}`; })() };
function fixture() {
  const state = structuredClone(EMPTY_INITIAL_STATE);
  state.today.date = localDate(now);
  state.supplementsSchedule = [{ id: 'creatine', nameAr: 'Creatine / كرياتين', schedule: { morning: { taken: false, time: null }, evening: { taken: false, time: null } } }];
  state.actionSupplementTaken = {};
  state.shoppingItems = [];
  return state;
}
function run(state, text) {
  const plan = parseActionCommand(text);
  assert.ok(plan?.tools, `Expected a tool for: ${text}, got ${JSON.stringify(plan)}`);
  return executeActionTools(state, plan.tools, options);
}

test('all requested NEON commands affect real logs and summary reads them', () => {
  let state = fixture();
  state = run(state, 'أكلت 250 غ دجاج و200 غ رز').state;
  assert.equal(state.loggedMeals.length, 1);
  assert.equal(state.loggedMeals[0].items.length, 2);
  assert.equal(state.today.consumedCalories, 672.5);
  assert.equal(state.today.consumedProtein, 82.9);
  state = run(state, 'زود كاسة مي').state;
  assert.equal(state.today.consumedWaterLiters, .25);
  assert.equal(state.today.consumedGlasses, 1);
  assert.equal(state.waterLogs[0].amountMl, 250);
  state = run(state, 'أخذت الكرياتين').state;
  assert.equal(state.supplementsSchedule[0].schedule.morning.taken, true);
  assert.equal(state.actionSupplementTaken.creatine, now.getTime());
  state = run(state, 'عملت bench 80 كيلو 8 reps').state;
  assert.equal(state.exerciseSetLogs[0].weight, 80);
  assert.equal(state.personalRecords['flat-barbell-bench-press'].reps, 8);
  state = run(state, 'خلصت تمرين Push').state;
  assert.equal(state.today.isWorkoutCompleted, true);
  assert.equal(state.workoutHistory[0].totalVolumeKg, 640);
  assert.equal(state.workoutHistory[0].totalSets, 1);
  state = run(state, 'وزني اليوم 79.4').state;
  assert.equal(state.userProfile.currentWeight, 79.4);
  assert.equal(state.progressReport.currentDay.weight, 79.4);
  assert.match(run(state, 'شو باقيلي بروتين؟').reply, /67.1 غ/);
  state = run(state, 'ضيف بيض وحليب لقائمة المشتريات').state;
  assert.deepEqual(state.shoppingItems.map(item => item.name), ['بيض', 'حليب']);
  state = run(state, 'شيل الحليب').state;
  assert.deepEqual(state.shoppingItems.map(item => item.name), ['بيض']);
  assert.match(run(state, 'شو عندي اليوم؟').reply, /250 \/ 2500 مل/);
  state = run(state, 'خلّي التمرين أهم شي اليوم').state;
  assert.equal(state.today.actionOrder[0], 'workout');
  state = run(state, 'رجع آخر شغلة عملتها').state;
  assert.equal(state.today.actionOrder, undefined);
  assert.equal(run(state, 'نيون وقف استماع').stopListening, true);
});

test('undo restores linked records while retaining unrelated later edits and chat', () => {
  const original = fixture();
  let state = run(original, 'عملت bench 80 كيلو 8 reps').state;
  state.userProfile.name = 'New name';
  state.aiChatHistory.push({ text: 'Keep this message' });
  state = run(state, 'تراجع').state;
  assert.equal(state.exerciseSetLogs, undefined);
  assert.equal(state.personalRecords, undefined);
  assert.equal(state.progressReport.currentDay.benchPressKg, null);
  assert.equal(state.userProfile.name, 'New name');
  assert.equal(state.aiChatHistory.length, 1);
});

test('undo refuses to overwrite later manual edits to the same record', () => {
  const state = run(fixture(), 'وزني اليوم 79.4').state;
  state.userProfile.currentWeight = 78;
  assert.throws(() => run(state, 'تراجع'), /تغير هذا السجل/);
  assert.equal(state.userProfile.currentWeight, 78);
});

test('supplements and workout completion are idempotent', () => {
  let state = run(fixture(), 'أخذت الكرياتين').state;
  const again = run(state, 'أخذت الكرياتين');
  assert.equal(again.changed, false);
  assert.equal(again.state.actionHistory.length, 1);
  state = run(state, 'خلصت تمرين Push').state;
  const duplicate = run(state, 'خلصت تمرين Push');
  assert.equal(duplicate.changed, false);
  assert.equal(duplicate.state.workoutHistory.length, 1);
  assert.equal(duplicate.state.workoutHistory[0].totalSets, 0);
  assert.equal(duplicate.state.workoutHistory[0].totalVolumeKg, 0);
});

test('PR keeps stronger sets and advances reps at equal weight', () => {
  let state = run(fixture(), 'عملت bench 80 كيلو 8 reps').state;
  state = run(state, 'عملت bench 70 كيلو 12 reps').state;
  assert.equal(state.personalRecords['flat-barbell-bench-press'].weight, 80);
  state = run(state, 'عملت bench 80 كيلو 10 reps').state;
  assert.equal(state.personalRecords['flat-barbell-bench-press'].reps, 10);
  state = run(state, 'تراجع').state;
  assert.equal(state.personalRecords['flat-barbell-bench-press'].reps, 8);
});

test('Arabic digits, exact quantities, unknown foods and ambiguities', () => {
  assert.equal(run(fixture(), 'وزني اليوم ٧٩٫٤').state.userProfile.currentWeight, 79.4);
  assert.equal(parseActionCommand('أكلت دجاج').tools, undefined);
  assert.equal(parseActionCommand('أكلت 250 غ دجاج و200 غ طعام مجهول').tools, undefined);
  assert.equal(parseActionCommand('أكلت 200 غ رز نيء').tools, undefined);
  const state = fixture();
  state.shoppingItems = [{ name: 'حليب كامل' }, { name: 'حليب خالي' }];
  assert.throws(() => run(state, 'شيل الحليب'), /لم أحدد/);
  assert.equal(parseActionCommand('لا تضيف حليب للمشتريات'), null);
  assert.equal(parseActionCommand('بدي أتمرن Push بكرة'), null);
});

test('restricted tools reject arbitrary fields, invalid values and atomic batch failures', () => {
  const state = fixture(), before = structuredClone(state);
  assert.throws(() => executeActionTools(state, [{ name: 'set_state', args: { auth: {} } }], options), /غير مسموحة/);
  assert.throws(() => executeActionTools(state, [{ name: 'add_water', args: { amountMl: 250, userId: 'other' } }], options), /غير مسموحة/);
  assert.throws(() => executeActionTools(state, [{ name: 'add_water', args: { amountMl: 250 } }, { name: 'log_weight', args: { weightKg: -1 } }], options), /غير صالح/);
  assert.throws(() => executeActionTools(state, [{ name: 'log_set', args: { exercise: 'bench', weightKg: 80, reps: 8.5 } }], options), /صحيح/);
  assert.deepEqual(state, before);
});

test('current-day queries exclude old meals and water; new actions preserve past logs', () => {
  let state = fixture();
  state.today.date = '2026-09-11';
  state.today.consumedWaterLiters = 2;
  state.loggedMeals = [{ id: 'old', calories: 500, protein: 50, carbs: 40, fats: 10 }];
  const read = run(state, 'شو باقيلي بروتين؟');
  assert.match(read.reply, /150 غ/);
  assert.equal(read.changed, false);
  assert.equal(todaySnapshot(state, now).waterMl, 0);
  state = run(state, 'أكلت 100 غ دجاج').state;
  assert.equal(state.loggedMeals.length, 2);
  assert.equal(state.loggedMeals[0].date, '2026-09-11');
  assert.equal(state.today.consumedProtein, 31);
});

test('AI transport sends restricted context and rejects unknown tools / malformed output', async () => {
  let payload;
  const args = { apiKey: 'fake-key', model: 'gemini-test', fetchImpl: async (_, options) => { payload = JSON.parse(options.body); return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify({ tools: [{ name: 'add_water', args: { amountMl: 250 } }] }) }] } }] }) }; } };
  const state = fixture(); state.auth.token = 'must-not-send';
  const result = await interpretAction('ضيفلي كاسة مي لو سمحت', state, args);
  assert.equal(result.tools[0].name, 'add_water');
  assert.ok(!JSON.stringify(payload).includes('must-not-send'));
  args.fetchImpl = async () => ({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: '{"tools":[{"name":"delete_user"}]}' }] } }] }) });
  await assert.rejects(() => interpretAction('ضيفلي كاسة مي', state, args), /غير مسموحة/);
});

test('general coaching and hypothetical requests bypass the action provider', async () => {
  const fetchImpl = () => { throw new Error('Should not call AI action API'); };
  assert.equal(await interpretAction('كيف أزيد قوتي؟', fixture(), { fetchImpl }), null);
  assert.equal(await interpretAction('لو أكلت دجاج كم بروتين فيه؟', fixture(), { fetchImpl }), null);
  const result = await interpretAction('زود كاسة مي', fixture(), { fetchImpl });
  assert.equal(result.tools[0].name, 'add_water');
});
