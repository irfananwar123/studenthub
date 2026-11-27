/* Light / Dark / Auto + saved accent colour.
   Themes are stored as studenthub:theme ("light", "dark" or "auto") and accents
   as studenthub:accent ("blue", "violet", "teal" or "amber"). "auto" follows
   prefers-color-scheme and keeps following it while the page is open. Small
   inline scripts in <head> apply both choices before CSS loads, so there is no
   flash of the wrong appearance. No study data is involved. */
(function (global) {
  'use strict';
  var SH = global.StudentHub = global.StudentHub || {};
  var doc = global.document;
  var root = doc.documentElement;
  var VALID = { light: true, dark: true, auto: true };
  var VALID_ACCENT = { blue: true, violet: true, teal: true, amber: true };
  var META_COLOURS = { light: '#f5f8ff', dark: '#07101f' };
  var media = global.matchMedia ? global.matchMedia('(prefers-color-scheme: dark)') : null;
  var mediaBound = false;
  var boundControls = false;

  function normalize(value) {
    return VALID[value] ? value : 'auto';
  }

  function normalizeAccent(value) {
    return VALID_ACCENT[value] ? value : 'blue';
  }

  function read() {
    if (SH.storage && SH.storage.prefs && typeof SH.storage.prefs.getTheme === 'function') {
      return normalize(SH.storage.prefs.getTheme());
    }
    try {
      var raw = global.localStorage.getItem('studenthub:theme');
      if (raw !== null) {
        var value = JSON.parse(raw);
        if (VALID[value]) return value;
      }
    } catch (e) { /* private mode or unavailable storage */ }
    return 'auto';
  }

  function readAccent() {
    if (SH.storage && SH.storage.prefs && typeof SH.storage.prefs.getAccent === 'function') {
      return normalizeAccent(SH.storage.prefs.getAccent());
    }
    try {
      var raw = global.localStorage.getItem('studenthub:accent');
      if (raw !== null) {
        var value = JSON.parse(raw);
        if (VALID_ACCENT[value]) return value;
      }
    } catch (e) { /* private mode or unavailable storage */ }
    return 'blue';
  }

  function systemDark() {
    return !!(media && media.matches);
  }

  function resolve(preference) {
    return preference === 'auto' ? (systemDark() ? 'dark' : 'light') : preference;
  }

  function updateMeta(mode) {
    var meta = doc.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', META_COLOURS[mode]);
  }

  function syncControls(preference) {
    var buttons = doc.querySelectorAll('[data-theme-option]');
    for (var i = 0; i < buttons.length; i++) {
      var button = buttons[i];
      var selected = button.getAttribute('data-theme-option') === preference;
      button.setAttribute('aria-pressed', selected ? 'true' : 'false');
      if (selected) button.classList.add('is-active');
      else button.classList.remove('is-active');
    }
  }

  function syncAccentControls(accent) {
    var buttons = doc.querySelectorAll('[data-accent-option]');
    for (var i = 0; i < buttons.length; i++) {
      var button = buttons[i];
      var selected = button.getAttribute('data-accent-option') === accent;
      button.setAttribute('aria-pressed', selected ? 'true' : 'false');
      if (selected) button.classList.add('is-active');
      else button.classList.remove('is-active');
    }
  }

  function syncStatus() {
    var labels = doc.querySelectorAll('[data-appearance-status]');
    if (!labels.length) return;
    var preference = root.getAttribute('data-theme-preference') || read();
    var accent = root.getAttribute('data-accent') || readAccent();
    var text = preference + ' · ' + accent + (preference === 'auto' ? ' · follows device' : '');
    for (var i = 0; i < labels.length; i++) labels[i].textContent = text;
  }

  function apply(preference, persist) {
    var value = normalize(preference);
    if (persist && SH.storage && SH.storage.prefs && typeof SH.storage.prefs.setTheme === 'function') {
      SH.storage.prefs.setTheme(value);
    }
    var mode = resolve(value);
    root.setAttribute('data-theme', mode);
    root.setAttribute('data-theme-preference', value);
    updateMeta(mode);
    syncControls(value);
    syncStatus();
    return mode;
  }

  function set(value) {
    return apply(value, true);
  }

  function applyAccent(value, persist) {
    var accent = normalizeAccent(value);
    if (persist && SH.storage && SH.storage.prefs && typeof SH.storage.prefs.setAccent === 'function') {
      SH.storage.prefs.setAccent(accent);
    }
    root.setAttribute('data-accent', accent);
    syncAccentControls(accent);
    syncStatus();
    return accent;
  }

  function setAccent(value) {
    return applyAccent(value, true);
  }

  function reset() {
    set('auto');
    return setAccent('blue');
  }

  function bindControls() {
    if (boundControls) return;
    doc.addEventListener('click', function (event) {
      var node = event.target && event.target.closest ? event.target : null;
      if (!node) return;
      var accentTarget = node.closest('[data-accent-option]');
      if (accentTarget) {
        var accent = accentTarget.getAttribute('data-accent-option');
        if (VALID_ACCENT[accent]) setAccent(accent);
        return;
      }
      var resetTarget = node.closest('[data-theme-reset]');
      if (resetTarget) {
        reset();
        return;
      }
      var target = node.closest('[data-theme-option]');
      if (!target) return;
      var value = target.getAttribute('data-theme-option');
      if (!VALID[value]) return;
      set(value);
    });
    boundControls = true;
  }

  function bindSystem() {
    if (!media || mediaBound) return;
    var onChange = function () {
      if (read() === 'auto') apply('auto', false);
    };
    if (typeof media.addEventListener === 'function') media.addEventListener('change', onChange);
    else if (typeof media.addListener === 'function') media.addListener(onChange);
    global.addEventListener('storage', function (event) {
      if (event.key === 'studenthub:theme') apply(read(), false);
      if (event.key === 'studenthub:accent') applyAccent(readAccent(), false);
    });
    mediaBound = true;
  }

  function init() {
    bindControls();
    bindSystem();
    apply(read(), false);
    applyAccent(readAccent(), false);
  }

  SH.theme = {
    init: init,
    apply: apply,
    set: set,
    get: read,
    getPreference: read,
    getMode: function () { return root.getAttribute('data-theme') || resolve(read()); },
    applyAccent: applyAccent,
    setAccent: setAccent,
    getAccent: readAccent,
    reset: reset,
    systemDark: systemDark,
    /* Legacy cached pages may still call apply() with no argument. */
    refresh: function () { apply(read(), false); return applyAccent(readAccent(), false); }
  };
})(window);
