(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    var grid = document.getElementById('advanced-grid');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-advanced-category]'));
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-advanced-filter]'));
    var search = document.getElementById('advanced-search');
    var status = document.getElementById('advanced-status');
    var skeleton = document.getElementById('advanced-skeleton');
    var empty = document.getElementById('advanced-empty');
    var filter = 'all';

    function normalise(text) {
      return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    }
    function apply() {
      var query = normalise(search.value);
      var shown = 0;
      cards.forEach(function (card) {
        var category = normalise(card.getAttribute('data-advanced-category'));
        var categoryFilter = normalise(filter);
        var matchesCategory = categoryFilter === 'all' || category === categoryFilter;
        var matchesSearch = !query || normalise(card.textContent).indexOf(query) !== -1;
        var visible = matchesCategory && matchesSearch;
        card.hidden = !visible;
        if (visible) shown++;
      });
      empty.hidden = shown !== 0;
      grid.hidden = shown === 0;
      var label = filter === 'all' ? 'all dashboards' : filter === 'study-planning' ? 'planning dashboards'
        : filter === 'academic-calculators' ? 'analysis dashboards' : 'learning-theory dashboards';
      status.textContent = shown
        ? 'Ready — showing ' + shown + ' of ' + cards.length + ' advanced tools in ' + label + '.'
        : 'No matching dashboards. Choose another filter or clear your search.';
    }
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        filter = button.getAttribute('data-advanced-filter') || 'all';
        buttons.forEach(function (b) {
          var active = b === button;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', String(active));
        });
        apply();
      });
    });
    search.addEventListener('input', apply);
    window.setTimeout(function () {
      if (skeleton && skeleton.parentNode) skeleton.parentNode.removeChild(skeleton);
      document.documentElement.setAttribute('data-hub-ready', 'true');
      apply();
    }, 260);
  });
})();
