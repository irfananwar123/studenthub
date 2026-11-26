/* Live usage strip. It is real, but strictly on-device: interaction timestamps
   live in LocalStorage and study minutes come from the same IndexedDB sessions
   used by the study tools. Nothing is sent anywhere and there is no global count. */
(function (global) {
  'use strict';
  var SH = global.StudentHub = global.StudentHub || {};
  var KEY = 'usageEvents';
  var MAX_EVENTS = 600;
  var events = [];
  var bar = null;
  var sequence = 0;

  function localDay(date) {
    var shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return shifted.toISOString().slice(0, 10);
  }
  function read() {
    try {
      var value = SH.storage.prefs.get(KEY, []);
      events = Array.isArray(value) ? value.slice(-MAX_EVENTS) : [];
    } catch (err) { events = []; }
  }
  function save() {
    try { SH.storage.prefs.set(KEY, events.slice(-MAX_EVENTS)); } catch (err) { /* private mode */ }
  }
  function sourceId() {
    var tool = document.body && document.body.getAttribute('data-tool-id');
    if (tool) return tool;
    var page = document.body && document.body.getAttribute('data-page');
    return page || 'page';
  }
  function record(type, meta) {
    var event = { t: Date.now(), day: localDay(new Date()), type: type, source: sourceId() };
    if (meta && meta.tool) event.tool = meta.tool;
    if (meta && meta.page) event.page = meta.page;
    events.push(event);
    if (events.length > MAX_EVENTS) events = events.slice(-MAX_EVENTS);
    save();
    scheduleUpdate();
    try {
      global.dispatchEvent(new CustomEvent('studenthub:usage', { detail: event }));
    } catch (err) { /* older browsers still update without the event */ }
  }
  function set(key, text) {
    if (!bar) return;
    var node = bar.querySelector('[data-usage="' + key + '"]');
    if (node) node.textContent = text;
  }
  function relative(ms) {
    if (ms < 45000) return 'Updated just now';
    if (ms < 3600000) return 'Updated ' + Math.floor(ms / 60000) + 'm ago';
    if (ms < 86400000) return 'Updated ' + Math.floor(ms / 3600000) + 'h ago';
    return 'Updated ' + Math.floor(ms / 86400000) + 'd ago';
  }
  function scheduleUpdate() {
    if (global.requestAnimationFrame) global.requestAnimationFrame(update);
    else global.setTimeout(update, 0);
  }
  function update() {
    var id = ++sequence;
    if (!bar || !global.SHC || !SH.storage) return;
    var now = new Date();
    var today = localDay(now);
    var weekStart = now.getTime() - 7 * 86400000;
    var todayCount = 0, toolSet = {}, daySet = {}, last = 0;
    events.forEach(function (event) {
      if (!event) return;
      if (event.day === today) todayCount++;
      if (event.t && event.t >= weekStart && event.tool) toolSet[event.tool] = true;
      if (event.day) daySet[event.day] = true;
      if (event.t && event.t > last) last = event.t;
    });
    var todayMinutes = 0;
    Promise.resolve().then(function () { return SH.storage.all('sessions'); }).then(function (sessions) {
      if (id !== sequence) return null;
      (Array.isArray(sessions) ? sessions : []).forEach(function (row) {
        if (!row || typeof row.date !== 'string') return;
        var key = row.date.slice(0, 10);
        daySet[key] = true;
        if (key === today) todayMinutes += Number(row.minutes) || 0;
      });
      return SH.storage.all('tasks');
    }).then(function (tasks) {
      if (id !== sequence || tasks === null) return;
      (Array.isArray(tasks) ? tasks : []).forEach(function (row) {
        if (row && row.type === 'habit' && typeof row.date === 'string') daySet[row.date.slice(0, 10)] = true;
      });
      var streak = global.SHC.streakStats(Object.keys(daySet), today).current;
      set('actions', String(todayCount));
      set('minutes', Math.round(todayMinutes) + 'm');
      set('streak', streak + 'd');
      set('tools', String(Object.keys(toolSet).length));
      set('updated', last ? relative(now.getTime() - last) : 'No activity yet');
    }).catch(function () {
      if (id !== sequence) return;
      set('updated', 'Local totals unavailable');
    });
  }
  function init() {
    bar = document.getElementById('usage-bar');
    read();
    record('view');
    update();
    global.addEventListener('storage', function (event) {
      if (event.key === 'studenthub:' + KEY) { read(); update(); }
    });
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) { read(); update(); }
    });
    global.setInterval(update, 30000);
  }
  SH.usage = { record: record, update: update, events: function () { return events.slice(); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window);
