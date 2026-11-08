importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAGxIGYqifeb5qGlVTQaVVpmKjZ9E1__TU",
  authDomain: "contigo-siempre-79017.firebaseapp.com",
  projectId: "contigo-siempre-79017",
  storageBucket: "contigo-siempre-79017.firebasestorage.app",
  messagingSenderId: "373374322978",
  appId: "1:373374322978:web:05fc428462d73d4f197d7b"
});

const messaging = firebase.messaging();

// Manejar notificaciones en segundo plano
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || "Contigo Siempre";
  const notificationOptions = {
    body: payload.notification?.body || "Es hora de tomar tu medicamento",
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    // Al quitar requireInteraction: true, Android permite que se borre sola
    vibrate: [1000, 500, 1000, 500, 1000],
    sound: 'default',
    priority: 'high',
    actions: [
      { action: 'tomar', title: '✓ Ya la tomé' }
    ]
  };
  
  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const APP_URL = 'https://contigo-siempre.vercel.app';
  
  if (event.action === 'tomar') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes('contigo-siempre') && 'focus' in client) {
            client.postMessage({ tipo: 'confirmar_toma' });
            return client.focus();
          }
        }
        if (clients.openWindow) return clients.openWindow(APP_URL + '?confirmar=1');
      })
    );
  } else {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes('contigo-siempre') && 'focus' in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow(APP_URL);
      })
    );
  }
});

// ==================== CACHÉ DE LA PWA ====================
const CACHE_NAME = 'contigo-siempre-v17';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        URLS_TO_CACHE.map((url) => cache.add(url).catch((err) => console.warn('No se pudo cachear:', url)))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin)) return;
  if (event.request.url.includes('firebase')) return;
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
