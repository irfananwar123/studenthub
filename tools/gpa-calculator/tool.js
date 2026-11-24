(function () {
  'use strict';
  var SH = window.StudentHub, T = SH.tool, C = window.SHC;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('gpa-calculator');
    var body = document.getElementById('gpa-rows');
    function cell(cls, type, label, value, attrs) {
      var td = document.createElement('td');
      var input = SH.el('input', Object.assign({ type: type, class: cls, 'aria-label': label, value: value == null ? '' : value }, attrs || {}));
      td.appendChild(input);
      return td;
    }
    function addRow(subject, credits, grade) {
      var tr = document.createElement('tr');
      tr.appendChild(cell('gpa-subject', 'text', 'Subject', subject));
      tr.appendChild(cell('gpa-credits', 'number', 'Credits', credits, { min: '0', step: '0.5' }));
      tr.appendChild(cell('gpa-grade', 'text', 'Grade', grade));
      var td = document.createElement('td');
      var btn = SH.el('button', { type: 'button', class: 'btn btn-secondary btn-small', text: '×', 'aria-label': 'Remove subject' });
      btn.addEventListener('click', function () { tr.remove(); });
      td.appendChild(btn); tr.appendChild(td); body.appendChild(tr);
    }
    function scale() {
      var map = {};
      document.getElementById('gpa-points').value.split(/\n/).forEach(function (line) {
        var p = line.split(',');
        if (p.length >= 2 && p[0].trim() && isFinite(Number(p[1]))) map[p[0].trim().toLowerCase()] = Number(p[1]);
      });
      return map;
    }
    document.getElementById('gpa-add').addEventListener('click', function () { addRow('', '', ''); });
    document.getElementById('gpa-demo').addEventListener('click', function () {
      body.textContent = ''; addRow('Algebra', 3, 'A'); addRow('Chemistry', 4, 'B+'); addRow('History', 2, 'A−');
    });
    addRow('Algebra', 3, 'A'); addRow('Chemistry', 4, 'B+'); addRow('History', 2, 'A−');
    document.getElementById('gpa-calculator-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var map = scale();
      if (!Object.keys(map).length) return T.error('result', 'Enter at least one GRADE,POINTS line in the configuration box.');
      var entries = [], details = [], problems = [];
      Array.prototype.forEach.call(body.querySelectorAll('tr'), function (tr) {
        var name = tr.querySelector('.gpa-subject').value.trim();
        var credits = Number(tr.querySelector('.gpa-credits').value);
        var grade = tr.querySelector('.gpa-grade').value.trim();
        if (!name && !credits && !grade) return;
        if (!(credits > 0)) { problems.push(name || 'Unnamed subject'); return; }
        if (!(grade.toLowerCase() in map)) { problems.push(name + ' (grade not configured)'); return; }
        var pts = map[grade.toLowerCase()];
        entries.push({ value: pts, weight: credits });
        details.push({ label: name || 'Subject', value: T.fmt(pts, 2) + ' × ' + T.fmt(credits) + ' cr = ' + T.fmt(pts * credits, 2) });
      });
      if (problems.length) return T.error('result', 'Check these subjects: ' + problems.join(', ') + '. Credits must be positive and grades must be configured.');
      var gpa = C.weightedAverage(entries);
      if (gpa === null) return T.error('result', 'Add at least one valid subject.');
      T.result('result', 'Weighted GPA: ' + T.fmt(gpa, 3), [{ heading: 'Calculation' }].concat(details).concat([
        { heading: 'Summary' },
        { label: 'Total credits', value: T.fmt(C.sum(entries.map(function (x) { return x.weight; }))) },
        { label: 'Weighted GPA', value: T.fmt(gpa, 3) }
      ]), 'Check the result against your institution’s own grading policy.', 'success');
    });
  });
})();
