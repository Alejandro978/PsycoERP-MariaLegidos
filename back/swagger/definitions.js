const definitions = {
  AgeDistributionItem: {
    type: "object",
    properties: {
      age_range: {
        type: "string",
        description: "Rango de edad del grupo",
        enum: ["18-25", "26-35", "36-45", ">45", "Sin datos"],
        example: "26-35",
      },
      patient_count: {
        type: "integer",
        description: "Número de pacientes en este rango de edad",
        example: 12,
      },
    },
  },

  ActivePatientWithClinicInfo: {
    type: "object",
    properties: {
      idPaciente: {
        type: "integer",
        format: "int64",
        description: "ID único del paciente",
        example: 1,
      },
      nombreCompleto: {
        type: "string",
        description: "Nombre completo del paciente",
        example: "Juan Pérez García",
      },
      idClinica: {
        type: "integer",
        format: "int64",
        description: "ID de la clínica asociada",
        example: 2,
      },
      nombreClinica: {
        type: "string",
        description: "Nombre de la clínica",
        example: "Clínica Centro",
      },
      precioSesion: {
        type: "number",
        format: "decimal",
        description: "Precio base por sesión de la clínica en euros",
        example: 60.00,
      },
      porcentaje: {
        type: "number",
        format: "decimal",
        description: "Porcentaje de la clínica",
        example: 15.50,
      },
      presencial: {
        type: "boolean",
        description: "Indica si la clínica es presencial (tiene dirección) o no. true = Presencial, false = Online",
        example: true,
      },
    },
  },

  ActivePatientsWithClinicResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      total: {
        type: "integer",
        description: "Número total de pacientes activos encontrados",
        example: 25,
      },
      data: {
        type: "array",
        items: {
          $ref: "#/components/schemas/ActivePatientWithClinicInfo",
        },
      },
    },
  },

  Bonus: {
    type: "object",
    properties: {
      id: {
        irpf: {
          type: "number",
          format: "decimal",
          nullable: true,
          description: "Porcentaje IRPF (ej: 15.5)",
          example: 15.5,
        },
        irpf: {
          type: "number",
          format: "decimal",
          nullable: true,
          description: "Porcentaje IRPF (ej: 15.5)",
          example: 15.5,
        },
        type: "integer",
        format: "int64",
        description: "ID único del bonus",
        example: 1,
      },
      patient_id: {
        type: "integer",
        format: "int64",
        description: "ID del paciente",
        example: 1,
      },
      total_sessions: {
        type: "integer",
        description: "Número total de sesiones incluidas en el bonus",
        example: 10,
      },
      price_per_session: {
        type: "number",
        format: "decimal",
        description: "Precio por sesión",
        example: 50.00,
      },
      total_price: {
        type: "number",
        format: "decimal",
        description: "Precio total del bonus",
        example: 500.00,
      },
      used_sessions: {
        type: "integer",
        description: "Número de sesiones utilizadas",
        example: 3,
      },
      status: {
        type: "string",
        enum: ["active", "consumed", "expired"],
        description: "Estado del bonus",
        example: "active",
      },
      purchase_date: {
        type: "string",
        format: "date",
        description: "Fecha de compra del bonus (YYYY-MM-DD)",
        example: "2024-01-15",
      },
      expiry_date: {
        type: "string",
        format: "date",
        description: "Fecha de expiración del bonus (YYYY-MM-DD)",
        example: "2024-12-31",
      },
      notes: {
        type: "string",
        nullable: true,
        description: "Notas adicionales",
        example: "Bonus adquirido con descuento especial",
      },
      created_at: {
        type: "string",
        format: "date",
        description: "Fecha de creación",
        example: "2024-01-15",
      },
      updated_at: {
        type: "string",
        format: "date-time",
        description: "Fecha de última actualización",
        example: "2024-01-20T14:45:00Z",
      },
    },
  },

  BonusesResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      pagination: {
        $ref: "#/components/schemas/PaginationInfo",
      },
      data: {
        type: "array",
        items: {
          $ref: "#/components/schemas/Bonus",
        },
      },
    },
  },

  BonusHistoryInfo: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        format: "int64",
        description: "ID único del bonus",
        example: 1,
      },
      patient_id: {
        type: "integer",
        format: "int64",
        description: "ID del paciente",
        example: 1,
      },
      total_sessions: {
        type: "integer",
        description: "Número total de sesiones incluidas",
        example: 10,
      },
      used_sessions: {
        type: "integer",
        description: "Sesiones ya utilizadas",
        example: 3,
      },
      remaining_sessions: {
        type: "integer",
        description: "Sesiones restantes",
        example: 7,
      },
      progress_percentage: {
        type: "number",
        format: "decimal",
        description: "Porcentaje de progreso del bonus",
        example: 30.00,
      },
      price_per_session: {
        type: "number",
        format: "decimal",
        description: "Precio por sesión",
        example: 50.00,
      },
      total_price: {
        type: "number",
        format: "decimal",
        description: "Precio total del bonus",
        example: 500.00,
      },
      status: {
        type: "string",
        enum: ["active", "consumed", "expired"],
        description: "Estado del bonus",
        example: "active",
      },
      purchase_date: {
        type: "string",
        format: "date",
        description: "Fecha de compra (YYYY-MM-DD)",
        example: "2024-01-15",
      },
      expiry_date: {
        type: "string",
        format: "date",
        description: "Fecha de expiración (YYYY-MM-DD)",
        example: "2025-01-15",
      },
      notes: {
        type: "string",
        nullable: true,
        description: "Notas del bonus",
        example: "Bonus promocional",
      },
      created_at: {
        type: "string",
        format: "date-time",
        description: "Fecha de creación",
        example: "2024-01-15 10:30:00",
      },
    },
  },

  BonusHistoryResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      data: {
        type: "object",
        properties: {
          used_sessions: {
            type: "integer",
            description: "Sesiones ya utilizadas",
            example: 3,
          },
          remaining_sessions: {
            type: "integer",
            description: "Sesiones restantes",
            example: 7,
          },
          progress_percentage: {
            type: "number",
            format: "decimal",
            description: "Porcentaje de progreso del bonus",
            example: 30.00,
          },
          sessions_history: {
            type: "array",
            items: {
              type: "object",
              properties: {
                used_date: {
                  type: "string",
                  format: "date",
                  description: "Fecha de realización (YYYY-MM-DD)",
                  example: "2024-02-01",
                },
                session_id: {
                  type: "integer",
                  format: "int64",
                  nullable: true,
                  description: "ID de la sesión",
                  example: 25,
                }
              },
            },
            description: "Historial de sesiones realizadas ordenado por fecha descendente",
          },
        },
      },
    },
  },

  BonusUsageHistoryItem: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        format: "int64",
        description: "ID único del registro de uso",
        example: 1,
      },
      session_id: {
        type: "integer",
        format: "int64",
        nullable: true,
        description: "ID de la sesión asociada",
        example: 25,
      },
      used_date: {
        type: "string",
        format: "date",
        description: "Fecha de uso (YYYY-MM-DD)",
        example: "2024-02-01",
      },
      notes: {
        type: "string",
        nullable: true,
        description: "Notas del uso",
        example: "Sesión completada exitosamente",
      },
      created_by: {
        type: "string",
        nullable: true,
        description: "Usuario que registró el uso",
        example: "admin",
      },
    },
  },

  Clinic: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        format: "int64",
        description: "ID único de la clínica",
        example: 1,
      },
      name: {
        type: "string",
        description: "Nombre de la clínica",
        example: "Clínica Psicológica Centro",
      },
      address: {
        type: "string",
        nullable: true,
        description: "Dirección de la clínica",
        example: "Calle Mayor 123, Madrid",
      },
      clinic_color: {
        type: "string",
        nullable: true,
        description: "Color de la clínica en formato hexadecimal",
        example: "#3B82F6",
      },
      price: {
        type: "number",
        format: "decimal",
        nullable: true,
        description: "Precio base por sesión en euros",
        example: 60.00,
      },
      percentage: {
        type: "number",
        format: "decimal",
        nullable: true,
        description: "Porcentaje (0.00-100.00)",
        example: 15.50,
      },
      is_billable: {
        type: "boolean",
        nullable: true,
        description: "Indica si la clínica es facturable",
        example: true,
      },
      billing_address: {
        type: "string",
        nullable: true,
        description: "Dirección de facturación",
        example: "Calle Facturación 456, Madrid 28001",
      },
      cif: {
        type: "string",
        nullable: true,
        description: "CIF (Tax Identification Number)",
        example: "B12345678",
      },
      fiscal_name: {
        type: "string",
        nullable: true,
        description: "Nombre fiscal para facturación",
        example: "Psicología Integral S.L.",
      },
      created_at: {
        type: "string",
        format: "date",
        description: "Fecha de creación",
        example: "2024-01-15",
      },
      updated_at: {
        type: "string",
        format: "date",
        description: "Fecha de última actualización",
        example: "2024-01-15",
      },
    },
  },

  ClinicData: {
    type: "object",
    properties: {
      clinic_id: {
        type: "integer",
        format: "int64",
        description: "ID de la clínica",
        example: 1,
      },
      clinic_name: {
        type: "string",
        description: "Nombre de la clínica",
        example: "Clínica Psicológica Centro",
      },
    },
  },

  ClinicPerformanceItem: {
    type: "object",
    properties: {
      clinic_name: {
        type: "string",
        description: "Nombre de la clínica",
        example: "Clínica Psicológica Centro",
      },
      session_count: {
        type: "integer",
        description: "Número total de sesiones realizadas en esta clínica",
        example: 45,
      },
      average_session_price: {
        type: "number",
        format: "decimal",
        description: "Precio promedio por sesión en euros",
        example: 62.50,
      }
    },
  },

  ClinicalNote: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        format: "int64",
        description: "ID único de la nota clínica",
        example: 1,
      },
      patient_id: {
        type: "integer",
        format: "int64",
        description: "ID del paciente",
        example: 123,
      },
      session_id: {
        type: "integer",
        format: "int64",
        nullable: true,
        description: "ID de la sesión asociada (opcional)",
        example: 456,
      },
      title: {
        type: "string",
        description: "Título de la nota clínica",
        example: "Sesión inicial de evaluación",
      },
      content: {
        type: "string",
        description: "Contenido completo de la nota clínica",
        example: "El paciente se muestra colaborativo durante la primera sesión. Se observa ansiedad leve relacionada con el trabajo.",
      },
      date: {
        type: "string",
        format: "date-time",
        description: "Fecha y hora de la nota clínica (YYYY-MM-DD HH:mm:ss)",
        example: "2024-12-15 14:30:00",
      },
      created_at: {
        type: "string",
        format: "date-time",
        description: "Fecha de creación",
        example: "2024-12-15 14:30:00",
      },
      updated_at: {
        type: "string",
        format: "date-time",
        description: "Fecha de última actualización",
        example: "2024-12-15 14:30:00",
      },
      patient_name: {
        type: "string",
        description: "Nombre del paciente (incluido en consultas con JOIN)",
        example: "Juan Pérez García",
      },
    },
  },

  ClinicalNoteSimple: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        format: "int64",
        description: "ID único de la nota clínica",
        example: 1,
      },
      title: {
        type: "string",
        description: "Título de la nota clínica",
        example: "Sesión inicial de evaluación",
      },
      content: {
        type: "string",
        description: "Contenido completo de la nota clínica",
        example: "El paciente se muestra colaborativo durante la primera sesión. Se observa ansiedad leve relacionada con el trabajo.",
      },
      created_at: {
        type: "string",
        format: "date-time",
        description: "Fecha de creación",
        example: "2024-12-15 14:30:00",
      },
      updated_at: {
        type: "string",
        format: "date-time",
        description: "Fecha de última actualización",
        example: "2024-12-15 14:30:00",
      },
    },
  },

  ClinicalNotesResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      pagination: {
        $ref: "#/components/schemas/PaginationInfo",
      },
      data: {
        type: "array",
        items: {
          $ref: "#/components/schemas/ClinicalNote",
        },
      },
    },
  },

  ClinicsResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      pagination: {
        $ref: "#/components/schemas/PaginationInfo",
      },
      data: {
        type: "array",
        items: {
          $ref: "#/components/schemas/Clinic",
        },
      },
    },
  },

  CreateBonusRequest: {
    type: "object",
    required: ["patient_id", "total_sessions", "price_per_session", "total_price"],
    properties: {
      patient_id: {
        type: "integer",
        format: "int64",
        description: "ID del paciente",
        example: 1,
      },
      total_sessions: {
        type: "integer",
        description: "Número total de sesiones incluidas en el bonus",
        example: 10,
      },
      price_per_session: {
        type: "number",
        format: "decimal",
        description: "Precio por sesión en euros",
        example: 50.00,
      },
      total_price: {
        type: "number",
        format: "decimal",
        description: "Precio total del bonus",
        example: 500.00,
      },
    },
  },

  CreateBonusResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Bonus creado exitosamente",
      },
      data: {
        $ref: "#/components/schemas/PatientBonusDetail",
      },
    },
  },

  CreateClinicRequest: {
    type: "object",
    required: ["name", "clinic_color"],
    properties: {
      name: {
        type: "string",
        description: "Nombre de la clínica (requerido)",
        example: "Clínica Psicológica Nueva",
      },
      clinic_color: {
        type: "string",
        description: "Color de la clínica en formato hexadecimal (#RRGGBB) (requerido)",
        pattern: "^#[0-9A-Fa-f]{6}$",
        example: "#EF4444",
      },
      address: {
        type: "string",
        nullable: true,
        description: "Dirección de la clínica (opcional)",
        example: "Calle Mayor 123, Madrid",
      },
      price: {
        type: "number",
        format: "decimal",
        nullable: true,
        minimum: 0,
        description: "Precio base por sesión en euros (opcional)",
        example: 60.00,
      },
      percentage: {
        type: "number",
        format: "decimal",
        nullable: true,
        minimum: 0,
        maximum: 100,
        description: "Porcentaje entre 0.00 y 100.00 (opcional)",
        example: 15.50,
      },
      is_billable: {
        type: "boolean",
        nullable: true,
        description: "Indica si la clínica es facturable (opcional)",
        example: true
      },
      billing_address: {
        type: "string",
        nullable: true,
        description: "Dirección de facturación (opcional)",
        example: "Calle Facturación 456, Madrid 28001",
      },
      cif: {
        type: "string",
        nullable: true,
        description: "CIF (Tax Identification Number) (opcional)",
        example: "B12345678",
      },
      fiscal_name: {
        type: "string",
        nullable: true,
        description: "Nombre fiscal para facturación (opcional)",
        example: "Psicología Integral S.L.",
      },
    },
  },

  CreateClinicResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        description: "Indica si la operación fue exitosa",
        example: true,
      },
      message: {
        type: "string",
        description: "Mensaje de éxito",
        example: "Clínica creada exitosamente",
      },
      data: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            format: "int64",
            description: "ID de la nueva clínica",
            example: 5,
          },
          name: {
            type: "string",
            description: "Nombre de la clínica",
            example: "Clínica Psicológica Nueva",
          },
          clinic_color: {
            type: "string",
            description: "Color de la clínica",
            example: "#EF4444",
          },
          address: {
            type: "string",
            nullable: true,
            description: "Dirección de la clínica",
            example: "Calle Mayor 123, Madrid",
          },
          price: {
            type: "number",
            format: "decimal",
            nullable: true,
            description: "Precio base por sesión en euros",
            example: 60.00,
          },
          percentage: {
            type: "number",
            format: "decimal",
            nullable: true,
            description: "Porcentaje aplicado en la clínica",
            example: 15.50,
          },
          is_billable: {
            type: "boolean",
            description: "Indica si la clínica es facturable",
            example: true,
          },
        },
      },
    },
  },

  CreatePatientRequest: {
    type: "object",
    required: ["first_name", "last_name", "email", "phone", "dni"],
    properties: {
      first_name: {
        type: "string",
        description: "Nombre del paciente (requerido)",
        example: "Juan",
      },
      last_name: {
        type: "string",
        description: "Apellidos del paciente (requerido)",
        example: "Pérez García",
      },
      email: {
        type: "string",
        format: "email",
        description: "Email del paciente (requerido)",
        example: "juan.perez@email.com",
      },
      phone: {
        type: "string",
        description: "Teléfono del paciente (requerido)",
        example: "+34 666 123 456",
      },
      dni: {
        type: "string",
        description: "DNI del paciente (requerido)",
        example: "12345678A",
      },
      gender: {
        type: "string",
        enum: ["M", "F", "O"],
        description: "Género del paciente (M=Masculino, F=Femenino, O=Otro)",
        example: "M",
      },
      occupation: {
        type: "string",
        nullable: true,
        description: "Ocupación/Escuela/Trabajo",
        example: "Estudiante de Psicología",
      },
      birth_date: {
        type: "string",
        format: "date",
        nullable: true,
        description: "Fecha de nacimiento (YYYY-MM-DD)",
        example: "1985-03-15",
      },
      street: {
        type: "string",
        nullable: true,
        description: "Nombre de la calle",
        example: "Calle Mayor",
      },
      street_number: {
        type: "string",
        nullable: true,
        description: "Número de la calle",
        example: "123",
      },
      door: {
        type: "string",
        nullable: true,
        description: "Puerta/Piso",
        example: "2A",
      },
      postal_code: {
        type: "string",
        nullable: true,
        description: "Código postal",
        example: "28001",
      },
      city: {
        type: "string",
        nullable: true,
        description: "Ciudad",
        example: "Madrid",
      },
      province: {
        type: "string",
        nullable: true,
        description: "Provincia",
        example: "Madrid",
      },
      treatment_start_date: {
        type: "string",
        format: "date",
        nullable: true,
        description: "Fecha de inicio del tratamiento (YYYY-MM-DD)",
        example: "2024-01-15",
      },
      status: {
        type: "string",
        enum: ["en curso", "fin del tratamiento", "en pausa", "abandono", "derivación"],
        description: "Estado del tratamiento",
        example: "en curso",
      },
      is_minor: {
        type: "boolean",
        nullable: true,
        description: "Indica si es menor de edad",
        example: false,
      },
    },
  },

  CreatePatientResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      data: {
        $ref: "#/components/schemas/Patient",
      },
      message: {
        type: "string",
        example: "Paciente creado exitosamente",
      },
    },
  },

  CreateReminderRequest: {
    type: "object",
    required: ["session_id"],
    properties: {
      session_id: {
        type: "integer",
        format: "int64",
        description: "ID de la sesión para la cual crear el recordatorio",
        example: 1,
      },
    },
  },

  CreateReminderResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      data: {
        type: "object",
        properties: {
          whatsapp_deeplink: {
            type: "string",
            format: "uri",
            description: "Deeplink de WhatsApp listo para usar que abrirá la aplicación con el mensaje pre-cargado personalizado para la sesión",
            example: "https://wa.me/34666123456?text=*RECORDATORIO%20DE%20CITA%20PSICOL%C3%93GICA*%0A%0AHola%20Juan%20P%C3%A9rez%20Garc%C3%ADa%2C%0A%0ATe%20recuerdo%20que%20tienes%20una%20cita%20programada%20para%3A%0A%0A*Fecha%3A*%20lunes%2C%2016%20de%20diciembre%20de%202024%0A*Hora%3A*%2010%3A00%20-%2011%3A00%0A*Modalidad%3A*%20Presencial%0A*Cl%C3%ADnica%3A*%20Cl%C3%ADnica%20Psicol%C3%B3gica%20Centro%0A%0A%C2%A1Conf%C3%ADrmame%20asistencia%20cuando%20puedas%20%21",
          },
        },
      },
      message: {
        type: "string",
        description: "Mensaje de éxito",
        example: "Recordatorio creado exitosamente con deeplink de WhatsApp",
      },
    },
  },

  DashboardData: {
    type: "object",
    properties: {
      RapidKPIData: {
        $ref: "#/components/schemas/RapidKPIData",
      },
      AgeDistributionData: {
        type: "array",
        items: {
          $ref: "#/components/schemas/AgeDistributionItem",
        },
        description: "Distribución de pacientes activos por rangos de edad",
      },
      ClinicPerformanceData: {
        type: "array",
        items: {
          $ref: "#/components/schemas/ClinicPerformanceItem",
        },
        description: "Rendimiento de cada clínica (sesiones, precio promedio, ingresos totales)",
      },
      DistributionByModalityData: {
        type: "array",
        items: {
          $ref: "#/components/schemas/DistributionByModalityItem",
        },
        description: "Distribución de sesiones por modalidad (presencial/online)",
      },
      MonthlyRevenueData: {
        type: "array",
        items: {
          $ref: "#/components/schemas/MonthlyRevenueItem",
        },
        description: "Datos de ingresos por mes",
      },
      PaymentMethodsData: {
        type: "array",
        items: {
          $ref: "#/components/schemas/PaymentMethodsItem",
        },
        description: "Distribución porcentual de métodos de pago utilizados",
      },
      SessionResultData: {
        type: "array",
        items: {
          $ref: "#/components/schemas/SessionResultItem",
        },
        description: "Distribución de sesiones por estado (completadas, planificadas, canceladas, no-show)",
      },
      SessionsByClinicData: {
        type: "array",
        items: {
          $ref: "#/components/schemas/SessionsByClinicItem",
        },
        description: "Datos de sesiones agrupadas por clínica",
      },
      TodayUpcomingSessionsData: {
        type: "array",
        items: {
          $ref: "#/components/schemas/SessionItem",
        },
        description: "Sesiones pendientes de hoy (posteriores a la hora actual)",
      },
      TomorrowSessionsData: {
        type: "array",
        items: {
          $ref: "#/components/schemas/SessionItem",
        },
        description: "Todas las sesiones programadas para el próximo día laborable (si es viernes, muestra las del lunes)",
      },
      WeeklySessionsData: {
        type: "array",
        items: {
          $ref: "#/components/schemas/WeeklySessionsItem",
        },
        description: "Sesiones por semana del mes actual para gráfico de barras",
      },
    },
  },

  Document: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        format: "int64",
        description: "Unique document identifier",
        example: 1,
      },
      name: {
        type: "string",
        description: "File name",
        example: "medical_report.pdf",
      },
      type: {
        type: "string",
        description: "File type/extension",
        example: "pdf",
      },
      size: {
        type: "string",
        description: "Formatted file size",
        example: "1.2 MB",
      },
      upload_date: {
        type: "string",
        format: "date",
        description: "Upload date in ISO format (YYYY-MM-DD)",
        example: "2024-01-15",
      },
      description: {
        type: "string",
        nullable: true,
        description: "Optional document description",
        example: "Annual medical report for patient evaluation",
      },
      file_url: {
        type: "string",
        format: "uri",
        description: "File URL for download/viewing",
        example: "https://sftp.example.com/documents/medical_report.pdf",
      },
    },
  },

  DocumentsResponse: {
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

  DashboardKPIsResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      data: {
        $ref: "#/components/schemas/DashboardData",
      },
    },
  },

  DistributionByModalityItem: {
    type: "object",
    properties: {
      modality_type: {
        type: "string",
        description: "Tipo de modalidad de la sesión (presencial/online)",
        example: "Presencial",
      },
      session_count: {
        type: "integer",
        description: "Número total de sesiones realizadas con esta modalidad",
        example: 45,
      },
    },
  },

  ErrorResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: false,
      },
      error: {
        type: "string",
        example: "ID de paciente debe ser un número",
      },
      field: {
        type: "string",
        example: "patient_id",
      },
      allowed_values: {
        type: "array",
        items: {
          type: "string",
        },
        example: ["scheduled", "completed", "cancelled", "no-show"],
      },
    },
  },

  Invoice: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        format: "int64",
        description: "ID único de la factura",
        example: 1,
      },
      invoice_number: {
        type: "string",
        description: "Número de factura",
        example: "2025-001",
      },
      invoice_date: {
        type: "string",
        format: "date",
        description: "Fecha de emisión de la factura",
        example: "2025-09-15",
      },
      patient_id: {
        type: "integer",
        format: "int64",
        description: "ID del paciente",
        example: 5,
      },
      patient_name: {
        type: "string",
        description: "Nombre completo del paciente",
        example: "María García López",
      },
      concept: {
        type: "string",
        description: "Concepto o descripción del servicio",
        example: "Sesiones de terapia - Septiembre 2025",
      },
      unit_price: {
        type: "number",
        format: "decimal",
        description: "Precio bruto por sesión en euros",
        example: 60.00,
      },
      quantity: {
        type: "integer",
        description: "Número de sesiones incluidas en la factura",
        example: 4,
      },
      total: {
        type: "number",
        format: "decimal",
        description: "Total bruto de la factura en euros",
        example: 240.00,
      },
      pdf_path: {
        type: "string",
        nullable: true,
        description: "Ruta del PDF de la factura",
        example: "/invoices/2025/2025-001.pdf",
      },
      notes: {
        type: "string",
        nullable: true,
        description: "Notas adicionales",
        example: "Pagado por transferencia bancaria",
      },
      month: {
        type: "integer",
        description: "Mes de la factura (1-12)",
        example: 9,
      },
      year: {
        type: "integer",
        description: "Año de la factura",
        example: 2025,
      },
      created_at: {
        type: "string",
        format: "date-time",
        description: "Fecha de creación del registro",
        example: "2025-09-15T10:30:00Z",
      },
      updated_at: {
        type: "string",
        format: "date-time",
        description: "Fecha de última actualización",
        example: "2025-09-15T10:30:00Z",
      },
    },
  },

  InvoiceKPIsData: {
    type: "object",
    properties: {
      filters_applied: {
        type: "object",
        properties: {
          month: {
            type: "integer",
            description: "Mes aplicado al filtro",
            example: 9,
          },
          year: {
            type: "integer",
            description: "Año aplicado al filtro",
            example: 2025,
          },
        },
      },
      card1_total_invoices_issued: {
        type: "integer",
        description: "Card 1: Total de facturas emitidas (histórico)",
        example: 125,
      },
      card2_total_gross_historic: {
        type: "number",
        format: "decimal",
        description: "Card 2: Total facturado bruto histórico en euros",
        example: 15000.00,
      },
      card3_total_gross_filtered: {
        type: "number",
        format: "decimal",
        description: "Card 3: Total facturado bruto en el mes/año filtrado en euros",
        example: 2400.00,
      },
      card4_total_net_filtered: {
        type: "number",
        format: "decimal",
        description: "Card 4: Total facturado neto para la psicóloga en el mes/año filtrado en euros",
        example: 2040.00,
      },
      card5_total_net_by_clinic: {
        type: "array",
        description: "Card 5: Total facturado neto por clínica en el mes/año filtrado",
        items: {
          $ref: "#/components/schemas/InvoiceNetByClinic",
        },
      },
    },
  },

  InvoiceKPIsResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      data: {
        $ref: "#/components/schemas/InvoiceKPIsData",
      },
    },
  },

  InvoiceNetByClinic: {
    type: "object",
    properties: {
      clinic_name: {
        type: "string",
        description: "Nombre de la clínica",
        example: "Clínica Centro",
      },
      total_net: {
        type: "number",
        format: "decimal",
        description: "Total neto facturado en esta clínica en euros",
        example: 1020.00,
      },
    },
  },

  InvoicesResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      pagination: {
        $ref: "#/components/schemas/PaginationInfo",
      },
      data: {
        type: "array",
        items: {
          $ref: "#/components/schemas/Invoice",
        },
      },
    },
  },

  CreateInvoiceRequest: {
    type: "object",
    required: [
      "invoice_number",
      "invoice_date",
      "patient_id",
      "concept",
      "unit_price",
      "quantity",
      "total",
      "month",
      "year",
    ],
    properties: {
      invoice_number: {
        type: "string",
        description: "Número único de factura",
        example: "2025-001",
      },
      invoice_date: {
        type: "string",
        format: "date",
        description: "Fecha de emisión (YYYY-MM-DD)",
        example: "2025-09-15",
      },
      patient_id: {
        type: "integer",
        format: "int64",
        description: "ID del paciente",
        example: 5,
      },
      concept: {
        type: "string",
        description: "Descripción del servicio facturado",
        example: "Sesiones de terapia - Septiembre 2025",
      },
      unit_price: {
        type: "number",
        format: "decimal",
        description: "Precio bruto por sesión",
        example: 60.00,
      },
      quantity: {
        type: "integer",
        description: "Número de sesiones",
        example: 4,
      },
      total: {
        type: "number",
        format: "decimal",
        description: "Total bruto (unit_price * quantity)",
        example: 240.00,
      },
      pdf_path: {
        type: "string",
        nullable: true,
        description: "Ruta del PDF generado (opcional)",
        example: "/invoices/2025/2025-001.pdf",
      },
      notes: {
        type: "string",
        nullable: true,
        description: "Notas adicionales (opcional)",
        example: "Pagado por transferencia",
      },
      month: {
        type: "integer",
        description: "Mes de la factura (1-12)",
        example: 9,
      },
      year: {
        type: "integer",
        description: "Año de la factura",
        example: 2025,
      },
      session_ids: {
        type: "array",
        items: {
          type: "integer",
          format: "int64",
        },
        description: "IDs de las sesiones a incluir en la factura (opcional)",
        example: [12, 15, 18, 21],
      },
    },
  },

  CreateInvoiceResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Factura 2025-001 generada exitosamente",
      },
      data: {
        type: "object",
        properties: {
          invoice: {
            $ref: "#/components/schemas/Invoice",
          },
          sessions_invoiced_count: {
            type: "integer",
            description: "Número de sesiones marcadas como facturadas",
            example: 4,
          },
        },
      },
    },
  },

  PendingInvoiceSession: {
    type: "object",
    properties: {
      patient_id: {
        type: "integer",
        format: "int64",
        description: "ID del paciente",
        example: 5,
      },
      patient_name: {
        type: "string",
        description: "Nombre completo del paciente",
        example: "María García López",
      },
      pending_sessions_count: {
        type: "integer",
        description: "Número de sesiones pendientes de facturar",
        example: 4,
      },
      total_pending_amount: {
        type: "number",
        format: "decimal",
        description: "Monto total pendiente de facturar en euros",
        example: 240.00,
      },
      first_session_date: {
        type: "string",
        format: "date",
        description: "Fecha de la primera sesión pendiente",
        example: "2025-09-01",
      },
      last_session_date: {
        type: "string",
        format: "date",
        description: "Fecha de la última sesión pendiente",
        example: "2025-09-22",
      },
    },
  },

  PendingInvoiceSessionsResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      total: {
        type: "integer",
        description: "Número de pacientes con sesiones pendientes",
        example: 8,
      },
      data: {
        type: "array",
        items: {
          $ref: "#/components/schemas/PendingInvoiceSession",
        },
      },
    },
  },

  PendingInvoicesResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      data: {
        type: "object",
        properties: {
          filters_applied: {
            type: "object",
            properties: {
              month: {
                type: "integer",
                description: "Mes aplicado en el filtro",
                example: 1,
              },
              year: {
                type: "integer",
                description: "Año aplicado en el filtro",
                example: 2025,
              },
            },
          },
          pending_invoices: {
            type: "array",
            items: {
              type: "object",
              properties: {
                patient_id: {
                  type: "integer",
                  format: "int64",
                  description: "ID del paciente",
                  example: 123,
                },
                patient_full_name: {
                  type: "string",
                  description: "Nombre completo del paciente",
                  example: "David García",
                },
                dni: {
                  type: "string",
                  description: "DNI del paciente",
                  example: "12345678A",
                },
                email: {
                  type: "string",
                  description: "Email del paciente",
                  example: "david@example.com",
                },
                patient_address_line1: {
                  type: "string",
                  description: "Primera línea de dirección del paciente (calle, número, puerta)",
                  example: "Calle Mayor 123 2B",
                },
                patient_address_line2: {
                  type: "string",
                  description: "Segunda línea de dirección del paciente (ciudad, código postal)",
                  example: "Madrid 28001",
                },
                clinic_name: {
                  type: "string",
                  description: "Nombre de la clínica",
                  example: "Clínica Centro",
                },
                sessions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      session_id: {
                        type: "integer",
                        format: "int64",
                        description: "ID de la sesión",
                        example: 45,
                      },
                      session_date: {
                        type: "string",
                        format: "date",
                        description: "Fecha de la sesión (YYYY-MM-DD)",
                        example: "2025-01-10",
                      },
                      price: {
                        type: "number",
                        format: "decimal",
                        description: "Precio de la sesión",
                        example: 60.00,
                      },
                    },
                  },
                  description: "Detalles de las sesiones pendientes de facturar",
                },
                pending_sessions_count: {
                  type: "integer",
                  description: "Número de sesiones pendientes",
                  example: 4,
                },
                total_gross: {
                  type: "number",
                  format: "decimal",
                  description: "Total bruto a facturar",
                  example: 240.00,
                },
              },
            },
          },
        },
      },
    },
  },

  PendingInvoicesOfClinicsResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      data: {
        type: "array",
        items: {
          type: "object",
          properties: {
            clinic_id: {
              type: "integer",
              format: "int64",
              description: "ID de la clínica",
              example: 1,
            },
            clinic_name: {
              type: "string",
              description: "Nombre de la clínica",
              example: "Clínica Central",
            },
            sessions_count: {
              type: "integer",
              description: "Número de sesiones pendientes de facturar",
              example: 15,
            },
            total_net: {
              type: "number",
              format: "float",
              description: "Total neto a facturar (precio * porcentaje de la clínica)",
              example: 225.00,
            },
          },
        },
      },
    },
  },

  IssuedInvoicesResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      data: {
        type: "object",
        properties: {
          filters_applied: {
            type: "object",
            properties: {
              month: {
                type: "integer",
                description: "Mes aplicado en el filtro",
                example: 1,
              },
              year: {
                type: "integer",
                description: "Año aplicado en el filtro",
                example: 2025,
              },
            },
          },
          total_invoices: {
            type: "integer",
            description: "Número total de facturas encontradas",
            example: 12,
          },
          invoices: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: {
                  type: "integer",
                  format: "int64",
                  description: "ID de la factura",
                  example: 1,
                },
                invoice_number: {
                  type: "string",
                  description: "Número de factura",
                  example: "2025-001",
                },
                invoice_date: {
                  type: "string",
                  format: "date",
                  description: "Fecha de emisión (formato dd/mm/yyyy)",
                  example: "15/01/2025",
                },
                patient_id: {
                  type: "integer",
                  format: "int64",
                  description: "ID del paciente",
                  example: 123,
                },
                patient_full_name: {
                  type: "string",
                  description: "Nombre completo del paciente",
                  example: "David García",
                },
                dni: {
                  type: "string",
                  description: "DNI del paciente",
                  example: "12345678A",
                },
                email: {
                  type: "string",
                  description: "Email del paciente",
                  example: "david@example.com",
                },
                patient_address_line1: {
                  type: "string",
                  description: "Primera línea de dirección del paciente (calle, número, puerta)",
                  example: "Calle Mayor 123 2B",
                },
                patient_address_line2: {
                  type: "string",
                  description: "Segunda línea de dirección del paciente (ciudad, código postal)",
                  example: "Madrid 28001",
                },
                sessions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      session_id: {
                        type: "integer",
                        format: "int64",
                        description: "ID de la sesión",
                        example: 45,
                      },
                      session_date: {
                        type: "string",
                        format: "date",
                        description: "Fecha de la sesión (YYYY-MM-DD)",
                        example: "2025-01-10",
                      },
                      price: {
                        type: "number",
                        format: "decimal",
                        description: "Precio de la sesión",
                        example: 60.00,
                      },
                    },
                  },
                  description: "Detalles de las sesiones facturadas",
                },
                sessions_count: {
                  type: "integer",
                  description: "Número de sesiones facturadas",
                  example: 4,
                },
                total: {
                  type: "number",
                  format: "decimal",
                  description: "Total de la factura",
                  example: 240.00,
                },
                concept: {
                  type: "string",
                  description: "Concepto de la factura",
                  example: "Sesiones de psicología - Enero 2025",
                },
              },
            },
          },
        },
      },
    },
  },

  IssuedInvoicesOfClinicsResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      data: {
        type: "object",
        properties: {
          filters_applied: {
            type: "object",
            properties: {
              month: {
                type: "integer",
                description: "Mes aplicado en el filtro",
                example: 1,
              },
              year: {
                type: "integer",
                description: "Año aplicado en el filtro",
                example: 2025,
              },
            },
          },
          total_invoices: {
            type: "integer",
            description: "Número total de facturas encontradas",
            example: 5,
          },
          invoices: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: {
                  type: "integer",
                  format: "int64",
                  description: "ID de la factura",
                  example: 1,
                },
                invoice_number: {
                  type: "string",
                  description: "Número de factura",
                  example: "FAC-2025-001",
                },
                invoice_date: {
                  type: "string",
                  format: "date",
                  description: "Fecha de emisión (formato dd/mm/yyyy)",
                  example: "15/01/2025",
                },
                clinic_id: {
                  type: "integer",
                  format: "int64",
                  description: "ID de la clínica",
                  example: 1,
                },
                clinic_name: {
                  type: "string",
                  description: "Nombre de la clínica",
                  example: "Clínica Psicológica Madrid Centro",
                },
                fiscal_name: {
                  type: "string",
                  description: "Nombre fiscal de la clínica",
                  example: "Psicología Integral S.L.",
                },
                cif: {
                  type: "string",
                  description: "CIF de la clínica",
                  example: "B12345678",
                },
                billing_address: {
                  type: "string",
                  description: "Dirección de facturación de la clínica",
                  example: "Calle Gran Vía 45, 28013 Madrid",
                },
                sessions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      session_id: {
                        type: "integer",
                        format: "int64",
                        description: "ID de la sesión",
                        example: 45,
                      },
                      session_date: {
                        type: "string",
                        format: "date",
                        description: "Fecha de la sesión (YYYY-MM-DD)",
                        example: "2025-01-10",
                      },
                      price: {
                        type: "number",
                        format: "decimal",
                        description: "Precio de la sesión",
                        example: 60.00,
                      },
                    },
                  },
                  description: "Detalles de las sesiones facturadas",
                },
                sessions_count: {
                  type: "integer",
                  description: "Número de sesiones facturadas",
                  example: 15,
                },
                total: {
                  type: "number",
                  format: "decimal",
                  description: "Total de la factura",
                  example: 900.00,
                },
                concept: {
                  type: "string",
                  description: "Concepto de la factura",
                  example: "Servicios profesionales - Enero 2025",
                },
                month: {
                  type: "integer",
                  description: "Mes de las sesiones facturadas",
                  example: 1,
                },
                year: {
                  type: "integer",
                  description: "Año de las sesiones facturadas",
                  example: 2025,
                },
              },
            },
          },
        },
      },
    },
  },

  PendingSessionDetail: {
    type: "object",
    properties: {
      session_id: {
        type: "integer",
        format: "int64",
        description: "ID de la sesión",
        example: 12,
      },
      session_date: {
        type: "string",
        format: "date",
        description: "Fecha de la sesión",
        example: "2025-09-01",
      },
      start_time: {
        type: "string",
        format: "time",
        description: "Hora de inicio",
        example: "10:00:00",
      },
      end_time: {
        type: "string",
        format: "time",
        description: "Hora de fin",
        example: "11:00:00",
      },
      mode: {
        type: "string",
        enum: ["presencial", "online"],
        description: "Modalidad de la sesión",
        example: "online",
      },
      price: {
        type: "number",
        format: "decimal",
        description: "Precio de la sesión en euros",
        example: 60.00,
      },
      payment_method: {
        type: "string",
        enum: ["bizum", "transferencia", "tarjeta", "efectivo", "pendiente"],
        description: "Método de pago",
        example: "transferencia",
      },
      clinic_id: {
        type: "integer",
        format: "int64",
        description: "ID de la clínica",
        example: 1,
      },
      clinic_name: {
        type: "string",
        description: "Nombre de la clínica",
        example: "Clínica Centro",
      },
      clinic_color: {
        type: "string",
        description: "Color hexadecimal de la clínica",
        example: "#3B82F6",
      },
    },
  },

  PendingSessionsByPatientResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      patient_id: {
        type: "integer",
        format: "int64",
        description: "ID del paciente consultado",
        example: 5,
      },
      total_sessions: {
        type: "integer",
        description: "Número total de sesiones pendientes",
        example: 4,
      },
      data: {
        type: "array",
        items: {
          $ref: "#/components/schemas/PendingSessionDetail",
        },
      },
    },
  },

  JWTToken: {
    type: "object",
    properties: {
      access_token: {
        type: "string",
        description: "Token JWT de acceso",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      },
      token_type: {
        type: "string",
        description: "Tipo de token",
        example: "Bearer",
      },
      expires_in: {
        type: "string",
        description: "Tiempo de expiración del token",
        example: "7d",
      },
    },
  },

  LoginRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: {
        type: "string",
        format: "email",
        description: "Email del usuario",
        example: "demo@psycoerp.es",
      },
      password: {
        type: "string",
        description: "Contraseña del usuario",
        example: "PsycoERP123",
      },
    },
  },

  LoginResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Login exitoso",
      },
      data: {
        type: "object",
        properties: {
          user: {
            $ref: "#/components/schemas/User",
          },
          token: {
            $ref: "#/components/schemas/JWTToken",
          },
        },
      },
    },
  },

  MedicalRecord: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        format: "int64",
        description: "ID único de la nota clínica",
        example: 42,
      },
      title: {
        type: "string",
        description: "Título de la nota clínica",
        example: "Sesión inicial de evaluación",
      },
      content: {
        type: "string",
        description: "Contenido completo de la nota clínica",
        example: "El paciente se muestra colaborativo durante la primera sesión. Se observa ansiedad leve relacionada con el trabajo.",
      },
      date: {
        type: "string",
        format: "date-time",
        description: "Fecha y hora de la nota clínica (YYYY-MM-DD HH:mm:ss)",
        example: "2024-12-15 14:30:00",
      },
    },
  },

  MonthlyRevenueItem: {
    type: "object",
    properties: {
      year: {
        type: "integer",
        description: "Año",
        example: 2024,
      },
      month: {
        type: "integer",
        description: "Mes (1-12)",
        example: 8,
      },
      month_name: {
        type: "string",
        description: "Nombre del mes en español",
        example: "agosto",
      },
      revenue: {
        type: "number",
        format: "decimal",
        description: "Ingresos del mes",
        example: 3750.00,
      },
    },
  },

  PaginationInfo: {
    type: "object",
    properties: {
      currentPage: {
        type: "integer",
        description: "Página actual",
        example: 1,
      },
      totalPages: {
        type: "integer",
        description: "Total de páginas disponibles",
        example: 5,
      },
      totalRecords: {
        type: "integer",
        description: "Total de registros encontrados",
        example: 47,
      },
      recordsPerPage: {
        type: "integer",
        description: "Registros por página",
        example: 10,
      },
      hasNextPage: {
        type: "boolean",
        description: "Indica si hay una página siguiente",
        example: true,
      },
      hasPrevPage: {
        type: "boolean",
        description: "Indica si hay una página anterior",
        example: false,
      },
      nextPage: {
        type: "integer",
        nullable: true,
        description: "Número de la página siguiente (null si no hay)",
        example: 2,
      },
      prevPage: {
        type: "integer",
        nullable: true,
        description: "Número de la página anterior (null si no hay)",
        example: null,
      },
    },
  },

  Patient: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        format: "int64",
        description: "ID único del paciente",
        example: 1,
      },
      first_name: {
        type: "string",
        description: "Nombre del paciente",
        example: "Juan",
      },
      last_name: {
        type: "string",
        description: "Apellidos del paciente",
        example: "Pérez García",
      },
      email: {
        type: "string",
        format: "email",
        description: "Email del paciente",
        example: "juan.perez@email.com",
      },
      phone: {
        type: "string",
        description: "Teléfono del paciente",
        example: "+34 666 123 456",
      },
      dni: {
        type: "string",
        description: "DNI del paciente",
        example: "12345678A",
      },
      gender: {
        type: "string",
        enum: ["M", "F", "O"],
        description: "Género del paciente (M=Masculino, F=Femenino, O=Otro)",
        example: "M",
      },
      occupation: {
        type: "string",
        nullable: true,
        description: "Ocupación/Escuela/Trabajo",
        example: "Estudiante de Psicología",
      },
      status: {
        type: "string",
        enum: ["en curso", "fin del tratamiento", "en pausa", "abandono", "derivación"],
        description: "Estado del tratamiento",
        example: "en curso",
      },
      birth_date: {
        type: "string",
        format: "date",
        nullable: true,
        description: "Fecha de nacimiento",
        example: "1985-03-15",
      },
      street: {
        type: "string",
        nullable: true,
        description: "Nombre de la calle",
        example: "Calle Mayor",
      },
      street_number: {
        type: "string",
        nullable: true,
        description: "Número de la calle",
        example: "123",
      },
      door: {
        type: "string",
        nullable: true,
        description: "Puerta/Piso",
        example: "2A",
      },
      postal_code: {
        type: "string",
        nullable: true,
        description: "Código postal",
        example: "28001",
      },
      city: {
        type: "string",
        nullable: true,
        description: "Ciudad",
        example: "Madrid",
      },
      province: {
        type: "string",
        nullable: true,
        description: "Provincia",
        example: "Madrid",
      },
      clinic_id: {
        type: "integer",
        format: "int64",
        nullable: true,
        description: "ID de la clínica asignada",
        example: 1,
      },
      treatment_start_date: {
        type: "string",
        format: "date",
        nullable: true,
        description: "Fecha de inicio del tratamiento",
        example: "2024-01-15",
      },
      is_minor: {
        type: "boolean",
        nullable: true,
        description: "Indica si es menor de edad",
        example: false,
      },
      created_at: {
        type: "string",
        format: "date-time",
        description: "Fecha de creación",
        example: "2024-01-15T10:30:00Z",
      },
      updated_at: {
        type: "string",
        format: "date-time",
        description: "Fecha de última actualización",
        example: "2024-01-20T14:45:00Z",
      },
    },
  },

  PatientMedicalRecordItem: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        format: "int64",
        description: "ID único de la nota clínica",
        example: 15,
      },
      titulo: {
        type: "string",
        description: "Título de la nota clínica",
        example: "Sesión inicial de evaluación",
      },
      contenido: {
        type: "string",
        description: "Contenido de la nota clínica",
        example: "El paciente muestra signos de ansiedad. Se recomienda seguimiento semanal.",
      },
      fecha: {
        type: "string",
        format: "date-time",
        description: "Fecha de creación de la nota (YYYY-MM-DD HH:mm:ss)",
        example: "2024-12-15 14:30:00",
      },
    },
  },

  PatientBonusDetail: {
    type: "object",
    properties: {
      idBono: {
        type: "integer",
        format: "int64",
        description: "ID único del bonus",
        example: 1,
      },
      sesiones_totales: {
        type: "integer",
        description: "Número total de sesiones incluidas",
        example: 10,
      },
      euros_por_sesion: {
        type: "number",
        format: "decimal",
        description: "Precio por sesión en euros",
        example: 50.00,
      },
      precio_total: {
        type: "number",
        format: "decimal",
        description: "Precio total del bonus",
        example: 500.00,
      },
      fecha_compra: {
        type: "string",
        format: "date",
        description: "Fecha de compra del bonus (YYYY-MM-DD)",
        example: "2024-01-15",
      },
      fecha_expiracion: {
        type: "string",
        format: "date",
        description: "Fecha de expiración del bonus (YYYY-MM-DD)",
        example: "2024-12-31",
      },
      sesiones_restantes: {
        type: "integer",
        description: "Sesiones restantes por usar",
        example: 7,
      },
      sesiones_utilizadas: {
        type: "integer",
        description: "Sesiones ya utilizadas",
        example: 3,
      },
      estado_bono: {
        type: "string",
        enum: ["active", "consumed", "expired"],
        description: "Estado actual del bonus",
        example: "active",
      },
    },
  },

  PatientBonusesData: {
    type: "object",
    properties: {
      kpis: {
        $ref: "#/components/schemas/PatientBonusKpis",
      },
      bonuses: {
        type: "array",
        items: {
          $ref: "#/components/schemas/PatientBonusDetail",
        },
        description: "Lista detallada de bonuses del paciente",
      },
    },
  },

  PatientBonusesResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      data: {
        type: "object",
        properties: {
          kpis: {
            $ref: "#/components/schemas/PatientBonusKpis",
          },
          bonuses: {
            type: "array",
            items: {
              $ref: "#/components/schemas/PatientBonusDetail",
            },
            description: "Lista detallada de bonuses del paciente",
          },
        },
      },
    },
  },

  PatientBonusKpis: {
    type: "object",
    properties: {
      total_bonos: {
        type: "integer",
        description: "Total de bonuses del paciente",
        example: 5,
      },
      total_activos: {
        type: "integer",
        description: "Total de bonuses activos",
        example: 2,
      },
      total_consumidos: {
        type: "integer",
        description: "Total de bonuses consumidos",
        example: 2,
      },
      total_expirados: {
        type: "integer",
        description: "Total de bonuses expirados",
        example: 1,
      },
    },
  },

  PatientData: {
    type: "object",
    properties: {
      nombre: {
        type: "string",
        description: "Nombre del paciente",
        example: "Juan",
      },
      apellidos: {
        type: "string",
        description: "Apellidos del paciente",
        example: "Pérez García",
      },
      dni: {
        type: "string",
        description: "DNI del paciente",
        example: "12345678A",
      },
      fecha_nacimiento: {
        type: "string",
        format: "date",
        nullable: true,
        description: "Fecha de nacimiento (YYYY-MM-DD)",
        example: "1985-03-15",
      },
      estado: {
        type: "string",
        enum: ["en curso", "fin del tratamiento", "en pausa", "abandono", "derivación"],
        description: "Estado del tratamiento",
        example: "en curso",
      },
      email: {
        type: "string",
        format: "email",
        description: "Email del paciente",
        example: "juan.perez@email.com",
      },
      telefono: {
        type: "string",
        description: "Teléfono del paciente",
        example: "+34 666 123 456",
      },
      calle: {
        type: "string",
        nullable: true,
        description: "Calle de la dirección del paciente",
        example: "Calle Mayor",
      },
      numero: {
        type: "string",
        nullable: true,
        description: "Número de la calle",
        example: "123",
      },
      puerta: {
        type: "string",
        nullable: true,
        description: "Puerta/piso del domicilio",
        example: "2A",
      },
      codigo_postal: {
        type: "string",
        nullable: true,
        description: "Código postal",
        example: "28001",
      },
      ciudad: {
        type: "string",
        nullable: true,
        description: "Ciudad de residencia",
        example: "Madrid",
      },
      provincia: {
        type: "string",
        nullable: true,
        description: "Provincia de residencia",
        example: "Madrid",
      },
      genero: {
        type: "string",
        enum: ["M", "F", "O"],
        nullable: true,
        description: "Género del paciente (M=Masculino, F=Femenino, O=Otro)",
        example: "M",
      },
      ocupacion: {
        type: "string",
        nullable: true,
        description: "Ocupación/Escuela/Trabajo",
        example: "Estudiante de Psicología",
      },
      clinic_id: {
        type: "integer",
        format: "int64",
        nullable: true,
        description: "ID de la clínica asignada",
        example: 1,
      },
      fecha_inicio_tratamiento: {
        type: "string",
        format: "date",
        nullable: true,
        description: "Fecha de inicio del tratamiento (YYYY-MM-DD)",
        example: "2024-01-15",
      },
      menor_edad: {
        type: "boolean",
        nullable: true,
        description: "Indica si es menor de edad",
        example: false,
      },
      nombre_clinica: {
        type: "string",
        nullable: true,
        description: "Nombre de la clínica asignada",
        example: "Clínica Psicológica Centro",
      },
      tipo_clinica: {
        type: "string",
        enum: ["Online", "Presencial"],
        nullable: true,
        description: "Tipo de clínica basado en si tiene dirección. Online si no tiene dirección, Presencial si la tiene.",
        example: "Presencial",
      },
    },
  },

  PatientDetailResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      data: {
        type: "object",
        properties: {
          PatientResume: {
            oneOf: [
              { $ref: "#/components/schemas/PatientResume" },
              { type: "null" }
            ],
          },
          PatientData: {
            oneOf: [
              { $ref: "#/components/schemas/PatientData" },
              { type: "object" }
            ],
            description: "Datos detallados del paciente",
          },
          PatientMedicalRecord: {
            type: "array",
            items: {
              $ref: "#/definitions/PatientMedicalRecordItem",
            },
            description: "Historial de notas clínicas del paciente",
          },
          PatientSessions: {
            type: "array",
            items: {
              $ref: "#/components/schemas/PatientSession",
            },
            description: "Sesiones detalladas del paciente",
          },
          PatientDocuments: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Document",
            },
            description: "Documents associated with the patient (medical reports, prescriptions, etc.)",
          },
          PatientInvoice: {
            type: "array",
            items: {},
            description: "Facturas del paciente (vacío por ahora)",
            example: [],
          },
        },
      },
    },
  },

  PatientResumeInvoice: {
    type: "object",
    properties: {
      total_spent_current_year: {
        type: "number",
        format: "decimal",
        description: "Total gastado en el año actual",
        example: 720.00,
      },
      invoices_issued: {
        type: "integer",
        description: "Número de facturas emitidas",
        example: 0,
      },
    },
  },

  PatientSessionsStatus: {
    type: "object",
    properties: {
      completed_sessions: {
        type: "integer",
        description: "Número de sesiones completadas (incluye anteriormente finalizadas y programadas)",
        example: 11,
      },
      cancelled_sessions: {
        type: "integer",
        description: "Número de sesiones canceladas",
        example: 1,
      },
    },
  },

  PatientResume: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        format: "int64",
        description: "ID único del paciente",
        example: 1,
      },
      email: {
        type: "string",
        format: "email",
        description: "Email del paciente",
        example: "juan.perez@email.com",
      },
      phone: {
        type: "string",
        description: "Teléfono del paciente",
        example: "+34 666 123 456",
      },
      preferred_mode: {
        type: "string",
        enum: ["Online", "Presencial"],
        description: "Modo preferido de sesión basado en la clínica asignada. Online si la clínica no tiene dirección, Presencial si la tiene.",
        example: "Presencial",
      },
      PatientSessionsStatus: {
        $ref: "#/components/schemas/PatientSessionsStatus",
      },
      PatientResumeSessions: {
        type: "array",
        items: {
          $ref: "#/components/schemas/PatientResumeSession",
        },
        description: "Historial de sesiones del paciente",
      },
      PatientResumeInvoice: {
        $ref: "#/components/schemas/PatientResumeInvoice",
      },
    },
  },

  PatientResumeSession: {
    type: "object",
    properties: {
      tipo: {
        type: "string",
        enum: ["presencial", "online"],
        description: "Modalidad de la sesión",
        example: "presencial",
      },
      fecha: {
        type: "string",
        description: "Fecha de la sesión en formato dd/mm/yyyy",
        example: "15/12/2024",
      },
      precio: {
        type: "number",
        format: "decimal",
        description: "Precio de la sesión",
        example: 60.0,
      },
      metodo_pago: {
        type: "string",
        enum: ["bizum", "transferencia", "tarjeta", "efectivo", "pendiente"],
        description: "Método de pago",
        example: "tarjeta",
      },
    },
  },

  PatientSession: {
    type: "object",
    properties: {
      fecha: {
        type: "string",
        format: "date",
        description: "Fecha de la sesión (YYYY-MM-DD)",
        example: "2024-12-15",
      },
      clinica: {
        type: "string",
        nullable: true,
        description: "Nombre de la clínica",
        example: "Clínica Psicológica Centro",
      },
      estado: {
        type: "string",
        enum: ["completada", "cancelada"],
        description: "Estado de la sesión (completada o cancelada)",
        example: "completada",
      },
      precio: {
        type: "number",
        format: "decimal",
        description: "Precio total de la sesión",
        example: 60.0,
      },
      precio_neto: {
        type: "number",
        format: "decimal",
        description: "Precio neto que se lleva la psicóloga (calculado según porcentaje de la clínica)",
        example: 48.0,
      },
      tipo_pago: {
        type: "string",
        enum: ["bizum", "transferencia", "tarjeta", "efectivo", "pendiente"],
        description: "Método de pago",
        example: "tarjeta",
      },
      notas: {
        type: "string",
        nullable: true,
        description: "Notas de la sesión",
        example: "Sesión muy productiva, buen progreso del paciente",
      },
    },
  },

  PatientsResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      pagination: {
        $ref: "#/components/schemas/PaginationInfo",
      },
      data: {
        type: "array",
        items: {
          $ref: "#/components/schemas/Patient",
        },
      },
    },
  },

  PaymentMethodsItem: {
    type: "object",
    properties: {
      payment_method: {
        type: "string",
        enum: ["cash", "card", "transfer", "insurance"],
        description: "Método de pago utilizado",
        example: "cash",
      },
      percentage: {
        type: "number",
        format: "decimal",
        description: "Porcentaje de uso de este método de pago",
        example: 50.25,
      },
    },
  },

  RapidKPIData: {
    type: "object",
    properties: {
      sesiones_mes: {
        type: "integer",
        description: "Número de sesiones del mes actual",
        example: 45,
      },
      sesiones_variacion: {
        type: "number",
        format: "decimal",
        description: "Porcentaje de variación vs mes anterior (positivo o negativo)",
        example: 12.5,
      },
      ingresos_mes: {
        type: "number",
        format: "decimal",
        description: "Ingresos del mes actual en euros",
        example: 2750.00,
      },
      ingresos_variacion: {
        type: "number",
        format: "decimal",
        description: "Porcentaje de variación de ingresos vs mes anterior",
        example: -8.3,
      },
      pacientes_activos: {
        type: "integer",
        description: "Número de pacientes activos",
        example: 28,
      },
      pacientes_nuevos_mes: {
        type: "integer",
        description: "Nuevos pacientes este mes",
        example: 5,
      },
      proximas_citas_hoy: {
        type: "integer",
        description: "Número de citas programadas para hoy",
        example: 6,
      },
      siguiente_cita_hora: {
        type: "string",
        format: "time",
        nullable: true,
        description: "Hora de la siguiente cita de hoy (HH:MM:SS) o null si no hay más",
        example: "14:30:00",
      },
    },
  },

  ReminderSession: {
    type: "object",
    properties: {
      session_id: {
        type: "integer",
        format: "int64",
        description: "ID único de la sesión",
        example: 1,
      },
      start_time: {
        type: "string",
        format: "time",
        description: "Hora de inicio (HH:MM:SS)",
        example: "09:00:00",
      },
      end_time: {
        type: "string",
        format: "time",
        description: "Hora de finalización (HH:MM:SS)",
        example: "10:00:00",
      },
      patient_name: {
        type: "string",
        description: "Nombre completo del paciente",
        example: "Juan Pérez García",
      },
      reminder_sent: {
        type: "boolean",
        description: "Indica si se ha enviado recordatorio para esta sesión",
        example: false,
      },
    },
  },

  RemindersResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      data: {
        type: "array",
        items: {
          $ref: "#/components/schemas/ReminderSession",
        },
        description: "Lista de sesiones con información de recordatorios",
      },
      total: {
        type: "integer",
        description: "Número total de sesiones pendientes de recordatorio",
        example: 5,
      },
      message: {
        type: "string",
        description: "Mensaje descriptivo de la consulta",
        example: "Sesiones programadas para mañana (2024-12-16)",
      },
      metadata: {
        type: "object",
        properties: {
          targetDate: {
            type: "string",
            format: "date",
            description: "Fecha objetivo calculada",
            example: "2024-12-16",
          },
          currentDay: {
            type: "integer",
            description: "Día de la semana actual (0=Domingo, 1=Lunes, ...)",
            example: 1,
          },
          description: {
            type: "string",
            description: "Descripción del período consultado",
            example: "Sesiones de mañana",
          },
        },
      },
    },
  },

  Session: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        format: "int64",
        description: "ID único de la sesión",
        example: 1,
      },
      patient_id: {
        type: "integer",
        format: "int64",
        description: "ID del paciente",
        example: 1,
      },
      clinic_id: {
        type: "integer",
        format: "int64",
        description: "ID de la clínica",
        example: 1,
      },
      session_date: {
        type: "string",
        format: "date",
        description: "Fecha de la sesión (YYYY-MM-DD)",
        example: "2024-12-15",
      },
      start_time: {
        type: "string",
        format: "time",
        description: "Hora de inicio (HH:MM:SS)",
        example: "09:00:00",
      },
      end_time: {
        type: "string",
        format: "time",
        description: "Hora de finalización (HH:MM:SS)",
        example: "10:00:00",
      },
      mode: {
        type: "string",
        enum: ["presencial", "online"],
        description: "Modalidad de la sesión",
        example: "presencial",
      },
      type: {
        type: "string",
        description: "Tipo de terapia",
        example: "Terapia Individual",
      },
      status: {
        type: "string",
        enum: ["completada", "cancelada"],
        description: "Estado de la sesión",
        example: "completada",
      },
      price: {
        type: "number",
        format: "decimal",
        description: "Precio de la sesión",
        example: 60.0,
      },
      payment_method: {
        type: "string",
        enum: ["cash", "card", "transfer", "insurance"],
        description: "Método de pago",
        example: "card",
      },
      notes: {
        type: "string",
        description: "Notas adicionales",
        example: "Primera sesión del paciente",
      },
      created_at: {
        type: "string",
        format: "date-time",
        description: "Fecha de creación",
      },
      updated_at: {
        type: "string",
        format: "date-time",
        description: "Fecha de última actualización",
      },
      patient_name: {
        type: "string",
        description: "Nombre del paciente",
        example: "Juan Pérez García",
      },
    },
  },

  SessionData: {
    type: "object",
    properties: {
      session_id: {
        type: "integer",
        format: "int64",
        description: "ID único de la sesión",
        example: 1,
      },
      session_date: {
        type: "string",
        format: "date",
        description: "Fecha de la sesión (YYYY-MM-DD)",
        example: "2024-12-15",
      },
      start_time: {
        type: "string",
        format: "time",
        description: "Hora de inicio (HH:MM:SS)",
        example: "09:00:00",
      },
      end_time: {
        type: "string",
        format: "time",
        description: "Hora de finalización (HH:MM:SS)",
        example: "10:00:00",
      },
      mode: {
        type: "string",
        enum: ["presencial", "online"],
        description: "Modalidad de la sesión",
        example: "presencial",
      },
      status: {
        type: "string",
        enum: ["completada", "cancelada"],
        description: "Estado de la sesión",
        example: "completada",
      },
      type: {
        type: "string",
        description: "Tipo de sesión",
        example: "Terapia Individual",
      },
      price: {
        type: "number",
        format: "decimal",
        description: "Precio bruto de la sesión (lo que cobra la clínica al paciente)",
        example: 60.0,
      },
      net_price: {
        type: "number",
        format: "decimal",
        nullable: true,
        description: "Precio neto que recibe el psicólogo (price * clinic_percentage / 100)",
        example: 42.0,
      },
      payment_method: {
        type: "string",
        enum: ["cash", "card", "transfer", "insurance"],
        description: "Método de pago",
        example: "card",
      },
      notes: {
        type: "string",
        description: "Notas de la sesión",
        example: "Primera sesión del paciente",
      },
      PatientData: {
        $ref: "#/components/schemas/SessionPatientData",
      },
      ClinicDetailData: {
        $ref: "#/components/schemas/ClinicData",
      }
    },
  },

  SessionDetail: {
    type: "object",
    properties: {
      session_id: {
        type: "integer",
        format: "int64",
        description: "ID único de la sesión",
        example: 15,
      },
      session_date: {
        type: "string",
        format: "date",
        description: "Fecha de la sesión (YYYY-MM-DD)",
        example: "2024-08-15",
      },
    },
  },

  SessionDetailResponse: {
    type: "object",
    properties: {
      SessionDetailData: {
        $ref: "#/components/schemas/SessionData",
      },
    },
  },

  SessionItem: {
    type: "object",
    properties: {
      start_time: {
        type: "string",
        format: "time",
        description: "Hora de inicio de la sesión (HH:MM:SS)",
        example: "14:30:00",
      },
      patient_name: {
        type: "string",
        description: "Nombre completo del paciente",
        example: "Juan Pérez García",
      },
      session_type: {
        type: "string",
        description: "Modalidad de la sesión (online o presencial)",
        example: "Presencial",
      },
      clinic_name: {
        type: "string",
        description: "Nombre de la clínica",
        example: "Clínica Psicológica Centro",
      },
    },
  },

  SessionPatientData: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        format: "int64",
        description: "ID del paciente",
        example: 1,
      },
      name: {
        type: "string",
        description: "Nombre completo del paciente",
        example: "Juan Pérez García",
      },
    },
  },

  SessionResultItem: {
    type: "object",
    properties: {
      session_status: {
        type: "string",
        enum: ["scheduled", "completed", "cancelled", "no-show"],
        description: "Estado de la sesión",
        example: "completed",
      },
      session_count: {
        type: "integer",
        description: "Número de sesiones con este estado",
        example: 45,
      },
    },
  },

  SessionsByClinicItem: {
    type: "object",
    properties: {
      clinic_id: {
        type: "integer",
        format: "int64",
        description: "ID de la clínica",
        example: 1,
      },
      clinic_name: {
        type: "string",
        description: "Nombre de la clínica",
        example: "Clínica Psicológica Centro",
      },
      total_sessions: {
        type: "integer",
        description: "Total de sesiones en esta clínica",
        example: 45,
      },
      sessions: {
        type: "array",
        items: {
          $ref: "#/components/schemas/SessionDetail",
        },
        description: "Detalle de todas las sesiones de esta clínica (para filtros por año en frontend)",
      },
    },
  },

  SessionsResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      pagination: {
        $ref: "#/components/schemas/PaginationInfo",
      },
      data: {
        type: "array",
        items: {
          $ref: "#/components/schemas/SessionDetailResponse",
        },
      },
    },
  },

  SessionsKPIsResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "object",
        properties: {
          sesiones_completadas: { type: "integer", example: 12 },
          sesiones_canceladas: { type: "integer", example: 2 },
          ingresos_brutos: { type: "number", format: "decimal", example: 1200.50 },
          ingresos_netos: { type: "number", format: "decimal", example: 840.35 }
        }
      }
    }
  },

  SuccessResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        description: "Indica si la operación fue exitosa",
        example: true,
      },
      message: {
        type: "string",
        description: "Mensaje de éxito",
        example: "Operación completada exitosamente",
      },
    },
  },

  TodayUpcomingSessionsData: {
    type: "array",
    items: {
      $ref: "#/components/schemas/SessionItem",
    },
    description: "Lista de sesiones pendientes de hoy (posteriores a la hora actual)",
  },

  TomorrowSessionsData: {
    type: "array",
    items: {
      $ref: "#/components/schemas/SessionItem",
    },
    description: "Lista de sesiones del próximo día laborable (viernes→lunes, sábado→lunes, otros→día siguiente)",
  },

  UpdateClinicRequest: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Nombre de la clínica",
        example: "Clínica Psicológica Centro Actualizada",
      },
      clinic_color: {
        type: "string",
        nullable: true,
        description: "Color de la clínica en formato hexadecimal (#RRGGBB)",
        pattern: "^#[0-9A-Fa-f]{6}$",
        example: "#10B981",
      },
      address: {
        type: "string",
        nullable: true,
        description: "Dirección de la clínica",
        example: "Avenida Libertad 456, Barcelona",
      },
      price: {
        type: "number",
        format: "decimal",
        nullable: true,
        minimum: 0,
        description: "Precio base por sesión en euros",
        example: 65.00,
      },
      percentage: {
        type: "number",
        format: "decimal",
        nullable: true,
        minimum: 0,
        maximum: 100,
        description: "Porcentaje entre 0.00 y 100.00",
        example: 20.00,
      },
      is_billable: {
        type: "boolean",
        nullable: true,
        description: "Indica si la clínica es facturable (opcional)",
        example: true
      },
      billing_address: {
        type: "string",
        nullable: true,
        description: "Dirección de facturación",
        example: "Calle Facturación 456, Madrid 28001",
      },
      cif: {
        type: "string",
        nullable: true,
        description: "CIF (Tax Identification Number)",
        example: "B12345678",
      },
      fiscal_name: {
        type: "string",
        nullable: true,
        description: "Nombre fiscal para facturación",
        example: "Psicología Integral S.L.",
      },
    },
  },

  UpdatePatientRequest: {
    type: "object",
    properties: {
      first_name: {
        type: "string",
        description: "Nombre del paciente",
        example: "Juan",
      },
      last_name: {
        type: "string",
        description: "Apellidos del paciente",
        example: "Pérez García",
      },
      email: {
        type: "string",
        format: "email",
        description: "Email del paciente",
        example: "juan.perez@email.com",
      },
      phone: {
        type: "string",
        description: "Teléfono del paciente",
        example: "+34 666 123 456",
      },
      dni: {
        type: "string",
        description: "DNI del paciente",
        example: "12345678A",
      },
      gender: {
        type: "string",
        enum: ["M", "F", "O"],
        description: "Género del paciente (M=Masculino, F=Femenino, O=Otro)",
        example: "M",
      },
      occupation: {
        type: "string",
        nullable: true,
        description: "Ocupación/Escuela/Trabajo",
        example: "Estudiante de Psicología",
      },
      birth_date: {
        type: "string",
        format: "date",
        nullable: true,
        description: "Fecha de nacimiento (YYYY-MM-DD)",
        example: "1985-03-15",
      },
      street: {
        type: "string",
        nullable: true,
        description: "Nombre de la calle",
        example: "Calle Mayor",
      },
      street_number: {
        type: "string",
        nullable: true,
        description: "Número de la calle",
        example: "123",
      },
      door: {
        type: "string",
        nullable: true,
        description: "Puerta/Piso",
        example: "2A",
      },
      postal_code: {
        type: "string",
        nullable: true,
        description: "Código postal",
        example: "28001",
      },
      city: {
        type: "string",
        nullable: true,
        description: "Ciudad",
        example: "Madrid",
      },
      province: {
        type: "string",
        nullable: true,
        description: "Provincia",
        example: "Madrid",
      },
      clinic_id: {
        type: "integer",
        format: "int64",
        nullable: true,
        description: "ID de la clínica asignada",
        example: 1,
      },
      treatment_start_date: {
        type: "string",
        format: "date",
        nullable: true,
        description: "Fecha de inicio del tratamiento (YYYY-MM-DD)",
        example: "2024-01-15",
      },
      status: {
        type: "string",
        enum: ["en curso", "fin del tratamiento", "en pausa", "abandono", "derivación"],
        description: "Estado del tratamiento",
        example: "en curso",
      },
      is_minor: {
        type: "boolean",
        nullable: true,
        description: "Indica si es menor de edad",
        example: false,
      },
    },
  },

  UpdatePatientResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      data: {
        $ref: "#/components/schemas/Patient",
      },
      message: {
        type: "string",
        example: "Paciente actualizado exitosamente",
      },
    },
  },

  UpdateUserRequest: {
    type: "object",
    properties: {
      license_number: {
        type: "string",
        nullable: true,
        description: "Número de colegiado (license/registration number)",
        example: "COLE-12345",
      },
      irpf: {
        type: "number",
        format: "decimal",
        nullable: true,
        description: "Porcentaje IRPF (ej: 15.5)",
        example: 15.5,
      },
      name: {
        type: "string",
        description: "Nombre completo del usuario",
        example: "Admin Usuario Actualizado",
      },
      dni: {
        type: "string",
        nullable: true,
        description: "Documento Nacional de Identidad",
        example: "12345678A",
      },
      street: {
        type: "string",
        nullable: true,
        description: "Nombre de la calle",
        example: "Calle Mayor",
      },
      street_number: {
        type: "string",
        nullable: true,
        description: "Número de la calle",
        example: "123",
      },
      door: {
        type: "string",
        nullable: true,
        description: "Puerta/Piso",
        example: "2A",
      },
      city: {
        type: "string",
        nullable: true,
        description: "Ciudad",
        example: "Madrid",
      },
      province: {
        type: "string",
        nullable: true,
        description: "Provincia",
        example: "Madrid",
      },
      postal_code: {
        type: "string",
        nullable: true,
        description: "Código postal",
        example: "28001",
      },
      iban: {
        type: "string",
        nullable: true,
        description: "IBAN de la cuenta bancaria",
        example: "ES9121000418450200051332",
      },
    },
  },

  UpdateUserResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      data: {
        $ref: "#/components/schemas/UserDetail",
      },
      message: {
        type: "string",
        example: "Usuario actualizado exitosamente",
      },
    },
  },

  UseBonusSessionResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Sesión registrada exitosamente",
      },
      data: {
        type: "object",
        properties: {
          history_id: {
            type: "integer",
            format: "int64",
            description: "ID del registro de historial creado",
            example: 15,
          },
          bonus_id: {
            type: "integer",
            format: "int64",
            description: "ID del bonus",
            example: 5,
          },
          new_used_sessions: {
            type: "integer",
            description: "Nuevo número de sesiones utilizadas",
            example: 4,
          },
          remaining_sessions: {
            type: "integer",
            description: "Sesiones restantes",
            example: 6,
          },
          new_status: {
            type: "string",
            enum: ["active", "consumed", "expired"],
            description: "Nuevo estado del bonus",
            example: "active",
          },
        },
      },
    },
  },

  User: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        format: "int64",
        description: "ID único del usuario",
        example: 1,
      },
      email: {
        type: "string",
        format: "email",
        description: "Email del usuario",
        example: "demo@psycoerp.es",
      },
      name: {
        type: "string",
        description: "Nombre del usuario",
        example: "Admin Usuario",
      },
      license_number: {
        type: "string",
        nullable: true,
        description: "Número de colegiado (license/registration number)",
        example: "COLE-12345",
      },
      last_login: {
        type: "string",
        format: "date-time",
        nullable: true,
        description: "Fecha del último login",
        example: "2024-12-15T14:30:00Z",
      },
    },
  },

  UserDetail: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        format: "int64",
        description: "ID único del usuario",
        example: 1,
      },
      name: {
        type: "string",
        description: "Nombre completo del usuario",
        example: "Admin Usuario",
      },
      license_number: {
        type: "string",
        nullable: true,
        description: "Número de colegiado (license/registration number)",
        example: "COLE-12345",
      },
      dni: {
        type: "string",
        nullable: true,
        description: "Documento Nacional de Identidad",
        example: "12345678A",
      },
      street: {
        type: "string",
        nullable: true,
        description: "Nombre de la calle",
        example: "Calle Mayor",
      },
      street_number: {
        type: "string",
        nullable: true,
        description: "Número de la calle",
        example: "123",
      },
      door: {
        type: "string",
        nullable: true,
        description: "Puerta/Piso",
        example: "2A",
      },
      city: {
        type: "string",
        nullable: true,
        description: "Ciudad",
        example: "Madrid",
      },
      province: {
        type: "string",
        nullable: true,
        description: "Provincia",
        example: "Madrid",
      },
      postal_code: {
        type: "string",
        nullable: true,
        description: "Código postal",
        example: "28001",
      },
      iban: {
        type: "string",
        nullable: true,
        description: "IBAN de la cuenta bancaria",
        example: "ES9121000418450200051332",
      },
    },
  },

  UserDetailResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      data: {
        $ref: "#/components/schemas/UserDetail",
      },
      message: {
        type: "string",
        example: "Usuario obtenido exitosamente",
      },
    },
  },

  WeeklySessionsItem: {
    type: "object",
    properties: {
      week_number: {
        type: "integer",
        description: "Número de semana del mes (1-5)",
        example: 2,
      },
      week_label: {
        type: "string",
        description: "Etiqueta descriptiva de la semana",
        example: "Semana 2",
      },
      session_count: {
        type: "integer",
        description: "Número de sesiones realizadas en esta semana",
        example: 15,
      },
    },
  },
};

module.exports = definitions;