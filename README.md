# StudentHub

A complete, free, browser-based student productivity platform: 25 working tools, a private local workspace, search, PWA/offline support, SEO-ready pages and responsive design. Built with HTML5, modern CSS3 and vanilla JavaScript. No paid APIs, no backend, no account, no external scripts.

**Default production URL used for canonical tags:** `https://studenthub.pages.dev`

---

## 1. Project structure

```
studenthub/
├── index.html                  Homepage
├── about.html, contact.html, privacy-policy.html, terms.html
├── offline.html, 404.html, workspace.html
├── about/, contact/, privacy-policy/, terms/, offline/, 404/, workspace/
│   └── index.html              Pretty-URL copies (so /about/ works on any static host)
├── robots.txt, sitemap.xml, manifest.webmanifest, sw.js, _headers
├── assets/
│   ├── css/                    themes.css, main.css, components.css, responsive.css
│   ├── js/                     core.js, calculations.js, storage.js, theme.js,
│   │                           navigation.js, search.js, tool-base.js, pwa.js,
│   │                           ads.js, app.js, home.js, contact.js,
│   │                           workspace.js, config.js
│   └── icons/                  favicon.svg, icon-192.png, icon-512.png
├── tools/<25 tools>/           index.html + tool.js for each tool
├── articles/<4 guides>/        index.html
├── scripts/
│   ├── generate.js             Regenerates all HTML, sitemap, robots and service worker
│   ├── content-*.js            Unique SEO content for each tool
│   ├── helpers.js, make-icons.py
└── tests/                      Unit, structural and real-browser smoke tests
```

### Important: generated files

The HTML pages, `sitemap.xml`, `robots.txt` and `sw.js` are generated from `scripts/`. After editing shared markup or tool content, regenerate with:

```bash
node scripts/generate.js
python scripts/make-icons.py   # only if you change the icons
```

The generated files are committed, so deployment needs **no build step**. Pages are real static HTML and crawlable.

---

## 2. Local preview

Any static server works. From the project root:

```bash
python -m http.server 8765
```

Open `http://127.0.0.1:8765/`. Service workers are enabled on localhost/127.0.0.1 and on HTTPS.

---

## 3. Before publishing

1. **Set your final URL.** Search for `https://studenthub.pages.dev` in:
   - `scripts/generate.js` (`SITE`)
   - `assets/js/core.js` (`SITE.url`)
   Then run `node scripts/generate.js` so every canonical, Open Graph URL, sitemap entry and structured-data URL is updated.
2. **Set a contact address.** Edit `assets/js/config.js`:
   ```js
   global.StudentHub.config = { contactEmail: 'you@your-domain.com' };
   ```
   No secrets belong in this file. The contact form only opens the visitor's email app; it never sends data to a server.
3. **Check the privacy policy** and update the contact details if needed.
4. **Advertising stays off.** It is disabled in `assets/js/ads.js` (`enabled: false`). Do not enable it until an approved publisher account exists. Replace the placeholder renderer with that platform's official tag, keep reserved slots hidden otherwise, and never place ads on `/privacy-policy/`, `/contact/` or `/workspace/`.

---

## 4. Tests

```bash
node --test tests          # 18 calculation + structure checks
node tests/browser-smoke.js # 37 real Chrome checks (needs Google Chrome installed)
```

The browser test starts its own local server and headless Chrome, then drives every tool, checks invalid inputs, persistence, service-worker registration, theme switching and mobile overflow. It closes both processes when finished.

See `TEST_REPORT.md` for the latest results and known limits.

---

## 5. GitHub upload (exact steps)

Using GitHub Desktop:

1. Open GitHub Desktop → **File → Add Local Repository**.
2. Choose `C:\studenthub` and click **Add repository** (initialise git if asked).
3. In the left panel, write a summary such as `Initial StudentHub release` and click **Commit to main**.
4. Click **Publish repository**, choose your GitHub account, enter `studenthub` as the name, leave it public (or private if you prefer) and click **Publish repository**.

Using the command line:

```bash
cd C:\studenthub
git init
git add .
git commit -m "Initial StudentHub release"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/studenthub.git
git push -u origin main
```

Create the empty repository on GitHub first if you use the command line. Do not commit local browser data; the project stores user data only in the visitor's browser.

---

## 6. Cloudflare Pages deployment (exact steps)

1. Sign in at <https://dash.cloudflare.com> → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Authorise GitHub and select the `studenthub` repository.
3. **Configure build:**
   - Project name: `studenthub` (this gives `https://studenthub.pages.dev` if available).
   - Production branch: `main`.
   - Framework preset: **None**.
   - Build command: **leave empty**.
   - Build output directory: `/` (the project root).
   - Environment variables: none.
4. Click **Save and Deploy**. Cloudflare uploads the static files. No build or npm install is needed.
5. Open the `.pages.dev` URL from the deployment panel and confirm the homepage loads.
6. Check a nested route, for example `/tools/pomodoro-timer/` and `/about/`.
7. In **Settings → Functions**, no functions are needed. `_headers` is applied automatically.
8. If you connect a custom domain later, update the canonical URL as described in section 3 and redeploy.

### Notes on nested routes

Every route has a real file: `/tools/<slug>/index.html`, `/articles/<slug>/index.html` and directory copies such as `/about/index.html`. The root `404.html` is the friendly error page.

---

## 7. Features delivered

- **25 working tools**: percentage, CGPA, GPA, grade, marks, attendance, score predictor, timetable maker, Pomodoro, exam countdown, study tracker, assignment planner, flashcards, quiz maker, revision notes, question picker, vocabulary trainer, word counter, character counter, reading time, text case, citation formatter, age, date difference and unit converter.
- **Personal workspace**: favourites, recent tools, progress, all local collections, JSON export/import and clear-all.
- **Search**: instant filtering by name, category, description and keywords; keyboard arrows/Enter/Escape; recent searches; empty state; 404-page search.
- **Privacy**: no analytics, no external scripts, no server storage, no login. LocalStorage for small preferences; IndexedDB for collections.
- **PWA**: manifest, installable icons, versioned service worker, offline fallback, offline indicator and automatic cache cleanup.
- **SEO**: unique titles/descriptions/canonical/OG tags, H1/H2 structure, explanatory content, formulas, worked examples, FAQs, related tools, BreadcrumbList and WebSite structured data, sitemap and robots.
- **Accessibility**: semantic landmarks, skip link, visible focus, ARIA live results, labelled controls, reduced-motion support, keyboard search and timer controls.
- **Performance**: system fonts, no dependencies, small vanilla scripts, deferred JS, tiny PNG/SVG assets, no layout-shifting imagery, simple CSS animations only.
- **Ad readiness**: three labelled, disabled-by-default reserved slots with a single configuration point.

---

## 8. Known limitations

- No account or cloud sync by design; backups are manual JSON files.
- Citation formatting covers basic books in APA/MLA/Chicago only and is not a verified bibliography service.
- The score predictor is arithmetic, not a guarantee; institution-specific rules are not modelled.
- The timetable uses a simple priority-based placement algorithm, not constraint optimisation.
- Revision notes are plain text; there is no rich-text formatting.
- Flashcard tracking marks known/difficult but does not schedule spaced-review dates.
- There are no push notifications; deadline reminders must be added to a personal calendar.
- Google AdSense is not integrated. Nothing is promised about approval or revenue.
- Core Web Vitals were not measured with Lighthouse in this environment; real-world values depend on hosting, device and network.

The site is otherwise fully functional; no buttons are decorative or non-functional.
