(function () {
  'use strict';
  var SH = window.StudentHub;
  document.addEventListener('DOMContentLoaded', function () {
    var box = document.getElementById('recent-tools');
    if (!box || !SH.storage) return;
    var ids = SH.storage.prefs.getRecentTools().slice(0, 3);
    var tools = ids.map(SH.findTool).filter(Boolean);
    if (!tools.length) return;
    box.textContent = '';
    tools.forEach(function (t) {
      var card = SH.el('article', { class: 'tool-card' });
      var iconWrap = SH.el('div', { class: 'card-icon' });
      iconWrap.appendChild(SH.icon('clock', 20));
      card.appendChild(iconWrap);
      var h = SH.el('h3');
      h.appendChild(SH.el('a', { href: SH.toolUrl(t.id), text: t.name }));
      card.appendChild(h);
      card.appendChild(SH.el('p', { text: t.desc }));
      var link = SH.el('a', { class: 'card-link', href: SH.toolUrl(t.id), text: 'Open again →' });
      card.appendChild(link);
      box.appendChild(card);
    });
  });
})();
