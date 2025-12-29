const bonusesPaths = {
  "/api/bonuses": {
    get: {
      tags: ["Bonuses"],
      summary: "Obtener bonuses",
      description: "Obtiene una lista de bonuses con filtros opcionales",
      parameters: [
        {
          name: "patient_id",
          in: "query",
          required: false,
          schema: {
            type: "integer",
          },
          description: "ID del paciente",
        },
        {
          name: "status",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: ["active", "consumed", "expired"],
          },
          description: "Estado del bonus",
        },
        {
          name: "fecha_desde",
          in: "query",
          required: false,
          schema: {
            type: "string",
            format: "date",
          },
          description: "Fecha de inicio del rango para filtrar por fecha de compra (YYYY-MM-DD)",
        },
        {
          name: "fecha_hasta",
          in: "query",
          required: false,
          schema: {
            type: "string",
            format: "date",
          },
          description: "Fecha de fin del rango para filtrar por fecha de compra (YYYY-MM-DD)",
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
          description: "Número de página (por defecto: 1)",
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
          description: "Cantidad de registros por página (por defecto: 10, máximo: 100)",
        },
      ],
      responses: {
        200: {
          description: "Lista de bonuses obtenida exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/BonusesResponse",
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
      tags: ["Bonuses"],
      summary: "Crear un nuevo bonus",
      description: "Crea un nuevo bonus para un paciente",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/CreateBonusRequest",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Bonus creado exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateBonusResponse",
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
  "/api/bonuses/patient/{patient_id}": {
    get: {
      tags: ["Bonuses"],
      summary: "Obtener bonuses por paciente con KPIs",
      description: "Obtiene todos los bonuses de un paciente específico con KPIs de resumen",
      parameters: [
        {
          name: "patient_id",
          in: "path",
          required: true,
          schema: {
            type: "integer",
          },
          description: "ID del paciente",
        },
      ],
      responses: {
        200: {
          description: "Bonuses del paciente obtenidos exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/PatientBonusesResponse",
              },
            },
          },
        },
        400: {
          description: "ID del paciente inválido o no proporcionado",
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
  "/api/bonuses/{id}/history": {
    get: {
      tags: ["Bonuses"],
      summary: "Obtener historial completo de un bonus",
      description: "Obtiene información detallada de un bonus específico incluyendo sesiones utilizadas, sesiones restantes, progreso y historial de uso",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "integer",
          },
          description: "ID del bonus",
        },
      ],
      responses: {
        200: {
          description: "Historial del bonus obtenido exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/BonusHistoryResponse",
              },
            },
          },
        },
        400: {
          description: "ID del bonus inválido o no proporcionado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        404: {
          description: "Bonus no encontrado",
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
  "/api/bonuses/{id}/use-session": {
    post: {
      tags: ["Bonuses"],
      summary: "Registrar uso de una sesión del bonus",
      description: "Registra el uso de una sesión de un bonus específico. La fecha se genera automáticamente con la fecha actual.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "integer",
          },
          description: "ID del bonus",
        },
      ],
      responses: {
        201: {
          description: "Sesión registrada exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UseBonusSessionResponse",
              },
            },
          },
        },
        400: {
          description: "Bonus no disponible para uso",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        404: {
          description: "Bonus no encontrado",
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

module.exports = bonusesPaths;