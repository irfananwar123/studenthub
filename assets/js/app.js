(function (global) {
  'use strict';
  var SH = global.StudentHub = global.StudentHub || {};
  function boot() {
    if (SH.theme) SH.theme.init();
    if (SH.navigation) SH.navigation.init();
    if (SH.search) SH.search.init();
    if (SH.pwa) SH.pwa.init();
    if (SH.ads) SH.ads.init();
    document.querySelectorAll('[data-print]').forEach(function (btn) {
      btn.addEventListener('click', function () { window.print(); });
    });
    document.querySelectorAll('[data-reload]').forEach(function (btn) {
      btn.addEventListener('click', function () { window.location.reload(); });
    });
    document.documentElement.classList.add('js-ready');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
