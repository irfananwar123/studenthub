(function () {
  'use strict';
  var T = window.StudentHub.tool;
  document.addEventListener('DOMContentLoaded', function () {
    T.init('pomodoro-timer');
    var display = document.getElementById('po-display');
    var modeLabel = document.getElementById('po-mode');
    var progress = document.getElementById('po-progress');
    var announce = document.getElementById('po-announce');
    var countLabel = document.getElementById('po-count');
    var startBtn = document.getElementById('po-start');
    var pauseBtn = document.getElementById('po-pause');
    var resetBtn = document.getElementById('po-reset');
    var soundBtn = document.getElementById('po-sound');
    var running = false, paused = true, phase = 'work', sessions = 0, sound = false;
    var endAt = 0, remainingMs = 0, totalMs = 0, ticker = null, audio = null;

    function readMinutes(id, fallback) {
      var n = Number(document.getElementById(id).value);
      return isFinite(n) && n > 0 ? Math.min(n, 180) : fallback;
    }
    function msFor(phaseName) {
      return readMinutes(phaseName === 'work' ? 'po-work' : 'po-break', phaseName === 'work' ? 25 : 5) * 60000;
    }
    function render() {
      var left = running ? Math.max(0, endAt - Date.now()) : remainingMs;
      var secs = Math.ceil(left / 1000);
      display.textContent = String(Math.floor(secs / 60)).padStart(2, '0') + ':' + String(secs % 60).padStart(2, '0');
      progress.style.width = (totalMs ? Math.max(0, Math.min(100, (1 - left / totalMs) * 100)) : 0) + '%';
      modeLabel.textContent = (running || !paused ? '' : 'Ready for a ') + (phase === 'work' ? 'work session' : 'break') + (paused && left === totalMs ? '' : ' — ' + (running ? 'running' : 'paused'));
      countLabel.textContent = String(sessions);
      document.title = display.textContent + ' · ' + (phase === 'work' ? 'Focus' : 'Break') + ' | StudentHub';
    }
    function beep() {
      if (!sound) return;
      try {
        audio = audio || new (window.AudioContext || window.webkitAudioContext)();
        if (audio.state === 'suspended') audio.resume();
        var osc = audio.createOscillator(), gain = audio.createGain();
        osc.connect(gain); gain.connect(audio.destination);
        osc.frequency.value = 660; gain.gain.value = 0.12;
        osc.start(); osc.stop(audio.currentTime + 0.35);
      } catch (e) { /* Audio is optional. */ }
    }
    function finish() {
      running = false; paused = true;
      if (phase === 'work') {
        sessions++;
        var every = Math.max(2, Math.min(12, Number(document.getElementById('po-long').value) || 4));
        phase = sessions % every === 0 ? 'longbreak' : 'break';
        announce.textContent = 'Work session complete. ' + (phase === 'longbreak' ? 'Take a long break.' : 'Take a break.');
      } else {
        phase = 'work';
        announce.textContent = 'Break finished. Ready for the next work session.';
      }
      remainingMs = totalMs = phase === 'longbreak' ? msFor('break') * 2 : msFor(phase);
      beep();
      render();
    }
    function tick() {
      if (!running) return;
      if (Date.now() >= endAt) { finish(); return; }
      render();
    }
    function start() {
      if (running) return;
      if (remainingMs <= 0 || remainingMs >= totalMs) { totalMs = msFor(phase); remainingMs = totalMs; }
      endAt = Date.now() + remainingMs;
      running = true; paused = false;
      clearInterval(ticker);
      ticker = setInterval(tick, 250);
      startBtn.disabled = true; pauseBtn.disabled = false;
      announce.textContent = phase === 'work' ? 'Work session started.' : 'Break started.';
      render();
    }
    function pause() {
      if (!running) return;
      remainingMs = Math.max(0, endAt - Date.now());
      running = false; paused = true;
      clearInterval(ticker);
      startBtn.disabled = false; pauseBtn.disabled = true;
      announce.textContent = 'Timer paused.';
      render();
    }
    function reset() {
      running = false; paused = true;
      clearInterval(ticker);
      phase = 'work'; remainingMs = totalMs = msFor('work');
      startBtn.disabled = false; pauseBtn.disabled = true;
      announce.textContent = 'Timer reset.';
      render();
    }
    startBtn.addEventListener('click', start);
    pauseBtn.addEventListener('click', pause);
    resetBtn.addEventListener('click', reset);
    soundBtn.addEventListener('click', function () {
      sound = !sound;
      soundBtn.textContent = 'Sound: ' + (sound ? 'on' : 'off');
      soundBtn.setAttribute('aria-pressed', String(sound));
      if (sound) beep();
    });
    soundBtn.setAttribute('aria-pressed', 'false');
    document.addEventListener('keydown', function (e) {
      if (e.code !== 'Space' || e.target.matches('input, textarea, select, button')) return;
      e.preventDefault();
      if (running) pause(); else start();
    });
    document.addEventListener('visibilitychange', function () { if (!document.hidden) tick(); });
    reset();
  });
})();
