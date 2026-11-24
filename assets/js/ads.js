/* Advertising configuration and graceful fallback.
   The network tags are emitted as static, parse-time HTML by scripts/generate.js.
   That is required for the 468x60 tag, which uses document.write and cannot be
   injected after the page has loaded. This file never duplicates those tags:
   it only hides slots on ad-free pages / ?noads=1 and, if a network returns no
   creative, shows a clearly labelled sponsored fallback link. */
(function (global) {
  'use strict';
  var config = {
    enabled: true,
    pagesWithoutAds: ['/privacy-policy/', '/contact/', '/workspace/'],
    fallbackDelay: 4000,
    placements: {
      popunder: {
        enabled: true,
        src: 'https://afders.org/1/3c0e12112693371a49e8da1ecaf03499'
      },
      smartlink: {
        enabled: true,
        href: 'https://arwf.org/4/f9c719598061c9d7137f077570fe38b1',
        label: 'Sponsored · Support StudentHub',
        rel: 'sponsored noopener noreferrer'
      },
      native: {
        enabled: true,
        containerId: 'container-9b5ea66616f3e02be4f9a4fe968d7547',
        src: 'https://bicea.org/21/9b5ea66616f3e02be4f9a4fe968d7547'
      },
      socialBar: {
        enabled: true,
        src: 'https://bicea.org/14/3d7fa5667db565ec11331c4b0846ee9b'
      },
      banner468: {
        enabled: true,
        key: '96d3c3868be22016392b6676ae58d572',
        width: 468,
        height: 60,
        src: 'https://bicea.org/22/96d3c3868be22016392b6676ae58d572'
      }
    }
  };

  function blockedPage() {
    var path = location.pathname.replace(/\\/g, '/').toLowerCase();
    return config.pagesWithoutAds.some(function (p) {
      return path.indexOf(p.replace(/^\//, '')) !== -1;
    });
  }

  function hasCreative(slot) {
    if (slot.querySelector('iframe')) return true;
    var box = slot.querySelector('[id^="container-"]');
    if (box && box.children.length) return true;
    var unit = slot.querySelector('.ad-unit-banner');
    if (unit) {
      return Array.prototype.some.call(unit.children, function (child) {
        return child.tagName !== 'SCRIPT';
      });
    }
    return false;
  }

  function addFallback(slot) {
    if (hasCreative(slot) || slot.querySelector('.ad-fallback')) return;
    var p = config.placements.smartlink;
    var link = document.createElement('a');
    link.className = 'ad-fallback';
    link.href = p.href;
    link.target = '_blank';
    link.rel = p.rel;
    link.textContent = p.label;
    slot.appendChild(link);
    if (global.MutationObserver) {
      var observer = new MutationObserver(function () {
        if (hasCreative(slot) && link.parentNode) {
          link.parentNode.removeChild(link);
          observer.disconnect();
        }
      });
      observer.observe(slot, { childList: true, subtree: true });
    }
  }

  function init() {
    var suppressed = !config.enabled || /[?&]noads=1(?:&|$)/.test(location.search) || blockedPage();
    document.querySelectorAll('[data-ad-slot]').forEach(function (slot) {
      if (suppressed) {
        slot.hidden = true;
        slot.classList.remove('ad-slot-active');
        return;
      }
      slot.hidden = false;
      slot.classList.add('ad-slot-active');
      global.setTimeout(function () { addFallback(slot); }, config.fallbackDelay);
    });
  }

  global.StudentHub = global.StudentHub || {};
  global.StudentHub.ads = { config: config, init: init };
})(window);
