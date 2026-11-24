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
    var path = location.pathname.replace(/\/index\.html$/, '/');
    document.querySelectorAll('#primary-navigation a[href]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || href === '/' || href === '#') return;
      if (path === href || (href !== '/' && path.indexOf(href) === 0)) {
        link.setAttribute('aria-current', 'page');
      }
    });
    var year = document.querySelector('[data-current-year]');
    if (year) year.textContent = String(new Date().getFullYear());
  }
  SH.navigation = { init: init };
})(window);
