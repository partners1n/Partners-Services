const CACHE = 'ifix-v1';
const ASSETS = [
  '/', '/index.html', '/manifest.json',
  '/css/tokens.css', '/css/base.css', '/css/components.css',
  '/js/main.js',
  '/js/core/router.js', '/js/core/store.js', '/js/core/api.js',
  '/js/services/search.js', '/js/services/theme.js',
  '/js/components/header.js', '/js/components/nav.js', '/js/components/modal.js', '/js/components/card.js',
  '/js/views/home.js', '/js/views/details.js', '/js/views/check.js',
  '/js/views/chat.js', '/js/views/profile.js', '/js/views/support.js', '/js/views/landing.js',
  '/data/services.json', '/data/phones.json', '/data/banks.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
    }).catch(() => caches.match('/index.html'))
  );
});