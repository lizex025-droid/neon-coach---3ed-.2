const CACHE_NAME = 'neon-static-auth-v2';
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('neon') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Only static same-origin images/styles/scripts; never HTML, credentials, or API responses.
  if (event.request.method !== 'GET' || url.origin !== self.location.origin ||
      !/\.(?:js|css|svg|png|jpg|webp|woff2)$/.test(url.pathname) ||
      event.request.headers.has('Authorization') || !/^\/(assets|icons|styles)\//.test(url.pathname)) return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)); }
    return response;
  }).catch(() => caches.match(event.request)));
});
