const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const { testConnection, dbMiddleware } = require("./config/db");
const {
  swaggerUi,
  swaggerDefinition,
  swaggerOptions,
} = require("./swagger/swagger");
const logger = require("./utils/logger");

const app = express();
const PORT = process.env.PORT || 3000;

const { authenticateToken } = require("./middlewares/auth");
const authRoutes = require("./routes/auth/auth_routes");
const sessionsRoutes = require("./routes/sessions/sessions_routes");
const patientsRoutes = require("./routes/patients/patients_routes");
const bonusesRoutes = require("./routes/bonuses/bonuses_routes");
const clinicsRoutes = require("./routes/clinics/clinics_routes");
const dashboardRoutes = require("./routes/dashboard/dashboard_routes");
const clinicalNotesRoutes = require("./routes/clinical_notes/clinical_notes_routes");
const documentsRoutes = require("./routes/documents/documents_routes");
const remindersRoutes = require("./routes/reminders/reminders_routes");
const usersRoutes = require("./routes/users/users_routes");
const invoicesRoutes = require("./routes/invoices/invoices_routes");

// Middlewares globales
app.use(cors());
app.use(express.json({ limit: "50mb" })); // Aumentar límite para archivos grandes
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Middleware para inyectar el pool de BD correcto según hostname
app.use(dbMiddleware);

// Configuración de credenciales de Google OAuth 2.0
// Función para determinar qué credenciales usar (sigue el mismo patrón que db.js)
const getGoogleCredentialsPath = (hostname) => {
  // Localhost siempre usa TEST
  if (hostname === "127.0.0.1" || hostname === "localhost") {
    return {
      credentials: path.join(__dirname, ".secret", "credentials.test.json"),
      token: path.join(__dirname, ".secret", "token.test.json"),
    };
  }

  // Si incluye "test." usa credenciales de test
  if (hostname && hostname.includes("test.")) {
    return {
      credentials: path.join(__dirname, ".secret", "credentials.test.json"),
      token: path.join(__dirname, ".secret", "token.test.json"),
    };
  }

  // Por defecto (producción)
  return {
    credentials: path.join(__dirname, ".secret", "credentials.production.json"),
    token: path.join(__dirname, ".secret", "token.production.json"),
  };
};

// Por defecto inicializa con credenciales de producción para el oAuth2Client global
// Las rutas de Google OAuth pueden usar esto o crear su propio client dinámicamente
const defaultPaths = getGoogleCredentialsPath();
const credentials = JSON.parse(fs.readFileSync(defaultPaths.credentials));

// Support both 'web' and 'installed' credential formats (desktop vs web app)
let client_id, client_secret, redirect_uris;
if (credentials.web) {
  ({ client_id, client_secret, redirect_uris } = credentials.web);
  logger.log('Using OAuth client type: web');
} else if (credentials.installed) {
  ({ client_id, client_secret, redirect_uris } = credentials.installed);
  logger.log('Using OAuth client type: installed (desktop)');
} else {
  throw new Error('Invalid credentials.json: missing "web" or "installed" client configuration');
}

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  (redirect_uris && redirect_uris.length > 0) ? redirect_uris[0] : undefined
);

// Montar rutas de Google (auth-url protegido + callback público)
const googleRoutes = require('./routes/google/google_routes');
app.use('/api/google', googleRoutes);

// 🔧 SWAGGER UI - Documentación
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDefinition, swaggerOptions)
);

// Ruta de bienvenida
app.get("/", (req, res) => {
  res.json({
    message: "🚀 API de Psicología funcionando correctamente",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      sessions: "/api/sessions",
      patients: "/api/patients",
      bonuses: "/api/bonuses",
      clinics: "/api/clinics",
      dashboard: "/api/dashboard",
      clinical_notes: "/api/clinical-notes",
      documents: "/api/documents",
      reminders: "/api/reminders",
      users: "/api/users",
      invoices: "/api/invoices",
    },
  });
});

// Rutas públicas (sin autenticación)
app.use("/api/auth", authRoutes);

// Ruta pública para OAuth callback de Google (usado por get_gcal_token.js)
app.get("/oauth/callback", (req, res) => {
  const code = req.query.code;
  
  if (!code) {
    return res.status(400).json({
      success: false,
      message: "No se recibió el código de autorización",
    });
  }

  // Mostrar el código en una página simple para que el usuario lo copie
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Autorización de Google Calendar</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 50px auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #4285f4; }
        .code-box {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 4px;
          border: 1px solid #ddd;
          word-break: break-all;
          font-family: monospace;
          margin: 20px 0;
        }
        button {
          background: #4285f4;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        button:hover { background: #357ae8; }
        .success { color: #0f9d58; margin-top: 10px; display: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>✅ Autorización Exitosa</h1>
        <p>Copia el siguiente código y pégalo en la terminal donde ejecutaste <code>get_gcal_token.js</code>:</p>
        <div class="code-box" id="code">${code}</div>
        <button onclick="copyCode()">📋 Copiar Código</button>
        <p class="success" id="copied">✓ Código copiado al portapapeles</p>
        <p style="margin-top: 20px; color: #666; font-size: 14px;">
          Después de pegar el código, puedes cerrar esta ventana.
        </p>
      </div>
      <script>
        function copyCode() {
          const code = document.getElementById('code').textContent;
          navigator.clipboard.writeText(code).then(() => {
            document.getElementById('copied').style.display = 'block';
          });
        }
      </script>
    </body>
    </html>
  `);
});

// Middleware global de autenticación para todas las rutas protegidas
app.use(authenticateToken);

// Rutas protegidas (requieren autenticación)
app.use("/api/sessions", sessionsRoutes);
app.use("/api/patients", patientsRoutes);
app.use("/api/bonuses", bonusesRoutes);
app.use("/api/clinics", clinicsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/clinical-notes", clinicalNotesRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/reminders", remindersRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/invoices", invoicesRoutes);

// Iniciar servidor
app.listen(PORT, async () => {
  logger.success(`Servidor corriendo en http://localhost:${PORT}`);

  // Probar conexión a la base de datos
  await testConnection();
});
