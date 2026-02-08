const whatsappPaths = {
    "/api/whatsapp/verify-config": {
        get: {
            tags: ["WhatsApp"],
            summary: "Verificar configuración de Twilio",
            description: "Verifica que las credenciales de Twilio estén configuradas correctamente y que la conexión funcione.",
            responses: {
                200: {
                    description: "Configuración verificada exitosamente",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    message: { type: "string", example: "Twilio configurado correctamente" },
                                    config: {
                                        type: "object",
                                        properties: {
                                            accountSid: { type: "string", example: "✅ Configurado" },
                                            authToken: { type: "string", example: "✅ Configurado" },
                                            whatsappFrom: { type: "string", example: "whatsapp:+14155238886" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                500: {
                    description: "Error al verificar configuración",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse",
                            },
                        },
                    },
                },
            },
        },
    },
    "/api/whatsapp/send-reminders": {
        post: {
            tags: ["WhatsApp"],
            summary: "Enviar recordatorios de WhatsApp manualmente",
            description: "Procesa y envía recordatorios de WhatsApp para todas las sesiones programadas de mañana (o lunes siguiente si es fin de semana). Útil para testing antes de activar el scheduler automático.",
            responses: {
                200: {
                    description: "Recordatorios procesados exitosamente",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    data: {
                                        type: "object",
                                        properties: {
                                            sent: { type: "integer", example: 5, description: "Recordatorios enviados exitosamente" },
                                            failed: { type: "integer", example: 1, description: "Recordatorios fallidos" },
                                            total: { type: "integer", example: 6, description: "Total de sesiones procesadas" },
                                            errors: {
                                                type: "array",
                                                nullable: true,
                                                items: {
                                                    type: "object",
                                                    properties: {
                                                        patient: { type: "string", example: "Juan Pérez" },
                                                        error: { type: "string", example: "Unable to create record" },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                    message: { type: "string", example: "Proceso completado" },
                                },
                            },
                        },
                    },
                },
                500: {
                    description: "Error al procesar recordatorios",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse",
                            },
                        },
                    },
                },
            },
        },
    },
    "/api/whatsapp/test-message": {
        post: {
            tags: ["WhatsApp"],
            summary: "Enviar mensaje de prueba por WhatsApp",
            description: "Envía un mensaje de prueba a un número específico. El número debe estar conectado al Sandbox de Twilio (durante trial).",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["phone", "message"],
                            properties: {
                                phone: {
                                    type: "string",
                                    example: "+34666123456",
                                    description: "Número de teléfono con código de país (+34 para España)",
                                },
                                message: {
                                    type: "string",
                                    example: "🧪 Mensaje de prueba desde PsycoERP",
                                    description: "Contenido del mensaje a enviar",
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "Mensaje enviado exitosamente",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    data: {
                                        type: "object",
                                        properties: {
                                            twilio_sid: { type: "string", example: "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
                                            status: { type: "string", example: "queued" },
                                            timestamp: { type: "string", format: "date-time", example: "2026-01-25T10:30:00.000Z" },
                                        },
                                    },
                                    message: { type: "string", example: "Mensaje enviado correctamente" },
                                },
                            },
                        },
                    },
                },
                400: {
                    description: "Parámetros faltantes",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    error: { type: "string", example: "Se requieren los campos 'phone' y 'message'" },
                                },
                            },
                        },
                    },
                },
                500: {
                    description: "Error al enviar mensaje",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse",
                            },
                        },
                    },
                },
            },
        },
    },
    "/api/whatsapp/logs": {
        get: {
            tags: ["WhatsApp"],
            summary: "Obtener logs de recordatorios enviados",
            description: "Obtiene el historial de recordatorios de WhatsApp enviados con filtros opcionales.",
            parameters: [
                {
                    name: "status",
                    in: "query",
                    required: false,
                    schema: {
                        type: "string",
                        enum: ["sent", "failed", "pending"],
                    },
                    description: "Filtrar por estado del envío",
                },
                {
                    name: "session_id",
                    in: "query",
                    required: false,
                    schema: {
                        type: "integer",
                    },
                    description: "Filtrar por ID de sesión",
                },
                {
                    name: "fecha_desde",
                    in: "query",
                    required: false,
                    schema: {
                        type: "string",
                        format: "date",
                    },
                    description: "Fecha desde (YYYY-MM-DD)",
                },
                {
                    name: "fecha_hasta",
                    in: "query",
                    required: false,
                    schema: {
                        type: "string",
                        format: "date",
                    },
                    description: "Fecha hasta (YYYY-MM-DD)",
                },
            ],
            responses: {
                200: {
                    description: "Logs obtenidos exitosamente",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    total: { type: "integer", example: 10 },
                                    data: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                id: { type: "integer", example: 123 },
                                                session_id: { type: "integer", example: 456 },
                                                patient_phone: { type: "string", example: "+34666123456" },
                                                patient_name: { type: "string", example: "Juan Pérez" },
                                                session_date: { type: "string", format: "date", example: "2026-01-26" },
                                                start_time: { type: "string", example: "10:00:00" },
                                                status: { type: "string", enum: ["sent", "failed", "pending"], example: "sent" },
                                                twilio_sid: { type: "string", example: "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
                                                error_message: { type: "string", nullable: true, example: null },
                                                sent_at: { type: "string", format: "date-time", example: "2026-01-25T08:00:00.000Z" },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                500: {
                    description: "Error al obtener logs",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse",
                            },
                        },
                    },
                },
            },
        },
    },
};

module.exports = whatsappPaths;
