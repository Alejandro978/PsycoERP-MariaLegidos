const invoicesPaths = {
  "/api/invoices": {
    get: {
      tags: ["Invoices"],
      summary: "Obtener facturas emitidas de pacientes y llamadas",
      description:
        "Obtiene el listado de facturas emitidas tanto de pacientes como de llamadas. Para pacientes: incluye información completa (incluyendo dirección), detalles de cada sesión facturada (ID, fecha, precio), número de sesiones y total. Si el paciente es menor de edad (is_minor = 1), incluye información de los progenitores para facturación. Para llamadas: incluye información de facturación de la persona que llama y detalles de las llamadas facturadas (estructura similar pero con patient_id null). Si no se especifica mes/año, usa el mes y año actual.",
      parameters: [
        {
          name: "month",
          in: "query",
          required: false,
          schema: {
            type: "integer",
            minimum: 1,
            maximum: 12,
          },
          description: "Mes para filtrar (1-12). Por defecto usa el mes actual.",
        },
        {
          name: "year",
          in: "query",
          required: false,
          schema: {
            type: "integer",
            minimum: 2000,
          },
          description: "Año para filtrar (ej: 2025). Por defecto usa el año actual.",
        },
      ],
      responses: {
        200: {
          description: "Facturas obtenidas exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/IssuedInvoicesResponse",
              },
            },
          },
        },
        400: {
          description: "Parámetros inválidos",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        500: {
          description: "Error del servidor",
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
      tags: ["Invoices"],
      summary: "Generar factura(s)",
      description:
        "Crea una o múltiples facturas. Acepta tanto un objeto individual como un array de objetos. Para cada factura, asocia las sesiones especificadas, las marca como facturadas (invoiced = 1) y registra las relaciones en invoice_sessions. Todo el proceso se ejecuta en una transacción.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              oneOf: [
                {
                  // Múltiples facturas
                  type: "array",
                  items: {
                    type: "object",
                    required: ["invoice_number", "invoice_date", "patient_id", "session_ids", "concept"],
                    properties: {
                      invoice_number: {
                        type: "string",
                        description: "Número único de la factura (ej: 2025-001)",
                        example: "2025-001",
                      },
                      invoice_date: {
                        type: "string",
                        format: "date",
                        description: "Fecha de emisión de la factura (YYYY-MM-DD)",
                        example: "2025-01-15",
                      },
                      patient_id: {
                        type: "integer",
                        description: "ID del paciente",
                        example: 123,
                      },
                      session_ids: {
                        type: "array",
                        items: {
                          type: "integer",
                        },
                        description: "IDs de las sesiones a facturar",
                        example: [45, 46, 47],
                      },
                      concept: {
                        type: "string",
                        description: "Concepto o descripción del servicio facturado",
                        example: "Sesiones de psicología - Enero 2025",
                      },
                    },
                  },
                },
                {
                  // Factura individual
                  type: "object",
                  required: ["invoice_number", "invoice_date", "patient_id", "session_ids", "concept"],
                  properties: {
                    invoice_number: {
                      type: "string",
                      description: "Número único de la factura (ej: 2025-001)",
                      example: "2025-001",
                    },
                    invoice_date: {
                      type: "string",
                      format: "date",
                      description: "Fecha de emisión de la factura (YYYY-MM-DD)",
                      example: "2025-01-15",
                    },
                    patient_id: {
                      type: "integer",
                      description: "ID del paciente",
                      example: 123,
                    },
                    session_ids: {
                      type: "array",
                      items: {
                        type: "integer",
                      },
                      description: "IDs de las sesiones a facturar",
                      example: [45, 46, 47, 48],
                    },
                    concept: {
                      type: "string",
                      description: "Concepto o descripción del servicio facturado",
                      example: "Sesiones de psicología - Enero 2025",
                    },
                  },
                },
              ],
            },
            examples: {
              multipleInvoices: {
                summary: "Múltiples facturas",
                value: [
                  {
                    invoice_number: "2025-001",
                    invoice_date: "2025-01-15",
                    patient_id: 123,
                    session_ids: [45, 46],
                    concept: "Sesiones paciente 1 - Enero 2025",
                  },
                  {
                    invoice_number: "2025-002",
                    invoice_date: "2025-01-15",
                    patient_id: 124,
                    session_ids: [47, 48],
                    concept: "Sesiones paciente 2 - Enero 2025",
                  },
                ],
              },
              singleInvoice: {
                summary: "Factura individual",
                value: {
                  invoice_number: "2025-001",
                  invoice_date: "2025-01-15",
                  patient_id: 123,
                  session_ids: [45, 46, 47, 48],
                  concept: "Sesiones de psicología - Enero 2025",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Factura(s) generada(s) exitosamente",
          content: {
            "application/json": {
              schema: {
                oneOf: [
                  {
                    // Respuesta para factura individual
                    $ref: "#/components/schemas/CreateInvoiceResponse",
                  },
                  {
                    // Respuesta para múltiples facturas
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                        example: "2 factura(s) generada(s) exitosamente",
                      },
                      data: {
                        type: "object",
                        properties: {
                          successful: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                invoice_number: {
                                  type: "string",
                                  example: "2025-001",
                                },
                                success: {
                                  type: "boolean",
                                  example: true,
                                },
                                data: {
                                  type: "object",
                                },
                              },
                            },
                          },
                          failed: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                invoice_number: {
                                  type: "string",
                                  example: "2025-002",
                                },
                                success: {
                                  type: "boolean",
                                  example: false,
                                },
                                error: {
                                  type: "string",
                                  example: "El número de factura ya existe",
                                },
                              },
                            },
                          },
                          summary: {
                            type: "object",
                            properties: {
                              total: {
                                type: "integer",
                                example: 2,
                              },
                              successful: {
                                type: "integer",
                                example: 1,
                              },
                              failed: {
                                type: "integer",
                                example: 1,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        207: {
          description: "Procesamiento parcial - Algunas facturas se generaron y otras fallaron",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: false,
                  },
                  message: {
                    type: "string",
                    example: "1 factura(s) generada(s), 1 fallida(s)",
                  },
                  data: {
                    type: "object",
                    properties: {
                      successful: {
                        type: "array",
                        items: {
                          type: "object",
                        },
                      },
                      failed: {
                        type: "array",
                        items: {
                          type: "object",
                        },
                      },
                      summary: {
                        type: "object",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Datos inválidos o faltantes",
          content: {
            "application/json": {
              schema: {
                oneOf: [
                  {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                  {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: false,
                      },
                      error: {
                        type: "string",
                        example: "Errores de validación",
                      },
                      details: {
                        type: "array",
                        items: {
                          type: "string",
                        },
                        example: [
                          "Factura[0]: Faltan campos obligatorios (invoice_number, invoice_date, patient_id, session_ids, concept)",
                          "Factura[1]: El formato de invoice_date debe ser YYYY-MM-DD",
                        ],
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        409: {
          description: "Número de factura duplicado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        500: {
          description: "Error del servidor",
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
  "/api/invoices/of-clinics": {
    post: {
      tags: ["Invoices"],
      summary: "Generar factura de clínica",
      description:
        "Crea una factura para una clínica facturable. Recupera automáticamente todas las sesiones pendientes de la clínica para el mes/año especificado, las marca como facturadas (invoiced = 1) y registra las relaciones en invoice_sessions. El total es proporcionado por el frontend (ya calculado con IRPF). **Restricción**: No se puede emitir más de una factura por clínica, mes y año. Todo el proceso se ejecuta en una transacción.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["clinic_id", "invoice_number", "invoice_date", "concept", "total", "month", "year"],
              properties: {
                clinic_id: {
                  type: "integer",
                  description: "ID de la clínica a facturar",
                  example: 1,
                },
                invoice_number: {
                  type: "string",
                  description: "Número único de la factura (ej: FAC-2025-001)",
                  example: "FAC-2025-001",
                },
                invoice_date: {
                  type: "string",
                  format: "date",
                  description: "Fecha de emisión de la factura (YYYY-MM-DD)",
                  example: "2025-01-15",
                },
                concept: {
                  type: "string",
                  description: "Concepto o descripción del servicio facturado",
                  example: "Servicios profesionales - Enero 2025",
                },
                total: {
                  type: "number",
                  format: "float",
                  description: "Total de la factura (ya calculado con IRPF por el frontend)",
                  example: 225.00,
                },
                month: {
                  type: "integer",
                  minimum: 1,
                  maximum: 12,
                  description: "Mes de las sesiones a facturar (1-12)",
                  example: 1,
                },
                year: {
                  type: "integer",
                  minimum: 2000,
                  description: "Año de las sesiones a facturar",
                  example: 2025,
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Factura de clínica generada exitosamente",
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
                    example: "Factura FAC-2025-001 generada exitosamente para la clínica",
                  },
                  data: {
                    type: "object",
                    properties: {
                      invoice: {
                        type: "object",
                        description: "Datos de la factura creada",
                        properties: {
                          id: {
                            type: "integer",
                            example: 45,
                          },
                          invoice_number: {
                            type: "string",
                            example: "FAC-2025-001",
                          },
                          clinic_id: {
                            type: "integer",
                            example: 1,
                          },
                          concept: {
                            type: "string",
                            example: "Servicios profesionales - Enero 2025",
                          },
                          total: {
                            type: "number",
                            format: "float",
                            example: 225.00,
                          },
                          month: {
                            type: "integer",
                            example: 1,
                          },
                          year: {
                            type: "integer",
                            example: 2025,
                          },
                        },
                      },
                      sessions_invoiced_count: {
                        type: "integer",
                        description: "Número de sesiones que se marcaron como facturadas",
                        example: 15,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Datos inválidos o faltan campos obligatorios",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        409: {
          description: "Número de factura duplicado o factura ya existe para esta clínica en este período",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        500: {
          description: "Error del servidor",
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
    get: {
      tags: ["Invoices"],
      summary: "Obtener facturas emitidas de clínicas",
      description:
        "Obtiene el listado de facturas emitidas de clínicas con información completa de la clínica (incluyendo datos fiscales), detalles de cada sesión facturada (ID, fecha, precio), número de sesiones y total. Si no se especifica mes/año, usa el mes y año actual.",
      parameters: [
        {
          name: "month",
          in: "query",
          required: false,
          schema: {
            type: "integer",
            minimum: 1,
            maximum: 12,
          },
          description: "Mes para filtrar (1-12). Por defecto usa el mes actual.",
        },
        {
          name: "year",
          in: "query",
          required: false,
          schema: {
            type: "integer",
            minimum: 2000,
          },
          description: "Año para filtrar (ej: 2025). Por defecto usa el año actual.",
        },
      ],
      responses: {
        200: {
          description: "Facturas de clínicas obtenidas exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/IssuedInvoicesOfClinicsResponse",
              },
            },
          },
        },
        400: {
          description: "Parámetros inválidos",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        500: {
          description: "Error del servidor",
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
  "/api/invoices/kpis": {
    get: {
      tags: ["Invoices"],
      summary: "Obtener KPIs de facturación",
      description:
        "Obtiene los KPIs de facturación incluyendo: 1) Total facturas emitidas, 2) Total bruto histórico, 3) Total bruto filtrado por mes/año, 4) Total neto filtrado por mes/año, 5) Total neto por clínica filtrado por mes/año. Si no se especifica mes/año, usa el mes y año actual.",
      parameters: [
        {
          name: "month",
          in: "query",
          required: false,
          schema: {
            type: "integer",
            minimum: 1,
            maximum: 12,
          },
          description: "Mes para filtrar (1-12). Por defecto usa el mes actual.",
        },
        {
          name: "year",
          in: "query",
          required: false,
          schema: {
            type: "integer",
            minimum: 2000,
          },
          description: "Año para filtrar (ej: 2025). Por defecto usa el año actual.",
        },
      ],
      responses: {
        200: {
          description: "KPIs obtenidos exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/InvoiceKPIsResponse",
              },
            },
          },
        },
        400: {
          description: "Parámetros inválidos",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        500: {
          description: "Error del servidor",
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
  "/api/invoices/pending": {
    get: {
      tags: ["Invoices"],
      summary: "Obtener sesiones y llamadas pendientes de facturar",
      description:
        "Obtiene las sesiones pendientes de facturar agrupadas por paciente y las llamadas facturables pendientes. Incluye información del paciente (incluyendo dirección), detalles completos de cada sesión (ID, fecha, precio), número de sesiones y total bruto. Si el paciente es menor de edad (is_minor = 1), incluye información de los progenitores para facturación. También devuelve las llamadas facturables (is_call = true && is_billable_call = true) con sus datos de facturación. Si no se especifica mes/año, usa el mes y año actual.",
      parameters: [
        {
          name: "month",
          in: "query",
          required: false,
          schema: {
            type: "integer",
            minimum: 1,
            maximum: 12,
          },
          description: "Mes para filtrar (1-12). Por defecto usa el mes actual.",
        },
        {
          name: "year",
          in: "query",
          required: false,
          schema: {
            type: "integer",
            minimum: 2000,
          },
          description: "Año para filtrar (ej: 2025). Por defecto usa el año actual.",
        },
      ],
      responses: {
        200: {
          description: "Sesiones pendientes obtenidas exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/PendingInvoicesResponse",
              },
            },
          },
        },
        400: {
          description: "Parámetros inválidos",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        500: {
          description: "Error del servidor",
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
  "/api/invoices/pending-of-clinics": {
    get: {
      tags: ["Invoices"],
      summary: "Obtener facturas pendientes de clínicas",
      description:
        "Obtiene las sesiones pendientes de facturar agrupadas por clínica facturable (is_billable = true). Incluye nombre de la clínica, número de sesiones y total neto (calculado como precio * porcentaje de la clínica). Si no se especifica mes/año, usa el mes y año actual.",
      parameters: [
        {
          name: "month",
          in: "query",
          required: false,
          schema: {
            type: "integer",
            minimum: 1,
            maximum: 12,
          },
          description: "Mes para filtrar (1-12). Por defecto usa el mes actual.",
        },
        {
          name: "year",
          in: "query",
          required: false,
          schema: {
            type: "integer",
            minimum: 2000,
          },
          description: "Año para filtrar (ej: 2025). Por defecto usa el año actual.",
        },
      ],
      responses: {
        200: {
          description: "Facturas pendientes de clínicas obtenidas exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/PendingInvoicesOfClinicsResponse",
              },
            },
          },
        },
        400: {
          description: "Parámetros inválidos",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        500: {
          description: "Error del servidor",
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
  "/api/invoices/last-number": {
    get: {
      tags: ["Invoices"],
      summary: "Obtener último número de factura del año",
      description:
        "Obtiene el último número secuencial de factura emitida para el año especificado. Por ejemplo, si la última factura es FAC-2025-0017, devolverá 17. Si no hay facturas para ese año, devuelve 0.",
      parameters: [
        {
          name: "year",
          in: "query",
          required: true,
          schema: {
            type: "integer",
            minimum: 2000,
          },
          description: "Año para consultar el último número de factura (ej: 2025)",
          example: 2025,
        },
      ],
      responses: {
        200: {
          description: "Último número obtenido exitosamente",
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
                      year: {
                        type: "integer",
                        description: "Año consultado",
                        example: 2025,
                      },
                      last_invoice_number: {
                        type: "integer",
                        description: "Último número secuencial de factura (0 si no hay facturas)",
                        example: 17,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Parámetro year faltante o inválido",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        500: {
          description: "Error del servidor",
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

module.exports = invoicesPaths;
