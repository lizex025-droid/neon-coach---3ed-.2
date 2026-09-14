import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { testDatabase } from '../tests/helpers/neonTestDb.js';
import { runCommand } from '../api/langgraph/runtime.js';
import { createServer } from 'vite';

// Real browser/dispatcher/graph/SQL; synthetic session, scripted model and intercepted API transport.
const server = await createServer({ mode: 'neon', server: { host: '127.0.0.1', port: 3000, strictPort: true, watch: null } });
await server.listen();
const env = await testDatabase();
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage(); const errors = [], calls = [];
page.on('pageerror', e => errors.push(e.message));
const plan = (tool, args) => ({ intent: 'write', pendingDisposition: 'none', pendingId: null, question: null, reply: null, actions: [{ tool, args }] });
let queue = Promise.resolve();
await context.route('**/api/action-agent', route => {
  const command = route.request().postDataJSON(); calls.push(command);
  queue = queue.then(async () => {
    const response = await runCommand(command, { repo: env.repo(env.alice), authenticate: async () => env.alice,
      model: async s => s.normalizedText.includes('chicken') ? plan('addMeal', { mealType: 'lunch', items: [{ foodName: 'Grilled Chicken Breast', grams: 200, basis: 'cooked' }, { foodName: 'White Rice (Cooked)', grams: 150, basis: 'cooked' }] }) : plan('logWater', { amountMl: 500 }) });
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(response) });
  });
  return queue;
});
async function prepare() {
  await page.goto('http://127.0.0.1:3000/');
  await page.evaluate(async userId => {
    const { supabase } = await import('/src/services/supabaseClient.js');
    supabase.auth.getSession = async () => ({ data: { session: { user: { id: userId }, access_token: 'synthetic-browser-test' } } });
    const { store } = await import('/src/state/store.js');
    store.setState({ userProfile: { ...store.getState().userProfile, onboardingCompleted: true }, auth: { isAuthenticated: true, user: { id: userId } } }, { notify: false });
    location.hash = 'neon-ai';
  }, env.alice);
  await page.locator('#neon-ai-text-input').waitFor({ timeout: 20000 });
}
try {
  await prepare();
  await page.locator('#neon-ai-text-input').fill('Log 500 ml of water.');
  await page.locator('#neon-ai-send-btn').click();
  await page.getByText('الكمية: 500 مل · الإجمالي: 500 مل', { exact: true }).first().waitFor();
  assert.equal((await env.db.query('SELECT consumed_ml FROM water_logs')).rows[0].consumed_ml, 500);
  await page.screenshot({ path: 'scratch/neon-water-desktop.png', fullPage: true });
  await page.evaluate(async () => {
    const { neonActionAgent } = await import('/src/services/neonActionAgent.js');
    neonActionAgent.recording = { requestId: crypto.randomUUID(), submitted: false, cancelled: false };
    neonActionAgent.stt.onInterim('Log 500 ml of water.');
  });
  assert.equal((await env.db.query('SELECT consumed_ml FROM water_logs')).rows[0].consumed_ml, 500);
  await page.evaluate(async () => {
    const { neonActionAgent } = await import('/src/services/neonActionAgent.js');
    await Promise.all([neonActionAgent.finalizeVoice('Log 500 ml of water.'), neonActionAgent.finalizeVoice('Log 500 ml of water.')]);
  });
  assert.equal((await env.db.query('SELECT consumed_ml FROM water_logs')).rows[0].consumed_ml, 1000);
  assert.deepEqual(calls.filter(c => c.text === 'Log 500 ml of water.').map(c => c.inputSource), ['text', 'voice']);
  await page.locator('#neon-ai-text-input').fill('I ate chicken and rice.'); await page.locator('#neon-ai-send-btn').click();
  await page.getByRole('button', { name: 'إضافة إلى التغذية', exact: true }).first().waitFor();
  assert.equal((await env.db.query('SELECT count(*)::int AS n FROM meal_logs')).rows[0].n, 0);
  await prepare(); // Reopens page with persisted thread; no in-process conversational state.
  const confirm = page.getByRole('button', { name: 'إضافة إلى التغذية', exact: true }).first(); await confirm.waitFor(); await confirm.click();
  await page.getByText(/تم حفظ الوجبة:/).first().waitFor();
  assert.equal((await env.db.query('SELECT count(*)::int AS n FROM meal_logs')).rows[0].n, 1);
  await page.setViewportSize({ width: 390, height: 844 }); await page.screenshot({ path: 'scratch/neon-meal-mobile.png', fullPage: true });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), 'No mobile horizontal overflow');
  await page.setViewportSize({ width: 820, height: 1180 }); await page.screenshot({ path: 'scratch/neon-meal-tablet.png', fullPage: true });
  await page.evaluate(() => { location.hash = 'nutrition'; }); await page.locator('#view-container').getByText(/دجاج/).first().waitFor();
  await page.screenshot({ path: 'scratch/neon-nutrition-persisted.png', fullPage: true });
  await prepare();
  assert.equal(await page.evaluate(async () => (await import('/src/state/store.js')).store.getState().loggedMeals.length), 1);
  await context.unroute('**/api/action-agent');
  const denied = await page.request.post('http://127.0.0.1:3000/api/action-agent', { data: { text: 'Log 500 ml water', requestId: crypto.randomUUID(), threadId: crypto.randomUUID() } });
  assert.equal(denied.status(), 401);
  await page.evaluate(async () => { const { supabase } = await import('/src/services/supabaseClient.js'); supabase.auth.getSession = async () => ({ data: { session: null } }); });
  await page.locator('#neon-ai-text-input').fill('Log 500 ml of water.'); await page.locator('#neon-ai-send-btn').click();
  await page.getByText(/تم تسجيل 500 مل/).first().waitFor();
  await page.screenshot({ path: 'scratch/neon-auth-required.png', fullPage: true });
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ pass: true, textAndVoice: true, interimNoWrite: true, duplicateFinalPrevented: true, pendingRestored: true, confirmedMealCount: 1, refreshedRecords: true, mobileTabletDesktop: true, unauthenticatedApiRejected: true, guestAiFallbackWorks: true, pageErrors: errors, apiCalls: calls.length }));
} catch (e) {
  await page.screenshot({ path: 'scratch/neon-browser-failure.png', fullPage: true });
  console.error(e); process.exitCode = 1;
} finally { await fs.writeFile('scratch/neon-browser-calls.json', JSON.stringify(calls.map(c => ({ requestId: c.requestId, inputSource: c.inputSource, restore: c.restore, confirmation: !!c.confirmation })), null, 2)); await browser.close(); await env.close(); await server.close(); }
