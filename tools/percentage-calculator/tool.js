(function () {
  'use strict';
  var SH = window.StudentHub, T = SH.tool, C = window.SHC;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('percentage-calculator');
    var form = document.getElementById('percentage-calculator-form');
    var mode = 'basic';
    var tabs = document.querySelectorAll('[data-tab]');
    function select(name) {
      mode = name;
      tabs.forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.tab === name)); });
      document.querySelectorAll('[data-panel]').forEach(function (p) { p.hidden = p.dataset.panel !== name; });
    }
    tabs.forEach(function (b) { b.addEventListener('click', function () { select(b.dataset.tab); }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var out = 'result';
      if (mode === 'basic') {
        var p = T.number('p-percent'), n = T.number('p-whole');
        if (!C.isNum(p) || !C.isNum(n)) return T.error(out, 'Enter a percentage and a number.');
        if (p < 0) return T.error(out, 'The percentage cannot be negative here.');
        if (n === 0) return T.error(out, 'The base number must not be zero.');
        var v = C.percentAmount(p, n);
        T.result(out, p + '% of ' + T.fmt(n) + ' = ' + T.fmt(v, 6), [
          { label: 'Result', value: T.fmt(v, 6) },
          { label: 'Calculation', value: T.fmt(n) + ' × ' + T.fmt(p) + ' ÷ 100' }
        ], 'Worked example: 15% of 200 = 30.');
      } else if (mode === 'change') {
        var a = T.number('c-original'), b = T.number('c-new');
        if (!C.isNum(a) || !C.isNum(b)) return T.error(out, 'Enter both the original and the new value.');
        if (a === 0) return T.error(out, 'Percentage change needs a non-zero original value.');
        var change = C.percentChange(a, b);
        T.result(out, (change >= 0 ? 'Increase' : 'Decrease') + ' of ' + T.fmt(Math.abs(change), 4) + '%', [
          { label: 'Percentage change', value: T.fmt(change, 4) + '%' },
          { label: 'Difference', value: T.fmt(b - a, 6) },
          { label: 'Calculation', value: '(' + T.fmt(b) + ' − ' + T.fmt(a) + ') ÷ ' + T.fmt(a) + ' × 100' }
        ], 'A negative result means the value went down.');
      } else {
        var part = T.number('o-part'), pct = T.number('o-percent');
        if (!C.isNum(part) || !C.isNum(pct)) return T.error(out, 'Enter the final value and the change percentage.');
        if (pct <= -100) return T.error(out, 'A decrease of 100% or more cannot be reversed from a positive final value.');
        var original = C.originalFromPercent(part, pct);
        T.result(out, 'Original value = ' + T.fmt(original, 6), [
          { label: 'Original value', value: T.fmt(original, 6) },
          { label: 'Divisor', value: T.fmt(1 + pct / 100, 6) },
          { label: 'Calculation', value: T.fmt(part) + ' ÷ ' + T.fmt(1 + pct / 100, 6) }
        ], 'Use a negative percentage for a decrease, for example −20.');
      }
    });
  });
})();
