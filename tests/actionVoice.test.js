import test from 'node:test';
import assert from 'node:assert/strict';
import { createActionVoiceSession } from '../src/services/actionVoiceSession.js';

function mockHost() {
  const instances = [];
  class Recognition {
    constructor() { instances.push(this); }
    start() { this.onstart?.(); }
    abort() { this.aborted = true; this.onend?.(); }
    result(text, final = true) { const result = [{ transcript: text }]; result.isFinal = final; return this.onresult({ resultIndex: 0, results: [result] }); }
  }
  return { instances, host: { SpeechRecognition: Recognition } };
}

test('voice ignores interim text and duplicate finals and releases microphone on stop', async () => {
  const { host, instances } = mockHost();
  const commands = [], states = [];
  const voice = createActionVoiceSession({ host, onCommand: async text => { commands.push(text); return 'تم'; }, onStatus: state => states.push(state) });
  voice.start();
  assert.equal(voice.isActive(), true);
  const mic = instances[0];
  await mic.result('زود كاسة', false);
  assert.equal(commands.length, 0);
  await mic.result('زود كاسة مي');
  await mic.result('زود كاسة مي');
  assert.deepEqual(commands, ['زود كاسة مي']);
  assert.equal(mic.aborted, true);
  voice.stop();
  assert.equal(voice.isActive(), false);
  assert.equal(states.at(-1), 'off');
});

test('wake word gates execution and stop during a pending action prevents restart', async () => {
  const { host, instances } = mockHost();
  let resolve, calls = 0;
  const voice = createActionVoiceSession({ host, wakeWord: true, onCommand: () => { calls++; return new Promise(done => { resolve = done; }); } });
  voice.start();
  const action = instances[0].result('يا نيون زود كاسة مي');
  assert.equal(calls, 1);
  voice.stop();
  resolve('تم');
  await action;
  assert.equal(voice.isActive(), false);
  assert.equal(instances.length, 1);
});

test('denied permission and unsupported browsers leave no live session', () => {
  const { host, instances } = mockHost();
  const statuses = [];
  const voice = createActionVoiceSession({ host, onStatus: (_, text) => statuses.push(text) });
  voice.start();
  instances[0].onerror({ error: 'not-allowed' });
  assert.equal(voice.isActive(), false);
  assert.match(statuses.at(-1), /اسمح بالميكروفون/);
  const unsupported = createActionVoiceSession({ host: {}, onStatus: (_, text) => statuses.push(text) });
  unsupported.start();
  assert.equal(unsupported.isActive(), false);
  assert.match(statuses.at(-1), /غير مدعوم/);
});
