const cron = require("node-cron");
const logger = require("../utils/logger");
const { procesarRecordatorios } = require("../controllers/whatsapp/whatsapp_controller");

/**
 * Inicializar scheduler para recordatorios automáticos
 * Ejecuta cada día a las 8:00 AM
 * @param {Object} db - Pool de conexión a BD
 */
const scheduleReminders = (db) => {
    // Expresión cron: 0 8 * * * = 8:00 AM todos los días
    // Para testing usa: */2 * * * * (cada 2 minutos)

    const cronExpression = "0 8 * * *"; // 8:00 AM todos los días

    cron.schedule(cronExpression, async () => {
        await procesarRecordatorios(db);
    });

    logger.info("✅ Scheduler de recordatorios WhatsApp activado");
    logger.info(`⏰ Se ejecutará cada día a las 8:00 AM`);
    logger.info(`📍 Expresión cron: ${cronExpression}\n`);
};

module.exports = {
    scheduleReminders,
};
