const {
  getClinicalNotesByPatientId,
  createClinicalNote,
  updateClinicalNote,
  deleteClinicalNote,
} = require("../../models/clinical_notes/clinical_notes_model");
const logger = require("../../utils/logger");

// Obtener notas clínicas por ID de paciente
const obtenerNotasClinicasPorPaciente = async (req, res) => {
  try {
    const { patient_id } = req.params;

    // Validar patient_id
    const patientId = parseInt(patient_id);
    if (!patientId || patientId <= 0) {
      return res.status(400).json({
        success: false,
        error: "ID de paciente inválido",
      });
    }

    const notasClinicas = await getClinicalNotesByPatientId(req.db, patientId);

    res.json({
      success: true,
      total: notasClinicas.length,
      data: notasClinicas,
    });
  } catch (err) {
    logger.error("Error al obtener notas clínicas:", err.message);
    res.status(500).json({
      success: false,
      error: "Error al obtener las notas clínicas",
    });
  }
};

// Crear nueva nota clínica
const crearNotaClinica = async (req, res) => {
  try {
    const { patient_id, title, content, session_id } = req.body;

    // Validar campos obligatorios
    if (!patient_id || !title || !content) {
      return res.status(400).json({
        success: false,
        error: "Campos obligatorios faltantes",
        required_fields: ["patient_id", "title", "content"],
      });
    }

    // Validar que patient_id sea un número válido
    if (!Number.isInteger(patient_id) || patient_id <= 0) {
      return res.status(400).json({
        success: false,
        error: "patient_id debe ser un número entero positivo",
      });
    }

    // Validar título (longitud mínima y máxima)
    if (title.trim().length < 3 || title.trim().length > 255) {
      return res.status(400).json({
        success: false,
        error: "El título debe tener entre 3 y 255 caracteres",
      });
    }

    // Validar contenido (longitud mínima)
    if (content.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: "El contenido debe tener al menos 10 caracteres",
      });
    }

    // Validar session_id si se proporciona
    if (session_id && (!Number.isInteger(session_id) || session_id <= 0)) {
      return res.status(400).json({
        success: false,
        error: "session_id debe ser un número entero positivo",
      });
    }

    const nuevaNotaClinica = await createClinicalNote(req.db, {
      patient_id,
      title: title.trim(),
      content: content.trim(),
      session_id,
    });

    res.status(201).json({
      success: true,
      message: "Nota clínica creada exitosamente",
      data: nuevaNotaClinica,
    });
  } catch (err) {
    logger.error("Error al crear nota clínica:", err.message);

    // Manejar errores específicos de base de datos
    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(404).json({
        success: false,
        error: "Paciente no encontrado",
      });
    }

    res.status(500).json({
      success: false,
      error: "Error al crear la nota clínica",
    });
  }
};

// Actualizar nota clínica
const actualizarNotaClinica = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    // Validar ID
    const noteId = parseInt(id);
    if (!noteId || noteId <= 0) {
      return res.status(400).json({
        success: false,
        error: "ID de nota clínica inválido",
      });
    }

    // Construir objeto con solo los campos que se envían
    const updateData = {};

    if (title !== undefined) {
      if (title.trim().length < 3 || title.trim().length > 255) {
        return res.status(400).json({
          success: false,
          error: "El título debe tener entre 3 y 255 caracteres",
        });
      }
      updateData.title = title.trim();
    }

    if (content !== undefined) {
      if (content.trim().length < 10) {
        return res.status(400).json({
          success: false,
          error: "El contenido debe tener al menos 10 caracteres",
        });
      }
      updateData.content = content.trim();
    }

    // Verificar que se envió al menos un campo para actualizar
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No se proporcionaron campos para actualizar",
      });
    }

    const notaActualizada = await updateClinicalNote(req.db, noteId, updateData);

    if (!notaActualizada) {
      return res.status(404).json({
        success: false,
        error: "Nota clínica no encontrada",
      });
    }

    res.json({
      success: true,
      message: "Nota clínica actualizada exitosamente",
      data: notaActualizada,
    });
  } catch (err) {
    logger.error("Error al actualizar nota clínica:", err.message);
    res.status(500).json({
      success: false,
      error: "Error al actualizar la nota clínica",
    });
  }
};

// Eliminar nota clínica
const eliminarNotaClinica = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar ID
    const noteId = parseInt(id);
    if (!noteId || noteId <= 0) {
      return res.status(400).json({
        success: false,
        error: "ID de nota clínica inválido",
      });
    }

    await deleteClinicalNote(req.db, noteId);

    res.json({
      success: true,
      message: "Nota clínica eliminada exitosamente",
    });
  } catch (err) {
    logger.error("Error al eliminar nota clínica:", err.message);

    if (err.message === "Nota clínica no encontrada") {
      return res.status(404).json({
        success: false,
        error: "Nota clínica no encontrada",
      });
    }

    res.status(500).json({
      success: false,
      error: "Error al eliminar la nota clínica",
    });
  }
};

module.exports = {
  obtenerNotasClinicasPorPaciente,
  crearNotaClinica,
  actualizarNotaClinica,
  eliminarNotaClinica,
};