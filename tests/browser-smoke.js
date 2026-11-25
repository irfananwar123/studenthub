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
  'focus-streak-habits': `const d=new Date();const today=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');set('fs-habit','25 minute revision');set('fs-date',today);click('fs-add');await wait(400);const ok=R().includes('Habit logged')&&document.getElementById('fs-stats').textContent.includes('Current streak')&&document.getElementById('fs-list').textContent.includes('25 minute revision')&&document.querySelectorAll('#fs-heatmap .heat-cell').length===35&&document.querySelectorAll('#fs-legend .heat-cell').length===5;if(!ok)throw new Error('streak failed');return 'habit logged';`
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

    const results = [];
    const check = async (name, url, expression, expected, opts = {}) => {
      exceptions = [];
      try {
        const target = /^(https?:|file:)\/\//.test(url) ? url : BASE + url;
        // Normal checks run with ads suppressed; the dedicated ad check opts in.
        const navUrl = opts.ads ? target : target + (target.indexOf('?') === -1 ? '?noads=1' : '&noads=1');
        await send('Page.navigate', { url: navUrl });
        await waitFor(async () => {
          const r = await send('Runtime.evaluate', { expression: 'document.readyState', returnByValue: true });
          return opts.ads ? r.result.value === 'interactive' || r.result.value === 'complete' : r.result.value === 'complete';
        }, 15000, 'load ' + navUrl);
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
        // Ad domains are deliberately blocked in the ad check; their failed
        // resource requests are expected and do not indicate a site error.
        if (opts.ads) exceptions = exceptions.filter(e => !/Failed to load resource|net::ERR/.test(e));
        const text = String(r.result.value || '');
        const ok = expected ? text.includes(expected) && exceptions.length === 0
          : !!text && !/Check your input|Enter (a |both |at least |two )/i.test(text) && exceptions.length === 0;
        results.push({ name, ok, text: text.slice(0, 160), errors: exceptions.slice(0, 2) });
      } catch (err) {
        results.push({ name, ok: false, text: String(err.message || err), errors: exceptions.slice(0, 2) });
      }
    };

    for (const [id, expression] of Object.entries(TOOL_TESTS)) {
      await check(id, `/tools/${id}/`, expression);
    }
    await check('homepage-search', '/', `set('home-search','attendance');await wait(50);return document.getElementById('home-search-results').textContent.includes('Attendance Calculator')?'search ok':'search failed';`);
    await check('manifest-http', '/', `const l=document.querySelector('link[rel=manifest]');return l?l.getAttribute('href'):'missing';`, 'manifest.webmanifest');
    await check('theme-locked-light', '/', `const t=document.documentElement.dataset.theme;const toggle=document.querySelector('[data-theme-toggle]');const bg=getComputedStyle(document.body).backgroundColor;return t==='light'&&!toggle&&bg!=='rgba(0, 0, 0, 0)'?'light locked':'theme failed';`, 'light locked');
    await check('workspace', '/workspace/', `click('ws-export');await wait(600);return document.getElementById('ws-status').textContent.length>0?'export ok':'export failed';`);
    await check('contact', '/contact/', `set('ct-subject','Hello');set('ct-message','Test message');click('ct-copy');return 'contact loaded';`);
    await check('offline-page', '/offline/', `return document.querySelector('h1').textContent;`);

    // Edge cases, persistence and offline support.
    await check('edge-division-by-zero', '/tools/percentage-calculator/', `set('p-percent',15);set('p-whole',0);submit('percentage-calculator-form');return R();`, 'must not be zero');
    await check('edge-invalid-attendance', '/tools/attendance-calculator/', `set('at-attended',60);set('at-total',50);submit('attendance-calculator-form');return R();`, 'Check your input');
    await check('edge-invalid-date', '/tools/age-calculator/', `set('age-birth','2023-02-29');set('age-asof','2024-01-01');submit('age-calculator-form');return R();`, 'valid birth date');
    await check('storage-roundtrip', '/workspace/', `const json=await StudentHub.storage.exportData();await StudentHub.storage.importData(json);return 'roundtrip ok';`, 'roundtrip ok');
    await check('service-worker', '/', `await wait(1800);const r=await navigator.serviceWorker.getRegistration();return r?'sw registered':'no registration';`, 'sw registered');

    // Ads are live by default and are static parse-time tags. Block the ad
    // domains so these checks verify our markup without needing a creative.
    await send('Network.setBlockedURLs', { urls: ['*://*afders.org/*', '*://*arwf.org/*', '*://*bicea.org/*'] });
    await check('ads-static-home', '/', `const slot=document.querySelector('[data-ad-slot="home"]');const link=document.querySelector('.footer-bottom .sponsored-links a');const s=[...document.querySelectorAll('script[src]')].map(x=>x.src);const count=u=>s.filter(x=>x.indexOf(u)>-1).length;const ok=slot&&!slot.hidden&&slot.classList.contains('ad-slot-active')&&!!slot.querySelector('.ad-unit-banner script[src*="bicea.org/22/"]')&&window.atOptions&&window.atOptions.key==='96d3c3868be22016392b6676ae58d572'&&link&&link.rel.indexOf('sponsored')>-1&&link.href.indexOf('arwf.org/4/')>-1&&count('afders.org/1/')===1&&count('bicea.org/14/')===1&&count('bicea.org/22/')===1;return ok?'ads static':'ads missing';`, 'ads static', { ads: true });
    await check('ads-static-native', '/tools/percentage-calculator/', `const slot=document.querySelector('[data-ad-slot="tool"]');const kids=[...slot.children].map(x=>x.tagName+(x.id?'#'+x.id:''));const s=[...document.querySelectorAll('script[src]')].map(x=>x.src).filter(x=>x.indexOf('bicea.org/21/')>-1);const si=kids.indexOf('SCRIPT');const ci=kids.findIndex(x=>x.indexOf('DIV#container-9b5ea66616f3e02be4f9a4fe968d7547')===0);const ok=slot&&!slot.hidden&&s.length===1&&si>=0&&ci>si;return ok?'native static':'native missing';`, 'native static', { ads: true });
    await check('ads-native-home', '/', `const slot=document.querySelector('[data-ad-slot="home-native"]');const s=[...document.querySelectorAll('script[src]')].map(x=>x.src).filter(x=>x.indexOf('bicea.org/21/')>-1);return slot&&!slot.hidden&&s.length===1&&slot.querySelector('#container-9b5ea66616f3e02be4f9a4fe968d7547')?'native home':'native home missing';`, 'native home', { ads: true });
    await check('ads-first-party-blocked', '/', `await wait(600);const slot=document.querySelector('[data-ad-slot="home"]');const img=slot&&slot.querySelector('.ad-first-party img');const note=slot&&slot.querySelector('[data-ad-notice]');return img&&img.src.indexOf('/assets/ads/sponsored-')>-1&&note&&StudentHub.ads.isBlocked()?'first-party shown':'first-party missing';`, 'first-party shown', { ads: true });
    await check('ads-fallback-visible', '/', `await wait(4400);const f=document.querySelector('[data-ad-slot="home"] .ad-fallback');return f&&f.href.indexOf('arwf.org/4/')>-1?'fallback visible':'fallback missing';`, 'fallback visible', { ads: true });
    await send('Network.setBlockedURLs', { urls: [] });

    // Opening the HTML files directly from disk (file://) must keep the full UI.
    const FILE_ROOT = 'file:///' + ROOT.replace(/\\/g, '/');
    await check('file-homepage-styled', `${FILE_ROOT}/index.html`, `const l=[...document.querySelectorAll('link[rel=stylesheet]')];return (l.length===4 && l.every(x=>x.href.indexOf('/assets/css/')>-1) && !document.querySelector('link[rel=manifest]') && getComputedStyle(document.body).backgroundColor!=='rgba(0, 0, 0, 0)')?'styled from disk':'unstyled';`, 'styled from disk');
    await check('file-tool-styled-and-working', `${FILE_ROOT}/tools/percentage-calculator/index.html`, `set('p-percent',15);set('p-whole',200);submit('percentage-calculator-form');const styled=getComputedStyle(document.body).backgroundColor!=='rgba(0, 0, 0, 0)';return styled?R():'unstyled';`, '30');
    await check('file-relative-links', `${FILE_ROOT}/tools/percentage-calculator/index.html`, `return document.querySelector('.site-header .brand').getAttribute('href')+'|'+StudentHub.toolUrl('quiz-maker')+'|'+StudentHub.homeUrl('#all-tools');`, '../../index.html|../../tools/quiz-maker/index.html|../../index.html#all-tools');

    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await check('mobile-homepage-no-overflow', '/', `return 'overflow:'+(document.documentElement.scrollWidth>window.innerWidth+1);`, 'overflow:false');
    await check('mobile-tool-no-overflow', '/tools/marks-calculator/', `return 'overflow:'+(document.documentElement.scrollWidth>window.innerWidth+1);`, 'overflow:false');

    // Sweep every generated page at phone width: no page may widen the viewport.
    const sweep = ['/', '/about/', '/contact/', '/privacy-policy/', '/terms/', '/offline/', '/404/', '/workspace/',
      '/articles/study-tips/', '/articles/active-recall/', '/articles/spaced-repetition/', '/articles/exam-preparation/',
      ...Object.keys(TOOL_TESTS).map(id => `/tools/${id}/`)];
    const overflowing = [];
    for (const route of sweep) {
      await send('Page.navigate', { url: BASE + route + (route.indexOf('?') === -1 ? '?noads=1' : '&noads=1') });
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
