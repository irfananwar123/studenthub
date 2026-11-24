(function () {
  'use strict';
  var T = window.StudentHub.tool, C = window.SHC;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('attendance-calculator');
    document.getElementById('attendance-calculator-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var a = T.number('at-attended'), total = T.number('at-total'), target = T.number('at-target');
      if (!C.isNum(a) || !C.isNum(total) || !C.isNum(target)) return T.error('result', 'Enter all three values.');
      var result = C.attendance(a, total, target);
      if (!result) return T.error('result', 'Check the values: attended cannot exceed total, and all numbers must be non-negative. Target must be 0–100.');
      if (total === 0 || result.percent === null) return T.error('result', 'Enter at least one total class to calculate a percentage.');
      var tone = result.achieved ? 'success' : 'warning';
      var rows = [
        { label: 'Current attendance', value: T.fmt(result.percent, 4) + '%' },
        { label: 'Target', value: T.fmt(target, 2) + '%' },
        { label: 'Status', value: result.achieved ? 'Target met' : 'Below target' }
      ];
      if (result.achieved) rows.push({ label: 'More classes you can miss', value: T.fmt(result.maxMissed) + ' (of a fixed total)' });
      else rows.push({ label: 'Extra attended classes needed', value: result.needed === null ? 'Not possible at a 100% target' : T.fmt(result.needed) });
      T.result('result', result.achieved ? 'Target met: ' + T.fmt(result.percent, 2) + '%' : 'Below target: ' + T.fmt(result.percent, 2) + '%', rows,
        'Assumption: every further class is attended and the course has a fixed number of classes. Institutional counting rules may differ.', tone);
    });
  });
})();
