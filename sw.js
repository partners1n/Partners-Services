/* =====================================================
   Service Worker  |  Google DeepMine v2.0
   Strategy: Cache-First for assets, Network-First for search
   ===================================================== */

const CACHE_NAME    = 'finance-news-v2';
const CACHE_STATIC  = 'finance-static-v2';

/* ── FILES TO PRE-CACHE ──────────────────────────── */
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './logo.png',
];

/* ── INSTALL: Pre-cache all static assets ─────────── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then(cache => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

/* ── ACTIVATE: Clear old caches ───────────────────── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key !== CACHE_STATIC)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

/* ── FETCH STRATEGY ───────────────────────────────── */
/*
  Static assets  → Cache-First  (logo, css, js, html)
  Google Search  → Network-Only (live results, no cache)
  Everything else → Network-First with cache fallback
*/
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  /* 1. Google Search — always network, never cache */
  if (url.hostname.includes('google.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  /* 2. Static assets — Cache-First */
  const isStatic = PRECACHE_ASSETS.some(path => {
    try {
      return new URL(path, self.location.origin).pathname === url.pathname;
    } catch (_) { return false; }
  });

  if (isStatic) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          /* Clone & store fresh copy */
          const clone = response.clone();
          caches.open(CACHE_STATIC).then(cache => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  /* 3. Everything else — Network-First, fallback to cache */
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

/* ── BACKGROUND SYNC (optional future use) ────────── */
self.addEventListener('sync', event => {
  if (event.tag === 'sync-news') {
    console.log('[SW] Background sync triggered:', event.tag);
  }
});

/* ── PUSH NOTIFICATION (optional future use) ──────── */
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || 'ข่าวสาร', {
    body: data.body || '',
    icon: './logo.png',
    badge: './logo.png',
  });
});