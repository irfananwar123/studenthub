(function () {
  'use strict';
  var T = window.StudentHub.tool, C = window.SHC;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('quadratic-equation-solver');
    document.getElementById('quadratic-equation-solver-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var a = T.number('qe-a'), b = T.number('qe-b'), c = T.number('qe-c');
      if (!C.isNum(a) || !C.isNum(b) || !C.isNum(c)) return T.error('result', 'Enter all three coefficients.');
      var out = C.quadraticRoots(a, b, c);
      if (!out) return T.error('result', 'Coefficient a cannot be zero in a quadratic equation.');
      var rows = [
        { label: 'Equation', value: T.fmt(a, 6) + 'x² + (' + T.fmt(b, 6) + ')x + (' + T.fmt(c, 6) + ') = 0' },
        { label: 'Discriminant (D)', value: T.fmt(out.discriminant, 6) },
        { label: 'Vertex', value: '(' + T.fmt(out.vertex.x, 6) + ', ' + T.fmt(out.vertex.y, 6) + ')' }
      ];
      var title;
      if (out.type === 'two-real') {
        title = 'Roots: ' + T.fmt(out.roots[0], 6) + ', ' + T.fmt(out.roots[1], 6);
        rows.push({ label: 'Root 1', value: T.fmt(out.roots[0], 6) });
        rows.push({ label: 'Root 2', value: T.fmt(out.roots[1], 6) });
      } else if (out.type === 'one-real') {
        title = 'Repeated root: ' + T.fmt(out.roots[0], 6);
        rows.push({ label: 'Root', value: T.fmt(out.roots[0], 6) + ' (twice)' });
      } else {
        title = 'Complex roots: ' + T.fmt(out.roots[0].real, 6) + ' ± ' + T.fmt(Math.abs(out.roots[0].imaginary), 6) + 'i';
        rows.push({ label: 'Root 1', value: T.fmt(out.roots[0].real, 6) + ' + ' + T.fmt(out.roots[0].imaginary, 6) + 'i' });
        rows.push({ label: 'Root 2', value: T.fmt(out.roots[1].real, 6) + ' + ' + T.fmt(out.roots[1].imaginary, 6) + 'i' });
      }
      T.result('result', title, rows, 'The discriminant tells you whether the roots are real, repeated or complex.');
    });
  });
})();
