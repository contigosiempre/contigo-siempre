import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Configuración de tu proyecto Firebase
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
  const [nombreMed, setNombreMed] = useState('');
  const [horaMed, setHoraMed] = useState('');
  const [dosisMed, setDosisMed] = useState('');
  const [medicamentos, setMedicamentos] = useState([]);
  const [notifEstado, setNotifEstado] = useState('Desactivadas');
  const [tokenRegistrado, setTokenRegistrado] = useState(false);

  const ID_PACIENTE = "adulto_demo";

  // 1. Escuchar medicamentos en tiempo real desde Firestore
  useEffect(() => {
    const docRef = doc(db, "adultosMayores", ID_PACIENTE);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMedicamentos(data.medicamentos || []);
        if (data.fcmToken) {
          setTokenRegistrado(true);
          setNotifEstado('Activadas ✅');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Activar permisos y guardar Token FCM
  const activarNotificaciones = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(messaging, { vapidKey: VAPID_KEY });
        if (token) {
          await setDoc(doc(db, "adultosMayores", ID_PACIENTE), {
            fcmToken: token,
            ultimaActualizacion: new Date().toISOString()
          }, { merge: true });

          setTokenRegistrado(true);
          setNotifEstado('Activadas ✅');
          alert('¡Notificaciones activadas con éxito!');
        }
      } else {
        alert('Permiso de notificaciones denegado.');
      }
    } catch (error) {
      console.error('Error activando notificaciones:', error);
    }
  };

  // 3. Agregar un nuevo medicamento a Firestore
  const agregarMedicamento = async (e) => {
    e.preventDefault();
    if (!nombreMed || !horaMed) return alert('Completa el nombre y la hora');

    const nuevoMedicamento = {
      id: Date.now().toString(),
      nombre: nombreMed,
      hora: horaMed,
      dosis: dosisMed || '1 comprimido',
      tomado: false
    };

    const listaActualizada = [...medicamentos, nuevoMedicamento];

    await setDoc(doc(db, "adultosMayores", ID_PACIENTE), {
      medicamentos: listaActualizada
    }, { merge: true });

    setNombreMed('');
    setHoraMed('');
    setDosisMed('');
  };

  // 4. Verificador automático de horarios cada 60 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      const horaActual = new Date().toTimeString().substring(0, 5);

      medicamentos.forEach((med) => {
        if (med.hora === horaActual && !med.tomado) {
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              title: `⏰ Hora de tu medicamento: ${med.nombre}`,
              body: `Dosis: ${med.dosis}. ¡Recuerda tomarlo!`
            });
          }
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [medicamentos]);

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: '#1D4ED8', marginBottom: '4px' }}>Contigo Siempre ❤️</h1>
        <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>Gestión de medicamentos para tu ser querido</p>
      </header>

      {/* Tarjeta de Estado de Notificaciones */}
      <div style={{ background: '#F3F4F6', padding: '16px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center' }}>
        <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Estado de alertas: <strong>{notifEstado}</strong></p>
        {!tokenRegistrado && (
          <button 
            onClick={activarNotificaciones}
            style={{ width: '100%', padding: '10px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            🔔 Activar Notificaciones en este celular
          </button>
        )}
      </div>

      {/* Formulario para agregar medicamento */}
      <section style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#111827' }}>Añadir nuevo remedio</h3>
        <form onSubmit={agregarMedicamento} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Nombre del medicamento (ej. Paracetamol)" 
            value={nombreMed} 
            onChange={(e) => setNombreMed(e.target.value)}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="time" 
              value={horaMed} 
              onChange={(e) => setHoraMed(e.target.value)}
              style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
            />
            <input 
              type="text" 
              placeholder="Dosis (ej. 500mg)" 
              value={dosisMed} 
              onChange={(e) => setDosisMed(e.target.value)}
              style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
            />
          </div>
          <button 
            type="submit"
            style={{ padding: '10px', background: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            + Guardar Remedio
          </button>
        </form>
      </section>

      {/* Lista de medicamentos agendados */}
      <section>
        <h3 style={{ fontSize: '16px', color: '#111827', marginBottom: '12px' }}>Remedios Programados</h3>
        {medicamentos.length === 0 ? (
          <p style={{ color: '#9CA3AF', fontSize: '14px', textAlign: 'center' }}>No hay remedios registrados aún.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {medicamentos.map((med) => (
              <div key={med.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#F9FAFB', borderRadius: '8px', borderLeft: '4px solid #2563EB' }}>
                <div>
                  <strong style={{ display: 'block', color: '#1F2937' }}>{med.nombre}</strong>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>Dosis: {med.dosis}</span>
                </div>
                <span style={{ background: '#DBEAFE', color: '#1E40AF', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px' }}>
                  {med.hora} hrs
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
