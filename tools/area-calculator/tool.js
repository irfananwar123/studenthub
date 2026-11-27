(function () {
  'use strict';
  var T = window.StudentHub.tool, C = window.SHC;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('area-calculator');
    document.getElementById('area-calculator-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var shape = document.getElementById('ar-shape').value;
      var raw = { a: T.value('ar-a'), b: T.value('ar-b'), h: T.value('ar-h'), r: T.value('ar-r') };
      var d = {};
      Object.keys(raw).forEach(function (key) { if (raw[key] !== '') d[key] = Number(raw[key]); });
      var out = C.areaOfShape(shape, d);
      if (!out) return T.error('result', 'Fill the dimensions used by this shape with positive numbers.');
      var names = { rectangle: 'Rectangle', triangle: 'Triangle', circle: 'Circle', trapezoid: 'Trapezoid', parallelogram: 'Parallelogram' };
      var inputs = Object.keys(out.inputs).map(function (key) { return key + ': ' + T.fmt(out.inputs[key], 6); }).join(' · ');
      T.result('result', 'Area: ' + T.fmt(out.area, 6) + ' square units', [
        { label: 'Shape', value: names[shape] },
        { label: 'Formula', value: out.formula },
        { label: 'Dimensions', value: inputs },
        { label: 'Area', value: T.fmt(out.area, 6) + ' square units' }
      ], 'Use the same unit for every dimension; the area is measured in square units.');
    });
  });
})();
