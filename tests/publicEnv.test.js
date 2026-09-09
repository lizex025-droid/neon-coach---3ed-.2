import test from 'node:test';
import assert from 'node:assert/strict';
import { isPublicSupabaseKey, validatePublicEnvironment } from '../src/utils/publicEnv.js';
const jwt = role => `e30.${Buffer.from(JSON.stringify({ role })).toString('base64url')}.signature`;
test('accepts public Supabase keys and rejects privileged or malformed keys', () => {
  assert.equal(isPublicSupabaseKey('sb_publishable_publicexample'), true);
  assert.equal(isPublicSupabaseKey(jwt('anon')), true);
  for (const key of [jwt('service_role'), jwt('authenticated'), 'sb_secret_privateexample', 'malformed', undefined]) assert.equal(isPublicSupabaseKey(key), false);
});
test('build refuses browser secrets without printing their values', () => {
  for (const name of ['VITE_OPENAI_API_KEY', 'NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY', 'VITE_SUPABASE_ANON_KEY']) {
    const secret = 'sb_secret_NEVER_PRINT_THIS';
    assert.throws(() => validatePublicEnvironment({ [name]: secret }), error => error.message.includes(name) && !error.message.includes(secret));
  }
  assert.doesNotThrow(() => validatePublicEnvironment({ VITE_SUPABASE_ANON_KEY: jwt('anon'), OPENAI_API_KEY: 'server-only' }));
});
