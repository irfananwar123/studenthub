'use strict';
const { f, icon } = require('./helpers');

module.exports = {
  'study-hours-tracker': {
    h1: 'Study Hours Tracker',
    seoTitle: 'Study Hours Tracker — Live Timer, Goals and Study Analytics',
    desc: 'Track real study hours with a live timer, save sessions by subject, set a weekly goal and analyse your effort with charts and a 35-day heatmap.',
    intro: 'Start a real timer, study, then save the session. StudentHub totals your hours by day and subject, measures progress against a weekly goal and shows consistency over the last 35 days. Everything is calculated in your browser and stored only on this device.',
    icon: 'clock',
    form: `
      <div class="form-grid">
        ${f('sh-subject', 'Subject', 'text', 'placeholder="e.g. Organic Chemistry"')}
        ${f('sh-goal', 'Weekly goal (minutes)', 'number', 'value="120" min="1" max="10080" step="5"')}
      </div>
      <div class="timer-console" id="sh-console">
        <div class="timer-display" id="sh-clock">00:00:00</div>
        <p class="timer-ring-text" id="sh-state">Ready when you are. Choose a subject, then start the timer.</p>
        <div class="btn-row">
          <button type="button" class="btn btn-primary" id="sh-start">${icon('play', 16)} Start session</button>
          <button type="button" class="btn btn-secondary" id="sh-pause" hidden>Pause</button>
          <button type="button" class="btn btn-secondary" id="sh-resume" hidden>Resume</button>
          <button type="button" class="btn btn-danger" id="sh-stop" hidden>Stop &amp; save</button>
        </div>
      </div>
      <div class="dashboard-grid" id="sh-stats"></div>
      <div class="progress-row">
        <div class="progress-ring" id="sh-ring"><span id="sh-ring-label">0%</span></div>
        <div class="progress-copy"><strong id="sh-goal-copy">No study time logged yet</strong><span>Weekly goal progress</span></div>
      </div>
      <h3 style="margin-top:1.4rem">Last 7 days</h3>
      <div class="bar-chart" id="sh-chart"></div>
      <h3 style="margin-top:1.4rem">Subject breakdown</h3>
      <div id="sh-subjects"></div>
      <h3 style="margin-top:1.4rem">Study consistency (35 days)</h3>
      <div class="heatmap" id="sh-heatmap"></div>
      <h3 style="margin-top:1.4rem">Add a past session</h3>
      <div class="form-grid">
        ${f('sh-manual-subject', 'Subject', 'text', 'placeholder="e.g. Biology"')}
        ${f('sh-manual-minutes', 'Minutes', 'number', 'min="1" max="1440" step="1"')}
        <div class="field"><label for="sh-manual-date">Date</label><input id="sh-manual-date" type="date"></div>
      </div>
      <div class="form-actions"><button type="button" class="btn btn-secondary" id="sh-manual-add">${icon('plus', 16)} Add past session</button></div>
      <h3 style="margin-top:1.4rem">Session history</h3>
      <div id="sh-list"></div>
      <div class="btn-row no-print" style="margin-top:1rem"><button type="button" class="btn btn-secondary btn-small" id="sh-export">Export CSV</button><button type="button" class="btn btn-danger btn-small" id="sh-clear">Clear sessions</button></div>`,
    formula: `<p>A saved session stores <code>seconds</code> measured by the live timer and a rounded <code>minutes</code> value used for totals. Daily total is <code>Σ minutes for that date</code>; the weekly total covers the last seven calendar days including today. Goal progress is <code>weekly minutes ÷ weekly goal × 100</code>, capped at 100% in the progress ring but shown unrounded in the statistics. The heatmap colours each day by the number of sessions logged on it.</p>`,
    example: `<p><strong>Example:</strong> A weekly goal of 120 minutes with 45 minutes of Maths on Monday, 30 minutes of Biology on Tuesday and 60 minutes of Maths today gives 135 minutes this week. That is <code>135 ÷ 120 × 100 = 112.5%</code> of the goal, with 105 minutes of Maths and 30 minutes of Biology in the subject breakdown.</p>`,
    steps: [
      'Enter the subject you are studying and set a weekly goal in minutes.',
      'Select Start session. Pause and resume whenever you need a break; paused time is excluded.',
      'Select Stop & save to store the elapsed time. You can also add older sessions manually.',
      'Review today, the last seven days, the goal ring, subject bars, heatmap and full history.',
      'Export a CSV for your own spreadsheet or clear every session from this device.'
    ],
    faq: [
      ['Does the timer keep running if I close the tab?', 'No. The timer runs only while this page is open. Stop and save before you leave, or use manual entry for sessions finished elsewhere.'],
      ['Is paused time included?', 'No. Only the time between Start and Pause (or Stop) is counted. Resume starts a new active segment.'],
      ['What does the heatmap show?', 'Each square is one day in the last 35 days. Darker squares mean more sessions were logged on that day.'],
      ['Can other study tools use these sessions?', 'Sessions are saved in the same local collection used by the Daily Study Tracker, so both tools read the same history.']
    ]
  },

  'spaced-revision-scheduler': {
    h1: 'Spaced Revision Scheduler',
    seoTitle: 'Spaced Revision Scheduler — Automatic Review Dates Before an Exam',
    desc: 'Generate spaced revision dates for any topic, cap the plan at your exam date, mark reviews complete and track upcoming study sessions locally.',
    intro: 'Turn a topic and an exam date into a practical review plan. Choose how confident you feel and the scheduler spaces your revisions further apart as you improve. Completed reviews are saved on your device, so you always know what is due next.',
    icon: 'calendar',
    form: `
      <div class="form-grid">
        ${f('rs-topic', 'Topic', 'text', 'placeholder="e.g. Photosynthesis"')}
        <div class="field"><label for="rs-exam">Exam date (optional)</label><input id="rs-exam" type="date"></div>
        <div class="field"><label for="rs-strength">Confidence</label><select id="rs-strength"><option value="hard">Hard — review more often</option><option value="medium" selected>Medium — balanced gaps</option><option value="easy">Easy — longer gaps</option></select></div>
      </div>
      <div class="form-actions"><button type="button" class="btn btn-primary" id="rs-generate">${icon('plus', 16)} Generate plan</button></div>
      <div class="dashboard-grid" id="rs-stats"></div>
      <h3 style="margin-top:1.4rem">Review schedule</h3>
      <div id="rs-list"></div>
      <div class="btn-row no-print" style="margin-top:1rem"><button type="button" class="btn btn-secondary btn-small" id="rs-export">Export CSV</button><button type="button" class="btn btn-danger btn-small" id="rs-clear">Clear plans</button></div>`,
    formula: `<p>The plan starts from today and adds fixed gaps depending on confidence: hard <code>1, 2, 4, 8, 15</code> days; medium <code>1, 2, 5, 10, 21</code> days; easy <code>1, 3, 7, 14, 30</code> days. Any review later than the exam date is omitted, so every scheduled session happens before the exam. A review is counted as done when you mark it complete on this device.</p>`,
    example: `<p><strong>Example:</strong> A medium-confidence topic started on 25 November 2026 with an exam on 20 December produces reviews on 26 and 27 November, 30 November, 5 December and 16 December. If the exam were 5 December, only the first four reviews would appear in the plan.</p>`,
    steps: [
      'Enter one topic and, if you know it, the exam date.',
      'Choose your confidence so the scheduler can pick short or longer gaps.',
      'Select Generate plan to create the review dates.',
      'Mark each review done as you complete it and watch the upcoming count update.',
      'Export the schedule as CSV or clear all saved plans.'
    ],
    faq: [
      ['Why are some reviews missing?', 'Reviews scheduled after your exam date are deliberately left out because they would not help before the exam.'],
      ['Can I edit a date?', 'Plans are generated from today. Delete the plan and generate a new one if your exam date or confidence changes.'],
      ['Does this replace flashcards?', 'No. It tells you when to review; the Flashcard Maker and Revision Notes tools hold the material itself.'],
      ['Where are my plans stored?', 'In this browser’s IndexedDB. Nothing is uploaded and there is no account.']
    ]
  },

  'grade-goal-planner': {
    h1: 'Grade Goal Planner',
    seoTitle: 'Grade Goal Planner — Required Marks for Every Remaining Assessment',
    desc: 'Work out the exact marks needed on all remaining assessments to reach a target grade, with achieved, possible and impossible scenarios.',
    intro: 'Set a target percentage, enter the marks you already have and list what is still to come. The planner calculates the marks you need overall, the percentage required across remaining work and a fair per-assessment target. It is honest when a goal is already secured or no longer reachable.',
    icon: 'chart',
    form: `
      <div class="form-grid">
        ${f('gg-target', 'Target percentage', 'number', 'value="80" min="0" max="100" step="1"')}
        ${f('gg-earned', 'Marks earned so far', 'number', 'min="0" step="0.5" placeholder="e.g. 60"')}
        ${f('gg-possible', 'Marks available so far', 'number', 'min="0" step="0.5" placeholder="e.g. 80"')}
      </div>
      <h3 style="margin-top:1.4rem">Remaining assessments</h3>
      <div id="gg-rows"></div>
      <div class="form-actions"><button type="button" class="btn btn-secondary" id="gg-add-row">${icon('plus', 16)} Add assessment</button><button type="submit" class="btn btn-primary">Calculate required marks</button></div>
      <div class="dashboard-grid" id="gg-plan" style="margin-top:1.2rem"></div>
      <h3 style="margin-top:1.4rem">Assessment targets</h3>
      <div id="gg-scenarios"></div>
      <div class="btn-row no-print" style="margin-top:1rem"><button type="button" class="btn btn-secondary btn-small" id="gg-save">Save plan on this device</button><button type="button" class="btn btn-danger btn-small" id="gg-reset">Reset</button></div>`,
    formula: `<p>Grand total is <code>marks available so far + Σ remaining maximum marks</code>. Required total is <code>target percentage ÷ 100 × grand total</code>. Needed from remaining work is <code>required total − marks earned so far</code>. If that number is positive and no greater than the remaining marks available, the required percentage is <code>needed ÷ remaining available × 100</code>, and each assessment gets <code>needed ÷ remaining available × that assessment’s maximum</code>.</p>`,
    example: `<p><strong>Example:</strong> You have 60 out of 80 so far and one assessment worth 20 marks remains. To finish at 80% overall you need 80 of 100 marks in total, so you must score <code>80 − 60 = 20</code> from the last assessment — 100% of it. If you already had 90 of 80 (including bonus marks), the target would be secured; if only 5 marks remained, the target would be impossible.</p>`,
    steps: [
      'Enter your target percentage and the marks you have earned and could have earned so far.',
      'Add each remaining assessment with the maximum marks it offers.',
      'Select Calculate required marks.',
      'Read the overall target, the percentage needed from remaining work and each assessment target.',
      'Save the plan locally to restore it next time, or reset to start again.'
    ],
    faq: [
      ['What does “impossible” mean?', 'Even full marks on all remaining assessments would not reach the target. The planner shows the shortfall so you can revise the goal honestly.'],
      ['What if I have already passed the target?', 'The result says the target is already secured and shows your current percentage above the goal.'],
      ['Can I use weighted modules?', 'Enter each module’s maximum marks as an assessment. Maximum marks act as the weight in the calculation.'],
      ['Is my plan uploaded?', 'No. The last plan is kept in LocalStorage on this device and never transmitted.']
    ]
  },

  'focus-streak-habits': {
    h1: 'Focus Streak & Habits',
    seoTitle: 'Focus Streak & Habits — Daily Study Streaks and Consistency Heatmap',
    desc: 'Log daily study habits, build real day streaks, see your longest run and review a 35-day consistency heatmap. All history stays on your device.',
    intro: 'Small repeated actions beat occasional cramming. Log a completed habit for any date, then use the streak counter, longest run and 35-day heatmap to see whether your routine is actually happening. Every entry is stored locally in your browser.',
    icon: 'checkcircle',
    form: `
      <div class="form-grid">
        ${f('fs-habit', 'Habit or focus task', 'text', 'placeholder="e.g. 25 minutes of revision"')}
        <div class="field"><label for="fs-date">Date completed</label><input id="fs-date" type="date"></div>
      </div>
      <div class="form-actions"><button type="button" class="btn btn-primary" id="fs-add">${icon('plus', 16)} Log completion</button></div>
      <div class="dashboard-grid" id="fs-stats"></div>
      <h3 style="margin-top:1.4rem">35-day consistency</h3>
      <div class="heatmap" id="fs-heatmap"></div>
      <div class="legend" id="fs-legend"></div>
      <h3 style="margin-top:1.4rem">Completion history</h3>
      <div id="fs-list"></div>
      <div class="btn-row no-print" style="margin-top:1rem"><button type="button" class="btn btn-secondary btn-small" id="fs-export">Export CSV</button><button type="button" class="btn btn-danger btn-small" id="fs-clear">Clear history</button></div>`,
    formula: `<p>A day counts once it has at least one logged habit. The current streak counts consecutive days ending today, or ending yesterday if today is not yet complete. The longest streak is the greatest run of consecutive logged days in your history. The heatmap shows the number of habits completed on each of the last 35 days, with darker cells for busier days.</p>`,
    example: `<p><strong>Example:</strong> Logging habits on 23, 24 and 25 November gives a current streak of 3 days and a longest streak of at least 3. If the next entry is on 27 November, the current streak resets to 1 but the longest streak stays 3.</p>`,
    steps: [
      'Type the habit you completed and choose the date it happened.',
      'Select Log completion. You can log the same habit on many different days.',
      'Review the current streak, longest streak, total active days and 35-day heatmap.',
      'Remove any mistaken entry from the history, export a CSV or clear everything.'
    ],
    faq: [
      ['Does a missed day break the streak?', 'Yes. The current streak only continues while each previous calendar day has at least one logged habit. The longest streak is never lost.'],
      ['Can I log several habits on one day?', 'Yes. Multiple entries on the same date make that heatmap cell darker but still count as one day for streaks.'],
      ['Can I backfill earlier dates?', 'Yes. Choose any past date before logging the completion.'],
      ['Where is this history stored?', 'In this browser’s IndexedDB together with your other local task collections. It is never uploaded.']
    ]
  },

  'syllabus-coverage-tracker': {
    h1: 'Syllabus Coverage Tracker',
    seoTitle: 'Syllabus Coverage Tracker — Topic Progress by Subject',
    desc: 'Track every syllabus topic by subject, status and confidence, then see coverage percentages and the areas that need attention next.',
    intro: 'A syllabus is easier to manage when every topic has a clear status. Add topics once, mark them as not started, in progress or done, and this dashboard shows overall coverage, the weakest subjects and what deserves your next session.',
    icon: 'target',
    form: `
      <div class="form-grid">
        ${f('sc-subject', 'Subject', 'text', 'placeholder="e.g. Biology"')}
        ${f('sc-topic', 'Topic', 'text', 'placeholder="e.g. Cell division"')}
        <div class="field"><label for="sc-status">Status</label><select id="sc-status"><option value="not-started">Not started</option><option value="in-progress">In progress</option><option value="done">Done</option></select></div>
        <div class="field"><label for="sc-confidence">Confidence</label><select id="sc-confidence"><option value="low">Low — needs review</option><option value="medium" selected>Medium — nearly there</option><option value="high">High — secure</option></select></div>
      </div>
      <div class="form-actions"><button type="button" class="btn btn-primary" id="sc-add">${icon('plus', 16)} Save topic</button></div>
      <div class="dashboard-grid" id="sc-stats"></div>
      <div class="progress-row">
        <div class="progress-ring" id="sc-ring"><span id="sc-ring-label">0%</span></div>
        <div class="progress-copy"><strong id="sc-goal-copy">No topics tracked yet</strong><span>Syllabus completed</span></div>
      </div>
      <h3 style="margin-top:1.4rem">Subject breakdown</h3>
      <div id="sc-subjects"></div>
      <h3 style="margin-top:1.4rem">Focus next</h3>
      <div id="sc-focus"></div>
      <h3 style="margin-top:1.4rem">Tracked topics</h3>
      <div id="sc-list"></div>
      <div class="btn-row no-print" style="margin-top:1rem"><button type="button" class="btn btn-secondary btn-small" id="sc-export">Export CSV</button><button type="button" class="btn btn-danger btn-small" id="sc-clear">Clear topics</button></div>`,
    formula: `<p>Coverage is <code>done topics ÷ all topics × 100</code>. Each subject gets its own coverage percentage using the same calculation. Confidence is weighted as low <code>0.4</code>, medium <code>0.7</code> and high <code>1</code>, then averaged across all topics. The focus list sorts subjects by lowest coverage first, with larger subjects ahead of smaller ones when coverage is equal.</p>`,
    example: `<p><strong>Example:</strong> Four Biology topics and three Chemistry topics, with three Biology and one Chemistry topic done, give <code>4 ÷ 7 = 57.1%</code> overall coverage. Biology is 75% complete and Chemistry is 33.3%, so Chemistry appears first in Focus next.</p>`,
    steps: [
      'Enter a subject and one topic from your syllabus.',
      'Choose the current status and how confident you feel, then save the topic.',
      'Repeat for the rest of the syllabus. Saving the same subject and topic updates that row.',
      'Read the ring, subject bars and Focus next list to plan the next study session.',
      'Export the topic list as CSV or clear all tracked topics.'
    ],
    faq: [
      ['Can I update a topic?', 'Yes. Save the same subject and topic again with a new status or confidence and the existing row is updated.'],
      ['Does confidence change coverage?', 'No. Coverage only counts done topics. Confidence is a separate quality signal shown beside the percentage.'],
      ['Are these topics shared with the assignment planner?', 'No. Syllabus rows are typed separately, so your assignments stay in their own list.'],
      ['Where are the topics stored?', 'In this browser’s IndexedDB. Nothing is uploaded, and the export button creates a plain CSV on your device.']
    ]
  },

  'exam-readiness-score': {
    h1: 'Exam Readiness Score',
    seoTitle: 'Exam Readiness Score — Weighted Study Signals in One Dashboard',
    desc: 'Combine marks, syllabus coverage, revision and consistency into one weighted readiness score, with the weakest signal and next actions.',
    intro: 'One percentage rarely tells the whole story. This dashboard combines four signals you can control — marks, syllabus coverage, revision and consistency — into a single readiness score, then points to the weakest area so you know what to fix next.',
    icon: 'spark',
    form: `
      <div class="form-grid">
        ${f('er-exam', 'Exam or course (optional)', 'text', 'placeholder="e.g. Biology final"')}
        ${f('er-marks', 'Marks average %', 'number', 'min="0" max="100" step="0.5" placeholder="e.g. 78"')}
        ${f('er-coverage', 'Syllabus coverage %', 'number', 'min="0" max="100" step="0.5" placeholder="e.g. 60"')}
        ${f('er-revision', 'Revision completed %', 'number', 'min="0" max="100" step="0.5" placeholder="e.g. 80"')}
        ${f('er-consistency', 'Study consistency %', 'number', 'min="0" max="100" step="0.5" placeholder="e.g. 50"')}
      </div>
      <div class="form-actions"><button type="submit" class="btn btn-primary">Calculate readiness</button><button type="button" class="btn btn-secondary" id="er-load">Use my saved study data</button></div>
      <div class="dashboard-grid" id="er-stats"></div>
      <div class="progress-row">
        <div class="progress-ring" id="er-ring"><span id="er-ring-label">0%</span></div>
        <div class="progress-copy"><strong id="er-goal-copy">No score calculated yet</strong><span>Weighted readiness</span></div>
      </div>
      <h3 style="margin-top:1.4rem">Signal breakdown</h3>
      <div id="er-signals"></div>
      <h3 style="margin-top:1.4rem">Next actions</h3>
      <div id="er-actions"></div>
      <div class="btn-row no-print" style="margin-top:1rem"><button type="button" class="btn btn-secondary btn-small" id="er-save">Save draft on this device</button></div>`,
    formula: `<p>The score is a weighted average: marks <code>35%</code>, syllabus coverage <code>25%</code>, revision completed <code>25%</code> and study consistency <code>15%</code>. Each signal must be between 0 and 100. Bands are <code>80+</code> exam ready, <code>65–79.9</code> on track, <code>45–64.9</code> needs focus and below <code>45</code> high risk. The lowest signal decides the first suggested action.</p>`,
    example: `<p><strong>Example:</strong> Marks 90, coverage 60, revision 80 and consistency 50 give <code>90×0.35 + 60×0.25 + 80×0.25 + 50×0.15 = 74%</code>. That is on track, but consistency is the weakest signal, so the first action is to log another focused study day.</p>`,
    steps: [
      'Enter your four percentages. Leave the exam name blank if you only want a general score.',
      'Select Calculate readiness to see the weighted score and band.',
      'Use Use my saved study data to fill coverage, revision and consistency from other StudentHub tools.',
      'Read the signal bars and next actions, then save the draft if you want to return to it later.'
    ],
    faq: [
      ['Is this an official prediction?', 'No. It is a planning signal based only on the numbers you enter or save locally. It does not guarantee a result.'],
      ['Why are marks weighted most heavily?', 'Marks reflect assessed performance. The other signals show whether your current habits support improvement.'],
      ['What does Use my saved study data fill in?', 'Coverage comes from the Syllabus Coverage Tracker, revision from the Spaced Revision Scheduler and consistency from logged habits and study sessions. Marks stay manual.'],
      ['Is my draft uploaded?', 'No. The last draft is stored only in LocalStorage on this device.']
    ]
  },

  'study-pace-forecaster': {
    h1: 'Study Pace Forecaster',
    seoTitle: 'Study Pace Forecaster — Required Daily Hours and Completion Forecast',
    desc: 'Forecast when your current study pace finishes a syllabus and calculate the daily hours needed to hit your deadline.',
    intro: 'A deadline feels much clearer when you can see the pace it requires. Enter the work left, your realistic units per hour, daily study time and days remaining. The forecaster compares your current pace with the pace you need and shows the gap honestly.',
    icon: 'clock',
    form: `
      <div class="form-grid">
        ${f('sp-total', 'Total units', 'number', 'value="100" min="1" step="1" placeholder="e.g. 100 topics"')}
        ${f('sp-completed', 'Units completed', 'number', 'value="40" min="0" step="1"')}
        ${f('sp-rate', 'Units per hour', 'number', 'value="2" min="0.1" step="0.1"')}
        ${f('sp-daily', 'Hours available each day', 'number', 'value="2" min="0.1" step="0.25"')}
        ${f('sp-days', 'Days left', 'number', 'value="10" min="1" step="1"')}
      </div>
      <div class="form-actions"><button type="submit" class="btn btn-primary">Forecast my pace</button><button type="button" class="btn btn-secondary" id="sp-demo">Fill example</button></div>
      <div class="dashboard-grid" id="sp-stats"></div>
      <div class="progress-row">
        <div class="progress-ring" id="sp-ring"><span id="sp-ring-label">0%</span></div>
        <div class="progress-copy"><strong id="sp-goal-copy">No forecast yet</strong><span>Projected completion</span></div>
      </div>
      <h3 style="margin-top:1.4rem">Ideal vs current pace</h3>
      <div class="forecast-chart" id="sp-chart"></div>
      <div class="legend"><span>Today</span><i class="legend-key ideal"></i> Ideal pace <i class="legend-key projected"></i> Current pace</div>
      <div id="sp-plan" style="margin-top:1rem"></div>`,
    formula: `<p>Daily capacity is <code>units per hour × hours available each day</code>. Projected units are <code>completed + capacity × days left</code>, capped at the total. Required units per day are <code>remaining units ÷ days left</code>, and required hours are <code>required units per day ÷ units per hour</code>. If projected units reach the total, the tool also shows the spare days in your schedule.</p>`,
    example: `<p><strong>Example:</strong> 100 total units with 40 done, 2 units per hour, 2 hours a day and 10 days left gives a capacity of 4 units a day. You would finish at 80 units, so you are behind. You need <code>60 ÷ 10 = 6</code> units a day, or <code>6 ÷ 2 = 3</code> hours a day.</p>`,
    steps: [
      'Decide what one unit means: a topic, a chapter, a past paper or a page group.',
      'Enter the total units, completed units, your realistic rate, daily hours and days left.',
      'Select Forecast my pace.',
      'Compare the projected percentage with the required hours per day and adjust your plan.',
      'Use Fill example to see a complete worked forecast before entering your own numbers.'
    ],
    faq: [
      ['What is a unit?', 'Any consistent piece of work you can count. Use topics for revision or pages for essays, but keep the same meaning in every field.'],
      ['Does the forecast include breaks?', 'No. Enter the hours you can genuinely study after breaks, not the hours you are merely awake.'],
      ['What does a negative buffer mean?', 'It does not appear in that case; the result says behind and shows the extra hours each day you would need.'],
      ['Is anything saved?', 'No. The forecast is calculated in this page and is not stored or uploaded.']
    ]
  },

  'assignment-priority-matrix': {
    h1: 'Assignment Priority Matrix',
    seoTitle: 'Assignment Priority Matrix — Urgency, Workload and Overload Alerts',
    desc: 'Rank saved assignments by deadline, priority and effort, then spot overloaded days in the next seven days before they happen.',
    intro: 'Not all urgent work is important, and not all important work is urgent. This matrix reads the assignments you already saved in StudentHub, scores each one and shows the next seven days of workload so you can move work before a deadline becomes a crisis.',
    icon: 'folder',
    form: `
      <div class="form-grid">
        ${f('pm-title', 'Assignment', 'text', 'placeholder="e.g. Lab report"')}
        <div class="field"><label for="pm-due">Due date</label><input id="pm-due" type="date"></div>
        <div class="field"><label for="pm-priority">Priority</label><select id="pm-priority"><option value="high">High</option><option value="medium" selected>Medium</option><option value="low">Low</option></select></div>
        ${f('pm-hours', 'Estimated hours', 'number', 'value="2" min="0.25" step="0.25"')}
        ${f('pm-subject', 'Subject (optional)', 'text', 'placeholder="e.g. Chemistry"')}
        ${f('pm-capacity', 'Hours available per day', 'number', 'value="4" min="0.25" step="0.25"')}
      </div>
      <div class="form-actions"><button type="button" class="btn btn-primary" id="pm-add">${icon('plus', 16)} Add assignment</button><button type="button" class="btn btn-secondary" id="pm-refresh">Refresh matrix</button></div>
      <div class="dashboard-grid" id="pm-stats"></div>
      <div id="pm-alert"></div>
      <h3 style="margin-top:1.4rem">Ranked actions</h3>
      <div id="pm-list"></div>
      <h3 style="margin-top:1.4rem">Next 7 days</h3>
      <div class="bar-chart" id="pm-chart"></div>
      <div class="btn-row no-print" style="margin-top:1rem"><button type="button" class="btn btn-secondary btn-small" id="pm-export">Export CSV</button></div>
      <p class="field-hint">This tool reads the same saved assignments as the Assignment Planner. Completed assignments are left out of the matrix.</p>`,
    formula: `<p>Urgency is 4 for work due today or overdue, 3 within two days, 2 within seven days and 1 later. Importance is high <code>3</code>, medium <code>2</code> and low <code>1</code>. A small effort bonus adds 2 for one hour or less, 1 for up to three hours and 0 for longer tasks. Priority score is <code>urgency × importance + effort bonus</code>. Any day whose estimated hours exceed your available hours is marked as overloaded.</p>`,
    example: `<p><strong>Example:</strong> A high-priority essay due today with three hours of work scores <code>4 × 3 + 1 = 13</code>. A medium quiz due in two days with one hour of work scores <code>3 × 2 + 2 = 8</code>, so the essay should be started first.</p>`,
    steps: [
      'Add an assignment with its due date, priority, estimated hours and optional subject.',
      'Set the hours you realistically have available each day.',
      'Select Refresh matrix at any time to reload assignments saved in this browser.',
      'Work down the ranked actions and inspect the seven-day bars for overloaded days.',
      'Export the ranked list as a CSV for your own planning.'
    ],
    faq: [
      ['Why does a small task outrank a bigger one?', 'Short tasks receive a small effort bonus because finishing them quickly can clear your list and reduce the number of open deadlines.'],
      ['Does this replace the Assignment Planner?', 'No. It reads the same local assignments and adds ranking plus workload warnings. Use the Assignment Planner to edit or complete them.'],
      ['What happens to completed assignments?', 'They are hidden from the matrix because they no longer need scheduling.'],
      ['Where is this data stored?', 'In this browser’s IndexedDB with your other assignments. The CSV export is created locally.']
    ]
  }
};
