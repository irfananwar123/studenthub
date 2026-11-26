(function () {
  'use strict';
  var SH = window.StudentHub, T = SH.tool, C = window.SHC;
  var DRAFT = 'feynmanDraft';
  document.addEventListener('DOMContentLoaded', function () {
    T.init('feynman-clarity-score');

    function stat(label, value) {
      return SH.el('div', { class: 'stat' }, [SH.el('strong', { text: value }), SH.el('span', { text: label })]);
    }
    function breakdown(label, value) {
      var row = SH.el('div', { class: 'breakdown-row' });
      row.appendChild(SH.el('span', { text: label }));
      var track = SH.el('div', { class: 'split-bar' });
      var fill = SH.el('span');
      fill.style.width = Math.max(0, Math.min(100, value)) + '%';
      track.appendChild(fill);
      row.appendChild(track);
      row.appendChild(SH.el('strong', { text: T.fmt(value, 1) + '%' }));
      return row;
    }
    function show(r) {
      var stats = document.getElementById('fx-stats');
      var parts = document.getElementById('fx-breakdown');
      var gaps = document.getElementById('fx-gaps');
      [stats, parts, gaps].forEach(function (box) { box.textContent = ''; T.ready(box); });
      [['Score', T.fmt(r.score, 1) + '%'], ['Band', r.band], ['Average sentence', T.fmt(r.sentenceLength, 1) + ' words'],
       ['Simple words', T.fmt(r.simplePercent, 0) + '%']].forEach(function (pair) {
        stats.appendChild(stat(pair[0], pair[1]));
      });
      var ring = document.getElementById('fx-ring');
      ring.style.setProperty('--pct', r.score + '%');
      ring.dataset.level = r.score >= 85 ? 'good' : r.score >= 70 ? 'ok' : r.score >= 50 ? 'warn' : 'bad';
      document.getElementById('fx-ring-label').textContent = T.fmt(r.score, 0) + '%';
      document.getElementById('fx-goal-copy').textContent = r.band + ' · ' + r.stats.words + ' words';
      [['Sentence clarity', r.components.sentences], ['Simple words', r.components.simple],
       ['Examples & questions', r.components.teaching], ['Jargon control', r.components.jargon],
       ['Concept coverage', r.components.coverage]].forEach(function (pair) {
        parts.appendChild(breakdown(pair[0], pair[1]));
      });
      r.gaps.forEach(function (text, i) {
        gaps.appendChild(SH.el('div', { class: 'list-item' }, [
          SH.el('span', { class: 'badge' + (i ? ' badge-neutral' : ''), text: 'Fix ' + (i + 1) }),
          SH.el('div', { class: 'list-item-body' }, [SH.el('div', { class: 'list-item-title', text: text })])
        ]));
      });
      return r;
    }
    function analyze() {
      var text = T.value('fx-text');
      var r = C.feynmanClarity(text, T.value('fx-concept'));
      if (!r) return T.error('result', 'Write an explanation of at least 30 characters, then score it.');
      show(r);
      var rows = [
        { label: 'Clarity score', value: T.fmt(r.score, 1) + '%' },
        { label: 'Band', value: r.band },
        { label: 'Words', value: String(r.stats.words) },
        { label: 'Average sentence', value: T.fmt(r.sentenceLength, 1) + ' words' },
        { label: 'Simple words', value: T.fmt(r.simplePercent, 1) + '%' },
        { label: 'Jargon flags', value: String(r.jargonHits.length) },
        { label: 'Examples', value: String(r.examples) },
        { heading: 'First fix' },
        { label: 'Do this next', value: r.gaps[0] }
      ];
      T.result('result', 'Clarity score', rows, 'Clarity is not understanding. Test it by teaching the idea aloud without looking.',
        r.score >= 70 ? 'success' : 'warn');
      return r;
    }
    document.getElementById('feynman-clarity-score-form').addEventListener('submit', function (e) {
      e.preventDefault();
      analyze();
    });
    document.getElementById('fx-demo').addEventListener('click', function () {
      document.getElementById('fx-concept').value = 'Photosynthesis';
      document.getElementById('fx-text').value = 'Photosynthesis is how a plant makes food. It uses light, water and carbon dioxide. Imagine a tiny kitchen inside a leaf: light is the power, water and carbon dioxide are the ingredients, and sugar is the food. For example, a leaf in bright sun makes more sugar than a leaf in shade.';
      analyze();
    });
    document.getElementById('fx-save').addEventListener('click', function () {
      SH.storage.prefs.set(DRAFT, { concept: T.value('fx-concept'), text: T.value('fx-text') });
      T.result('result', 'Draft saved', [
        { label: 'Concept', value: T.value('fx-concept') || 'Unnamed concept' },
        { label: 'Saved on', value: 'This device only' }
      ], 'Your explanation will be restored when you reopen this page.', 'success');
    });
    try {
      var draft = SH.storage.prefs.get(DRAFT, null);
      if (draft && typeof draft === 'object') {
        if (draft.concept) document.getElementById('fx-concept').value = draft.concept;
        if (draft.text) document.getElementById('fx-text').value = draft.text;
      }
    } catch (err) { /* ignore an unreadable draft */ }
  });
})();
