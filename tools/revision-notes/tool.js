(function () {
  'use strict';
  var SH = window.StudentHub, T = SH.tool;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('revision-notes');
    var notes = [], editingId = null, timer = null;
    var status = document.getElementById('nt-status');
    var title = document.getElementById('nt-title'), subject = document.getElementById('nt-subject'), body = document.getElementById('nt-body');
    function draft() { return { title: title.value, subject: subject.value, body: body.value }; }
    function saveDraft() {
      try { localStorage.setItem('studenthub:notes:draft', JSON.stringify({ id: editingId, fields: draft() })); status.textContent = 'Draft autosaved on this device.'; }
      catch (e) { status.textContent = 'Autosave unavailable in this browser.'; }
    }
    function restoreDraft() {
      try {
        var d = JSON.parse(localStorage.getItem('studenthub:notes:draft') || 'null');
        if (!d || !d.fields) return;
        editingId = d.id || null;
        title.value = d.fields.title || ''; subject.value = d.fields.subject || ''; body.value = d.fields.body || '';
        status.textContent = 'Unsaved draft restored.';
        document.getElementById('nt-delete').disabled = !editingId;
      } catch (e) {}
    }
    function render() {
      var q = document.getElementById('nt-search').value.trim().toLowerCase();
      var list = document.getElementById('nt-list');
      list.textContent = '';
      var shown = notes.filter(function (n) {
        return !q || ((n.title || '') + ' ' + (n.subject || '') + ' ' + (n.body || '')).toLowerCase().indexOf(q) !== -1;
      }).sort(function (a, b) { return (b.updatedAt || '').localeCompare(a.updatedAt || ''); });
      if (!shown.length) {
        list.appendChild(SH.el('div', { class: 'empty-state' }, [SH.icon('pencil', 28), SH.el('strong', { text: notes.length ? 'No matching notes' : 'No notes saved yet' }), SH.el('span', { text: notes.length ? 'Try another search term.' : 'Write a note and select Save note.' })]));
        return;
      }
      shown.forEach(function (n) {
        var row = SH.el('div', { class: 'list-item' });
        var preview = String(n.body || '').slice(0, 110) + (String(n.body || '').length > 110 ? '…' : '');
        row.appendChild(SH.el('div', { class: 'list-item-body' }, [SH.el('div', { class: 'list-item-title', text: n.title || 'Untitled note' }), SH.el('div', { class: 'list-item-meta', text: (n.subject || 'No subject') + ' · ' + preview })]));
        var edit = SH.el('button', { type: 'button', class: 'btn btn-secondary btn-small', text: 'Edit' });
        edit.addEventListener('click', function () {
          editingId = n.id; title.value = n.title || ''; subject.value = n.subject || ''; body.value = n.body || '';
          document.getElementById('nt-delete').disabled = false; saveDraft();
          status.textContent = 'Note loaded for editing.';
        });
        var del = SH.el('button', { type: 'button', class: 'btn btn-danger btn-small', text: 'Delete' });
        del.addEventListener('click', function () {
          if (!window.confirm('Delete this note?')) return;
          SH.storage.remove('notes', n.id).then(function () {
            if (editingId === n.id) { editingId = null; document.getElementById('nt-delete').disabled = true; }
            load();
          });
        });
        row.appendChild(edit); row.appendChild(del); list.appendChild(row);
      });
    }
    function load() { return SH.storage.all('notes').then(function (rows) { notes = rows; render(); }); }
    [title, subject, body].forEach(function (node) {
      node.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(saveDraft, 600); });
    });
    document.getElementById('nt-search').addEventListener('input', render);
    document.getElementById('nt-save').addEventListener('click', function () {
      if (!title.value.trim() && !body.value.trim()) return T.error('result', 'Write a title or note body before saving.');
      var payload = Object.assign(draft(), { updatedAt: new Date().toISOString() });
      if (editingId) payload.id = editingId;
      SH.storage.put('notes', payload).then(function () {
        editingId = null;
        try { localStorage.removeItem('studenthub:notes:draft'); } catch (e) {}
        title.value = ''; subject.value = ''; body.value = '';
        document.getElementById('nt-delete').disabled = true;
        status.textContent = 'Note saved locally.';
        load();
        T.result('result', 'Note saved', [{ label: 'Title', value: payload.title || 'Untitled note' }, { label: 'Subject', value: payload.subject || 'None' }], null, 'success');
      });
    });
    document.getElementById('nt-new').addEventListener('click', function () {
      editingId = null; title.value = ''; subject.value = ''; body.value = '';
      document.getElementById('nt-delete').disabled = true;
      try { localStorage.removeItem('studenthub:notes:draft'); } catch (e) {}
      status.textContent = 'New note ready.';
    });
    document.getElementById('nt-delete').addEventListener('click', function () {
      if (!editingId || !window.confirm('Delete this note permanently from this device?')) return;
      SH.storage.remove('notes', editingId).then(function () {
        editingId = null; document.getElementById('nt-delete').disabled = true;
        title.value = ''; subject.value = ''; body.value = '';
        try { localStorage.removeItem('studenthub:notes:draft'); } catch (e) {}
        load();
      });
    });
    document.getElementById('nt-export-txt').addEventListener('click', function () {
      if (!notes.length) return T.error('result', 'There are no notes to export.');
      var text = notes.map(function (n) { return '# ' + (n.title || 'Untitled') + '\nSubject: ' + (n.subject || 'None') + '\n\n' + (n.body || '') + '\n'; }).join('\n---\n\n');
      var url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
      var a = SH.el('a', { href: url, download: 'studenthub-revision-notes.txt' });
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    });
    document.getElementById('nt-export-json').addEventListener('click', function () {
      SH.storage.exportData().then(function (json) {
        var url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
        var a = SH.el('a', { href: url, download: 'studenthub-backup.json' });
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      });
    });
    restoreDraft(); load();
  });
})();
