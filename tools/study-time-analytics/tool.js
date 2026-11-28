(function () {
  'use strict';
  var SH = window.StudentHub, T = SH.tool, C = window.SHC;

  document.addEventListener('DOMContentLoaded', function () {
    T.init('study-time-analytics');
    var sessions = [];
    var goal = 120;
    var version = 0;
    var PAGE_NAMES = {
      home: 'Homepage', advanced: 'Advanced hub', workspace: 'Workspace',
      article: 'Article', tool: 'Tool page', page: 'Page'
    };

    function dayKey(date) {
      return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
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
      var n = T.number('sa-goal');
      goal = C.isNum(n) && n > 0 ? n : 120;
      return goal;
    }
    function load() {
      var id = ++version;
      return SH.storage.all('sessions').then(function (rows) {
        if (id !== version) return;
        sessions = Array.isArray(rows) ? rows : [];
        render();
      });
    }
    function render() {
      readGoal();
      var today = dayKey(new Date());
      var s = C.activeTimeSummary(SH.activeTime.events(), sessions, goal, today);
      var stats = document.getElementById('sa-stats');
      stats.textContent = '';
      [
        ['Saved study time', minutesText(s.focusSeconds)],
        ['Active site time', minutesText(s.totalSeconds)],
        ['This week combined', minutesText(s.weekCombinedSeconds)],
        ['Goal progress', s.goalPercent === null ? '—' : T.fmt(s.goalPercent, 1) + '%']
      ].forEach(function (pair) { stats.appendChild(stat(pair[0], pair[1])); });

      var pct = s.goalPercent === null ? 0 : Math.min(100, Math.round(s.goalPercent));
      document.getElementById('sa-ring').setAttribute('style', '--pct:' + pct + '%');
      document.getElementById('sa-ring-label').textContent = pct + '%';
      document.getElementById('sa-goal-copy').textContent = minutesText(s.weekCombinedSeconds) + ' of ' + goal + ' weekly minutes';

      var chart = document.getElementById('sa-chart');
      chart.textContent = '';
      var max = Math.max(1, Math.max.apply(null, s.weekKeys.map(function (key) { return s.combinedByDay[key] || 0; })));
      s.weekKeys.forEach(function (key) {
        var site = s.byDay[key] || 0, study = s.focusByDay[key] || 0;
        var col = SH.el('div');
        col.title = key + ': ' + minutesText(site) + ' on StudentHub, ' + minutesText(study) + ' saved study, ' + minutesText(site + study) + ' combined';
        col.appendChild(SH.el('span', { style: 'height:' + Math.max(2, (site + study) / max * 90) + 'px' }));
        col.appendChild(SH.el('small', { text: new Date(key + 'T12:00:00Z').toLocaleDateString(undefined, { weekday: 'short', timeZone: 'UTC' }).slice(0, 2) }));
        chart.appendChild(col);
      });

      var split = document.getElementById('sa-split');
      split.textContent = '';
      var sourceMax = Math.max(1, s.totalSeconds, s.focusSeconds, s.combinedSeconds);
      [
        ['Active StudentHub time', s.totalSeconds],
        ['Saved study sessions', s.focusSeconds],
        ['Combined local signal', s.combinedSeconds]
      ].forEach(function (row) {
        split.appendChild(SH.el('div', { class: 'breakdown-row' }, [
          SH.el('span', { text: row[0] }),
          SH.el('div', { class: 'split-bar' }, [SH.el('span', { style: 'width:' + Math.round(row[1] / sourceMax * 100) + '%' })]),
          SH.el('strong', { text: minutesText(row[1]) })
        ]));
      });

      var subjects = document.getElementById('sa-subjects');
      subjects.textContent = '';
      var names = Object.keys(s.study.bySubject).sort(function (a, b) { return s.study.bySubject[b] - s.study.bySubject[a]; });
      if (!names.length) {
        subjects.appendChild(SH.el('p', { class: 'field-hint', text: 'No saved sessions yet. Add one in the Study Hours Tracker.' }));
      } else {
        var subjectTotal = Math.max.apply(null, names.map(function (name) { return s.study.bySubject[name]; }));
        names.forEach(function (name) {
          subjects.appendChild(SH.el('div', { class: 'breakdown-row' }, [
            SH.el('span', { text: name }),
            SH.el('div', { class: 'split-bar' }, [SH.el('span', { style: 'width:' + Math.round(s.study.bySubject[name] / subjectTotal * 100) + '%' })]),
            SH.el('strong', { text: minutesText(s.study.bySubject[name] * 60) })
          ]));
        });
      }

      var top = document.getElementById('sa-top');
      top.textContent = '';
      if (!s.topSources.length) {
        top.appendChild(SH.el('p', { class: 'field-hint', text: 'No active site time saved yet. Keep a StudentHub tab open while you study.' }));
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

    document.getElementById('sa-goal').value = String(SH.storage.prefs.get('studyTimeGoal', 120));
    document.getElementById('sa-goal').addEventListener('input', render);
    document.getElementById('sa-goal').addEventListener('change', function () {
      SH.storage.prefs.set('studyTimeGoal', readGoal());
      render();
    });
    document.getElementById('sa-refresh').addEventListener('click', function () {
      SH.activeTime.flush();
      load().then(function () {
        var s = C.activeTimeSummary(SH.activeTime.events(), sessions, goal, dayKey(new Date()));
        T.result('result', 'Local data refreshed', [
          { label: 'Saved study', value: minutesText(s.focusSeconds) },
          { label: 'Active site time', value: minutesText(s.totalSeconds) },
          { label: 'Combined signal', value: minutesText(s.combinedSeconds) }
        ], 'Both signals were read from this device only.', 'success');
      });
    });
    document.getElementById('sa-export').addEventListener('click', function () {
      var s = C.activeTimeSummary(SH.activeTime.events(), sessions, goal, dayKey(new Date()));
      if (!s.totalSeconds && !s.focusSeconds) return T.error('result', 'There is no local study or active-time data to export.');
      var days = Array.from(new Set(s.weekKeys.concat(Object.keys(s.byDay), Object.keys(s.focusByDay)))).sort();
      var csv = 'Date,Active StudentHub seconds,Saved study seconds,Combined seconds\n' + days.map(function (day) {
        var site = s.byDay[day] || 0, study = s.focusByDay[day] || 0;
        return [day, site, study, site + study].join(',');
      }).join('\n');
      var url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      var a = SH.el('a', { href: url, download: 'studenthub-study-time-analytics.csv' });
      document.body.appendChild(a); a.click(); a.remove();
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      T.result('result', 'CSV exported', [{ label: 'Days', value: String(days.length) }], 'The file was downloaded to your device.', 'success');
    });
    window.addEventListener('studenthub:active-time', render);
    document.addEventListener('visibilitychange', render);
    load();
    window.setInterval(render, 5000);
  });
})();
