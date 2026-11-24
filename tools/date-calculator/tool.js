(function () {
  'use strict';
  var T = window.StudentHub.tool, C = window.SHC;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('date-calculator');
    var mode = 'diff';
    document.querySelectorAll('[data-date-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        mode = btn.dataset.dateTab;
        document.querySelectorAll('[data-date-tab]').forEach(function (b) { b.setAttribute('aria-selected', String(b === btn)); });
        document.querySelectorAll('[data-date-panel]').forEach(function (p) { p.hidden = p.dataset.datePanel !== mode; });
      });
    });
    document.getElementById('date-calculator-form').addEventListener('submit', function (e) {
      e.preventDefault();
      if (mode === 'diff') {
        var from = T.value('dc-from'), to = T.value('dc-to');
        var days = C.daysBetween(from, to);
        if (days === null) return T.error('result', 'Enter two valid calendar dates.');
        var abs = Math.abs(days);
        T.result('result', abs + (abs === 1 ? ' day' : ' days') + ' between dates', [
          { label: 'Days', value: T.fmt(abs) },
          { label: 'Weeks', value: T.fmt(abs / 7, 4) },
          { label: 'Direction', value: days === 0 ? 'Same date' : days > 0 ? 'End date is later' : 'End date is earlier' }
        ], 'Whole days elapsed between the two dates; the start date is not counted.', 'success');
      } else {
        var base = T.value('dc-base'), n = T.number('dc-days');
        if (!C.parseDate(base)) return T.error('result', 'Enter a valid starting date.');
        if (!C.isNum(n) || !Number.isInteger(n)) return T.error('result', 'Days must be a whole number.');
        if (Math.abs(n) > 365000) return T.error('result', 'Choose a smaller number of days.');
        var d = C.parseDate(base);
        d.setUTCDate(d.getUTCDate() + n);
        var iso = d.toISOString().slice(0, 10);
        T.result('result', 'Resulting date: ' + iso, [
          { label: 'Starting date', value: base },
          { label: 'Days shifted', value: T.fmt(n) },
          { label: 'Result', value: iso },
          { label: 'Weekday', value: d.toLocaleDateString(undefined, { weekday: 'long', timeZone: 'UTC' }) }
        ], 'UTC dates are used so daylight-saving changes do not shift the result.', 'success');
      }
    });
  });
})();
