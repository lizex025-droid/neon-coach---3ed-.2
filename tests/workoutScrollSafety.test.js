import test from 'node:test';
import assert from 'node:assert/strict';
import { clearWorkoutPageEffects } from '../src/utils/workoutPageEffects.js';
import { getExerciseReorderCard } from '../src/utils/workoutDragSafety.js';

test('Navigating away from workout removes floating UI and unlocks scrolling', () => {
  const removed = [];
  const style = { overflow: 'hidden', touchAction: 'none', userSelect: 'none' };
  const makeNode = name => ({ remove() { removed.push(name); } });
  const doc = {
    body: { style },
    querySelectorAll(selector) {
      assert.match(selector, /workout-top-pill/);
      return [makeNode('Top pill'), makeNode('creator modal')];
    }
  };
  clearWorkoutPageEffects(doc);
  assert.deepEqual(removed, ['Top pill', 'creator modal']);
  assert.equal(style.overflow, '');
  assert.equal(style.touchAction, '');
  assert.equal(style.userSelect, '');
});

test('Unrelated legitimate body styles are not changed on route switches', () => {
  const style = { overflow: 'auto', touchAction: 'pan-y', userSelect: 'text' };
  clearWorkoutPageEffects({ body: { style }, querySelectorAll: () => [] });
  assert.deepEqual(style, { overflow: 'auto', touchAction: 'pan-y', userSelect: 'text' });
});

test('Only the numbered grip can start exercise drag, not a long press on the card', () => {
  const card = { dataset: { index: '3' } };
  const grip = { closest: selector => selector === '.forty-exercise-card' ? card : null };
  const gripTouch = { closest: selector => selector === '.forty-drag-handle' ? grip : null };
  const ordinaryCard = { closest: selector => selector === '.forty-exercise-card' ? card : null };
  const input = { closest: () => null };
  assert.equal(getExerciseReorderCard(gripTouch), card);
  assert.equal(getExerciseReorderCard(ordinaryCard), null);
  assert.equal(getExerciseReorderCard(input), null);
  assert.equal(getExerciseReorderCard(null), null);
});
