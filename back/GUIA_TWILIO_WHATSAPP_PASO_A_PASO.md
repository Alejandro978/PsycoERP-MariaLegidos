# 🚀 Guía Completa de Configuración: Twilio WhatsApp (Trial)

## ✅ Estado Actual

- [x] Cuenta Twilio creada con $15.50 de crédito
- [x] Dependencias instaladas (node-cron, twilio)
- [x] Código backend implementado
- [ ] Configurar WhatsApp Sandbox
- [ ] Crear tabla reminder_logs
- [ ] Probar envío de mensajes
- [ ] Activar scheduler automático

---

## 📱 FASE 1: Configurar WhatsApp Sandbox en Twilio

### Paso 1: Acceder al Sandbox

1. Ve a tu consola de Twilio: https://console.twilio.com
2. En el menú lateral izquierdo, busca:
   ```
   Messaging → Try it out → Send a WhatsApp message
   ```
3. Verás el **WhatsApp Sandbox**

### Paso 2: Conectar tu WhatsApp personal

En la pantalla del Sandbox verás algo como:

```
To connect to your sandbox, send this message:
join heavy-stone

To this number: +1 415 523 8886
```

**IMPORTANTE - Haz esto AHORA desde tu móvil:**

1. Abre WhatsApp
2. Añade el contacto: **+1 415 523 8886** (nómbralo "Twilio Sandbox")
3. Envía el mensaje exacto que te indica (ej: `join heavy-stone`)
4. Recibirás: _"Twilio Sandbox: ✅ You are all set! ..."_

✅ **Tu número está conectado al Sandbox**

### Paso 3: Verificar credenciales

Las credenciales que ya tienes en tu `.env` son:

```env
TWILIO_ACCOUNT_SID=AC1cb33f103776e523f63df1039b5e3ef8
TWILIO_AUTH_TOKEN=f32be838875446415112eb9c6ebbee23
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

✅ **Ya están configuradas correctamente**

---

## 💾 FASE 2: Crear Tabla reminder_logs en la BD

Debes ejecutar este SQL en tu base de datos:

```sql
-- Conecta a tu BD de TEST primero
USE psicoandante_test;

-- Crear tabla
CREATE TABLE IF NOT EXISTS reminder_logs (
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
  KEY idx_sent_at (sent_at),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Índice para búsquedas por fecha
CREATE INDEX idx_sent_date ON reminder_logs(DATE(sent_at));

-- Verificar que se creó
SHOW TABLES LIKE 'reminder_logs';
```

### Opciones para ejecutar el SQL:

**Opción A - DBeaver/MySQL Workbench:**

1. Conéctate a tu BD (173.212.240.46)
2. Copia y pega el SQL
3. Ejecuta

**Opción B - Terminal:**

```bash
mysql -h 173.212.240.46 -u psicoandante_test -p psicoandante_test < migrations/create_reminder_logs_table.sql
```

---

## 🧪 FASE 3: Probar el Sistema (Paso a Paso)

### Paso 1: Iniciar el servidor

```bash
cd /Users/dguerrero/Desktop/Everything/Projects/Psyco/PsycoERP-MariaLegidos/back
npm start
```

Deberías ver:

```
✅ Servidor corriendo en http://localhost:3000
✅ Scheduler de recordatorios WhatsApp activado
⏰ Se ejecutará cada día a las 8:00 AM
```

---

### Paso 2: Verificar configuración de Twilio

```bash
curl http://localhost:3000/api/reminders/verify-twilio \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**Respuesta esperada:**

```json
{
  "success": true,
  "message": "Twilio configurado correctamente",
  "config": {
    "accountSid": "✅ Configurado",
    "authToken": "✅ Configurado",
    "whatsappFrom": "whatsapp:+14155238886"
  }
}
```

---

### Paso 3: Enviar WhatsApp de prueba a TU número

**⚠️ IMPORTANTE:** Reemplaza `+34TU_NUMERO` con tu número real (el que conectaste al Sandbox)

```bash
curl -X POST http://localhost:3000/api/reminders/test-whatsapp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "phone": "+34666123456",
    "message": "🧪 Hola! Este es un mensaje de prueba desde PsycoERP. Si recibes esto, Twilio funciona correctamente ✅"
  }'
```

**Respuesta esperada:**

```json
{
  "success": true,
  "data": {
    "twilio_sid": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "status": "queued",
    "timestamp": "2026-01-25T10:30:00.000Z"
  },
  "message": "Mensaje enviado correctamente"
}
```

✅ **Deberías recibir el mensaje en WhatsApp en 5-10 segundos**

---

### Paso 4: Preparar datos de prueba

Necesitas tener al menos **1 sesión programada para mañana** con un paciente que tenga teléfono.

**Verifica que tienes sesiones:**

```bash
curl http://localhost:3000/api/reminders/pending \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**Respuesta esperada:**

```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "session_date": "2026-01-26",
      "start_time": "10:00:00",
      "patient_name": "Juan Pérez",
      "patient_phone": "+34666123456",
      "mode": "presencial",
      "clinic_name": "Clínica Centro"
    }
  ],
  "total": 1,
  "message": "Sesiones programadas para mañana (2026-01-26)"
}
```

**Si no tienes sesiones:**

- Crea una sesión en tu ERP para mañana
- Asegúrate de que el paciente tiene teléfono en la BD

---

### Paso 5: Probar envío de recordatorios

Este endpoint procesará todas las sesiones de mañana y enviará los WhatsApps:

```bash
curl http://localhost:3000/api/reminders/test-send \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**Respuesta esperada:**

```json
{
  "success": true,
  "data": {
    "sent": 3,
    "failed": 0,
    "total": 3,
    "errors": null
  },
  "message": "Proceso completado"
}
```

✅ **Los pacientes deberían recibir sus recordatorios en WhatsApp**

---

### Paso 6: Verificar logs en la BD

```sql
-- Ver mensajes enviados hoy
SELECT
  id,
  session_id,
  patient_phone,
  status,
  LEFT(message_sent, 50) as preview,
  sent_at
FROM reminder_logs
WHERE DATE(sent_at) = CURDATE()
ORDER BY sent_at DESC;

-- Estadísticas
SELECT
  status,
  COUNT(*) as total
FROM reminder_logs
WHERE DATE(sent_at) = CURDATE()
GROUP BY status;
```

---

## ⏰ FASE 4: Scheduler Automático (Ya Activado)

El scheduler **YA está activo** y se ejecutará automáticamente **cada día a las 8:00 AM**.

### Configuración actual:

```javascript
// En reminderScheduler.js
const cronExpression = "0 8 * * *"; // 8:00 AM todos los días
```

### Para cambiar la hora:

Edita `/back/schedulers/reminderScheduler.js`:

```javascript
// Ejemplos de expresiones cron:
"0 8 * * *"; // 8:00 AM
"0 20 * * *"; // 8:00 PM
"30 7 * * *"; // 7:30 AM
"0 9 * * 1-5"; // 9:00 AM solo lunes a viernes
```

**Referencia rápida de cron:**

```
* * * * *
│ │ │ │ │
│ │ │ │ └── Día de semana (0-6, 0=Domingo)
│ │ │ └──── Mes (1-12)
│ │ └────── Día del mes (1-31)
│ └──────── Hora (0-23)
└────────── Minuto (0-59)
```

Usa https://crontab.guru para crear expresiones cron fácilmente.

---

## 📊 Monitoreo y Estadísticas

### Ver últimos envíos:

```sql
SELECT
  session_id,
  patient_phone,
  status,
  sent_at,
  error_message
FROM reminder_logs
ORDER BY sent_at DESC
LIMIT 10;
```

### Estadísticas del último mes:

```sql
SELECT
  DATE(sent_at) as fecha,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as enviados,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as fallos,
  ROUND(SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as tasa_exito
FROM reminder_logs
WHERE sent_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(sent_at)
ORDER BY fecha DESC;
```

---

## 🔧 Troubleshooting

### ❌ Error: "Could not authenticate"

**Solución:**

- Verifica que `TWILIO_ACCOUNT_SID` y `TWILIO_AUTH_TOKEN` son correctos
- Cópialos de nuevo desde: https://console.twilio.com → Account Info

---

### ❌ Error: "Unable to create record: The 'To' number is not a valid WhatsApp number"

**Causas posibles:**

1. **No has conectado tu número al Sandbox**
   - Envía `join heavy-stone` a +14155238886 desde WhatsApp
2. **El número del destinatario no existe en WhatsApp**
   - Verifica que el número del paciente usa WhatsApp
3. **Formato incorrecto del teléfono**
   - Debe ser: +34666123456 (con + y código de país)

---

### ❌ No recibo mensajes

**Checklist:**

1. ✅ ¿Has enviado `join <código>` al Sandbox?
2. ✅ ¿El número en la BD tiene formato +34XXXXXXXXX?
3. ✅ ¿El status en `reminder_logs` es "sent"?
4. ✅ ¿Tienes crédito en Twilio? (Revisa en console.twilio.com)

---

### ❌ "No hay sesiones para recordar"

**Solución:**

- Crea una sesión en el ERP para **mañana**
- Asegúrate de que:
  - El paciente tiene teléfono
  - La sesión no está cancelada
  - La clínica no es externa (is_external = 0)

---

## 💰 Costos de Twilio Trial

Con tu cuenta Trial ($15.50):

- **Mensajes WhatsApp**: ~$0.005 por mensaje
- **Capacidad**: ~3,100 mensajes con tu crédito
- **Limitaciones Trial**:
  - Solo puedes enviar a números verificados en el Sandbox
  - Aparece "Sent from your Twilio trial account" en los mensajes
  - Máximo 1 mensaje por segundo

### Pasar a producción:

Cuando estés listo:

1. Actualiza tu cuenta Twilio (añade tarjeta)
2. Solicita un número WhatsApp Business oficial
3. Actualiza `.env`:
   ```env
   TWILIO_WHATSAPP_FROM=whatsapp:+34XXXXXXXXXX
   ```

---

## 🎯 Próximos Pasos

1. ✅ **Probar el sistema completo** con los endpoints de testing
2. ✅ **Monitorear los logs** durante 1 semana
3. ⏰ **Ajustar el horario** del scheduler si es necesario
4. 📊 **Revisar estadísticas** de envíos/fallos
5. 🚀 **Pasar a producción** cuando estés satisfecho

---

## 📝 Checklist Final

- [ ] Sandbox de WhatsApp activado (enviaste `join <código>`)
- [ ] Tabla `reminder_logs` creada en BD
- [ ] Endpoint `/verify-twilio` retorna success
- [ ] Endpoint `/test-whatsapp` envía mensaje correctamente
- [ ] Tienes al menos 1 sesión de prueba para mañana
- [ ] Endpoint `/test-send` funciona y envía recordatorios
- [ ] Scheduler activado en `app.js`
- [ ] Logs en BD se guardan correctamente

---

## 🆘 ¿Necesitas Ayuda?

Si algo no funciona:

1. Revisa los logs del servidor (`console.log`)
2. Revisa los logs de Twilio: https://console.twilio.com/monitor/logs/sms
3. Verifica la tabla `reminder_logs` en la BD

**Logs del servidor mostrarán:**

```
📱 Enviando WhatsApp a +34666123456...
✅ Mensaje enviado. SID: SMxxxxxxxx
```

---

**Fecha de creación:** 25 de enero de 2026  
**Versión:** 1.0  
**Proyecto:** PsycoERP - Recordatorios WhatsApp
