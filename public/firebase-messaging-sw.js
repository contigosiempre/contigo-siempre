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
    vibrate: [500, 200, 500, 200, 500], // Vibración de emergencia
    sound: 'default',
    priority: 'high',
    requireInteraction: true // La notificación se queda hasta que la toquen
  };
  
  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const APP_URL = 'https://contigo-siempre.vercel.app';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('contigo-siempre') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(APP_URL + '?confirmar=1');
    })
  );
});

// ==================== CACHÉ DE LA PWA ====================
const CACHE_NAME = 'contigo-siempre-v18'; // Subimos la versión del caché
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
