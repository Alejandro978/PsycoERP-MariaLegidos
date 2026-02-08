const express = require("express");
const router = express.Router();

const {
    enviarRecordatoriosManuales,
    verificarConfiguracionTwilio,
    enviarMensajePrueba,
    obtenerLogsRecordatorios,
} = require("../../controllers/whatsapp/whatsapp_controller");

// Verificar configuración de Twilio
router.get("/verify-config", verificarConfiguracionTwilio);

// Enviar recordatorios manualmente (para testing)
router.post("/send-reminders", enviarRecordatoriosManuales);

// Enviar mensaje de prueba
router.post("/test-message", enviarMensajePrueba);

// Obtener logs de recordatorios
router.get("/logs", obtenerLogsRecordatorios);

module.exports = router;
