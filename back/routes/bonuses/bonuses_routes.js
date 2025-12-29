const express = require("express");
const router = express.Router();

const {
  obtenerBonuses,
  obtenerBonusesPorPaciente,
  obtenerHistorialBonus,
  registrarSesionBonus,
  crearBonus,
} = require("../../controllers/bonuses/bonuses_controller");

router.get("/", obtenerBonuses);
router.get("/patient/:patient_id", obtenerBonusesPorPaciente);
router.get("/:id/history", obtenerHistorialBonus);
router.post("/:id/use-session", registrarSesionBonus);
router.post("/", crearBonus);

module.exports = router;