/* StudentHub pure calculation functions.
   No DOM access. Safe to use in the browser and in Node.js tests. */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SHC = Object.assign(root.SHC || {}, api);
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function isNum(v) {
    return typeof v === 'number' && isFinite(v);
  }
  function round(v, dp) {
    if (!isNum(v)) return null;
    var f = Math.pow(10, dp == null ? 2 : dp);
    return Math.round((v + Number.EPSILON) * f) / f;
  }
  function sum(arr) {
    return arr.reduce(function (a, b) { return a + b; }, 0);
  }

  /* What percentage is `part` of `whole`. */
  function percentOf(part, whole) {
    if (!isNum(part) || !isNum(whole) || whole === 0) return null;
    return (part / whole) * 100;
  }
  /* The amount that is `percent` of `whole` (e.g. 15% of 200 = 30). */
  function percentAmount(percent, whole) {
    if (!isNum(percent) || !isNum(whole)) return null;
    return whole * percent / 100;
  }
  function percentChange(original, next) {
    if (!isNum(original) || !isNum(next) || original === 0) return null;
    return ((next - original) / original) * 100;
  }
  function originalFromPercent(part, percent) {
    if (!isNum(part) || !isNum(percent) || percent === 0) return null;
    return (part / percent) * 100;
  }
  function weightedAverage(entries) {
    if (!Array.isArray(entries) || !entries.length) return null;
    var valid = entries.filter(function (e) { return isNum(e.value) && isNum(e.weight) && e.weight >= 0; });
    if (!valid.length) return null;
    var w = sum(valid.map(function (e) { return e.weight; }));
    if (w === 0) return null;
    return sum(valid.map(function (e) { return e.value * e.weight; })) / w;
  }

  function gradeFromPercent(percent, scale) {
    if (!isNum(percent) || !Array.isArray(scale) || !scale.length) return null;
    var sorted = scale.slice().sort(function (a, b) { return b.min - a.min; });
    for (var i = 0; i < sorted.length; i++) {
      if (percent >= sorted[i].min) return sorted[i].label;
    }
    return sorted[sorted.length - 1].label;
  }

  function marksSummary(rows) {
    if (!Array.isArray(rows)) return null;
    var valid = rows.filter(function (r) { return isNum(r.marks) && isNum(r.max) && r.marks >= 0 && r.max > 0; });
    if (!valid.length) return null;
    var obtained = sum(valid.map(function (r) { return r.marks; }));
    var maximum = sum(valid.map(function (r) { return r.max; }));
    var percents = valid.map(function (r) { return (r.marks / r.max) * 100; });
    return {
      count: valid.length,
      obtained: obtained,
      maximum: maximum,
      percent: maximum > 0 ? (obtained / maximum) * 100 : null,
      averagePercent: sum(percents) / percents.length,
      rows: valid.map(function (r, i) {
        return { subject: r.subject || 'Subject ' + (i + 1), marks: r.marks, max: r.max, percent: (r.marks / r.max) * 100 };
      })
    };
  }

  function attendance(attended, total, target) {
    if (!isNum(attended) || !isNum(total) || !isNum(target)) return null;
    if (total < 0 || attended < 0 || attended > total || target < 0 || target > 100) return null;
    var percent = total === 0 ? null : (attended / total) * 100;
    var needed = 0;
    var maxMissed = 0;
    var possible = true;
    if (total > 0 && target === 100) {
      needed = attended === total ? 0 : null;
      possible = attended === total;
      maxMissed = 0;
    } else if (total > 0) {
      if (percent < target) {
        needed = Math.ceil((target * total - attended * 100) / (100 - target));
        possible = needed <= Infinity;
        maxMissed = 0;
      } else {
        needed = 0;
        var allowance = Math.floor(total * (100 - target) / 100);
        maxMissed = Math.max(0, Math.min(allowance, total - attended));
      }
    }
    return { percent: percent, needed: needed, maxMissed: maxMissed, achieved: total > 0 && percent !== null && percent >= target, possible: possible };
  }

  function scorePredictor(totalMarks, marksObtained, remainingMarks, targetPercent) {
    if (![totalMarks, marksObtained, remainingMarks, targetPercent].every(isNum)) return null;
    if (totalMarks <= 0 || marksObtained < 0 || remainingMarks < 0 || targetPercent < 0 || targetPercent > 100) return null;
    var targetMarks = totalMarks * targetPercent / 100;
    var required = targetMarks - marksObtained;
    var requiredPercent = remainingMarks > 0 ? (required / remainingMarks) * 100 : null;
    var status;
    if (required <= 0) status = 'achieved';
    else if (required > remainingMarks) status = 'impossible';
    else status = 'possible';
    return {
      targetMarks: targetMarks,
      requiredMarks: Math.max(0, required),
      requiredPercent: requiredPercent,
      status: status,
      shortfall: status === 'impossible' ? required - remainingMarks : 0
    };
  }

  function textStats(text) {
    var t = String(text == null ? '' : text);
    var words = t.trim() ? t.trim().split(/\s+/).length : 0;
    var sentences = (t.match(/[^.!?]+[.!?]+(?:\s|$)/g) || []).length || (t.trim() ? 1 : 0);
    var paragraphs = t.trim() ? t.trim().split(/\n\s*\n+/).filter(function (p) { return p.trim(); }).length : 0;
    return {
      words: words,
      characters: t.length,
      charactersNoSpaces: t.replace(/\s/g, '').length,
      sentences: sentences,
      paragraphs: paragraphs,
      readingMinutes: words / 200
    };
  }
  function readingTime(words, wpm) {
    if (!isNum(words) || !isNum(wpm) || words < 0 || wpm <= 0) return null;
    return words / wpm;
  }

  function parseDate(value) {
    if (!value || typeof value !== 'string') return null;
    var parts = value.split('-').map(Number);
    if (parts.length !== 3 || parts.some(function (p) { return !isFinite(p); })) return null;
    var d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    if (d.getUTCFullYear() !== parts[0] || d.getUTCMonth() !== parts[1] - 1 || d.getUTCDate() !== parts[2]) return null;
    return d;
  }
  function daysBetween(from, to) {
    var a = parseDate(from), b = parseDate(to);
    if (!a || !b) return null;
    return Math.round((b - a) / 86400000);
  }
  function age(birth, asOf) {
    var b = parseDate(birth), a = parseDate(asOf);
    if (!b || !a || b > a) return null;
    var years = a.getUTCFullYear() - b.getUTCFullYear();
    var months = a.getUTCMonth() - b.getUTCMonth();
    var days = a.getUTCDate() - b.getUTCDate();
    if (days < 0) {
      months--;
      var prev = new Date(Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), 0));
      days += prev.getUTCDate();
    }
    if (months < 0) { years--; months += 12; }
    return { years: years, months: months, days: days, totalDays: Math.round((a - b) / 86400000) };
  }
  function isLeap(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  var UNIT_GROUPS = {
    length: { base: 'm', units: {
      mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344
    } },
    mass: { base: 'g', units: {
      mg: 0.001, g: 1, kg: 1000, t: 1000000, oz: 28.349523125, lb: 453.59237
    } },
    volume: { base: 'L', units: {
      ml: 0.001, L: 1, tsp: 0.00492892159375, tbsp: 0.01478676478125,
      cup: 0.2365882365, 'fl oz': 0.0295735295625, pt: 0.473176473, qt: 0.946352946, gal: 3.785411784
    } }
  };
  function convertUnit(group, from, to, value) {
    if (!isNum(value) || (group !== 'temperature' && !UNIT_GROUPS[group])) return null;
    if (group === 'temperature') {
      var c;
      if (from === 'C') c = value;
      else if (from === 'F') c = (value - 32) * 5 / 9;
      else if (from === 'K') c = value - 273.15;
      else return null;
      if (to === 'C') return c;
      if (to === 'F') return c * 9 / 5 + 32;
      if (to === 'K') return c + 273.15;
      return null;
    }
    var g = UNIT_GROUPS[group];
    if (!g.units[from] || !g.units[to]) return null;
    return value * g.units[from] / g.units[to];
  }

  function formatCitation(style, data) {
    var author = (data.author || '').trim().replace(/\.+$/, '');
    var year = (data.year || '').trim();
    var title = (data.title || '').trim().replace(/\.+$/, '');
    var publisher = (data.publisher || '').trim().replace(/\.+$/, '');
    var edition = (data.edition || '').trim();
    var warnings = [];
    if (!author) warnings.push('Author is missing.');
    if (!title) warnings.push('Title is missing.');
    if (!year) warnings.push('Year is missing.');
    if (!publisher) warnings.push('Publisher is missing.');
    var ed = edition ? ' (' + edition + ' ed.)' : '';
    var text;
    if (style === 'APA') {
      text = (author ? author + '. ' : '') + (year ? '(' + year + '). ' : '') + (title ? title + ed + '. ' : '') + (publisher ? publisher + '.' : '');
    } else if (style === 'MLA') {
      text = (author ? author + '. ' : '') + (title ? title + ed + '. ' : '') + (publisher ? publisher + ', ' : '') + (year ? year + '.' : '');
    } else if (style === 'Chicago') {
      text = (author ? author + '. ' : '') + (year ? year + '. ' : '') + (title ? title + ed + '. ' : '') + (publisher ? publisher + '.' : '');
    } else return null;
    return { text: text.replace(/\s+/g, ' ').trim(), warnings: warnings };
  }

  /* Advanced study analytics helpers. Pure functions: no DOM, no storage. */
  function isoDay(date) { return date.toISOString().slice(0, 10); }

  function hoursSummary(sessions, goalMinutes, todayKey) {
    var rows = Array.isArray(sessions) ? sessions : [];
    var byDay = {}, bySubject = {}, totalMinutes = 0;
    rows.forEach(function (row) {
      var minutes = Number(row && row.minutes);
      var key = row && typeof row.date === 'string' ? row.date.slice(0, 10) : '';
      if (!isNum(minutes) || minutes <= 0 || !parseDate(key)) return;
      byDay[key] = (byDay[key] || 0) + minutes;
      var subject = String((row && row.subject) || 'Unsorted').trim() || 'Unsorted';
      bySubject[subject] = (bySubject[subject] || 0) + minutes;
      totalMinutes += minutes;
    });
    var today = todayKey && parseDate(todayKey) ? todayKey : isoDay(new Date());
    var weekKeys = [], cursor = parseDate(today);
    for (var i = 6; i >= 0; i--) {
      var d = new Date(cursor.getTime() - i * 86400000);
      weekKeys.push(isoDay(d));
    }
    var weekMinutes = weekKeys.reduce(function (a, k) { return a + (byDay[k] || 0); }, 0);
    var goal = isNum(goalMinutes) && goalMinutes > 0 ? goalMinutes : null;
    return {
      byDay: byDay, bySubject: bySubject, weekKeys: weekKeys,
      todayMinutes: byDay[today] || 0, weekMinutes: weekMinutes,
      totalMinutes: totalMinutes, sessionCount: rows.length,
      goalMinutes: goal, goalPercent: goal ? round(weekMinutes / goal * 100, 1) : null,
      averageMinutes: round(weekMinutes / 7, 1)
    };
  }

  function revisionPlan(startDate, examDate, strength) {
    var start = parseDate(startDate);
    if (!start) return null;
    var exam = null;
    if (examDate) { exam = parseDate(examDate); if (!exam) return null; }
    var sets = { easy: [1, 3, 7, 14, 30], medium: [1, 2, 5, 10, 21], hard: [1, 2, 4, 8, 15] };
    var intervals = sets[strength] || sets.medium;
    var plan = [];
    intervals.forEach(function (gap, index) {
      var d = new Date(start.getTime() + gap * 86400000);
      if (exam && d > exam) return;
      plan.push({ stage: index + 1, interval: gap, date: isoDay(d) });
    });
    return plan;
  }

  function gradeGoalPlan(targetPercent, earned, possibleSoFar, remainingMax) {
    if (!isNum(targetPercent) || !isNum(earned) || !isNum(possibleSoFar)) return null;
    if (targetPercent < 0 || targetPercent > 100 || earned < 0 || possibleSoFar < 0) return null;
    var list = (Array.isArray(remainingMax) ? remainingMax : []).map(Number)
      .filter(function (n) { return isNum(n) && n > 0; });
    var remainingPossible = sum(list);
    var grandTotal = possibleSoFar + remainingPossible;
    if (grandTotal <= 0) return null;
    var requiredTotal = round(grandTotal * targetPercent / 100, 2);
    var needed = round(requiredTotal - earned, 2);
    var status = needed <= 0 ? 'achieved' : (needed > remainingPossible ? 'impossible' : 'possible');
    var requiredPercent = remainingPossible > 0 && status === 'possible' ? round(needed / remainingPossible * 100, 1) : null;
    return {
      status: status, grandTotal: grandTotal, requiredTotal: requiredTotal,
      earned: earned, needed: needed, remainingPossible: remainingPossible,
      requiredPercent: requiredPercent,
      perAssessment: list.map(function (max) { return round(needed / remainingPossible * max, 1); }),
      remaining: list.slice()
    };
  }

  function streakStats(dateKeys, todayKey) {
    var counts = {};
    (Array.isArray(dateKeys) ? dateKeys : []).forEach(function (key) {
      if (typeof key !== 'string' || !parseDate(key.slice(0, 10))) return;
      var day = key.slice(0, 10);
      counts[day] = (counts[day] || 0) + 1;
    });
    var keys = Object.keys(counts).sort();
    var today = todayKey && parseDate(todayKey) ? todayKey : isoDay(new Date());
    var cursor = parseDate(today);
    if (!counts[isoDay(cursor)]) cursor = new Date(cursor.getTime() - 86400000);
    var current = 0;
    while (counts[isoDay(cursor)]) {
      current++;
      cursor = new Date(cursor.getTime() - 86400000);
    }
    var longest = 0, run = 0, previous = null;
    keys.forEach(function (key) {
      run = previous && daysBetween(previous, key) === 1 ? run + 1 : 1;
      if (run > longest) longest = run;
      previous = key;
    });
    var last35 = [], anchor = parseDate(today);
    for (var i = 34; i >= 0; i--) {
      var day = isoDay(new Date(anchor.getTime() - i * 86400000));
      last35.push({ date: day, count: counts[day] || 0 });
    }
    return { current: current, longest: longest, totalDays: keys.length, last35: last35, today: today };
  }

  /* Additional advanced dashboards. Still pure: no DOM, storage or network. */
  function syllabusCoverage(topics) {
    if (!Array.isArray(topics)) return null;
    var valid = topics.filter(function (t) { return t && typeof t.subject === 'string' && t.subject.trim(); });
    if (!valid.length) return null;
    var weights = { low: 0.4, medium: 0.7, high: 1 };
    var statuses = { 'not-started': 1, 'in-progress': 1, done: 1 };
    var groups = {}, done = 0, inProgress = 0, notStarted = 0, confidenceTotal = 0;
    valid.forEach(function (t) {
      var subject = t.subject.trim();
      var status = statuses[t.status] ? t.status : 'not-started';
      var confidence = weights[t.confidence] ? t.confidence : 'medium';
      confidenceTotal += weights[confidence];
      if (status === 'done') done++;
      else if (status === 'in-progress') inProgress++;
      else notStarted++;
      var group = groups[subject] || (groups[subject] = { subject: subject, total: 0, done: 0, inProgress: 0 });
      group.total++;
      if (status === 'done') group.done++;
      if (status === 'in-progress') group.inProgress++;
    });
    var bySubject = Object.keys(groups).map(function (key) {
      var g = groups[key];
      g.percent = round(g.done / g.total * 100, 1);
      return g;
    }).sort(function (a, b) {
      return a.percent - b.percent || b.total - a.total || a.subject.localeCompare(b.subject);
    });
    return {
      total: valid.length, done: done, inProgress: inProgress, notStarted: notStarted,
      percent: round(done / valid.length * 100, 1),
      confidencePercent: round(confidenceTotal / valid.length * 100, 1),
      bySubject: bySubject, focus: bySubject.slice(0, 3)
    };
  }

  function readinessScore(values) {
    if (!values || typeof values !== 'object') return null;
    var definitions = [
      { key: 'marks', label: 'Marks average', weight: 0.35 },
      { key: 'coverage', label: 'Syllabus coverage', weight: 0.25 },
      { key: 'revision', label: 'Revision completed', weight: 0.25 },
      { key: 'consistency', label: 'Study consistency', weight: 0.15 }
    ];
    var signals = definitions.map(function (d) {
      var v = Number(values[d.key]);
      if (!isNum(v) || v < 0 || v > 100) return null;
      return { key: d.key, label: d.label, weight: d.weight, value: round(v, 1), contribution: round(v * d.weight, 1) };
    });
    if (signals.some(function (s) { return !s; })) return null;
    var score = round(sum(signals.map(function (s) { return s.value * s.weight; })), 1);
    var band = score >= 80 ? 'Exam ready' : score >= 65 ? 'On track' : score >= 45 ? 'Needs focus' : 'High risk';
    var weakest = signals.slice().sort(function (a, b) { return a.value - b.value || a.weight - b.weight; })[0];
    var advice = {
      marks: 'Work through the required-marks tool for your weakest subject first.',
      coverage: 'Finish one more syllabus topic and mark it complete.',
      revision: 'Open the Spaced Revision Scheduler and clear the next due review.',
      consistency: 'Log one more focused study day to rebuild your streak.'
    };
    return {
      score: score, band: band, weakest: weakest, signals: signals,
      actions: score >= 80
        ? ['Keep the routine going with short, spaced reviews.', 'Use the final week for timed practice and mistake review.']
        : [advice[weakest.key], 'Recheck this score after your next study session.']
    };
  }

  function studyForecast(values) {
    if (!values || typeof values !== 'object') return null;
    var total = Number(values.totalUnits), completed = Number(values.completedUnits);
    var rate = Number(values.unitsPerHour), daily = Number(values.dailyHours), days = Number(values.daysLeft);
    if (!isNum(total) || total <= 0 || !isNum(completed) || completed < 0 || !isNum(rate) || rate <= 0 ||
        !isNum(daily) || daily <= 0 || !isNum(days) || days <= 0) return null;
    completed = Math.min(completed, total);
    var remaining = Math.max(0, total - completed);
    var capacity = rate * daily;
    var projectedUnits = Math.min(total, completed + capacity * days);
    var finishDays = remaining === 0 ? 0 : Math.ceil(remaining / capacity);
    var status = completed >= total ? 'complete' : projectedUnits >= total ? 'on-track' : 'behind';
    var curve = [];
    var steps = Math.min(Math.ceil(days), 10);
    for (var i = 0; i <= steps; i++) {
      var fraction = i / steps;
      var day = round(days * fraction, 1);
      curve.push({
        day: day,
        ideal: round(Math.min(100, (completed + remaining * fraction) / total * 100), 1),
        projected: round(Math.min(100, (completed + capacity * day) / total * 100), 1)
      });
    }
    return {
      total: total, completed: round(completed, 2), remaining: round(remaining, 2),
      projectedUnits: round(projectedUnits, 2),
      projectedPercent: round(projectedUnits / total * 100, 1),
      requiredPerDay: remaining === 0 ? 0 : round(remaining / days, 2),
      requiredHoursPerDay: remaining === 0 ? 0 : round(remaining / days / rate, 1),
      capacityPerDay: round(capacity, 2),
      finishDays: finishDays,
      bufferDays: status === 'on-track' ? Math.max(0, Math.ceil(days) - finishDays) : null,
      status: status, curve: curve
    };
  }

  function priorityMatrix(tasks, dailyHours, todayKey) {
    if (!Array.isArray(tasks)) return null;
    var today = todayKey && parseDate(todayKey) ? todayKey : isoDay(new Date());
    var capacity = isNum(Number(dailyHours)) && Number(dailyHours) > 0 ? Number(dailyHours) : null;
    var importance = { high: 3, medium: 2, low: 1 };
    var rows = [];
    tasks.forEach(function (t) {
      if (!t || !String(t.title || '').trim()) return;
      var due = String(t.due || '').slice(0, 10);
      var left = daysBetween(today, due);
      if (left === null) return;
      var level = importance[t.priority] || 2;
      var hours = isNum(Number(t.hours)) && Number(t.hours) > 0 ? Number(t.hours) : 1;
      var urgency = left <= 0 ? 4 : left <= 2 ? 3 : left <= 7 ? 2 : 1;
      var effort = hours <= 1 ? 2 : hours <= 3 ? 1 : 0;
      rows.push({
        title: String(t.title).trim(), subject: String(t.subject || '').trim(), due: due,
        priority: importance[t.priority] ? t.priority : 'medium', hours: hours,
        daysLeft: left, bucket: left <= 0 ? 'now' : left <= 7 ? 'week' : 'later',
        urgency: urgency, importance: level, score: urgency * level + effort
      });
    });
    if (!rows.length) return null;
    rows.sort(function (a, b) {
      return b.score - a.score || a.daysLeft - b.daysLeft || a.title.localeCompare(b.title);
    });
    var byDay = [], anchor = parseDate(today);
    for (var i = 0; i < 7; i++) {
      var key = isoDay(new Date(anchor.getTime() + i * 86400000));
      var hours = rows.filter(function (r) { return r.due === key; })
        .reduce(function (a, r) { return a + r.hours; }, 0);
      byDay.push({ date: key, hours: round(hours, 1), overload: capacity !== null && hours > capacity });
    }
    var counts = { now: 0, week: 0, later: 0 };
    rows.forEach(function (r) { counts[r.bucket]++; });
    return {
      rows: rows, byDay: byDay, counts: counts, capacity: capacity,
      overloadedDays: byDay.filter(function (d) { return d.overload; }).length,
      totalHours: round(sum(rows.map(function (r) { return r.hours; })), 1)
    };
  }

  /* Learning-theory dashboards. Still pure: these model planning signals,
     not guarantees, and never read storage or the network. */
  function deliberatePractice(values) {
    if (!values || typeof values !== 'object') return null;
    var current = Number(values.currentLevel), target = Number(values.targetLevel);
    var sessions = Number(values.sessionsPerWeek), minutes = Number(values.minutesPerSession), weeks = Number(values.weeks);
    if (!isNum(current) || !isNum(target) || current < 1 || current > 10 || target < 1 || target > 10 || target < current) return null;
    if (!isNum(sessions) || sessions <= 0 || !isNum(minutes) || minutes <= 0 || !isNum(weeks) || weeks <= 0) return null;
    var multipliers = { coach: 1, peer: 1.1, 'past-paper': 1.15, 'self-quiz': 1.25 };
    var multiplier = multipliers[values.feedback] || 1.25;
    var steps = [], hours = 0, level = current;
    while (level < target) {
      var adjusted = round((3 + level * 1.5) * multiplier, 2);
      steps.push({ from: level, to: level + 1, hours: adjusted });
      hours += adjusted;
      level++;
    }
    if (!steps.length) steps.push({ from: current, to: current, hours: 0 });
    var requiredHours = round(hours, 2);
    var weeklyHours = round(sessions * minutes / 60, 2);
    var availableHours = round(weeklyHours * weeks, 2);
    var requiredWeeks = weeklyHours > 0 ? round(requiredHours / weeklyHours, 1) : null;
    var capacityPercent = requiredHours > 0 ? round(availableHours / requiredHours * 100, 1) : 100;
    var themes = ['Weakest subskill', 'Timed repetition', 'Feedback review', 'Mixed recall'];
    var nextSessions = themes.map(function (theme, i) {
      return { number: i + 1, theme: theme, minutes: Math.round(minutes) };
    });
    return {
      currentLevel: current, targetLevel: target, steps: steps, multiplier: multiplier,
      requiredHours: requiredHours, weeklyHours: weeklyHours, availableHours: availableHours,
      requiredWeeks: requiredWeeks, weeklyTarget: round(requiredHours / weeks, 2),
      capacityPercent: capacityPercent, gapHours: round(Math.max(0, requiredHours - availableHours), 2),
      status: availableHours >= requiredHours ? 'enough' : 'short', nextSessions: nextSessions
    };
  }

  function feynmanClarity(text, concept) {
    var content = String(text == null ? '' : text).trim();
    if (content.length < 30) return null;
    var stats = textStats(content);
    var words = content.toLowerCase().match(/[a-z']+/g) || [];
    var simplePercent = words.length ? round(words.filter(function (w) { return w.length <= 6; }).length / words.length * 100, 1) : 0;
    var sentences = Math.max(1, stats.sentences);
    var sentenceLength = round(stats.words / sentences, 1);
    var jargonList = ['utilize', 'utilise', 'methodology', 'paradigm', 'substantiate', 'approximately',
      'fundamental', 'consequently', 'notwithstanding', 'plethora', 'aforementioned', 'inherently'];
    var lower = content.toLowerCase();
    var jargonHits = jargonList.filter(function (word) { return lower.indexOf(word) !== -1; });
    var longWords = words.filter(function (w) { return w.length > 12; }).length;
    var questions = (content.match(/\?/g) || []).length;
    var examples = (content.match(/\b(for example|such as|imagine|e\.g\.)\b/gi) || []).length;
    var mentioned = concept ? lower.indexOf(String(concept).toLowerCase().trim()) !== -1 : false;
    var components = {
      sentences: round(Math.max(0, Math.min(100, 100 - Math.max(0, sentenceLength - 14) * 5)), 1),
      simple: simplePercent,
      teaching: round(Math.min(100, examples * 30 + questions * 15 + (stats.paragraphs > 1 ? 10 : 0)), 1),
      jargon: round(Math.max(0, 100 - jargonHits.length * 15 - longWords * 3), 1),
      coverage: mentioned ? 100 : 70
    };
    var score = round(components.sentences * 0.25 + components.simple * 0.3 + components.teaching * 0.2 +
      components.jargon * 0.15 + components.coverage * 0.1, 1);
    var gaps = [];
    if (sentenceLength > 18) gaps.push('Split long sentences. Aim for about 14 words per sentence.');
    if (simplePercent < 65) gaps.push('Replace long words with everyday words.');
    if (!examples) gaps.push('Add one example or analogy in plain language.');
    if (!questions) gaps.push('Write a question a beginner would ask, then answer it.');
    if (jargonHits.length) gaps.push('Translate jargon: ' + jargonHits.slice(0, 3).join(', ') + '.');
    if (concept && !mentioned) gaps.push('Name the concept explicitly so the explanation stays anchored.');
    if (!gaps.length) gaps.push('The explanation is clear. Test it by teaching it aloud from memory.');
    return {
      score: score, band: score >= 85 ? 'Clear enough to teach' : score >= 70 ? 'Almost there' :
        score >= 50 ? 'Needs simpler words' : 'Find the gaps',
      stats: stats, sentenceLength: sentenceLength, simplePercent: simplePercent,
      jargonHits: jargonHits, longWords: longWords, questions: questions, examples: examples,
      conceptMentioned: mentioned, components: components, gaps: gaps
    };
  }

  function interleavingPlan(rows, options) {
    var list = (Array.isArray(rows) ? rows : []).map(function (row) {
      if (!row || !String(row.name || '').trim()) return null;
      var confidence = { low: 'low', medium: 'medium', high: 'high' }[row.confidence] || 'medium';
      return { name: String(row.name).trim(), confidence: confidence };
    }).filter(Boolean);
    if (list.length < 2) return null;
    var opts = options || {};
    var days = Number(opts.days), minutes = Number(opts.minutesPerDay), session = Number(opts.sessionMinutes);
    if (!isNum(days) || days < 1 || days > 90 || !isNum(minutes) || minutes <= 0 || !isNum(session) || session <= 0) return null;
    var mode = opts.mode === 'weak-first' || opts.mode === 'strict' ? opts.mode : 'weighted';
    var weights = { low: 3, medium: 2, high: 1 };
    var totals = list.map(function () { return { minutes: 0, sessions: 0 }; });
    var counts = list.map(function () { return 0; });
    var anchor = opts.startDate && parseDate(opts.startDate) ? parseDate(opts.startDate) : new Date();
    var schedule = [], last = -1;
    for (var d = 0; d < Math.ceil(days); d++) {
      var date = isoDay(new Date(anchor.getTime() + d * 86400000));
      var slots = Math.max(1, Math.min(4, Math.floor(minutes / session)));
      var chosen = [], used = {};
      for (var s = 0; s < slots; s++) {
        var pick = -1;
        if (mode === 'strict') {
          for (var k = 0; k < list.length; k++) {
            var idx = (d * slots + s + k) % list.length;
            if (idx !== last && !used[idx]) { pick = idx; break; }
          }
        } else {
          /* Pick the topic furthest below its confidence-based share, so weak
             areas really do get more blocks instead of merely more pool entries. */
          var targets = mode === 'weak-first' ? { low: 5, medium: 2, high: 1 } : weights;
          var totalWeight = list.reduce(function (a, topic) { return a + targets[topic.confidence]; }, 0);
          var assigned = schedule.reduce(function (a, day) { return a + day.topics.length; }, 0) + chosen.length;
          var best = -Infinity;
          for (var c = 0; c < list.length; c++) {
            if (used[c] || c === last) continue;
            var deficit = targets[list[c].confidence] / totalWeight * (assigned + 1) - counts[c];
            if (deficit > best + 1e-9) { pick = c; best = deficit; }
          }
        }
        if (pick < 0) {
          for (var q = 0; q < list.length; q++) { if (!used[q]) { pick = q; break; } }
        }
        if (pick < 0) break;
        var spent = chosen.reduce(function (a, x) { return a + x.minutes; }, 0);
        var mins = Math.min(session, minutes - spent);
        if (mins <= 0) break;
        chosen.push({
          name: list[pick].name, confidence: list[pick].confidence, minutes: mins,
          focus: list[pick].confidence === 'low' ? 'Rebuild' : list[pick].confidence === 'medium' ? 'Strengthen' : 'Maintain'
        });
        used[pick] = true;
        totals[pick].minutes += mins;
        totals[pick].sessions++;
        counts[pick]++;
        last = pick;
      }
      schedule.push({ day: d + 1, date: date, topics: chosen, minutes: chosen.reduce(function (a, x) { return a + x.minutes; }, 0) });
    }
    var flat = schedule.reduce(function (a, day) { return a.concat(day.topics); }, []);
    var transitions = 0;
    for (var i = 1; i < flat.length; i++) { if (flat[i].name !== flat[i - 1].name) transitions++; }
    var byTopic = list.map(function (topic, i) {
      return { name: topic.name, confidence: topic.confidence, minutes: round(totals[i].minutes, 1), sessions: totals[i].sessions };
    }).sort(function (a, b) { return b.minutes - a.minutes || a.name.localeCompare(b.name); });
    return {
      schedule: schedule, totals: byTopic,
      mixScore: flat.length > 1 ? round(transitions / (flat.length - 1) * 100, 1) : 0,
      sessionMinutes: session, days: schedule.length,
      totalMinutes: round(schedule.reduce(function (a, day) { return a + day.minutes; }, 0), 1)
    };
  }

  function confidenceCalibration(rows) {
    var list = (Array.isArray(rows) ? rows : []).map(function (row) {
      if (!row) return null;
      var predicted = Number(row.predicted), actual = Number(row.actual);
      if (!isNum(predicted) || !isNum(actual) || predicted < 0 || predicted > 100 || actual < 0 || actual > 100) return null;
      return {
        name: String(row.name || '').trim() || 'Quiz', predicted: round(predicted, 1), actual: round(actual, 1),
        error: round(predicted - actual, 1), absError: round(Math.abs(predicted - actual), 1)
      };
    }).filter(Boolean);
    if (!list.length) return null;
    var meanAbs = round(sum(list.map(function (r) { return r.absError; })) / list.length, 1);
    var bias = round(sum(list.map(function (r) { return r.error; })) / list.length, 1);
    var brier = round(sum(list.map(function (r) { return Math.pow(r.error / 100, 2); })) / list.length, 4);
    var half = Math.max(1, Math.floor(list.length / 2));
    var early = sum(list.slice(0, half).map(function (r) { return r.absError; })) / half;
    var later = list.slice(half);
    var late = later.length ? sum(later.map(function (r) { return r.absError; })) / later.length : early;
    var direction = bias > 5 ? 'Overconfident' : bias < -5 ? 'Underconfident' : 'Well calibrated';
    var trend = late < early - 2 ? 'Improving' : late > early + 2 ? 'Slipping' : 'Steady';
    var advice = direction === 'Overconfident'
      ? ['Before each quiz, write one reason your answer could be wrong.']
      : direction === 'Underconfident'
        ? ['List what you already know before predicting; low estimates can hide real progress.']
        : ['Your estimates are close to your results. Keep making a quick prediction before practice.'];
    if (trend === 'Slipping') advice.push('Your gaps grew later in the list. Review feedback after each quiz.');
    else if (trend === 'Improving') advice.push('Your estimates improved over time. Keep the same routine.');
    else advice.push('Check whether the same topics cause the same errors each time.');
    return {
      rows: list, meanAbsError: meanAbs, bias: bias, brier: brier,
      accuracy: round(100 - meanAbs, 1), direction: direction, trend: trend, advice: advice
    };
  }

  /* ---- Everyday student calculators (no DOM, no eval, no network) ---- */

  function gcd(a, b) {
    a = Math.abs(Math.round(a));
    b = Math.abs(Math.round(b));
    while (b) { var t = a % b; a = b; b = t; }
    return a;
  }

  function factorial(n) {
    var result = 1;
    for (var i = 2; i <= n; i++) result *= i;
    return result;
  }

  function rationalPair(a, b) {
    var scale = 1;
    [a, b].forEach(function (x) {
      var parts = String(x).split('.');
      if (parts[1]) scale = Math.max(scale, Math.pow(10, Math.min(6, parts[1].length)));
    });
    var n = Math.round(a * scale), d = Math.round(b * scale);
    if (!isNum(n) || !isNum(d) || d === 0) return null;
    var g = gcd(n, d);
    if (!g) return null;
    n /= g; d /= g;
    if (d < 0) { n = -n; d = -d; }
    return { n: n, d: d };
  }

  function fractionCalculate(a, b, c, d, op) {
    if (!isNum(a) || !isNum(b) || !isNum(c) || !isNum(d) || b === 0 || d === 0) return null;
    var map = { '+': 'add', '-': 'subtract', '*': 'multiply', '/': 'divide',
      add: 'add', subtract: 'subtract', multiply: 'multiply', divide: 'divide' };
    var mode = map[op];
    if (!mode) return null;
    var first = rationalPair(a, b), second = rationalPair(c, d);
    if (!first || !second) return null;
    if (mode === 'divide' && second.n === 0) return null;
    var n, den;
    if (mode === 'add') { n = first.n * second.d + second.n * first.d; den = first.d * second.d; }
    else if (mode === 'subtract') { n = first.n * second.d - second.n * first.d; den = first.d * second.d; }
    else if (mode === 'multiply') { n = first.n * second.n; den = first.d * second.d; }
    else { n = first.n * second.d; den = first.d * second.n; }
    if (den === 0) return null;
    var g = gcd(n, den) || 1;
    n /= g; den /= g;
    if (den < 0) { n = -n; den = -den; }
    var whole = n >= 0 ? Math.floor(n / den) : Math.ceil(n / den);
    var remainder = Math.abs(n % den);
    var mixed = remainder === 0 ? String(whole) : (whole === 0 ? '' : whole + ' ') + remainder + '/' + den;
    return {
      numerator: n, denominator: den, decimal: round(n / den, 6), mixed: mixed,
      operation: mode, expression: a + '/' + b + ' ' + ({ add: '+', subtract: '−', multiply: '×', divide: '÷' }[mode]) + ' ' + c + '/' + d
    };
  }

  function ratioSolve(a, b, c) {
    if (!isNum(a) || !isNum(b) || !isNum(c) || a <= 0 || b < 0 || c < 0) return null;
    var x = c * b / a;
    return { x: round(x, 6), factor: round(c / a, 6), statement: a + ':' + b + ' = ' + c + ':' + round(x, 6) };
  }

  function ratioSimplify(a, b, total) {
    if (!isNum(a) || !isNum(b) || a <= 0 || b <= 0) return null;
    if (total !== undefined && total !== null && total !== '' && (!isNum(total) || total < 0)) return null;
    var pair = rationalPair(a, b);
    if (!pair) return null;
    var parts = pair.n + pair.d;
    var result = { a: pair.n, b: pair.d, totalParts: parts, shareA: null, shareB: null };
    if (isNum(total)) {
      result.shareA = round(total * pair.n / parts, 4);
      result.shareB = round(total * pair.d / parts, 4);
    }
    return result;
  }

  function parseNumberList(input) {
    var parts;
    if (Array.isArray(input)) parts = input.map(function (x) { return String(x).trim(); });
    else parts = String(input).split(/[\s,;]+/);
    parts = parts.filter(function (x) { return x !== ''; });
    if (!parts.length) return null;
    var list = [];
    for (var i = 0; i < parts.length; i++) {
      var n = Number(parts[i]);
      if (!isNum(n)) return null;
      list.push(n);
    }
    return list;
  }

  function standardDeviation(values) {
    var list = Array.isArray(values) || typeof values === 'string' ? parseNumberList(values) : values;
    if (!list || !list.length || !list.every(isNum)) return null;
    var n = list.length;
    var mean = sum(list) / n;
    var squares = list.map(function (x) { return Math.pow(x - mean, 2); });
    var popVar = sum(squares) / n;
    var sampleVar = n > 1 ? sum(squares) / (n - 1) : null;
    var min = Math.min.apply(null, list), max = Math.max.apply(null, list);
    return {
      count: n, mean: round(mean, 4), min: min, max: max, range: round(max - min, 4),
      populationVariance: round(popVar, 4), populationDeviation: round(Math.sqrt(popVar), 4),
      sampleVariance: sampleVar === null ? null : round(sampleVar, 4),
      sampleDeviation: sampleVar === null ? null : round(Math.sqrt(sampleVar), 4)
    };
  }

  function centralTendency(values) {
    var list = Array.isArray(values) || typeof values === 'string' ? parseNumberList(values) : values;
    if (!list || !list.length || !list.every(isNum)) return null;
    var sorted = list.slice().sort(function (a, b) { return a - b; });
    var mid = Math.floor(sorted.length / 2);
    var median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    var counts = {}, maxCount = 0;
    sorted.forEach(function (x) {
      var key = String(x);
      counts[key] = (counts[key] || 0) + 1;
      if (counts[key] > maxCount) maxCount = counts[key];
    });
    var modes = maxCount > 1 ? Object.keys(counts).filter(function (k) { return counts[k] === maxCount; }).map(Number).sort(function (a, b) { return a - b; }) : [];
    return {
      count: sorted.length, mean: round(sum(sorted) / sorted.length, 4), median: round(median, 4),
      modes: modes, modeLabel: modes.length ? modes.join(', ') : 'No mode',
      min: sorted[0], max: sorted[sorted.length - 1], range: round(sorted[sorted.length - 1] - sorted[0], 4)
    };
  }

  function convertGpaPercent(value, mode) {
    if (!isNum(value)) return null;
    var result, unit, note;
    if (mode === 'gpa-percent') {
      if (value < 0 || value > 4) return null;
      result = value / 4 * 100; unit = '%';
      note = 'Linear conversion on a 4.0 scale. Institutions may use different grade bands.';
    } else if (mode === 'percent-gpa') {
      if (value < 0 || value > 100) return null;
      result = value / 25; unit = 'GPA points';
      note = 'Linear conversion on a 4.0 scale. Official grade bands can differ from this estimate.';
    } else if (mode === 'cgpa-percent') {
      if (value < 0 || value > 10) return null;
      result = value * 9.5; unit = '%';
      note = 'Common 10-point CGPA × 9.5 convention. Check your institution before official use.';
    } else if (mode === 'percent-cgpa') {
      if (value < 0 || value > 100) return null;
      result = value / 9.5; unit = 'CGPA points';
      note = 'Reverse of the common 10-point × 9.5 convention. Check your institution before official use.';
    } else return null;
    return { value: round(result, 2), unit: unit, mode: mode, note: note };
  }

  /* A small, safe expression parser for the Scientific Calculator. It supports
     + - * / % ^ !, parentheses, constants and common functions. It never uses
     eval or Function, so user input is never executed as JavaScript. */
  var SCI_FUNCTIONS = { sin: 1, cos: 1, tan: 1, asin: 1, acos: 1, atan: 1,
    log: 2, ln: 1, sqrt: 1, abs: 1, exp: 1, floor: 1, ceil: 1, round: 1, sign: 1,
    pow: 2, min: 2, max: 2 };

  function sciTokenize(input) {
    var s = String(input).replace(/π/g, 'pi').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/√/g, 'sqrt');
    var tokens = [], i = 0;
    while (i < s.length) {
      var ch = s.charAt(i);
      if (/\s/.test(ch)) { i++; continue; }
      var m = /^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/.exec(s.slice(i));
      if (m) { tokens.push({ type: 'num', value: Number(m[0]) }); i += m[0].length; continue; }
      m = /^[a-zA-Z]+/.exec(s.slice(i));
      if (m) { tokens.push({ type: 'id', value: m[0].toLowerCase() }); i += m[0].length; continue; }
      if ('+-*/^!(),'.indexOf(ch) !== -1) { tokens.push({ type: 'op', value: ch }); i++; continue; }
      throw new Error('Unexpected character');
    }
    return tokens;
  }

  function scientificEvaluate(expression, angleMode) {
    var tokens;
    try { tokens = sciTokenize(expression); } catch (e) { return null; }
    if (!tokens.length) return null;
    var i = 0, deg = angleMode !== 'rad';

    function peek() { return tokens[i]; }
    function take() { return tokens[i++]; }
    function expect(value) { var t = take(); if (!t || t.value !== value) throw new Error('Expected ' + value); }
    function startsPrimary(t) { return !!t && (t.type === 'num' || t.type === 'id' || (t.type === 'op' && t.value === '(')); }
    function toRad(x) { return deg ? x * Math.PI / 180 : x; }
    function fromRad(x) { return deg ? x * 180 / Math.PI : x; }

    function callFunction(name, args) {
      var x = args[0], y = args[1];
      switch (name) {
        case 'sin': return Math.sin(toRad(x));
        case 'cos': return Math.cos(toRad(x));
        case 'tan': return Math.tan(toRad(x));
        case 'asin': if (x < -1 || x > 1) throw new Error('Domain'); return fromRad(Math.asin(x));
        case 'acos': if (x < -1 || x > 1) throw new Error('Domain'); return fromRad(Math.acos(x));
        case 'atan': return fromRad(Math.atan(x));
        case 'log':
          if (x <= 0) throw new Error('Domain');
          if (args.length === 1) return Math.log10(x);
          if (y <= 0 || y === 1) throw new Error('Domain');
          return Math.log(x) / Math.log(y);
        case 'ln': if (x <= 0) throw new Error('Domain'); return Math.log(x);
        case 'sqrt': if (x < 0) throw new Error('Domain'); return Math.sqrt(x);
        case 'abs': return Math.abs(x);
        case 'exp': return Math.exp(x);
        case 'floor': return Math.floor(x);
        case 'ceil': return Math.ceil(x);
        case 'round': return Math.round(x);
        case 'sign': return x > 0 ? 1 : x < 0 ? -1 : 0;
        case 'pow': return Math.pow(x, y);
        case 'min': return Math.min(x, y);
        case 'max': return Math.max(x, y);
        default: throw new Error('Unknown function');
      }
    }

    function parseExpression() {
      var value = parseTerm();
      while (peek() && peek().type === 'op' && (peek().value === '+' || peek().value === '-')) {
        var op = take().value, right = parseTerm();
        value = op === '+' ? value + right : value - right;
      }
      return value;
    }
    function parseTerm() {
      var value = parseUnary();
      while (peek()) {
        var t = peek(), op = null;
        if (t.type === 'op' && (t.value === '*' || t.value === '/' || t.value === '%')) op = take().value;
        else if (startsPrimary(t)) op = '*';
        else break;
        var right = parseUnary();
        if ((op === '/' || op === '%') && right === 0) throw new Error('Divide by zero');
        value = op === '*' ? value * right : op === '/' ? value / right : value % right;
      }
      return value;
    }
    function parseUnary() {
      var t = peek();
      if (t && t.type === 'op' && (t.value === '+' || t.value === '-')) {
        var op = take().value, value = parseUnary();
        return op === '-' ? -value : value;
      }
      return parsePower();
    }
    function parsePower() {
      var value = parsePostfix();
      if (peek() && peek().type === 'op' && peek().value === '^') {
        take();
        value = Math.pow(value, parseUnary());
      }
      return value;
    }
    function parsePostfix() {
      var value = parsePrimary();
      while (peek() && peek().type === 'op' && peek().value === '!') {
        take();
        if (value < 0 || Math.floor(value) !== value || value > 170) throw new Error('Invalid factorial');
        value = factorial(value);
      }
      return value;
    }
    function parsePrimary() {
      var t = take();
      if (!t) throw new Error('Unexpected end');
      if (t.type === 'num') return t.value;
      if (t.type === 'op' && t.value === '(') { var v = parseExpression(); expect(')'); return v; }
      if (t.type === 'id') {
        if (t.value === 'pi') return Math.PI;
        if (t.value === 'e') return Math.E;
        if (t.value === 'tau') return 2 * Math.PI;
        if (!SCI_FUNCTIONS[t.value]) throw new Error('Unknown name');
        expect('(');
        var args = [parseExpression()];
        while (peek() && peek().type === 'op' && peek().value === ',') {
          take();
          if (args.length >= 2) throw new Error('Too many arguments');
          args.push(parseExpression());
        }
        expect(')');
        return callFunction(t.value, args);
      }
      throw new Error('Unexpected token');
    }

    try {
      var value = parseExpression();
      if (i < tokens.length || !isNum(value)) return null;
      return { value: round(value, 10), mode: deg ? 'deg' : 'rad' };
    } catch (e) { return null; }
  }

  var api = {
    isNum: isNum, round: round, sum: sum,
    percentOf: percentOf, percentAmount: percentAmount, percentChange: percentChange, originalFromPercent: originalFromPercent,
    weightedAverage: weightedAverage, gradeFromPercent: gradeFromPercent, marksSummary: marksSummary,
    attendance: attendance, scorePredictor: scorePredictor,
    textStats: textStats, readingTime: readingTime,
    parseDate: parseDate, daysBetween: daysBetween, age: age, isLeap: isLeap,
    convertUnit: convertUnit, UNIT_GROUPS: UNIT_GROUPS, formatCitation: formatCitation,
    isoDay: isoDay, hoursSummary: hoursSummary, revisionPlan: revisionPlan,
    gradeGoalPlan: gradeGoalPlan, streakStats: streakStats,
    syllabusCoverage: syllabusCoverage, readinessScore: readinessScore,
    studyForecast: studyForecast, priorityMatrix: priorityMatrix,
    deliberatePractice: deliberatePractice, feynmanClarity: feynmanClarity,
    interleavingPlan: interleavingPlan, confidenceCalibration: confidenceCalibration,
    gcd: gcd, factorial: factorial, parseNumberList: parseNumberList,
    fractionCalculate: fractionCalculate, ratioSolve: ratioSolve, ratioSimplify: ratioSimplify,
    standardDeviation: standardDeviation, centralTendency: centralTendency,
    convertGpaPercent: convertGpaPercent, scientificEvaluate: scientificEvaluate
  };
  return api;
});
