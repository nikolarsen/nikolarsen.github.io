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

  apply(saved() || 'dark');   // сайт тёмный всегда, светлую можно включить кнопкой

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
        // Safari на iPhone не умеет ставить приложение по кнопке — показываем подсказку
        var el = document.getElementById('install');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showToast('Safari: «Поделиться» → «На экран Домой»');
      }
    });

    window.addEventListener('appinstalled', function () {
      installBtn.hidden = true;
      promptEvent = null;
    });
  }

  /* ── всплывающая подсказка ── */
  var toastTimer = null;
  function showToast(text) {
    var t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = text;
    t.classList.add('toast--show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('toast--show'); }, 4200);
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
