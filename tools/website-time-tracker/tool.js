(function () {
  'use strict';
  var SH = window.StudentHub, T = SH.tool, C = window.SHC;

  document.addEventListener('DOMContentLoaded', function () {
    T.init('website-time-tracker');
    var goal = 60;
    var PAGE_NAMES = {
      home: 'Homepage', advanced: 'Advanced hub', workspace: 'Workspace',
      article: 'Article', tool: 'Tool page', page: 'Page'
    };

    function dayKey(date) {
      return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
    }
    function clockText(ms) {
      var total = Math.max(0, Math.floor(ms / 1000));
      var h = Math.floor(total / 3600), m = Math.floor(total % 3600 / 60), s = total % 60;
      return [h, m, s].map(function (n) { return String(n).padStart(2, '0'); }).join(':');
    }
    function minutesText(seconds) {
      if (!C.isNum(seconds) || seconds <= 0) return '0s';
      if (seconds < 60) return Math.floor(seconds) + 's';
      if (seconds < 3600) return T.fmt(seconds / 60, 1) + ' min';
      return T.fmt(seconds / 3600, 2) + ' h';
    }
    function labelFor(id) {
      var tool = SH.findTool(id);
      if (tool) return tool.name;
      return PAGE_NAMES[id] || id.replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    }
    function stat(label, value) {
      return SH.el('div', { class: 'stat' }, [SH.el('strong', { text: value }), SH.el('span', { text: label })]);
    }
    function readGoal() {
      var n = T.number('wt-goal');
      goal = C.isNum(n) && n > 0 ? n : 60;
      return goal;
    }
    function render() {
      readGoal();
      var today = dayKey(new Date());
      var events = SH.activeTime.events();
      var s = C.activeTimeSummary(events, [], goal, today);
      var live = SH.activeTime.currentMs();

      document.getElementById('wt-clock').textContent = clockText(live);
      document.getElementById('wt-state').textContent = document.hidden || !document.hasFocus()
        ? 'Paused while this tab is hidden or unfocused.'
        : 'Measuring this tab. Paused when hidden, unfocused or idle.';

      var stats = document.getElementById('wt-stats');
      stats.textContent = '';
      [
        ['Active now', clockText(live)],
        ['Today', minutesText(s.todaySeconds)],
        ['Last 7 days', minutesText(s.weekSeconds)],
        ['Saved total', minutesText(s.totalSeconds)]
      ].forEach(function (pair) { stats.appendChild(stat(pair[0], pair[1])); });

      var pct = Math.min(100, Math.round(s.todaySeconds / (goal * 60) * 100));
      document.getElementById('wt-ring').setAttribute('style', '--pct:' + pct + '%');
      document.getElementById('wt-ring-label').textContent = pct + '%';
      document.getElementById('wt-goal-copy').textContent = minutesText(s.todaySeconds) + ' of ' + goal + ' min today';

      var chart = document.getElementById('wt-chart');
      chart.textContent = '';
      var max = Math.max(1, Math.max.apply(null, s.weekKeys.map(function (key) { return s.byDay[key] || 0; })));
      s.weekKeys.forEach(function (key) {
        var col = SH.el('div');
        col.title = key + ': ' + minutesText(s.byDay[key] || 0) + ' active on StudentHub';
        col.appendChild(SH.el('span', { style: 'height:' + Math.max(2, (s.byDay[key] || 0) / max * 90) + 'px' }));
        col.appendChild(SH.el('small', { text: new Date(key + 'T12:00:00Z').toLocaleDateString(undefined, { weekday: 'short', timeZone: 'UTC' }).slice(0, 2) }));
        chart.appendChild(col);
      });

      var top = document.getElementById('wt-top');
      top.textContent = '';
      if (!s.topSources.length) {
        top.appendChild(SH.el('p', { class: 'field-hint', text: 'No active time saved yet. Keep this tab open while you study.' }));
      } else {
        s.topSources.forEach(function (row) {
          top.appendChild(SH.el('div', { class: 'breakdown-row' }, [
            SH.el('span', { text: labelFor(row.name) }),
            SH.el('div', { class: 'split-bar' }, [SH.el('span', { style: 'width:' + Math.round(row.seconds / s.totalSeconds * 100) + '%' })]),
            SH.el('strong', { text: minutesText(row.seconds) })
          ]));
        });
      }
    }

    document.getElementById('wt-goal').addEventListener('input', render);
    document.getElementById('wt-goal').addEventListener('change', function () {
      SH.storage.prefs.set('studyTimeGoal', readGoal());
      render();
    });
    document.getElementById('wt-save').addEventListener('click', function () {
      var live = SH.activeTime.currentMs();
      SH.activeTime.flush();
      render();
      T.result('result', 'Active time saved', [
        { label: 'Current segment', value: clockText(live) },
        { label: 'Stored locally', value: minutesText(Math.floor(live / 1000)) }
      ], 'Saved on this device only. Background and idle time are excluded.', 'success');
    });
    document.getElementById('wt-refresh').addEventListener('click', function () {
      render();
      T.result('result', 'Dashboard refreshed', [
        { label: 'Today', value: minutesText(C.activeTimeSummary(SH.activeTime.events(), [], goal, dayKey(new Date())).todaySeconds) }
      ], null, 'success');
    });
    document.getElementById('wt-clear').addEventListener('click', function () {
      if (!window.confirm('Remove all saved StudentHub active-time totals on this device?')) return;
      SH.activeTime.clear();
      render();
      T.result('result', 'Local timeline cleared', [], 'Saved active-time totals were removed from this browser.', 'success');
    });
    globalEvents();
    window.setInterval(render, 1000);
    document.getElementById('wt-goal').value = String(SH.storage.prefs.get('studyTimeGoal', 60));
    render();

    function globalEvents() {
      window.addEventListener('studenthub:active-time', render);
      document.addEventListener('visibilitychange', render);
      window.addEventListener('focus', render);
      window.addEventListener('blur', render);
    }
  });
})();
