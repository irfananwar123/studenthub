/* StudentHub local persistence.
   LocalStorage: small preferences only. IndexedDB: user collections.
   Nothing in this file sends data anywhere. */
(function (global) {
  'use strict';
  var SH = global.StudentHub = global.StudentHub || {};
  var PREFIX = 'studenthub:';
  var DB_NAME = 'studenthub-data';
  var DB_VERSION = 1;
  var COLLECTIONS = ['notes', 'flashcards', 'quizzes', 'questions', 'vocabulary', 'schedules', 'tasks', 'sessions', 'exams'];
  var memory = {};
  var dbPromise = null;

  function lsGet(key, fallback) {
    try {
      var raw = localStorage.getItem(PREFIX + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  }
  function lsSet(key, value) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  }
  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve) {
      if (!global.indexedDB) { resolve(null); return; }
      var request;
      try { request = indexedDB.open(DB_NAME, DB_VERSION); }
      catch (e) { resolve(null); return; }
      request.onupgradeneeded = function () {
        var db = request.result;
        COLLECTIONS.forEach(function (name) {
          if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: 'id', autoIncrement: true });
        });
      };
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { resolve(null); };
      request.onblocked = function () { resolve(null); };
    });
    return dbPromise;
  }
  function tx(collection, mode, fn) {
    return openDB().then(function (db) {
      if (!db) {
        var list = memory[collection] || (memory[collection] = []);
        var next = 1;
        list.forEach(function (item) { next = Math.max(next, (item.id || 0) + 1); });
        return fn({
          put: function (value) {
            var item = Object.assign({}, value);
            if (item.id) {
              var idx = list.findIndex(function (x) { return x.id === item.id; });
              if (idx >= 0) list[idx] = item; else list.push(item);
            } else { item.id = next++; list.push(item); }
            return Promise.resolve(item.id);
          },
          get: function (id) { return Promise.resolve(list.find(function (x) { return x.id === id; }) || null); },
          all: function () { return Promise.resolve(list.slice()); },
          del: function (id) { memory[collection] = list.filter(function (x) { return x.id !== id; }); return Promise.resolve(); },
          clear: function () { memory[collection] = []; return Promise.resolve(); }
        });
      }
      return new Promise(function (resolve, reject) {
        var transaction = db.transaction(collection, mode);
        var store = transaction.objectStore(collection);
        var result;
        var api = {
          put: function (value) {
            return new Promise(function (res, rej) {
              var req = value.id ? store.put(value) : store.add(value);
              req.onsuccess = function () { res(req.result); };
              req.onerror = function () { rej(req.error); };
            });
          },
          get: function (id) {
            return new Promise(function (res, rej) {
              var req = store.get(id);
              req.onsuccess = function () { res(req.result || null); };
              req.onerror = function () { rej(req.error); };
            });
          },
          all: function () {
            return new Promise(function (res, rej) {
              var req = store.getAll();
              req.onsuccess = function () { res(req.result || []); };
              req.onerror = function () { rej(req.error); };
            });
          },
          del: function (id) {
            return new Promise(function (res, rej) {
              var req = store.delete(id);
              req.onsuccess = function () { res(); };
              req.onerror = function () { rej(req.error); };
            });
          },
          clear: function () {
            return new Promise(function (res, rej) {
              var req = store.clear();
              req.onsuccess = function () { res(); };
              req.onerror = function () { rej(req.error); };
            });
          }
        };
        transaction.oncomplete = function () { resolve(result); };
        transaction.onerror = function () { reject(transaction.error); };
        result = fn(api);
      });
    });
  }

  var storage = {
    ready: openDB,
    prefs: {
      get: lsGet,
      set: lsSet,
      getTheme: function () { return lsGet('theme', 'auto'); },
      setTheme: function (value) { return lsSet('theme', value); },
      getFavorites: function () { return lsGet('favorites', []); },
      isFavorite: function (id) { return storage.prefs.getFavorites().indexOf(id) !== -1; },
      toggleFavorite: function (id) {
        var list = storage.prefs.getFavorites();
        var i = list.indexOf(id);
        if (i === -1) list.push(id); else list.splice(i, 1);
        lsSet('favorites', list);
        return i === -1;
      },
      getRecentTools: function () { return lsGet('recentTools', []); },
      addRecentTool: function (id) {
        var list = storage.prefs.getRecentTools().filter(function (x) { return x !== id; });
        list.unshift(id);
        lsSet('recentTools', list.slice(0, 8));
      },
      getRecentSearches: function () { return lsGet('recentSearches', []); },
      addRecentSearch: function (q) {
        q = String(q || '').trim();
        if (q.length < 2) return;
        var list = storage.prefs.getRecentSearches().filter(function (x) { return x.toLowerCase() !== q.toLowerCase(); });
        list.unshift(q);
        lsSet('recentSearches', list.slice(0, 5));
      }
    },
    put: function (collection, value) {
      return tx(collection, 'readwrite', function (s) { return s.put(value); });
    },
    get: function (collection, id) {
      return tx(collection, 'readonly', function (s) { return s.get(id); });
    },
    all: function (collection) {
      return tx(collection, 'readonly', function (s) { return s.all(); });
    },
    remove: function (collection, id) {
      return tx(collection, 'readwrite', function (s) { return s.del(id); });
    },
    clear: function (collection) {
      return tx(collection, 'readwrite', function (s) { return s.clear(); });
    },
    exportData: function () {
      var prefs = {};
      ['theme', 'favorites', 'recentTools', 'recentSearches'].forEach(function (k) { prefs[k] = lsGet(k, null); });
      var payload = { app: 'StudentHub', version: 1, exportedAt: new Date().toISOString(), prefs: prefs, collections: {} };
      return Promise.all(COLLECTIONS.map(function (name) {
        return storage.all(name).then(function (rows) { payload.collections[name] = rows; });
      })).then(function () { return JSON.stringify(payload, null, 2); });
    },
    importData: function (json) {
      var data;
      try { data = typeof json === 'string' ? JSON.parse(json) : json; }
      catch (e) { return Promise.reject(new Error('The file does not contain valid JSON.')); }
      if (!data || data.app !== 'StudentHub' || !data.collections || typeof data.collections !== 'object') {
        return Promise.reject(new Error('This is not a StudentHub backup file.'));
      }
      if (data.prefs && typeof data.prefs === 'object') {
        ['theme', 'favorites', 'recentTools', 'recentSearches'].forEach(function (k) {
          if (data.prefs[k] !== undefined) lsSet(k, data.prefs[k]);
        });
      }
      return Promise.all(COLLECTIONS.map(function (name) {
        var rows = Array.isArray(data.collections[name]) ? data.collections[name] : [];
        return storage.clear(name).then(function () {
          return Promise.all(rows.map(function (row) {
            if (row && typeof row === 'object') { delete row.id; return storage.put(name, row); }
            return null;
          }));
        });
      })).then(function () { return true; });
    },
    clearAll: function () {
      ['theme', 'favorites', 'recentTools', 'recentSearches'].forEach(function (k) {
        try { localStorage.removeItem(PREFIX + k); } catch (e) {}
      });
      return Promise.all(COLLECTIONS.map(function (name) { return storage.clear(name); })).then(function () { return true; });
    },
    collections: COLLECTIONS
  };
  SH.storage = storage;
})(window);
