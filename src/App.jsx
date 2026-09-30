import React, { useState, useEffect } from "react";
import { Heart, User, Users, ArrowRight } from "lucide-react";

// ==================== FIREBASE ====================
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAGxIGYqifeb5qGlVTQaVVpmKjZ9E1__TU",
  authDomain: "contigo-siempre-79017.firebaseapp.com",
  projectId: "contigo-siempre-79017",
  storageBucket: "contigo-siempre-79017.firebasestorage.app",
  messagingSenderId: "373374322978",
  appId: "1:373374322978:web:05fc428462d73d4f197d7b"
};

let db = null;
let dbIniciando = false;
let dbCallbacks = [];

const cargar = (src) => new Promise((res) => {
  const s = document.createElement("script");
  s.src = src;
  s.onload = res;
  document.head.appendChild(s);
});

function cuandoDbListo(cb) {
  if (db) { cb(db); return; }
  dbCallbacks.push(cb);
  if (dbIniciando) return;
  dbIniciando = true;

  Promise.all([
    cargar("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"),
    cargar("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js")
  ]).then(() => {
    try {
      if (window.firebase && !window.firebase.apps.length) {
        window.firebase.initializeApp(FIREBASE_CONFIG);
      }
      if (window.firebase) {
        db = window.firebase.firestore();
        db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
          console.warn("Persistencia offline no disponible:", err.code);
        });
        console.log("Firebase conectado con persistencia offline");
      }
    } catch (e) { console.error("Firebase no disponible:", e); }
    dbCallbacks.forEach((cb) => cb(db));
    dbCallbacks = [];
  });
}

// ==================== COLORES ====================
const LIGHT = { INK: "#1A237E", TEAL: "#1976D2", CORAL: "#D32F2F", CREAM: "#FFFFFF", PAPER: "#FFFFFF", LINE: "#E0E4EB", MUTED: "#5F6B7A", OK: "#2E7D32" };
const DARK = { INK: "#F5F7FA", TEAL: "#64B5F6", CORAL: "#EF5350", CREAM: "#0F182E", PAPER: "#16243A", LINE: "#2A3A52", MUTED: "#9FB0C3", OK: "#66BB6A" };

// ==================== COMPONENTE PRINCIPAL ====================
export default function App() {
  const [stage, setStage] = useState("welcome");
  const [firebaseEstado, setFirebaseEstado] = useState("local");
  const [modoDemo, setModoDemo] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const C = darkMode ? DARK : LIGHT;

  // Inicializar OneSignal y Firebase
  useEffect(() => {
    cuandoDbListo((d) => {
      setFirebaseEstado(d ? "conectado" : "local");
    });

 // --- INICIO ONE SIGNAL (CÓDIGO OFICIAL) ---
    const oneSignalScript = document.createElement('script');
oneSignalScript.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
oneSignalScript.defer = true;
document.head.appendChild(oneSignalScript);

window.OneSignalDeferred = window.OneSignalDeferred || [];
OneSignalDeferred.push(function(OneSignal) {
  OneSignal.init({
    appId: "15b5f9cf-d380-41ae-9b43-31a8a978efd6",
    allowLocalhostAsSecureOrigin: true,
  });
});
// --- FIN ONE SIGNAL ---
  }, []);

  const handleDemo = (tipo) => {
    setModoDemo(tipo);
    setStage("app");
  };

  const handleVolver = () => {
    setStage("welcome");
    setModoDemo(null);
  };

  // ==================== RENDERIZADO ====================
  if (stage === "welcome") {
    return (
      <div style={{ minHeight: "100vh", background: darkMode ? "#0F182E" : "#1976D2", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "'Space Grotesk', 'Segoe UI', sans-serif" }}>
        <div style={{ background: C.PAPER, borderRadius: "24px", padding: "40px 24px", maxWidth: "400px", width: "100%", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: C.TEAL, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Heart size={40} color="#FFF" />
          </div>
          <h1 style={{ color: C.INK, fontSize: "28px", margin: "0 0 8px" }}>Contigo Siempre</h1>
          <p style={{ color: C.MUTED, fontSize: "14px", margin: "0 0 24px" }}>Recordatorios de medicamentos para tu ser querido</p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "24px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: firebaseEstado === "conectado" ? C.OK : C.CORAL }}></span>
            <span style={{ color: C.MUTED, fontSize: "12px" }}>{firebaseEstado === "conectado" ? "Nube conectada" : "Modo local"}</span>
          </div>

          <button style={{ width: "100%", background: C.TEAL, color: "#FFF", border: "none", borderRadius: "14px", padding: "16px", fontSize: "16px", fontWeight: "600", cursor: "pointer", marginBottom: "12px" }}>
            Soy nueva familia
          </button>
          <button style={{ width: "100%", background: "transparent", color: C.INK, border: `2px solid ${C.LINE}`, borderRadius: "14px", padding: "16px", fontSize: "16px", fontWeight: "600", cursor: "pointer", marginBottom: "24px" }}>
            Ya tengo un código
          </button>

          <p style={{ color: C.MUTED, fontSize: "12px", margin: "0 0 12px" }}>PROBAR CON DATOS DE EJEMPLO</p>

          <button onClick={() => handleDemo("adulto")} style={{ width: "100%", background: "transparent", border: `1px solid ${C.LINE}`, borderRadius: "14px", padding: "14px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", marginBottom: "8px" }}>
            <User size={20} color={C.TEAL} />
            <div style={{ textAlign: "left", flex: 1 }}>
              <div style={{ color: C.INK, fontWeight: "600", fontSize: "14px" }}>Demo del adulto mayor</div>
              <div style={{ color: C.MUTED, fontSize: "12px" }}>Pantalla simple: confirmar tomas</div>
            </div>
            <ArrowRight size={18} color={C.MUTED} />
          </button>

          <button onClick={() => handleDemo("cuidador")} style={{ width: "100%", background: "transparent", border: `1px solid ${C.LINE}`, borderRadius: "14px", padding: "14px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
            <Users size={20} color={C.TEAL} />
            <div style={{ textAlign: "left", flex: 1 }}>
              <div style={{ color: C.INK, fontWeight: "600", fontSize: "14px" }}>Demo del cuidador</div>
              <div style={{ color: C.MUTED, fontSize: "12px" }}>Tutorial completo con 9 pasos</div>
            </div>
            <ArrowRight size={18} color={C.MUTED} />
          </button>
        </div>
      </div>
    );
  }

  // Pantalla de la app (Demo adulto mayor o Cuidador)
  return (
    <div style={{ minHeight: "100vh", background: C.CREAM, fontFamily: "'Space Grotesk', 'Segoe UI', sans-serif", padding: "20px" }}>
      <h2 style={{ color: C.INK }}>App cargada correctamente ✅</h2>
      <p style={{ color: C.MUTED }}>Demo: {modoDemo}</p>
      <button onClick={handleVolver} style={{ background: C.TEAL, color: "#FFF", border: "none", borderRadius: "12px", padding: "12px 24px", fontSize: "16px", cursor: "pointer" }}>
        Volver al inicio
      </button>
    </div>
  );
}
