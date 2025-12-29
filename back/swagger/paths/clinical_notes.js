const clinicalNotesPaths = {
  "/api/clinical-notes/patient/{patient_id}": {
    get: {
      tags: ["Clinical Notes"],
      summary: "Obtener notas clínicas por ID de paciente",
      description:
        "Obtiene todas las notas clínicas de un paciente específico, ordenadas por fecha de creación (más recientes primero).",
      parameters: [
        {
          name: "patient_id",
          in: "path",
          required: true,
          schema: {
            type: "integer",
            format: "int64",
          },
          description: "ID del paciente",
          example: 123,
        },
      ],
      responses: {
        200: {
          description: "Notas clínicas obtenidas exitosamente",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: true,
                  },
                  total: {
                    type: "integer",
                    description: "Número total de notas encontradas",
                    example: 5,
                  },
                  data: {
                    type: "array",
                    items: {
                      $ref: "#/definitions/ClinicalNoteSimple",
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "ID de paciente inválido",
          content: {
            "application/json": {
              schema: {
                $ref: "#/definitions/ErrorResponse",
              },
            },
          },
        },
        500: {
          description: "Error interno del servidor",
          content: {
            "application/json": {
              schema: {
                $ref: "#/definitions/ErrorResponse",
              },
            },
          },
        },
      },
    },
  },
  "/api/clinical-notes": {
    post: {
      tags: ["Clinical Notes"],
      summary: "Crear nueva nota clínica",
      description:
        "Crea una nueva nota clínica para un paciente específico. La fecha se establece automáticamente al momento de la creación.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["patient_id", "title", "content"],
              properties: {
                patient_id: {
                  type: "integer",
                  format: "int64",
                  description: "ID del paciente para quien se crea la nota",
                  example: 123,
                },
                title: {
                  type: "string",
                  minLength: 3,
                  maxLength: 255,
                  description: "Título de la nota clínica (3-255 caracteres)",
                  example: "Sesión inicial - Evaluación diagnóstica",
                },
                content: {
                  type: "string",
                  minLength: 3,
                  description:
                    "Contenido de la nota clínica (mínimo 10 caracteres)",
                  example:
                    "El paciente muestra signos de ansiedad generalizada. Se recomienda iniciar terapia cognitivo-conductual...",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Nota clínica creada exitosamente",
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
                    example: "Nota clínica creada exitosamente",
                  },
                  data: {
                    $ref: "#/components/schemas/ClinicalNote",
                  },
                },
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
              examples: {
                missing_fields: {
                  summary: "Campos obligatorios faltantes",
                  value: {
                    success: false,
                    error: "Campos obligatorios faltantes",
                    required_fields: ["patient_id", "title", "content"],
                  },
                },
                invalid_patient_id: {
                  summary: "Patient ID inválido",
                  value: {
                    success: false,
                    error: "patient_id debe ser un número entero positivo",
                  },
                },
                invalid_title: {
                  summary: "Título inválido",
                  value: {
                    success: false,
                    error: "El título debe tener entre 3 y 255 caracteres",
                  },
                },
                invalid_content: {
                  summary: "Contenido inválido",
                  value: {
                    success: false,
                    error: "El contenido debe tener al menos 10 caracteres",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Paciente no encontrado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                success: false,
                error: "Paciente no encontrado",
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
  "/api/clinical-notes/{id}": {
    put: {
      tags: ["Clinical Notes"],
      summary: "Actualizar nota clínica",
      description:
        "Actualiza una nota clínica existente. Solo se actualizan los campos proporcionados.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "integer",
            format: "int64",
          },
          description: "ID de la nota clínica",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  minLength: 3,
                  maxLength: 255,
                  description: "Título de la nota clínica",
                },
                content: {
                  type: "string",
                  minLength: 10,
                  description: "Contenido de la nota clínica",
                }
              },
              description: "Al menos un campo debe ser proporcionado",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Nota clínica actualizada exitosamente",
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
                    example: "Nota clínica actualizada exitosamente",
                  },
                  data: {
                    $ref: "#/components/schemas/ClinicalNote",
                  },
                },
              },
            },
          },
        },
        400: {
          description:
            "Datos inválidos o no se proporcionaron campos para actualizar",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        404: {
          description: "Nota clínica no encontrada",
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
    delete: {
      tags: ["Clinical Notes"],
      summary: "Eliminar nota clínica",
      description: "Elimina permanentemente una nota clínica del sistema.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "integer",
            format: "int64",
          },
          description: "ID de la nota clínica",
        },
      ],
      responses: {
        200: {
          description: "Nota clínica eliminada exitosamente",
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
                    example: "Nota clínica eliminada exitosamente",
                  },
                },
              },
            },
          },
        },
        400: {
          description: "ID inválido",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        404: {
          description: "Nota clínica no encontrada",
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

module.exports = clinicalNotesPaths;
