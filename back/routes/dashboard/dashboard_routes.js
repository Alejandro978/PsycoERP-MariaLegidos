const express = require("express");
const router = express.Router();

const {
  obtenerDashboardKPIs,
} = require("../../controllers/dashboard/dashboard_controller");

router.get("/kpis", obtenerDashboardKPIs);

module.exports = router;