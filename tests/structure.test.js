'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const exists = rel => fs.existsSync(path.join(ROOT, rel));

function toolIds() {
  const core = read('assets/js/core.js');
  const match = core.match(/var TOOLS = (\[[\s\S]*?\n  \]);/);
  assert.ok(match, 'tool registry found');
  return new Function('return ' + match[1])().map(t => t.id); // trusted local source
}
const IDS = toolIds();
const SITE = (read('scripts/generate.js').match(/const SITE = '([^']+)'/) || [])[1];
assert.ok(SITE, 'production URL configured in generator');
const PAGES = [
  'index.html', 'advanced.html', 'about.html', 'contact.html', 'privacy-policy.html', 'terms.html', 'offline.html', '404.html', 'workspace.html',
  ...IDS.map(id => `tools/${id}/index.html`),
  ...['study-tips', 'active-recall', 'spaced-repetition', 'exam-preparation'].map(s => `articles/${s}/index.html`)
];

test('all 37 tool pages and scripts exist', () => {
  assert.equal(IDS.length, 37);
  assert.equal(PAGES.length, 50);
  IDS.forEach(id => {
    assert.ok(exists(`tools/${id}/index.html`), `${id} page exists`);
    assert.ok(exists(`tools/${id}/tool.js`), `${id} script exists`);
  });
});

test('every page has unique title, description, canonical and one H1', () => {
  const titles = new Set(), descriptions = new Set();
  PAGES.forEach(page => {
    const html = read(page);
    const title = (html.match(/<title>([^<]+)<\/title>/) || [])[1];
    const desc = (html.match(/<meta name="description" content="([^"]+)">/) || [])[1];
    const canonical = (html.match(/<link rel="canonical" href="([^"]+)">/) || [])[1];
    const h1 = (html.match(/<h1[^>]*>/g) || []).length;
    assert.ok(title && title.length > 10, `${page}: title`);
    assert.ok(desc && desc.length >= 25 && desc.length <= 160, `${page}: description 25-160 characters`);
    assert.ok(canonical && canonical.startsWith(SITE + '/'), `${page}: canonical`);
    assert.ok(html.includes('<meta name="google-site-verification" content="WPy7or4AwCbkixtA55pqg55hMDhLUFs1vPnR8EgH-rA" />'), `${page}: Google Site Verification meta`);
    assert.ok(html.includes('<meta name="msvalidate.01" content="E6A421577F1424D7259F8EE6AA3E0786" />'), `${page}: Bing Webmaster Tools meta`);
    assert.equal(h1, 1, `${page}: exactly one H1`);
    assert.ok(html.includes('property="og:title"'), `${page}: Open Graph`);
    assert.ok(html.includes('property="og:description"'), `${page}: OG description`);
    assert.ok(html.includes('property="og:url"'), `${page}: OG URL`);
    titles.add(title); descriptions.add(desc);
  });
  assert.equal(titles.size, PAGES.length, 'titles are unique');
  assert.equal(descriptions.size, PAGES.length, 'descriptions are unique');
});

test('light, dark and auto theme controls are shipped on every page', () => {
  const themeJs = read('assets/js/theme.js');
  ['studenthub:theme', 'prefers-color-scheme', "'light'", "'dark'", "'auto'"].forEach(needle => {
    assert.ok(themeJs.includes(needle), `theme.js: ${needle}`);
  });
  assert.ok(read('assets/css/themes.css').includes('html[data-theme="dark"]'), 'dark tokens exist');
  PAGES.forEach(page => {
    const html = read(page);
    assert.ok(html.includes('data-theme-preference="auto"'), `${page}: default preference`);
    assert.ok(html.includes("localStorage.getItem('studenthub:theme')"), `${page}: pre-paint theme script`);
    ['light', 'dark', 'auto'].forEach(mode => assert.ok(html.includes(`data-theme-option="${mode}"`), `${page}: ${mode} control`));
    assert.ok(html.includes('theme.js'), `${page}: theme script`);
    assert.ok(!html.includes('data-theme-toggle'), `${page}: no stale hidden toggle`);
  });
});

test('live usage strip is on-device only and ships on every page', () => {
  const usageJs = read('assets/js/usage.js');
  ['usageEvents', "SH.storage.prefs.get(KEY", "SH.storage.all('sessions')", "SH.storage.all('tasks')",
    "streakStats", "record('view')", 'setInterval(update, 30000)'].forEach(needle => {
    assert.ok(usageJs.includes(needle), `usage.js: ${needle}`);
  });
  assert.ok(!/(fetch|XMLHttpRequest|sendBeacon)\s*\(/.test(usageJs), 'usage.js makes no network calls');
  const storageJs = read('assets/js/storage.js');
  assert.equal((storageJs.match(/usageEvents/g) || []).length >= 3, true, 'usage log is exported, imported and cleared with other prefs');
  const baseJs = read('assets/js/tool-base.js');
  assert.ok(baseJs.includes("record('open'") && baseJs.includes("record('result'"), 'tool use is recorded locally');
  PAGES.concat(DIR_PAGES).forEach(page => {
    const html = read(page);
    assert.ok(html.includes('id="usage-bar"'), `${page}: usage strip`);
    assert.ok(html.includes('aria-label="Live study usage on this device"'), `${page}: device-only label`);
    ['actions', 'minutes', 'streak', 'tools', 'updated'].forEach(key => {
      assert.ok(html.includes(`data-usage="${key}"`), `${page}: ${key} metric`);
    });
    assert.ok(html.includes('assets/js/usage.js'), `${page}: usage script`);
  });
  const privacy = read('privacy-policy.html');
  assert.ok(privacy.includes('no global or cross-user counter exists'), 'privacy discloses the local-only counter');
});

test('tool pages contain instructions, formulas, FAQs, related links and structured data', () => {
  IDS.forEach(id => {
    const html = read(`tools/${id}/index.html`);
    ['How the calculation works', 'Worked example', 'How to use this page', 'Frequently asked questions', 'Related tools', 'BreadcrumbList', 'data-favorite', 'id="result"', 'data-ad-slot="tool"'].forEach(needle => {
      assert.ok(html.includes(needle), `${id}: ${needle}`);
    });
  });
});

test('advanced hub ships a working filterable dashboard directory', () => {
  const ids = ['study-hours-tracker', 'spaced-revision-scheduler', 'grade-goal-planner', 'focus-streak-habits',
    'syllabus-coverage-tracker', 'exam-readiness-score', 'study-pace-forecaster', 'assignment-priority-matrix',
    'deliberate-practice-planner', 'feynman-clarity-score', 'interleaving-schedule-builder', 'confidence-calibrator'];
  const root = read('advanced.html');
  const nested = read('advanced/index.html');
  assert.equal((root.match(/<h1[^>]*>/) || [])[0], (nested.match(/<h1[^>]*>/) || [])[0], 'pretty URL copy has the same heading');
  assert.equal((root.match(/<link rel="canonical" href="([^"]+)">/) || [])[1], (nested.match(/<link rel="canonical" href="([^"]+)">/) || [])[1], 'pretty URL copy has the same canonical');
  ids.forEach(id => {
    assert.ok(root.includes(`data-tool-id="${id}"`), `${id}: featured on hub`);
    assert.ok(nested.includes(`href="../tools/${id}/index.html"`), `${id}: crawlable link from nested copy`);
    assert.ok(read(`tools/${id}/index.html`).includes('data-advanced="true"'), `${id}: premium dashboard layout`);
  });
  ['data-advanced-filter="all"', 'data-advanced-filter="study-planning"', 'data-advanced-filter="academic-calculators"',
    'data-advanced-filter="learning-tools"', 'Search 12 dashboards',
    'id="advanced-search"', 'id="advanced-grid"', 'id="advanced-status"', 'id="advanced-skeleton"',
    'data-ad-slot="advanced"', 'src="../assets/js/advanced.js"'].forEach(needle => {
    assert.ok(nested.includes(needle), `advanced hub: ${needle}`);
  });
  assert.equal((nested.match(/class="advanced-card" data-advanced-category=/g) || []).length, 12, 'twelve dashboard cards');
  const js = read('assets/js/advanced.js');
  ['querySelectorAll', 'data-advanced-filter', 'addEventListener(\'click\'', 'addEventListener(\'input\'', 'hidden'].forEach(needle => {
    assert.ok(js.includes(needle), `advanced.js: ${needle}`);
  });
});

const DIR_PAGES = ['about', 'contact', 'privacy-policy', 'terms', 'offline', '404', 'workspace', 'advanced'].map(name => `${name}/index.html`);

test('all internal links and asset paths resolve to generated files', () => {
  // Pages use paths relative to their own folder so they work from disk too.
  PAGES.concat(DIR_PAGES).forEach(page => {
    const html = read(page);
    const dir = path.posix.dirname(page.replace(/\\/g, '/'));
    const paths = Array.from(html.matchAll(/(?:href|src)="([^"]*)"/g)).map(m => m[1])
      .filter(value => value && !/^(https?:|mailto:|data:|#)/.test(value));
    paths.forEach(value => {
      const relative = value.split('#')[0].split('?')[0];
      if (!relative) return;
      const resolved = path.posix.normalize(path.posix.join(dir, relative));
      assert.ok(exists(resolved) && fs.statSync(path.join(ROOT, resolved)).isFile(), `${page}: broken local path ${value}`);
    });
  });
});

test('sitemap, fallback sitemap, robots, manifest and icons are complete', () => {
  const sitemap = read('sitemap.xml');
  const fallback = read('sitemap-fallback.xml');
  IDS.forEach(id => {
    assert.ok(sitemap.includes(`<loc>${SITE}/tools/${id}/</loc>`), `${id} in sitemap`);
    assert.ok(fallback.includes(`<loc>${SITE}/tools/${id}/</loc>`), `${id} in fallback sitemap`);
  });
  assert.ok(sitemap.includes(`<loc>${SITE}/advanced/</loc>`), 'advanced hub in sitemap');
  assert.equal((sitemap.match(/<loc>/g) || []).length, 47, 'sitemap has 47 crawlable URLs');
  assert.ok(fallback.includes(`<loc>${SITE}/advanced/</loc>`), 'advanced hub in fallback sitemap');
  assert.equal((fallback.match(/<loc>/g) || []).length, (sitemap.match(/<loc>/g) || []).length, 'fallback sitemap is identical');
  const robots = read('robots.txt');
  assert.ok(robots.includes(`Sitemap: ${SITE}/sitemap.xml`), 'primary sitemap in robots.txt');
  assert.ok(robots.includes(`Sitemap: ${SITE}/sitemap-fallback.xml`), 'fallback sitemap in robots.txt');
  const headers = read('_headers');
  assert.ok(headers.includes('/sitemap.xml') && headers.includes('Content-Type: application/xml; charset=UTF-8'), 'sitemap MIME header');
  const manifest = JSON.parse(read('manifest.webmanifest'));
  assert.equal(manifest.display, 'standalone');
  assert.ok(manifest.icons.some(i => i.sizes === '192x192'));
  assert.ok(manifest.icons.some(i => i.sizes === '512x512'));
  manifest.icons.forEach(i => assert.ok(exists(i.src.replace(/^\//, '')), `icon ${i.src}`));
});

test('service worker precaches every tool page and app shell', () => {
  const sw = read('sw.js');
  assert.ok(/var CACHE = 'studenthub-[a-f0-9]{12}'/.test(sw));
  IDS.forEach(id => {
    assert.ok(sw.includes(`/tools/${id}/`), `${id} precached`);
    assert.ok(sw.includes(`/tools/${id}/index.html`), `${id}/index.html precached`);
  });
  ['/offline/', '/advanced/', '/advanced/index.html', '/assets/css/main.css', '/assets/js/core.js', '/assets/js/calculations.js',
    '/assets/js/usage.js', '/assets/js/advanced.js'].forEach(u => assert.ok(sw.includes(u), `${u} precached`));
});

test('shipped JavaScript has no eval, innerHTML or external service calls', () => {
  const files = [];
  const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.js')) files.push(full);
  });
  walk(path.join(ROOT, 'assets/js'));
  walk(path.join(ROOT, 'tools'));
  assert.ok(files.length >= 35);
  files.forEach(file => {
    const src = fs.readFileSync(file, 'utf8');
    assert.ok(!/\beval\s*\(/.test(src), `${file}: no eval`);
    assert.ok(!/\.innerHTML\s*=/.test(src), `${file}: no innerHTML assignment`);
    assert.ok(!/(fetch|XMLHttpRequest)\s*\(/.test(src), `${file}: no network calls`);
    assert.ok(!/(api[_-]?key|secret|token)\s*[:=]\s*['"`]/i.test(src), `${file}: no configured secrets`);
    assert.ok(!/sk-[A-Za-z0-9]{16,}/.test(src), `${file}: no API key strings`);
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  });
});

test('ad tags are static, parse-time and present on every generated page', () => {
  const urls = [
    'https://afders.org/1/3c0e12112693371a49e8da1ecaf03499',
    'https://arwf.org/4/f9c719598061c9d7137f077570fe38b1',
    'https://bicea.org/21/9b5ea66616f3e02be4f9a4fe968d7547',
    'https://bicea.org/14/3d7fa5667db565ec11331c4b0846ee9b',
    'https://bicea.org/22/96d3c3868be22016392b6676ae58d572'
  ];
  const ads = read('assets/js/ads.js');
  const generator = read('scripts/generate.js');
  const offSwitch = 'no' + 'ads';
  const count = (text, needle) => text.split(needle).length - 1;
  assert.ok(ads.includes('enabled: true'), 'ads are live');
  assert.ok(!ads.includes(offSwitch), 'no URL off switch in ads.js');
  assert.ok(!generator.includes(offSwitch), 'no URL off switch in the generator');
  assert.ok(!generator.includes('ads: ' + 'false'), 'no ad-free page option');
  urls.forEach(url => assert.ok(ads.includes(url), `config: ${url}`));
  assert.ok(ads.includes("containerId: 'container-9b5ea66616f3e02be4f9a4fe968d7547'"), 'native container id in config');
  assert.ok(ads.includes("rel: 'sponsored noopener noreferrer'"), 'sponsored rel in config');
  assert.ok(!/createElement\(['"]script/.test(ads), 'no duplicate script injection');

  const home = read('index.html');
  assert.ok(home.includes('<script data-cfasync="false" src="' + urls[0] + '"></script>'), 'pop-under in head');
  assert.ok(home.includes('<script data-cfasync="false" src="' + urls[3] + '"></script>'), 'social bar in head');
  assert.ok(home.includes("'key' : '96d3c3868be22016392b6676ae58d572'"), 'banner atOptions at parse time');
  assert.ok(home.includes('<script data-cfasync="false" src="' + urls[4] + '"></script>'), 'banner script at parse time');
  assert.ok(home.includes('data-ad-slot="home"') && home.includes('rel="sponsored noopener noreferrer"'), 'home slot and footer link');
  assert.ok(home.includes('data-ad-slot="home-native"'), 'home native ad slot');
  assert.ok(home.includes("setAttribute('data-ad-blocked','1')"), 'ad-block detection script runs before ad tags');
  ['sponsored-blue.svg', 'sponsored-teal.svg', 'sponsored-violet.svg'].forEach(name => {
    assert.ok(exists('assets/ads/' + name), `first-party creative ${name}`);
  });
  assert.ok(ads.includes("noticeStorageKey: 'studenthub:ad-notice-dismissed'"), 'dismissible notice preference');

  const allPages = [...new Set(PAGES.concat(DIR_PAGES))];
  allPages.forEach(page => {
    const html = read(page);
    assert.ok(html.includes('<script data-cfasync="false" src="' + urls[0] + '"></script>'), `${page}: pop-under head tag`);
    assert.ok(html.includes('<script data-cfasync="false" src="' + urls[3] + '"></script>'), `${page}: social bar head tag`);
    assert.equal(count(html, urls[0]), 1, `${page}: one pop-under script`);
    assert.equal(count(html, urls[3]), 1, `${page}: one social bar script`);
    assert.equal(count(html, urls[2]), 1, `${page}: one native script`);
    assert.ok(html.includes('class="ad-slot ad-slot-active"'), `${page}: active ad slot`);
    assert.ok(/data-ad-slot="[^"]+"/.test(html), `${page}: labelled slot`);
    assert.ok(html.includes('rel="sponsored noopener noreferrer"'), `${page}: sponsored footer link`);
    assert.ok(html.includes("setAttribute('data-ad-blocked','1')"), `${page}: block detection`);
    assert.ok(!html.includes(offSwitch), `${page}: no URL off switch`);
    assert.ok(!/adsbygoogle|googlesyndication|pagead2/.test(html), `${page}: no unrelated ad network tags`);
  });

  const tool = read('tools/percentage-calculator/index.html');
  assert.ok(tool.includes('data-ad-slot="tool"'), 'tool slot');
  assert.ok(tool.indexOf('src="' + urls[2] + '"') < tool.indexOf('id="container-9b5ea66616f3e02be4f9a4fe968d7547"'), 'native script before its container');
  assert.ok(read('articles/study-tips/index.html').includes('data-ad-slot="article"'), 'article slot');

  const privacy = read('privacy-policy.html');
  ['afders.org', 'arwf.org', 'bicea.org', 'Advertising and third parties', 'every generated page', 'no URL switch'].forEach(s => {
    assert.ok(privacy.includes(s), `privacy discloses ${s}`);
  });
  assert.ok(!privacy.includes('Ads are not placed'), 'privacy has no ad-free claim');
});
