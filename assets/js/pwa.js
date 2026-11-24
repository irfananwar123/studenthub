(function (global) {
  'use strict';
  var SH = global.StudentHub = global.StudentHub || {};

  function init() {
    var secureLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || secureLocal)) {
      global.addEventListener('load', function () {
        navigator.serviceWorker.register(SH.rootUrl('sw.js'), { scope: SH.base() || '/' }).catch(function () {});
      });
    }
    var indicator = document.getElementById('offline-indicator');
    function update() {
      if (!indicator) return;
      var offline = !navigator.onLine;
      indicator.hidden = !offline;
      indicator.setAttribute('role', offline ? 'status' : 'none');
    }
    global.addEventListener('online', update);
    global.addEventListener('offline', update);
    update();
  }
  SH.pwa = { init: init };
})(window);
