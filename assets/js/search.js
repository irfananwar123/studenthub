(function (global) {
  'use strict';
  var SH = global.StudentHub = global.StudentHub || {};

  function resultLink(tool, index) {
    var a = SH.el('a', { class: 'search-result', href: SH.toolUrl(tool.id), id: 'search-option-' + index, role: 'option' });
    var iconWrap = SH.el('span', { class: 'search-result-icon' });
    iconWrap.appendChild(SH.icon(tool.category === 'Writing Tools' ? 'pencil' : tool.category === 'Study Planning' ? 'calendar' : tool.category === 'Learning Tools' ? 'book' : 'calculator', 18));
    a.appendChild(iconWrap);
    var body = SH.el('span', { class: 'search-result-body' });
    body.appendChild(SH.el('span', { class: 'search-result-name', text: tool.name }));
    body.appendChild(SH.el('span', { class: 'search-result-meta', text: tool.category + ' — ' + tool.desc }));
    a.appendChild(body);
    a.appendChild(SH.icon('arrow', 16));
    return a;
  }

  function initContainer(container) {
    var input = container.querySelector('[data-search-input]');
    var list = container.querySelector('[data-search-results]');
    var form = container.querySelector('[data-search-form]');
    if (!input || !list) return;
    var matches = [];
    var active = -1;

    function renderRecent() {
      var recent = SH.storage ? SH.storage.prefs.getRecentSearches() : [];
      list.textContent = '';
      if (!recent.length) {
        list.appendChild(SH.el('p', { class: 'search-hint', text: 'Try “attendance”, “word counter” or “GPA”.' }));
        return;
      }
      var heading = SH.el('p', { class: 'search-list-title', text: 'Recent searches' });
      list.appendChild(heading);
      recent.forEach(function (q) {
        var btn = SH.el('button', { type: 'button', class: 'search-recent', text: q });
        btn.addEventListener('click', function () { input.value = q; input.focus(); update(); });
        list.appendChild(btn);
      });
    }
    function setActive(next) {
      var nodes = list.querySelectorAll('.search-result');
      if (!nodes.length) return;
      active = (next + nodes.length) % nodes.length;
      nodes.forEach(function (n, i) {
        n.classList.toggle('is-active', i === active);
        if (i === active) {
          input.setAttribute('aria-activedescendant', n.id);
          n.scrollIntoView({ block: 'nearest' });
        }
      });
    }
    function update() {
      var q = input.value.trim();
      list.textContent = '';
      if (!q) { active = -1; input.removeAttribute('aria-activedescendant'); renderRecent(); return; }
      matches = SH.searchTools(q).slice(0, 8);
      if (!matches.length) {
        list.appendChild(SH.el('div', { class: 'search-empty', role: 'status' }, [
          SH.icon('search', 22),
          SH.el('strong', { text: 'No tools found for “' + q + '”' }),
          SH.el('span', { text: 'Check the spelling or browse all 25 tools below.' })
        ]));
        return;
      }
      list.appendChild(SH.el('p', { class: 'search-list-title', text: matches.length + (matches.length === 1 ? ' tool' : ' tools') + ' found' }));
      matches.forEach(function (tool, i) { list.appendChild(resultLink(tool, i)); });
      active = -1;
    }
    input.addEventListener('input', update);
    input.addEventListener('focus', update);
    input.addEventListener('keydown', function (e) {
      var nodes = list.querySelectorAll('.search-result');
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
      else if (e.key === 'Escape') { input.value = ''; update(); }
      else if (e.key === 'Enter' && active >= 0 && nodes[active]) { e.preventDefault(); location.href = nodes[active].getAttribute('href'); }
    });
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = input.value.trim();
      if (!q) return;
      if (SH.storage) SH.storage.prefs.addRecentSearch(q);
      var first = SH.searchTools(q)[0];
      location.href = first ? SH.toolUrl(first.id) : '/#all-tools';
    });
    document.addEventListener('click', function (e) {
      if (!container.contains(e.target)) { list.classList.add('is-hidden'); }
      else { list.classList.remove('is-hidden'); }
    });
    update();
  }

  function init() {
    document.querySelectorAll('[data-search]').forEach(initContainer);
  }
  SH.search = { init: init };
})(window);
