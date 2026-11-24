(function () {
  'use strict';
  var T = window.StudentHub.tool, C = window.SHC;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('exam-score-predictor');
    document.getElementById('exam-score-predictor-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var total = T.number('ep-total'), got = T.number('ep-obtained'), remain = T.number('ep-remaining'), target = T.number('ep-target');
      if (![total, got, remain, target].every(C.isNum)) return T.error('result', 'Enter all four values.');
      var r = C.scorePredictor(total, got, remain, target);
      if (!r) return T.error('result', 'Total marks must be positive; other values cannot be negative and the target must be 0–100.');
      if (got > total) return T.error('result', 'Marks obtained cannot exceed the total course marks.');
      var tone = r.status === 'impossible' ? 'error' : r.status === 'achieved' ? 'success' : 'warning';
      var rows = [
        { label: 'Target marks', value: T.fmt(r.targetMarks, 4) },
        { label: 'Marks obtained so far', value: T.fmt(got, 4) },
        { label: 'Marks still available', value: T.fmt(remain, 4) }
      ];
      if (r.status === 'achieved') rows.push({ label: 'Buffer already secured', value: T.fmt(Math.abs(r.requiredMarks), 4) + ' marks above target' });
      else {
        rows.push({ label: 'Required marks', value: T.fmt(r.requiredMarks, 4) });
        rows.push({ label: 'Required share of remaining marks', value: r.requiredPercent === null ? 'No remaining marks' : T.fmt(r.requiredPercent, 2) + '%' });
        if (r.status === 'impossible') rows.push({ label: 'Shortfall', value: T.fmt(r.shortfall, 4) + ' marks' });
      }
      var title = r.status === 'achieved' ? 'Target already reached in entered marks' : r.status === 'impossible' ? 'Target may be out of reach with these numbers' : 'Required score calculated';
      var note = r.status === 'impossible'
        ? 'Even full marks in the remaining work would not reach the target. Check your numbers or speak to your teacher.'
        : 'This is an arithmetic estimate, not a guaranteed result. Real outcomes depend on future performance and assessment rules.';
      T.result('result', title, rows, note, tone);
    });
  });
})();
