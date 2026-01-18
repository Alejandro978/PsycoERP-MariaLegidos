const invitationsPaths = {
  "/api/invitations/generate": {
    post: {
      tags: ["Invitations"],
      summary: "Generar nueva invitación",
      description: "Genera un token único de invitación para que un paciente se auto-registre. El enlace tiene validez de 7 días.",
      security: [
        {
          bearerAuth: [],
        },
      ],
      responses: {
        201: {
          description: "Invitación generada exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/InvitationGenerateResponse",
              },
            },
          },
        },
        401: {
          description: "No autorizado - Token JWT requerido",
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
  "/api/invitations/validate/{token}": {
    get: {
      tags: ["Invitations"],
      summary: "Validar token de invitación",
      description: "Valida si un token de invitación existe, está pendiente y no ha expirado. Endpoint público sin autenticación.",
      security: [],
      parameters: [
        {
          name: "token",
          in: "path",
          required: true,
          description: "Token de invitación a validar",
          schema: {
            type: "string",
            example: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
          },
        },
      ],
      responses: {
        200: {
          description: "Token válido",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/InvitationValidateResponse",
              },
            },
          },
        },
        400: {
          description: "Token inválido, usado o expirado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              examples: {
                token_used: {
                  summary: "Token ya utilizado",
                  value: {
                    success: false,
                    valid: false,
                    message: "Este enlace de invitación ya ha sido utilizado",
                  },
                },
                token_expired: {
                  summary: "Token expirado",
                  value: {
                    success: false,
                    valid: false,
                    message: "Este enlace de invitación ha expirado",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Token no encontrado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                success: false,
                valid: false,
                message: "Token no encontrado",
              },
            },
          },
        },
        429: {
          description: "Demasiadas solicitudes (rate limit)",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                success: false,
                message: "Demasiadas solicitudes. Por favor, intente nuevamente en 15 minutos",
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
  "/api/patients/register/{token}": {
    post: {
      tags: ["Invitations"],
      summary: "Registrar paciente con invitación",
      description: "Registra un nuevo paciente usando un token de invitación válido. Marca el token como usado al completar el registro. Endpoint público sin autenticación.",
      security: [],
      parameters: [
        {
          name: "token",
          in: "path",
          required: true,
          description: "Token de invitación",
          schema: {
            type: "string",
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/PatientRegisterRequest",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Paciente registrado exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/PatientRegisterResponse",
              },
            },
          },
        },
        400: {
          description: "Datos inválidos o token inválido/expirado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              examples: {
                missing_data: {
                  summary: "Datos faltantes",
                  value: {
                    success: false,
                    message: "Nombre y apellidos son obligatorios",
                  },
                },
                token_used: {
                  summary: "Token ya utilizado",
                  value: {
                    success: false,
                    message: "Este enlace de invitación ya ha sido utilizado",
                  },
                },
                token_expired: {
                  summary: "Token expirado",
                  value: {
                    success: false,
                    message: "Este enlace de invitación ha expirado",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Token no encontrado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                success: false,
                message: "Token no encontrado",
              },
            },
          },
        },
        429: {
          description: "Demasiadas solicitudes (rate limit)",
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
  "/api/invitations": {
    get: {
      tags: ["Invitations"],
      summary: "Listar invitaciones",
      description: "Obtiene todas las invitaciones con paginación y filtros opcionales.",
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          name: "status",
          in: "query",
          description: "Filtrar por estado",
          schema: {
            type: "string",
            enum: ["pending", "used", "expired"],
          },
        },
        {
          name: "fecha_desde",
          in: "query",
          description: "Fecha de creación desde (YYYY-MM-DD)",
          schema: {
            type: "string",
            format: "date",
            example: "2024-01-01",
          },
        },
        {
          name: "fecha_hasta",
          in: "query",
          description: "Fecha de creación hasta (YYYY-MM-DD)",
          schema: {
            type: "string",
            format: "date",
            example: "2024-12-31",
          },
        },
        {
          name: "page",
          in: "query",
          description: "Número de página",
          schema: {
            type: "integer",
            default: 1,
            minimum: 1,
          },
        },
        {
          name: "limit",
          in: "query",
          description: "Registros por página",
          schema: {
            type: "integer",
            default: 10,
            minimum: 1,
            maximum: 100,
          },
        },
      ],
      responses: {
        200: {
          description: "Lista de invitaciones obtenida exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/InvitationsListResponse",
              },
            },
          },
        },
        400: {
          description: "Parámetros de paginación inválidos",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        401: {
          description: "No autorizado - Token JWT requerido",
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
  "/api/invitations/{id}": {
    delete: {
      tags: ["Invitations"],
      summary: "Eliminar invitación",
      description: "Marca una invitación como 'expired' (soft delete). Solo se pueden eliminar invitaciones con estado 'pending'.",
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "ID de la invitación",
          schema: {
            type: "integer",
            example: 1,
          },
        },
      ],
      responses: {
        200: {
          description: "Invitación eliminada exitosamente",
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
                    example: "Invitación eliminada exitosamente",
                  },
                },
              },
            },
          },
        },
        400: {
          description: "ID inválido o invitación no pendiente",
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
                    message: "ID de invitación inválido",
                  },
                },
                not_pending: {
                  summary: "Invitación no pendiente",
                  value: {
                    success: false,
                    message: "Solo se pueden eliminar invitaciones pendientes",
                  },
                },
              },
            },
          },
        },
        401: {
          description: "No autorizado - Token JWT requerido",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        404: {
          description: "Invitación no encontrada",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                success: false,
                message: "Invitación no encontrada",
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

module.exports = invitationsPaths;
