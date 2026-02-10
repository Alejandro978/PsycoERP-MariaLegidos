const { getPendingRemindersForScheduler, saveReminderLog, getReminderLogs } = require("../../models/reminders/reminders_model");
const { sendWhatsAppMessage, verifyTwilioConfig } = require("../../utils/whatsappService");
const logger = require("../../utils/logger");

/**
 * Generar mensaje personalizado de recordatorio para el paciente
 * @param {Object} session - Datos de la sesión
 * @returns {string} Mensaje formateado
 */
const generarMensajeRecordatorio = (session) => {
    const fecha = new Date(session.session_date + "T00:00:00");
    const fechaFormateada = fecha.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    // Capitalizar primera letra
    const fechaCapitalizada = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);

    const horaInicio = session.start_time.slice(0, 5); // HH:mm

    let mensaje = `*🧠 RECORDATORIO DE CITA PSICOLÓGICA*\n\n`;
    mensaje += `Hola ${session.patient_name.split(" ")[0]},\n\n`;
    mensaje += `Te recuerdo que tienes una cita programada para *mañana*:\n\n`;
    mensaje += `📅 *Fecha:* ${fechaCapitalizada}\n`;
    mensaje += `⏰ *Hora:* ${horaInicio}\n`;
    mensaje += `📍 *Modalidad:* ${session.mode === "presencial" ? "Presencial 🏥" : "Online 💻"}\n`;

    if (session.mode === "presencial" && session.clinic_name) {
        mensaje += `🏢 *Clínica:* ${session.clinic_name}\n`;
        if (session.clinic_address) {
            mensaje += `📌 *Dirección:* ${session.clinic_address}\n`;
        }
    }

    if (session.mode === "online") {
        mensaje += `\n🔗 El enlace de la videollamada te lo enviaré antes de la sesión.\n`;
    }

    mensaje += `\n¿Podrás confirmarme tu asistencia? 😊\n`;
    mensaje += `\nGracias,\nMaría`;

    return mensaje;
};

/**
 * Procesar y enviar recordatorios de WhatsApp
 * @param {Object} db - Pool de conexión a BD
 * @returns {Promise<Object>} Resultado del procesamiento
 */
const procesarRecordatorios = async (db) => {
    logger.info("═══════════════════════════════════════════════════════");
    logger.info("[RECORDATORIOS] 🚀 Iniciando proceso de envío...");
    logger.info("═══════════════════════════════════════════════════════");

    try {
        // 1. Obtener sesiones pendientes (mañana o lunes siguiente)
        // Usa getPendingRemindersForScheduler que ignora tabla reminders
        const result = await getPendingRemindersForScheduler(db);

        logger.info(`📅 Fecha objetivo: ${result.targetDate}`);
        logger.info(`📋 Sesiones encontradas: ${result.sessions.length}`);

        if (result.sessions.length === 0) {
            logger.info("ℹ️  No hay sesiones programadas para recordar");
            return {
                success: true,
                sent: 0,
                failed: 0,
                total: 0,
                message: "No hay sesiones para recordar",
            };
        }

        let successCount = 0;
        let failureCount = 0;
        const errors = [];

        // 2. Procesar cada sesión
        for (const session of result.sessions) {
            try {
                logger.info(`\n───────────────────────────────────────────────────`);
                logger.info(`👤 Paciente: ${session.patient_name}`);
                logger.info(`📞 Teléfono: ${session.patient_phone}`);
                logger.info(`⏰ Hora: ${session.start_time}`);

                // Verificar que el paciente tiene teléfono
                if (!session.patient_phone || session.patient_phone.trim() === "") {
                    logger.warn(`⚠️  ${session.patient_name} no tiene teléfono registrado`);
                    failureCount++;
                    continue;
                }

                // Generar mensaje personalizado
                const mensaje = generarMensajeRecordatorio(session);

                logger.info(`📝 Mensaje generado (${mensaje.length} caracteres)`);

                // Enviar por WhatsApp
                const sendResult = await sendWhatsAppMessage(session.patient_phone, mensaje);

                // Guardar log en BD
                if (sendResult.success) {
                    await saveReminderLog(db, {
                        session_id: session.session_id,
                        patient_phone: session.patient_phone,
                        message_sent: mensaje,
                        status: "sent",
                        twilio_sid: sendResult.twilio_sid,
                    });

                    logger.info(`✅ Recordatorio enviado exitosamente`);
                    successCount++;
                } else {
                    await saveReminderLog(db, {
                        session_id: session.session_id,
                        patient_phone: session.patient_phone,
                        message_sent: mensaje,
                        status: "failed",
                        error_message: sendResult.error,
                    });

                    logger.error(`❌ Error al enviar: ${sendResult.error}`);
                    failureCount++;
                    errors.push({
                        patient: session.patient_name,
                        error: sendResult.error,
                    });
                }

                // Pequeña pausa entre mensajes para no saturar la API
                await new Promise((resolve) => setTimeout(resolve, 1000));
            } catch (sessionError) {
                logger.error(`💥 Error procesando sesión ${session.session_id}: ${sessionError.message}`);
                failureCount++;
                errors.push({
                    patient: session.patient_name,
                    error: sessionError.message,
                });
            }
        }

        // 3. Resumen final
        logger.info("\n═══════════════════════════════════════════════════════");
        logger.info("[RECORDATORIOS] ✨ Proceso completado");
        logger.info(`  ✅ Enviados: ${successCount}`);
        logger.info(`  ❌ Fallos: ${failureCount}`);
        logger.info(`  📊 Total procesados: ${result.sessions.length}`);
        logger.info("═══════════════════════════════════════════════════════\n");

        return {
            success: true,
            sent: successCount,
            failed: failureCount,
            total: result.sessions.length,
            errors: errors.length > 0 ? errors : null,
        };
    } catch (error) {
        logger.error("[RECORDATORIOS] 💥 Error crítico:", error.message);
        logger.error(error.stack);

        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Endpoint para enviar recordatorios manualmente (testing)
 * POST /api/whatsapp/send-reminders
 */
const enviarRecordatoriosManuales = async (req, res) => {
    try {
        logger.info("🧪 Ejecutando envío manual de recordatorios WhatsApp...");

        const result = await procesarRecordatorios(req.db);

        res.json({
            success: result.success,
            data: {
                sent: result.sent,
                failed: result.failed,
                total: result.total,
                errors: result.errors || null,
            },
            message: result.message || "Proceso completado",
        });
    } catch (err) {
        logger.error("Error en envío manual de recordatorios:", err.message);
        res.status(500).json({
            success: false,
            error: "Error al enviar recordatorios",
        });
    }
};

/**
 * Endpoint para verificar configuración de Twilio
 * GET /api/whatsapp/verify-config
 */
const verificarConfiguracionTwilio = async (req, res) => {
    try {
        const isValid = await verifyTwilioConfig();

        res.json({
            success: isValid,
            message: isValid
                ? "Twilio configurado correctamente"
                : "Error en la configuración de Twilio",
            config: {
                accountSid: process.env.TWILIO_ACCOUNT_SID ? "✅ Configurado" : "❌ No configurado",
                authToken: process.env.TWILIO_AUTH_TOKEN ? "✅ Configurado" : "❌ No configurado",
                whatsappFrom: process.env.TWILIO_WHATSAPP_FROM || "❌ No configurado",
            },
        });
    } catch (err) {
        logger.error("Error verificando Twilio:", err.message);
        res.status(500).json({
            success: false,
            error: "Error al verificar configuración de Twilio",
        });
    }
};

/**
 * Endpoint para enviar un WhatsApp de prueba
 * POST /api/whatsapp/test-message
 * Body: { phone: "+34666123456", message: "Mensaje de prueba" }
 */
const enviarMensajePrueba = async (req, res) => {
    try {
        const { phone, message } = req.body;

        if (!phone || !message) {
            return res.status(400).json({
                success: false,
                error: "Se requieren los campos 'phone' y 'message'",
            });
        }

        logger.info(`🧪 Enviando WhatsApp de prueba a ${phone}...`);

        const result = await sendWhatsAppMessage(phone, message);

        res.json({
            success: result.success,
            data: result.success
                ? {
                    twilio_sid: result.twilio_sid,
                    status: result.status,
                    timestamp: result.timestamp,
                }
                : null,
            error: result.success ? null : result.error,
            message: result.success ? "Mensaje enviado correctamente" : "Error al enviar mensaje",
        });
    } catch (err) {
        logger.error("Error en prueba de WhatsApp:", err.message);
        res.status(500).json({
            success: false,
            error: "Error al enviar WhatsApp de prueba",
        });
    }
};

/**
 * Endpoint para obtener logs de recordatorios con filtros
 * GET /api/whatsapp/logs
 */
const obtenerLogsRecordatorios = async (req, res) => {
    try {
        const { status, session_id, fecha_desde, fecha_hasta } = req.query;

        const filters = {};
        if (status) filters.status = status;
        if (session_id) filters.session_id = session_id;
        if (fecha_desde) filters.fecha_desde = fecha_desde;
        if (fecha_hasta) filters.fecha_hasta = fecha_hasta;

        const logs = await getReminderLogs(req.db, filters);

        res.json({
            success: true,
            total: logs.length,
            data: logs,
        });
    } catch (err) {
        logger.error("Error al obtener logs de recordatorios:", err.message);
        res.status(500).json({
            success: false,
            error: "Error al obtener logs de recordatorios",
        });
    }
};

module.exports = {
    procesarRecordatorios,
    enviarRecordatoriosManuales,
    verificarConfiguracionTwilio,
    enviarMensajePrueba,
    obtenerLogsRecordatorios,
    generarMensajeRecordatorio,
};
