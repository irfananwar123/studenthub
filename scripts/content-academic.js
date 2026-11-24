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
  }
};
