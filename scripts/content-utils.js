'use strict';
const { f } = require('./helpers');

module.exports = {
  'age-calculator': {
    h1: 'Age Calculator',
    seoTitle: 'Age Calculator — Exact Age in Years, Months and Days',
    desc: 'Calculate exact age from a date of birth to any date, in years, months and days, including total days and leap-year-safe date handling.',
    intro: 'Find an exact age for forms, records or curiosity. Enter a date of birth and an “as of” date, and the calculator returns completed years, months and days plus the total number of days.',
    icon: 'calendar',
    form: `
      <div class="form-grid">
        <div class="field"><label for="age-birth">Date of birth</label><input id="age-birth" type="date"></div>
        <div class="field"><label for="age-asof">Age as of</label><input id="age-asof" type="date"></div>
      </div>
      <div class="form-actions"><button class="btn btn-primary" type="submit">Calculate age</button><button class="btn btn-secondary" type="button" id="age-today">Use today</button></div>`,
    formula: `<p>Borrow days from the previous month when the day of the “as of” date is earlier than the birth day, then borrow 12 months when the month difference is negative. Total days are the difference between the two dates in whole days.</p>`,
    example: `<p><strong>Example:</strong> born 29 February 2000, as of 28 February 2025 → 24 years, 11 months, 30 days in a non-leap year; as of 29 February 2024 → 24 years, 0 months, 0 days. The calculator validates real calendar dates, so 30 February is rejected.</p>`,
    steps: ['Enter a valid date of birth.', 'Choose the date at which age should be measured.', 'Select Calculate age for the full breakdown.'],
    faq: [
      ['How are leap-day birthdays handled?', 'The calculation uses real calendar dates. A 29 February birth date is valid only in leap years; results borrow days from February in non-leap years.'],
      ['Can I calculate age on a past date?', 'Yes, as long as the “as of” date is on or after the birth date.'],
      ['Is the result used for legal purposes?', 'No. Legal age rules can differ; use the official source for any legal decision.']
    ]
  },
  'date-calculator': {
    h1: 'Date Difference Calculator',
    seoTitle: 'Date Difference Calculator — Days Between Dates and Date Shifts',
    desc: 'Count the exact number of days between two dates, with week and month equivalents, and add or subtract days from a chosen date.',
    intro: 'Plan a deadline or measure the gap between two events. This tool counts whole calendar days between dates and can also shift a date forward or backward by a number of days.',
    icon: 'calendar',
    form: `
      <div class="tab-list" role="tablist" aria-label="Date calculator modes">
        <button class="tab-button" type="button" role="tab" aria-selected="true" aria-controls="date-mode-diff" id="date-tab-diff" data-date-tab="diff">Days between</button>
        <button class="tab-button" type="button" role="tab" aria-selected="false" aria-controls="date-mode-shift" id="date-tab-shift" data-date-tab="shift">Add or subtract days</button>
      </div>
      <div id="date-mode-diff" role="tabpanel" aria-labelledby="date-tab-diff" data-date-panel="diff">
        <div class="form-grid">
          <div class="field"><label for="dc-from">Start date</label><input id="dc-from" type="date"></div>
          <div class="field"><label for="dc-to">End date</label><input id="dc-to" type="date"></div>
        </div>
      </div>
      <div id="date-mode-shift" role="tabpanel" aria-labelledby="date-tab-shift" data-date-panel="shift" hidden>
        <div class="form-grid">
          <div class="field"><label for="dc-base">Starting date</label><input id="dc-base" type="date"></div>
          ${f('dc-days', 'Days to add (negative to subtract)', 'number', 'step="1" placeholder="e.g. 30"')}
        </div>
      </div>
      <div class="form-actions"><button class="btn btn-primary" type="submit">Calculate</button><button class="btn btn-secondary" type="reset">Clear</button></div>`,
    formula: `<p>Days between dates: <code>(end date − start date) in whole days</code>. Weeks are <code>days ÷ 7</code>. A date shift adds the entered number of days to the starting date, using UTC-based calendar arithmetic to avoid daylight-saving changes.</p>`,
    example: `<p><strong>Example:</strong> 1 January 2024 to 1 January 2025 is 366 days because 2024 is a leap year — about 52.29 weeks. Adding 30 days to 15 March 2024 gives 14 April 2024.</p>`,
    steps: ['Choose Days between or Add or subtract days.', 'Enter real calendar dates.', 'Select Calculate to see the exact result.'],
    faq: [
      ['Does the count include the start date?', 'No. It counts whole days elapsed between the two dates.'],
      ['Are leap years handled?', 'Yes. The browser validates dates and the calculation uses UTC dates.'],
      ['Can I subtract days?', 'Yes. Enter a negative number of days in the shift mode.']
    ]
  },
  'unit-converter': {
    h1: 'Unit Converter',
    seoTitle: 'Unit Converter — Length, Mass, Temperature and Volume',
    desc: 'Convert between common length, mass, temperature and volume units in your browser, with precise conversion factors.',
    intro: 'A quick converter for everyday science and maths questions. Choose a category, enter a value and pick the units to convert between. All conversions use published standard factors and run locally.',
    icon: 'chart',
    form: `
      <div class="form-grid">
        <div class="field"><label for="uc-category">Category</label><select id="uc-category"><option value="length">Length</option><option value="mass">Mass</option><option value="temperature">Temperature</option><option value="volume">Volume</option></select></div>
        ${f('uc-value', 'Value', 'number', 'step="any" placeholder="e.g. 10"')}
        <div class="field"><label for="uc-from">From</label><select id="uc-from"></select></div>
        <div class="field"><label for="uc-to">To</label><select id="uc-to"></select></div>
      </div>
      <div class="form-actions"><button class="btn btn-primary" type="submit">Convert</button><button class="btn btn-secondary" type="button" id="uc-swap">Swap units</button></div>`,
    formula: `<p>Length, mass and volume convert through a base unit: <code>result = value × factor(from) ÷ factor(to)</code>. For example 1 inch = 0.0254 metres exactly.</p>
      <p>Temperature uses offsets: <code>°F = °C × 9/5 + 32</code> and <code>K = °C + 273.15</code>.</p>`,
    example: `<p><strong>Example:</strong> 10 kilometres = 10,000 metres = about 6.21 miles. 100 °C = 212 °F = 373.15 K. 2 US cups = about 473.18 millilitres.</p>`,
    steps: ['Choose a measurement category.', 'Enter a value and select the source and target units.', 'Select Convert and check the precision note.'],
    faq: [
      ['Which gallon and cup are used?', 'US customary units are used for volume. UK imperial measures differ.'],
      ['How precise are the results?', 'Factors such as the inch and pound are exact; results are displayed to six significant digits at most.'],
      ['Can I convert temperature differences?', 'No. This tool converts temperature readings, not differences between temperatures.']
    ]
  }
};
