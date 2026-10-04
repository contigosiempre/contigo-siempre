
import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Configuración de tu proyecto Firebase contigo-siempre-79017
const firebaseConfig = {
  apiKey: "AIzaSyAGxIGYqifeb5qGlVTQaVVpmKjZ9E1__TU",
  authDomain: "contigo-siempre-79017.firebaseapp.com",
  projectId: "contigo-siempre-79017",
  storageBucket: "contigo-siempre-79017.firebasestorage.app",
  messagingSenderId: "373374322978",
  appId: "1:373374322978:web:05fc428462d73d4f197d7b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messaging = getMessaging(app);

const VAPID_KEY = "BFPDPH02Oa44BflTPgU8Z7VbkqGL7rG3ZDLOAp9EKlkGYZWmoslFktvQtSl29HJR1g04ESs2lBElRTEwWMAPwzO";

export default function App() {
  const [fcmToken, setFcmToken] = useState(null);
  const [notifEstado, setNotifEstado] = useState("Sin activar");

  // 1. Activar notificaciones y obtener Token FCM
  const activarNotificaciones = async (idUsuario = "adulto_demo") => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(messaging, { vapidKey: VAPID_KEY });
        if (token) {
          setFcmToken(token);
          setNotifEstado("Activadas ✅");

          // Guardar token en Firestore
          await setDoc(doc(db, "adultosMayores", idUsuario), {
            fcmToken: token,
            ultimaActualizacion: new Date().toISOString()
          }, { merge: true });

          console.log("Token FCM guardado con éxito:", token);
        }
      } else {
        setNotifEstado("Permiso denegado ❌");
      }
    } catch (error) {
      console.error("Error al activar notificaciones:", error);
      setNotifEstado("Error al activar ⚠️");
    }
  };

  // 2. Listener para recibir mensajes en primer plano (app abierta)
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Notificación en primer plano:", payload);
      if (payload.notification) {
        alert(`⏰ ${payload.notification.title}\n${payload.notification.body}`);
      }
    });

    return () => unsubscribe();
  }, []);

  // 3. Verificador de horarios de medicamentos (Revisión cada 1 minuto)
  useEffect(() => {
    const revisarHorariosMedicamentos = async () => {
      const ahora = new Date();
      const horaActual = ahora.toTimeString().substring(0, 5); // Formato "HH:MM"

      try {
        const querySnapshot = await getDocs(collection(db, "adultosMayores"));
        querySnapshot.forEach((docSnap) => {
          const datos = docSnap.data();
          const token = datos.fcmToken;
          const medicamentos = datos.medicamentos || [];

          if (!token) return;

          medicamentos.forEach((med) => {
            if (med.hora === horaActual && !med.notificado) {
              // Disparar aviso
              console.log(`¡Hora del medicamento ${med.nombre}! Hora: ${horaActual}`);
              
              if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                  title: `⏰ Hora de tomar: ${med.nombre}`,
                  body: `Dosis: ${med.dosis || '1 dosis'}. Recuerda marcarlo como tomado.`,
                });
              }
            }
          });
        });
      } catch (err) {
        console.error("Error revisando horarios:", err);
      }
    };

    // Ejecutar inmediatamente y luego cada 60 segundos
    revisarHorariosMedicamentos();
    const intervalId = setInterval(revisarHorariosMedicamentos, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Contigo Siempre ❤️</h1>
      <p>Notificaciones: <strong>{notifEstado}</strong></p>
      
      {!fcmToken && (
        <button 
          onClick={() => activarNotificaciones("adulto_demo")}
          style={{ padding: '12px 20px', fontSize: '16px', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#4F46E5', color: 'white', border: 'none' }}
        >
          Activar Notificaciones de Medicamentos
        </button>
      )}

      {fcmToken && (
        <p style={{ fontSize: '12px', color: 'gray', wordBreak: 'break-all' }}>
          Token activo: {fcmToken.substring(0, 20)}...
        </p>
      )}
    </div>
  );
}
