const sessionsPaths = {
  "/api/sessions": {
    get: {
      tags: ["Sessions"],
      summary: "Obtener sesiones paginadas",
      description: "Obtiene una lista paginada de sesiones con filtros opcionales. Devuelve hasta 100 registros por página (por defecto 10).",
      parameters: [
        {
          name: "patient_id",
          in: "query",
          required: false,
          schema: {
            type: "integer",
            format: "int64",
          },
          description: "ID del paciente para filtrar",
        },
        {
          name: "clinic_id",
          in: "query",
          required: false,
          schema: {
            type: "integer",
            format: "int64",
          },
          description: "ID de la clínica para filtrar",
        },
        {
          name: "status",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: ["completada", "cancelada"],
          },
          description: "Estado de la sesión",
        },
        {
          name: "session_date",
          in: "query",
          required: false,
          schema: {
            type: "string",
            format: "date",
          },
          description: "Fecha de la sesión (YYYY-MM-DD)",
        },
        {
          name: "fecha_desde",
          in: "query",
          required: false,
          schema: {
            type: "string",
            format: "date",
          },
          description:
            "Fecha de inicio del rango para filtrar sesiones (YYYY-MM-DD). Solo se usa si no se especifica session_date",
        },
        {
          name: "fecha_hasta",
          in: "query",
          required: false,
          schema: {
            type: "string",
            format: "date",
          },
          description:
            "Fecha de fin del rango para filtrar sesiones (YYYY-MM-DD). Solo se usa si no se especifica session_date",
        },
        {
          name: "payment_method",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: ["pendiente", "transferencia", "bizum", "efectivo", "tarjeta"],
          },
          description: "Método de pago",
        },
        {
          name: "page",
          in: "query",
          required: false,
          schema: {
            type: "integer",
            minimum: 1,
            default: 1,
          },
          description: "Número de página para la paginación",
        },
        {
          name: "limit",
          in: "query",
          required: false,
          schema: {
            type: "integer",
            minimum: 1,
            maximum: 100,
            default: 10,
          },
          description: "Número de registros por página (máximo 100)",
        },
      ],
      responses: {
        200: {
          description: "Lista paginada de sesiones obtenida exitosamente. Incluye información de paginación y datos de sesiones con detalles del paciente, clínica y notas médicas.",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SessionsResponse",
              },
            },
          },
        },
        400: {
          description: "Parámetros de entrada inválidos (página < 1 o límite fuera del rango 1-100)",
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
    post: {
      tags: ["Sessions"],
      summary: "Crear nueva sesión",
      description: "Crea una nueva sesión en el sistema. Validaciones: horario entre 08:00-21:00, duración máxima 1 hora, start_time < end_time, sin solapamiento con otras sesiones.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: [
                "patient_id",
                "clinic_id",
                "session_date",
                "start_time",
                "end_time",
                "mode",
                "type",
              ],
              properties: {
                patient_id: {
                  type: "integer",
                  format: "int64",
                  description: "ID del paciente",
                },
                clinic_id: {
                  type: "integer",
                  format: "int64",
                  description: "ID de la clínica",
                },
                session_date: {
                  type: "string",
                  format: "date",
                  description: "Fecha de la sesión (YYYY-MM-DD)",
                },
                start_time: {
                  type: "string",
                  format: "time",
                  description: "Hora de inicio (HH:mm:ss). Debe ser >= 08:00 y anterior a end_time",
                  example: "09:00:00",
                },
                end_time: {
                  type: "string",
                  format: "time",
                  description: "Hora de fin (HH:mm:ss). Debe ser <= 21:00, posterior a start_time y la duración no puede exceder 1 hora",
                  example: "10:00:00",
                },
                mode: {
                  type: "string",
                  enum: ["presencial", "online"],
                  description: "Modalidad de la sesión",
                },
                type: {
                  type: "string",
                  description: "Tipo de sesión",
                },
                status: {
                  type: "string",
                  enum: ["completada", "cancelada"],
                  default: "completada",
                  description: "Estado de la sesión",
                },
                price: {
                  type: "number",
                  format: "decimal",
                  default: 0.0,
                  description: "Precio de la sesión",
                },
                payment_method: {
                  type: "string",
                  enum: ["pendiente", "transferencia", "bizum", "efectivo", "tarjeta"],
                  default: "pendiente",
                  description: "Método de pago",
                },
                notes: {
                  type: "string",
                  description: "Notas adicionales de la sesión",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Sesión creada exitosamente",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: true,
                  },
                  message: {
                    type: "string",
                    example: "Sesión creada exitosamente",
                  },
                  data: {
                    $ref: "#/components/schemas/Session",
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Campos obligatorios faltantes o datos inválidos",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        409: {
          description: "Conflicto de horarios - Ya existe una sesión en ese rango horario",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: false,
                  },
                  error: {
                    type: "string",
                    example: "El horario de esta sesión se solapa con otra sesión existente. Por favor, selecciona un horario diferente.",
                  },
                  conflicting_session: {
                    type: "object",
                    properties: {
                      id: {
                        type: "integer",
                        example: 123,
                      },
                      start_time: {
                        type: "string",
                        example: "09:00:00",
                      },
                      end_time: {
                        type: "string",
                        example: "10:00:00",
                      },
                      status: {
                        type: "string",
                        example: "completada",
                      },
                      patient_id: {
                        type: "integer",
                        example: 45,
                      },
                      patient_name: {
                        type: "string",
                        example: "Juan Pérez",
                      },
                    },
                  },
                },
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
  "/api/sessions/{id}": {
    put: {
      tags: ["Sessions"],
      summary: "Actualizar sesión existente",
      description:
        "Actualiza una sesión existente con los datos proporcionados. Solo se actualizan los campos enviados. Validaciones: horario entre 08:00-21:00, duración máxima 1 hora, start_time < end_time, sin solapamiento con otras sesiones.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "integer",
            format: "int64",
          },
          description: "ID de la sesión a actualizar",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                patient_id: {
                  type: "integer",
                  format: "int64",
                  description: "ID del paciente",
                },
                clinic_id: {
                  type: "integer",
                  format: "int64",
                  description: "ID de la clínica",
                },
                session_date: {
                  type: "string",
                  format: "date",
                  description: "Fecha de la sesión (YYYY-MM-DD)",
                },
                start_time: {
                  type: "string",
                  format: "time",
                  description: "Hora de inicio (HH:mm:ss). Debe ser >= 08:00 y anterior a end_time",
                  example: "09:00:00",
                },
                end_time: {
                  type: "string",
                  format: "time",
                  description: "Hora de fin (HH:mm:ss). Debe ser <= 21:00, posterior a start_time y la duración no puede exceder 1 hora",
                  example: "10:00:00",
                },
                mode: {
                  type: "string",
                  enum: ["presencial", "online"],
                  description: "Modalidad de la sesión",
                },
                type: {
                  type: "string",
                  description: "Tipo de sesión (ej: individual, grupal)",
                },
                status: {
                  type: "string",
                  enum: ["completada", "cancelada"],
                  description: "Estado de la sesión",
                },
                price: {
                  type: "number",
                  format: "decimal",
                  minimum: 0,
                  description: "Precio de la sesión",
                },
                payment_method: {
                  type: "string",
                  enum: ["pendiente", "transferencia", "bizum", "efectivo", "tarjeta"],
                  description: "Método de pago",
                },
                notes: {
                  type: "string",
                  description: "Notas adicionales de la sesión",
                },
              },
              description:
                "Al menos un campo debe ser proporcionado para la actualización",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Sesión actualizada exitosamente",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: true,
                  },
                  message: {
                    type: "string",
                    example: "Sesión actualizada exitosamente",
                  },
                  data: {
                    $ref: "#/components/schemas/Session",
                  },
                },
              },
            },
          },
        },
        400: {
          description:
            "ID inválido o no se proporcionaron campos para actualizar",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        404: {
          description: "Sesión no encontrada",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        409: {
          description: "Conflicto de horarios - Ya existe una sesión en ese rango horario",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: false,
                  },
                  error: {
                    type: "string",
                    example: "El horario de esta sesión se solapa con otra sesión existente. Por favor, selecciona un horario diferente.",
                  },
                  conflicting_session: {
                    type: "object",
                    properties: {
                      id: {
                        type: "integer",
                        example: 123,
                      },
                      start_time: {
                        type: "string",
                        example: "09:00:00",
                      },
                      end_time: {
                        type: "string",
                        example: "10:00:00",
                      },
                      status: {
                        type: "string",
                        example: "completada",
                      },
                      patient_id: {
                        type: "integer",
                        example: 45,
                      },
                      patient_name: {
                        type: "string",
                        example: "Juan Pérez",
                      },
                    },
                  },
                },
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
    delete: {
      tags: ["Sessions"],
      summary: "Eliminar sesión (Soft Delete)",
      description: "Realiza una eliminación lógica de una sesión marcándola como inactiva. La sesión no será visible en futuras consultas pero se mantiene en la base de datos.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "integer",
            format: "int64",
          },
          description: "ID de la sesión a eliminar",
        },
      ],
      responses: {
        200: {
          description: "Sesión eliminada exitosamente (soft delete)",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: true,
                  },
                  message: {
                    type: "string",
                    example: "Sesión eliminada exitosamente",
                  },
                },
              },
            },
          },
        },
        400: {
          description: "ID de sesión inválido",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        404: {
          description: "Sesión no encontrada o ya está eliminada",
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
  "/api/sessions/{id}/whatsapp-link": {
    get: {
      tags: ["Sessions"],
      summary: "Generar enlace de WhatsApp para recordatorio de cita",
      description: "Genera un enlace de WhatsApp con un mensaje de recordatorio para una sesión específica. Obtiene los datos de la sesión junto con la información del paciente y crea una URL de WhatsApp con el mensaje formateado.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "integer",
            format: "int64",
          },
          description: "ID de la sesión para generar el enlace de WhatsApp",
        },
      ],
      responses: {
        200: {
          description: "Enlace de WhatsApp generado exitosamente",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: true,
                  },
                  data: {
                    type: "object",
                    properties: {
                      session_id: {
                        type: "integer",
                        example: 123,
                        description: "ID de la sesión",
                      },
                      patient_name: {
                        type: "string",
                        example: "Juan Pérez",
                        description: "Nombre del paciente",
                      },
                      session_date: {
                        type: "string",
                        format: "date",
                        example: "2024-03-15",
                        description: "Fecha de la sesión",
                      },
                      start_time: {
                        type: "string",
                        format: "time",
                        example: "10:00:00",
                        description: "Hora de inicio de la sesión",
                      },
                      phone: {
                        type: "string",
                        example: "+34 123 456 789",
                        description: "Teléfono original del paciente",
                      },
                      clean_phone: {
                        type: "string",
                        example: "34123456789",
                        description: "Teléfono limpio para WhatsApp (sin espacios ni caracteres especiales)",
                      },
                      whatsapp_url: {
                        type: "string",
                        format: "uri",
                        example: "https://wa.me/34123456789?text=Hola%20Juan%20P%C3%A9rez...",
                        description: "URL completa de WhatsApp con el mensaje codificado",
                      },
                      message: {
                        type: "string",
                        example: "Hola Juan Pérez,\n\nTe recordamos tu cita de psicología:\n📅 Fecha: viernes, 15 de marzo de 2024\n🕐 Hora: 10:00:00\n\n¡Te esperamos!",
                        description: "Mensaje de recordatorio formateado",
                      },
                      template_used: {
                        type: "string",
                        example: "reminder_1",
                        description: "ID de la plantilla utilizada para el mensaje",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "ID de sesión inválido, sesión no está completada, o número de teléfono inválido",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              examples: {
                invalid_id: {
                  summary: "ID inválido",
                  value: {
                    success: false,
                    error: "ID de sesión inválido",
                  },
                },
                not_scheduled: {
                  summary: "Sesión no programada",
                  value: {
                    success: false,
                    error: "Solo se pueden generar enlaces para sesiones programadas",
                  },
                },
                no_phone: {
                  summary: "Sin teléfono",
                  value: {
                    success: false,
                    error: "El paciente no tiene número de teléfono registrado",
                  },
                },
                invalid_phone: {
                  summary: "Teléfono inválido",
                  value: {
                    success: false,
                    error: "Número de teléfono inválido",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Sesión no encontrada o paciente inactivo",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                success: false,
                error: "Sesión no encontrada o paciente inactivo",
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
  "/api/sessions/kpis": {
    get: {
      tags: ["Sessions"],
      summary: "Obtener KPIs globales de sesiones",
      description: "Obtiene los indicadores clave de rendimiento (KPIs) globales de todas las sesiones activas: total de sesiones, completadas, programadas, canceladas e ingresos totales. Permite filtrar por rango de fechas, clínica, estado de la sesión y método de pago.",
      parameters: [
        {
          name: "fecha_desde",
          in: "query",
          required: false,
          schema: {
            type: "string",
            format: "date",
          },
          description: "Fecha de inicio para filtrar las sesiones (YYYY-MM-DD). El rango no puede exceder los 3 años.",
        },
        {
          name: "fecha_hasta",
          in: "query",
          required: false,
          schema: {
            type: "string",
            format: "date",
          },
          description: "Fecha de fin para filtrar las sesiones (YYYY-MM-DD). El rango no puede exceder los 3 años.",
        },
        {
          name: "clinic_id",
          in: "query",
          required: false,
          schema: {
            type: "integer",
          },
          description: "ID de la clínica para filtrar las sesiones.",
        },
        {
          name: "status",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: ["completada", "cancelada"],
          },
          description: "Estado de la sesión para filtrar.",
        },
        {
          name: "payment_method",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: ["pendiente", "transferencia", "bizum", "efectivo", "tarjeta"],
          },
          description: "Método de pago para filtrar las sesiones.",
        },
      ],
      responses: {
        200: {
          description: "KPIs obtenidos exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SessionsKPIsResponse",
              },
            },
          },
        },
        400: {
          description: "Rango de fechas inválido (excede los 3 años)",
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

module.exports = sessionsPaths;
