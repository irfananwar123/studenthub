(function () {
  'use strict';
  var SH = window.StudentHub, T = SH.tool, C = window.SHC;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('cgpa-calculator');
    var body = document.getElementById('cg-rows');
    var SCALES = {
      default: 'A+,4.0\nA,4.0\nA−,3.7\nB+,3.3\nB,3.0\nB−,2.7\nC+,2.3\nC,2.0\nC−,1.7\nD,1.0\nF,0',
      ten: 'A+,10\nA,9\nA−,8.5\nB+,8\nB,7\nB−,6.5\nC+,6\nC,5\nD,4\nF,0'
    };
    function parseScale(text) {
      var map = {};
      String(text).split(/\n/).forEach(function (line) {
        var parts = line.split(',');
        if (parts.length < 2) return;
        var key = parts[0].trim(), value = Number(parts[1]);
        if (key && isFinite(value)) map[key.toLowerCase()] = value;
      });
      return map;
    }
    function inputCell(className, type, label, value, extra) {
      var td = document.createElement('td');
      var input = SH.el('input', Object.assign({ type: type, class: className, 'aria-label': label, value: value == null ? '' : value }, extra || {}));
      td.appendChild(input);
      return td;
    }
    function addRow(subject, credits, grade) {
      var tr = document.createElement('tr');
      tr.appendChild(inputCell('cg-subject', 'text', 'Subject name', subject));
      tr.appendChild(inputCell('cg-credits', 'number', 'Credits', credits, { min: '0', step: '0.5' }));
      tr.appendChild(inputCell('cg-grade', 'text', 'Grade', grade));
      var td = document.createElement('td');
      var remove = SH.el('button', { type: 'button', class: 'btn btn-secondary btn-small cg-remove', text: '×', 'aria-label': 'Remove subject' });
      remove.addEventListener('click', function () { tr.remove(); });
      td.appendChild(remove);
      tr.appendChild(td);
      body.appendChild(tr);
    }
    document.getElementById('cg-scale').addEventListener('change', function (e) {
      var key = e.target.value;
      if (SCALES[key]) document.getElementById('cg-custom').value = SCALES[key];
    });
    document.getElementById('cg-add').addEventListener('click', function () { addRow('', '', ''); });
    document.getElementById('cg-demo').addEventListener('click', function () {
      body.textContent = '';
      addRow('Mathematics', 4, 'A−'); addRow('Physics', 3, 'B'); addRow('English', 2, 'A');
    });
    addRow('Mathematics', 4, 'A−'); addRow('Physics', 3, 'B'); addRow('English', 2, 'A');
    document.getElementById('cgpa-calculator-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var scale = parseScale(document.getElementById('cg-custom').value);
      var rows = Array.prototype.map.call(body.querySelectorAll('tr'), function (tr) {
        return {
          subject: tr.querySelector('.cg-subject').value.trim(),
          credits: Number(tr.querySelector('.cg-credits').value),
          grade: tr.querySelector('.cg-grade').value.trim()
        };
      }).filter(function (r) { return r.grade || r.credits > 0; });
      if (!rows.length) return T.error('result', 'Add at least one subject with credits and a grade.');
      if (!Object.keys(scale).length) return T.error('result', 'Enter at least one GRADE,POINTS line in the custom scale box.');
      var entries = [], output = [], bad = [];
      rows.forEach(function (r) {
        if (!(r.credits > 0)) { bad.push(r.subject || 'Unnamed subject'); return; }
        var key = r.grade.toLowerCase();
        if (!(key in scale)) { bad.push(r.subject + ' (unknown grade ' + r.grade + ')'); return; }
        entries.push({ value: scale[key], weight: r.credits });
        output.push({ label: r.subject || 'Subject', value: T.fmt(scale[key], 2) + ' × ' + T.fmt(r.credits) + ' cr' });
      });
      if (bad.length) return T.error('result', 'Check: ' + bad.join(', ') + '. Credits must be positive and grades must appear in the scale.');
      var cgpa = C.weightedAverage(entries);
      if (cgpa === null) return T.error('result', 'Total credits must be greater than zero.');
      T.result('result', 'Estimated CGPA: ' + T.fmt(cgpa, 3), [
        { heading: 'Subject contributions' }
      ].concat(output).concat([
        { heading: 'Summary' },
        { label: 'Total credits', value: T.fmt(C.sum(entries.map(function (x) { return x.weight; }))) },
        { label: 'Weighted points', value: T.fmt(C.sum(entries.map(function (x) { return x.value * x.weight; })), 3) },
        { label: 'CGPA', value: T.fmt(cgpa, 3) }
      ]), 'General estimate only. Your institution’s published grading rules always take priority.', 'success');
    });
  });
})();
