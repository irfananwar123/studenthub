(function () {
  'use strict';
  var SH = window.StudentHub, T = SH.tool, C = window.SHC;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('spaced-revision-scheduler');
    var plans = [];

    function dayKey(d) {
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
    function addDays(key, n) {
      var d = C.parseDate(key);
      return d ? C.isoDay(new Date(d.getTime() + n * 86400000)) : key;
    }
    function load() {
      return SH.storage.all('schedules').then(function (rows) {
        plans = rows.filter(function (r) { return r && r.type === 'revision'; });
        render();
      });
    }
    function stat(label, value) {
      return SH.el('div', { class: 'stat' }, [SH.el('strong', { text: value }), SH.el('span', { text: label })]);
    }
    function render() {
      var today = dayKey(new Date());
      var reviews = [];
      plans.forEach(function (plan) {
        (plan.plan || []).forEach(function (item) {
          reviews.push({ plan: plan, item: item });
        });
      });
      reviews.sort(function (a, b) { return String(a.item.date).localeCompare(String(b.item.date)); });
      var done = reviews.filter(function (r) { return r.item.done; }).length;
      var nextWeek = reviews.filter(function (r) {
        return !r.item.done && r.item.date >= today && r.item.date <= addDays(today, 6);
      }).length;
      var overdue = reviews.filter(function (r) { return !r.item.done && r.item.date < today; }).length;

      var stats = document.getElementById('rs-stats');
      stats.textContent = '';
      [['Topics planned', String(plans.length)], ['Due in 7 days', String(nextWeek)],
       ['Reviews completed', String(done)], ['Overdue', String(overdue)]].forEach(function (p) {
        stats.appendChild(stat(p[0], p[1]));
      });

      var list = document.getElementById('rs-list');
      list.textContent = '';
      if (!plans.length) {
        list.appendChild(SH.el('div', { class: 'empty-state' }, [SH.icon('calendar', 28), SH.el('strong', { text: 'No revision plans yet' }), SH.el('span', { text: 'Add a topic and generate its review dates.' })]));
        return;
      }
      plans.slice().sort(function (a, b) { return String(b.createdAt || '').localeCompare(String(a.createdAt || '')); }).forEach(function (plan) {
        var group = SH.el('div', { class: 'revision-group' });
        var head = SH.el('div', { class: 'list-item' });
        head.appendChild(SH.el('div', { class: 'list-item-body' }, [
          SH.el('div', { class: 'list-item-title', text: plan.topic }),
          SH.el('div', { class: 'list-item-meta', text: plan.strength + ' confidence' + (plan.examDate ? ' · exam ' + plan.examDate : '') + ' · ' + (plan.plan || []).length + ' reviews' })
        ]));
        var del = SH.el('button', { type: 'button', class: 'btn btn-danger btn-small', text: 'Remove plan' });
        del.addEventListener('click', function () { SH.storage.remove('schedules', plan.id).then(load); });
        head.appendChild(del); group.appendChild(head);

        (plan.plan || []).forEach(function (item) {
          var days = C.daysBetween(today, item.date);
          var status = item.done ? 'Done' : days < 0 ? 'Overdue' : days === 0 ? 'Due today' : 'In ' + days + ' days';
          var row = SH.el('div', { class: 'list-item' });
          row.appendChild(SH.el('div', { class: 'list-item-body' }, [
            SH.el('div', { class: 'list-item-title', text: 'Stage ' + item.stage + ' · ' + item.date }),
            SH.el('div', { class: 'list-item-meta', text: status + ' · ' + item.interval + '-day gap' })
          ]));
          row.appendChild(SH.el('span', { class: 'badge' + (item.done ? ' badge-neutral' : ''), text: status }));
          var toggle = SH.el('button', { type: 'button', class: 'btn btn-secondary btn-small', text: item.done ? 'Undo' : 'Mark done' });
          toggle.addEventListener('click', function () {
            item.done = !item.done;
            SH.storage.put('schedules', plan).then(load).then(function () {
              T.result('result', item.done ? 'Review completed' : 'Review reopened', [
                { label: 'Topic', value: plan.topic }, { label: 'Date', value: item.date }
              ], null, 'success');
            });
          });
          row.appendChild(toggle); group.appendChild(row);
        });
        list.appendChild(group);
      });
    }

    document.getElementById('rs-generate').addEventListener('click', function () {
      var topic = T.value('rs-topic');
      var exam = T.value('rs-exam');
      var strength = T.value('rs-strength') || 'medium';
      if (!topic) return T.error('result', 'Enter a topic to schedule.');
      if (exam && !C.parseDate(exam)) return T.error('result', 'Enter a valid exam date or leave it blank.');
      var plan = C.revisionPlan(dayKey(new Date()), exam || '', strength);
      if (!plan || !plan.length) return T.error('result', 'The exam date is too soon for any review. Choose a later date or leave it blank.');
      plan.forEach(function (item) { item.done = false; });
      SH.storage.put('schedules', {
        type: 'revision', topic: topic, strength: strength, examDate: exam || '',
        plan: plan, createdAt: new Date().toISOString()
      }).then(function () {
        document.getElementById('rs-topic').value = '';
        load();
        T.result('result', 'Revision plan generated', [
          { label: 'Topic', value: topic },
          { label: 'Reviews', value: String(plan.length) },
          { label: 'First review', value: plan[0].date },
          { label: 'Last review', value: plan[plan.length - 1].date }
        ], 'Dates are saved on this device only.', 'success');
      });
    });
    document.getElementById('rs-export').addEventListener('click', function () {
      var rows = [];
      plans.forEach(function (p) {
        (p.plan || []).forEach(function (item) {
          rows.push([p.topic, p.strength, p.examDate || '', item.stage, item.interval, item.date, item.done ? 'done' : 'pending']);
        });
      });
      if (!rows.length) return T.error('result', 'There are no revision plans to export.');
      var csv = 'Topic,Confidence,Exam,Stage,IntervalDays,Date,Status\n' + rows.map(function (row) {
        return row.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(',');
      }).join('\n');
      var url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      var a = SH.el('a', { href: url, download: 'studenthub-revision-plan.csv' });
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      T.result('result', 'CSV exported', [{ label: 'Reviews', value: String(rows.length) }], 'The file was downloaded to your device.', 'success');
    });
    document.getElementById('rs-clear').addEventListener('click', function () {
      if (!window.confirm('Remove all saved revision plans on this device?')) return;
      Promise.all(plans.map(function (p) { return SH.storage.remove('schedules', p.id); })).then(function () {
        load();
        T.result('result', 'Revision plans cleared', [{ label: 'Plans removed', value: String(plans.length) }], 'Other saved schedules were left untouched.', 'success');
      });
    });
    load();
  });
})();
