(function () {
  'use strict';
  var SH = window.StudentHub, T = SH.tool;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('quiz-maker');
    var questions = [], active = [], answers = {}, submitted = false;
    var list = document.getElementById('qz-question-list'), quiz = document.getElementById('qz-quiz');
    function load() { return SH.storage.all('quizzes').then(function (rows) { questions = rows; active = rows.slice(); renderQuestions(); renderQuiz(); }); }
    function renderQuestions() {
      list.textContent = '';
      if (!questions.length) {
        list.appendChild(SH.el('div', { class: 'empty-state' }, [SH.icon('check', 28), SH.el('strong', { text: 'No questions yet' }), SH.el('span', { text: 'Add four-option questions above.' })]));
        return;
      }
      questions.forEach(function (q, i) {
        var row = SH.el('div', { class: 'list-item' });
        row.appendChild(SH.el('div', { class: 'list-item-body' }, [SH.el('div', { class: 'list-item-title', text: (i + 1) + '. ' + q.question }), SH.el('div', { class: 'list-item-meta', text: 'Correct: ' + q.correct + ' · ' + q.options[q.correct] })]));
        var del = SH.el('button', { type: 'button', class: 'btn btn-danger btn-small', text: 'Delete' });
        del.addEventListener('click', function () { SH.storage.remove('quizzes', q.id).then(load); });
        row.appendChild(del); list.appendChild(row);
      });
    }
    function renderQuiz() {
      quiz.textContent = '';
      answers = {}; submitted = false;
      if (!active.length) {
        quiz.appendChild(SH.el('div', { class: 'empty-state' }, [SH.el('strong', { text: 'Quiz not ready' }), SH.el('span', { text: 'Add at least one question.' })]));
        return;
      }
      active.forEach(function (q, i) {
        var fs = SH.el('fieldset', { style: 'margin-bottom:1rem' });
        fs.appendChild(SH.el('legend', { text: (i + 1) + '. ' + q.question }));
        ['A', 'B', 'C', 'D'].forEach(function (key) {
          var label = SH.el('label', { class: 'checkbox-row', style: 'margin:.3rem 0' });
          var input = SH.el('input', { type: 'radio', name: 'quiz-' + i, value: key });
          input.addEventListener('change', function () { answers[i] = key; });
          label.appendChild(input);
          label.appendChild(SH.el('span', { text: key + '. ' + q.options[key] }));
          fs.appendChild(label);
        });
        quiz.appendChild(fs);
      });
    }
    document.getElementById('qz-add').addEventListener('click', function () {
      var options = { A: T.value('qz-a'), B: T.value('qz-b'), C: T.value('qz-c'), D: T.value('qz-d') };
      var question = T.value('qz-question');
      var correct = T.value('qz-correct');
      if (!question || Object.keys(options).some(function (k) { return !options[k]; })) return T.error('result', 'Enter a question and all four options.');
      SH.storage.put('quizzes', { question: question, options: options, correct: correct, explanation: T.value('qz-explain') }).then(function () {
        ['qz-question', 'qz-a', 'qz-b', 'qz-c', 'qz-d', 'qz-explain'].forEach(function (id) { document.getElementById(id).value = ''; });
        load();
        T.result('result', 'Question added', [{ label: 'Question', value: question }, { label: 'Questions in quiz', value: String(questions.length + 1) }], null, 'success');
      });
    });
    document.getElementById('qz-submit').addEventListener('click', function () {
      if (!active.length) return T.error('result', 'Add at least one question first.');
      var missing = active.map(function (_, i) { return i; }).filter(function (i) { return !answers[i]; });
      if (missing.length) return T.error('result', 'Answer every question before submitting (' + missing.length + ' unanswered).');
      submitted = true;
      var correctCount = active.reduce(function (a, q, i) { return a + (answers[i] === q.correct ? 1 : 0); }, 0);
      var percent = correctCount / active.length * 100;
      var rows = [{ label: 'Correct answers', value: correctCount + ' / ' + active.length }, { label: 'Score', value: T.fmt(percent, 2) + '%' }];
      var incorrect = active.map(function (q, i) { return { q: q, i: i }; }).filter(function (x) { return answers[x.i] !== x.q.correct; });
      rows.push({ heading: 'Review' });
      active.forEach(function (q, i) {
        var ok = answers[i] === q.correct;
        rows.push({ label: (i + 1) + '. ' + q.question, value: ok ? 'Correct' : 'Your answer: ' + answers[i] + ' · Correct: ' + q.correct });
        if (!ok && q.explanation) rows.push({ label: 'Explanation', value: q.explanation });
      });
      T.result('result', 'Quiz score: ' + T.fmt(percent, 2) + '%', rows, incorrect.length ? 'Review the incorrect answers and explanations above.' : 'All answers correct — well done.', percent >= 50 ? 'success' : 'warning');
    });
    document.getElementById('qz-shuffle').addEventListener('click', function () {
      active = active.slice();
      for (var i = active.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = active[i]; active[i] = active[j]; active[j] = t;
      }
      renderQuiz();
      T.result('result', 'Questions shuffled', [{ label: 'Questions', value: String(active.length) }], null, 'success');
    });
    document.getElementById('qz-restart').addEventListener('click', function () { active = questions.slice(); renderQuiz(); T.result('result', 'Quiz restarted', [], 'All answers have been cleared.', 'success'); });
    load();
  });
})();
