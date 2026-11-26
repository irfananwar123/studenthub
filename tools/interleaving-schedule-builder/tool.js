(function () {
  'use strict';
  var SH = window.StudentHub, T = SH.tool, C = window.SHC;
  var DRAFT = 'interleavingDraft';
  document.addEventListener('DOMContentLoaded', function () {
    T.init('interleaving-schedule-builder');

    function stat(label, value) {
      return SH.el('div', { class: 'stat' }, [SH.el('strong', { text: value }), SH.el('span', { text: label })]);
    }
    function parseRows(text) {
      return String(text || '').split(/\n+/).map(function (line) {
        var parts = line.split('|').map(function (part) { return String(part).trim(); });
        if (!parts[0]) return null;
        var confidence = ['low', 'medium', 'high'].indexOf(parts[1]) !== -1 ? parts[1] : 'medium';
        return { name: parts[0], confidence: confidence };
      }).filter(Boolean);
    }
    function show(plan) {
      var stats = document.getElementById('ib-stats');
      var days = document.getElementById('ib-days');
      var totals = document.getElementById('ib-totals');
      [stats, days, totals].forEach(function (box) { box.textContent = ''; T.ready(box); });
      [['Days planned', String(plan.days)], ['Mix score', T.fmt(plan.mixScore, 0) + '%'],
       ['Daily budget', T.fmt(plan.totalMinutes / plan.days, 0) + 'm'], ['Total minutes', T.fmt(plan.totalMinutes, 0)]].forEach(function (pair) {
        stats.appendChild(stat(pair[0], pair[1]));
      });
      plan.schedule.forEach(function (day) {
        var card = SH.el('div', { class: 'interleave-day' }, [SH.el('strong', { text: 'Day ' + day.day + ' · ' + day.date })]);
        day.topics.forEach(function (block) {
          card.appendChild(SH.el('div', { class: 'interleave-block' }, [
            SH.el('span', { class: 'badge' + (block.confidence === 'low' ? '' : ' badge-neutral'), text: block.focus }),
            SH.el('span', { text: block.name }),
            SH.el('strong', { text: block.minutes + 'm' })
          ]));
        });
        days.appendChild(card);
      });
      plan.totals.forEach(function (row) {
        totals.appendChild(SH.el('div', { class: 'list-item' }, [
          SH.el('span', { class: 'badge badge-neutral', text: row.confidence }),
          SH.el('div', { class: 'list-item-body' }, [
            SH.el('div', { class: 'list-item-title', text: row.name }),
            SH.el('div', { class: 'list-item-meta', text: row.sessions + ' blocks · ' + T.fmt(row.minutes, 0) + ' minutes' })
          ])
        ]));
      });
      return plan;
    }
    function build() {
      var plan = C.interleavingPlan(parseRows(T.value('ib-topics')), {
        days: T.number('ib-days'), minutesPerDay: T.number('ib-minutes'),
        sessionMinutes: T.number('ib-session'), mode: T.value('ib-mode')
      });
      if (!plan) return T.error('result', 'Add at least two topics as Topic|low, Topic|medium or Topic|high, then enter positive days and minutes.');
      show(plan);
      var rows = [
        { label: 'Days', value: String(plan.days) },
        { label: 'Blocks per day', value: String(Math.max(1, Math.min(4, Math.floor(T.number('ib-minutes') / T.number('ib-session'))))) },
        { label: 'Mix score', value: T.fmt(plan.mixScore, 1) + '%' },
        { label: 'Total time', value: T.fmt(plan.totalMinutes, 0) + ' minutes' },
        { heading: 'Most practice' },
        { label: 'Topic', value: plan.totals[0].name },
        { label: 'Minutes', value: T.fmt(plan.totals[0].minutes, 0) }
      ];
      T.result('result', 'Schedule ready', rows, 'Interleaving feels harder than blocked practice. That effort is the point.',
        plan.mixScore >= 80 ? 'success' : 'warn');
      return plan;
    }
    document.getElementById('interleaving-schedule-builder-form').addEventListener('submit', function (e) {
      e.preventDefault();
      build();
    });
    document.getElementById('ib-demo').addEventListener('click', function () {
      document.getElementById('ib-topics').value = 'Biology|low\nChemistry|medium\nPhysics|high';
      document.getElementById('ib-days').value = 7;
      document.getElementById('ib-minutes').value = 60;
      document.getElementById('ib-session').value = 30;
      document.getElementById('ib-mode').value = 'weighted';
      build();
    });
    document.getElementById('ib-save').addEventListener('click', function () {
      SH.storage.prefs.set(DRAFT, {
        topics: T.value('ib-topics'), days: T.number('ib-days'), minutes: T.number('ib-minutes'),
        session: T.number('ib-session'), mode: T.value('ib-mode')
      });
      T.result('result', 'Draft saved', [
        { label: 'Topics', value: String(parseRows(T.value('ib-topics')).length) },
        { label: 'Saved on', value: 'This device only' }
      ], 'Your topic list and settings will be restored next time.', 'success');
    });
    try {
      var draft = SH.storage.prefs.get(DRAFT, null);
      if (draft && typeof draft === 'object') {
        if (draft.topics) document.getElementById('ib-topics').value = draft.topics;
        if (draft.days) document.getElementById('ib-days').value = draft.days;
        if (draft.minutes) document.getElementById('ib-minutes').value = draft.minutes;
        if (draft.session) document.getElementById('ib-session').value = draft.session;
        if (draft.mode) document.getElementById('ib-mode').value = draft.mode;
      }
    } catch (err) { /* ignore an unreadable draft */ }
  });
})();
