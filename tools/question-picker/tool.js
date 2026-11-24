(function () {
  'use strict';
  var SH = window.StudentHub, T = SH.tool;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('question-picker');
    var questions = [], lastIndex = -1;
    var list = document.getElementById('qp-list'), pickBtn = document.getElementById('qp-pick');
    function load() { return SH.storage.all('questions').then(function (rows) { questions = rows; render(); }); }
    function render() {
      list.textContent = '';
      pickBtn.disabled = !questions.length;
      if (!questions.length) {
        list.appendChild(SH.el('div', { class: 'empty-state' }, [SH.icon('star', 28), SH.el('strong', { text: 'No questions yet' }), SH.el('span', { text: 'Add revision questions to pick from.' })]));
        return;
      }
      questions.forEach(function (q, i) {
        var row = SH.el('div', { class: 'list-item' });
        row.appendChild(SH.el('div', { class: 'list-item-body' }, [SH.el('div', { class: 'list-item-title', text: (i + 1) + '. ' + q.text })]));
        var del = SH.el('button', { type: 'button', class: 'btn btn-danger btn-small', text: 'Remove' });
        del.addEventListener('click', function () { SH.storage.remove('questions', q.id).then(load); });
        row.appendChild(del); list.appendChild(row);
      });
    }
    function randomIndex() {
      if (window.crypto && crypto.getRandomValues) return crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
      return Math.random();
    }
    document.getElementById('qp-add').addEventListener('click', function () {
      var text = document.getElementById('qp-input').value.trim();
      if (!text) return T.error('result', 'Enter a question first.');
      SH.storage.put('questions', { text: text, createdAt: new Date().toISOString() }).then(function () {
        document.getElementById('qp-input').value = ''; load();
        T.result('result', 'Question added', [{ label: 'Question', value: text }, { label: 'Total', value: String(questions.length + 1) }], null, 'success');
      });
    });
    pickBtn.addEventListener('click', function () {
      if (!questions.length) return T.error('result', 'Add at least one question.');
      var avoid = document.getElementById('qp-avoid').checked && questions.length > 1;
      var idx = Math.floor(randomIndex() * questions.length);
      if (avoid) {
        var guard = 0;
        while (idx === lastIndex && guard < 50) { idx = Math.floor(randomIndex() * questions.length); guard++; }
      }
      lastIndex = idx;
      document.getElementById('qp-selected').textContent = questions[idx].text;
      T.result('result', 'Question selected', [{ label: 'Question', value: questions[idx].text }, { label: 'Pool size', value: String(questions.length) }], avoid ? 'Immediate repeats are avoided when possible.' : 'Immediate repeats are allowed.', 'success');
    });
    load();
  });
})();
