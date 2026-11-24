/* StudentHub shared core: tool registry, tiny DOM helpers, analytics-free utilities. */
(function (global) {
  'use strict';

  var SITE = { name: 'StudentHub', url: 'https://studenthub-2gs.pages.dev' };

  var TOOLS = [
    { id: 'percentage-calculator', name: 'Percentage Calculator', category: 'Academic Calculators', desc: 'Find percentages, percentage change and the original value.', tags: 'percent increase decrease original value maths' },
    { id: 'cgpa-calculator', name: 'CGPA Calculator', category: 'Academic Calculators', desc: 'Calculate credit-weighted CGPA with your own grading scale.', tags: 'cumulative grade point average semester credits' },
    { id: 'gpa-calculator', name: 'GPA Calculator', category: 'Academic Calculators', desc: 'Weighted GPA calculator with editable grade points.', tags: 'grade point average subject credits scale' },
    { id: 'grade-calculator', name: 'Grade Calculator', category: 'Academic Calculators', desc: 'Turn marks into a letter grade using custom boundaries.', tags: 'letter grade boundaries percentage marks scale' },
    { id: 'marks-calculator', name: 'Marks Calculator', category: 'Academic Calculators', desc: 'Totals, percentages and averages across your subjects.', tags: 'subject marks total maximum average percentage' },
    { id: 'attendance-calculator', name: 'Attendance Calculator', category: 'Academic Calculators', desc: 'Check attendance percentage and classes needed for a target.', tags: 'classes attended missed target percentage college' },
    { id: 'exam-score-predictor', name: 'Exam Score Predictor', category: 'Academic Calculators', desc: 'See the score needed to reach a target, with honest feasibility checks.', tags: 'target score required marks remaining exams estimate' },
    { id: 'study-timetable-maker', name: 'Study Timetable Maker', category: 'Study Planning', desc: 'Build an editable weekly study schedule with conflict detection.', tags: 'schedule planner weekly hours subjects conflicts print' },
    { id: 'pomodoro-timer', name: 'Pomodoro Timer', category: 'Study Planning', desc: 'Focus sessions with custom work and break lengths.', tags: 'focus timer work break sessions sound' },
    { id: 'exam-countdown', name: 'Exam Countdown', category: 'Study Planning', desc: 'Track multiple exams with a live, time-zone-safe countdown.', tags: 'exam date countdown deadline timer' },
    { id: 'study-tracker', name: 'Daily Study Tracker', category: 'Study Planning', desc: 'Log study sessions and see daily and weekly progress.', tags: 'study log hours minutes subject weekly chart' },
    { id: 'assignment-planner', name: 'Assignment Planner', category: 'Study Planning', desc: 'Organise tasks by deadline and priority, and edit as you go.', tags: 'homework todo deadline priority tasks upcoming' },
    { id: 'flashcard-maker', name: 'Flashcard Maker', category: 'Learning Tools', desc: 'Create decks, flip cards, shuffle and track difficult cards.', tags: 'flashcards deck flip shuffle spaced revision' },
    { id: 'quiz-maker', name: 'Quiz Maker', category: 'Learning Tools', desc: 'Build four-option quizzes, score them and review answers.', tags: 'multiple choice questions mcq explanations score' },
    { id: 'revision-notes', name: 'Revision Notes', category: 'Learning Tools', desc: 'Write, search and export notes organised by subject.', tags: 'notes editor autosave subject search export' },
    { id: 'question-picker', name: 'Random Question Picker', category: 'Learning Tools', desc: 'Pick a question at random without immediate repeats.', tags: 'random question selector practice classroom' },
    { id: 'vocabulary-trainer', name: 'Vocabulary Trainer', category: 'Learning Tools', desc: 'Build word collections and quiz yourself on definitions.', tags: 'vocabulary words definitions practice language' },
    { id: 'word-counter', name: 'Word Counter', category: 'Writing Tools', desc: 'Words, characters, sentences, paragraphs and reading time.', tags: 'word count essay character sentence paragraph' },
    { id: 'character-counter', name: 'Character Counter', category: 'Writing Tools', desc: 'Live character count with spaces included or excluded.', tags: 'character count letters spaces copy clear' },
    { id: 'reading-time-calculator', name: 'Reading Time Calculator', category: 'Writing Tools', desc: 'Estimate reading time from word count and your reading speed.', tags: 'reading speed wpm minutes words estimate' },
    { id: 'text-case-converter', name: 'Text Case Converter', category: 'Writing Tools', desc: 'Uppercase, lowercase, title case and sentence case.', tags: 'capitalize uppercase lowercase title sentence case' },
    { id: 'citation-formatter', name: 'Citation Formatter', category: 'Writing Tools', desc: 'Format basic APA, MLA and Chicago references from your details.', tags: 'apa mla chicago bibliography reference style' },
    { id: 'age-calculator', name: 'Age Calculator', category: 'Student Utilities', desc: 'Exact age in years, months and days from two dates.', tags: 'birthdate age years months days leap year' },
    { id: 'date-calculator', name: 'Date Difference Calculator', category: 'Student Utilities', desc: 'Count days between dates and shift a date by a number of days.', tags: 'date difference days between add subtract date' },
    { id: 'unit-converter', name: 'Unit Converter', category: 'Student Utilities', desc: 'Convert length, mass, temperature and volume units.', tags: 'meters feet kilograms pounds celsius fahrenheit liters gallons' }
  ];

  var ICONS = {
    calculator: 'M4 19V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z M8 7h8 M8 12h2 M14 12h2 M8 17h2 M14 17h2',
    chart: 'M4 20V10 M10 20V4 M16 20v-7 M22 20H2',
    clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M12 6v6l4 2',
    book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z',
    pencil: 'M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z',
    text: 'M4 6h16 M4 12h16 M4 18h10',
    calendar: 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z M16 2v4 M8 2v4 M3 10h18',
    folder: 'M3 7a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z',
    star: 'm12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.3-6.2 3.3L7 14.2 2 9.3l6.9-1Z',
    search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z M21 21l-4.3-4.3',
    check: 'm5 12 5 5L20 7',
    arrow: 'M5 12h14 M13 6l6 6-6 6',
    menu: 'M4 6h16 M4 12h16 M4 18h16',
    sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z M12 1v2 M12 21v2 M4.2 4.2l1.4 1.4 M18.4 18.4l1.4 1.4 M1 12h2 M21 12h2 M4.2 19.8l1.4-1.4 M18.4 5.6l1.4-1.4',
    moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z',
    home: 'm3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z M9 22v-7h6v7',
    download: 'M12 3v12 M7 10l5 5 5-5 M4 21h16',
    upload: 'M12 21V9 M7 14l5-5 5 5 M4 3h16',
    trash: 'M3 6h18 M8 6V4h8v2 M6 6l1 15h10l1-15',
    print: 'M6 9V3h12v6 M6 18H4a2 2 0 0 1-2-2v-4a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v4a2 2 0 0 1-2 2h-2 M6 14h12v7H6Z',
    play: 'm7 4 13 8-13 8Z',
    pause: 'M8 5v14 M16 5v14',
    reset: 'M3 12a9 9 0 1 0 3-6.7 M3 4v5h5',
    plus: 'M12 5v14 M5 12h14',
    checkcircle: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M8 12l3 3 5-6',
    info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M12 11v6 M12 7h.01',
    shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z'
  };

  var SVG_NS = 'http://www.w3.org/2000/svg';
  function icon(name, size) {
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', String(size || 20));
    svg.setAttribute('height', String(size || 20));
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.8');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('sh-icon');
    var paths = (ICONS[name] || ICONS.calculator).split(' M').map(function (p, i) { return i === 0 ? p : 'M' + p; });
    paths.forEach(function (d) {
      var path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', d);
      svg.appendChild(path);
    });
    return svg;
  }
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (key) {
      if (key === 'class') node.className = attrs[key];
      else if (key === 'text') node.textContent = attrs[key];
      else if (attrs[key] !== null && attrs[key] !== undefined) node.setAttribute(key, attrs[key]);
    });
    (children || []).forEach(function (child) {
      if (child) node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    });
    return node;
  }
  /* Each page carries data-base (empty at the root, ../../ in tool folders).
     Building URLs from it keeps links working on a static host, under a
     subpath and when the HTML files are opened directly from disk. */
  function base() { return document.documentElement.getAttribute('data-base') || ''; }
  function rootUrl(p) { return base() + String(p || '').replace(/^\//, ''); }
  function homeUrl(hash) { return rootUrl('index.html') + (hash || ''); }
  function toolUrl(id) { return rootUrl('tools/' + id + '/index.html'); }
  function findTool(id) { return TOOLS.find(function (t) { return t.id === id; }) || null; }
  function searchTools(query) {
    var q = String(query || '').trim().toLowerCase();
    if (!q) return TOOLS.slice();
    var words = q.split(/\s+/);
    return TOOLS.filter(function (t) {
      var hay = (t.name + ' ' + t.category + ' ' + t.desc + ' ' + t.tags + ' ' + t.id.replace(/-/g, ' ')).toLowerCase();
      return words.every(function (w) { return hay.indexOf(w) !== -1; });
    });
  }
  function related(id, count) {
    var current = findTool(id);
    var same = TOOLS.filter(function (t) { return t.id !== id && (!current || t.category === current.category); });
    var others = TOOLS.filter(function (t) { return t.id !== id && (current && t.category !== current.category); });
    return same.concat(others).slice(0, count || 4);
  }
  function categories() {
    var order = [];
    var map = {};
    TOOLS.forEach(function (t) {
      if (!map[t.category]) { map[t.category] = []; order.push(t.category); }
      map[t.category].push(t);
    });
    return order.map(function (name) { return { name: name, tools: map[name], icon: { 'Academic Calculators': 'calculator', 'Study Planning': 'calendar', 'Learning Tools': 'book', 'Writing Tools': 'pencil', 'Student Utilities': 'chart' }[name] || 'star' }; });
  }

  global.StudentHub = global.StudentHub || {};
  Object.assign(global.StudentHub, {
    SITE: SITE, TOOLS: TOOLS, ICONS: ICONS, icon: icon, el: el,
    base: base, rootUrl: rootUrl, homeUrl: homeUrl,
    toolUrl: toolUrl, findTool: findTool, searchTools: searchTools,
    related: related, categories: categories
  });
})(window);
