import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  BODY_FAT_RANGES,
  getBodyFatRange,
  renderBodyFatStep,
  renderBodyFatSilhouette
} from '../src/components/bodyFatPicker.js';

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
  assert.match(html, /تقدير بصري/);
  assert.notEqual(renderBodyFatSilhouette(0), renderBodyFatSilhouette(8));
  assert.notEqual(renderBodyFatSilhouette(4, 'male'), renderBodyFatSilhouette(4, 'female'));
});

test('body fat onboarding follows measurements for every goal', () => {
  const source = readFileSync(new URL('../src/views/questionnaireView.js', import.meta.url), 'utf8');
  const order = /STEP_KEYS\.MEASUREMENTS,\s*STEP_KEYS\.BODY_FAT,\s*STEP_KEYS\.GOAL,/g;
  assert.equal((source.match(order) || []).length, 3);
  assert.match(source, /case STEP_KEYS\.BODY_FAT:\s*return renderBodyFatStep/);
  assert.match(source, /stepKeyNow === STEP_KEYS\.BODY_FAT/);
  assert.match(source, /formData\.bodyFatRange = selected\.label/);
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
