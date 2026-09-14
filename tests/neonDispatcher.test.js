import test from 'node:test';
import assert from 'node:assert/strict';
import { NeonCommandAgent, createAiFallbackDispatch } from '../src/services/neonCommandAgent.js';
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

test('AI chat remains available when the authenticated action backend is unavailable', async () => {
  const calls = [];
  const dispatch = createAiFallbackDispatch({
    actionDispatch: async () => { throw new Error('No cloud session'); },
    chat: async (text, context, history) => {
      calls.push({ text, context, history: [...history] });
      return { success: true, reply: 'AI response', provider: 'Google Gemini' };
    },
    getState: () => ({ today: { consumedCalories: 500 } }),
  });

  const first = await dispatch({ requestId: 'request-1', text: 'كيف أتمرن اليوم؟' });
  const second = await dispatch({ requestId: 'request-2', text: 'وماذا عن التغذية؟' });

  assert.equal(first.status, 'success');
  assert.equal(first.aiOnly, true);
  assert.equal(first.reply, 'AI response');
  assert.equal(second.status, 'success');
  assert.equal(calls[0].context.today.consumedCalories, 500);
  assert.equal(calls[0].history.length, 0);
  assert.equal(calls[1].history.length, 2);
});

test('AI fallback returns an editable meal draft instead of raw meal markdown', async () => {
  const dispatch = createAiFallbackDispatch({
    actionDispatch: async () => { throw new Error('No cloud session'); },
    chat: async () => ({
      success: true,
      reply: '**raw meal result**',
      mealsData: [{ titleAr: 'غداء', items: [{ nameAr: 'صدر دجاج', grams: 250, calories: 412, protein: 77.5, carbs: 0, fats: 9 }] }]
    }),
  });
  const result = await dispatch({ requestId: 'request-meal', text: 'أكلت 250 غرام صدر دجاج' });
  assert.equal(result.status, 'clarification');
  assert.equal(result.cards[0].type, 'meal_draft');
  assert.equal(result.cards[0].local, true);
  assert.match(result.cards[0].question, /هل تود إضافة الوجبة/);
  assert.doesNotMatch(result.reply, /raw meal result/);
});
