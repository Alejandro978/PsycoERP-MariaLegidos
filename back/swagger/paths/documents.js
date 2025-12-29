const documentsPaths = {
  "/api/documents/patient/{patient_id}": {
    get: {
      tags: ["Documents"],
      summary: "Get documents by patient ID",
      description:
        "Retrieves all documents for a specific patient, ordered by upload date (most recent first).",
      parameters: [
        {
          name: "patient_id",
          in: "path",
          required: true,
          schema: {
            type: "integer",
            format: "int64",
          },
          description: "Patient ID",
          example: 123,
        },
      ],
      responses: {
        200: {
          description: "Documents retrieved successfully",
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
                    description: "Total number of documents found",
                    example: 3,
                  },
                  data: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/Document",
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid patient ID",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              examples: {
                missing_id: {
                  summary: "Missing patient ID",
                  value: {
                    success: false,
                    error: "Patient ID is required",
                  },
                },
                invalid_id: {
                  summary: "Invalid patient ID format",
                  value: {
                    success: false,
                    error: "Patient ID must be a valid number",
                  },
                },
              },
            },
          },
        },
        500: {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                success: false,
                error: "Error retrieving patient documents",
              },
            },
          },
        },
      },
    },
  },
  "/api/documents": {
    post: {
      tags: ["Documents"],
      summary: "Subir documento de paciente",
      description:
        "Permite subir un documento (PDF, JPG, PNG, DOC, DOCX) asociado a un paciente específico. El archivo debe ser menor a 10MB.",
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["file", "patient_id", "description"],
              properties: {
                file: {
                  type: "string",
                  format: "binary",
                  description: "Archivo a subir (PDF, JPG, PNG, DOC, DOCX)",
                },
                patient_id: {
                  type: "integer",
                  description: "ID del paciente",
                  example: 1,
                },
                description: {
                  type: "string",
                  description: "Descripción del documento",
                  example: "Informe inicial de evaluación psicológica",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Documento subido correctamente",
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
                    example: "Documento subido correctamente",
                  },
                  data: {
                    $ref: "#/components/schemas/Document",
                  },
                },
              },
            },
          },
        },
        400: {
          description:
            "Validación fallida (archivo no proporcionado, descripción vacía, tipo no permitido, o archivo mayor a 10MB)",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              examples: {
                no_patient_id: {
                  summary: "Sin patient_id",
                  value: {
                    success: false,
                    error: "El patient_id es obligatorio",
                  },
                },
                no_file: {
                  summary: "Sin archivo",
                  value: {
                    success: false,
                    error: "No se proporcionó ningún archivo",
                  },
                },
                no_description: {
                  summary: "Sin descripción",
                  value: {
                    success: false,
                    error: "La descripción es obligatoria",
                  },
                },
                invalid_type: {
                  summary: "Tipo de archivo inválido",
                  value: {
                    success: false,
                    error:
                      "Tipo de archivo no permitido. Solo PDF, JPG, PNG, DOC, DOCX son aceptados.",
                  },
                },
                file_too_large: {
                  summary: "Archivo muy grande",
                  value: {
                    success: false,
                    error:
                      "El archivo excede el tamaño máximo permitido de 10MB",
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
  "/api/documents/{id}/download": {
    get: {
      tags: ["Documents"],
      summary: "Obtener URL de descarga de un documento",
      description:
        "Devuelve la URL pública del archivo en el VPS para poder descargarlo.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "integer",
            format: "int64",
          },
          description: "ID del documento",
          example: 42,
        },
      ],
      responses: {
        200: {
          description: "URL de descarga obtenida exitosamente",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  file_url: {
                    type: "string",
                    example:
                      "https://midominio.com/uploads/paciente42/documento.pdf",
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
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                success: false,
                error: "El ID es obligatorio",
              },
            },
          },
        },
        404: {
          description: "Documento no encontrado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                success: false,
                error: "Documento no encontrado",
              },
            },
          },
        },
        500: {
          description: "Error interno del servidor",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/api/documents/{id}": {
    delete: {
      tags: ["Documents"],
      summary: "Eliminar documento",
      description:
        "Elimina un documento de la base de datos (soft delete) y el archivo físico del VPS via SFTP.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "integer",
            format: "int64",
          },
          description: "ID del documento a eliminar",
          example: 42,
        },
      ],
      responses: {
        200: {
          description: "Documento eliminado correctamente",
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
                    example: "Documento eliminado correctamente",
                  },
                },
              },
            },
          },
        },
        400: {
          description: "ID inválido o no proporcionado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              examples: {
                missing_id: {
                  summary: "ID no proporcionado",
                  value: {
                    success: false,
                    error: "El ID es obligatorio",
                  },
                },
                invalid_id: {
                  summary: "ID inválido",
                  value: {
                    success: false,
                    error: "El ID debe ser un número válido",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Documento no encontrado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                success: false,
                error: "Documento no encontrado",
              },
            },
          },
        },
        500: {
          description: "Error interno del servidor",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                success: false,
                error: "Error al eliminar el documento",
              },
            },
          },
        },
      },
    },
  },
};

module.exports = documentsPaths;
