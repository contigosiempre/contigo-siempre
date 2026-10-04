importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Configuración de Firebase para el Service Worker en segundo plano
firebase.initializeApp({
  apiKey: "TU_API_KEY",
  authDomain: "contigo-siempre-79017.firebaseapp.com",
  projectId: "contigo-siempre-79017",
  storageBucket: "contigo-siempre-79017.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
});

const messaging = firebase.messaging();

// Escuchar y mostrar la notificación cuando la app está cerrada o de fondo
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Notificación recibida en segundo plano:', payload);

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
