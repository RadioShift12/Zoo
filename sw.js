const CACHE_NAME = 'ntc-zoo-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './main.js',
  './animals.json',
  './zoo-status.json',
  './visitors.json',
  './modules/admin.js',
  './modules/animal.js',
  './modules/api.js',
  './modules/security.js',
  './modules/storage.js',
  './modules/ui.js',
  './modules/zoo.js'
];

// Cache assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching App Shell & Dependencies');
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network first fallback to Cache
self.addEventListener('fetch', (e) => {
  // Let browser extensions or non-http requests pass through cleanly
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // If valid response, clone it dynamically into cache
        if (response.status === 200) {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, resClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network is completely down
        return caches.match(e.request);
      })
  );
});

// Listen for Push Notifications
self.addEventListener('push', (e) => {
  const data = e.data ? e.data.text() : 'Animal status update received!';
  const options = {
    body: data,
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-192.png',
    vibrate: [100, 50, 100]
  };

  e.waitUntil(
    self.registration.showNotification('NTC Zoo Alert', options)
  );
});