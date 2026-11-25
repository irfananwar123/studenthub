(function () {
  'use strict';
  var SH = window.StudentHub, T = SH.tool, C = window.SHC;
  var DRAFT_KEY = 'gradeGoalPlanDraft';
  document.addEventListener('DOMContentLoaded', function () {
    T.init('grade-goal-planner');
    var form = document.getElementById('grade-goal-planner-form');
    var rowCount = 0;

    function addRow(name, max) {
      var index = rowCount++;
      var row = SH.el('div', { class: 'form-grid', 'data-gg-row': '' });
      row.appendChild((function () {
        var field = SH.el('div', { class: 'field' });
        field.appendChild(SH.el('label', { for: 'gg-name-' + index, text: 'Assessment ' + (index + 1) }));
        var input = SH.el('input', { id: 'gg-name-' + index, type: 'text', placeholder: 'e.g. Final exam', value: name || '' });
        field.appendChild(input); return field;
      })());
      row.appendChild((function () {
        var field = SH.el('div', { class: 'field' });
        field.appendChild(SH.el('label', { for: 'gg-max-' + index, text: 'Maximum marks' }));
        var input = SH.el('input', { id: 'gg-max-' + index, type: 'number', min: '0', step: '0.5', placeholder: 'e.g. 20', value: max === undefined || max === null ? '' : String(max) });
        field.appendChild(input); return field;
      })());
      var action = SH.el('div', { class: 'field' });
      action.appendChild(SH.el('label', { text: 'Remove' }));
      var del = SH.el('button', { type: 'button', class: 'btn btn-danger btn-small', text: 'Remove row' });
      del.addEventListener('click', function () { row.remove(); });
      action.appendChild(del);
      row.appendChild(action);
      document.getElementById('gg-rows').appendChild(row);
      return index;
    }
    function readRows() {
      return [].map.call(document.querySelectorAll('[data-gg-row]'), function (row) {
        var name = row.querySelector('input[type="text"]');
        var max = row.querySelector('input[type="number"]');
        return { name: name ? name.value.trim() : '', max: max ? max.value : '' };
      });
    }
    function stat(label, value) {
      return SH.el('div', { class: 'stat' }, [SH.el('strong', { text: value }), SH.el('span', { text: label })]);
    }
    function renderPlan(plan, target) {
      var box = document.getElementById('gg-plan');
      box.textContent = '';
      [
        ['Course total', T.fmt(plan.grandTotal, 1) + ' marks'],
        ['Needed overall', T.fmt(plan.requiredTotal, 1) + ' marks'],
        ['Still required', T.fmt(Math.max(0, plan.needed), 1) + ' marks'],
        ['Remaining available', T.fmt(plan.remainingPossible, 1) + ' marks'],
        ['Target', T.fmt(target, 0) + '%']
      ].forEach(function (p) { box.appendChild(stat(p[0], p[1])); });

      var table = SH.el('table', { class: 'data-table' });
      var thead = SH.el('thead');
      var headRow = SH.el('tr');
      ['Assessment', 'Maximum', 'Target marks', 'Required %'].forEach(function (label) {
        headRow.appendChild(SH.el('th', { text: label }));
      });
      thead.appendChild(headRow); table.appendChild(thead);
      var tbody = SH.el('tbody');
      var rows = readRows().filter(function (r) { return C.isNum(Number(r.max)) && Number(r.max) > 0; });
      rows.forEach(function (row, i) {
        var tr = SH.el('tr');
        [row.name || 'Assessment ' + (i + 1), T.fmt(Number(row.max), 1),
         T.fmt(plan.perAssessment[i], 1), T.fmt(plan.requiredPercent, 1) + '%'].forEach(function (text) {
          tr.appendChild(SH.el('td', { text: text }));
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      var scenarios = document.getElementById('gg-scenarios');
      scenarios.textContent = '';
      scenarios.appendChild(table);
    }
    function calculate() {
      var target = T.number('gg-target');
      var earned = T.number('gg-earned');
      var possible = T.number('gg-possible');
      var rows = readRows().map(function (r) { return Number(r.max); });
      if (!C.isNum(target) || target < 0 || target > 100) return T.error('result', 'Enter a target percentage between 0 and 100.');
      if (!C.isNum(earned) || !C.isNum(possible)) return T.error('result', 'Enter the marks earned and marks available so far.');
      var plan = C.gradeGoalPlan(target, earned, possible, rows);
      if (!plan) return T.error('result', 'Check the marks. Totals must be positive and remaining marks must be greater than zero.');
      renderPlan(plan, target);
      if (plan.status === 'achieved') {
        var current = possible > 0 ? C.round(earned / possible * 100, 1) : 0;
        T.result('result', 'Target already secured', [
          { label: 'Current percentage', value: T.fmt(current, 1) + '%' },
          { label: 'Target', value: T.fmt(target, 0) + '%' },
          { label: 'Marks above target', value: T.fmt(-plan.needed, 1) }
        ], 'You can still use the assessment targets below if you want a higher cushion.', 'success');
      } else if (plan.status === 'impossible') {
        var shortfall = C.round(plan.needed - plan.remainingPossible, 2);
        T.result('result', 'Target not reachable', [
          { label: 'Shortfall', value: T.fmt(shortfall, 1) + ' marks' },
          { label: 'Best final percentage', value: T.fmt((earned + plan.remainingPossible) / plan.grandTotal * 100, 1) + '%' },
          { label: 'Target', value: T.fmt(target, 0) + '%' }
        ], 'Even full marks on the remaining work would not reach this target.', 'warning');
      } else {
        T.result('result', 'Required marks calculated', [
          { label: 'Needed overall', value: T.fmt(plan.needed, 1) + ' marks' },
          { label: 'Required from remaining', value: T.fmt(plan.requiredPercent, 1) + '%' },
          { label: 'Remaining available', value: T.fmt(plan.remainingPossible, 1) + ' marks' }
        ], 'Each row below shows a fair share of the marks still needed.', 'success');
      }
      return plan;
    }
    function loadDraft() {
      var draft = SH.storage.prefs.get(DRAFT_KEY, null);
      if (!draft || typeof draft !== 'object') { addRow('', ''); return; }
      document.getElementById('gg-target').value = draft.target === undefined ? '' : draft.target;
      document.getElementById('gg-earned').value = draft.earned === undefined ? '' : draft.earned;
      document.getElementById('gg-possible').value = draft.possible === undefined ? '' : draft.possible;
      var rows = Array.isArray(draft.rows) && draft.rows.length ? draft.rows : [{ name: '', max: '' }];
      rows.forEach(function (row) { addRow(row.name, row.max); });
    }

    document.getElementById('gg-add-row').addEventListener('click', function () { addRow('', ''); });
    form.addEventListener('submit', function (event) { event.preventDefault(); calculate(); });
    document.getElementById('gg-save').addEventListener('click', function () {
      var draft = {
        target: T.value('gg-target'), earned: T.value('gg-earned'),
        possible: T.value('gg-possible'), rows: readRows()
      };
      SH.storage.prefs.set(DRAFT_KEY, draft);
      T.result('result', 'Plan saved on this device', [
        { label: 'Assessments', value: String(draft.rows.length) },
        { label: 'Target', value: draft.target + '%' }
      ], 'It will be restored when you open this tool again.', 'success');
    });
    document.getElementById('gg-reset').addEventListener('click', function () {
      document.getElementById('gg-target').value = 80;
      document.getElementById('gg-earned').value = '';
      document.getElementById('gg-possible').value = '';
      document.getElementById('gg-rows').textContent = '';
      document.getElementById('gg-plan').textContent = '';
      document.getElementById('gg-scenarios').textContent = '';
      rowCount = 0; addRow('', '');
      SH.storage.prefs.set(DRAFT_KEY, null);
      T.result('result', 'Planner reset', [], null, 'success');
    });
    loadDraft();
  });
})();
