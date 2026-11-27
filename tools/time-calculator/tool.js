(function () {
  'use strict';
  var T = window.StudentHub.tool, C = window.SHC;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('time-calculator');
    document.getElementById('time-calculator-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var ids = ['ti-h1', 'ti-m1', 'ti-s1', 'ti-h2', 'ti-m2', 'ti-s2'];
      var vals = ids.map(function (id) { return T.value(id); });
      if (vals.some(function (v) { return v === ''; })) return T.error('result', 'Enter both times in hours, minutes and seconds. Use 0 where a unit is not needed.');
      var nums = vals.map(Number);
      if (nums.some(function (n) { return !C.isNum(n); })) return T.error('result', 'Every field must be a number.');
      var first = { h: nums[0], m: nums[1], s: nums[2] };
      var second = { h: nums[3], m: nums[4], s: nums[5] };
      var op = document.getElementById('ti-op').value;
      var out = C.timeCalculate(first, second, op);
      if (!out) return T.error('result', 'Hours must be zero or more; minutes and seconds must be between 0 and 59.');
      T.result('result', 'Time: ' + out.display, [
        { label: 'Result', value: out.display },
        { label: 'Hours', value: String(out.hours) },
        { label: 'Minutes', value: String(out.minutes) },
        { label: 'Seconds', value: String(out.seconds) },
        { label: 'Decimal hours', value: T.fmt(out.decimalHours, 4) },
        { label: 'Total seconds', value: String(out.totalSeconds) }
      ], out.note || 'Smaller units are regrouped automatically: 60 seconds = 1 minute and 60 minutes = 1 hour.');
    });
  });
})();
