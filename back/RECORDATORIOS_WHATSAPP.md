# Plan de Implementación: Recordatorios Automáticos de WhatsApp

## 📋 Resumen Ejecutivo

Implementar un sistema que envíe mensajes de WhatsApp automáticamente cada día a las 8:00 AM con recordatorios de las sesiones del día siguiente.

---

## 🔍 Consideraciones Previas

### 1. Infraestructura de WhatsApp

Tienes **3 opciones** para implementar WhatsApp:

#### ✅ Opción A: WhatsApp Business API (Meta)

**Mejor para producción**

- Requiere cuenta de Meta Business
- Costo: ~0.05€ por mensaje
- Ideal para volumen alto
- Mayor control y estadísticas
- Setup: 1-2 semanas (aprobación de Meta)
- ⚠️ Pasos: Solicitar acceso en Meta → Verificar negocio → Obtener credentials

#### ✅ Opción B: Twilio (RECOMENDADO para MVP)

**Mejor para empezar rápido**

- Cuenta Twilio + número WhatsApp Business
- Costo: ~0.01€ por mensaje
- Setup muy rápido (5 minutos)
- Excelente documentación
- Perfect para testing y pruebas
- ✨ **Recomendación: Empieza por aquí**

#### ❌ Opción C: Baileys/WhatsApp Web (NO RECOMENDADO)

- Viola términos de servicio de WhatsApp
- Riesgo de baneo de cuenta
- **Evitar completamente**

---

## 🏗️ Arquitectura del Sistema

```
┌──────────────────────────────────────┐
│   Node-Cron (Scheduler)              │
│   ├─ Corre cada día a las 8:00 AM   │
│   └─ Dispara recordatoriosJob()      │
└─────────────┬──────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│   getPendingReminders()              │
│   └─ Obtiene sesiones del día        │
│      siguiente (mañana)              │
└─────────────┬──────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│   Procesamiento de sesiones          │
│   ├─ Generar mensaje                 │
│   ├─ Obtener teléfono del paciente  │
│   └─ Preparar envío                  │
└─────────────┬──────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│   sendWhatsAppMessage()              │
│   └─ API de Twilio/WhatsApp          │
└─────────────┬──────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│   Guardar en reminder_logs           │
│   └─ Status: sent/failed             │
└──────────────────────────────────────┘
```

---

## 📦 Paso 1: Instalar Dependencias

```bash
npm install node-cron twilio dotenv
```

**Explicación:**

- `node-cron`: Scheduler para ejecutar tareas en horarios específicos
- `twilio`: Cliente de Twilio para enviar mensajes de WhatsApp
- `dotenv`: Gestionar variables de entorno (credenciales)

---

## 💾 Paso 2: Crear Tabla de Logs

Esta tabla registrará todos los recordatorios enviados (éxito o error).

```sql
CREATE TABLE reminder_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  session_id BIGINT NOT NULL,
  patient_phone VARCHAR(20) NOT NULL,
  message_sent LONGTEXT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('sent', 'failed', 'pending') DEFAULT 'pending',
  error_message TEXT,
  twilio_sid VARCHAR(100),
  is_active TINYINT(1) DEFAULT 1,
  FOREIGN KEY (session_id) REFERENCES sessions(id),
  KEY idx_session (session_id),
  KEY idx_sent_at (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

**Campos:**

- `session_id`: Referencia a la sesión
- `patient_phone`: Teléfono del paciente
- `message_sent`: Mensaje enviado (para auditoría)
- `status`: sent/failed/pending
- `twilio_sid`: ID único de Twilio para tracking
- `error_message`: Razón del fallo (si aplica)

---

## 🔐 Paso 3: Configurar Variables de Entorno

Añadir a tu archivo `.env`:

```env
# WhatsApp Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+34XXXXXXXXXX
TWILIO_PHONE_NUMBER=+34XXXXXXXXXX
```

**Cómo obtener estas credenciales:**

1. Crear cuenta en [twilio.com](https://www.twilio.com)
2. Ir a Console → Account Info
3. Copiar `Account SID` y `Auth Token`
4. Comprar número WhatsApp Business (~$1 USD/mes)
5. Verificar tu negocio

---

## 🔌 Paso 4: Crear Servicio WhatsApp (whatsappService.js)

Archivo: `/back/utils/whatsappService.js`

```javascript
const twilio = require("twilio");
const logger = require("./logger");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

/**
 * Enviar mensaje de WhatsApp a través de Twilio
 * @param {string} toPhone - Teléfono del destinatario (ej: 666123456 o +34666123456)
 * @param {string} message - Contenido del mensaje
 * @returns {Promise<Object>} Resultado del envío
 */
const sendWhatsAppMessage = async (toPhone, message) => {
  try {
    // Formatear teléfono: asegurar que tenga +34
    const formattedPhone = toPhone.startsWith("+")
      ? toPhone
      : `+34${toPhone.replace(/^0/, "")}`;

    logger.log(`📱 Enviando WhatsApp a ${formattedPhone}...`);

    const result = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${formattedPhone}`,
      body: message,
    });

    logger.log(`✅ Mensaje enviado. SID: ${result.sid}`);

    return {
      success: true,
      twilio_sid: result.sid,
      timestamp: new Date(),
    };
  } catch (error) {
    logger.error(`❌ Error enviando WhatsApp: ${error.message}`);
    return {
      success: false,
      error: error.message,
      timestamp: new Date(),
    };
  }
};

module.exports = {
  sendWhatsAppMessage,
};
```

---

## ⏰ Paso 5: Crear Scheduler (reminderScheduler.js)

Archivo: `/back/schedulers/reminderScheduler.js`

```javascript
const cron = require("node-cron");
const logger = require("../utils/logger");
const { getPendingReminders } = require("../models/reminders/reminders_model");
const { sendWhatsAppMessage } = require("../utils/whatsappService");

/**
 * Inicializar scheduler para recordatorios automáticos
 * Ejecuta cada día a las 8:00 AM
 * @param {Object} db - Pool de conexión a BD
 */
const scheduleReminders = (db) => {
  // Expresión cron: 0 8 * * * = 8:00 AM todos los días
  cron.schedule("0 8 * * *", async () => {
    logger.log("═══════════════════════════════════════════════════════");
    logger.log(
      "[SCHEDULER] ⏰ Iniciando envío de recordatorios automáticos...",
    );
    logger.log("═══════════════════════════════════════════════════════");

    try {
      // 1. Obtener sesiones pendientes (mañana)
      const result = await getPendingReminders(db);
      logger.log(
        `📋 Se encontraron ${result.sessions.length} sesiones para recordar`,
      );

      if (result.sessions.length === 0) {
        logger.log("ℹ️ No hay sesiones para recordar mañana");
        return;
      }

      let successCount = 0;
      let failureCount = 0;

      // 2. Processar cada sesión
      for (const session of result.sessions) {
        try {
          // Generar mensaje personalizado
          const message = generarMensajeRecordatorio(session);
          logger.log(`\n📝 Mensaje para ${session.patient_name}:`);
          logger.log(`${message}\n`);

          // Enviar por WhatsApp
          const sendResult = await sendWhatsAppMessage(
            session.patient_phone,
            message,
          );

          // Guardar log de envío
          if (sendResult.success) {
            await guardarLogReminder(db, {
              session_id: session.id,
              patient_phone: session.patient_phone,
              message_sent: message,
              status: "sent",
              twilio_sid: sendResult.twilio_sid,
            });
            logger.log(`✅ Recordatorio enviado a ${session.patient_name}`);
            successCount++;
          } else {
            await guardarLogReminder(db, {
              session_id: session.id,
              patient_phone: session.patient_phone,
              message_sent: message,
              status: "failed",
              error_message: sendResult.error,
            });
            logger.error(
              `❌ Error enviando a ${session.patient_name}: ${sendResult.error}`,
            );
            failureCount++;
          }
        } catch (sessionError) {
          logger.error(
            `⚠️ Error procesando sesión ${session.id}: ${sessionError.message}`,
          );
          failureCount++;
        }
      }

      logger.log("\n═══════════════════════════════════════════════════════");
      logger.log(`[SCHEDULER] ✨ Completado`);
      logger.log(`  ✅ Enviados: ${successCount}`);
      logger.log(`  ❌ Fallos: ${failureCount}`);
      logger.log("═══════════════════════════════════════════════════════\n");
    } catch (error) {
      logger.error("[SCHEDULER] 💥 Error crítico:", error.message);
    }
  });

  logger.log("✅ Scheduler de recordatorios activado");
  logger.log("⏰ Se ejecutará cada día a las 8:00 AM\n");
};

/**
 * Generar mensaje personalizado para el paciente
 * @param {Object} session - Datos de la sesión
 * @returns {string} Mensaje formateado
 */
const generarMensajeRecordatorio = (session) => {
  const fecha = new Date(session.session_date);
  const fechaFormateada = fecha.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const horaInicio = session.start_time.slice(0, 5);

  let mensaje = `*RECORDATORIO DE CITA PSICOLÓGICA*\n\n`;
  mensaje += `Hola ${session.patient_name},\n\n`;
  mensaje += `Te recuerdo que tienes una cita programada para mañana:\n\n`;
  mensaje += `*Fecha:* ${fechaFormateada}\n`;
  mensaje += `*Hora:* ${horaInicio}\n`;
  mensaje += `*Modalidad:* ${session.mode === "presencial" ? "Presencial" : "Online"}\n`;

  if (session.mode === "presencial" && session.clinic_name) {
    mensaje += `*Clínica:* ${session.clinic_name}\n`;
  }

  if (session.mode === "online") {
    mensaje += `*Enlace:* [Se enviará próximamente]\n`;
  }

  mensaje += `\n¡Confírmame asistencia cuando puedas! 😊`;
  return mensaje;
};

/**
 * Guardar registro de envío en BD
 * @param {Object} db - Pool de conexión
 * @param {Object} data - Datos del envío
 */
const guardarLogReminder = async (db, data) => {
  try {
    const [result] = await db.execute(
      `INSERT INTO reminder_logs 
       (session_id, patient_phone, message_sent, status, twilio_sid, error_message)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.session_id,
        data.patient_phone,
        data.message_sent,
        data.status,
        data.twilio_sid || null,
        data.error_message || null,
      ],
    );
    return result;
  } catch (error) {
    logger.error(`Error guardando log: ${error.message}`);
  }
};

module.exports = {
  scheduleReminders,
};
```

---

## 🚀 Paso 6: Inicializar en app.js

En tu archivo principal (`app.js` o `server.js`), después de conectar a la BD:

```javascript
// Imports
const express = require("express");
const db = require("./config/db");
const { scheduleReminders } = require("./schedulers/reminderScheduler");

const app = express();

// ... configuración express ...

// Después de inicializar la BD
app.use(async (req, res, next) => {
  req.db = db;
  next();
});

// ✨ INICIALIZAR SCHEDULER
scheduleReminders(db);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
```

---

## ✅ Checklist de Implementación

- [ ] Instalar `node-cron` y `twilio`
- [ ] Obtener credenciales de Twilio
- [ ] Añadir variables de entorno (.env)
- [ ] Crear tabla `reminder_logs`
- [ ] Crear archivo `whatsappService.js`
- [ ] Crear archivo `reminderScheduler.js`
- [ ] Inicializar scheduler en `app.js`
- [ ] Probar manualmente con curl
- [ ] Verificar logs en `reminder_logs`
- [ ] Monitorear en producción

---

## 🧪 Testing Local

### Opción 1: Cambiar frecuencia para testing rápido

En `reminderScheduler.js`, cambiar:

```javascript
// Cambiar de:
cron.schedule('0 8 * * *', async () => {

// A (cada 2 minutos):
cron.schedule('*/2 * * * *', async () => {
```

Después cambiar de vuelta a `0 8 * * *` en producción.

### Opción 2: Probar función manualmente

```bash
curl -X GET http://localhost:3000/api/reminders/send-test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Monitoreo y Logs

### Ver logs de envíos exitosos

```sql
SELECT * FROM reminder_logs
WHERE status = 'sent'
ORDER BY sent_at DESC
LIMIT 10;
```

### Ver errores

```sql
SELECT * FROM reminder_logs
WHERE status = 'failed'
ORDER BY sent_at DESC;
```

### Estadísticas del día

```sql
SELECT
  DATE(sent_at) as fecha,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as enviados,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as fallos
FROM reminder_logs
GROUP BY DATE(sent_at)
ORDER BY fecha DESC;
```

---

## 🔧 Troubleshooting

### ❌ "Mensaje no se envía"

- ✅ Verificar credenciales de Twilio
- ✅ Verificar formato teléfono (+34)
- ✅ Comprobar número de teléfono está en contatos de WhatsApp
- ✅ Verificar límite de mensajes en Twilio

### ❌ "Scheduler no se ejecuta"

- ✅ Verificar timezone del servidor
- ✅ Ver logs de aplicación
- ✅ Probar con `cron.schedule('*/2 * * * *')`

### ❌ "No encuentra sesiones"

- ✅ Verificar que `getPendingReminders()` retorna datos
- ✅ Verificar que hay sesiones para mañana
- ✅ Verificar que pacientes tienen teléfono

---

## 📈 Próximas Mejoras

1. **Templates personalizados** por clínica
2. **Confirmación de asistencia** por WhatsApp
3. **Cambio de hora del scheduler** desde panel admin
4. **Estadísticas de envíos** en dashboard
5. **Reintentos automáticos** en caso de fallo
6. **Envío de enlace Meet/Zoom** para sesiones online

---

## 📚 Referencias

- [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp)
- [node-cron](https://www.npmjs.com/package/node-cron)
- [Expresiones Cron](https://crontab.guru/)

---

**Última actualización:** 28/01/2026
