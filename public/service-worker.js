// Cambiamos a v5 para obligar al teléfono a borrar el Service Worker viejo
const CACHE_NAME = 'contigo-v5';

// Archivos estáticos principales que sí queremos guardar en el caché del celular
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// 1. INSTALACIÓN: Guarda los archivos en caché
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Fuerza al nuevo Service Worker a tomar el control de inmediato
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. ACTIVACIÓN: Borra los cachés viejos (v1, v2, v3, v4)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Borrando caché antiguo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. PETICIONES (FETCH): Filtra para responder SOLO sobre nuestro propio sitio
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // REGLA CLAVE: Si la petición NO es de nuestro propio dominio (ej. OneSignal, Firebase, Google Fonts),
  // la dejamos pasar directo a internet sin interceptarla.
  if (url.origin !== self.location.origin) {
    return;
  }

  // Si es un archivo de nuestro sitio, intenta entregarlo desde el caché o busca en la red
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
