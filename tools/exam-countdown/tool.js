(function () {
  'use strict';
  var SH = window.StudentHub, T = SH.tool;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('exam-countdown');
    var list = document.getElementById('cd-list');
    var exams = [];
    var interval;
    function pad(n) { return String(n).padStart(2, '0'); }
    function parts(ms) {
      var s = Math.max(0, Math.floor(ms / 1000));
      return { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
    }
    function render() {
      list.textContent = '';
      if (!exams.length) {
        list.appendChild(SH.el('div', { class: 'empty-state' }, [SH.icon('calendar', 28), SH.el('strong', { text: 'No exams added yet' }), SH.el('span', { text: 'Add an exam date to start a countdown.' })]));
        return;
      }
      exams.sort(function (a, b) { return new Date(a.datetime) - new Date(b.datetime); }).forEach(function (exam) {
        var card = SH.el('div', { class: 'card', style: 'margin-bottom:1rem' });
        card.appendChild(SH.el('h3', { text: exam.name }));
        var when = new Date(exam.datetime);
        card.appendChild(SH.el('p', { class: 'field-hint', text: isNaN(when) ? 'Invalid date' : when.toLocaleString() }));
        var diff = isNaN(when) ? 0 : when.getTime() - Date.now();
        var p = parts(diff);
        var grid = SH.el('div', { class: 'countdown-grid' });
        [['Days', p.d], ['Hours', p.h], ['Minutes', p.m], ['Seconds', p.s]].forEach(function (pair) {
          grid.appendChild(SH.el('div', { class: 'countdown-cell' }, [SH.el('strong', { text: String(pair[1]) }), SH.el('span', { text: pair[0] })]));
        });
        card.appendChild(grid);
        if (diff <= 0) card.appendChild(SH.el('p', { class: 'badge', text: 'Time reached' }));
        var actions = SH.el('div', { class: 'btn-row', style: 'margin-top:.8rem' });
        var edit = SH.el('button', { type: 'button', class: 'btn btn-secondary btn-small', text: 'Edit' });
        edit.addEventListener('click', function () {
          document.getElementById('cd-name').value = exam.name;
          document.getElementById('cd-date').value = exam.datetime;
          exams = exams.filter(function (e) { return e !== exam; });
          SH.storage.remove('exams', exam.id).then(function () { render(); });
        });
        var del = SH.el('button', { type: 'button', class: 'btn btn-danger btn-small', text: 'Remove' });
        del.addEventListener('click', function () {
          exams = exams.filter(function (e) { return e !== exam; });
          SH.storage.remove('exams', exam.id).then(function () { render(); });
        });
        actions.appendChild(edit); actions.appendChild(del); card.appendChild(actions);
        list.appendChild(card);
      });
    }
    document.getElementById('cd-add').addEventListener('click', function () {
      var name = document.getElementById('cd-name').value.trim();
      var datetime = document.getElementById('cd-date').value;
      if (!name || !datetime || isNaN(new Date(datetime).getTime())) {
        T.error('result', 'Enter an exam name and a valid date and time.');
        return;
      }
      SH.storage.put('exams', { name: name, datetime: datetime, createdAt: new Date().toISOString() }).then(function (id) {
        exams.push({ id: id, name: name, datetime: datetime });
        document.getElementById('cd-name').value = '';
        document.getElementById('cd-date').value = '';
        render();
        T.result('result', 'Exam added', [{ label: 'Exam', value: name }, { label: 'Date', value: new Date(datetime).toLocaleString() }], 'The countdown uses your device’s local time zone.', 'success');
      });
    });
    SH.storage.all('exams').then(function (rows) { exams = rows; render(); });
    interval = setInterval(render, 1000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) render(); });
  });
})();
