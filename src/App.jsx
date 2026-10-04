import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore";

// Inicializar el servicio de notificaciones usando la app de Firebase ya creada
const messaging = getMessaging(app);

// Tu clave VAPID pública
const VAPID_KEY = "BFPDPH02Oa44BflTPgU8Z7VbkqGL7rG3ZDLOAp9EKlkGYZWmoslFktvQtSl29HJR1g04ESs2lBElRTEwWMAPwzO";

// Función para solicitar permiso y guardar el token en Firestore
async function activarNotificacionesPWA(idAdultoMayor) {
  try {
    // 1. Pedir permiso al usuario en el navegador/celular
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Permiso de notificaciones concedido.');

      // 2. Obtener el Token FCM nativo usando tu clave VAPID
      const tokenActual = await getToken(messaging, { 
        vapidKey: VAPID_KEY 
      });

      if (tokenActual) {
        console.log('Token FCM generado con éxito:', tokenActual);

        // 3. Guardar el Token en Firestore en la ficha del usuario
        await setDoc(doc(db, "adultosMayores", idAdultoMayor), {
          fcmToken: tokenActual,
          fechaToken: new Date().toISOString()
        }, { merge: true });

        alert("¡Notificaciones activadas con éxito en este dispositivo!");
      } else {
        console.warn('No se pudo obtener el token de notificación.');
      }
    } else {
      alert('Se denegó el permiso para enviar notificaciones.');
    }
  } catch (error) {
    console.error('Error al activar notificaciones:', error);
  }
}

// Escuchar mensajes cuando la app está abierta (en primer plano)
onMessage(messaging, (payload) => {
  console.log('Notificación recibida en primer plano:', payload);
  if (payload.notification) {
    alert(`⏰ ${payload.notification.title}\n${payload.notification.body}`);
  }
});
