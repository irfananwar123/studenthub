(function () {
  'use strict';
  var SH = window.StudentHub, T = SH.tool, C = window.SHC;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('scientific-calculator');
    var form = document.getElementById('scientific-calculator-form');
    var expression = document.getElementById('sc-expression');
    var angle = document.getElementById('sc-angle');
    var memoryReadout = document.getElementById('sc-memory-readout');
    var historyNode = document.getElementById('sc-history');
    var memory = 0, lastResult = null, history = [];

    try {
      var saved = SH.storage && SH.storage.prefs ? SH.storage.prefs.get('scientificHistory', []) : [];
      if (Array.isArray(saved)) history = saved.slice(0, 5);
    } catch (e) { /* private mode or unavailable storage */ }

    function updateMemory() { memoryReadout.textContent = T.fmt(memory, 10); }
    function updateHistory() {
      historyNode.textContent = history.length ? 'Recent: ' + history.join(' · ') : 'Recent calculations stay on this device.';
    }
    function insert(text) {
      var start = expression.selectionStart == null ? expression.value.length : expression.selectionStart;
      var end = expression.selectionEnd == null ? start : expression.selectionEnd;
      expression.value = expression.value.slice(0, start) + text + expression.value.slice(end);
      expression.focus();
      expression.setSelectionRange(start + text.length, start + text.length);
    }

    document.querySelectorAll('[data-insert]').forEach(function (button) {
      button.addEventListener('click', function () { insert(button.getAttribute('data-insert')); });
    });
    document.getElementById('sc-mplus').addEventListener('click', function () {
      if (lastResult === null) return T.error('result', 'Calculate a value before using memory.');
      memory += lastResult; updateMemory();
    });
    document.getElementById('sc-mminus').addEventListener('click', function () {
      if (lastResult === null) return T.error('result', 'Calculate a value before using memory.');
      memory -= lastResult; updateMemory();
    });
    document.getElementById('sc-mrecall').addEventListener('click', function () { insert(T.fmt(memory, 10)); });
    document.getElementById('sc-mclear').addEventListener('click', function () { memory = 0; updateMemory(); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var raw = T.value('sc-expression');
      if (!raw) return T.error('result', 'Enter a maths expression, for example sin(30)+2^3.');
      var out = C.scientificEvaluate(raw, angle.value);
      if (!out) return T.error('result', 'Check the expression: use brackets for functions, and avoid dividing by zero or invalid domains.');
      lastResult = out.value;
      T.result('result', raw + ' = ' + T.fmt(out.value, 10), [
        { label: 'Result', value: T.fmt(out.value, 10) },
        { label: 'Expression', value: raw },
        { label: 'Angle mode', value: out.mode === 'deg' ? 'Degrees' : 'Radians' }
      ], 'The % key means remainder, not percentage. Use the Percentage Calculator for percentages.');
      history.unshift(raw + ' = ' + T.fmt(out.value, 10));
      history = history.slice(0, 5);
      try {
        if (SH.storage && SH.storage.prefs) SH.storage.prefs.set('scientificHistory', history);
      } catch (err) { /* history is optional */ }
      updateHistory();
    });

    updateMemory();
    updateHistory();
  });
})();
