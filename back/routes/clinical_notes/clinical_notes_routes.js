const express = require("express");
const router = express.Router();

const {
  obtenerNotasClinicasPorPaciente,
  crearNotaClinica,
  actualizarNotaClinica,
  eliminarNotaClinica,
} = require("../../controllers/clinical_notes/clinical_notes_controller");

// Obtener notas clínicas por ID de paciente
router.get("/patient/:patient_id", obtenerNotasClinicasPorPaciente);

// Crear nueva nota clínica
router.post("/", crearNotaClinica);

// Actualizar nota clínica
router.put("/:id", actualizarNotaClinica);

// Eliminar nota clínica
router.delete("/:id", eliminarNotaClinica);

module.exports = router;