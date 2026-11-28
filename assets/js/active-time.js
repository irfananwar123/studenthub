/* Real active time spent on StudentHub, measured only on this device.
   Segments count while the tab is visible, the window is focused and the user
   is not idle. They are flushed into LocalStorage as small daily totals used
   by the Website Time Tracker and Study Time Analytics dashboards. Nothing is
   uploaded: there is no analytics endpoint, account or cross-user counter. */
(function (global) {
  'use strict';
  var SH = global.StudentHub = global.StudentHub || {};
  var KEY = 'activeTime';
  var IDLE_MS = 120000;
  var FLUSH_MS = 15000;
  var MAX_DAYS = 45;
  var MAX_EVENTS = 400;
  var events = [];
  var pendingMs = 0;
  var segmentStart = 0;
  var active = false;
  var blurred = false;
  var lastActivity = Date.now();
  var inputStamp = 0;
  var idleTimer = null;

  function localDay(date) {
    var shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return shifted.toISOString().slice(0, 10);
  }
  function sourceId() {
    var body = document.body || {};
    return body.getAttribute('data-tool-id') || body.getAttribute('data-page') || 'page';
  }
  function pageId() {
    var body = document.body || {};
    if (body.getAttribute('data-tool-id')) return body.getAttribute('data-page') || 'tool';
    return body.getAttribute('data-page') || 'page';
  }
  function load() {
    var value = SH.storage.prefs.get(KEY, []);
    return Array.isArray(value) ? value : [];
  }
  function validDay(day) {
    return typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day) && !isNaN(Date.parse(day + 'T00:00:00Z'));
  }
  function prune(list) {
    var cutoff = Date.now() - MAX_DAYS * 86400000;
    return list.filter(function (row) {
      return row && validDay(row.day) && Date.parse(row.day + 'T00:00:00Z') >= cutoff &&
        typeof row.seconds === 'number' && isFinite(row.seconds) && row.seconds > 0;
    }).slice(-MAX_EVENTS);
  }
  function merge(list, addition) {
    var found = null;
    list.forEach(function (row) {
      if (!found && row && row.day === addition.day && row.source === addition.source && row.page === addition.page) found = row;
    });
    if (found) {
      found.seconds = Math.min(86400, Math.round((found.seconds || 0) + addition.seconds));
      found.t = addition.t;
    } else {
      list.push(addition);
    }
  }
  function signal(detail) {
    try { global.dispatchEvent(new CustomEvent('studenthub:active-time', { detail: detail || {} })); }
    catch (e) { /* older browsers still persist and render on their own timers */ }
  }
  function savePending() {
    var seconds = Math.floor(pendingMs / 1000);
    if (seconds <= 0) return;
    var fresh = prune(load());
    var now = Date.now();
    merge(fresh, {
      day: localDay(new Date()), seconds: seconds, source: sourceId(), page: pageId(), t: now
    });
    events = prune(fresh);
    SH.storage.prefs.set(KEY, events);
    pendingMs = Math.max(0, pendingMs - seconds * 1000);
    signal({ saved: seconds });
  }
  function captureSegment() {
    if (!active) return;
    var elapsed = Math.min(Math.max(0, Date.now() - segmentStart), IDLE_MS);
    pendingMs += elapsed;
    active = false;
    segmentStart = 0;
    if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
  }
  function pause() {
    captureSegment();
    savePending();
  }
  function wake() {
    var now = Date.now();
    lastActivity = now;
    inputStamp = now;
  }
  function openSegment() {
    if (active || document.hidden || blurred) return;
    active = true;
    segmentStart = Date.now();
    var remaining = Math.max(0, IDLE_MS - (Date.now() - lastActivity));
    if (remaining === 0) { pause(); return; }
    idleTimer = global.setTimeout(pause, remaining);
  }
  function noteActivity() {
    var now = Date.now();
    if (now - inputStamp < 1000) return;
    wake();
    if (active) {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = global.setTimeout(pause, IDLE_MS);
    }
  }
  function resume() {
    wake();
    openSegment();
  }
  function flush(keepActive) {
    captureSegment();
    savePending();
    if (keepActive !== false && !document.hidden && !blurred) openSegment();
  }
  function clear() {
    var wasActive = active;
    captureSegment();
    pendingMs = 0;
    events = [];
    SH.storage.prefs.set(KEY, events);
    if (wasActive && !document.hidden && !blurred) openSegment();
    signal({ cleared: true });
  }
  function currentMs() {
    var segment = active ? Math.min(Math.max(0, Date.now() - segmentStart), IDLE_MS) : 0;
    return Math.max(0, pendingMs + segment);
  }
  function snapshot() {
    events = load();
    return events.slice();
  }

  SH.activeTime = {
    KEY: KEY, IDLE_MS: IDLE_MS,
    events: snapshot, currentMs: currentMs, flush: flush, clear: clear
  };

  function init() {
    events = load();
    wake();
    if (!document.hidden) openSegment();
    global.setInterval(function () { flush(true); }, FLUSH_MS);
    ['keydown', 'pointerdown', 'touchstart', 'scroll', 'mousemove'].forEach(function (type) {
      document.addEventListener(type, noteActivity, { passive: true });
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) pause();
      else if (!blurred) resume();
    });
    global.addEventListener('blur', function () { blurred = true; pause(); });
    global.addEventListener('focus', function () { blurred = false; resume(); });
    global.addEventListener('pagehide', function () { flush(false); });
    global.addEventListener('pageshow', function (event) { if (event.persisted) resume(); });
    global.addEventListener('storage', function (event) {
      if (event.key === 'studenthub:' + KEY) { events = load(); signal({ external: true }); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window);
