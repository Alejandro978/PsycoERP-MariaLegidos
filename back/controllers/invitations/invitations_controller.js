const crypto = require("crypto");
const logger = require("../../utils/logger");
const {
  createInvitation,
  getInvitationByToken,
  getInvitationById,
  getInvitations,
  markInvitationAsUsed,
  markInvitationAsExpired,
} = require("../../models/invitations/invitations_model");
const { createPatient } = require("../../models/patients/patients_model");

// URL del frontend para generar enlaces
const FRONTEND_URL = process.env.FRONTEND_URL || "https://psicoandante.com";

/**
 * Genera una nueva invitación
 * POST /api/invitations/generate
 * Body: { clinic_id: number } - Clínica asociada a la invitación
 * Protegido - requiere autenticación
 */
const generarInvitacion = async (req, res) => {
  try {
    const { clinic_id } = req.body;

    // Validar que se proporcione clinic_id
    if (!clinic_id) {
      return res.status(400).json({
        success: false,
        message: "El campo clinic_id es obligatorio",
      });
    }

    // Generar token único
    const token = crypto.randomBytes(32).toString("hex");

    // Fecha de expiración: 7 días desde ahora
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await createInvitation(req.db, {
      token,
      expires_at: expiresAt.toISOString().slice(0, 19).replace("T", " "),
      clinic_id,
    });

    // Construir enlace completo
    const invitationLink = `${FRONTEND_URL}/register/${token}`;

    res.status(201).json({
      success: true,
      message: "Invitación generada exitosamente",
      data: {
        id: invitation.id,
        token: invitation.token,
        link: invitationLink,
        expires_at: invitation.expires_at,
        clinic_id: invitation.clinic_id,
      },
    });
  } catch (error) {
    logger.error("Error en generarInvitacion:", error.message);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

/**
 * Valida si un token es válido
 * GET /api/invitations/validate/:token
 * Público - sin autenticación
 */
const validarToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Token requerido",
      });
    }

    const invitation = await getInvitationByToken(req.db, token);

    // Token no existe
    if (!invitation) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: "Token no encontrado",
      });
    }

    // Token ya usado
    if (invitation.status === "used") {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Este enlace de invitación ya ha sido utilizado",
      });
    }

    // Token expirado por status
    if (invitation.status === "expired") {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Este enlace de invitación ha expirado",
      });
    }

    // Token expirado por fecha
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    if (now > expiresAt) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Este enlace de invitación ha expirado",
      });
    }

    // Token válido
    res.status(200).json({
      success: true,
      valid: true,
      expires_at: invitation.expires_at,
    });
  } catch (error) {
    logger.error("Error en validarToken:", error.message);
    res.status(500).json({
      success: false,
      valid: false,
      message: "Error interno del servidor",
    });
  }
};

/**
 * Registra un nuevo paciente usando una invitación
 * POST /api/patients/register/:token
 * Público - sin autenticación
 */
const registrarPaciente = async (req, res) => {
  try {
    const { token } = req.params;
    const patientData = req.body;

    // Validar token
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token requerido",
      });
    }

    // Validar campos obligatorios del paciente
    if (!patientData.first_name || !patientData.last_name) {
      return res.status(400).json({
        success: false,
        message: "Nombre y apellidos son obligatorios",
      });
    }

    // Obtener invitación
    const invitation = await getInvitationByToken(req.db, token);

    // Token no existe
    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Token no encontrado",
      });
    }

    // Token ya usado
    if (invitation.status === "used") {
      return res.status(400).json({
        success: false,
        message: "Este enlace de invitación ya ha sido utilizado",
      });
    }

    // Token expirado por status
    if (invitation.status === "expired") {
      return res.status(400).json({
        success: false,
        message: "Este enlace de invitación ha expirado",
      });
    }

    // Token expirado por fecha
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    if (now > expiresAt) {
      return res.status(400).json({
        success: false,
        message: "Este enlace de invitación ha expirado",
      });
    }

    // Crear paciente con datos automáticos desde la invitación
    const newPatientData = {
      ...patientData,
      clinic_id: invitation.clinic_id, // Automático desde la invitación
      treatment_start_date: new Date().toISOString().slice(0, 10), // Fecha actual
      status: patientData.status || "en curso",
    };

    const patient = await createPatient(req.db, newPatientData);

    // Marcar invitación como usada
    await markInvitationAsUsed(req.db, token);

    res.status(201).json({
      success: true,
      message: "Paciente registrado exitosamente",
      data: {
        patient,
      },
    });
  } catch (error) {
    logger.error("Error en registrarPaciente:", error.message);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

/**
 * Lista todas las invitaciones con paginación y filtros
 * GET /api/invitations
 * Protegido - requiere autenticación
 */
const obtenerInvitaciones = async (req, res) => {
  try {
    const { status, fecha_desde, fecha_hasta, page, limit } = req.query;

    // Validar parámetros de paginación
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    if (pageNum < 1 || limitNum < 1) {
      return res.status(400).json({
        success: false,
        error: "Parámetros de paginación inválidos",
      });
    }

    // Construir filtros
    const filters = {
      page: pageNum,
      limit: limitNum,
    };

    if (status) filters.status = status;
    if (fecha_desde) filters.fecha_desde = fecha_desde;
    if (fecha_hasta) filters.fecha_hasta = fecha_hasta;

    const result = await getInvitations(req.db, filters);

    // Calcular información de paginación
    const totalPages = Math.ceil(result.total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        totalRecords: result.total,
        recordsPerPage: limitNum,
        hasNextPage: hasNextPage,
        hasPrevPage: hasPrevPage,
        nextPage: hasNextPage ? pageNum + 1 : null,
        prevPage: hasPrevPage ? pageNum - 1 : null,
      },
    });
  } catch (error) {
    logger.error("Error en obtenerInvitaciones:", error.message);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

/**
 * Elimina (soft delete) una invitación
 * DELETE /api/invitations/:id
 * Protegido - requiere autenticación
 */
const eliminarInvitacion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: "ID de invitación inválido",
      });
    }

    // Verificar que la invitación existe
    const invitation = await getInvitationById(req.db, parseInt(id));

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitación no encontrada",
      });
    }

    // Solo se pueden eliminar invitaciones pendientes
    if (invitation.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Solo se pueden eliminar invitaciones pendientes",
      });
    }

    const deleted = await markInvitationAsExpired(req.db, parseInt(id));

    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: "No se pudo eliminar la invitación",
      });
    }

    res.status(200).json({
      success: true,
      message: "Invitación eliminada exitosamente",
    });
  } catch (error) {
    logger.error("Error en eliminarInvitacion:", error.message);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

module.exports = {
  generarInvitacion,
  validarToken,
  registrarPaciente,
  obtenerInvitaciones,
  eliminarInvitacion,
};
