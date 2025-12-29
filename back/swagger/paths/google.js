const googlePaths = {
  "/api/google/auth-url": {
    get: {
      tags: ["Google OAuth"],
      summary: "Generar URL de autorización de Google",
      description: "Genera una URL para que la usuaria autorice la aplicación para crear eventos en Google Calendar. Esta URL debe ser visitada en un navegador donde la usuaria tenga su cuenta de Google activa.",
      responses: {
        200: {
          description: "URL generada exitosamente",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: true,
                  },
                  authUrl: {
                    type: "string",
                    description: "URL de autorización de Google OAuth2",
                    example: "https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&...",
                  },
                  environment: {
                    type: "string",
                    description: "Entorno detectado (TEST o PRODUCTION)",
                    example: "PRODUCTION",
                  },
                  instructions: {
                    type: "string",
                    example: "Visit this URL to authorize the application",
                  },
                },
              },
            },
          },
        },
        500: {
          description: "Error generando URL de autorización",
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
  "/api/google/oauth2callback": {
    get: {
      tags: ["Google OAuth"],
      summary: "Callback de OAuth2",
      description: "Endpoint al que Google redirige después de que la usuaria autoriza la aplicación. Intercambia el código de autorización por tokens y los guarda automáticamente. **Nota**: Este endpoint es llamado automáticamente por Google, no debe ser invocado manualmente.",
      parameters: [
        {
          name: "code",
          in: "query",
          required: true,
          description: "Código de autorización proporcionado por Google",
          schema: {
            type: "string",
            example: "4/0AVGzR1BKZ0d1-wRjRAiwp0ohDo-EQnD7...",
          },
        },
      ],
      responses: {
        200: {
          description: "Token guardado exitosamente - Muestra página HTML de éxito",
          content: {
            "text/html": {
              schema: {
                type: "string",
                example: "<html><body><h1>✅ ¡Autorización Exitosa!</h1>...</body></html>",
              },
            },
          },
        },
        400: {
          description: "Código de autorización faltante",
          content: {
            "text/html": {
              schema: {
                type: "string",
              },
            },
          },
        },
        500: {
          description: "Error intercambiando código por token",
          content: {
            "text/html": {
              schema: {
                type: "string",
              },
            },
          },
        },
      },
    },
  },
  "/api/google/status": {
    get: {
      tags: ["Google OAuth"],
      summary: "Verificar estado del token actual",
      description: "Verifica si existe un token de Google Calendar, si tiene refresh_token, y si está expirado. Útil para diagnóstico y monitoreo.",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Estado del token obtenido exitosamente",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: true,
                  },
                  environment: {
                    type: "string",
                    description: "Entorno detectado",
                    example: "PRODUCTION",
                  },
                  hasToken: {
                    type: "boolean",
                    description: "Indica si existe un archivo de token",
                    example: true,
                  },
                  hasRefreshToken: {
                    type: "boolean",
                    description: "Indica si el token incluye refresh_token",
                    example: true,
                  },
                  expiryDate: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                    description: "Fecha de expiración del access_token",
                    example: "2025-10-22T15:30:00.000Z",
                  },
                  isExpired: {
                    type: "boolean",
                    description: "Indica si el access_token está expirado (se renovará automáticamente si hay refresh_token)",
                    example: false,
                  },
                  message: {
                    type: "string",
                    description: "Mensaje descriptivo del estado",
                    example: "Token is valid and will auto-renew",
                  },
                },
              },
            },
          },
        },
        401: {
          description: "No autorizado - Token JWT inválido o faltante",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        500: {
          description: "Error verificando estado del token",
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

module.exports = googlePaths;
