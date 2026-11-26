(function () {
  'use strict';
  var SH = window.StudentHub, T = SH.tool, C = window.SHC;
  var DRAFT = 'deliberateDraft';
  document.addEventListener('DOMContentLoaded', function () {
    T.init('deliberate-practice-planner');

    function stat(label, value) {
      return SH.el('div', { class: 'stat' }, [SH.el('strong', { text: value }), SH.el('span', { text: label })]);
    }
    function listItem(badge, title, meta) {
      return SH.el('div', { class: 'list-item' }, [
        SH.el('span', { class: 'badge' + (badge.indexOf('Level') ? ' badge-neutral' : ''), text: badge }),
        SH.el('div', { class: 'list-item-body' }, [
          SH.el('div', { class: 'list-item-title', text: title }),
          SH.el('div', { class: 'list-item-meta', text: meta })
        ])
      ]);
    }
    function values() {
      return {
        skill: T.value('dp-skill'), currentLevel: T.number('dp-current'), targetLevel: T.number('dp-target'),
        sessionsPerWeek: T.number('dp-sessions'), minutesPerSession: T.number('dp-minutes'),
        weeks: T.number('dp-weeks'), feedback: T.value('dp-feedback'), weakness: T.value('dp-weak')
      };
    }
    function show(p) {
      var stats = document.getElementById('dp-stats');
      var steps = document.getElementById('dp-steps');
      var plan = document.getElementById('dp-plan');
      [stats, steps, plan].forEach(function (box) { box.textContent = ''; T.ready(box); });
      [['Required hours', T.fmt(p.requiredHours, 1)], ['Available hours', T.fmt(p.availableHours, 1)],
       ['Weeks needed', T.fmt(p.requiredWeeks, 1)], ['Weekly target', T.fmt(p.weeklyTarget, 2) + 'h']].forEach(function (pair) {
        stats.appendChild(stat(pair[0], pair[1]));
      });
      var ring = document.getElementById('dp-ring');
      ring.style.setProperty('--pct', Math.min(100, p.capacityPercent) + '%');
      ring.dataset.level = p.status === 'enough' ? 'good' : 'warn';
      document.getElementById('dp-ring-label').textContent = T.fmt(p.capacityPercent, 0) + '%';
      document.getElementById('dp-goal-copy').textContent = p.status === 'enough'
        ? 'Your routine covers the plan'
        : 'Add ' + T.fmt(p.gapHours, 1) + ' more hours';
      p.steps.forEach(function (step) {
        steps.appendChild(listItem('Level ' + step.from + '→' + step.to,
          'Step ' + (p.steps.indexOf(step) + 1) + ': reach level ' + step.to,
          T.fmt(step.hours, 2) + ' focused hours at this level'));
      });
      p.nextSessions.forEach(function (session) {
        var focus = session.number === 1 && values().weakness ? values().weakness : session.theme;
        plan.appendChild(listItem('Session ' + session.number, focus, session.minutes + ' minutes of deliberate practice'));
      });
      return p;
    }
    function calculate() {
      var p = C.deliberatePractice(values());
      if (!p) return T.error('result', 'Choose levels from 1 to 10 with a target at or above your current level, then enter positive sessions, minutes and weeks.');
      show(p);
      var rows = [
        { label: 'Current to target', value: 'Level ' + p.currentLevel + ' → level ' + p.targetLevel },
        { label: 'Feedback multiplier', value: T.fmt(p.multiplier, 2) + '×' },
        { label: 'Required practice', value: T.fmt(p.requiredHours, 2) + ' hours' },
        { label: 'Your capacity', value: T.fmt(p.availableHours, 2) + ' hours' },
        { label: 'Weekly target', value: T.fmt(p.weeklyTarget, 2) + ' hours' },
        { heading: 'Verdict' },
        { label: 'Status', value: p.status === 'enough' ? 'Schedule covers the plan' : 'Schedule is short' },
        { label: 'Weeks needed', value: T.fmt(p.requiredWeeks, 1) },
        { label: 'First session', value: p.nextSessions[0].theme }
      ];
      T.result('result', 'Practice plan ready', rows,
        'This is a planning model, not a guarantee. Progress depends on the quality of your feedback and focus.',
        p.status === 'enough' ? 'success' : 'warn');
      return p;
    }
    document.getElementById('deliberate-practice-planner-form').addEventListener('submit', function (e) {
      e.preventDefault();
      calculate();
    });
    document.getElementById('dp-demo').addEventListener('click', function () {
      var demo = {
        'dp-skill': 'Organic chemistry mechanisms', 'dp-current': 6, 'dp-target': 7,
        'dp-weak': 'reaction arrows', 'dp-sessions': 3, 'dp-minutes': 30, 'dp-weeks': 6, 'dp-feedback': 'coach'
      };
      Object.keys(demo).forEach(function (id) { document.getElementById(id).value = demo[id]; });
      calculate();
    });
    document.getElementById('dp-save').addEventListener('click', function () {
      SH.storage.prefs.set(DRAFT, values());
      T.result('result', 'Draft saved', [
        { label: 'Skill', value: values().skill || 'Unnamed skill' },
        { label: 'Saved on', value: 'This device only' }
      ], 'Reopen this page to restore your numbers.', 'success');
    });
    try {
      var draft = SH.storage.prefs.get(DRAFT, null);
      if (draft && typeof draft === 'object') {
        var fields = {
          skill: 'dp-skill', currentLevel: 'dp-current', targetLevel: 'dp-target',
          weakness: 'dp-weak', sessionsPerWeek: 'dp-sessions', minutesPerSession: 'dp-minutes',
          weeks: 'dp-weeks', feedback: 'dp-feedback'
        };
        Object.keys(fields).forEach(function (key) {
          if (draft[key] !== undefined && draft[key] !== null) document.getElementById(fields[key]).value = draft[key];
        });
      }
    } catch (err) { /* ignore an unreadable draft */ }
    calculate();
  });
})();
