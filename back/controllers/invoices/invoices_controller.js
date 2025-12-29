const { getInvoicesKPIs, getPendingInvoices, getPendingInvoicesOfClinics, createInvoice, createInvoiceOfClinics, getIssuedInvoices, getIssuedInvoicesOfClinics, getLastInvoiceNumber } = require("../../models/invoices/invoice_model");
const logger = require("../../utils/logger");

// Obtener KPIs de facturación
const obtenerKPIsFacturacion = async (req, res) => {
  try {
    const { month, year } = req.query;

    // Validar parámetros si se envían
    if (month && (isNaN(parseInt(month)) || parseInt(month) < 1 || parseInt(month) > 12)) {
      return res.status(400).json({
        success: false,
        error: "El mes debe ser un número entre 1 y 12"
      });
    }

    if (year && (isNaN(parseInt(year)) || parseInt(year) < 2000)) {
      return res.status(400).json({
        success: false,
        error: "El año debe ser un número válido mayor a 2000"
      });
    }

    const filters = {};
    if (month) filters.month = parseInt(month);
    if (year) filters.year = parseInt(year);

    const kpis = await getInvoicesKPIs(req.db, filters);

    res.json({
      success: true,
      data: kpis
    });
  } catch (err) {
    logger.error("Error al obtener KPIs de facturación:", err.message);
    res.status(500).json({
      success: false,
      error: "Error al obtener los KPIs de facturación"
    });
  }
};

// Obtener sesiones pendientes de facturar
const obtenerFacturasPendientes = async (req, res) => {
  try {
    const { month, year } = req.query;

    // Validar parámetros si se envían
    if (month && (isNaN(parseInt(month)) || parseInt(month) < 1 || parseInt(month) > 12)) {
      return res.status(400).json({
        success: false,
        error: "El mes debe ser un número entre 1 y 12"
      });
    }

    if (year && (isNaN(parseInt(year)) || parseInt(year) < 2000)) {
      return res.status(400).json({
        success: false,
        error: "El año debe ser un número válido mayor a 2000"
      });
    }

    const filters = {};
    if (month) filters.month = parseInt(month);
    if (year) filters.year = parseInt(year);

    const pendingData = await getPendingInvoices(req.db, filters);

    res.json({
      success: true,
      data: pendingData
    });
  } catch (err) {
    logger.error("Error al obtener facturas pendientes:", err.message);
    res.status(500).json({
      success: false,
      error: "Error al obtener las facturas pendientes"
    });
  }
};

// Obtener facturas pendientes de clínicas (clínicas facturables)
const obtenerFacturasPendientesClinicas = async (req, res) => {
  try {
    const { month, year } = req.query;

    // Validar parámetros si se envían
    if (month && (isNaN(parseInt(month)) || parseInt(month) < 1 || parseInt(month) > 12)) {
      return res.status(400).json({
        success: false,
        error: "El mes debe ser un número entre 1 y 12"
      });
    }

    if (year && (isNaN(parseInt(year)) || parseInt(year) < 2000)) {
      return res.status(400).json({
        success: false,
        error: "El año debe ser un número válido mayor a 2000"
      });
    }

    const filters = {};
    if (month) filters.month = parseInt(month);
    if (year) filters.year = parseInt(year);

    const pendingClinicsData = await getPendingInvoicesOfClinics(req.db, filters);

    res.json({
      success: true,
      data: pendingClinicsData
    });
  } catch (err) {
    logger.error("Error al obtener facturas pendientes de clínicas:", err.message);
    res.status(500).json({
      success: false,
      error: "Error al obtener las facturas pendientes de clínicas"
    });
  }
};

// Generar factura (individual o múltiple)
const generarFactura = async (req, res) => {
  try {
    const data = req.body;

    // Detectar si es un array o un objeto individual
    const isArray = Array.isArray(data);
    const invoices = isArray ? data : [data];

    // Validar que hay al menos una factura
    if (invoices.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Debe proporcionar al menos una factura"
      });
    }

    // Validar formato de fecha (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    // Validar cada factura
    const errors = [];
    invoices.forEach((invoice, index) => {
      const {
        invoice_number,
        invoice_date,
        patient_id,
        session_ids,
        concept
      } = invoice;

      const position = isArray ? `[${index}]` : '';

      if (!invoice_number || !invoice_date || !patient_id || !session_ids || !concept) {
        errors.push(`Factura${position}: Faltan campos obligatorios (invoice_number, invoice_date, patient_id, session_ids, concept)`);
      }

      if (session_ids && (!Array.isArray(session_ids) || session_ids.length === 0)) {
        errors.push(`Factura${position}: session_ids debe ser un array con al menos un ID`);
      }

      if (invoice_date && !dateRegex.test(invoice_date)) {
        errors.push(`Factura${position}: El formato de invoice_date debe ser YYYY-MM-DD`);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Errores de validación",
        details: errors
      });
    }

    // Procesar todas las facturas
    const results = [];
    const failedInvoices = [];

    for (let i = 0; i < invoices.length; i++) {
      const {
        invoice_number,
        invoice_date,
        patient_id,
        session_ids,
        concept
      } = invoices[i];

      try {
        const invoiceData = {
          invoice_number,
          invoice_date,
          patient_id: parseInt(patient_id),
          session_ids: session_ids.map(id => parseInt(id)),
          concept
        };

        const result = await createInvoice(req.db, invoiceData);
        results.push({
          invoice_number,
          success: true,
          data: result
        });
      } catch (err) {
        failedInvoices.push({
          invoice_number,
          success: false,
          error: err.message.includes('Duplicate entry') && err.message.includes('invoice_number')
            ? "El número de factura ya existe"
            : err.message
        });
      }
    }

    // Respuesta para factura individual
    if (!isArray) {
      if (results.length > 0) {
        return res.status(201).json({
          success: true,
          message: `Factura ${results[0].invoice_number} generada exitosamente`,
          data: results[0].data
        });
      } else {
        return res.status(500).json({
          success: false,
          error: failedInvoices[0].error
        });
      }
    }

    // Respuesta para múltiples facturas
    const allSuccess = failedInvoices.length === 0;
    const partialSuccess = results.length > 0 && failedInvoices.length > 0;

    res.status(allSuccess ? 201 : (partialSuccess ? 207 : 500)).json({
      success: allSuccess,
      message: allSuccess
        ? `${results.length} factura(s) generada(s) exitosamente`
        : partialSuccess
        ? `${results.length} factura(s) generada(s), ${failedInvoices.length} fallida(s)`
        : `Todas las facturas fallaron`,
      data: {
        successful: results,
        failed: failedInvoices,
        summary: {
          total: invoices.length,
          successful: results.length,
          failed: failedInvoices.length
        }
      }
    });
  } catch (err) {
    logger.error("Error al generar factura:", err.message);
    res.status(500).json({
      success: false,
      error: err.message || "Error al generar la factura"
    });
  }
};

// Generar factura de clínica (factura todas las sesiones pendientes de una clínica)
const generarFacturaClinica = async (req, res) => {
  try {
    const {
      clinic_id,
      invoice_number,
      invoice_date,
      concept,
      total,
      month,
      year
    } = req.body;

    // Validar campos obligatorios
    if (!clinic_id || !invoice_number || !invoice_date || !concept || total === undefined || !month || !year) {
      return res.status(400).json({
        success: false,
        error: "Faltan campos obligatorios: clinic_id, invoice_number, invoice_date, concept, total, month, year"
      });
    }

    // Validar formato de fecha (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(invoice_date)) {
      return res.status(400).json({
        success: false,
        error: "El formato de invoice_date debe ser YYYY-MM-DD"
      });
    }

    // Validar mes y año
    if (isNaN(parseInt(month)) || parseInt(month) < 1 || parseInt(month) > 12) {
      return res.status(400).json({
        success: false,
        error: "El mes debe ser un número entre 1 y 12"
      });
    }

    if (isNaN(parseInt(year)) || parseInt(year) < 2000) {
      return res.status(400).json({
        success: false,
        error: "El año debe ser un número válido mayor a 2000"
      });
    }

    // Validar que total sea un número
    if (isNaN(parseFloat(total))) {
      return res.status(400).json({
        success: false,
        error: "El total debe ser un número válido"
      });
    }

    const invoiceData = {
      clinic_id: parseInt(clinic_id),
      invoice_number,
      invoice_date,
      concept,
      total: parseFloat(total),
      month: parseInt(month),
      year: parseInt(year)
    };

    const result = await createInvoiceOfClinics(req.db, invoiceData);

    res.status(201).json({
      success: true,
      message: `Factura ${invoice_number} generada exitosamente para la clínica`,
      data: result
    });
  } catch (err) {
    logger.error("Error al generar factura de clínica:", err.message);
    res.status(500).json({
      success: false,
      error: err.message.includes('Duplicate entry') && err.message.includes('invoice_number')
        ? "El número de factura ya existe"
        : err.message || "Error al generar la factura de clínica"
    });
  }
};

// Obtener facturas emitidas
const obtenerFacturasEmitidas = async (req, res) => {
  try {
    const { month, year } = req.query;

    // Validar parámetros si se envían
    if (month && (isNaN(parseInt(month)) || parseInt(month) < 1 || parseInt(month) > 12)) {
      return res.status(400).json({
        success: false,
        error: "El mes debe ser un número entre 1 y 12"
      });
    }

    if (year && (isNaN(parseInt(year)) || parseInt(year) < 2000)) {
      return res.status(400).json({
        success: false,
        error: "El año debe ser un número válido mayor a 2000"
      });
    }

    const filters = {};
    if (month) filters.month = parseInt(month);
    if (year) filters.year = parseInt(year);

    const invoicesData = await getIssuedInvoices(req.db, filters);

    res.json({
      success: true,
      data: invoicesData
    });
  } catch (err) {
    logger.error("Error al obtener facturas emitidas:", err.message);
    res.status(500).json({
      success: false,
      error: "Error al obtener las facturas emitidas"
    });
  }
};

// Obtener el último número de factura del año especificado
const obtenerUltimoNumeroFactura = async (req, res) => {
  try {
    const { year } = req.query;

    // Validar que el año sea obligatorio
    if (!year) {
      return res.status(400).json({
        success: false,
        error: "El parámetro 'year' es obligatorio"
      });
    }

    // Validar formato del año
    if (isNaN(parseInt(year)) || parseInt(year) < 2000) {
      return res.status(400).json({
        success: false,
        error: "El año debe ser un número válido mayor a 2000"
      });
    }

    const lastNumber = await getLastInvoiceNumber(req.db, parseInt(year));

    res.json({
      success: true,
      data: {
        year: parseInt(year),
        last_invoice_number: lastNumber
      }
    });
  } catch (err) {
    logger.error("Error al obtener último número de factura:", err.message);
    res.status(500).json({
      success: false,
      error: "Error al obtener el último número de factura"
    });
  }
};

const obtenerFacturasEmitidasClinicas = async (req, res) => {
  try {
    const { month, year } = req.query;

    // Validar parámetros si se envían
    if (month && (isNaN(parseInt(month)) || parseInt(month) < 1 || parseInt(month) > 12)) {
      return res.status(400).json({
        success: false,
        error: "El mes debe ser un número entre 1 y 12"
      });
    }

    if (year && (isNaN(parseInt(year)) || parseInt(year) < 2000)) {
      return res.status(400).json({
        success: false,
        error: "El año debe ser un número válido mayor a 2000"
      });
    }

    const filters = {};
    if (month) filters.month = parseInt(month);
    if (year) filters.year = parseInt(year);

    const invoicesData = await getIssuedInvoicesOfClinics(req.db, filters);

    res.json({
      success: true,
      data: invoicesData
    });
  } catch (err) {
    logger.error("Error al obtener facturas emitidas de clínicas:", err.message);
    res.status(500).json({
      success: false,
      error: "Error al obtener las facturas emitidas de clínicas"
    });
  }
};

module.exports = {
  obtenerKPIsFacturacion,
  obtenerFacturasPendientes,
  obtenerFacturasPendientesClinicas,
  generarFactura,
  generarFacturaClinica,
  obtenerFacturasEmitidas,
  obtenerFacturasEmitidasClinicas,
  obtenerUltimoNumeroFactura
};
