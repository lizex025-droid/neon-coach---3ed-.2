import test from 'node:test';
import assert from 'node:assert/strict';
import { NeonCommandAgent } from '../src/services/neonCommandAgent.js';
import { SttAdapter } from '../src/services/voice/sttAdapter.js';
import { neonSoundService } from '../src/services/voice/neonSoundService.js';

test('text/voice share dispatch, duplicate finals and double submits execute once; no sound on failure', async () => {
  const calls = []; let complete;
  const agent = new NeonCommandAgent({ dispatch: command => { calls.push(command); return new Promise(resolve => { complete = resolve; }); } });
  let sounds = 0; const original = neonSoundService.playAcknowledgement; neonSoundService.playAcknowledgement = () => sounds++;
  try {
    agent.recording = { requestId: crypto.randomUUID(), submitted: false, cancelled: false };
    const id = agent.recording.requestId;
    agent.stt.onInterim('Log 500 ml of water'); assert.equal(calls.length, 0);
    const result = agent.finalizeVoice('Log 500 ml of water');
    await agent.finalizeVoice('Log 500 ml of water');
    agent.handleUserUtterance('Log 500 ml of water');
    assert.equal(calls.length, 1); assert.equal(calls[0].requestId, id); assert.equal(calls[0].inputSource, 'voice');
    assert.equal(sounds, 0);
    complete({ status: 'error', error: { message: 'Database unavailable' } }); await result; assert.equal(sounds, 0);
    const typed = agent.handleUserUtterance('Log 500 ml of water', { isVoice: false });
    assert.equal(calls[1].text, calls[0].text); assert.equal(calls[1].inputSource, 'text'); assert.notEqual(calls[1].requestId, id);
    complete({ status: 'success', results: [{ persisted: true, changedResources: ['water'] }], reply: 'Saved' }); await typed; assert.equal(sounds, 0);
    agent.recording = { requestId: crypto.randomUUID(), submitted: false, cancelled: false }; agent.stopVoiceSession(); await agent.finalizeVoice('Log 500 ml water'); assert.equal(calls.length, 2);
  } finally { neonSoundService.playAcknowledgement = original; }
});
test('SpeechRecognition submits only finalized segments on end, never interim/cancelled speech', () => {
  let recognition; const finals = [];
  class Recognition { constructor() { recognition = this; } start() {} abort() {} stop() { this.onend?.(); } }
  const adapter = new SttAdapter({ onFinal: text => finals.push(text) }); adapter.SpeechRecClass = Recognition;
  adapter.start(); const interim = Object.assign([{ transcript: 'Log 5' }], { isFinal: false });
  recognition.onresult({ results: [interim] }); assert.equal(finals.length, 0);
  const final = Object.assign([{ transcript: 'Log 500 ml water' }], { isFinal: true });
  recognition.onresult({ results: [final] }); recognition.onresult({ results: [final] }); assert.equal(finals.length, 0);
  const end = recognition.onend; end(); end(); assert.deepEqual(finals, ['Log 500 ml water']);
  adapter.start(); recognition.onresult({ results: [final] }); adapter.stop(); recognition.onend?.(); assert.equal(finals.length, 1);
});
