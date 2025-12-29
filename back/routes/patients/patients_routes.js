const express = require("express");
const router = express.Router();

const {
  obtenerPacientes,
  obtenerPacientePorId,
  obtenerPacientesInactivos,
  eliminarPaciente,
  crearPaciente,
  restaurarPaciente,
  actualizarPaciente,
  obtenerPacientesActivosConClinica,
} = require("../../controllers/patients/patients_controller");

router.get("/", obtenerPacientes);
router.post("/", crearPaciente);
router.get("/active-with-clinic", obtenerPacientesActivosConClinica);
router.get("/inactive", obtenerPacientesInactivos);
router.get("/:id", obtenerPacientePorId);
router.put("/:id", actualizarPaciente);
router.put("/:id/restore", restaurarPaciente);
router.delete("/:id", eliminarPaciente);

module.exports = router;