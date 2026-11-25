# StudentHub — Test Report

Date: 25 November 2026
Environment: Windows, Node.js v26.13.0, Python 3.14, headless Google Chrome via Chrome DevTools Protocol, local `python -m http.server`.

## Automated suites

| Command | Result |
| --- | --- |
| `node --test tests` | **18/18 passed** |
| `node tests/browser-smoke.js` | **47/47 passed** |

### Unit tests (10 suites)

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

### Structural tests (8 suites)

- All 25 tool directories contain `index.html` and `tool.js`.
- 36 generated pages have unique titles, descriptions, canonical URLs and exactly one H1; all have Open Graph tags.
- Every tool page includes instructions, formulas, worked example, FAQ, related tools, breadcrumb structured data, result region and favourite control.
- All internal links resolve to real generated files (no broken routes).
- Sitemap includes every tool; robots.txt points to the sitemap; manifest icons exist.
- Service worker precaches the app shell and all tool pages with a content-derived cache version.
- Shipped JavaScript contains no `eval`, no `innerHTML` assignments, no network calls and no configured secrets; every file passes `node --check`.
- All five approved ad tags are emitted as static parse-time HTML (pop-under and social bar in `<head>`, exact native snippet before its container, inline `atOptions` plus banner script, sponsored footer link). `ads.js` holds the same URLs but never injects duplicate scripts. Ad-free pages contain no ad tags, the privacy policy discloses every network, and no unrelated ad-network tags are present.

### Real-browser smoke tests (47 checks)

Each test navigates to the actual page in headless Chrome, fills real controls, submits and reads the result:

1. Percentage, CGPA, GPA, grade, marks, attendance and score predictor produce expected values.
2. Timetable generation places 7 sessions with no conflicts.
3. Pomodoro starts, displays a decremented clock and pauses/resets without exceptions.
4. Exam countdown, study tracker, assignment planner, flashcards, quiz, revision notes, question picker and vocabulary trainer all save and display data through IndexedDB.
5. Word/character counters, reading time, text case, citations, age, date difference and unit converter return correct live results.
6. Instant search finds the right tool; the theme is locked to light with no toggle and a painted background; offline page renders.
7. Edge cases in the browser: division by zero, attendance above total and invalid leap date all show guidance instead of wrong numbers or console errors.
8. Export → import round-trip succeeds; service worker registers; no horizontal overflow at 390×844 on the homepage or a tool page. A full sweep then checks all 37 pages at phone width: `overflow:none on 37 pages`. A separate layout audit checked every page at 1440, 820, 390 and 320 px (148 combinations) for overlapping sibling cards/panels, clipped text and viewport overflow: **148/148 clean**.
9. The homepage and a tool page opened over `file://` load all four stylesheets, show the correct background and colours, run a calculation, and expose working relative links. The web manifest is attached only over HTTP(S), so disk preview produces no console error.
10. With ads enabled, the homepage contains an active 468×60 slot, a native slot, the correct `atOptions` key, exactly one pop-under, social-bar and banner script, and a sponsored footer link. A tool page contains the native script before its container. With ad domains blocked, block detection fires and a first-party sponsored SVG banner plus a dismissible notice appears immediately; after four seconds the sponsored link fallback is still present. No live creative is required for these checks.

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
- The UI was upgraded to a modern dashboard-style light design: glass header with a tool-count chip, gradient hero and page panels, raised tool cards, richer forms/results/tables/tabs, and layered background accents. Theme switching and dark tokens were removed; `theme.js` now enforces `data-theme="light"` and hides stale cached toggles. All grids use `minmax(0, 1fr)`/`auto-fit` so columns shrink instead of colliding.
- Advertising was extended to a native slot on the homepage. Because a blocker can prevent the third-party network tags entirely, the site now detects blocked scripts (parse-time error listener plus a hidden bait element) and shows self-hosted, clearly labelled sponsored SVG banners with a dismissible inline notice. The existing four-second fallback and all ad-free/`?noads=1` rules remain intact; the privacy policy discloses the new behaviour.

## Not measured in this environment

- Lighthouse LCP/INP/CLS scores: Chrome headless here was driven through CDP without the Lighthouse package; no scores are claimed.
- Live ad delivery, viewability, earnings and referral traffic: only the static tags and the sponsored fallback were verified with external ad domains blocked. Real creatives, network approval and revenue depend on the provider accounts; the supplied snippets also render no creative on a bare HTTPS test page, so the network itself must be checked.
- Real AdSense behaviour: not used; the supplied third-party network tags were integrated instead.
- Device-specific audio behaviour for Pomodoro: sound is opt-in and browser-dependent.
- Cross-browser manual review beyond headless Chrome (Firefox/Safari layout should still be checked before a public launch).

All 25 tools were individually exercised; none are decorative.
