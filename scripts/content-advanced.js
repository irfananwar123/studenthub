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
  }
};
