import test from 'node:test';
import assert from 'node:assert/strict';
import { AuthService } from '../src/services/authService.js';
function fixture(overrides = {}) {
  const state = { auth: {}, userProfile: { onboardingCompleted: false } };
  const store = { getState: () => state, logoutUser() { state.auth = {}; state.userProfile = {}; }, loginUser(user) { state.auth = { user }; state.userProfile = { name: user.name }; } };
  const user = { id: 'account-a', email: 'a@example.invalid', email_confirmed_at: new Date().toISOString(), user_metadata: { name: 'Account A' }, app_metadata: {} };
  const session = { user, access_token: 'verified-test-token', expires_at: Date.now() / 1000 + 3600 };
  const client = { auth: {
    getUser: async () => ({ data: { user } }),
    signInWithPassword: async () => ({ data: { session } }),
    signUp: async () => ({ data: { user: { identities: [{ id: 'identity-a' }] }, session: null } }),
    signOut: async () => ({}), ...overrides,
  } };
  const sync = { loadUserData: async () => ({ success: true }), stop() {}, flush: async () => ({ success: true }) };
  return { auth: new AuthService(client, store, sync), state, client, user, session, sync };
}
test('rejects invalid credentials without creating a local account', async () => {
  const { auth } = fixture({ signInWithPassword: async () => ({ error: { code: 'invalid_credentials' } }) });
  assert.equal((await auth.loginWithEmail('a@example.invalid', 'incorrect')).success, false);
  assert.equal(auth.isAuthenticated(), false);
});
test('network failure fails closed and demo entry is disabled', async () => {
  const { auth } = fixture({ signInWithPassword: async () => { throw new Error('offline'); } });
  assert.equal((await auth.loginWithEmail('a@example.invalid', 'anything')).success, false);
  assert.equal((await auth.loginAsDemo()).success, false);
  assert.equal(auth.isAuthenticated(), false);
});
test('signup without a server session requires confirmation and does not authenticate', async () => {
  const { auth } = fixture();
  const result = await auth.signUpWithEmail('Account A', 'a@example.invalid', 'StrongTestPassword!');
  assert.equal(result.needsConfirmation, true);
  assert.equal(auth.isAuthenticated(), false);
});
test('existing signup has the same response as a new signup without manufacturing a token', async () => {
  const { auth } = fixture({ signUp: async () => ({ data: { user: { identities: [] }, session: null } }) });
  const fresh = fixture();
  assert.deepEqual(await auth.signUpWithEmail('Account A', 'a@example.invalid', 'StrongTestPassword!'),
    await fresh.auth.signUpWithEmail('Account B', 'b@example.invalid', 'StrongTestPassword!'));
  assert.equal(auth.isAuthenticated(), false);
});
test('verifies the server user and preserves exact password bytes', async () => {
  const { auth, session, client } = fixture();
  let received;
  client.auth.signInWithPassword = async credentials => { received = credentials; return { data: { session } }; };
  assert.equal((await auth.loginWithEmail(' A@example.invalid ', ' with spaces ')).success, true);
  assert.equal(received.password, ' with spaces ');
  assert.equal(received.email, 'a@example.invalid');
  assert.equal(auth.isAuthenticated(), true);
  await auth.logout();
  assert.equal(auth.getCurrentUser(), null);
});
test('rejects forged, expired, anonymous and unconfirmed sessions', async () => {
  const { auth, client, session, user } = fixture();
  await assert.rejects(auth.acceptSession({ ...session, access_token: '' }));
  client.auth.getUser = async () => ({ error: { message: 'forged' } });
  await assert.rejects(auth.acceptSession(session));
  client.auth.getUser = async () => ({ data: { user: { ...user, is_anonymous: true } } });
  await assert.rejects(auth.acceptSession(session));
  client.auth.getUser = async () => ({ data: { user: { ...user, email_confirmed_at: null } } });
  await assert.rejects(auth.acceptSession(session));
  auth.currentSession = { expiresAt: Date.now() - 1 };
  assert.equal(auth.isAuthenticated(), false);
});
test('late hydration after sign out cannot restore the previous account', async () => {
  const { auth, sync, session } = fixture();
  let release;
  sync.loadUserData = () => new Promise(resolve => { release = resolve; });
  const pending = auth.acceptSession(session);
  await new Promise(resolve => setImmediate(resolve));
  auth.clearSession(); release({ success: true });
  await assert.rejects(pending);
  assert.equal(auth.isAuthenticated(), false);
});

test('logout waits for server revocation and targets the current session', async () => {
  const { auth, client } = fixture();
  await auth.loginWithEmail('a@example.invalid', 'password');
  let release;
  client.auth.signOut = options => {
    assert.deepEqual(options, { scope: 'local' });
    return new Promise(resolve => { release = resolve; });
  };
  const pending = auth.logout();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(auth.isAuthenticated(), true);
  release({ error: null });
  assert.equal((await pending).success, true);
  assert.equal(auth.isAuthenticated(), false);
});

test('logout never reports success when server revocation fails', async () => {
  for (const signOut of [async () => ({ error: { message: 'network' } }), async () => { throw new Error('offline'); }]) {
    const { auth } = fixture({ signOut });
    await auth.loginWithEmail('a@example.invalid', 'password');
    assert.equal((await auth.logout()).success, false);
  }
});

test('login does not distinguish absent, unconfirmed, banned or incorrect-password accounts', async () => {
  const results = [];
  for (const code of ['invalid_credentials', 'email_not_confirmed', 'user_not_found', 'user_banned']) {
    const { auth } = fixture({ signInWithPassword: async () => ({ error: { code } }) });
    results.push(await auth.loginWithEmail('test@example.invalid', 'password'));
  }
  for (const result of results) assert.deepEqual(result, results[0]);
});

test('signup does not expose duplicate-account or account-specific delivery errors', async () => {
  const expected = await fixture().auth.signUpWithEmail('Test Name', 'test@example.invalid', 'StrongTestPassword!');
  for (const code of ['user_already_exists', 'email_exists', 'over_email_send_rate_limit', 'email_address_not_authorized']) {
    const { auth } = fixture({ signUp: async () => ({ error: { code } }) });
    assert.deepEqual(await auth.signUpWithEmail('Test Name', 'test@example.invalid', 'StrongTestPassword!'), expected);
  }
});

test('password reset has the same response for known, unknown and delivery-failed emails', async () => {
  const results = [];
  for (const error of [null, { code: 'user_not_found' }, { code: 'over_email_send_rate_limit' }, { code: 'email_address_not_authorized' }]) {
    const { auth } = fixture({ resetPasswordForEmail: async () => ({ error }) });
    results.push(await auth.resetPassword('test@example.invalid'));
  }
  for (const result of results) assert.deepEqual(result, results[0]);
});
