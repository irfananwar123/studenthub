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

  function percentOf(part, whole) {
    if (!isNum(part) || !isNum(whole) || whole === 0) return null;
    return (part / whole) * 100;
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
    if (!isNum(value) || !UNIT_GROUPS[group]) return null;
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
    var author = (data.author || '').trim();
    var year = (data.year || '').trim();
    var title = (data.title || '').trim();
    var publisher = (data.publisher || '').trim();
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

  var api = {
    isNum: isNum, round: round, sum: sum,
    percentOf: percentOf, percentChange: percentChange, originalFromPercent: originalFromPercent,
    weightedAverage: weightedAverage, gradeFromPercent: gradeFromPercent, marksSummary: marksSummary,
    attendance: attendance, scorePredictor: scorePredictor,
    textStats: textStats, readingTime: readingTime,
    parseDate: parseDate, daysBetween: daysBetween, age: age, isLeap: isLeap,
    convertUnit: convertUnit, UNIT_GROUPS: UNIT_GROUPS, formatCitation: formatCitation
  };
  return api;
});
