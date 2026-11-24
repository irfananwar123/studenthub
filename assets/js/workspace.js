(function () {
  'use strict';
  var SH = window.StudentHub, T = SH.tool;
  document.addEventListener('DOMContentLoaded', function () {
    if (!SH.storage) return;
    var status = document.getElementById('ws-status');
    function download(text, name, type) {
      var url = URL.createObjectURL(new Blob([text], { type: type }));
      var a = SH.el('a', { href: url, download: name });
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }
    function renderList(target, ids, emptyText) {
      target.textContent = '';
      if (!ids.length) { target.appendChild(SH.el('p', { class: 'field-hint', text: emptyText })); return; }
      ids.forEach(function (id) {
        var t = SH.findTool(id);
        if (!t) return;
        var row = SH.el('div', { class: 'list-item' });
        row.appendChild(SH.el('div', { class: 'list-item-body' }, [SH.el('div', { class: 'list-item-title' }, [SH.el('a', { href: SH.toolUrl(id), text: t.name })]), SH.el('div', { class: 'list-item-meta', text: t.category })]));
        target.appendChild(row);
      });
    }
    function load() {
      return Promise.all(SH.storage.collections.map(function (name) { return SH.storage.all(name); })).then(function (lists) {
        var counts = {};
        SH.storage.collections.forEach(function (name, i) { counts[name] = lists[i].length; });
        var sessions = lists[SH.storage.collections.indexOf('sessions')] || [];
        var minutes = sessions.reduce(function (a, s) { return a + (Number(s.minutes) || 0); }, 0);
        var favorites = SH.storage.prefs.getFavorites();
        var recent = SH.storage.prefs.getRecentTools();
        var stats = document.getElementById('ws-stats');
        stats.textContent = '';
        [['Favourite tools', String(favorites.length)], ['Recently used', String(recent.length)], ['Study minutes logged', T.fmt(minutes)], ['Notes saved', String(counts.notes || 0)]].forEach(function (p) {
          stats.appendChild(SH.el('div', { class: 'stat' }, [SH.el('strong', { text: p[1] }), SH.el('span', { text: p[0] })]));
        });
        renderList(document.getElementById('ws-favorites'), favorites, 'No favourites yet. Open a tool and choose Save.');
        renderList(document.getElementById('ws-recent'), recent, 'No tools opened yet.');
        var progress = document.getElementById('ws-progress');
        progress.textContent = '';
        var cards = [['Flashcards', counts.flashcards || 0], ['Quiz questions', counts.quizzes || 0], ['Assignments', counts.tasks || 0], ['Exams', counts.exams || 0]];
        cards.forEach(function (p) {
          progress.appendChild(SH.el('div', { class: 'list-item' }, [SH.el('span', { text: p[0] }), SH.el('strong', { text: String(p[1]) })]));
        });
        var goal = 600, pct = Math.min(100, minutes / goal * 100);
        progress.appendChild(SH.el('p', { class: 'field-hint', text: T.fmt(minutes) + ' of ' + goal + ' weekly minutes (illustrative goal)' }));
        var bar = SH.el('div', { class: 'progress' });
        bar.appendChild(SH.el('span', { style: 'width:' + pct + '%' }));
        progress.appendChild(bar);
        var collections = document.getElementById('ws-collections');
        collections.textContent = '';
        SH.storage.collections.forEach(function (name) {
          collections.appendChild(SH.el('div', { class: 'list-item' }, [SH.el('span', { text: name.charAt(0).toUpperCase() + name.slice(1) }), SH.el('strong', { text: String(counts[name]) })]));
        });
      });
    }
    document.getElementById('ws-export').addEventListener('click', function () {
      SH.storage.exportData().then(function (json) {
        download(json, 'studenthub-backup.json', 'application/json');
        status.textContent = 'Backup downloaded. Store it somewhere safe.';
      }).catch(function () { status.textContent = 'Export failed in this browser.'; });
    });
    document.getElementById('ws-import').addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (!file) return;
      file.text().then(function (text) { return SH.storage.importData(text); }).then(function () {
        status.textContent = 'Backup imported. Your local collections were restored.'; load();
      }).catch(function (err) { status.textContent = err.message; });
    });
    document.getElementById('ws-clear').addEventListener('click', function () {
      if (!window.confirm('Permanently delete all StudentHub data stored on this device? This cannot be undone.')) return;
      SH.storage.clearAll().then(function () { status.textContent = 'All local StudentHub data was cleared.'; load(); });
    });
    load();
  });
})();
