// firebase-cloud-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAGxIGYqifeb5qGlVTQaVVpmKjZ9E1__TU",
  authDomain: "contigo-siempre-79017.firebaseapp.com",
  projectId: "contigo-siempre-79017",
  storageBucket: "contigo-siempre-79017.appspot.com",
  messagingSenderId: "373374322978",
  appId: "1:373374322978:web:05fc428462d73d4f197d7b"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensaje recibido en segundo plano:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/icon-192.png'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
