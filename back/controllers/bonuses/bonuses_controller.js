const { getBonuses, getBonusesByPatientId, getBonusHistoryById, useBonusSession, createBonus } = require("../../models/bonuses/bonuses_model");
const logger = require("../../utils/logger");

const obtenerBonuses = async (req, res) => {
  try {
    const { patient_id, status, fecha_desde, fecha_hasta, page, limit } = req.query;

    // Construir filtros incluyendo paginación
    const filters = {};
    if (patient_id) filters.patient_id = patient_id;
    if (status) filters.status = status;
    if (fecha_desde) filters.fecha_desde = fecha_desde;
    if (fecha_hasta) filters.fecha_hasta = fecha_hasta;
    if (page) filters.page = page;
    if (limit) filters.limit = limit;

    const result = await getBonuses(req.db, filters);

    res.json({
      success: true,
      pagination: result.pagination,
      data: result.data,
    });
  } catch (err) {
    logger.error("Error al obtener bonuses:", err.message);
    res.status(500).json({
      success: false,
      error: "Error al obtener los bonuses",
    });
  }
};

const obtenerBonusesPorPaciente = async (req, res) => {
  try {
    const { patient_id } = req.params;

    if (!patient_id) {
      return res.status(400).json({
        success: false,
        error: "ID del paciente es requerido",
      });
    }

    const bonusesData = await getBonusesByPatientId(req.db, patient_id);

    res.json({
      success: true,
      data: {
        kpis: bonusesData.kpis,
        bonuses: bonusesData.bonuses,
      },
    });
  } catch (err) {
    logger.error("Error al obtener bonuses por paciente:", err.message);
    res.status(500).json({
      success: false,
      error: "Error al obtener los bonuses del paciente",
    });
  }
};

const obtenerHistorialBonus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "ID del bonus es requerido",
      });
    }

    const bonusHistory = await getBonusHistoryById(req.db, id);

    if (!bonusHistory) {
      return res.status(404).json({
        success: false,
        error: "Bonus no encontrado",
      });
    }

    res.json({
      success: true,
      data: bonusHistory,
    });
  } catch (err) {
    logger.error("Error al obtener historial del bonus:", err.message);
    res.status(500).json({
      success: false,
      error: "Error al obtener el historial del bonus",
    });
  }
};

const registrarSesionBonus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "ID del bonus es requerido",
      });
    }

    const result = await useBonusSession(req.db, id);

    res.status(201).json({
      success: true,
      message: "Sesión registrada exitosamente",
      data: {
        history_id: result.id,
        bonus_id: result.bonus_id,
        new_used_sessions: result.new_used_sessions,
        remaining_sessions: result.remaining_sessions,
        new_status: result.new_status
      },
    });
  } catch (err) {
    logger.error("Error al registrar sesión del bonus:", err.message);
    
    if (err.message === 'Bonus no encontrado') {
      return res.status(404).json({
        success: false,
        error: "Bonus no encontrado",
      });
    }
    
    if (err.message === 'El bonus no está activo' || err.message === 'El bonus ya ha consumido todas las sesiones') {
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }

    res.status(500).json({
      success: false,
      error: "Error al registrar la sesión del bonus",
    });
  }
};

const crearBonus = async (req, res) => {
  try {
    const {
      patient_id,
      total_sessions,
      price_per_session,
      total_price
    } = req.body;

    // Validaciones básicas
    if (!patient_id || !total_sessions || !price_per_session || !total_price) {
      return res.status(400).json({
        success: false,
        error: "Los campos patient_id, total_sessions, price_per_session y total_price son requeridos",
      });
    }

    // Validaciones de tipo y rango
    if (total_sessions <= 0) {
      return res.status(400).json({
        success: false,
        error: "El número de sesiones debe ser mayor a 0",
      });
    }

    if (price_per_session <= 0 || total_price <= 0) {
      return res.status(400).json({
        success: false,
        error: "Los precios deben ser mayores a 0",
      });
    }

    const bonusData = {
      patient_id,
      total_sessions,
      price_per_session,
      total_price
    };

    const bonusId = await createBonus(req.db, bonusData);

    // Obtener el bonus recién creado para devolverlo
    const nuevoBonus = await getBonusesByPatientId(req.db, patient_id);
    const bonusCreado = nuevoBonus.bonuses.find(bonus => bonus.idBono === bonusId);

    res.status(201).json({
      success: true,
      message: "Bonus creado exitosamente",
      data: bonusCreado,
    });
  } catch (err) {
    logger.error("Error al crear bonus:", err.message);
    res.status(500).json({
      success: false,
      error: "Error al crear el bonus",
    });
  }
};

module.exports = {
  obtenerBonuses,
  obtenerBonusesPorPaciente,
  obtenerHistorialBonus,
  registrarSesionBonus,
  crearBonus,
};
