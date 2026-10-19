import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // (si no tienes index.css, borra esta línea)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// ==========================================
// SISTEMA DE ACTUALIZACIÓN AUTOMÁTICA
// ==========================================
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js').then((registration) => {
    // Si hay una nueva versión del Service Worker, recargamos la página
    registration.onupdatefound = () => {
      const installingWorker = registration.installing;
      installingWorker.onstatechange = () => {
        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // La nueva versión está lista. Recargamos.
          window.location.reload();
        }
      };
    };
  }).catch((err) => {
    console.warn('Error al registrar el Service Worker:', err);
  });
}
