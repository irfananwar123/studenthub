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
    assert.ok(canonical && canonical.startsWith('https://studenthub.pages.dev/'), `${page}: canonical`);
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
  IDS.forEach(id => assert.ok(sitemap.includes(`<loc>https://studenthub.pages.dev/tools/${id}/</loc>`), `${id} in sitemap`));
  assert.ok(read('robots.txt').includes('Sitemap: https://studenthub.pages.dev/sitemap.xml'));
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

test('ad slots are disabled by default and no ad network code is present', () => {
  const ads = read('assets/js/ads.js');
  assert.ok(ads.includes('enabled: false'));
  PAGES.forEach(page => {
    const html = read(page);
    assert.ok(!/adsbygoogle|googlesyndication|pagead2/.test(html), `${page}: no ad network tags`);
  });
});
