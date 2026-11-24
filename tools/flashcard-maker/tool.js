(function () {
  'use strict';
  var SH = window.StudentHub, T = SH.tool;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('flashcard-maker');
    var cards = [], order = [], index = 0, flipped = false;
    var list = document.getElementById('fc-list');
    function load() {
      return SH.storage.all('flashcards').then(function (rows) { cards = rows; order = cards.map(function (_, i) { return i; }); index = 0; render(); });
    }
    function current() { return order.length ? cards[order[index]] : null; }
    function renderCard() {
      var card = current();
      document.getElementById('fc-card').classList.toggle('is-flipped', flipped);
      document.getElementById('fc-front-view').textContent = card ? card.front : 'Add a card to begin';
      document.getElementById('fc-back-view').textContent = card ? card.back : 'Your answer appears here';
      document.getElementById('fc-position').textContent = card ? 'Card ' + (index + 1) + ' of ' + order.length + (card.status ? ' · ' + card.status : '') : 'No cards yet';
    }
    function render() {
      renderCard();
      list.textContent = '';
      if (!cards.length) {
        list.appendChild(SH.el('div', { class: 'empty-state' }, [SH.icon('book', 28), SH.el('strong', { text: 'Your deck is empty' }), SH.el('span', { text: 'Add a question and answer above.' })]));
        return;
      }
      cards.forEach(function (card) {
        var row = SH.el('div', { class: 'list-item' });
        row.appendChild(SH.el('div', { class: 'list-item-body' }, [
          SH.el('div', { class: 'list-item-title', text: card.front }),
          SH.el('div', { class: 'list-item-meta', text: (card.deck || 'My deck') + (card.status ? ' · ' + card.status : '') + ' — ' + card.back })
        ]));
        var del = SH.el('button', { type: 'button', class: 'btn btn-danger btn-small', text: 'Delete' });
        del.addEventListener('click', function () { SH.storage.remove('flashcards', card.id).then(load); });
        row.appendChild(del); list.appendChild(row);
      });
    }
    function move(step) {
      if (!order.length) return;
      index = (index + step + order.length) % order.length;
      flipped = false; renderCard();
    }
    function mark(status) {
      var card = current();
      if (!card) return T.error('result', 'Add a card first.');
      SH.storage.put('flashcards', Object.assign({}, card, { status: status })).then(function () {
        load();
        T.result('result', 'Card marked', [{ label: 'Card', value: card.front }, { label: 'Status', value: status }], null, 'success');
      });
    }
    document.getElementById('fc-add').addEventListener('click', function () {
      var front = document.getElementById('fc-front').value.trim(), back = document.getElementById('fc-back').value.trim();
      var deck = document.getElementById('fc-deck').value.trim() || 'My deck';
      if (!front || !back) return T.error('result', 'Enter both a question and an answer.');
      SH.storage.put('flashcards', { front: front, back: back, deck: deck, status: '', createdAt: new Date().toISOString() }).then(function () {
        document.getElementById('fc-front').value = '';
        document.getElementById('fc-back').value = '';
        load();
        T.result('result', 'Card added', [{ label: 'Question', value: front }, { label: 'Deck', value: deck }], 'Tip: flip the card and test yourself before marking it known.', 'success');
      });
    });
    document.getElementById('fc-card').addEventListener('click', function () { flipped = !flipped; renderCard(); });
    document.getElementById('fc-next').addEventListener('click', function () { move(1); });
    document.getElementById('fc-prev').addEventListener('click', function () { move(-1); });
    document.getElementById('fc-shuffle').addEventListener('click', function () {
      for (var i = order.length - 1; i > 0; i--) {
        var j = Math.floor((window.crypto && crypto.getRandomValues ? crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296 : Math.random()) * (i + 1));
        var tmp = order[i]; order[i] = order[j]; order[j] = tmp;
      }
      index = 0; flipped = false; renderCard();
      T.result('result', 'Deck shuffled', [{ label: 'Cards', value: String(order.length) }], null, 'success');
    });
    document.getElementById('fc-known').addEventListener('click', function () { mark('known'); });
    document.getElementById('fc-difficult').addEventListener('click', function () { mark('difficult'); });
    document.getElementById('fc-export').addEventListener('click', function () {
      var payload = JSON.stringify({ app: 'StudentHub', version: 1, exportedAt: new Date().toISOString(), collections: { flashcards: cards } }, null, 2);
      var url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
      var a = SH.el('a', { href: url, download: 'studenthub-flashcards.json' });
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    });
    document.getElementById('fc-import').addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (!file) return;
      file.text().then(function (text) { return SH.storage.importData(text); }).then(function () {
        load(); T.result('result', 'Backup imported', [], 'All StudentHub collections in the backup were restored.', 'success');
      }).catch(function (err) { T.error('result', err.message); });
    });
    document.getElementById('fc-clear').addEventListener('click', function () {
      if (!window.confirm('Delete all flashcards on this device?')) return;
      SH.storage.clear('flashcards').then(load);
    });
    load();
  });
})();
