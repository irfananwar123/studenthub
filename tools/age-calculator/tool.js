(function () {
  'use strict';
  var T = window.StudentHub.tool, C = window.SHC;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('age-calculator');
    document.getElementById('age-today').addEventListener('click', function () {
      document.getElementById('age-asof').value = new Date().toISOString().slice(0, 10);
    });
    document.getElementById('age-calculator-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var birth = T.value('age-birth'), asOf = T.value('age-asof');
      var result = C.age(birth, asOf);
      if (!result) return T.error('result', 'Enter a valid birth date and an “as of” date on or after it.');
      T.result('result', T.fmt(result.years) + ' years, ' + T.fmt(result.months) + ' months, ' + T.fmt(result.days) + ' days', [
        { label: 'Years', value: String(result.years) },
        { label: 'Months', value: String(result.months) },
        { label: 'Days', value: String(result.days) },
        { label: 'Total days', value: T.fmt(result.totalDays) },
        { label: 'Born in a leap year', value: C.isLeap(Number(birth.slice(0, 4))) ? 'Yes' : 'No' }
      ], 'Dates are treated as calendar dates, so leap years are handled correctly.', 'success');
    });
  });
})();
