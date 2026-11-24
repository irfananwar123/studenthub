(function () {
  'use strict';
  var SH = window.StudentHub, T = SH.tool;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('vocabulary-trainer');
    var words = [], pool = [], revealed = false;
    var list = document.getElementById('vc-list'), filter = document.getElementById('vc-filter');
    var revealBtn = document.getElementById('vc-reveal'), nextBtn = document.getElementById('vc-next');
    function load() {
      return SH.storage.all('vocabulary').then(function (rows) {
        words = rows;
        var names = Array.from(new Set(words.map(function (w) { return w.collection || 'My words'; }))).sort();
        var current = filter.value;
        filter.textContent = '';
        filter.appendChild(SH.el('option', { value: '', text: 'All collections' }));
        names.forEach(function (n) { filter.appendChild(SH.el('option', { value: n, text: n })); });
        if (names.indexOf(current) !== -1) filter.value = current;
        pool = []; render(); renderPractice();
      });
    }
    function visible() {
      var q = document.getElementById('vc-search').value.trim().toLowerCase();
      var c = filter.value;
      return words.filter(function (w) { return (!c || w.collection === c) && (!q || (w.word + ' ' + w.definition).toLowerCase().indexOf(q) !== -1); });
    }
    function render() {
      var rows = visible();
      list.textContent = '';
      if (!rows.length) {
        list.appendChild(SH.el('div', { class: 'empty-state' }, [SH.icon('book', 28), SH.el('strong', { text: 'No words to show' }), SH.el('span', { text: 'Add words or adjust your filters.' })]));
        return;
      }
      rows.forEach(function (w) {
        var row = SH.el('div', { class: 'list-item' });
        row.appendChild(SH.el('div', { class: 'list-item-body' }, [SH.el('div', { class: 'list-item-title', text: w.word }), SH.el('div', { class: 'list-item-meta', text: w.definition + ' · ' + (w.collection || 'My words') })]));
        var del = SH.el('button', { type: 'button', class: 'btn btn-danger btn-small', text: 'Remove' });
        del.addEventListener('click', function () { SH.storage.remove('vocabulary', w.id).then(load); });
        row.appendChild(del); list.appendChild(row);
      });
    }
    function renderPractice() {
      revealed = false;
      var word = document.getElementById('vc-practice-word'), def = document.getElementById('vc-practice-def');
      if (!pool.length) pool = visible().slice();
      def.classList.add('visually-hidden');
      def.style.fontWeight = '';
      revealBtn.textContent = 'Reveal definition';
      if (!pool.length) {
        word.textContent = 'Add words to begin'; def.textContent = '';
        revealBtn.disabled = true; nextBtn.disabled = true; return;
      }
      var item = pool[Math.floor(Math.random() * pool.length)];
      word.textContent = item.word;
      def.textContent = item.definition;
      revealBtn.disabled = false; nextBtn.disabled = false;
    }
    document.getElementById('vc-add').addEventListener('click', function () {
      var w = T.value('vc-word'), d = T.value('vc-def'), c = T.value('vc-collection') || 'My words';
      if (!w || !d) return T.error('result', 'Enter a word and its definition.');
      SH.storage.put('vocabulary', { word: w, definition: d, collection: c }).then(function () {
        document.getElementById('vc-word').value = ''; document.getElementById('vc-def').value = '';
        load();
        T.result('result', 'Word added', [{ label: 'Word', value: w }, { label: 'Collection', value: c }], null, 'success');
      });
    });
    document.getElementById('vc-search').addEventListener('input', function () { pool = []; render(); renderPractice(); });
    filter.addEventListener('change', function () { pool = []; render(); renderPractice(); });
    revealBtn.addEventListener('click', function () {
      var def = document.getElementById('vc-practice-def');
      def.classList.remove('visually-hidden');
      def.style.fontWeight = '600';
      revealed = true;
      revealBtn.textContent = 'Definition shown';
    });
    nextBtn.addEventListener('click', function () {
      if (pool.length > 1) pool = pool.filter(function (w) { return w.word !== document.getElementById('vc-practice-word').textContent; });
      else pool = visible().slice();
      revealBtn.textContent = 'Reveal definition';
      renderPractice();
    });
    load();
  });
})();
