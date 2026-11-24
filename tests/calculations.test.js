'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../assets/js/calculations.js');

const near = (actual, expected, dp = 4) => {
  assert.equal(typeof actual, 'number', `expected a number, got ${actual}`);
  assert.ok(Math.abs(actual - expected) < Math.pow(10, -dp) / 2, `${actual} is not near ${expected}`);
};

test('percentage: part of whole, change and reverse', () => {
  near(C.percentOf(15, 200), 30);
  near(C.percentOf(3, 8), 37.5);
  near(C.percentChange(50, 60), 20);
  near(C.percentChange(60, 50), -16.6666667, 6);
  near(C.originalFromPercent(120, 20), 600);
  assert.equal(C.percentOf(10, 0), null);
  assert.equal(C.percentChange(0, 10), null);
  assert.equal(C.originalFromPercent(10, 0), null);
});

test('weighted averages: CGPA and GPA examples', () => {
  const cgpa = C.weightedAverage([
    { value: 3.7, weight: 4 }, { value: 3.0, weight: 3 }, { value: 4.0, weight: 2 }
  ]);
  near(cgpa, 31.8 / 9, 6);
  near(C.weightedAverage([{ value: 4.0, weight: 3 }, { value: 3.0, weight: 4 }]), 24 / 7, 6);
  assert.equal(C.weightedAverage([{ value: 4, weight: 0 }]), null);
  assert.equal(C.weightedAverage([]), null);
});

test('grade boundaries respect custom scale', () => {
  const scale = [{ min: 90, label: 'A+' }, { min: 80, label: 'A' }, { min: 70, label: 'B+' }, { min: 0, label: 'F' }];
  assert.equal(C.gradeFromPercent(89.99, scale), 'A');
  assert.equal(C.gradeFromPercent(90, scale), 'A+');
  assert.equal(C.gradeFromPercent(65, scale), 'F');
  assert.equal(C.gradeFromPercent(Infinity, scale), null);
});

test('marks summary: total, overall and average differ correctly', () => {
  const r = C.marksSummary([
    { subject: 'Math', marks: 85, max: 100 },
    { subject: 'Science', marks: 72, max: 80 }
  ]);
  assert.equal(r.obtained, 157);
  assert.equal(r.maximum, 180);
  near(r.percent, 157 / 180 * 100, 6);
  near(r.averagePercent, 87.5, 6);
  assert.equal(C.marksSummary([{ subject: 'Bad', marks: 5, max: 0 }]), null);
});

test('attendance: below and above target, zero and invalid values', () => {
  const ok = C.attendance(42, 50, 75);
  assert.equal(ok.achieved, true);
  near(ok.percent, 84, 6);
  assert.equal(ok.maxMissed, 8);
  const low = C.attendance(30, 50, 75);
  assert.equal(low.achieved, false);
  assert.equal(low.needed, 30);
  assert.equal(low.maxMissed, 0);
  assert.equal(C.attendance(0, 50, 75).needed, 150);
  assert.equal(C.attendance(10, 0, 75).percent, null);
  assert.equal(C.attendance(60, 50, 75), null);
  assert.equal(C.attendance(50, 50, 100).achieved, true);
  assert.equal(C.attendance(49, 50, 100).possible, false);
});

test('score predictor: possible, achieved and impossible cases', () => {
  const possible = C.scorePredictor(200, 90, 100, 80);
  assert.equal(possible.status, 'possible');
  assert.equal(possible.requiredMarks, 70);
  near(possible.requiredPercent, 70, 6);
  assert.equal(C.scorePredictor(200, 170, 100, 80).status, 'achieved');
  const bad = C.scorePredictor(200, 90, 50, 80);
  assert.equal(bad.status, 'impossible');
  assert.equal(bad.shortfall, 20);
  assert.equal(C.scorePredictor(0, 0, 0, 80), null);
});

test('text statistics and reading time', () => {
  const s = C.textStats('Study smarter. Achieve more.');
  assert.equal(s.words, 4);
  assert.equal(s.characters, 28);
  assert.equal(s.charactersNoSpaces, 24);
  assert.equal(s.sentences, 2);
  assert.equal(s.paragraphs, 1);
  assert.equal(C.textStats('').words, 0);
  near(C.readingTime(1200, 200), 6, 6);
  assert.equal(C.readingTime(100, 0), null);
});

test('date handling: validation, leap years, differences and age', () => {
  assert.equal(C.parseDate('2024-02-29') instanceof Date, true);
  assert.equal(C.parseDate('2023-02-29'), null);
  assert.equal(C.isLeap(2000), true);
  assert.equal(C.isLeap(1900), false);
  assert.equal(C.daysBetween('2024-01-01', '2025-01-01'), 366);
  assert.equal(C.daysBetween('2025-01-01', '2024-01-01'), -366);
  assert.equal(C.daysBetween('2024-02-30', '2024-03-01'), null);
  const a = C.age('2000-02-29', '2024-02-29');
  assert.deepEqual([a.years, a.months, a.days], [24, 0, 0]);
  assert.ok(a.totalDays > 8700);
  assert.equal(C.age('2025-01-01', '2024-01-01'), null);
});

test('unit conversions: length, mass, temperature and volume', () => {
  near(C.convertUnit('length', 'km', 'mi', 10), 6.213711922, 6);
  near(C.convertUnit('length', 'in', 'cm', 1), 2.54, 6);
  near(C.convertUnit('mass', 'kg', 'lb', 1), 2.204622622, 6);
  near(C.convertUnit('temperature', 'C', 'F', 100), 212, 6);
  near(C.convertUnit('temperature', 'C', 'F', -40), -40, 6);
  near(C.convertUnit('temperature', 'C', 'K', 0), 273.15, 6);
  near(C.convertUnit('temperature', 'F', 'C', 32), 0, 6);
  near(C.convertUnit('volume', 'L', 'ml', 2), 2000, 6);
  near(C.convertUnit('volume', 'cup', 'ml', 2), 473.176473, 5);
  assert.equal(C.convertUnit('mass', 'kg', 'parsec', 1), null);
  assert.equal(C.convertUnit('length', 'm', 'ft', -1) < 0, true);
});

test('citation formatting never invents missing details', () => {
  const full = C.formatCitation('APA', { author: 'Rivera, A.', year: '2022', title: 'Learning that lasts', publisher: 'Example Press' });
  assert.equal(full.text, 'Rivera, A. (2022). Learning that lasts. Example Press.');
  assert.equal(full.warnings.length, 0);
  const mla = C.formatCitation('MLA', { author: 'Rivera, A.', year: '2022', title: 'Learning that lasts', publisher: 'Example Press' });
  assert.equal(mla.text, 'Rivera, A. Learning that lasts. Example Press, 2022.');
  const partial = C.formatCitation('Chicago', { author: 'Rivera, A.', title: 'Learning that lasts' });
  assert.ok(partial.warnings.length >= 2);
  assert.ok(!partial.text.includes('undefined'));
  assert.equal(C.formatCitation('Unknown', { author: 'A' }), null);
});
