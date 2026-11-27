(function () {
  'use strict';
  var T = window.StudentHub.tool, C = window.SHC;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('slope-calculator');
    document.getElementById('slope-calculator-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var x1 = T.number('sl-x1'), y1 = T.number('sl-y1');
      var x2 = T.number('sl-x2'), y2 = T.number('sl-y2');
      if (!C.isNum(x1) || !C.isNum(y1) || !C.isNum(x2) || !C.isNum(y2)) {
        return T.error('result', 'Enter all four coordinates.');
      }
      var out = C.slopeFromPoints(x1, y1, x2, y2);
      if (!out) return T.error('result', 'The coordinates must be finite numbers.');
      if (out.vertical) {
        return T.result('result', 'Vertical line: ' + out.equation, [
          { label: 'Slope', value: 'Undefined' },
          { label: 'Rise', value: T.fmt(out.rise, 6) },
          { label: 'Run', value: '0' },
          { label: 'Equation', value: out.equation },
          { label: 'Distance', value: T.fmt(out.distance, 6) }
        ], 'Both points share the same x-value, so the line is vertical and has no finite slope.');
      }
      T.result('result', 'Slope: ' + T.fmt(out.slope, 6), [
        { label: 'Rise', value: T.fmt(out.rise, 6) },
        { label: 'Run', value: T.fmt(out.run, 6) },
        { label: 'Slope (m)', value: T.fmt(out.slope, 6) },
        { label: 'Y-intercept (b)', value: T.fmt(out.intercept, 6) },
        { label: 'Line equation', value: out.equation },
        { label: 'Angle from x-axis', value: T.fmt(out.angle, 4) + '°' },
        { label: 'Distance between points', value: T.fmt(out.distance, 6) }
      ], 'Slope is rise divided by run. The equation is shown in slope-intercept form.');
    });
  });
})();
