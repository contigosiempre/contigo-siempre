// ==================== FIREBASE MESSAGING ====================
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

// Manejar notificaciones en segundo plano (celular bloqueado o app cerrada)
messaging.onBackgroundMessage((payload) => {
  console.log('[service-worker.js] Mensaje recibido en segundo plano:', payload);
  
  const notificationTitle = payload.notification?.title || "Contigo Siempre";
  const notificationOptions = {
    body: payload.notification?.body || "Es hora de tomar tu medicamento",
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [500, 200, 500, 200, 500],
    sound: 'default',
    requireInteraction: true,
    priority: 'high',
    importance: 'high',
    actions: [
      { action: 'tomar', title: '✓ Ya la tomé' },
      { action: 'postergar', title: '⏰ Postergar 5 min' }
    ]
  };
  
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manejar clics en la notificación y en los botones de acción
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'tomar') {
    console.log('El adulto mayor confirmó la toma');
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes('contigo-siempre') && 'focus' in client) {
            client.postMessage({ tipo: 'confirmar_toma' });
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/?accion=confirmar');
        }
      })
    );
  } else if (event.action === 'postergar') {
    console.log('El adulto mayor postergó 5 minutos');
    event.waitUntil(
      new Promise((resolve) => {
        setTimeout(() => {
          self.registration.showNotification("⏰ Recordatorio postergado", {
            body: "Es hora de tomar tu medicamento",
            icon: '/icons/icon-192.png',
            vibrate: [500, 200, 500],
            sound: 'default',
            requireInteraction: true,
            priority: 'high',
            actions: [
              { action: 'tomar', title: '✓ Ya la tomé' },
              { action: 'postergar', title: '⏰ Postergar 5 min' }
            ]
          });
          resolve();
        }, 5 * 60 * 1000);
      })
    );
  } else {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes('contigo-siempre') && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// ==================== CACHÉ DE LA PWA ====================
const CACHE_NAME = 'contigo-siempre-v11';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
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
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
