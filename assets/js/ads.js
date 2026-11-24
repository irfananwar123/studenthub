/* Advertising readiness.
   All placements are disabled by default. No ad network code is included.
   To enable later, set enabled = true ONLY after an approved publisher account
   exists, and replace the placeholder function with that platform's official
   tag. Never place ads on privacy-sensitive pages or over tool controls. */
(function (global) {
  'use strict';
  var config = {
    enabled: false,
    client: '',
    slots: { home: '', article: '', tool: '' },
    pagesWithoutAds: ['/privacy-policy/', '/contact/', '/workspace/']
  };
  function init() {
    document.querySelectorAll('[data-ad-slot]').forEach(function (node) {
      var name = node.getAttribute('data-ad-slot');
      var allowed = config.pagesWithoutAds.indexOf(location.pathname) === -1;
      if (!config.enabled || !allowed || !config.slots[name]) {
        node.hidden = true;
        return;
      }
      node.hidden = false;
      node.setAttribute('aria-label', 'Advertisement');
      if (typeof config.render === 'function') config.render(node, name);
    });
  }
  global.StudentHub = global.StudentHub || {};
  global.StudentHub.ads = { config: config, init: init };
})(window);
