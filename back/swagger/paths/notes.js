const notesPaths = {
  "/api/notes": {
    get: {
      tags: ["Notes"],
      summary: "Obtener notas paginadas con KPIs",
      description: "Obtiene una lista paginada de notas con filtros opcionales. Devuelve pending primero, completed después. Incluye KPIs (total, pending, completed). Ordenadas por fecha de creación descendente.",
      parameters: [
        {
          name: "status",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: ["pending", "completed"],
          },
          description: "Estado de la nota",
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
            maximum: 10000,
            default: 10,
          },
          description: "Número de registros por página",
        },
      ],
      responses: {
        200: {
          description: "Lista de notas obtenida exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/NotesResponse",
              },
            },
          },
        },
        400: {
          description: "Error de validación",
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

module.exports = notesPaths;
