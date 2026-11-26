(function () {
  'use strict';
  var SH = window.StudentHub, T = SH.tool, C = window.SHC;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('study-pace-forecaster');

    function stat(label, value) {
      return SH.el('div', { class: 'stat' }, [SH.el('strong', { text: value }), SH.el('span', { text: label })]);
    }
    var SVG_NS = 'http://www.w3.org/2000/svg';
    function svgEl(name, attrs) {
      var node = document.createElementNS(SVG_NS, name);
      Object.keys(attrs || {}).forEach(function (key) { node.setAttribute(key, attrs[key]); });
      return node;
    }
    function point(x, y, cls) {
      var dot = SH.el('i', { class: 'chart-point ' + cls });
      dot.style.left = x + '%';
      dot.style.bottom = y + '%';
      return dot;
    }
    function line(points, cls) {
      var svg = svgEl('svg', { class: 'chart-line ' + cls, viewBox: '0 0 100 100', preserveAspectRatio: 'none', 'aria-hidden': 'true' });
      svg.appendChild(svgEl('polyline', { points: points, fill: 'none', 'stroke-width': '1.2', 'vector-effect': 'non-scaling-stroke' }));
      return svg;
    }
    function show(f) {
      var stats = document.getElementById('sp-stats');
      stats.textContent = ''; T.ready(stats);
      [['Remaining', T.fmt(f.remaining, 1)], ['Projected', T.fmt(f.projectedPercent, 1) + '%'],
       ['Required hours/day', T.fmt(f.requiredHoursPerDay, 1)], ['Finish in', f.finishDays + ' days']].forEach(function (p) {
        stats.appendChild(stat(p[0], p[1]));
      });
      var ring = document.getElementById('sp-ring');
      ring.style.setProperty('--pct', f.projectedPercent + '%');
      ring.dataset.level = f.status === 'behind' ? 'warn' : 'good';
      document.getElementById('sp-ring-label').textContent = T.fmt(f.projectedPercent, 0) + '%';
      document.getElementById('sp-goal-copy').textContent = f.status === 'complete' ? 'Already complete' : f.status === 'behind' ? 'Behind the required pace' : 'On track with ' + f.bufferDays + ' days spare';

      var chart = document.getElementById('sp-chart');
      chart.textContent = '';
      var lastDay = f.curve.length ? (f.curve[f.curve.length - 1].day || 1) : 1;
      function series(key) {
        return f.curve.map(function (p) { return (p.day / lastDay * 100) + ',' + (100 - p[key]); }).join(' ');
      }
      chart.appendChild(line(series('ideal'), 'ideal'));
      chart.appendChild(line(series('projected'), 'projected'));
      f.curve.forEach(function (p, i) {
        var x = i / (f.curve.length - 1) * 100;
        chart.appendChild(point(x, p.ideal, 'ideal'));
        chart.appendChild(point(x, p.projected, 'projected'));
      });

      var plan = document.getElementById('sp-plan');
      plan.textContent = '';
      var title = f.status === 'complete' ? 'Work is already complete' : f.status === 'behind' ? 'Pace gap detected' : 'Your pace has buffer';
      var text = f.status === 'complete'
        ? 'All units are marked complete. Keep a short review routine going until the exam.'
        : f.status === 'behind'
          ? 'At your current pace you reach ' + T.fmt(f.projectedPercent, 1) + '%, not 100%. You need ' + T.fmt(f.requiredPerDay, 2) + ' units a day, or ' + T.fmt(f.requiredHoursPerDay, 1) + ' hours a day, to finish in time.'
          : 'Your current pace finishes the work with about ' + f.bufferDays + ' days to spare. Keep the routine steady and review weak topics.';
      plan.appendChild(SH.el('div', { class: 'notice' + (f.status === 'behind' ? ' notice-warning' : '') }, [
        SH.el('strong', { text: title }), SH.el('span', { text: text })
      ]));
      return f;
    }
    function forecast() {
      var f = C.studyForecast({
        totalUnits: T.number('sp-total'), completedUnits: T.number('sp-completed'),
        unitsPerHour: T.number('sp-rate'), dailyHours: T.number('sp-daily'), daysLeft: T.number('sp-days')
      });
      if (!f) return T.error('result', 'Enter positive total units, rate, daily hours and days left. Completed units cannot be negative.');
      show(f);
      T.result('result', 'Forecast ready', [
        { label: 'Remaining units', value: T.fmt(f.remaining, 2) },
        { label: 'Current capacity', value: T.fmt(f.capacityPerDay, 2) + ' units/day' },
        { label: 'Projected completion', value: T.fmt(f.projectedPercent, 1) + '%' },
        { label: 'Required units/day', value: T.fmt(f.requiredPerDay, 2) },
        { label: 'Required hours/day', value: T.fmt(f.requiredHoursPerDay, 1) },
        { heading: 'Outcome' }, { label: 'Status', value: f.status.replace('-', ' ') },
        { label: 'Finish in', value: f.finishDays + ' days' }
      ], 'Use the chart to compare the pace you need with the pace you currently have.', f.status === 'behind' ? 'warn' : 'success');
      return f;
    }
    document.getElementById('study-pace-forecaster-form').addEventListener('submit', function (e) { e.preventDefault(); forecast(); });
    document.getElementById('sp-demo').addEventListener('click', function () {
      ['sp-total', 'sp-completed', 'sp-rate', 'sp-daily', 'sp-days'].forEach(function (id, i) {
        document.getElementById(id).value = [100, 40, 2, 2, 10][i];
      });
      forecast();
    });
    show(C.studyForecast({ totalUnits: 100, completedUnits: 40, unitsPerHour: 2, dailyHours: 2, daysLeft: 10 }));
  });
})();
