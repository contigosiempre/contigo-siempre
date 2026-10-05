import React, { useState, useEffect } from "react";
import { Heart, User, Users, ArrowRight, Moon, Sun, Type, X, CheckCircle, XCircle, Menu, ShoppingCart, Camera, Phone, Clock, Settings, Home, List, HelpCircle, LogOut, Search, Star, AlertCircle } from "lucide-react";

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
const LIGHT = { INK: "#1A237E", TEAL: "#1976D2", CORAL: "#D32F2F", CREAM: "#FFFFFF", PAPER: "#FFFFFF", LINE: "#E0E4EB", MUTED: "#5F6B7A", OK: "#2E7D32", WARN: "#F57C00" };
const DARK = { INK: "#F5F7FA", TEAL: "#64B5F6", CORAL: "#EF5350", CREAM: "#0F182E", PAPER: "#16243A", LINE: "#2A3A52", MUTED: "#9FB0C3", OK: "#66BB6A", WARN: "#FFB74D" };

// ==================== LISTA DE MEDICAMENTOS CRÍTICOS ====================
const MEDICAMENTOS_CRITICOS = [
  "insulina", "warfarina", "anticoagulante", "heparina", "clopidogrel",
  "metformina", "glibenclamida", "levotiroxina", "digoxina", "fenitoina",
  "carbamazepina", "valproato", "litio", "tacrolimus", "ciclosporina",
  "prednisona", "dexametasona", "morfina", "fentanilo", "oxicodona"
];

const esCritico = (nombre) => {
  const nombreLower = nombre.toLowerCase();
  return MEDICAMENTOS_CRITICOS.some(med => nombreLower.includes(med));
};

// ==================== COMPONENTE PRINCIPAL ====================
export default function App() {
  const [stage, setStage] = useState("welcome");
  const [firebaseEstado, setFirebaseEstado] = useState("local");
  const [modoDemo, setModoDemo] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(1);
  const [daltonismo, setDaltonismo] = useState("ninguno");
  const [tabActiva, setTabActiva] = useState("Inicio");
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Familia
  const [codigoFamilia, setCodigoFamilia] = useState("");

  // Tutorial
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialPaso, setTutorialPaso] = useState(0);

  // Medicamentos
  const [medicamentos, setMedicamentos] = useState([
    { id: "1", nombre: "Losartán 50mg", dosis: "1 tableta", tipo: "tableta", ml: "", gotas: "", puff: "", notas: "Tomar con agua, después del desayuno", horarios: "08:00, 20:00", color: "teal", stock: 30, stockInicial: 30, critico: false, rescate: false },
    { id: "2", nombre: "Insulina", dosis: "10 unidades", tipo: "otra", ml: "", gotas: "", puff: "", notas: "Aplicar en el abdomen", horarios: "08:00", color: "coral", stock: 5, stockInicial: 10, critico: true, rescate: false }
  ]);

  // Historial
  const [historial, setHistorial] = useState([
    { id: "h1", medicamento: "Losartán 50mg", fecha: "2026-10-04", hora: "08:00", estado: "tomado" },
    { id: "h2", medicamento: "Insulina", fecha: "2026-10-03", hora: "08:00", estado: "tomado" },
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
    puff: "",
    notas: "",
    horarios: "",
    color: "teal",
    stock: "30",
    rescate: false
  });

  // Modal de verificación por foto
  const [showFotoModal, setShowFotoModal] = useState(false);
  const [fotoVerificacion, setFotoVerificacion] = useState(null);

  // Modal de vinculación
  const [showVinculacion, setShowVinculacion] = useState(false);
  const [codigoIngresado, setCodigoIngresado] = useState("");

  // Búsqueda en el carro de compras
  const [busqueda, setBusqueda] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);

  const C = darkMode ? DARK : LIGHT;

  // Pasos del tutorial
  const tutorialPasos = [
    { titulo: "Bienvenido a Contigo Siempre", texto: "Te enseñaré a usar la app en 9 pasos. Empecemos por lo básico." },
    { titulo: "Crea tu familia", texto: "Haz clic en 'Soy nueva familia' para crear un nuevo grupo familiar. O ingresa un código si ya tienes uno." },
    { titulo: "Agrega un adulto mayor", texto: "En Ajustes, agrega a la persona a la que le recordarás sus medicamentos." },
    { titulo: "Agrega un medicamento", texto: "En la pestaña Medicamentos, haz clic en '+ Agregar medicamento' para crear un nuevo recordatorio." },
    { titulo: "Configura los horarios", texto: "En el formulario, define los horarios en que el adulto mayor debe tomar cada medicamento." },
    { titulo: "Pantalla del adulto mayor", texto: "Esta es la pantalla que verá el adulto mayor. Es simple, con letra grande y botones claros." },
    { titulo: "Confirma una toma", texto: "Cuando el adulto mayor tome su medicamento, debe presionar el botón verde '✓ YA LA TOMÉ'." },
    { titulo: "Revisa el historial", texto: "En la pestaña Historial verás todas las tomas confirmadas y no confirmadas." },
    { titulo: "Invita a otro cuidador", texto: "En Ajustes, comparte el código de familia para que otro familiar también pueda ayudar." }
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

  // ==================== CREAR FAMILIA ====================
  const handleCrearFamilia = async () => {
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    
    const nuevaFamilia = {
      codigo: codigo,
      nombre: "Familia " + codigo,
      fechaCreacion: new Date().toISOString(),
      adultos: [],
      cuidadores: ["Jairo"],
      medicamentos: [],
      historial: []
    };

    try {
      await db.collection("familias").doc(codigo).set(nuevaFamilia);
      console.log("Familia creada con código:", codigo);
      setCodigoFamilia(codigo);
      setModoDemo("cuidador");
      setStage("app");
      setTabActiva("Inicio");
    } catch (error) {
      console.error("Error al crear familia:", error);
      alert("Hubo un error al crear la familia. Inténtalo de nuevo.");
    }
  };

  const handleVolver = () => {
    setStage("welcome");
    setModoDemo(null);
    setShowTutorial(false);
    setMenuAbierto(false);
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
    if (nuevoMed.tipo === "puff") dosisFinal = `${nuevoMed.puff || "0"} puff`;

    const med = {
      id: Date.now().toString(),
      nombre: nuevoMed.nombre,
      tipo: nuevoMed.tipo,
      dosis: dosisFinal,
      ml: nuevoMed.ml,
      gotas: nuevoMed.gotas,
      puff: nuevoMed.puff,
      notas: nuevoMed.notas,
      horarios: nuevoMed.rescate ? "A demanda" : nuevoMed.horarios,
      color: esCritico(nuevoMed.nombre) ? "coral" : nuevoMed.color,
      stock: parseInt(nuevoMed.stock) || 30,
      stockInicial: parseInt(nuevoMed.stock) || 30,
      critico: esCritico(nuevoMed.nombre),
      rescate: nuevoMed.rescate
    };

    setMedicamentos([...medicamentos, med]);
    setNuevoMed({ nombre: "", tipo: "tableta", dosis: "", ml: "", gotas: "", puff: "", notas: "", horarios: "", color: "teal", stock: "30", rescate: false });
    setShowModal(false);
  };

  const handleEliminarMedicamento = (id) => {
    setMedicamentos(medicamentos.filter(m => m.id !== id));
  };

  const handleConfirmarToma = (id) => {
    setMedicamentos(medicamentos.map(m => {
      if (m.id === id && m.stock > 0) {
        return { ...m, stock: m.stock - 1 };
      }
      return m;
    }));
  };

  // ==================== BÚSQUEDA EN EL CARRO ====================
  const handleBuscar = () => {
    if (!busqueda.trim()) return;

    const productosEjemplo = [
      { nombre: "Crema Utopía", precio: "$5.990", categoria: "Cremas" },
      { nombre: "Crema Hidratante", precio: "$4.500", categoria: "Cremas" },
      { nombre: "Crema Antiinflamatoria", precio: "$6.200", categoria: "Cremas" },
      { nombre: "Vitamina C", precio: "$3.990", categoria: "Vitaminas" },
      { nombre: "Vitamina D", precio: "$4.500", categoria: "Vitaminas" },
      { nombre: "Paracetamol", precio: "$2.990", categoria: "Analgésicos" },
      { nombre: "Ibuprofeno", precio: "$3.500", categoria: "Analgésicos" }
    ];

    const filtrados = productosEjemplo.filter(p => 
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
      p.categoria.toLowerCase().includes(busqueda.toLowerCase())
    );

    setResultadosBusqueda(filtrados);
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

          <button onClick={handleCrearFamilia} style={{ width: "100%", background: C.TEAL, color: "#FFF", border: "none", borderRadius: "14px", padding: "16px", fontSize: "16px", fontWeight: "600", cursor: "pointer", marginBottom: "12px" }}>
            Soy nueva familia
          </button>
          <button onClick={() => setShowVinculacion(true)} style={{ width: "100%", background: "transparent", color: C.INK, border: `2px solid ${C.LINE}`, borderRadius: "14px", padding: "16px", fontSize: "16px", fontWeight: "600", cursor: "pointer", marginBottom: "24px" }}>
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

        {/* MODAL DE VINCULACIÓN */}
        {showVinculacion && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 2000 }}>
            <div style={{ background: C.PAPER, borderRadius: "20px", padding: "30px 24px", maxWidth: "350px", width: "100%", textAlign: "center" }}>
              <h3 style={{ color: C.INK, fontSize: "18px", margin: "0 0 8px" }}>Vincular con tu cuidador</h3>
              <p style={{ color: C.MUTED, fontSize: "13px", margin: "0 0 20px" }}>Ingresa el código de 6 dígitos que te dio tu cuidador.</p>
              <input type="text" maxLength="6" value={codigoIngresado} onChange={(e) => setCodigoIngresado(e.target.value.replace(/\D/g, ""))} placeholder="000000" style={{ width: "100%", padding: "14px", borderRadius: "12px", border: `2px solid ${C.TEAL}`, fontSize: "24px", textAlign: "center", letterSpacing: "8px", marginBottom: "20px", boxSizing: "border-box" }} />
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setShowVinculacion(false)} style={{ flex: 1, background: "transparent", color: C.MUTED, border: `1px solid ${C.LINE}`, borderRadius: "10px", padding: "12px", fontSize: "14px", cursor: "pointer" }}>Cancelar</button>
                <button onClick={() => { setShowVinculacion(false); handleDemo("adulto"); }} style={{ flex: 1, background: C.TEAL, color: "#FFF", border: "none", borderRadius: "10px", padding: "12px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>Vincular</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==================== PANTALLA DEL ADULTO MAYOR ====================
  if (modoDemo === "adulto" && stage === "app") {
    const medicamentoActual = medicamentos[0];

    return (
      <div style={{ minHeight: "100vh", background: C.CREAM, fontFamily: "'Space Grotesk', 'Segoe UI', sans-serif", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: C.PAPER, borderRadius: "24px", padding: "30px 20px", maxWidth: "400px", width: "100%", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.1)", border: `3px solid ${medicamentoActual?.critico ? C.CORAL : C.TEAL}` }}>
          <h1 style={{ color: medicamentoActual?.critico ? C.CORAL : C.TEAL, fontSize: "28px", margin: "0 0 24px", fontWeight: "bold" }}>
            {medicamentoActual?.critico ? "¡URGENTE!" : "¡ES HORA DE TOMAR!"}
          </h1>
          <div style={{ background: medicamentoActual?.critico ? C.CORAL : C.TEAL, borderRadius: "20px", padding: "24px", marginBottom: "24px" }}>
            <h2 style={{ color: "#FFF", fontSize: "32px", margin: 0 }}>💊 {medicamentoActual?.nombre || "Medicamento"}</h2>
          </div>
          <div style={{ marginBottom: "24px" }}>
            <p style={{ color: C.INK, fontSize: "24px", margin: "8px 0", fontWeight: "600" }}>{medicamentoActual?.dosis || "1 tableta"}</p>
            {medicamentoActual?.notas && <p style={{ color: C.MUTED, fontSize: "20px", margin: "8px 0" }}>{medicamentoActual.notas}</p>}
          </div>
          <button onClick={() => handleConfirmarToma(medicamentoActual?.id)} style={{ width: "100%", background: C.OK, color: "#FFF", border: "none", borderRadius: "20px", padding: "28px", fontSize: "28px", fontWeight: "bold", cursor: "pointer", marginBottom: "16px", boxShadow: "0 4px 12px rgba(46,125,50,0.4)" }}>
            ✓ YA LA TOMÉ
          </button>
          <button style={{ width: "100%", background: C.TEAL, color: "#FFF", border: "none", borderRadius: "16px", padding: "20px", fontSize: "20px", fontWeight: "600", cursor: "pointer", marginBottom: "12px" }}>
            📞 LLAMAR A JAIRO
          </button>
          <button style={{ width: "100%", background: "transparent", color: C.CORAL, border: `2px solid ${C.CORAL}`, borderRadius: "16px", padding: "16px", fontSize: "18px", fontWeight: "600", cursor: "pointer" }}>
            ⏰ RECORDAR EN 5 MIN
          </button>
        </div>
        <button onClick={handleVolver} style={{ marginTop: "20px", background: "transparent", color: C.MUTED, border: "none", padding: "12px", fontSize: "12px", cursor: "pointer", opacity: 0.5 }}>
          (Salir de demo)
        </button>
      </div>
    );
  }

  // ==================== PANTALLA DEL CUIDADOR ====================
  if (modoDemo === "cuidador" && stage === "app") {
    return (
      <div style={{ minHeight: "100vh", background: C.CREAM, fontFamily: "'Space Grotesk', 'Segoe UI', sans-serif", position: "relative" }}>
        
        {/* Barra superior */}
        <div style={{ background: C.TEAL, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button onClick={() => setMenuAbierto(true)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
              <Menu size={28} color="#FFF" />
            </button>
            <h1 style={{ color: "#FFF", fontSize: "20px", margin: 0 }}>Contigo Siempre</h1>
          </div>
          <button onClick={handleVolver} style={{ background: "transparent", border: "1px solid #FFF", color: "#FFF", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", cursor: "pointer" }}>
            Salir
          </button>
        </div>

        {/* MENÚ LATERAL */}
        {menuAbierto && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
            <div onClick={() => setMenuAbierto(false)} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)" }} />
            <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "280px", background: C.PAPER, boxShadow: "4px 0 20px rgba(0,0,0,0.3)", overflowY: "auto" }}>
              <div style={{ background: C.TEAL, padding: "24px 20px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "#FFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Heart size={28} color={C.TEAL} />
                </div>
                <div>
                  <h2 style={{ color: "#FFF", fontSize: "16px", margin: 0 }}>Contigo Siempre</h2>
                  <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px", margin: 0 }}>{codigoFamilia ? `Familia ${codigoFamilia}` : "Familia Larrota"}</p>
                </div>
              </div>
              <div style={{ padding: "12px 0" }}>
                {[
                  { id: "Inicio", icono: <Home size={20} />, label: "Inicio" },
                  { id: "Canasta", icono: <ShoppingCart size={20} />, label: "Medicamentos" },
                  { id: "Carro", icono: <ShoppingCart size={20} />, label: "Carro de compras" },
                  { id: "Historial", icono: <List size={20} />, label: "Historial" },
                  { id: "Ajustes", icono: <Settings size={20} />, label: "Ajustes" },
                  { id: "Ayuda", icono: <HelpCircle size={20} />, label: "Ayuda" }
                ].map((item) => (
                  <button key={item.id} onClick={() => { setTabActiva(item.id); setMenuAbierto(false); if (item.id === "Ayuda") handleIniciarTutorial(); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: "14px", padding: "14px 20px", background: tabActiva === item.id ? "rgba(25,118,210,0.1)" : "transparent", border: "none", borderLeft: tabActiva === item.id ? `4px solid ${C.TEAL}` : "4px solid transparent", color: tabActiva === item.id ? C.TEAL : C.INK, fontSize: "15px", fontWeight: tabActiva === item.id ? "600" : "400", cursor: "pointer", textAlign: "left" }}>
                    <span style={{ color: tabActiva === item.id ? C.TEAL : C.MUTED }}>{item.icono}</span>
                    {item.label}
                  </button>
                ))}
                <div style={{ borderTop: `1px solid ${C.LINE}`, margin: "12px 0" }} />
                <button onClick={handleVolver} style={{ width: "100%", display: "flex", alignItems: "center", gap: "14px", padding: "14px 20px", background: "transparent", border: "none", color: C.CORAL, fontSize: "15px", cursor: "pointer", textAlign: "left" }}>
                  <LogOut size={20} />
                  Salir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO */}
        <div style={{ padding: "20px" }}>
          
          {/* PESTAÑA INICIO */}
          {tabActiva === "Inicio" && (
            <>
              <h2 style={{ color: C.INK, fontSize: "22px", marginBottom: "16px" }}>📅 Calendario de adherencia</h2>
              <p style={{ color: C.MUTED, fontSize: "14px", marginBottom: "20px" }}>Verde: todas las tomas. Amarillo: faltó alguna. Rojo: faltaron varias.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", marginBottom: "20px" }}>
                {["L", "M", "M", "J", "V", "S", "D"].map((dia, i) => (
                  <div key={i} style={{ textAlign: "center", color: C.MUTED, fontSize: "12px", fontWeight: "600" }}>{dia}</div>
                ))}
                {[
                  { dia: 1, estado: "verde" }, { dia: 2, estado: "verde" }, { dia: 3, estado: "amarillo" }, { dia: 4, estado: "verde" },
                  { dia: 5, estado: "rojo" }, { dia: 6, estado: "verde" }, { dia: 7, estado: "verde" },
                  { dia: 8, estado: "amarillo" }, { dia: 9, estado: "verde" }, { dia: 10, estado: "verde" }, { dia: 11, estado: "verde" },
                  { dia: 12, estado: "amarillo" }, { dia: 13, estado: "rojo" }, { dia: 14, estado: "verde" },
                  { dia: 15, estado: "verde" }, { dia: 16, estado: "verde" }, { dia: 17, estado: "verde" }, { dia: 18, estado: "amarillo" },
                  { dia: 19, estado: "verde" }, { dia: 20, estado: "verde" }, { dia: 21, estado: "verde" },
                  { dia: 22, estado: "rojo" }, { dia: 23, estado: "verde" }, { dia: 24, estado: "verde" }, { dia: 25, estado: "verde" },
                  { dia: 26, estado: "amarillo" }, { dia: 27, estado: "verde" }, { dia: 28, estado: "verde" },
                  { dia: 29, estado: "verde" }, { dia: 30, estado: "verde" }, { dia: 31, estado: "verde" }
                ].map((item) => (
                  <div key={item.dia} style={{ aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", background: item.estado === "verde" ? "rgba(46,125,50,0.2)" : item.estado === "amarillo" ? "rgba(255,193,7,0.2)" : "rgba(211,47,47,0.2)", color: item.estado === "verde" ? C.OK : item.estado === "amarillo" ? C.WARN : C.CORAL, fontSize: "14px", fontWeight: "600", border: `1px solid ${item.estado === "verde" ? C.OK : item.estado === "amarillo" ? C.WARN : C.CORAL}` }}>
                    {item.dia}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "12px", height: "12px", borderRadius: "3px", background: C.OK }}></span>
                  <span style={{ color: C.MUTED, fontSize: "12px" }}>Completo</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "12px", height: "12px", borderRadius: "3px", background: C.WARN }}></span>
                  <span style={{ color: C.MUTED, fontSize: "12px" }}>Faltó alguno</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "12px", height: "12px", borderRadius: "3px", background: C.CORAL }}></span>
                  <span style={{ color: C.MUTED, fontSize: "12px" }}>Faltaron varios</span>
                </div>
              </div>
            </>
          )}

          {/* PESTAÑA MEDICAMENTOS (CANASTA) */}
          {tabActiva === "Canasta" && (
            <>
              <h2 style={{ color: C.INK, fontSize: "22px", marginBottom: "16px" }}>💊 Medicamentos</h2>
              <p style={{ color: C.MUTED, fontSize: "14px", marginBottom: "20px" }}>Aquí puedes ver y agregar los medicamentos de tu ser querido.</p>

              {medicamentos.map((med) => (
                <div key={med.id} style={{ background: C.PAPER, borderRadius: "16px", padding: "16px", marginBottom: "12px", borderLeft: `4px solid ${med.critico ? C.CORAL : C.TEAL}`, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <h3 style={{ color: C.INK, fontSize: "16px", margin: 0 }}>{med.nombre}</h3>
                        {med.critico && <span style={{ background: C.CORAL, color: "#FFF", fontSize: "10px", padding: "2px 6px", borderRadius: "4px", fontWeight: "600" }}>CRÍTICO</span>}
                        {med.rescate && <span style={{ background: C.WARN, color: "#FFF", fontSize: "10px", padding: "2px 6px", borderRadius: "4px", fontWeight: "600" }}>RESCATE</span>}
                      </div>
                      <p style={{ color: C.MUTED, fontSize: "13px", margin: "0 0 4px" }}>Dosis: {med.dosis} | Horarios: {med.horarios}</p>
                      {med.notas && <p style={{ color: C.MUTED, fontSize: "12px", margin: "0 0 8px" }}>📝 {med.notas}</p>}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                        <span style={{ color: med.stock < 5 ? C.CORAL : C.MUTED, fontSize: "12px", fontWeight: med.stock < 5 ? "600" : "400" }}>
                          📦 Stock: {med.stock} unidades
                        </span>
                        {med.stock < 5 && <span style={{ color: C.CORAL, fontSize: "11px" }}>¡Poco stock!</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <button onClick={() => { setNuevoMed({ ...med, stock: med.stock.toString() }); setShowModal(true); }} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "16px" }}>✏️</button>
                      <button onClick={() => handleEliminarMedicamento(med.id)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "16px" }}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))}

              <button onClick={() => { setNuevoMed({ nombre: "", tipo: "tableta", dosis: "", ml: "", gotas: "", puff: "", notas: "", horarios: "", color: "teal", stock: "30", rescate: false }); setShowModal(true); }} style={{ width: "100%", background: C.TEAL, color: "#FFF", border: "none", borderRadius: "14px", padding: "16px", fontSize: "16px", fontWeight: "600", cursor: "pointer", marginTop: "12px" }}>
                + Agregar medicamento
              </button>
            </>
          )}

          {/* PESTAÑA CARRO DE COMPRAS */}
          {tabActiva === "Carro" && (
            <>
              <h2 style={{ color: C.INK, fontSize: "22px", marginBottom: "16px" }}>🛒 Carro de compras</h2>
              <p style={{ color: C.MUTED, fontSize: "14px", marginBottom: "20px" }}>Productos recomendados según el stock y los medicamentos de tu ser querido.</p>

              <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                <div style={{ flex: 1, display: "flex", alignItems: "center", background: C.PAPER, borderRadius: "12px", border: `1px solid ${C.LINE}`, padding: "0 12px" }}>
                  <Search size={18} color={C.MUTED} />
                  <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleBuscar()} placeholder="Buscar productos (ej: crema, vitamina, paracetamol)" style={{ flex: 1, padding: "14px 12px", border: "none", background: "transparent", fontSize: "14px", outline: "none", color: C.INK }} />
                </div>
                <button onClick={handleBuscar} style={{ background: C.TEAL, color: "#FFF", border: "none", borderRadius: "12px", padding: "14px 20px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>Buscar</button>
              </div>

              {resultadosBusqueda.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  <h3 style={{ color: C.INK, fontSize: "16px", marginBottom: "12px" }}>Resultados de búsqueda</h3>
                  {resultadosBusqueda.map((prod, i) => (
                    <div key={i} style={{ background: C.PAPER, borderRadius: "12px", padding: "14px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                      <div>
                        <h4 style={{ color: C.INK, fontSize: "14px", margin: "0 0 4px" }}>{prod.nombre}</h4>
                        <p style={{ color: C.MUTED, fontSize: "12px", margin: 0 }}>{prod.categoria} - {prod.precio}</p>
                      </div>
                      <button style={{ background: C.OK, color: "#FFF", border: "none", borderRadius: "8px", padding: "8px 12px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>🛒 Agregar</button>
                    </div>
                  ))}
                </div>
              )}

              {medicamentos.filter(m => m.stock < 5).length > 0 ? (
                medicamentos.filter(m => m.stock < 5).map((med) => (
                  <div key={med.id} style={{ background: C.PAPER, borderRadius: "16px", padding: "16px", marginBottom: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: C.INK, fontSize: "16px", margin: "0 0 4px" }}>💊 {med.nombre}</h3>
                        <p style={{ color: C.CORAL, fontSize: "13px", margin: "0 0 4px", fontWeight: "600" }}>⚠️ Quedan solo {med.stock} unidades</p>
                        <p style={{ color: C.MUTED, fontSize: "12px", margin: 0 }}>
                          {med.critico ? "🔒 Requiere receta médica. Se recomienda farmacia." : "🛍️ Producto de venta libre. Disponible en Mercado Libre."}
                        </p>
                      </div>
                    </div>
                    <button style={{ width: "100%", background: C.OK, color: "#FFF", border: "none", borderRadius: "10px", padding: "12px", fontSize: "14px", fontWeight: "600", cursor: "pointer", marginTop: "12px" }}>
                      {med.critico ? "🏥 Comprar en farmacia" : "🛒 Comprar en Mercado Libre"}
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ background: C.PAPER, borderRadius: "16px", padding: "30px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <ShoppingCart size={40} color={C.MUTED} style={{ marginBottom: "12px" }} />
                  <p style={{ color: C.MUTED, fontSize: "14px", margin: 0 }}>No hay productos recomendados por ahora. ¡Todo el stock está bien!</p>
                </div>
              )}
            </>
          )}

          {/* PESTAÑA HISTORIAL */}
          {tabActiva === "Historial" && (
            <>
              <h2 style={{ color: C.INK, fontSize: "22px", marginBottom: "16px" }}>📊 Historial de tomas</h2>
              <p style={{ color: C.MUTED, fontSize: "14px", marginBottom: "20px" }}>Registro de las tomas confirmadas y no confirmadas.</p>

              {historial.map((item) => (
                <div key={item.id} style={{ background: C.PAPER, borderRadius: "16px", padding: "16px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  {item.estado === "tomado" ? <CheckCircle size={24} color={C.OK} /> : <XCircle size={24} color={C.CORAL} />}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: C.INK, fontSize: "15px", margin: "0 0 4px" }}>{item.medicamento}</h3>
                    <p style={{ color: C.MUTED, fontSize: "13px", margin: 0 }}>{item.fecha} - {item.hora}</p>
                  </div>
                  <span style={{ color: item.estado === "tomado" ? C.OK : C.CORAL, fontSize: "12px", fontWeight: "600" }}>{item.estado === "tomado" ? "Tomado" : "No tomado"}</span>
                </div>
              ))}

              <div style={{ background: C.PAPER, borderRadius: "16px", padding: "16px", marginTop: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <h3 style={{ color: C.INK, fontSize: "16px", margin: "0 0 8px" }}>📸 Verificación por foto</h3>
                <p style={{ color: C.MUTED, fontSize: "13px", margin: "0 0 12px" }}>Cada 7 días, toma una foto de los sachets para verificar el stock.</p>
                <button onClick={() => setShowFotoModal(true)} style={{ width: "100%", background: C.TEAL, color: "#FFF", border: "none", borderRadius: "10px", padding: "12px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>📷 Tomar foto de verificación</button>
              </div>
            </>
          )}

          {/* PESTAÑA AJUSTES */}
          {tabActiva === "Ajustes" && (
            <>
              <h2 style={{ color: C.INK, fontSize: "22px", marginBottom: "16px" }}>⚙️ Ajustes</h2>
              
              <div style={{ background: C.PAPER, borderRadius: "16px", padding: "16px", marginBottom: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <h3 style={{ color: C.INK, fontSize: "16px", margin: "0 0 8px" }}>👨‍👩‍👧‍👦 Familia</h3>
                <p style={{ color: C.MUTED, fontSize: "13px", margin: "0 0 4px" }}>Código de familia:</p>
                <p style={{ color: C.TEAL, fontSize: "28px", fontWeight: "bold", margin: "0 0 12px", letterSpacing: "4px" }}>{codigoFamilia || "------"}</p>
                <p style={{ color: C.MUTED, fontSize: "12px", margin: "0 0 12px" }}>Comparte este código con el adulto mayor para vincular su celular.</p>
                <button style={{ background: C.TEAL, color: "#FFF", border: "none", borderRadius: "10px", padding: "8px 16px", fontSize: "13px", cursor: "pointer" }}>📋 Copiar código</button>
              </div>

              <div style={{ background: C.PAPER, borderRadius: "16px", padding: "16px", marginBottom: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <h3 style={{ color: C.INK, fontSize: "16px", margin: "0 0 8px" }}>👴 Adultos mayores</h3>
                <p style={{ color: C.MUTED, fontSize: "13px", margin: "0 0 4px" }}>• Rosa (08:00, 20:00)</p>
                <p style={{ color: C.MUTED, fontSize: "13px", margin: "0 0 8px" }}>• Luis (21:00)</p>
                <button style={{ background: C.TEAL, color: "#FFF", border: "none", borderRadius: "10px", padding: "8px 16px", fontSize: "13px", cursor: "pointer" }}>+ Agregar adulto mayor</button>
              </div>

              <div style={{ background: C.PAPER, borderRadius: "16px", padding: "16px", marginBottom: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <h3 style={{ color: C.INK, fontSize: "16px", margin: "0 0 8px" }}>👥 Cuidadores</h3>
                <p style={{ color: C.MUTED, fontSize: "13px", margin: "0 0 4px" }}>• Jairo (tú)</p>
                <p style={{ color: C.MUTED, fontSize: "13px", margin: "0 0 8px" }}>• María</p>
                <button style={{ background: C.TEAL, color: "#FFF", border: "none", borderRadius: "10px", padding: "8px 16px", fontSize: "13px", cursor: "pointer" }}>+ Invitar cuidador</button>
              </div>

              <div style={{ background: C.PAPER, borderRadius: "16px", padding: "16px", marginBottom: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <h3 style={{ color: C.INK, fontSize: "16px", margin: "0 0 8px" }}>🌙 Preferencias</h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ color: C.MUTED, fontSize: "14px" }}>Modo nocturno</span>
                  <button onClick={() => setDarkMode(!darkMode)} style={{ background: darkMode ? C.TEAL : C.LINE, border: "none", borderRadius: "20px", width: "50px", height: "26px", cursor: "pointer", position: "relative" }}>
                    <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#FFF", position: "absolute", top: "2px", left: darkMode ? "26px" : "2px", transition: "0.3s" }} />
                  </button>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ color: C.MUTED, fontSize: "14px" }}>Tamaño de letra</span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => setFontSize(Math.max(0.8, fontSize - 0.1))} style={{ background: C.LINE, border: "none", borderRadius: "8px", width: "36px", height: "36px", cursor: "pointer", fontSize: "16px" }}>A-</button>
                    <button onClick={() => setFontSize(Math.min(1.5, fontSize + 0.1))} style={{ background: C.TEAL, border: "none", borderRadius: "8px", width: "36px", height: "36px", cursor: "pointer", fontSize: "16px", color: "#FFF" }}>A+</button>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: C.MUTED, fontSize: "14px" }}>Modo daltonismo</span>
                  <select value={daltonismo} onChange={(e) => setDaltonismo(e.target.value)} style={{ padding: "6px 10px", borderRadius: "8px", border: `1px solid ${C.LINE}`, fontSize: "13px" }}>
                    <option value="ninguno">Ninguno</option>
                    <option value="protanopia">Protanopia</option>
                    <option value="deuteranopia">Deuteranopia</option>
                    <option value="tritanopia">Tritanopia</option>
                  </select>
                </div>
              </div>

              <div style={{ background: C.PAPER, borderRadius: "16px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <h3 style={{ color: C.INK, fontSize: "16px", margin: "0 0 8px" }}>⚖️ Legal</h3>
                <p style={{ color: C.MUTED, fontSize: "12px", margin: "0 0 12px" }}>Esta app cumple con la Ley N° 21.719 de Protección de Datos Personales de Chile. Tus datos de salud son tratados con confidencialidad y solo para la gestión de recordatorios.</p>
                <button style={{ background: "transparent", color: C.TEAL, border: "none", cursor: "pointer", fontSize: "13px", textDecoration: "underline", padding: 0 }}>Ver términos y condiciones completos</button>
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
                <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer" }}><X size={24} color={C.MUTED} /></button>
              </div>

              <label style={{ display: "block", color: C.INK, fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>Nombre del medicamento</label>
              <input type="text" value={nuevoMed.nombre} onChange={(e) => setNuevoMed({ ...nuevoMed, nombre: e.target.value })} placeholder="Ej: Losartán 50mg" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: `1px solid ${C.LINE}`, fontSize: "14px", marginBottom: "16px", boxSizing: "border-box" }} />

              <label style={{ display: "block", color: C.INK, fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>Tipo de dosis</label>
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                {["tableta", "ml", "gotas", "puff", "otra"].map((tipo) => (
                  <button key={tipo} onClick={() => setNuevoMed({ ...nuevoMed, tipo })} style={{ padding: "8px 16px", borderRadius: "10px", border: `1px solid ${nuevoMed.tipo === tipo ? C.TEAL : C.LINE}`, background: nuevoMed.tipo === tipo ? C.TEAL : "transparent", color: nuevoMed.tipo === tipo ? "#FFF" : C.INK, fontSize: "13px", cursor: "pointer", textTransform: "capitalize" }}>{tipo}</button>
                ))}
              </div>

              {nuevoMed.tipo === "tableta" && <input type="text" value={nuevoMed.dosis} onChange={(e) => setNuevoMed({ ...nuevoMed, dosis: e.target.value })} placeholder="Ej: 1 tableta" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: `1px solid ${C.LINE}`, fontSize: "14px", marginBottom: "16px", boxSizing: "border-box" }} />}
              {nuevoMed.tipo === "ml" && <input type="text" value={nuevoMed.ml} onChange={(e) => setNuevoMed({ ...nuevoMed, ml: e.target.value })} placeholder="Ej: 5" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: `1px solid ${C.LINE}`, fontSize: "14px", marginBottom: "16px", boxSizing: "border-box" }} />}
              {nuevoMed.tipo === "gotas" && <input type="text" value={nuevoMed.gotas} onChange={(e) => setNuevoMed({ ...nuevoMed, gotas: e.target.value })} placeholder="Ej: 10" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: `1px solid ${C.LINE}`, fontSize: "14px", marginBottom: "16px", boxSizing: "border-box" }} />}
              {nuevoMed.tipo === "puff" && <input type="text" value={nuevoMed.puff} onChange={(e) => setNuevoMed({ ...nuevoMed, puff: e.target.value })} placeholder="Ej: 2" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: `1px solid ${C.LINE}`, fontSize: "14px", marginBottom: "16px", boxSizing: "border-box" }} />}
              {nuevoMed.tipo === "otra" && <input type="text" value={nuevoMed.dosis} onChange={(e) => setNuevoMed({ ...nuevoMed, dosis: e.target.value })} placeholder="Ej: 1 cucharada" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: `1px solid ${C.LINE}`, fontSize: "14px", marginBottom: "16px", boxSizing: "border-box" }} />}

              <label style={{ display: "block", color: C.INK, fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>Notas (opcional)</label>
              <textarea value={nuevoMed.notas} onChange={(e) => setNuevoMed({ ...nuevoMed, notas: e.target.value })} placeholder="Ej: Tomar con agua, después del desayuno" rows="3" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: `1px solid ${C.LINE}`, fontSize: "14px", marginBottom: "16px", boxSizing: "border-box", resize: "vertical" }} />

              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", background: C.CREAM, padding: "12px", borderRadius: "10px", border: `1px solid ${C.LINE}` }}>
                <input type="checkbox" id="rescate" checked={nuevoMed.rescate} onChange={(e) => setNuevoMed({ ...nuevoMed, rescate: e.target.checked })} style={{ width: "20px", height: "20px", cursor: "pointer" }} />
                <label htmlFor="rescate" style={{ color: C.INK, fontSize: "14px", cursor: "pointer", flex: 1 }}><strong>Modo rescate</strong> (medicamento de uso a demanda, sin horario fijo)</label>
              </div>

              {!nuevoMed.rescate && (
                <>
                  <label style={{ display: "block", color: C.INK, fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>Horarios</label>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                    {(nuevoMed.horarios ? nuevoMed.horarios.split(", ") : []).map((h, i) => (
                      <span key={i} style={{ background: C.TEAL, color: "#FFF", padding: "6px 12px", borderRadius: "8px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                        🕐 {h}
                        <button onClick={() => { const nuevos = nuevoMed.horarios.split(", ").filter((_, idx) => idx !== i).join(", "); setNuevoMed({ ...nuevoMed, horarios: nuevos }); }} style={{ background: "transparent", border: "none", color: "#FFF", cursor: "pointer", padding: 0, fontSize: "14px" }}>×</button>
                      </span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                    <input type="time" id="nuevoHorario" style={{ flex: 1, padding: "12px", borderRadius: "10px", border: `1px solid ${C.LINE}`, fontSize: "14px", boxSizing: "border-box" }} />
                    <button onClick={() => { const input = document.getElementById("nuevoHorario"); if (input.value) { const nuevos = nuevoMed.horarios ? `${nuevoMed.horarios}, ${input.value}` : input.value; setNuevoMed({ ...nuevoMed, horarios: nuevos }); input.value = ""; } }} style={{ background: C.TEAL, color: "#FFF", border: "none", borderRadius: "10px", padding: "12px 20px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>+ Agregar</button>
                  </div>
                </>
              )}

              <label style={{ display: "block", color: C.INK, fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>Stock inicial (cantidad recetada)</label>
              <input type="number" value={nuevoMed.stock} onChange={(e) => setNuevoMed({ ...nuevoMed, stock: e.target.value })} placeholder="Ej: 30" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: `1px solid ${C.LINE}`, fontSize: "14px", marginBottom: "16px", boxSizing: "border-box" }} />

              <label style={{ display: "block", color: C.INK, fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>Color identificador</label>
              <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
                <button onClick={() => setNuevoMed({ ...nuevoMed, color: "teal" })} style={{ width: "50px", height: "50px", borderRadius: "12px", background: C.TEAL, border: nuevoMed.color === "teal" ? `3px solid ${C.INK}` : `2px solid ${C.LINE}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {nuevoMed.color === "teal" && <CheckCircle size={24} color="#FFF" />}
                </button>
                <button onClick={() => setNuevoMed({ ...nuevoMed, color: "coral" })} style={{ width: "50px", height: "50px", borderRadius: "12px", background: C.CORAL, border: nuevoMed.color === "coral" ? `3px solid ${C.INK}` : `2px solid ${C.LINE}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {nuevoMed.color === "coral" && <CheckCircle size={24} color="#FFF" />}
                </button>
              </div>

              {esCritico(nuevoMed.nombre) && (
                <div style={{ background: "rgba(211,47,47,0.1)", border: `2px solid ${C.CORAL}`, borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <AlertCircle size={20} color={C.CORAL} />
                    <h4 style={{ color: C.CORAL, fontSize: "14px", margin: 0, fontWeight: "700" }}>MEDICAMENTO CRÍTICO</h4>
                  </div>
                  <p style={{ color: C.CORAL, fontSize: "13px", margin: 0, lineHeight: "1.4" }}>Este medicamento ha sido identificado como crítico. Si el adulto mayor no confirma la toma en el horario indicado, se enviará una notificación inmediata al cuidador.</p>
                </div>
              )}

              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, background: "transparent", color: C.MUTED, border: `1px solid ${C.LINE}`, borderRadius: "12px", padding: "14px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>Cancelar</button>
                <button onClick={handleAgregarMedicamento} style={{ flex: 1, background: C.TEAL, color: "#FFF", border: "none", borderRadius: "12px", padding: "14px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>Guardar</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE VERIFICACIÓN POR FOTO */}
        {showFotoModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 1000 }}>
            <div style={{ background: C.PAPER, borderRadius: "20px", padding: "24px", maxWidth: "400px", width: "100%", textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ color: C.INK, fontSize: "20px", margin: 0 }}>📸 Verificación por foto</h2>
                <button onClick={() => setShowFotoModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer" }}><X size={24} color={C.MUTED} /></button>
              </div>
              <p style={{ color: C.MUTED, fontSize: "14px", marginBottom: "20px" }}>Toma una foto de los sachets de los medicamentos para verificar que el stock coincide.</p>
              <div style={{ background: C.CREAM, borderRadius: "12px", padding: "30px", marginBottom: "20px", border: `2px dashed ${C.LINE}` }}>
                {fotoVerificacion ? <img src={fotoVerificacion} alt="Verificación" style={{ maxWidth: "100%", borderRadius: "8px" }} /> : <div><Camera size={48} color={C.MUTED} style={{ marginBottom: "12px" }} /><p style={{ color: C.MUTED, fontSize: "13px", margin: 0 }}>Aquí aparecerá la foto</p></div>}
              </div>
              <input type="file" accept="image/*" capture="environment" onChange={(e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = (event) => setFotoVerificacion(event.target.result); reader.readAsDataURL(file); } }} style={{ display: "none" }} id="inputFoto" />
              <label htmlFor="inputFoto" style={{ display: "block", width: "100%", background: C.TEAL, color: "#FFF", border: "none", borderRadius: "12px", padding: "14px", fontSize: "14px", fontWeight: "600", cursor: "pointer", marginBottom: "12px" }}>📷 {fotoVerificacion ? "Tomar otra foto" : "Tomar foto"}</label>
              {fotoVerificacion && <button style={{ width: "100%", background: C.OK, color: "#FFF", border: "none", borderRadius: "12px", padding: "14px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }} onClick={() => { alert("Foto guardada. El stock ha sido verificado."); setShowFotoModal(false); setFotoVerificacion(null); }}>✓ Confirmar verificación</button>}
            </div>
          </div>
        )}

        {/* TUTORIAL MODAL */}
        {showTutorial && (
          <div style={{ position: "fixed", bottom: "20px", right: "20px", background: C.PAPER, borderRadius: "16px", padding: "20px", maxWidth: "300px", width: "100%", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", zIndex: 2000 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <span style={{ color: C.MUTED, fontSize: "11px" }}>Paso {tutorialPaso + 1} de {tutorialPasos.length}</span>
              <button onClick={() => setShowTutorial(false)} style={{ background: "transparent", border: "none", cursor: "pointer" }}><X size={16} color={C.MUTED} /></button>
            </div>
            <h3 style={{ color: C.INK, fontSize: "16px", margin: "0 0 8px" }}>{tutorialPasos[tutorialPaso].titulo}</h3>
            <p style={{ color: C.MUTED, fontSize: "13px", margin: "0 0 16px" }}>{tutorialPasos[tutorialPaso].texto}</p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handleAnteriorPaso} disabled={tutorialPaso === 0} style={{ flex: 1, background: "transparent", color: tutorialPaso === 0 ? C.LINE : C.MUTED, border: `1px solid ${C.LINE}`, borderRadius: "8px", padding: "8px", fontSize: "12px", cursor: tutorialPaso === 0 ? "not-allowed" : "pointer" }}>Anterior</button>
              <button onClick={handleSiguientePaso} style={{ flex: 1, background: C.TEAL, color: "#FFF", border: "none", borderRadius: "8px", padding: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>{tutorialPaso === tutorialPasos.length - 1 ? "Finalizar" : "Siguiente"}</button>
            </div>
          </div>
        )}

      </div>
    );
  }

  return null;
}
