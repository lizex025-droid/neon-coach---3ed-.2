import test from 'node:test';
import assert from 'node:assert/strict';
import { NeonSoundService, NEON_ACK_SOUND_URL, NEON_SOUND_CONFIG, neonSoundService } from '../src/services/voice/neonSoundService.js';
import { isWriteActionTool, WRITE_ACTION_TOOLS } from '../src/domain/actionToolsRegistry.js';
import { neonActionAgent } from '../src/services/neonActionAgent.js';
import { store } from '../src/state/store.js';

test('1. Sound Service Configuration and URL', () => {
  assert.ok(NEON_ACK_SOUND_URL.includes('supabase.co/storage/v1/object/sign/AUDIO/computerbeep_8%20-%20acknolwedgement.mp3'));
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

test('4. NeonActionAgent: Sound on Single Write Action (logWater)', async () => {
  let soundCalls = 0;
  const originalPlay = neonSoundService.playAcknowledgement;
  neonSoundService.playAcknowledgement = async () => {
    soundCalls++;
    return true;
  };

  try {
    const res = await neonActionAgent.handleUserUtterance('شربت نص لتر مي');
    assert.ok(res && res.success);
    assert.equal(soundCalls, 1, 'Expected sound to play exactly once for logWater');
  } finally {
    neonSoundService.playAcknowledgement = originalPlay;
  }
});

test('5. NeonActionAgent: Sound on Multi-Action Batch (plays ONCE, no audio spam)', async () => {
  let soundCalls = 0;
  const originalPlay = neonSoundService.playAcknowledgement;
  neonSoundService.playAcknowledgement = async () => {
    soundCalls++;
    return true;
  };

  try {
    const utterance = 'وزني اليوم 78.5، شربت لترين، أكلت 200 غ دجاج و150 غ رز';
    const res = await neonActionAgent.handleUserUtterance(utterance);
    assert.ok(res && res.success);
    assert.ok(res.actions.length >= 3);
    assert.equal(soundCalls, 1, 'Expected sound to play ONCE after full multi-action batch succeeds');
  } finally {
    neonSoundService.playAcknowledgement = originalPlay;
  }
});

test('6. NeonActionAgent: NO Sound on Read-Only Queries', async () => {
  let soundCalls = 0;
  const originalPlay = neonSoundService.playAcknowledgement;
  neonSoundService.playAcknowledgement = async () => {
    soundCalls++;
    return true;
  };

  try {
    const res = await neonActionAgent.handleUserUtterance('شو باقيلي بروتين؟');
    assert.ok(res);
    assert.equal(res.actions[0].tool, 'getTodayNutrition');
    assert.equal(soundCalls, 0, 'Read-only queries must NOT play acknowledgement sound');
  } finally {
    neonSoundService.playAcknowledgement = originalPlay;
  }
});

test('7. NeonActionAgent: NO Sound on Clarification Questions', async () => {
  let soundCalls = 0;
  const originalPlay = neonSoundService.playAcknowledgement;
  neonSoundService.playAcknowledgement = async () => {
    soundCalls++;
    return true;
  };

  try {
    // "لعبت بنش 80" lacks sets/reps so it prompts clarification
    const res = await neonActionAgent.handleUserUtterance('لعبت بنش 80');
    assert.ok(res);
    assert.equal(res.isClarification, true);
    assert.equal(soundCalls, 0, 'Clarification questions must NOT play acknowledgement sound');
  } finally {
    neonSoundService.playAcknowledgement = originalPlay;
  }
});

test('8. NeonActionAgent: Sound on Undo Last Action', async () => {
  let soundCalls = 0;
  const originalPlay = neonSoundService.playAcknowledgement;
  neonSoundService.playAcknowledgement = async () => {
    soundCalls++;
    return true;
  };

  try {
    // Empty stack: no sound, failure
    neonActionAgent.undoStack = [];
    const failRes = neonActionAgent.undo();
    assert.equal(failRes.success, false);
    assert.equal(soundCalls, 0, 'Empty undo stack must NOT play sound');

    // Push dummy action to undo stack
    let inversed = false;
    neonActionAgent.undoStack.push({
      toolName: 'logWater',
      args: { milliliters: 500 },
      inverse: () => { inversed = true; },
      summaryText: '+500 مل ماء'
    });

    const successRes = neonActionAgent.undo();
    assert.equal(successRes.success, true);
    assert.equal(inversed, true);
    assert.equal(soundCalls, 1, 'Successful undo must play acknowledgement sound');
  } finally {
    neonSoundService.playAcknowledgement = originalPlay;
  }
});

test('9. NeonActionAgent: Sound on Voice Session Start', async () => {
  let soundCalls = 0;
  const originalPlay = neonSoundService.playAcknowledgement;
  neonSoundService.playAcknowledgement = async () => {
    soundCalls++;
    return true;
  };

  try {
    // Stub audioAnalyser.start and stt.start so it doesn't try real mic hardware in Node
    const originalAnalyserStart = neonActionAgent.audioAnalyser.start;
    const originalSttStart = neonActionAgent.stt?.start;
    neonActionAgent.audioAnalyser.start = async () => {};
    if (neonActionAgent.stt) neonActionAgent.stt.start = () => {};

    neonActionAgent.state = 'idle';
    await neonActionAgent.startVoiceSession();
    assert.equal(soundCalls, 1, 'Starting voice session must play acknowledgement sound');

    // Cleanup
    neonActionAgent.stopVoiceSession();
    neonActionAgent.audioAnalyser.start = originalAnalyserStart;
    if (neonActionAgent.stt) neonActionAgent.stt.start = originalSttStart;
  } finally {
    neonSoundService.playAcknowledgement = originalPlay;
  }
});
