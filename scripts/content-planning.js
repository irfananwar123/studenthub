'use strict';
const { f } = require('./helpers');

module.exports = {
  'study-timetable-maker': {
    h1: 'Study Timetable Maker',
    seoTitle: 'Study Timetable Maker — Editable Weekly Plan with Conflict Checks',
    desc: 'Create an editable weekly study timetable from your subjects, available hours and preferred times. Detect conflicts, save locally and print.',
    intro: 'Build a realistic weekly plan instead of a wish list. Add subjects with preferred days and time slots, set how many hours you can study, and the planner places sessions while flagging overlaps. Your schedule stays in this browser and can be printed.',
    icon: 'calendar',
    form: `
      <div class="form-grid">
        ${f('st-hours', 'Study hours available per day', 'number', 'min="0" max="24" step="0.5" value="2"')}
        ${f('st-days', 'Study days per week', 'number', 'min="1" max="7" step="1" value="5"')}
        ${f('st-start', 'Preferred start time', 'time', 'value="16:00"')}
      </div>
      <div class="form-grid" style="margin-top:1rem">
        ${f('st-name', 'Subject name', 'text', 'placeholder="e.g. Biology"')}
        <div class="field"><label for="st-priority">Hours wanted this week</label><input id="st-priority" type="number" min="0.5" max="40" step="0.5" value="4"></div>
        <div class="field"><label for="st-when">Preferred time</label><select id="st-when"><option value="any">Any time</option><option value="morning">Morning</option><option value="afternoon">Afternoon</option><option value="evening">Evening</option></select></div>
      </div>
      <div class="form-actions"><button class="btn btn-secondary" type="button" id="st-add-subject">${require('./helpers').icon('plus', 16)} Add subject</button><button class="btn btn-primary" type="button" id="st-generate">Generate timetable</button></div>
      <div style="margin-top:1rem"><h3>Subjects</h3><div id="st-subject-list"></div></div>
      <div style="margin-top:1rem"><h3>Generated timetable</h3><div class="week-grid" id="st-grid"></div></div>
      <div class="notice notice-warning" id="st-conflicts" hidden></div>
      <div class="btn-row no-print" style="margin-top:1rem"><button class="btn btn-secondary btn-small" type="button" id="st-save">Save timetable</button><button class="btn btn-secondary btn-small" type="button" id="st-print">${require('./helpers').icon('print', 16)} Print</button><button class="btn btn-secondary btn-small" type="button" id="st-load">Load saved</button></div>`,
    formula: `<p>There is no single formula for a good timetable. This planner uses a simple rule: allocate each subject in blocks of up to one hour, starting with subjects that request the most time, within your daily hour limit and preferred time band.</p>
      <p>A conflict is reported when two saved sessions occupy the same day and hour slot, or when requested hours exceed the hours you marked as available.</p>`,
    example: `<p><strong>Example:</strong> with 2 hours per day on 5 days you have 10 study hours. Requesting 6 hours of Chemistry, 4 of Maths and 4 of English needs 14 hours, so the planner warns that 4 hours cannot fit and suggests extending your available hours or reducing requests.</p>`,
    steps: ['Set your available hours, days and typical start time.', 'Add subjects with the weekly hours you want and a preferred time band.', 'Generate the plan, resolve any conflicts, then save or print it.'],
    faq: [
      ['Is my timetable uploaded?', 'No. Saved timetables live in your browser storage and can be removed at any time.'],
      ['Can I move a session to another day?', 'Yes. Each generated block has day and time selectors so you can edit it before saving or printing.'],
      ['What does a conflict warning mean?', 'It means sessions overlap or your requested hours exceed the hours you said were available. Adjust either side and generate again.']
    ]
  },
  'pomodoro-timer': {
    h1: 'Pomodoro Timer',
    seoTitle: 'Pomodoro Timer — Custom Focus and Break Sessions',
    desc: 'A keyboard-friendly Pomodoro timer with custom work and break durations, session counting, sound notification and background-tab safeguards.',
    intro: 'Work in focused blocks with planned breaks. Set your own work and break lengths, start or pause with a click or the space bar, and keep a count of completed sessions. The timer uses real elapsed time so background tabs do not drift.',
    icon: 'clock',
    form: `
      <div class="form-grid">
        ${f('po-work', 'Work length (minutes)', 'number', 'min="1" max="180" step="1" value="25"')}
        ${f('po-break', 'Break length (minutes)', 'number', 'min="1" max="120" step="1" value="5"')}
        ${f('po-long', 'Long break after sessions', 'number', 'min="2" max="12" step="1" value="4"')}
      </div>
      <div class="timer-display" id="po-display" aria-live="off">25:00</div>
      <p class="timer-ring-text" id="po-mode">Ready for a work session</p>
      <div class="progress" aria-hidden="true"><span id="po-progress" style="width:0%"></span></div>
      <div class="btn-row" style="margin-top:1rem;justify-content:center">
        <button class="btn btn-primary" type="button" id="po-start">${require('./helpers').icon('play', 16)} Start</button>
        <button class="btn btn-secondary" type="button" id="po-pause" disabled>${require('./helpers').icon('pause', 16)} Pause</button>
        <button class="btn btn-secondary" type="button" id="po-reset">${require('./helpers').icon('reset', 16)} Reset</button>
        <button class="btn btn-secondary" type="button" id="po-sound">Sound: off</button>
      </div>
      <p class="field-hint" style="text-align:center;margin-top:1rem">Space bar starts or pauses. Completed sessions: <strong id="po-count">0</strong></p>
      <p class="visually-hidden" id="po-announce" role="status" aria-live="polite"></p>`,
    formula: `<p>The timer stores an end timestamp when started. Remaining time is <code>end time − current time</code>, recalculated on each tick. If the browser throttles a background tab, the next tick corrects the display instead of losing time.</p>`,
    example: `<p><strong>Example:</strong> with 25-minute work and 5-minute breaks, four completed work sessions trigger a longer break if you set the long-break interval to 4. Sessions are counted only when a work block reaches zero.</p>`,
    steps: ['Set work and break lengths.', 'Select Start, then Pause if you need to stop.', 'Turn on sound if you want an audible cue; the browser may ask for permission to play audio.'],
    faq: [
      ['Does the timer keep running in another tab?', 'Yes. It checks the actual clock rather than counting interval ticks, so throttled tabs do not slow it down.'],
      ['Will it make noise without permission?', 'No. Sound is off until you enable it, and audio playback may still be blocked by your browser until you interact with the page.'],
      ['Is the Pomodoro method right for everyone?', 'It is a popular focus technique, not a guarantee of productivity. Adjust the durations to suit your attention span.']
    ]
  },
  'exam-countdown': {
    h1: 'Exam Countdown',
    seoTitle: 'Exam Countdown — Multiple Exams with Time-Zone-Safe Dates',
    desc: 'Add and save multiple exams, then see a live countdown to each one using local time-zone-aware date handling.',
    intro: 'Keep every exam date in one place and watch the time remaining. Exams are saved in your browser, and countdowns use the date and time you enter in your own local time zone.',
    icon: 'calendar',
    form: `
      <div class="form-grid">
        ${f('cd-name', 'Exam name', 'text', 'placeholder="e.g. Biology final"')}
        <div class="field"><label for="cd-date">Date and time</label><input id="cd-date" type="datetime-local"></div>
      </div>
      <div class="form-actions"><button class="btn btn-primary" type="button" id="cd-add">${require('./helpers').icon('plus', 16)} Add exam</button></div>
      <div id="cd-list" style="margin-top:1.3rem"></div>`,
    formula: `<p>The countdown subtracts the current timestamp from the exam timestamp: <code>remaining = exam time − now</code>. Both values are converted to milliseconds since the Unix epoch, so daylight-saving changes in your local time zone are handled by the browser.</p>`,
    example: `<p><strong>Example:</strong> an exam at 09:00 tomorrow shown at 09:00 today has 1 day, 0 hours, 0 minutes remaining. Once the exam time passes, the card shows “Time reached” rather than a negative countdown.</p>`,
    steps: ['Type an exam name and pick its date and local time.', 'Select Add exam; repeat for as many exams as you need.', 'Countdowns update every second and remain saved on this device.'],
    faq: [
      ['How are time zones handled?', 'A datetime-local value is interpreted in your device’s current local time zone. If you travel, recheck the exam time.'],
      ['Can I edit or remove an exam?', 'Yes. Each saved card has Edit and Remove controls.'],
      ['Are exams shared with anyone?', 'No. They are stored only in this browser’s local database.']
    ]
  },
  'study-tracker': {
    h1: 'Daily Study Tracker',
    seoTitle: 'Daily Study Tracker — Log Sessions and See Weekly Study Progress',
    desc: 'Record study sessions by subject, review daily and weekly totals, and see a simple progress visualisation. All data stays on your device.',
    intro: 'Log what you studied and for how long, then see your effort add up across the week. Sessions are stored locally, grouped by subject and shown in a simple bar chart so you can spot consistent habits.',
    icon: 'chart',
    form: `
      <div class="form-grid">
        ${f('tr-subject', 'Subject', 'text', 'placeholder="e.g. Chemistry"')}
        ${f('tr-minutes', 'Minutes studied', 'number', 'min="1" max="1440" step="1" placeholder="e.g. 45"')}
        <div class="field"><label for="tr-date">Date</label><input id="tr-date" type="date"></div>
      </div>
      <div class="form-actions"><button class="btn btn-primary" type="button" id="tr-add">${require('./helpers').icon('plus', 16)} Log session</button></div>
      <div class="stat-grid" id="tr-stats" style="margin-top:1.2rem"></div>
      <h3 style="margin-top:1.4rem">Last 7 days</h3>
      <div class="bar-chart" id="tr-chart"></div>
      <h3 style="margin-top:1.4rem">Sessions</h3>
      <div id="tr-list"></div>
      <div class="btn-row no-print" style="margin-top:1rem"><button class="btn btn-secondary btn-small" type="button" id="tr-export">Export CSV</button><button class="btn btn-danger btn-small" type="button" id="tr-clear">Clear sessions</button></div>`,
    formula: `<p>Daily total: <code>Σ minutes for that date</code>. Weekly total: <code>Σ minutes for the last seven calendar days</code>. The chart scales each bar relative to the busiest day in that window.</p>`,
    example: `<p><strong>Example:</strong> 45 minutes of Maths and 30 minutes of Physics on the same day give a daily total of 75 minutes. Over a week with 300 logged minutes, the average is about 43 minutes per day.</p>`,
    steps: ['Enter a subject, minutes and date.', 'Select Log session.', 'Review daily totals, the seven-day chart and the subject list.'],
    faq: [
      ['Can I correct a mistaken entry?', 'Yes, each session has a Remove control. Log the corrected session again.'],
      ['What is the CSV export for?', 'It creates a downloadable file you can open in a spreadsheet; the file never leaves your device.'],
      ['Does the tracker measure time automatically?', 'No. You record completed sessions yourself, which keeps the tool private and simple.']
    ]
  },
  'assignment-planner': {
    h1: 'Assignment Planner',
    seoTitle: 'Assignment Planner — Deadlines, Priority and Upcoming Tasks',
    desc: 'Organise assignments with deadlines, priority levels and completion status. Edit, delete and sort upcoming work in one local planner.',
    intro: 'Keep coursework under control with a task list that sorts by deadline and priority. Add, edit and complete assignments without an account; everything is stored on this device.',
    icon: 'folder',
    form: `
      <div class="form-grid">
        ${f('ap-title', 'Assignment title', 'text', 'placeholder="e.g. Essay draft"')}
        <div class="field"><label for="ap-due">Due date</label><input id="ap-due" type="date"></div>
        <div class="field"><label for="ap-priority">Priority</label><select id="ap-priority"><option value="high">High</option><option value="medium" selected>Medium</option><option value="low">Low</option></select></div>
        <div class="field"><label for="ap-subject">Subject (optional)</label><input id="ap-subject" type="text" placeholder="e.g. History"></div>
        ${f('ap-hours', 'Estimated hours (optional)', 'number', 'value="2" min="0.25" step="0.25"')}
      </div>
      <div class="form-actions"><button class="btn btn-primary" type="button" id="ap-add">${require('./helpers').icon('plus', 16)} Add assignment</button></div>
      <div class="btn-row" style="margin-top:1.2rem">
        <button class="btn btn-secondary btn-small" type="button" data-ap-filter="open" aria-pressed="true">Open</button>
        <button class="btn btn-secondary btn-small" type="button" data-ap-filter="all" aria-pressed="false">All</button>
        <button class="btn btn-secondary btn-small" type="button" data-ap-filter="done" aria-pressed="false">Completed</button>
      </div>
      <div id="ap-list" style="margin-top:1rem"></div>`,
    formula: `<p>Tasks are ordered by due date, with higher priority first when dates match. Days remaining: <code>due date − today</code> in whole calendar days. Overdue tasks appear first with a warning label.</p>`,
    example: `<p><strong>Example:</strong> a high-priority report due tomorrow appears above a low-priority reading task due next week, even if the low-priority task was added first.</p>`,
    steps: ['Add the title, deadline, subject and priority.', 'Use the filters to focus on open or completed work.', 'Edit details or mark an assignment complete as you progress.'],
    faq: [
      ['Can I edit a deadline after saving?', 'Yes. Select Edit on any task to reload it into the form, then choose Update assignment.'],
      ['What happens to overdue tasks?', 'They stay in the list with an “Overdue” badge so nothing disappears silently.'],
      ['Is there a reminder notification?', 'Not in this version. You can add exam and assignment dates to your own calendar app.']
    ]
  }
};
