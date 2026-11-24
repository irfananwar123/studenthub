# StudentHub — Test Report

Date: 24 November 2026
Environment: Windows, Node.js v26.13.0, Python 3.14, headless Google Chrome via Chrome DevTools Protocol, local `python -m http.server`.

## Automated suites

| Command | Result |
| --- | --- |
| `node --test tests` | **18/18 passed** |
| `node tests/browser-smoke.js` | **43/43 passed** |

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
- All five approved ad tags are configured, the native container id and sponsored link attributes are correct, real slots exist on home/tool/article pages, the privacy policy discloses every network, and no unrelated ad-network tags are present.

### Real-browser smoke tests (43 checks)

Each test navigates to the actual page in headless Chrome, fills real controls, submits and reads the result:

1. Percentage, CGPA, GPA, grade, marks, attendance and score predictor produce expected values.
2. Timetable generation places 7 sessions with no conflicts.
3. Pomodoro starts, displays a decremented clock and pauses/resets without exceptions.
4. Exam countdown, study tracker, assignment planner, flashcards, quiz, revision notes, question picker and vocabulary trainer all save and display data through IndexedDB.
5. Word/character counters, reading time, text case, citations, age, date difference and unit converter return correct live results.
6. Instant search finds the right tool; theme toggle changes `data-theme`; offline page renders.
7. Edge cases in the browser: division by zero, attendance above total and invalid leap date all show guidance instead of wrong numbers or console errors.
8. Export → import round-trip succeeds; service worker registers; no horizontal overflow at 390×844 on the homepage or a tool page.
9. The homepage and a tool page opened over `file://` load all four stylesheets, show the correct background and colours, run a calculation, and expose working relative links. The web manifest is attached only over HTTP(S), so disk preview produces no console error.
10. With ads enabled, the homepage contains an active 468×60 slot, the correct `atOptions` key, the pop-under, social-bar and SmartLink tags, and a sponsored footer link. A tool page contains the native banner container and its tag. External ad domains are blocked during this check, so no live creative is required.

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

## Not measured in this environment

- Lighthouse LCP/INP/CLS scores: Chrome headless here was driven through CDP without the Lighthouse package; no scores are claimed.
- Live ad delivery, viewability, earnings and referral traffic: only our injection code was verified with external ad domains blocked. Real creatives, network approval and revenue depend on the provider accounts.
- Real AdSense behaviour: not used; the supplied third-party network tags were integrated instead.
- Device-specific audio behaviour for Pomodoro: sound is opt-in and browser-dependent.
- Cross-browser manual review beyond headless Chrome (Firefox/Safari layout should still be checked before a public launch).

All 25 tools were individually exercised; none are decorative.
