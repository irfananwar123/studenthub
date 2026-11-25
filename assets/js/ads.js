/* Advertising configuration, block detection and graceful fallback.
   The network tags are emitted as static, parse-time HTML by scripts/generate.js.
   That is required for the 468x60 tag, which uses document.write and cannot be
   injected after the page has loaded. This file never duplicates those tags.

   When a blocker stops the third-party scripts, the site cannot force those
   exact remote creatives to load. Instead it shows clearly labelled,
   first-party sponsored banners hosted on this domain, plus a polite inline
   notice asking the visitor to allow ads. Private study data is never sent
   anywhere, and ?noads=1 / the ad-free pages remain respected. */
(function (global) {
  'use strict';
  var config = {
    enabled: true,
    pagesWithoutAds: ['/privacy-policy/', '/contact/', '/workspace/'],
    fallbackDelay: 4000,
    noticeStorageKey: 'studenthub:ad-notice-dismissed',
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
    },
    firstParty: {
      creatives: [
        { file: 'assets/ads/sponsored-blue.svg', label: 'Sponsored: support StudentHub' },
        { file: 'assets/ads/sponsored-teal.svg', label: 'Sponsored: keep StudentHub free' },
        { file: 'assets/ads/sponsored-violet.svg', label: 'Sponsored: study smarter with StudentHub' }
      ],
      notice: 'Ads are being blocked. StudentHub stays free thanks to sponsors — please consider allowing ads for this site.'
    }
  };

  var base = global.document.documentElement.getAttribute('data-base') || '';
  var blocked = global.document.documentElement.getAttribute('data-ad-blocked') === '1';
  var bait = null;

  function blockedPage() {
    var path = location.pathname.replace(/\\/g, '/').toLowerCase();
    return config.pagesWithoutAds.some(function (p) {
      return path.indexOf(p.replace(/^\//, '')) !== -1;
    });
  }

  function suppressed() {
    return !config.enabled || /[?&]noads=1(?:&|$)/.test(location.search) || blockedPage();
  }

  /* A hidden bait element using common filter-list class names. It cannot
     collect data; it only tells us whether a blocker is hiding ad markup. */
  function addBait() {
    bait = global.document.createElement('div');
    bait.className = 'adsbox ad-banner ad-placeholder ad-adsbox';
    bait.setAttribute('aria-hidden', 'true');
    bait.style.cssText = 'position:absolute!important;left:-9999px!important;top:0!important;width:12px!important;height:12px!important;';
    global.document.body.appendChild(bait);
  }

  function baitHidden() {
    if (!bait) return false;
    var style = global.getComputedStyle(bait);
    return bait.offsetHeight === 0 || style.display === 'none' || style.visibility === 'hidden';
  }

  function noticeDismissed() {
    try { return global.localStorage.getItem(config.noticeStorageKey) === '1'; } catch (e) { return false; }
  }

  function rememberNotice() {
    try { global.localStorage.setItem(config.noticeStorageKey, '1'); } catch (e) { /* private mode */ }
  }

  function addNotice(slot) {
    if (noticeDismissed() || slot.querySelector('[data-ad-notice]')) return;
    var note = global.document.createElement('p');
    note.className = 'ad-notice';
    note.setAttribute('data-ad-notice', '');
    note.setAttribute('role', 'status');
    note.textContent = config.firstParty.notice;
    var dismiss = global.document.createElement('button');
    dismiss.type = 'button';
    dismiss.className = 'ad-notice-dismiss';
    dismiss.setAttribute('aria-label', 'Dismiss advertising notice');
    dismiss.textContent = 'Dismiss';
    dismiss.addEventListener('click', function () {
      rememberNotice();
      if (note.parentNode) note.parentNode.removeChild(note);
    });
    note.appendChild(dismiss);
    slot.insertBefore(note, slot.firstChild);
  }

  function creativeFor(slot) {
    var list = config.firstParty.creatives;
    var name = slot.getAttribute('data-ad-slot') || '';
    var sum = 0;
    for (var i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return list[sum % list.length];
  }

  function hasCreative(slot) {
    if (slot.querySelector('.ad-first-party')) return true;
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

  function addFallback(slot, isBlocked) {
    if (hasCreative(slot)) return;
    var p = config.placements.smartlink;
    var creative = creativeFor(slot);
    var wrap = global.document.createElement('div');
    wrap.className = 'ad-first-party';

    var link = global.document.createElement('a');
    link.className = 'ad-fallback';
    link.href = p.href;
    link.target = '_blank';
    link.rel = p.rel;
    link.setAttribute('aria-label', creative.label + ' (opens in a new tab)');

    var image = global.document.createElement('img');
    image.src = base + creative.file;
    image.width = 468;
    image.height = 60;
    image.alt = creative.label;
    image.loading = 'lazy';
    link.appendChild(image);

    var caption = global.document.createElement('span');
    caption.className = 'ad-fallback-label';
    caption.textContent = p.label;
    link.appendChild(caption);
    wrap.appendChild(link);
    slot.appendChild(wrap);

    if (isBlocked) addNotice(slot);

    if (global.MutationObserver) {
      var observer = new MutationObserver(function () {
        var real = slot.querySelector('iframe') ||
          (slot.querySelector('[id^="container-"]') && slot.querySelector('[id^="container-"]').children.length) ||
          Array.prototype.some.call(slot.querySelectorAll('.ad-unit-banner'), function (unit) {
            return Array.prototype.some.call(unit.children, function (child) { return child.tagName !== 'SCRIPT'; });
          });
        if (real && wrap.parentNode) {
          wrap.parentNode.removeChild(wrap);
          var note = slot.querySelector('[data-ad-notice]');
          if (note) note.parentNode.removeChild(note);
          observer.disconnect();
        }
      });
      observer.observe(slot, { childList: true, subtree: true });
    }
  }

  function reviewSlot(slot, isBlocked) {
    if (isBlocked) {
      addFallback(slot, true);
    } else {
      global.setTimeout(function () { addFallback(slot, false); }, config.fallbackDelay);
    }
  }

  function init() {
    if (suppressed()) {
      global.document.querySelectorAll('[data-ad-slot]').forEach(function (slot) {
        slot.hidden = true;
        slot.classList.remove('ad-slot-active');
      });
      return;
    }
    addBait();
    var slots = [].slice.call(global.document.querySelectorAll('[data-ad-slot]'));
    global.setTimeout(function () {
      if (baitHidden()) blocked = true;
      slots.forEach(function (slot) {
        slot.hidden = false;
        slot.classList.add('ad-slot-active');
        reviewSlot(slot, blocked);
      });
    }, 80);
  }

  global.StudentHub = global.StudentHub || {};
  global.StudentHub.ads = {
    config: config,
    init: init,
    isBlocked: function () { return blocked; }
  };
})(window);
