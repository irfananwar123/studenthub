(function () {
  'use strict';
  var T = window.StudentHub.tool, C = window.SHC;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('ratio-calculator');
    var form = document.getElementById('ratio-calculator-form');
    var mode = 'solve';
    var tabs = document.querySelectorAll('[data-tab]');
    function select(name) {
      mode = name;
      tabs.forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.tab === name)); });
      document.querySelectorAll('[data-panel]').forEach(function (p) { p.hidden = p.dataset.panel !== name; });
    }
    tabs.forEach(function (b) { b.addEventListener('click', function () { select(b.dataset.tab); }); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (mode === 'solve') {
        var a = T.number('rt-a'), b = T.number('rt-b'), c = T.number('rt-c');
        if (!C.isNum(a) || !C.isNum(b) || !C.isNum(c)) return T.error('result', 'Enter all three ratio values.');
        var solved = C.ratioSolve(a, b, c);
        if (!solved) return T.error('result', 'The first ratio part must be greater than zero, and the other parts cannot be negative.');
        T.result('result', 'x = ' + T.fmt(solved.x, 6), [
          { label: 'Missing value', value: T.fmt(solved.x, 6) },
          { label: 'Scale factor', value: T.fmt(solved.factor, 6) },
          { label: 'Proportion', value: solved.statement }
        ], 'Both sides are multiplied by the same scale factor.');
      } else {
        var x = T.number('rt-simplify-a'), y = T.number('rt-simplify-b');
        var rawTotal = T.value('rt-total');
        var total = rawTotal === '' ? null : T.number('rt-total');
        if (!C.isNum(x) || !C.isNum(y)) return T.error('result', 'Enter both ratio parts.');
        if (rawTotal !== '' && !C.isNum(total)) return T.error('result', 'The total must be a number if you enter one.');
        var simplified = C.ratioSimplify(x, y, total);
        if (!simplified) return T.error('result', 'Ratio parts must be positive, and the total cannot be negative.');
        var rows = [
          { label: 'Simplified ratio', value: simplified.a + ':' + simplified.b },
          { label: 'Total parts', value: String(simplified.totalParts) }
        ];
        if (simplified.shareA !== null) {
          rows.push({ label: 'First share', value: T.fmt(simplified.shareA, 4) });
          rows.push({ label: 'Second share', value: T.fmt(simplified.shareB, 4) });
        }
        T.result('result', simplified.a + ':' + simplified.b, rows,
          simplified.shareA === null ? 'Enter a total to split it into these ratio shares.' : 'Shares add up to the total you entered.');
      }
    });
  });
})();
