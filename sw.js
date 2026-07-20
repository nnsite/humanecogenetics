const cacheName = 'static-v1';
self.addEventListener('activate', event => {
  event.waitUntil(
    self.registration.navigationPreload?.enable()
  );
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    // Use preload for navigations
    const preload = await event.preloadResponse;
    if (preload) {
      cache.put(event.request, preload.clone());
      return preload;
    }
    // Return cached, update in background
    const cached = await cache.match(event.request);
    if (cached) {
      event.waitUntil(
        fetch(event.request)
          .then(r => r.ok && cache.put(event.request, r))
          .catch(() => {})
      );
      return cached;
    }
    // Fetch and cache
    const response = await fetch(event.request);
    if (response.ok) cache.put(event.request, response.clone());
    return response;
  })());
});
self.addEventListener('install', () => self.skipWaiting());
