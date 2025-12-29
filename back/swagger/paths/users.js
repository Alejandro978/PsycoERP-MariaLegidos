const usersPaths = {
  "/api/users/{id}": {
    get: {
      tags: ["Users"],
      summary: "Obtener usuario por ID",
      description: "Obtiene la información completa de un usuario específico por su ID",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "ID único del usuario",
          schema: {
            type: "integer",
            format: "int64",
            example: 1,
          },
        },
      ],
      responses: {
        200: {
          description: "Usuario obtenido exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UserDetailResponse",
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
              example: {
                success: false,
                error: "ID es requerido y debe ser un número válido",
                message: "Debe proporcionar un ID de usuario válido",
              },
            },
          },
        },
        404: {
          description: "Usuario no encontrado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                success: false,
                error: "Usuario no encontrado",
                message: "El usuario especificado no existe o no está activo",
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
              example: {
                success: false,
                error: "Error al obtener el usuario",
                message: "Ha ocurrido un error interno del servidor",
              },
            },
          },
        },
      },
    },
    put: {
      tags: ["Users"],
      summary: "Actualizar usuario por ID",
      description: "Actualiza la información de un usuario específico. Todos los campos son opcionales, solo se actualizarán los campos enviados en el request.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "ID único del usuario",
          schema: {
            type: "integer",
            format: "int64",
            example: 1,
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/UpdateUserRequest",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Usuario actualizado exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateUserResponse",
              },
            },
          },
        },
        400: {
          description: "Datos inválidos o faltantes",
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
                    error: "ID es requerido y debe ser un número válido",
                    message: "Debe proporcionar un ID de usuario válido",
                  },
                },
                empty_body: {
                  summary: "Cuerpo vacío",
                  value: {
                    success: false,
                    error: "Debe proporcionar al menos un campo para actualizar",
                    message: "El cuerpo de la petición no puede estar vacío",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Usuario no encontrado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                success: false,
                error: "Usuario no encontrado",
                message: "El usuario especificado no existe o no está activo",
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
              example: {
                success: false,
                error: "Error al actualizar el usuario",
                message: "Ha ocurrido un error interno del servidor",
              },
            },
          },
        },
      },
    },
  },
};

module.exports = usersPaths;