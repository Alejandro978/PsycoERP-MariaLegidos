const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const {
  validarToken,
  registrarPaciente,
} = require("../../controllers/invitations/invitations_controller");

// Rate limiter para endpoints públicos: 10 intentos cada 15 minutos por IP
const publicRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  message: {
    success: false,
    message: "Demasiadas solicitudes. Por favor, intente nuevamente en 15 minutos",
  },
});

// Rutas públicas (sin autenticación)

// GET /api/invitations/validate/:token - Valida si un token es válido
router.get("/validate/:token", publicRateLimiter, validarToken);

// POST /api/patients/register/:token - Registra un paciente usando una invitación
router.post("/register/:token", publicRateLimiter, registrarPaciente);

module.exports = router;
