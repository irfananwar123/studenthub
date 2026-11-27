'use strict';
const { f } = require('./helpers');

module.exports = {
  'percentage-calculator': {
    h1: 'Percentage Calculator',
    seoTitle: 'Percentage Calculator — Increase, Decrease & Original Value',
    desc: 'Free percentage calculator with worked examples: find a percentage of a number, percentage increase or decrease, and the original value before a change.',
    intro: 'Use this calculator for the three percentage questions that come up most in school and university work: finding a share of a number, measuring a change, and working backwards to an original value. Every calculation runs locally in your browser.',
    icon: 'calculator',
    form: `
      <div class="tab-list" role="tablist" aria-label="Percentage calculator modes">
        <button class="tab-button" type="button" role="tab" aria-selected="true" aria-controls="mode-basic" id="tab-basic" data-tab="basic">Percentage of a number</button>
        <button class="tab-button" type="button" role="tab" aria-selected="false" aria-controls="mode-change" id="tab-change" data-tab="change">Increase / decrease</button>
        <button class="tab-button" type="button" role="tab" aria-selected="false" aria-controls="mode-original" id="tab-original" data-tab="original">Find original value</button>
      </div>
      <div id="mode-basic" role="tabpanel" aria-labelledby="tab-basic" data-panel="basic">
        <div class="form-grid">
          ${f('p-percent', 'Percentage (%)', 'number', 'min="0" step="any" placeholder="e.g. 15"')}
          ${f('p-whole', 'Of number', 'number', 'step="any" placeholder="e.g. 200"')}
        </div>
      </div>
      <div id="mode-change" role="tabpanel" aria-labelledby="tab-change" data-panel="change" hidden>
        <div class="form-grid">
          ${f('c-original', 'Original value', 'number', 'step="any" placeholder="e.g. 50"')}
          ${f('c-new', 'New value', 'number', 'step="any" placeholder="e.g. 60"')}
        </div>
      </div>
      <div id="mode-original" role="tabpanel" aria-labelledby="tab-original" data-panel="original" hidden>
        <div class="form-grid">
          ${f('o-part', 'Value after change', 'number', 'step="any" placeholder="e.g. 120"')}
          ${f('o-percent', 'Change percentage (%)', 'number', 'step="any" placeholder="e.g. 20"')}
        </div>
        <p class="field-hint">Enter +20 for a 20% increase or −20 for a 20% decrease.</p>
      </div>
      <div class="form-actions"><button class="btn btn-primary" type="submit">Calculate</button><button class="btn btn-secondary" type="reset">Clear</button></div>`,
    formula: `<p>Percentage of a number: <code>result = number × percentage ÷ 100</code>.</p>
      <p>Percentage change: <code>change = (new − original) ÷ original × 100</code>.</p>
      <p>Finding an original value after a percentage change: <code>original = final ÷ (1 + change ÷ 100)</code>. A negative change uses the same formula, for example <code>1 − 0.20 = 0.80</code>.</p>`,
    example: `<p><strong>Example 1:</strong> 15% of 200 = 200 × 0.15 = <strong>30</strong>.</p>
      <p><strong>Example 2:</strong> a price rises from 50 to 60. Change = (60 − 50) ÷ 50 × 100 = <strong>20% increase</strong>.</p>
      <p><strong>Example 3:</strong> an item costs 120 after a 20% increase. Original = 120 ÷ 1.2 = <strong>100</strong>.</p>`,
    steps: ['Choose the tab for the question you are answering.', 'Enter the numbers exactly as labelled and select Calculate.', 'Read the result and the short explanation below it.'],
    faq: [
      ['Can the calculator divide by zero?', 'No. A percentage of a number requires a non-zero base number, and percentage change requires a non-zero original value. The tool shows a clear message instead of returning infinity.'],
      ['How do I enter a decrease when finding the original value?', 'Type a minus sign before the percentage, for example −20. The tool divides by 0.80 to reverse a 20% decrease.'],
      ['Does this work with decimals?', 'Yes. Enter any decimal value such as 12.5 or 0.075; results are rounded to two decimal places for display.']
    ]
  },
  'cgpa-calculator': {
    h1: 'CGPA Calculator',
    seoTitle: 'CGPA Calculator — Credit-Weighted CGPA with Custom Grades',
    desc: 'Calculate credit-weighted CGPA from your subjects and grades. Edit the grade-point scale to match your institution and see each subject contribution.',
    intro: 'CGPA is usually a credit-weighted average of grade points. Add each subject with its credit hours and grade, then adjust the grading scale if your university uses different point values. Rules differ between institutions, so always confirm your own grading policy.',
    icon: 'chart',
    form: `
      <div class="field"><label for="cg-scale">Grade-point scale</label><select id="cg-scale"><option value="default">Default (A+ 4.0 … F 0.0)</option><option value="ten">10-point scale (A+ 10 … F 0)</option><option value="custom">Custom — edit below</option></select></div>
      <div class="field"><label for="cg-custom">Custom scale (one per line: GRADE,POINTS)</label><textarea id="cg-custom" rows="4" spellcheck="false">A+,4.0&#10;A,4.0&#10;A−,3.7&#10;B+,3.3&#10;B,3.0&#10;B−,2.7&#10;C+,2.3&#10;C,2.0&#10;C−,1.7&#10;D,1.0&#10;F,0</textarea></div>
      <table class="data-table"><thead><tr><th>Subject</th><th>Credits</th><th>Grade</th><th></th></tr></thead><tbody id="cg-rows"></tbody></table>
      <div class="btn-row" style="margin-top:.8rem"><button class="btn btn-secondary btn-small" type="button" id="cg-add">${require('./helpers').icon('plus', 16)} Add subject</button></div>
      <div class="form-actions"><button class="btn btn-primary" type="submit">Calculate CGPA</button><button class="btn btn-secondary" type="button" id="cg-demo">Load example</button></div>`,
    formula: `<p><code>CGPA = Σ(grade point × credits) ÷ Σ(credits)</code>. The sum is taken over every graded subject in the semesters you include.</p>
      <p>If your institution calculates a cumulative average across semesters, add all subjects from those semesters as rows. If it averages semester GPAs instead, follow that published rule rather than this general formula.</p>`,
    example: `<p><strong>Example:</strong> Mathematics 4 credits × 3.7, Physics 3 × 3.0, English 2 × 4.0. Weighted points = 14.8 + 9 + 8 = 31.8; total credits = 9; CGPA = 31.8 ÷ 9 = <strong>3.53</strong>.</p>`,
    steps: ['Select the grade-point scale used by your institution.', 'Add one row per subject, with credit hours and the grade you received.', 'Select Calculate CGPA to see the weighted result and each subject contribution.'],
    faq: [
      ['Is this the official CGPA from my university?', 'No. This is a general estimate based on the numbers and scale you enter. Only your institution can calculate an official result.'],
      ['Can I use letter grades and numeric points?', 'Yes. The custom scale box accepts one GRADE,POINTS pair per line, so you can match most published grading tables.'],
      ['What if I have pass/fail subjects?', 'Do not include them unless your institution assigns grade points to them; otherwise the weighted average would be misleading.']
    ]
  },
  'gpa-calculator': {
    h1: 'GPA Calculator',
    seoTitle: 'GPA Calculator — Editable Grade Points and Credit Weighting',
    desc: 'Calculate weighted GPA with custom grade points, subject credits and an editable grading configuration. See the maths behind every result.',
    intro: 'This GPA calculator lets you define grade points yourself and weight each subject by its credits. Use it to explore how different grades would affect your semester or overall average before results are published.',
    icon: 'chart',
    form: `
      <div class="field"><label for="gpa-points">Grade points configuration (one per line: GRADE,POINTS)</label><textarea id="gpa-points" rows="4" spellcheck="false">A+,4.0&#10;A,4.0&#10;A−,3.7&#10;B+,3.3&#10;B,3.0&#10;B−,2.7&#10;C+,2.3&#10;C,2.0&#10;D,1.0&#10;F,0</textarea></div>
      <table class="data-table"><thead><tr><th>Subject</th><th>Credits</th><th>Grade</th><th></th></tr></thead><tbody id="gpa-rows"></tbody></table>
      <div class="btn-row" style="margin-top:.8rem"><button class="btn btn-secondary btn-small" type="button" id="gpa-add">${require('./helpers').icon('plus', 16)} Add subject</button></div>
      <div class="form-actions"><button class="btn btn-primary" type="submit">Calculate GPA</button><button class="btn btn-secondary" type="button" id="gpa-demo">Load example</button></div>`,
    formula: `<p><code>GPA = Σ(grade points × subject credits) ÷ Σ(credits)</code>. Subjects with more credits influence the result more heavily.</p>`,
    example: `<p><strong>Example:</strong> A (4.0) in a 3-credit course and B (3.0) in a 4-credit course gives (12 + 12) ÷ 7 = <strong>3.43</strong>.</p>`,
    steps: ['Edit the grade-point lines if your school uses a different scale.', 'Fill in subjects, credits and grades.', 'Select Calculate GPA for the weighted average and a full breakdown.'],
    faq: [
      ['What is the difference between GPA and CGPA?', 'GPA commonly describes one term; CGPA usually covers all completed terms. This tool calculates whichever set of subjects you enter.'],
      ['Can I enter numeric points instead of a letter grade?', 'Add a line such as 95,4.0 in the configuration box and type 95 as the grade for a subject.'],
      ['Are plus and minus grades supported?', 'Yes, any label you define in the configuration box is accepted, including A− and B+.']
    ]
  },
  'grade-calculator': {
    h1: 'Grade Calculator',
    seoTitle: 'Grade Calculator — Marks to Letter Grade with Custom Boundaries',
    desc: 'Convert marks and total marks into a percentage and letter grade using editable grade boundaries, with clear worked examples.',
    intro: 'Enter the marks you obtained and the maximum available to get a percentage and the matching grade. The default boundaries can be replaced with the exact cut-offs used by your school or course.',
    icon: 'calculator',
    form: `
      <div class="form-grid">
        ${f('gr-marks', 'Marks obtained', 'number', 'min="0" step="any" placeholder="e.g. 78"')}
        ${f('gr-total', 'Total marks', 'number', 'min="0" step="any" placeholder="e.g. 100"')}
      </div>
      <div class="field" style="margin-top:1rem"><label for="gr-scale">Grade boundaries (one per line: MIN%,LABEL)</label><textarea id="gr-scale" rows="6" spellcheck="false">90,A+&#10;80,A&#10;70,B+&#10;60,B&#10;50,C&#10;40,D&#10;0,F</textarea></div>
      <p class="field-hint">List the minimum percentage for each grade, highest first.</p>
      <div class="form-actions"><button class="btn btn-primary" type="submit">Calculate grade</button><button class="btn btn-secondary" type="reset">Clear</button></div>`,
    formula: `<p><code>percentage = marks obtained ÷ total marks × 100</code>. Your grade is the highest boundary that your percentage meets or exceeds.</p>`,
    example: `<p><strong>Example:</strong> 78 out of 100 = 78%. With the default boundaries 78% falls between 70 and 80, so the grade is <strong>B+</strong>.</p>`,
    steps: ['Check that the grade boundaries match your course handbook.', 'Enter marks obtained and total marks.', 'Select Calculate grade to see the percentage, grade and distance to the next boundary.'],
    faq: [
      ['What happens if marks exceed the total?', 'The tool accepts the calculation but warns you, because the percentage will be above 100%.'],
      ['Are grade boundaries universal?', 'No. They vary by country, institution and course. Edit the boundary box to match yours.'],
      ['Can I use non-numeric grades?', 'Yes. Any label such as Pass, Merit or Distinction can be entered after the minimum percentage.']
    ]
  },
  'marks-calculator': {
    h1: 'Marks Calculator',
    seoTitle: 'Marks Calculator — Subject Totals, Percentage and Average',
    desc: 'Add subject-wise marks and maximum marks to calculate totals, percentage per subject, overall percentage and average marks.',
    intro: 'Track marks across as many subjects as you need. The calculator totals your obtained and maximum marks, shows a percentage for each subject, and reports both overall percentage and the simple average of subject percentages.',
    icon: 'chart',
    form: `
      <table class="data-table"><thead><tr><th>Subject</th><th>Marks obtained</th><th>Maximum</th><th></th></tr></thead><tbody id="mk-rows"></tbody></table>
      <div class="btn-row" style="margin-top:.8rem"><button class="btn btn-secondary btn-small" type="button" id="mk-add">${require('./helpers').icon('plus', 16)} Add subject</button></div>
      <div class="form-actions"><button class="btn btn-primary" type="submit">Calculate marks</button><button class="btn btn-secondary" type="button" id="mk-demo">Load example</button></div>`,
    formula: `<p>Overall percentage: <code>Σ obtained ÷ Σ maximum × 100</code>.</p>
      <p>Subject percentage: <code>obtained ÷ maximum × 100</code>. The simple average adds each subject percentage and divides by the number of subjects; this can differ from the overall percentage when subjects have different maximum marks.</p>`,
    example: `<p><strong>Example:</strong> Math 85/100, Science 72/80. Totals = 157/180 = <strong>87.22%</strong> overall. Subject percentages are 85% and 90%, so the simple average is <strong>87.5%</strong>.</p>`,
    steps: ['Add each subject with marks obtained and maximum marks.', 'Select Calculate marks.', 'Review the table of subject percentages and the summary.'],
    faq: [
      ['Why do overall percentage and average differ?', 'Overall percentage weights subjects by their maximum marks. The average treats every subject equally.'],
      ['Can I use decimals?', 'Yes, decimal marks such as 78.5 are supported.'],
      ['Are my marks saved online?', 'No. The calculation stays on your device; nothing is uploaded.']
    ]
  },
  'attendance-calculator': {
    h1: 'Attendance Calculator',
    seoTitle: 'Attendance Calculator — Classes Needed for a Target Percentage',
    desc: 'Calculate attendance percentage, classes still needed to reach a target, and how many classes you can safely miss. Handles empty and zero values.',
    intro: 'Find out where you stand and what it would take to reach your attendance target. The tool also explains the limit on missed classes, using the assumption that every remaining class is attended.',
    icon: 'calendar',
    form: `
      <div class="form-grid">
        ${f('at-attended', 'Classes attended', 'number', 'min="0" step="1" placeholder="e.g. 42"')}
        ${f('at-total', 'Total classes so far', 'number', 'min="0" step="1" placeholder="e.g. 50"')}
        ${f('at-target', 'Target attendance (%)', 'number', 'min="0" max="100" step="any" value="75"')}
      </div>
      <div class="form-actions"><button class="btn btn-primary" type="submit">Calculate attendance</button><button class="btn btn-secondary" type="reset">Clear</button></div>`,
    formula: `<p>Current attendance: <code>attended ÷ total classes × 100</code>.</p>
      <p>If attendance is below target and no more classes are added to the timetable, classes still needed: <code>ceil((target × total − 100 × attended) ÷ (100 − target))</code>. At a 100% target, every class must be attended.</p>
      <p>Maximum further classes you can miss while keeping the target, when the course has a fixed total: <code>floor(total × (100 − target) ÷ 100)</code>, capped by the classes already missed. If you are currently below target, this is zero.</p>`,
    example: `<p><strong>Example:</strong> 42 of 50 classes attended = 84%. Target 75%. If the course ends at 50 classes, up to <code>floor(50 × 0.25) = 12</code> classes could be missed in total, so 8 of the 50 may still be missed.</p>
      <p><strong>Below target:</strong> 30 of 50 = 60%. To reach 75% with extra classes, you need <code>ceil((75×50 − 100×30) ÷ 25) = 30</code> more attended classes.</p>`,
    steps: ['Enter attended classes and total classes held so far.', 'Set your target attendance percentage.', 'Select Calculate attendance to see your status and options.'],
    faq: [
      ['What if I have attended more classes than exist?', 'The tool flags this as invalid rather than producing a misleading percentage.'],
      ['What does zero total classes do?', 'No percentage can be calculated yet, so the result asks you to enter at least one class.'],
      ['Is the classes-needed figure a guarantee?', 'No. It assumes you attend every additional class and that your institution counts classes the same way.']
    ]
  },
  'exam-score-predictor': {
    h1: 'Exam Score Predictor',
    seoTitle: 'Exam Score Predictor — Required Marks to Reach a Target',
    desc: 'Estimate the marks you need in remaining assessments to reach a target percentage, with honest feasibility warnings and no guaranteed results.',
    intro: 'Use this tool to work out the score required in your remaining assessments to reach a target. It performs arithmetic on the numbers you provide; it is not a guarantee of any result and cannot account for grading policies such as capped exams or dropped scores.',
    icon: 'info',
    form: `
      <div class="form-grid">
        ${f('ep-total', 'Total course marks', 'number', 'min="0" step="any" placeholder="e.g. 200"')}
        ${f('ep-obtained', 'Marks obtained so far', 'number', 'min="0" step="any" placeholder="e.g. 90"')}
        ${f('ep-remaining', 'Marks still available', 'number', 'min="0" step="any" placeholder="e.g. 100"')}
        ${f('ep-target', 'Target percentage (%)', 'number', 'min="0" max="100" step="any" value="80"')}
      </div>
      <div class="form-actions"><button class="btn btn-primary" type="submit">Check required score</button><button class="btn btn-secondary" type="reset">Clear</button></div>`,
    formula: `<p>Target marks: <code>total marks × target ÷ 100</code>.</p>
      <p>Required marks: <code>target marks − marks already obtained</code>. Required percentage of the remaining work: <code>required marks ÷ marks still available × 100</code>.</p>`,
    example: `<p><strong>Example:</strong> total 200, obtained 90, remaining 100, target 80%. Target marks = 160; required = 70 marks from the remaining 100, so you need 70% of the remaining work. If required marks exceed the remaining marks, the target is not achievable from these numbers alone.</p>`,
    steps: ['Enter the total marks available in the course.', 'Add marks obtained so far and marks still up for grabs.', 'Set a target percentage and check the required score and feasibility note.'],
    faq: [
      ['Is this a prediction of my final grade?', 'No. It only calculates a required score from the values you enter. Actual results depend on future performance and institutional rules.'],
      ['What if I have already passed the target?', 'The tool says the target is already secured by the marks entered and shows how much buffer you have.'],
      ['Can I include internal assessment marks?', 'Yes, include any marks that count toward the same total. Do not mix marks from differently weighted components.']
    ]
  },
  'scientific-calculator': {
    h1: 'Scientific Calculator',
    seoTitle: 'Scientific Calculator — Trig, Logs, Powers, Roots & Factorials',
    desc: 'Free online scientific calculator with sin, cos, tan, logs, powers, roots, factorials, pi, memory and degree or radian modes. No sign-up.',
    intro: 'Type a normal maths expression and get an exact, step-free answer. This scientific calculator handles brackets, powers, roots, trigonometry, logarithms, factorials and constants, with a degree or radian switch and a short local history. It runs entirely in your browser.',
    icon: 'calculator',
    form: `
      <div class="form-grid">
        <div class="field" style="grid-column:1/-1"><label for="sc-expression">Expression</label><input id="sc-expression" name="sc-expression" type="text" spellcheck="false" autocomplete="off" placeholder="e.g. sin(30)+2^3"></div>
        <div class="field"><label for="sc-angle">Angle mode</label><select id="sc-angle"><option value="deg">Degrees (sin 30 = 0.5)</option><option value="rad">Radians (sin pi/6 = 0.5)</option></select></div>
      </div>
      <div class="field"><span class="field-hint">Quick insert</span><div class="chip-list">${['sin(', 'cos(', 'tan(', 'sqrt(', 'ln(', 'log(', '^', '!', 'pi', '(', ')'].map(x => `<button class="chip" type="button" data-insert="${x}">${x}</button>`).join('')}</div></div>
      <div class="field"><span class="field-hint">Memory</span><div class="chip-list"><output id="sc-memory-readout" class="badge">0</output><button class="chip" type="button" id="sc-mplus">M+</button><button class="chip" type="button" id="sc-mminus">M−</button><button class="chip" type="button" id="sc-mrecall">MR</button><button class="chip" type="button" id="sc-mclear">MC</button></div></div>
      <div class="form-actions"><button class="btn btn-primary" type="submit">Calculate</button><button class="btn btn-secondary" type="reset">Clear</button></div>
      <p class="field-hint" id="sc-history" aria-live="polite">Recent calculations stay on this device.</p>`,
    formula: `<p>Expressions follow usual precedence: brackets, then functions and powers, then multiplication and division, then addition and subtraction. Implicit multiplication is allowed, so <code>2pi</code> and <code>2(3+4)</code> both work.</p>
      <p>Supported functions: <code>sin cos tan asin acos atan log ln sqrt abs exp floor ceil round sign pow min max</code>. Use <code>log(x)</code> for base 10 or <code>log(x, base)</code> for another base. The symbol <code>%</code> means remainder, not percentage.</p>
      <p>In degree mode, angles are converted before sine, cosine and tangent, and inverse functions return degrees. Constants: <code>pi</code>, <code>π</code>, <code>e</code> and <code>tau</code>.</p>`,
    example: `<p><strong>Example 1:</strong> <code>sin(30)+2^3</code> in degree mode = 0.5 + 8 = <strong>8.5</strong>.</p>
      <p><strong>Example 2:</strong> <code>(1/2+1/4)*8</code> = <strong>6</strong>.</p>
      <p><strong>Example 3:</strong> <code>5!</code> = 5 × 4 × 3 × 2 × 1 = <strong>120</strong>.</p>`,
    steps: ['Type an expression such as sin(30)+2^3 or choose a Quick insert button.', 'Choose Degrees or Radians to match your question.', 'Select Calculate, then use M+ and MR if you want to reuse the answer.'],
    faq: [
      ['Is this safe? Does it run JavaScript?', 'Yes, it is safe. The calculator uses its own small expression parser and never uses eval or Function, so your input is treated as maths, not code.'],
      ['What does the % key do here?', 'It returns the remainder after division, for example 17%5 = 2. For percentages, use the separate Percentage Calculator.'],
      ['Can I type pi or the π symbol?', 'Yes. Both pi and π mean 3.14159…, e means Euler’s number and tau means 2π.'],
      ['Why do I need to choose degrees or radians?', 'Sin, cos, tan and their inverse functions give different answers in each mode. The tool shows which mode was used with every result.']
    ]
  },
  'fraction-calculator': {
    h1: 'Fraction Calculator',
    seoTitle: 'Fraction Calculator — Add, Subtract, Multiply & Divide Fractions',
    desc: 'Free fraction calculator that adds, subtracts, multiplies and divides fractions. See simplified answers, mixed numbers and decimal values instantly.',
    intro: 'Enter two fractions and choose an operation. The calculator simplifies the result, shows it as a proper or mixed fraction, and gives the decimal value so you can check your school or university working.',
    icon: 'calculator',
    form: `
      <div class="form-grid">
        ${f('fr-a', 'First numerator', 'number', 'step="any" placeholder="e.g. 3"')}
        ${f('fr-b', 'First denominator', 'number', 'step="any" placeholder="e.g. 4"')}
        ${f('fr-c', 'Second numerator', 'number', 'step="any" placeholder="e.g. 1"')}
        ${f('fr-d', 'Second denominator', 'number', 'step="any" placeholder="e.g. 2"')}
      </div>
      <div class="field"><label for="fr-op">Operation</label><select id="fr-op"><option value="add">Add (+)</option><option value="subtract">Subtract (−)</option><option value="multiply">Multiply (×)</option><option value="divide">Divide (÷)</option></select></div>
      <div class="form-actions"><button class="btn btn-primary" type="submit">Calculate</button><button class="btn btn-secondary" type="reset">Clear</button></div>`,
    formula: `<p>Addition and subtraction need a common denominator: <code>a/b ± c/d = (ad ± bc) / bd</code>. Multiplication is <code>ac / bd</code>. Division is <code>ad / bc</code>.</p>
      <p>The result is reduced by dividing the numerator and denominator by their greatest common factor. If the numerator is larger, a mixed number such as <code>1 1/2</code> is shown alongside the improper fraction.</p>`,
    example: `<p><strong>Example 1:</strong> 1/2 + 1/3 = 3/6 + 2/6 = <strong>5/6</strong>.</p>
      <p><strong>Example 2:</strong> 3/4 ÷ 1/2 = 3/4 × 2/1 = 3/2 = <strong>1 1/2</strong>.</p>
      <p><strong>Example 3:</strong> 2/3 × 3/4 = 6/12 = <strong>1/2</strong>.</p>`,
    steps: ['Enter the numerator and denominator of each fraction.', 'Choose add, subtract, multiply or divide.', 'Select Calculate and compare the simplified fraction, mixed number and decimal.'],
    faq: [
      ['Can I enter decimals or negative numbers?', 'Yes. Decimals are converted to an exact ratio before simplifying, and negative signs are carried into the final answer.'],
      ['What happens if a denominator is zero?', 'The tool shows a clear error. Division by zero is undefined, including dividing by the fraction 0/1.'],
      ['Does it show mixed numbers?', 'Yes. Improper fractions are also written as a whole number plus a proper fraction, which is useful for homework answers.']
    ]
  },
  'ratio-calculator': {
    h1: 'Ratio Calculator',
    seoTitle: 'Ratio Calculator — Solve Proportions & Simplify Ratios',
    desc: 'Free ratio calculator to solve a:b = c:x, simplify a ratio, and split a total into equal ratio shares with clear worked steps.',
    intro: 'Use this ratio calculator for two common questions: solving a missing value in a proportion, and reducing a ratio before sharing a total. It works with whole numbers and decimals, and every calculation happens locally.',
    icon: 'chart',
    form: `
      <div class="tab-list" role="tablist" aria-label="Ratio calculator modes">
        <button class="tab-button" type="button" role="tab" aria-selected="true" aria-controls="mode-ratio-solve" id="tab-ratio-solve" data-tab="solve">Solve a proportion</button>
        <button class="tab-button" type="button" role="tab" aria-selected="false" aria-controls="mode-ratio-simplify" id="tab-ratio-simplify" data-tab="simplify">Simplify &amp; share</button>
      </div>
      <div id="mode-ratio-solve" role="tabpanel" aria-labelledby="tab-ratio-solve" data-panel="solve">
        <div class="form-grid">
          ${f('rt-a', 'First ratio a', 'number', 'step="any" placeholder="e.g. 2"')}
          ${f('rt-b', 'First ratio b', 'number', 'step="any" placeholder="e.g. 3"')}
          ${f('rt-c', 'Second ratio c', 'number', 'step="any" placeholder="e.g. 10"')}
        </div>
        <p class="field-hint">Solves a:b = c:x for x.</p>
      </div>
      <div id="mode-ratio-simplify" role="tabpanel" aria-labelledby="tab-ratio-simplify" data-panel="simplify" hidden>
        <div class="form-grid">
          ${f('rt-simplify-a', 'Ratio part a', 'number', 'step="any" placeholder="e.g. 4"')}
          ${f('rt-simplify-b', 'Ratio part b', 'number', 'step="any" placeholder="e.g. 6"')}
          ${f('rt-total', 'Total to share (optional)', 'number', 'step="any" placeholder="e.g. 50"')}
        </div>
        <p class="field-hint">Leave the total blank if you only want the simplified ratio.</p>
      </div>
      <div class="form-actions"><button class="btn btn-primary" type="submit">Calculate</button><button class="btn btn-secondary" type="reset">Clear</button></div>`,
    formula: `<p>To solve <code>a:b = c:x</code>, find the scale factor <code>c ÷ a</code>, then multiply it by <code>b</code>: <code>x = c × b ÷ a</code>.</p>
      <p>To simplify <code>a:b</code>, divide both parts by their greatest common factor. To share a total <code>T</code>, each share is <code>T × part ÷ total parts</code>.</p>`,
    example: `<p><strong>Example 1:</strong> 2:3 = 10:x. Scale factor = 5, so x = <strong>15</strong>.</p>
      <p><strong>Example 2:</strong> 4:6 simplifies to <strong>2:3</strong>. Sharing 50 gives 20 and 30 because the total has 5 parts.</p>`,
    steps: ['Choose Solve a proportion or Simplify & share.', 'Enter the ratio numbers in the order shown.', 'Select Calculate and read the missing value or the two shares.'],
    faq: [
      ['Can I simplify a ratio with decimals?', 'Yes. The tool scales decimal parts to whole numbers before finding the greatest common factor.'],
      ['What if the first ratio part is zero?', 'A proportion needs a non-zero first part to find a scale factor, so the calculator asks you to change it.'],
      ['Is the total required?', 'No. Leave the total blank to see only the simplified ratio and its number of parts.']
    ]
  },
  'standard-deviation-calculator': {
    h1: 'Standard Deviation Calculator',
    seoTitle: 'Standard Deviation Calculator — Variance, Mean and Range',
    desc: 'Free standard deviation calculator for a list of numbers. Compare population and sample variance, standard deviation, mean and range.',
    intro: 'Paste numbers from a spreadsheet, assignment or experiment and see both population and sample statistics. The calculator explains which value to use and shows the spread of the data without uploading anything.',
    icon: 'chart',
    form: `
      <div class="field"><label for="sd-values">Numbers</label><textarea id="sd-values" name="sd-values" rows="5" spellcheck="false" placeholder="e.g. 2, 4, 4, 4, 5, 5, 7, 9"></textarea></div>
      <p class="field-hint">Separate numbers with commas, spaces, semicolons or new lines.</p>
      <div class="form-actions"><button class="btn btn-primary" type="submit">Calculate</button><button class="btn btn-secondary" type="reset">Clear</button></div>`,
    formula: `<p>Mean = sum of values ÷ count. For each value, square its difference from the mean. Population variance divides the squared differences by <code>n</code>; sample variance divides by <code>n − 1</code>.</p>
      <p>Standard deviation is the square root of variance. Use population statistics when your list is the whole group; use sample statistics when it is a subset of a larger group.</p>`,
    example: `<p><strong>Example:</strong> for 2, 4, 4, 4, 5, 5, 7, 9 the mean is 5. The population variance is 4, so the population standard deviation is <strong>2</strong>. The sample standard deviation is about <strong>2.14</strong>.</p>`,
    steps: ['Enter or paste a list of numbers.', 'Select Calculate.', 'Read both population and sample results; the note explains which one usually applies.'],
    faq: [
      ['Should I use population or sample standard deviation?', 'Use population when you have every member of the group. Use sample when your numbers are a sample used to estimate a larger group. Both are shown here.'],
      ['Can I use one number?', 'The mean and population deviation are defined, but sample variance needs at least two values, so the sample result is left blank.'],
      ['Does this upload my data?', 'No. The calculation runs in your browser and the numbers are never sent to a server.']
    ]
  },
  'mean-median-mode-calculator': {
    h1: 'Mean Median Mode Calculator',
    seoTitle: 'Mean Median Mode Calculator — Average, Range and Spread',
    desc: 'Free mean, median and mode calculator. Find the average, middle value, repeated values, minimum, maximum and range from any number list.',
    intro: 'Enter a list of numbers to calculate the three averages students use most: mean, median and mode. The tool also reports the range, smallest value and largest value so you can describe a data set in one place.',
    icon: 'chart',
    form: `
      <div class="field"><label for="mm-values">Numbers</label><textarea id="mm-values" name="mm-values" rows="5" spellcheck="false" placeholder="e.g. 1, 2, 2, 3, 4, 7, 9"></textarea></div>
      <p class="field-hint">Separate numbers with commas, spaces, semicolons or new lines.</p>
      <div class="form-actions"><button class="btn btn-primary" type="submit">Calculate</button><button class="btn btn-secondary" type="reset">Clear</button></div>`,
    formula: `<p>Mean is the sum of all values divided by the count. Median is the middle value after sorting; with an even count it is the average of the two middle values. Mode is the value or values that appear most often.</p>
      <p>Range is the largest value minus the smallest value. If every value appears once, there is no mode.</p>`,
    example: `<p><strong>Example:</strong> for 1, 2, 2, 3, 4, 7, 9 the mean is 4, the median is 3, the mode is 2 and the range is 8.</p>`,
    steps: ['Enter or paste your numbers in any order.', 'Select Calculate.', 'Use the sorted summary to check the median and repeated values.'],
    faq: [
      ['What if two values are tied for most common?', 'Both are reported as modes. If every number appears once, the tool says there is no mode.'],
      ['Can I include decimals and negative numbers?', 'Yes. Decimals and negative values are handled; the median for an even count is rounded to four decimal places for display.'],
      ['Is the mean the same as the average?', 'Yes. In this calculator, mean and average mean the same sum-divided-by-count value.']
    ]
  },
  'gpa-percentage-converter': {
    h1: 'GPA Percentage Converter',
    seoTitle: 'GPA to Percentage Converter — 4.0 GPA and 10-Point CGPA',
    desc: 'Convert GPA to percentage or percentage to GPA on a 4.0 scale, and switch between 10-point CGPA and percentage, with clear caveats.',
    intro: 'Choose the scale your institution uses and enter one value. The converter shows the equivalent percentage or grade point instantly, plus a reminder that official rules can differ from a simple linear conversion.',
    icon: 'calculator',
    form: `
      <div class="tab-list" role="tablist" aria-label="GPA conversion modes">
        <button class="tab-button" type="button" role="tab" aria-selected="true" aria-controls="mode-gpa-percent" id="tab-gpa-percent" data-tab="gpa-percent">GPA to %</button>
        <button class="tab-button" type="button" role="tab" aria-selected="false" aria-controls="mode-percent-gpa" id="tab-percent-gpa" data-tab="percent-gpa">% to GPA</button>
        <button class="tab-button" type="button" role="tab" aria-selected="false" aria-controls="mode-cgpa-percent" id="tab-cgpa-percent" data-tab="cgpa-percent">CGPA to %</button>
        <button class="tab-button" type="button" role="tab" aria-selected="false" aria-controls="mode-percent-cgpa" id="tab-percent-cgpa" data-tab="percent-cgpa">% to CGPA</button>
      </div>
      <div id="mode-gpa-percent" role="tabpanel" aria-labelledby="tab-gpa-percent" data-panel="gpa-percent">${f('gp-gpa', 'GPA on a 4.0 scale', 'number', 'min="0" max="4" step="any" placeholder="e.g. 3.5"')}</div>
      <div id="mode-percent-gpa" role="tabpanel" aria-labelledby="tab-percent-gpa" data-panel="percent-gpa" hidden>${f('gp-percent-gpa', 'Percentage mark', 'number', 'min="0" max="100" step="any" placeholder="e.g. 89"')}</div>
      <div id="mode-cgpa-percent" role="tabpanel" aria-labelledby="tab-cgpa-percent" data-panel="cgpa-percent" hidden>${f('gp-cgpa', 'CGPA on a 10-point scale', 'number', 'min="0" max="10" step="any" placeholder="e.g. 9.2"')}</div>
      <div id="mode-percent-cgpa" role="tabpanel" aria-labelledby="tab-percent-cgpa" data-panel="percent-cgpa" hidden>${f('gp-percent-cgpa', 'Percentage mark', 'number', 'min="0" max="100" step="any" placeholder="e.g. 95"')}</div>
      <div class="form-actions"><button class="btn btn-primary" type="submit">Convert</button><button class="btn btn-secondary" type="reset">Clear</button></div>`,
    formula: `<p>On a 4.0 scale, the linear conversion is <code>percentage = GPA ÷ 4 × 100</code> and <code>GPA = percentage ÷ 25</code>.</p>
      <p>On the common 10-point CGPA convention, <code>percentage = CGPA × 9.5</code> and <code>CGPA = percentage ÷ 9.5</code>. These are estimates, not official institutional conversions.</p>`,
    example: `<p><strong>Example 1:</strong> GPA 3.5 on a 4.0 scale = <strong>87.5%</strong>.</p>
      <p><strong>Example 2:</strong> 89% converts to <strong>3.56 GPA</strong> on a 4.0 scale.</p>
      <p><strong>Example 3:</strong> CGPA 9.2 × 9.5 = <strong>87.4%</strong> on the common 10-point convention.</p>`,
    steps: ['Choose the tab that matches your scale and direction.', 'Enter the GPA, CGPA or percentage value.', 'Select Convert, then check the note about institutional rules.'],
    faq: [
      ['Is a 4.0 GPA the same as 100%?', 'In a simple linear conversion, yes: 4.0 maps to 100%. Many universities use grade bands instead, so check your official grading policy.'],
      ['Why does CGPA use 9.5?', 'The multiply-by-9.5 rule is a common 10-point convention. Some institutions use a different multiplier, so treat the result as an estimate.'],
      ['Can I convert between 4.0 GPA and 10-point CGPA?', 'Convert through percentage: GPA to percentage, then percentage to CGPA. Keep the same scale in mind for each step.']
    ]
  },
  'slope-calculator': {
    h1: 'Slope Calculator',
    seoTitle: 'Slope Calculator — Gradient, Intercept & Line Equation',
    desc: 'Free slope calculator from two points. Get the gradient, y-intercept, line equation, angle and distance with clear working.',
    intro: 'Enter two points on a straight line and see the rise over run, the slope-intercept equation and the angle of the line. This slope calculator works locally and shows the arithmetic so you can check your homework.',
    icon: 'chart',
    form: `
      <div class="form-grid">
        ${f('sl-x1', 'x₁ of first point', 'number', 'step="any" placeholder="e.g. 1"')}
        ${f('sl-y1', 'y₁ of first point', 'number', 'step="any" placeholder="e.g. 3"')}
        ${f('sl-x2', 'x₂ of second point', 'number', 'step="any" placeholder="e.g. 3"')}
        ${f('sl-y2', 'y₂ of second point', 'number', 'step="any" placeholder="e.g. 7"')}
      </div>
      <div class="form-actions"><button class="btn btn-primary" type="submit">Calculate slope</button><button class="btn btn-secondary" type="reset">Clear</button></div>`,
    formula: `<p>Slope is <code>m = (y₂ − y₁) ÷ (x₂ − x₁)</code>. Once you know the slope, the y-intercept is <code>b = y₁ − m × x₁</code>, giving the line <code>y = mx + b</code>.</p>
      <p>If the two x-values are equal, the line is vertical. Its slope is undefined and the equation is <code>x = x₁</code>.</p>`,
    example: `<p><strong>Example 1:</strong> points (1, 3) and (3, 7): rise = 4, run = 2, slope = <strong>2</strong>. Intercept = 3 − 2 × 1 = 1, so <code>y = 2x + 1</code>.</p>
      <p><strong>Example 2:</strong> points (0, 5) and (2, 1): slope = <strong>−2</strong>, so <code>y = −2x + 5</code>.</p>`,
    steps: ['Enter the x and y values of both points.', 'Choose Calculate slope.', 'Read the gradient, intercept, equation, angle and distance between the points.'],
    faq: [
      ['What if the line is vertical?', 'When both x-values match, slope is undefined. The calculator reports a vertical line and shows its equation as x = the shared x-value.'],
      ['Can I use decimals or negative coordinates?', 'Yes. Decimals and negatives are accepted; results are rounded to six decimal places for display.'],
      ['Is the angle in degrees?', 'Yes. The angle is measured from the positive x-axis in degrees. A horizontal line has an angle of 0°.']
    ]
  },
  'quadratic-equation-solver': {
    h1: 'Quadratic Equation Solver',
    seoTitle: 'Quadratic Equation Solver — Real, Repeated & Complex Roots',
    desc: 'Solve quadratic equations with this free calculator. See real, repeated or complex roots, the discriminant and the vertex.',
    intro: 'Enter a, b and c for ax² + bx + c = 0 and get the roots instantly. The solver handles two real roots, one repeated root and complex conjugates, and explains which case applies.',
    icon: 'calculator',
    form: `
      <div class="form-grid">
        ${f('qe-a', 'a (coefficient of x²)', 'number', 'step="any" placeholder="e.g. 1"')}
        ${f('qe-b', 'b (coefficient of x)', 'number', 'step="any" placeholder="e.g. -5"')}
        ${f('qe-c', 'c (constant)', 'number', 'step="any" placeholder="e.g. 6"')}
      </div>
      <p class="field-hint">The coefficient a cannot be zero, or the equation is not quadratic.</p>
      <div class="form-actions"><button class="btn btn-primary" type="submit">Solve equation</button><button class="btn btn-secondary" type="reset">Clear</button></div>`,
    formula: `<p>The discriminant is <code>D = b² − 4ac</code>. If D > 0 there are two real roots; if D = 0 there is one repeated root; if D < 0 the roots are complex conjugates.</p>
      <p>Real roots use <code>x = (−b ± √D) ÷ 2a</code>. The vertex is at <code>x = −b ÷ 2a</code>, with y found by substituting that x back into the equation.</p>`,
    example: `<p><strong>Example 1:</strong> x² − 5x + 6 = 0 gives D = 1 and roots <strong>3 and 2</strong>.</p>
      <p><strong>Example 2:</strong> x² + 4x + 4 = 0 gives D = 0 and one repeated root <strong>−2</strong>.</p>
      <p><strong>Example 3:</strong> x² + 2x + 5 = 0 gives D = −16 and complex roots <strong>−1 ± 2i</strong>.</p>`,
    steps: ['Enter the coefficients a, b and c in ax² + bx + c = 0.', 'Choose Solve equation.', 'Read the roots, discriminant and vertex shown with the result.'],
    faq: [
      ['Why must a be non-zero?', 'If a is zero, the x² term disappears and the equation becomes linear, not quadratic. Use a linear method instead.'],
      ['What are complex roots?', 'When the discriminant is negative, no real x satisfies the equation. The roots use the imaginary unit i, where i² = −1.'],
      ['Does this show working?', 'Yes. The discriminant and vertex are shown with every result so you can follow the quadratic formula.']
    ]
  },
  'pythagorean-theorem-calculator': {
    h1: 'Pythagorean Theorem Calculator',
    seoTitle: 'Pythagorean Theorem Calculator — Find a Missing Right Triangle Side',
    desc: 'Find a missing side of a right triangle with the Pythagorean theorem calculator. See a² + b² = c² working and checks.',
    intro: 'Use the Pythagorean theorem to find a hypotenuse or a missing leg of a right triangle. Enter two known sides, choose what to find and see the square-root working instantly.',
    icon: 'chart',
    form: `
      <div class="form-grid">
        ${f('py-a', 'Side a', 'number', 'step="any" placeholder="e.g. 3"')}
        ${f('py-b', 'Side b', 'number', 'step="any" placeholder="e.g. 4"')}
        ${f('py-c', 'Side c (hypotenuse)', 'number', 'step="any" placeholder="e.g. 5 or 0"')}
      </div>
      <div class="field"><label for="py-mode">What do you want to find?</label><select id="py-mode"><option value="hypotenuse">Hypotenuse c from a and b</option><option value="leg-a">Leg a from b and c</option><option value="leg-b">Leg b from a and c</option></select></div>
      <p class="field-hint">Enter 0 for the side you want to find. The hypotenuse must be the longest side.</p>
      <div class="form-actions"><button class="btn btn-primary" type="submit">Calculate side</button><button class="btn btn-secondary" type="reset">Clear</button></div>`,
    formula: `<p>For a right triangle, <code>a² + b² = c²</code>, where c is the hypotenuse. To find c, use <code>c = √(a² + b²)</code>.</p>
      <p>To find a leg, subtract the known square: <code>a = √(c² − b²)</code> or <code>b = √(c² − a²)</code>.</p>`,
    example: `<p><strong>Example 1:</strong> with a = 3 and b = 4, <code>c = √(9 + 16) = √25 = <strong>5</strong></code>.</p>
      <p><strong>Example 2:</strong> with b = 4 and c = 5, <code>a = √(25 − 16) = <strong>3</strong></code>.</p>`,
    steps: ['Enter the two sides you know and put 0 in the field you want to find.', 'Choose hypotenuse, leg a or leg b.', 'Select Calculate side and read the square-root working.'],
    faq: [
      ['Does this work for non-right triangles?', 'No. The Pythagorean theorem only applies to right triangles. Other triangles need the cosine rule.'],
      ['Which side is the hypotenuse?', 'It is the longest side, opposite the 90° angle. The calculator checks that c is longer than the known leg.'],
      ['Why is my answer a long decimal?', 'Not every square root is a whole number. The result is rounded to six decimal places for display.']
    ]
  },
  'area-calculator': {
    h1: 'Area Calculator',
    seoTitle: 'Area Calculator — Rectangle, Triangle, Circle & More',
    desc: 'Calculate area for rectangles, triangles, circles, trapezoids and parallelograms with formulas and worked examples.',
    intro: 'Choose a shape and enter its dimensions. The area calculator shows the correct formula, the substituted values and the final answer in square units.',
    icon: 'chart',
    form: `
      <div class="field"><label for="ar-shape">Shape</label><select id="ar-shape"><option value="rectangle">Rectangle</option><option value="triangle">Triangle</option><option value="circle">Circle</option><option value="trapezoid">Trapezoid</option><option value="parallelogram">Parallelogram</option></select></div>
      <div class="form-grid">
        ${f('ar-a', 'Base / length / a', 'number', 'step="any" placeholder="e.g. 8"')}
        ${f('ar-b', 'Width / second base', 'number', 'step="any" placeholder="e.g. 5"')}
        ${f('ar-h', 'Height', 'number', 'step="any" placeholder="e.g. 4"')}
        ${f('ar-r', 'Radius', 'number', 'step="any" placeholder="e.g. 2"')}
      </div>
      <p class="field-hint">Only fill the fields used by your shape: rectangle uses length and width; triangle uses base and height; circle uses radius; trapezoid uses both bases and height; parallelogram uses base and height.</p>
      <div class="form-actions"><button class="btn btn-primary" type="submit">Calculate area</button><button class="btn btn-secondary" type="reset">Clear</button></div>`,
    formula: `<p>Rectangle and parallelogram: <code>A = base × height</code>. Triangle: <code>A = ½ × base × height</code>. Circle: <code>A = πr²</code>. Trapezoid: <code>A = ½(a + b) × height</code>.</p>
      <p>Area is measured in square units. If the inputs are centimetres, the answer is in cm²; if they are metres, the answer is in m².</p>`,
    example: `<p><strong>Example 1:</strong> an 8 m by 5 m rectangle has area <code>8 × 5 = <strong>40 m²</strong></code>.</p>
      <p><strong>Example 2:</strong> a triangle with base 6 cm and height 4 cm has area <code>½ × 6 × 4 = <strong>12 cm²</strong></code>.</p>`,
    steps: ['Choose the shape from the list.', 'Enter only the dimensions that shape needs.', 'Select Calculate area and check the formula shown with the answer.'],
    faq: [
      ['What units should I use?', 'Use the same unit for every dimension. The result is in square units of whatever you entered.'],
      ['How accurate is π?', 'The calculator uses JavaScript’s full precision for π and rounds the displayed answer to six decimal places.'],
      ['Can I use decimals?', 'Yes. Decimal dimensions are supported for every shape.']
    ]
  },
  'volume-calculator': {
    h1: 'Volume Calculator',
    seoTitle: 'Volume Calculator — Cube, Prism, Cylinder, Sphere & Cone',
    desc: 'Find the volume of cubes, rectangular prisms, cylinders, spheres and cones online, with the formula and units explained.',
    intro: 'Pick a solid, enter its dimensions and get the volume with the formula and substituted values. All calculations run in your browser and results are shown in cubic units.',
    icon: 'chart',
    form: `
      <div class="field"><label for="vo-shape">Solid</label><select id="vo-shape"><option value="cube">Cube</option><option value="prism">Rectangular prism</option><option value="cylinder">Cylinder</option><option value="sphere">Sphere</option><option value="cone">Cone</option></select></div>
      <div class="form-grid">
        ${f('vo-a', 'Side / length', 'number', 'step="any" placeholder="e.g. 3"')}
        ${f('vo-b', 'Width', 'number', 'step="any" placeholder="e.g. 4"')}
        ${f('vo-h', 'Height', 'number', 'step="any" placeholder="e.g. 5"')}
        ${f('vo-r', 'Radius', 'number', 'step="any" placeholder="e.g. 2"')}
      </div>
      <p class="field-hint">Cube uses side; prism uses length, width and height; cylinder and cone use radius and height; sphere uses radius only.</p>
      <div class="form-actions"><button class="btn btn-primary" type="submit">Calculate volume</button><button class="btn btn-secondary" type="reset">Clear</button></div>`,
    formula: `<p>Cube: <code>V = side³</code>. Rectangular prism: <code>V = length × width × height</code>. Cylinder: <code>V = πr²h</code>. Sphere: <code>V = 4/3 × πr³</code>. Cone: <code>V = ⅓ × πr²h</code>.</p>
      <p>Volume is measured in cubic units, such as cm³ or m³. A cone occupies one third of the cylinder with the same radius and height.</p>`,
    example: `<p><strong>Example 1:</strong> a cube with side 3 cm has volume <code>3³ = <strong>27 cm³</strong></code>.</p>
      <p><strong>Example 2:</strong> a cylinder with radius 2 m and height 5 m has volume <code>π × 2² × 5 ≈ <strong>62.831853 m³</strong></code>.</p>`,
    steps: ['Choose the solid from the list.', 'Fill in only the dimensions that solid needs.', 'Select Calculate volume and compare the answer with the formula shown.'],
    faq: [
      ['What is the difference between volume and area?', 'Area measures a flat surface in square units; volume measures the space inside a solid in cubic units.'],
      ['Do I need to convert units first?', 'Yes. Use one unit for all dimensions. Mixing centimetres and metres gives a wrong answer.'],
      ['Can I enter decimal radii?', 'Yes. Decimals are accepted and the answer is rounded to six decimal places.']
    ]
  },
  'time-calculator': {
    h1: 'Time Calculator',
    seoTitle: 'Time Calculator — Add & Subtract Hours, Minutes, Seconds',
    desc: 'Add or subtract hours, minutes and seconds with a free time calculator that handles borrowing and decimal hours.',
    intro: 'Combine two durations or find the difference between them. The time calculator handles minute and second borrowing automatically and also gives the total in decimal hours.',
    icon: 'clock',
    form: `
      <div class="form-grid">
        ${f('ti-h1', 'First hours', 'number', 'min="0" step="1" placeholder="e.g. 1"')}
        ${f('ti-m1', 'First minutes', 'number', 'min="0" max="59" step="1" placeholder="e.g. 45"')}
        ${f('ti-s1', 'First seconds', 'number', 'min="0" max="59" step="1" placeholder="e.g. 30"')}
        ${f('ti-h2', 'Second hours', 'number', 'min="0" step="1" placeholder="e.g. 0"')}
        ${f('ti-m2', 'Second minutes', 'number', 'min="0" max="59" step="1" placeholder="e.g. 20"')}
        ${f('ti-s2', 'Second seconds', 'number', 'min="0" max="59" step="1" placeholder="e.g. 45"')}
      </div>
      <div class="field"><label for="ti-op">Operation</label><select id="ti-op"><option value="add">Add times</option><option value="subtract">Subtract second from first</option></select></div>
      <div class="form-actions"><button class="btn btn-primary" type="submit">Calculate time</button><button class="btn btn-secondary" type="reset">Clear</button></div>`,
    formula: `<p>Convert each duration to seconds: <code>total = hours × 3600 + minutes × 60 + seconds</code>. Add or subtract the totals, then regroup into hours, minutes and seconds.</p>
      <p>Decimal hours are <code>total seconds ÷ 3600</code>, which is useful for timesheets. Minutes and seconds must each be between 0 and 59.</p>`,
    example: `<p><strong>Example 1:</strong> 1h 45m 30s + 0h 20m 45s = <strong>2h 6m 15s</strong> because 75 seconds regroup to 1 minute 15 seconds.</p>
      <p><strong>Example 2:</strong> 2h 5m 10s − 0h 50m 30s = <strong>1h 14m 40s</strong>.</p>`,
    steps: ['Enter both durations in hours, minutes and seconds.', 'Choose add or subtract.', 'Select Calculate time and read the regrouped result and decimal hours.'],
    faq: [
      ['What happens if the second time is longer?', 'The difference is negative. The calculator shows a minus sign and explains that the second duration is longer.'],
      ['Why do minutes and seconds stop at 59?', 'Sixty seconds become one minute and sixty minutes become one hour, so each smaller unit must stay below 60.'],
      ['Can I use this for timesheets?', 'Yes. The decimal hours value is the number employers usually use for payroll calculations.']
    ]
  }
};
