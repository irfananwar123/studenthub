(function () {
  'use strict';
  var T = window.StudentHub.tool, SH = window.StudentHub;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('text-case-converter');
    var input = document.getElementById('tc-input'), output = document.getElementById('tc-output');
    function capWord(w) { return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); }
    function convert(mode, text) {
      if (mode === 'upper') return text.toUpperCase();
      if (mode === 'lower') return text.toLowerCase();
      if (mode === 'title') return text.replace(/\S+/g, capWord);
      if (mode === 'sentence') {
        var done = false;
        return text.replace(/\S+/g, function (w) {
          if (!done) { done = true; return capWord(w); }
          return w.toLowerCase();
        });
      }
      return text;
    }
    document.querySelectorAll('[data-tc-case]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!input.value) return T.error('result', 'Enter some text to convert.');
        output.value = convert(btn.dataset.tcCase, input.value);
        T.result('result', 'Text converted', [{ label: 'Mode', value: btn.textContent }], 'Copy the result when you are happy with it.', 'success');
        document.querySelectorAll('[data-tc-case]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      });
    });
    document.getElementById('tc-copy').addEventListener('click', function () { T.copyText(output.value, this); });
    document.getElementById('tc-swap').addEventListener('click', function () {
      if (!output.value) return T.error('result', 'Convert some text first.');
      input.value = output.value; output.value = ''; input.focus();
    });
  });
})();
