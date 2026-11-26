'use strict';
/* Static page generator. Run with: node scripts/generate.js
   Produces real, crawlable HTML files with unique metadata and content. */
const fs = require('fs');
const path = require('path');
const { icon, f, faq } = require('./helpers');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://studenthub-2gs.pages.dev';
/* Advertising tags. They are written into the HTML at build time, not injected
   after load: the 468x60 tag calls document.write, which only works while the
   document is still parsing. Set enabled to false to remove every placement. */
const ADS = {
  enabled: true,
  popunder: 'https://afders.org/1/3c0e12112693371a49e8da1ecaf03499',
  smartlink: 'https://arwf.org/4/f9c719598061c9d7137f077570fe38b1',
  native: 'https://bicea.org/21/9b5ea66616f3e02be4f9a4fe968d7547',
  nativeContainer: 'container-9b5ea66616f3e02be4f9a4fe968d7547',
  social: 'https://bicea.org/14/3d7fa5667db565ec11331c4b0846ee9b',
  bannerKey: '96d3c3868be22016392b6676ae58d572',
  banner: 'https://bicea.org/22/96d3c3868be22016392b6676ae58d572'
};
function headAds() {
  return `<script data-cfasync="false" src="${ADS.popunder}"></script>
<script data-cfasync="false" src="${ADS.social}"></script>`;
}
function nativeAd() {
  return `<script async fetchpriority="high" data-cfasync="false" src="${ADS.native}"></script>
<div id="${ADS.nativeContainer}"></div>`;
}
function bannerAd() {
  return `<div class="ad-unit-banner"><script>
  atOptions = {
    'key' : '${ADS.bannerKey}',
    'format' : 'iframe',
    'height' : 60,
    'width' : 468,
    'params' : {}
  };
</script>
<script data-cfasync="false" src="${ADS.banner}"></script></div>`;
}
function adSlot(kind, on) {
  if (!on) return `<div class="ad-slot" data-ad-slot="${kind}" hidden aria-label="Reserved advertisement placement">Advertisement</div>`;
  return `<div class="ad-slot ad-slot-active" data-ad-slot="${kind}" aria-label="Advertisement">${kind === 'home' ? bannerAd() : nativeAd()}</div>`;
}
function sponsoredLink(on) {
  return on ? `<span class="sponsored-links"><a href="${ADS.smartlink}" target="_blank" rel="sponsored noopener noreferrer">Sponsored</a> · </span>` : '';
}
const core = fs.readFileSync(path.join(ROOT, 'assets/js/core.js'), 'utf8');
const listText = core.match(/var TOOLS = (\[[\s\S]*?\n  \]);/);
if (!listText) throw new Error('Tool registry not found in core.js');
const TOOLS = new Function('return ' + listText[1])(); // trusted build-time source only
/* The Advanced hub is a curated, dashboard-first collection. These eight tools
   share the premium single-panel layout and cross-link through the hub filters. */
const ADVANCED_IDS = [
  'study-hours-tracker', 'spaced-revision-scheduler', 'grade-goal-planner', 'focus-streak-habits',
  'syllabus-coverage-tracker', 'exam-readiness-score', 'study-pace-forecaster', 'assignment-priority-matrix'
];

const content = Object.assign({},
  require('./content-academic'), require('./content-planning'),
  require('./content-learning'), require('./content-writing'), require('./content-utils'),
  require('./content-advanced'));

const generated = {};
/* Pages live at different depths (root, /about/, /tools/<id>/). Absolute site
   paths such as /assets/... only work at the domain root, so every generated
   page receives URLs relative to its own folder. This also makes the site work
   when index.html files are opened directly from disk (file://). */
function baseFor(rel) {
  const dir = path.posix.dirname(rel.replace(/\\/g, '/'));
  if (dir === '.' || dir === '/') return '';
  return '../'.repeat(dir.split('/').filter(Boolean).length);
}
function relativize(text, rel) {
  const base = baseFor(rel);
  let out = text.replace(/(href|src)="(\/[^"]*)"/g, function (_, attr, url) {
    let target;
    if (url === '/') target = base + 'index.html';
    else if (url.charAt(1) === '#') target = base + 'index.html' + url.slice(1);
    else if (url.slice(-1) === '/') target = base + url.slice(1) + 'index.html';
    else target = base + url.slice(1);
    return attr + '="' + target + '"';
  });
  out = out.replace(/<html([^>]*)>/, function (_, attrs) {
    return '<html' + attrs.replace(/\sdata-base="[^"]*"/, '') + ' data-base="' + base + '">';
  });
  return out;
}
function write(rel, text) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  generated[rel] = text;
  fs.writeFileSync(full, rel.endsWith('.html') ? relativize(text, rel) : text, 'utf8');
}
function jsonLd(obj) {
  return `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
}
function head(opts) {
  const canonical = SITE + opts.path;
  const ld = opts.ld ? jsonLd(opts.ld) : '';
  return `<!doctype html>
<html lang="en" data-theme="light" data-theme-preference="auto">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${opts.title}</title>
<meta name="description" content="${opts.desc}">
${opts.robots ? `<meta name="robots" content="${opts.robots}">` : ''}
<link rel="canonical" href="${canonical}">
<meta name="google-site-verification" content="WPy7or4AwCbkixtA55pqg55hMDhLUFs1vPnR8EgH-rA" />
<meta name="msvalidate.01" content="E6A421577F1424D7259F8EE6AA3E0786" />
<meta name="theme-color" content="#f5f8ff">
<script>(function(){var d=document.documentElement,p='auto',m=d.getAttribute('data-theme-preference');try{var r=localStorage.getItem('studenthub:theme');if(r!==null){var v=JSON.parse(r);if(v==='light'||v==='dark'||v==='auto')p=v;}else if(m==='light'||m==='dark'||m==='auto')p=m;}catch(e){}var dark=p==='dark'||(p==='auto'&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);d.setAttribute('data-theme',dark?'dark':'light');d.setAttribute('data-theme-preference',p);var t=document.querySelector('meta[name="theme-color"]');if(t)t.setAttribute('content',dark?'#07101f':'#f5f8ff');})();</script>
<meta property="og:type" content="website">
<meta property="og:site_name" content="StudentHub">
<meta property="og:title" content="${opts.title}">
<meta property="og:description" content="${opts.desc}">
<meta property="og:url" content="${canonical}">
<script>(function(){if(location.protocol==='file:')return;var l=document.createElement('link');l.rel='manifest';l.href=(document.documentElement.getAttribute('data-base')||'')+'manifest.webmanifest';document.head.appendChild(l);})();</script>
<link rel="icon" href="/assets/icons/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/css/themes.css">
<link rel="stylesheet" href="/assets/css/main.css">
<link rel="stylesheet" href="/assets/css/components.css">
<link rel="stylesheet" href="/assets/css/responsive.css">
${ADS.enabled ? `<script>(function(){window.addEventListener('error',function(e){var t=e.target;if(t&&t.tagName==='SCRIPT'&&/afders\\.org|bicea\\.org/.test(t.src||''))document.documentElement.setAttribute('data-ad-blocked','1');},true);})();</script>
${headAds()}` : ''}
${ld}
</head>`;
}
const brand = `<a class="brand" href="/" aria-label="StudentHub home"><span class="brand-mark">${icon('book', 21)}</span><span>Student<span class="accent">Hub</span></span></a>`;
const themeSwitch = `<div class="theme-switch" role="group" aria-label="Colour theme">
      <button class="theme-option" type="button" data-theme-option="light" aria-pressed="false" aria-label="Light theme" title="Light theme">${icon('sun', 16)}</button>
      <button class="theme-option" type="button" data-theme-option="dark" aria-pressed="false" aria-label="Dark theme" title="Dark theme">${icon('moon', 16)}</button>
      <button class="theme-option" type="button" data-theme-option="auto" aria-pressed="true" aria-label="Auto theme (follows device)" title="Auto theme">${icon('auto', 16)}</button>
    </div>`;
function header() {
  return `<header class="site-header"><div class="container header-inner">
    ${brand}
    <button class="icon-button menu-toggle" type="button" data-menu-toggle aria-expanded="false" aria-controls="primary-navigation" aria-label="Open navigation">${icon('menu', 20)}</button>
    <nav id="primary-navigation" aria-label="Primary navigation"><ul class="nav-list">
      <li><a href="/">Home</a></li>
      <li><a href="/#all-tools">All tools</a></li>
      <li><a href="/advanced/">Advanced</a></li>
      <li><a href="/#categories">Categories</a></li>
      <li><a href="/workspace/">My workspace</a></li>
      <li><a href="/#articles">Articles</a></li>
      <li><a href="/about/">About</a></li>
    </ul></nav>
    <div class="header-actions">
      <span class="header-chip">${TOOLS.length} tools · 100% free</span>
      ${themeSwitch}
    </div>
  </div></header>`;
}
function footer(adsOn) {
  return `<footer class="site-footer"><div class="container">
    <div class="footer-grid">
      <div class="footer-brand"><a class="brand" href="/">${brand.replace(/<a[^>]*>|<\/a>/g, '')}</a><p>Free, private study tools that work in your browser. No account, no subscription. Adverts help keep it free.</p></div>
      <div><h3>Tools</h3><ul><li><a href="/tools/percentage-calculator/">Calculators</a></li><li><a href="/tools/pomodoro-timer/">Study planning</a></li><li><a href="/tools/flashcard-maker/">Learning tools</a></li><li><a href="/tools/word-counter/">Writing tools</a></li></ul></div>
      <div><h3>Learn</h3><ul><li><a href="/articles/study-tips/">Study tips</a></li><li><a href="/articles/active-recall/">Active recall</a></li><li><a href="/articles/spaced-repetition/">Spaced repetition</a></li><li><a href="/articles/exam-preparation/">Exam preparation</a></li></ul></div>
      <div><h3>StudentHub</h3><ul><li><a href="/about/">About</a></li><li><a href="/contact/">Contact</a></li><li><a href="/privacy-policy/">Privacy policy</a></li><li><a href="/terms/">Terms</a></li></ul></div>
    </div>
    <div class="footer-bottom">${sponsoredLink(adsOn)}<span>© <span data-current-year>2026</span> StudentHub. All tools run locally in your browser.</span><span><a href="/sitemap.xml">Sitemap</a> · Built for students, everywhere.</span></div>
  </div></footer>`;
}
function scripts(extra) {
  const base = ['core', 'storage', 'calculations', 'theme', 'navigation', 'search', 'tool-base', 'pwa', 'ads', 'app'];
  return base.map(n => `<script src="/assets/js/${n}.js" defer></script>`).join('\n') + '\n' + (extra || '');
}
function shell(opts) {
  /* Advertising is always on: every generated page gets the same static head
     tags, sponsored footer link and at least one visible slot. */
  return head(opts) + `\n<body${opts.bodyAttrs ? ' ' + opts.bodyAttrs : ''}>
<a class="skip-link" href="#main">Skip to main content</a>
${header()}
<div id="offline-indicator" class="offline-indicator" hidden role="status">You are offline. Saved tools and your local data still work.</div>
${opts.body}
${footer(ADS.enabled)}
${scripts(opts.scripts)}
</body>\n</html>\n`;
}
function toolCard(t) {
  const c = content[t.id];
  return `<article class="tool-card"><div class="card-icon">${icon(c && c.icon ? c.icon : 'calculator', 20)}</div><h3><a href="/tools/${t.id}/">${t.name}</a></h3><p>${t.desc}</p><span class="card-link">Open tool →</span></article>`;
}
function advancedCard(id, index) {
  const t = TOOLS.find(x => x.id === id);
  const c = content[id];
  return `<article class="advanced-card" data-advanced-category="${t.category}" data-tool-id="${id}">
    <div class="advanced-card-top"><span class="advanced-card-icon">${icon(c && c.icon ? c.icon : 'spark', 22)}</span><span class="advanced-index">${String(index + 1).padStart(2, '0')}</span></div>
    <span class="advanced-kicker">${t.category}</span>
    <h3><a href="/tools/${id}/">${t.name}</a></h3>
    <p>${t.desc}</p>
    <a class="advanced-card-link" href="/tools/${id}/">Open dashboard <span aria-hidden="true">→</span></a>
  </article>`;
}
function relatedSection(id) {
  const same = TOOLS.filter(t => t.id !== id);
  const current = TOOLS.find(t => t.id === id);
  const picks = same.filter(t => t.category === current.category).concat(same.filter(t => t.category !== current.category)).slice(0, 4);
  return `<section class="section" aria-labelledby="related-heading"><div class="container"><div class="section-head"><span class="eyebrow">Keep learning</span><h2 id="related-heading">Related tools</h2><p>More free tools students use alongside this one.</p></div><div class="grid tool-grid">${picks.map(toolCard).join('')}</div></div></section>`;
}
function toolPage(t) {
  const c = content[t.id];
  if (!c) throw new Error('Missing content for ' + t.id);
  const url = `/tools/${t.id}/`;
  const advanced = ADVANCED_IDS.indexOf(t.id) !== -1;
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: t.category, item: SITE + '/#categories' },
      ...(advanced ? [{ '@type': 'ListItem', position: 3, name: 'Advanced tools', item: SITE + '/advanced/' }] : []),
      { '@type': 'ListItem', position: advanced ? 4 : 3, name: t.name, item: SITE + url }
    ]
  };
  const body = `<main id="main" data-page="tool" data-tool-id="${t.id}"${advanced ? ' data-advanced="true"' : ''}>
  <nav class="breadcrumbs container" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li>${advanced ? '<li><a href="/advanced/">Advanced</a></li>' : ''}<li><a href="/#categories">${t.category}</a></li><li aria-current="page">${t.name}</li></ol></nav>
  <section class="page-hero container${advanced ? ' advanced-hero' : ''}">
    <div class="page-hero-head"><div><span class="eyebrow">${advanced ? 'Advanced dashboard' : t.category}</span><h1>${c.h1}</h1><p>${c.intro}</p></div>
      <div class="btn-row"><button class="btn btn-secondary btn-small" type="button" data-favorite aria-pressed="false">${icon('star', 16)} <span data-favorite-label>Save</span></button><button class="btn btn-secondary btn-small" type="button" data-print>${icon('print', 16)} Print</button></div>
    </div>
    ${adSlot('tool', ADS.enabled)}
  </section>
  <section class="section" style="padding-top:.5rem"><div class="container tool-layout${advanced ? ' tool-layout-single' : ''}">
    <div class="card tool-panel${advanced ? ' advanced-panel' : ''}"><h2>Use the tool</h2><form id="${t.id}-form" novalidate>${c.form}</form></div>
    <aside class="card tool-panel output-panel" aria-labelledby="result-heading"><h2 id="result-heading">Results</h2><div id="result" data-autoscroll="false" aria-live="polite" aria-atomic="true"><div class="empty-state">${icon('chart', 28)}<strong>Your results appear here</strong><span>Fill in the fields and choose the calculate button.</span></div></div></aside>
  </div></section>
  <section class="section section-soft"><div class="container prose">
    <h2>How the calculation works</h2>${c.formula}
    <h2>Worked example</h2>${c.example}
    <h2>How to use this page</h2><ol>${c.steps.map(s => `<li>${s}</li>`).join('')}</ol>
    <div class="notice">${icon('shield', 18)} Everything on this page runs in your browser. Your entries are not uploaded or stored on a server.</div>
  </div></section>
  ${relatedSection(t.id)}
  <section class="section section-soft"><div class="container prose"><h2>Frequently asked questions</h2>${faq(c.faq)}</div></section>
</main>`;
  return shell({
    title: `${c.seoTitle} | StudentHub`, desc: c.desc, path: url, ld: breadcrumb,
    bodyAttrs: `data-page="tool" data-tool-id="${t.id}"${advanced ? ' data-advanced="true"' : ''}`, body,
    scripts: `<script src="/tools/${t.id}/tool.js" defer></script>`
  });
}

function homepage() {
  const featured = ['study-hours-tracker', 'spaced-revision-scheduler', 'grade-goal-planner', 'focus-streak-habits', 'percentage-calculator', 'cgpa-calculator', 'attendance-calculator', 'pomodoro-timer'];
  const popular = ['gpa-calculator', 'grade-calculator', 'marks-calculator', 'exam-score-predictor', 'exam-countdown', 'study-tracker', 'quiz-maker', 'unit-converter'];
  const find = id => TOOLS.find(t => t.id === id);
  const cats = [
    ['Academic Calculators', 'calculator', 'Turn marks and grades into answers you can trust.'],
    ['Study Planning', 'calendar', 'Plan hours, deadlines and focus sessions.'],
    ['Learning Tools', 'book', 'Practice actively with cards, quizzes and notes.'],
    ['Writing Tools', 'pencil', 'Check length, style and basic references.'],
    ['Student Utilities', 'chart', 'Dates, ages and everyday unit conversions.']
  ];
  const articles = [
    ['study-tips', 'Ten study habits that actually save time', 'Practical, low-effort habits you can try this week.'],
    ['active-recall', 'Active recall: a simple guide for students', 'Why testing yourself beats rereading, and how to start.'],
    ['spaced-repetition', 'Spaced repetition without complicated apps', 'A straightforward schedule you can keep by hand.'],
    ['exam-preparation', 'A calm exam preparation checklist', 'What to do in the final week, day and hour.']
  ];
  const homeLd = {
    '@context': 'https://schema.org', '@type': 'WebSite', name: 'StudentHub',
    url: SITE + '/', description: 'Free browser-based study tools, calculators and planners for students.',
    potentialAction: { '@type': 'SearchAction', target: SITE + '/#{search_term_string}', 'query-input': 'required name=search_term_string' }
  };
  const body = `<main id="main">
  <section class="hero"><div class="container hero-grid">
    <div class="animate-in">
      <span class="eyebrow">${icon('star', 15)} Free tools · Private by design</span>
      <h1>Study smarter.<br><span class="gradient">Achieve more.</span></h1>
      <p class="hero-sub">${TOOLS.length} genuinely useful study tools in one fast, private place. Calculate grades, plan revision, track your hours and check your writing — no account or subscription needed.</p>
      <div data-search class="search-wrap" style="margin-top:1.8rem">
        <form class="search-box" data-search-form role="search"><label class="visually-hidden" for="home-search">Search all tools</label>${icon('search', 20)}<input id="home-search" data-search-input type="search" autocomplete="off" placeholder="Search ${TOOLS.length} tools — try ‘attendance’ or ‘hours’" aria-autocomplete="list" aria-controls="home-search-results" aria-expanded="true"><button class="btn btn-primary btn-small" type="submit">Search</button></form>
        <div class="search-results" id="home-search-results" data-search-results role="listbox" aria-label="Tool search results"></div>
      </div>
      <ul class="hero-points"><li>${icon('check', 16)} Works offline</li><li>${icon('check', 16)} No sign-up</li><li>${icon('check', 16)} Your data stays local</li></ul>
      <div class="btn-row" style="margin-top:1.6rem"><a class="btn btn-primary" href="#all-tools">Explore all tools ${icon('arrow', 16)}</a><a class="btn btn-secondary" href="/advanced/">Open advanced dashboards</a></div>
    </div>
    <div class="hero-visual animate-in"><div class="hero-panel">
      <div class="hero-panel-head"><span>WEEKLY STUDY SNAPSHOT</span><span>Private · on this device</span></div>
      <div class="mini-bars" aria-hidden="true"><span style="height:40%"></span><span style="height:65%"></span><span style="height:50%"></span><span style="height:85%"></span><span style="height:70%"></span><span style="height:35%"></span><span style="height:20%"></span></div>
      <div class="mini-stats"><div class="mini-stat"><strong>12.5h</strong><span>Studied this week</span></div><div class="mini-stat"><strong>8</strong><span>Sessions logged</span></div><div class="mini-stat"><strong>4</strong><span>Subjects tracked</span></div></div>
    </div><div class="float-card">${icon('shield', 20)} Your notes stay on your device</div></div>
  </div></section>

  <section class="section advanced-showcase" aria-labelledby="advanced-home-heading"><div class="container">
    <div class="section-head advanced-showcase-head"><div><span class="eyebrow">${icon('spark', 15)} Premium study intelligence</span><h2 id="advanced-home-heading">Advanced dashboards</h2><p>Turn your saved study data into clear scores, forecasts and next actions.</p></div><a class="btn btn-primary btn-small" href="/advanced/">View all advanced tools ${icon('arrow', 15)}</a></div>
    <div class="advanced-card-grid advanced-preview">${ADVANCED_IDS.slice(0, 4).map((id, i) => advancedCard(id, i)).join('')}</div>
  </div></section>

  <section class="section section-soft" aria-labelledby="featured-heading"><div class="container"><div class="section-head"><span class="eyebrow">Start here</span><h2 id="featured-heading">Featured tools</h2><p>The tools students open most often, ready to use without setup.</p></div><div class="grid tool-grid">${featured.map(id => toolCard(find(id))).join('')}</div></div></section>

  <div class="container">${adSlot('home-native', ADS.enabled)}</div>

  <section class="section" id="categories" aria-labelledby="categories-heading"><div class="container"><div class="section-head"><span class="eyebrow">Browse by need</span><h2 id="categories-heading">Every category, one place</h2><p>Find the right tool in seconds, whatever you are working on.</p></div><div class="grid category-grid">${cats.map(([name, ico, desc]) => `<article class="category-card"><div class="card-icon">${icon(ico, 20)}</div><h3>${name}</h3><p>${desc}</p><span class="category-count">${TOOLS.filter(t => t.category === name).length} free tools</span><a class="card-link" href="#all-tools">Browse tools →</a></article>`).join('')}</div></div></section>

  <section class="section section-soft" id="all-tools" aria-labelledby="all-heading"><div class="container"><div class="section-head"><span class="eyebrow">The full library</span><h2 id="all-heading">All ${TOOLS.length} tools</h2><p>Every tool has its own page with instructions, formulas and examples.</p></div><div class="grid tool-grid">${TOOLS.map(toolCard).join('')}</div></div></section>

  <section class="section" aria-labelledby="recent-heading"><div class="container"><div class="section-head"><span class="eyebrow">Pick up where you left off</span><h2 id="recent-heading">Recently used tools</h2><p>Saved on this device only.</p></div><div id="recent-tools" class="grid tool-grid"><div class="empty-state"><strong>Nothing here yet</strong><span>Open a tool and it will appear here on your next visit.</span></div></div></div></section>

  <section class="section section-soft" aria-labelledby="popular-heading"><div class="container"><div class="section-head"><span class="eyebrow">Worth a look</span><h2 id="popular-heading">Popular tools</h2><p>Good next steps once you have the basics covered.</p></div><div class="grid tool-grid">${popular.map(id => toolCard(find(id))).join('')}</div></div></section>

  <section class="section" aria-labelledby="tips-heading"><div class="container"><div class="section-head"><span class="eyebrow">Better habits</span><h2 id="tips-heading">Study productivity tips</h2><p>Small changes that make revision easier to keep up.</p></div><div class="grid grid-3">
    <article class="tip-card"><div class="card-icon">${icon('clock', 20)}</div><h3>Use short, defined sessions</h3><p>Work for 25 minutes, then take a five-minute break. A clear end point makes it easier to start.</p><a class="card-link" href="/tools/pomodoro-timer/">Try the Pomodoro Timer →</a></article>
    <article class="tip-card"><div class="card-icon">${icon('book', 20)}</div><h3>Test yourself before rereading</h3><p>Close your notes and recall what you can first. Checking afterwards shows what really needs work.</p><a class="card-link" href="/articles/active-recall/">Read the guide →</a></article>
    <article class="tip-card"><div class="card-icon">${icon('chart', 20)}</div><h3>Look at patterns, not one day</h3><p>A single missed session means little. A weekly view shows whether your routine is realistic.</p><a class="card-link" href="/tools/study-tracker/">Open Study Tracker →</a></article>
  </div></div></section>

  <section class="section section-soft" id="articles" aria-labelledby="articles-heading"><div class="container"><div class="section-head"><span class="eyebrow">Guides</span><h2 id="articles-heading">Helpful educational articles</h2><p>Short, practical reading — no paid content or pop-ups.</p></div><div class="grid grid-2">${articles.map(([slug, title, desc]) => `<article class="article-card"><div class="card-icon">${icon('pencil', 20)}</div><h3><a href="/articles/${slug}/">${title}</a></h3><p>${desc}</p><span class="card-link">Read guide →</span></article>`).join('')}</div></div></section>

  <div class="container">${adSlot('home', ADS.enabled)}</div>

  <section class="section" aria-labelledby="faq-heading"><div class="container prose"><h2 id="faq-heading">Frequently asked questions</h2>${faq([
    ['Is StudentHub really free?', 'Yes. All tools are free to use, with no subscription and no paid API. The project is built with plain HTML, CSS and JavaScript.'],
    ['Do I need an account?', 'No. Everything works without signing in. Your notes, cards and progress are stored on your own device.'],
    ['Can I use StudentHub offline?', 'Yes. After a first visit, the app shell and tool pages are cached by the service worker so you can open them offline.'],
    ['Where is my data stored?', 'Small preferences are kept in LocalStorage and larger collections in IndexedDB on your device. StudentHub itself does not upload them. Third-party ad scripts may collect standard browser information as described in the privacy policy.'],
    ['Can I use these tools for school submissions?', 'You can use the results as a guide, but always follow your institution’s rules and verify official grades and references.']
  ])}</div></section>
</main>`;
  return shell({
    title: 'StudentHub — Free Study Tools, Calculators and Planners',
    desc: `${TOOLS.length} free, private study tools: GPA and grade planners, attendance tracker, study timer, revision scheduler, flashcards, quizzes, word counter and more.`,
    path: '/', ld: homeLd, body,
    scripts: `<script src="/assets/js/home.js" defer></script>`
  });
}

const articleData = {
  'study-tips': {
    title: 'Ten Study Habits That Actually Save Time',
    desc: 'Practical study habits you can start this week: plan small sessions, test yourself, review mistakes and protect breaks.',
    intro: 'Better studying is usually about consistency, not heroic all-night sessions. These ten habits are simple enough to keep doing and work across most subjects.',
    sections: [
      ['Plan the next session before you stop', 'Write down the exact topic and the first action. Starting is much easier when the decision has already been made.'],
      ['Use a fixed study window', 'The same time each day reduces the effort of deciding when to study. Even 30 minutes helps if it is repeatable.'],
      ['Test yourself first', 'Try to recall an idea before checking your notes. The mistake you make while recalling is useful information.'],
      ['Keep a mistake log', 'Write down why you got an answer wrong, not just the right answer. Review the log before tests.'],
      ['Break large topics into questions', '“Learn thermodynamics” is vague. “Explain the first law in my own words” is a task you can finish.'],
      ['Take short, real breaks', 'Stand up, move, or look away from screens. A break spent scrolling is often not a break.'],
      ['Study with a deadline in mind', 'Use past papers or a timer to practise finishing under time pressure.'],
      ['Teach the idea aloud', 'If you cannot explain it simply, you have found the part that needs another pass.'],
      ['Review on a schedule', 'Revisit material after a day, then a few days, then a week. The interval can grow as recall gets easier.'],
      ['Track effort, not just scores', 'A study log shows the habits you controlled. Scores are the outcome, not the only useful signal.']
    ]
  },
  'active-recall': {
    title: 'Active Recall: A Simple Guide for Students',
    desc: 'What active recall is, why it works better than rereading, and how to build a short recall routine with flashcards.',
    intro: 'Active recall means trying to bring information back from memory before looking at the answer. It feels harder than rereading, which is exactly why it is useful.',
    sections: [
      ['Why rereading feels productive', 'Familiar text is easy to process, so it creates a feeling of knowing. That feeling is not the same as being able to answer a question without help.'],
      ['A basic routine', 'Read a small section, close the book, write or say everything you remember, then reopen and compare. Mark what you missed.'],
      ['Turn notes into questions', 'A heading like “Causes of osmosis” becomes “What are three causes of osmosis?” Question cards are more useful than definition cards alone.'],
      ['Use flashcards carefully', 'Keep cards short and answer one question each. If a card is always easy, set it aside; if it is always difficult, rewrite it more simply.'],
      ['Combine with explanations', 'Recall gets the answer out. Explaining why it is correct reveals gaps in understanding.']
    ]
  },
  'spaced-repetition': {
    title: 'Spaced Repetition Without Complicated Apps',
    desc: 'A simple review schedule you can keep with paper or flashcards, and how to adjust intervals when recall is hard.',
    intro: 'Spaced repetition means reviewing material at increasing intervals. You do not need a complex app to use the idea effectively.',
    sections: [
      ['The basic schedule', 'Review new material after one day, then after three days, one week, two weeks and one month. Shorten an interval if recall fails.'],
      ['How to decide when to shorten', 'If you needed more than a few seconds or got the answer wrong, move the card back to tomorrow. If recall was instant, lengthen the gap.'],
      ['Keep the queue small', 'A short daily queue is easier to finish than a large weekly backlog. Ten to twenty cards is often enough.'],
      ['Mix topics', 'Interleaving related topics helps you tell similar ideas apart, which is useful in subjects like biology or law.'],
      ['Where StudentHub fits', 'The Flashcard Maker lets you mark cards known or difficult. Use those labels to decide which cards to review first.']
    ]
  },
  'exam-preparation': {
    title: 'A Calm Exam Preparation Checklist',
    desc: 'A practical checklist for the week, day and hour before an exam, focused on sleep, review and logistics.',
    intro: 'The final stretch is not the time to learn everything from scratch. Use it to consolidate, check logistics and protect your sleep.',
    sections: [
      ['One week before', 'List exam topics, mark confident and weak areas, and complete at least one timed past paper under realistic conditions.'],
      ['Three days before', 'Review your mistake log and the topics you avoided. Ask a teacher or classmate about anything still unclear.'],
      ['The day before', 'Do a light review, pack your materials, check the route and start time, and stop studying early enough to sleep well.'],
      ['The morning of the exam', 'Eat something you tolerate well, arrive early, and spend the first minutes reading every question before choosing where to start.'],
      ['During the exam', 'Answer the questions you know first, keep an eye on time, and leave a few minutes to check names, numbers and unanswered parts.']
    ]
  }
};
function articlePage(slug, a) {
  const body = `<main id="main">
  <nav class="breadcrumbs container" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/#articles">Articles</a></li><li aria-current="page">${a.title}</li></ol></nav>
  <section class="page-hero container"><span class="eyebrow">Study guide</span><h1>${a.title}</h1><p>${a.intro}</p></section>
  <section class="section" style="padding-top:0"><div class="container tool-layout reversed">
    <article class="prose"><h2>What to do</h2>${a.sections.map(([h, p]) => `<h3>${h}</h3><p>${p}</p>`).join('')}
      <div class="notice">These are general study suggestions, not official exam regulations. Follow your institution’s guidance for exams and assessments.</div>
      <h2>Related tools</h2><div class="chip-list"><a href="/tools/study-timetable-maker/">Study Timetable Maker</a><a href="/tools/flashcard-maker/">Flashcard Maker</a><a href="/tools/pomodoro-timer/">Pomodoro Timer</a><a href="/tools/exam-countdown/">Exam Countdown</a></div>
    </article>
    <aside class="card"><h2>Try a related tool</h2><p>Use the plan below to turn advice into action.</p><div class="grid">${['study-timetable-maker', 'flashcard-maker', 'pomodoro-timer'].map(id => toolCard(TOOLS.find(t => t.id === id))).join('')}</div>${adSlot('article', ADS.enabled)}</aside>
  </div></section>
</main>`;
  return shell({ title: `${a.title} | StudentHub`, desc: a.desc, path: `/articles/${slug}/`, body });
}

function advancedPage() {
  const stats = [
    [String(ADVANCED_IDS.length), 'Advanced dashboards'],
    ['100%', 'Calculated in your browser'],
    ['0', 'Accounts or subscriptions'],
    ['Live', 'Saved-data insights']
  ];
  const body = `<main id="main" data-page="advanced">
  <nav class="breadcrumbs container" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li aria-current="page">Advanced tools</li></ol></nav>
  <section class="advanced-hub-hero container">
    <div class="advanced-hero-copy">
      <span class="eyebrow">${icon('spark', 15)} Advanced workspace</span>
      <h1>Study intelligence, <span class="gradient">beautifully simple.</span></h1>
      <p>Eight focused dashboards that turn the study data already on your device into honest scores, clear forecasts and a practical next step. No account, no setup, no waiting.</p>
      <div class="btn-row"><a class="btn btn-primary" href="/tools/exam-readiness-score/">Check my readiness ${icon('arrow', 16)}</a><a class="btn btn-secondary" href="#advanced-grid">Browse dashboards</a></div>
    </div>
    <div class="advanced-hero-visual" aria-hidden="true">
      <div class="advanced-glow"></div>
      <div class="advanced-window">
        <div class="advanced-window-head"><span>READINESS OVERVIEW</span><span class="live-dot"></span></div>
        <div class="advanced-window-score"><strong>78<small>%</small></strong><span>On track</span></div>
        <div class="advanced-window-bars"><i style="height:48%"></i><i style="height:72%"></i><i style="height:58%"></i><i style="height:90%"></i><i style="height:66%"></i><i style="height:82%"></i><i style="height:94%"></i></div>
        <div class="advanced-window-foot"><span>Marks 90%</span><span>Coverage 60%</span><span>Revision 80%</span></div>
      </div>
      <div class="advanced-float">${icon('checkcircle', 18)} Calculated locally</div>
    </div>
  </section>
  <section class="container"><div class="advanced-stat-strip">${stats.map(([v, l]) => `<div class="advanced-stat"><strong>${v}</strong><span>${l}</span></div>`).join('')}</div></section>
  <section class="section" style="padding-top:.8rem"><div class="container">
    <div class="advanced-toolbar" role="region" aria-label="Advanced tool filters">
      <div class="advanced-filters" role="group" aria-label="Filter by category">
        <button class="advanced-filter is-active" type="button" data-advanced-filter="all" aria-pressed="true">All dashboards</button>
        <button class="advanced-filter" type="button" data-advanced-filter="study-planning" aria-pressed="false">Planning &amp; tracking</button>
        <button class="advanced-filter" type="button" data-advanced-filter="academic-calculators" aria-pressed="false">Scores &amp; analysis</button>
      </div>
      <label class="advanced-search">${icon('search', 17)}<span class="visually-hidden">Search advanced tools</span><input id="advanced-search" type="search" placeholder="Search 8 dashboards" autocomplete="off"></label>
    </div>
    <p class="advanced-status" id="advanced-status" role="status" aria-live="polite">Loading advanced dashboards…</p>
    <div class="advanced-skeleton-grid" id="advanced-skeleton" aria-hidden="true">${[0, 1, 2, 3].map(() => `<div class="advanced-skeleton-card"><i></i><i></i><i></i><i></i></div>`).join('')}</div>
    <div class="advanced-card-grid" id="advanced-grid">${ADVANCED_IDS.map((id, i) => advancedCard(id, i)).join('')}</div>
    <div class="empty-state" id="advanced-empty" hidden><strong>No dashboards match that search</strong><span>Try a different word or choose All dashboards.</span></div>
  </div></section>
  <div class="container">${adSlot('advanced', ADS.enabled)}</div>
  <section class="section section-soft" aria-labelledby="advanced-flow-heading"><div class="container">
    <div class="section-head"><span class="eyebrow">Connected workflow</span><h2 id="advanced-flow-heading">Use them together</h2><p>Each dashboard is useful alone. Together they form a simple study loop.</p></div>
    <div class="advanced-flow">
      <a class="advanced-flow-step" href="/tools/syllabus-coverage-tracker/"><span>01</span><strong>Map the syllabus</strong><em>Mark what is done, in progress or weak.</em></a>
      <a class="advanced-flow-step" href="/tools/spaced-revision-scheduler/"><span>02</span><strong>Schedule reviews</strong><em>Turn weak topics into a spaced plan.</em></a>
      <a class="advanced-flow-step" href="/tools/exam-readiness-score/"><span>03</span><strong>Measure readiness</strong><em>Combine four signals into one score.</em></a>
      <a class="advanced-flow-step" href="/tools/study-pace-forecaster/"><span>04</span><strong>Forecast the finish</strong><em>See the daily hours your deadline needs.</em></a>
    </div>
  </div></section>
  <section class="section" aria-labelledby="advanced-faq-heading"><div class="container prose">
    <h2 id="advanced-faq-heading">Advanced tool questions</h2>
    ${faq([
      ['Do advanced tools need an account?', 'No. Every dashboard runs in your browser, and any saved data stays in LocalStorage or IndexedDB on this device.'],
      ['Will these tools work offline?', 'Yes. After the first visit the advanced hub and its tool pages are cached by the service worker for offline use.'],
      ['Are the scores official predictions?', 'No. They are planning signals based on the information you enter or save locally. Always confirm official results with your institution.'],
      ['Can I use all eight dashboards for free?', 'Yes. All advanced tools are free, with no subscription, paid API or hidden upgrade.']
    ])}
  </div></section>
</main>`;
  return shell({
    title: 'Advanced Study Tools & Dashboards | StudentHub',
    desc: 'Explore eight advanced StudentHub dashboards for readiness scores, syllabus coverage, study pace, focus streaks and workload planning.',
    path: '/advanced/', body,
    scripts: '<script src="/assets/js/advanced.js" defer></script>'
  });
}
function staticPage(opts) {
  /* Static pages have no built-in slot in their body. Add the same native
     placement used by tools and articles so every generated page has ads. */
  const body = opts.body.includes('data-ad-slot')
    ? opts.body
    : `${opts.body}\n<div class="container">${adSlot('page', ADS.enabled)}</div>`;
  return shell(Object.assign({}, opts, { body }));
}

// Build tool pages
TOOLS.forEach(t => write(`tools/${t.id}/index.html`, toolPage(t)));
write('index.html', homepage());
write('advanced.html', advancedPage());
Object.keys(articleData).forEach(slug => write(`articles/${slug}/index.html`, articlePage(slug, articleData[slug])));

const privacyBody = `<main id="main"><nav class="breadcrumbs container" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li aria-current="page">Privacy policy</li></ol></nav>
<section class="page-hero container"><span class="eyebrow">Your data</span><h1>Privacy Policy</h1><p>StudentHub is designed so that your study data stays on your device. This page explains exactly what is stored and what is not.</p></section>
<section class="section" style="padding-top:0"><div class="container prose">
<h2>What StudentHub does not collect</h2><p>StudentHub has no account system, no analytics service of its own and no server that receives your tool inputs, notes, flashcards, schedules or study logs. We do not sell your personal information.</p>
<h2>What is stored on your device</h2><ul><li><strong>LocalStorage:</strong> your theme choice, favourite tools, recently used tools and recent searches.</li><li><strong>IndexedDB:</strong> collections you create, such as notes, flashcards, quizzes, questions, vocabulary, timetables, tasks, sessions and exams.</li></ul><p>This data remains in your browser until you clear it. You can remove it from the <a href="/workspace/">Workspace page</a>.</p>
<h2>Service worker caches</h2><p>The service worker caches public app files such as HTML pages, CSS and JavaScript so the site works offline. It does not cache your private notes or other collection data into a shared cache.</p>
<h2>Advertising and third parties</h2><p>To keep StudentHub free, every generated page — home, tools, articles, About, Terms, Privacy, Contact, Workspace, offline and error pages — loads ad scripts from the same third-party networks: <code>afders.org</code> (pop-under), <code>arwf.org</code> (sponsored link) and <code>bicea.org</code> (native banner, social bar and display banner). These providers may set cookies or similar identifiers, record page views and measure ad impressions under their own privacy policies. A pop-under opens on every page view and a floating social bar may appear.</p><p>StudentHub also detects when those third-party scripts are blocked. In that case, or if a network returns no creative, it shows clearly labelled sponsored banners hosted on this site and a polite inline notice asking you to allow ads. These first-party banners are plain images linking to the sponsor; they do not set cookies, track you or receive your study data. There are no ad-free pages and no URL switch that hides the placements: advertising runs on every page view. You can still block the third-party domains with a browser extension; all tools will keep working, and the labelled first-party sponsored banner remains. There is no paid ad-free tier.</p>
<h2>Contact</h2><p>Use the <a href="/contact/">contact page</a> to get in touch. The page does not transmit your message to StudentHub automatically.</p>
<h2>Changes</h2><p>This policy may be updated as the project grows. The date below shows the last revision.</p><p class="field-hint">Last updated: 25 November 2026.</p>
</div></section></main>`;
write('privacy-policy.html', staticPage({ title: 'Privacy Policy | StudentHub', desc: 'How StudentHub handles data: no accounts, no analytics, no server uploads. Study data stays in your browser.', path: '/privacy-policy/', body: privacyBody }));

const termsBody = `<main id="main"><nav class="breadcrumbs container" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li aria-current="page">Terms of use</li></ol></nav>
<section class="page-hero container"><span class="eyebrow">Using the site</span><h1>Terms of Use</h1><p>Short, plain-language terms for a free browser-based study tool.</p></section>
<section class="section" style="padding-top:0"><div class="container prose">
<h2>Free to use</h2><p>StudentHub is provided free of charge for personal study and educational use. There is no subscription, and no account is required. Advertising from third-party networks funds the site; see the privacy policy for the domains involved.</p>
<h2>Results are guides, not official outcomes</h2><p>Calculators, predictors and citation output are based only on what you enter. They are not official grades, predictions guaranteed to happen, or verified bibliographic records. Always confirm results with your school, university or style guide.</p>
<h2>Your responsibilities</h2><p>Enter accurate information, keep backups of important notes, and do not use the tools for unlawful purposes. You are responsible for decisions you make using the results.</p>
<h2>Data and availability</h2><p>Data is stored locally on your device. We aim to keep the site available but provide no guarantee of uninterrupted service. Browser storage can be cleared by you or by device maintenance.</p>
<h2>Third-party advertisements</h2><p>Adverts are supplied by external networks and are not controlled by StudentHub. Clicking an advert takes you to a third-party site with its own terms and privacy practices. StudentHub is not responsible for the content of those sites or for advertiser claims.</p>
<h2>Changes</h2><p>Tools and these terms may change over time. Continued use after a change means you accept the updated terms.</p>
</div></section></main>`;
write('terms.html', staticPage({ title: 'Terms of Use | StudentHub', desc: 'Plain-language terms for using the free StudentHub study tools and understanding their limitations.', path: '/terms/', body: termsBody }));

const aboutBody = `<main id="main"><nav class="breadcrumbs container" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li aria-current="page">About</li></ol></nav>
<section class="page-hero container"><span class="eyebrow">About the project</span><h1>About StudentHub</h1><p>A free, independent study workspace built with plain web technologies and designed to work on ordinary phones and laptops.</p></section>
<section class="section" style="padding-top:0"><div class="container prose">
<h2>Why it exists</h2><p>Students often need a calculator, a planner and a place for revision notes, but end up juggling several sites that require accounts or subscriptions. StudentHub puts a focused set of tools in one place and keeps the data on the device.</p>
<h2>How it is built</h2><p>HTML5, modern CSS and vanilla JavaScript. Calculations happen locally. A service worker caches public files for offline use, and larger collections are stored in IndexedDB. There are no paid APIs and no external font service. The site's own code has no analytics; third-party ad scripts are disclosed in the privacy policy.</p>
<h2>What it is not</h2><p>StudentHub is not an official university system, an AI tutor, or a guarantee of academic results. It does not check the factual accuracy of your notes or citations.</p>
<h2>Privacy first</h2><p>There is no login and no server-side storage of your study material. Read the <a href="/privacy-policy/">privacy policy</a> for details.</p>
<h2>Get involved</h2><p>Bug reports and suggestions are welcome through the <a href="/contact/">contact page</a>.</p>
</div></section></main>`;
write('about.html', staticPage({ title: 'About StudentHub — Free, Private Study Tools', desc: 'Learn why StudentHub exists, how it is built with vanilla JavaScript and how it protects student privacy.', path: '/about/', body: aboutBody }));

const contactBody = `<main id="main"><nav class="breadcrumbs container" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li aria-current="page">Contact</li></ol></nav>
<section class="page-hero container"><span class="eyebrow">Get in touch</span><h1>Contact</h1><p>Found a bug or have a suggestion? Write a message below and open it in your own email app. StudentHub does not send or store the message.</p></section>
<section class="section" style="padding-top:0"><div class="container tool-layout">
<div class="card tool-panel"><form id="contact-form" novalidate>
  <div class="form-grid"><div class="field"><label for="ct-name">Your name</label><input id="ct-name" type="text" autocomplete="name"></div><div class="field"><label for="ct-email">Your email (optional)</label><input id="ct-email" type="email" autocomplete="email"></div></div>
  <div class="field" style="margin-top:1rem"><label for="ct-subject">Subject</label><input id="ct-subject" type="text" required></div>
  <div class="field" style="margin-top:1rem"><label for="ct-message">Message</label><textarea id="ct-message" rows="8" required></textarea></div>
  <div class="form-actions"><button class="btn btn-primary" type="submit">Open in email app</button><button class="btn btn-secondary" type="button" id="ct-copy">Copy message</button></div>
  <p class="field-hint" id="ct-status" role="status" aria-live="polite" style="margin-top:.7rem"></p>
</form></div>
<aside class="card"><h2>Privacy note</h2><p>This form builds an email in your own mail application. Nothing is submitted to a StudentHub server, and no copy is kept here.</p><div class="notice">Before publishing, set <code>StudentHub.config.contactEmail</code> in <code>/assets/js/config.js</code> to your own address.</div><h3>Other useful pages</h3><div class="chip-list"><a href="/about/">About</a><a href="/privacy-policy/">Privacy policy</a><a href="/terms/">Terms</a></div></aside>
</div></section></main>`;
write('contact.html', staticPage({ title: 'Contact StudentHub — Bug Reports and Suggestions', desc: 'Send feedback or report a problem. The contact form opens your own email app and does not transmit data to StudentHub.', path: '/contact/', body: contactBody, scripts: '<script src="/assets/js/config.js" defer></script>\n<script src="/assets/js/contact.js" defer></script>' }));

const workspaceBody = `<main id="main"><nav class="breadcrumbs container" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li aria-current="page">My workspace</li></ol></nav>
<section class="page-hero container"><span class="eyebrow">Local personal space</span><h1>My Workspace</h1><p>A private dashboard for your saved tools, study progress and local data. Everything here stays on this device.</p></section>
<section class="section" style="padding-top:0"><div class="container">
  <div class="stat-grid" id="ws-stats"></div>
  <div class="grid grid-2" style="margin-top:1.4rem">
    <div class="card"><h2>Favourite tools</h2><div id="ws-favorites"></div><h2 style="margin-top:1.4rem">Recently used</h2><div id="ws-recent"></div></div>
    <div class="card"><h2>Study progress</h2><div id="ws-progress"></div><h2 style="margin-top:1.4rem">Saved collections</h2><div id="ws-collections"></div></div>
  </div>
  <div class="card" style="margin-top:1.4rem"><h2>Your data</h2><p>Download a backup of your local data, restore one, or clear everything stored by StudentHub on this device.</p>
    <div class="btn-row"><button class="btn btn-primary btn-small" type="button" id="ws-export">${icon('download', 16)} Export all data</button><label class="btn btn-secondary btn-small" for="ws-import">${icon('upload', 16)} Import backup</label><input id="ws-import" type="file" accept="application/json,.json" class="visually-hidden"><button class="btn btn-danger btn-small" type="button" id="ws-clear">${icon('trash', 16)} Clear all personal data</button></div>
    <p class="field-hint" id="ws-status" role="status" aria-live="polite" style="margin-top:.8rem"></p>
  </div>
</div></section></main>`;
write('workspace.html', staticPage({ title: 'My Workspace — Private Study Dashboard | StudentHub', desc: 'View saved tools, study progress and local collections, and export, import or clear your StudentHub data.', path: '/workspace/', robots: 'noindex,follow', body: workspaceBody, scripts: '<script src="/assets/js/workspace.js" defer></script>' }));

const offlineBody = `<main id="main"><section class="page-hero container"><span class="eyebrow">Offline</span><h1>You are offline</h1><p>The page you requested is not available in this browser’s cache yet. Previously visited tools still work, and any data you saved locally is safe.</p><div class="btn-row"><a class="btn btn-primary" href="/">Go to the offline homepage</a><button class="btn btn-secondary" type="button" data-reload>Try again</button></div></section></main>`;
write('offline.html', staticPage({ title: 'Offline — StudentHub', desc: 'StudentHub offline fallback page.', path: '/offline/', robots: 'noindex', body: offlineBody }));

const notFoundBody = `<main id="main"><section class="page-hero container"><span class="eyebrow">404</span><h1>That page does not exist</h1><p>The link may be out of date, or the page may have moved. You can search all tools from the homepage or open the sitemap.</p><div data-search class="search-wrap" style="margin-top:1.2rem"><form class="search-box" data-search-form role="search"><label class="visually-hidden" for="404-search">Search tools</label>${icon('search', 20)}<input id="404-search" data-search-input type="search" placeholder="Search for a tool" aria-autocomplete="list" aria-controls="404-results" aria-expanded="true"><button class="btn btn-primary btn-small" type="submit">Search</button></form><div class="search-results" id="404-results" data-search-results role="listbox" aria-label="Tool search results"></div></div><div class="btn-row" style="margin-top:1.4rem"><a class="btn btn-primary" href="/">Back to StudentHub</a><a class="btn btn-secondary" href="/sitemap.xml">View sitemap</a></div></section></main>`;
write('404.html', staticPage({ title: 'Page Not Found (404) | StudentHub', desc: `The requested StudentHub page could not be found. Search the ${TOOLS.length} free tools instead.`, path: '/404/', robots: 'noindex', body: notFoundBody }));

// Pretty URLs work on any static host: /about/ and /about.html both resolve.
['about', 'contact', 'privacy-policy', 'terms', 'offline', '404', 'workspace', 'advanced'].forEach(function (name) {
  write(`${name}/index.html`, generated[`${name}.html`]);
});

// Sitemap
const urls = [
  ['/', '1.0', 'weekly'], ['/about/', '0.7', 'monthly'], ['/contact/', '0.5', 'monthly'],
  ['/privacy-policy/', '0.4', 'yearly'], ['/terms/', '0.4', 'yearly'],
  ['/advanced/', '0.9', 'weekly'],
  ...Object.keys(articleData).map(s => ['/articles/' + s + '/', '0.7', 'monthly']),
  ...TOOLS.map(t => ['/tools/' + t.id + '/', '0.9', 'monthly'])
];
const today = new Date().toISOString().slice(0, 10);
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([u, p, freq]) => `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod><changefreq>${freq}</changefreq><priority>${p}</priority></url>`).join('\n')}\n</urlset>\n`;
write('sitemap.xml', sitemapXml);
/* A second, identical sitemap path lets webmaster tools retry with a fresh URL
   if they cache a failed fetch of /sitemap.xml during deployment. */
write('sitemap-fallback.xml', sitemapXml);
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /workspace/\n\nSitemap: ${SITE}/sitemap.xml\nSitemap: ${SITE}/sitemap-fallback.xml\n`);

// Service worker with a content-derived version so deployments invalidate old caches.
const crypto = require('crypto');
const precache = [
  '/', '/offline/', '/404.html', '/about/', '/contact/', '/privacy-policy/', '/terms/', '/workspace/', '/advanced/',
  ...Object.keys(articleData).map(s => `/articles/${s}/`),
  ...TOOLS.map(t => `/tools/${t.id}/`),
  '/manifest.webmanifest', '/assets/icons/favicon.svg', '/assets/icons/icon-192.png', '/assets/icons/icon-512.png',
  ...['themes', 'main', 'components', 'responsive'].map(n => `/assets/css/${n}.css`),
  ...['core', 'storage', 'calculations', 'theme', 'navigation', 'search', 'tool-base', 'pwa', 'ads', 'app', 'home', 'config', 'contact', 'workspace', 'advanced'].map(n => `/assets/js/${n}.js`),
  ...['sponsored-blue.svg', 'sponsored-teal.svg', 'sponsored-violet.svg'].map(n => `/assets/ads/${n}`),
  ...TOOLS.map(t => `/tools/${t.id}/tool.js`)
];
/* Links now point at explicit index.html files so they work from disk too;
   cache those URLs as well, otherwise offline navigation would miss. */
precache.push(...precache.filter(u => u.endsWith('/')).map(u => u + 'index.html'));
const hash = crypto.createHash('sha256');
function localFile(u) {
  if (u.endsWith('/')) {
    const dir = u.slice(1);
    const asIndex = path.join(ROOT, dir, 'index.html');
    if (fs.existsSync(asIndex)) return asIndex;
    return path.join(ROOT, (dir || 'index').replace(/\/$/, '') + '.html');
  }
  return path.join(ROOT, u.slice(1));
}
precache.forEach(u => {
  const file = localFile(u);
  if (fs.existsSync(file) && fs.statSync(file).isFile()) hash.update(fs.readFileSync(file));
  hash.update(u);
});
const version = `studenthub-${hash.digest('hex').slice(0, 12)}`;
const sw = `/* Generated by scripts/generate.js. Cache version: ${version} */
var CACHE = '${version}';
var PRECACHE = ${JSON.stringify(precache, null, 2)};
self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) { return cache.addAll(PRECACHE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (event) {
  event.waitUntil(Promise.all([
    caches.keys().then(function (keys) { return Promise.all(keys.filter(function (k) { return k.indexOf('studenthub-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); })); }),
    self.clients.claim()
  ]));
});
self.addEventListener('message', function (event) { if (event.data === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); });
      return res;
    }).catch(function () { return caches.match(req).then(function (hit) { return hit || caches.match('/offline/'); }); }));
    return;
  }
  event.respondWith(caches.match(req).then(function (hit) {
    var network = fetch(req).then(function (res) {
      if (res && res.status === 200) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
      return res;
    }).catch(function () { return hit; });
    return hit || network;
  }));
});
`;
write('sw.js', sw);

console.log(`Generated ${TOOLS.length} tool pages, 4 articles, 8 static pages (including /advanced/ with ${ADVANCED_IDS.length} dashboards), sitemap.xml, robots.txt and sw.js.`);
