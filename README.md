# StudentHub

A complete, free, browser-based student productivity platform: 37 working tools with dashboard-style analytics, learning-theory planners, a dedicated Advanced hub, a private local workspace, search, an honest on-device live usage strip, PWA/offline support, SEO-ready pages and responsive design. A saved Light / Dark / Auto theme controls the whole interface, including charts, ad slots and study panels. Built with HTML5, modern CSS3 and vanilla JavaScript. No paid APIs, no backend, no account. The site is funded by third-party advertising; those scripts are listed in the privacy policy.

**Production URL used for canonical tags:** `https://studenthub-2gs.pages.dev`

---

## 1. Project structure

```
studenthub/
├── index.html                  Homepage
├── advanced.html               Advanced dashboard hub (/advanced/)
├── about.html, contact.html, privacy-policy.html, terms.html
├── offline.html, 404.html, workspace.html
├── about/, contact/, privacy-policy/, terms/, offline/, 404/, workspace/, advanced/
│   └── index.html              Pretty-URL copies (so /about/ works on any static host)
├── robots.txt, sitemap.xml, manifest.webmanifest, sw.js, _headers
├── assets/
│   ├── css/                    themes.css, main.css, components.css, responsive.css
│   ├── js/                     core.js, calculations.js, storage.js, theme.js,
│   │                           navigation.js, search.js, tool-base.js, pwa.js,
│   │                           ads.js, app.js, home.js, contact.js,
│   │                           workspace.js, config.js, advanced.js, usage.js
│   └── icons/                  favicon.svg, icon-192.png, icon-512.png
├── tools/<37 tools>/           index.html + tool.js for each tool
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

You can also open `index.html` directly (double-click it) and browse the whole site from disk. Every page uses URLs relative to its own folder, so CSS, JavaScript, tools and internal links all work without a server. Only install/offline features (service worker and web manifest) require HTTP(S) or localhost.

---

## 3. Before publishing

1. **Keep the final URL in sync.** If you change domain, search for `https://studenthub-2gs.pages.dev` in:
   - `scripts/generate.js` (`SITE`)
   - `assets/js/core.js` (`SITE.url`)
   Then run `node scripts/generate.js` so every canonical, Open Graph URL, sitemap entry and structured-data URL is updated. The `studenthub.pages.dev` name is taken by an unrelated site, so do not use it.
2. **Set a contact address.** Edit `assets/js/config.js`:
   ```js
   global.StudentHub.config = { contactEmail: 'you@your-domain.com' };
   ```
   No secrets belong in this file. The contact form only opens the visitor's email app; it never sends data to a server.
3. **Check the privacy policy** and update the contact details if needed.
4. **Advertising is live.** The supplied vendor tags are written into the generated HTML by `scripts/generate.js` (the `ADS` object near the top). They must be static, parse-time tags: the 468×60 tag calls `document.write`, which does nothing when injected after load.

   | Placement | Where it appears | Where to change it |
   | --- | --- | --- |
   | 468×60 display banner | Homepage slot | `ADS.bannerKey` / `ADS.banner` + `bannerAd()` |
   | Native banner | Homepage, Advanced hub, tool, article and static-page slots | `ADS.native` / `ADS.nativeContainer` + `nativeAd()` |
   | Social bar | Head of every generated page | `ADS.social` + `headAds()` |
   | Pop-under | Head of every generated page, all devices | `ADS.popunder` + `headAds()` |
   | Sponsored SmartLink | Footer of every generated page | `ADS.smartlink` + `sponsoredLink()` |

   Advertising is always on: every generated page — including the Advanced hub, Workspace, Privacy, Contact, offline and error pages — gets the static head tags, a native slot and a sponsored footer link. There are no ad-free pages and no URL switch that hides them. Setting `ADS.enabled = false` in `scripts/generate.js` and regenerating is a build-time master switch for removing every placement. `assets/js/ads.js` keeps the same URLs for reference and shows a clearly labelled first-party sponsored banner if a network returns no creative after four seconds. It also detects blocked ad scripts (via a parse-time error listener and a hidden bait element) and immediately shows those self-hosted banners plus a polite, dismissible notice asking the visitor to allow ads. The banners are plain SVG images in `assets/ads/` linking to the sponsor; they set no cookies and receive no study data. If a network replaces a tag, edit `ADS` in `scripts/generate.js`, regenerate and redeploy — editing `ads.js` alone will not change the live tags. Ad slots are richer, theme-aware dashboard cards; the networks and placement types are unchanged.

   Ad networks usually only serve creatives to approved publisher accounts and allowlisted domains. Test locally or from an unapproved domain and the scripts may return HTTP 200 while displaying nothing; the fallback link still gives visitors a working sponsored destination.

---

## 4. Tests

```bash
node --test tests          # 33 calculation + structure checks
node tests/browser-smoke.js # 70 real Chrome checks (needs Google Chrome installed)
```

The browser test starts its own local server and headless Chrome, then drives every tool, exercises the Advanced hub filters and the live usage strip, checks invalid inputs, persistence, service-worker registration, the Light/Dark/Auto theme (including system changes and local persistence), mobile overflow and ad behaviour (including always-on pages and a blocked-network simulation). It also opens pages from `file://` to confirm the UI, tools and relative links work directly from disk. It closes both processes when finished. A separate layout sweep verified all 50 routes at 1440, 820, 390 and 320 px in Light and Dark with ads active and blocked (800/800 clean).

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
   - Project name: `studenthub-2gs` (already deployed at `https://studenthub-2gs.pages.dev`; `studenthub` is taken by another site).
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

Every route has a real file: `/tools/<slug>/index.html`, `/articles/<slug>/index.html`, `/advanced/index.html` and directory copies such as `/about/index.html`. The root `404.html` is the friendly error page.

---

## 7. Features delivered

- **37 working tools**: percentage, CGPA, GPA, grade, marks, attendance, score predictor, timetable maker, Pomodoro, exam countdown, study tracker, assignment planner, flashcards, quiz maker, revision notes, question picker, vocabulary trainer, word counter, character counter, reading time, text case, citation formatter, age, date difference, unit converter, study hours tracker, spaced revision scheduler, grade goal planner, focus streak & habits, syllabus coverage tracker, exam readiness score, study pace forecaster, assignment priority matrix, deliberate practice planner, Feynman clarity score, interleaving schedule builder and confidence calibrator.
- **Advanced hub**: a premium, filterable `/advanced/` dashboard with live loading skeletons, category/search filters, twelve linked tool cards, a fourth “Learning theory” filter, a connected workflow and crawlable nested URLs. The hub, its filters and all advanced tools are precached for offline use.
- **Advanced study analytics**: live study timer with saved sessions, weekly goal ring, 7-day bars, subject breakdown and 35-day heatmap; automatic spaced-review plans with completion tracking; required-marks planning for every remaining assessment; daily habit streaks with a consistency heatmap; syllabus coverage by subject and confidence; weighted exam readiness scoring; pace forecasting with ideal vs current curves; and assignment urgency/workload ranking. All charts and totals are calculated locally and stored only in the browser.
- **Learning-theory dashboards**: deliberate practice planning with feedback weighting, Feynman clarity scoring with a five-part breakdown, an interleaving schedule builder that actually favours weak topics without back-to-back repeats, and confidence calibration with bias, Brier-style error and trend. Each has a local draft, an example button and a plain-language explanation of the model.
- **Live usage strip**: a top-of-page strip that recomputes interactions today, studied minutes, day streak and tools used this week from LocalStorage events and saved IndexedDB sessions. It is explicitly labelled as device-local; there is no global counter, no analytics service and no server upload.
- **Personal workspace**: favourites, recent tools, progress, all local collections, JSON export/import and clear-all. The usage log is included in export/import and removed by clear-all.
- **Search**: instant filtering by name, category, description and keywords; keyboard arrows/Enter/Escape; recent searches; empty state; 404-page search.
- **Privacy**: no login and no server storage of study data. StudentHub's own code has no analytics; third-party ad scripts are disclosed in the privacy policy. LocalStorage for preferences, drafts and the on-device usage log; IndexedDB for collections. The privacy policy explains that no global user counter exists.
- **PWA**: manifest, installable icons, versioned service worker, offline fallback, offline indicator and automatic cache cleanup.
- **SEO**: unique titles/descriptions/canonical/OG tags, Google Search Console and Bing Webmaster Tools verification metas, H1/H2 structure, explanatory content, formulas, worked examples, FAQs, related tools, BreadcrumbList and WebSite structured data, primary and fallback sitemaps, and robots.
- **Accessibility**: semantic landmarks, skip link, visible focus, ARIA live results, labelled controls, reduced-motion support, keyboard search and timer controls.
- **Performance**: system fonts, no dependencies, small vanilla scripts, deferred JS, tiny PNG/SVG assets, no layout-shifting imagery, simple CSS animations only.
- **Advertising**: five live placement types (banner, native, social bar, pop-under, SmartLink) generated as static parse-time tags and active on every page, with first-party sponsored banners when a creative is missing or an ad blocker stops the network tags.

---

## 8. Known limitations

- No account or cloud sync by design; backups are manual JSON files.
- Citation formatting covers basic books in APA/MLA/Chicago only and is not a verified bibliography service.
- The score predictor is arithmetic, not a guarantee; institution-specific rules are not modelled.
- The timetable uses a simple priority-based placement algorithm, not constraint optimisation.
- Revision notes are plain text; there is no rich-text formatting.
- Flashcard tracking marks known/difficult but does not schedule spaced-review dates.
- There are no push notifications; deadline reminders must be added to a personal calendar.
- Google AdSense is not integrated; the supplied third-party network tags are used instead. Earnings and referral traffic are not guaranteed, and ad networks can change or block tags without notice.
- Core Web Vitals were not measured with Lighthouse in this environment; real-world values depend on hosting, device and network.

The site is otherwise fully functional; no buttons are decorative or non-functional.
