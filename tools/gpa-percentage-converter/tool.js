(function () {
  'use strict';
  var T = window.StudentHub.tool, C = window.SHC;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('gpa-percentage-converter');
    var form = document.getElementById('gpa-percentage-converter-form');
    var mode = 'gpa-percent';
    var fields = {
      'gpa-percent': 'gp-gpa', 'percent-gpa': 'gp-percent-gpa',
      'cgpa-percent': 'gp-cgpa', 'percent-cgpa': 'gp-percent-cgpa'
    };
    var names = {
      'gpa-percent': 'GPA', 'percent-gpa': 'percentage',
      'cgpa-percent': 'CGPA', 'percent-cgpa': 'percentage'
    };
    var ranges = {
      'gpa-percent': 'GPA must be between 0 and 4.', 'percent-gpa': 'Percentage must be between 0 and 100.',
      'cgpa-percent': 'CGPA must be between 0 and 10.', 'percent-cgpa': 'Percentage must be between 0 and 100.'
    };
    var tabs = document.querySelectorAll('[data-tab]');
    function select(name) {
      mode = name;
      tabs.forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.tab === name)); });
      document.querySelectorAll('[data-panel]').forEach(function (p) { p.hidden = p.dataset.panel !== name; });
    }
    tabs.forEach(function (b) { b.addEventListener('click', function () { select(b.dataset.tab); }); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = T.number(fields[mode]);
      if (!C.isNum(value)) return T.error('result', 'Enter a ' + names[mode] + ' value.');
      var out = C.convertGpaPercent(value, mode);
      if (!out) return T.error('result', ranges[mode]);
      T.result('result', T.fmt(value, 4) + ' ' + names[mode] + ' = ' + T.fmt(out.value) + ' ' + out.unit, [
        { label: 'Entered', value: T.fmt(value, 4) + ' ' + names[mode] },
        { label: 'Converted', value: T.fmt(out.value) + ' ' + out.unit },
        { label: 'Scale', value: mode.indexOf('cgpa') !== -1 ? '10-point CGPA × 9.5' : '4.0 GPA linear scale' }
      ], out.note);
    });
  });
})();
