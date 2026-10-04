importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Configuración de Firebase con tus credenciales reales
firebase.initializeApp({
  apiKey: "AIzaSyAGxIGYqifeb5qGlVTQaVVpmKjZ9E1__TU",
  authDomain: "contigo-siempre-79017.firebaseapp.com",
  projectId: "contigo-siempre-79017",
  storageBucket: "contigo-siempre-79017.firebasestorage.app",
  messagingSenderId: "373374322978",
  appId: "1:373374322978:web:05fc428462d73d4f197d7b"
});

const messaging = firebase.messaging();

// Manejar notificaciones cuando la app esté en segundo plano o cerrada
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Notificación en segundo plano recibida:', payload);

  const notificationTitle = payload.notification?.title || '⏰ Hora de tu medicamento';
  const notificationOptions = {
    body: payload.notification?.body || 'Es momento de tomar tu remedio.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'medication-reminder',
    renotify: true,
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
