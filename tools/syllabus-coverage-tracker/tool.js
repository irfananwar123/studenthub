(function () {
  'use strict';
  var SH = window.StudentHub, T = SH.tool, C = window.SHC;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('syllabus-coverage-tracker');
    var topics = [], editing = null;

    function stat(label, value) {
      return SH.el('div', { class: 'stat' }, [SH.el('strong', { text: value }), SH.el('span', { text: label })]);
    }
    function breakRow(label, percent, value) {
      var row = SH.el('div', { class: 'breakdown-row' });
      row.appendChild(SH.el('span', { text: label }));
      var track = SH.el('div', { class: 'split-bar' });
      var fill = SH.el('span');
      fill.style.width = Math.max(0, Math.min(100, percent)) + '%';
      track.appendChild(fill); row.appendChild(track);
      row.appendChild(SH.el('strong', { text: value }));
      return row;
    }
    function empty(target, title, note) {
      target.textContent = '';
      target.appendChild(SH.el('div', { class: 'empty-state' }, [SH.icon('target', 28), SH.el('strong', { text: title }), SH.el('span', { text: note })]));
    }
    function render() {
      var s = C.syllabusCoverage(topics);
      var stats = document.getElementById('sc-stats');
      var subjects = document.getElementById('sc-subjects');
      var focus = document.getElementById('sc-focus');
      var list = document.getElementById('sc-list');
      [stats, subjects, focus, list].forEach(function (box) { box.textContent = ''; T.ready(box); });
      if (!s) {
        ['Topics', 'Coverage', 'In progress', 'Confidence'].forEach(function (label) {
          stats.appendChild(stat(label, '0'));
        });
        empty(subjects, 'No subjects yet', 'Save a syllabus topic to see its progress.');
        empty(focus, 'Nothing to focus on yet', 'The weakest subjects will appear here.');
        empty(list, 'No topics tracked', 'Add a subject and topic above to begin.');
        return;
      }
      [['Topics', String(s.total)], ['Completed', T.fmt(s.percent, 1) + '%'],
       ['In progress', String(s.inProgress)], ['Confidence', T.fmt(s.confidencePercent, 1) + '%']].forEach(function (p) {
        stats.appendChild(stat(p[0], p[1]));
      });
      var ring = document.getElementById('sc-ring');
      ring.style.setProperty('--pct', s.percent + '%');
      document.getElementById('sc-ring-label').textContent = T.fmt(s.percent, 0) + '%';
      document.getElementById('sc-goal-copy').textContent = s.done + ' of ' + s.total + ' topics complete';
      s.bySubject.forEach(function (g) {
        subjects.appendChild(breakRow(g.subject, g.percent, T.fmt(g.percent, 1) + '%'));
      });
      s.focus.forEach(function (g, i) {
        var row = SH.el('div', { class: 'list-item' });
        row.appendChild(SH.el('div', { class: 'list-item-body' }, [
          SH.el('div', { class: 'list-item-title', text: g.subject }),
          SH.el('div', { class: 'list-item-meta', text: g.done + ' of ' + g.total + ' topics done · ' + g.inProgress + ' in progress' })
        ]));
        row.appendChild(SH.el('span', { class: 'badge' + (i ? ' badge-neutral' : ''), text: 'Focus ' + (i + 1) }));
        focus.appendChild(row);
      });
      topics.slice().sort(function (a, b) {
        return a.subject.localeCompare(b.subject) || a.topic.localeCompare(b.topic);
      }).forEach(function (row) {
        var line = SH.el('div', { class: 'list-item' });
        line.appendChild(SH.el('div', { class: 'list-item-body' }, [
          SH.el('div', { class: 'list-item-title', text: row.topic }),
          SH.el('div', { class: 'list-item-meta', text: row.subject + ' · ' + row.status.replace('-', ' ') + ' · ' + row.confidence + ' confidence' })
        ]));
        var edit = SH.el('button', { type: 'button', class: 'btn btn-secondary btn-small', text: 'Edit' });
        edit.addEventListener('click', function () {
          editing = row;
          document.getElementById('sc-subject').value = row.subject;
          document.getElementById('sc-topic').value = row.topic;
          document.getElementById('sc-status').value = row.status;
          document.getElementById('sc-confidence').value = row.confidence;
          document.getElementById('sc-add').textContent = 'Update topic';
        });
        var del = SH.el('button', { type: 'button', class: 'btn btn-danger btn-small', text: 'Remove' });
        del.addEventListener('click', function () { SH.storage.remove('tasks', row.id).then(function () { load(); }); });
        line.appendChild(edit); line.appendChild(del); list.appendChild(line);
      });
    }
    function load() {
      T.loading('sc-list', 3); T.loading('sc-subjects', 2); T.loading('sc-focus', 2);
      return SH.storage.all('tasks').then(function (rows) {
        topics = rows.filter(function (row) { return row && row.type === 'syllabus'; });
        render();
      });
    }
    document.getElementById('sc-add').addEventListener('click', function () {
      var subject = T.value('sc-subject'), topic = T.value('sc-topic');
      if (!subject || !topic) return T.error('result', 'Enter both a subject and a topic.');
      var payload = {
        type: 'syllabus', subject: subject, topic: topic,
        status: T.value('sc-status') || 'not-started',
        confidence: T.value('sc-confidence') || 'medium',
        updatedAt: new Date().toISOString()
      };
      var wasEditing = !!editing;
      if (editing) payload.id = editing.id;
      SH.storage.put('tasks', payload).then(function () {
        editing = null;
        document.getElementById('sc-topic').value = '';
        document.getElementById('sc-status').value = 'not-started';
        document.getElementById('sc-add').textContent = 'Save topic';
        load();
        T.result('result', wasEditing ? 'Topic updated' : 'Topic saved', [
          { label: 'Subject', value: subject }, { label: 'Topic', value: topic },
          { label: 'Status', value: payload.status.replace('-', ' ') }
        ], 'Coverage and focus order have been refreshed.', 'success');
      });
    });
    document.getElementById('sc-export').addEventListener('click', function () {
      if (!topics.length) return T.error('result', 'There are no syllabus topics to export.');
      var csv = 'Subject,Topic,Status,Confidence,Updated\n' + topics.map(function (row) {
        return [row.subject, row.topic, row.status, row.confidence, row.updatedAt || '']
          .map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(',');
      }).join('\n');
      var url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      var a = SH.el('a', { href: url, download: 'studenthub-syllabus-coverage.csv' });
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      T.result('result', 'CSV exported', [{ label: 'Topics', value: String(topics.length) }], 'The file was downloaded to your device.', 'success');
    });
    document.getElementById('sc-clear').addEventListener('click', function () {
      if (!window.confirm('Remove all tracked syllabus topics on this device?')) return;
      Promise.all(topics.map(function (row) { return SH.storage.remove('tasks', row.id); })).then(function () {
        load();
        T.result('result', 'Syllabus cleared', [{ label: 'Topics removed', value: String(topics.length) }], 'Other saved assignments and habits were left untouched.', 'success');
      });
    });
    load();
  });
})();
