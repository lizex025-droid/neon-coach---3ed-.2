import test from 'node:test';
import assert from 'node:assert/strict';

import {
  wtDateKey,
  wtParseKey,
  photoFmtDate,
  estimate1RM,
  wtSaveEntry,
  calculateStreak,
  calculate7DayDelta,
  smoothSvgPath,
  calculateCompositionEstimate
} from '../src/domain/compositionEstimate.js';
import { localPhotoStorage } from '../src/services/localPhotoStorage.js';

test('date helpers correctly format and parse keys', () => {
  const d = new Date(2026, 7, 13); // Aug 13, 2026
  const key = wtDateKey(d);
  assert.equal(key, '2026-08-13');

  const parsed = wtParseKey('2026-08-13');
  assert.equal(parsed.getFullYear(), 2026);
  assert.equal(parsed.getMonth(), 7);
  assert.equal(parsed.getDate(), 13);

  const formatted = photoFmtDate('2026-08-13');
  assert.equal(formatted, 'Aug 13');
});

test('estimate1RM uses Epley formula accurately', () => {
  assert.equal(estimate1RM(100, 1), 100);
  assert.equal(estimate1RM(100, 0), 100);
  // 100 * (1 + 10 / 30) = 133.333
  const e10 = estimate1RM(100, 10);
  assert.ok(Math.abs(e10 - 133.33) < 0.05);
});

test('wtSaveEntry adds, updates and sorts weight entries', () => {
  let entries = [];
  entries = wtSaveEntry(entries, 129.5, new Date(2026, 7, 10));
  entries = wtSaveEntry(entries, 128.0, new Date(2026, 7, 12));
  entries = wtSaveEntry(entries, 129.0, new Date(2026, 7, 11));

  assert.equal(entries.length, 3);
  assert.equal(entries[0].dateKey, '2026-08-10');
  assert.equal(entries[1].dateKey, '2026-08-11');
  assert.equal(entries[2].dateKey, '2026-08-12');

  // Updating existing dateKey
  entries = wtSaveEntry(entries, 128.8, new Date(2026, 7, 11));
  assert.equal(entries.length, 3);
  assert.equal(entries[1].weight, 128.8);
});

test('calculateStreak counts consecutive logged days', () => {
  const base = new Date(2026, 7, 15);
  const entries = [
    { dateKey: '2026-08-12', weight: 130 },
    { dateKey: '2026-08-13', weight: 129.6 },
    { dateKey: '2026-08-14', weight: 129.3 },
    { dateKey: '2026-08-15', weight: 129.0 }
  ];

  const streak = calculateStreak(entries, base);
  assert.equal(streak, 4);

  // If today is not logged yet, but yesterday was logged
  const streakYesterday = calculateStreak(entries, new Date(2026, 7, 16));
  assert.equal(streakYesterday, 4);

  // If broken
  const brokenStreak = calculateStreak(entries, new Date(2026, 7, 18));
  assert.equal(brokenStreak, 0);
});

test('calculate7DayDelta computes difference and direction', () => {
  const entriesDown = [
    { dateKey: '2026-08-01', weight: 134.0 },
    { dateKey: '2026-08-08', weight: 129.0 }
  ];
  const deltaDown = calculate7DayDelta(entriesDown, 'kg');
  assert.ok(deltaDown);
  assert.equal(deltaDown.diff, -5.0);
  assert.equal(deltaDown.cls, 'down');
  assert.match(deltaDown.text, /▼ -5.0 kg · last 7d/);

  const entriesUp = [
    { dateKey: '2026-08-01', weight: 125.0 },
    { dateKey: '2026-08-08', weight: 126.2 }
  ];
  const deltaUp = calculate7DayDelta(entriesUp, 'kg');
  assert.ok(deltaUp);
  assert.equal(deltaUp.diff, 1.2);
  assert.equal(deltaUp.cls, 'up');
  assert.match(deltaUp.text, /▲ \+1.2 kg · last 7d/);

  const entriesFlat = [
    { dateKey: '2026-08-01', weight: 129.0 },
    { dateKey: '2026-08-08', weight: 129.01 }
  ];
  assert.equal(calculate7DayDelta(entriesFlat), null);
});

test('smoothSvgPath generates smooth quadratic bezier SVG paths', () => {
  assert.equal(smoothSvgPath([]), '');
  assert.equal(smoothSvgPath([{ x: 10, y: 20 }]), 'M 10.00 20.00');

  const pts = [
    { x: 0, y: 100 },
    { x: 50, y: 80 },
    { x: 100, y: 60 }
  ];
  const path = smoothSvgPath(pts);
  assert.ok(path.startsWith('M 0.00 100.00'));
  assert.ok(path.includes('Q'));
  assert.ok(path.includes('T'));
});

test('calculateCompositionEstimate uses Lyle McDonald model for body recomposition', () => {
  // Weight loss with strength holding (fat loss)
  const entriesDeficit = [
    { dateKey: '2026-07-15', weight: 134.0 },
    { dateKey: '2026-08-14', weight: 129.0 } // -5.0 kg in 30 days
  ];

  const comp = calculateCompositionEstimate({
    entries: entriesDeficit,
    units: 'kg',
    windowDays: 30,
    yearsTraining: 1
  });

  assert.equal(comp.visible, true);
  assert.equal(comp.actualDays, 30);
  assert.equal(comp.weightDelta, -5.0);
  assert.equal(comp.headlineCls, 'good');
  assert.match(comp.headline, /-5.0 kg - strength holding, fat dropping./);
  assert.ok(comp.musclePct > 0);
  assert.ok(comp.fatPct > 0);
  assert.match(comp.footText, /muscle/);
  assert.match(comp.footText, /fat/);
});

test('localPhotoStorage saves, retrieves, and deletes photos offline', async () => {
  await localPhotoStorage.clearAllPhotos();

  const dummyDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...';
  const saved = await localPhotoStorage.savePhoto({
    id: 'test_photo_1',
    dataUrl: dummyDataUrl,
    dateKey: '2026-08-13',
    weight: '129.0 kg'
  });

  assert.equal(saved.id, 'test_photo_1');
  assert.equal(saved.dateKey, '2026-08-13');
  assert.equal(saved.weight, '129.0 kg');

  const all = await localPhotoStorage.getAllPhotos();
  assert.ok(all.length >= 1);
  const found = all.find(p => p.id === 'test_photo_1');
  assert.ok(found);

  await localPhotoStorage.deletePhoto('test_photo_1');
  const afterDelete = await localPhotoStorage.getAllPhotos();
  assert.ok(!afterDelete.find(p => p.id === 'test_photo_1'));
});
