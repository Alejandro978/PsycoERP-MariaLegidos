const { getNotes, createNote, completeNote, deleteNote } = require("../../models/notes/notes_model");
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

const crearNota = async (req, res) => {
    try {
        const { message } = req.body;

        // Validar que se proporcione el mensaje
        if (!message || message.trim() === "") {
            return res.status(400).json({
                success: false,
                error: "El campo message es obligatorio",
            });
        }

        // Validar longitud del mensaje
        if (message.length > 5000) {
            return res.status(400).json({
                success: false,
                error: "El mensaje no puede exceder los 5000 caracteres",
            });
        }

        const noteData = {
            message: message.trim(),
        };

        const resultado = await createNote(req.db, noteData);

        res.status(201).json({
            success: true,
            message: "Nota creada exitosamente",
            data: {
                id: resultado.id,
            },
        });
    } catch (err) {
        logger.error("Error al crear nota:", err.message);
        res.status(500).json({
            success: false,
            error: "Error al crear la nota",
        });
    }
};

const completarNota = async (req, res) => {
    try {
        const { id } = req.params;

        // Validar que se proporcione el ID y sea un número válido
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: "ID es requerido y debe ser un número válido",
            });
        }

        const resultado = await completeNote(req.db, parseInt(id));

        if (!resultado) {
            return res.status(404).json({
                success: false,
                error: "Nota no encontrada, no está activa o ya está completada",
            });
        }

        res.json({
            success: true,
            message: "Nota completada exitosamente",
        });
    } catch (err) {
        logger.error("Error al completar nota:", err.message);
        res.status(500).json({
            success: false,
            error: "Error al completar la nota",
        });
    }
};

const eliminarNota = async (req, res) => {
    try {
        const { id } = req.params;

        // Validar que se proporcione el ID y sea un número válido
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: "ID es requerido y debe ser un número válido",
            });
        }

        const resultado = await deleteNote(req.db, parseInt(id));

        if (!resultado) {
            return res.status(404).json({
                success: false,
                error: "Nota no encontrada o ya está eliminada",
            });
        }

        res.json({
            success: true,
            message: "Nota eliminada exitosamente",
        });
    } catch (err) {
        logger.error("Error al eliminar nota:", err.message);
        res.status(500).json({
            success: false,
            error: "Error al eliminar la nota",
        });
    }
};

module.exports = {
    obtenerNotas,
    crearNota,
    completarNota,
    eliminarNota,
}