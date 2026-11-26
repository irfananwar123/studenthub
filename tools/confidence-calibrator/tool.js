(function () {
  'use strict';
  var SH = window.StudentHub, T = SH.tool, C = window.SHC;
  var DRAFT = 'confidenceDraft';
  document.addEventListener('DOMContentLoaded', function () {
    T.init('confidence-calibrator');

    function stat(label, value) {
      return SH.el('div', { class: 'stat' }, [SH.el('strong', { text: value }), SH.el('span', { text: label })]);
    }
    function parseRows(text) {
      return String(text || '').split(/\n+/).map(function (line) {
        var parts = line.split('|').map(function (part) { return String(part).trim(); });
        if (parts.length < 3) return null;
        return { name: parts[0] || 'Quiz', predicted: Number(parts[1]), actual: Number(parts[2]) };
      }).filter(Boolean);
    }
    function show(r) {
      var stats = document.getElementById('cc-stats');
      var list = document.getElementById('cc-list');
      var advice = document.getElementById('cc-advice');
      [stats, list, advice].forEach(function (box) { box.textContent = ''; T.ready(box); });
      [['Accuracy', T.fmt(r.accuracy, 1) + '%'], ['Bias', (r.bias > 0 ? '+' : '') + T.fmt(r.bias, 1)],
       ['Direction', r.direction], ['Trend', r.trend]].forEach(function (pair) {
        stats.appendChild(stat(pair[0], pair[1]));
      });
      var ring = document.getElementById('cc-ring');
      ring.style.setProperty('--pct', r.accuracy + '%');
      ring.dataset.level = r.accuracy >= 85 ? 'good' : r.accuracy >= 70 ? 'ok' : 'warn';
      document.getElementById('cc-ring-label').textContent = T.fmt(r.accuracy, 0) + '%';
      document.getElementById('cc-goal-copy').textContent = r.direction + ' · ' + r.trend.toLowerCase();
      r.rows.forEach(function (row) {
        var over = row.error > 0;
        list.appendChild(SH.el('div', { class: 'list-item' }, [
          SH.el('span', { class: 'badge' + (over ? '' : ' badge-neutral'), text: (over ? '+' : '') + T.fmt(row.error, 1) }),
          SH.el('div', { class: 'list-item-body' }, [
            SH.el('div', { class: 'list-item-title', text: row.name }),
            SH.el('div', { class: 'list-item-meta', text: 'Predicted ' + T.fmt(row.predicted, 1) + '% · actual ' + T.fmt(row.actual, 1) + '%' })
          ]),
          SH.el('strong', { text: over ? 'Over' : 'Under' })
        ]));
      });
      r.advice.forEach(function (text, i) {
        advice.appendChild(SH.el('div', { class: 'list-item' }, [
          SH.el('span', { class: 'badge' + (i ? ' badge-neutral' : ''), text: 'Tip ' + (i + 1) }),
          SH.el('div', { class: 'list-item-body' }, [SH.el('div', { class: 'list-item-title', text: text })])
        ]));
      });
      return r;
    }
    function check() {
      var r = C.confidenceCalibration(parseRows(T.value('cc-rows')));
      if (!r) return T.error('result', 'Add at least one line as Quiz name|predicted %|actual %, with values from 0 to 100.');
      show(r);
      var rows = [
        { label: 'Results checked', value: String(r.rows.length) },
        { label: 'Estimation accuracy', value: T.fmt(r.accuracy, 1) + '%' },
        { label: 'Mean absolute error', value: T.fmt(r.meanAbsError, 1) + ' points' },
        { label: 'Bias', value: (r.bias > 0 ? '+' : '') + T.fmt(r.bias, 1) + ' points' },
        { label: 'Brier-style score', value: T.fmt(r.brier, 4) },
        { heading: 'Verdict' },
        { label: 'Direction', value: r.direction },
        { label: 'Trend', value: r.trend },
        { label: 'First change', value: r.advice[0] }
      ];
      T.result('result', 'Calibration ready', rows, 'A smaller gap means your confidence matches your results, not that you scored higher.',
        Math.abs(r.bias) <= 5 ? 'success' : 'warn');
      return r;
    }
    document.getElementById('confidence-calibrator-form').addEventListener('submit', function (e) {
      e.preventDefault();
      check();
    });
    document.getElementById('cc-demo').addEventListener('click', function () {
      document.getElementById('cc-rows').value = 'Quiz 1|85|70\nQuiz 2|80|65\nQuiz 3|75|68';
      check();
    });
    document.getElementById('cc-save').addEventListener('click', function () {
      SH.storage.prefs.set(DRAFT, { rows: T.value('cc-rows') });
      T.result('result', 'Draft saved', [
        { label: 'Results', value: String(parseRows(T.value('cc-rows')).length) },
        { label: 'Saved on', value: 'This device only' }
      ], 'Your quiz predictions will be restored next time.', 'success');
    });
    try {
      var draft = SH.storage.prefs.get(DRAFT, null);
      if (draft && typeof draft === 'object' && draft.rows) document.getElementById('cc-rows').value = draft.rows;
    } catch (err) { /* ignore an unreadable draft */ }
  });
})();
