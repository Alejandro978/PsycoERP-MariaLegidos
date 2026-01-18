const express = require("express");
const router = express.Router();

const {
  generarInvitacion,
  obtenerInvitaciones,
  eliminarInvitacion,
} = require("../../controllers/invitations/invitations_controller");

// Rutas protegidas (requieren autenticación JWT)

// POST /api/invitations/generate - Genera una nueva invitación
router.post("/generate", generarInvitacion);

// GET /api/invitations - Lista todas las invitaciones con paginación
router.get("/", obtenerInvitaciones);

// DELETE /api/invitations/:id - Elimina (soft delete) una invitación
router.delete("/:id", eliminarInvitacion);

module.exports = router;
