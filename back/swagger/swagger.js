const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const definitions = require("./definitions");
const authPaths = require("./paths/auth");
const bonusesPaths = require("./paths/bonuses");
const clinicalNotesPaths = require("./paths/clinical_notes");
const clinicsPaths = require("./paths/clinics");
const dashboardPaths = require("./paths/dashboard");
const documentsPaths = require("./paths/documents");
const googlePaths = require("./paths/google");
const invoicesPaths = require("./paths/invoices");
const patientsPaths = require("./paths/patients");
const remindersPaths = require("./paths/reminders");
const sessionsPaths = require("./paths/sessions");
const usersPaths = require("./paths/users");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "API de Psicología",
    version: "1.0.0",
    description: "API REST para la gestión de sesiones de psicología",
    contact: {
      name: "Desarrollo",
      email: "dev@psicologia.com",
    },
  },
  servers:
    process.env.NODE_ENV === "production"
      ? [
          {
            url: "https://test.millopsicologia.com",
            description: "Test Environment (TEST)",
          },
          {
            url: "https://millopsicologia.com",
            description: "Production Environment (PROD)",
          },
        ]
      : [
          {
            url: "http://localhost:3000",
            description: "Local Development",
          },
        ],
  components: {
    schemas: definitions,
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT token obtenido del endpoint de login",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    ...authPaths,
    ...bonusesPaths,
    ...clinicalNotesPaths,
    ...clinicsPaths,
    ...dashboardPaths,
    ...documentsPaths,
    ...googlePaths,
    ...invoicesPaths,
    ...patientsPaths,
    ...remindersPaths,
    ...sessionsPaths,
    ...usersPaths,
  },
  tags: [
    {
      name: "Auth",
      description: "Autenticación de usuarios prueba",
    },
    {
      name: "Bonuses",
      description: "Gestión de bonuses de pacientes",
    },
    {
      name: "Clinical Notes",
      description: "Gestión de notas clínicas e historial médico",
    },
    {
      name: "Clinics",
      description: "Gestión de clínicas",
    },
    {
      name: "Dashboard",
      description: "KPIs y métricas del dashboard",
    },
    {
      name: "Documents",
      description: "Patient document management",
    },
    {
      name: "Google OAuth",
      description: "Autorización y gestión de tokens de Google Calendar",
    },
    {
      name: "Invoices",
      description: "Gestión de facturación y KPIs financieros",
    },
    {
      name: "Patients",
      description: "Gestión de pacientes",
    },
    {
      name: "Reminders",
      description: "Gestión de recordatorios de sesiones",
    },
    {
      name: "Sessions",
      description: "Gestión de sesiones de terapia",
    },
    {
      name: "Users",
      description: "Gestión de usuarios del sistema",
    },
  ],
};

// Configuración de Swagger UI
const swaggerOptions = {
  explorer: true,
  customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info .title { color: #3b82f6; }
    `,
  customSiteTitle: "API Psicología - Documentación",
  swaggerOptions: {
    filter: true,
    showRequestHeaders: true,
  },
};

module.exports = {
  swaggerUi,
  swaggerDefinition,
  swaggerOptions,
};
