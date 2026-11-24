'use strict';
const { f } = require('./helpers');

module.exports = {
  'flashcard-maker': {
    h1: 'Flashcard Maker',
    seoTitle: 'Flashcard Maker — Create, Flip, Shuffle and Track Cards',
    desc: 'Build flashcard decks, flip cards to check answers, shuffle practice order, mark difficult cards and export or import a backup.',
    intro: 'Active recall is easier when your questions are in one place. Create cards, flip them to reveal answers, shuffle a practice round and mark the ones you want to revisit. Your decks are stored locally and can be backed up as a JSON file.',
    icon: 'book',
    form: `
      <div class="form-grid">
        ${f('fc-front', 'Question / front', 'text', 'placeholder="e.g. What is mitosis?"')}
        ${f('fc-back', 'Answer / back', 'text', 'placeholder="e.g. Cell division producing identical daughter cells"')}
        ${f('fc-deck', 'Deck name', 'text', 'value="My deck"')}
      </div>
      <div class="form-actions"><button class="btn btn-primary" type="button" id="fc-add">${require('./helpers').icon('plus', 16)} Add card</button></div>
      <div class="btn-row" style="margin-top:1rem">
        <button class="btn btn-secondary btn-small" type="button" id="fc-shuffle">Shuffle</button>
        <button class="btn btn-secondary btn-small" type="button" id="fc-prev">Previous</button>
        <button class="btn btn-secondary btn-small" type="button" id="fc-next">Next</button>
        <button class="btn btn-secondary btn-small" type="button" id="fc-difficult">Mark difficult</button>
        <button class="btn btn-secondary btn-small" type="button" id="fc-known">Mark known</button>
      </div>
      <div style="margin-top:1.2rem"><button class="flashcard" type="button" id="fc-card" aria-label="Flip flashcard"><span class="flashcard-inner"><span class="flashcard-face"><span>Question</span><strong id="fc-front-view">Add a card to begin</strong></span><span class="flashcard-face back"><span>Answer</span><strong id="fc-back-view">Your answer appears here</strong></span></span></button></div>
      <p class="field-hint" id="fc-position" style="text-align:center;margin-top:.7rem"></p>
      <div class="btn-row no-print" style="margin-top:.6rem"><button class="btn btn-secondary btn-small" type="button" id="fc-export">Export backup</button><label class="btn btn-secondary btn-small" for="fc-import">Import backup</label><input id="fc-import" type="file" accept="application/json,.json" class="visually-hidden"><button class="btn btn-danger btn-small" type="button" id="fc-clear">Clear deck</button></div>
      <div id="fc-list" style="margin-top:1rem"></div>`,
    formula: `<p>Shuffle uses a Fisher–Yates style random ordering so every card has an equal chance of appearing in each position. A card is marked “known” or “difficult” only when you choose that label; the tool does not guess your knowledge.</p>`,
    example: `<p><strong>Example:</strong> create a card with question “What is the capital of Japan?” and answer “Tokyo”. Flip it to test yourself, mark it difficult if you hesitated, then shuffle so it appears in a new position in the next round.</p>`,
    steps: ['Type a question, answer and deck name, then add the card.', 'Flip the card and use Previous/Next to move through your deck.', 'Mark difficult cards, shuffle, and export a backup before clearing your browser data.'],
    faq: [
      ['Do flashcards sync between devices?', 'No. Use Export backup and Import backup to move them manually.'],
      ['Does the tool use spaced repetition scheduling?', 'Not in this version. It tracks known and difficult cards, but does not schedule future reviews.'],
      ['Can I have more than one deck?', 'The deck name field groups cards; filtering by deck is available in the card list.']
    ]
  },
  'quiz-maker': {
    h1: 'Quiz Maker',
    seoTitle: 'Quiz Maker — Multiple-Choice Questions with Review',
    desc: 'Create four-option multiple-choice quizzes, calculate your score, read explanations and review every incorrect answer.',
    intro: 'Turn your revision questions into a quiz with four answer options. Add as many questions as you like, take the quiz, then review both correct and incorrect answers with your own explanations.',
    icon: 'check',
    form: `
      <h3>Build questions</h3>
      <div class="form-grid">
        ${f('qz-question', 'Question', 'text', 'placeholder="e.g. Which organelle produces ATP?"')}
        ${f('qz-a', 'Option A', 'text', 'placeholder="First option"')}
        ${f('qz-b', 'Option B', 'text', 'placeholder="Second option"')}
        ${f('qz-c', 'Option C', 'text', 'placeholder="Third option"')}
        ${f('qz-d', 'Option D', 'text', 'placeholder="Fourth option"')}
      </div>
      <div class="form-grid" style="margin-top:1rem">
        <div class="field"><label for="qz-correct">Correct option</label><select id="qz-correct"><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option></select></div>
        ${f('qz-explain', 'Explanation (optional)', 'text', 'placeholder="Why this answer is correct"')}
      </div>
      <div class="form-actions"><button class="btn btn-secondary" type="button" id="qz-add">${require('./helpers').icon('plus', 16)} Add question</button></div>
      <div id="qz-question-list" style="margin-top:1rem"></div>
      <h3 style="margin-top:1.5rem">Take the quiz</h3>
      <div id="qz-quiz"></div>
      <div class="form-actions"><button class="btn btn-primary" type="button" id="qz-submit">Submit answers</button><button class="btn btn-secondary" type="button" id="qz-shuffle">Shuffle questions</button><button class="btn btn-secondary" type="button" id="qz-restart">Restart</button></div>`,
    formula: `<p>Score: <code>correct answers ÷ total questions × 100</code>. Each question must have four non-empty options and one marked correct answer before it can be added.</p>`,
    example: `<p><strong>Example:</strong> a five-question quiz with four correct answers scores 4 ÷ 5 × 100 = <strong>80%</strong>. The review then lists the one question you answered incorrectly together with its explanation.</p>`,
    steps: ['Add questions with four options and mark the correct one.', 'Answer every question in the Take the quiz section.', 'Submit to see your score, then review incorrect answers.'],
    faq: [
      ['Can I shuffle quiz questions?', 'Yes, use Shuffle questions before taking the quiz. Your answers stay matched to the right question.'],
      ['What if I leave a question blank?', 'The result counts it as unanswered and includes it in the review.'],
      ['Are quizzes saved?', 'Yes, in this browser’s local database. No account or network connection is needed.']
    ]
  },
  'revision-notes': {
    h1: 'Revision Notes',
    seoTitle: 'Revision Notes — Searchable, Subject-Organised Notes with Autosave',
    desc: 'Write revision notes organised by subject, search your notes, export them as text or JSON, and rely on careful local autosave.',
    intro: 'A simple place for the notes you actually revise from. Organise by subject, search across titles and bodies, and export a backup whenever you want. Notes autosave locally while you type and can be restored after a reload.',
    icon: 'pencil',
    form: `
      <div class="form-grid">
        ${f('nt-title', 'Note title', 'text', 'placeholder="e.g. Photosynthesis summary"')}
        ${f('nt-subject', 'Subject', 'text', 'placeholder="e.g. Biology"')}
      </div>
      <div class="field" style="margin-top:1rem"><label for="nt-body">Note</label><textarea id="nt-body" rows="8" placeholder="Write your revision note here…"></textarea></div>
      <div class="form-actions"><button class="btn btn-primary" type="button" id="nt-save">Save note</button><button class="btn btn-secondary" type="button" id="nt-new">New note</button><button class="btn btn-secondary" type="button" id="nt-delete" disabled>Delete</button></div>
      <p class="field-hint" id="nt-status" role="status" aria-live="polite" style="margin-top:.6rem"></p>
      <div class="field" style="margin-top:1.3rem"><label for="nt-search">Search notes</label><input id="nt-search" type="search" placeholder="Search titles, subjects and text"></div>
      <div id="nt-list" style="margin-top:1rem"></div>
      <div class="btn-row no-print" style="margin-top:1rem"><button class="btn btn-secondary btn-small" type="button" id="nt-export-txt">Export as text</button><button class="btn btn-secondary btn-small" type="button" id="nt-export-json">Export JSON backup</button></div>`,
    formula: `<p>Autosave keeps the currently edited title, subject and body in LocalStorage as you type. Saved notes are written to IndexedDB. Search matches whole words case-insensitively across title, subject and body; nothing is indexed or sent to a search service.</p>`,
    example: `<p><strong>Example:</strong> create a note titled “Cell respiration” with subject “Biology”. Search for “respiration” or “biology” to find it later, even if the note is long.</p>`,
    steps: ['Write a title, subject and note body.', 'Save when you reach a natural stopping point; autosave protects unsaved text too.', 'Search or export your notes whenever you need them.'],
    faq: [
      ['Where do unsaved changes go?', 'They are kept in this browser’s LocalStorage and restored when you reopen the editor.'],
      ['Can I export all notes at once?', 'Yes. Export as text creates a readable document; Export JSON creates a backup you can import from the workspace.'],
      ['Can I use formatting?', 'This release stores plain text intentionally, so your notes stay portable and fast.']
    ]
  },
  'question-picker': {
    h1: 'Random Question Picker',
    seoTitle: 'Random Question Picker — Avoid Immediate Repeats',
    desc: 'Add your own questions and pick one at random for practice, with an option to avoid picking the same question twice in a row.',
    intro: 'Use a random question to break up a revision session or choose a topic for the whole class. Add your own list, pick one at once and avoid immediate repeats when there is more than one question.',
    icon: 'star',
    form: `
      <div class="field"><label for="qp-input">Question</label><input id="qp-input" type="text" placeholder="e.g. Explain the water cycle"></div>
      <div class="form-actions"><button class="btn btn-primary" type="button" id="qp-add">${require('./helpers').icon('plus', 16)} Add question</button></div>
      <div class="card" style="margin-top:1.2rem;text-align:center">
        <p class="field-hint">Selected question</p>
        <p id="qp-selected" style="font-size:1.2rem;font-weight:700;min-height:2.5rem">Add questions, then pick one.</p>
        <button class="btn btn-secondary" type="button" id="qp-pick" disabled>Pick a question</button>
      </div>
      <div class="checkbox-row" style="margin-top:1rem"><input id="qp-avoid" type="checkbox" checked><label for="qp-avoid">Avoid picking the same question twice in a row</label></div>
      <h3 style="margin-top:1.3rem">Your questions</h3>
      <div id="qp-list"></div>`,
    formula: `<p>A random index is generated in the range 0 to <code>number of questions − 1</code>. If “avoid repeats” is enabled and more than one question exists, a new index is drawn until it differs from the previous one.</p>`,
    example: `<p><strong>Example:</strong> with five questions and repeat avoidance on, choosing again after question 3 will choose from the other four questions. With only one question, it is selected every time.</p>`,
    steps: ['Add questions one at a time.', 'Select Pick a question for a random prompt.', 'Remove questions you no longer need from the list.'],
    faq: [
      ['How random is the picker?', 'It uses the browser’s crypto random source when available and falls back to Math.random; it is suitable for practice, not for security.'],
      ['Are questions stored?', 'Yes, in your browser’s local database, so they survive a refresh.'],
      ['Can I reset the list?', 'Yes, each question has its own Remove button.']
    ]
  },
  'vocabulary-trainer': {
    h1: 'Vocabulary Trainer',
    seoTitle: 'Vocabulary Trainer — Custom Word Collections and Practice',
    desc: 'Create vocabulary collections, add words and definitions, search them and practise recalling definitions one at a time.',
    intro: 'Build your own vocabulary list for any language or subject. Add definitions, search your collection and switch to practice mode to test yourself without seeing the answer first.',
    icon: 'book',
    form: `
      <div class="form-grid">
        ${f('vc-word', 'Word or term', 'text', 'placeholder="e.g. photosynthesis"')}
        ${f('vc-def', 'Definition', 'text', 'placeholder="e.g. Process plants use to make food from light"')}
        ${f('vc-collection', 'Collection', 'text', 'value="My words"')}
      </div>
      <div class="form-actions"><button class="btn btn-primary" type="button" id="vc-add">${require('./helpers').icon('plus', 16)} Add word</button></div>
      <div class="form-grid" style="margin-top:1.2rem"><div class="field"><label for="vc-search">Search words</label><input id="vc-search" type="search" placeholder="Filter your collection"></div><div class="field"><label for="vc-filter">Collection</label><select id="vc-filter"><option value="">All collections</option></select></div></div>
      <div class="card" style="margin-top:1rem;text-align:center">
        <p class="field-hint">Practice</p>
        <p id="vc-practice-word" style="font-size:1.3rem;font-weight:700;min-height:2rem">Add words to begin</p>
        <p id="vc-practice-def" class="visually-hidden"></p>
        <div class="btn-row" style="justify-content:center"><button class="btn btn-secondary btn-small" type="button" id="vc-reveal" disabled>Reveal definition</button><button class="btn btn-secondary btn-small" type="button" id="vc-next" disabled>Next word</button></div>
      </div>
      <h3 style="margin-top:1.3rem">Your words</h3>
      <div id="vc-list"></div>`,
    formula: `<p>Practice presents one word at a time in random order. Revealing the definition is a deliberate action, so the recall attempt happens before the answer is shown.</p>`,
    example: `<p><strong>Example:</strong> add “mitochondria → organelle that releases energy from food” to a Biology collection. In practice mode, try to say the definition before selecting Reveal definition.</p>`,
    steps: ['Add a word, its definition and a collection name.', 'Filter or search your collection.', 'Switch to practice mode and reveal definitions only after trying to recall them.'],
    faq: [
      ['Can I use this for more than one language?', 'Yes. Give each language a different collection name and filter by it.'],
      ['Is there pronunciation audio?', 'No; the tool stores only the text you enter.'],
      ['Can I import a word list?', 'Individual tools do not import yet, but you can restore a full StudentHub backup from the Workspace page.']
    ]
  }
};
