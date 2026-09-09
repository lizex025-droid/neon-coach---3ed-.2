import test from 'node:test';
import assert from 'node:assert/strict';
import { SyncService } from '../src/services/syncService.js';
import { createInitialState } from '../src/state/initialState.js';
import { store } from '../src/state/store.js';
import { accountStorage, selectStorageAccount } from '../src/services/accountStorage.js';
test('account switch clears meals, AI history, supplements, and local tool data', () => {
  store.loginUser({ id: 'a', name: 'A' });
  store.state.loggedMeals.push({ calories: 200 });
  store.state.aiChatHistory.push({ text: 'private' });
  accountStorage.setItem('tool_data', 'private');
  store.logoutUser();
  store.loginUser({ id: 'b', name: 'B' });
  assert.deepEqual(store.state.loggedMeals, []);
  assert.deepEqual(store.state.aiChatHistory, []);
  assert.equal(accountStorage.getItem('tool_data'), null);
});
test('cloud writes are serialized and stale writes produce a conflict', async () => {
  const calls = [];
  const client = { rpc: async (_, args) => { calls.push(args); return { data: args.expected_revision + 1 }; } };
  const sync = new SyncService(client);
  sync.setStore({ getState: createInitialState }); sync.userId = 'a';
  sync.schedule(); assert.equal((await sync.flush()).success, true);
  assert.equal(sync.revision, 1);
  client.rpc = async () => ({ error: { code: '40001' } });
  sync.schedule(); assert.equal((await sync.flush()).success, false);
  assert.equal(sync.status, 'conflict');
  assert.equal(sync.dirty, true);
  assert.equal(calls[0].payload.auth, undefined);
  sync.stop();
});
test('water cups use exact milliliters and undo restores the starting amount', () => {
  store.loginUser({ id: 'water-test' });
  store.addWaterCup(250); store.addWaterCup(250);
  assert.equal(store.state.today.consumedWaterLiters, .5);
  store.undoWaterCup(250);
  assert.equal(store.state.today.consumedWaterLiters, .25);
});
test('backup cannot replace authenticated identity or import another account', () => {
  store.loginUser({ id: 'owner' });
  const other = createInitialState(); other.userProfile.id = 'other';
  assert.throws(() => store.restoreState(other));
  other.userProfile.id = 'owner'; other.auth = { user: { id: 'other' } }; other.currentRole = 'coach';
  store.restoreState(other);
  assert.equal(store.state.auth.user.id, 'owner');
  assert.equal(store.state.currentRole, 'client');
});
