(function () {
  'use strict';
  var T = window.StudentHub.tool, C = window.SHC;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('standard-deviation-calculator');
    document.getElementById('standard-deviation-calculator-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var raw = T.value('sd-values');
      if (!raw) return T.error('result', 'Enter at least two numbers separated by commas, spaces or new lines.');
      var list = C.parseNumberList(raw);
      if (!list) return T.error('result', 'Check the list: every item must be a number.');
      var r = C.standardDeviation(list);
      if (!r) return T.error('result', 'Enter at least one valid number.');
      var rows = [
        { label: 'Count', value: String(r.count) },
        { label: 'Mean', value: T.fmt(r.mean, 4) },
        { label: 'Minimum', value: T.fmt(r.min, 4) },
        { label: 'Maximum', value: T.fmt(r.max, 4) },
        { label: 'Range', value: T.fmt(r.range, 4) },
        { label: 'Population variance', value: T.fmt(r.populationVariance, 4) },
        { label: 'Population standard deviation', value: T.fmt(r.populationDeviation, 4) },
        { label: 'Sample variance', value: r.sampleVariance === null ? 'Needs at least two values' : T.fmt(r.sampleVariance, 4) },
        { label: 'Sample standard deviation', value: r.sampleDeviation === null ? 'Needs at least two values' : T.fmt(r.sampleDeviation, 4) }
      ];
      T.result('result', 'Standard deviation: ' + T.fmt(r.populationDeviation, 4) + ' (population)', rows,
        'Use population when the list is the whole group; use sample when it estimates a larger group.');
    });
  });
})();
