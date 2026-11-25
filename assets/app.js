/* Общий скрипт сайта: тема, установка PWA, регистрация service worker. */
(function () {
  'use strict';

  /* ── тема: выбор пользователя, иначе по настройке системы ── */
  var STORE = 'stroy-theme';
  var root = document.documentElement;

  function saved() { try { return localStorage.getItem(STORE); } catch (e) { return null; } }
  function systemDark() { return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; }
  function apply(t) {
    root.setAttribute('data-theme', t);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#0a0f15' : '#0d141d');
  }

  apply(saved() || (systemDark() ? 'dark' : 'light'));

  var btn = document.getElementById('themeBtn');
  if (btn) {
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next);
      try { localStorage.setItem(STORE, next); } catch (e) {}
    });
  }

  /* ── установка как приложение ── */
  var installBtn = document.getElementById('installBtn');
  var promptEvent = null;

  if (installBtn) {
    var standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    installBtn.hidden = standalone;

    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      promptEvent = e;
      installBtn.hidden = false;
    });

    installBtn.addEventListener('click', function () {
      if (promptEvent) {
        promptEvent.prompt();
        promptEvent.userChoice.finally(function () { promptEvent = null; });
      } else {
        // Safari на iPhone не даёт программной установки — показываем инструкцию
        var el = document.getElementById('install');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.animate(
            [{ transform: 'scale(1)' }, { transform: 'scale(1.012)' }, { transform: 'scale(1)' }],
            { duration: 620, easing: 'ease-in-out' }
          );
        }
      }
    });

    window.addEventListener('appinstalled', function () {
      installBtn.hidden = true;
      promptEvent = null;
    });
  }

  /* ── год в подвале ── */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ── service worker ── */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* офлайн-режим просто не включится */ });
    });
  }
})();
