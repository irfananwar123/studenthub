(function () {
  'use strict';
  var SH = window.StudentHub, T = SH.tool, C = window.SHC;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('grade-calculator');
    function parseScale(text) {
      var rows = [];
      String(text).split(/\n/).forEach(function (line) {
        var p = line.split(',');
        if (p.length >= 2 && isFinite(Number(p[0])) && p[1].trim()) rows.push({ min: Number(p[0]), label: p[1].trim() });
      });
      return rows.sort(function (a, b) { return b.min - a.min; });
    }
    document.getElementById('grade-calculator-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var marks = T.number('gr-marks'), total = T.number('gr-total');
      if (!C.isNum(marks) || !C.isNum(total)) return T.error('result', 'Enter both marks obtained and total marks.');
      if (marks < 0 || total <= 0) return T.error('result', 'Marks cannot be negative and the total must be greater than zero.');
      var scale = parseScale(document.getElementById('gr-scale').value);
      if (!scale.length) return T.error('result', 'Enter at least one valid MIN%,LABEL line in the boundaries box.');
      var percent = C.percentOf(marks, total);
      var grade = C.gradeFromPercent(percent, scale);
      var next = scale.filter(function (s) { return s.min > percent; }).sort(function (a, b) { return a.min - b.min; })[0];
      var rows = [
        { label: 'Percentage', value: T.fmt(percent, 4) + '%' },
        { label: 'Grade', value: grade }
      ];
      if (next) rows.push({ label: 'Next boundary', value: next.label + ' at ' + T.fmt(next.min, 2) + '%' });
      if (percent > 100) rows.push({ label: 'Note', value: 'Marks exceed the stated total' });
      T.result('result', 'Grade: ' + grade + ' (' + T.fmt(percent, 2) + '%)', rows, 'Formula: ' + T.fmt(marks) + ' ÷ ' + T.fmt(total) + ' × 100 = ' + T.fmt(percent, 4) + '%. Boundaries are the ones you entered.', 'success');
    });
  });
})();
