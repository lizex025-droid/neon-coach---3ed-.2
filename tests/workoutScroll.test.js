import test from 'node:test';
import assert from 'node:assert/strict';
import { scrollWorkoutToTop } from '../src/utils/workoutScroll.js';

function scroller(name, calls, parentElement = null) {
  return {
    parentElement, scrollTop: 450,
    scrollTo(options) {
      calls.push({ name, options });
      this.scrollTop = 0;
    }
  };
}

test('Top button scrolls workout, nested view, document and window', () => {
  const calls = [];
  const docEl = scroller('html', calls);
  const body = scroller('body', calls);
  const app = scroller('app', calls, body);
  const container = scroller('main', calls, app);
  const workout = {
    parentElement: container,
    scrollIntoView(options) { calls.push({ name: 'workout', options }); }
  };
  const doc = {
    getElementById(id) {
      return { 'forty-workout-root': workout, 'view-container': container, 'app': app }[id] || null;
    },
    scrollingElement: docEl, documentElement: docEl, body
  };
  const win = { scrollTo(options) { calls.push({ name: 'window', options }); } };
  assert.equal(scrollWorkoutToTop(win, doc), true);
  for (const name of ['workout', 'main', 'app', 'body', 'html', 'window']) {
    assert.ok(calls.some(call => call.name === name), `missing ${name}`);
  }
  assert.equal(calls.find(call => call.name === 'window').options, 0);
  assert.equal(calls.find(call => call.name === 'workout').options.block, 'start');
  assert.equal(container.scrollTop, 0);
});

test('Top button safely does nothing when workout screen is not mounted', () => {
  const doc = { getElementById: () => null };
  assert.equal(scrollWorkoutToTop({ scrollTo() { throw Error('not expected'); } }, doc), false);
});

test('Top button supports older iOS scrollers with numeric scrollTop only', () => {
  const container = { scrollTop: 600, parentElement: null };
  const workout = { parentElement: container, scrollIntoView() {} };
  const doc = {
    getElementById: id => id === 'forty-workout-root' ? workout : id === 'view-container' ? container : null,
    scrollingElement: null, documentElement: null, body: null
  };
  const win = { scrollTo() { throw Error('legacy WebKit rejects options'); }, scrollTop: 600 };
  assert.equal(scrollWorkoutToTop(win, doc), true);
  assert.equal(container.scrollTop, 0);
  assert.equal(win.scrollTop, 0);
});

test('Top click cancels iOS scrolling momentum by correcting position on next frame', () => {
  const calls = [];
  const root = { parentElement: null, scrollIntoView: () => calls.push('intoView') };
  const view = { parentElement: null, scrollTop: 400, scrollTo: () => calls.push('view') };
  let nextFrame;
  const win = {
    scrollTo: () => calls.push('window'),
    requestAnimationFrame(callback) { nextFrame = callback; }
  };
  const doc = {
    getElementById: key => ({ 'forty-workout-root': root, 'view-container': view })[key] || null,
    scrollingElement: null, documentElement: null, body: null
  };
  assert.equal(scrollWorkoutToTop(win, doc), true);
  assert.equal(view.scrollTop, 0);
  assert.equal(typeof nextFrame, 'function');
  // Simulate the preceding inertial scroll restoration seen in standalone PWAs.
  view.scrollTop = 180;
  nextFrame();
  assert.equal(view.scrollTop, 0);
  assert.equal(calls.filter(call => call === 'window').length, 2);
});

test('Top click can scroll when only the view exists during a route redraw', () => {
  const calls = [];
  const view = { scrollTop: 900, scrollTo: () => calls.push('view'), parentElement: null };
  const doc = {
    getElementById: id => id === 'view-container' ? view : null,
    scrollingElement: view, documentElement: null, body: null
  };
  assert.equal(scrollWorkoutToTop({ scrollTo: () => calls.push('window') }, doc), true);
  assert.equal(view.scrollTop, 0);
  assert.deepEqual(calls, ['view', 'window']);
});
