const authPaths = {
  "/api/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Login de usuario",
      description: "Autentica al usuario verificando email y contraseña hasheada con bcrypt. Actualiza la fecha de último login y devuelve los datos del usuario.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/LoginRequest",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Login exitoso",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginResponse",
              },
            },
          },
        },
        400: {
          description: "Datos faltantes (email y password son obligatorios)",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                success: false,
                message: "Email y contraseña son obligatorios",
              },
            },
          },
        },
        401: {
          description: "Credenciales inválidas o cuenta desactivada",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              examples: {
                invalid_credentials: {
                  summary: "Credenciales incorrectas",
                  value: {
                    success: false,
                    message: "Credenciales inválidas",
                  },
                },
                account_disabled: {
                  summary: "Cuenta desactivada",
                  value: {
                    success: false,
                    message: "Cuenta desactivada",
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
                message: "Usuario no encontrado",
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
  "/api/auth/refresh": {
    post: {
      tags: ["Auth"],
      summary: "Renovar token JWT",
      description: "Renueva un token JWT expirado o próximo a expirar. Acepta tokens expirados y genera uno nuevo con 7 días de validez.",
      security: [
        {
          bearerAuth: [],
        },
      ],
      responses: {
        200: {
          description: "Token renovado exitosamente",
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
                    example: "Token renovado exitosamente",
                  },
                  data: {
                    type: "object",
                    properties: {
                      access_token: {
                        type: "string",
                        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                      },
                      token_type: {
                        type: "string",
                        example: "Bearer",
                      },
                      expires_in: {
                        type: "string",
                        example: "7d",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Token requerido, inválido o usuario no encontrado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              examples: {
                no_token: {
                  summary: "Token no proporcionado",
                  value: {
                    success: false,
                    message: "Token requerido para renovación",
                  },
                },
                invalid_token: {
                  summary: "Token inválido",
                  value: {
                    success: false,
                    message: "Token inválido para renovación",
                  },
                },
                user_not_found: {
                  summary: "Usuario no encontrado",
                  value: {
                    success: false,
                    message: "Usuario no encontrado",
                  },
                },
                account_disabled: {
                  summary: "Cuenta desactivada",
                  value: {
                    success: false,
                    message: "Cuenta desactivada",
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
  "/api/auth/hash-password": {
    post: {
      tags: ["Auth"],
      summary: "Encriptar contraseña",
      description: "Utilidad de desarrollo para encriptar contraseñas con bcrypt. Devuelve el hash y la query SQL para actualizar la base de datos.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["password"],
              properties: {
                password: {
                  type: "string",
                  description: "Contraseña a encriptar",
                  example: "miPassword123",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Contraseña encriptada exitosamente",
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
                    example: "Contraseña encriptada exitosamente",
                  },
                  data: {
                    type: "object",
                    properties: {
                      original_password: {
                        type: "string",
                        example: "miPassword123",
                      },
                      hashed_password: {
                        type: "string",
                        example: "$2b$10$abcd1234efgh5678ijkl9012mnop3456qrst7890uvwxyz",
                      },
                      salt_rounds: {
                        type: "integer",
                        example: 10,
                      },
                      sql_query: {
                        type: "string",
                        example: "UPDATE users SET password_hash = '$2b$10$abcd1234efgh5678ijkl9012mnop3456qrst7890uvwxyz' WHERE email = 'tu-email@ejemplo.com';",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Password requerido",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                success: false,
                message: "La contraseña es obligatoria",
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

module.exports = authPaths;