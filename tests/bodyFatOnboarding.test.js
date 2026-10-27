import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  BODY_FAT_RANGES,
  FEMALE_BODY_FAT_RANGES,
  getBodyFatRanges,
  getBodyFatRange,
  renderBodyFatStep,
  renderBodyFatSilhouette
} from '../src/components/bodyFatPicker.js';
import { startBodyFatImageLoader } from '../src/utils/bodyFatImageLoader.js';

test('body fat picker has nine distinct broad visual ranges', () => {
  assert.deepEqual(BODY_FAT_RANGES.map(range => range.label), [
    '3–4%', '5–7%', '8–12%', '13–17%', '18–23%',
    '24–29%', '30–34%', '35–39%', '40%+'
  ]);
  assert.equal(new Set(BODY_FAT_RANGES.map(range => range.label)).size, 9);
  assert.equal(getBodyFatRange('18–23%').estimate, 20.5);
  assert.equal(getBodyFatRange('unknown'), null);
});

test('picker shows all cards, exactly one selected and a Next button', () => {
  const html = renderBodyFatStep('18–23%', 'male');
  assert.equal((html.match(/class="body-fat-option /g) || []).length, 9);
  assert.equal((html.match(/<svg /g) || []).length, 9);
  assert.equal((html.match(/aria-checked="true"/g) || []).length, 1);
  assert.match(html, /id="q-next-step-btn"/);
  assert.match(html, /18–23%/);
  assert.match(html, /تقديرية/);
  assert.equal((html.match(/class="body-fat-photo"/g) || []).length, 9);
  assert.equal((html.match(/class="body-fat-selection-check"/g) || []).length, 9);
  assert.equal((html.match(/class="body-fat-fallback-label"/g) || []).length, 9);
  assert.equal((html.match(/class="body-fat-chip"/g) || []).length, 0);
  // The percentage already appears inside the R2 image, do not overlay it.
  assert.ok(!html.includes('<span class="body-fat-chip">'));
  assert.match(html, /pub-64c7fdc3eb7c4a228263029521b77ed1.r2.dev/);
  assert.notEqual(renderBodyFatSilhouette(0), renderBodyFatSilhouette(8));
  assert.notEqual(renderBodyFatSilhouette(4, 'male'), renderBodyFatSilhouette(4, 'female'));
});

test('initial HTML defers image network requests and keeps accessible labels', () => {
  const html = renderBodyFatStep('', 'male');
  assert.equal((html.match(/data-src="https:\/\/pub-/g) || []).length, 9);
  assert.equal((html.match(/class="body-fat-illustration is-loading"/g) || []).length, 9);
  assert.equal((html.match(/fetchpriority=/g) || []).length, 0);
  assert.match(html, /width="320" height="400"/);
});

test('lazy loader only starts visible photos, limits concurrent fetches and cleans up', () => {
  const started = [];
  const photos = Array.from({ length: 9 }, (_, i) => {
    const listeners = {};
    const tile = {
      classList: { add() {}, remove() {} },
      querySelector() { return null; }
    };
    const photo = {
      dataset: { src: `https://example.com/${i}.png`, priority: i === 0 ? 'high' : 'auto' },
      isConnected: true,
      parentElement: { classList: { remove() {} } },
      nextElementSibling: { classList: { contains() { return true; } }, hidden: true },
      classList: { add() {} },
      closest() { return tile; },
      addEventListener(event, callback) { listeners[event] = callback; },
      get handlers() { return listeners; },
      set src(value) { started.push(value); }
    };
    return photo;
  });
  let observer;
  class FakeObserver {
    constructor(callback) { this.callback = callback; observer = this; this.observed = []; }
    observe(photo) { this.observed.push(photo); }
    unobserve(photo) { this.observed = this.observed.filter(v => v !== photo); }
    disconnect() { this.disconnected = true; }
    trigger(...items) { this.callback(items.map(target => ({ target, isIntersecting: true }))); }
  }
  const stop = startBodyFatImageLoader({ querySelectorAll: () => photos }, { IntersectionObserver: FakeObserver, maxConcurrent: 2 });
  assert.equal(started.length, 0, 'no eager downloading before intersection');
  observer.trigger(...photos.slice(0, 5));
  assert.deepEqual(started, ['https://example.com/0.png', 'https://example.com/1.png']);
  photos[0].handlers.load();
  assert.deepEqual(started, ['https://example.com/0.png', 'https://example.com/1.png', 'https://example.com/2.png']);
  photos[1].handlers.error();
  assert.deepEqual(started, ['https://example.com/0.png', 'https://example.com/1.png', 'https://example.com/2.png', 'https://example.com/3.png']);
  stop();
  photos[2].handlers.load();
  assert.equal(started.length, 4, 'cleanup stops pending requests');
  assert.equal(observer.disconnected, true);
});

test('women have their own nine accurate-range labels and distinct R2 images', () => {
  assert.deepEqual(FEMALE_BODY_FAT_RANGES.map(range => range.label), [
    '10–13%', '14–17%', '18–23%', '24–28%', '29–33%',
    '34–37%', '38–42%', '43–49%', '50%+'
  ]);
  assert.equal(getBodyFatRanges('female'), FEMALE_BODY_FAT_RANGES);
  assert.equal(getBodyFatRange('24–29%', 'female'), null);
  assert.equal(getBodyFatRange('24–28%', 'male'), null);
  assert.equal(getBodyFatRange('18–23%', 'female').estimate, 20.5);
  const maleHtml = renderBodyFatStep('', 'male');
  const femaleHtml = renderBodyFatStep('24–28%', 'female');
  assert.equal((femaleHtml.match(/class="body-fat-photo"/g) || []).length, 9);
  assert.equal((femaleHtml.match(/class="body-fat-selection-check"/g) || []).length, 9);
  assert.ok(!femaleHtml.includes('body-fat-chip'));
  assert.equal((femaleHtml.match(/aria-checked="true"/g) || []).length, 1);
  assert.match(femaleHtml, /10_21_42%20AM-1\.png/);
  assert.match(femaleHtml, /10_21_58%20AM-9\.png/);
  assert.match(maleHtml, /10_20_47%20AM-1\.png/);
  assert.match(maleHtml, /10_21_02%20AM-9\.png/);
  const allSources = [...BODY_FAT_RANGES, ...FEMALE_BODY_FAT_RANGES].map(row => row.image);
  assert.equal(allSources.length, 18);
  assert.equal(new Set(allSources).size, 18);
  for (const url of allSources) {
    assert.ok(url.startsWith('https://pub-64c7fdc3eb7c4a228263029521b77ed1.r2.dev/'));
    assert.match(url, /\.png$/);
  }
});

test('iPhone body-fat layout has safe scrolling after the Next CTA', () => {
  const styles = readFileSync(new URL('../src/styles/bodyFatPicker.css', import.meta.url), 'utf8');
  const source = readFileSync(new URL('../src/views/questionnaireView.js', import.meta.url), 'utf8');
  assert.match(styles, /\.questionnaire-container\.body-fat-questionnaire/);
  assert.match(styles, /padding-bottom: calc\(145px \+ env\(safe-area-inset-bottom/);
  assert.match(styles, /\.body-fat-next[\s\S]*?position: sticky/);
  assert.match(source, /currentStepKey === STEP_KEYS\.BODY_FAT \? ' body-fat-questionnaire'/);
  const loader = readFileSync(new URL('../src/utils/bodyFatImageLoader.js', import.meta.url), 'utf8');
  assert.match(source, /startBodyFatImageLoader\(document\.querySelector\('\.body-fat-step'\)\)/);
  assert.match(loader, /classList\.contains\('body-fat-image-fallback'\)/);
  assert.match(loader, /querySelector\('\.body-fat-fallback-label'\)/);
  assert.ok(!source.includes("querySelector('.body-fat-chip')"));
});

test('body fat onboarding follows measurements for every goal', () => {
  const source = readFileSync(new URL('../src/views/questionnaireView.js', import.meta.url), 'utf8');
  const order = /STEP_KEYS\.MEASUREMENTS,\s*STEP_KEYS\.BODY_FAT,\s*STEP_KEYS\.METABOLIC_ACTIVITY,\s*STEP_KEYS\.GOAL,/g;
  assert.equal((source.match(order) || []).length, 3);
  assert.match(source, /case STEP_KEYS\.BODY_FAT:\s*return renderBodyFatStep/);
  assert.match(source, /stepKeyNow === STEP_KEYS\.BODY_FAT/);
  assert.match(source, /formData\.bodyFatRange = selected\.label/);
  assert.match(source, /getBodyFatRange\(formData\.bodyFatRange, formData\.gender\)/);
  assert.match(source, /getBodyFatRange\(choice\.dataset\.bodyFatRange, formData\.gender\)/);
  assert.match(source, /bodyFatPercent: null/);
});

test('first-time plan creation no longer opens the training-plan preview', () => {
  const source = readFileSync(new URL('../src/views/questionnaireView.js', import.meta.url), 'utf8');
  const start = source.indexOf("createPlanBtn?.addEventListener('click', async () => {");
  const end = source.indexOf("const overlay = document.getElementById('plan-gen-overlay');", start);
  assert.ok(start > 0 && end > start);
  const handler = source.slice(start, end);
  assert.ok(!handler.includes('showTrainingPlanPreview('));
  assert.match(handler, /if \(!trainingDraftToActivate\.canApprove\)/);
  assert.match(handler, /fortyDayWorkoutService\.savePlanDraft\(trainingDraftToActivate\)/);
  assert.match(source, /export function showTrainingPlanPreview/);
});
