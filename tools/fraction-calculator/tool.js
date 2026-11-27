(function () {
  'use strict';
  var T = window.StudentHub.tool, C = window.SHC;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('fraction-calculator');
    document.getElementById('fraction-calculator-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var a = T.number('fr-a'), b = T.number('fr-b'), c = T.number('fr-c'), d = T.number('fr-d');
      var op = document.getElementById('fr-op').value;
      if (!C.isNum(a) || !C.isNum(b) || !C.isNum(c) || !C.isNum(d)) {
        return T.error('result', 'Enter all four numerator and denominator values.');
      }
      var result = C.fractionCalculate(a, b, c, d, op);
      if (!result) {
        return T.error('result', 'Check the values: denominators cannot be zero, and you cannot divide by 0/1.');
      }
      var names = { add: 'Sum', subtract: 'Difference', multiply: 'Product', divide: 'Quotient' };
      T.result('result', names[result.operation] + ': ' + result.numerator + '/' + result.denominator, [
        { label: 'Simplified fraction', value: result.numerator + '/' + result.denominator },
        { label: 'Mixed number', value: result.mixed },
        { label: 'Decimal', value: T.fmt(result.decimal, 6) },
        { label: 'Calculation', value: result.expression }
      ], 'The answer is shown in lowest terms. Decimals are rounded to six places for display.');
    });
  });
})();
