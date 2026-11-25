(function () {
  'use strict';
  var SH = window.StudentHub, T = SH.tool, C = window.SHC;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('study-hours-tracker');
    var sessions = [], elapsed = 0, startedAt = 0, running = false, ticker = null;
    var goal = 120;

    function dayKey(d) {
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
    function clockText(ms) {
      var total = Math.max(0, Math.floor(ms / 1000));
      var h = Math.floor(total / 3600), m = Math.floor(total % 3600 / 60), s = total % 60;
      return [h, m, s].map(function (n) { return String(n).padStart(2, '0'); }).join(':');
    }
    function currentMs() { return elapsed + (running ? Date.now() - startedAt : 0); }
    function paintClock() { document.getElementById('sh-clock').textContent = clockText(currentMs()); }
    function buttons(show, state) {
      ['start', 'pause', 'resume', 'stop'].forEach(function (name) {
        document.getElementById('sh-' + name).hidden = show.indexOf(name) === -1;
      });
      document.getElementById('sh-state').textContent = {
        ready: 'Ready when you are. Choose a subject, then start the timer.',
        running: 'Timer running. Paused time is never counted.',
        paused: 'Paused. Resume when you are ready.',
        saved: 'Session saved to your local study history.'
      }[state || 'ready'];
    }
    function setMode(list, state) { buttons(list, state); }
    function updateGoal() {
      var n = T.number('sh-goal');
      goal = C.isNum(n) && n > 0 ? n : 120;
    }

    function load() {
      return SH.storage.all('sessions').then(function (rows) { sessions = rows; render(); });
    }
    function stat(label, value) {
      return SH.el('div', { class: 'stat' }, [SH.el('strong', { text: value }), SH.el('span', { text: label })]);
    }
    function render() {
      updateGoal();
      var s = C.hoursSummary(sessions, goal, dayKey(new Date()));
      var stats = document.getElementById('sh-stats');
      stats.textContent = '';
      [
        ['Today', T.fmt(s.todayMinutes / 60, 2) + ' h'],
        ['Last 7 days', T.fmt(s.weekMinutes / 60, 2) + ' h'],
        ['Sessions', String(s.sessionCount)],
        ['Daily average', T.fmt(s.averageMinutes, 1) + ' min']
      ].forEach(function (p) { stats.appendChild(stat(p[0], p[1])); });

      var pct = s.goalPercent === null ? 0 : Math.min(100, Math.round(s.goalPercent));
      var ring = document.getElementById('sh-ring');
      ring.setAttribute('style', '--pct:' + pct + '%');
      document.getElementById('sh-ring-label').textContent = pct + '%';
      document.getElementById('sh-goal-copy').textContent = T.fmt(s.weekMinutes, 0) + ' of ' + T.fmt(goal, 0) + ' weekly minutes';

      var chart = document.getElementById('sh-chart');
      chart.textContent = '';
      var max = Math.max(1, Math.max.apply(null, s.weekKeys.map(function (k) { return s.byDay[k] || 0; })));
      s.weekKeys.forEach(function (k) {
        var col = SH.el('div');
        col.title = k + ': ' + (s.byDay[k] || 0) + ' minutes';
        col.appendChild(SH.el('span', { style: 'height:' + Math.max(2, (s.byDay[k] || 0) / max * 90) + 'px' }));
        col.appendChild(SH.el('small', { text: new Date(k + 'T12:00:00Z').toLocaleDateString(undefined, { weekday: 'short', timeZone: 'UTC' }).slice(0, 2) }));
        chart.appendChild(col);
      });

      var subjects = document.getElementById('sh-subjects');
      subjects.textContent = '';
      var entries = Object.keys(s.bySubject).sort(function (a, b) { return s.bySubject[b] - s.bySubject[a]; });
      if (!entries.length) {
        subjects.appendChild(SH.el('p', { class: 'field-hint', text: 'No subjects yet. Save a session to see the breakdown.' }));
      } else {
        entries.forEach(function (name) {
          var row = SH.el('div', { class: 'breakdown-row' }, [
            SH.el('span', { text: name }),
            SH.el('div', { class: 'split-bar' }, [SH.el('span', { style: 'width:' + Math.round(s.bySubject[name] / s.totalMinutes * 100) + '%' })]),
            SH.el('strong', { text: T.fmt(s.bySubject[name] / 60, 1) + ' h' })
          ]);
          subjects.appendChild(row);
        });
      }

      var heat = document.getElementById('sh-heatmap');
      heat.textContent = '';
      var dates = sessions.map(function (row) { return row.date; }).filter(Boolean);
      C.streakStats(dates, dayKey(new Date())).last35.forEach(function (cell) {
        var level = cell.count === 0 ? 0 : cell.count < 2 ? 1 : cell.count < 4 ? 2 : cell.count < 7 ? 3 : 4;
        heat.appendChild(SH.el('div', {
          class: 'heat-cell heat-' + level,
          title: cell.date + ': ' + cell.count + ' sessions',
          'aria-label': cell.date + ': ' + cell.count + ' sessions'
        }));
      });

      var list = document.getElementById('sh-list');
      list.textContent = '';
      if (!sessions.length) {
        list.appendChild(SH.el('div', { class: 'empty-state' }, [SH.icon('clock', 28), SH.el('strong', { text: 'No sessions saved yet' }), SH.el('span', { text: 'Start the timer above or add a past session.' })]));
        return;
      }
      sessions.slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)) || (b.id || 0) - (a.id || 0); }).forEach(function (row) {
        var line = SH.el('div', { class: 'list-item' });
        var body = SH.el('div', { class: 'list-item-body' }, [
          SH.el('div', { class: 'list-item-title', text: row.subject || 'Unsorted' }),
          SH.el('div', { class: 'list-item-meta', text: row.date + ' · ' + T.fmt(row.minutes, 1) + ' min' + (row.source === 'timer' ? ' · live timer' : ' · manual') })
        ]);
        var remove = SH.el('button', { type: 'button', class: 'btn btn-danger btn-small', text: 'Remove' });
        remove.addEventListener('click', function () { SH.storage.remove('sessions', row.id).then(load); });
        line.appendChild(body); line.appendChild(remove); list.appendChild(line);
      });
    }

    function saveSession(subject, ms, date, source) {
      var seconds = Math.round(ms / 1000);
      var minutes = Math.max(1, Math.round(seconds / 60 * 10) / 10);
      return SH.storage.put('sessions', {
        subject: subject, seconds: seconds, minutes: minutes, date: date,
        source: source || 'manual', endedAt: new Date().toISOString()
      }).then(function () { load(); return { seconds: seconds, minutes: minutes }; });
    }

    document.getElementById('sh-goal').addEventListener('input', render);
    document.getElementById('sh-start').addEventListener('click', function () {
      var subject = T.value('sh-subject');
      if (!subject) return T.error('result', 'Enter a subject before starting the timer.');
      elapsed = 0; startedAt = Date.now(); running = true;
      if (ticker) clearInterval(ticker);
      ticker = setInterval(paintClock, 500);
      setMode(['pause', 'stop'], 'running'); paintClock();
      document.getElementById('sh-subject').dataset.active = subject;
    });
    document.getElementById('sh-pause').addEventListener('click', function () {
      if (!running) return;
      elapsed += Date.now() - startedAt; running = false;
      if (ticker) { clearInterval(ticker); ticker = null; }
      setMode(['resume', 'stop'], 'paused'); paintClock();
    });
    document.getElementById('sh-resume').addEventListener('click', function () {
      if (running) return;
      startedAt = Date.now(); running = true;
      ticker = setInterval(paintClock, 500);
      setMode(['pause', 'stop'], 'running'); paintClock();
    });
    document.getElementById('sh-stop').addEventListener('click', function () {
      var ms = currentMs();
      if (ticker) { clearInterval(ticker); ticker = null; }
      running = false; elapsed = 0;
      setMode(['start'], 'saved'); paintClock();
      if (ms < 1000) return T.error('result', 'Run the timer for at least one second before saving.');
      var subject = document.getElementById('sh-subject').dataset.active || T.value('sh-subject') || 'Unsorted';
      saveSession(subject, ms, dayKey(new Date()), 'timer').then(function (saved) {
        T.result('result', 'Session saved', [
          { label: 'Subject', value: subject },
          { label: 'Time', value: clockText(saved.seconds * 1000) },
          { label: 'Minutes added', value: T.fmt(saved.minutes, 1) }
        ], 'Saved to this device only.', 'success');
      });
    });
    document.getElementById('sh-manual-add').addEventListener('click', function () {
      var subject = T.value('sh-manual-subject');
      var minutes = T.number('sh-manual-minutes');
      var date = T.value('sh-manual-date');
      if (!subject || !C.isNum(minutes) || minutes <= 0 || !C.parseDate(date)) return T.error('result', 'Enter a subject, positive minutes and a valid date.');
      saveSession(subject, minutes * 60000, date).then(function () {
        T.result('result', 'Past session added', [
          { label: 'Subject', value: subject }, { label: 'Minutes', value: T.fmt(minutes, 1) }, { label: 'Date', value: date }
        ], null, 'success');
        document.getElementById('sh-manual-subject').value = '';
        document.getElementById('sh-manual-minutes').value = '';
      });
    });
    document.getElementById('sh-export').addEventListener('click', function () {
      if (!sessions.length) return T.error('result', 'There are no sessions to export.');
      var csv = 'Subject,Date,Minutes,Seconds,Source\n' + sessions.map(function (row) {
        return [row.subject, row.date, row.minutes, row.seconds || 0, row.source || 'manual']
          .map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(',');
      }).join('\n');
      var url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      var a = SH.el('a', { href: url, download: 'studenthub-study-hours.csv' });
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      T.result('result', 'CSV exported', [{ label: 'Sessions', value: String(sessions.length) }], 'The file was downloaded to your device.', 'success');
    });
    document.getElementById('sh-clear').addEventListener('click', function () {
      if (!window.confirm('Remove all saved study sessions on this device?')) return;
      SH.storage.clear('sessions').then(function () { load(); T.result('result', 'Sessions cleared', [], null, 'success'); });
    });

    document.getElementById('sh-manual-date').value = dayKey(new Date());
    setMode(['start'], 'ready');
    paintClock();
    load();
  });
})();
