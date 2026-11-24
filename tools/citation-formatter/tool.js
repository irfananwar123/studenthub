(function () {
  'use strict';
  var T = window.StudentHub.tool, C = window.SHC;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('citation-formatter');
    var form = document.getElementById('citation-formatter-form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = {
        author: T.value('cf-author'), year: T.value('cf-year'), title: T.value('cf-title'),
        publisher: T.value('cf-publisher'), edition: T.value('cf-edition')
      };
      if (!data.author && !data.title) return T.error('result', 'Enter at least an author and a book title.');
      var out = C.formatCitation(T.value('cf-style'), data);
      if (!out) return T.error('result', 'Choose a citation style.');
      var rows = [{ label: 'Formatted reference', value: out.text }];
      if (out.warnings.length) rows.push({ label: 'Missing details', value: out.warnings.join(' ') });
      T.result('result', out.warnings.length ? 'Formatted with missing details' : 'Reference formatted', rows,
        'Basic book format only. Check punctuation, italics and ordering against the official style guide before submitting.', out.warnings.length ? 'warning' : 'success');
      var copyBtn = document.getElementById('cf-copy');
      if (!copyBtn) {
        copyBtn = document.createElement('button');
        copyBtn.type = 'button'; copyBtn.className = 'btn btn-secondary btn-small';
        copyBtn.id = 'cf-copy'; copyBtn.textContent = 'Copy reference';
        copyBtn.addEventListener('click', function () { T.copyText(out.text, this); });
        form.querySelector('.form-actions').appendChild(copyBtn);
      } else {
        copyBtn.onclick = function () { T.copyText(out.text, this); };
      }
    });
  });
})();
