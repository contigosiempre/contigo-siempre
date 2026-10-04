import React, { useState, useEffect, useCallback, useRef } from "react";
import { Clock, Check, AlertTriangle, Plus, X, ArrowRight, User, Users, Heart, PackageOpen, RotateCcw, KeyRound, Loader2, Copy, Truck, Store, ShoppingCart, ExternalLink, Sparkles, ShieldCheck, MessageSquare, Camera, Calendar, TrendingDown, Award, MapPin, Lock, Crown, Moon, Sun, Phone, FileText, Share2, StickyNote, UserPlus, ChevronDown, Info, ScrollText, BarChart3, Trash2, Menu, Pill, Bell, HelpCircle, Settings, Flame, Tag, Download, Activity, WifiOff, Wifi, Volume2, VolumeX, Vibrate, BellRing, Cake } from "lucide-react";

// ================== FIREBASE ==================

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAGxIGYqifeb5qGLVTQaVVpmKjZ9E1__TU",
  authDomain: "contigo-siempre-79017.firebaseapp.com",
  projectId: "contigo-siempre-79017",
  storageBucket: "contigo-siempre-79017.firebasestorage.app",
  messagingSenderId: "373374322978",
  appId: "1:373374322978:web:05fc428462d73d4f197d7b"
};

const VAPID_KEY = "BFPDPH02Oa44BflTPgU8Z7VbkqGL7rG3ZDLOAp9EKlkGYZWmoslFktvQtSl29HJR1gO4ESs2lBElRTEwWMAPwz0";

let db = null;
let dbIniciando = false;
let dbCallbacks = [];

function cuandoDbListo(cb) {
  if (db) { cb(db); return; }
  dbCallbacks.push(cb);
  if (dbIniciando) return;
  dbIniciando = true;
  const cargar = (src) => new Promise((res) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = res;
    s.onerror = res;
    document.head.appendChild(s);
  });
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

    // Cargar FCM messaging
    cargar("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js")
      .then(() => {
        if (!window.firebase || !window.firebase.messaging) return;
        const messaging = window.firebase.messaging();
        Notification.requestPermission().then((permission) => {
          if (permission !== "granted") {
            console.log("Permiso de notificaciones denegado");
            return;
          }
          console.log("Permiso de notificaciones concedido");
          navigator.serviceWorker.register("/service-worker.js")
            .then((registration) => messaging.getToken({
              vapidKey: VAPID_KEY,
              serviceWorkerRegistration: registration
            }))
            .then((currentToken) => {
              if (!currentToken) {
                console.log("No se pudo obtener el token.");
                return;
              }
              console.log("Token FCM obtenido correctamente");
              const col = window.firebase.firestore().collection("tokens");
              col.where("token", "==", currentToken).get().then((snap) => {
                if (snap.empty) {
                  col.add({ token: currentToken, timestamp: Date.now() })
                    .then(() => console.log("Token guardado en Firestore correctamente"))
                    .catch((err) => console.error("Error guardando token en Firestore:", err));
                } else {
                  console.log("El token ya estaba guardado en Firestore");
                }
              }).catch((err) => console.error("Error verificando token:", err));
            })
            .catch((err) => console.error("Error al obtener el token:", err));
        });
      });
  });
}

const LIGHT = { INK: "#1A237E", TEAL: "#1976D2", CORAL: "#D32F2F", CREAM: "#FFFFFF", PAPER: "#FFFFFF", LINE: "#E0E4EB", MUTED: "#6B7A8F", AMBER: "#F9A825", GREEN: "#43A047", GOLD: "#F9A825", BG: "#F0F4F8", SHADOW: "0 2px 8px rgba(25,118,210,0.08)" };
const DARK = { INK: "#F5F7FA", TEAL: "#64B5F6", CORAL: "#EF5350", CREAM: "#0F1B2E", PAPER: "#16243A", LINE: "#2A3A52", MUTED: "#90A4BE", AMBER: "#FFB74D", GREEN: "#66BB6A", GOLD: "#FFB74D", BG: "#0A1626", SHADOW: "0 2px 8px rgba(0,0,0,0.3)" };

const PILL_COLORS = ["#E0654A", "#1F6E63", "#3A6EA5", "#D98F2B", "#8A5FA8"];
const PILL_COLORS_CB = ["#D55E00", "#0072B2", "#009E73", "#E69F00", "#CC79A7"];
const PILL_SHAPES = ["●", "◆", "▲", "■", "⬤"];
const FONT_SCALE = { normal: 1, grande: 1.2, muy_grande: 1.45 };
const UMBRAL_MIN = { vital: 15, importante: 60, normal: 120 };
const LIMITES_ESTANDAR = { maxMeds: 5, maxElderly: 1, maxCuidadores: 2 };
const CODIGOS_PILOTO = ["PILOTO2026", "FUNDADOR", "BETA01", "FAMILIA1", "FAMILIA2", "FAMILIA3", "FAMILIA4", "FAMILIA5"];
const CODIGO_ADMIN = "ADMIN2026";
const CODIGO_DATOS = "DATOS2026";
const APP_VERSION = "1.10.0-tutorial-interactivo";
const MINUTOS_SIN_CONEXION_ALERTA = 5;

const MEDS_CON_RECETA = ["losartan","losartán","metformina","enalapril","amlodipino","atorvastatina","simvastatina","carvedilol","furosemida","hidroclorotiazida","omeprazol","clonazepam","alprazolam","sertralina","fluoxetina","levotiroxina","warfarina","clopidogrel","insulina","gabapentina","pregabalina","tramadol","morfina","fentanilo","metotrexato","prednisona","salbutamol","budesonida","montelukast","alopurinol","colchicina","risperidona","quetiapina","olanzapina","valproato","carbamazepina","fenitoina","levetiracetam","donepezilo","memantina","rivastigmina"];
const MEDS_SIN_RECETA = ["paracetamol","ibuprofeno","aspirina","naproxeno","diclofenaco","loratadina","cetirizina","clorfenamina","vitamina","multivitaminico","calcio","hierro","omega","magnesio","zinc","complejo b","sales de rehidratacion","suero","carbon activado"];
const MEDS_VITALES = ["insulina","warfarina","clopidogrel","digoxina","amiodarona","fenitoina","fenitoína","carbamazepina","valproato","levetiracetam","metotrexato","ciclosporina","tacrolimus","rivaroxaban","rivaroxabán","apixaban","apixabán","dabigatran","dabigatrán"];

const FARMACIAS = [
  { id: "f1", nombre: "Cruz Verde", costo: 8990, distanciaKm: 1.2, url: "https://www.cruzverde.cl" },
  { id: "f2", nombre: "Salcobrand", costo: 9490, distanciaKm: 2.1, url: "https://www.salcobrand.cl" },
  { id: "f3", nombre: "Farmacias Ahumada", costo: 9690, distanciaKm: 1.8, url: "https://www.farmaciasahumada.cl" },
  { id: "f4", nombre: "Búho (comparador)", costo: 7490, distanciaKm: 4.1, url: "https://www.buho.cl" },
];

const PRODUCTOS_POR_TEMPORADA = {
  invierno: [
    { nombre: "Vitamina C 500mg (30 comp.)", sku: "vitamina-c-30", precio: 4990 },
    { nombre: "Pañuelos desechables (caja 100)", sku: "panuelos-100", precio: 2990 },
    { nombre: "Suero oral (sobres x10)", sku: "suero-10", precio: 3990 },
    { nombre: "Humidificador ultrasónico", sku: "humidificador", precio: 24990 },
  ],
  verano: [
    { nombre: "Protector solar FPS 50+", sku: "protector-solar", precio: 8990 },
    { nombre: "Sales de rehidratación (x10)", sku: "sales-10", precio: 3490 },
    { nombre: "Gorro con protección UV", sku: "gorro-uv", precio: 6990 },
    { nombre: "Repelente de insectos", sku: "repelente", precio: 5490 },
  ],
  otono: [
    { nombre: "Vitamina D 1000 UI", sku: "vitamina-d", precio: 5990 },
    { nombre: "Miel de abeja pura 500g", sku: "miel-500", precio: 7990 },
    { nombre: "Pañuelos desechables (caja 100)", sku: "panuelos-100", precio: 2990 },
  ],
  primavera: [
    { nombre: "Antialérgico loratadina (10 comp.)", sku: "loratadina-10", precio: 3990 },
    { nombre: "Pañuelos desechables (caja 100)", sku: "panuelos-100", precio: 2990 },
    { nombre: "Purificador de aire pequeño", sku: "purificador", precio: 34990 },
  ],
};

const PRODUCTOS_POR_MEDICAMENTO = [
  { keywords: ["insulina", "inyectable", "inyección"], productos: [
    { nombre: "Bolso térmico para insulina", sku: "bolso-insulina", precio: 12990 },
    { nombre: "Contenedor de agujas (bioseguridad)", sku: "contenedor-agujas", precio: 6990 },
  ]},
  { keywords: ["warfarina", "clopidogrel", "rivaroxaban", "apixaban", "dabigatran"], productos: [
    { nombre: "Cepillo dental cerdas suaves", sku: "cepillo-suave", precio: 2490 },
    { nombre: "Rasuradora eléctrica", sku: "rasuradora", precio: 15990 },
  ]},
  { keywords: ["furosemida", "hidroclorotiazida"], productos: [
    { nombre: "Calcetines de compresión", sku: "calcetines-comp", precio: 8990 },
    { nombre: "Crema para piernas cansadas", sku: "crema-piernas", precio: 5990 },
  ]},
  { keywords: ["metformina", "glibenclamida", "insulina"], productos: [
    { nombre: "Pastillero semanal", sku: "pastillero-semanal", precio: 3990 },
    { nombre: "Glucómetro digital", sku: "glucometro", precio: 19990 },
  ]},
  { keywords: ["losartán", "losartan", "enalapril", "amlodipino", "carvedilol"], productos: [
    { nombre: "Salero bajo en sodio", sku: "salero-sodio", precio: 3490 },
    { nombre: "Pastillero semanal", sku: "pastillero-semanal", precio: 3990 },
  ]},
  { keywords: ["omeprazol", "esomeprazol"], productos: [
    { nombre: "Vaso medidor de agua", sku: "vaso-medidor", precio: 2990 },
  ]},
  { keywords: ["donepezilo", "memantina", "rivastigmina"], productos: [
    { nombre: "Pastillero semanal", sku: "pastillero-semanal", precio: 3990 },
    { nombre: "Pizarra de rutinas diarias", sku: "pizarra-rutinas", precio: 7990 },
  ]},
  { keywords: ["levotiroxina"], productos: [
    { nombre: "Pastillero semanal", sku: "pastillero-semanal", precio: 3990 },
  ]},
];

function obtenerProductosSugeridos(meds, mesActual) {
  let temporada = "otono";
  if ([11, 0, 1].includes(mesActual)) temporada = "verano";
  else if ([2, 3, 4].includes(mesActual)) temporada = "otono";
  else if ([5, 6, 7].includes(mesActual)) temporada = "invierno";
  else if ([8, 9, 10].includes(mesActual)) temporada = "primavera";
  const porTemporada = PRODUCTOS_POR_TEMPORADA[temporada] || [];
  const porMeds = [];
  const skusAgregados = new Set(porTemporada.map((p) => p.sku));
  const nombresMeds = (meds || []).map((m) => (m.name || "").toLowerCase());
  PRODUCTOS_POR_MEDICAMENTO.forEach((cat) => {
    const match = nombresMeds.some((n) => cat.keywords.some((k) => n.includes(k)));
    if (match) { cat.productos.forEach((p) => { if (!skusAgregados.has(p.sku)) { porMeds.push(p); skusAgregados.add(p.sku); } }); }
  });
  const todos = [...porMeds, ...porTemporada];
  return { temporada, productos: todos.slice(0, 5) };
}

const NOMBRE_TEMPORADA = {
  invierno: "Artículos útiles para el invierno",
  verano: "Artículos útiles para el verano",
  otono: "Artículos útiles para el otoño",
  primavera: "Artículos útiles para la primavera",
};

const CSS_GLOBAL = `
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  @keyframes pulseFlame { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
  @keyframes pulseOffline { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
  @keyframes shakeAlerta { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
  @keyframes pulseAlerta { 0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(25,118,210,0.7); } 50% { transform: scale(1.02); box-shadow: 0 0 0 20px rgba(25,118,210,0); } }
  .modal-fade { animation: fadeIn 0.18s ease-out; }
  .modal-slide { animation: fadeInUp 0.22s cubic-bezier(0.16, 1, 0.3, 1); }
  .modal-scale { animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
  .btn-press { transition: transform 0.12s ease, opacity 0.12s ease; }
  .btn-press:active { transform: scale(0.97); opacity: 0.85; }
  .btn-press-soft { transition: transform 0.12s ease, opacity 0.12s ease; }
  .btn-press-soft:active { transform: scale(0.98); opacity: 0.9; }
  .card-hover { transition: box-shadow 0.2s ease, transform 0.2s ease; }
  .card-hover:active { transform: scale(0.99); }
  .flame-pulse { animation: pulseFlame 1.2s ease-in-out infinite; }
  .offline-pulse { animation: pulseOffline 1.5s ease-in-out infinite; }
  .shake-alerta { animation: shakeAlerta 0.5s ease-in-out infinite; }
  .pulse-alerta { animation: pulseAlerta 2s ease-in-out infinite; }
  ::-webkit-scrollbar { width: 0; height: 0; }
  * { -webkit-tap-highlight-color: transparent; }
`;

// ================== NOTIFICACIONES ==================

let audioCtxRef = null;

function reproducirAlertaSonido(volumen = 1) {
  try {
    if (!audioCtxRef) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioCtxRef = new AC();
    }
    const ctx = audioCtxRef;
    if (ctx.state === "suspended") ctx.resume();
    const now = ctx.currentTime;
    const frecuencias = [880, 1046, 1318];
    frecuencias.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.6);
      gain.gain.linearRampToValueAtTime(0.3 * volumen, now + i * 0.6 + 0.05);
      gain.gain.linearRampToValueAtTime(0, now + i * 0.6 + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.6);
      osc.stop(now + i * 0.6 + 0.55);
    });
  } catch (e) { console.warn("No se pudo reproducir sonido:", e); }
}

function vibrarPatron() {
  try { if (navigator.vibrate) navigator.vibrate([400, 200, 400, 200, 400]); }
  catch (e) { console.warn("Vibración no disponible:", e); }
}

// ================== EVENTOS EN FIREBASE ==================

const EVENTOS_COLLECTION = "eventos";

async function registrarEvento(codigoFamilia, tipo, detalle, extra = {}) {
  if (!codigoFamilia) return;
  const evento = {
    codigo: String(codigoFamilia), tipo: tipo || "desconocido", detalle: detalle || "",
    timestamp: Date.now(), fecha: new Date().toISOString(), appVersion: APP_VERSION, ...extra,
  };
  try { if (db) await db.collection(EVENTOS_COLLECTION).add(evento); }
  catch (e) {
    console.error("Error registrando evento:", e);
    try {
      const raw = localStorage.getItem("eventos_pendientes");
      const pendientes = raw ? JSON.parse(raw) : [];
      pendientes.push(evento);
      localStorage.setItem("eventos_pendientes", JSON.stringify(pendientes));
    } catch (e2) { console.error(e2); }
  }
}

async function enviarEventosPendientes() {
  try {
    const raw = localStorage.getItem("eventos_pendientes");
    if (!raw) return;
    const pendientes = JSON.parse(raw);
    if (!pendientes.length || !db) return;
    for (const ev of pendientes) { try { await db.collection(EVENTOS_COLLECTION).add(ev); } catch (e) { console.error(e); } }
    localStorage.removeItem("eventos_pendientes");
  } catch (e) { console.error(e); }
}

async function obtenerEventos(limite = 500) {
  try {
    if (db) {
      const snapshot = await db.collection(EVENTOS_COLLECTION).orderBy("timestamp", "desc").limit(limite).get();
      const out = [];
      snapshot.forEach((doc) => { out.push({ id: doc.id, ...doc.data() }); });
      return out;
    }
  } catch (e) { console.error("Error obteniendo eventos:", e); }
  return [];
}

function exportarCSV(eventos) {
  const headers = ["Fecha", "Hora", "Familia", "Tipo", "Detalle", "Persona", "Edad", "Cuidador", "Versión"];
  const rows = eventos.map(e => {
    const d = new Date(e.timestamp);
    return [d.toLocaleDateString("es-CL"), d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" }), e.codigo || "", e.tipo || "", e.detalle || "", e.persona || "", e.edad || "", e.cuidador || "", e.appVersion || ""];
  });
  const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `contigo_siempre_eventos_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function clasificarMedicamento(n) { if (!n) return null; const x = n.toLowerCase().trim(); if (MEDS_CON_RECETA.some((m) => x.includes(m))) return "con_receta"; if (MEDS_SIN_RECETA.some((m) => x.includes(m))) return "sin_receta"; return null; }
function detectarCriticidad(n) { if (!n) return "normal"; const x = n.toLowerCase().trim(); if (MEDS_VITALES.some((m) => x.includes(m))) return "vital"; if (MEDS_CON_RECETA.some((m) => x.includes(m))) return "importante"; return "normal"; }
function dispColor(hex, daltonico) { const i = PILL_COLORS.indexOf(hex); return daltonico && i >= 0 ? PILL_COLORS_CB[i] : hex; }

function calcularRankingFarmacias(fs) {
  const cs = fs.map((f) => f.costo), ds = fs.map((f) => f.distanciaKm);
  const cMin = Math.min(...cs), cMax = Math.max(...cs), dMax = Math.max(...ds);
  return fs.map((f) => { const fc = cMax === cMin ? 1 : 1 - (f.costo - cMin) / (cMax - cMin); const fd = dMax === 0 ? 1 : 1 - f.distanciaKm / dMax; return { farmacia: f, puntaje: 0.6 * fc + 0.4 * fd }; }).sort((a, b) => b.puntaje - a.puntaje);
}

function nowHHMM() { const d = new Date(); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; }
function toMinutes(t) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }

function fmtHoraConAmPm(t) {
  if (!t || !t.includes(":")) return "";
  const [h, m] = t.split(":").map(Number);
  const sufijo = h >= 12 ? "p. m." : "a. m.";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${sufijo}`;
}

function a24Horas(h12, m, sufijo) { let h = h12 % 12; if (sufijo === "p. m.") h += 12; return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`; }
function a12Horas(t) { const [h, m] = t.split(":").map(Number); const sufijo = h >= 12 ? "p. m." : "a. m."; const h12 = h % 12 === 0 ? 12 : h % 12; return { h12, m, sufijo }; }
function sumarMinutos(t, min) { const total = (toMinutes(t) + min) % (24 * 60); const h = Math.floor(total / 60); const m = total % 60; return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`; }
function fmt(mins) { const h = Math.floor(mins / 60) % 24; const m = mins % 60; const sufijo = h >= 12 ? "p. m." : "a. m."; const h12 = h % 12 === 0 ? 12 : h % 12; return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${sufijo}`; }
function fmtN(n) { if (n === null || n === undefined) return ""; if (Number.isInteger(n)) return String(n); return String(parseFloat(n.toFixed(2))); }
function fmtUnid(n) { return `${fmtN(n)} unid.`; }
function occKey(id, t) { return `${id}__${t}`; }
function genCode() { return String(Math.floor(1000 + Math.random() * 9000)); }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function smsTime() { const d = new Date(); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; }
function dateKeyOffset(d) { const x = new Date(); x.setDate(x.getDate() - d); return x.toISOString().slice(0, 10); }
function proximaFechaCompra(dias) { const d = new Date(); d.setDate(d.getDate() + Math.max(0, Math.floor(dias))); const dow = d.getDay(); if (dow === 6) d.setDate(d.getDate() - 1); if (dow === 0) d.setDate(d.getDate() - 2); const s = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"]; return `${s[d.getDay()]} ${d.getDate()}`; }
function diasHastaVencimiento(fechaStr) { if (!fechaStr) return null; const v = new Date(fechaStr); const h = new Date(); return Math.floor((v - h) / (1000 * 60 * 60 * 24)); }
function minutosDesde(ts) { if (!ts) return null; return Math.floor((Date.now() - ts) / 60000); }

function calcularRacha(meds, cbd) {
  if (!meds || meds.length === 0 || !cbd) return 0;
  const totalPorDia = meds.reduce((a, m) => a + (m.times?.length || 0), 0);
  if (totalPorDia === 0) return 0;
  let racha = 0;
  for (let i = 1; i <= 60; i++) { const key = dateKeyOffset(i); const dia = cbd[key]; if (!dia) break; const conf = Object.keys(dia).filter((k) => dia[k]).length; if (conf >= totalPorDia) racha++; else break; }
  return racha;
}

function consumoPromedioReal(med, cbd) {
  if (!med.times || med.times.length === 0) return null;
  let total = 0, dias = 0;
  for (let i = 0; i < 14; i++) { const dia = cbd?.[dateKeyOffset(i)] || {}; let c = 0; med.times.forEach((t) => { if (dia[occKey(med.id, t)]) c++; }); if (c > 0 || i === 0) { total += c; dias++; } }
  return dias === 0 ? null : total / Math.max(1, dias);
}

function diasRestantesReales(med, cbd) {
  const cd = consumoPromedioReal(med, cbd);
  const teorico = med.doseAmount * med.times.length;
  const consumo = cd && cd > 0 ? cd * med.doseAmount : teorico;
  if (consumo === 0) return null;
  const raw = med.stock / consumo;
  return Number.isInteger(raw) ? raw : Math.round(raw * 10) / 10;
}

function semaforoRiesgo(med, cbd) {
  const d = diasRestantesReales(med, cbd);
  if (d === null) return { color: "MUTED", nivel: "sin datos", dias: null };
  if (d <= 3) return { color: "CORAL", nivel: "urgente", dias: d };
  if (d <= 7) return { color: "AMBER", nivel: "atención", dias: d };
  return { color: "GREEN", nivel: "tranquilo", dias: d };
}

function detectarCambioPatron(meds, cbd) {
  if (!meds || meds.length === 0 || !cbd) return null;
  const tpd = meds.reduce((a, m) => a + (m.times?.length || 0), 0);
  if (tpd === 0) return null;
  function tasa(a, b) { let c = 0, e = 0; for (let i = a; i < b; i++) { const dia = cbd[dateKeyOffset(i)] || {}; c += Object.keys(dia).filter((k) => dia[k]).length; e += tpd; } return e === 0 ? null : c / e; }
  const ta = tasa(0, 7), tp = tasa(7, 14);
  if (ta === null || tp === null || tp < 0.5) return null;
  if (tp - ta >= 0.3) return { tasaActual: Math.round(ta * 100), tasaPrevia: Math.round(tp * 100) };
  return null;
}

function getMesActual() {
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = hoy.getMonth();
  const ultimoDia = new Date(año, mes + 1, 0);
  const dias = [];
  const primerDow = new Date(año, mes, 1).getDay() === 0 ? 6 : new Date(año, mes, 1).getDay() - 1;
  for (let i = 0; i < primerDow; i++) dias.push(null);
  for (let d = 1; d <= ultimoDia.getDate(); d++) dias.push(new Date(año, mes, d));
  return { dias, mes, año };
}

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DIAS_SEM = ["L","M","M","J","V","S","D"];

function generarTextoCompartir(tipo, elderName, meds, confirmedByDate) {
  if (tipo === "resumen") {
    const hoy = todayStr(); const dia = confirmedByDate?.[hoy] || {};
    let conf = 0, esp = 0;
    meds.forEach((m) => m.times.forEach((t) => { esp++; if (dia[occKey(m.id, t)]) conf++; }));
    return `Resumen de hoy para ${elderName}:\n✓ ${conf} de ${esp} tomas confirmadas.\n\nEnviado desde Contigo Siempre.`;
  }
  if (tipo === "meds") {
    const lineas = meds.map((m) => `• ${m.name} — ${m.times.map(fmtHoraConAmPm).join(", ")} (${fmtUnid(m.stock)})`);
    return `Medicamentos de ${elderName}:\n\n${lineas.join("\n")}\n\nEnviado desde Contigo Siempre.`;
  }
  if (tipo === "historial") {
    const lineas = [];
    for (let i = 6; i >= 0; i--) {
      const k = dateKeyOffset(i); const dia = confirmedByDate?.[k] || {};
      let conf = 0, esp = 0;
      meds.forEach((m) => m.times.forEach((t) => { esp++; if (dia[occKey(m.id, t)]) conf++; }));
      const fecha = new Date(); fecha.setDate(fecha.getDate() - i);
      lineas.push(`${fecha.getDate()}/${fecha.getMonth() + 1}: ${conf}/${esp}`);
    }
    return `Historial últimos 7 días de ${elderName}:\n\n${lineas.join("\n")}\n\nEnviado desde Contigo Siempre.`;
  }
  return "";
}

function generarDemo() {
  const hoy = new Date();
  const personaId = Date.now();
  const medsDemo = [
    { id: personaId + 1, name: "Losartán 50mg", dose: "1 pastilla con agua", times: ["08:00", "20:00"], color: "#1F6E63", shape: "●", stock: 24, doseAmount: 1, type: "privada", receta: "con_receta", criticidad: "importante", modoAviso: "inmediato", notas: "No tomarlo con lácteos", recetaVence: new Date(hoy.getTime() + 20 * 86400000).toISOString().slice(0, 10), ventanaMin: 30 },
    { id: personaId + 2, name: "Metformina 850mg", dose: "1 pastilla con comida", times: ["09:00", "21:00"], color: "#E0654A", shape: "◆", stock: 4, doseAmount: 1, type: "privada", receta: "con_receta", criticidad: "importante", modoAviso: "inmediato", notas: "", recetaVence: "", ventanaMin: 60 },
    { id: personaId + 3, name: "Vitamina D", dose: "1 cápsula", times: ["13:00"], color: "#D98F2B", shape: "▲", stock: 30, doseAmount: 1, type: "privada", receta: "sin_receta", criticidad: "normal", modoAviso: "final_dia", notas: "Con el almuerzo", recetaVence: "", ventanaMin: 0 },
    { id: personaId + 4, name: "Insulina", dose: "10 unidades", times: ["07:30", "19:30"], color: "#8A5FA8", shape: "■", stock: 15, doseAmount: 1, type: "privada", receta: "con_receta", criticidad: "vital", modoAviso: "inmediato", notas: "Refrigerada", recetaVence: new Date(hoy.getTime() + 5 * 86400000).toISOString().slice(0, 10), ventanaMin: 0 },
  ];
  const confirmedByDate = {};
  for (let i = 0; i < 14; i++) {
    const d = new Date(hoy); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    confirmedByDate[key] = {};
    medsDemo.forEach((m) => { m.times.forEach((t) => { const prob = i >= 7 ? 0.9 : 0.4; if (Math.random() < prob) confirmedByDate[key][occKey(m.id, t)] = true; }); });
  }
  return {
    personas: [{ id: personaId, nombre: "Rosa Pérez (Demo)", edad: 78, meds: medsDemo, confirmedByDate, preferenciasFarmacia: {}, ultimoReconteo: {}, ultimaConexion: Date.now() }],
    contactos: [{ id: 1, nombre: "Dr. Juan Soto", telefono: "+56912345678", tipo: "médico" }, { id: 2, nombre: "María (hija)", telefono: "+56987654321", tipo: "familia" }],
    cuidadores: ["Tú"],
    historialCambios: [{ id: 1, fecha: Date.now() - 86400000, cuidador: "Tú", accion: "Agregó", detalle: "Losartán 50mg" }, { id: 2, fecha: Date.now() - 3600000, cuidador: "Tú", accion: "Cambió stock", detalle: "Metformina 850mg → 4" }],
    plan: "premium", planInicio: Date.now() - 7 * 86400000,
    settings: { fontSize: "normal", daltonico: false, darkMode: false, aceptoTerminos: true, onboardingPremiumVisto: true, sonidoActivo: true, vibracionActiva: true, tutorialVisto: true },
  };
}

function LogoContigoSiempre({ size = 64, color = "#1976D2", accent = "#F9A825" }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill={color} />
      <rect x="30" y="38" width="40" height="24" rx="12" fill="#FFFFFF" transform="rotate(-30 50 50)" />
      <line x1="50" y1="38" x2="50" y2="62" stroke={color} strokeWidth="2" transform="rotate(-30 50 50)" />
      <path d="M50 62 C 46 58, 40 58, 40 52 C 40 47, 45 45, 50 50 C 55 45, 60 47, 60 52 C 60 58, 54 58, 50 62 Z" fill={accent} />
    </svg>
  );
}

function AvisoSinConexion({ C, offline, ultimaConexion, compacto }) {
  if (offline) {
    return (
      <div className="offline-pulse" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFF3E0", color: "#E65100", border: "1px solid #FFB74D", borderRadius: 999, padding: compacto ? "2px 8px" : "4px 12px", fontSize: compacto ? 10 : 11.5, fontWeight: 700 }}>
        <WifiOff size={compacto ? 11 : 13} /> Sin conexión
      </div>
    );
  }
  const mins = minutosDesde(ultimaConexion);
  if (mins === null) return null;
  if (mins > MINUTOS_SIN_CONEXION_ALERTA) {
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFF3E0", color: "#E65100", border: "1px solid #FFB74D", borderRadius: 999, padding: compacto ? "2px 8px" : "4px 12px", fontSize: compacto ? 10 : 11.5, fontWeight: 700 }}>
        <WifiOff size={compacto ? 11 : 13} /> Desconectado hace {mins} min
      </div>
    );
  }
  return null;
}

function PantallaAlertaMedicamento({ C, med, hora, onConfirmar, onPosponer, escala, daltonico, sonidoActivo }) {
  return (
    <div className="modal-fade" style={{ position: "fixed", inset: 0, background: `linear-gradient(160deg, ${dispColor(med.color, daltonico)}, #0D47A1)`, zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
      <div style={{ fontSize: 16 * escala, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
        <BellRing size={20} /> Es hora de tu medicamento
      </div>
      <div className="pulse-alerta" style={{ width: 160, height: 160, borderRadius: 999, background: "rgba(255,255,255,0.95)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80, color: dispColor(med.color, daltonico), marginBottom: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        {med.shape}
      </div>
      <div style={{ fontSize: 42 * escala, fontWeight: 900, color: "#FFFFFF", marginBottom: 8, lineHeight: 1.1, textShadow: "0 2px 10px rgba(0,0,0,0.2)" }}>{med.name}</div>
      <div style={{ fontSize: 24 * escala, color: "rgba(255,255,255,0.9)", marginBottom: 8, fontWeight: 600 }}>{med.dose}</div>
      {med.notas && <div style={{ fontSize: 16 * escala, color: "rgba(255,255,255,0.85)", marginBottom: 12, fontStyle: "italic" }}>📝 {med.notas}</div>}
      <div style={{ fontSize: 20 * escala, color: "rgba(255,255,255,0.9)", marginBottom: 40, fontWeight: 700 }}>🕐 {fmtHoraConAmPm(hora)}</div>

      <button onClick={onConfirmar} className="btn-press" style={{ width: "100%", maxWidth: 360, padding: "26px 20px", borderRadius: 24, border: "none", background: "#FFFFFF", color: dispColor(med.color, daltonico), fontWeight: 900, fontSize: 28 * escala, cursor: "pointer", marginBottom: 14, boxShadow: "0 12px 30px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <Check size={32} strokeWidth={3} /> SÍ, YA LO TOMÉ
      </button>

      <button onClick={onPosponer} className="btn-press-soft" style={{ width: "100%", maxWidth: 360, padding: "16px 20px", borderRadius: 18, border: "2px solid rgba(255,255,255,0.4)", background: "transparent", color: "#FFFFFF", fontWeight: 700, fontSize: 16 * escala, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Clock size={18} /> Recordar en 5 minutos
      </button>

      {sonidoActivo && (
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 20 }}>
          🔔 Esta alerta suena y vibra hasta que confirmes
        </div>
      )}
    </div>
  );
}

function TutorialInteractivo({ pasos, onCerrar, C }) {
  const [paso, setPaso] = useState(0);
  const [rect, setRect] = useState(null);
  const pasoActual = pasos[paso];

  useEffect(() => {
    const t = setTimeout(() => {
      if (pasoActual?.target) {
        const el = document.querySelector(pasoActual.target);
        if (el) {
          const r = el.getBoundingClientRect();
          setRect({ top: r.top - 6, left: r.left - 6, width: r.width + 12, height: r.height + 12 });
        } else {
          setRect(null);
        }
      } else {
        setRect(null);
      }
    }, 100);
    return () => clearTimeout(t);
  }, [paso, pasoActual]);

  if (!pasoActual) return null;

  return (
    <div className="modal-fade" style={{ position: "fixed", inset: 0, zIndex: 9998, pointerEvents: "auto" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)" }} onClick={onCerrar} />
      {rect && (
        <div style={{ position: "absolute", top: rect.top, left: rect.left, width: rect.width, height: rect.height, borderRadius: 16, border: "3px solid #1976D2", boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.65)", pointerEvents: "none", transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)" }} />
      )}
      <div className="modal-slide" style={{ position: "fixed", bottom: 24, left: 16, right: 16, maxWidth: 460, margin: "0 auto", background: C.PAPER, borderRadius: 24, padding: 20, boxShadow: "0 20px 50px rgba(0,0,0,0.3)", zIndex: 9999, border: `1px solid ${C.LINE}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: C.TEAL, letterSpacing: 1, textTransform: "uppercase" }}>
            Paso {paso + 1} de {pasos.length}
          </span>
          <button onClick={onCerrar} style={{ border: "none", background: "none", color: C.MUTED, cursor: "pointer", padding: 4 }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ fontSize: 17, fontWeight: 800, color: C.INK, marginBottom: 6 }}>{pasoActual.titulo}</div>
        <div style={{ fontSize: 13.5, color: C.MUTED, lineHeight: 1.45, marginBottom: 16 }}>{pasoActual.texto}</div>
        <div style={{ display: "flex", gap: 10 }}>
          {paso > 0 && (
            <button onClick={() => setPaso(paso - 1)} className="btn-press-soft" style={{ flex: 1, padding: "12px", borderRadius: 12, border: `1px solid ${C.LINE}`, background: "transparent", color: C.INK, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              Anterior
            </button>
          )}
          <button onClick={() => { if (paso < pasos.length - 1) setPaso(paso + 1); else onCerrar(); }} className="btn-press" style={{ flex: 2, padding: "12px", borderRadius: 12, border: "none", background: C.TEAL, color: "#FFFFFF", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            {paso < pasos.length - 1 ? "Siguiente" : "¡Entendido!"}
          </button>
        </div>
      </div>
    </div>
  );
  // ================== COMPONENTE PRINCIPAL ==================

export default function App() {
  const [demoState, setDemoState] = useState(() => {
    const raw = localStorage.getItem("contigo_demo_data");
    return raw ? JSON.parse(raw) : generarDemo();
  });

  const [activeTab, setActiveTab] = useState("hoy");
  const [personaSel, setPersonaSel] = useState(0);
  const [offline, setOffline] = useState(!navigator.onLine);
  const [alertaActive, setAlertaActive] = useState(null);
  const [modoCuidador, setModoCuidador] = useState(true);
  const [showAddMed, setShowAddMed] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Guardar estado local
  useEffect(() => {
    localStorage.setItem("contigo_demo_data", JSON.stringify(demoState));
  }, [demoState]);

  // Listener de conexión a internet
  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Sincronizar Firestore si está disponible
  useEffect(() => {
    cuandoDbListo((database) => {
      if (!database) return;
      enviarEventosPendientes();
    });
  }, []);

  const { settings, personas, plan } = demoState;
  const C = settings?.darkMode ? DARK : LIGHT;
  const escala = FONT_SCALE[settings?.fontSize || "normal"];
  const persona = personas[personaSel] || personas[0];

  const tutorialPasos = [
    {
      titulo: "Bienvenido a Contigo Siempre ❤️",
      texto: "Aquí podrás gestionar los medicamentos, alertas y horarios para la persona a tu cuidado.",
      target: null
    },
    {
      titulo: "Barra de navegación",
      texto: "Usa estas pestañas para alternar entre las tomas de Hoy, la Canasta de remedios, el Historial y los Ajustes.",
      target: "#nav-tabs"
    },
    {
      titulo: "Estado de conexión",
      texto: "Verifica en todo momento si la app está conectada a la nube o funcionando en modo offline.",
      target: "#aviso-conexion"
    }
  ];

  return (
    <div style={{ background: C.BG, minHeight: "100vh", color: C.INK, fontFamily: "system-ui, -apple-system, sans-serif", paddingBottom: 80 }}>
      <style>{CSS_GLOBAL}</style>

      {/* Alerta flotante emergente cuando sea hora de un remedio */}
      {alertaActive && (
        <PantallaAlertaMedicamento
          C={C}
          med={alertaActive.med}
          hora={alertaActive.hora}
          escala={escala}
          daltonico={settings.daltonico}
          sonidoActivo={settings.sonidoActivo}
          onConfirmar={() => {
            registrarEvento("DEMO", "confirmacion", `Confirmó ${alertaActive.med.name}`);
            setAlertaActive(null);
          }}
          onPosponer={() => {
            registrarEvento("DEMO", "posposicion", `Pospuso ${alertaActive.med.name}`);
            setAlertaActive(null);
          }}
        />
      )}

      {/* Encabezado Superior */}
      <header style={{ background: C.PAPER, padding: "16px 20px", borderBottom: `1px solid ${C.LINE}`, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LogoContigoSiempre size={38} color={C.TEAL} accent={C.GOLD} />
          <div>
            <h1 style={{ fontSize: 18 * escala, fontWeight: 900, margin: 0, color: C.INK }}>Contigo Siempre</h1>
            <div id="aviso-conexion">
              <AvisoSinConexion C={C} offline={offline} ultimaConexion={persona?.ultimaConexion} compacto />
            </div>
          </div>
        </div>

        <button 
          onClick={() => setShowTutorial(true)}
          style={{ background: "none", border: "none", color: C.TEAL, cursor: "pointer", padding: 6 }}
        >
          <HelpCircle size={24} />
        </button>
      </header>

      {/* Contenido Principal por Pestañas */}
      <main style={{ maxWidth: 500, margin: "0 auto", padding: 16 }}>
        {activeTab === "hoy" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 20 * escala, fontWeight: 800, margin: 0 }}>Hoy</h2>
                <p style={{ fontSize: 13, color: C.MUTED, margin: 0 }}>Cuidado de {persona?.nombre}</p>
              </div>
              <button
                onClick={() => setShowAddMed(true)}
                className="btn-press"
                style={{ background: C.TEAL, color: "#FFF", border: "none", borderRadius: 12, padding: "10px 14px", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
              >
                <Plus size={16} /> Agregar
              </button>
            </div>

            {/* Lista de medicamentos de hoy */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {persona?.meds?.map((med) => (
                <div key={med.id} style={{ background: C.PAPER, padding: 16, borderRadius: 16, border: `1px solid ${C.LINE}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: dispColor(med.color, settings.daltonico), color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900 }}>
                      {med.shape}
                    </div>
                    <div>
                      <div style={{ fontSize: 16 * escala, fontWeight: 800 }}>{med.name}</div>
                      <div style={{ fontSize: 12, color: C.MUTED }}>{med.dose} • Stock: {med.stock}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setAlertaActive({ med, hora: med.times[0] || "08:00" })}
                    style={{ background: "#E3F2FD", color: C.TEAL, border: "none", borderRadius: 10, padding: "8px 12px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                  >
                    Simular
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "canasta" && (
          <div>
            <h2 style={{ fontSize: 20 * escala, fontWeight: 800, marginBottom: 12 }}>Canasta de Medicamentos</h2>
            <p style={{ fontSize: 13, color: C.MUTED }}>Inventario y estado de recargas de dosis.</p>
          </div>
        )}

        {activeTab === "ajustes" && (
          <div>
            <h2 style={{ fontSize: 20 * escala, fontWeight: 800, marginBottom: 16 }}>Ajustes</h2>
            <div style={{ background: C.PAPER, padding: 16, borderRadius: 16, border: `1px solid ${C.LINE}` }}>
              <p style={{ margin: "0 0 10px 0", fontSize: 14, fontWeight: 700 }}>Modo daltónico</p>
              <button 
                onClick={() => setDemoState((prev) => ({ ...prev, settings: { ...prev.settings, daltonico: !prev.settings.daltonico } }))}
                style={{ background: settings.daltonico ? C.TEAL : C.LINE, color: settings.daltonico ? "#FFF" : C.INK, border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer" }}
              >
                {settings.daltonico ? "Activado" : "Desactivado"}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Tutorial Interactivo */}
      {showTutorial && (
        <TutorialInteractivo 
          pasos={tutorialPasos} 
          onCerrar={() => setShowTutorial(false)} 
          C={C} 
        />
      )}

      {/* Navegación Inferior Sticky */}
      <nav id="nav-tabs" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.PAPER, borderTop: `1px solid ${C.LINE}`, display: "flex", justifyContent: "space-around", padding: "10px 0", zIndex: 100 }}>
        <button onClick={() => setActiveTab("hoy")} style={{ border: "none", background: "none", color: activeTab === "hoy" ? C.TEAL : C.MUTED, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
          <Clock size={20} />
          <span style={{ fontSize: 10, fontWeight: 700 }}>Hoy</span>
        </button>
        <button onClick={() => setActiveTab("canasta")} style={{ border: "none", background: "none", color: activeTab === "canasta" ? C.TEAL : C.MUTED, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
          <Pill size={20} />
          <span style={{ fontSize: 10, fontWeight: 700 }}>Canasta</span>
        </button>
        <button onClick={() => setActiveTab("ajustes")} style={{ border: "none", background: "none", color: activeTab === "ajustes" ? C.TEAL : C.MUTED, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
          <Settings size={20} />
          <span style={{ fontSize: 10, fontWeight: 700 }}>Ajustes</span>
        </button>
      </nav>
    </div>
  );
}
}
