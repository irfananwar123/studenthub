(function () {
  'use strict';
  var SH = window.StudentHub, T = SH.tool;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('assignment-planner');
    var tasks = [], filter = 'open', editing = null;
    var list = document.getElementById('ap-list');
    var rank = { high: 0, medium: 1, low: 2 };
    function daysLeft(date) {
      if (!date) return null;
      var d = new Date(date + 'T00:00:00Z'), now = new Date();
      var today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
      return Math.round((d.getTime() - today) / 86400000);
    }
    function render() {
      list.textContent = '';
      var shown = tasks.filter(function (t) { return filter === 'all' || (filter === 'open' ? !t.done : t.done); });
      shown.sort(function (a, b) {
        if (a.done !== b.done) return a.done ? 1 : -1;
        if (a.due !== b.due) return (a.due || '9999').localeCompare(b.due || '9999');
        return rank[a.priority] - rank[b.priority];
      });
      if (!shown.length) {
        list.appendChild(SH.el('div', { class: 'empty-state' }, [SH.icon('checkcircle', 28), SH.el('strong', { text: 'Nothing in this view' }), SH.el('span', { text: filter === 'open' ? 'Add an assignment or switch to All.' : 'No assignments match this filter.' })]));
        return;
      }
      shown.forEach(function (task) {
        var row = SH.el('div', { class: 'list-item' });
        var body = SH.el('div', { class: 'list-item-body' });
        body.appendChild(SH.el('div', { class: 'list-item-title', text: task.title + (task.done ? ' ✓' : '') }));
        var left = daysLeft(task.due);
        var meta = (task.subject ? task.subject + ' · ' : '') + 'Due ' + (task.due || 'no date') +
          (left === null ? '' : left < 0 ? ' · Overdue by ' + Math.abs(left) + ' day(s)' : left === 0 ? ' · Due today' : ' · ' + left + ' day(s) left');
        body.appendChild(SH.el('div', { class: 'list-item-meta', text: meta }));
        row.appendChild(body);
        var actions = SH.el('div', { class: 'list-actions' });
        var edit = SH.el('button', { type: 'button', class: 'btn btn-secondary btn-small', text: 'Edit' });
        edit.addEventListener('click', function () {
          editing = task;
          document.getElementById('ap-title').value = task.title;
          document.getElementById('ap-due').value = task.due || '';
          document.getElementById('ap-priority').value = task.priority;
          document.getElementById('ap-subject').value = task.subject || '';
          document.getElementById('ap-add').textContent = 'Update assignment';
        });
        var toggle = SH.el('button', { type: 'button', class: 'btn btn-secondary btn-small', text: task.done ? 'Reopen' : 'Complete' });
        toggle.addEventListener('click', function () { SH.storage.put('tasks', Object.assign({}, task, { done: !task.done })).then(load); });
        var del = SH.el('button', { type: 'button', class: 'btn btn-danger btn-small', text: 'Delete' });
        del.addEventListener('click', function () { SH.storage.remove('tasks', task.id).then(load); });
        actions.appendChild(edit); actions.appendChild(toggle); actions.appendChild(del);
        row.appendChild(actions);
        list.appendChild(row);
      });
    }
    function load() { return SH.storage.all('tasks').then(function (rows) { tasks = rows.filter(function (row) { return !row || row.type !== 'habit'; }); render(); }); }
    document.getElementById('ap-add').addEventListener('click', function () {
      var title = document.getElementById('ap-title').value.trim();
      if (!title) return T.error('result', 'Enter an assignment title.');
      var payload = {
        title: title, due: document.getElementById('ap-due').value,
        priority: document.getElementById('ap-priority').value,
        subject: document.getElementById('ap-subject').value.trim(),
        done: editing ? editing.done : false,
        updatedAt: new Date().toISOString()
      };
      var wasEditing = !!editing;
      if (editing) payload.id = editing.id;
      SH.storage.put('tasks', payload).then(function () {
        editing = null;
        document.getElementById('ap-title').value = '';
        document.getElementById('ap-due').value = '';
        document.getElementById('ap-subject').value = '';
        document.getElementById('ap-add').textContent = 'Add assignment';
        load();
        T.result('result', wasEditing ? 'Assignment updated' : 'Assignment added', [{ label: 'Title', value: title }, { label: 'Priority', value: payload.priority }], null, 'success');
      });
    });
    document.querySelectorAll('[data-ap-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        filter = btn.dataset.apFilter;
        document.querySelectorAll('[data-ap-filter]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        render();
      });
    });
    load();
  });
})();
