'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../assets/js/calculations.js');

const near = (actual, expected, dp = 4) => {
  assert.equal(typeof actual, 'number', `expected a number, got ${actual}`);
  assert.ok(Math.abs(actual - expected) < Math.pow(10, -dp) / 2, `${actual} is not near ${expected}`);
};

test('percentage: amount, part of whole, change and reverse', () => {
  near(C.percentAmount(15, 200), 30);
  near(C.percentAmount(12.5, 80), 10);
  near(C.percentOf(15, 200), 7.5);
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
  assert.equal(C.attendance(0, 0, 75).percent, null);
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
  assert.equal(s.charactersNoSpaces, 25);
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

test('study hours analytics: daily, weekly, subject totals and goal progress', () => {
  const sessions = [
    { date: '2026-11-25', subject: 'Maths', minutes: 60 },
    { date: '2026-11-25', subject: 'Physics', minutes: 30 },
    { date: '2026-11-24', subject: 'Maths', minutes: 45 },
    { date: '2026-11-24', subject: 'Maths', minutes: -5 }
  ];
  const s = C.hoursSummary(sessions, 120, '2026-11-25');
  assert.equal(s.todayMinutes, 90);
  assert.equal(s.weekMinutes, 135);
  assert.equal(s.totalMinutes, 135);
  assert.equal(s.bySubject.Maths, 105);
  assert.equal(s.bySubject.Physics, 30);
  assert.equal(s.goalPercent, 112.5);
  assert.equal(s.averageMinutes, 19.3);
  assert.equal(s.weekKeys.length, 7);
  assert.equal(C.hoursSummary([], 0, '2026-11-25').goalPercent, null);
});

test('spaced revision plan respects strength intervals and the exam date', () => {
  const medium = C.revisionPlan('2026-11-25', '2026-12-20', 'medium');
  assert.deepEqual(medium.map(x => x.date), ['2026-11-26', '2026-11-27', '2026-11-30', '2026-12-05', '2026-12-16']);
  assert.equal(medium[2].interval, 5);
  assert.equal(C.revisionPlan('2026-11-25', '2026-12-05', 'medium').length, 4);
  assert.equal(C.revisionPlan('2026-11-25', '', 'hard').length, 5);
  assert.equal(C.revisionPlan('2026-02-30', '', 'easy'), null);
  assert.equal(C.revisionPlan('2026-11-25', '2026-11-20', 'easy').length, 0);
});

test('grade goal planner: required marks, achieved and impossible cases', () => {
  const plan = C.gradeGoalPlan(80, 60, 80, [20]);
  assert.equal(plan.status, 'possible');
  assert.equal(plan.grandTotal, 100);
  assert.equal(plan.requiredTotal, 80);
  assert.equal(plan.needed, 20);
  assert.equal(plan.requiredPercent, 100);
  assert.deepEqual(plan.perAssessment, [20]);
  assert.equal(C.gradeGoalPlan(80, 90, 80, [20]).status, 'achieved');
  assert.equal(C.gradeGoalPlan(80, 60, 80, [5]).status, 'impossible');
  assert.equal(C.gradeGoalPlan(101, 60, 80, [20]), null);
  assert.equal(C.gradeGoalPlan(80, 60, 80, []).status, 'impossible');
});

test('streak statistics: current run, longest run and 35-day heatmap', () => {
  const s = C.streakStats(['2026-11-25', '2026-11-24', '2026-11-23', '2026-11-20', '2026-11-23'], '2026-11-25');
  assert.equal(s.current, 3);
  assert.equal(s.longest, 3);
  assert.equal(s.totalDays, 4);
  assert.equal(s.last35.length, 35);
  assert.equal(s.last35[34].count, 1);
  assert.equal(C.streakStats(['2026-11-20'], '2026-11-25').current, 0);
});

test('syllabus coverage: subject progress, confidence and weakest topics', () => {
  const s = C.syllabusCoverage([
    { subject: 'Maths', status: 'done', confidence: 'high' },
    { subject: 'Maths', status: 'in-progress', confidence: 'medium' },
    { subject: 'Physics', status: 'done', confidence: 'low' },
    { subject: 'Chemistry', status: 'not-started', confidence: 'low' }
  ]);
  assert.equal(s.total, 4);
  assert.equal(s.done, 2);
  assert.equal(s.inProgress, 1);
  assert.equal(s.percent, 50);
  near(s.confidencePercent, 62.5);
  assert.deepEqual(s.bySubject.map(g => g.subject), ['Chemistry', 'Maths', 'Physics']);
  assert.equal(s.focus[0].subject, 'Chemistry');
  assert.equal(C.syllabusCoverage([]), null);
});

test('readiness score: weighted signals, weakest area and validation', () => {
  const r = C.readinessScore({ marks: 90, coverage: 60, revision: 80, consistency: 50 });
  near(r.score, 74);
  assert.equal(r.band, 'On track');
  assert.equal(r.weakest.key, 'consistency');
  assert.equal(r.signals.length, 4);
  assert.ok(r.actions.join(' ').includes('study day'));
  assert.equal(C.readinessScore({ marks: 100, coverage: 100, revision: 100, consistency: 100 }).band, 'Exam ready');
  assert.equal(C.readinessScore({ marks: 101, coverage: 60, revision: 80, consistency: 50 }), null);
});

test('study pace forecast: projected finish, required hours and curve', () => {
  const behind = C.studyForecast({ totalUnits: 100, completedUnits: 40, unitsPerHour: 2, dailyHours: 2, daysLeft: 10 });
  assert.equal(behind.status, 'behind');
  assert.equal(behind.projectedUnits, 80);
  assert.equal(behind.projectedPercent, 80);
  assert.equal(behind.requiredPerDay, 6);
  assert.equal(behind.requiredHoursPerDay, 3);
  assert.equal(behind.finishDays, 15);
  assert.equal(behind.bufferDays, null);
  assert.equal(behind.curve.length, 11);
  const ahead = C.studyForecast({ totalUnits: 100, completedUnits: 40, unitsPerHour: 2, dailyHours: 2, daysLeft: 20 });
  assert.equal(ahead.status, 'on-track');
  assert.equal(ahead.bufferDays, 5);
  assert.equal(C.studyForecast({ totalUnits: 100, completedUnits: 100, unitsPerHour: 2, dailyHours: 2, daysLeft: 5 }).status, 'complete');
  assert.equal(C.studyForecast({ totalUnits: 0, completedUnits: 0, unitsPerHour: 2, dailyHours: 2, daysLeft: 5 }), null);
});

test('assignment priority matrix: urgency ranking and overloaded days', () => {
  const tasks = [
    { title: 'Essay', due: '2026-11-26', priority: 'high', hours: 3 },
    { title: 'Quiz', due: '2026-11-28', priority: 'medium', hours: 1 },
    { title: 'Reading', due: '2026-12-10', priority: 'low', hours: 2 },
    { title: 'Broken', due: '2026-02-30', priority: 'high', hours: 1 }
  ];
  const m = C.priorityMatrix(tasks, 5, '2026-11-26');
  assert.deepEqual(m.rows.map(r => r.title), ['Essay', 'Quiz', 'Reading']);
  assert.equal(m.rows[0].score, 13);
  assert.deepEqual(m.counts, { now: 1, week: 1, later: 1 });
  assert.equal(m.byDay[0].hours, 3);
  assert.equal(m.overloadedDays, 0);
  assert.equal(m.totalHours, 6);
  assert.equal(C.priorityMatrix(tasks, 2, '2026-11-26').overloadedDays, 1);
  assert.equal(C.priorityMatrix([{ title: 'No date' }], 5, '2026-11-26'), null);
});
