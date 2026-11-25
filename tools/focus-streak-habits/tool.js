(function () {
  'use strict';
  var SH = window.StudentHub, T = SH.tool, C = window.SHC;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('focus-streak-habits');
    var entries = [];

    function dayKey(d) {
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
    function load() {
      return SH.storage.all('tasks').then(function (rows) {
        entries = rows.filter(function (row) { return row && row.type === 'habit'; });
        render();
      });
    }
    function stat(label, value) {
      return SH.el('div', { class: 'stat' }, [SH.el('strong', { text: value }), SH.el('span', { text: label })]);
    }
    function render() {
      var today = dayKey(new Date());
      var dates = entries.map(function (row) { return row.date; }).filter(Boolean);
      var stats = C.streakStats(dates, today);

      var box = document.getElementById('fs-stats');
      box.textContent = '';
      [['Current streak', stats.current + (stats.current === 1 ? ' day' : ' days')],
       ['Longest streak', stats.longest + (stats.longest === 1 ? ' day' : ' days')],
       ['Active days', String(stats.totalDays)],
       ['Habits logged', String(entries.length)]].forEach(function (pair) {
        box.appendChild(stat(pair[0], pair[1]));
      });

      var heat = document.getElementById('fs-heatmap');
      heat.textContent = '';
      stats.last35.forEach(function (cell) {
        var level = cell.count === 0 ? 0 : cell.count === 1 ? 1 : cell.count === 2 ? 2 : cell.count === 3 ? 3 : 4;
        heat.appendChild(SH.el('div', {
          class: 'heat-cell heat-' + level,
          title: cell.date + ': ' + cell.count + (cell.count === 1 ? ' habit' : ' habits'),
          'aria-label': cell.date + ': ' + cell.count + (cell.count === 1 ? ' habit' : ' habits')
        }));
      });

      var legend = document.getElementById('fs-legend');
      legend.textContent = '';
      legend.appendChild(SH.el('span', { text: 'Less' }));
      [0, 1, 2, 3, 4].forEach(function (level) {
        legend.appendChild(SH.el('i', { class: 'heat-cell heat-' + level }));
      });
      legend.appendChild(SH.el('span', { text: 'More' }));

      var list = document.getElementById('fs-list');
      list.textContent = '';
      if (!entries.length) {
        list.appendChild(SH.el('div', { class: 'empty-state' }, [
          SH.icon('checkcircle', 28),
          SH.el('strong', { text: 'No habits logged yet' }),
          SH.el('span', { text: 'Log a completed focus habit to start your streak.' })
        ]));
        return;
      }
      entries.slice().sort(function (a, b) {
        return String(b.date).localeCompare(String(a.date)) || String(b.completedAt || '').localeCompare(String(a.completedAt || ''));
      }).forEach(function (row) {
        var line = SH.el('div', { class: 'list-item' });
        var body = SH.el('div', { class: 'list-item-body' }, [
          SH.el('div', { class: 'list-item-title', text: row.habit || 'Focus habit' }),
          SH.el('div', { class: 'list-item-meta', text: 'Completed ' + row.date })
        ]);
        var remove = SH.el('button', { type: 'button', class: 'btn btn-danger btn-small', text: 'Remove' });
        remove.addEventListener('click', function () { SH.storage.remove('tasks', row.id).then(load); });
        line.appendChild(body); line.appendChild(remove); list.appendChild(line);
      });
    }

    document.getElementById('fs-date').value = dayKey(new Date());
    document.getElementById('fs-add').addEventListener('click', function () {
      var habit = T.value('fs-habit');
      var date = T.value('fs-date');
      if (!habit) return T.error('result', 'Enter the habit you completed.');
      if (!C.parseDate(date)) return T.error('result', 'Enter a valid completion date.');
      SH.storage.put('tasks', {
        type: 'habit', habit: habit, date: date, completedAt: new Date().toISOString()
      }).then(function () {
        document.getElementById('fs-habit').value = '';
        load();
        T.result('result', 'Habit logged', [
          { label: 'Habit', value: habit },
          { label: 'Date', value: date }
        ], 'Your streak and heatmap have been updated.', 'success');
      });
    });
    document.getElementById('fs-export').addEventListener('click', function () {
      if (!entries.length) return T.error('result', 'There are no habits to export.');
      var csv = 'Habit,Date,Completed at\n' + entries.map(function (row) {
        return [row.habit, row.date, row.completedAt || '']
          .map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(',');
      }).join('\n');
      var url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      var a = SH.el('a', { href: url, download: 'studenthub-focus-streaks.csv' });
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      T.result('result', 'CSV exported', [{ label: 'Entries', value: String(entries.length) }], 'The file was downloaded to your device.', 'success');
    });
    document.getElementById('fs-clear').addEventListener('click', function () {
      if (!window.confirm('Remove all logged study habits on this device?')) return;
      Promise.all(entries.map(function (row) { return SH.storage.remove('tasks', row.id); })).then(function () {
        load();
        T.result('result', 'Habit history cleared', [{ label: 'Entries removed', value: String(entries.length) }], 'Assignments in other tools were left untouched.', 'success');
      });
    });
    load();
  });
})();
