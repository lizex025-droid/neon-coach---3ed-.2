import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const view = readFileSync(new URL('../src/views/questionnaireView.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles/planPreferencesStep.css', import.meta.url), 'utf8');
const start = view.indexOf('case STEP_KEYS.PLAN_PREFERENCES: {');
const end = view.indexOf('case STEP_KEYS.PLAN_PREFERENCES_2: {', start);
const markup = view.slice(start, end);

test('nutrition preference layout is scoped to its own questionnaire step', () => {
  assert.ok(start > 0 && end > start);
  assert.match(view, /import '\.\.\/styles\/planPreferencesStep\.css'/);
  assert.match(markup, /<section class="q-plan-preferences-step" dir="rtl">/);
  assert.match(markup, /<\/section>/);
  assert.equal((markup.match(/class="form-group q-plan-question/g) || []).length, 3);
  assert.ok(!view.slice(end).includes('class="q-plan-preferences-step"'));
});

test('unused adherence question is removed while meaningful preferences remain', () => {
  assert.ok(!markup.includes('q-adherence-grid'));
  assert.ok(!markup.includes('ما هو مستوى التزامك المتوقع'));
  for(const control of ['q-mealslots-list','q-offplan-grid','q-sweets-toggle'])assert.ok(markup.includes(control));
});

test('meal distribution remains selectable and never forces one-line labels', () => {
  for (const value of ['breakfast_lunch_dinner', 'breakfast_lunch', 'lunch_dinner']) {
    assert.ok(markup.includes('data-val="' + value + '"'));
  }
  assert.match(markup, /class="q-mealslots-list"/);
  assert.match(styles, /\.q-mealslots-btn[\s\S]*?white-space: normal !important/);
  assert.match(view, /formData\.nutritionPlanPreferences\.mealSlots = val/);
});

test('eight free-meal values render in a four-column grid with wrapped badge', () => {
  assert.match(markup, /class="q-free-meal-heading"/);
  assert.match(markup, /class="q-offplan-grid"/);
  assert.match(markup, /\[0, 1, 2, 3, 4, 5, 6, 7\]\.map/);
  assert.match(styles, /\.q-offplan-grid[\s\S]*?repeat\(4, minmax\(0, 1fr\)\)/);
  assert.match(styles, /#offplan-count-badge[\s\S]*?white-space: normal/);
  assert.match(view, /formData\.nutritionPlanPreferences\.offPlanMealsCount = count/);
});

test('sweet choices and Next button have tap-friendly mobile layout', () => {
  assert.match(markup, /class="q-sweets-heading"/);
  assert.match(markup, /class="q-sweets-toggle"/);
  assert.match(markup, /id="q-sweets-toggle-no"/);
  assert.match(markup, /id="q-sweets-toggle-yes"/);
  assert.match(markup, /id="q-sweets-details-panel"/);
  assert.match(styles, /\.q-sweets-toggle button[\s\S]*?min-height: 43px/);
  assert.match(markup, /id="q-next-step-btn"/);
  assert.match(styles, /\.questionnaire-container:has\(\.q-plan-preferences-step\)[\s\S]*?safe-area-inset-bottom/);
});
