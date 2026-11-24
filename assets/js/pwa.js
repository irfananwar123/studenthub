(function (global) {
  'use strict';
  var SH = global.StudentHub = global.StudentHub || {};

  function init() {
    if ('serviceWorker' in navigator && location.protocol === 'https:') {
      global.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function () {});
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
