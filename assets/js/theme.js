(function (global) {
  'use strict';
  var SH = global.StudentHub = global.StudentHub || {};
  var media = global.matchMedia ? global.matchMedia('(prefers-color-scheme: dark)') : null;

  function systemDark() { return !!(media && media.matches); }
  function apply() {
    var pref = SH.storage ? SH.storage.prefs.getTheme() : 'auto';
    var theme = pref === 'auto' ? (systemDark() ? 'dark' : 'light') : pref;
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      var label = btn.querySelector('[data-theme-label]');
      if (label) label.textContent = theme === 'dark' ? 'Light' : 'Dark';
    });
  }
  function init() {
    apply();
    document.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-theme-toggle]');
      if (!btn) return;
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'dark' ? 'light' : 'dark';
      if (SH.storage) SH.storage.prefs.setTheme(next);
      apply();
    });
    if (media) {
      var handler = function () {
        if (!SH.storage || SH.storage.prefs.getTheme() === 'auto') apply();
      };
      if (media.addEventListener) media.addEventListener('change', handler);
      else if (media.addListener) media.addListener(handler);
    }
  }
  SH.theme = { init: init, apply: apply, systemDark: systemDark };
})(window);
