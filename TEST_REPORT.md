# StudentHub — Test Report

Date: 26 November 2026
Environment: Windows, Node.js v26.13.0, Python 3.14, headless Google Chrome via Chrome DevTools Protocol, local `python -m http.server`.

## Automated suites

| Command | Result |
| --- | --- |
| `node --test tests` | **33/33 passed** |
| `node tests/browser-smoke.js` | **70/70 passed** |

### Unit tests (22 suites)

Independent calculation checks compare output against separately calculated expected values:

- Percentage amount, part-of-whole, percentage change and reverse-percentage; zero denominators return `null`.
- Weighted CGPA/GPA example: `(3.7×4 + 3.0×3 + 4.0×2) ÷ 9 = 3.5333`.
- Custom grade boundaries including exact cut-offs and invalid input.
- Marks example: 85/100 + 72/80 → 157/180 = 87.22% overall; 87.5% simple average.
- Attendance: 42/50 at 75% target → 84%, 8 further classes may be missed; 30/50 → 30 extra classes needed; invalid attendance > total rejected; zero-total handled.
- Score predictor: 200/90/100 at 80% → 70 marks (70%); already-achieved and impossible cases with shortfall.
- Text statistics: 4 words, 28 characters, 25 non-space characters, 2 sentences, 1 paragraph; reading time 1200/200 = 6 minutes.
- Date logic: 2024-02-29 valid, 2023-02-29 invalid, 2024-01-01 → 2025-01-01 = 366 days; age 2000-02-29 → 2024-02-29 = 24y 0m 0d.
- Unit conversions: km→mi, in→cm, kg→lb, °C↔°F↔K, L→ml and US cup→ml.
- Citations: APA/MLA/Chicago patterns; missing fields produce warnings and never `undefined`.
- Study-hours analytics: daily/weekly totals, subject split, goal percentage and seven-day keys; invalid and negative minutes are ignored.
- Spaced revision: confidence-based gaps, exam-date cutoff and invalid start dates.
- Grade goal planner: required total, required percentage, per-assessment marks, achieved and impossible statuses.
- Streak statistics: current run ending today or yesterday, longest run, active days and 35-day heatmap.
- Syllabus coverage: subject percentages, confidence weighting and weakest-subject ordering.
- Readiness score: four weighted signals, bands, weakest signal and validation of out-of-range values.
- Study pace forecast: capacity, projected completion, required daily hours, finish time and ideal/current curve.
- Assignment priority matrix: urgency ranking, effort bonus, seven-day workload and overloaded-day detection.
- Deliberate practice: weighted level steps (coach 1.0 through self-quiz 1.25), required hours, schedule coverage and gap.
- Feynman clarity: plain language outscores jargon, five weighted components, gap advice and minimum-length validation.
- Interleaving schedule: a deficit-based weighted mix gives weak topics more blocks, avoids immediate repeats and validates topic input.
- Confidence calibration: signed bias, mean absolute error, Brier-style score, trend and out-of-range validation.

### Structural tests (11 suites)

- All 37 tool directories contain `index.html` and `tool.js` across 50 generated pages.
- All 50 generated pages have unique titles, 25–160 character descriptions, canonical URLs and exactly one H1; all have Open Graph plus Google Search Console and Bing Webmaster Tools verification meta tags.
- Every generated page ships the pre-paint theme script, all three theme controls and `theme.js`; no stale hidden light-only toggle remains. Dark palette tokens are present in `themes.css`.
- Every tool page includes instructions, formulas, worked example, FAQ, related tools, breadcrumb structured data, result region and favourite control.
- The `/advanced/` hub has matching root and nested pages, twelve crawlable dashboard links, working filter/search controls including the Learning theory filter, and an active ad slot; all twelve tools use the premium single-panel layout.
- Every page ships the labelled on-device usage strip with all five metrics, `usage.js` is precached, the log is exported/imported/cleared with other prefs, tool opens and results are recorded locally, and the privacy policy states that no global counter exists.
- All internal links resolve to real generated files (no broken routes).
- Both sitemaps contain 47 URLs, including the Advanced hub; robots.txt points to both; Cloudflare headers declare the XML MIME type; manifest icons exist.
- Service worker precaches the app shell, the Advanced hub, its script and all tool pages with a content-derived cache version.
- Shipped JavaScript contains no `eval`, no `innerHTML` assignments, no network calls and no configured secrets; every file passes `node --check`.
- All five approved ad tags are emitted as static parse-time HTML (pop-under and social bar in `<head>`, exact native snippet before its container, inline `atOptions` plus banner script, sponsored footer link). Every generated page has active head tags, a slot and a footer link; there is no ad-free page or URL off switch. `ads.js` holds the same URLs but never injects duplicate scripts. The privacy policy discloses every network, and no unrelated ad-network tags are present.

### Real-browser smoke tests (70 checks)

Each test navigates to the actual page in headless Chrome, fills real controls, submits and reads the result:

1. Percentage, CGPA, GPA, grade, marks, attendance and score predictor produce expected values.
2. Timetable generation places 7 sessions with no conflicts.
3. Pomodoro starts, displays a decremented clock and pauses/resets without exceptions.
4. Exam countdown, study tracker, assignment planner, flashcards, quiz, revision notes, question picker and vocabulary trainer all save and display data through IndexedDB.
5. Word/character counters, reading time, text case, citations, age, date difference and unit converter return correct live results.
6. All twelve advanced tools are exercised end to end: Study Hours Tracker runs a real timer, saves the session and renders its dashboard; Spaced Revision Scheduler generates and completes review stages; Grade Goal Planner calculates required marks and saves a local draft; Focus Streak & Habits logs completions, streaks and a 35-day heatmap; Syllabus Coverage Tracker saves a done topic and recalculates coverage; Exam Readiness Score produces the weighted 74% result and weakest-signal action; Study Pace Forecaster renders both chart series and detects the pace gap; Assignment Priority Matrix adds an assignment and renders the ranked list and seven-day bars; Deliberate Practice Planner builds the 12-hour weighted plan; Feynman Clarity Score renders its breakdown and gap list; Interleaving Schedule Builder produces seven mixed days; Confidence Calibrator reports overconfidence and per-quiz errors.
7. The Advanced hub loads, removes its skeleton, filters twelve cards to three analysis dashboards, one readiness result and two learning-theory dashboards, shows its empty state, and all 24 card links have the correct local URL. The live usage strip records page views and tool opens, updates its metrics from the local log and stays explicitly device-local.
8. Instant search finds the right tool; the theme starts on Auto, Dark and Light switches repaint the page and update `theme-color`, the Dark choice persists across navigation, Auto follows an emulated system dark preference and updates live when it changes, and the offline page renders.
9. Edge cases in the browser: division by zero, attendance above total and invalid leap date all show guidance instead of wrong numbers or console errors.
10. Export → import round-trip succeeds; service worker registers; no horizontal overflow at 390×844 on the homepage or a tool page. A full sweep then checks all 50 pages at phone width with ads active: `overflow:none on 50 pages`. A separate layout audit checked every page at 1440, 820, 390 and 320 px in both Light and Dark, with ads active and with ad domains blocked/first-party slots active, looking for overlapping sibling cards/panels, clipped text and viewport overflow: **800/800 clean**.
11. The homepage and a tool page opened over `file://` load all four stylesheets, show the correct background and colours, run a calculation, and expose working relative links. The web manifest is attached only over HTTP(S), so disk preview produces no console error.
12. Ads are always on: sampled home, Advanced hub, tool, article, About, Terms, Privacy, Contact, Workspace, offline and error pages all contain static head tags, an active slot and a sponsored footer link, and the former URL off switch is ignored. The homepage contains an active 468×60 slot, a native slot, the correct `atOptions` key, exactly one pop-under, social-bar and banner script. A tool page contains the native script before its container. With ad domains blocked, block detection fires and a first-party sponsored SVG banner plus a dismissible notice appears immediately; after four seconds the sponsored link fallback is still present. No live creative is required for these checks.

No JavaScript console exceptions were observed in any passing check.

## Bugs found and fixed during testing

- Percentage basic mode called the "part of whole" function instead of amount calculation; added `percentAmount()` and corrected the tool.
- Temperature conversion was rejected before reaching its conversion branch.
- Citation output produced a double period after initials ending in a dot.
- Timetable tool referenced an undefined calculation namespace and had no subjects on first load.
- Importing a backup with null preference values broke search and favourites; getters now coerce to safe arrays.
- Service workers were only registered on HTTPS, preventing local preview registration on `127.0.0.1`.
- `/about/`, `/workspace/` etc. needed directory `index.html` copies to work on plain static servers.
- Pages used root-relative paths (`/assets/...`), so opening the files directly from disk resolved CSS/JS to `C:\assets\...` and the UI appeared unstyled. The generator now emits folder-relative URLs plus a `data-base` marker; tool links point to explicit `index.html` files; the service worker also caches those URLs. The manifest is injected only for HTTP(S) to avoid a harmless `file://` CORS warning.
- The UI was upgraded to a premium dashboard design in both light and dark themes: glass header with a tool-count chip and compact Light/Dark/Auto switch, deeper gradient hero and page panels, raised tool cards, richer forms/results/tables/tabs/charts, animated hero accents and theme-aware labelled ad surfaces. `theme.js` applies the saved preference before paint, updates `theme-color` and follows system changes in Auto mode. All grids use `minmax(0, 1fr)`/`auto-fit` so columns shrink instead of colliding.
- Advertising is now always on across every generated page, including Workspace, Privacy, Contact, offline and error pages. Static pages gained native slots, the URL off switch was removed, and slots became richer theme-aware dashboard cards without changing networks or placement types. Because a blocker can prevent the third-party network tags entirely, the site detects blocked scripts (parse-time error listener plus a hidden bait element) and shows self-hosted, clearly labelled sponsored SVG banners with a dismissible inline notice. The four-second fallback remains; the privacy policy discloses the new behaviour.
- Four advanced tools were added with full-width dashboard layouts: progress rings, bar charts, breakdown bars, heatmaps, sortable history and CSV export. Their data is split across the existing local collections (`sessions`, `schedules`, `tasks`) and a LocalStorage grade-plan draft, so the workspace and all export/import flows keep working. Habit and revision rows are typed and filtered so they never appear as assignments in the Assignment Planner.
- Four more advanced dashboards and a dedicated `/advanced/` hub were added: premium hero/status strip, loading skeletons, live category/search filters, crawlable tool cards, connected workflow and FAQ. Syllabus rows are typed so the Assignment Planner ignores them; planners preserve estimated hours. The new readiness, pacing and priority tools use existing IndexedDB collections and LocalStorage drafts only, so no database migration is needed. All advanced pages and the hub are in the sitemap, header navigation and service-worker precache.
- Four learning-theory dashboards joined the hub (twelve total) with a Learning theory filter: deliberate practice, Feynman clarity, interleaving and confidence calibration. The first interleaving implementation rotated through a weighted pool but gave a medium-confidence topic more blocks than a low-confidence one, so it was replaced with a deficit model that genuinely favours weak areas while avoiding immediate repeats.
- A live usage strip was added at the top of every page. It records view/open/result events in LocalStorage and reads saved sessions and habit rows from IndexedDB, labelling the result as device-local. It is included in workspace export/import and clear-all, and the privacy policy and Terms state that no global counter exists.
- The CSS was refreshed across all four stylesheets: ambient grid/mesh body layers, glass header and toolbar surfaces, animated page-hero/workspace rails, eyebrow and stat polish, card spotlights, softer shadows with a shared easing token, category-tinted Advanced hub cards and refined hover/motion states. The stylesheet count remains exactly four, and reduced-motion rules cover every new animation and transform. Stylesheet links and service-worker precache entries now carry a hash of the CSS files, so a CSS-only deploy bypasses the previous one-hour cache; link-resolution checks strip the query before resolving local files.

## Not measured in this environment

- Lighthouse LCP/INP/CLS scores: Chrome headless here was driven through CDP without the Lighthouse package; no scores are claimed.
- Live ad delivery, viewability, earnings and referral traffic: only the static tags and the sponsored fallback were verified with external ad domains blocked. Real creatives, network approval and revenue depend on the provider accounts; the supplied snippets also render no creative on a bare HTTPS test page, so the network itself must be checked.
- Real AdSense behaviour: not used; the supplied third-party network tags were integrated instead.
- Device-specific audio behaviour for Pomodoro: sound is opt-in and browser-dependent.
- Cross-browser manual review beyond headless Chrome (Firefox/Safari layout should still be checked before a public launch).

All 37 tools were individually exercised; none are decorative.
