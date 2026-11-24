(function () {
  'use strict';
  var SH = window.StudentHub, T = SH.tool;
  var DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  document.addEventListener('DOMContentLoaded', function () {
    T.init('study-timetable-maker');
    var subjects = [], slots = [];
    var list = document.getElementById('st-subject-list');
    var grid = document.getElementById('st-grid');
    var conflictBox = document.getElementById('st-conflicts');

    function renderSubjects() {
      list.textContent = '';
      if (!subjects.length) {
        list.appendChild(SH.el('div', { class: 'empty-state' }, [SH.el('strong', { text: 'No subjects yet' }), SH.el('span', { text: 'Add a subject to start building your week.' })]));
        return;
      }
      subjects.forEach(function (s, i) {
        var row = SH.el('div', { class: 'list-item' });
        row.appendChild(SH.el('div', { class: 'list-item-body' }, [
          SH.el('div', { class: 'list-item-title', text: s.name }),
          SH.el('div', { class: 'list-item-meta', text: T.fmt(s.hours) + ' hours / week · ' + s.when + ' preferred' })
        ]));
        var btn = SH.el('button', { type: 'button', class: 'btn btn-secondary btn-small', text: 'Remove' });
        btn.addEventListener('click', function () { subjects.splice(i, 1); renderSubjects(); });
        row.appendChild(btn);
        list.appendChild(row);
      });
    }
    function toMinutes(time) {
      var p = String(time || '').split(':');
      return p.length === 2 ? Number(p[0]) * 60 + Number(p[1]) : NaN;
    }
    function conflicts() {
      var found = [];
      slots.forEach(function (a, i) {
        slots.slice(i + 1).forEach(function (b) {
          if (a.day !== b.day) return;
          var as = toMinutes(a.start), bs = toMinutes(b.start);
          if (!isFinite(as) || !isFinite(bs)) return;
          var ae = as + a.duration * 60, be = bs + b.duration * 60;
          if (as < be && bs < ae) found.push(a.subject + ' and ' + b.subject + ' overlap on ' + DAYS[a.day]);
        });
      });
      conflictBox.textContent = '';
      if (!found.length) { conflictBox.hidden = true; return false; }
      conflictBox.hidden = false;
      conflictBox.appendChild(SH.el('strong', { text: 'Schedule conflicts:' }));
      found.forEach(function (msg) { conflictBox.appendChild(SH.el('div', { text: msg })); });
      return true;
    }
    function renderGrid() {
      grid.textContent = '';
      var days = Number(document.getElementById('st-days').value) || 5;
      days = Math.max(1, Math.min(7, days));
      for (var d = 0; d < days; d++) {
        var col = SH.el('div', { class: 'day-column' });
        col.appendChild(SH.el('h4', { text: DAYS[d] }));
        slots.filter(function (s) { return s.day === d; }).sort(function (a, b) { return toMinutes(a.start) - toMinutes(b.start); }).forEach(function (slot) {
          var card = SH.el('div', { class: 'slot' });
          card.appendChild(SH.el('strong', { text: slot.subject }));
          var time = SH.el('input', { type: 'time', value: slot.start, 'aria-label': 'Start time for ' + slot.subject });
          time.addEventListener('change', function () { slot.start = time.value; conflicts(); });
          card.appendChild(time);
          var remove = SH.el('button', { type: 'button', text: '×', 'aria-label': 'Remove ' + slot.subject + ' session' });
          remove.addEventListener('click', function () { slots = slots.filter(function (s) { return s !== slot; }); renderGrid(); });
          card.appendChild(remove);
          card.appendChild(SH.el('div', { text: T.fmt(slot.duration) + ' hour' + (slot.duration === 1 ? '' : 's') }));
          col.appendChild(card);
        });
        grid.appendChild(col);
      }
    }
    document.getElementById('st-add-subject').addEventListener('click', function () {
      var name = document.getElementById('st-name').value.trim();
      var hours = Number(document.getElementById('st-priority').value);
      if (!name) { T.error('result', 'Enter a subject name before adding it.'); return; }
      if (!(hours > 0)) { T.error('result', 'Hours wanted must be greater than zero.'); return; }
      subjects.push({ name: name, hours: hours, when: document.getElementById('st-when').value });
      document.getElementById('st-name').value = '';
      renderSubjects();
      T.result('result', 'Subject added', [{ label: 'Subject', value: name }, { label: 'Hours requested', value: T.fmt(hours) }], null, 'success');
    });
    document.getElementById('st-generate').addEventListener('click', function () {
      if (!subjects.length) return T.error('result', 'Add at least one subject first.');
      var perDay = Number(document.getElementById('st-hours').value);
      var days = Number(document.getElementById('st-days').value);
      var start = toMinutes(document.getElementById('st-start').value);
      if (!(perDay > 0) || !(days >= 1) || !isFinite(start)) return T.error('result', 'Set valid daily hours, study days and a start time.');
      var capacity = Math.min(perDay * days, 24 * days);
      var wanted = C.sum(subjects.map(function (s) { return s.hours; }));
      slots = [];
      var ordered = subjects.slice().sort(function (a, b) { return b.hours - a.hours; });
      var day = 0, used = 0, clock = start;
      ordered.forEach(function (s) {
        var remaining = s.hours;
        var base = s.when === 'morning' ? 9 * 60 : s.when === 'afternoon' ? 13 * 60 : s.when === 'evening' ? 17 * 60 : start;
        while (remaining > 0 && day < days) {
          if (used + Math.min(1, remaining) > perDay) { day++; used = 0; clock = start; continue; }
          var dur = Math.min(1, remaining);
          var effectiveStart = s.when === 'any' ? clock : Math.max(base, clock);
          if (effectiveStart + dur * 60 > 24 * 60) { day++; used = 0; clock = start; continue; }
          slots.push({ subject: s.name, day: day, start: String(Math.floor(effectiveStart / 60)).padStart(2, '0') + ':' + String(effectiveStart % 60).padStart(2, '0'), duration: dur });
          clock = effectiveStart + dur * 60;
          used += dur;
          remaining -= dur;
        }
      });
      renderGrid();
      var hasConflict = conflicts();
      var rows = [{ label: 'Hours available', value: T.fmt(capacity) }, { label: 'Hours requested', value: T.fmt(wanted) }, { label: 'Sessions placed', value: String(slots.length) }, { label: 'Conflicts', value: hasConflict ? 'Yes — edit times below' : 'None detected' }];
      if (wanted > capacity) rows.push({ label: 'Unscheduled hours', value: T.fmt(wanted - Math.min(wanted, C.sum(slots.map(function (s) { return s.duration; })))) });
      T.result('result', 'Timetable generated', rows, 'Drag-free editing: change times directly in the timetable, then save or print.', hasConflict ? 'warning' : 'success');
    });
    document.getElementById('st-save').addEventListener('click', function () {
      if (!slots.length) return T.error('result', 'Generate a timetable before saving it.');
      SH.storage.put('schedules', { name: 'My study timetable', savedAt: new Date().toISOString(), subjects: subjects, slots: slots }).then(function () {
        T.result('result', 'Timetable saved', [{ label: 'Sessions', value: String(slots.length) }, { label: 'Where', value: 'This browser only' }], null, 'success');
      });
    });
    document.getElementById('st-load').addEventListener('click', function () {
      SH.storage.all('schedules').then(function (all) {
        if (!all.length) return T.error('result', 'No saved timetable found on this device.');
        var saved = all[all.length - 1];
        subjects = saved.subjects || []; slots = saved.slots || [];
        renderSubjects(); renderGrid(); conflicts();
        T.result('result', 'Saved timetable loaded', [{ label: 'Sessions', value: String(slots.length) }, { label: 'Saved', value: saved.savedAt ? new Date(saved.savedAt).toLocaleString() : 'Earlier' }], null, 'success');
      });
    });
    document.getElementById('st-print').addEventListener('click', function () { window.print(); });
    renderSubjects(); renderGrid();
  });
})();
