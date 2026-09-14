import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { MemorySaver } from '@langchain/langgraph';
import { testDatabase } from './helpers/neonTestDb.js';
import { runCommand } from '../api/langgraph/runtime.js';
import { normalizeInput, localDate } from '../api/langgraph/contracts.js';
import { requireLocalConfig } from '../api/langgraph/localBackend.js';
import { understandWithGemini } from '../api/langgraph/provider.js';
import { PGlite } from '@electric-sql/pglite';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { pglitePool } from './helpers/neonTestDb.js';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const plan = (tool, args, extra = {}) => ({ intent: tool.startsWith('get') || tool === 'searchFoods' ? 'read' : 'write', pendingDisposition: 'none', pendingId: null, question: null, reply: null, actions: [{ tool, args }], ...extra });
function runner(env, { user = env.alice, model, compose, checkpointer } = {}) {
  const threadId = randomUUID();
  return (text, extra = {}) => runCommand({ text, requestId: randomUUID(), threadId, inputSource: 'text', ...extra }, { repo: env.repo(user), authenticate: async () => user, model, compose, checkpointer: checkpointer || new MemorySaver() });
}
test('normalizes Arabic/Persian numerals and local timezone dates', () => {
  assert.equal(normalizeInput('٧٩٫٩ ۷۹,۵'), '79.9 79.5');
  assert.equal(localDate('Asia/Amman', new Date('2026-09-12T22:30:00Z')), '2026-09-13');
  assert.throws(() => requireLocalConfig({ NEON_DATABASE_URL: 'postgres://production.example/db', SUPABASE_URL: 'http://127.0.0.1:54321', SUPABASE_ANON_KEY: 'test' }), /loopback/);
});
test('backend snapshot returns previous daily totals without mixing them into today', async t => {
  const env = await testDatabase(); t.after(() => env.close());
  const repo = env.repo(env.alice);
  await repo.transaction(async () => {
    await repo.loadContext();
    const previous = new Date(`${repo.today}T12:00:00Z`);
    previous.setUTCDate(previous.getUTCDate() - 1);
    const date = previous.toISOString().slice(0, 10);
    await repo.insert('meal_logs', { date, name: 'Previous meal', meal_type: 'lunch', items: [], calories: 650, protein: 55, carbs: 60, fats: 20 });
    await repo.insert('water_logs', { date, consumed_ml: 1750, consumed_glasses: 7, target_glasses: 10 });
    await repo.insert('workout_logs', { date, workout_title: 'Previous workout', exercises: [], completed: true });
    const snapshot = await repo.snapshot();
    const archived = snapshot.dailyHistory.find(item => item.date === date);
    assert.ok(archived);
    assert.equal(archived.calories, 650);
    assert.equal(archived.protein, 55);
    assert.equal(archived.consumedWaterLiters, 1.8);
    assert.equal(archived.workoutCompleted, true);
    assert.equal(snapshot.today.consumedCalories, 0);
    assert.equal(snapshot.today.consumedWaterLiters, 0);
  });
});
test('isolated PostgreSQL: writes, readback, idempotency, meal confirmation and RLS', async t => {
  const env = await testDatabase(); t.after(() => env.close());
  const water = runner(env, { model: async () => plan('logWater', { amountMl: 500 }) });
  const requestId = randomUUID();
  const a = await water('Log 500 ml of water.', { requestId });
  assert.equal(a.status, 'success', JSON.stringify(a)); assert.equal(a.results[0].persisted, true); assert.equal(a.cards[0].todayTotalMl, 500);
  const retry = await water('Log 500 ml of water.', { requestId }); assert.equal(retry.results[0].recordId, a.results[0].recordId);
  assert.equal((await water('Log 500 ml of water.')).cards[0].todayTotalMl, 1000);
  const conflicting = await water('Different text', { requestId }); assert.equal(conflicting.error.code, 'IDEMPOTENCY_CONFLICT');
  const weight = runner(env, { model: async () => plan('logWeight', { weightKg: 79.9 }) });
  const w = await weight('My weight today is 79.9 kg.'); assert.equal(w.updatedState.userProfile.currentWeight, 79.9);
  const meals = runner(env, { model: async () => plan('addMeal', { mealType: 'lunch', items: [{ foodName: 'Grilled Chicken Breast', grams: 200, basis: 'cooked' }, { foodName: 'White Rice (Cooked)', grams: 150, basis: 'cooked' }] }) });
  const draft = await meals('Log chicken and rice.'); assert.equal(draft.status, 'clarification', JSON.stringify(draft)); assert.equal(draft.cards[0].type, 'meal_draft');
  assert.equal((await env.db.query('SELECT count(*)::int AS n FROM meal_logs')).rows[0].n, 0);
  const restored = await meals('', { restore: true }); assert.equal(restored.clarification.id, draft.clarification.id);
  const confirmationId = randomUUID();
  const confirmation = {
    pendingId: draft.clarification.id,
    accept: true,
    mealType: 'lunch',
    items: [
      { foodName: 'Grilled Chicken Breast', grams: 250, basis: 'cooked' },
      { foodName: 'Boiled Potatoes', grams: 150, basis: 'cooked' }
    ]
  };
  const saved = await meals('', { requestId: confirmationId, confirmation });
  assert.equal(saved.status, 'success', JSON.stringify(saved)); assert.equal(saved.results[0].data.items.length, 2);
  assert.deepEqual(saved.results[0].data.items.map(item => item.grams), [250, 150]);
  assert.match(saved.results[0].data.items[1].nameEn, /Potato/i);
  assert.ok(saved.results[0].data.protein >= 60);
  await meals('', { requestId: confirmationId, confirmation });
  assert.equal((await env.db.query('SELECT count(*)::int AS n FROM meal_logs')).rows[0].n, 1);
  const edit = runner(env, { model: async () => plan('updateMeal', { recordId: saved.results[0].recordId, itemIndex: 0, grams: 150 }) });
  const edited = await edit('Change chicken to 150 g'); assert.equal(edited.results[0].data.items[1].grams, 150); assert.equal(edited.results[0].data.items[0].grams, 150);
  const query = runner(env, { model: async () => plan('getDailyNutritionSummary', {}) });
  const summary = await query('How much protein left?'); assert.equal(summary.results[0].data.protein, Number(edited.results[0].data.protein)); assert.equal(summary.changedResources.length, 0);
  const foreign = runner(env, { user: env.bob, model: async () => plan('updateMeal', { recordId: saved.results[0].recordId, itemIndex: 0, grams: 10 }) });
  assert.equal((await foreign('edit')).error.code, 'NOT_FOUND');
  assert.equal((await foreign('thread', { threadId: a.threadId })).error.code, 'THREAD_FORBIDDEN');
  const bobRepo = env.repo(env.bob);
  await bobRepo.transaction(async () => {
    assert.equal(await bobRepo.request(requestId), null);
    assert.equal((await env.client.query('SELECT * FROM public.meal_logs')).rows.length, 0);
    await assert.rejects(() => bobRepo.get('inbody_records', w.results[0].recordId));
  });
  await env.client.query('SET ROLE authenticated');
  await assert.rejects(() => env.client.query("UPDATE public.neon_requests SET response='{}'"), /permission denied/);
  await env.client.query('RESET ROLE');
});
test('transaction rollback, provider failure, deterministic response fallback, read-only and cancellation', async t => {
  const env = await testDatabase(); t.after(() => env.close());
  const failure = runner(env, { model: async () => { throw new Error('secret provider failure'); } });
  const failed = await failure('log'); assert.equal(failed.status, 'error'); assert.ok(!JSON.stringify(failed).includes('secret'));
  const fallback = runner(env, { model: async () => plan('logWater', { amountMl: 500 }), compose: async () => { throw new Error('compose'); } });
  const saved = await fallback('water'); assert.equal(saved.status, 'success'); assert.equal(saved.cards[0].todayTotalMl, 500);
  const multi = runner(env, { model: async () => ({ ...plan('logWater', { amountMl: 15000 }), actions: [{ tool: 'logWater', args: { amountMl: 15000 } }, { tool: 'logWater', args: { amountMl: 15000 } }] }) });
  assert.equal((await multi('too much')).status, 'error');
  assert.equal((await env.db.query('SELECT consumed_ml FROM water_logs')).rows[0].consumed_ml, 500);
  const translate = runner(env, { model: async () => ({ ...plan('logWater', {}), intent: 'translation', actions: [], reply: 'شربت 500 مل ماء.' }) });
  const translation = await translate('Translate: I drank 500 ml of water.'); assert.equal(translation.actions.length, 0); assert.equal(translation.status, 'success');
  const unsafe = runner(env, { model: async () => ({ ...plan('logWater', { amountMl: 500 }), intent: 'question' }) });
  assert.equal((await unsafe('How do I log water?')).status, 'error');
  const meal = runner(env, { model: async () => plan('addMeal', { items: [{ foodName: 'Grilled Chicken Breast', grams: 200, basis: 'cooked' }] }) });
  const draft = await meal('food'); const cancelled = await meal('', { confirmation: { pendingId: draft.clarification.id, accept: false } }); assert.equal(cancelled.status, 'success');
  assert.equal((await env.db.query('SELECT count(*)::int AS n FROM meal_logs')).rows[0].n, 0);
});
test('provider protocol errors are structured and never treated as done', async () => {
  await assert.rejects(() => understandWithGemini({}, { apiKey: '' }), e => e.code === 'PROVIDER_NOT_CONFIGURED');
  const context = { currentDate: '2026-09-13', timezone: 'Asia/Amman', loggedMeals: [], weightHistory: [], workoutHistory: [], shoppingList: [] };
  await assert.rejects(() => understandWithGemini({ context, messages: [] }, { apiKey: 'synthetic', fetchImpl: async () => ({ ok: false }) }), e => e.code === 'PROVIDER_UNAVAILABLE');
});

test('persistent PostgresSaver survives database reopen; pending completion and stale confirmation', async t => {
  const env = await testDatabase(); t.after(() => env.close());
  const directory = await mkdtemp(join(tmpdir(), 'neon-checkpoint-test-'));
  let checkpointDb = new PGlite(directory);
  let saver = new PostgresSaver(pglitePool(checkpointDb), undefined, { schema: 'neon_checkpoints' }); await saver.setup();
  const threadId = randomUUID(), requestId = randomUUID();
  const initial = runner(env, { checkpointer: saver, model: async () => ({ ...plan('addMeal', {}), intent: 'clarification', actions: [], question: 'How many grams, raw or cooked?' }) });
  const pending = await initial('Log chicken for lunch.', { threadId, requestId });
  assert.equal(pending.status, 'clarification', JSON.stringify(pending));
  await checkpointDb.close(); checkpointDb = new PGlite(directory);
  saver = new PostgresSaver(pglitePool(checkpointDb), undefined, { schema: 'neon_checkpoints' });
  t.after(() => checkpointDb.close());
  const checkpoint = await saver.getTuple({ configurable: { thread_id: `${env.alice}:${threadId}:${requestId}` } });
  assert.equal(checkpoint.checkpoint.channel_values.pending.id, pending.clarification.id);
  const resume = runner(env, { checkpointer: saver, model: async s => plan('addMeal', { mealType: 'lunch', items: [{ foodName: 'Grilled Chicken Breast', grams: 200, basis: 'cooked' }] }, { pendingDisposition: 'complete', pendingId: s.pending.id }) });
  const draft = await resume('200 grams, cooked.', { threadId, clarificationId: pending.clarification.id });
  assert.equal(draft.status, 'clarification'); assert.equal(draft.cards[0].type, 'meal_draft');
  const saved = await resume('', { threadId, confirmation: { pendingId: draft.clarification.id, accept: true } }); assert.equal(saved.status, 'success', JSON.stringify(saved));
  const stale = await resume('', { threadId, confirmation: { pendingId: draft.clarification.id, accept: true } }); assert.equal(stale.error.code, 'STALE_CONFIRMATION');
  const undo = runner(env, { model: async () => plan('undoLastAction', {}) }); const undone = await undo('Undo last action'); assert.equal(undone.status, 'success', JSON.stringify(undone));
  assert.equal((await env.db.query('SELECT count(*)::int AS n FROM meal_logs')).rows[0].n, 0);
});
