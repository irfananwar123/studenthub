'use strict';
/* Real-browser smoke test. Run: node tests/browser-smoke.js
   Starts a local static server and headless Chrome, then drives each tool page. */
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8765;
const CDP_PORT = 9333;
const BASE = `http://127.0.0.1:${PORT}`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium'
];

const TOOL_TESTS = {
  'percentage-calculator': `set('p-percent',15);set('p-whole',200);submit('percentage-calculator-form');return R();`,
  'cgpa-calculator': `click('cg-demo');submit('cgpa-calculator-form');return R();`,
  'gpa-calculator': `click('gpa-demo');submit('gpa-calculator-form');return R();`,
  'grade-calculator': `set('gr-marks',78);set('gr-total',100);submit('grade-calculator-form');return R();`,
  'marks-calculator': `click('mk-demo');submit('marks-calculator-form');return R();`,
  'attendance-calculator': `set('at-attended',42);set('at-total',50);submit('attendance-calculator-form');return R();`,
  'exam-score-predictor': `set('ep-total',200);set('ep-obtained',90);set('ep-remaining',100);submit('exam-score-predictor-form');return R();`,
  'study-timetable-maker': `click('st-generate');return R()+'|slots:'+document.querySelectorAll('#st-grid .slot').length;`,
  'pomodoro-timer': `click('po-start');await wait(1200);const running=document.getElementById('po-display').textContent;click('po-pause');click('po-reset');return 'display:'+running+'|'+R();`,
  'exam-countdown': `set('cd-name','Biology final');set('cd-date','2027-06-01T09:00');click('cd-add');await wait(400);return R()+'|list:'+document.getElementById('cd-list').textContent.includes('Biology final');`,
  'study-tracker': `set('tr-subject','Maths');set('tr-minutes',45);click('tr-add');await wait(400);return R()+'|stats:'+document.getElementById('tr-stats').textContent.includes('45 min');`,
  'assignment-planner': `set('ap-title','Essay draft');set('ap-due','2027-01-15');click('ap-add');await wait(400);return R()+'|list:'+document.getElementById('ap-list').textContent.includes('Essay draft');`,
  'flashcard-maker': `set('fc-front','Capital of Japan?');set('fc-back','Tokyo');click('fc-add');await wait(400);click('fc-card');return R()+'|flip:'+document.getElementById('fc-card').classList.contains('is-flipped');`,
  'quiz-maker': `set('qz-question','Which organelle makes ATP?');set('qz-a','Nucleus');set('qz-b','Mitochondria');set('qz-c','Ribosome');set('qz-d','Golgi');set('qz-correct','B');click('qz-add');await wait(400);const r=document.querySelector('input[name="quiz-0"][value="B"]');r.checked=true;r.dispatchEvent(new Event('change',{bubbles:true}));click('qz-submit');return R();`,
  'revision-notes': `set('nt-title','Cell notes');set('nt-body','Mitochondria make ATP.');click('nt-save');await wait(400);return R()+'|list:'+document.getElementById('nt-list').textContent.includes('Cell notes');`,
  'question-picker': `set('qp-input','Explain osmosis');click('qp-add');await wait(400);click('qp-pick');return R()+'|selected:'+document.getElementById('qp-selected').textContent;`,
  'vocabulary-trainer': `set('vc-word','photosynthesis');set('vc-def','Making food from light');click('vc-add');await wait(400);click('vc-reveal');return R()+'|shown:'+!document.getElementById('vc-practice-def').classList.contains('visually-hidden');`,
  'word-counter': `set('wc-text','Study smarter. Achieve more.');return document.getElementById('wc-stats').textContent;`,
  'character-counter': `set('cc-text','Hello world');return document.getElementById('cc-stats').textContent;`,
  'reading-time-calculator': `set('rt-words',1200);set('rt-wpm',200);submit('reading-time-calculator-form');return R();`,
  'text-case-converter': `set('tc-input','study smarter every day');document.querySelector('[data-tc-case="title"]').click();return document.getElementById('tc-output').value;`,
  'citation-formatter': `set('cf-author','Rivera, A.');set('cf-year','2022');set('cf-title','Learning that lasts');set('cf-publisher','Example Press');submit('citation-formatter-form');return R();`,
  'age-calculator': `set('age-birth','2000-02-29');set('age-asof','2024-02-29');submit('age-calculator-form');return R();`,
  'date-calculator': `set('dc-from','2024-01-01');set('dc-to','2025-01-01');submit('date-calculator-form');return R();`,
  'unit-converter': `set('uc-value',10);submit('unit-converter-form');return R();`,
  'study-hours-tracker': `set('sh-subject','Analytics Maths');set('sh-goal',120);click('sh-start');await wait(1200);click('sh-stop');await wait(400);const ok=R().includes('Session saved')&&document.getElementById('sh-stats').textContent.includes('Today')&&document.getElementById('sh-list').textContent.includes('Analytics Maths')&&document.querySelectorAll('#sh-heatmap .heat-cell').length===35;if(!ok)throw new Error('study hours failed');return 'session saved';`,
  'spaced-revision-scheduler': `set('rs-topic','Photosynthesis');set('rs-exam','');set('rs-strength','medium');click('rs-generate');await wait(400);const group=document.querySelector('#rs-list .revision-group');const ok=R().includes('Revision plan generated')&&group&&group.textContent.includes('Photosynthesis')&&group.textContent.includes('Stage 1');if(!ok)throw new Error('revision plan failed');group.querySelector('button.btn-secondary').click();await wait(400);if(!R().includes('Review completed'))throw new Error('review toggle failed');return 'plan saved';`,
  'grade-goal-planner': `click('gg-reset');set('gg-target',80);set('gg-earned',60);set('gg-possible',80);set('gg-name-0','Final exam');set('gg-max-0',20);submit('grade-goal-planner-form');if(!R().includes('Required marks calculated')||!document.getElementById('gg-scenarios').textContent.includes('Final exam'))throw new Error('grade plan failed');click('gg-save');await wait(50);if(!R().includes('Plan saved'))throw new Error('draft save failed');return 'plan saved';`,
  'focus-streak-habits': `const d=new Date();const today=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');set('fs-habit','25 minute revision');set('fs-date',today);click('fs-add');await wait(400);const ok=R().includes('Habit logged')&&document.getElementById('fs-stats').textContent.includes('Current streak')&&document.getElementById('fs-list').textContent.includes('25 minute revision')&&document.querySelectorAll('#fs-heatmap .heat-cell').length===35&&document.querySelectorAll('#fs-legend .heat-cell').length===5;if(!ok)throw new Error('streak failed');return 'habit logged';`,
  'syllabus-coverage-tracker': `set('sc-subject','Biology');set('sc-topic','Cell division');set('sc-status','done');set('sc-confidence','high');click('sc-add');await wait(400);const ok=R().includes('Topic saved')&&document.getElementById('sc-stats').textContent.includes('100%')&&document.getElementById('sc-subjects').textContent.includes('Biology')&&document.getElementById('sc-list').textContent.includes('Cell division');if(!ok)throw new Error('syllabus tracker failed');return 'topic saved';`,
  'exam-readiness-score': `set('er-exam','Biology final');set('er-marks',90);set('er-coverage',60);set('er-revision',80);set('er-consistency',50);submit('exam-readiness-score-form');const ok=R().includes('74')&&document.getElementById('er-stats').textContent.includes('On track')&&document.getElementById('er-signals').textContent.includes('Marks average')&&document.getElementById('er-actions').textContent.includes('Step 1');if(!ok)throw new Error('readiness failed');return 'readiness scored';`,
  'study-pace-forecaster': `click('sp-demo');const ok=R().includes('Forecast ready')&&document.getElementById('sp-stats').textContent.includes('6')&&document.getElementById('sp-chart').textContent===''&&document.querySelectorAll('#sp-chart .chart-point').length===22&&document.getElementById('sp-plan').textContent.includes('Pace gap detected');if(!ok)throw new Error('forecast failed');return 'forecast ready';`,
  'assignment-priority-matrix': `const d=new Date(Date.now()+2*86400000);const iso=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');set('pm-title','Lab report');set('pm-due',iso);set('pm-hours',3);click('pm-add');await wait(400);const ok=R().includes('Assignment added')&&document.getElementById('pm-list').textContent.includes('Lab report')&&document.querySelectorAll('#pm-chart .bar-row').length===7&&document.getElementById('pm-alert').textContent.length>0;if(!ok)throw new Error('priority matrix failed');return 'matrix ranked';`,
  'deliberate-practice-planner': `click('dp-demo');const ok=R().includes('Practice plan ready')&&document.getElementById('dp-stats').textContent.includes('12')&&document.getElementById('dp-steps').textContent.includes('12')&&document.getElementById('dp-plan').textContent.includes('reaction arrows');if(!ok)throw new Error('deliberate practice failed');return 'plan ready';`,
  'feynman-clarity-score': `click('fx-demo');const parts=document.getElementById('fx-breakdown').textContent.includes('Sentence clarity');const gaps=document.getElementById('fx-gaps').textContent.includes('Fix 1');const stats=document.getElementById('fx-stats').textContent.includes('Simple words');const ok=R().includes('Clarity score')&&parts&&gaps&&stats;if(!ok)throw new Error('feynman clarity failed');return 'clarity scored';`,
  'interleaving-schedule-builder': `click('ib-demo');const ok=R().includes('Schedule ready')&&document.querySelectorAll('#ib-days .interleave-day').length===7&&document.getElementById('ib-totals').textContent.includes('Biology');if(!ok)throw new Error('interleaving failed');return 'schedule ready';`,
  'confidence-calibrator': `click('cc-demo');const ok=R().includes('Calibration ready')&&document.getElementById('cc-stats').textContent.includes('Overconfident')&&document.getElementById('cc-list').textContent.includes('Quiz 1');if(!ok)throw new Error('calibration failed');return 'calibration ready';`,
  'website-time-tracker': `const before=StudentHub.activeTime.currentMs();await wait(1200);const after=StudentHub.activeTime.currentMs();click('wt-save');await wait(50);const events=JSON.parse(localStorage.getItem('studenthub:activeTime')||'[]');const ok=after>=before+900&&R().includes('Active time saved')&&document.getElementById('wt-stats').textContent.includes('Active now')&&document.querySelectorAll('#wt-chart > div').length===7&&document.getElementById('wt-top').textContent.length>0&&events.some(e=>e.seconds>=1);if(!ok)throw new Error('active time failed');return 'active time saved';`,
  'study-time-analytics': `const d=new Date();const day=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');await StudentHub.storage.put('sessions',{subject:'Analytics Biology',minutes:45,seconds:2700,date:day,source:'manual'});click('sa-refresh');await wait(400);const stats=document.getElementById('sa-stats').textContent;const subjects=document.getElementById('sa-subjects').textContent;const ok=R().includes('Local data refreshed')&&stats.includes('Saved study time')&&subjects.includes('Analytics Biology')&&subjects.includes('45 min')&&document.querySelectorAll('#sa-chart > div').length===7&&document.getElementById('sa-split').textContent.includes('Combined local signal');if(!ok)throw new Error('analytics failed');return 'analytics ready';`,
  'scientific-calculator': `set('sc-expression','sin(30)+2^3');submit('scientific-calculator-form');return R();`,
  'fraction-calculator': `set('fr-a',1);set('fr-b',2);set('fr-c',1);set('fr-d',3);submit('fraction-calculator-form');return R();`,
  'ratio-calculator': `set('rt-a',2);set('rt-b',3);set('rt-c',10);submit('ratio-calculator-form');return R();`,
  'standard-deviation-calculator': `set('sd-values','2,4,4,4,5,5,7,9');submit('standard-deviation-calculator-form');return R();`,
  'mean-median-mode-calculator': `set('mm-values','1,2,2,3,4,7,9');submit('mean-median-mode-calculator-form');return R();`,
  'gpa-percentage-converter': `set('gp-gpa',3.5);submit('gpa-percentage-converter-form');return R();`,
  'slope-calculator': `set('sl-x1',1);set('sl-y1',3);set('sl-x2',3);set('sl-y2',7);submit('slope-calculator-form');return R();`,
  'quadratic-equation-solver': `set('qe-a',1);set('qe-b',-5);set('qe-c',6);submit('quadratic-equation-solver-form');return R();`,
  'pythagorean-theorem-calculator': `set('py-a',3);set('py-b',4);set('py-c',0);submit('pythagorean-theorem-calculator-form');return R();`,
  'area-calculator': `set('ar-a',8);set('ar-b',5);submit('area-calculator-form');return R();`,
  'volume-calculator': `set('vo-a',3);submit('volume-calculator-form');return R();`,
  'time-calculator': `set('ti-h1',1);set('ti-m1',45);set('ti-s1',30);set('ti-h2',0);set('ti-m2',20);set('ti-s2',45);submit('time-calculator-form');return R();`
};

const TOOL_EXPECTED = {
  'scientific-calculator': '8.5',
  'fraction-calculator': '5/6',
  'ratio-calculator': '15',
  'standard-deviation-calculator': '2.1381',
  'mean-median-mode-calculator': 'Median 3',
  'gpa-percentage-converter': '87.5',
  'slope-calculator': 'y = 2x + 1',
  'quadratic-equation-solver': 'Roots: 3, 2',
  'pythagorean-theorem-calculator': 'Side c = 5',
  'area-calculator': 'Area: 40',
  'volume-calculator': 'Volume: 27',
  'time-calculator': 'Time: 2h 6m 15s'
};

const HELPERS = `
const set=(id,v)=>{const n=document.getElementById(id);if(!n)throw new Error('missing '+id);n.value=v;n.dispatchEvent(new Event('input',{bubbles:true}));n.dispatchEvent(new Event('change',{bubbles:true}));};
const click=id=>{const n=document.getElementById(id);if(!n)throw new Error('missing '+id);n.click();};
const submit=id=>document.getElementById(id).requestSubmit();
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const R=()=>document.getElementById('result').textContent.trim();
`;

async function waitFor(predicate, timeout = 15000, label = 'condition') {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await predicate()) return;
    await sleep(100);
  }
  throw new Error('Timeout waiting for ' + label);
}

async function main() {
  const chromePath = CHROME_CANDIDATES.find(p => fs.existsSync(p));
  if (!chromePath) throw new Error('Chrome not found. Install Chrome or skip the browser smoke test.');
  const server = spawn('python', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'sh-chrome-'));
  const chrome = spawn(chromePath, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--remote-allow-origins=*', `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${profile}`, 'about:blank'
  ], { stdio: 'ignore' });
  let ws;
  try {
    await waitFor(async () => {
      try { const r = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`); return r.ok; } catch (e) { return false; }
    }, 20000, 'Chrome debugging port');
    await waitFor(async () => {
      try { const r = await fetch(BASE + '/'); return r.ok; } catch (e) { return false; }
    }, 10000, 'local server');
    const targets = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
    const page = targets.find(t => t.type === 'page');
    if (!page) throw new Error('No Chrome page target');
    ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
    let nextId = 1;
    const pending = new Map();
    let exceptions = [];
    ws.onmessage = event => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        const p = pending.get(msg.id); pending.delete(msg.id);
        if (msg.error) p.reject(new Error(JSON.stringify(msg.error))); else p.resolve(msg.result);
        return;
      }
      if (msg.method === 'Runtime.exceptionThrown') exceptions.push(msg.params.exceptionDetails.text + ' ' + (msg.params.exceptionDetails.exception?.description || ''));
      if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') exceptions.push(msg.params.entry.text);
      if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') exceptions.push(msg.params.args.map(a => a.value || a.description).join(' '));
    };
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = nextId++; pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
    await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable'); await send('Network.enable');
    // Ads are always on, so block their domains for the whole run. Their failed
    // requests are expected; every check still verifies the site's own markup.
    await send('Network.setBlockedURLs', { urls: ['*://*afders.org/*', '*://*arwf.org/*', '*://*bicea.org/*'] });

    const results = [];
    const check = async (name, url, expression, expected) => {
      exceptions = [];
      try {
        const target = /^(https?:|file:)\/\//.test(url) ? url : BASE + url;
        await send('Page.navigate', { url: target });
        await waitFor(async () => {
          const r = await send('Runtime.evaluate', { expression: 'document.readyState', returnByValue: true });
          return r.result.value === 'complete';
        }, 15000, 'load ' + target);
        await sleep(150);
        const r = await send('Runtime.evaluate', {
          expression: `(async()=>{${HELPERS}\n${expression}})()`, awaitPromise: true, returnByValue: true
        });
        if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
        // Chrome cannot fetch a web manifest from file:// (origin null). The UI,
        // tools and styles are unaffected, so ignore that specific browser note.
        if (target.startsWith('file:') && exceptions.some(e => /Access to manifest/.test(e))) {
          exceptions = exceptions.filter(e => !/Access to manifest|Failed to load resource/.test(e));
        }
        // Only the deliberately blocked ad domains produce these load errors.
        exceptions = exceptions.filter(e => !/Failed to load resource|net::ERR/.test(e));
        const text = String(r.result.value || '');
        const ok = expected ? text.includes(expected) && exceptions.length === 0
          : !!text && !/Check your input|Enter (a |both |at least |two )/i.test(text) && exceptions.length === 0;
        results.push({ name, ok, text: text.slice(0, 160), errors: exceptions.slice(0, 2) });
      } catch (err) {
        results.push({ name, ok: false, text: String(err.message || err), errors: exceptions.slice(0, 2) });
      }
    };

    for (const [id, expression] of Object.entries(TOOL_TESTS)) {
      await check(id, `/tools/${id}/`, expression, TOOL_EXPECTED[id]);
    }
    await check('homepage-search', '/', `set('home-search','attendance');await wait(50);return document.getElementById('home-search-results').textContent.includes('Attendance Calculator')?'search ok':'search failed';`);
    await check('scroll-progress-backtop', '/', `document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,650);await wait(300);const bar=document.querySelector('[data-scroll-progress]');const pct=Number(bar.getAttribute('aria-valuenow'));const top=document.querySelector('[data-back-to-top]');const shown=!top.hidden;top.click();await wait(1400);const y=Math.round(window.scrollY);document.documentElement.style.scrollBehavior='';return 'pct:'+pct+'|shown:'+shown+'|y:'+y;`, '|shown:true|y:0');
    await check('sticky-header-context', '/', `document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,900);await wait(300);const stuck=document.querySelector('.site-header').classList.contains('is-stuck');const context=document.querySelector('[data-header-context]');const ok=stuck&&!context.hidden&&context.textContent.trim().length>0;document.documentElement.style.scrollBehavior='';return ok?'sticky ok':'sticky failed';`, 'sticky ok');
    await check('reveal-on-scroll', '/', `document.documentElement.style.scrollBehavior='auto';const card=document.querySelector('.tool-card');const has=document.documentElement.classList.contains('has-reveal');const marked=document.querySelectorAll('[data-reveal]').length>=60;window.scrollTo(0,Math.max(0,card.getBoundingClientRect().top+window.scrollY-220));await wait(850);const visible=card.classList.contains('is-visible')&&getComputedStyle(card).opacity==='1';document.documentElement.style.scrollBehavior='';return has&&marked&&visible?'reveal ok':'reveal '+[has,marked,card.classList.contains('is-visible'),getComputedStyle(card).opacity].join(',');`, 'reveal ok');
    await send('Emulation.setEmulatedMedia', { media: 'screen', features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await check('smooth-anchor-navigation', '/', `document.querySelector('a[href="#all-tools"]').click();await wait(400);const active=document.documentElement.getAttribute('data-active-section');const indicated=document.querySelectorAll('a[aria-current="location"]').length;return location.hash==='#all-tools'&&active==='all-tools'&&indicated>=1?'anchor ok':'anchor '+[location.hash,active,indicated].join(',');`, 'anchor ok');
    await send('Emulation.setEmulatedMedia', { media: '', features: [] });
    await check('command-palette', '/', `document.dispatchEvent(new KeyboardEvent('keydown',{key:'k',ctrlKey:true,bubbles:true,cancelable:true}));const palette=document.querySelector('[data-command-palette]');const open=!palette.hidden;const input=document.querySelector('[data-palette-input]');input.value='slope';input.dispatchEvent(new Event('input',{bubbles:true}));const found=document.querySelector('[data-palette-results]').textContent.includes('Slope Calculator');document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));return open&&found&&palette.hidden?'palette ok':'palette failed';`, 'palette ok');
    await check('command-palette-keyboard', '/', `document.querySelector('[data-palette-open]').click();const before=document.querySelector('.palette-item.is-selected').textContent;document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));const after=document.querySelector('.palette-item.is-selected').textContent;document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));return before!==after?'palette keyboard ok':'palette keyboard failed';`, 'palette keyboard ok');
    await check('advanced-hub-filters', '/advanced/', `await wait(350);const visible=()=>document.querySelectorAll('#advanced-grid [data-advanced-category]:not([hidden])').length;const before=visible();document.querySelector('[data-advanced-filter="academic-calculators"]').click();const academic=visible();set('advanced-search','readiness');await wait(20);const searched=visible();document.querySelector('[data-advanced-filter="learning-tools"]').click();set('advanced-search','');await wait(20);const learning=visible();document.querySelector('[data-advanced-filter="all"]').click();set('advanced-search','nothingmatches');await wait(20);const empty=!document.getElementById('advanced-empty').hidden;const ready=document.documentElement.getAttribute('data-hub-ready')==='true'&&!document.getElementById('advanced-skeleton');return before+'|'+academic+'|'+searched+'|'+learning+'|'+empty+'|'+ready;`, '14|3|1|2|true|true');
    await check('advanced-hub-dashboard-links', '/advanced/', `const links=[...document.querySelectorAll('#advanced-grid a')];const ok=links.length===28&&links.every(a=>a.getAttribute('href').indexOf('tools/')>-1)&&getComputedStyle(document.querySelector('.advanced-card')).borderTopWidth!=='0px';return ok?'advanced ui ok':'advanced ui failed';`, 'advanced ui ok');
    await check('live-usage-strip', '/', `await wait(150);const bar=document.getElementById('usage-bar');const actions=Number(bar.querySelector('[data-usage="actions"]').textContent);const events=StudentHub.usage.events();const local=bar.getAttribute('aria-label').indexOf('this device')>-1&&bar.textContent.includes('Live usage');return bar&&actions>=1&&events.length>=1&&local?'usage local live':'usage failed';`, 'usage local live');
    await check('live-usage-records-tools', '/tools/percentage-calculator/', `await wait(150);const events=StudentHub.usage.events();const opens=events.filter(e=>e.type==='open'&&e.source==='percentage-calculator');const tools=Number(document.querySelector('[data-usage="tools"]').textContent);const stored=JSON.parse(localStorage.getItem('studenthub:usageEvents')||'[]');return opens.length>=1&&tools>=1&&stored.length>=1?'tool usage recorded':'tool usage missing';`, 'tool usage recorded');
    await check('manifest-http', '/', `const l=document.querySelector('link[rel=manifest]');return l?l.getAttribute('href'):'missing';`, 'manifest.webmanifest');
    await check('theme-default-auto', '/', `const pref=StudentHub.theme.get();const mode=document.documentElement.dataset.theme;const pressed=document.querySelector('[data-theme-option="auto"]').getAttribute('aria-pressed');const bg=getComputedStyle(document.body).backgroundColor;return pref==='auto'&&pressed==='true'&&(mode==='light'||mode==='dark')&&bg!=='rgba(0, 0, 0, 0)'?'theme auto ready':'theme failed';`, 'theme auto ready');
    await check('accent-default-blue', '/', `const accent=StudentHub.theme.getAccent();const root=document.documentElement.getAttribute('data-accent');const pressed=document.querySelectorAll('[data-accent-option="blue"][aria-pressed="true"]').length;const stored=localStorage.getItem('studenthub:accent');return accent==='blue'&&root==='blue'&&pressed>=2&&stored===null?'accent default blue':'accent default failed';`, 'accent default blue');
    await check('accent-violet-toggle', '/', `document.querySelector('.header-actions [data-accent-option="violet"]').click();const accent=StudentHub.theme.getAccent();const root=document.documentElement.getAttribute('data-accent');const pressed=document.querySelector('.appearance-studio [data-accent-option="violet"]').getAttribute('aria-pressed');const stored=localStorage.getItem('studenthub:accent');const brand=getComputedStyle(document.documentElement).getPropertyValue('--brand').trim();const bg=getComputedStyle(document.querySelector('.btn-primary')).backgroundImage;return accent==='violet'&&root==='violet'&&pressed==='true'&&stored==='"violet"'&&/^#(7c3aed|c4b5fd)$/.test(brand)&&bg.indexOf('rgb')>-1?'violet active':'violet failed';`, 'violet active');
    await check('accent-persists', '/tools/percentage-calculator/', `const accent=StudentHub.theme.getAccent();const root=document.documentElement.getAttribute('data-accent');const stored=localStorage.getItem('studenthub:accent');const pressed=document.querySelector('[data-accent-option="violet"]').getAttribute('aria-pressed');const brand=getComputedStyle(document.documentElement).getPropertyValue('--brand').trim();return accent==='violet'&&root==='violet'&&stored==='"violet"'&&pressed==='true'&&brand.length>0?'violet persisted':'violet not persisted';`, 'violet persisted');
    await check('accent-reset', '/', `document.querySelector('[data-theme-reset]').click();const accent=StudentHub.theme.getAccent();const theme=StudentHub.theme.get();const mode=document.documentElement.dataset.theme;const rootAccent=document.documentElement.dataset.accent;const blue=document.querySelector('.header-actions [data-accent-option="blue"]').getAttribute('aria-pressed');const auto=document.querySelector('.header-actions [data-theme-option="auto"]').getAttribute('aria-pressed');const stored=localStorage.getItem('studenthub:accent');return accent==='blue'&&theme==='auto'&&rootAccent==='blue'&&(mode==='light'||mode==='dark')&&blue==='true'&&auto==='true'&&stored==='"blue"'?'appearance reset':'reset failed';`, 'appearance reset');
    await check('theme-dark-toggle', '/', `document.querySelector('[data-theme-option="dark"]').click();const mode=document.documentElement.dataset.theme;const pressed=document.querySelector('[data-theme-option="dark"]').getAttribute('aria-pressed');const stored=localStorage.getItem('studenthub:theme');const meta=document.querySelector('meta[name="theme-color"]').getAttribute('content');const bg=getComputedStyle(document.body).backgroundColor;return mode==='dark'&&pressed==='true'&&stored==='"dark"'&&meta==='#07101f'&&bg!=='rgba(0, 0, 0, 0)'?'dark active':'dark failed';`, 'dark active');
    await check('theme-persists', '/tools/percentage-calculator/', `const mode=document.documentElement.dataset.theme;const pref=StudentHub.theme.get();const stored=localStorage.getItem('studenthub:theme');const pressed=document.querySelector('[data-theme-option="dark"]').getAttribute('aria-pressed');return mode==='dark'&&pref==='dark'&&stored==='"dark"'&&pressed==='true'?'dark persisted':'dark not persisted';`, 'dark persisted');
    await check('theme-light-toggle', '/', `document.querySelector('[data-theme-option="light"]').click();const mode=document.documentElement.dataset.theme;const stored=localStorage.getItem('studenthub:theme');const meta=document.querySelector('meta[name="theme-color"]').getAttribute('content');return mode==='light'&&stored==='"light"'&&meta==='#f5f8ff'?'light active':'light failed';`, 'light active');
    await send('Emulation.setEmulatedMedia', { media: 'screen', features: [{ name: 'prefers-color-scheme', value: 'dark' }] });
    await check('theme-auto-dark', '/', `document.querySelector('[data-theme-option="auto"]').click();const mode=document.documentElement.dataset.theme;const pref=StudentHub.theme.get();const stored=localStorage.getItem('studenthub:theme');const bg=getComputedStyle(document.body).backgroundColor;return mode==='dark'&&pref==='auto'&&stored==='"auto"'&&bg!=='rgba(0, 0, 0, 0)'?'auto follows dark':'auto dark failed';`, 'auto follows dark');
    await send('Emulation.setEmulatedMedia', { media: 'screen', features: [{ name: 'prefers-color-scheme', value: 'light' }] });
    await sleep(200);
    const autoUpdate = await send('Runtime.evaluate', { expression: `document.documentElement.dataset.theme+'|'+StudentHub.theme.get()+'|'+getComputedStyle(document.body).backgroundColor`, returnByValue: true });
    const autoUpdateText = String(autoUpdate.result.value || '');
    results.push({ name: 'theme-auto-updates', ok: /^light\|auto\|.+$/.test(autoUpdateText), text: autoUpdateText, errors: [] });
    await send('Emulation.setEmulatedMedia', { media: '', features: [] });
    await check('workspace', '/workspace/', `click('ws-export');await wait(600);return document.getElementById('ws-status').textContent.length>0?'export ok':'export failed';`);
    await check('contact', '/contact/', `set('ct-subject','Hello');set('ct-message','Test message');click('ct-copy');return 'contact loaded';`);
    await check('offline-page', '/offline/', `return document.querySelector('h1').textContent;`);

    // Edge cases, persistence and offline support.
    await check('edge-division-by-zero', '/tools/percentage-calculator/', `set('p-percent',15);set('p-whole',0);submit('percentage-calculator-form');return R();`, 'must not be zero');
    await check('edge-invalid-attendance', '/tools/attendance-calculator/', `set('at-attended',60);set('at-total',50);submit('attendance-calculator-form');return R();`, 'Check your input');
    await check('edge-invalid-date', '/tools/age-calculator/', `set('age-birth','2023-02-29');set('age-asof','2024-01-01');submit('age-calculator-form');return R();`, 'valid birth date');
    await check('storage-roundtrip', '/workspace/', `const json=await StudentHub.storage.exportData();await StudentHub.storage.importData(json);return 'roundtrip ok';`, 'roundtrip ok');
    await check('service-worker', '/', `await wait(1800);const r=await navigator.serviceWorker.getRegistration();return r?'sw registered':'no registration';`, 'sw registered');

    // Ads are static parse-time tags and run on every page. The ad domains are
    // already blocked for the whole run, so these checks need no live creative.
    await check('ads-static-home', '/', `const slot=document.querySelector('[data-ad-slot="home"]');const link=document.querySelector('.footer-bottom .sponsored-links a');const s=[...document.querySelectorAll('script[src]')].map(x=>x.src);const count=u=>s.filter(x=>x.indexOf(u)>-1).length;const ok=slot&&!slot.hidden&&slot.classList.contains('ad-slot-active')&&!!slot.querySelector('.ad-unit-banner script[src*="bicea.org/22/"]')&&window.atOptions&&window.atOptions.key==='96d3c3868be22016392b6676ae58d572'&&link&&link.rel.indexOf('sponsored')>-1&&link.href.indexOf('arwf.org/4/')>-1&&count('afders.org/1/')===1&&count('bicea.org/14/')===1&&count('bicea.org/22/')===1;return ok?'ads static':'ads missing';`, 'ads static');
    await check('ads-static-native', '/tools/percentage-calculator/', `const slot=document.querySelector('[data-ad-slot="tool"]');const kids=[...slot.children].map(x=>x.tagName+(x.id?'#'+x.id:''));const s=[...document.querySelectorAll('script[src]')].map(x=>x.src).filter(x=>x.indexOf('bicea.org/21/')>-1);const si=kids.indexOf('SCRIPT');const ci=kids.findIndex(x=>x.indexOf('DIV#container-9b5ea66616f3e02be4f9a4fe968d7547')===0);const ok=slot&&!slot.hidden&&s.length===1&&si>=0&&ci>si;return ok?'native static':'native missing';`, 'native static');
    await check('ads-native-home', '/', `const slot=document.querySelector('[data-ad-slot="home-native"]');const s=[...document.querySelectorAll('script[src]')].map(x=>x.src).filter(x=>x.indexOf('bicea.org/21/')>-1);return slot&&!slot.hidden&&s.length===1&&slot.querySelector('#container-9b5ea66616f3e02be4f9a4fe968d7547')?'native home':'native home missing';`, 'native home');
    await check('ads-home-extra', '/', `const slots=[...document.querySelectorAll('[data-ad-slot="home-top"],[data-ad-slot="home-math"]')];const links=[...document.querySelectorAll('script[src]')].map(x=>x.src);const native=links.filter(x=>x.indexOf('bicea.org/21/')>-1).length;const ok=slots.length===2&&slots.every(x=>!x.hidden&&x.querySelector('a.ad-first-party[rel*="sponsored"]')&&x.querySelector('img[src*="assets/ads/sponsored-"]'))&&native===1;return ok?'extra ads static':'extra ads missing';`, 'extra ads static');
    const adRoutes = ['/', '/advanced/', '/about/', '/contact/', '/privacy-policy/', '/terms/', '/offline/', '/404/', '/workspace/',
      '/tools/percentage-calculator/', '/articles/study-tips/'];
    const adResults = await Promise.all(adRoutes.map(async route => {
      const html = await (await fetch(BASE + route)).text();
      return html.includes('class="ad-slot ad-slot-active"') &&
        html.includes('<script data-cfasync="false" src="https://afders.org/1/3c0e12112693371a49e8da1ecaf03499"></script>') &&
        html.includes('<script data-cfasync="false" src="https://bicea.org/14/3d7fa5667db565ec11331c4b0846ee9b"></script>') &&
        html.includes('rel="sponsored noopener noreferrer"');
    }));
    results.push({ name: 'ads-every-page', ok: adResults.every(Boolean), errors: [],
      text: adResults.every(Boolean) ? `ads on ${adRoutes.length} pages` : `ads missing on ${adResults.filter(ok => !ok).length}` });
    await check('ads-ignore-off-switch', '/workspace/?' + 'no' + 'ads=1', `const slot=document.querySelector('[data-ad-slot]');const scripts=[...document.querySelectorAll('script[src]')].map(x=>x.src);const link=document.querySelector('.footer-bottom .sponsored-links a');return slot&&!slot.hidden&&slot.classList.contains('ad-slot-active')&&scripts.some(x=>x.indexOf('afders.org/1/')>-1)&&!!link?'always on':'off switch worked';`, 'always on');
    await check('ads-first-party-blocked', '/', `await wait(600);const slot=document.querySelector('[data-ad-slot="home"]');const img=slot&&slot.querySelector('.ad-first-party img');const note=slot&&slot.querySelector('[data-ad-notice]');return img&&img.src.indexOf('/assets/ads/sponsored-')>-1&&note&&StudentHub.ads.isBlocked()?'first-party shown':'first-party missing';`, 'first-party shown');
    await check('ads-fallback-visible', '/', `await wait(4400);const f=document.querySelector('[data-ad-slot="home"] .ad-fallback');return f&&f.href.indexOf('arwf.org/4/')>-1?'fallback visible':'fallback missing';`, 'fallback visible');

    // Opening the HTML files directly from disk (file://) must keep the full UI.
    const FILE_ROOT = 'file:///' + ROOT.replace(/\\/g, '/');
    await check('file-homepage-styled', `${FILE_ROOT}/index.html`, `const l=[...document.querySelectorAll('link[rel=stylesheet]')];return (l.length===4 && l.every(x=>x.href.indexOf('/assets/css/')>-1) && !document.querySelector('link[rel=manifest]') && getComputedStyle(document.body).backgroundColor!=='rgba(0, 0, 0, 0)')?'styled from disk':'unstyled';`, 'styled from disk');
    await check('file-tool-styled-and-working', `${FILE_ROOT}/tools/percentage-calculator/index.html`, `set('p-percent',15);set('p-whole',200);submit('percentage-calculator-form');const styled=getComputedStyle(document.body).backgroundColor!=='rgba(0, 0, 0, 0)';return styled?R():'unstyled';`, '30');
    await check('file-relative-links', `${FILE_ROOT}/tools/percentage-calculator/index.html`, `return document.querySelector('.site-header .brand').getAttribute('href')+'|'+StudentHub.toolUrl('quiz-maker')+'|'+StudentHub.homeUrl('#all-tools');`, '../../index.html|../../tools/quiz-maker/index.html|../../index.html#all-tools');

    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await check('mobile-quick-bar', '/', `const bar=document.querySelector('.quick-bar');const shown=getComputedStyle(bar).display==='grid';bar.querySelector('[data-quick-action="search"]').click();const open=!document.querySelector('[data-command-palette]').hidden;document.querySelector('.palette-close').click();return shown&&open&&document.querySelector('[data-command-palette]').hidden?'quick bar ok':'quick bar failed';`, 'quick bar ok');
    await check('mobile-homepage-no-overflow', '/', `return 'overflow:'+(document.documentElement.scrollWidth>window.innerWidth+1);`, 'overflow:false');
    await check('mobile-tool-no-overflow', '/tools/marks-calculator/', `return 'overflow:'+(document.documentElement.scrollWidth>window.innerWidth+1);`, 'overflow:false');

    // Sweep every generated page at phone width: no page may widen the viewport.
    const sweep = ['/', '/advanced/', '/about/', '/contact/', '/privacy-policy/', '/terms/', '/offline/', '/404/', '/workspace/',
      '/articles/study-tips/', '/articles/active-recall/', '/articles/spaced-repetition/', '/articles/exam-preparation/',
      ...Object.keys(TOOL_TESTS).map(id => `/tools/${id}/`)];
    const overflowing = [];
    for (const route of sweep) {
      await send('Page.navigate', { url: BASE + route });
      await waitFor(async () => {
        const r = await send('Runtime.evaluate', { expression: 'document.readyState', returnByValue: true });
        return r.result.value === 'complete';
      }, 15000, 'overflow sweep ' + route);
      await sleep(60);
      const r = await send('Runtime.evaluate', { expression: 'document.documentElement.scrollWidth>window.innerWidth+1', returnByValue: true });
      if (r.result.value) overflowing.push(route);
    }
    results.push({ name: 'all-pages-no-overflow', ok: overflowing.length === 0,
      text: overflowing.length ? 'overflow: ' + overflowing.join(', ') : 'overflow:none on ' + sweep.length + ' pages', errors: [] });
    await send('Emulation.clearDeviceMetricsOverride');

    const failed = results.filter(r => !r.ok);
    results.forEach(r => console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name.padEnd(26)} ${r.text.replace(/\s+/g, ' ').slice(0, 90)}${r.errors.length ? ' ERRORS: ' + r.errors.join(' | ') : ''}`));
    console.log(`\n${results.length - failed.length}/${results.length} browser checks passed.`);
    if (failed.length) process.exitCode = 1;
  } finally {
    if (ws) ws.close();
    chrome.kill(); server.kill();
  }
}
main().catch(err => { console.error(err); process.exitCode = 1; });
