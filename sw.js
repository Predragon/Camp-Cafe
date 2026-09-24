// Bump VERSION whenever menu data, prices, or images change so clients pick up the update.
const VERSION = 'campcafe-v3';
const ASSETS = [
  './', 'index.html', 'styles.css', 'app.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
  "img/bacon-egg-cheese.jpg",
  "img/burrito.jpg",
  "img/cheeseburger.jpg",
  "img/chicken-bacon-cheese.jpg",
  "img/chicken-sandwich.jpg",
  "img/egg-cheese.jpg",
  "img/fries.jpg",
  "img/hamburger.jpg",
  "img/ham-egg-cheese.jpg",
  "img/hotdog.jpg",
  "img/onion-rings.jpg",
  "img/qr.svg",
  "img/pancakes.jpg",
  "img/pasta.jpg",
  "img/pizza.jpg",
  "img/salads.jpg",
  "img/shake-cookies.jpg",
  "img/shake-mango.jpg",
  "img/shake-oreo.jpg",
  "img/shake-strawberry.jpg",
  "img/steak.jpg",
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first for app files and fonts; fall back to network and store the response.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok || res.type === 'opaque') {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => e.request.mode === 'navigate' ? caches.match('index.html') : Response.error()))
  );
});
