const twilio = require("twilio");
const logger = require("./logger");

// Validar que las credenciales de Twilio están configuradas
if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    logger.error("⚠️ TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN no están configurados en .env");
}

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

/**
 * Enviar mensaje de WhatsApp a través de Twilio
 * @param {string} toPhone - Teléfono del destinatario (ej: 666123456 o +34666123456)
 * @param {string} message - Contenido del mensaje
 * @returns {Promise<Object>} Resultado del envío
 */
const sendWhatsAppMessage = async (toPhone, message) => {
    try {
        // Formatear teléfono: asegurar que tenga +34 (España)
        let formattedPhone = toPhone.trim();

        // Si no empieza con +, añadir +34
        if (!formattedPhone.startsWith("+")) {
            // Eliminar 0 inicial si existe (ej: 0666123456 -> 666123456)
            formattedPhone = formattedPhone.replace(/^0/, "");
            formattedPhone = `+34${formattedPhone}`;
        }

        logger.info(`📱 Enviando WhatsApp a ${formattedPhone}...`);
        logger.info(`📝 Mensaje: ${message.substring(0, 50)}...`);

        const result = await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_FROM,
            to: `whatsapp:${formattedPhone}`,
            body: message,
        });

        logger.info(`✅ Mensaje enviado correctamente. SID: ${result.sid}`);

        return {
            success: true,
            twilio_sid: result.sid,
            timestamp: new Date(),
            status: result.status,
        };
    } catch (error) {
        logger.error(`❌ Error enviando WhatsApp: ${error.message}`);

        // Logs detallados para debugging
        if (error.code) {
            logger.error(`   Código de error: ${error.code}`);
        }
        if (error.moreInfo) {
            logger.error(`   Más info: ${error.moreInfo}`);
        }

        return {
            success: false,
            error: error.message,
            error_code: error.code || null,
            timestamp: new Date(),
        };
    }
};

/**
 * Verificar que la configuración de Twilio es válida
 * @returns {Promise<boolean>}
 */
const verifyTwilioConfig = async () => {
    try {
        logger.info("🔍 Verificando configuración de Twilio...");

        // Intentar obtener información de la cuenta
        const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();

        logger.info(`✅ Twilio conectado correctamente`);
        logger.info(`   Account SID: ${account.sid}`);
        logger.info(`   Status: ${account.status}`);
        logger.info(`   Tipo: ${account.type}`);

        return true;
    } catch (error) {
        logger.error(`❌ Error verificando Twilio: ${error.message}`);
        return false;
    }
};

module.exports = {
    sendWhatsAppMessage,
    verifyTwilioConfig,
};
