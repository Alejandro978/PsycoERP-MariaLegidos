const remindersPaths = {
  "/api/reminders/pending": {
    get: {
      tags: ["Reminders"],
      summary: "Obtener recordatorios pendientes",
      description: "Obtiene las sesiones del día siguiente con información de recordatorios. Lógica especial: Lunes-Jueves muestra sesiones del día siguiente, Viernes-Domingo muestra sesiones del lunes siguiente.",
      responses: {
        200: {
          description: "Lista de recordatorios pendientes obtenida exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RemindersResponse",
              },
            },
          },
        },
        500: {
          description: "Error interno del servidor",
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
  "/api/reminders": {
    post: {
      tags: ["Reminders"],
      summary: "Crear recordatorio con WhatsApp deeplink",
      description: "Crea un recordatorio para una sesión específica y genera un deeplink de WhatsApp personalizado. Incluye información completa del paciente, sesión, clínica (si es presencial) o enlace de Google Meet (si es online). El mensaje está optimizado para recordatorios automáticos.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/CreateReminderRequest",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Recordatorio creado exitosamente con deeplink de WhatsApp generado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateReminderResponse",
              },
            },
          },
        },
        400: {
          description: "Datos de entrada inválidos",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        404: {
          description: "Sesión no encontrada o está cancelada",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        409: {
          description: "Ya existe un recordatorio para esta sesión",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        500: {
          description: "Error interno del servidor",
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

module.exports = remindersPaths;