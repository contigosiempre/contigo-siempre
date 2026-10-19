import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js').then((registration) => {
    registration.onupdatefound = () => {
      const installingWorker = registration.installing;
      installingWorker.onstatechange = () => {
        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
          window.location.reload();
        }
      };
    };
  }).catch((err) => {
    console.warn('Error al registrar el Service Worker:', err);
  });
}
