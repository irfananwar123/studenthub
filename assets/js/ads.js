/* Advertising placements.
   Approved network tags are configured here, not hard-coded into every page.
   Ads are skipped on privacy-sensitive pages and when ?noads=1 is present. */
(function (global) {
  'use strict';
  var config = {
    enabled: true,
    pagesWithoutAds: ['/privacy-policy/', '/contact/', '/workspace/'],
    placements: {
      popunder: {
        enabled: true,
        src: 'https://afders.org/1/3c0e12112693371a49e8da1ecaf03499'
      },
      smartlink: {
        enabled: true,
        href: 'https://arwf.org/4/f9c719598061c9d7137f077570fe38b1',
        label: 'Sponsored suggestion',
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
    slotMap: { home: 'banner468', article: 'native', tool: 'native' }
  };

  function blockedPage() {
    var path = location.pathname.replace(/\\/g, '/').toLowerCase();
    return config.pagesWithoutAds.some(function (p) {
      return path.indexOf(p.replace(/^\//, '')) !== -1;
    });
  }

  function addScript(src, parent) {
    var script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    (parent || document.head).appendChild(script);
    return script;
  }

  function activateSlot(slot, type) {
    slot.hidden = false;
    slot.classList.add('ad-slot-active');
    slot.setAttribute('aria-label', 'Advertisement');
    slot.textContent = '';
    if (type === 'native') {
      var box = document.createElement('div');
      box.id = config.placements.native.containerId;
      slot.appendChild(box);
      addScript(config.placements.native.src, slot);
    } else {
      var holder = document.createElement('div');
      holder.className = 'ad-unit-banner';
      global.atOptions = {
        key: config.placements.banner468.key,
        format: 'iframe',
        height: config.placements.banner468.height,
        width: config.placements.banner468.width,
        params: {}
      };
      slot.appendChild(holder);
      addScript(config.placements.banner468.src, holder);
    }
  }

  function addSmartLink() {
    var p = config.placements.smartlink;
    var wrap = document.createElement('span');
    wrap.className = 'sponsored-links';
    var link = document.createElement('a');
    link.href = p.href;
    link.target = '_blank';
    link.rel = p.rel;
    link.textContent = p.label;
    wrap.appendChild(link);
    wrap.appendChild(document.createTextNode(' · '));
    var footer = document.querySelector('.footer-bottom');
    if (footer) footer.insertBefore(wrap, footer.firstChild);
    else document.body.appendChild(wrap);
  }

  function init() {
    var testMode = /[?&]noads=1(?:&|$)/.test(location.search);
    if (!config.enabled || testMode || blockedPage()) {
      document.querySelectorAll('[data-ad-slot]').forEach(function (slot) { slot.hidden = true; });
      return;
    }
    document.querySelectorAll('[data-ad-slot]').forEach(function (slot) {
      var type = config.slotMap[slot.getAttribute('data-ad-slot')];
      if (!type || !config.placements[type] || !config.placements[type].enabled) {
        slot.hidden = true;
        return;
      }
      activateSlot(slot, type);
    });
    if (config.placements.popunder.enabled) addScript(config.placements.popunder.src, document.head);
    if (config.placements.socialBar.enabled) addScript(config.placements.socialBar.src, document.head);
    if (config.placements.smartlink.enabled) addSmartLink();
  }

  global.StudentHub = global.StudentHub || {};
  global.StudentHub.ads = { config: config, init: init };
})(window);
