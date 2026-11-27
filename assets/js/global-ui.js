/* StudentHub global interface layer: scroll progress, sticky context,
   reveal-on-scroll, smooth anchors, command palette and mobile quick bar.
   No network calls, no dependencies, no injected HTML strings. */
(function (global) {
  'use strict';
  var SH = global.StudentHub = global.StudentHub || {};
  var motionQuery = global.matchMedia ? global.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduced = !!(motionQuery && motionQuery.matches);
  var paletteItems = [], selected = 0, lastFocus = null, lastActive = null, ticking = false;

  function q(selector, root) { return (root || document).querySelector(selector); }
  function qa(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
  function scrollToTop() {
    if (global.scrollTo) global.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    else document.documentElement.scrollTop = 0;
  }

  function currentSection() {
    var sections = qa('main section');
    var best = null;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= 160) best = sections[i];
      else break;
    }
    return best;
  }

  function updateScrollUi() {
    ticking = false;
    var doc = document.documentElement;
    var max = doc.scrollHeight - global.innerHeight;
    var pct = max > 0 ? Math.min(100, Math.max(0, global.scrollY / max * 100)) : 0;
    var bar = q('[data-scroll-progress]');
    if (bar) {
      var fill = q('span', bar);
      if (fill) fill.style.width = pct + '%';
      bar.setAttribute('aria-valuenow', String(Math.round(pct)));
    }
    var header = q('.site-header');
    if (header) header.classList.toggle('is-stuck', global.scrollY > 120);
    var top = q('[data-back-to-top]');
    if (top) top.hidden = global.scrollY < 420;
    var section = currentSection();
    var context = q('[data-header-context]');
    if (context) {
      var heading = section ? q('h1, h2', section) : null;
      context.textContent = heading ? heading.textContent.trim() : '';
      context.hidden = !heading || global.scrollY <= 160;
    }
    var activeId = section && section.id ? section.id : null;
    if (lastActive && lastActive !== activeId) {
      qa('a[href="#' + lastActive + '"]').forEach(function (a) { a.removeAttribute('aria-current'); });
    }
    if (activeId) {
      qa('a[href="#' + activeId + '"]').forEach(function (a) { a.setAttribute('aria-current', 'location'); });
    }
    lastActive = activeId;
    if (activeId) doc.setAttribute('data-active-section', activeId);
    else doc.removeAttribute('data-active-section');
  }

  function scheduleScrollUpdate() {
    if (ticking) return;
    ticking = true;
    global.requestAnimationFrame(updateScrollUi);
  }

  function setupScroll() {
    global.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
    global.addEventListener('resize', scheduleScrollUpdate);
    var top = q('[data-back-to-top]');
    if (top) top.addEventListener('click', scrollToTop);
    updateScrollUi();
  }

  function setupReveal() {
    var nodes = qa('.tool-card, .category-card, .article-card, .tip-card, .advanced-card, .section-head, [data-reveal]');
    if (!nodes.length) return;
    if (reduced || !('IntersectionObserver' in global)) {
      nodes.forEach(function (node) { node.classList.add('is-visible'); });
      return;
    }
    nodes.forEach(function (node) { node.setAttribute('data-reveal', ''); });
    document.documentElement.classList.add('has-reveal');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    nodes.forEach(function (node) { observer.observe(node); });
  }

  function setupAnchors() {
    document.addEventListener('click', function (e) {
      if (!e.target || typeof e.target.closest !== 'function') return;
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var hash = link.getAttribute('href');
      if (!hash || hash === '#') return;
      var target = document.getElementById(hash.slice(1));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      try { global.history.replaceState(null, '', hash); } catch (err) { /* file:// is fine without history */ }
    });
  }

  function palettePages() {
    return [
      { name: 'All tools', desc: 'Browse the complete tool library', href: SH.homeUrl('#all-tools') },
      { name: 'Daily calculators', desc: 'Everyday maths and statistics tools', href: SH.homeUrl('#daily-calculators') },
      { name: 'Advanced dashboards', desc: 'Study analytics and learning theory', href: SH.rootUrl('advanced/index.html') },
      { name: 'My workspace', desc: 'Favourites, history and local backup', href: SH.rootUrl('workspace/index.html') },
      { name: 'Study guides', desc: 'Short, practical articles', href: SH.homeUrl('#articles') }
    ];
  }

  function matches(item, words) {
    var hay = (item.name + ' ' + item.desc).toLowerCase();
    return words.every(function (word) { return hay.indexOf(word) !== -1; });
  }

  function buildPaletteItems(query) {
    var words = String(query || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    var tools = SH.searchTools(words.join(' ')).slice(0, 8).map(function (t) {
      return { name: t.name, desc: t.category + ' · ' + t.desc, href: SH.toolUrl(t.id) };
    });
    var pages = palettePages().filter(function (p) { return !words.length || matches(p, words); });
    return tools.concat(pages).slice(0, 10);
  }

  function renderPalette() {
    var list = q('[data-palette-results]');
    if (!list) return;
    list.textContent = '';
    paletteItems = buildPaletteItems(q('[data-palette-input]') ? q('[data-palette-input]').value : '');
    if (!paletteItems.length) {
      list.appendChild(SH.el('p', { class: 'palette-empty', text: 'No matches. Try a different word.' }));
      return;
    }
    if (selected >= paletteItems.length) selected = 0;
    paletteItems.forEach(function (item, index) {
      var button = SH.el('button', {
        class: 'palette-item' + (index === selected ? ' is-selected' : ''),
        type: 'button', role: 'option', 'aria-selected': index === selected ? 'true' : 'false'
      });
      button.appendChild(SH.el('span', { class: 'palette-item-name', text: item.name }));
      button.appendChild(SH.el('span', { class: 'palette-item-desc', text: item.desc }));
      button.addEventListener('click', function () { global.location.href = item.href; });
      list.appendChild(button);
    });
  }

  function openPalette() {
    var palette = q('[data-command-palette]');
    if (!palette) return;
    lastFocus = document.activeElement;
    palette.hidden = false;
    document.body.style.overflow = 'hidden';
    selected = 0;
    var input = q('[data-palette-input]', palette);
    if (input) { input.value = ''; renderPalette(); input.focus(); }
  }

  function closePalette() {
    var palette = q('[data-command-palette]');
    if (!palette || palette.hidden) return;
    palette.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  function setupPalette() {
    var palette = q('[data-command-palette]');
    if (!palette) return;
    var input = q('[data-palette-input]', palette);
    if (input) input.addEventListener('input', function () { selected = 0; renderPalette(); });
    qa('[data-palette-open], [data-quick-action="search"]').forEach(function (button) {
      button.addEventListener('click', openPalette);
    });
    qa('[data-palette-close]', palette).forEach(function (button) {
      button.addEventListener('click', closePalette);
    });
    document.addEventListener('keydown', function (e) {
      var key = String(e.key || '').toLowerCase();
      if ((e.ctrlKey || e.metaKey) && key === 'k') {
        e.preventDefault();
        if (palette.hidden) openPalette(); else closePalette();
        return;
      }
      if (palette.hidden) return;
      if (key === 'escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        closePalette();
      } else if (key === 'arrowdown') {
        e.preventDefault();
        selected = Math.min(selected + 1, Math.max(0, paletteItems.length - 1));
        renderPalette();
      } else if (key === 'arrowup') {
        e.preventDefault();
        selected = Math.max(selected - 1, 0);
        renderPalette();
      } else if (key === 'enter' && paletteItems[selected]) {
        e.preventDefault();
        global.location.href = paletteItems[selected].href;
      } else if (key === 'tab') {
        var focusables = qa('button, input', palette);
        if (!focusables.length) return;
        var first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  function setupQuickBar() {
    qa('[data-quick-action]').forEach(function (button) {
      if (button.getAttribute('data-quick-action') === 'search') return;
      button.addEventListener('click', function () {
        var action = button.getAttribute('data-quick-action');
        if (action === 'top') scrollToTop();
        else if (action === 'tools') global.location.href = SH.homeUrl('#all-tools');
        else if (action === 'workspace') global.location.href = SH.rootUrl('workspace/index.html');
      });
    });
  }

  function init() {
    setupScroll();
    setupAnchors();
    setupPalette();
    setupQuickBar();
    setTimeout(setupReveal, 0);
    if (motionQuery && typeof motionQuery.addEventListener === 'function') {
      motionQuery.addEventListener('change', function (event) {
        reduced = event.matches;
        if (reduced) qa('[data-reveal]').forEach(function (node) { node.classList.add('is-visible'); });
      });
    }
  }

  SH.globalUI = { init: init, openPalette: openPalette, closePalette: closePalette,
    update: updateScrollUi, isReduced: function () { return reduced; } };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 0); });
  else setTimeout(init, 0);
})(window);
