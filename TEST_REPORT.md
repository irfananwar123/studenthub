# StudentHub — Test Report

Date: 25 November 2026
Environment: Windows, Node.js v26.13.0, Python 3.14, headless Google Chrome via Chrome DevTools Protocol, local `python -m http.server`.

## Automated suites

| Command | Result |
| --- | --- |
| `node --test tests` | **23/23 passed** |
| `node tests/browser-smoke.js` | **58/58 passed** |

### Unit tests (14 suites)

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

### Structural tests (9 suites)

- All 29 tool directories contain `index.html` and `tool.js`.
- 36 generated pages have unique titles, descriptions, canonical URLs and exactly one H1; all have Open Graph and Google Search Console verification meta tags.
- Every generated page ships the pre-paint theme script, all three theme controls and `theme.js`; no stale hidden light-only toggle remains. Dark palette tokens are present in `themes.css`.
- Every tool page includes instructions, formulas, worked example, FAQ, related tools, breadcrumb structured data, result region and favourite control.
- All internal links resolve to real generated files (no broken routes).
- Sitemap includes every tool; robots.txt points to the sitemap; manifest icons exist.
- Service worker precaches the app shell and all tool pages with a content-derived cache version.
- Shipped JavaScript contains no `eval`, no `innerHTML` assignments, no network calls and no configured secrets; every file passes `node --check`.
- All five approved ad tags are emitted as static parse-time HTML (pop-under and social bar in `<head>`, exact native snippet before its container, inline `atOptions` plus banner script, sponsored footer link). Every generated page has active head tags, a slot and a footer link; there is no ad-free page or URL off switch. `ads.js` holds the same URLs but never injects duplicate scripts. The privacy policy discloses every network, and no unrelated ad-network tags are present.

### Real-browser smoke tests (58 checks)

Each test navigates to the actual page in headless Chrome, fills real controls, submits and reads the result:

1. Percentage, CGPA, GPA, grade, marks, attendance and score predictor produce expected values.
2. Timetable generation places 7 sessions with no conflicts.
3. Pomodoro starts, displays a decremented clock and pauses/resets without exceptions.
4. Exam countdown, study tracker, assignment planner, flashcards, quiz, revision notes, question picker and vocabulary trainer all save and display data through IndexedDB.
5. Word/character counters, reading time, text case, citations, age, date difference and unit converter return correct live results.
6. The four advanced tools are exercised end to end: Study Hours Tracker runs a real timer, saves the session and renders its dashboard; Spaced Revision Scheduler generates and completes review stages; Grade Goal Planner calculates required marks and saves a local draft; Focus Streak & Habits logs completions, streaks and a 35-day heatmap.
7. Instant search finds the right tool; the theme starts on Auto, Dark and Light switches repaint the page and update `theme-color`, the Dark choice persists across navigation, Auto follows an emulated system dark preference and updates live when it changes, and the offline page renders.
8. Edge cases in the browser: division by zero, attendance above total and invalid leap date all show guidance instead of wrong numbers or console errors.
9. Export → import round-trip succeeds; service worker registers; no horizontal overflow at 390×844 on the homepage or a tool page. A full sweep then checks all 41 pages at phone width with ads active: `overflow:none on 41 pages`. A layout audit checked every page at 1440, 820, 390 and 320 px with ad domains blocked and first-party sponsored slots active, looking for overlapping sibling cards/panels, clipped text and viewport overflow: **164/164 clean in light and 164/164 clean in dark (328/328 total)**.
10. The homepage and a tool page opened over `file://` load all four stylesheets, show the correct background and colours, run a calculation, and expose working relative links. The web manifest is attached only over HTTP(S), so disk preview produces no console error.
11. Ads are always on: sampled home, tool, article, About, Terms, Privacy, Contact, Workspace, offline and error pages all contain static head tags, an active slot and a sponsored footer link, and the former URL off switch is ignored. The homepage contains an active 468×60 slot, a native slot, the correct `atOptions` key, exactly one pop-under, social-bar and banner script. A tool page contains the native script before its container. With ad domains blocked, block detection fires and a first-party sponsored SVG banner plus a dismissible notice appears immediately; after four seconds the sponsored link fallback is still present. No live creative is required for these checks.

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

## Not measured in this environment

- Lighthouse LCP/INP/CLS scores: Chrome headless here was driven through CDP without the Lighthouse package; no scores are claimed.
- Live ad delivery, viewability, earnings and referral traffic: only the static tags and the sponsored fallback were verified with external ad domains blocked. Real creatives, network approval and revenue depend on the provider accounts; the supplied snippets also render no creative on a bare HTTPS test page, so the network itself must be checked.
- Real AdSense behaviour: not used; the supplied third-party network tags were integrated instead.
- Device-specific audio behaviour for Pomodoro: sound is opt-in and browser-dependent.
- Cross-browser manual review beyond headless Chrome (Firefox/Safari layout should still be checked before a public launch).

All 29 tools were individually exercised; none are decorative.
