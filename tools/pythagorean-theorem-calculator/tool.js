(function () {
  'use strict';
  var T = window.StudentHub.tool, C = window.SHC;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('pythagorean-theorem-calculator');
    document.getElementById('pythagorean-theorem-calculator-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var a = T.number('py-a'), b = T.number('py-b'), c = T.number('py-c');
      var mode = document.getElementById('py-mode').value;
      if (!C.isNum(a) || !C.isNum(b) || !C.isNum(c)) return T.error('result', 'Enter all three side fields; use 0 for the side you want to find.');
      var out = C.pythagorean(a, b, c, mode);
      if (!out) return T.error('result', 'Check the sides: dimensions cannot be negative, and the hypotenuse must be longer than a known leg.');
      T.result('result', 'Side ' + out.missing + ' = ' + T.fmt(out.value, 6), [
        { label: 'Missing side', value: out.missing + ' = ' + T.fmt(out.value, 6) },
        { label: 'Leg a', value: T.fmt(out.legs[0], 6) },
        { label: 'Leg b', value: T.fmt(out.legs[1], 6) },
        { label: 'Hypotenuse', value: T.fmt(out.hypotenuse, 6) },
        { label: 'Working', value: out.statement }
      ], 'The theorem a² + b² = c² applies only to right triangles.');
    });
  });
})();
