const express = require("express");
const router = express.Router();

const { obtenerKPIsFacturacion, obtenerFacturasPendientes, obtenerFacturasPendientesClinicas, generarFactura, generarFacturaClinica, obtenerFacturasEmitidas, obtenerFacturasEmitidasClinicas, obtenerUltimoNumeroFactura } = require("../../controllers/invoices/invoices_controller");

// GET /api/invoices/kpis - Obtener KPIs de facturación
router.get("/kpis", obtenerKPIsFacturacion);

// GET /api/invoices/pending - Obtener sesiones pendientes de facturar
router.get("/pending", obtenerFacturasPendientes);

// GET /api/invoices/pending-of-clinics - Obtener facturas pendientes de clínicas
router.get("/pending-of-clinics", obtenerFacturasPendientesClinicas);

// GET /api/invoices/last-number - Obtener último número de factura del año
router.get("/last-number", obtenerUltimoNumeroFactura);

// GET /api/invoices - Obtener facturas emitidas
router.get("/", obtenerFacturasEmitidas);

// POST /api/invoices - Generar factura
router.post("/", generarFactura);

// POST /api/invoices/of-clinics - Generar factura de clínica
router.post("/of-clinics", generarFacturaClinica);

// GET /api/invoices/of-clinics - Obtener facturas emitidas de clínicas
router.get("/of-clinics", obtenerFacturasEmitidasClinicas);

module.exports = router;
