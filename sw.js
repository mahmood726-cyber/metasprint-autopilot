// MetaSprint Autopilot Service Worker — PWA offline support
// IMPORTANT: Increment version on each release to bust stale caches
const CACHE_NAME = 'metasprint-autopilot-v3';
const ASSETS = [
  './',
  './metasprint-autopilot.html',
  './manifest.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  // Network-first for API calls (CT.gov, PubMed), cache-first for app assets
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    // External API calls: network only, don't cache
    event.respondWith(fetch(event.request));
    return;
  }
  // App assets: cache-first, fallback to network
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;
      return fetch(event.request).then(function(response) {
        if (response.ok) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      });
    })
  );
});
