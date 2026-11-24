(function () {
  'use strict';
  var T = window.StudentHub.tool, C = window.SHC, SH = window.StudentHub;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('unit-converter');
    var category = document.getElementById('uc-category'), from = document.getElementById('uc-from'), to = document.getElementById('uc-to');
    var LABELS = { mm: 'Millimetres (mm)', cm: 'Centimetres (cm)', m: 'Metres (m)', km: 'Kilometres (km)', in: 'Inches (in)', ft: 'Feet (ft)', yd: 'Yards (yd)', mi: 'Miles (mi)',
      mg: 'Milligrams (mg)', g: 'Grams (g)', kg: 'Kilograms (kg)', t: 'Tonnes (t)', oz: 'Ounces (oz)', lb: 'Pounds (lb)',
      ml: 'Millilitres (ml)', L: 'Litres (L)', tsp: 'Teaspoons (US)', tbsp: 'Tablespoons (US)', cup: 'Cups (US)', 'fl oz': 'Fluid ounces (US)', pt: 'Pints (US)', qt: 'Quarts (US)', gal: 'Gallons (US)',
      C: 'Celsius (°C)', F: 'Fahrenheit (°F)', K: 'Kelvin (K)' };
    function units() {
      if (category.value === 'temperature') return ['C', 'F', 'K'];
      return Object.keys(C.UNIT_GROUPS[category.value].units);
    }
    function populate(selectedFrom, selectedTo) {
      var list = units();
      from.textContent = ''; to.textContent = '';
      list.forEach(function (u) {
        from.appendChild(SH.el('option', { value: u, text: LABELS[u] || u }));
        to.appendChild(SH.el('option', { value: u, text: LABELS[u] || u }));
      });
      from.value = selectedFrom && list.indexOf(selectedFrom) !== -1 ? selectedFrom : list[0];
      to.value = selectedTo && list.indexOf(selectedTo) !== -1 ? selectedTo : list[1] || list[0];
    }
    category.addEventListener('change', function () { populate(); });
    document.getElementById('uc-swap').addEventListener('click', function () {
      var a = from.value; from.value = to.value; to.value = a;
    });
    populate('m', 'ft');
    document.getElementById('unit-converter-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var value = T.number('uc-value');
      if (!C.isNum(value)) return T.error('result', 'Enter a number to convert.');
      if (category.value === 'temperature' && from.value === 'K' && value < 0) return T.error('result', 'Kelvin cannot be negative.');
      if (category.value !== 'temperature' && value < 0) return T.error('result', 'This conversion needs a non-negative value.');
      var result = C.convertUnit(category.value, from.value, to.value, value);
      if (result === null || !isFinite(result)) return T.error('result', 'Choose a valid pair of units.');
      T.result('result', T.fmt(value, 6) + ' ' + from.value + ' = ' + T.fmt(result, 6) + ' ' + to.value, [
        { label: 'Input', value: T.fmt(value, 6) + ' ' + from.value },
        { label: 'Output', value: T.fmt(result, 6) + ' ' + to.value },
        { label: 'Category', value: category.options[category.selectedIndex].text }
      ], 'Displayed to at most six decimal places. US customary volume units are used.', 'success');
    });
  });
})();
