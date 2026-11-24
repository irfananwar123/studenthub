(function () {
  'use strict';
  var SH = window.StudentHub, T = SH.tool, C = window.SHC;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('marks-calculator');
    var body = document.getElementById('mk-rows');
    function cell(cls, type, label, value, attrs) {
      var td = document.createElement('td');
      td.appendChild(SH.el('input', Object.assign({ type: type, class: cls, 'aria-label': label, value: value == null ? '' : value }, attrs || {})));
      return td;
    }
    function addRow(subject, marks, max) {
      var tr = document.createElement('tr');
      tr.appendChild(cell('mk-subject', 'text', 'Subject', subject));
      tr.appendChild(cell('mk-marks', 'number', 'Marks obtained', marks, { min: '0', step: 'any' }));
      tr.appendChild(cell('mk-max', 'number', 'Maximum marks', max, { min: '0', step: 'any' }));
      var td = document.createElement('td');
      var btn = SH.el('button', { type: 'button', class: 'btn btn-secondary btn-small', text: '×', 'aria-label': 'Remove subject' });
      btn.addEventListener('click', function () { tr.remove(); });
      td.appendChild(btn); tr.appendChild(td); body.appendChild(tr);
    }
    document.getElementById('mk-add').addEventListener('click', function () { addRow('', '', ''); });
    document.getElementById('mk-demo').addEventListener('click', function () {
      body.textContent = ''; addRow('Mathematics', 85, 100); addRow('Science', 72, 80); addRow('English', 91, 100);
    });
    addRow('Mathematics', 85, 100); addRow('Science', 72, 80); addRow('English', 91, 100);
    document.getElementById('marks-calculator-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var rows = Array.prototype.map.call(body.querySelectorAll('tr'), function (tr) {
        return { subject: tr.querySelector('.mk-subject').value.trim(), marks: Number(tr.querySelector('.mk-marks').value), max: Number(tr.querySelector('.mk-max').value) };
      });
      var summary = C.marksSummary(rows);
      if (!summary) return T.error('result', 'Add at least one subject with non-negative marks and a positive maximum.');
      var invalid = rows.filter(function (r) { return r.subject || r.marks || r.max; }).length !== summary.count;
      var details = summary.rows.map(function (r) { return { label: r.subject, value: T.fmt(r.marks) + ' / ' + T.fmt(r.max) + ' = ' + T.fmt(r.percent, 2) + '%' }; });
      T.result('result', 'Overall: ' + T.fmt(summary.percent, 2) + '%', [{ heading: 'Subjects' }].concat(details).concat([
        { heading: 'Summary' },
        { label: 'Marks obtained', value: T.fmt(summary.obtained, 4) },
        { label: 'Maximum marks', value: T.fmt(summary.maximum, 4) },
        { label: 'Overall percentage', value: T.fmt(summary.percent, 4) + '%' },
        { label: 'Average of subject percentages', value: T.fmt(summary.averagePercent, 4) + '%' }
      ]), invalid ? 'Some rows were incomplete or invalid and were skipped.' : 'All complete rows were included.', 'success');
    });
  });
})();
