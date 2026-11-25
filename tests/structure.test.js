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
  'index.html', 'about.html', 'contact.html', 'privacy-policy.html', 'terms.html', 'offline.html', '404.html', 'workspace.html',
  ...IDS.map(id => `tools/${id}/index.html`),
  ...['study-tips', 'active-recall', 'spaced-repetition', 'exam-preparation'].map(s => `articles/${s}/index.html`)
];

test('all 25 tool pages and scripts exist', () => {
  assert.equal(IDS.length, 25);
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
    assert.ok(desc && desc.length > 30, `${page}: description`);
    assert.ok(canonical && canonical.startsWith(SITE + '/'), `${page}: canonical`);
    assert.equal(h1, 1, `${page}: exactly one H1`);
    assert.ok(html.includes('property="og:title"'), `${page}: Open Graph`);
    assert.ok(html.includes('property="og:description"'), `${page}: OG description`);
    assert.ok(html.includes('property="og:url"'), `${page}: OG URL`);
    titles.add(title); descriptions.add(desc);
  });
  assert.equal(titles.size, PAGES.length, 'titles are unique');
  assert.equal(descriptions.size, PAGES.length, 'descriptions are unique');
});

test('tool pages contain instructions, formulas, FAQs, related links and structured data', () => {
  IDS.forEach(id => {
    const html = read(`tools/${id}/index.html`);
    ['How the calculation works', 'Worked example', 'How to use this page', 'Frequently asked questions', 'Related tools', 'BreadcrumbList', 'data-favorite', 'id="result"', 'data-ad-slot="tool"'].forEach(needle => {
      assert.ok(html.includes(needle), `${id}: ${needle}`);
    });
  });
});

const DIR_PAGES = ['about', 'contact', 'privacy-policy', 'terms', 'offline', '404', 'workspace'].map(name => `${name}/index.html`);

test('all internal links and asset paths resolve to generated files', () => {
  // Pages use paths relative to their own folder so they work from disk too.
  PAGES.concat(DIR_PAGES).forEach(page => {
    const html = read(page);
    const dir = path.posix.dirname(page.replace(/\\/g, '/'));
    const paths = Array.from(html.matchAll(/(?:href|src)="([^"]*)"/g)).map(m => m[1])
      .filter(value => value && !/^(https?:|mailto:|data:|#)/.test(value));
    paths.forEach(value => {
      const relative = value.split('#')[0];
      if (!relative) return;
      const resolved = path.posix.normalize(path.posix.join(dir, relative));
      assert.ok(exists(resolved) && fs.statSync(path.join(ROOT, resolved)).isFile(), `${page}: broken local path ${value}`);
    });
  });
});

test('sitemap, robots, manifest and icons are complete', () => {
  const sitemap = read('sitemap.xml');
  IDS.forEach(id => assert.ok(sitemap.includes(`<loc>${SITE}/tools/${id}/</loc>`), `${id} in sitemap`));
  assert.ok(read('robots.txt').includes(`Sitemap: ${SITE}/sitemap.xml`));
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
  ['/offline/', '/assets/css/main.css', '/assets/js/core.js', '/assets/js/calculations.js'].forEach(u => assert.ok(sw.includes(u), `${u} precached`));
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

test('ad tags are static, parse-time, disclosed and placed in real slots', () => {
  const urls = [
    'https://afders.org/1/3c0e12112693371a49e8da1ecaf03499',
    'https://arwf.org/4/f9c719598061c9d7137f077570fe38b1',
    'https://bicea.org/21/9b5ea66616f3e02be4f9a4fe968d7547',
    'https://bicea.org/14/3d7fa5667db565ec11331c4b0846ee9b',
    'https://bicea.org/22/96d3c3868be22016392b6676ae58d572'
  ];
  const ads = read('assets/js/ads.js');
  assert.ok(ads.includes('enabled: true'), 'ads are live');
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

  const tool = read('tools/percentage-calculator/index.html');
  assert.ok(tool.includes('data-ad-slot="tool"'), 'tool slot');
  assert.ok(tool.indexOf('src="' + urls[2] + '"') < tool.indexOf('id="container-9b5ea66616f3e02be4f9a4fe968d7547"'), 'native script before its container');
  assert.ok(read('articles/study-tips/index.html').includes('data-ad-slot="article"'), 'article slot');

  ['privacy-policy.html', 'contact.html', 'workspace.html'].forEach(page => {
    assert.ok(!/afders\.org\/1\/|bicea\.org\/(14|21|22)\/|arwf\.org\/4\//.test(read(page)), `${page}: no ad tags`);
  });

  const privacy = read('privacy-policy.html');
  ['afders.org', 'arwf.org', 'bicea.org', 'Advertising and third parties'].forEach(s => assert.ok(privacy.includes(s), `privacy discloses ${s}`));
  PAGES.forEach(page => {
    assert.ok(!/adsbygoogle|googlesyndication|pagead2/.test(read(page)), `${page}: no unrelated ad network tags`);
  });
});
