(function (global) {
  'use strict';
  var SH = global.StudentHub = global.StudentHub || {};

  function init() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.getElementById('primary-navigation');
    if (toggle && menu) {
      var setOpen = function (open) {
        menu.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        document.body.classList.toggle('menu-open', open);
      };
      toggle.addEventListener('click', function () { setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); }
      });
      document.addEventListener('click', function (e) {
        if (!menu.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
      });
      menu.addEventListener('click', function (e) {
        if (e.target.closest('a')) setOpen(false);
      });
    }
    function normalized(url) {
      try {
        return new URL(url, location.href).pathname.replace(/\\/g, '/')
          .replace(/\/index\.html$/, '/').replace(/\/+$/, '') || '/';
      } catch (e) { return ''; }
    }
    var current = normalized(location.href);
    var home = normalized(SH.rootUrl('index.html'));
    document.querySelectorAll('#primary-navigation a[href]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      var target = normalized(href.split('#')[0]);
      if (!target || target === home) return;
      if (current === target || current.indexOf(target + '/') === 0) {
        link.setAttribute('aria-current', 'page');
      }
    });
    var year = document.querySelector('[data-current-year]');
    if (year) year.textContent = String(new Date().getFullYear());
  }
  SH.navigation = { init: init };
})(window);
