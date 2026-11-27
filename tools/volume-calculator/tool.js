(function () {
  'use strict';
  var T = window.StudentHub.tool, C = window.SHC;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('volume-calculator');
    document.getElementById('volume-calculator-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var shape = document.getElementById('vo-shape').value;
      var raw = { a: T.value('vo-a'), b: T.value('vo-b'), h: T.value('vo-h'), r: T.value('vo-r') };
      var d = {};
      Object.keys(raw).forEach(function (key) { if (raw[key] !== '') d[key] = Number(raw[key]); });
      var out = C.volumeOfShape(shape, d);
      if (!out) return T.error('result', 'Fill the dimensions used by this solid with positive numbers.');
      var names = { cube: 'Cube', prism: 'Rectangular prism', cylinder: 'Cylinder', sphere: 'Sphere', cone: 'Cone' };
      var inputs = Object.keys(out.inputs).map(function (key) { return key + ': ' + T.fmt(out.inputs[key], 6); }).join(' · ');
      T.result('result', 'Volume: ' + T.fmt(out.volume, 6) + ' cubic units', [
        { label: 'Solid', value: names[shape] },
        { label: 'Formula', value: out.formula },
        { label: 'Dimensions', value: inputs },
        { label: 'Volume', value: T.fmt(out.volume, 6) + ' cubic units' }
      ], 'Use the same unit for every dimension; the volume is measured in cubic units.');
    });
  });
})();
