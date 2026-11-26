(function () {
  'use strict';
  var SH = window.StudentHub, T = SH.tool, C = window.SHC;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('assignment-priority-matrix');
    var assignments = [], matrix = null;

    function stat(label, value) {
      return SH.el('div', { class: 'stat' }, [SH.el('strong', { text: value }), SH.el('span', { text: label })]);
    }
    function empty(target, title, note) {
      target.textContent = '';
      target.appendChild(SH.el('div', { class: 'empty-state' }, [SH.icon('folder', 28), SH.el('strong', { text: title }), SH.el('span', { text: note })]));
    }
    function load() {
      T.loading('pm-list', 3); T.loading('pm-chart', 4);
      return SH.storage.all('tasks').then(function (rows) {
        assignments = rows.filter(function (row) {
          return row && row.type !== 'syllabus' && row.type !== 'habit' && !row.done && row.title && row.due;
        });
        render();
      });
    }
    function render() {
      matrix = C.priorityMatrix(assignments, T.number('pm-capacity'));
      var stats = document.getElementById('pm-stats');
      var list = document.getElementById('pm-list');
      var chart = document.getElementById('pm-chart');
      var alert = document.getElementById('pm-alert');
      [stats, list, chart, alert].forEach(function (box) { box.textContent = ''; T.ready(box); });
      if (!matrix) {
        ['Assignments', 'Due this week', 'Later', 'Total hours'].forEach(function (label) { stats.appendChild(stat(label, '0')); });
        empty(list, 'No assignments yet', 'Add one above, or save an assignment in the Assignment Planner.');
        empty(chart, 'No workload to show', 'Seven-day workload will appear here.');
        return null;
      }
      [['Assignments', String(matrix.rows.length)], ['Now / overdue', String(matrix.counts.now)],
       ['This week', String(matrix.counts.week)], ['Total hours', T.fmt(matrix.totalHours, 1)]].forEach(function (p) {
        stats.appendChild(stat(p[0], p[1]));
      });
      if (matrix.overloadedDays) {
        alert.appendChild(SH.el('div', { class: 'notice notice-warning' }, [
          SH.el('strong', { text: matrix.overloadedDays + ' overloaded day' + (matrix.overloadedDays === 1 ? '' : 's') + ' ahead' }),
          SH.el('span', { text: 'Move work from the red bars to a lighter day before those deadlines arrive.' })
        ]));
      } else {
        alert.appendChild(SH.el('div', { class: 'notice' }, [
          SH.el('strong', { text: 'The next seven days look manageable' }),
          SH.el('span', { text: 'No single day exceeds your available hours.' })
        ]));
      }
      matrix.rows.forEach(function (row) {
        var item = SH.el('div', { class: 'list-item' });
        var body = SH.el('div', { class: 'list-item-body' }, [
          SH.el('div', { class: 'list-item-title', text: row.title }),
          SH.el('div', { class: 'list-item-meta', text: row.subject ? row.subject + ' · ' : '' }),
        ]);
        body.lastChild.textContent += row.due + ' · ' + row.daysLeft + ' days left · ' + T.fmt(row.hours, 2) + ' hours · ' + row.priority + ' priority';
        item.appendChild(body);
        item.appendChild(SH.el('span', { class: 'badge' + (row.bucket === 'now' ? '' : ' badge-neutral'), text: 'Score ' + row.score }));
        list.appendChild(item);
      });
      var max = Math.max.apply(null, matrix.byDay.map(function (d) { return d.hours; }).concat([matrix.capacity || 0, 1]));
      matrix.byDay.forEach(function (day) {
        var row = SH.el('div', { class: 'bar-row' + (day.overload ? ' is-over' : '') });
        row.appendChild(SH.el('span', { class: 'bar-label', text: day.date.slice(5) }));
        var track = SH.el('div', { class: 'bar-track' });
        var fill = SH.el('span', { class: 'bar-fill' });
        fill.style.width = Math.max(2, day.hours / max * 100) + '%';
        track.appendChild(fill);
        if (matrix.capacity) {
          var marker = SH.el('i', { class: 'bar-capacity' });
          marker.style.left = Math.min(100, matrix.capacity / max * 100) + '%';
          track.appendChild(marker);
        }
        row.appendChild(track);
        row.appendChild(SH.el('strong', { text: T.fmt(day.hours, 1) + 'h' }));
        chart.appendChild(row);
      });
      return matrix;
    }
    document.getElementById('pm-add').addEventListener('click', function () {
      var title = T.value('pm-title');
      var due = T.value('pm-due');
      if (!title || !due || !C.parseDate(due)) return T.error('result', 'Enter an assignment name and a valid due date.');
      T.loading('pm-list', 3);
      SH.storage.put('tasks', {
        type: 'assignment', title: title, due: due, priority: T.value('pm-priority') || 'medium',
        hours: T.number('pm-hours') > 0 ? T.number('pm-hours') : 1,
        subject: T.value('pm-subject'), done: false
      }).then(function () {
        document.getElementById('pm-title').value = '';
        document.getElementById('pm-due').value = '';
        load();
        T.result('result', 'Assignment added', [
          { label: 'Assignment', value: title }, { label: 'Due', value: due },
          { label: 'Priority', value: T.value('pm-priority') }
        ], 'The matrix has been refreshed with your new assignment.', 'success');
      });
    });
    document.getElementById('pm-refresh').addEventListener('click', function () {
      load().then(function () {
        T.result('result', 'Matrix refreshed', [
          { label: 'Assignments', value: String(assignments.length) },
          { label: 'Total hours', value: matrix ? T.fmt(matrix.totalHours, 1) : '0' }
        ], 'Saved assignments are read fresh from this device.', 'success');
      });
    });
    document.getElementById('pm-capacity').addEventListener('input', render);
    document.getElementById('pm-export').addEventListener('click', function () {
      if (!matrix) return T.error('result', 'There are no assignments to export.');
      var csv = 'Rank,Title,Subject,Due,Priority,Hours,Days left,Score\n' + matrix.rows.map(function (r, i) {
        return [i + 1, r.title, r.subject, r.due, r.priority, r.hours, r.daysLeft, r.score]
          .map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(',');
      }).join('\n');
      var url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      var a = SH.el('a', { href: url, download: 'studenthub-assignment-priority.csv' });
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      T.result('result', 'CSV exported', [{ label: 'Assignments', value: String(matrix.rows.length) }], 'The ranked list was downloaded to your device.', 'success');
    });
    load();
  });
})();
