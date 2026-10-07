const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

// ============================================================
// CONFIGURACIÓN
// ============================================================
const UMBRAL_MIN = { vital: 15, importante: 60, normal: 120 };
const HORA_RESUMEN_DIARIO = 21;

// ============================================================
// FUNCIÓN PRINCIPAL: Revisa cada 1 minuto si hay tomas pendientes
// ============================================================
exports.revisarRecordatorios = functions.pubsub
  .schedule("every 1 minutes")
  .timeZone("America/Santiago")
  .onRun(async (context) => {
    const ahora = new Date();
    const ahoraMin = ahora.getHours() * 60 + ahora.getMinutes();
    const hoy = fechaLocal(ahora);

    console.log(`[${ahora.toISOString()}] Revisando recordatorios...`);

    try {
      const familiasSnap = await db.collection("familias").get();

      for (const familiaDoc of familiasSnap.docs) {
        const familia = familiaDoc.data();
        const token = familia.tokenNotificaciones;

        if (!token) continue;

        const personas = familia.personas || [];

        for (const persona of personas) {
          const meds = persona.meds || [];
          const confirmedHoy = (persona.confirmedByDate || {})[hoy] || {};
          const posposiciones = (persona.posposicionesHoy || {}) || {};

          for (const med of meds) {
            const times = med.times || [];
            const crit = med.criticidad || "normal";
            const modo = med.modoAviso || (crit === "importante" ? "inmediato" : "final_dia");
            const umbral = UMBRAL_MIN[crit] || 120;
            const ventana = med.ventanaMin || 0;

            for (const hora of times) {
              const horaMin = horaAMinutos(hora);
              const key = `${med.id}__${hora}`;

              if (confirmedHoy[key]) continue;

              const pospuestaHasta = posposiciones[key];
              if (pospuestaHasta && pospuestaHasta > ahora.getTime()) {
                continue;
              }

              const esReactivacion = pospuestaHasta && pospuestaHasta <= ahora.getTime();

              const diff = ahoraMin - horaMin;

              let debeNotificar = false;

              if (esReactivacion) {
                debeNotificar = true;
              } else if (modo === "inmediato" && diff >= 0 && diff <= umbral + ventana + 5) {
                debeNotificar = true;
              } else if (modo === "final_dia" && ahoraMin >= HORA_RESUMEN_DIARIO * 60) {
                debeNotificar = true;
              }

              if (!debeNotificar) continue;

              const notifKey = `notif_${med.id}_${hora}_${hoy}`;
              const yaNotificada = persona[notifKey];
              if (yaNotificada && !esReactivacion) continue;

              try {
                await admin.messaging().send({
                  token: token,
                  notification: {
                    title: esReactivacion ? "⏰ Recordatorio (pospuesto)" : "💊 Es hora de tu medicamento",
                    body: `${med.name} — ${med.dose || "1 dosis"}`,
                  },
                  data: {
                    tipo: "recordatorio",
                    medId: String(med.id),
                    hora: hora,
                    personaId: String(persona.id),
                    familiaCodigo: familiaDoc.id,
                  },
                  webpush: {
                    fcmOptions: { link: "https://contigo-siempre.vercel.app" },
                    notification: {
                      requireInteraction: true,
                      tag: `med-${med.id}-${hora}`,
                    },
                  },
                });
                console.log(`✅ Notificación enviada: ${med.name} a las ${hora} (familia ${familiaDoc.id})`);
              } catch (err) {
                console.error(`❌ Error al notificar a ${familiaDoc.id}:`, err.message);
                if (err.code === "messaging/registration-token-not-registered") {
                  await familiaDoc.ref.update({ tokenNotificaciones: admin.firestore.FieldValue.delete() });
                }
              }

              const personasActualizadas = personas.map((p) => {
                if (p.id !== persona.id) return p;
                const nuevasPosposiciones = { ...(p.posposicionesHoy || {}) };
                if (esReactivacion) delete nuevasPosposiciones[key];
                return {
                  ...p,
                  [notifKey]: true,
                  posposicionesHoy: nuevasPosposiciones,
                };
              });

              await familiaDoc.ref.update({ personas: personasActualizadas });
            }
          }
        }
      }
    } catch (err) {
      console.error("Error general:", err);
    }
  });

// ============================================================
// FUNCIÓN: Resumen diario a las 21:00
// ============================================================
exports.resumenDiario = functions.pubsub
  .schedule("0 21 * * *")
  .timeZone("America/Santiago")
  .onRun(async (context) => {
    const hoy = fechaLocal(new Date());
    console.log(`[${hoy}] Enviando resumen diario...`);

    try {
      const familiasSnap = await db.collection("familias").get();

      for (const familiaDoc of familiasSnap.docs) {
        const familia = familiaDoc.data();
        const tokenCuidador = familia.tokenCuidador;
        if (!tokenCuidador) continue;

        const personas = familia.personas || [];
        let mensajes = [];

        for (const persona of personas) {
          const meds = persona.meds || [];
          const confirmedHoy = (persona.confirmedByDate || {})[hoy] || {};

          let esperadas = 0;
          let confirmadas = 0;

          for (const med of meds) {
            for (const hora of (med.times || [])) {
              esperadas++;
              if (confirmedHoy[`${med.id}__${hora}`]) confirmadas++;
            }
          }

          const olvidos = esperadas - confirmadas;
          if (olvidos > 0) {
            mensajes.push(`${persona.nombre}: ${confirmadas}/${esperadas} tomas confirmadas (${olvidos} olvidos)`);
          }
        }

        if (mensajes.length === 0) continue;

        try {
          await admin.messaging().send({
            token: tokenCuidador,
            notification: {
              title: "📋 Resumen del día",
              body: mensajes.join(" · "),
            },
            data: { tipo: "resumen_diario" },
          });
          console.log(`✅ Resumen enviado a familia ${familiaDoc.id}`);
        } catch (err) {
          console.error(`❌ Error resumen ${familiaDoc.id}:`, err.message);
        }
      }
    } catch (err) {
      console.error("Error general resumen:", err);
    }
  });

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================
function fechaLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function horaAMinutos(hora) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}
