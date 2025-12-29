const patientsPaths = {
  "/api/patients/active-with-clinic": {
    get: {
      tags: ["Patients"],
      summary: "Obtener pacientes activos con información de clínica",
      description: "Obtiene una lista de todos los pacientes activos (is_active = 1 AND status = 'en curso') con la información de su clínica asociada",
      responses: {
        200: {
          description: "Lista de pacientes activos con información de clínica obtenida exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ActivePatientsWithClinicResponse",
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
  "/api/patients/inactive": {
    get: {
      tags: ["Patients"],
      summary: "Obtener pacientes inactivos",
      description: "Obtiene una lista de pacientes inactivos (status != 'en curso')",
      parameters: [
        {
          name: "first_name",
          in: "query",
          required: false,
          schema: {
            type: "string",
          },
          description: "Nombre del paciente (búsqueda parcial)",
        },
        {
          name: "last_name",
          in: "query",
          required: false,
          schema: {
            type: "string",
          },
          description: "Apellidos del paciente (búsqueda parcial)",
        },
        {
          name: "email",
          in: "query",
          required: false,
          schema: {
            type: "string",
            format: "email",
          },
          description: "Email del paciente (búsqueda parcial)",
        },
        {
          name: "dni",
          in: "query",
          required: false,
          schema: {
            type: "string",
          },
          description: "DNI del paciente (búsqueda exacta)",
        },
        {
          name: "status",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: ["en curso", "fin del tratamiento", "en pausa", "abandono", "derivación"],
          },
          description: "Estado del tratamiento",
        },
        {
          name: "gender",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: ["M", "F", "O"],
          },
          description: "Género del paciente (M=Masculino, F=Femenino, O=Otro)",
        },
        {
          name: "occupation",
          in: "query",
          required: false,
          schema: {
            type: "string",
          },
          description: "Ocupación/Escuela/Trabajo (búsqueda parcial)",
        },
        {
          name: "clinic_id",
          in: "query",
          required: false,
          schema: {
            type: "integer",
            format: "int64",
          },
          description: "ID de la clínica asignada",
        },
        {
          name: "is_minor",
          in: "query",
          required: false,
          schema: {
            type: "boolean",
          },
          description: "Filtrar por menores de edad (true/false)",
        },
        {
          name: "birth_date",
          in: "query",
          required: false,
          schema: {
            type: "string",
            format: "date",
          },
          description: "Fecha de nacimiento específica (YYYY-MM-DD)",
        },
        {
          name: "fecha_desde",
          in: "query",
          required: false,
          schema: {
            type: "string",
            format: "date",
          },
          description: "Fecha de inicio del rango para filtrar por fecha de creación (YYYY-MM-DD)",
        },
        {
          name: "fecha_hasta",
          in: "query",
          required: false,
          schema: {
            type: "string",
            format: "date",
          },
          description: "Fecha de fin del rango para filtrar por fecha de creación (YYYY-MM-DD)",
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
          description: "Número de página para la paginación (por defecto: 1)",
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
          description: "Número de registros por página (por defecto: 10, máximo: 100)",
        },
      ],
      responses: {
        200: {
          description: "Lista de pacientes inactivos obtenida exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/PatientsResponse",
              },
            },
          },
        },
        400: {
          description: "Parámetros de entrada inválidos (página < 1, límite fuera del rango 1-100, etc.)",
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
  "/api/patients": {
    get: {
      tags: ["Patients"],
      summary: "Obtener pacientes",
      description: "Obtiene una lista de pacientes con filtros opcionales",
      parameters: [
        {
          name: "first_name",
          in: "query",
          required: false,
          schema: {
            type: "string",
          },
          description: "Nombre del paciente (búsqueda parcial)",
        },
        {
          name: "last_name",
          in: "query",
          required: false,
          schema: {
            type: "string",
          },
          description: "Apellidos del paciente (búsqueda parcial)",
        },
        {
          name: "email",
          in: "query",
          required: false,
          schema: {
            type: "string",
            format: "email",
          },
          description: "Email del paciente (búsqueda parcial)",
        },
        {
          name: "dni",
          in: "query",
          required: false,
          schema: {
            type: "string",
          },
          description: "DNI del paciente (búsqueda exacta)",
        },
        {
          name: "status",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: ["en curso", "fin del tratamiento", "en pausa", "abandono", "derivación"],
          },
          description: "Estado del tratamiento",
        },
        {
          name: "gender",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: ["M", "F", "O"],
          },
          description: "Género del paciente (M=Masculino, F=Femenino, O=Otro)",
        },
        {
          name: "occupation",
          in: "query",
          required: false,
          schema: {
            type: "string",
          },
          description: "Ocupación/Escuela/Trabajo (búsqueda parcial)",
        },
        {
          name: "clinic_id",
          in: "query",
          required: false,
          schema: {
            type: "integer",
            format: "int64",
          },
          description: "ID de la clínica asignada",
        },
        {
          name: "is_minor",
          in: "query",
          required: false,
          schema: {
            type: "boolean",
          },
          description: "Filtrar por menores de edad (true/false)",
        },
        {
          name: "birth_date",
          in: "query",
          required: false,
          schema: {
            type: "string",
            format: "date",
          },
          description: "Fecha de nacimiento específica (YYYY-MM-DD)",
        },
        {
          name: "fecha_desde",
          in: "query",
          required: false,
          schema: {
            type: "string",
            format: "date",
          },
          description: "Fecha de inicio del rango para filtrar por fecha de creación (YYYY-MM-DD)",
        },
        {
          name: "fecha_hasta",
          in: "query",
          required: false,
          schema: {
            type: "string",
            format: "date",
          },
          description: "Fecha de fin del rango para filtrar por fecha de creación (YYYY-MM-DD)",
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
          description: "Número de página para la paginación (por defecto: 1)",
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
          description: "Número de registros por página (por defecto: 10, máximo: 100)",
        },
      ],
      responses: {
        200: {
          description: "Lista de pacientes obtenida exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/PatientsResponse",
              },
            },
          },
        },
        400: {
          description: "Parámetros de entrada inválidos (página < 1, límite fuera del rango 1-100, etc.)",
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
      tags: ["Patients"],
      summary: "Crear nuevo paciente",
      description: "Crea un nuevo paciente en el sistema con los datos proporcionados",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/CreatePatientRequest",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Paciente creado exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreatePatientResponse",
              },
            },
          },
        },
        400: {
          description: "Datos de entrada inválidos o campos requeridos faltantes",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        409: {
          description: "Email o DNI ya registrados",
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
  "/api/patients/{id}/restore": {
    put: {
      tags: ["Patients"],
      summary: "Activar paciente",
      description: "Activa un paciente cambiando su status a 'en curso'. Solo funciona con pacientes que tengan un status diferente a 'en curso'.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "integer",
            format: "int64",
          },
          description: "ID único del paciente a activar",
        },
      ],
      responses: {
        200: {
          description: "Paciente activado exitosamente",
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
                    example: "Paciente activado exitosamente. Status cambiado a 'en curso'",
                  },
                },
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
        404: {
          description: "Paciente no encontrado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        409: {
          description: "El paciente ya está activo (status: en curso)",
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
  "/api/patients/{id}": {
    put: {
      tags: ["Patients"],
      summary: "Actualizar paciente",
      description: "Actualiza los datos de un paciente existente. Solo se modificarán los campos proporcionados en el request body.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "integer",
            format: "int64",
          },
          description: "ID único del paciente a actualizar",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/UpdatePatientRequest",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Paciente actualizado exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdatePatientResponse",
              },
            },
          },
        },
        400: {
          description: "Datos de entrada inválidos, ID inválido o no se proporcionaron campos para actualizar",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        404: {
          description: "Paciente no encontrado o no está activo",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        409: {
          description: "Email o DNI ya registrados para otro paciente",
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
    get: {
      tags: ["Patients"],
      summary: "Obtener paciente por ID",
      description: "Obtiene la información completa de un paciente específico dividida en 6 DTOs",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "integer",
          },
          description: "ID único del paciente",
        },
      ],
      responses: {
        200: {
          description: "Información del paciente obtenida exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/PatientDetailResponse",
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
        404: {
          description: "Paciente no encontrado",
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
      tags: ["Patients"],
      summary: "Eliminar paciente (soft delete)",
      description: "Elimina lógicamente un paciente del sistema estableciendo is_active = false. El paciente permanece en la base de datos pero no aparece en consultas futuras.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "integer",
            format: "int64",
          },
          description: "ID único del paciente a eliminar",
        },
      ],
      responses: {
        200: {
          description: "Paciente eliminado exitosamente",
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
                    example: "Paciente eliminado correctamente",
                  },
                },
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
        404: {
          description: "Paciente no encontrado o ya está eliminado",
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

module.exports = patientsPaths;