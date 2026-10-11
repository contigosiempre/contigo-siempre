import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Registrar Service Worker de Firebase Messaging (para notificaciones en background)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then((registration) => {
        console.log('Firebase Messaging SW registrado:', registration.scope);
      })
      .catch((error) => {
        console.error('Error al registrar Firebase Messaging SW:', error);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
