(function () {
  'use strict';
  var T = window.StudentHub.tool, SH = window.StudentHub;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('character-counter');
    var text = document.getElementById('cc-text'), stats = document.getElementById('cc-stats'), mode = 'with';
    function render() {
      var value = text.value;
      var shown = mode === 'with' ? value.length : value.replace(/\s/g, '').length;
      var words = value.trim() ? value.trim().split(/\s+/).length : 0;
      var lines = value ? value.split(/\r\n|\r|\n/).length : 0;
      stats.textContent = '';
      [[mode === 'with' ? 'Characters (spaces included)' : 'Characters (spaces excluded)', String(shown)], ['Words', String(words)], ['Lines', String(lines)]].forEach(function (p) {
        stats.appendChild(SH.el('div', { class: 'stat' }, [SH.el('strong', { text: p[1] }), SH.el('span', { text: p[0] })]));
      });
    }
    document.querySelectorAll('[data-cc-mode]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        mode = btn.dataset.ccMode;
        document.querySelectorAll('[data-cc-mode]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        render();
      });
    });
    text.addEventListener('input', render);
    document.getElementById('cc-copy').addEventListener('click', function () { T.copyText(text.value, this); });
    document.getElementById('cc-clear').addEventListener('click', function () { text.value = ''; render(); text.focus(); });
    render();
  });
})();
