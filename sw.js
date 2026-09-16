const CACHE = 'solar-tracker-v2';

// Neue Version sofort aktivieren
self.addEventListener('install', e => {
  self.skipWaiting();
});

// Alte Caches löschen (localStorage-Daten sind davon NICHT betroffen)
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-First: immer erst die aktuelle Version vom Server holen,
// Cache nur als Offline-Fallback verwenden
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return resp;
      })
      .catch(() => caches.match(e.request))
  );
});
