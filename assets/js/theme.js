/* Light / Dark / Auto theme control.
   The preference is stored as studenthub:theme ("light", "dark" or "auto").
   "auto" follows prefers-color-scheme and keeps following it while the page is
   open. A tiny inline script in <head> applies the same resolution before CSS
   loads, so there is no flash of the wrong theme. No study data is involved. */
(function (global) {
  'use strict';
  var SH = global.StudentHub = global.StudentHub || {};
  var doc = global.document;
  var root = doc.documentElement;
  var VALID = { light: true, dark: true, auto: true };
  var META_COLOURS = { light: '#f5f8ff', dark: '#07101f' };
  var media = global.matchMedia ? global.matchMedia('(prefers-color-scheme: dark)') : null;
  var mediaBound = false;
  var boundControls = false;

  function normalize(value) {
    return VALID[value] ? value : 'auto';
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
    return mode;
  }

  function set(value) {
    return apply(value, true);
  }

  function bindControls() {
    if (boundControls) return;
    doc.addEventListener('click', function (event) {
      var target = event.target && event.target.closest ? event.target.closest('[data-theme-option]') : null;
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
    });
    mediaBound = true;
  }

  function init() {
    bindControls();
    bindSystem();
    apply(read(), false);
  }

  SH.theme = {
    init: init,
    apply: apply,
    set: set,
    get: read,
    getPreference: read,
    getMode: function () { return root.getAttribute('data-theme') || resolve(read()); },
    systemDark: systemDark,
    /* Legacy cached pages may still call apply() with no argument. */
    refresh: function () { return apply(read(), false); }
  };
})(window);
