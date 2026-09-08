import test from 'node:test';
import assert from 'node:assert/strict';
import { animateCountUp, animateRingOffset } from '../src/utils/animUtils.js';

test('دالة animateCountUp تضع القيمة المستهدفة فوراً عند غياب window أو عند تفعيل prefers-reduced-motion', () => {
  const dummyEl = { textContent: '' };
  animateCountUp(dummyEl, 87, { suffix: '%' });
  assert.equal(dummyEl.textContent, '87%');

  const decimalEl = { textContent: '' };
  animateCountUp(decimalEl, 118.5, { decimals: 1, suffix: ' كغ' });
  assert.equal(decimalEl.textContent, '118.5 كغ');

  const negativeEl = { textContent: '' };
  animateCountUp(negativeEl, -0.9, { decimals: 1 });
  assert.equal(negativeEl.textContent, '-0.9');
});

test('دالة animateRingOffset تضبط إزاحة الدائرة بنجاح', () => {
  const dummyRing = { style: { strokeDashoffset: '' } };
  animateRingOffset(dummyRing, 24.5, 188.5);
  assert.equal(dummyRing.style.strokeDashoffset, '24.5');
});

test('دالة showNeonSplash و hideNeonSplash تعمل بأمان في بيئة Node وتدعم DOM mock', async () => {
  const { showNeonSplash, hideNeonSplash, setupTrainingLoadingInterceptors } = await import('../src/utils/splash.js');
  
  // في بيئة node بدون document
  assert.equal(showNeonSplash('تحميل تمرين'), null);
  assert.doesNotThrow(() => hideNeonSplash());
  assert.doesNotThrow(() => setupTrainingLoadingInterceptors());

  // محاكاة كائن DOM
  const elements = {};
  global.document = {
    getElementById: (id) => elements[id] || null,
    createElement: (tag) => {
      const el = {
        id: '',
        attributes: {},
        classList: {
          add: (c) => el.classes.add(c),
          remove: (c) => el.classes.delete(c),
          contains: (c) => el.classes.has(c)
        },
        classes: new Set(),
        setAttribute: (k, v) => { el.attributes[k] = v; },
        innerHTML: '',
        remove: () => { delete elements[el.id]; }
      };
      return el;
    },
    body: {
      appendChild: (el) => {
        if (el.id) elements[el.id] = el;
      }
    },
    addEventListener: () => {}
  };
  global.window = {
    addEventListener: () => {}
  };

  const splash = showNeonSplash('جاري تجهيز تمرين الـ 40 يوماً...');
  assert.ok(splash);
  assert.equal(splash.id, 'neon-app-splash');
  assert.ok(elements['neon-app-splash']);

  hideNeonSplash();
  
  delete global.document;
  delete global.window;
});

