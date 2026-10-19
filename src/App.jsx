import React, { useState, useEffect, useCallback, useRef } from "react";
import { Clock, Check, AlertTriangle, Plus, X, ArrowRight, User, Users, Heart, PackageOpen, RotateCcw, KeyRound, Loader2, Copy, Truck, Store, ShoppingCart, ExternalLink, Sparkles, ShieldCheck, MessageSquare, Camera, Calendar, TrendingDown, Award, MapPin, Lock, Crown, Moon, Sun, Phone, FileText, Share2, StickyNote, UserPlus, ChevronDown, Info, ScrollText, BarChart3, Trash2, Menu, Pill, Bell, HelpCircle, Settings, Flame, Tag, Download, Activity, WifiOff, Wifi, Volume2, VolumeX, Vibrate, BellRing, Cake, RefreshCw, History, ClipboardCheck, Send, Eye, Edit } from "lucide-react";

const STORAGE_PREFIX = "familia_";
const EVENTOS_COLLECTION = "eventos";
const APP_VERSION = "2.2.7-estable";
const MINUTOS_SIN_CONEXION_ALERTA = 5;

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAGxIGYqifeb5qGlVTQaVVpmKjZ9E1__TU",
  authDomain: "contigo-siempre-79017.firebaseapp.com",
  projectId: "contigo-siempre-79017",
  storageBucket: "contigo-siempre-79017.firebasestorage.app",
  messagingSenderId: "373374322978",
  appId: "1:373374322978:web:05fc428462d73d4f197d7b"
};

const VAPID_KEY = "BFPDPH02Oa44BflTPgU8Z7VbkqGL7rG3ZDLOAp9EKlkGYZWmoslFktvQtSl29HJR1gO4ESs2lBElRTEwWMAPwz0";

const CODIGO_ADMIN = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_ADMIN_CODE) || "ADMIN" + new Date().getFullYear();
const CODIGO_DATOS = "DATOS" + new Date().getFullYear();
const CODIGOS_PILOTO = ["FUNDADOR", "BETA01", "FAMILIA1", "FAMILIA2", "FAMILIA3", "PILOTO01", "PILOTO02", "PILOTO03"];

const PILL_COLORS = ["#E0654A", "#1F6E63", "#3A6EA5", "#D98F2B", "#8A5FA8"];
const PILL_COLORS_CB = ["#D55E00", "#0072B2", "#009E73", "#E69F00", "#CC79A7"];
const PILL_SHAPES = ["●", "◆", "▲", "■", "⬤"];
const FONT_SCALE = { normal: 1, grande: 1.2, muy_grande: 1.45 };
const UMBRAL_MIN = { vital: 2, importante: 10, normal: 30 };
const LIMITES_ESTANDAR = { maxMeds: 4, maxElderly: 1, maxCuidadores: 1 };

const MEDS_CON_RECETA = ["losartan","losartán","metformina","enalapril","amlodipino","atorvastatina","simvastatina","carvedilol","furosemida","hidroclorotiazida","omeprazol","clonazepam","alprazolam","sertralina","fluoxetina","levotiroxina","warfarina","clopidogrel","insulina","gabapentina","pregabalina","tramadol","morfina","fentanilo","metotrexato","prednisona","salbutamol","budesonida","montelukast","alopurinol","colchicina","risperidona","quetiapina","olanzapina","valproato","carbamazepina","fenitoina","levetiracetam","donepezilo","memantina","rivastigmina"];
const MEDS_SIN_RECETA = ["paracetamol","ibuprofeno","aspirina","naproxeno","diclofenaco","loratadina","cetirizina","clorfenamina","vitamina","multivitaminico","calcio","hierro","omega","magnesio","zinc","complejo b","sales de rehidratacion","suero","carbon activado"];
const MEDS_VITALES = ["insulina","warfarina","clopidogrel","digoxina","amiodarona","fenitoina","fenitoína","carbamazepina","valproato","levetiracetam","metotrexato","ciclosporina","tacrolimus","rivaroxaban","rivaroxabán","apixaban","apixabán","dabigatran","dabigatrán"];

const LIGHT = { INK: "#1A237E", TEAL: "#1976D2", CORAL: "#D32F2F", CREAM: "#FFFFFF", PAPER: "#FFFFFF", LINE: "#E0E4EB", MUTED: "#6B7A8F", AMBER: "#F9A825", GREEN: "#43A047", GOLD: "#F9A825", BG: "#F0F4F8", SHADOW: "0 2px 8px rgba(25,118,210,0.08)" };
const DARK = { INK: "#F5F7FA", TEAL: "#64B5F6", CORAL: "#EF5350", CREAM: "#0F1B2E", PAPER: "#16243A", LINE: "#2A3A52", MUTED: "#90A4BE", AMBER: "#FFB74D", GREEN: "#66BB6A", GOLD: "#FFB74D", BG: "#0A1626", SHADOW: "0 2px 8px rgba(0,0,0,0.3)" };

const CSS_GLOBAL = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  @keyframes pulseFlame { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
  @keyframes pulseOffline { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
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
  ::-webkit-scrollbar { width: 0; height: 0; }
  * { -webkit-tap-highlight-color: transparent; font-family: 'Inter', 'Segoe UI', sans-serif !important; }
`;

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
        db.enablePersistence({ synchronizeTabs: true }).catch((err) => {});
      }
    } catch (e) {}
    dbCallbacks.forEach((cb) => cb(db));
    dbCallbacks = [];
  });
}

const storage = {
  async get(k) {
    try { if (db) { const doc = await db.collection("familias").doc(k).get(); if (doc.exists) return { value: JSON.stringify(doc.data()) }; return null; } const v = localStorage.getItem(k); return v ? { value: v } : null; }
    catch (e) { const v = localStorage.getItem(k); return v ? { value: v } : null; }
  },
  async set(k, v) {
    try { if (db) { const data = JSON.parse(v); await db.collection("familias").doc(k).set(data); localStorage.setItem(k, v); return; } localStorage.setItem(k, v); }
    catch (e) { localStorage.setItem(k, v); }
  },
  async listAll() {
    try { if (db) { const snapshot = await db.collection("familias").get(); const out = []; snapshot.forEach((doc) => { out.push({ codigo: doc.id, data: doc.data() }); }); return out; } const out = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(STORAGE_PREFIX)) { const v = localStorage.getItem(k); try { out.push({ codigo: k.replace(STORAGE_PREFIX, ""), data: JSON.parse(v) }); } catch (e) {} } } return out; }
    catch (e) { return []; }
  },
};

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function dateKeyOffset(days) {
  const x = new Date();
  x.setDate(x.getDate() - days);
  return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`;
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
function fmt(mins) { const h = Math.floor(mins / 60) % 24; const m = mins % 60; const sufijo = h >= 12 ? "p. m." : "a. m."; const h12 = h % 12 === 0 ? 12 : h % 12; return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${sufijo}`; }
function fmtN(n) { if (n === null || n === undefined) return ""; if (Number.isInteger(n)) return String(n); return String(parseFloat(n.toFixed(2))); }
function occKey(id, t) { return `${id}__${t}`; }
function genCode() { return String(Math.floor(100000 + Math.random() * 900000)); }
function smsTime() { const d = new Date(); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; }
function diasHastaVencimiento(fechaStr) { if (!fechaStr) return null; const v = new Date(fechaStr); const h = new Date(); return Math.floor((v - h) / (1000 * 60 * 60 * 24)); }
function minutosDesde(ts) { if (!ts) return null; return Math.floor((Date.now() - ts) / 60000); }

function normalizarTexto(txt) {
  return txt ? txt.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
}
function clasificarMedicamento(n) { if (!n) return null; const x = normalizarTexto(n); if (MEDS_CON_RECETA.map(normalizarTexto).some((m) => x.includes(m))) return "con_receta"; if (MEDS_SIN_RECETA.map(normalizarTexto).some((m) => x.includes(m))) return "sin_receta"; return null; }
function detectarCriticidad(n) { if (!n) return "normal"; const x = normalizarTexto(n); if (MEDS_VITALES.map(normalizarTexto).some((m) => x.includes(m))) return "vital"; if (MEDS_CON_RECETA.map(normalizarTexto).some((m) => x.includes(m))) return "importante"; return "normal"; }
function dispColor(hex, daltonico) { const i = PILL_COLORS.indexOf(hex); return daltonico && i >= 0 ? PILL_COLORS_CB[i] : hex; }

function calcularRacha(meds, cbd) {
  if (!meds || meds.length === 0 || !cbd) return 0;
  const totalPorDia = meds.reduce((a, m) => a + (m.times?.length || 0), 0);
  if (totalPorDia === 0) return 0;
  let racha = 0;
  for (let i = 1; i <= 60; i++) { const key = dateKeyOffset(i); const dia = cbd[key]; if (!dia) break; const conf = Object.keys(dia).filter((k) => dia[k]).length; if (conf >= totalPorDia) racha++; else break; }
  return racha;
}

function diasRestantesReales(med) {
  if (!med || !med.times || med.times.length === 0) return null;
  const dosisPorToma = Number(med.doseAmount) || 1;
  const tomasAlDia = med.times.length;
  const consumoDiarioTotal = dosisPorToma * tomasAlDia;
  if (consumoDiarioTotal === 0) return null;
  const dias = med.stock / consumoDiarioTotal;
  return Number.isInteger(dias) ? dias : Math.round(dias * 10) / 10;
}

function semaforoRiesgo(med) {
  const d = diasRestantesReales(med);
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
  if (tipo === "resumen" || tipo === "medico") {
    let conf = 0, esp = 0, omitidas = [];
    for (let i = 0; i < 7; i++) {
      const k = dateKeyOffset(i); 
      const dia = confirmedByDate?.[k] || {};
      meds.forEach((m) => m.times.forEach((t) => { 
        esp++; 
        if (dia[occKey(m.id, t)]) conf++; 
        else if (i > 0) omitidas.push(`${new Date(k).getDate()}/${new Date(k).getMonth() + 1} (${fmtHoraConAmPm(t)} ${m.name})`);
      }));
    }
    let txt = `Resumen de adherencia - ${elderName}\n\nÚltimos 7 días: ${conf} de ${esp} tomas confirmadas (${esp > 0 ? Math.round(conf/esp*100) : 0}%)\n\nMedicamentos:\n`;
    meds.forEach(m => {
      const s = semaforoRiesgo(m);
      txt += `- ${m.name} — ${m.times.map(fmtHoraConAmPm).join(", ")} — quedan ${s.dias !== null ? fmtN(s.dias) + ' días' : '?'}\n`;
    });
    if (omitidas.length > 0) txt += `\nTomas omitidas (últimos 6 días):\n${omitidas.slice(0,5).join("\n")}${omitidas.length > 5 ? '\n...' : ''}\n`;
    txt += `\n— Enviado desde Contigo Siempre`;
    return txt;
  }
  if (tipo === "meds") {
    const lineas = meds.map((m) => `- ${m.name} — ${m.times.map(fmtHoraConAmPm).join(", ")} (${fmtN(m.stock)} unid.)`);
    return `Medicamentos de ${elderName}:\n\n${lineas.join("\n")}\n\nEnviado desde Contigo Siempre.`;
  }
  return "";
}

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
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.2 * volumen, now + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 1.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 1.6);
    });
  } catch (e) {}
}

function vibrarPatron() {
  try { if (navigator.vibrate) navigator.vibrate([400, 200, 400, 200, 400]); }
  catch (e) {}
}

function cargarMessaging() {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js";
    s.onload = () => resolve();
    s.onerror = (err) => reject(err);
    document.head.appendChild(s);
  });
}

async function obtenerTokenFCM() {
  return new Promise(async (resolve) => {
    try {
      const timeout = setTimeout(() => { resolve(null); }, 15000);
      if (!("serviceWorker" in navigator)) { clearTimeout(timeout); resolve(null); return; }
      try {
        await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        await navigator.serviceWorker.ready;
      } catch (e) {}
      await cargarMessaging();
      if (!window.firebase || !window.firebase.messaging) { clearTimeout(timeout); resolve(null); return; }
      const messaging = window.firebase.messaging();
      const permiso = await Notification.requestPermission();
      if (permiso !== "granted") { clearTimeout(timeout); resolve(null); return; }
      const registration = await navigator.serviceWorker.ready;
      const currentToken = await messaging.getToken({ vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
      clearTimeout(timeout);
      resolve(currentToken || null);
    } catch (err) { resolve(null); }
  });
}

async function guardarTokenEnFirestore(codigoFamilia, token, rol = "paciente") {
  if (!codigoFamilia || !token || !db) return;
  try {
    const campo = rol === "cuidador" ? "tokenCuidador" : "tokenNotificaciones";
    await db.collection("familias").doc(STORAGE_PREFIX + codigoFamilia).set({ [campo]: token, fechaToken: Date.now() }, { merge: true });
  } catch (error) {}
}

async function registrarEvento(codigoFamilia, tipo, detalle, extra = {}) {
  if (!codigoFamilia) return;
  const evento = { codigo: String(codigoFamilia), tipo: tipo || "desconocido", detalle: detalle || "", timestamp: Date.now(), fecha: new Date().toISOString(), appVersion: APP_VERSION, ...extra };
  try { if (db) await db.collection(EVENTOS_COLLECTION).add(evento); }
  catch (e) {
    try {
      const raw = localStorage.getItem("eventos_pendientes");
      const pendientes = raw ? JSON.parse(raw) : [];
      pendientes.push(evento);
      localStorage.setItem("eventos_pendientes", JSON.stringify(pendientes));
    } catch (e2) {}
  }
}

async function enviarEventosPendientes() {
  try {
    const raw = localStorage.getItem("eventos_pendientes");
    if (!raw) return;
    const pendientes = JSON.parse(raw);
    if (!pendientes.length || !db) return;
    for (const ev of pendientes) { try { await db.collection(EVENTOS_COLLECTION).add(ev); } catch (e) {} }
    localStorage.removeItem("eventos_pendientes");
  } catch (e) {}
}

function registrarDato(clave, valor = 1, detalle = null) {
  try {
    const raw = localStorage.getItem("datos_admin_global");
    const datos = raw ? JSON.parse(raw) : {};
    if (clave === "clicsFarmacia") { if (!datos[clave]) datos[clave] = {}; datos[clave][detalle] = (datos[clave][detalle] || 0) + 1; }
    else if (clave === "medsConsultados") { if (!datos[clave]) datos[clave] = {}; if (!datos[clave][detalle]) datos[clave][detalle] = { clics: 0, precioTotal: 0 }; datos[clave][detalle].clics = (datos[clave][detalle].clics || 0) + 1; datos[clave][detalle].precioTotal = (datos[clave][detalle].precioTotal || 0) + (valor || 0); }
    else { datos[clave] = (datos[clave] || 0) + valor; }
    localStorage.setItem("datos_admin_global", JSON.stringify(datos));
  } catch (e) {}
}
// ===== FIN PARTE 1 =====
// ==================== COMPONENTES UI BASE ====================

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

function AvisoSinConexion({ C, offline, ultimaConexion, compacto, nombre }) {
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
        <WifiOff size={compacto ? 11 : 13} /> {nombre || "El adulto mayor"} está desconectado hace {mins} min
      </div>
    );
  }
  return null;
}

function PantallaAlertaMedicamento({ C, meds, hora, onConfirmar, onPosponer, escala, daltonico, sonidoActivo, esVital, yaPostergada, esAdultoMayor }) {
  const medPrincipal = meds[0];
  const esMultiple = meds.length > 1;
  const [confirmados, setConfirmados] = useState([]);

  const toggleConfirmado = (medId) => {
    let nuevos;
    if (confirmados.includes(medId)) {
      nuevos = confirmados.filter(id => id !== medId);
    } else {
      nuevos = [...confirmados, medId];
      if (nuevos.length === meds.length) {
        setTimeout(() => onConfirmar(), 300);
      }
    }
    setConfirmados(nuevos);
  };

  return (
    <div className="modal-fade" style={{ position: "fixed", inset: 0, background: `linear-gradient(160deg, #1A237E, #0D47A1)`, zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
      <div style={{ fontSize: 16 * escala, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
        <BellRing size={20} /> {esMultiple ? "Marca los que ya tomaste" : "Es hora de tu medicamento"}
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 30, width: "100%", maxWidth: 360 }}>
        {meds.map((m, i) => {
          const estaConfirmado = confirmados.includes(m.id);
          return (
            <div key={i} style={{ background: estaConfirmado ? "rgba(76, 175, 80, 0.2)" : "rgba(255,255,255,0.1)", border: estaConfirmado ? "2px solid #4CAF50" : "1px solid rgba(255,255,255,0.2)", borderRadius: 20, padding: 16, display: "flex", alignItems: "center", gap: 16, backdropFilter: "blur(10px)", transition: "all 0.2s ease" }}>
              <div style={{ width: 60, height: 60, borderRadius: 999, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: dispColor(m.color, daltonico), flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
                {m.shape}
              </div>
              <div style={{ textAlign: "left", flex: 1, opacity: estaConfirmado ? 0.6 : 1 }}>
                <div style={{ fontSize: 22 * escala, fontWeight: 900, color: "#FFFFFF", lineHeight: 1.1, textDecoration: estaConfirmado ? "line-through" : "none" }}>{m.name}</div>
                <div style={{ fontSize: 14 * escala, color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>{m.dose}</div>
              </div>
              {esMultiple && (
                <button onClick={() => toggleConfirmado(m.id)} className="btn-press" style={{ width: 50, height: 50, borderRadius: 999, border: `2px solid ${estaConfirmado ? "#4CAF50" : "rgba(255,255,255,0.5)"}`, background: estaConfirmado ? "#4CAF50" : "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                  <Check size={28} color="#FFFFFF" strokeWidth={3} opacity={estaConfirmado ? 1 : 0.3} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 20 * escala, color: "rgba(255,255,255,0.9)", marginBottom: 30, fontWeight: 700 }}><Clock size={20} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />{fmtHoraConAmPm(hora)}</div>

      {!esMultiple && (
        <button onClick={onConfirmar} className="btn-press" style={{ width: "100%", maxWidth: 360, padding: "24px 20px", borderRadius: 24, border: "none", background: "#4CAF50", color: "#FFFFFF", fontWeight: 900, fontSize: 26 * escala, cursor: "pointer", marginBottom: 14, boxShadow: "0 12px 30px rgba(76,175,80,0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <Check size={32} strokeWidth={3} /> SÍ, YA LO TOMÉ
        </button>
      )}

      {!esVital && !yaPostergada && !esAdultoMayor && (
        <button onClick={onPosponer} className="btn-press-soft" style={{ width: "100%", maxWidth: 360, padding: "16px 20px", borderRadius: 18, border: "2px solid rgba(255,255,255,0.4)", background: "transparent", color: "#FFFFFF", fontWeight: 700, fontSize: 16 * escala, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: esMultiple ? 20 : 0 }}>
          <Clock size={18} /> Recordar en 5 minutos
        </button>
      )}

      {sonidoActivo && (
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 20 }}>
          Esta alerta suena y vibra hasta que confirmes
        </div>
      )}
    </div>
  );
}

function TutorialInteractivo({ pasos, onCerrar, C, onAbrirMenu }) {
  const [paso, setPaso] = useState(0);
  const [rect, setRect] = useState(null);
  const pasoActual = pasos[paso];

  useEffect(() => {
    if (pasoActual.abrirMenu && onAbrirMenu) { onAbrirMenu(); }
    if (pasoActual.cerrarMenu && onAbrirMenu) { onAbrirMenu(); }
  }, [paso, pasoActual, onAbrirMenu]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (pasoActual.target) {
        const el = document.querySelector(pasoActual.target);
        if (el) {
          const r = el.getBoundingClientRect();
          setRect(r);
          try { el.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
        } else { setRect(null); }
      } else { setRect(null); }
    }, 400);
    return () => clearTimeout(t);
  }, [paso, pasoActual]);

  const siguiente = () => { if (paso < pasos.length - 1) setPaso(paso + 1); else { if (onAbrirMenu) onAbrirMenu(); onCerrar(); } };
  const anterior = () => { if (paso > 0) setPaso(paso - 1); };

  const spotlightStyle = rect ? {
    position: "fixed", top: rect.top - 8, left: rect.left - 8, width: rect.width + 16, height: rect.height + 16, borderRadius: 16,
    boxShadow: "0 0 0 9999px rgba(10,18,38,0.85)", pointerEvents: "none", zIndex: 9998, transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
  } : { position: "fixed", inset: 0, background: "rgba(10,18,38,0.85)", pointerEvents: "none", zIndex: 9998 };

  const tooltipStyle = rect && rect.top > (window.innerHeight / 2) ? { top: Math.max(10, rect.top - 180) } : { bottom: 100 };

  return (
    <>
      <div style={spotlightStyle} />
      <div style={{ position: "fixed", ...tooltipStyle, left: 16, right: 16, maxWidth: 320, margin: "0 auto", background: C.CREAM, borderRadius: 18, padding: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", zIndex: 9999, animation: "scaleIn 0.25s ease-out" }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: C.TEAL, marginBottom: 4, letterSpacing: 1.2 }}>PASO {paso + 1} DE {pasos.length}</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: C.INK, marginBottom: 6, lineHeight: 1.2 }}>{pasoActual.titulo}</div>
        <div style={{ fontSize: 13, color: C.MUTED, lineHeight: 1.5, marginBottom: 14 }}>{pasoActual.texto}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onCerrar} style={{ flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.MUTED, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Saltar</button>
          {paso > 0 && <button onClick={anterior} style={{ flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.INK, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Anterior</button>}
          <button onClick={siguiente} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: C.TEAL, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{paso < pasos.length - 1 ? "Siguiente" : "¡Listo!"}</button>
        </div>
        <div style={{ marginTop: 14, height: 4, background: C.LINE, borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: `${((paso + 1) / pasos.length) * 100}%`, height: "100%", background: C.TEAL, transition: "width 0.35s ease" }} />
        </div>
      </div>
    </>
  );
}

function SelectorRol({ C, onSeleccionar }) {
  const roles = [
    { id: "mayor", Icono: User, titulo: "Adulto mayor", descripcion: "Solo veo mis medicamentos y confirmo las tomas" },
    { id: "cuidador", Icono: Users, titulo: "Cuidador / Familiar", descripcion: "Cuido a alguien más y administro sus medicamentos" },
  ];
  return (
    <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div className="modal-scale" style={{ width: "100%", maxWidth: 380, background: C.CREAM, borderRadius: 24, padding: 26, margin: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 6, textAlign: "center", color: C.INK }}>¿Quién usará este celular?</div>
        <div style={{ fontSize: 13, color: C.MUTED, marginBottom: 20, textAlign: "center", lineHeight: 1.5 }}>Elige tu rol. Podrás cambiarlo después en Ajustes.</div>
        {roles.map((r) => {
          const Icono = r.Icono;
          return (
            <button key={r.id} onClick={() => onSeleccionar(r.id)} className="btn-press-soft" style={{ width: "100%", padding: 16, borderRadius: 16, border: `1.5px solid ${C.LINE}`, background: C.PAPER, cursor: "pointer", marginBottom: 10, display: "flex", alignItems: "center", gap: 14, textAlign: "left", boxShadow: C.SHADOW }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: C.TEAL + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icono size={22} color={C.TEAL} strokeWidth={2.2} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: C.INK, marginBottom: 2 }}>{r.titulo}</div>
                <div style={{ fontSize: 11.5, color: C.MUTED, lineHeight: 1.4 }}>{r.descripcion}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EstadoVacio({ C, icono: Icono, titulo, texto, botonTexto, onBoton }) {
  return (
    <div style={{ background: C.PAPER, border: `1px dashed ${C.LINE}`, borderRadius: 20, padding: "40px 24px", textAlign: "center" }}>
      <div style={{ width: 72, height: 72, borderRadius: 999, background: C.TEAL + "12", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><Icono size={34} color={C.TEAL} strokeWidth={1.5} /></div>
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
        <div style={{ textAlign: "center", marginTop: 14, fontSize: 22, fontWeight: 800, color: C.TEAL }}>{String(h12).padStart(2, "0")}:{String(min).padStart(2, "0")} {sufijo}</div>
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
// ===== FIN PARTE 2 =====
// ==================== MODALES INFORMATIVOS Y ADMIN ====================

function MenuLateral({ C, abierto, onCerrar, tabActual, setTabActual, avisosNuevos, onCompartir, onModoOscuro, onAyuda, onAcercaDe, onPolitica, onPremium, onAjustes, onSoporte, onSalir, oscuro, cuidadorNombre, elderName }) {
  if (!abierto) return null;
  const secciones = [
    { id: "meds", Icono: Pill, label: "Medicamentos" },
    { id: "historial", Icono: Calendar, label: "Historial" },
    { id: "canasta", Icono: ShoppingCart, label: "Canasta" },
    { id: "avisos", Icono: Bell, label: "Avisos", badge: avisosNuevos },
    { id: "archivados", Icono: History, label: "Medicamentos anteriores" },
    { id: "cambios", Icono: FileText, label: "Cambios" },
    { id: "contactos", Icono: Phone, label: "Contactos" },
  ];
  const acciones = [
    { id: "soporte", Icono: HelpCircle, label: "Ayuda y Sugerencias", accion: onSoporte },
    { id: "compartir", Icono: Share2, label: "Compartir", accion: onCompartir },
    { id: "oscuro", Icono: oscuro ? Sun : Moon, label: oscuro ? "Modo claro" : "Modo oscuro", accion: onModoOscuro },
    { id: "ayuda", Icono: Info, label: "Cómo funciona", accion: onAyuda },
    { id: "acerca", Icono: Info, label: "Acerca de", accion: onAcercaDe },
    { id: "politica", Icono: ScrollText, label: "Política de privacidad", accion: onPolitica },
    { id: "premium", Icono: Crown, label: "Hazte Premium", accion: onPremium },
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
          {secciones.map((s) => { const activo = tabActual === s.id; const Icono = s.Icono; return (<button key={s.id} onClick={() => { setTabActual(s.id); onCerrar(); }} className="btn-press-soft" style={{ width: "100%", padding: "13px 12px", borderRadius: 12, border: "none", background: activo ? (oscuro ? "#1E3A5F" : "#E3F2FD") : "transparent", color: activo ? C.TEAL : C.INK, fontWeight: activo ? 700 : 500, fontSize: 14.5, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 14, marginBottom: 2, transition: "all 0.15s ease" }}><Icono size={20} strokeWidth={activo ? 2.4 : 2} color={activo ? C.TEAL : C.MUTED} /><span style={{flex:1}}>{s.label}</span>{s.badge > 0 && <span style={{ background: C.CORAL, color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 999 }}>{s.badge}</span>}</button>); })}
        </div>
        <div style={{ padding: "8px 12px 20px" }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: C.MUTED, letterSpacing: 1.2, padding: "10px 8px 10px" }}>ACCIONES</div>
          {acciones.map((a) => { const Icono = a.Icono; return (<button key={a.id} onClick={() => { if (a.accion) a.accion(); onCerrar(); }} className="btn-press-soft" style={{ width: "100%", padding: "13px 12px", borderRadius: 12, border: "none", background: "transparent", color: C.INK, fontWeight: 500, fontSize: 14.5, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 14, marginBottom: 2 }}><Icono size={20} strokeWidth={2} color={C.MUTED} /><span>{a.label}</span></button>); })}
          <button onClick={onSalir} className="btn-press-soft" style={{ width: "100%", padding: "13px 12px", borderRadius: 12, border: "none", background: "transparent", color: C.CORAL, fontWeight: 500, fontSize: 14.5, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 14, marginTop: 4 }}><Lock size={20} strokeWidth={2} color={C.CORAL} /><span>Cerrar sesión</span></button>
        </div>
        <div style={{ marginTop: "auto", padding: 18, fontSize: 10.5, color: C.MUTED, borderTop: `1px solid ${C.LINE}`, textAlign: "center" }}>Versión {APP_VERSION}</div>
      </div>
    </>
  );
}

function ComoFunciona({ C, onCerrar }) {
  const pasos = [
    { Icono: Pill, titulo: "1. Agrega los medicamentos", texto: "Nombre, dosis, horarios y stock." },
    { Icono: KeyRound, titulo: "2. Comparte el código", texto: "Dale el código de 6 dígitos a tu familiar para vincular su app." },
    { Icono: BellRing, titulo: "3. Alerta con pantalla completa", texto: "Cuando es la hora, el teléfono suena, vibra y muestra la alerta." },
    { Icono: Check, titulo: "4. Confirma cada toma", texto: "Él aprieta 'Sí, ya lo tomé' y tú lo ves al instante." },
    { Icono: WifiOff, titulo: "5. Funciona sin internet", texto: "Si no hay conexión, la app guarda los datos y sincroniza luego." },
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
    { Icono: Pill, titulo: "Medicamentos ilimitados", texto: "Sin el tope de 4 del plan Estándar." },
    { Icono: Users, titulo: "Hasta 3 personas mayores", texto: "Cuida a mamá y papá al mismo tiempo." },
    { Icono: UserPlus, titulo: "Cuidadores ilimitados", texto: "Toda la familia puede estar pendiente." },
    { Icono: RefreshCw, titulo: "Reconteo manual", texto: "Ajusta el stock real cuando lo necesites." },
    { Icono: FileText, titulo: "Reporte de Adherencia", texto: "Comparte el resumen por WhatsApp." },
    { Icono: TrendingDown, titulo: "Detección de cambio de patrón", texto: "La IA te avisa si la adherencia bajó." },
  ];
  return (
    <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 71 }}>
      <div className="modal-scale" style={{ width: "100%", maxWidth: 400, background: C.CREAM, borderRadius: 24, padding: 26, margin: 20, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: 999, background: `linear-gradient(135deg, ${C.GOLD}, #E65100)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: "0 8px 20px rgba(249,168,37,0.4)" }}><Crown size={32} color="#fff" /></div>
          <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 6 }}>Bienvenido a Premium</div>
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
        <div style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 14, padding: 14, marginBottom: 12, boxShadow: C.SHADOW }}><div style={{ fontSize: 13, lineHeight: 1.6 }}><strong>Contigo Siempre</strong> es una plataforma de apoyo al cuidado de la salud para adultos mayores y sus familias.</div></div>
        <div style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 14, padding: 14, marginBottom: 12, boxShadow: C.SHADOW }}><div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Contacto</div><div style={{ fontSize: 12.5, color: C.MUTED, lineHeight: 1.6 }}>hola.contigosiempre@gmail.com<br />www.contigosiempre.cl</div></div>
        <div style={{ fontSize: 11, color: C.MUTED, textAlign: "center", marginTop: 14 }}>Hecho en Chile con amor - 2026</div>
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
          <p style={{ marginBottom: 12 }}><strong style={{ color: C.INK }}>2. Qué datos recopilamos.</strong><br />Nombre y edad del adulto mayor, nombre del cuidador, medicamentos, confirmaciones, notas, contactos y preferencias.</p>
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

function ModalSoporte({ C, onCerrar }) {
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  return (
    <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 75 }}>
      <div className="modal-scale" style={{ width: "100%", maxWidth: 360, background: C.CREAM, borderRadius: 24, padding: 24, margin: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 18, display: "flex", alignItems: "center", gap: 8 }}><MessageSquare size={20} color={C.TEAL} /> Ayuda y Sugerencias</div>
          <button onClick={onCerrar} className="btn-press-soft" style={{ border: "none", background: C.LINE, borderRadius: 999, width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={15} color={C.INK} /></button>
        </div>
        <div style={{ fontSize: 12, color: C.MUTED, marginBottom: 16 }}>Cuéntanos qué problema tuviste o qué idea tienes para mejorar Contigo Siempre. Te leeremos atentamente.</div>
        
        {enviado ? (
          <div style={{ background: C.GREEN + "15", border: `1px solid ${C.GREEN}`, borderRadius: 14, padding: 20, textAlign: "center" }}>
            <Check size={32} color={C.GREEN} style={{ margin: "0 auto 10px" }} />
            <div style={{ fontWeight: 700, color: C.GREEN, marginBottom: 4 }}>Mensaje enviado</div>
            <div style={{ fontSize: 13, color: C.MUTED }}>Gracias por escribirnos. Te contactaremos pronto.</div>
          </div>
        ) : (
          <form onSubmit={async (e) => {
            e.preventDefault();
            setEnviando(true);
            const formData = new FormData(e.target);
            try {
              await fetch("https://formsubmit.co/ajax/hola.contigosiempre@gmail.com", {
                method: "POST",
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ _subject: "Soporte / Sugerencia", Nombre: formData.get("nombre"), Mensaje: formData.get("mensaje") })
              });
              setEnviado(true);
            } catch (err) {
              alert("Error al enviar. Revisa tu conexión a internet.");
            }
            setEnviando(false);
          }}>
            <input name="nombre" required placeholder="Tu nombre" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.LINE}`, fontSize: 14, marginBottom: 12, boxSizing: "border-box", background: C.PAPER, color: C.INK, outline: "none" }} />
            <textarea name="mensaje" required placeholder="Escribe tu mensaje aquí..." rows={4} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.LINE}`, fontSize: 14, marginBottom: 16, boxSizing: "border-box", background: C.PAPER, color: C.INK, outline: "none", resize: "vertical" }} />
            <button type="submit" disabled={enviando} className="btn-press" style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: C.TEAL, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
              {enviando ? "Enviando..." : "Enviar Mensaje"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
// ===== FIN PARTE 3 =====
// ==================== ONBOARDING Y MÉTRICAS CORFO ====================

function OnboardingCORFO({ C, onCerrar, onGuardar }) {
  const [paso, setPaso] = useState(1);
  const [cantidadPersonas, setCantidadPersonas] = useState("");
  const [cantidadMeds, setCantidadMeds] = useState("");

  const siguiente = () => {
    if (paso === 1) {
      if (!cantidadPersonas) return;
      setPaso(2);
    } else if (paso === 2) {
      if (!cantidadMeds) return;
      onGuardar({ uso: "Familiar", cantidadPersonas, cantidadMeds });
      onCerrar();
    }
  };

  return (
    <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
      <div className="modal-scale" style={{ width: "100%", maxWidth: 360, background: C.CREAM, borderRadius: 24, padding: 28, margin: 20, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        
        <div style={{ fontSize: 12, fontWeight: 800, color: C.TEAL, marginBottom: 16, letterSpacing: 1 }}>PASO {paso} DE 2</div>

        {paso === 1 && (
          <div className="modal-slide">
            <div style={{ fontSize: 22, fontWeight: 800, color: C.INK, marginBottom: 8 }}>¿A cuántas personas cuidarás?</div>
            <div style={{ fontSize: 13, color: C.MUTED, marginBottom: 24 }}>El plan Estándar permite 1 persona. Premium permite hasta 3.</div>
            {["Solo a 1 persona", "A 2 o más personas"].map(op => (
              <button key={op} onClick={() => setCantidadPersonas(op)} className="btn-press-soft" style={{ width: "100%", padding: 16, borderRadius: 14, border: cantidadPersonas === op ? `2px solid ${C.TEAL}` : `1px solid ${C.LINE}`, background: cantidadPersonas === op ? C.TEAL + "10" : C.PAPER, color: C.INK, fontWeight: 700, fontSize: 15, marginBottom: 10, cursor: "pointer", transition: "all 0.2s" }}>
                {op}
              </button>
            ))}
          </div>
        )}

        {paso === 2 && (
          <div className="modal-slide">
            <div style={{ fontSize: 22, fontWeight: 800, color: C.INK, marginBottom: 8 }}>¿Cuántos remedios toma en total?</div>
            <div style={{ fontSize: 13, color: C.MUTED, marginBottom: 24 }}>Nos ayuda a configurar el control de stock.</div>
            {["1 a 2 medicamentos", "3 a 4 medicamentos", "5 o más medicamentos"].map(op => (
              <button key={op} onClick={() => setCantidadMeds(op)} className="btn-press-soft" style={{ width: "100%", padding: 16, borderRadius: 14, border: cantidadMeds === op ? `2px solid ${C.TEAL}` : `1px solid ${C.LINE}`, background: cantidadMeds === op ? C.TEAL + "10" : C.PAPER, color: C.INK, fontWeight: 700, fontSize: 15, marginBottom: 10, cursor: "pointer", transition: "all 0.2s" }}>
                {op}
              </button>
            ))}
          </div>
        )}

        <button 
          onClick={siguiente} 
          disabled={(paso === 1 && !cantidadPersonas) || (paso === 2 && !cantidadMeds)} 
          className="btn-press" 
          style={{ 
            width: "100%", padding: 14, borderRadius: 14, border: "none", 
            background: ((paso === 1 && !cantidadPersonas) || (paso === 2 && !cantidadMeds)) ? C.LINE : C.TEAL, 
            color: "#fff", fontWeight: 700, fontSize: 16, marginTop: 20, cursor: "pointer" 
          }}
        >
          {paso === 2 ? "Finalizar" : "Siguiente"}
        </button>
      </div>
    </div>
  );
}

function PanelMetricasCORFO({ C, onCerrar }) {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [tab, setTab] = useState("resumen");

  useEffect(() => {
    (async () => {
      try {
        if (!db) throw new Error("Sin DB");
        const famSnap = await db.collection("familias").get();
        const evtSnap = await db.collection("eventos").orderBy("timestamp", "desc").limit(1000).get();
        
        let total = 0, premium = 0, organicas = 0, piloto = 0;
        let topMeds = {};
        let clicsFarmacia = {};
        let solicitudesPremium = [];
        
        famSnap.forEach(doc => {
          const f = doc.data();
          total++;
          if (f.plan === "premium" || f.esPiloto) premium++;
          if (f.origen === "qr") organicas++;
          if (f.origen === "piloto") piloto++;
          
          f.personas?.forEach(p => {
            p.meds?.forEach(m => {
              if (!m.archivado) topMeds[m.name] = (topMeds[m.name] || 0) + 1;
            });
          });
        });

        evtSnap.forEach(doc => {
          const e = doc.data();
          if (e.tipo === "clic_farmacia_carro" || e.tipo === "clic_farmacia_individual") {
            clicsFarmacia[e.farmacia] = (clicsFarmacia[e.farmacia] || 0) + 1;
          }
          if (e.tipo === "solicitud_premium") {
            solicitudesPremium.push(e);
          }
        });

        const topMedsArray = Object.entries(topMeds).sort((a, b) => b[1] - a[1]).slice(0, 10);
        const topFarmaciasArray = Object.entries(clicsFarmacia).sort((a, b) => b[1] - a[1]);

        setData({ total, premium, organicas, piloto, topMedsArray, topFarmaciasArray, solicitudesPremium });
      } catch (e) {
        console.error(e);
      }
      setCargando(false);
    })();
  }, []);

  const descargarCSV = () => {
    if (!data) return;
    let csv = "";
    if (tab === "resumen") {
      csv = "Metrica,Valor\n";
      csv += `Familias Totales,${data.total}\nPremium,${data.premium}\nOrganicas (QR),${data.organicas}\nPiloto,${data.piloto}\n`;
    } else if (tab === "medicos") {
      csv = "Medicamento,Veces Ingresado\n";
      data.topMedsArray.forEach(m => { csv += `"${m[0]}",${m[1]}\n`; });
    } else if (tab === "negocio") {
      csv = "Dato,Detalle,Cantidad\n";
      data.topFarmaciasArray.forEach(f => { csv += `Farmacia,${f[0]},${f[1]}\n`; });
      data.solicitudesPremium.forEach(s => { csv += `Solicitud Premium,"${s.cuidador} (Cod: ${s.codigo})",1\n`; });
    }
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte_${tab}_${todayStr()}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 80 }}>
      <div className="modal-scale" style={{ width: "100%", maxWidth: 420, background: C.CREAM, borderRadius: 24, padding: 24, margin: 20, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 20, color: C.TEAL }}>Dashboard CORFO</div>
          <button onClick={onCerrar} className="btn-press-soft" style={{ border: "none", background: C.LINE, borderRadius: 999, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} color={C.INK} /></button>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          <button onClick={() => setTab("resumen")} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", background: tab === "resumen" ? C.TEAL : C.LINE, color: tab === "resumen" ? "#fff" : C.MUTED, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Resumen</button>
          <button onClick={() => setTab("medicos")} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", background: tab === "medicos" ? C.TEAL : C.LINE, color: tab === "medicos" ? "#fff" : C.MUTED, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Médicos</button>
          <button onClick={() => setTab("negocio")} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", background: tab === "negocio" ? C.TEAL : C.LINE, color: tab === "negocio" ? "#fff" : C.MUTED, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Negocio</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", marginBottom: 16 }}>
          {cargando ? <div style={{ textAlign: "center", padding: 40 }}><Loader2 size={30} color={C.TEAL} /></div> : data && (
            <>
              {tab === "resumen" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 14, padding: 16 }}><div style={{ fontSize: 11, color: C.MUTED }}>FAMILIAS TOTALES</div><div style={{ fontSize: 28, fontWeight: 800 }}>{data.total}</div></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 14, padding: 16 }}><div style={{ fontSize: 11, color: C.MUTED }}>PREMIUM</div><div style={{ fontSize: 24, fontWeight: 800, color: C.GOLD }}>{data.premium}</div></div>
                    <div style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 14, padding: 16 }}><div style={{ fontSize: 11, color: C.MUTED }}>ESTÁNDAR</div><div style={{ fontSize: 24, fontWeight: 800, color: C.TEAL }}>{data.total - data.premium}</div></div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 14, padding: 16 }}><div style={{ fontSize: 11, color: C.MUTED }}>ORIGEN: QR</div><div style={{ fontSize: 24, fontWeight: 800, color: C.INK }}>{data.organicas}</div></div>
                    <div style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 14, padding: 16 }}><div style={{ fontSize: 11, color: C.MUTED }}>ORIGEN: PILOTO</div><div style={{ fontSize: 24, fontWeight: 800, color: C.INK }}>{data.piloto}</div></div>
                  </div>
                </div>
              )}

              {tab === "medicos" && (
                <div style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 14, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Top 10 Medicamentos</div>
                  {data.topMedsArray.map((m, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "8px 0", borderBottom: i < data.topMedsArray.length - 1 ? `1px solid ${C.LINE}` : "none" }}>
                      <span>{i + 1}. {m[0]}</span><span style={{ fontWeight: 700, color: C.MUTED }}>{m[1]} reg.</span>
                    </div>
                  ))}
                </div>
              )}

              {tab === "negocio" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 14, padding: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Clics en Farmacias</div>
                    {data.topFarmaciasArray.length === 0 ? <div style={{ fontSize: 12, color: C.MUTED }}>Sin datos</div> : data.topFarmaciasArray.map((f, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "8px 0", borderBottom: `1px solid ${C.LINE}` }}>
                        <span>{f[0]}</span><span style={{ fontWeight: 700, color: C.TEAL }}>{f[1]} clics</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 14, padding: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Solicitudes Premium ({data.solicitudesPremium.length})</div>
                    {data.solicitudesPremium.map((s, i) => (
                      <div key={i} style={{ fontSize: 12, padding: "6px 0", borderBottom: `1px solid ${C.LINE}` }}>
                        <strong>{s.cuidador}</strong> (Cod: {s.codigo})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <button onClick={descargarCSV} className="btn-press" style={{ width: "100%", padding: 12, borderRadius: 12, border: "none", background: C.GREEN, color: "#fff", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Download size={16} /> Descargar CSV</button>
      </div>
    </div>
  );
}

function ModalReporteMedico({ C, onCerrar, elderName, meds, confirmedByDate }) {
  const [copiado, setCopiado] = useState(false);
  const texto = generarTextoCompartir("medico", elderName, meds, confirmedByDate);

  const copiar = () => {
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 85 }}>
      <div className="modal-scale" style={{ width: "100%", maxWidth: 400, background: C.CREAM, borderRadius: 24, padding: 24, margin: 20, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: C.INK }}>Reporte de Adherencia</div>
          <button onClick={onCerrar} className="btn-press-soft" style={{ border: "none", background: C.LINE, borderRadius: 999, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} color={C.INK} /></button>
        </div>
        
        <div style={{ background: C.BG, border: `1px solid ${C.LINE}`, borderRadius: 12, padding: 16, fontSize: 13, color: C.INK, fontFamily: "monospace", whiteSpace: "pre-wrap", overflowY: "auto", flex: 1, marginBottom: 16, lineHeight: 1.5 }}>
          {texto}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={copiar} className="btn-press" style={{ flex: 1, padding: 14, borderRadius: 14, border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.INK, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {copiado ? <Check size={18} color={C.GREEN} /> : <Copy size={18} color={C.MUTED} />} {copiado ? "Copiado" : "Copiar"}
          </button>
          <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank")} className="btn-press" style={{ flex: 1, padding: 14, borderRadius: 14, border: "none", background: C.GREEN, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <MessageSquare size={18} /> WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}

function CalendarioHistorial({ C, meds, confirmedByDate, onCerrar }) {
  const { dias, mes, año } = getMesActual();
  const mesStr = String(mes + 1).padStart(2, "0");
  const totalMeds = meds.reduce((a, m) => a + m.times.length, 0);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  const abrirDetalle = (key, diaData, d) => {
    const confirmadas = Object.keys(diaData).filter(k => diaData[k]).length;
    setDiaSeleccionado({ dia: d.getDate(), confirmadas, esperadas: totalMeds, data: diaData });
  };

  return (
    <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 40 }}>
      <div className="modal-slide" style={{ width: "100%", maxWidth: 420, background: C.CREAM, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ width: 40, height: 4, background: C.LINE, borderRadius: 999, margin: "0 auto 16px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{MESES[mes]} {año}</div>
          <button onClick={onCerrar} className="btn-press-soft" style={{ border: "none", background: C.LINE, borderRadius: 999, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} color={C.INK} /></button>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 20 }}>
          {DIAS_SEM.map((d, i) => <div key={i} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: C.MUTED, paddingBottom: 8 }}>{d}</div>)}
          {dias.map((d, i) => {
            if (!d) return <div key={`empty-${i}`} />;
            const key = `${año}-${mesStr}-${String(d.getDate()).padStart(2, "0")}`;
            const diaData = confirmedByDate?.[key] || {};
            const confirmadas = Object.keys(diaData).filter(k => diaData[k]).length;
            const porcentaje = totalMeds > 0 ? confirmadas / totalMeds : 0;
            
            let bg = C.PAPER;
            let color = C.INK;
            if (d > new Date()) { bg = "transparent"; color = C.LINE; } 
            else if (totalMeds === 0) { bg = C.LINE; }
            else if (porcentaje === 1) { bg = C.GREEN + "20"; color = C.GREEN; }
            else if (porcentaje > 0) { bg = C.AMBER + "20"; color = C.AMBER; }
            else if (d <= new Date() && key !== todayStr()) { bg = C.CORAL + "20"; color = C.CORAL; }

            return (
              <div 
                key={key} 
                onClick={() => { if (d <= new Date()) abrirDetalle(key, diaData, d); }}
                style={{ height: 40, borderRadius: 8, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color, cursor: d <= new Date() ? "pointer" : "default", border: key === todayStr() ? `2px solid ${C.TEAL}` : "none" }}
              >
                {d.getDate()}
              </div>
            );
          })}
        </div>

        {diaSeleccionado && (
          <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
            <div className="modal-scale" style={{ width: "100%", maxWidth: 320, background: C.CREAM, borderRadius: 20, padding: 20, margin: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{diaSeleccionado.dia} de {MESES[mes]}</div>
                <button onClick={() => setDiaSeleccionado(null)} className="btn-press-soft" style={{ border: "none", background: C.LINE, borderRadius: 999, width: 28, height: 28, cursor: "pointer" }}><X size={14} color={C.INK} /></button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {meds.flatMap(m => m.times.map(t => {
                  const k = occKey(m.id, t);
                  const tomado = diaSeleccionado.data[k];
                  return (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, background: C.PAPER, padding: 8, borderRadius: 8 }}>
                      <span>{m.name} ({fmtHoraConAmPm(t)})</span>
                      <span style={{ fontWeight: 700, color: tomado ? C.GREEN : C.CORAL }}>{tomado ? "✓" : "✗"}</span>
                    </div>
                  );
                }))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CarroCompleto({ C, meds, onCerrar, onElegirFarmacia }) {
  const [farmacias, setFarmacias] = useState([
    { id: "f1", nombre: "Cruz Verde", distanciaKm: 1.2, url: "https://www.cruzverde.cl" },
    { id: "f2", nombre: "Salcobrand", distanciaKm: 2.1, url: "https://www.salcobrand.cl" },
    { id: "f3", nombre: "Farmacias Ahumada", distanciaKm: 1.8, url: "https://www.farmaciasahumada.cl" },
    { id: "f4", nombre: "Búho (comparador)", distanciaKm: 4.1, url: "https://www.buho.cl" },
  ]);

  return (
    <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }}>
      <div className="modal-slide" style={{ width: "100%", maxWidth: 420, background: C.CREAM, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ width: 40, height: 4, background: C.LINE, borderRadius: 999, margin: "0 auto 16px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Canasta ({meds.length})</div>
          <button onClick={onCerrar} className="btn-press-soft" style={{ border: "none", background: C.LINE, borderRadius: 999, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} color={C.INK} /></button>
        </div>
        
        <div style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, marginBottom: 10 }}>MEDICAMENTOS A COMPRAR</div>
          {meds.map(m => (
            <div key={m.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: `1px solid ${C.LINE}` }}>
              <span>{m.name}</span>
              <span style={{ color: C.MUTED }}>Quedan {semaforoRiesgo(m).dias} días</span>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, marginBottom: 10 }}>ELEGIR FARMACIA</div>
        {farmacias.map(f => (
          <button 
            key={f.id} 
            onClick={() => { registrarDato("clicsFarmacia", 1, f.nombre); onElegirFarmacia(f, meds, 0); }} 
            className="btn-press-soft" 
            style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 12, padding: 14, marginBottom: 8, cursor: "pointer" }}
          >
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.INK }}>{f.nombre}</div>
              <div style={{ fontSize: 11, color: C.MUTED }}>{f.distanciaKm} km de distancia</div>
            </div>
            <div style={{ fontWeight: 800, fontSize: 13, color: C.TEAL, display: "flex", alignItems: "center", gap: 4 }}>
              Consultar <ExternalLink size={14} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
// ===== FIN PARTE 4 =====
// ==================== COMPONENTE PRINCIPAL APP ====================

export default function App() {
  const [stage, setStage] = useState("cargando");
  const [codigo, setCodigo] = useState(() => localStorage.getItem("codigo_familia") || null);
  const [codigoInput, setCodigoInput] = useState("");
  const [nombreInput, setNombreInput] = useState("");
  const [edadInput, setEdadInput] = useState("");
  const [nombreCuidadorInput, setNombreCuidadorInput] = useState(() => localStorage.getItem("nombre_cuidador") || "");
  const [modoEntrada, setModoEntrada] = useState("elegir");
  const [familia, setFamilia] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState(() => {
    const rol = localStorage.getItem("rol_usuario");
    return rol === "mayor" ? "mayor" : "cuidador";
  });
  const [nowMin, setNowMin] = useState(toMinutes(nowHHMM()));
  const [personaActualId, setPersonaActualId] = useState(null);
  const [showSelector, setShowSelector] = useState(false);
  const [rolUsuario, setRolUsuario] = useState(() => localStorage.getItem("rol_usuario") || null);
  const [showSelectorRol, setShowSelectorRol] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [archivarTarget, setArchivarTarget] = useState(null);
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
  const [showNotas, setShowNotas] = useState(null);
  const [showContactos, setShowContactos] = useState(false);
  const [showCompartir, setShowCompartir] = useState(false);
  const [showAddPersona, setShowAddPersona] = useState(false);
  const [showComoFunciona, setShowComoFunciona] = useState(false);
  const [showSoporte, setShowSoporte] = useState(false);
  const [showOnboardingPremium, setShowOnboardingPremium] = useState(false);
  const [showAcercaDe, setShowAcercaDe] = useState(false);
  const [showPolitica, setShowPolitica] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showDatos, setShowDatos] = useState(false);
  const [showEventos, setShowEventos] = useState(false);
  const [showMetricasCORFO, setShowMetricasCORFO] = useState(false);
  const [showReporteMedico, setShowReporteMedico] = useState(false);
  const [showCalendario, setShowCalendario] = useState(false);
  const [showCarroCompleto, setShowCarroCompleto] = useState(false);
  
  const [esAdmin, setEsAdmin] = useState(() => localStorage.getItem("es_admin") === "true");

  const [nombrePersonaNueva, setNombrePersonaNueva] = useState("");
  const [edadPersonaNueva, setEdadPersonaNueva] = useState("");
  const [formContacto, setFormContacto] = useState({ nombre: "", telefono: "", tipo: "médico" });
  const [form, setForm] = useState({ name: "", dose: "", times: ["08:00"], color: PILL_COLORS[0], shape: PILL_SHAPES[0], unidad: "Pastilla", stock: 30, doseAmount: 1, type: "privada", receta: null, criticidad: null, modoAviso: null, notas: "", recetaVence: "", ventanaMin: 0 });
  
  const [smsLog, setSmsLog] = useState([]);
  const [alertasDisparadas, setAlertasDisparadas] = useState({});
  const [familiasAdmin, setFamiliasAdmin] = useState([]);
  const [firebaseEstado, setFirebaseEstado] = useState("cargando");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [alertaActiva, setAlertaActiva] = useState(null);
  const [tokenFCM, setTokenFCM] = useState(null);
  
  const [alertasSonadasHoy, setAlertasSonadasHoy] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`alertas_sonadas_${todayStr()}`)) || {}; } catch (e) { return {}; }
  });
  const [resumenEnviadoHoy, setResumenEnviadoHoy] = useState(() => {
    try { return localStorage.getItem(`resumen_enviado_${todayStr()}`) === "true"; } catch (e) { return false; }
  });

  const alertasPorTomaRef = useRef({});
  const alertasPostergadasRef = useRef({});
  const pendingLocalWriteRef = useRef(false);
  const [triggerPostergacion, setTriggerPostergacion] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  
  const appAbiertaRef = useRef(false);
  const addStartRef = useRef(null);
  const heartbeatRef = useRef(null);
  const sonidoIntervalRef = useRef(null);

  const PASOS_TUTORIAL = [
    { titulo: "Comparte este código", texto: "Este es el código mágico de tu familia. Es OBLIGATORIO compartirlo con el adulto mayor (y otros cuidadores) para que todos estén conectados. Toca el botón de WhatsApp para enviarlo.", target: '[data-tutorial="codigo"]', abrirMenu: false, cerrarMenu: false },
    { titulo: "Agregar medicamentos", texto: "Aquí agregas los remedios. Pon la dosis, horarios y stock. La app calculará automáticamente cuántos días quedan.", target: '[data-tutorial="add-med"]', abrirMenu: false, cerrarMenu: false },
    { titulo: "El Menú", texto: "Toca este botón para abrir el Historial, la Canasta, Contactos y Ajustes.", target: '[data-tutorial="nav-menu-top"]', abrirMenu: false, cerrarMenu: false },
    { titulo: "Reporte de Adherencia", texto: "Cuando vayas al doctor, toca aquí. Armará un resumen de los últimos 7 días para enviar por WhatsApp.", target: '[data-tutorial="btn-reporte"]', abrirMenu: false, cerrarMenu: false },
  ];

  const settings = familia?.settings || { fontSize: "normal", daltonico: false, darkMode: false, sonidoActivo: true, vibracionActiva: true, notificarConfirmacion: true };
  const esPremium = (() => {
    if (familia?.plan === "premium") return true;
    if (familia?.esPiloto && familia?.fechaFinPiloto && Date.now() < familia.fechaFinPiloto) return true;
    if (familia?.esFundador && familia?.fechaFinFundador && Date.now() < familia.fechaFinFundador) return true;
    return false;
  })();
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

  useEffect(() => {
    localStorage.setItem(`alertas_sonadas_${todayStr()}`, JSON.stringify(alertasSonadasHoy));
    localStorage.setItem(`resumen_enviado_${todayStr()}`, String(resumenEnviadoHoy));
  }, [alertasSonadasHoy, resumenEnviadoHoy]);

  // Link Mágico (?unirse=123456 o ?premium=PILOTO2026)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const unirseCodigo = params.get("unirse");
    const premiumParam = params.get("premium");
    const rolParam = params.get("rol");

    if (unirseCodigo && unirseCodigo.length === 6) {
      setModoEntrada("unirse");
      setCodigoInput(unirseCodigo);
      if (rolParam === "mayor") setNombreCuidadorInput("Adulto Mayor");
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (premiumParam) {
      setShowPremium(true);
      setCodigoPremium(premiumParam);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const codigoGuardado = localStorage.getItem("codigo_familia");
    const cuidadorGuardado = localStorage.getItem("nombre_cuidador");
    if (codigoGuardado && cuidadorGuardado) {
      cuandoDbListo(async (d) => {
        if (!d) { setStage("entrada"); return; }
        try {
          const res = await storage.get(STORAGE_PREFIX + codigoGuardado);
          if (res && res.value) {
            const data = JSON.parse(res.value);
            setFamilia(data);
            setCodigo(codigoGuardado);
            setPersonaActualId(data.personas?.[0]?.id || null);
            setNombreCuidadorInput(cuidadorGuardado);
            setStage(data.settings?.aceptoTerminos ? "app" : "consentimiento");
          } else { setStage("entrada"); }
        } catch (e) { setStage("entrada"); }
      });
    } else { setStage("entrada"); }
  }, []);

  useEffect(() => { cuandoDbListo((d) => { setFirebaseEstado(d ? "conectado" : "local"); }); }, []);
  useEffect(() => { if (familia && !personaActualId && familia.personas && familia.personas.length > 0) setPersonaActualId(familia.personas[0].id); }, [familia, personaActualId]);

  useEffect(() => {
    cuandoDbListo(async (d) => {
      if (!d) return;
      try {
        const token = await obtenerTokenFCM();
        if (token) {
          setTokenFCM(token);
          if (codigo) { await guardarTokenEnFirestore(codigo, token); }
        }
      } catch (err) {}
    });
  }, [codigo]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accion = params.get("accion");
    if (accion === "confirmar" && alertaActiva) {
      setTimeout(() => { if (alertaActiva) confirmar(alertaActiva); }, 2000);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [alertaActiva]);

  useEffect(() => {
    if (!navigator.serviceWorker) return;
    const handler = (event) => {
      if (!event.data) return;
      if (event.data.tipo === "confirmar_toma" || event.data.tipo === "cerrar_alerta") {
        if (alertaActiva) confirmar(alertaActiva); 
        else setAlertaActiva(null); 
      } 
      else if (event.data.tipo === "postergar_toma" && alertaActiva) { 
        posponerAlerta(); 
      }
    };
    navigator.serviceWorker.addEventListener("message", handler);
    return () => navigator.serviceWorker.removeEventListener("message", handler);
  }, [alertaActiva]);

  useEffect(() => {
    if (stage !== "app" || !codigo || !personaActualId) return;
    const enviarHeartbeat = async () => {
      if (!db || !isOnline) return;
      try {
        const ref = db.collection("familias").doc(STORAGE_PREFIX + codigo);
        const doc = await ref.get();
        if (doc.exists) {
          const data = doc.data();
          const personas = (data.personas || []).map(p => p.id === personaActualId ? { ...p, ultimaConexion: Date.now() } : p);
          await ref.set({ ...data, personas }, { merge: true });
        }
      } catch (e) {}
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
    }
  }, [stage, codigo, nombreCuidadorInput]);

  useEffect(() => {
    if (!codigo || !db) return;
    const unsub = db.collection("familias").doc(STORAGE_PREFIX + codigo).onSnapshot((doc) => {
      if (doc.exists && !pendingLocalWriteRef.current) {
        const data = doc.data();
        setFamilia((prev) => { if (JSON.stringify(prev) === JSON.stringify(data)) return prev; return data; });
      }
    });
    return () => unsub();
  }, [codigo]);

  const personaActual = familia?.personas?.find((p) => p.id === personaActualId) || familia?.personas?.[0] || null;
  const elderName = personaActual?.nombre || "";
  const elderEdad = personaActual?.edad || null;
  const meds = (personaActual?.meds || []).filter((m) => !m.archivado);
  const confirmedByDate = personaActual?.confirmedByDate || {};
  const contactos = familia?.contactos || [];
  const ultimaConexionPersona = personaActual?.ultimaConexion || null;
  const personaDesconectada = !isOnline || (minutosDesde(ultimaConexionPersona) !== null && minutosDesde(ultimaConexionPersona) > MINUTOS_SIN_CONEXION_ALERTA);

  useEffect(() => {
    if (stage === "app" && familia && familia.settings && familia.settings.aceptoTerminos === true && familia.settings.onboardingCORFOVisto === true && familia.settings.tutorialVisto === false && !showSelectorRol && rolUsuario !== "mayor" && !showOnboarding) {
      setShowTutorial(true);
      actualizar((prev) => ({ ...prev, settings: { ...prev.settings, tutorialVisto: true } }));
    }
  }, [stage, familia, showSelectorRol, showOnboarding]);

  // Efecto de alertas y sonidos (Arpa cada 3 min en normales, 1 min en vitales)
  useEffect(() => {
    if (stage !== "app" || !familia || !personaActual) return;
    if (view !== "mayor" && !(personaActual?.esAutocuidado)) return;
    
    const confirmedHoy = confirmedByDate?.[todayStr()] || {};
    const dueTimes = {};
    
    meds.forEach(m => {
      m.times.forEach(t => {
        const key = occKey(m.id, t);
        if (confirmedHoy[key]) return;
        const diff = nowMin - toMinutes(t);
        if (diff >= 0 && diff <= 60) {
          if (!dueTimes[t]) dueTimes[t] = [];
          dueTimes[t].push({ med: m, time: t, key });
        }
      });
    });

    const horaActualVencida = Object.keys(dueTimes).find(t => !alertasSonadasHoy[`sonada_${personaActual.id}_${t}_${todayStr()}`]);

    if (horaActualVencida && !alertaActiva) {
      const medsVencidos = dueTimes[horaActualVencida];
      const ak = `sonada_${personaActual.id}_${horaActualVencida}_${todayStr()}`;
      
      setAlertasSonadasHoy(prev => ({ ...prev, [ak]: true }));
      setAlertaActiva({ meds: medsVencidos.map(mv => mv.med), time: horaActualVencida, keys: medsVencidos.map(mv => mv.key) });
      
      const esVitalAhora = medsVencidos.some(mv => (mv.med.criticidad || detectarCriticidad(mv.med.name)) === "vital");
      const duracionTotal = esVitalAhora ? 2 * 60 * 1000 : 6 * 60 * 1000;
      
      if (settings.sonidoActivo !== false) reproducirAlertaSonido();
      if (settings.vibracionActiva !== false) vibrarPatron();
      registrarEvento(codigo, "alerta_activada", `Grupo ${horaActualVencida}`, { cuidador: nombreCuidadorInput, persona: elderName });
      
      if (sonidoIntervalRef.current) clearInterval(sonidoIntervalRef.current);

      const timers = [];
      if (esVitalAhora) {
        timers.push(setTimeout(() => { if (settings.sonidoActivo !== false) reproducirAlertaSonido(); if (settings.vibracionActiva !== false) vibrarPatron(); }, 1 * 60 * 1000));
      } else {
        timers.push(setTimeout(() => { if (settings.sonidoActivo !== false) reproducirAlertaSonido(); if (settings.vibracionActiva !== false) vibrarPatron(); }, 3 * 60 * 1000));
      }

      timers.push(setTimeout(() => {
        setAlertaActiva(null);
        setAlertasSonadasHoy((prev) => { const nuevo = { ...prev }; delete nuevo[ak]; return nuevo; });
        const textoAviso = `⚠️ ${elderName.split(" ")[0]} no confirmó la toma de las ${fmtHoraConAmPm(horaActualVencida)} (${esVitalAhora ? 'VITAL' : 'Normal'}).`;
        setSmsLog(prev => [...prev, { tipo: "alerta", hora: smsTime(), texto: textoAviso }]);
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("Alerta de toma omitida", { body: textoAviso, icon: "/icons/icon-192.png" });
        }
        registrarEvento(codigo, "toma_omitida", `Grupo ${horaActualVencida}`, { cuidador: nombreCuidadorInput, persona: elderName });
      }, duracionTotal));
    }
  }, [nowMin, stage, familia, personaActual, confirmedByDate, view, alertaActiva, alertasSonadasHoy, settings, codigo, nombreCuidadorInput, elderName, meds, triggerPostergacion]);

  useEffect(() => {
    if (!alertaActiva) {
      if (sonidoIntervalRef.current) {
        clearInterval(sonidoIntervalRef.current);
        sonidoIntervalRef.current = null;
      }
    }
  }, [alertaActiva]);

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
        const clavePostergacion = `${personaActual.id}_${m.id}_${t}`;
        const baseTiempo = alertasPostergadasRef.current[clavePostergacion]?.postergadoEn || toMinutes(t);
        const minutosExtra = alertasPostergadasRef.current[clavePostergacion]?.count ? 5 : 0;
        const diff = ahoraMin - baseTiempo;
        
        if (modo === "inmediato" && diff >= umbral + ventana + minutosExtra) {
          const ak = `aviso_${personaActual.id}_${m.id}_${t}_${todayStr()}`;
          if (!alertasDisparadas[ak]) {
            const etiq = crit === "vital" ? "VITAL" : crit === "importante" ? "Importante" : "Normal";
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
            nuevas.push({ tipo: "alerta", hora: smsTime(), texto: `Receta de ${elderName}: ${m.name} vence en ${fmtN(dias)} día${dias !== 1 ? "s" : ""}.` });
            setAlertasDisparadas((prev) => ({ ...prev, [rk]: true }));
          }
        }
      }
    });

    if (ahoraMin >= 21 * 60 && !resumenEnviadoHoy) {
      let conf = 0, esp = 0;
      meds.forEach((m) => m.times.forEach((t) => { esp++; if (confirmedHoy[occKey(m.id, t)]) conf++; }));
      const textoResumen = `Resumen ${elderName.split(" ")[0]}: ${conf}/${esp} tomas confirmadas.`;
      setSmsLog((prev) => [...prev, { tipo: "ok", hora: smsTime(), texto: textoResumen }]);
      
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification("Resumen del día - Contigo Siempre", { body: textoResumen, icon: "/icons/icon-192.png" });
      }
      setResumenEnviadoHoy(true);
    }

    if (nuevas.length > 0) setSmsLog((prev) => [...prev, ...nuevas]);
  }, [nowMin, stage, familia, personaActual, alertasDisparadas, resumenEnviadoHoy, esPremium, elderName, meds, confirmedByDate, personaDesconectada]);

  // ==========================================
  // A PARTIR DE AQUÍ VAN LOS HANDLERS (Parte 6)
  // ==========================================
  // ==================== HANDLERS PRINCIPALES ====================

  const guardarFamilia = useCallback(async (cod, data) => {
    setSaving(true);
    pendingLocalWriteRef.current = true;
    try { await storage.set(STORAGE_PREFIX + cod, JSON.stringify(data)); }
    catch (e) { setError("No se pudo guardar."); }
    finally { 
      setSaving(false); 
      setTimeout(() => { pendingLocalWriteRef.current = false; }, 500);
    }
  }, []);

  const actualizar = useCallback((updater) => {
    setFamilia((prev) => {
      if (!prev) return prev;
      const next = typeof updater === "function" ? updater(prev) : updater;
      queueMicrotask(() => guardarFamilia(codigo, next));
      return next;
    });
  }, [codigo, guardarFamilia]);

  const actualizarPersona = useCallback((updater) => {
    actualizar((prev) => {
      if (!prev || !prev.personas) return prev;
      return { ...prev, personas: prev.personas.map((p) => p.id === personaActualId ? updater(p) : p) };
    });
  }, [actualizar, personaActualId]);

  const actualizarSettings = (c) => actualizar((prev) => ({ ...prev, settings: { ...(prev.settings || {}), ...c } }));

  const registrarCambio = (accion, detalle) => {
    actualizar((prev) => ({ ...prev, historialCambios: [...(prev.historialCambios || []), { id: Date.now(), fecha: Date.now(), cuidador: nombreCuidadorInput || "Tú", accion, detalle }] }));
  };

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
        
        const isElder = nombreCuidador.toLowerCase() === data.personas[0]?.nombre.toLowerCase() || nombreCuidador === "Adulto Mayor";
        
        if (!isElder && !data.cuidadores.includes(nombreCuidador)) {
          if (data.cuidadores.length >= LIMITES_ESTANDAR.maxCuidadores && !(data.plan === "premium" || data.esPiloto)) {
            setError("Esta familia tiene el Plan Estándar (1 cuidador). Pide al creador que active Premium para unirse.");
            return;
          }
          data.cuidadores = [...data.cuidadores, nombreCuidador];
        }
        
        if (!data.settings) data.settings = {};
        if (data.settings.sonidoActivo === undefined) data.settings.sonidoActivo = true;
        if (data.settings.vibracionActiva === undefined) data.settings.vibracionActiva = true;
        if (data.settings.tutorialVisto === undefined) data.settings.tutorialVisto = true;
        if (data.settings.notificarConfirmacion === undefined) data.settings.notificarConfirmacion = true;
        
        await guardarFamilia(cod, data);
        localStorage.setItem("codigo_familia", cod);
        localStorage.setItem("nombre_cuidador", nombreCuidador);
        
        setFamilia(data); 
        setCodigo(cod); 
        setPersonaActualId(data.personas[0]?.id || null);
        setNombreCuidadorInput(nombreCuidador);
        setStage(data.settings?.aceptoTerminos ? "app" : "consentimiento");
        
        if (isElder) {
           setRolUsuario("mayor");
           localStorage.setItem("rol_usuario", "mayor");
           setView("mayor");
        }

        registrarEvento(cod, "unirse_familia", `Usuario ${nombreCuidador} se unió`, { cuidador: nombreCuidador, persona: data.personas[0]?.nombre || "", edad: data.personas[0]?.edad || "" });
        if (tokenFCM) await guardarTokenEnFirestore(cod, tokenFCM, "cuidador");
      } else setError("No encontramos ese código.");
    } catch (e) { setError("No encontramos ese código."); }
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
      plan: "estandar", planInicio: null, creadoEn: Date.now(), origen: "manual",
      esPiloto: false, fechaFinPiloto: null,
      esFundador: false, fechaFinFundador: null,
      settings: { fontSize: "normal", daltonico: false, darkMode: false, aceptoTerminos: false, onboardingPremiumVisto: false, sonidoActivo: true, vibracionActiva: true, tutorialVisto: false, notificarConfirmacion: true, onboardingCORFOVisto: false }
    };
    await guardarFamilia(cod, nueva);
    localStorage.setItem("codigo_familia", cod);
    localStorage.setItem("nombre_cuidador", nombreCuidadorInput.trim());
    setFamilia(nueva); setCodigo(cod); setPersonaActualId(personaId); setShowSelectorRol(true);
    setStage(nueva.settings.aceptoTerminos ? "app" : "consentimiento");
    registrarEvento(cod, "crear_familia", `Familia creada para ${nombreInput.trim()}${edadNum ? ` (${edadNum} años)` : ""}`, { cuidador: nombreCuidadorInput, persona: nombreInput.trim(), edad: edadNum || "", origen: "manual" });
    if (tokenFCM) await guardarTokenEnFirestore(cod, tokenFCM, "cuidador");
  };

  const unirseFamilia = () => {
    if (codigoInput.trim().length !== 6) return;
    if (!nombreCuidadorInput.trim()) { setError("Pon tu nombre como cuidador"); return; }
    cargarFamiliaConNombre(codigoInput.trim(), nombreCuidadorInput.trim());
  };

  const activarPremium = () => {
    actualizar((prev) => ({ ...prev, plan: "premium", planInicio: Date.now(), settings: { ...(prev.settings || {}), onboardingPremiumVisto: false } }));
    setShowPremium(false);
    setShowOnboardingPremium(true);
    registrarEvento(codigo, "activar_premium", "Premium activado", { cuidador: nombreCuidadorInput });
  };

  const canjearCodigo = async () => {
    const up = codigoPremium.trim().toUpperCase();
    if (up === CODIGO_ADMIN) { 
      localStorage.setItem("es_admin", "true");
      setEsAdmin(true);
      storage.listAll().then(setFamiliasAdmin); 
      setShowAdmin(true); 
      setCodigoPremium(""); 
      setShowPremium(false); 
    }
    else if (up === CODIGO_DATOS) { setShowDatos(true); setCodigoPremium(""); setShowPremium(false); }
    else if (up === "PILOTO2026") {
      try {
        const todas = await storage.listAll();
        const pilotosActuales = todas.filter((f) => f.data?.esPiloto === true || f.data?.origen === "piloto").length;
        if (pilotosActuales >= 50) { alert("Cupos de piloto agotados. Lo sentimos."); setCodigoPremium(""); return; }
        const nuevaFecha = Date.now() + (60 * 24 * 60 * 60 * 1000);
        actualizar((prev) => ({ ...prev, esPiloto: true, fechaFinPiloto: nuevaFecha, origen: "piloto" }));
        setCodigoPremium(""); setShowPremium(false);
        alert("¡Bienvenido al programa piloto! Tienes Premium completo por 60 días.");
        registrarEvento(codigo, "activar_piloto", "Piloto activado", { cuidador: nombreCuidadorInput, origen: "piloto" });
      } catch (e) { alert("Error al activar piloto. Intenta de nuevo."); }
    }
    else if (CODIGOS_PILOTO.includes(up)) { activarPremium(); setCodigoPremium(""); }
    else alert("Código no válido");
  };

  const confirmar = (occData) => {
    actualizarPersona((p) => {
      const fecha = todayStr();
      const nc = { ...(p.confirmedByDate || {}) };
      occData.keys.forEach(k => { nc[fecha] = { ...(nc[fecha] || {}), [k]: true }; });
      const nm = (p.meds || []).map((m) => {
        if (occData.meds.find(md => md.id === m.id)) {
          return { ...m, stock: Math.max(0, +(m.stock - m.doseAmount).toFixed(2)) };
        }
        return m;
      });
      return { ...p, meds: nm, confirmedByDate: nc, ultimaConexion: Date.now() };
    });
    const akKeyConfirm = `alertas_${personaActual?.id}_${occData.time}_${todayStr()}`;
    delete alertasPorTomaRef.current[akKeyConfirm];
    const nombresMeds = occData.meds.map(m => m.name).join(", ");
    registrarEvento(codigo, "confirmar_toma", `${nombresMeds} a las ${fmtHoraConAmPm(occData.time)}`, { cuidador: nombreCuidadorInput, persona: elderName, med: nombresMeds, hora: occData.time });
    setAlertaActiva(null);

    if (sonidoIntervalRef.current) {
      clearInterval(sonidoIntervalRef.current);
      sonidoIntervalRef.current = null;
    }

    if (familia?.settings?.notificarConfirmacion && typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification("Toma confirmada", { body: `${elderName.split(" ")[0]} confirmó: ${nombresMeds}`, icon: "/icons/icon-192.png" });
    }
  };

  const posponerAlerta = () => {
    if (!alertaActiva) return;
    const alertaGuardada = alertaActiva;
    setAlertaActiva(null);
    const nombresMeds = alertaGuardada.meds.map(m => m.name).join(", ");
    registrarEvento(codigo, "alerta_pospuesta", `${nombresMeds} a las ${fmtHoraConAmPm(alertaGuardada.time)}`, { cuidador: nombreCuidadorInput, persona: elderName, med: nombresMeds, hora: alertaGuardada.time });
    
    alertaGuardada.meds.forEach(m => {
      const key = `${personaActual.id}_${m.id}_${alertaGuardada.time}`;
      const prev = alertasPostergadasRef.current[key];
      alertasPostergadasRef.current[key] = { 
        postergadoEn: toMinutes(nowHHMM()), 
        count: prev ? prev.count + 1 : 1 
      };
    });
    
    setTriggerPostergacion((t) => t + 1);
    setAlertasSonadasHoy((prev) => { const nuevo = { ...prev }; delete nuevo[`sonada_${personaActual.id}_${alertaGuardada.time}_${todayStr()}`]; return nuevo; });
  };

  const seleccionarRol = (rol) => {
    setRolUsuario(rol);
    localStorage.setItem("rol_usuario", rol);
    setShowSelectorRol(false);
    setView(rol === "mayor" ? "mayor" : "cuidador");
    if (!familia?.settings?.aceptoTerminos) { setStage("consentimiento"); } 
    else if (!familia?.settings?.onboardingCORFOVisto) { setShowOnboarding(true); } 
    else { setStage("app"); }
    registrarEvento(codigo, "seleccionar_rol", rol, { cuidador: nombreCuidadorInput, rol: rol });
  };

  const completarOnboarding = (data) => {
    actualizar((prev) => ({ 
      ...prev, 
      settings: { ...prev.settings, onboardingCORFOVisto: true },
      metricasOnboarding: data
    }));
    setShowOnboarding(false);
    setStage("app");
    registrarEvento(codigo, "completar_onboarding", "Onboarding CORFO completado", { cuidador: nombreCuidadorInput, ...data });
  };

  const seleccionarYo = () => {
    const existeYo = familia.personas.find((p) => p.nombre === "Yo");
    if (existeYo) { setPersonaActualId(existeYo.id); setShowSelector(false); }
    else {
      const nuevaYo = { id: Date.now(), nombre: "Yo", edad: null, meds: [], confirmedByDate: {}, preferenciasFarmacia: {}, ultimoReconteo: {}, ultimaConexion: Date.now(), esAutocuidado: true };
      actualizar((prev) => ({ ...prev, personas: [...prev.personas, nuevaYo] }));
      setPersonaActualId(nuevaYo.id); setShowSelector(false);
      registrarEvento(codigo, "activar_autocuidado", "Modo Autocuidado activado", { cuidador: nombreCuidadorInput });
    }
  };

  const maxMeds = esPremium ? Infinity : LIMITES_ESTANDAR.maxMeds;
  const maxPersonas = esPremium ? 3 : LIMITES_ESTANDAR.maxElderly;

  const intentarAgregarMed = () => { 
    if (meds.length >= maxMeds) { setShowLimite("meds"); return; } 
    addStartRef.current = Date.now(); 
    setEditandoId(null);
    setForm({ 
      name: "", dose: "", times: ["08:00"], color: PILL_COLORS[0], shape: PILL_SHAPES[0], 
      unidad: "Pastilla", stock: 30, doseAmount: 1, type: "privada", receta: null, 
      criticidad: null, modoAviso: null, notas: "", recetaVence: "", ventanaMin: 0 
    });
    setShowAdd(true); 
  };
  
  const intentarAgregarPersona = () => { 
    if ((familia.personas?.length || 0) >= maxPersonas) { setShowLimite("personas"); return; } 
    setShowAddPersona(true); 
  };

  const archivarMed = (id) => {
    actualizarPersona((p) => ({ ...p, meds: (p.meds || []).map((m) => m.id === id ? { ...m, archivado: true, fechaArchivado: Date.now() } : m) }));
    const med = meds.find((m) => m.id === id);
    if (med) registrarCambio("Archivó", med.name);
    registrarEvento(codigo, "archivar_med", med?.name || "", { cuidador: nombreCuidadorInput, persona: elderName, med: med?.name });
    setArchivarTarget(null);
  };

  const reactivarMed = (id) => {
    actualizarPersona((p) => ({ ...p, meds: (p.meds || []).map((m) => m.id === id ? { ...m, archivado: false, fechaArchivado: null } : m) }));
    registrarCambio("Reactivó", "Medicamento reactivado");
    setCuidadorTab("meds");
  };

  const borrarMedFijo = (id) => {
    if (!window.confirm("¿Borrar definitivamente este medicamento? No se podrá recuperar.")) return;
    actualizarPersona((p) => ({ ...p, meds: (p.meds || []).filter((m) => m.id !== id) }));
    registrarCambio("Borró", "Medicamento eliminado permanentemente");
  };

  const abrirEditar = (med) => {
    setForm({ 
      name: med.name || "", dose: med.dose || "", times: med.times || ["08:00"], color: med.color || PILL_COLORS[0], shape: med.shape || PILL_SHAPES[0], stock: med.stock || 30, doseAmount: med.doseAmount || 1, type: med.type || "privada", receta: med.receta || null, criticidad: med.criticidad || null, modoAviso: med.modoAviso || null, notas: med.notas || "", recetaVence: med.recetaVence || "", ventanaMin: med.ventanaMin || 0, unidad: med.unidad || "Pastilla" 
    });
    setEditandoId(med.id); addStartRef.current = Date.now(); setShowAdd(true);
  };

  const agregarMed = () => {
    if (!form.name || !form.name.trim()) return;
    const critF = form.criticidad || detectarCriticidad(form.name);
    const modoF = critF === "vital" ? "inmediato" : (form.modoAviso || (critF === "importante" ? "inmediato" : "final_dia"));
    const stockNum = Number(form.stock) || 0;
    const horariosValidos = (form.times && Array.isArray(form.times)) ? form.times.filter(Boolean) : ["08:00"];
    
    const nuevo = { 
      id: editandoId || Date.now(), 
      name: form.name.trim(), 
      dose: form.dose ? form.dose.trim() : "1 dosis", 
      times: horariosValidos, 
      color: form.color || PILL_COLORS[0], 
      shape: form.shape || PILL_SHAPES[0], 
      unidad: form.unidad || "Pastilla", 
      stock: stockNum, 
      doseAmount: Number(form.doseAmount) || 1, 
      type: form.type || "privada", 
      receta: form.receta || clasificarMedicamento(form.name) || "sin_receta", 
      criticidad: critF, 
      modoAviso: modoF, 
      notas: form.notas || "", 
      recetaVence: form.recetaVence || "", 
      ventanaMin: Number(form.ventanaMin) || 0, 
      archivado: false, 
      fechaInicio: Date.now(), 
      fechaArchivado: null 
    };
    
    const duracionSeg = addStartRef.current ? Math.round((Date.now() - addStartRef.current) / 1000) : 0;
    
    if (editandoId) {
      actualizarPersona((p) => ({ ...p, meds: (p.meds || []).map((m) => m.id === editandoId ? { ...m, ...nuevo, fechaInicio: m.fechaInicio || nuevo.fechaInicio, archivado: m.archivado || false, fechaArchivado: m.fechaArchivado || null } : m) }));
      registrarCambio("Editó", nuevo.name);
      registrarEvento(codigo, "editar_med", nuevo.name, { cuidador: nombreCuidadorInput, persona: elderName, edad: elderEdad || "", med: nuevo.name, criticidad: critF, duracion_seg: duracionSeg });
      setEditandoId(null);
    } else {
      actualizarPersona((p) => ({ ...p, meds: [...(p.meds || []), nuevo] }));
      registrarCambio("Agregó", nuevo.name);
      registrarEvento(codigo, "agregar_med", nuevo.name, { cuidador: nombreCuidadorInput, persona: elderName, edad: elderEdad || "", med: nuevo.name, criticidad: critF, duracion_seg: duracionSeg });
    }
    addStartRef.current = null;
    setForm({ name: "", dose: "", times: ["08:00"], color: PILL_COLORS[0], shape: PILL_SHAPES[0], stock: 30, doseAmount: 1, type: "privada", receta: null, criticidad: null, modoAviso: null, notas: "", recetaVence: "", ventanaMin: 0, unidad: "Pastilla" });
    setShowAdd(false);
  };

  const guardarNotas = (medId, texto) => {
    actualizarPersona((p) => ({ ...p, meds: (p.meds || []).map((m) => (m.id === medId ? { ...m, notas: texto } : m)) }));
    const med = meds.find((m) => m.id === medId);
    if (med) registrarCambio("Cambió notas", med.name);
    setShowNotas(null);
  };

  const agregarPersona = () => {
    if (!nombrePersonaNueva || !nombrePersonaNueva.trim()) return;
    if (edadPersonaNueva && (isNaN(Number(edadPersonaNueva)) || Number(edadPersonaNueva) < 0 || Number(edadPersonaNueva) > 120)) { alert("La edad debe ser un número entre 0 y 120"); return; }
    const edadNum = edadPersonaNueva ? Number(edadPersonaNueva) : null;
    const nueva = { id: Date.now(), nombre: nombrePersonaNueva.trim(), edad: edadNum, meds: [], confirmedByDate: {}, preferenciasFarmacia: {}, ultimoReconteo: {}, ultimaConexion: Date.now() };
    actualizar((prev) => ({ ...prev, personas: [...(prev.personas || []), nueva] }));
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
    actualizarPersona((p) => ({ ...p, meds: (p.meds || []).map((m) => (m.id === restockTarget.id ? { ...m, stock: +(m.stock + cant).toFixed(2) } : m)) }));
    registrarCambio("Repuso stock", `${restockTarget.name} +${fmtN(cant)}`);
    registrarEvento(codigo, "reponer_stock", `${restockTarget.name} +${fmtN(cant)}`, { cuidador: nombreCuidadorInput, persona: elderName, med: restockTarget.name, cantidad: cant });
    setRestockTarget(null);
  };
  
  const aplicarReconteo = (id, c) => {
    actualizarPersona((p) => ({ ...p, meds: (p.meds || []).map((m) => (m.id === id ? { ...m, stock: c } : m)), ultimoReconteo: { ...(p.ultimoReconteo || {}), [id]: Date.now() } }));
    const med = meds.find((m) => m.id === id);
    if (med) registrarCambio("Recontó", `${med.name} → ${fmtN(c)}`);
    registrarEvento(codigo, "reconteo", `${med?.name || ""} → ${fmtN(c)}`, { cuidador: nombreCuidadorInput, persona: elderName, med: med?.name, stock: c });
    setReconteoTarget(null);
  };

  const abrirFarmaciaCarro = (f, medsList, total) => {
    registrarDato("abrioFarmaciaTotal"); registrarDato("clicsFarmacia", 1, f.nombre); medsList.forEach((m) => registrarDato("medsConsultados", 0, m.name));
    registrarEvento(codigo, "clic_farmacia_carro", `${f.nombre} — ${medsList.length} meds`, { cuidador: nombreCuidadorInput, persona: elderName, farmacia: f.nombre, cantidad: medsList.length, total });
    const url = `${f.url}?ref=contigo_siempre_app&carro=completo`;
    setLinkAbierto({ farmacia: f.nombre, url, receta: "con_receta" }); setShowCarroCompleto(false);
  };

  const compartirWhatsApp = (tipo) => {
    const texto = generarTextoCompartir(tipo, elderName, meds, confirmedByDate);
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
    registrarEvento(codigo, "compartir_whatsapp", tipo, { cuidador: nombreCuidadorInput, persona: elderName, tipo_compartir: tipo });
    setShowCompartir(false);
  };

  const salirSesion = () => {
    if(window.confirm("¿Estás seguro que quieres cerrar sesión? Tendrás que ingresar el código de nuevo.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // ==========================================
  // A PARTIR DE AQUÍ VA EL RENDERIZADO (Parte 7)
  // ==========================================
  // ==================== RENDERIZADO ====================
  const scale = FONT_SCALE[settings.fontSize] || 1;
  const confirmedHoy = confirmedByDate?.[todayStr()] || {};
  const occurrences = meds.flatMap((m) => (m.times || []).map((t) => ({ med: m, time: t, key: occKey(m.id, t) })));
  const upcoming = occurrences.filter((o) => toMinutes(o.time) >= nowMin && !confirmedHoy[o.key]).sort((a, b) => toMinutes(a.time) - toMinutes(b.time));
  const current = upcoming[0];
  const isCurrentDue = current && toMinutes(current.time) <= nowMin;
  const racha = calcularRacha(meds, confirmedByDate);
  const recetasPorVencer = meds.filter((m) => { if (!m.recetaVence) return false; const d = diasHastaVencimiento(m.recetaVence); return d !== null && d >= 0 && d <= 30; });
  const diasPremium = familia?.planInicio ? Math.floor((Date.now() - familia.planInicio) / (1000 * 60 * 60 * 24)) : 0;
  const mostrarAvisoRenovacion = esPremium && diasPremium >= 27 && diasPremium <= 30;
  const medsCarro = meds.filter((m) => { const s = semaforoRiesgo(m); return s.nivel === "urgente" || s.nivel === "atención"; });
  const medsArchivados = (personaActual?.meds || []).filter(m => m.archivado);
  const cambioPatron = detectarCambioPatron(meds, confirmedByDate);

  if (stage === "cargando") return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: LIGHT.TEAL }}><Loader2 size={30} color="#fff" /></div>;

  if (stage === "entrada") {
    return (
      <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${LIGHT.TEAL}, #0D47A1)`, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "'Inter', sans-serif", padding: 20 }}>
        <style>{CSS_GLOBAL}</style>
        <div className="modal-scale" style={{ width: "100%", maxWidth: 380, background: LIGHT.CREAM, borderRadius: 24, padding: 28, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
          <div style={{ margin: "0 auto 16px", display: "flex", justifyContent: "center" }}><LogoContigoSiempre size={72} color={LIGHT.TEAL} accent={LIGHT.GOLD} /></div>
          <div style={{ fontSize: 22, fontWeight: 800, color: LIGHT.INK, marginBottom: 6 }}>Contigo Siempre</div>
          <div style={{ fontSize: 13.5, color: LIGHT.MUTED, marginBottom: 8 }}>Recordatorios de medicamentos para tu ser querido</div>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 18, flexWrap: "wrap" }}>
            <div style={{ fontSize: 10.5, color: LIGHT.MUTED, padding: "4px 10px", background: firebaseEstado === "conectado" ? LIGHT.GREEN + "15" : firebaseEstado === "local" ? LIGHT.AMBER + "15" : LIGHT.LINE, borderRadius: 999, display: "inline-block", fontWeight: 600 }}>{firebaseEstado === "conectado" ? "Nube conectada" : firebaseEstado === "local" ? "Modo local" : "Conectando..."}</div>
            {!isOnline && <div className="offline-pulse" style={{ fontSize: 10.5, color: "#E65100", padding: "4px 10px", background: "#FFF3E0", border: "1px solid #FFB74D", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 700 }}><WifiOff size={11} /> Sin conexión</div>}
          </div>
          {tokenFCM && (
            <div style={{ fontSize: 11, color: LIGHT.GREEN, background: LIGHT.GREEN + "15", padding: "8px 12px", borderRadius: 10, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontWeight: 600 }}>
              <BellRing size={14} /> Notificaciones activadas
            </div>
          )}
          {modoEntrada === "elegir" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => setModoEntrada("crear")} className="btn-press" style={{ padding: 14, borderRadius: 14, border: "none", background: LIGHT.TEAL, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>Soy nueva familia</button>
              <button onClick={() => setModoEntrada("unirse")} className="btn-press-soft" style={{ padding: 14, borderRadius: 14, border: `1.5px solid ${LIGHT.LINE}`, background: LIGHT.PAPER, color: LIGHT.INK, fontWeight: 700, cursor: "pointer", fontSize: 15 }}>Ya tengo un código</button>
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
              <div style={{ fontSize: 12, fontWeight: 700, color: LIGHT.MUTED, marginBottom: 6, letterSpacing: 0.3 }}>TU NOMBRE</div>
              <input value={nombreCuidadorInput} onChange={(e) => setNombreCuidadorInput(e.target.value)} placeholder="Ej. Juan Larrota (o 'Adulto Mayor')" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${LIGHT.LINE}`, fontSize: 14, marginBottom: 12, boxSizing: "border-box", outline: "none" }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: LIGHT.MUTED, marginBottom: 6, letterSpacing: 0.3 }}>CÓDIGO DE LA FAMILIA</div>
              <input value={codigoInput} onChange={(e) => setCodigoInput(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${LIGHT.LINE}`, fontSize: 22, letterSpacing: 6, textAlign: "center", marginBottom: 12, boxSizing: "border-box", outline: "none", fontWeight: 700 }} />
              {error && <div style={{ fontSize: 12, color: LIGHT.CORAL, marginBottom: 12 }}>{error}</div>}
              <button onClick={unirseFamilia} disabled={codigoInput.length !== 6 || !nombreCuidadorInput.trim()} className="btn-press" style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: (codigoInput.length === 6 && nombreCuidadorInput.trim()) ? LIGHT.TEAL : "#E0E4EB", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Entrar</button>
              <button onClick={() => { setModoEntrada("elegir"); setError(""); }} style={{ marginTop: 10, width: "100%", background: "transparent", border: "none", color: LIGHT.MUTED, fontSize: 12.5, cursor: "pointer", fontWeight: 600 }}>Volver</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (stage === "consentimiento") {
    return (
      <div style={{ minHeight: "100vh", background: LIGHT.BG, display: "flex", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
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
            const next = { ...familia, settings: { ...familia.settings, aceptoTerminos: true } };
            await guardarFamilia(codigo, next);
            setFamilia(prev => ({ ...prev, settings: { ...prev.settings, aceptoTerminos: true } }));
            setStage("app");
            registrarEvento(codigo, "acepto_terminos", "Términos aceptados", { cuidador: nombreCuidadorInput });
          }} disabled={!aceptoCheck} className="btn-press" style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: aceptoCheck ? LIGHT.TEAL : "#E0E4EB", color: "#fff", fontWeight: 700, cursor: aceptoCheck ? "pointer" : "not-allowed" }}>Continuar</button>
          {showPolitica && <PoliticaPrivacidad C={LIGHT} onCerrar={() => setShowPolitica(false)} />}
        </div>
      </div>
    );
  }

  // RENDERIZADO PRINCIPAL DE LA APP
  return (
    <div style={{ minHeight: "100vh", background: C.BG, fontFamily: "'Inter', sans-serif", color: C.INK, display: "flex", justifyContent: "center" }}>
      <style>{CSS_GLOBAL}</style>
      <div style={{ width: "100%", maxWidth: 420, minHeight: "100vh", background: C.CREAM, display: "flex", flexDirection: "column", position: "relative" }}>

        {alertaActiva && (view === "mayor" || personaActual?.esAutocuidado) && (
          <PantallaAlertaMedicamento
            C={C} meds={alertaActiva.meds} hora={alertaActiva.time}
            onConfirmar={() => confirmar(alertaActiva)} onPosponer={posponerAlerta}
            escala={scale} daltonico={settings.daltonico} sonidoActivo={settings.sonidoActivo !== false}
            esVital={alertaActiva.meds.some(m => (m.criticidad || detectarCriticidad(m.name)) === "vital")}
            yaPostergada={alertaActiva.meds.some(m => alertasPostergadasRef.current[`${personaActual?.id}_${m.id}_${alertaActiva.time}`]?.count > 0)}
            esAdultoMayor={view === "mayor"}
          />
        )}

        {!isOnline && (
          <div className="offline-pulse" style={{ background: "#FFF3E0", borderBottom: "1px solid #FFB74D", padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 12, fontWeight: 700, color: "#E65100" }}>
            <WifiOff size={14} /> Sin conexión — Tus datos se sincronizarán automáticamente
          </div>
        )}

        {familia.personas && familia.personas.length > 0 && view === "cuidador" && (
          <div style={{ padding: "12px 20px 0", position: "relative" }}>
            <button onClick={() => setShowSelector(!showSelector)} className="btn-press-soft" style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.INK, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: C.SHADOW }}>
              <span>{elderName}{elderEdad ? ` · ${elderEdad} años` : ""}</span><ChevronDown size={14} />
            </button>
            {showSelector && (
              <div className="modal-scale" style={{ position: "absolute", top: 52, left: 20, right: 20, background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 12, padding: 6, zIndex: 20, boxShadow: "0 8px 24px rgba(0,0,0,0.18)" }}>
                {familia.personas.map((p) => {
                  const mins = minutosDesde(p.ultimaConexion);
                  const desconectado = mins !== null && mins > MINUTOS_SIN_CONEXION_ALERTA;
                  return (
                    <button key={p.id} onClick={() => { setPersonaActualId(p.id); setShowSelector(false); }} className="btn-press-soft" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "none", background: p.id === personaActualId ? (oscuro ? "#1E3A5F" : "#E3F2FD") : "transparent", color: C.INK, fontWeight: p.id === personaActualId ? 700 : 500, fontSize: 13, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 6 }}>
                      <span>{p.nombre}{p.edad ? ` · ${p.edad} años` : ""}</span>
                      {desconectado && <WifiOff size={12} color="#E65100" />}
                    </button>
                  );
                })}
                {esPremium && (<button onClick={seleccionarYo} className="btn-press-soft" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "none", background: "transparent", color: C.TEAL, fontWeight: 700, fontSize: 13, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 6 }}>Yo (mis medicamentos)</button>)}
                <button onClick={() => { setShowSelector(false); intentarAgregarPersona(); }} className="btn-press-soft" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px dashed ${C.TEAL}`, background: C.TEAL + "08", color: C.TEAL, fontWeight: 700, fontSize: 13, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}><UserPlus size={14} /> Agregar paciente</button>
              </div>
            )}
          </div>
        )}

        {rolUsuario !== "mayor" && <div data-tutorial="nav-view" style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px 0" }}>
          <button onClick={() => setView("mayor")} className="btn-press-soft" style={{ flex: 1, padding: "11px", borderRadius: 12, border: `1px solid ${view === "mayor" ? "transparent" : C.LINE}`, fontWeight: 700, fontSize: 12.5, cursor: "pointer", background: view === "mayor" ? C.TEAL : C.PAPER, color: view === "mayor" ? "#fff" : C.MUTED, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: view === "mayor" ? `0 4px 12px ${C.TEAL}40` : C.SHADOW }}><User size={14} /> {elderName.split(" ")[0]}</button>
          <button onClick={() => setView("cuidador")} className="btn-press-soft" style={{ flex: 1, padding: "11px", borderRadius: 12, border: `1px solid ${view === "cuidador" ? "transparent" : C.LINE}`, fontWeight: 700, fontSize: 12.5, cursor: "pointer", background: view === "cuidador" ? C.TEAL : C.PAPER, color: view === "cuidador" ? "#fff" : C.MUTED, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: view === "cuidador" ? `0 4px 12px ${C.TEAL}40` : C.SHADOW }}><Users size={14} /> Cuidador {esPremium && "(Premium)"}</button>
        </div>}

        {view === "cuidador" && <div style={{ margin: "8px 20px 0", display: "flex", justifyContent: "center" }}>
          <AvisoSinConexion C={C} offline={!isOnline} ultimaConexion={ultimaConexionPersona} compacto={false} nombre={elderName} />
        </div>}

        {view === "cuidador" && familia.personas && familia.personas.length === 1 && !localStorage.getItem(`banner_cerrado_${codigo}`) && (
          <div style={{ margin: "12px 20px 0", background: C.TEAL + "10", border: `1px solid ${C.TEAL}40`, borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.TEAL, lineHeight: 1.3 }}>
              Conecta el celular de <strong>{elderName.split(" ")[0]}</strong>
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button 
                onClick={() => { 
                  const txt = `Hola ${elderName.split(" ")[0]}, toca este link para ver tus remedios en Contigo Siempre: https://contigo-siempre.vercel.app/?unirse=${codigo}&rol=mayor`; 
                  window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, "_blank"); 
                }} 
                className="btn-press" 
                style={{ padding: "6px 10px", borderRadius: 8, border: "none", background: C.TEAL, color: "#fff", fontWeight: 700, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
              >
                <MessageSquare size={12} /> Enviar
              </button>
              <button onClick={() => { localStorage.setItem(`banner_cerrado_${codigo}`, "true"); setTriggerPostergacion(t => t + 1); }} className="btn-press-soft" style={{ padding: "6px", borderRadius: 8, border: "none", background: "transparent", color: C.MUTED, cursor: "pointer", display: "flex", alignItems: "center" }}><X size={14} /></button>
            </div>
          </div>
        )}

        <div data-tutorial="codigo" style={{ margin: "10px 20px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 11, color: C.MUTED, padding: 4, borderRadius: 8 }}>
          <KeyRound size={11} /> Código: <strong>{codigo}</strong>
          <button onClick={() => navigator.clipboard?.writeText(codigo)} className="btn-press-soft" style={{ border: "none", background: "transparent", color: C.TEAL, cursor: "pointer", display: "flex", padding: 4 }}><Copy size={12} /></button>
          <button onClick={() => { const txt = `Hola ${elderName.split(" ")[0]}, toca este link para ver tus remedios en Contigo Siempre: https://contigo-siempre.vercel.app/?unirse=${codigo}&rol=mayor`; window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, "_blank"); }} className="btn-press-soft" style={{ border: "none", background: "transparent", color: C.TEAL, cursor: "pointer", display: "flex", padding: 4 }}><Share2 size={12} /></button>
          {saving && <Loader2 size={11} />}
          {firebaseEstado === "conectado" && isOnline && <span style={{ fontSize: 10, color: C.GREEN, fontWeight: 700 }}>Nube</span>}
        </div>

        {view === "mayor" ? (
          <div style={{ padding: "20px 22px 40px", flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginBottom: 4 }}>
              <button onClick={() => setShowContactos(true)} className="btn-press-soft" style={{ border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.MUTED, borderRadius: 999, padding: "7px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, boxShadow: C.SHADOW }}><Phone size={12} /> Emergencia</button>
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
              <div style={{ fontSize: 15 * scale, color: C.MUTED, fontWeight: 600 }}>Hola, {elderName.split(" ")[0]} {elderEdad ? `· ${elderEdad} años` : ""}</div>
              <div style={{ fontSize: 34 * scale, fontWeight: 800, marginTop: 4 }}>{fmt(nowMin)}</div>
            </div>
            {current && isCurrentDue ? (
              <div className="modal-scale" style={{ background: C.PAPER, border: `2px solid ${dispColor(current.med.color, settings.daltonico)}`, borderRadius: 28, padding: 26, textAlign: "center", boxShadow: "0 8px 30px rgba(25,118,210,0.15)" }}>
                <div style={{ fontSize: 13 * scale, fontWeight: 700, color: C.MUTED, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1.2 }}>Es hora de tu medicamento</div>
                <div style={{ width: 90, height: 90, borderRadius: 999, background: dispColor(current.med.color, settings.daltonico), display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 40, color: "#fff", boxShadow: `0 8px 20px ${dispColor(current.med.color, settings.daltonico)}50` }}>{current.med.shape}</div>
                <div style={{ fontSize: 26 * scale, fontWeight: 800 }}>{current.med.name}</div>
                <div style={{ fontSize: 16 * scale, color: C.MUTED, marginTop: 6 }}>{current.med.dose}</div>
                <button onClick={() => confirmar({ meds: [current.med], time: current.time, keys: [current.key] })} className="btn-press" style={{ width: "100%", marginTop: 22, padding: "20px", borderRadius: 20, border: "none", background: C.GREEN, color: "#fff", fontWeight: 800, fontSize: 20 * scale, cursor: "pointer", boxShadow: `0 8px 20px ${C.GREEN}50` }}>SÍ, YA LO TOMÉ</button>
              </div>
            ) : (
              <div style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 28, padding: 30, textAlign: "center", boxShadow: C.SHADOW }}>
                <div style={{ width: 64, height: 64, borderRadius: 999, background: C.TEAL + "12", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}><Clock size={32} color={C.TEAL} strokeWidth={2} /></div>
                <div style={{ fontSize: 19 * scale, fontWeight: 700 }}>{meds.length === 0 ? "Sin medicamentos cargados" : "Todo tranquilo"}</div>
                {current && <div style={{ fontSize: 15 * scale, color: C.MUTED, marginTop: 6 }}>Próximo: {current.med.name} a las {fmtHoraConAmPm(current.time)}</div>}
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: "16px 20px 100px", flex: 1 }}>
            {mostrarAvisoRenovacion && (
               <div style={{ background: C.GOLD + "15", border: `1px solid ${C.GOLD}`, borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14, marginTop: 8 }}>
                 <Crown size={20} color={C.GOLD} style={{ marginTop: 1 }} />
                 <div style={{ fontSize: 13, color: C.INK, lineHeight: 1.5 }}>Tu plan Premium vence pronto. Renueva para seguir disfrutando de los beneficios.</div>
               </div>
            )}

            {cuidadorTab === "meds" && cambioPatron && (
              <div style={{ background: C.AMBER + "15", border: `1px solid ${C.AMBER}`, borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14, marginTop: 8 }}>
                <TrendingDown size={20} color={C.AMBER} style={{ marginTop: 1 }} />
                <div style={{ fontSize: 13, color: C.INK, lineHeight: 1.5 }}>Detectamos una baja en la adherencia esta semana ({cambioPatron.tasaActual}% vs {cambioPatron.tasaPrevia}% anterior). Sugerimos revisar.</div>
              </div>
            )}

            {cuidadorTab === "meds" && recetasPorVencer.length > 0 && (
              <div style={{ background: oscuro ? "#3A2F1A" : "#FFF8E1", border: `1px solid ${oscuro ? "#5A4A2A" : "#FFE082"}`, borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14, marginTop: 8, boxShadow: C.SHADOW }}>
                <FileText size={20} color={C.AMBER} style={{ marginTop: 1 }} />
                <div style={{ fontSize: 13, color: oscuro ? "#FFE082" : "#8A5F16", lineHeight: 1.5 }}>Recetas por vencer: {recetasPorVencer.map((m) => m.name).join(", ")}</div>
              </div>
            )}

            {cuidadorTab === "meds" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <button data-tutorial="nav-menu-top" onClick={() => setShowMenuLateral(true)} className="btn-press-soft" style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.INK, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6, boxShadow: C.SHADOW }}><Menu size={16} /> Menú</button>
                  <button data-tutorial="btn-reporte" onClick={() => setShowReporteMedico(true)} className="btn-press-soft" style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${C.TEAL}`, background: C.TEAL + "10", color: C.TEAL, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}><FileText size={16} /> Reporte de Adherencia</button>
                </div>

                {esPremium && view === "cuidador" && (
                  <button onClick={intentarAgregarPersona} className="btn-press-soft" style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1.5px dashed ${C.TEAL}`, background: C.TEAL + "08", color: C.TEAL, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 16 }}>
                    <UserPlus size={16} /> Agregar otro paciente (Premium)
                  </button>
                )}

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
                      {meds.slice(0, 4).map((m) => {
                        const sem = semaforoRiesgo(m);
                        const crit = m.criticidad || detectarCriticidad(m.name);
                        const colorCrit = crit === "vital" ? C.CORAL : crit === "importante" ? C.AMBER : C.GREEN;
                        const labelCrit = crit === "vital" ? "VITAL" : crit === "importante" ? "IMPORTANTE" : "NORMAL";
                        const semColor = sem.nivel === "urgente" ? C.CORAL : sem.nivel === "atención" ? C.AMBER : C.GREEN;
                        return (
                          <div key={m.id} className="card-hover" style={{ padding: "14px", borderRadius: 16, background: C.PAPER, border: `1px solid ${C.LINE}`, boxShadow: C.SHADOW }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ width: 36, height: 36, borderRadius: 999, background: dispColor(m.color, settings.daltonico), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#fff", flexShrink: 0 }}>{m.shape}</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                  {m.name}
                                  <span style={{ fontSize: 9, background: colorCrit + "20", color: colorCrit, padding: "2px 7px", borderRadius: 999, fontWeight: 700 }}>{labelCrit}</span>
                                  <span style={{ width: 8, height: 8, borderRadius: 999, background: semColor, marginLeft: "auto" }} />
                                </div>
                              <div style={{ fontSize: 11, color: C.MUTED, marginTop: 3 }}>{(m.times || []).map(fmtHoraConAmPm).join(" · ")}</div>
                              </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.LINE}` }}>
                              <div style={{ fontSize: 11.5, color: semColor, fontWeight: 700 }}>{sem.dias !== null ? `${fmtN(sem.dias)} días · ${sem.nivel}` : "Sin datos"}</div>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button onClick={() => abrirEditar(m)} className="btn-press-soft" style={{ fontSize: 10.5, fontWeight: 700, color: C.TEAL, background: oscuro ? "#1E3A5F" : "#E3F2FD", border: "none", padding: "6px 9px", borderRadius: 999, cursor: "pointer" }}><Edit size={12} /></button>
                                <button onClick={() => esPremium ? setReconteoTarget(m) : setShowPremium(true)} className="btn-press-soft" style={{ fontSize: 10.5, fontWeight: 700, color: C.TEAL, background: oscuro ? "#1E3A5F" : "#E3F2FD", border: "none", padding: "6px 9px", borderRadius: 999, cursor: "pointer" }}><RefreshCw size={12} /></button>
                                <button onClick={() => setRestockTarget(m)} className="btn-press-soft" style={{ fontSize: 10.5, fontWeight: 700, color: C.TEAL, background: oscuro ? "#1E3A5F" : "#E3F2FD", border: "none", padding: "6px 9px", borderRadius: 999, cursor: "pointer" }}>Reponer</button>
                                <button onClick={() => setArchivarTarget(m)} className="btn-press-soft" style={{ fontSize: 10.5, fontWeight: 700, color: C.CORAL, background: "transparent", border: "none", padding: "6px 9px", borderRadius: 999, cursor: "pointer" }}><Trash2 size={12} /></button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {meds.length > 4 && (
                      <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: C.MUTED }}>+ {meds.length - 4} medicamentos más. Hazte Premium para verlos todos.</div>
                    )}
                    <button onClick={intentarAgregarMed} data-tutorial="add-med" className="btn-press-soft" style={{ marginTop: 18, width: "100%", background: oscuro ? "#1E3A5F" : "#E3F2FD", border: `1.5px dashed ${oscuro ? "#FFFFFF" : "#1976D2"}`, color: oscuro ? "#FFFFFF" : C.TEAL, padding: 13, borderRadius: 14, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: "0 0 15px rgba(255,255,255,0.4)" }}>
                      {meds.length >= maxMeds ? <><Lock size={16} /> Límite alcanzado — Hazte Premium</> : <><Plus size={16} /> Agregar medicamento</>}
                    </button>
                  </>
                )}
              </>
            )}

            {cuidadorTab === "archivados" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <button onClick={() => setShowMenuLateral(true)} className="btn-press-soft" style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.INK, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6, boxShadow: C.SHADOW }}><Menu size={16} /> Menú</button>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12 }}>Medicamentos Anteriores</div>
                <div style={{ fontSize: 11, color: C.MUTED, marginBottom: 12, fontStyle: "italic" }}>(Medicamentos que ya no se usan porque terminó el tratamiento o fueron suspendidos).</div>
                {medsArchivados.length === 0 ? (
                  <EstadoVacio C={C} icono={History} titulo="Sin historial" texto="Los medicamentos que archives aparecerán aquí." />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {medsArchivados.map((m) => (
                      <div key={m.id} style={{ padding: "14px", borderRadius: 16, background: C.PAPER, border: `1px solid ${C.LINE}` }}>
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: C.MUTED, marginBottom: 8 }}>Desde: {new Date(m.fechaInicio).toLocaleDateString("es-CL")} — Hasta: {m.fechaArchivado ? new Date(m.fechaArchivado).toLocaleDateString("es-CL") : "N/A"}</div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => reactivarMed(m.id)} className="btn-press-soft" style={{ flex: 1, padding: 8, borderRadius: 8, border: "none", background: C.TEAL, color: "#fff", fontWeight: 700, fontSize: 12 }}>Reactivar</button>
                          <button onClick={() => borrarMedFijo(m.id)} className="btn-press-soft" style={{ flex: 1, padding: 8, borderRadius: 8, border: "none", background: "transparent", color: C.CORAL, fontWeight: 700, fontSize: 12 }}>Borrar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {cuidadorTab === "avisos" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <button onClick={() => setShowMenuLateral(true)} className="btn-press-soft" style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.INK, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6, boxShadow: C.SHADOW }}><Menu size={16} /> Menú</button>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12 }}>Avisos enviados</div>
                {smsLog.length === 0 ? (
                  <div style={{ background: oscuro ? "#1B3A2A" : "#E8F5E9", border: `1px solid ${oscuro ? "#2F5A3A" : "#A5D6A7"}`, borderRadius: 16, padding: 40, textAlign: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.GREEN, marginBottom: 4 }}>Todo va bien</div>
                    <div style={{ fontSize: 13, color: C.MUTED }}>Sin avisos por ahora.</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[...smsLog].reverse().map((s, i) => (
                      <div key={i} style={{ background: C.PAPER, borderRadius: 14, padding: 14, borderLeft: `4px solid ${s.tipo === "alerta" ? C.CORAL : C.TEAL}`, boxShadow: C.SHADOW }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.MUTED, marginBottom: 6 }}><span>CuidaMed</span><span>{s.hora}</span></div>
                        <div style={{ fontSize: 13, lineHeight: 1.5 }}>{s.texto}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {cuidadorTab === "historial" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <button onClick={() => setShowMenuLateral(true)} className="btn-press-soft" style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.INK, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6, boxShadow: C.SHADOW }}><Menu size={16} /> Menú</button>
                </div>
                <div style={{ textAlign: "center", padding: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Historial de Adherencia</div>
                  <div style={{ fontSize: 12, color: C.MUTED, marginBottom: 20 }}>Revisa el cumplimiento de los medicamentos.</div>
                  <button onClick={() => setShowCalendario(true)} className="btn-press" style={{ padding: "14px 24px", borderRadius: 14, border: "none", background: C.TEAL, color: "#fff", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "0 auto" }}><Calendar size={18} /> Ver Calendario del Mes</button>
                </div>
              </>
            )}

            {cuidadorTab === "canasta" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <button onClick={() => setShowMenuLateral(true)} className="btn-press-soft" style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.INK, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6, boxShadow: C.SHADOW }}><Menu size={16} /> Menú</button>
                </div>
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Carro y Farmacias</div>
                  {medsCarro.length === 0 ? (
                    <div style={{ background: C.PAPER, padding: 40, borderRadius: 20, border: `1px dashed ${C.LINE}`, color: C.MUTED }}>No hay medicamentos por reabastecer aún.</div>
                  ) : (
                    <button onClick={() => setShowCarroCompleto(true)} className="btn-press" style={{ marginTop: 12, width: "100%", padding: 16, borderRadius: 14, border: "none", background: C.TEAL, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><ShoppingCart size={20} /> Ver {medsCarro.length} medicamentos por comprar</button>
                  )}
                </div>
              </>
            )}

            {cuidadorTab === "contactos" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <button onClick={() => setShowMenuLateral(true)} className="btn-press-soft" style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.INK, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6, boxShadow: C.SHADOW }}><Menu size={16} /> Menú</button>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12 }}>Contactos de emergencia</div>
                {contactos.length === 0 ? (
                  <div style={{ marginBottom: 14 }}>
                    <EstadoVacio C={C} icono={Phone} titulo="Sin contactos aún" texto="Agrega el médico tratante o un familiar para emergencias." />
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                    {contactos.map((c) => (
                      <div key={c.id} style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 14, padding: 14, display: "flex", alignItems: "center", gap: 12, boxShadow: C.SHADOW }}>
                        <div style={{ width: 36, height: 36, borderRadius: 999, background: C.TEAL + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                          {c.tipo === "médico" ? <Activity size={18} color={C.TEAL} /> : c.tipo === "familia" ? <Users size={18} color={C.TEAL} /> : <MapPin size={18} color={C.TEAL} />}
                        </div>
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
                    {[{ v: "médico", l: "Médico" }, { v: "familia", l: "Familia" }, { v: "centro", l: "Centro" }].map((t) => (
                      <button key={t.v} onClick={() => setFormContacto({ ...formContacto, tipo: t.v })} className="btn-press-soft" style={{ flex: 1, padding: 8, borderRadius: 10, border: formContacto.tipo === t.v ? `2px solid ${C.TEAL}` : `1px solid ${C.LINE}`, background: C.PAPER, color: C.INK, fontWeight: 700, fontSize: 11, cursor: "pointer" }}>{t.l}</button>
                    ))}
                  </div>
                  <button onClick={agregarContacto} disabled={!formContacto.nombre.trim() || !formContacto.telefono.trim()} className="btn-press" style={{ width: "100%", padding: 12, borderRadius: 12, border: "none", background: (formContacto.nombre.trim() && formContacto.telefono.trim()) ? C.TEAL : C.LINE, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Agregar</button>
                </div>
              </>
            )}
            
            {cuidadorTab === "cambios" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <button onClick={() => setShowMenuLateral(true)} className="btn-press-soft" style={{ padding: "10px 14px", borderRadius: 12, border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.INK, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6, boxShadow: C.SHADOW }}><Menu size={16} /> Menú</button>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12 }}>Historial de cambios</div>
                {(familia.historialCambios || []).length === 0 ? (
                  <EstadoVacio C={C} icono={FileText} titulo="Sin cambios registrados" texto="Los cambios que hagas en los medicamentos aparecerán aquí." />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[...(familia.historialCambios || [])].reverse().map((h) => (
                      <div key={h.id} style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 12, padding: 12 }}>
                        <div style={{ fontSize: 11, color: C.MUTED, marginBottom: 4 }}>{new Date(h.fecha).toLocaleString("es-CL")} · {h.cuidador}</div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{h.accion}: {h.detalle}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* MODALES GLOBALES */}
        <MenuLateral C={C} abierto={showMenuLateral} onCerrar={() => setShowMenuLateral(false)} tabActual={cuidadorTab} setTabActual={setCuidadorTab} avisosNuevos={smsLog.length} oscuro={oscuro} cuidadorNombre={nombreCuidadorInput || familia?.cuidadores?.[0] || "Cuidador"} elderName={elderName} onCompartir={() => setShowCompartir(true)} onModoOscuro={() => { actualizarSettings({ darkMode: !oscuro }); registrarEvento(codigo, "toggle_dark_mode", !oscuro ? "activado" : "desactivado", { cuidador: nombreCuidadorInput }); }} onAyuda={() => setShowComoFunciona(true)} onAcercaDe={() => setShowAcercaDe(true)} onPolitica={() => setShowPolitica(true)} onPremium={() => setShowPremium(true)} onAjustes={() => setShowAjustes(true)} onSoporte={() => setShowSoporte(true)} onSalir={salirSesion} />
        
        {showComoFunciona && <ComoFunciona C={C} onCerrar={() => setShowComoFunciona(false)} />}
        {showSoporte && <ModalSoporte C={C} onCerrar={() => setShowSoporte(false)} />}
        {showOnboardingPremium && <OnboardingPremium C={C} onCerrar={() => { setShowOnboardingPremium(false); actualizar((prev) => ({ ...prev, settings: { ...prev.settings, onboardingPremiumVisto: true } })); }} />}
        {showAcercaDe && <AcercaDe C={C} onCerrar={() => setShowAcercaDe(false)} />}
        {showPolitica && <PoliticaPrivacidad C={C} onCerrar={() => setShowPolitica(false)} />}
        
        {showAdmin && <PanelAdmin C={C} familias={familiasAdmin} onCerrar={() => setShowAdmin(false)} onAbrirDatos={() => { setShowAdmin(false); setShowDatos(true); }} onAbrirEventos={() => { setShowAdmin(false); setShowEventos(true); }} onAbrirMetricas={() => { setShowAdmin(false); setShowMetricasCORFO(true); }} />}
        {showDatos && <DatosAdministrativos C={C} onCerrar={() => setShowDatos(false)} onReset={() => { try { localStorage.removeItem("datos_admin_global"); } catch (e) {} }} />}
        {showEventos && <VerEventos C={C} onCerrar={() => setShowEventos(false)} />}
        {showMetricasCORFO && <PanelMetricasCORFO C={C} onCerrar={() => setShowMetricasCORFO(false)} />}
        {showReporteMedico && <ModalReporteMedico C={C} onCerrar={() => setShowReporteMedico(false)} elderName={elderName} meds={meds} confirmedByDate={confirmedByDate} />}
        {showCalendario && <CalendarioHistorial C={C} onCerrar={() => setShowCalendario(false)} meds={meds} confirmedByDate={confirmedByDate} />}
        {showCarroCompleto && <CarroCompleto C={C} meds={medsCarro} onCerrar={() => setShowCarroCompleto(false)} onElegirFarmacia={abrirFarmaciaCarro} />}

        {showSelectorRol && <SelectorRol C={C} onSeleccionar={(rol) => seleccionarRol(rol)} onCerrar={() => setShowSelectorRol(false)} />}
        {showOnboarding && <OnboardingCORFO C={C} onCerrar={completarOnboarding} onGuardar={completarOnboarding} />}

        {showTutorial && <TutorialInteractivo pasos={PASOS_TUTORIAL} onCerrar={() => { setShowTutorial(false); actualizar((prev) => ({ ...prev, settings: { ...prev.settings, tutorialVisto: true } })); registrarEvento(codigo, "tutorial_completado", "Tutorial finalizado", { cuidador: nombreCuidadorInput }); }} C={C} onAbrirMenu={() => setShowMenuLateral(true)} />}

        {showContactos && (
          <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 35 }}>
            <div className="modal-scale" style={{ width: "100%", maxWidth: 360, background: C.CREAM, borderRadius: 24, padding: 24, margin: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 18, display: "flex", alignItems: "center", gap: 8 }}><Phone size={18} color={C.CORAL} /> Emergencia</div>
                <button onClick={() => setShowContactos(false)} className="btn-press-soft" style={{ border: "none", background: C.LINE, borderRadius: 999, width: 30, height: 30, cursor: "pointer" }}><X size={15} color={C.INK} /></button>
              </div>
              {contactos.length === 0 ? (<div style={{ textAlign: "center", fontSize: 13, color: C.MUTED, padding: 20 }}>Aún no hay contactos cargados.</div>) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {contactos.map((c) => (
                    <a key={c.id} href={`tel:${c.telefono}`} className="btn-press-soft" style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 14, textDecoration: "none", color: C.INK }}>
                      <div style={{ width: 40, height: 40, borderRadius: 999, background: C.CORAL + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {c.tipo === "médico" ? <Activity size={18} color={C.CORAL} /> : c.tipo === "familia" ? <Users size={18} color={C.CORAL} /> : <MapPin size={18} color={C.CORAL} />}
                      </div>
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
                <button onClick={() => setShowNotas(null)} className="btn-press-soft" style={{ border: "none", background: C.LINE, borderRadius: 999, width: 30, height: 30, cursor: "pointer" }}><X size={15} color={C.INK} /></button>
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
                <button onClick={() => setShowCompartir(false)} className="btn-press-soft" style={{ border: "none", background: C.LINE, borderRadius: 999, width: 32, height: 32, cursor: "pointer" }}><X size={16} color={C.INK} /></button>
              </div>
              <button onClick={() => compartirWhatsApp("resumen")} className="btn-press-soft" style={{ width: "100%", padding: 14, borderRadius: 12, border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.INK, fontWeight: 700, fontSize: 14, cursor: "pointer", marginBottom: 10, textAlign: "left", display: "flex", alignItems: "center", gap: 12 }}><FileText size={18} color={C.TEAL} /> Resumen del día</button>
              <button onClick={() => compartirWhatsApp("meds")} className="btn-press-soft" style={{ width: "100%", padding: 14, borderRadius: 12, border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.INK, fontWeight: 700, fontSize: 14, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12 }}><PackageOpen size={18} color={C.TEAL} /> Lista completa de medicamentos</button>
            </div>
          </div>
        )}

        {showAddPersona && (
          <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 33 }}>
            <div className="modal-scale" style={{ width: "100%", maxWidth: 360, background: C.CREAM, borderRadius: 20, padding: 24, margin: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Agregar paciente</div>
              <input value={nombrePersonaNueva} onChange={(e) => setNombrePersonaNueva(e.target.value)} placeholder="Ej. Pedro González" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.LINE}`, fontSize: 14, marginBottom: 10, boxSizing: "border-box", background: C.PAPER, color: C.INK, outline: "none" }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, marginBottom: 6 }}><Cake size={12} /> EDAD (OPCIONAL)</div>
              <input type="number" min="0" max="120" value={edadPersonaNueva} onChange={(e) => setEdadPersonaNueva(e.target.value)} placeholder="Ej. 82" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.LINE}`, fontSize: 14, marginBottom: 14, boxSizing: "border-box", background: C.PAPER, color: C.INK, outline: "none" }} />
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { setShowAddPersona(false); setNombrePersonaNueva(""); setEdadPersonaNueva(""); }} className="btn-press-soft" style={{ flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.MUTED, fontWeight: 700, cursor: "pointer" }}>Cancelar</button>
                <button onClick={agregarPersona} disabled={!nombrePersonaNueva || !nombrePersonaNueva.trim()} className="btn-press" style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: (nombrePersonaNueva && nombrePersonaNueva.trim()) ? C.TEAL : C.LINE, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Agregar</button>
              </div>
            </div>
          </div>
        )}

        {showLimite && (
          <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 32 }}>
            <div className="modal-scale" style={{ width: "100%", maxWidth: 360, background: C.CREAM, borderRadius: 24, padding: 26, margin: 20, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
              <div style={{ width: 64, height: 64, borderRadius: 999, background: C.GOLD + "15", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}><Lock size={30} color={C.GOLD} strokeWidth={2.2} /></div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Llegaste al límite</div>
              <div style={{ fontSize: 13, color: C.MUTED, marginBottom: 18 }}>{showLimite === "meds" ? "En Estándar puedes tener hasta 4 medicamentos." : "En Estándar puedes cuidar a 1 persona."} Con Premium, sin límites.</div>
              <button onClick={() => { setShowLimite(null); setShowPremium(true); }} className="btn-press" style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${C.GOLD}, #E65100)`, color: "#fff", fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>Ver Premium</button>
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
                <button onClick={() => setShowPremium(false)} className="btn-press-soft" style={{ border: "none", background: C.LINE, borderRadius: 999, width: 32, height: 32, cursor: "pointer" }}><X size={16} color={C.INK} /></button>
              </div>
              <div style={{ background: `linear-gradient(135deg, ${C.GOLD}, #E65100)`, borderRadius: 16, padding: 20, color: "#fff", marginBottom: 18, textAlign: "center", boxShadow: "0 8px 24px rgba(249,168,37,0.35)" }}>
                <div style={{ fontSize: 30, fontWeight: 800 }}>$3.990</div>
                <div style={{ fontSize: 12, opacity: 0.9 }}>al mes · o $29.990 al año</div>
              </div>
              <div style={{ background: C.PAPER, border: `1px solid ${C.LINE}`, borderRadius: 14, padding: 14, marginBottom: 16, fontSize: 12.5, lineHeight: 1.8, boxShadow: C.SHADOW }}>
                <div>Medicamentos ilimitados</div>
                <div>Hasta 3 personas mayores</div>
                <div>Cuidadores ilimitados</div>
                <div>Reconteo manual del stock</div>
                <div>Reporte de Adherencia</div>
                <div>Detección de cambio de patrón</div>
                <div>Funciona sin conexión</div>
              </div>

              <div style={{ background: C.BG, border: `1px solid ${C.TEAL}40`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.TEAL, marginBottom: 8 }}>Solicitar activación manual</div>
                <div style={{ fontSize: 12, color: C.MUTED, marginBottom: 12 }}>Como aún no tenemos pasarela de pago, déjanos tu mensaje y te contactaremos para activar tu plan.</div>
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const btn = e.target.querySelector('button[type="submit"]');
                    btn.innerText = "Enviando...";
                    btn.disabled = true;
                    try {
                      await fetch("https://formsubmit.co/ajax/hola.contigosiempre@gmail.com", {
                        method: "POST",
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        body: JSON.stringify({
                          _subject: "Nueva Solicitud de Plan Premium",
                          Nombre: formData.get("nombre"),
                          Mensaje: formData.get("mensaje"),
                          CodigoFamilia: codigo,
                          CuidadorRegistrado: nombreCuidadorInput
                        })
                      });
                      btn.innerText = "¡Mensaje Enviado!";
                      btn.style.background = C.GREEN;
                      setTimeout(() => { setShowPremium(false); }, 2000);
                      registrarEvento(codigo, "solicitud_premium", "Usuario envió formulario de Premium", { cuidador: nombreCuidadorInput });
                    } catch (err) {
                      btn.innerText = "Error. Intenta de nuevo.";
                      btn.disabled = false;
                    }
                  }}
                >
                  <input name="nombre" required defaultValue={nombreCuidadorInput} placeholder="Tu nombre" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.LINE}`, fontSize: 13, marginBottom: 8, boxSizing: "border-box", background: C.PAPER, color: C.INK, outline: "none" }} />
                  <textarea name="mensaje" required defaultValue={`Hola, quiero el plan Premium para mi familiar. Mi código es ${codigo}.`} rows={3} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.LINE}`, fontSize: 13, marginBottom: 10, boxSizing: "border-box", background: C.PAPER, color: C.INK, outline: "none", resize: "vertical" }} />
                  <button type="submit" className="btn-press" style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", background: C.TEAL, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Enviar Solicitud</button>
                </form>
              </div>

              <div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, marginBottom: 6 }}>¿YA TIENES UN CÓDIGO?</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={codigoPremium} onChange={(e) => setCodigoPremium(e.target.value)} placeholder="Ingresa tu código" style={{ flex: 1, padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.LINE}`, fontSize: 13, boxSizing: "border-box", background: C.PAPER, color: C.INK, outline: "none" }} />
                <button onClick={canjearCodigo} className="btn-press" style={{ padding: "12px 18px", borderRadius: 12, border: "none", background: C.TEAL, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Canjear</button>
              </div>
              
              {esAdmin && (
                <button onClick={() => { setShowPremium(false); setShowMetricasCORFO(true); }} className="btn-press-soft" style={{ width: "100%", marginTop: 14, padding: 12, borderRadius: 12, border: `1px solid ${C.TEAL}`, background: "transparent", color: C.TEAL, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><BarChart3 size={16} /> Ver Métricas CORFO</button>
              )}
            </div>
          </div>
        )}

        {showAdd && (
          <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.55)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 25 }}>
            <div className="modal-slide" style={{ width: "100%", maxWidth: 420, background: C.CREAM, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 -8px 30px rgba(0,0,0,0.25)" }}>
              <div style={{ width: 40, height: 4, background: C.LINE, borderRadius: 999, margin: "0 auto 16px" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><div style={{ fontWeight: 700, fontSize: 17 }}>{editandoId ? "Editar medicamento" : "Nuevo medicamento"}</div><button onClick={() => setShowAdd(false)} className="btn-press-soft" style={{ border: "none", background: C.LINE, borderRadius: 999, width: 30, height: 30, cursor: "pointer" }}><X size={16} color={C.INK} /></button></div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, marginBottom: 6 }}>NOMBRE</div>
              <input value={form.name || ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, receta: null, criticidad: null }))} placeholder="Ej. Losartán" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.LINE}`, fontSize: 14, marginBottom: 8, boxSizing: "border-box", background: C.PAPER, color: C.INK, outline: "none" }} />
              {form.name && form.name.trim().length > 2 && detectarCriticidad(form.name) === "vital" && (<div style={{ background: "#FFEBEE", border: `1px solid #FFCDD2`, borderRadius: 12, padding: "10px 12px", fontSize: 12, color: C.CORAL, marginBottom: 10, fontWeight: 600 }}>Medicamento vital. Aviso fijo a los 2 min.</div>)}
              <div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, marginBottom: 8 }}>NIVEL DE CRITICIDAD</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                {[{ v: "vital", l: "Vital", c: C.CORAL }, { v: "importante", l: "Importante", c: C.AMBER }, { v: "normal", l: "Normal", c: C.GREEN }].map((op) => (
                  <button key={op.v} onClick={() => setForm((f) => ({ ...f, criticidad: op.v }))} className="btn-press-soft" style={{ flex: 1, padding: 10, borderRadius: 10, border: (form.criticidad || detectarCriticidad(form.name || "")) === op.v ? `2px solid ${op.c}` : `1.5px solid ${C.LINE}`, background: C.PAPER, color: C.INK, fontWeight: 700, fontSize: 11, cursor: "pointer" }}>{op.l}</button>
                ))}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, marginBottom: 6 }}>INDICACIÓN</div>
              <input value={form.dose || ""} onChange={(e) => setForm((f) => ({ ...f, dose: e.target.value }))} placeholder="Ej. 1 pastilla" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.LINE}`, fontSize: 14, marginBottom: 14, boxSizing: "border-box", background: C.PAPER, color: C.INK, outline: "none" }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, marginBottom: 6 }}>NOTAS (OPCIONAL)</div>
              <textarea value={form.notas || ""} onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))} placeholder="Ej. No tomarlo con lácteos" rows={2} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.LINE}`, fontSize: 13, marginBottom: 14, boxSizing: "border-box", background: C.PAPER, color: C.INK, outline: "none" }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, marginBottom: 6 }}>RECETA VENCE (OPCIONAL)</div>
              <input type="date" value={form.recetaVence || ""} onChange={(e) => setForm((f) => ({ ...f, recetaVence: e.target.value }))} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.LINE}`, fontSize: 14, marginBottom: 14, boxSizing: "border-box", background: C.PAPER, color: C.INK, outline: "none" }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, marginBottom: 6 }}>HORARIOS</div>
              {(form.times || ["08:00"]).map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <CampoHora C={C} valor={t} oscuro={oscuro} onCambio={(nuevo) => setForm((f) => ({ ...f, times: (f.times || ["08:00"]).map((x, xi) => (xi === i ? nuevo : x)) }))} />
                  {(form.times || []).length > 1 && (<button onClick={() => setForm((f) => ({ ...f, times: (f.times || ["08:00"]).filter((_, xi) => xi !== i) }))} className="btn-press-soft" style={{ width: 42, borderRadius: 12, border: `1.5px solid ${C.LINE}`, background: C.PAPER, color: C.CORAL, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={15} /></button>)}
                </div>
              ))}
              <button onClick={() => setForm((f) => ({ ...f, times: [...(f.times || ["08:00"]), "12:00"] }))} className="btn-press-soft" style={{ fontSize: 12, fontWeight: 700, color: C.TEAL, background: oscuro ? "#1E3A5F" : "#E3F2FD", border: "none", padding: "8px 14px", borderRadius: 999, cursor: "pointer", marginBottom: 14 }}>+ Agregar horario</button>
              <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 100px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, marginBottom: 6 }}>DOSIS/TOMA</div>
                  <input type="number" step="0.5" min="0.5" value={form.doseAmount || 1} onChange={(e) => setForm((f) => ({ ...f, doseAmount: Number(e.target.value) || 1 }))} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.LINE}`, fontSize: 14, boxSizing: "border-box", background: C.PAPER, color: C.INK, outline: "none" }} />
                </div>
                <div style={{ flex: "1 1 100px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, marginBottom: 6 }}>UNIDAD</div>
                  <select value={form.unidad || "Pastilla"} onChange={(e) => setForm((f) => ({ ...f, unidad: e.target.value }))} style={{ width: "100%", padding: "12px 10px", borderRadius: 12, border: `1.5px solid ${C.LINE}`, fontSize: 14, boxSizing: "border-box", background: C.PAPER, color: C.INK, outline: "none" }}>
                    <option value="Pastilla">Pastilla</option>
                    <option value="Cápsula">Cápsula</option>
                    <option value="Ml">Ml</option>
                    <option value="Gotas">Gotas</option>
                    <option value="Inyección">Inyección</option>
                  </select>
                </div>
                <div style={{ flex: "1 1 100px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.MUTED, marginBottom: 6 }}>STOCK</div>
                  <input type="number" min="0" value={form.stock ?? 30} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value === "" ? "" : Number(e.target.value) }))} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.LINE}`, fontSize: 14, boxSizing: "border-box", background: C.PAPER, color: C.INK, outline: "none" }} />
                </div>
              </div>
              <button onClick={agregarMed} disabled={!form.name || !form.name.trim()} className="btn-press" style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", fontWeight: 700, fontSize: 15, background: (form.name && form.name.trim()) ? C.TEAL : C.LINE, color: "#fff", cursor: "pointer" }}>Agregar</button>
            </div>
          </div>
        )}

        {archivarTarget && (
          <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 28 }}>
            <div className="modal-scale" style={{ width: "100%", maxWidth: 360, background: C.CREAM, borderRadius: 24, padding: 26, margin: 20, textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: 999, background: C.CORAL + "15", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}><Trash2 size={30} color={C.CORAL} strokeWidth={2.2} /></div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>¿Terminar tratamiento de {archivarTarget.name}?</div>
              <div style={{ fontSize: 13, color: C.MUTED, marginBottom: 18 }}>Se archivará y podrás verlo en "Medicamentos anteriores".</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setArchivarTarget(null)} className="btn-press-soft" style={{ flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${C.LINE}`, background: C.PAPER, color: C.MUTED, fontWeight: 700, cursor: "pointer" }}>Cancelar</button>
                <button onClick={() => archivarMed(archivarTarget.id)} className="btn-press" style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: C.CORAL, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Sí, terminar</button>
              </div>
            </div>
          </div>
        )}

        {restockTarget && (
          <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 26 }}>
            <div className="modal-scale" style={{ width: "100%", maxWidth: 340, background: C.CREAM, borderRadius: 20, padding: 24, textAlign: "center", margin: 20 }}>
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
            <div className="modal-scale" style={{ width: "100%", maxWidth: 360, background: C.CREAM, borderRadius: 20, padding: 24, textAlign: "center", margin: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: 999, background: C.GOLD + "15", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}><RefreshCw size={26} color={C.GOLD} strokeWidth={2.2} /></div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Reconteo Manual de {reconteoTarget.name}</div>
              <div style={{ fontSize: 12, color: C.MUTED, marginTop: 8, marginBottom: 14 }}>Ingresa el stock real que tienes actualmente.</div>
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
            <div className="modal-scale" style={{ width: "100%", maxWidth: 340, background: C.CREAM, borderRadius: 20, padding: 24, margin: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 999, background: C.GOLD + "15", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><Sparkles size={22} color={C.GOLD} /></div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{linkAbierto.farmacia ? `Ir a ${linkAbierto.farmacia}` : "Abrir enlace"}</div>
              <a href={linkAbierto.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", fontSize: 13, color: C.TEAL, wordBreak: "break-all", background: C.PAPER, padding: 10, borderRadius: 10, border: `1px solid ${C.LINE}`, textDecoration: "underline", marginBottom: 14 }}>{linkAbierto.url}</a>
              <button onClick={() => setLinkAbierto(null)} className="btn-press" style={{ width: "100%", padding: 12, borderRadius: 12, border: "none", background: C.TEAL, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Cerrar</button>
            </div>
          </div>
        )}

        {showAjustes && (
          <div className="modal-fade" style={{ position: "fixed", inset: 0, background: "rgba(26,35,126,0.55)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 27 }}>
            <div className="modal-slide" style={{ width: "100%", maxWidth: 420, background: C.CREAM, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ width: 40, height: 4, background: C.LINE, borderRadius: 999, margin: "0 auto 16px" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 18 * scale }}>Ajustes</div>
                <button onClick={() => setShowAjustes(false)} className="btn-press-soft" style={{ border: "none", background: C.LINE, borderRadius: 999, width: 32, height: 32, cursor: "pointer" }}><X size={16} color={C.INK} /></button>
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, color: C.MUTED, marginBottom: 10 }}>NOTIFICACIONES</div>
              <button onClick={() => { actualizarSettings({ notificarConfirmacion: !settings.notificarConfirmacion }); }} className="btn-press-soft" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 16, border: `1px solid ${C.LINE}`, background: C.PAPER, cursor: "pointer", marginBottom: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}><BellRing size={18} color={settings.notificarConfirmacion ? C.TEAL : C.MUTED} /> Avisarme cuando confirmen</span>
                <span style={{ width: 46, height: 26, borderRadius: 999, background: settings.notificarConfirmacion ? C.TEAL : C.LINE, position: "relative" }}><span style={{ position: "absolute", top: 3, left: settings.notificarConfirmacion ? 23 : 3, width: 20, height: 20, borderRadius: 999, background: "#fff", transition: "left 0.2s ease" }} /></span>
              </button>
              <div style={{ fontSize: 11, color: C.MUTED, marginBottom: 16, marginLeft: 28 }}>
                (Recibirás una notificación cuando el adulto mayor confirme su toma)
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, color: C.MUTED, marginBottom: 10 }}>ALERTAS DEL ADULTO MAYOR</div>
              <button onClick={() => { actualizarSettings({ sonidoActivo: !settings.sonidoActivo }); }} className="btn-press-soft" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 16, border: `1px solid ${C.LINE}`, background: C.PAPER, cursor: "pointer", marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}>{settings.sonidoActivo ? <Volume2 size={18} color={C.TEAL} /> : <VolumeX size={18} color={C.MUTED} />} Alerta con sonido</span>
                <span style={{ width: 46, height: 26, borderRadius: 999, background: settings.sonidoActivo ? C.TEAL : C.LINE, position: "relative" }}><span style={{ position: "absolute", top: 3, left: settings.sonidoActivo ? 23 : 3, width: 20, height: 20, borderRadius: 999, background: "#fff", transition: "left 0.2s ease" }} /></span>
              </button>

              <div style={{ fontSize: 13, fontWeight: 700, color: C.MUTED, marginBottom: 10 }}>PREFERENCIAS VISUALES</div>
              <button onClick={() => { actualizarSettings({ darkMode: !oscuro }); }} className="btn-press-soft" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 16, border: `1px solid ${C.LINE}`, background: C.PAPER, cursor: "pointer", marginBottom: 20 }}>
                <span style={{ fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}>{oscuro ? <Sun size={18} color={C.AMBER} /> : <Moon size={18} color={C.MUTED} />} Modo oscuro</span>
                <span style={{ width: 46, height: 26, borderRadius: 999, background: oscuro ? C.TEAL : C.LINE, position: "relative" }}><span style={{ position: "absolute", top: 3, left: oscuro ? 23 : 3, width: 20, height: 20, borderRadius: 999, background: "#fff", transition: "left 0.2s ease" }} /></span>
              </button>

              <div style={{ fontSize: 13, fontWeight: 700, color: C.MUTED, marginBottom: 10 }}>ACCESIBILIDAD</div>
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                {["normal", "grande", "muy_grande"].map(t => (
                  <button key={t} onClick={() => actualizarSettings({ fontSize: t })} className="btn-press-soft" style={{ flex: 1, padding: "10px 4px", borderRadius: 10, border: settings.fontSize === t ? `2px solid ${C.TEAL}` : `1px solid ${C.LINE}`, background: C.PAPER, color: C.INK, fontWeight: 700, fontSize: 11, cursor: "pointer" }}>
                    {t === "normal" ? "Normal" : t === "grande" ? "Grande" : "Muy Grande"}
                  </button>
                ))}
              </div>
              <button onClick={() => { actualizarSettings({ daltonico: !settings.daltonico }); }} className="btn-press-soft" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 16, border: `1px solid ${C.LINE}`, background: C.PAPER, cursor: "pointer", marginBottom: 20 }}>
                <span style={{ fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}><Eye size={18} color={settings.daltonico ? C.TEAL : C.MUTED} /> Modo Daltónico</span>
                <span style={{ width: 46, height: 26, borderRadius: 999, background: settings.daltonico ? C.TEAL : C.LINE, position: "relative" }}><span style={{ position: "absolute", top: 3, left: settings.daltonico ? 23 : 3, width: 20, height: 20, borderRadius: 999, background: "#fff", transition: "left 0.2s ease" }} /></span>
              </button>
              
              <button onClick={salirSesion} className="btn-press-soft" style={{ width: "100%", padding: 14, borderRadius: 14, border: `1px solid ${C.CORAL}`, background: "transparent", color: C.CORAL, fontWeight: 700, cursor: "pointer", marginBottom: 12 }}>
                Cerrar sesión / Cambiar de cuenta
              </button>

              <button onClick={() => setShowAjustes(false)} className="btn-press" style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: C.TEAL, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Listo</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
