const { verifyToken } = require("../utils/jwt");
const { getUserById } = require("../models/auth/auth_model");
const { getInvitationByToken } = require("../models/invitations/invitations_model");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token de acceso requerido",
      });
    }

    // Verificar el token
    const decoded = verifyToken(token);

    // Verificar que el usuario existe y está activo
    const user = await getUserById(req.db, decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Agregar información del usuario a la request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    console.error("Error en authenticateToken:", error.message);
    
    if (error.message === "Token expirado") {
      return res.status(401).json({
        success: false,
        message: "Token expirado",
        error: "TOKEN_EXPIRED",
      });
    }

    if (error.message === "Token inválido") {
      return res.status(401).json({
        success: false,
        message: "Token inválido",
        error: "INVALID_TOKEN",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

const authenticateTokenOrInvitation = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Si hay JWT → comportamiento estándar
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authenticateToken(req, res, next);
    }

    // Sin JWT → buscar invitation_token en el body (multer ya lo parseó)
    const { invitation_token, patient_id } = req.body;

    if (!invitation_token) {
      return res.status(401).json({
        success: false,
        message: "Token de acceso requerido",
      });
    }

    const invitation = await getInvitationByToken(req.db, invitation_token);

    if (!invitation) {
      return res.status(401).json({
        success: false,
        message: "Token de invitación inválido",
      });
    }

    // Verificar que no ha expirado por fecha
    if (new Date() > new Date(invitation.expires_at)) {
      return res.status(401).json({
        success: false,
        message: "Token de invitación expirado",
      });
    }

    // Verificar que el patient_id pertenece a la misma clínica que la invitación
    if (patient_id) {
      const [rows] = await req.db.execute(
        "SELECT clinic_id FROM patients WHERE id = ? AND is_active = true",
        [parseInt(patient_id)]
      );

      if (rows.length === 0 || rows[0].clinic_id !== invitation.clinic_id) {
        return res.status(403).json({
          success: false,
          message: "El paciente no corresponde a este token de invitación",
        });
      }
    }

    req.invitationAuth = true;
    next();
  } catch (error) {
    console.error("Error en authenticateTokenOrInvitation:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

module.exports = {
  authenticateToken,
  authenticateTokenOrInvitation,
};