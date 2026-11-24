(function (global) {
  'use strict';
  var SH = global.StudentHub = global.StudentHub || {};

  function value(id) {
    var node = typeof id === 'string' ? document.getElementById(id) : id;
    return node ? String(node.value).trim() : '';
  }
  function number(id) {
    var raw = value(id);
    if (raw === '') return NaN;
    var n = Number(raw);
    return isFinite(n) ? n : NaN;
  }
  function fmt(n, dp) {
    if (typeof n !== 'number' || !isFinite(n)) return '—';
    return new Intl.NumberFormat(undefined, { minimumFractionDigits: 0, maximumFractionDigits: dp == null ? 2 : dp }).format(n);
  }
  function result(target, title, rows, note, tone) {
    var box = typeof target === 'string' ? document.getElementById(target) : target;
    if (!box) return;
    box.textContent = '';
    box.hidden = false;
    box.setAttribute('data-tone', tone || 'normal');
    var card = SH.el('div', { class: 'result-card' });
    if (title) card.appendChild(SH.el('h3', { class: 'result-title', text: title }));
    if (rows && rows.length) {
      var dl = SH.el('dl', { class: 'result-list' });
      rows.forEach(function (row) {
        if (!row) return;
        if (row.heading) { dl.appendChild(SH.el('dt', { class: 'result-heading', text: row.heading })); return; }
        dl.appendChild(SH.el('dt', { text: row.label }));
        dl.appendChild(SH.el('dd', { text: row.value }));
      });
      card.appendChild(dl);
    }
    if (note) card.appendChild(SH.el('p', { class: 'result-note', text: note }));
    box.appendChild(card);
    if (box.scrollIntoView && box.dataset.autoscroll === 'true') box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function error(target, message) {
    result(target, 'Check your input', [{ label: 'What to fix', value: message }], null, 'error');
  }
  function copyText(text, button) {
    if (!text) return;
    function done(ok) {
      if (!button) return;
      var old = button.textContent;
      button.textContent = ok ? 'Copied' : 'Copy failed';
      global.setTimeout(function () { button.textContent = old; }, 1800);
    }
    if (navigator.clipboard && global.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
    else done(false);
  }
  function bindCopy(selector, textFn) {
    document.querySelectorAll(selector || '[data-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () { copyText(textFn ? textFn() : value(btn.dataset.copy), btn); });
    });
  }
  function bindFavorites(id) {
    document.querySelectorAll('[data-favorite]').forEach(function (btn) {
      if (!SH.storage) return;
      var update = function () {
        var on = SH.storage.prefs.isFavorite(id);
        btn.setAttribute('aria-pressed', String(on));
        var label = btn.querySelector('[data-favorite-label]');
        if (label) label.textContent = on ? 'Saved' : 'Save';
      };
      btn.addEventListener('click', function () { SH.storage.prefs.toggleFavorite(id); update(); });
      update();
    });
  }
  function init(id) {
    if (id && SH.storage) SH.storage.prefs.addRecentTool(id);
    bindFavorites(id);
  }
  SH.tool = {
    value: value, number: number, fmt: fmt, result: result, error: error,
    copyText: copyText, bindCopy: bindCopy, bindFavorites: bindFavorites, init: init
  };
})(window);
