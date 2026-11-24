(function () {
  'use strict';
  var SH = window.StudentHub, T = SH.tool;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('study-tracker');
    var sessions = [];
    function today() { return new Date().toISOString().slice(0, 10); }
    function dateKey(d) { return d.toISOString().slice(0, 10); }
    function load() { return SH.storage.all('sessions').then(function (rows) { sessions = rows; render(); }); }
    function render() {
      var byDate = {}, bySubject = {};
      sessions.forEach(function (s) {
        byDate[s.date] = (byDate[s.date] || 0) + s.minutes;
        bySubject[s.subject] = (bySubject[s.subject] || 0) + s.minutes;
      });
      var todayTotal = byDate[today()] || 0;
      var weekKeys = [];
      for (var i = 6; i >= 0; i--) { var d = new Date(); d.setDate(d.getDate() - i); weekKeys.push(dateKey(d)); }
      var weekTotal = weekKeys.reduce(function (a, k) { return a + (byDate[k] || 0); }, 0);
      var stats = document.getElementById('tr-stats');
      stats.textContent = '';
      [['Today', T.fmt(todayTotal) + ' min'], ['Last 7 days', T.fmt(weekTotal) + ' min'], ['Sessions', String(sessions.length)], ['Subjects', String(Object.keys(bySubject).length)]].forEach(function (p) {
        stats.appendChild(SH.el('div', { class: 'stat' }, [SH.el('strong', { text: p[1] }), SH.el('span', { text: p[0] })]));
      });
      var chart = document.getElementById('tr-chart');
      chart.textContent = '';
      var max = Math.max(1, Math.max.apply(null, weekKeys.map(function (k) { return byDate[k] || 0; })));
      weekKeys.forEach(function (k) {
        var d = new Date(k + 'T12:00:00Z');
        var minutes = byDate[k] || 0;
        var col = SH.el('div');
        col.title = k + ': ' + minutes + ' minutes';
        col.appendChild(SH.el('span', { style: 'height:' + Math.max(2, minutes / max * 90) + 'px' }));
        col.appendChild(SH.el('small', { text: d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2) }));
        chart.appendChild(col);
      });
      var list = document.getElementById('tr-list');
      list.textContent = '';
      if (!sessions.length) {
        list.appendChild(SH.el('div', { class: 'empty-state' }, [SH.icon('clock', 28), SH.el('strong', { text: 'No sessions logged yet' }), SH.el('span', { text: 'Your study history will appear here.' })]));
        return;
      }
      sessions.slice().sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); }).forEach(function (s) {
        var row = SH.el('div', { class: 'list-item' });
        row.appendChild(SH.el('div', { class: 'list-item-body' }, [SH.el('div', { class: 'list-item-title', text: s.subject }), SH.el('div', { class: 'list-item-meta', text: s.date + ' · ' + T.fmt(s.minutes) + ' minutes' })]));
        var btn = SH.el('button', { type: 'button', class: 'btn btn-danger btn-small', text: 'Remove' });
        btn.addEventListener('click', function () { SH.storage.remove('sessions', s.id).then(load); });
        row.appendChild(btn); list.appendChild(row);
      });
    }
    document.getElementById('tr-date').value = today();
    document.getElementById('tr-add').addEventListener('click', function () {
      var subject = document.getElementById('tr-subject').value.trim();
      var minutes = Number(document.getElementById('tr-minutes').value);
      var date = document.getElementById('tr-date').value;
      if (!subject || !isFinite(minutes) || minutes <= 0 || !date) return T.error('result', 'Enter a subject, positive minutes and a valid date.');
      SH.storage.put('sessions', { subject: subject, minutes: minutes, date: date }).then(function () {
        document.getElementById('tr-subject').value = '';
        document.getElementById('tr-minutes').value = '';
        load();
        T.result('result', 'Session logged', [{ label: 'Subject', value: subject }, { label: 'Minutes', value: T.fmt(minutes) }, { label: 'Date', value: date }], null, 'success');
      });
    });
    document.getElementById('tr-export').addEventListener('click', function () {
      if (!sessions.length) return T.error('result', 'There are no sessions to export.');
      var csv = 'Subject,Minutes,Date\n' + sessions.map(function (s) {
        return [s.subject, s.minutes, s.date].map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(',');
      }).join('\n');
      var url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      var a = SH.el('a', { href: url, download: 'studenthub-study-sessions.csv' });
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      T.result('result', 'CSV exported', [{ label: 'Sessions', value: String(sessions.length) }], 'The file was downloaded to your device.', 'success');
    });
    document.getElementById('tr-clear').addEventListener('click', function () {
      if (!window.confirm('Remove all saved study sessions on this device?')) return;
      SH.storage.clear('sessions').then(function () { load(); T.result('result', 'Sessions cleared', [], null, 'success'); });
    });
    load();
  });
})();
