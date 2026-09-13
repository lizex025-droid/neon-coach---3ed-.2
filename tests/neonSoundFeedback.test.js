import test from 'node:test';
import assert from 'node:assert/strict';
import { NeonSoundService, NEON_ACK_SOUND_URL, NEON_SOUND_CONFIG, neonSoundService } from '../src/services/voice/neonSoundService.js';
import { isWriteActionTool, WRITE_ACTION_TOOLS } from '../src/domain/actionToolsRegistry.js';
import { neonActionAgent } from '../src/services/neonActionAgent.js';
import { store } from '../src/state/store.js';
import { NeonCommandAgent } from '../src/services/neonCommandAgent.js';

test('1. Sound Service Configuration and URL', () => {
  assert.equal(NEON_ACK_SOUND_URL, '/neon-ack.wav');
  assert.equal(NEON_SOUND_CONFIG.defaultVolume, 0.7);
  assert.ok(NEON_SOUND_CONFIG.minIntervalMs >= 300);
  assert.equal(neonSoundService.getVolume(), 0.7);

  const customService = new NeonSoundService();
  customService.setVolume(0.8);
  assert.equal(customService.getVolume(), 0.8);
  customService.setVolume(1.5); // should not exceed 1
  assert.equal(customService.getVolume(), 0.8);
});

test('2. Debounce and Duplicate Guard in NeonSoundService', async () => {
  const service = new NeonSoundService();
  // Mock lastPlayTime to simulate recent playback
  service.lastPlayTime = Date.now();

  // Immediate subsequent call must be debounced
  const result = await service.playAcknowledgement();
  assert.equal(result, false, 'Expected debounced playAcknowledgement to return false');
});

test('3. Action Classification: Write vs Read/Control tools', () => {
  // Write actions must return true
  const writeTools = [
    'logWater', 'updateWater',
    'logWeight', 'updateWeight',
    'logMeal', 'updateMeal',
    'logWorkoutSets', 'logWorkoutSet', 'completeWorkout',
    'logSupplement', 'markSupplementTaken',
    'logSteps', 'logSleep', 'logMood', 'logEnergy', 'logCardio', 'logInBody',
    'undoLastAction'
  ];

  for (const tool of writeTools) {
    assert.equal(isWriteActionTool(tool), true, `Expected ${tool} to be classified as a write action`);
    assert.ok(WRITE_ACTION_TOOLS.has(tool));
  }

  // Read / Control actions must return false
  const nonWriteTools = [
    'getTodayNutrition',
    'getTodaySummary',
    'stopVoiceSession',
    'unknownTool'
  ];

  for (const tool of nonWriteTools) {
    assert.equal(isWriteActionTool(tool), false, `Expected ${tool} to NOT be classified as a write action`);
  }
});

test('sound is played once after a confirmed voice write batch, never for unpersisted results', async () => {
  let calls = 0;
  const original = neonSoundService.playAcknowledgement;
  neonSoundService.playAcknowledgement = () => { calls++; };
  const agent = new NeonCommandAgent();
  try {
    for (const status of ['error', 'clarification', 'partial', 'pending_sync']) agent.present({ status, results: [], reply: 'Not saved' }, true);
    agent.present({ status: 'success', results: [{ persisted: false, changedResources: [] }] }, true);
    assert.equal(calls, 0);
    agent.present({ status: 'success', results: [{ persisted: true, changedResources: ['water'] }, { persisted: true, changedResources: ['weight'] }] }, true);
    assert.equal(calls, 1);
    agent.present({ status: 'success', results: [{ persisted: true, changedResources: ['water'] }] }, false);
    assert.equal(calls, 1);
  } finally { neonSoundService.playAcknowledgement = original; }
});
