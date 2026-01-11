const { getNotes } = require("../../models/notes/notes_model");
const logger = require("../../utils/logger");

const obtenerNotas = async (req, res) => {
  try {
    const { status, page, limit } = req.query;

    // Validar parámetros de paginación
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10000;

    // Validaciones de límites
    if (pageNum < 1) {
      return res.status(400).json({
        success: false,
        error: "El número de página debe ser mayor a 0",
      });
    }

    if (limitNum < 1) {
      return res.status(400).json({
        success: false,
        error: "El límite debe ser mayor a 0",
      });
    }

    // Validar status si se proporciona
    if (status && !["pending", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "El status debe ser 'pending' o 'completed'",
      });
    }

    // Construir filtros incluyendo paginación
    const filters = {};
    if (status) filters.status = status;

    // Parámetros de paginación
    filters.page = pageNum;
    filters.limit = limitNum;

    const result = await getNotes(req.db, filters);

    res.json({
      success: true,
      kpis: result.kpis,
      pagination: result.pagination,
      data: result.data,
    });
  } catch (err) {
    logger.error("Error al obtener notas:", err.message);
    res.status(500).json({
      success: false,
      error: "Error al obtener las notas",
    });
  }
};

module.exports = {
  obtenerNotas,
};
