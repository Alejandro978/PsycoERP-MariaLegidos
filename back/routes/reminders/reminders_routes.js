const express = require("express");
const router = express.Router();

const {
  obtenerRecordatoriosPendientes,
  crearRecordatorio,
} = require("../../controllers/reminders/reminders_controller");

router.get("/pending", obtenerRecordatoriosPendientes);
router.post("/", crearRecordatorio);

module.exports = router;