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
      cargar("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"),
  cargar("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js")
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
      if (pasoActual.target) {
        const el = document.querySelector(pasoActual.target);
        if (el) {
          const r = el.getBoundingClientRect();
          setRect(r);
          try { el.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
        } else {
          setRect(null);
        }
      } else {
        setRect(null);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [paso, pasoActual]);

  const siguiente = () => { if (paso < pasos.length - 1) setPaso(paso + 1); else onCerrar(); };
  const anterior = () => { if (paso > 0) setPaso(paso - 1); };

  const spotlightStyle = rect ? {
    position: "fixed",
    top: rect.top - 8,
    left: rect.left - 8,
    width: rect.width + 16,
    height: rect.height + 16,
    borderRadius: 16,
    boxShadow: "0 0 0 9999px rgba(10,18,38,0.85)",
    pointerEvents: "none",
    zIndex: 9998,
    transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
  } : {
    position: "fixed",
    inset: 0,
    background: "rgba(10,18,38,0.85)",
    pointerEvents: "none",
    zIndex: 9998,
  };

  let tooltipStyle = {};
  if (rect) {
    const isBelow = rect.top < window.innerHeight / 2;
    if (isBelow) tooltipStyle = { top: Math.min(rect.bottom + 22, window.innerHeight - 320) };
    else tooltipStyle = { bottom: Math.min(window.innerHeight - rect.top + 22, window.innerHeight - 320) };
  } else {
    tooltipStyle = { top: "50%", transform: "translateY(-50%)" };
  }

  return (
    <>
      <div style={spotlightStyle} />
      <div style={{ position: "fixed", ...tooltipStyle, left: 20, right: 20, maxWidth: 380, margin: "0 auto", background: C.CREAM, borderRadius: 22, padding: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", zIndex: 9999, animation: "scaleIn 0.25s ease-out" }}>
        <div style={{ fontSize: 10.5, fontWeight: 800, color: C.TEAL, marginBottom: 6, letterSpacing: 1.5 }}>
          PASO {paso + 1} DE {pasos.length}
        </div>
        <div style={{ fontSize: 19, fontWeight: 800, color: C.INK, marginBottom: 8, lineHeight: 1.2 }}>
          {pasoActual.titulo}
        </div>
        <div style={{ fontSize: 14, color: C.MUTED, lineHeight: 1.6, marginBottom: 18 }}>
          {pasoActual.texto}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onCerrar} style={{ flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.MUTED, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            Saltar
          </button>
          {paso > 0 && (
            <button onClick={anterior} style={{ flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.INK, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              Anterior
            </button>
          )}
          <button onClick={siguiente} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: C.TEAL, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            {paso < pasos.length - 1 ? "Siguiente" : "¡Listo!"}
          </button>
        </div>
        <div style={{ marginTop: 14, height: 4, background: C.LINE, borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: `${((paso + 1) / pasos.length) * 100}%`, height: "100%", background: C.TEAL, transition: "width 0.35s ease" }} />
        </div>
      </div>
    </>
  );
}
function EstadoVacio({ C, icono: Icono, titulo, texto, botonTexto, onBoton }) {
  return (
    <div style={{ background: C.PAPER, border: `1px dashed ${C.LINE}`, borderRadius: 20, padding: "40px 24px", textAlign: "center" }}>
      <div style={{ width: 72, height: 72, borderRadius: 999, background: C.TEAL + "12", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <Icono size={34} color={C.TEAL} strokeWidth={1.5} />
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: C.INK, marginBottom: 6 }}>{titulo}</div>
      <div style={{ fontSize: 13, color: C.MUTED, lineHeight: 1.5, marginBottom: onBoton ? 18 : 0 }}>{texto}</div>
      {onBoton && <button onClick={onBoton} className="btn-press" style={{ padding: "12px 22px", borderRadius: 12, border: "none", background: C.TEAL, color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}><Plus size={16} /> {botonTexto}</button>}
    </div>
  );
}

function SelectorHora({ C, valor24, onCambio, onCerrar, oscuro }) {
  const inicial = a12Horas(valor24 || "08:00");
  const [h12, setH12] = useState(inicial.h12);
  const [min, setMin] = useState(inicial.m);
  const [sufijo, setSufijo] = useState(inicial.sufijo);
  const horas = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutos = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  const sufijos = ["a. m.", "p. m."];
  const confirmar = () => { const valor = a24Horas(h12, min, sufijo); onCambio(valor); onCerrar(); };
  return (
    <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 90 }}>
      <div className="modal-slide" style={{ width: "100%", maxWidth: 420, background: C.CREAM, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 28, boxShadow: "0 -8px 30px rgba(0,0,0,0.2)" }}>
        <div style={{ width: 40, height: 4, background: C.LINE, borderRadius: 999, margin: "0 auto 16px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <button onClick={onCerrar} className="btn-press-soft" style={{ border: "none", background: "transparent", color: C.MUTED, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Cancelar</button>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.INK }}>Selecciona la hora</div>
          <button onClick={confirmar} className="btn-press-soft" style={{ border: "none", background: "transparent", color: C.TEAL, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Listo</button>
        </div>
        <div style={{ background: oscuro ? "#1E2F48" : "#F0F4F8", borderRadius: 18, padding: 12, display: "flex", gap: 8, justifyContent: "center", maxHeight: 220 }}>
          <Rueda items={horas} valor={h12} onChange={setH12} C={C} ancho={70} />
          <Rueda items={minutos} valor={min} onChange={setMin} C={C} ancho={70} formato={(v) => String(v).padStart(2, "0")} />
          <Rueda items={sufijos} valor={sufijo} onChange={setSufijo} C={C} ancho={90} />
        </div>
        <div style={{ textAlign: "center", marginTop: 14, fontSize: 22, fontWeight: 800, color: C.TEAL }}>
          {String(h12).padStart(2, "0")}:{String(min).padStart(2, "0")} {sufijo}
        </div>
      </div>
    </div>
  );
}

function Rueda({ items, valor, onChange, C, ancho = 70, formato = (v) => String(v).padStart(2, "0") }) {
  const ITEM_H = 40;
  const VISIBLES = 5;
  const ref = React.useRef(null);
  useEffect(() => { const idx = items.indexOf(valor); if (ref.current && idx >= 0) ref.current.scrollTop = idx * ITEM_H; }, [valor, items]);
  const handleScroll = () => { if (!ref.current) return; const idx = Math.round(ref.current.scrollTop / ITEM_H); if (idx >= 0 && idx < items.length && items[idx] !== valor) onChange(items[idx]); };
  const seleccionar = (item) => { const idx = items.indexOf(item); if (ref.current && idx >= 0) ref.current.scrollTop = idx * ITEM_H; onChange(item); };
  return (
    <div style={{ width: ancho, height: ITEM_H * VISIBLES, overflowY: "scroll", scrollSnapType: "y mandatory", position: "relative", scrollbarWidth: "none" }} ref={ref} onScroll={handleScroll}>
      <div style={{ height: ITEM_H * 2 }} />
      {items.map((item, i) => { const activo = item === valor; return (<div key={i} onClick={() => seleccionar(item)} style={{ height: ITEM_H, display: "flex", alignItems: "center", justifyContent: "center", scrollSnapAlign: "center", fontSize: activo ? 26 : 20, fontWeight: activo ? 800 : 500, color: activo ? C.TEAL : C.MUTED, cursor: "pointer", transition: "all 0.15s ease" }}>{formato(item)}</div>); })}
      <div style={{ height: ITEM_H * 2 }} />
    </div>
  );
}

function CampoHora({ C, valor, onCambio, oscuro }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <>
      <button onClick={() => setAbierto(true)} className="btn-press-soft" style={{ flex: 1, padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.LINE}`, fontSize: 16, boxSizing: "border-box", background: C.PAPER, color: C.INK, textAlign: "left", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
        <Clock size={16} color={C.TEAL} /> {fmtHoraConAmPm(valor)}
      </button>
      {abierto && <SelectorHora C={C} valor24={valor} onCambio={onCambio} onCerrar={() => setAbierto(false)} oscuro={oscuro} />}
    </>
  );
}

function MenuLateral({ C, abierto, onCerrar, tabActual, setTabActual, avisosNuevos, onCompartir, onModoOscuro, onAyuda, onAcercaDe, onPolitica, onPremium, onAjustes, oscuro, cuidadorNombre, elderName }) {
  if (!abierto) return null;
  const secciones = [
    { id: "meds", Icono: Pill, label: "Medicamentos", tutorialId: "tab-meds" },
    { id: "canasta", Icono: ShoppingCart, label: "Canasta", tutorialId: "tab-canasta" },
    { id: "historial", Icono: Calendar, label: "Historial", tutorialId: "tab-historial" },
    { id: "cambios", Icono: FileText, label: "Cambios" },
    { id: "contactos", Icono: Phone, label: "Contactos" },
  ];
  const acciones = [
    { id: "avisos", Icono: Bell, label: "Avisos", badge: avisosNuevos },
    { id: "compartir", Icono: Share2, label: "Compartir", accion: onCompartir },
    { id: "oscuro", Icono: oscuro ? Sun : Moon, label: oscuro ? "Modo claro" : "Modo oscuro", accion: onModoOscuro },
    { id: "ayuda", Icono: HelpCircle, label: "Cómo funciona", accion: onAyuda },
    { id: "acerca", Icono: Info, label: "Acerca de", accion: onAcercaDe },
    { id: "politica", Icono: ScrollText, label: "Política de privacidad", accion: onPolitica },
    { id: "premium", Icono: Crown, label: "Premium / Admin", accion: onPremium },
    { id: "ajustes", Icono: Settings, label: "Ajustes", accion: onAjustes },
  ];
  return (
    <>
      <div onClick={onCerrar} className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(15,27,46,0.55)", zIndex: 60 }} />
      <div className="modal-slide" style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: "78%", maxWidth: 320, background: C.PAPER, zIndex: 61, boxShadow: "4px 0 24px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ padding: "20px 18px 16px", borderBottom: `1px solid ${C.LINE}`, background: `linear-gradient(135deg, ${C.TEAL}, #0D47A1)` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <LogoContigoSiempre size={40} color="#FFFFFF" accent="#F9A825" />
              <div><div style={{ fontSize: 14, fontWeight: 800, color: "#FFFFFF" }}>Contigo Siempre</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)" }}>{cuidadorNombre || "Cuidador"}</div></div>
            </div>
            <button onClick={onCerrar} className="btn-press-soft" style={{ border: "none", background: "rgba(255,255,255,0.2)", borderRadius: 999, width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={15} color="#FFFFFF" /></button>
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}>Cuidando a <strong style={{ color: "#FFFFFF" }}>{elderName}</strong></div>
        </div>
        <div style={{ padding: "14px 12px 8px" }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: C.MUTED, letterSpacing: 1.2, padding: "0 8px 10px" }}>SECCIONES</div>
          {secciones.map((s) => { const activo = tabActual === s.id; const Icono = s.Icono; return (<button key={s.id} onClick={() => { setTabActual(s.id); onCerrar(); }} data-tutorial={s.tutorialId} className="btn-press-soft" style={{ width: "100%", padding: "13px 12px", borderRadius: 12, border: "none", background: activo ? (oscuro ? "#1E3A5F" : "#E3F2FD") : "transparent", color: activo ? C.TEAL : C.INK, fontWeight: activo ? 700 : 500, fontSize: 14.5, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 14, marginBottom: 2, transition: "all 0.15s ease" }}><Icono size={20} strokeWidth={activo ? 2.4 : 2} color={activo ? C.TEAL : C.MUTED} /><span>{s.label}</span></button>); })}
        </div>
        <div style={{ padding: "8px 12px 20px" }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: C.MUTED, letterSpacing: 1.2, padding: "10px 8px 10px" }}>ACCIONES</div>
          {acciones.map((a) => { const Icono = a.Icono; if (a.id === "avisos") return (<button key={a.id} onClick={() => { setTabActual("avisos"); onCerrar(); }} className="btn-press-soft" style={{ width: "100%", padding: "13px 12px", borderRadius: 12, border: "none", background: "transparent", color: C.INK, fontWeight: 500, fontSize: 14.5, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 14, marginBottom: 2 }}><Icono size={20} strokeWidth={2} color={C.MUTED} /><span style={{ flex: 1 }}>{a.label}</span>{a.badge > 0 && <span style={{ background: C.CORAL, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 999, padding: "2px 8px" }}>{a.badge}</span>}</button>); return (<button key={a.id} onClick={() => { if (a.accion) a.accion(); onCerrar(); }} className="btn-press-soft" style={{ width: "100%", padding: "13px 12px", borderRadius: 12, border: "none", background: "transparent", color: C.INK, fontWeight: 500, fontSize: 14.5, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 14, marginBottom: 2 }}><Icono size={20} strokeWidth={2} color={C.MUTED} /><span>{a.label}</span></button>); })}
        </div>
        <div style={{ marginTop: "auto", padding: 18, fontSize: 10.5, color: C.MUTED, borderTop: `1px solid ${C.LINE}`, textAlign: "center" }}>Versión {APP_VERSION}</div>
      </div>
    </>
  );
}

function ComoFunciona({ C, onCerrar }) {
  const pasos = [
    { Icono: Pill, titulo: "1. Agrega los medicamentos", texto: "Nombre, dosis, horarios y stock." },
    { Icono: KeyRound, titulo: "2. Comparte el código", texto: "Dale el código de 4 dígitos a tu familiar para vincular su app con la tuya." },
    { Icono: BellRing, titulo: "3. Alerta con pantalla completa", texto: "Cuando es la hora, el teléfono del adulto mayor suena, vibra y muestra la alerta a pantalla completa." },
    { Icono: Check, titulo: "4. Confirma cada toma", texto: "Él aprieta 'Sí, ya lo tomé' y tú lo ves al instante." },
    { Icono: WifiOff, titulo: "5. Funciona sin internet", texto: "Si no hay conexión, la app guarda los datos y los sincroniza cuando vuelva la señal." },
  ];
  return (
    <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 70 }}>
      <div className="modal-slide" style={{ width: "100%", maxWidth: 420, background: C.CREAM, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 -8px 30px rgba(0,0,0,0.2)" }}>
        <div style={{ width: 40, height: 4, background: C.LINE, borderRadius: 999, margin: "0 auto 16px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 20 }}>¿Cómo funciona?</div>
          <button onClick={onCerrar} className="btn-press-soft" style={{ border: "none", background: C.LINE, borderRadius: 999, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} color={C.INK} /></button>
        </div>
        <div style={{ textAlign: "center", marginBottom: 18 }}><LogoContigoSiempre size={80} color={C.TEAL} accent={C.GOLD} /></div>
        {pasos.map((p, i) => { const Icono = p.Icono; return (<div key={i} style={{ display: "flex", gap: 14, padding: 14, borderRadius: 14, background: C.PAPER, border: `1px solid ${C.LINE}`, marginBottom: 10, boxShadow: C.SHADOW }}><div style={{ width: 40, height: 40, borderRadius: 12, background: C.TEAL + "12", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icono size={20} color={C.TEAL} strokeWidth={2.2} /></div><div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{p.titulo}</div><div style={{ fontSize: 12.5, color: C.MUTED, lineHeight: 1.5 }}>{p.texto}</div></div></div>); })}
        <button onClick={onCerrar} className="btn-press" style={{ marginTop: 18, width: "100%", padding: 14, borderRadius: 14, border: "none", background: C.TEAL, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Entendido</button>
      </div>
    </div>
  );
}

function OnboardingPremium({ C, onCerrar }) {
  const beneficios = [
    { Icono: Pill, titulo: "Medicamentos ilimitados", texto: "Sin el tope de 5 del plan Estándar." },
    { Icono: Users, titulo: "Hasta 3 personas mayores", texto: "Cuida a mamá y papá al mismo tiempo." },
    { Icono: BellRing, titulo: "Alerta a pantalla completa", texto: "Suena y vibra hasta que confirmen la toma." },
    { Icono: Camera, titulo: "Reconteo por foto", texto: "Saca foto al blíster y ajusta el stock real." },
    { Icono: FileText, titulo: "Reporte PDF para el médico", texto: "Adherencia del último mes lista para imprimir." },
    { Icono: TrendingDown, titulo: "Detección de cambio de patrón", texto: "La IA te avisa si la adherencia bajó." },
  ];
  return (
    <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 71 }}>
      <div className="modal-scale" style={{ width: "100%", maxWidth: 400, background: C.CREAM, borderRadius: 24, padding: 26, margin: 20, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: 999, background: `linear-gradient(135deg, ${C.GOLD}, #E65100)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: "0 8px 20px rgba(249,168,37,0.4)" }}><Crown size={32} color="#fff" /></div>
          <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 6 }}>¡Bienvenido a Premium!</div>
          <div style={{ fontSize: 13, color: C.MUTED, lineHeight: 1.5 }}>Desbloqueaste todas las funciones.</div>
        </div>
        {beneficios.map((b, i) => { const Icono = b.Icono; return (<div key={i} style={{ display: "flex", gap: 12, padding: 14, borderRadius: 14, background: C.PAPER, border: `1px solid ${C.LINE}`, marginBottom: 8, boxShadow: C.SHADOW }}><div style={{ width: 36, height: 36, borderRadius: 10, background: C.GOLD + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icono size={18} color={C.GOLD} strokeWidth={2.2} /></div><div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 2 }}>{b.titulo}</div><div style={{ fontSize: 11.5, color: C.MUTED, lineHeight: 1.4 }}>{b.texto}</div></div></div>); })}
        <button onClick={onCerrar} className="btn-press" style={{ marginTop: 18, width: "100%", padding: 14, borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${C.GOLD}, #E65100)`, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Empezar a usarlo</button>
      </div>
    </div>
  );
}

function AcercaDe({ C, onCerrar }) {
  return (
    <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 72 }}>
      <div className="modal-slide" style={{ width: "100%", maxWidth: 420, background: C.CREAM, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 -8px 30px rgba(0,0,0,0.2)" }}>
        <div style={{ width: 40, height: 4, background: C.LINE, borderRadius: 999, margin: "0 auto 16px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 20 }}>Acerca de</div>
          <button onClick={onCerrar} className="btn-press-soft" style={{ border: "none", background: C.LINE, borderRadius: 999, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} color={C.INK} /></button>
        </div>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <LogoContigoSiempre size={72} color={C.TEAL} accent={C.GOLD} />
          <div style={{ fontWeight: 700, fontSize: 18, marginTop: 10 }}>Contigo Siempre</div>
          <div style={{ fontSize: 12, color: C.MUTED, marginTop: 2 }}>Versión {APP_VERSION}</div>
        </div>
        <div style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 14, padding: 14, marginBottom: 12, boxShadow: C.SHADOW }}><div style={{ fontSize: 13, lineHeight: 1.6 }}><strong>Contigo Siempre</strong> es una app de apoyo logístico para el cuidado de personas mayores.</div></div>
        <div style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 14, padding: 14, marginBottom: 12, boxShadow: C.SHADOW }}><div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Contacto</div><div style={{ fontSize: 12.5, color: C.MUTED, lineHeight: 1.6 }}>📧 hola.contigosiempre@gmail.com<br />🌐 www.contigosiempre.cl</div></div>
        <div style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 14, padding: 14, marginBottom: 12, boxShadow: C.SHADOW }}><div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Alertas inteligentes</div><div style={{ fontSize: 12.5, color: C.MUTED, lineHeight: 1.6 }}>La app suena, vibra y muestra la pantalla completa cuando es hora de tomar un medicamento.</div></div>
        <div style={{ fontSize: 11, color: C.MUTED, textAlign: "center", marginTop: 14 }}>Hecho en Chile con ❤ · © 2026</div>
        <button onClick={onCerrar} className="btn-press" style={{ marginTop: 16, width: "100%", padding: 14, borderRadius: 14, border: "none", background: C.TEAL, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Cerrar</button>
      </div>
    </div>
  );
}

function PoliticaPrivacidad({ C, onCerrar }) {
  return (
    <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 72 }}>
      <div className="modal-slide" style={{ width: "100%", maxWidth: 420, background: C.CREAM, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 -8px 30px rgba(0,0,0,0.2)" }}>
        <div style={{ width: 40, height: 4, background: C.LINE, borderRadius: 999, margin: "0 auto 16px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 20 }}>Política de Privacidad</div>
          <button onClick={onCerrar} className="btn-press-soft" style={{ border: "none", background: C.LINE, borderRadius: 999, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} color={C.INK} /></button>
        </div>
        <div style={{ fontSize: 12.5, color: C.MUTED, lineHeight: 1.7 }}>
          <p style={{ marginBottom: 12 }}><strong style={{ color: C.INK }}>1. Quiénes somos.</strong><br />Contigo Siempre es una aplicación chilena de apoyo al cuidado de personas mayores.</p>
          <p style={{ marginBottom: 12 }}><strong style={{ color: C.INK }}>2. Qué datos recopilamos.</strong><br />Nombre y edad de la persona mayor, nombre del cuidador, medicamentos, confirmaciones, notas, contactos y preferencias.</p>
          <p style={{ marginBottom: 12 }}><strong style={{ color: C.INK }}>3. Datos sensibles.</strong><br />La información sobre medicamentos y adherencia puede considerarse dato sensible de salud.</p>
          <p style={{ marginBottom: 12 }}><strong style={{ color: C.INK }}>4. Para qué usamos los datos.</strong><br />Mostrar recordatorios, enviar alertas, controlar stock y mejorar el servicio.</p>
          <p style={{ marginBottom: 12 }}><strong style={{ color: C.INK }}>5. Dónde se guardan.</strong><br />Servidores seguros de Google Firebase. La app funciona sin conexión y sincroniza cuando vuelve la señal.</p>
          <p style={{ marginBottom: 12 }}><strong style={{ color: C.INK }}>6. Tus derechos.</strong><br />Acceso, rectificación, eliminación y portabilidad. Escribe a hola.contigosiempre@gmail.com.</p>
          <p style={{ marginBottom: 12 }}><strong style={{ color: C.INK }}>7. Plazo.</strong><br />Mientras la cuenta esté activa. Si eliminas la cuenta, se borra en 30 días.</p>
          <p style={{ marginBottom: 12 }}><strong style={{ color: C.INK }}>8. Menores.</strong><br />La app está diseñada para adultos mayores. En el futuro podría usarse con menores, siempre representados por un cuidador.</p>
          <p style={{ marginBottom: 12 }}><strong style={{ color: C.INK }}>9. Cambios.</strong><br />Comunicados dentro de la app con 15 días de anticipación.</p>
          <p style={{ marginBottom: 12 }}><strong style={{ color: C.INK }}>10. Contacto.</strong><br />hola.contigosiempre@gmail.com</p>
        </div>
        <button onClick={onCerrar} className="btn-press" style={{ marginTop: 16, width: "100%", padding: 14, borderRadius: 14, border: "none", background: C.TEAL, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Cerrar</button>
      </div>
    </div>
  );
}
function VerEventos({ C, onCerrar }) {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState("todos");
  useEffect(() => { (async () => { setCargando(true); const data = await obtenerEventos(500); setEventos(data); setCargando(false); })(); }, []);
  const filtrados = filtro === "todos" ? eventos : eventos.filter(e => e.tipo === filtro);
  const tiposUnicos = ["todos", ...Array.from(new Set(eventos.map(e => e.tipo)))];
  return (
    <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 76 }}>
      <div className="modal-scale" style={{ width: "100%", maxWidth: 480, background: C.CREAM, borderRadius: 24, padding: 20, margin: 20, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 18, display: "flex", alignItems: "center", gap: 8 }}><Activity size={20} color={C.TEAL} /> Eventos</div>
          <button onClick={onCerrar} className="btn-press-soft" style={{ border: "none", background: C.LINE, borderRadius: 999, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} color={C.INK} /></button>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)} style={{ flex: 1, padding: "8px 10px", borderRadius: 10, border: `1px solid ${C.LINE}`, fontSize: 12, background: C.PAPER, color: C.INK, outline: "none" }}>{tiposUnicos.map(t => <option key={t} value={t}>{t}</option>)}</select>
          <button onClick={() => exportarCSV(filtrados)} disabled={filtrados.length === 0} className="btn-press" style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: filtrados.length ? C.TEAL : C.LINE, color: filtrados.length ? "#fff" : C.MUTED, fontWeight: 700, fontSize: 12, cursor: filtrados.length ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: 6 }}><Download size={14} /> CSV</button>
        </div>
        <div style={{ fontSize: 11, color: C.MUTED, marginBottom: 10 }}>{cargando ? "Cargando eventos..." : `${filtrados.length} eventos`} · últimos 500</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: "55vh", overflowY: "auto" }}>
          {cargando ? (<div style={{ textAlign: "center", padding: 30 }}><Loader2 size={24} color={C.TEAL} /></div>) : filtrados.length === 0 ? (<div style={{ textAlign: "center", padding: 30, color: C.MUTED, fontSize: 13 }}>Sin eventos registrados aún.</div>) : (
            filtrados.map((e, i) => (
              <div key={e.id || i} style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 10, padding: 10, fontSize: 11.5 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontWeight: 700, color: C.TEAL }}>{e.tipo}</span><span style={{ color: C.MUTED }}>{new Date(e.timestamp).toLocaleString("es-CL")}</span></div>
                <div style={{ color: C.INK, marginBottom: 2 }}>{e.detalle}</div>
                <div style={{ fontSize: 10.5, color: C.MUTED }}>Familia: <strong>{e.codigo}</strong>{e.cuidador ? ` · Cuidador: ${e.cuidador}` : ""}{e.persona ? ` · Persona: ${e.persona}` : ""}{e.edad ? ` (${e.edad} años)` : ""} · v{e.appVersion || "?"}</div>
              </div>
            ))
          )}
        </div>
        <button onClick={onCerrar} className="btn-press" style={{ width: "100%", padding: 12, borderRadius: 12, border: "none", background: C.TEAL, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", marginTop: 12 }}>Cerrar</button>
      </div>
    </div>
  );
}

function PanelAdmin({ C, familias, onCerrar, onAbrirDatos, onAbrirEventos }) {
  const totalFamilias = familias.length;
  const premium = familias.filter((f) => f.data?.plan === "premium").length;
  const totalPersonas = familias.reduce((a, f) => a + (f.data?.personas?.length || 0), 0);
  const totalMeds = familias.reduce((a, f) => a + (f.data?.personas?.reduce((b, p) => b + (p.meds?.length || 0), 0) || 0), 0);
  const ingresos = premium * 3990;
  return (
    <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 73 }}>
      <div className="modal-scale" style={{ width: "100%", maxWidth: 400, background: C.CREAM, borderRadius: 24, padding: 24, margin: 20, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 20, display: "flex", alignItems: "center", gap: 8 }}><Settings size={22} color={C.TEAL} /> Panel Admin</div>
          <button onClick={onCerrar} className="btn-press-soft" style={{ border: "none", background: C.LINE, borderRadius: 999, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} color={C.INK} /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 14, padding: 14, boxShadow: C.SHADOW }}><div style={{ fontSize: 11, color: C.MUTED }}>Familias</div><div style={{ fontSize: 22, fontWeight: 800, color: C.TEAL }}>{fmtN(totalFamilias)}</div></div>
          <div style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 14, padding: 14, boxShadow: C.SHADOW }}><div style={{ fontSize: 11, color: C.MUTED }}>Premium</div><div style={{ fontSize: 22, fontWeight: 800, color: C.GOLD }}>{fmtN(premium)}</div></div>
          <div style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 14, padding: 14, boxShadow: C.SHADOW }}><div style={{ fontSize: 11, color: C.MUTED }}>Personas</div><div style={{ fontSize: 22, fontWeight: 800, color: C.INK }}>{fmtN(totalPersonas)}</div></div>
          <div style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 14, padding: 14, boxShadow: C.SHADOW }}><div style={{ fontSize: 11, color: C.MUTED }}>Medicamentos</div><div style={{ fontSize: 22, fontWeight: 800, color: C.INK }}>{fmtN(totalMeds)}</div></div>
        </div>
        <div style={{ background: `linear-gradient(135deg, ${C.GOLD}, #E65100)`, borderRadius: 14, padding: 16, color: "#fff", marginBottom: 14, boxShadow: "0 6px 20px rgba(249,168,37,0.3)" }}><div style={{ fontSize: 11, opacity: 0.9 }}>Ingresos estimados</div><div style={{ fontSize: 26, fontWeight: 800 }}>${ingresos.toLocaleString("es-CL")}</div></div>
        <button onClick={onAbrirEventos} className="btn-press" style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${C.GOLD}, #E65100)`, color: "#fff", fontWeight: 700, cursor: "pointer", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Activity size={18} /> Ver Eventos (Firebase)</button>
        <button onClick={onAbrirDatos} className="btn-press" style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: C.TEAL, color: "#fff", fontWeight: 700, cursor: "pointer", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><BarChart3 size={18} /> Datos Administrativos</button>
        <button onClick={onCerrar} className="btn-press" style={{ width: "100%", padding: 14, borderRadius: 14, border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.INK, fontWeight: 700, cursor: "pointer" }}>Cerrar</button>
      </div>
    </div>
  );
}

function DatosAdministrativos({ C, onCerrar, onReset }) {
  const [datos, setDatos] = useState({});
  const [conf1, setConf1] = useState(false);
  const [conf2, setConf2] = useState(false);
  useEffect(() => { try { const raw = localStorage.getItem("datos_admin_global"); setDatos(raw ? JSON.parse(raw) : {}); } catch (e) { setDatos({}); } }, []);
  const farmacias = ["Cruz Verde", "Salcobrand", "Farmacias Ahumada", "Búho (comparador)"];
  const clicsFarmacia = datos.clicsFarmacia || {};
  const rankingFarmacias = farmacias.map((f) => ({ nombre: f, clics: clicsFarmacia[f] || 0 })).sort((a, b) => b.clics - a.clics);
  return (
    <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 74 }}>
      <div className="modal-scale" style={{ width: "100%", maxWidth: 420, background: C.CREAM, borderRadius: 24, padding: 24, margin: 20, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 19, display: "flex", alignItems: "center", gap: 8 }}><BarChart3 size={20} color={C.TEAL} /> Datos Locales</div>
          <button onClick={onCerrar} className="btn-press-soft" style={{ border: "none", background: C.LINE, borderRadius: 999, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} color={C.INK} /></button>
        </div>
        <div style={{ fontSize: 11.5, color: C.MUTED, marginBottom: 14, lineHeight: 1.5 }}>Estos datos son del almacenamiento local de este dispositivo. Los datos globales están en "Ver Eventos".</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 14, padding: 14, boxShadow: C.SHADOW }}><div style={{ fontSize: 10.5, color: C.MUTED }}>Vio carro</div><div style={{ fontSize: 22, fontWeight: 800, color: C.TEAL }}>{fmtN(datos.vioCarroTotal || 0)}</div></div>
          <div style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 14, padding: 14, boxShadow: C.SHADOW }}><div style={{ fontSize: 10.5, color: C.MUTED }}>Abrió farmacia</div><div style={{ fontSize: 22, fontWeight: 800, color: C.CORAL }}>{fmtN(datos.abrioFarmaciaTotal || 0)}</div></div>
          <div style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 14, padding: 14, boxShadow: C.SHADOW }}><div style={{ fontSize: 10.5, color: C.MUTED }}>Vio individual</div><div style={{ fontSize: 22, fontWeight: 800, color: C.AMBER }}>{fmtN(datos.vioIndividualTotal || 0)}</div></div>
          <div style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 14, padding: 14, boxShadow: C.SHADOW }}><div style={{ fontSize: 10.5, color: C.MUTED }}>Productos sugeridos</div><div style={{ fontSize: 22, fontWeight: 800, color: C.GOLD }}>{fmtN(datos.productosSugeridosTotal || 0)}</div></div>
        </div>
        <div style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 14, padding: 14, marginBottom: 14, boxShadow: C.SHADOW }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Ranking de farmacias (local)</div>
          {rankingFarmacias.map((f, i) => (<div key={f.nombre} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < rankingFarmacias.length - 1 ? `1px solid ${C.LINE}` : "none", fontSize: 12.5 }}><span>{i + 1}. {f.nombre}</span><strong style={{ color: C.TEAL }}>{fmtN(f.clics)}</strong></div>))}
        </div>
        {!conf1 && !conf2 && (<button onClick={() => setConf1(true)} className="btn-press" style={{ width: "100%", padding: 12, borderRadius: 12, border: `1px solid ${C.CORAL}`, background: "transparent", color: C.CORAL, fontWeight: 700, cursor: "pointer", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Trash2 size={14} /> Reiniciar datos locales</button>)}
        {conf1 && !conf2 && (<div style={{ background: "#FFEBEE", border: `1px solid ${C.CORAL}`, borderRadius: 12, padding: 12, marginBottom: 10 }}><div style={{ fontSize: 12.5, color: C.CORAL, marginBottom: 8, fontWeight: 700 }}>⚠️ ¿Borrar los datos locales?</div><div style={{ display: "flex", gap: 8 }}><button onClick={() => { setConf1(false); setConf2(false); }} className="btn-press-soft" style={{ flex: 1, padding: 10, borderRadius: 10, border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.MUTED, fontWeight: 700, cursor: "pointer", fontSize: 12 }}>Cancelar</button><button onClick={() => setConf2(true)} className="btn-press-soft" style={{ flex: 1, padding: 10, borderRadius: 10, border: "none", background: C.CORAL, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>Sí, continuar</button></div></div>)}
        {conf2 && (<div style={{ background: "#FFEBEE", border: `2px solid ${C.CORAL}`, borderRadius: 12, padding: 12, marginBottom: 10 }}><div style={{ fontSize: 12.5, color: C.CORAL, marginBottom: 8, fontWeight: 800 }}>🔴 ÚLTIMA CONFIRMACIÓN</div><div style={{ display: "flex", gap: 8 }}><button onClick={() => { setConf1(false); setConf2(false); }} className="btn-press-soft" style={{ flex: 1, padding: 10, borderRadius: 10, border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.MUTED, fontWeight: 700, cursor: "pointer", fontSize: 12 }}>Cancelar</button><button onClick={() => { onReset(); setDatos({}); setConf1(false); setConf2(false); }} className="btn-press-soft" style={{ flex: 1, padding: 10, borderRadius: 10, border: "none", background: C.CORAL, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>BORRAR</button></div></div>)}
        <button onClick={onCerrar} className="btn-press" style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: C.TEAL, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 8 }}>Cerrar</button>
      </div>
    </div>
  );
}

function CarroCompleto({ C, meds, onCerrar, onElegirFarmacia }) {
  const [farmaciaElegida, setFarmaciaElegida] = useState(null);
  const medsComprar = meds.filter((m) => { const s = semaforoRiesgo(m, null); return s.nivel === "urgente" || s.nivel === "atención"; });
  const totalPorFarmacia = FARMACIAS.reduce((acc, f) => { acc[f.nombre] = medsComprar.length * f.costo; return acc; }, {});
  const ranking = calcularRankingFarmacias(FARMACIAS);
  return (
    <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.7)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 75 }}>
      <div className="modal-slide" style={{ width: "100%", maxWidth: 420, background: C.CREAM, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 -8px 30px rgba(0,0,0,0.25)" }}>
        <div style={{ width: 40, height: 4, background: C.LINE, borderRadius: 999, margin: "0 auto 16px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 19, display: "flex", alignItems: "center", gap: 8 }}><ShoppingCart size={20} color={C.TEAL} /> Carro completo</div>
          <button onClick={onCerrar} className="btn-press-soft" style={{ border: "none", background: C.LINE, borderRadius: 999, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} color={C.INK} /></button>
        </div>
        {medsComprar.length === 0 ? (<EstadoVacio C={C} icono={ShoppingCart} titulo="Sin compras pendientes" texto="Todos tus medicamentos tienen stock suficiente por ahora." />) : (
          <>
            <div style={{ background: C.TEAL + "12", border: `1px solid ${C.TEAL}40`, borderRadius: 14, padding: 12, marginBottom: 14, fontSize: 12.5, color: C.TEAL, lineHeight: 1.5 }}>🛒 <strong>{fmtN(medsComprar.length)}</strong> medicamento{medsComprar.length > 1 ? "s" : ""} para comprar.</div>
            <div style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 14, padding: 14, marginBottom: 14, boxShadow: C.SHADOW }}>
              {medsComprar.map((m) => (<div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.LINE}` }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 22, height: 22, borderRadius: 999, background: dispColor(m.color, false), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff" }}>{m.shape}</div><span style={{ fontSize: 12.5 }}>{m.name}</span></div><span style={{ fontSize: 11.5, color: C.MUTED }}>{fmtUnid(m.stock)}</span></div>))}
            </div>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Elige tu farmacia</div>
            {ranking.map((r, i) => (<button key={r.farmacia.id} onClick={() => setFarmaciaElegida(r.farmacia)} className="btn-press-soft" style={{ width: "100%", textAlign: "left", padding: 14, borderRadius: 14, border: farmaciaElegida?.id === r.farmacia.id ? `2px solid ${C.TEAL}` : `1px solid ${C.LINE}`, background: C.PAPER, cursor: "pointer", marginBottom: 8, boxShadow: farmaciaElegida?.id === r.farmacia.id ? `0 0 0 3px ${C.TEAL}20` : C.SHADOW, transition: "all 0.15s ease" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}><div style={{ fontWeight: 700, fontSize: 13.5 }}>{String.fromCharCode(65 + i)}. {r.farmacia.nombre}</div><div style={{ fontWeight: 800, fontSize: 14, color: C.TEAL }}>${totalPorFarmacia[r.farmacia.nombre].toLocaleString("es-CL")}</div></div><div style={{ fontSize: 11, color: C.MUTED }}>{r.farmacia.distanciaKm} km · puntaje {r.puntaje.toFixed(2)}</div></button>))}
            <button onClick={() => farmaciaElegida && onElegirFarmacia(farmaciaElegida, medsComprar, totalPorFarmacia[farmaciaElegida.nombre])} disabled={!farmaciaElegida} className="btn-press" style={{ width: "100%", padding: 15, borderRadius: 14, border: "none", background: farmaciaElegida ? C.TEAL : C.LINE, color: farmaciaElegida ? "#fff" : C.MUTED, fontWeight: 700, fontSize: 15, cursor: farmaciaElegida ? "pointer" : "not-allowed", marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><ExternalLink size={16} /> Abrir {farmaciaElegida?.nombre || "farmacia"}</button>
          </>
        )}
      </div>
    </div>
  );
}

const STORAGE_PREFIX = "familia_";
const storage = {
  async get(k) {
    try { if (db) { const doc = await db.collection("familias").doc(k).get(); if (doc.exists) return { value: JSON.stringify(doc.data()) }; return null; } const v = localStorage.getItem(k); return v ? { value: v } : null; }
    catch (e) { console.error("Firestore get error:", e); const v = localStorage.getItem(k); return v ? { value: v } : null; }
  },
  async set(k, v) {
    try { if (db) { const data = JSON.parse(v); await db.collection("familias").doc(k).set(data); localStorage.setItem(k, v); return; } localStorage.setItem(k, v); }
    catch (e) { console.error("Firestore set error:", e); localStorage.setItem(k, v); }
  },
  async listAll() {
    try { if (db) { const snapshot = await db.collection("familias").get(); const out = []; snapshot.forEach((doc) => { out.push({ codigo: doc.id, data: doc.data() }); }); return out; } const out = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(STORAGE_PREFIX)) { const v = localStorage.getItem(k); try { out.push({ codigo: k.replace(STORAGE_PREFIX, ""), data: JSON.parse(v) }); } catch (e) {} } } return out; }
    catch (e) { return []; }
  },
};

function registrarDato(clave, valor = 1, detalle = null) {
  try {
    const raw = localStorage.getItem("datos_admin_global");
    const datos = raw ? JSON.parse(raw) : {};
    if (clave === "clicsFarmacia") { if (!datos[clave]) datos[clave] = {}; datos[clave][detalle] = (datos[clave][detalle] || 0) + 1; }
    else if (clave === "medsConsultados") { if (!datos[clave]) datos[clave] = {}; if (!datos[clave][detalle]) datos[clave][detalle] = { clics: 0, precioTotal: 0 }; datos[clave][detalle].clics = (datos[clave][detalle].clics || 0) + 1; datos[clave][detalle].precioTotal = (datos[clave][detalle].precioTotal || 0) + (valor || 0); }
    else { datos[clave] = (datos[clave] || 0) + valor; }
    localStorage.setItem("datos_admin_global", JSON.stringify(datos));
  } catch (e) { console.error(e); }
}
async function pedirPermisoNotificaciones() {
  try {
    if (!("Notification" in window)) {
      console.warn("Este navegador no soporta notificaciones");
      return null;
    }
    if (!window.firebase || !window.firebase.messaging) {
      console.warn("FCM no está cargado");
      return null;
    }
    const messaging = window.firebase.messaging();
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Permiso de notificaciones denegado");
      return null;
    }
    const token = await messaging.getToken({
      vapidKey: "BFPDPH020a44BfLTPgU8Z7VbkqGL7rG3ZDLOAp9EK1kGYZWmos1FktvQtSL29HJR1gO4ESs21LBE1RTEwWMAPwz0"
    });
    if (token) {
      console.log("Token FCM obtenido:", token);
      return token;
    } else {
      console.warn("No se pudo obtener token");
      return null;
    }
  } catch (e) {
    console.error("Error pidiendo permiso:", e);
    return null;
  }
}
export default function App() {
  const [stage, setStage] = useState("cargando");
  const [codigo, setCodigo] = useState(null);
  const [codigoInput, setCodigoInput] = useState("");
  const [nombreInput, setNombreInput] = useState("");
  const [edadInput, setEdadInput] = useState("");
  const [nombreCuidadorInput, setNombreCuidadorInput] = useState("");
  const [modoEntrada, setModoEntrada] = useState("elegir");
  const [familia, setFamilia] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState("mayor");
  const [nowMin, setNowMin] = useState(toMinutes(nowHHMM()));
  const [personaActualId, setPersonaActualId] = useState(null);
  const [showSelector, setShowSelector] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [restockTarget, setRestockTarget] = useState(null);
  const [showAjustes, setShowAjustes] = useState(false);
  const [cuidadorTab, setCuidadorTab] = useState("meds");
  const [showMenuLateral, setShowMenuLateral] = useState(false);
  const [linkAbierto, setLinkAbierto] = useState(null);
  const [aceptoCheck, setAceptoCheck] = useState(false);
  const [reconteoTarget, setReconteoTarget] = useState(null);
  const [showPremium, setShowPremium] = useState(false);
  const [showLimite, setShowLimite] = useState(null);
  const [codigoPremium, setCodigoPremium] = useState("");
  const [diaDetalle, setDiaDetalle] = useState(null);
  const [showNotas, setShowNotas] = useState(null);
  const [showContactos, setShowContactos] = useState(false);
  const [showCompartir, setShowCompartir] = useState(false);
  const [showAddPersona, setShowAddPersona] = useState(false);
  const [showComoFunciona, setShowComoFunciona] = useState(false);
  const [showOnboardingPremium, setShowOnboardingPremium] = useState(false);
  const [showAcercaDe, setShowAcercaDe] = useState(false);
  const [showPolitica, setShowPolitica] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showDatos, setShowDatos] = useState(false);
  const [showEventos, setShowEventos] = useState(false);
  const [showCarroCompleto, setShowCarroCompleto] = useState(false);
  const [nombrePersonaNueva, setNombrePersonaNueva] = useState("");
  const [edadPersonaNueva, setEdadPersonaNueva] = useState("");
  const [formContacto, setFormContacto] = useState({ nombre: "", telefono: "", tipo: "médico" });
  const [form, setForm] = useState({ name: "", dose: "", times: ["08:00"], color: PILL_COLORS[0], shape: PILL_SHAPES[0], stock: 30, doseAmount: 1, type: "privada", receta: null, criticidad: null, modoAviso: null, notas: "", recetaVence: "", ventanaMin: 0 });
  const [smsLog, setSmsLog] = useState([]);
  const [alertasDisparadas, setAlertasDisparadas] = useState({});
  const [alertasPatron, setAlertasPatron] = useState({});
  const [resumenEnviadoHoy, setResumenEnviadoHoy] = useState(false);
  const [familiasAdmin, setFamiliasAdmin] = useState([]);
  const [firebaseEstado, setFirebaseEstado] = useState("cargando");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [alertaActiva, setAlertaActiva] = useState(null);
  const [alertasSonadasHoy, setAlertasSonadasHoy] = useState({});
  const [showTutorial, setShowTutorial] = useState(false);
  const appAbiertaRef = useRef(false);
  const addStartRef = useRef(null);
  const heartbeatRef = useRef(null);

  const PASOS_TUTORIAL = [
    { titulo: "¡Bienvenido a Contigo Siempre!", texto: "Te mostraremos las funciones principales en 9 pasos rápidos. Puedes saltar el tutorial en cualquier momento.", target: null },
    { titulo: "1. Tu código de familia", texto: "Este código de 4 dígitos es la llave para conectar otros teléfonos. Compártelo con quien te ayude a cuidar. Todos verán la misma información al instante.", target: '[data-tutorial="codigo"]' },
    { titulo: "2. Vista del cuidador", texto: "Aquí ves todos los medicamentos, su estado (verde=tranquilo, amarillo=atención, rojo=urgente) y el stock disponible.", target: '[data-tutorial="tab-cuidador"]' },
    { titulo: "3. Agregar un medicamento", texto: "Toca este botón para agregar un remedio nuevo. Puedes poner nombre, dosis, horarios, stock y si requiere receta.", target: '[data-tutorial="add-med"]' },
    { titulo: "4. Ficha del medicamento", texto: "Cada tarjeta muestra cuántos días de stock quedan, avisos, notas y botones para reponer, poner notas o recontar.", target: '[data-tutorial="med-card"]' },
    { titulo: "5. Pestaña Canasta", texto: "Aquí armas la lista de compras. Compara precios entre farmacias, te sugerimos artículos útiles según la temporada y los medicamentos.", target: '[data-tutorial="tab-canasta"]' },
    { titulo: "6. Pestaña Historial", texto: "Mira la adherencia día por día. Los colores te dicen si se tomaron los remedios completos. Toca un día para ver el detalle.", target: '[data-tutorial="tab-historial"]' },
    { titulo: "7. Menú de secciones", texto: "Aquí encuentras contactos de emergencia, historial de cambios, avisos enviados, compartir por WhatsApp y mucho más.", target: '[data-tutorial="menu"]' },
    { titulo: "8. Ajustes y alertas", texto: "Personaliza el tamaño de letra, activa el modo oscuro, daltonismo, y controla el sonido y vibración de las alertas del adulto mayor.", target: '[data-tutorial="ajustes"]' },
  ];

  const settings = familia?.settings || { fontSize: "normal", daltonico: false, darkMode: false, sonidoActivo: true, vibracionActiva: true };
  const esPremium = familia?.plan === "premium";
  const oscuro = settings.darkMode;
  const C = oscuro ? DARK : LIGHT;

  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); enviarEventosPendientes(); };
    const handleOffline = () => { setIsOnline(false); };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => { window.removeEventListener("online", handleOnline); window.removeEventListener("offline", handleOffline); };
  }, []);

  useEffect(() => { const id = setInterval(() => setNowMin(toMinutes(nowHHMM())), 30000); return () => clearInterval(id); }, []);
  useEffect(() => { setStage("entrada"); }, []);
  useEffect(() => { cuandoDbListo((d) => { setFirebaseEstado(d ? "conectado" : "local"); }); }, []);
  useEffect(() => { if (familia && !personaActualId && familia.personas && familia.personas.length > 0) setPersonaActualId(familia.personas[0].id); }, [familia, personaActualId]);

  useEffect(() => {
    if (stage !== "app" || !codigo || !personaActualId) return;
    const enviarHeartbeat = async () => {
      if (!isOnline) return;
      try {
        const ref = db.collection("familias").doc(STORAGE_PREFIX + codigo);
        const doc = await ref.get();
        if (doc.exists) {
          const data = doc.data();
          const personas = (data.personas || []).map(p => p.id === personaActualId ? { ...p, ultimaConexion: Date.now() } : p);
          await ref.set({ ...data, personas }, { merge: true });
        }
      } catch (e) { console.error("Heartbeat error:", e); }
    };
    enviarHeartbeat();
    heartbeatRef.current = setInterval(enviarHeartbeat, 60000);
    return () => { if (heartbeatRef.current) clearInterval(heartbeatRef.current); };
  }, [stage, codigo, personaActualId, isOnline]);

  useEffect(() => {
    if (stage === "app" && codigo && !appAbiertaRef.current) {
      appAbiertaRef.current = true;
      registrarEvento(codigo, "abrir_app", "App abierta", { cuidador: nombreCuidadorInput || "Desconocido" });
      enviarEventosPendientes();
      pedirPermisoNotificaciones().then((token) => {
  if (token) {
    actualizar((prev) => ({ ...prev, fcmToken: token, fcmTokenActualizado: Date.now() }));
    console.log("Token FCM guardado en Firestore");
  }
});
    }
  }, [stage, codigo, nombreCuidadorInput]);

  useEffect(() => {
    if (!codigo || !db) return;
    const unsub = db.collection("familias").doc(STORAGE_PREFIX + codigo).onSnapshot((doc) => {
      if (doc.exists) {
        const data = doc.data();
        setFamilia((prev) => { if (JSON.stringify(prev) === JSON.stringify(data)) return prev; return data; });
      }
    });
    return () => unsub();
  }, [codigo]);

  const personaActual = familia?.personas?.find((p) => p.id === personaActualId) || familia?.personas?.[0] || null;
  const elderName = personaActual?.nombre || "";
  const elderEdad = personaActual?.edad || null;
  const meds = personaActual?.meds || [];
  const confirmedByDate = personaActual?.confirmedByDate || {};
  const contactos = familia?.contactos || [];
  const historialCambios = familia?.historialCambios || [];
  const ultimaConexionPersona = personaActual?.ultimaConexion || null;
  const minutosSinConexion = minutosDesde(ultimaConexionPersona);
  const personaDesconectada = !isOnline || (minutosSinConexion !== null && minutosSinConexion > MINUTOS_SIN_CONEXION_ALERTA);

  useEffect(() => {
    if (stage === "app" && familia && familia.settings && familia.settings.tutorialVisto === false) {
      const timer = setTimeout(() => setShowTutorial(true), 600);
      return () => clearTimeout(timer);
    }
  }, [stage, familia]);

  useEffect(() => {
    if (stage !== "app" || !familia || !personaActual) return;
    if (view !== "mayor") return;
    const confirmedHoy = confirmedByDate?.[todayStr()] || {};
    const occurrences = meds.flatMap((m) => m.times.map((t) => ({ med: m, time: t, key: occKey(m.id, t) })));
    const due = occurrences.find(o => {
      if (confirmedHoy[o.key]) return false;
      const diff = nowMin - toMinutes(o.time);
      return diff >= 0 && diff <= 60;
    });
    if (due && !alertaActiva) {
      const ak = `sonada_${personaActual.id}_${due.med.id}_${due.time}_${todayStr()}`;
      if (!alertasSonadasHoy[ak]) {
        setAlertasSonadasHoy(prev => ({ ...prev, [ak]: true }));
        setAlertaActiva(due);
        if (settings.sonidoActivo !== false) reproducirAlertaSonido();
        if (settings.vibracionActiva !== false) vibrarPatron();
        registrarEvento(codigo, "alerta_activada", `${due.med.name} a las ${fmtHoraConAmPm(due.time)}`, { cuidador: nombreCuidadorInput, persona: elderName, med: due.med.name, hora: due.time });
      }
    }
  }, [nowMin, stage, familia, personaActual, confirmedByDate, view, alertaActiva, alertasSonadasHoy, settings, codigo, nombreCuidadorInput, elderName, meds]);

  useEffect(() => {
    if (!alertaActiva) return;
    const id = setInterval(() => {
      if (settings.sonidoActivo !== false) reproducirAlertaSonido();
      if (settings.vibracionActiva !== false) vibrarPatron();
    }, 20000);
    return () => clearInterval(id);
  }, [alertaActiva, settings]);

  useEffect(() => {
    if (stage !== "app" || !familia || !personaActual) return;
    if (personaDesconectada) return;
    const confirmedHoy = confirmedByDate?.[todayStr()] || {};
    const nuevas = [];
    const ahoraMin = nowMin;

    meds.forEach((m) => {
      const crit = m.criticidad || detectarCriticidad(m.name);
      const modo = crit === "vital" ? "inmediato" : (m.modoAviso || (crit === "importante" ? "inmediato" : "final_dia"));
      const umbral = UMBRAL_MIN[crit];
      const ventana = m.ventanaMin || 0;
      m.times.forEach((t) => {
        const key = occKey(m.id, t);
        if (confirmedHoy[key]) return;
        const diff = ahoraMin - toMinutes(t);
        if (modo === "inmediato" && diff >= umbral + ventana) {
          const ak = `aviso_${personaActual.id}_${m.id}_${t}_${todayStr()}`;
          if (!alertasDisparadas[ak]) {
            const etiq = crit === "vital" ? "🔴 VITAL" : crit === "importante" ? "🟡 Importante" : "🟢 Normal";
            nuevas.push({ tipo: "alerta", hora: smsTime(), texto: `${etiq}: ${elderName.split(" ")[0]} no confirmó ${m.name} (${fmtHoraConAmPm(t)}). ${diff} min.` });
            setAlertasDisparadas((prev) => ({ ...prev, [ak]: true }));
          }
        }
      });
      if (m.recetaVence) {
        const dias = diasHastaVencimiento(m.recetaVence);
        if (dias !== null && dias >= 0 && dias <= 7) {
          const rk = `receta_${m.id}_${todayStr()}`;
          if (!alertasDisparadas[rk]) {
            nuevas.push({ tipo: "alerta", hora: smsTime(), texto: `📄 Receta de ${m.name} vence en ${fmtN(dias)} día${dias !== 1 ? "s" : ""}.` });
            setAlertasDisparadas((prev) => ({ ...prev, [rk]: true }));
          }
        }
      }
    });

    const stockCrit = [];
    meds.forEach((m) => { const s = semaforoRiesgo(m, confirmedByDate); if (s.nivel === "urgente") stockCrit.push(m.name); });
    if (stockCrit.length > 0) {
      const k = `sc_${personaActual.id}_${todayStr()}`;
      if (!alertasDisparadas[k]) {
        nuevas.push({ tipo: "alerta", hora: smsTime(), texto: `🔴 Stock crítico: ${stockCrit.join(", ")}.` });
        setAlertasDisparadas((prev) => ({ ...prev, [k]: true }));
      }
    }

    if (esPremium) {
      const cambio = detectarCambioPatron(meds, confirmedByDate);
      if (cambio) {
        const k = `patron_${personaActual.id}_${todayStr()}`;
        if (!alertasPatron[k]) {
          nuevas.push({ tipo: "alerta", hora: smsTime(), texto: `📉 Cambio de patrón: ${elderName.split(" ")[0]} bajó de ${cambio.tasaPrevia}% a ${cambio.tasaActual}%.` });
          setAlertasPatron((prev) => ({ ...prev, [k]: true }));
        }
      }
    }

    if (ahoraMin >= 21 * 60 && !resumenEnviadoHoy) {
      let conf = 0, esp = 0;
      meds.forEach((m) => m.times.forEach((t) => { esp++; if (confirmedHoy[occKey(m.id, t)]) conf++; }));
      setSmsLog((prev) => [...prev, { tipo: "ok", hora: smsTime(), texto: `Resumen ${elderName.split(" ")[0]}: ${conf}/${esp} tomas confirmadas.` }]);
      setResumenEnviadoHoy(true);
    }

    if (nuevas.length > 0) setSmsLog((prev) => [...prev, ...nuevas]);
  }, [nowMin, stage, familia, personaActual, alertasDisparadas, alertasPatron, resumenEnviadoHoy, esPremium, elderName, meds, confirmedByDate, personaDesconectada]);

  const guardarFamilia = useCallback(async (cod, data) => {
    setSaving(true);
    try { await storage.set(STORAGE_PREFIX + cod, JSON.stringify(data)); }
    catch (e) { setError("No se pudo guardar."); }
    finally { setSaving(false); }
  }, []);

  const cargarFamiliaConNombre = async (cod, nombreCuidador) => {
    setError("");
    try {
      const res = await storage.get(STORAGE_PREFIX + cod);
      if (res && res.value) {
        let data = JSON.parse(res.value);
        if (!data.personas && data.elderName) {
          data.personas = [{ id: Date.now(), nombre: data.elderName, edad: null, meds: data.meds || [], confirmedByDate: data.confirmedByDate || {}, preferenciasFarmacia: {}, ultimoReconteo: {}, ultimaConexion: Date.now() }];
          delete data.elderName; delete data.meds; delete data.confirmedByDate;
        }
        if (!data.contactos) data.contactos = [];
        if (!data.historialCambios) data.historialCambios = [];
        if (!data.cuidadores) data.cuidadores = [];
        if (!data.cuidadores.includes(nombreCuidador)) data.cuidadores = [...data.cuidadores, nombreCuidador];
        if (!data.settings) data.settings = {};
        if (data.settings.sonidoActivo === undefined) data.settings.sonidoActivo = true;
        if (data.settings.vibracionActiva === undefined) data.settings.vibracionActiva = true;
        if (data.settings.tutorialVisto === undefined) data.settings.tutorialVisto = true;
        await guardarFamilia(cod, data);
        setFamilia(data); setCodigo(cod); setPersonaActualId(data.personas[0]?.id || null);
        setNombreCuidadorInput(nombreCuidador);
        setStage(data.settings?.aceptoTerminos ? "app" : "consentimiento");
        registrarEvento(cod, "unirse_familia", `Cuidador ${nombreCuidador} se unió`, { cuidador: nombreCuidador, persona: data.personas[0]?.nombre || "", edad: data.personas[0]?.edad || "" });
      } else setError("No encontramos ese código.");
    } catch (e) { setError("No encontramos ese código."); }
  };

  const registrarCambio = (accion, detalle) => {
    actualizar((prev) => ({ ...prev, historialCambios: [...(prev.historialCambios || []), { id: Date.now(), fecha: Date.now(), cuidador: nombreCuidadorInput || "Tú", accion, detalle }] }));
  };

  const crearFamilia = async () => {
    if (!nombreInput.trim() || !nombreCuidadorInput.trim()) { setError("Completa el nombre del cuidador y de la persona mayor"); return; }
    if (edadInput && (isNaN(Number(edadInput)) || Number(edadInput) < 0 || Number(edadInput) > 120)) { setError("La edad debe ser un número entre 0 y 120"); return; }
    const cod = genCode();
    const personaId = Date.now();
    const edadNum = edadInput ? Number(edadInput) : null;
    const nueva = {
      personas: [{ id: personaId, nombre: nombreInput.trim(), edad: edadNum, meds: [], confirmedByDate: {}, preferenciasFarmacia: {}, ultimoReconteo: {}, ultimaConexion: Date.now() }],
      contactos: [], cuidadores: [nombreCuidadorInput.trim()], historialCambios: [],
      plan: "estandar", planInicio: null,
      settings: { fontSize: "normal", daltonico: false, darkMode: false, aceptoTerminos: false, onboardingPremiumVisto: false, sonidoActivo: true, vibracionActiva: true, tutorialVisto: false }
    };
    await guardarFamilia(cod, nueva);
    setFamilia(nueva); setCodigo(cod); setPersonaActualId(personaId); setStage("consentimiento");
    registrarEvento(cod, "crear_familia", `Familia creada para ${nombreInput.trim()}${edadNum ? ` (${edadNum} años)` : ""}`, { cuidador: nombreCuidadorInput, persona: nombreInput.trim(), edad: edadNum || "" });
  };

  const unirseFamilia = () => {
    if (codigoInput.trim().length !== 4) return;
    if (!nombreCuidadorInput.trim()) { setError("Pon tu nombre como cuidador"); return; }
    cargarFamiliaConNombre(codigoInput.trim(), nombreCuidadorInput.trim());
  };

  const cargarDemo = async (vistaInicial = "mayor") => {
    const cod = "DEMO";
    const data = generarDemo();
    data.settings.tutorialVisto = vistaInicial === "cuidador" ? false : true;
    await guardarFamilia(cod, data);
    setFamilia(data);
    setCodigo(cod);
    setPersonaActualId(data.personas[0].id);
    setNombreCuidadorInput("Tú");
    setView(vistaInicial);
    setStage("app");
    registrarEvento(cod, "crear_familia", `Demo cargada (${vistaInicial})`, { cuidador: "Tú", persona: "Rosa Pérez (Demo)", edad: 78 });
  };

  const actualizar = async (updater) => { setFamilia((prev) => { const next = updater(prev); guardarFamilia(codigo, next); return next; }); };
  const actualizarPersona = async (updater) => { actualizar((prev) => ({ ...prev, personas: prev.personas.map((p) => p.id === personaActualId ? updater(p) : p) })); };
  const actualizarSettings = (c) => actualizar((prev) => ({ ...prev, settings: { ...(prev.settings || {}), ...c } }));

  const activarPremium = () => {
    actualizar((prev) => ({ ...prev, plan: "premium", planInicio: Date.now(), settings: { ...(prev.settings || {}), onboardingPremiumVisto: false } }));
    setShowPremium(false);
    setShowOnboardingPremium(true);
    registrarEvento(codigo, "activar_premium", "Premium activado", { cuidador: nombreCuidadorInput });
  };
  const canjearCodigo = () => {
    const up = codigoPremium.trim().toUpperCase();
    if (up === CODIGO_ADMIN) { storage.listAll().then(setFamiliasAdmin); setShowAdmin(true); setCodigoPremium(""); setShowPremium(false); }
    else if (up === CODIGO_DATOS) { setShowDatos(true); setCodigoPremium(""); setShowPremium(false); }
    else if (CODIGOS_PILOTO.includes(up)) { activarPremium(); setCodigoPremium(""); }
    else alert("Código no válido");
  };
  if (stage === "cargando") return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: LIGHT.TEAL }}><Loader2 size={30} color="#fff" /></div>;

if (stage === "entrada") {
  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${LIGHT.TEAL}, #0D47A1)`, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "'Space Grotesk','Segoe UI',sans-serif", padding: 20 }}>
      <style>{CSS_GLOBAL}</style>
      <div className="modal-scale" style={{ width: "100%", maxWidth: 380, background: LIGHT.CREAM, borderRadius: 24, padding: 28, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ margin: "0 auto 16px", display: "flex", justifyContent: "center" }}><LogoContigoSiempre size={72} color={LIGHT.TEAL} accent={LIGHT.GOLD} /></div>
        <div style={{ fontSize: 22, fontWeight: 800, color: LIGHT.INK, marginBottom: 6 }}>Contigo Siempre</div>
        <div style={{ fontSize: 13.5, color: LIGHT.MUTED, marginBottom: 8 }}>Recordatorios de medicamentos para tu ser querido</div>
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 18, flexWrap: "wrap" }}>
          <div style={{ fontSize: 10.5, color: LIGHT.MUTED, padding: "4px 10px", background: firebaseEstado === "conectado" ? LIGHT.GREEN + "15" : firebaseEstado === "local" ? LIGHT.AMBER + "15" : LIGHT.LINE, borderRadius: 999, display: "inline-block", fontWeight: 600 }}>{firebaseEstado === "conectado" ? "☁️ Nube conectada" : firebaseEstado === "local" ? "📱 Modo local" : "⏳ Conectando..."}</div>
          {!isOnline && <div className="offline-pulse" style={{ fontSize: 10.5, color: "#E65100", padding: "4px 10px", background: "#FFF3E0", border: "1px solid #FFB74D", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 700 }}><WifiOff size={11} /> Sin conexión</div>}
        </div>
        {modoEntrada === "elegir" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => setModoEntrada("crear")} className="btn-press" style={{ padding: 14, borderRadius: 14, border: "none", background: LIGHT.TEAL, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>Soy nueva familia</button>
            <button onClick={() => setModoEntrada("unirse")} className="btn-press-soft" style={{ padding: 14, borderRadius: 14, border: `1.5px solid ${LIGHT.LINE}`, background: LIGHT.PAPER, color: LIGHT.INK, fontWeight: 700, cursor: "pointer", fontSize: 15 }}>Ya tengo un código</button>
            <div style={{ marginTop: 6, paddingTop: 14, borderTop: `1px solid ${LIGHT.LINE}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: LIGHT.MUTED, letterSpacing: 0.5, marginBottom: 10, textAlign: "center" }}>PROBAR CON DATOS DE EJEMPLO</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button onClick={() => cargarDemo("mayor")} className="btn-press-soft" style={{ padding: 14, borderRadius: 14, border: `1.5px dashed ${LIGHT.TEAL}`, background: LIGHT.TEAL + "08", color: LIGHT.TEAL, fontWeight: 700, cursor: "pointer", fontSize: 13.5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, textAlign: "left" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <User size={18} />
                    <div>
                      <div>Demo del adulto mayor</div>
                      <div style={{ fontSize: 11, color: LIGHT.MUTED, fontWeight: 500 }}>Pantalla simple: confirmar tomas</div>
                    </div>
                  </div>
                  <ArrowRight size={16} />
                </button>
                <button onClick={() => cargarDemo("cuidador")} className="btn-press-soft" style={{ padding: 14, borderRadius: 14, border: `1.5px dashed ${LIGHT.GOLD}`, background: LIGHT.GOLD + "08", color: LIGHT.GOLD, fontWeight: 700, cursor: "pointer", fontSize: 13.5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, textAlign: "left" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Users size={18} />
                    <div>
                      <div>Demo del cuidador</div>
                      <div style={{ fontSize: 11, color: LIGHT.MUTED, fontWeight: 500 }}>Tutorial completo con 9 pasos</div>
                    </div>
                  </div>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
        {modoEntrada === "crear" && (
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: LIGHT.MUTED, marginBottom: 6, letterSpacing: 0.3 }}>TU NOMBRE (CUIDADOR)</div>
            <input value={nombreCuidadorInput} onChange={(e) => setNombreCuidadorInput(e.target.value)} placeholder="Ej. Juan Larrota" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${LIGHT.LINE}`, fontSize: 14, marginBottom: 12, boxSizing: "border-box", outline: "none" }} />
            <div style={{ fontSize: 12, fontWeight: 700, color: LIGHT.MUTED, marginBottom: 6, letterSpacing: 0.3 }}>NOMBRE DE LA PERSONA MAYOR</div>
            <input value={nombreInput} onChange={(e) => setNombreInput(e.target.value)} placeholder="Ej. Rosa Pérez" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${LIGHT.LINE}`, fontSize: 14, marginBottom: 12, boxSizing: "border-box", outline: "none" }} />
            <div style={{ fontSize: 12, fontWeight: 700, color: LIGHT.MUTED, marginBottom: 6, letterSpacing: 0.3, display: "flex", alignItems: "center", gap: 6 }}><Cake size={12} /> EDAD (OPCIONAL)</div>
            <input type="number" min="0" max="120" value={edadInput} onChange={(e) => setEdadInput(e.target.value)} placeholder="Ej. 78" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${LIGHT.LINE}`, fontSize: 14, marginBottom: 16, boxSizing: "border-box", outline: "none" }} />
            {error && <div style={{ fontSize: 12, color: LIGHT.CORAL, marginBottom: 12 }}>{error}</div>}
            <button onClick={crearFamilia} disabled={!nombreInput.trim() || !nombreCuidadorInput.trim()} className="btn-press" style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: (nombreInput.trim() && nombreCuidadorInput.trim()) ? LIGHT.TEAL : "#E0E4EB", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Crear</button>
            <button onClick={() => { setModoEntrada("elegir"); setError(""); }} style={{ marginTop: 10, width: "100%", background: "transparent", border: "none", color: LIGHT.MUTED, fontSize: 12.5, cursor: "pointer", fontWeight: 600 }}>Volver</button>
          </div>
        )}
        {modoEntrada === "unirse" && (
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: LIGHT.MUTED, marginBottom: 6, letterSpacing: 0.3 }}>TU NOMBRE (CUIDADOR)</div>
            <input value={nombreCuidadorInput} onChange={(e) => setNombreCuidadorInput(e.target.value)} placeholder="Ej. Juan Larrota" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${LIGHT.LINE}`, fontSize: 14, marginBottom: 12, boxSizing: "border-box", outline: "none" }} />
            <div style={{ fontSize: 12, fontWeight: 700, color: LIGHT.MUTED, marginBottom: 6, letterSpacing: 0.3 }}>CÓDIGO DE LA FAMILIA</div>
            <input value={codigoInput} onChange={(e) => setCodigoInput(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="0000" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${LIGHT.LINE}`, fontSize: 22, letterSpacing: 8, textAlign: "center", marginBottom: 12, boxSizing: "border-box", outline: "none", fontWeight: 700 }} />
            {error && <div style={{ fontSize: 12, color: LIGHT.CORAL, marginBottom: 12 }}>{error}</div>}
            <button onClick={unirseFamilia} disabled={codigoInput.length !== 4 || !nombreCuidadorInput.trim()} className="btn-press" style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: (codigoInput.length === 4 && nombreCuidadorInput.trim()) ? LIGHT.TEAL : "#E0E4EB", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Entrar</button>
            <button onClick={() => { setModoEntrada("elegir"); setError(""); }} style={{ marginTop: 10, width: "100%", background: "transparent", border: "none", color: LIGHT.MUTED, fontSize: 12.5, cursor: "pointer", fontWeight: 600 }}>Volver</button>
          </div>
        )}
      </div>
    </div>
  );
}

if (stage === "consentimiento") {
  return (
    <div style={{ minHeight: "100vh", background: LIGHT.BG, display: "flex", justifyContent: "center", fontFamily: "'Space Grotesk','Segoe UI',sans-serif" }}>
      <style>{CSS_GLOBAL}</style>
      <div style={{ width: "100%", maxWidth: 420, background: LIGHT.CREAM, minHeight: "100vh", padding: 24 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: LIGHT.TEAL + "12", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}><ShieldCheck size={28} color={LIGHT.TEAL} strokeWidth={2} /></div>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 14, color: LIGHT.INK }}>Antes de continuar</div>
        <div style={{ fontSize: 13.5, color: LIGHT.MUTED, marginBottom: 10, lineHeight: 1.6 }}>Tus datos se usan únicamente dentro de Chile, conforme a la Ley N° 19.628 y la Ley N° 21.719.</div>
        <div style={{ fontSize: 13.5, color: LIGHT.MUTED, marginBottom: 16, lineHeight: 1.6 }}>Esta app no reemplaza la supervisión de un profesional de la salud.</div>
        <button onClick={() => setShowPolitica(true)} className="btn-press-soft" style={{ background: LIGHT.TEAL + "10", border: "none", color: LIGHT.TEAL, fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 18, padding: "10px 14px", borderRadius: 10, display: "flex", alignItems: "center", gap: 8 }}><ScrollText size={14} /> Ver política de privacidad completa</button>
        <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22, cursor: "pointer", padding: 14, borderRadius: 12, border: `1.5px solid ${aceptoCheck ? LIGHT.TEAL : LIGHT.LINE}`, background: aceptoCheck ? LIGHT.TEAL + "08" : LIGHT.PAPER, transition: "all 0.15s ease" }}>
          <input type="checkbox" checked={aceptoCheck} onChange={(e) => setAceptoCheck(e.target.checked)} style={{ width: 20, height: 20, accentColor: LIGHT.TEAL }} />
          <span style={{ fontSize: 13.5, color: LIGHT.INK, fontWeight: 600 }}>He leído y acepto</span>
        </label>
        <button onClick={async () => {
          if (!aceptoCheck) return;
          const next = { ...familia, settings: { ...familia.settings, aceptoTerminos: true, tutorialVisto: false } };
          await guardarFamilia(codigo, next); setFamilia(next); setStage("app");
          setShowTutorial(true);
          registrarEvento(codigo, "acepto_terminos", "Términos aceptados", { cuidador: nombreCuidadorInput });
        }} disabled={!aceptoCheck} className="btn-press" style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: aceptoCheck ? LIGHT.TEAL : "#E0E4EB", color: "#fff", fontWeight: 700, cursor: aceptoCheck ? "pointer" : "not-allowed" }}>Continuar</button>
        {showPolitica && <PoliticaPrivacidad C={LIGHT} onCerrar={() => setShowPolitica(false)} />}
      </div>
    </div>
  );
}
    const scale = FONT_SCALE[settings.fontSize] || 1;
  const maxMeds = esPremium ? Infinity : LIMITES_ESTANDAR.maxMeds;
  const maxPersonas = esPremium ? 3 : LIMITES_ESTANDAR.maxElderly;
  const confirmedHoy = confirmedByDate?.[todayStr()] || {};
  const occurrences = meds.flatMap((m) => m.times.map((t) => ({ med: m, time: t, key: occKey(m.id, t) })));
  const upcoming = occurrences.filter((o) => toMinutes(o.time) >= nowMin && !confirmedHoy[o.key]).sort((a, b) => toMinutes(a.time) - toMinutes(b.time));
  const current = upcoming[0];
  const isCurrentDue = current && toMinutes(current.time) <= nowMin;
  const racha = calcularRacha(meds, confirmedByDate);

  const confirmar = (occ) => {
    actualizarPersona((p) => {
      const fecha = todayStr();
      const nc = { ...(p.confirmedByDate || {}) };
      nc[fecha] = { ...(nc[fecha] || {}), [occ.key]: true };
      const nm = p.meds.map((m) => (m.id === occ.med.id ? { ...m, stock: Math.max(0, +(m.stock - m.doseAmount).toFixed(2)) } : m));
      return { ...p, meds: nm, confirmedByDate: nc, ultimaConexion: Date.now() };
    });
    registrarEvento(codigo, "confirmar_toma", `${occ.med.name} a las ${fmtHoraConAmPm(occ.time)}`, { cuidador: nombreCuidadorInput, persona: elderName, edad: elderEdad || "", med: occ.med.name, hora: occ.time });
    setAlertaActiva(null);
  };

  const posponerAlerta = () => {
    if (!alertaActiva) return;
    setAlertaActiva(null);
    registrarEvento(codigo, "alerta_pospuesta", `${alertaActiva.med.name} a las ${fmtHoraConAmPm(alertaActiva.time)}`, { cuidador: nombreCuidadorInput, persona: elderName, med: alertaActiva.med.name, hora: alertaActiva.time });
  };

  const intentarAgregarMed = () => { if (meds.length >= maxMeds) { setShowLimite("meds"); return; } addStartRef.current = Date.now(); setShowAdd(true); };
  const intentarAgregarPersona = () => { if ((familia.personas?.length || 0) >= maxPersonas) { setShowLimite("personas"); return; } setShowAddPersona(true); };

  const agregarMed = () => {
    if (!form.name.trim()) return;
    const critF = form.criticidad || detectarCriticidad(form.name);
    const modoF = critF === "vital" ? "inmediato" : (form.modoAviso || (critF === "importante" ? "inmediato" : "final_dia"));
    const nuevo = {
      id: Date.now(), name: form.name.trim(), dose: form.dose.trim() || "1 dosis",
      times: form.times.filter(Boolean), color: form.color, shape: form.shape,
      stock: form.stock, doseAmount: form.doseAmount, type: form.type,
      receta: form.receta || clasificarMedicamento(form.name) || "sin_receta",
      criticidad: critF, modoAviso: modoF,
      notas: form.notas || "", recetaVence: form.recetaVence || "",
      ventanaMin: Number(form.ventanaMin) || 0,
    };
    actualizarPersona((p) => ({ ...p, meds: [...p.meds, nuevo] }));
    registrarCambio("Agregó", nuevo.name);
    const duracionSeg = addStartRef.current ? Math.round((Date.now() - addStartRef.current) / 1000) : 0;
    registrarEvento(codigo, "agregar_med", nuevo.name, { cuidador: nombreCuidadorInput, persona: elderName, edad: elderEdad || "", med: nuevo.name, criticidad: critF, duracion_seg: duracionSeg });
    addStartRef.current = null;
    setForm({ name: "", dose: "", times: ["08:00"], color: PILL_COLORS[0], shape: PILL_SHAPES[0], stock: 30, doseAmount: 1, type: "privada", receta: null, criticidad: null, modoAviso: null, notas: "", recetaVence: "", ventanaMin: 0 });
    setShowAdd(false);
  };

  const guardarNotas = (medId, texto) => {
    actualizarPersona((p) => ({ ...p, meds: p.meds.map((m) => (m.id === medId ? { ...m, notas: texto } : m)) }));
    const med = meds.find((m) => m.id === medId);
    if (med) registrarCambio("Cambió notas", med.name);
    setShowNotas(null);
  };

  const agregarPersona = () => {
    if (!nombrePersonaNueva.trim()) return;
    if (edadPersonaNueva && (isNaN(Number(edadPersonaNueva)) || Number(edadPersonaNueva) < 0 || Number(edadPersonaNueva) > 120)) { alert("La edad debe ser un número entre 0 y 120"); return; }
    const edadNum = edadPersonaNueva ? Number(edadPersonaNueva) : null;
    const nueva = { id: Date.now(), nombre: nombrePersonaNueva.trim(), edad: edadNum, meds: [], confirmedByDate: {}, preferenciasFarmacia: {}, ultimoReconteo: {}, ultimaConexion: Date.now() };
    actualizar((prev) => ({ ...prev, personas: [...prev.personas, nueva] }));
    registrarCambio("Agregó persona", `${nombrePersonaNueva.trim()}${edadNum ? ` (${edadNum} años)` : ""}`);
    registrarEvento(codigo, "agregar_persona", `${nombrePersonaNueva.trim()}${edadNum ? ` (${edadNum} años)` : ""}`, { cuidador: nombreCuidadorInput, persona: nombrePersonaNueva.trim(), edad: edadNum || "" });
    setPersonaActualId(nueva.id); setNombrePersonaNueva(""); setEdadPersonaNueva(""); setShowAddPersona(false);
  };

  const agregarContacto = () => {
    if (!formContacto.nombre.trim() || !formContacto.telefono.trim()) return;
    actualizar((prev) => ({ ...prev, contactos: [...(prev.contactos || []), { id: Date.now(), ...formContacto }] }));
    registrarEvento(codigo, "agregar_contacto", formContacto.nombre, { cuidador: nombreCuidadorInput, tipo_contacto: formContacto.tipo });
    setFormContacto({ nombre: "", telefono: "", tipo: "médico" });
  };
  const eliminarContacto = (id) => actualizar((prev) => ({ ...prev, contactos: (prev.contactos || []).filter((c) => c.id !== id) }));

  const reponer = (cant) => {
    if (!restockTarget) return;
    actualizarPersona((p) => ({ ...p, meds: p.meds.map((m) => (m.id === restockTarget.id ? { ...m, stock: +(m.stock + cant).toFixed(2) } : m)) }));
    registrarCambio("Repuso stock", `${restockTarget.name} +${fmtN(cant)}`);
    registrarEvento(codigo, "reponer_stock", `${restockTarget.name} +${fmtN(cant)}`, { cuidador: nombreCuidadorInput, persona: elderName, med: restockTarget.name, cantidad: cant });
    setRestockTarget(null);
  };
  const aplicarReconteo = (id, c) => {
    actualizarPersona((p) => ({ ...p, meds: p.meds.map((m) => (m.id === id ? { ...m, stock: c } : m)), ultimoReconteo: { ...(p.ultimoReconteo || {}), [id]: Date.now() } }));
    const med = meds.find((m) => m.id === id);
    if (med) registrarCambio("Recontó", `${med.name} → ${fmtN(c)}`);
    registrarEvento(codigo, "reconteo", `${med?.name || ""} → ${fmtN(c)}`, { cuidador: nombreCuidadorInput, persona: elderName, med: med?.name, stock: c });
    setReconteoTarget(null);
  };

  const abrirFarmaciaIndividual = (f, m) => {
    registrarDato("vioIndividualTotal");
    registrarDato("clicsFarmacia", 1, f.nombre);
    registrarDato("medsConsultados", f.costo, m.name);
    registrarEvento(codigo, "clic_farmacia_individual", `${f.nombre} — ${m.name}`, { cuidador: nombreCuidadorInput, persona: elderName, farmacia: f.nombre, med: m.name });
    const url = `${f.url}?ref=contigo_siempre_app&producto=${encodeURIComponent(m.name)}`;
    actualizarPersona((p) => ({ ...p, preferenciasFarmacia: { ...(p.preferenciasFarmacia || {}), [m.id]: f.id } }));
    setLinkAbierto({ farmacia: f.nombre, url, receta: m.receta });
  };

  const abrirFarmaciaCarro = (f, medsList, total) => {
    registrarDato("abrioFarmaciaTotal");
    registrarDato("clicsFarmacia", 1, f.nombre);
    medsList.forEach((m) => registrarDato("medsConsultados", f.costo, m.name));
    registrarEvento(codigo, "clic_farmacia_carro", `${f.nombre} — ${medsList.length} meds — $${total}`, { cuidador: nombreCuidadorInput, persona: elderName, farmacia: f.nombre, cantidad: medsList.length, total });
    const url = `${f.url}?ref=contigo_siempre_app&carro=completo`;
    setLinkAbierto({ farmacia: f.nombre, url, receta: "con_receta" });
    setShowCarroCompleto(false);
  };

  const abrirCarroCompleto = () => {
    registrarDato("vioCarroTotal");
    registrarEvento(codigo, "ver_carro_completo", `${medsCarro.length} medicamentos pendientes`, { cuidador: nombreCuidadorInput, persona: elderName, cantidad: medsCarro.length });
    setShowCarroCompleto(true);
  };

  const abrirProductosVentaLibre = (productos) => {
    registrarDato("productosSugeridosTotal");
    registrarEvento(codigo, "ver_productos_sugeridos", `${productos.length} productos`, { cuidador: nombreCuidadorInput, persona: elderName, cantidad: productos.length, skus: productos.map(p => p.sku).join(",") });
    const ids = productos.map((p) => p.sku).join(",");
    setLinkAbierto({ url: `https://www.mercadolibre.cl/cart/add-multiple?items=${ids}&matt_tool=PENDIENTE`, mensaje: "Artículos útiles para el cuidado diario" });
  };

  const compartirWhatsApp = (tipo) => {
    const texto = generarTextoCompartir(tipo, elderName, meds, confirmedByDate);
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
    registrarEvento(codigo, "compartir_whatsapp", tipo, { cuidador: nombreCuidadorInput, persona: elderName, tipo_compartir: tipo });
    setShowCompartir(false);
  };

  const detectadoReceta = clasificarMedicamento(form.name);
  const detectadoCrit = detectarCriticidad(form.name);
  const { dias: diasMes, mes, año } = getMesActual();
  const recetasPorVencer = meds.filter((m) => { if (!m.recetaVence) return false; const d = diasHastaVencimiento(m.recetaVence); return d !== null && d >= 0 && d <= 30; });
  const diasPremium = familia.planInicio ? Math.floor((Date.now() - familia.planInicio) / (1000 * 60 * 60 * 24)) : 0;
  const mostrarAvisoRenovacion = esPremium && diasPremium >= 27 && diasPremium <= 30;
  const medsCarro = meds.filter((m) => { const s = semaforoRiesgo(m, confirmedByDate); return s.nivel === "urgente" || s.nivel === "atención"; });

  return (
    <div style={{ minHeight: "100vh", background: C.BG, fontFamily: "'Space Grotesk','Segoe UI',sans-serif", color: C.INK, display: "flex", justifyContent: "center" }}>
      <style>{CSS_GLOBAL}</style>
      <div style={{ width: "100%", maxWidth: 420, minHeight: "100vh", background: C.CREAM, display: "flex", flexDirection: "column" }}>

        {alertaActiva && view === "mayor" && (
          <PantallaAlertaMedicamento
            C={C}
            med={alertaActiva.med}
            hora={alertaActiva.time}
            onConfirmar={() => confirmar(alertaActiva)}
            onPosponer={posponerAlerta}
            escala={scale}
            daltonico={settings.daltonico}
            sonidoActivo={settings.sonidoActivo !== false}
          />
        )}

        {!isOnline && (
          <div className="offline-pulse" style={{ background: "#FFF3E0", borderBottom: "1px solid #FFB74D", padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 12, fontWeight: 700, color: "#E65100" }}>
            <WifiOff size={14} /> Sin conexión — Tus datos se sincronizarán automáticamente
          </div>
        )}

        {familia.personas && familia.personas.length > 1 && view === "cuidador" && (
          <div style={{ padding: "12px 20px 0", position: "relative" }}>
            <button onClick={() => setShowSelector(!showSelector)} className="btn-press-soft" style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.INK, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: C.SHADOW }}>
              <span>👤 {elderName}{elderEdad ? ` · ${elderEdad} años` : ""}</span><ChevronDown size={14} />
            </button>
            {showSelector && (
              <div className="modal-scale" style={{ position: "absolute", top: 52, left: 20, right: 20, background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 12, padding: 6, zIndex: 20, boxShadow: "0 8px 24px rgba(0,0,0,0.18)" }}>
                {familia.personas.map((p) => {
                  const mins = minutosDesde(p.ultimaConexion);
                  const desconectado = mins !== null && mins > MINUTOS_SIN_CONEXION_ALERTA;
                  return (
                    <button key={p.id} onClick={() => { setPersonaActualId(p.id); setShowSelector(false); }} className="btn-press-soft" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "none", background: p.id === personaActualId ? (oscuro ? "#1E3A5F" : "#E3F2FD") : "transparent", color: C.INK, fontWeight: p.id === personaActualId ? 700 : 500, fontSize: 13, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 6 }}>
                      <span>👤 {p.nombre}{p.edad ? ` · ${p.edad} años` : ""}</span>
                      {desconectado && <WifiOff size={12} color="#E65100" />}
                    </button>
                  );
                })}
                <button onClick={() => { setShowSelector(false); intentarAgregarPersona(); }} className="btn-press-soft" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "none", background: "transparent", color: C.TEAL, fontWeight: 700, fontSize: 13, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 6 }}><UserPlus size={14} /> Agregar persona</button>
              </div>
            )}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px 0" }}>
          {view === "cuidador" && (
            <button onClick={() => setShowMenuLateral(true)} data-tutorial="menu" className="btn-press-soft" style={{ border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.INK, borderRadius: 12, width: 42, height: 42, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative", boxShadow: C.SHADOW }}>
              <Menu size={20} strokeWidth={2.2} />
              {smsLog.length > 0 && <span style={{ position: "absolute", top: -4, right: -4, background: C.CORAL, color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 999, padding: "1px 5px", minWidth: 16, textAlign: "center" }}>{fmtN(smsLog.length)}</span>}
            </button>
          )}
          <button onClick={() => setView("mayor")} className="btn-press-soft" style={{ flex: 1, padding: "11px", borderRadius: 12, border: `1px solid ${view === "mayor" ? "transparent" : C.LINE}`, fontWeight: 700, fontSize: 12.5, cursor: "pointer", background: view === "mayor" ? C.TEAL : C.PAPER, color: view === "mayor" ? "#fff" : C.MUTED, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: view === "mayor" ? `0 4px 12px ${C.TEAL}40` : C.SHADOW }}><User size={14} /> {elderName.split(" ")[0]}</button>
          <button onClick={() => setView("cuidador")} data-tutorial="tab-cuidador" className="btn-press-soft" style={{ flex: 1, padding: "11px", borderRadius: 12, border: `1px solid ${view === "cuidador" ? "transparent" : C.LINE}`, fontWeight: 700, fontSize: 12.5, cursor: "pointer", background: view === "cuidador" ? C.TEAL : C.PAPER, color: view === "cuidador" ? "#fff" : C.MUTED, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: view === "cuidador" ? `0 4px 12px ${C.TEAL}40` : C.SHADOW }}><Users size={14} /> Cuidador {esPremium && "⭐"}</button>
        </div>

        {view === "cuidador" && <div style={{ margin: "8px 20px 0", display: "flex", justifyContent: "center" }}>
          <AvisoSinConexion C={C} offline={!isOnline} ultimaConexion={ultimaConexionPersona} compacto={false} />
        </div>}

        <div data-tutorial="codigo" style={{ margin: "10px 20px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 11, color: C.MUTED, padding: 4, borderRadius: 8 }}>
          <KeyRound size={11} /> Código: <strong>{codigo}</strong>
          <button onClick={() => navigator.clipboard?.writeText(codigo)} className="btn-press-soft" style={{ border: "none", background: "transparent", color: C.TEAL, cursor: "pointer", display: "flex", padding: 4 }}><Copy size={12} /></button>
          <button onClick={() => setShowCompartir(true)} className="btn-press-soft" style={{ border: "none", background: "transparent", color: C.TEAL, cursor: "pointer", display: "flex", padding: 4 }}><Share2 size={12} /></button>
          {saving && <Loader2 size={11} />}
          {firebaseEstado === "conectado" && isOnline && <span style={{ fontSize: 10, color: C.GREEN, fontWeight: 700 }}>☁️</span>}
        </div>

        {view === "mayor" ? (
          <div style={{ padding: "20px 22px 40px", flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginBottom: 4 }}>
              <button onClick={() => setShowContactos(true)} className="btn-press-soft" style={{ border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.MUTED, borderRadius: 999, padding: "7px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, boxShadow: C.SHADOW }}><Phone size={12} /> Emergencia</button>
              <button onClick={() => actualizarSettings({ darkMode: !oscuro })} className="btn-press-soft" style={{ border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.MUTED, borderRadius: 999, padding: "7px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", boxShadow: C.SHADOW }}>{oscuro ? <Sun size={14} /> : <Moon size={14} />}</button>
              <button onClick={() => setShowAjustes(true)} data-tutorial="ajustes" className="btn-press-soft" style={{ border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.MUTED, borderRadius: 999, padding: "7px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: C.SHADOW, display: "flex", alignItems: "center" }}><Settings size={14} /></button>
            </div>

            {racha > 0 && (
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <div className="modal-scale" style={{ background: `linear-gradient(135deg, ${C.GOLD}20, ${C.GOLD}10)`, border: `1px solid ${C.GOLD}40`, borderRadius: 999, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                  <Flame size={18} color={C.GOLD} className="flame-pulse" fill={C.GOLD} />
                  <span style={{ fontSize: 14, fontWeight: 800, color: C.GOLD }}>{fmtN(racha)} día{racha !== 1 ? "s" : ""} seguido{racha !== 1 ? "s" : ""}</span>
                </div>
              </div>
            )}

            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <div style={{ fontSize: 15 * scale, color: C.MUTED, fontWeight: 600 }}>Hola, {elderName.split(" ")[0]} 👋{elderEdad ? ` · ${elderEdad} años` : ""}</div>
              <div style={{ fontSize: 34 * scale, fontWeight: 800, marginTop: 4 }}>{fmt(nowMin)}</div>
            </div>
            {current && isCurrentDue ? (
              <div className="modal-scale" style={{ background: C.PAPER, border: `2px solid ${dispColor(current.med.color, settings.daltonico)}`, borderRadius: 28, padding: 26, textAlign: "center", boxShadow: "0 8px 30px rgba(25,118,210,0.15)" }}>
                <div style={{ fontSize: 13 * scale, fontWeight: 700, color: C.MUTED, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1.2 }}>Es hora de tu medicamento</div>
                <div style={{ width: 90, height: 90, borderRadius: 999, background: dispColor(current.med.color, settings.daltonico), display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 40, color: "#fff", boxShadow: `0 8px 20px ${dispColor(current.med.color, settings.daltonico)}50` }}>{current.med.shape}</div>
                <div style={{ fontSize: 26 * scale, fontWeight: 800 }}>{current.med.name}</div>
                <div style={{ fontSize: 16 * scale, color: C.MUTED, marginTop: 6 }}>{current.med.dose}</div>
                {current.med.ventanaMin > 0 && (
                  <div style={{ fontSize: 12 * scale, color: C.TEAL, marginTop: 10, background: C.TEAL + "10", padding: "6px 12px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                    <Clock size={12} /> Puedes hasta las {fmtHoraConAmPm(sumarMinutos(current.time, current.med.ventanaMin))}
                  </div>
                )}
                {current.med.notas && <div style={{ fontSize: 13 * scale, color: C.AMBER, marginTop: 8, fontStyle: "italic" }}>📝 {current.med.notas}</div>}
                <button onClick={() => confirmar(current)} className="btn-press" style={{ width: "100%", marginTop: 22, padding: "20px", borderRadius: 20, border: "none", background: C.TEAL, color: "#fff", fontWeight: 800, fontSize: 20 * scale, cursor: "pointer", boxShadow: `0 8px 20px ${C.TEAL}50` }}>✓ Ya lo tomé</button>
                {!isOnline && <div style={{ fontSize: 11, color: "#E65100", marginTop: 10, fontWeight: 700 }}>📴 Sin conexión — Se guardará y sincronizará al volver</div>}
              </div>
            ) : (
              <div style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 28, padding: 30, textAlign: "center", boxShadow: C.SHADOW }}>
                <div style={{ width: 64, height: 64, borderRadius: 999, background: C.TEAL + "12", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <Clock size={32} color={C.TEAL} strokeWidth={2} />
                </div>
                <div style={{ fontSize: 19 * scale, fontWeight: 700 }}>{meds.length === 0 ? "Sin medicamentos cargados" : "Todo tranquilo"}</div>
                {current && <div style={{ fontSize: 15 * scale, color: C.MUTED, marginTop: 6 }}>Próximo: {current.med.name} a las {fmtHoraConAmPm(current.time)}</div>}
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: "16px 20px 100px", flex: 1 }}>
            {racha > 0 && (
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <div style={{ background: `linear-gradient(135deg, ${C.GOLD}20, ${C.GOLD}10)`, border: `1px solid ${C.GOLD}40`, borderRadius: 999, padding: "6px 14px", display: "flex", alignItems: "center", gap: 6 }}>
                  <Flame size={14} color={C.GOLD} fill={C.GOLD} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: C.GOLD }}>{fmtN(racha)} día{racha !== 1 ? "s" : ""} seguido{racha !== 1 ? "s" : ""}</span>
                </div>
              </div>
            )}

            {cuidadorTab === "meds" && recetasPorVencer.length > 0 && (
              <div style={{ background: oscuro ? "#3A2F1A" : "#FFF8E1", border: `1px solid ${oscuro ? "#5A4A2A" : "#FFE082"}`, borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14, marginTop: 8, boxShadow: C.SHADOW }}>
                <FileText size={20} color={C.AMBER} style={{ marginTop: 1 }} />
                <div style={{ fontSize: 13, color: oscuro ? "#FFE082" : "#8A5F16", lineHeight: 1.5 }}>Recetas por vencer: {recetasPorVencer.map((m) => m.name).join(", ")}</div>
              </div>
            )}

            {mostrarAvisoRenovacion && (
              <div onClick={() => setShowPremium(true)} className="btn-press-soft" style={{ marginBottom: 14, background: oscuro ? "#3A2F1A" : "#FFF8E1", border: `1px solid ${C.GOLD}`, borderRadius: 16, padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, boxShadow: C.SHADOW }}>
                <Crown size={20} color={C.GOLD} />
                <div style={{ flex: 1 }}><div style={{ fontSize: 12.5, fontWeight: 700, color: C.GOLD }}>Tu Premium vence pronto</div><div style={{ fontSize: 11, color: C.MUTED }}>Toca para renovar.</div></div>
              </div>
            )}

            {!esPremium && (
              <div onClick={() => setShowPremium(true)} className="btn-press-soft" style={{ marginBottom: 14, background: `linear-gradient(135deg, ${C.GOLD}, #E65100)`, borderRadius: 16, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, color: "#fff", boxShadow: "0 6px 20px rgba(249,168,37,0.35)" }}>
                <Crown size={22} />
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700 }}>Hazte Premium</div><div style={{ fontSize: 11, opacity: 0.9 }}>Hasta 3 personas, medicamentos ilimitados</div></div>
                <ArrowRight size={16} />
              </div>
            )}

            {cuidadorTab === "meds" && (
              <>
                {meds.length === 0 ? (
                  <div style={{ marginTop: 14 }}>
                    <EstadoVacio C={C} icono={Pill} titulo="Sin medicamentos aún" texto="Agrega el primer medicamento para empezar a cuidar." botonTexto="Agregar medicamento" onBoton={intentarAgregarMed} />
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12, marginTop: 6 }}>
                      Medicamentos ({fmtN(meds.length)}{!esPremium && `/${LIMITES_ESTANDAR.maxMeds}`})
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {meds.map((m) => {
                        const sem = semaforoRiesgo(m, confirmedByDate);
                        const crit = m.criticidad || detectarCriticidad(m.name);
                        const modo = m.modoAviso || (crit === "importante" ? "inmediato" : "final_dia");
                        const colorCrit = crit === "vital" ? C.CORAL : crit === "importante" ? C.AMBER : C.GREEN;
                        const labelCrit = crit === "vital" ? "VITAL" : crit === "importante" ? "IMPORTANTE" : "NORMAL";
                        const semColor = sem.nivel === "urgente" ? C.CORAL : sem.nivel === "atención" ? C.AMBER : C.GREEN;
                        const fechaCompra = sem.dias !== null ? proximaFechaCompra(sem.dias) : null;
                        const diasReceta = m.recetaVence ? diasHastaVencimiento(m.recetaVence) : null;
                        return (
                          <div key={m.id} data-tutorial={meds[0]?.id === m.id ? "med-card" : undefined} className="card-hover" style={{ padding: "14px", borderRadius: 16, background: C.PAPER, border: `1px solid ${C.LINE}`, boxShadow: C.SHADOW }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ width: 36, height: 36, borderRadius: 999, background: dispColor(m.color, settings.daltonico), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#fff", flexShrink: 0 }}>{m.shape}</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                  {m.name}
                                  <span style={{ fontSize: 9, background: colorCrit + "20", color: colorCrit, padding: "2px 7px", borderRadius: 999, fontWeight: 700, letterSpacing: 0.3 }}>{labelCrit}</span>
                                  {m.receta === "con_receta" && <span style={{ fontSize: 9, background: C.TEAL + "20", color: C.TEAL, padding: "2px 7px", borderRadius: 999, fontWeight: 700, letterSpacing: 0.3 }}>RECETA</span>}
                                  <span style={{ width: 8, height: 8, borderRadius: 999, background: semColor, marginLeft: "auto" }} />
                                </div>
                                <div style={{ fontSize: 11, color: C.MUTED, marginTop: 3 }}>{m.times.map(fmtHoraConAmPm).join(" · ")} · Aviso: {modo === "inmediato" ? `a los ${UMBRAL_MIN[crit]} min` : modo === "final_dia" ? "al final del día" : "nunca"}{m.ventanaMin > 0 ? ` · ventana ${m.ventanaMin}min` : ""}</div>
                                {m.notas && <div style={{ fontSize: 11, color: C.AMBER, marginTop: 4, fontStyle: "italic" }}>📝 {m.notas}</div>}
                                {diasReceta !== null && diasReceta >= 0 && diasReceta <= 30 && (<div style={{ fontSize: 11, color: diasReceta <= 7 ? C.CORAL : C.MUTED, marginTop: 4 }}>📄 Receta vence en {fmtN(diasReceta)} día{diasReceta !== 1 ? "s" : ""}</div>)}
                              </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.LINE}` }}>
                              <div style={{ fontSize: 11.5, color: semColor, fontWeight: 700 }}>{sem.dias !== null ? `${fmtN(sem.dias)} días · ${sem.nivel}` : "Sin datos"}</div>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button onClick={() => setShowNotas(m)} className="btn-press-soft" style={{ fontSize: 10.5, fontWeight: 700, color: C.AMBER, background: oscuro ? "#3A2F1A" : "#FFF8E1", border: "none", padding: "6px 9px", borderRadius: 999, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><StickyNote size={11} /></button>
                                <button onClick={() => esPremium ? setReconteoTarget(m) : setShowPremium(true)} className="btn-press-soft" style={{ fontSize: 10.5, fontWeight: 700, color: esPremium ? C.TEAL : C.GOLD, background: esPremium ? (oscuro ? "#1E3A5F" : "#E3F2FD") : (oscuro ? "#3A2F1A" : "#FFF8E1"), border: "none", padding: "6px 9px", borderRadius: 999, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>{esPremium ? <Camera size={11} /> : <Lock size={11} />}</button>
                                <button onClick={() => setRestockTarget(m)} className="btn-press-soft" style={{ fontSize: 10.5, fontWeight: 700, color: C.TEAL, background: oscuro ? "#1E3A5F" : "#E3F2FD", border: "none", padding: "6px 9px", borderRadius: 999, cursor: "pointer" }}>Reponer</button>
                              </div>
                            </div>
                            {fechaCompra && (sem.nivel === "urgente" || sem.nivel === "atención") && (<div style={{ marginTop: 8, fontSize: 11, color: C.MUTED }}><Calendar size={11} /> Compra antes del <strong>{fechaCompra}</strong></div>)}
                          </div>
                        );
                      })}
                    </div>
                    <button onClick={intentarAgregarMed} data-tutorial="add-med" className="btn-press-soft" style={{ marginTop: 18, width: "100%", background: oscuro ? "#1E3A5F" : "#E3F2FD", border: `1.5px dashed ${oscuro ? "#3A5A7F" : "#90CAF9"}`, color: C.TEAL, padding: 13, borderRadius: 14, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      {meds.length >= maxMeds ? <><Lock size={16} /> Límite alcanzado — Hazte Premium</> : <><Plus size={16} /> Agregar medicamento</>}
                    </button>
                    <button onClick={intentarAgregarPersona} className="btn-press-soft" style={{ marginTop: 10, width: "100%", background: "transparent", border: `1.5px dashed ${C.LINE}`, color: C.MUTED, padding: 13, borderRadius: 14, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <UserPlus size={16} /> Agregar otra persona {!esPremium && "(Premium)"}
                    </button>
                  </>
                )}
              </>
            )}

            {cuidadorTab === "canasta" && (
              <>
                {medsCarro.length > 0 && (
                  <div onClick={abrirCarroCompleto} className="btn-press-soft" style={{ background: `linear-gradient(135deg, ${C.TEAL}, #0D47A1)`, borderRadius: 18, padding: 20, marginBottom: 16, cursor: "pointer", color: "#fff", boxShadow: "0 8px 24px rgba(25,118,210,0.35)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <ShoppingCart size={22} />
                      <div style={{ fontSize: 15, fontWeight: 700 }}>Carro completo</div>
                    </div>
                    <div style={{ fontSize: 12.5, opacity: 0.9, marginBottom: 10 }}>Tienes {fmtN(medsCarro.length)} medicamento{medsCarro.length > 1 ? "s" : ""} con stock bajo o crítico.</div>
                    <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 10, padding: 10, fontSize: 12, fontWeight: 700, textAlign: "center" }}>Armar carro y elegir farmacia →</div>
                  </div>
                )}

                {(() => {
                  const sugerencias = obtenerProductosSugeridos(meds, mes);
                  return (
                    <div style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 20, padding: 18, marginBottom: 22, boxShadow: C.SHADOW }}>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{NOMBRE_TEMPORADA[sugerencias.temporada]}</div>
                      <div style={{ fontSize: 11.5, color: C.MUTED, marginBottom: 14, lineHeight: 1.5 }}>Artículos útiles para el cuidado diario y la rutina del hogar.</div>
                      {sugerencias.productos.map((p) => (
                        <div key={p.sku} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.MUTED, marginBottom: 8, padding: "6px 0", borderBottom: `1px solid ${C.LINE}` }}>
                          <span style={{ flex: 1, paddingRight: 8 }}>{p.nombre}</span>
                          <strong style={{ color: C.INK, whiteSpace: "nowrap" }}>${p.precio.toLocaleString("es-CL")}</strong>
                        </div>
                      ))}
                      <button onClick={() => abrirProductosVentaLibre(sugerencias.productos)} className="btn-press" style={{ width: "100%", padding: 13, borderRadius: 14, border: "none", background: C.TEAL, color: "#fff", fontWeight: 700, cursor: "pointer", marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <ShoppingCart size={16} /> Ver artículos sugeridos
                      </button>
                      <div style={{ fontSize: 10.5, color: C.MUTED, textAlign: "center", marginTop: 8, lineHeight: 1.5 }}>Al comprar por aquí, apoyas a que la app siga siendo gratis.</div>
                    </div>
                  );
                })()}

                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Medicamentos con receta</div>
                <div style={{ fontSize: 12, color: C.MUTED, marginBottom: 12 }}>Elige la farmacia y sube tu receta allá.</div>
                {calcularRankingFarmacias(FARMACIAS).map((r, i) => (
                  <div key={r.farmacia.id} style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 16, padding: 16, marginBottom: 10, boxShadow: C.SHADOW }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{String.fromCharCode(65 + i)}. {r.farmacia.nombre}</div>
                      <div style={{ fontSize: 11, color: C.MUTED }}>{r.farmacia.distanciaKm} km</div>
                    </div>
                    {meds.filter((m) => m.receta === "con_receta").map((m) => (
                      <button key={m.id} onClick={() => abrirFarmaciaIndividual(r.farmacia, m)} className="btn-press-soft" style={{ width: "100%", padding: 11, borderRadius: 12, border: `1.5px solid ${C.TEAL}`, background: "transparent", color: C.TEAL, fontWeight: 700, fontSize: 12.5, cursor: "pointer", marginTop: 4 }}>Ir a farmacia — {m.name}</button>
                    ))}
                  </div>
                ))}
              </>
            )}

            {cuidadorTab === "historial" && (
              <>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12 }}>Historial del mes</div>
                <div style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 20, padding: 18, boxShadow: C.SHADOW }}>
                  <div style={{ fontWeight: 700, fontSize: 16, textAlign: "center", marginBottom: 14 }}>{MESES[mes]} {año}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
                    {DIAS_SEM.map((d, i) => (<div key={i} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: C.MUTED, padding: 4 }}>{d}</div>))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                    {diasMes.map((dia, i) => {
                      if (!dia) return <div key={i} />;
                      const fechaKey = dia.toISOString().slice(0, 10);
                      const hoy = new Date(); const esFuturo = dia > hoy;
                      const diaData = confirmedByDate?.[fechaKey] || {};
                      let totalEsp = 0; meds.forEach((m) => { totalEsp += m.times.length; });
                      const totalConf = Object.keys(diaData).filter((k) => diaData[k]).length;
                      const olvidos = Math.max(0, totalEsp - totalConf);
                      let bg = oscuro ? "#1E2F48" : "#F0F4F8"; let color = C.MUTED;
                      if (!esFuturo && totalEsp > 0) { if (olvidos === 0) { bg = C.GREEN; color = "#fff"; } else if (olvidos === 1) { bg = C.AMBER; color = "#fff"; } else { bg = C.CORAL; color = "#fff"; } }
                      return (<button key={i} onClick={() => !esFuturo && totalEsp > 0 && setDiaDetalle({ fecha: fechaKey, dia: dia.getDate(), confirmadas: totalConf, esperadas: totalEsp, olvidos, diaData })} className="btn-press-soft" style={{ aspectRatio: "1", borderRadius: 8, border: "none", background: bg, color, fontSize: 12, fontWeight: 700, cursor: (!esFuturo && totalEsp > 0) ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, transition: "all 0.15s ease" }}>{dia.getDate()}</button>);
                    })}
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 14, fontSize: 10.5, color: C.MUTED, justifyContent: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 4, background: C.GREEN }} /> Todo bien</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 4, background: C.AMBER }} /> 1 olvido</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 4, background: C.CORAL }} /> 2+ olvidos</div>
                  </div>
                </div>
              </>
            )}

            {cuidadorTab === "cambios" && (
              <>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12 }}>Historial de cambios</div>
                {historialCambios.length === 0 ? (
                  <EstadoVacio C={C} icono={FileText} titulo="Sin cambios aún" texto="Los cambios que hagas aparecerán aquí." />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[...historialCambios].reverse().map((c) => (
                      <div key={c.id} style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 12, padding: 12, boxShadow: C.SHADOW }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.MUTED, marginBottom: 4 }}>
                          <span><strong style={{ color: C.TEAL }}>{c.cuidador}</strong> · {c.accion}</span>
                          <span>{new Date(c.fecha).toLocaleDateString("es-CL")} {new Date(c.fecha).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <div style={{ fontSize: 13 }}>{c.detalle}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {cuidadorTab === "contactos" && (
              <>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12 }}>Contactos de emergencia</div>
                {contactos.length === 0 ? (
                  <div style={{ marginBottom: 14 }}>
                    <EstadoVacio C={C} icono={Phone} titulo="Sin contactos aún" texto="Agrega el médico tratante o un familiar para emergencias." />
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                    {contactos.map((c) => (
                      <div key={c.id} style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 14, padding: 14, display: "flex", alignItems: "center", gap: 12, boxShadow: C.SHADOW }}>
                        <div style={{ width: 36, height: 36, borderRadius: 999, background: C.TEAL + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{c.tipo === "médico" ? "🩺" : c.tipo === "familia" ? "👨‍👩‍👧" : "🏥"}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{c.nombre}</div>
                          <div style={{ fontSize: 12, color: C.MUTED }}>{c.telefono} · {c.tipo}</div>
                        </div>
                        <a href={`tel:${c.telefono}`} className="btn-press-soft" style={{ padding: "8px 14px", borderRadius: 10, background: C.TEAL, color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>Llamar</a>
                        <button onClick={() => eliminarContacto(c.id)} className="btn-press-soft" style={{ border: "none", background: "transparent", color: C.CORAL, cursor: "pointer", padding: 6 }}><X size={16} /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 16, padding: 16, boxShadow: C.SHADOW }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Agregar contacto</div>
                  <input value={formContacto.nombre} onChange={(e) => setFormContacto({ ...formContacto, nombre: e.target.value })} placeholder="Nombre" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${C.LINE}`, fontSize: 13, marginBottom: 8, boxSizing: "border-box", background: C.PAPER, color: C.INK, outline: "none" }} />
                  <input value={formContacto.telefono} onChange={(e) => setFormContacto({ ...formContacto, telefono: e.target.value })} placeholder="Teléfono" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${C.LINE}`, fontSize: 13, marginBottom: 8, boxSizing: "border-box", background: C.PAPER, color: C.INK, outline: "none" }} />
                  <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                    {[{ v: "médico", l: "🩺 Médico" }, { v: "familia", l: "👨‍👩‍👧 Familia" }, { v: "centro", l: "🏥 Centro" }].map((t) => (
                      <button key={t.v} onClick={() => setFormContacto({ ...formContacto, tipo: t.v })} className="btn-press-soft" style={{ flex: 1, padding: 8, borderRadius: 10, border: formContacto.tipo === t.v ? `2px solid ${C.TEAL}` : `1px solid ${C.LINE}`, background: C.PAPER, color: C.INK, fontWeight: 700, fontSize: 11, cursor: "pointer", transition: "all 0.15s ease" }}>{t.l}</button>
                    ))}
                  </div>
                  <button onClick={agregarContacto} disabled={!formContacto.nombre.trim() || !formContacto.telefono.trim()} className="btn-press" style={{ width: "100%", padding: 12, borderRadius: 12, border: "none", background: (formContacto.nombre.trim() && formContacto.telefono.trim()) ? C.TEAL : (oscuro ? "#2A3A52" : "#E0E4EB"), color: "#fff", fontWeight: 700, cursor: "pointer" }}>Agregar</button>
                </div>
              </>
            )}

            {cuidadorTab === "avisos" && (
              <>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12 }}>Avisos enviados</div>
                {smsLog.length === 0 ? (
                  <div style={{ background: oscuro ? "#1B3A2A" : "#E8F5E9", border: `1px solid ${oscuro ? "#2F5A3A" : "#A5D6A7"}`, borderRadius: 16, padding: 40, textAlign: "center" }}>
                    <div style={{ width: 64, height: 64, borderRadius: 999, background: C.GREEN + "15", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                      <Check size={32} color={C.GREEN} strokeWidth={2.4} />
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.GREEN, marginBottom: 4 }}>Todo va bien</div>
                    <div style={{ fontSize: 13, color: C.MUTED }}>Sin avisos por ahora. Solo te avisamos si hay un problema.</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[...smsLog].reverse().map((s, i) => (
                      <div key={i} className="modal-scale" style={{ background: C.PAPER, borderRadius: 14, padding: 14, borderLeft: `4px solid ${s.tipo === "alerta" ? C.CORAL : C.TEAL}`, boxShadow: C.SHADOW }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.MUTED, marginBottom: 6 }}><span>📩 CuidaMed</span><span>{s.hora}</span></div>
                        <div style={{ fontSize: 13, lineHeight: 1.5 }}>{s.texto}</div>
                      </div>
                    ))}
                    <button onClick={() => setSmsLog([])} className="btn-press-soft" style={{ marginTop: 8, width: "100%", padding: 12, borderRadius: 12, border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.MUTED, fontWeight: 700, cursor: "pointer" }}>Limpiar historial</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <MenuLateral C={C} abierto={showMenuLateral} onCerrar={() => setShowMenuLateral(false)} tabActual={cuidadorTab} setTabActual={setCuidadorTab} avisosNuevos={smsLog.length} oscuro={oscuro} cuidadorNombre={nombreCuidadorInput || familia?.cuidadores?.[0] || "Cuidador"} elderName={elderName} onCompartir={() => setShowCompartir(true)} onModoOscuro={() => { actualizarSettings({ darkMode: !oscuro }); registrarEvento(codigo, "toggle_dark_mode", !oscuro ? "activado" : "desactivado", { cuidador: nombreCuidadorInput }); }} onAyuda={() => setShowComoFunciona(true)} onAcercaDe={() => setShowAcercaDe(true)} onPolitica={() => setShowPolitica(true)} onPremium={() => setShowPremium(true)} onAjustes={() => setShowAjustes(true)} />

        {showComoFunciona && <ComoFunciona C={C} onCerrar={() => setShowComoFunciona(false)} />}
        {showOnboardingPremium && <OnboardingPremium C={C} onCerrar={() => { setShowOnboardingPremium(false); actualizar((prev) => ({ ...prev, settings: { ...prev.settings, onboardingPremiumVisto: true } })); }} />}
        {showAcercaDe && <AcercaDe C={C} onCerrar={() => setShowAcercaDe(false)} />}
        {showPolitica && <PoliticaPrivacidad C={C} onCerrar={() => setShowPolitica(false)} />}
        {showAdmin && <PanelAdmin C={C} familias={familiasAdmin} onCerrar={() => setShowAdmin(false)} onAbrirDatos={() => { setShowAdmin(false); setShowDatos(true); }} onAbrirEventos={() => { setShowAdmin(false); setShowEventos(true); }} />}
        {showDatos && <DatosAdministrativos C={C} onCerrar={() => setShowDatos(false)} onReset={() => { try { localStorage.removeItem("datos_admin_global"); } catch (e) {} }} />}
        {showEventos && <VerEventos C={C} onCerrar={() => setShowEventos(false)} />}
        {showCarroCompleto && <CarroCompleto C={C} meds={meds} onCerrar={() => setShowCarroCompleto(false)} onElegirFarmacia={abrirFarmaciaCarro} />}

        {showTutorial && <TutorialInteractivo pasos={PASOS_TUTORIAL} onCerrar={() => { setShowTutorial(false); actualizar((prev) => ({ ...prev, settings: { ...prev.settings, tutorialVisto: true } })); registrarEvento(codigo, "tutorial_completado", "Tutorial finalizado", { cuidador: nombreCuidadorInput }); }} C={C} />}

        {showContactos && (
          <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 35 }}>
            <div className="modal-scale" style={{ width: "100%", maxWidth: 360, background: C.CREAM, borderRadius: 24, padding: 24, margin: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 18, display: "flex", alignItems: "center", gap: 8 }}><Phone size={18} color={C.CORAL} /> Emergencia</div>
                <button onClick={() => setShowContactos(false)} className="btn-press-soft" style={{ border: "none", background: C.LINE, borderRadius: 999, width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={15} color={C.INK} /></button>
              </div>
              {contactos.length === 0 ? (<div style={{ textAlign: "center", fontSize: 13, color: C.MUTED, padding: 20 }}>Aún no hay contactos cargados.</div>) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {contactos.map((c) => (
                    <a key={c.id} href={`tel:${c.telefono}`} className="btn-press-soft" style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 14, textDecoration: "none", color: C.INK, boxShadow: C.SHADOW }}>
                      <div style={{ width: 40, height: 40, borderRadius: 999, background: C.CORAL + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{c.tipo === "médico" ? "🩺" : c.tipo === "familia" ? "👨‍👩‍👧" : "🏥"}</div>
                      <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 15 }}>{c.nombre}</div><div style={{ fontSize: 13, color: C.MUTED }}>{c.telefono}</div></div>
                      <Phone size={18} color={C.TEAL} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {showNotas && (
          <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 34 }}>
            <div className="modal-scale" style={{ width: "100%", maxWidth: 360, background: C.CREAM, borderRadius: 20, padding: 24, margin: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Notas de {showNotas.name}</div>
                <button onClick={() => setShowNotas(null)} className="btn-press-soft" style={{ border: "none", background: C.LINE, borderRadius: 999, width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={15} color={C.INK} /></button>
              </div>
              <textarea defaultValue={showNotas.notas || ""} onChange={(e) => setShowNotas({ ...showNotas, _n: e.target.value })} placeholder="Ej. No tomarlo con lácteos" rows={4} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.LINE}`, fontSize: 14, marginBottom: 14, boxSizing: "border-box", background: C.PAPER, color: C.INK, fontFamily: "inherit", resize: "vertical", outline: "none" }} />
              <button onClick={() => guardarNotas(showNotas.id, showNotas._n !== undefined ? showNotas._n : showNotas.notas)} className="btn-press" style={{ width: "100%", padding: 12, borderRadius: 12, border: "none", background: C.TEAL, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Guardar nota</button>
            </div>
          </div>
        )}

        {showCompartir && (
          <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 32 }}>
            <div className="modal-slide" style={{ width: "100%", maxWidth: 420, background: C.CREAM, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, boxShadow: "0 -8px 30px rgba(0,0,0,0.2)" }}>
              <div style={{ width: 40, height: 4, background: C.LINE, borderRadius: 999, margin: "0 auto 16px" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>Compartir por WhatsApp</div>
                <button onClick={() => setShowCompartir(false)} className="btn-press-soft" style={{ border: "none", background: C.LINE, borderRadius: 999, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} color={C.INK} /></button>
              </div>
              <button onClick={() => compartirWhatsApp("resumen")} className="btn-press-soft" style={{ width: "100%", padding: 14, borderRadius: 12, border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.INK, fontWeight: 700, fontSize: 14, cursor: "pointer", marginBottom: 10, textAlign: "left", display: "flex", alignItems: "center", gap: 12, boxShadow: C.SHADOW }}>
                <FileText size={18} color={C.TEAL} /> Resumen del día
              </button>
              <button onClick={() => compartirWhatsApp("historial")} className="btn-press-soft" style={{ width: "100%", padding: 14, borderRadius: 12, border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.INK, fontWeight: 700, fontSize: 14, cursor: "pointer", marginBottom: 10, textAlign: "left", display: "flex", alignItems: "center", gap: 12, boxShadow: C.SHADOW }}>
                <Calendar size={18} color={C.TEAL} /> Historial últimos 7 días
              </button>
              <button onClick={() => compartirWhatsApp("meds")} className="btn-press-soft" style={{ width: "100%", padding: 14, borderRadius: 12, border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.INK, fontWeight: 700, fontSize: 14, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12, boxShadow: C.SHADOW }}>
                <PackageOpen size={18} color={C.TEAL} /> Lista completa de medicamentos
              </button>
            </div>
          </div>
        )}

        {showAddPersona && (
          <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 33 }}>
            <div className="modal-scale" style={{ width: "100%", maxWidth: 360, background: C.CREAM, borderRadius: 20, padding: 24, margin: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Agregar persona</div>
              <input value={nombrePersonaNueva} onChange={(e) => setNombrePersonaNueva(e.target.value)} placeholder="Ej. Pedro González" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.LINE}`, fontSize: 14, marginBottom: 10, boxSizing: "border-box", background: C.PAPER, color: C.INK, outline: "none" }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, marginBottom: 6, letterSpacing: 0.3, display: "flex", alignItems: "center", gap: 6 }}><Cake size={12} /> EDAD (OPCIONAL)</div>
              <input type="number" min="0" max="120" value={edadPersonaNueva} onChange={(e) => setEdadPersonaNueva(e.target.value)} placeholder="Ej. 82" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.LINE}`, fontSize: 14, marginBottom: 14, boxSizing: "border-box", background: C.PAPER, color: C.INK, outline: "none" }} />
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { setShowAddPersona(false); setNombrePersonaNueva(""); setEdadPersonaNueva(""); }} className="btn-press-soft" style={{ flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.MUTED, fontWeight: 700, cursor: "pointer" }}>Cancelar</button>
                <button onClick={agregarPersona} disabled={!nombrePersonaNueva.trim()} className="btn-press" style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: nombrePersonaNueva.trim() ? C.TEAL : (oscuro ? "#2A3A52" : "#E0E4EB"), color: "#fff", fontWeight: 700, cursor: nombrePersonaNueva.trim() ? "pointer" : "not-allowed" }}>Agregar</button>
              </div>
            </div>
          </div>
        )}

        {diaDetalle && (() => {
          const adherencia = diaDetalle.esperadas > 0 ? Math.round((diaDetalle.confirmadas / diaDetalle.esperadas) * 100) : 0;
          const colorAdh = adherencia >= 90 ? C.GREEN : adherencia >= 70 ? C.AMBER : C.CORAL;
          return (
            <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 34 }}>
              <div className="modal-scale" style={{ width: "100%", maxWidth: 360, background: C.CREAM, borderRadius: 20, padding: 24, margin: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 17 }}>{diaDetalle.dia} de {MESES[mes]}</div>
                  <button onClick={() => setDiaDetalle(null)} className="btn-press-soft" style={{ border: "none", background: C.LINE, borderRadius: 999, width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={15} color={C.INK} /></button>
                </div>
                <div style={{ background: C.PAPER, borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: C.SHADOW, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: C.MUTED, fontWeight: 700, letterSpacing: 0.5, marginBottom: 6 }}>ADHERENCIA DEL DÍA</div>
                  <div style={{ fontSize: 38, fontWeight: 800, color: colorAdh, lineHeight: 1 }}>{fmtN(adherencia)}%</div>
                  <div style={{ fontSize: 12.5, color: C.MUTED, marginTop: 6 }}>{fmtN(diaDetalle.confirmadas)} de {fmtN(diaDetalle.esperadas)} tomas confirmadas</div>
                  {diaDetalle.olvidos > 0 && <div style={{ fontSize: 11.5, color: C.CORAL, marginTop: 4, fontWeight: 600 }}>{fmtN(diaDetalle.olvidos)} olvido{diaDetalle.olvidos !== 1 ? "s" : ""}</div>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 250, overflowY: "auto" }}>
                  {meds.flatMap((m) => m.times.map((t) => {
                    const k = occKey(m.id, t);
                    return (<div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", background: C.PAPER, borderRadius: 10, fontSize: 12 }}><span>{m.name} · {fmtHoraConAmPm(t)}</span><span style={{ color: diaDetalle.diaData[k] ? C.GREEN : C.CORAL, fontWeight: 700 }}>{diaDetalle.diaData[k] ? "✓" : "✗"}</span></div>);
                  }))}
                </div>
                <button onClick={() => setDiaDetalle(null)} className="btn-press" style={{ marginTop: 16, width: "100%", padding: 12, borderRadius: 12, border: "none", background: C.TEAL, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Cerrar</button>
              </div>
            </div>
          );
        })()}

        {showLimite && (
          <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 32 }}>
            <div className="modal-scale" style={{ width: "100%", maxWidth: 360, background: C.CREAM, borderRadius: 24, padding: 26, margin: 20, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
              <div style={{ width: 64, height: 64, borderRadius: 999, background: C.GOLD + "15", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <Lock size={30} color={C.GOLD} strokeWidth={2.2} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Llegaste al límite</div>
              <div style={{ fontSize: 13, color: C.MUTED, marginBottom: 18, lineHeight: 1.6 }}>{showLimite === "meds" ? "En Estándar puedes tener hasta 5 medicamentos." : "En Estándar puedes cuidar a 1 persona."} Con Premium, sin límites.</div>
              <button onClick={() => { setShowLimite(null); setShowPremium(true); }} className="btn-press" style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${C.GOLD}, #E65100)`, color: "#fff", fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>⭐ Ver Premium</button>
              <button onClick={() => setShowLimite(null)} className="btn-press-soft" style={{ width: "100%", padding: 12, borderRadius: 12, border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.MUTED, fontWeight: 700, cursor: "pointer" }}>Cerrar</button>
            </div>
          </div>
        )}

        {showPremium && (
          <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 33 }}>
            <div className="modal-slide" style={{ width: "100%", maxWidth: 420, background: C.CREAM, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 -8px 30px rgba(0,0,0,0.25)" }}>
              <div style={{ width: 40, height: 4, background: C.LINE, borderRadius: 999, margin: "0 auto 16px" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 20, display: "flex", alignItems: "center", gap: 8 }}><Crown size={22} color={C.GOLD} /> Hazte Premium</div>
                <button onClick={() => setShowPremium(false)} className="btn-press-soft" style={{ border: "none", background: C.LINE, borderRadius: 999, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} color={C.INK} /></button>
              </div>
              <div style={{ background: `linear-gradient(135deg, ${C.GOLD}, #E65100)`, borderRadius: 16, padding: 20, color: "#fff", marginBottom: 18, textAlign: "center", boxShadow: "0 8px 24px rgba(249,168,37,0.35)" }}>
                <div style={{ fontSize: 30, fontWeight: 800 }}>$3.990</div>
                <div style={{ fontSize: 12, opacity: 0.9 }}>al mes · o $29.990 al año</div>
              </div>
              <div style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 14, padding: 14, marginBottom: 16, fontSize: 12.5, lineHeight: 1.8, boxShadow: C.SHADOW }}>
                <div>✓ Medicamentos ilimitados</div>
                <div>✓ Hasta 3 personas mayores</div>
                <div>✓ Reconteo por foto</div>
                <div>✓ Reporte PDF médico</div>
                <div>✓ Detección de cambio de patrón</div>
                <div>✓ Stock con predicción real</div>
                <div>✓ Funciona sin conexión</div>
              </div>
              <button onClick={activarPremium} className="btn-press" style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${C.GOLD}, #E65100)`, color: "#fff", fontWeight: 700, cursor: "pointer", marginBottom: 12 }}>⭐ Activar Premium (piloto)</button>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, marginBottom: 6, letterSpacing: 0.3 }}>¿TIENES UN CÓDIGO?</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={codigoPremium} onChange={(e) => setCodigoPremium(e.target.value)} placeholder="Ej. FAMILIA1" style={{ flex: 1, padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.LINE}`, fontSize: 13, boxSizing: "border-box", background: C.PAPER, color: C.INK, outline: "none" }} />
                <button onClick={canjearCodigo} className="btn-press" style={{ padding: "12px 18px", borderRadius: 12, border: "none", background: C.TEAL, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Canjear</button>
              </div>
            </div>
          </div>
        )}

        {showAdd && (
          <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.55)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 25 }}>
            <div className="modal-slide" style={{ width: "100%", maxWidth: 420, background: C.CREAM, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 -8px 30px rgba(0,0,0,0.25)" }}>
              <div style={{ width: 40, height: 4, background: C.LINE, borderRadius: 999, margin: "0 auto 16px" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><div style={{ fontWeight: 700, fontSize: 17 }}>Nuevo medicamento</div><button onClick={() => setShowAdd(false)} className="btn-press-soft" style={{ border: "none", background: C.LINE, borderRadius: 999, width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} color={C.INK} /></button></div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, marginBottom: 6, letterSpacing: 0.3 }}>NOMBRE</div>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, receta: null, criticidad: null }))} placeholder="Ej. Losartán" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.LINE}`, fontSize: 14, marginBottom: 8, boxSizing: "border-box", background: C.PAPER, color: C.INK, outline: "none" }} />
              {form.name.trim().length > 2 && detectadoCrit === "vital" && (<div style={{ background: "#FFEBEE", border: `1px solid #FFCDD2`, borderRadius: 12, padding: "10px 12px", fontSize: 12, color: C.CORAL, marginBottom: 10, fontWeight: 600 }}>🔴 Medicamento vital. Aviso fijo a los 15 min.</div>)}
              <div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, marginBottom: 8, letterSpacing: 0.3 }}>NIVEL DE CRITICIDAD</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                {[{ v: "vital", l: "🔴 Vital", c: C.CORAL }, { v: "importante", l: "🟡 Importante", c: C.AMBER }, { v: "normal", l: "🟢 Normal", c: C.GREEN }].map((op) => (
                  <button key={op.v} onClick={() => setForm((f) => ({ ...f, criticidad: op.v }))} className="btn-press-soft" style={{ flex: 1, padding: 10, borderRadius: 10, border: (form.criticidad || detectadoCrit) === op.v ? `2px solid ${op.c}` : `1.5px solid ${C.LINE}`, background: C.PAPER, color: C.INK, fontWeight: 700, fontSize: 11, cursor: "pointer", transition: "all 0.15s ease" }}>{op.l}</button>
                ))}
              </div>
              {(form.criticidad || detectadoCrit) === "vital" ? (
                <div style={{ background: oscuro ? "#1E2F48" : "#F0F4F8", border: `1px solid ${C.LINE}`, borderRadius: 12, padding: "10px 12px", fontSize: 12, color: C.MUTED, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}><Lock size={14} /> Aviso fijo a los 15 min.</div>
              ) : (
                <>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, marginBottom: 8, letterSpacing: 0.3 }}>¿CUÁNDO TE AVISAMOS?</div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                    {[{ v: "inmediato", l: `A los ${UMBRAL_MIN[(form.criticidad || detectadoCrit) || "normal"]} min` }, { v: "final_dia", l: "Al final del día" }, { v: "nunca", l: "Nunca" }].map((op) => (
                      <button key={op.v} onClick={() => setForm((f) => ({ ...f, modoAviso: op.v }))} className="btn-press-soft" style={{ flex: 1, padding: 10, borderRadius: 10, border: (form.modoAviso || (detectadoCrit === "importante" ? "inmediato" : "final_dia")) === op.v ? `2px solid ${C.TEAL}` : `1.5px solid ${C.LINE}`, background: C.PAPER, color: C.INK, fontWeight: 700, fontSize: 10.5, cursor: "pointer", transition: "all 0.15s ease" }}>{op.l}</button>
                    ))}
                  </div>
                </>
              )}
              <div style={{ background: oscuro ? "#1E2F48" : "#F0F4F8", border: `1px solid ${C.LINE}`, borderRadius: 12, padding: 12, marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <Clock size={14} color={C.TEAL} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.INK }}>VENTANA DE RECORDATORIO</span>
                </div>
                <div style={{ fontSize: 11, color: C.MUTED, marginBottom: 8, lineHeight: 1.4 }}>Minutos de tolerancia después de la hora. Si la toma dentro de ese rango, no se considera olvido.</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[{ v: 0, l: "Sin ventana" }, { v: 30, l: "30 min" }, { v: 60, l: "1 hora" }, { v: 120, l: "2 horas" }].map((op) => (
                    <button key={op.v} onClick={() => setForm((f) => ({ ...f, ventanaMin: op.v }))} className="btn-press-soft" style={{ flex: 1, padding: 8, borderRadius: 10, border: (form.ventanaMin || 0) === op.v ? `2px solid ${C.TEAL}` : `1.5px solid ${C.LINE}`, background: C.PAPER, color: C.INK, fontWeight: 700, fontSize: 10.5, cursor: "pointer", transition: "all 0.15s ease" }}>{op.l}</button>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, marginBottom: 6, letterSpacing: 0.3 }}>INDICACIÓN</div>
              <input value={form.dose} onChange={(e) => setForm((f) => ({ ...f, dose: e.target.value }))} placeholder="Ej. 1 pastilla" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.LINE}`, fontSize: 14, marginBottom: 14, boxSizing: "border-box", background: C.PAPER, color: C.INK, outline: "none" }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, marginBottom: 6, letterSpacing: 0.3 }}>NOTAS (OPCIONAL)</div>
              <textarea value={form.notas} onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))} placeholder="Ej. No tomarlo con lácteos" rows={2} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.LINE}`, fontSize: 13, marginBottom: 14, boxSizing: "border-box", background: C.PAPER, color: C.INK, fontFamily: "inherit", resize: "none", outline: "none" }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, marginBottom: 6, letterSpacing: 0.3 }}>RECETA VENCE (OPCIONAL)</div>
              <input type="date" value={form.recetaVence} onChange={(e) => setForm((f) => ({ ...f, recetaVence: e.target.value }))} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.LINE}`, fontSize: 14, marginBottom: 14, boxSizing: "border-box", background: C.PAPER, color: C.INK, outline: "none" }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, marginBottom: 6, letterSpacing: 0.3 }}>HORARIOS</div>
              {form.times.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <CampoHora C={C} valor={t} oscuro={oscuro} onCambio={(nuevo) => setForm((f) => ({ ...f, times: f.times.map((x, xi) => (xi === i ? nuevo : x)) }))} />
                  {form.times.length > 1 && (<button onClick={() => setForm((f) => ({ ...f, times: f.times.filter((_, xi) => xi !== i) }))} className="btn-press-soft" style={{ width: 42, borderRadius: 12, border: `1.5px solid ${C.LINE}`, background: C.PAPER, color: C.CORAL, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={15} /></button>)}
                </div>
              ))}
              <button onClick={() => setForm((f) => ({ ...f, times: [...f.times, "12:00"] }))} className="btn-press-soft" style={{ fontSize: 12, fontWeight: 700, color: C.TEAL, background: oscuro ? "#1E3A5F" : "#E3F2FD", border: "none", padding: "8px 14px", borderRadius: 999, cursor: "pointer", marginBottom: 14 }}>+ Agregar horario</button>
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, marginBottom: 6, letterSpacing: 0.3 }}>DOSIS/TOMA</div><input type="number" step="0.5" min="0.5" value={form.doseAmount} onChange={(e) => setForm((f) => ({ ...f, doseAmount: Number(e.target.value) || 1 }))} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.LINE}`, fontSize: 14, boxSizing: "border-box", background: C.PAPER, color: C.INK, outline: "none" }} /></div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, marginBottom: 6, letterSpacing: 0.3 }}>STOCK</div><input type="number" min="0" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) || 0 }))} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.LINE}`, fontSize: 14, boxSizing: "border-box", background: C.PAPER, color: C.INK, outline: "none" }} /></div>
              </div>
              <button onClick={agregarMed} disabled={!form.name.trim()} className="btn-press" style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", fontWeight: 700, fontSize: 15, background: form.name.trim() ? C.TEAL : (oscuro ? "#2A3A52" : "#E0E4EB"), color: "#fff", cursor: form.name.trim() ? "pointer" : "not-allowed" }}>Agregar</button>
            </div>
          </div>
        )}

        {restockTarget && (
          <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 26 }}>
            <div className="modal-scale" style={{ width: "100%", maxWidth: 340, background: C.CREAM, borderRadius: 20, padding: 24, textAlign: "center", margin: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Reponer {restockTarget.name}</div>
              <input type="number" min="1" defaultValue={30} onChange={(e) => setRestockTarget({ ...restockTarget, _c: Number(e.target.value) })} style={{ width: "100%", marginTop: 14, padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.LINE}`, fontSize: 16, textAlign: "center", boxSizing: "border-box", background: C.PAPER, color: C.INK, outline: "none" }} />
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button onClick={() => setRestockTarget(null)} className="btn-press-soft" style={{ flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.MUTED, fontWeight: 700, cursor: "pointer" }}>Cancelar</button>
                <button onClick={() => reponer(restockTarget._c || 30)} className="btn-press" style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: C.TEAL, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Confirmar</button>
              </div>
            </div>
          </div>
        )}

        {reconteoTarget && (
          <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 29 }}>
            <div className="modal-scale" style={{ width: "100%", maxWidth: 360, background: C.CREAM, borderRadius: 20, padding: 24, textAlign: "center", margin: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
              <div style={{ width: 56, height: 56, borderRadius: 999, background: C.GOLD + "15", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <Camera size={26} color={C.GOLD} strokeWidth={2.2} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Recontar {reconteoTarget.name}</div>
              <div style={{ fontSize: 12, color: C.MUTED, marginTop: 8, marginBottom: 14 }}>Función Premium. Simulación.</div>
              <input type="number" defaultValue={reconteoTarget.stock} onChange={(e) => setReconteoTarget({ ...reconteoTarget, _c: Number(e.target.value) })} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.LINE}`, fontSize: 20, textAlign: "center", boxSizing: "border-box", background: C.PAPER, color: C.INK, outline: "none" }} />
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button onClick={() => setReconteoTarget(null)} className="btn-press-soft" style={{ flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.MUTED, fontWeight: 700, cursor: "pointer" }}>Cancelar</button>
                <button onClick={() => aplicarReconteo(reconteoTarget.id, reconteoTarget._c || reconteoTarget.stock)} className="btn-press" style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: C.TEAL, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Aplicar</button>
              </div>
            </div>
          </div>
        )}

        {linkAbierto && (
          <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 30 }}>
            <div className="modal-scale" style={{ width: "100%", maxWidth: 340, background: C.CREAM, borderRadius: 20, padding: 24, margin: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
              <div style={{ width: 48, height: 48, borderRadius: 999, background: C.GOLD + "15", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <Sparkles size={22} color={C.GOLD} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{linkAbierto.mensaje || (linkAbierto.farmacia ? `Abriría ${linkAbierto.farmacia}` : "Se abriría en el navegador")}</div>
              {linkAbierto.receta === "con_receta" && (<div style={{ fontSize: 11, background: oscuro ? "#1E3A5F" : "#E3F2FD", color: C.TEAL, padding: "10px 12px", borderRadius: 10, marginBottom: 10, lineHeight: 1.5 }}>Sube tu receta en el sitio de la farmacia.</div>)}
              <div style={{ fontSize: 11, color: C.MUTED, wordBreak: "break-all", background: C.PAPER, padding: 10, borderRadius: 10, border: `1px solid ${C.LINE}` }}>{linkAbierto.url}</div>
              <button onClick={() => setLinkAbierto(null)} className="btn-press" style={{ marginTop: 16, width: "100%", padding: 12, borderRadius: 12, border: "none", background: C.TEAL, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Cerrar</button>
            </div>
          </div>
        )}

        {showAjustes && (
          <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.55)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 27 }}>
            <div className="modal-slide" style={{ width: "100%", maxWidth: 420, background: C.CREAM, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 -8px 30px rgba(0,0,0,0.25)" }}>
              <div style={{ width: 40, height: 4, background: C.LINE, borderRadius: 999, margin: "0 auto 16px" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 18 * scale }}>Ajustes</div>
                <button onClick={() => setShowAjustes(false)} className="btn-press-soft" style={{ border: "none", background: C.LINE, borderRadius: 999, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} color={C.INK} /></button>
              </div>
              <button onClick={() => { setShowAjustes(false); setShowTutorial(true); }} className="btn-press-soft" style={{ width: "100%", padding: "14px 16px", borderRadius: 16, border: `1px solid ${C.TEAL}`, background: C.TEAL + "10", color: C.TEAL, fontWeight: 700, fontSize: 14, cursor: "pointer", marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <HelpCircle size={18} /> Ver tutorial de nuevo
              </button>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.MUTED, marginBottom: 10, letterSpacing: 0.3 }}>TAMAÑO DE LETRA</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
                {[{ v: "normal", l: "Normal" }, { v: "grande", l: "Grande" }, { v: "muy_grande", l: "Muy grande" }].map((op) => (
                  <button key={op.v} onClick={() => { actualizarSettings({ fontSize: op.v }); registrarEvento(codigo, "ajuste_fontSize", op.v, { cuidador: nombreCuidadorInput }); }} className="btn-press-soft" style={{ flex: 1, padding: "12px 8px", borderRadius: 14, border: settings.fontSize === op.v ? `2px solid ${C.TEAL}` : `1.5px solid ${C.LINE}`, background: C.PAPER, color: settings.fontSize === op.v ? C.TEAL : C.INK, fontWeight: 700, cursor: "pointer", transition: "all 0.15s ease" }}>{op.l}</button>
                ))}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.MUTED, marginBottom: 10, letterSpacing: 0.3 }}>ALERTAS DEL ADULTO MAYOR</div>
              <button onClick={() => { actualizarSettings({ sonidoActivo: settings.sonidoActivo === false ? true : false }); registrarEvento(codigo, "toggle_sonido", settings.sonidoActivo === false ? "activado" : "desactivado", { cuidador: nombreCuidadorInput }); }} className="btn-press-soft" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 16, border: `1px solid ${C.LINE}`, background: C.PAPER, cursor: "pointer", marginBottom: 10, boxShadow: C.SHADOW }}>
                <span style={{ fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}>{settings.sonidoActivo !== false ? <Volume2 size={18} color={C.TEAL} /> : <VolumeX size={18} color={C.MUTED} />} Alerta con sonido</span>
                <span style={{ width: 46, height: 26, borderRadius: 999, background: settings.sonidoActivo !== false ? C.TEAL : C.LINE, position: "relative", transition: "all 0.2s ease" }}><span style={{ position: "absolute", top: 3, left: settings.sonidoActivo !== false ? 23 : 3, width: 20, height: 20, borderRadius: 999, background: "#fff", transition: "left 0.2s ease" }} /></span>
              </button>
              <button onClick={() => { actualizarSettings({ vibracionActiva: settings.vibracionActiva === false ? true : false }); registrarEvento(codigo, "toggle_vibracion", settings.vibracionActiva === false ? "activado" : "desactivado", { cuidador: nombreCuidadorInput }); }} className="btn-press-soft" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 16, border: `1px solid ${C.LINE}`, background: C.PAPER, cursor: "pointer", marginBottom: 18, boxShadow: C.SHADOW }}>
                <span style={{ fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}><Vibrate size={18} color={settings.vibracionActiva !== false ? C.TEAL : C.MUTED} /> Alerta con vibración</span>
                <span style={{ width: 46, height: 26, borderRadius: 999, background: settings.vibracionActiva !== false ? C.TEAL : C.LINE, position: "relative", transition: "all 0.2s ease" }}><span style={{ position: "absolute", top: 3, left: settings.vibracionActiva !== false ? 23 : 3, width: 20, height: 20, borderRadius: 999, background: "#fff", transition: "left 0.2s ease" }} /></span>
              </button>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.MUTED, marginBottom: 10, letterSpacing: 0.3 }}>PREFERENCIAS VISUALES</div>
              <button onClick={() => { actualizarSettings({ darkMode: !oscuro }); registrarEvento(codigo, "toggle_dark_mode", !oscuro ? "activado" : "desactivado", { cuidador: nombreCuidadorInput }); }} className="btn-press-soft" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 16, border: `1px solid ${C.LINE}`, background: C.PAPER, cursor: "pointer", marginBottom: 10, boxShadow: C.SHADOW }}>
                <span style={{ fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}>{oscuro ? <Sun size={18} color={C.AMBER} /> : <Moon size={18} color={C.MUTED} />} Modo oscuro</span>
                <span style={{ width: 46, height: 26, borderRadius: 999, background: oscuro ? C.TEAL : C.LINE, position: "relative", transition: "all 0.2s ease" }}><span style={{ position: "absolute", top: 3, left: oscuro ? 23 : 3, width: 20, height: 20, borderRadius: 999, background: "#fff", transition: "left 0.2s ease" }} /></span>
              </button>
              <button onClick={() => { actualizarSettings({ daltonico: !settings.daltonico }); registrarEvento(codigo, "toggle_daltonico", !settings.daltonico ? "activado" : "desactivado", { cuidador: nombreCuidadorInput }); }} className="btn-press-soft" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 16, border: `1px solid ${C.LINE}`, background: C.PAPER, cursor: "pointer", marginBottom: 20, boxShadow: C.SHADOW }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Modo daltonismo</span>
                <span style={{ width: 46, height: 26, borderRadius: 999, background: settings.daltonico ? C.TEAL : C.LINE, position: "relative", transition: "all 0.2s ease" }}><span style={{ position: "absolute", top: 3, left: settings.daltonico ? 23 : 3, width: 20, height: 20, borderRadius: 999, background: "#fff", transition: "left 0.2s ease" }} /></span>
              </button>
              <button onClick={() => setShowAjustes(false)} className="btn-press" style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: C.TEAL, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Listo</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
