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
const invitationsPaths = require("./paths/invitations");
const invoicesPaths = require("./paths/invoices");
const notesPaths = require("./paths/notes");
const patientsPaths = require("./paths/patients");
const remindersPaths = require("./paths/reminders");
const sessionsPaths = require("./paths/sessions");
const usersPaths = require("./paths/users");
const whatsappPaths = require("./paths/whatsapp");

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
          url: "https://test.psicoandante.com",
          description: "Test Environment (TEST)",
        },
        {
          url: "https://psicoandante.com",
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
    ...invitationsPaths,
    ...invoicesPaths,
    ...notesPaths,
    ...patientsPaths,
    ...remindersPaths,
    ...sessionsPaths,
    ...usersPaths,
    ...whatsappPaths,
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
      name: "Invitations",
      description: "Gestión de invitaciones para auto-registro de pacientes",
    },
    {
      name: "Invoices",
      description: "Gestión de facturación y KPIs financieros",
    },
    {
      name: "Notes",
      description: "Gestión de notas y recordatorios personales",
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
    {
      name: "WhatsApp",
      description: "Envío de recordatorios automáticos por WhatsApp vía Twilio",
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
