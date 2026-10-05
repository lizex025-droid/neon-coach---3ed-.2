import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isArabicNumeralsEnabled,
  setArabicNumeralsEnabled,
  normalizeArabicNumerals,
  parseArabicFloat,
  parseArabicInt
} from '../src/utils/arabicNumerals.js';

test('Arabic & Eastern numerals normalization and parsing', async (t) => {
  await t.test('converts Eastern Arabic numerals (٠-٩) to Western standard (0-9)', () => {
    assert.equal(normalizeArabicNumerals('٠١٢٣٤٥٦٧٨٩'), '0123456789');
    assert.equal(normalizeArabicNumerals('٧٥ كغ'), '75 كغ');
    assert.equal(normalizeArabicNumerals('١٢٠.٥'), '120.5');
  });

  await t.test('converts Persian/Urdu numerals (۰-۹) correctly', () => {
    assert.equal(normalizeArabicNumerals('۰۱۲۳۴۵۶۷۸۹'), '0123456789');
    assert.equal(normalizeArabicNumerals('۴۵.۲'), '45.2');
  });

  await t.test('handles Arabic decimal comma (٫) and numeric context commas (،)', () => {
    assert.equal(normalizeArabicNumerals('٧٥٫٥'), '75.5');
    assert.equal(normalizeArabicNumerals('٧٥،٥'), '75.5');
    assert.equal(normalizeArabicNumerals('٨٥،٥', true), '85.5');
  });

  await t.test('parseArabicFloat correctly parses Arabic and mixed strings', () => {
    assert.equal(parseArabicFloat('٧٥٫٥'), 75.5);
    assert.equal(parseArabicFloat('١٠٠'), 100);
    assert.equal(parseArabicFloat('12.5'), 12.5);
    assert.equal(parseArabicFloat(''), NaN);
    assert.equal(parseArabicFloat('غير_رقم', 0), 0);
  });

  await t.test('parseArabicInt correctly parses integers', () => {
    assert.equal(parseArabicInt('١٢'), 12);
    assert.equal(parseArabicInt('۵۰'), 50);
    assert.equal(parseArabicInt('100'), 100);
    assert.equal(parseArabicInt('xyz', 10, -1), -1);
  });

  await t.test('toggle preference state with localStorage simulation', () => {
    // default is enabled (true)
    setArabicNumeralsEnabled(true);
    assert.equal(isArabicNumeralsEnabled(), true);

    setArabicNumeralsEnabled(false);
    assert.equal(isArabicNumeralsEnabled(), false);

    setArabicNumeralsEnabled(true);
    assert.equal(isArabicNumeralsEnabled(), true);
  });
});
