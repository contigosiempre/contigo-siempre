import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore";

// Inicializar el servicio de notificaciones
const messaging = getMessaging(app);

// Clave VAPID pública oficial de tu proyecto
const VAPID_KEY = "BFPDPH02Oa44BflTPgU8Z7VbkqGL7rG3ZDLOAp9EKlkGYZWmoslFktvQtSl29HJR1g04ESs2lBElRTEwWMAPwzO";

// Función global para solicitar permiso y guardar el Token FCM
async function activarNotificacionesDispositivo(idAdultoMayor) {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const tokenActual = await getToken(messaging, { vapidKey: VAPID_KEY });
      
      if (tokenActual) {
        // Guardar el token en el documento del adulto mayor en Firestore
        await setDoc(doc(db, "adultosMayores", idAdultoMayor), {
          fcmToken: tokenActual,
          ultimaActualizacionToken: new Date().toISOString()
        }, { merge: true });

        console.log("Token FCM guardado exitosamente en Firestore:", tokenActual);
        alert("¡Notificaciones activadas correctamente en este dispositivo!");
      } else {
        alert("No se pudo obtener el token de notificación.");
      }
    } else {
      alert("El permiso de notificaciones fue denegado.");
    }
  } catch (error) {
    console.error("Error al activar notificaciones:", error);
  }
}

// Listener para notificaciones en primer plano (cuando la app está abierta)
onMessage(messaging, (payload) => {
  if (payload.notification) {
    alert(`⏰ ${payload.notification.title}\n${payload.notification.body}`);
  }
});
