(function () {
  'use strict';
  var SH = window.StudentHub, T = SH.tool, C = window.SHC;
  var DRAFT = 'studenthub:examReadinessDraft';
  document.addEventListener('DOMContentLoaded', function () {
    T.init('exam-readiness-score');

    function stat(label, value) {
      return SH.el('div', { class: 'stat' }, [SH.el('strong', { text: value }), SH.el('span', { text: label })]);
    }
    function empty(target, title, note) {
      target.textContent = '';
      target.appendChild(SH.el('div', { class: 'empty-state' }, [SH.icon('spark', 28), SH.el('strong', { text: title }), SH.el('span', { text: note })]));
    }
    function bar(label, signal) {
      var row = SH.el('div', { class: 'breakdown-row' });
      row.appendChild(SH.el('span', { text: label + ' (' + Math.round(signal.weight * 100) + '%)' }));
      var track = SH.el('div', { class: 'split-bar' });
      var fill = SH.el('span');
      fill.style.width = Math.max(0, Math.min(100, signal.value)) + '%';
      track.appendChild(fill); row.appendChild(track);
      row.appendChild(SH.el('strong', { text: T.fmt(signal.value, 1) + '%' }));
      return row;
    }
    function show(r) {
      var stats = document.getElementById('er-stats');
      var signals = document.getElementById('er-signals');
      var actions = document.getElementById('er-actions');
      [stats, signals, actions].forEach(function (box) { box.textContent = ''; T.ready(box); });
      [['Score', T.fmt(r.score, 1) + '%'], ['Band', r.band], ['Weakest signal', r.weakest.label], ['Signals', String(r.signals.length)]].forEach(function (p) {
        stats.appendChild(stat(p[0], p[1]));
      });
      var ring = document.getElementById('er-ring');
      ring.style.setProperty('--pct', r.score + '%');
      ring.dataset.level = r.score >= 80 ? 'good' : r.score >= 65 ? 'ok' : r.score >= 45 ? 'warn' : 'bad';
      document.getElementById('er-ring-label').textContent = T.fmt(r.score, 0) + '%';
      document.getElementById('er-goal-copy').textContent = r.band + ' · weakest: ' + r.weakest.label.toLowerCase();
      r.signals.forEach(function (signal) { signals.appendChild(bar(signal.label, signal)); });
      r.actions.forEach(function (text, i) {
        actions.appendChild(SH.el('div', { class: 'list-item' }, [
          SH.el('span', { class: 'badge' + (i ? ' badge-neutral' : ''), text: 'Step ' + (i + 1) }),
          SH.el('div', { class: 'list-item-body' }, [SH.el('div', { class: 'list-item-title', text: text })])
        ]));
      });
      return r;
    }
    function values() {
      return {
        marks: T.number('er-marks'), coverage: T.number('er-coverage'),
        revision: T.number('er-revision'), consistency: T.number('er-consistency')
      };
    }
    function calculate() {
      var r = C.readinessScore(values());
      if (!r) return T.error('result', 'Enter all four percentages between 0 and 100.');
      show(r);
      var rows = r.signals.map(function (s) { return { label: s.label, value: T.fmt(s.value, 1) + '% × ' + Math.round(s.weight * 100) + '% = ' + T.fmt(s.contribution, 1) }; });
      rows.push({ heading: 'Result' }, { label: 'Readiness score', value: T.fmt(r.score, 1) + '%' }, { label: 'Band', value: r.band }, { label: 'First action', value: r.actions[0] });
      T.result('result', 'Readiness calculated', rows, 'Use the weakest signal to choose your next study task.', r.score >= 65 ? 'success' : 'warn');
      return r;
    }
    function percentFrom(saved, total) {
      if (!saved || !total) return 0;
      return Math.min(100, Math.round(saved / total * 100));
    }
    function loadSaved() {
      T.loading('er-stats', 4);
      return Promise.all([
        SH.storage.all('tasks'), SH.storage.all('schedules'), SH.storage.all('sessions')
      ]).then(function (all) {
        var tasks = all[0], schedules = all[1], sessions = all[2];
        var syllabus = tasks.filter(function (row) { return row && row.type === 'syllabus'; });
        var revisions = schedules.filter(function (row) { return row && row.type === 'revision'; });
        var habits = tasks.filter(function (row) { return row && row.type === 'habit' && row.date; });
        var dates = {};
        habits.forEach(function (row) { dates[row.date] = true; });
        sessions.forEach(function (row) { if (row && row.date) dates[row.date] = true; });
        var last14 = [];
        var now = new Date();
        for (var i = 0; i < 14; i++) {
          var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
          last14.push(C.isoDay(d));
        }
        var active = last14.filter(function (key) { return dates[key]; }).length;
        var coverage = syllabus.length ? Math.round(syllabus.filter(function (row) { return row.status === 'done'; }).length / syllabus.length * 100) : 0;
        var doneReviews = 0, totalReviews = 0;
        revisions.forEach(function (plan) {
          (plan.plan || []).forEach(function (item) { totalReviews++; if (item.done) doneReviews++; });
        });
        var revision = percentFrom(doneReviews, totalReviews);
        var consistency = Math.round(active / 14 * 100);
        document.getElementById('er-coverage').value = coverage;
        document.getElementById('er-revision').value = revision;
        document.getElementById('er-consistency').value = consistency;
        T.ready('er-stats');
        T.result('result', 'Saved data loaded', [
          { label: 'Syllabus coverage', value: coverage + '% from ' + syllabus.length + ' topics' },
          { label: 'Revision completed', value: revision + '% from ' + doneReviews + ' of ' + totalReviews + ' reviews' },
          { label: 'Study consistency', value: consistency + '% from ' + active + ' of 14 days' },
          { heading: 'Still needed' }, { label: 'Marks average', value: 'Enter this yourself, then calculate.' }
        ], 'Marks stay manual because they come from your own assessments.', 'success');
      });
    }
    var form = document.getElementById('exam-readiness-score-form');
    form.addEventListener('submit', function (e) { e.preventDefault(); calculate(); });
    document.getElementById('er-load').addEventListener('click', loadSaved);
    document.getElementById('er-save').addEventListener('click', function () {
      var draft = Object.assign({ exam: T.value('er-exam') }, values());
      try {
        localStorage.setItem(DRAFT, JSON.stringify(draft));
        T.result('result', 'Draft saved', [{ label: 'Saved on', value: 'This device only' }, { label: 'Exam', value: draft.exam || 'General' }], 'Reopen this page to find your numbers again.', 'success');
      } catch (err) {
        T.error('result', 'Local storage is unavailable in this browser.');
      }
    });
    try {
      var draft = JSON.parse(localStorage.getItem(DRAFT) || 'null');
      if (draft && typeof draft === 'object') {
        ['exam', 'marks', 'coverage', 'revision', 'consistency'].forEach(function (key) {
          var node = document.getElementById('er-' + key);
          if (node && draft[key] !== undefined && draft[key] !== null) node.value = draft[key];
        });
      }
    } catch (err) { /* ignore an unreadable local draft */ }
    empty(document.getElementById('er-actions'), 'No score yet', 'Enter your four percentages and calculate readiness.');
  });
})();
