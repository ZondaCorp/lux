// Service worker: guarda la app en el equipo para abrirla sin señal.
// Para publicar una versión nueva, subí los archivos y cambiá este número.
const CACHE = 'iluminacion-v6-2';
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Primero lo guardado (rápido y offline); si hay señal, se actualiza en segundo plano.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => {
      const red = fetch(e.request).then(r => {
        if (r && r.ok && new URL(e.request.url).origin === location.origin)
          caches.open(CACHE).then(c => c.put(e.request, r.clone()));
        return r;
      }).catch(() => hit || (e.request.mode === 'navigate' ? caches.match('./index.html') : undefined));
      return hit || red;
    })
  );
});
