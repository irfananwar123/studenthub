(function () {
  'use strict';
  var T = window.StudentHub.tool, C = window.SHC;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('reading-time-calculator');
    var form = document.getElementById('reading-time-calculator-form');
    document.getElementById('rt-text').addEventListener('input', function () {
      var n = C.textStats(this.value).words;
      document.getElementById('rt-words').value = n ? String(n) : '';
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var words = T.number('rt-words'), wpm = T.number('rt-wpm');
      if (!C.isNum(words) || words < 0) return T.error('result', 'Enter a non-negative word count or paste text above.');
      if (!C.isNum(wpm) || wpm <= 0) return T.error('result', 'Reading speed must be greater than zero.');
      var minutes = C.readingTime(words, wpm);
      var total = Math.round(minutes * 60);
      T.result('result', 'Estimated reading time: ' + T.fmt(minutes, 2) + ' minutes', [
        { label: 'Word count', value: T.fmt(words) },
        { label: 'Reading speed', value: T.fmt(wpm) + ' words/minute' },
        { label: 'Minutes', value: T.fmt(minutes, 3) },
        { label: 'Minutes and seconds', value: Math.floor(total / 60) + ' min ' + String(total % 60).padStart(2, '0') + ' s' }
      ], 'Estimate only: comprehension speed varies with text difficulty and purpose.', 'success');
    });
  });
})();
