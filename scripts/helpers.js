'use strict';
const ICONS = {
  calculator: 'M4 19V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z M8 7h8 M8 12h2 M14 12h2 M8 17h2 M14 17h2',
  chart: 'M4 20V10 M10 20V4 M16 20v-7 M22 20H2',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M12 6v6l4 2',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z',
  pencil: 'M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z',
  text: 'M4 6h16 M4 12h16 M4 18h10',
  calendar: 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z M16 2v4 M8 2v4 M3 10h18',
  folder: 'M3 7a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z',
  star: 'm12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.3-6.2 3.3L7 14.2 2 9.3l6.9-1Z',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z M21 21l-4.3-4.3',
  check: 'm5 12 5 5L20 7',
  home: 'm3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z M9 22v-7h6v7',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M12 11v6 M12 7h.01',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z'
};
function icon(name, size = 20) {
  const paths = (ICONS[name] || ICONS.calculator).split(' M').map((p, i) => i === 0 ? p : 'M' + p);
  return `<svg class="sh-icon" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths.map(d => `<path d="${d}"></path>`).join('')}</svg>`;
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function f(id, label, type = 'number', extra = '') {
  return `<div class="field"><label for="${id}">${label}</label><input id="${id}" name="${id}" type="${type}" ${extra}></div>`;
}
function faq(items) {
  return `<div class="faq-list">${items.map(([q, a]) => `<details class="faq-item"><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>`;
}
module.exports = { icon, esc, f, faq, ICONS };
