/* Fixed light theme. Dark mode was removed intentionally so every page and
   tool renders with the same contrast and spacing. This module keeps the old
   API for cached scripts, enforces the light palette and hides any stale
   toggle that an older cached page may still contain. */
(function (global) {
  'use strict';
  var SH = global.StudentHub = global.StudentHub || {};
  function apply() {
    document.documentElement.setAttribute('data-theme', 'light');
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) { btn.hidden = true; });
  }
  function init() { apply(); }
  SH.theme = { init: init, apply: apply, systemDark: function () { return false; } };
})(window);
