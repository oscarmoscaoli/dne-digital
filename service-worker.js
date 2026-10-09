'use strict';
const CACHE_PREFIX = 'dne-digital-' + encodeURIComponent(new URL(self.registration.scope).pathname) + '-';
const CACHE = CACHE_PREFIX + 'v1';
const FILES = ['./', './index.html', './styles.css', './app.js', './qr.js', './manifest.webmanifest', './assets/logo-dne.png', './assets/logos-entidades.png', './assets/icon-192.png', './assets/icon-512.png'];
const urls = new Set(FILES.map(path => new URL(path, self.registration.scope).href));
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match(new URL('./index.html', self.registration.scope).href)));
  } else if (urls.has(url.href)) {
    event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request)));
  }
});
