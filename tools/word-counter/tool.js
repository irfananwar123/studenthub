(function () {
  'use strict';
  var T = window.StudentHub.tool, C = window.SHC, SH = window.StudentHub;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('word-counter');
    var text = document.getElementById('wc-text'), stats = document.getElementById('wc-stats');
    function render() {
      var s = C.textStats(text.value);
      stats.textContent = '';
      [['Words', String(s.words)], ['Characters', String(s.characters)], ['Characters no spaces', String(s.charactersNoSpaces)],
        ['Sentences', String(s.sentences)], ['Paragraphs', String(s.paragraphs)], ['Reading time', T.fmt(s.readingMinutes, 2) + ' min']].forEach(function (p) {
        stats.appendChild(SH.el('div', { class: 'stat' }, [SH.el('strong', { text: p[1] }), SH.el('span', { text: p[0] })]));
      });
    }
    text.addEventListener('input', render);
    document.getElementById('wc-copy').addEventListener('click', function () { T.copyText(text.value, this); });
    document.getElementById('wc-clear').addEventListener('click', function () { text.value = ''; render(); text.focus(); });
    render();
  });
})();
