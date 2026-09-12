import test from 'node:test';
import assert from 'node:assert/strict';
import { EMPTY_INITIAL_STATE } from '../src/state/demoData.js';
import { localDate } from '../src/domain/actionAgent.js';

test('agent persistence, supplement mirrors, undo, rollback and chat lifetime', async () => {
  const data = new Map();
  let failingKey = null;
  globalThis.localStorage = {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => { if (key === failingKey) throw new Error('QuotaExceeded'); data.set(key, value); },
    removeItem: key => data.delete(key)
  };
  const { store } = await import('../src/state/store.js');
  const state = structuredClone(EMPTY_INITIAL_STATE);
  state.today.date = localDate();
  state.supplementsSchedule = [{ id: 'c', nameAr: 'كرياتين', schedule: { morning: { taken: false, time: null }, evening: { taken: false, time: null } } }];
  store.restoreState(state);
  let renders = 0;
  const unsubscribe = store.subscribe(() => renders++);
  store.saveAiChatMessage({ sender: 'user', text: 'أخذت الكرياتين' });
  assert.equal(renders, 0, 'saving chat must not destroy live voice/UI');
  store.executeAgentTools([{ name: 'take_supplement', args: { supplement: 'كرياتين' } }]);
  const supplementKey = 'daily_stack_taken_v2:' + store.getActiveDate();
  assert.ok(JSON.parse(data.get(supplementKey)).c);
  assert.equal(store.getState().supplementsSchedule[0].schedule.morning.taken, true);
  store.executeAgentTools([{ name: 'undo' }]);
  assert.deepEqual(JSON.parse(data.get(supplementKey)), {});
  assert.equal(store.getState().supplementsSchedule[0].schedule.morning.taken, false);
  assert.equal(store.getState().aiChatHistory.length, 1);
  const before = structuredClone(store.getState());
  failingKey = 'neon_coach_app_state_v1';
  assert.throws(() => store.executeAgentTools([{ name: 'take_supplement', args: { supplement: 'كرياتين' } }]), /تعذر حفظ/);
  assert.deepEqual(store.getState(), before);
  assert.deepEqual(JSON.parse(data.get(supplementKey)), {});
  failingKey = null;
  store.executeAgentTools([{ name: 'add_water', args: { amountMl: 250 } }]);
  const saved = JSON.parse(data.get('neon_coach_app_state_v1'));
  assert.equal(saved.today.consumedWaterLiters, .25);
  assert.equal(saved.actionHistory.length, 1);
  assert.equal(renders, 0);
  unsubscribe();
  delete globalThis.localStorage;
});
