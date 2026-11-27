(function () {
  'use strict';
  var T = window.StudentHub.tool, C = window.SHC;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('mean-median-mode-calculator');
    document.getElementById('mean-median-mode-calculator-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var raw = T.value('mm-values');
      if (!raw) return T.error('result', 'Enter at least one number separated by commas, spaces or new lines.');
      var list = C.parseNumberList(raw);
      if (!list) return T.error('result', 'Check the list: every item must be a number.');
      var r = C.centralTendency(list);
      if (!r) return T.error('result', 'Enter at least one valid number.');
      T.result('result', 'Mean ' + T.fmt(r.mean, 4) + ' · Median ' + T.fmt(r.median, 4), [
        { label: 'Count', value: String(r.count) },
        { label: 'Mean', value: T.fmt(r.mean, 4) },
        { label: 'Median', value: T.fmt(r.median, 4) },
        { label: 'Mode', value: r.modeLabel },
        { label: 'Minimum', value: T.fmt(r.min, 4) },
        { label: 'Maximum', value: T.fmt(r.max, 4) },
        { label: 'Range', value: T.fmt(r.range, 4) }
      ], 'Mode lists every value that appears most often. If all values are unique, there is no mode.');
    });
  });
})();
