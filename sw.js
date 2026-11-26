/* Service worker: кэш «сначала своё, потом обновление в фоне».
   Меняете файлы на сайте — поднимите VERSION, старая копия заменится при следующем открытии. */
const VERSION = 'v15-2026-11-26';
const CACHE = 'stroy-' + VERSION;

const SHELL = [
  './',
  'index.html',
  'assets/style.css',
  'assets/app.js',
  'manifest.webmanifest',
  'tools/manifest-layout.webmanifest',
  'tools/manifest-tile.webmanifest',
  'tools/manifest-wallpaper.webmanifest',
  'tools/manifest-concrete.webmanifest',
  'tools/manifest-paint.webmanifest',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/apple-touch-icon.png',
  'tools/layout.html',
  'tools/tile.html',
  'tools/wallpaper.html',
  'tools/concrete.html',
  'tools/paint.html'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(SHELL.map((u) => c.add(new Request(u, { cache: 'reload' })))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  // переходы по страницам: из кэша сразу, обновление — фоном
  if (req.mode === 'navigate') {
    e.respondWith(
      caches.match(req, { ignoreSearch: true }).then((hit) => {
        const net = fetch(req).then((res) => {
          if (res && res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
          return res;
        }).catch(() => hit || caches.match('index.html'));
        return hit || net;
      })
    );
    return;
  }

  // статика: сначала кэш, потом сеть (и положить в кэш)
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res && res.ok && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    }))
  );
});
