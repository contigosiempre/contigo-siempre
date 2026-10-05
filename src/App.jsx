import React, { useState, useEffect } from "react";
import { Heart, User, Users, ArrowRight, Moon, Sun, Type, X, CheckCircle, XCircle, Clock, HelpCircle } from "lucide-react";

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
  const [fontSize, setFontSize] = useState(1);

  // Pestaña activa del cuidador
  const [tabActiva, setTabActiva] = useState("Inicio");

  // Tutorial
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialPaso, setTutorialPaso] = useState(0);

  // Medicamentos
  const [medicamentos, setMedicamentos] = useState([
    { id: "1", nombre: "Losartán 50mg", dosis: "1 tableta", tipo: "tableta", ml: "", gotas: "", notas: "Tomar con agua, después del desayuno", horarios: "08:00, 20:00", color: "teal" },
    { id: "2", nombre: "Metformina 850mg", dosis: "5 ml", tipo: "ml", ml: "5", gotas: "", notas: "Tomar con la cena", horarios: "21:00", color: "coral" }
  ]);

  // Historial (ejemplo)
  const [historial] = useState([
    { id: "h1", medicamento: "Losartán 50mg", fecha: "2026-10-04", hora: "08:00", estado: "tomado" },
    { id: "h2", medicamento: "Metformina 850mg", fecha: "2026-10-03", hora: "21:00", estado: "tomado" },
    { id: "h3", medicamento: "Losartán 50mg", fecha: "2026-10-03", hora: "20:00", estado: "no_tomado" },
    { id: "h4", medicamento: "Losartán 50mg", fecha: "2026-10-02", hora: "08:00", estado: "tomado" }
  ]);

  // Modal de agregar medicamento
  const [showModal, setShowModal] = useState(false);
  const [nuevoMed, setNuevoMed] = useState({
    nombre: "",
    tipo: "tableta",
    dosis: "",
    ml: "",
    gotas: "",
    notas: "",
    horarios: "",
    color: "teal"
  });

  const C = darkMode ? DARK : LIGHT;

  // Pasos del tutorial
  const tutorialPasos = [
    { titulo: "Bienvenido a Contigo Siempre", texto: "Te enseñaré a usar la app en 9 pasos. Empecemos por lo básico.", target: null },
    { titulo: "Crea tu familia", texto: "Haz clic en 'Soy nueva familia' para crear un nuevo grupo familiar. O ingresa un código si ya tienes uno.", target: "welcome" },
    { titulo: "Agrega un adulto mayor", texto: "En Ajustes, agrega a la persona a la que le recordarás sus medicamentos.", target: "ajustes" },
    { titulo: "Agrega un medicamento", texto: "En la pestaña Canasta, haz clic en '+ Agregar medicamento' para crear un nuevo recordatorio.", target: "canasta" },
    { titulo: "Configura los horarios", texto: "En el formulario, define los horarios en que el adulto mayor debe tomar cada medicamento.", target: "canasta" },
    { titulo: "Pantalla del adulto mayor", texto: "Esta es la pantalla que verá el adulto mayor. Es simple, con letra grande y botones claros.", target: "adulto" },
    { titulo: "Confirma una toma", texto: "Cuando el adulto mayor tome su medicamento, debe presionar el botón verde '✓ YA LA TOMÉ'.", target: "adulto" },
    { titulo: "Revisa el historial", texto: "En la pestaña Historial verás todas las tomas confirmadas y no confirmadas.", target: "historial" },
    { titulo: "Invita a otro cuidador", texto: "En Ajustes, comparte el código de familia para que otro familiar también pueda ayudar.", target: "ajustes" }
  ];

  useEffect(() => {
    cuandoDbListo((d) => {
      setFirebaseEstado(d ? "conectado" : "local");
    });

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
  }, []);

  const handleDemo = (tipo) => {
    setModoDemo(tipo);
    setStage("app");
    if (tipo === "cuidador") {
      setTabActiva("Inicio");
    }
  };

  const handleVolver = () => {
    setStage("welcome");
    setModoDemo(null);
    setShowTutorial(false);
  };

  const handleIniciarTutorial = () => {
    setShowTutorial(true);
    setTutorialPaso(0);
  };

  const handleSiguientePaso = () => {
    if (tutorialPaso < tutorialPasos.length - 1) {
      setTutorialPaso(tutorialPaso + 1);
    } else {
      setShowTutorial(false);
      setTutorialPaso(0);
    }
  };

  const handleAnteriorPaso = () => {
    if (tutorialPaso > 0) {
      setTutorialPaso(tutorialPaso - 1);
    }
  };

  // ==================== FUNCIONES DE MEDICAMENTOS ====================
  const handleAgregarMedicamento = () => {
    if (!nuevoMed.nombre) return;
    
    let dosisFinal = nuevoMed.dosis;
    if (nuevoMed.tipo === "tableta") dosisFinal = nuevoMed.dosis || "1 tableta";
    if (nuevoMed.tipo === "ml") dosisFinal = `${nuevoMed.ml || "0"} ml`;
    if (nuevoMed.tipo === "gotas") dosisFinal = `${nuevoMed.gotas || "0"} gotas`;

    const med = {
      id: Date.now().toString(),
      nombre: nuevoMed.nombre,
      tipo: nuevoMed.tipo,
      dosis: dosisFinal,
      ml: nuevoMed.ml,
      gotas: nuevoMed.gotas,
      notas: nuevoMed.notas,
      horarios: nuevoMed.horarios,
      color: nuevoMed.color
    };

    setMedicamentos([...medicamentos, med]);
    setNuevoMed({ nombre: "", tipo: "tableta", dosis: "", ml: "", gotas: "", notas: "", horarios: "", color: "teal" });
    setShowModal(false);
  };

  const handleEliminarMedicamento = (id) => {
    setMedicamentos(medicamentos.filter(m => m.id !== id));
  };

  // ==================== PANTALLA DE INICIO ====================
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

        {/* Tutorial modal */}
        {showTutorial && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 2000 }}>
            <div style={{ background: C.PAPER, borderRadius: "20px", padding: "24px", maxWidth: "350px", width: "100%", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "16px" }}>
                <HelpCircle size={20} color={C.TEAL} />
                <span style={{ color: C.MUTED, fontSize: "12px" }}>Paso {tutorialPaso + 1} de {tutorialPasos.length}</span>
              </div>
              <h3 style={{ color: C.INK, fontSize: "18px", margin: "0 0 12px" }}>{tutorialPasos[tutorialPaso].titulo}</h3>
              <p style={{ color: C.MUTED, fontSize: "14px", margin: "0 0 20px" }}>{tutorialPasos[tutorialPaso].texto}</p>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={handleAnteriorPaso} disabled={tutorialPaso === 0} style={{ flex: 1, background: "transparent", color: tutorialPaso === 0 ? C.LINE : C.MUTED, border: `1px solid ${C.LINE}`, borderRadius: "10px", padding: "10px", fontSize: "13px", cursor: tutorialPaso === 0 ? "not-allowed" : "pointer" }}>
                  Anterior
                </button>
                <button onClick={handleSiguientePaso} style={{ flex: 1, background: C.TEAL, color: "#FFF", border: "none", borderRadius: "10px", padding: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                  {tutorialPaso === tutorialPasos.length - 1 ? "Finalizar" : "Siguiente"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==================== PANTALLA DEL ADULTO MAYOR ====================
  if (modoDemo === "adulto" && stage === "app") {
    return (
      <div style={{ minHeight: "100vh", background: C.CREAM, fontFamily: "'Space Grotesk', 'Segoe UI', sans-serif", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
        
        <div style={{ position: "absolute", top: "20px", right: "20px", display: "flex", gap: "10px" }}>
          <button onClick={() => setDarkMode(!darkMode)} style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            {darkMode ? <Sun size={20} color={C.INK} /> : <Moon size={20} color={C.INK} />}
          </button>
          <button style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Type size={20} color={C.INK} />
          </button>
        </div>

        <div style={{ background: C.PAPER, borderRadius: "24px", padding: "30px 20px", maxWidth: "400px", width: "100%", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.1)", border: `2px solid ${C.CORAL}` }}>
          
          <h1 style={{ color: C.CORAL, fontSize: "24px", margin: "0 0 20px" }}>¡ES HORA DE TOMAR!</h1>
          
          <div style={{ background: C.TEAL, borderRadius: "16px", padding: "20px", marginBottom: "20px" }}>
            <h2 style={{ color: "#FFF", fontSize: "28px", margin: 0 }}>💊 Losartán 50mg</h2>
          </div>

          <div style={{ textAlign: "left", marginBottom: "24px" }}>
            <p style={{ color: C.INK, fontSize: "20px", margin: "8px 0" }}>📝 Tomar 1 tableta</p>
            <p style={{ color: C.INK, fontSize: "20px", margin: "8px 0" }}>💧 Con un vaso de agua</p>
            <p style={{ color: C.INK, fontSize: "20px", margin: "8px 0" }}>🍽️ Después del desayuno</p>
          </div>

          <button style={{ width: "100%", background: C.OK, color: "#FFF", border: "none", borderRadius: "16px", padding: "20px", fontSize: "22px", fontWeight: "bold", cursor: "pointer", marginBottom: "12px" }}>
            ✓ YA LA TOMÉ
          </button>

          <button style={{ width: "100%", background: "transparent", color: C.CORAL, border: `2px solid ${C.CORAL}`, borderRadius: "16px", padding: "16px", fontSize: "18px", fontWeight: "600", cursor: "pointer", marginBottom: "24px" }}>
            ⏰ POSTERGAR 5 MIN
          </button>
        </div>

        <div style={{ maxWidth: "400px", width: "100%", marginTop: "20px" }}>
          <button style={{ width: "100%", background: C.TEAL, color: "#FFF", border: "none", borderRadius: "14px", padding: "16px", fontSize: "16px", fontWeight: "600", cursor: "pointer", marginBottom: "10px" }}>
            📞 LLAMAR AL CUIDADOR
          </button>
          <button style={{ width: "100%", background: C.CORAL, color: "#FFF", border: "none", borderRadius: "14px", padding: "16px", fontSize: "16px", fontWeight: "600", cursor: "pointer", marginBottom: "10px" }}>
            🚨 CONTACTOS DE EMERGENCIA
          </button>
          <button onClick={handleVolver} style={{ width: "100%", background: "transparent", color: C.MUTED, border: "none", padding: "12px", fontSize: "14px", cursor: "pointer" }}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // ==================== PANTALLA DEL CUIDADOR ====================
  if (modoDemo === "cuidador" && stage === "app") {
    return (
      <div style={{ minHeight: "100vh", background: C.CREAM, fontFamily: "'Space Grotesk', 'Segoe UI', sans-serif" }}>
        
        {/* Barra superior */}
        <div style={{ background: C.TEAL, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ color: "#FFF", fontSize: "20px", margin: 0 }}>Contigo Siempre</h1>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={handleIniciarTutorial} style={{ background: "transparent", border: "1px solid #FFF", color: "#FFF", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", cursor: "pointer" }}>
              ❓ Ayuda
            </button>
            <button onClick={handleVolver} style={{ background: "transparent", border: "1px solid #FFF", color: "#FFF", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", cursor: "pointer" }}>
              Salir
            </button>
          </div>
        </div>

        {/* Pestañas */}
        <div style={{ display: "flex", background: C.PAPER, borderBottom: `1px solid ${C.LINE}` }}>
          {["Inicio", "Canasta", "Historial", "Ajustes"].map((tab) => (
            <button
              key={tab}
              onClick={() => setTabActiva(tab)}
              style={{
                flex: 1,
                padding: "14px 8px",
                background: "transparent",
                border: "none",
                borderBottom: tab === tabActiva ? `3px solid ${C.TEAL}` : "3px solid transparent",
                color: tab === tabActiva ? C.TEAL : C.MUTED,
                fontSize: "14px",
                fontWeight: tab === tabActiva ? "600" : "400",
                cursor: "pointer"
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Contenido de la pestaña activa */}
        <div style={{ padding: "20px" }}>
          
          {/* PESTAÑA CANASTA */}
          {tabActiva === "Canasta" && (
            <>
              <h2 style={{ color: C.INK, fontSize: "22px", marginBottom: "16px" }}>🧺 Canasta de medicamentos</h2>
              <p style={{ color: C.MUTED, fontSize: "14px", marginBottom: "20px" }}>Aquí puedes ver y agregar los medicamentos de tu ser querido.</p>

              {medicamentos.map((med) => (
                <div key={med.id} style={{ background: C.PAPER, borderRadius: "16px", padding: "16px", marginBottom: "12px", borderLeft: `4px solid ${med.color === "teal" ? C.TEAL : C.CORAL}`, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h3 style={{ color: C.INK, fontSize: "16px", margin: "0 0 4px" }}>💊 {med.nombre}</h3>
                      <p style={{ color: C.MUTED, fontSize: "13px", margin: "0 0 4px" }}>Dosis: {med.dosis} | Horarios: {med.horarios}</p>
                      {med.notas && <p style={{ color: C.MUTED, fontSize: "12px", margin: 0 }}>📝 {med.notas}</p>}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "16px" }}>✏️</button>
                      <button onClick={() => handleEliminarMedicamento(med.id)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "16px" }}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))}

              <button onClick={() => setShowModal(true)} style={{ width: "100%", background: C.TEAL, color: "#FFF", border: "none", borderRadius: "14px", padding: "16px", fontSize: "16px", fontWeight: "600", cursor: "pointer", marginTop: "12px" }}>
                + Agregar medicamento
              </button>
            </>
          )}

          {/* PESTAÑA HISTORIAL */}
          {tabActiva === "Historial" && (
            <>
              <h2 style={{ color: C.INK, fontSize: "22px", marginBottom: "16px" }}>📊 Historial de tomas</h2>
              <p style={{ color: C.MUTED, fontSize: "14px", marginBottom: "20px" }}>Registro de las tomas confirmadas y no confirmadas.</p>

              {historial.map((item) => (
                <div key={item.id} style={{ background: C.PAPER, borderRadius: "16px", padding: "16px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  {item.estado === "tomado" ? (
                    <CheckCircle size={24} color={C.OK} />
                  ) : (
                    <XCircle size={24} color={C.CORAL} />
                  )}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: C.INK, fontSize: "15px", margin: "0 0 4px" }}>{item.medicamento}</h3>
                    <p style={{ color: C.MUTED, fontSize: "13px", margin: 0 }}>{item.fecha} - {item.hora}</p>
                  </div>
                  <span style={{ color: item.estado === "tomado" ? C.OK : C.CORAL, fontSize: "12px", fontWeight: "600" }}>
                    {item.estado === "tomado" ? "Tomado" : "No tomado"}
                  </span>
                </div>
              ))}
            </>
          )}

          {/* PESTAÑA AJUSTES */}
          {tabActiva === "Ajustes" && (
            <>
              <h2 style={{ color: C.INK, fontSize: "22px", marginBottom: "16px" }}>⚙️ Ajustes</h2>
              
              <div style={{ background: C.PAPER, borderRadius: "16px", padding: "16px", marginBottom: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <h3 style={{ color: C.INK, fontSize: "16px", margin: "0 0 8px" }}>👨‍👩‍👧‍👦 Familia</h3>
                <p style={{ color: C.MUTED, fontSize: "13px", margin: "0 0 4px" }}>Nombre: Familia Larrota</p>
                <p style={{ color: C.MUTED, fontSize: "13px", margin: 0 }}>Código: <strong style={{ color: C.TEAL }}>CONTIGO2026</strong></p>
              </div>

              <div style={{ background: C.PAPER, borderRadius: "16px", padding: "16px", marginBottom: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <h3 style={{ color: C.INK, fontSize: "16px", margin: "0 0 8px" }}>👴 Adultos mayores</h3>
                <p style={{ color: C.MUTED, fontSize: "13px", margin: "0 0 4px" }}>• Rosa (08:00, 20:00)</p>
                <p style={{ color: C.MUTED, fontSize: "13px", margin: 0 }}>• Luis (21:00)</p>
                <button style={{ marginTop: "10px", background: C.TEAL, color: "#FFF", border: "none", borderRadius: "10px", padding: "8px 16px", fontSize: "13px", cursor: "pointer" }}>
                  + Agregar adulto mayor
                </button>
              </div>

              <div style={{ background: C.PAPER, borderRadius: "16px", padding: "16px", marginBottom: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <h3 style={{ color: C.INK, fontSize: "16px", margin: "0 0 8px" }}>👥 Cuidadores</h3>
                <p style={{ color: C.MUTED, fontSize: "13px", margin: "0 0 4px" }}>• Jairo (tú)</p>
                <p style={{ color: C.MUTED, fontSize: "13px", margin: 0 }}>• María</p>
                <button style={{ marginTop: "10px", background: C.TEAL, color: "#FFF", border: "none", borderRadius: "10px", padding: "8px 16px", fontSize: "13px", cursor: "pointer" }}>
                  + Invitar cuidador
                </button>
              </div>

              <div style={{ background: C.PAPER, borderRadius: "16px", padding: "16px", marginBottom: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <h3 style={{ color: C.INK, fontSize: "16px", margin: "0 0 8px" }}>🌙 Preferencias</h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ color: C.MUTED, fontSize: "14px" }}>Modo nocturno</span>
                  <button onClick={() => setDarkMode(!darkMode)} style={{ background: darkMode ? C.TEAL : C.LINE, border: "none", borderRadius: "20px", width: "50px", height: "26px", cursor: "pointer", position: "relative" }}>
                    <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#FFF", position: "absolute", top: "2px", left: darkMode ? "26px" : "2px", transition: "0.3s" }} />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* PESTAÑA INICIO */}
          {tabActiva === "Inicio" && (
            <>
              <h2 style={{ color: C.INK, fontSize: "22px", marginBottom: "16px" }}>🏠 Resumen del día</h2>
              <p style={{ color: C.MUTED, fontSize: "14px", marginBottom: "20px" }}>Aquí verás el resumen de las tomas de tu ser querido.</p>
              <div style={{ background: C.PAPER, borderRadius: "16px", padding: "20px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <h3 style={{ color: C.TEAL, fontSize: "32px", margin: "0 0 8px" }}>3 / 4</h3>
                <p style={{ color: C.MUTED, fontSize: "14px", margin: 0 }}>Tomas confirmadas hoy</p>
              </div>
            </>
          )}

        </div>

        {/* MODAL DE AGREGAR MEDICAMENTO */}
        {showModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 1000 }}>
            <div style={{ background: C.PAPER, borderRadius: "20px", padding: "24px", maxWidth: "400px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ color: C.INK, fontSize: "20px", margin: 0 }}>Nuevo medicamento</h2>
                <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                  <X size={24} color={C.MUTED} />
                </button>
              </div>

              <label style={{ display: "block", color: C.INK, fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>Nombre del medicamento</label>
              <input
                type="text"
                value={nuevoMed.nombre}
                onChange={(e) => setNuevoMed({ ...nuevoMed, nombre: e.target.value })}
                placeholder="Ej: Losartán 50mg"
                style={{ width: "100%", padding: "12px", borderRadius: "10px", border: `1px solid ${C.LINE}`, fontSize: "14px", marginBottom: "16px", boxSizing: "border-box" }}
              />

              <label style={{ display: "block", color: C.INK, fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>Tipo de dosis</label>
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                {["tableta", "ml", "gotas", "otra"].map((tipo) => (
                  <button
                    key={tipo}
                    onClick={() => setNuevoMed({ ...nuevoMed, tipo })}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "10px",
                      border: `1px solid ${nuevoMed.tipo === tipo ? C.TEAL : C.LINE}`,
                      background: nuevoMed.tipo === tipo ? C.TEAL : "transparent",
                      color: nuevoMed.tipo === tipo ? "#FFF" : C.INK,
                      fontSize: "13px",
                      cursor: "pointer",
                      textTransform: "capitalize"
                    }}
                  >
                    {tipo}
                  </button>
                ))}
              </div>

              {nuevoMed.tipo === "tableta" && (
                <input
                  type="text"
                  value={nuevoMed.dosis}
                  onChange={(e) => setNuevoMed({ ...nuevoMed, dosis: e.target.value })}
                  placeholder="Ej: 1 tableta"
                  style={{ width: "100%", padding: "12px", borderRadius: "10px", border: `1px solid ${C.LINE}`, fontSize: "14px", marginBottom: "16px", boxSizing: "border-box" }}
                />
              )}

              {nuevoMed.tipo === "ml" && (
                <input
                  type="text"
                  value={nuevoMed.ml}
                  onChange={(e) => setNuevoMed({ ...nuevoMed, ml: e.target.value })}
                  placeholder="Ej: 5"
                  style={{ width: "100%", padding: "12px", borderRadius: "10px", border: `1px solid ${C.LINE}`, fontSize: "14px", marginBottom: "16px", boxSizing: "border-box" }}
                />
              )}

              {nuevoMed.tipo === "gotas" && (
                <input
                  type="text"
                  value={nuevoMed.gotas}
                  onChange={(e) => setNuevoMed({ ...nuevoMed, gotas: e.target.value })}
                  placeholder="Ej: 10"
                  style={{ width: "100%", padding: "12px", borderRadius: "10px", border: `1px solid ${C.LINE}`, fontSize: "14px", marginBottom: "16px", boxSizing: "border-box" }}
                />
              )}

              {nuevoMed.tipo === "otra" && (
                <input
                  type="text"
                  value={nuevoMed.dosis}
                  onChange={(e) => setNuevoMed({ ...nuevoMed, dosis: e.target.value })}
                  placeholder="Ej: 1 cucharada"
                  style={{ width: "100%", padding: "12px", borderRadius: "10px", border: `1px solid ${C.LINE}`, fontSize: "14px", marginBottom: "16px", boxSizing: "border-box" }}
                />
              )}

              <label style={{ display: "block", color: C.INK, fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>Notas (opcional)</label>
              <textarea
                value={nuevoMed.notas}
                onChange={(e) => setNuevoMed({ ...nuevoMed, notas: e.target.value })}
                placeholder="Ej: Tomar con agua, después del desayuno"
                rows="3"
                style={{ width: "100%", padding: "12px", borderRadius: "10px", border: `1px solid ${C.LINE}`, fontSize: "14px", marginBottom: "16px", boxSizing: "border-box", resize: "vertical" }}
              />

              <label style={{ display: "block", color: C.INK, fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>Horarios</label>
              <input
                type="text"
                value={nuevoMed.horarios}
                onChange={(e) => setNuevoMed({ ...nuevoMed, horarios: e.target.value })}
                placeholder="Ej: 08:00, 20:00"
                style={{ width: "100%", padding: "12px", borderRadius: "10px", border: `1px solid ${C.LINE}`, fontSize: "14px", marginBottom: "16px", boxSizing: "border-box" }}
              />

              <label style={{ display: "block", color: C.INK, fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>Color</label>
              <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
                <button
                  onClick={() => setNuevoMed({ ...nuevoMed, color: "teal" })}
                  style={{ width: "40px", height: "40px", borderRadius: "50%", background: C.TEAL, border: nuevoMed.color === "teal" ? `3px solid ${C.INK}` : "none", cursor: "pointer" }}
                />
                <button
                  onClick={() => setNuevoMed({ ...nuevoMed, color: "coral" })}
                  style={{ width: "40px", height: "40px", borderRadius: "50%", background: C.CORAL, border: nuevoMed.color === "coral" ? `3px solid ${C.INK}` : "none", cursor: "pointer" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, background: "transparent", color: C.MUTED, border: `1px solid ${C.LINE}`, borderRadius: "12px", padding: "14px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
                  Cancelar
                </button>
                <button onClick={handleAgregarMedicamento} style={{ flex: 1, background: C.TEAL, color: "#FFF", border: "none", borderRadius: "12px", padding: "14px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
                  Guardar
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TUTORIAL MODAL */}
        {showTutorial && (
          <div style={{ position: "fixed", bottom: "20px", right: "20px", background: C.PAPER, borderRadius: "16px", padding: "20px", maxWidth: "300px", width: "100%", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", zIndex: 2000 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <span style={{ color: C.MUTED, fontSize: "11px" }}>Paso {tutorialPaso + 1} de {tutorialPasos.length}</span>
              <button onClick={() => setShowTutorial(false)} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                <X size={16} color={C.MUTED} />
              </button>
            </div>
            <h3 style={{ color: C.INK, fontSize: "16px", margin: "0 0 8px" }}>{tutorialPasos[tutorialPaso].titulo}</h3>
            <p style={{ color: C.MUTED, fontSize: "13px", margin: "0 0 16px" }}>{tutorialPasos[tutorialPaso].texto}</p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handleAnteriorPaso} disabled={tutorialPaso === 0} style={{ flex: 1, background: "transparent", color: tutorialPaso === 0 ? C.LINE : C.MUTED, border: `1px solid ${C.LINE}`, borderRadius: "8px", padding: "8px", fontSize: "12px", cursor: tutorialPaso === 0 ? "not-allowed" : "pointer" }}>
                Anterior
              </button>
              <button onClick={handleSiguientePaso} style={{ flex: 1, background: C.TEAL, color: "#FFF", border: "none", borderRadius: "8px", padding: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
                {tutorialPaso === tutorialPasos.length - 1 ? "Finalizar" : "Siguiente"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
