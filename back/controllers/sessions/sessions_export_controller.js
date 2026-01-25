const { getSessionsForExport } = require("../../models/sessions/sessions_model");
const { generateSessionsExcel } = require("../../services/excel/sessions_excel_service");

/**
 * Exporta sesiones filtradas a Excel
 * POST /api/sessions/export
 * @param {Object} req.body - Filtros opcionales: { clinic_id, status, payment_method, fecha_desde, fecha_hasta }
 */
const exportarSesionesExcel = async (req, res) => {
    try {
        const { clinic_id, status, payment_method, fecha_desde, fecha_hasta } = req.body;

        // Construir filtros
        const filters = {};

        // Validar y parsear clinic_id como array de integers
        if (clinic_id) {
            // Si es array, mapear a integers
            if (Array.isArray(clinic_id)) {
                filters.clinic_ids = clinic_id.map(id => parseInt(id)).filter(id => !isNaN(id));
            } else {
                // Si es un solo valor, convertir a array de 1 elemento
                const parsedId = parseInt(clinic_id);
                if (!isNaN(parsedId)) {
                    filters.clinic_ids = [parsedId];
                }
            }

            // Solo aplicar filtro si hay IDs válidos
            if (!filters.clinic_ids || filters.clinic_ids.length === 0) {
                delete filters.clinic_ids;
            }
        }

        // Filtro por estado
        if (status) {
            filters.status = status;
        }

        // Filtro por método de pago
        if (payment_method) {
            filters.payment_method = payment_method;
        }

        // Filtros de fechas
        if (fecha_desde) {
            filters.fecha_desde = fecha_desde;
        }

        if (fecha_hasta) {
            filters.fecha_hasta = fecha_hasta;
        }

        // Obtener sesiones de la BD
        const sessions = await getSessionsForExport(req.db, filters);

        // Validar que hay datos
        if (!sessions || sessions.length === 0) {
            return res.status(404).json({
                success: false,
                error: "No se encontraron sesiones con los filtros especificados",
            });
        }

        // Generar Excel
        const excelBuffer = await generateSessionsExcel(sessions);

        // Generar nombre de archivo con timestamp
        const timestamp = new Date().toISOString().split("T")[0]; // 2026-01-25
        const filename = `sesiones_${timestamp}.xlsx`;

        // Configurar headers para descarga
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Content-Length", excelBuffer.length);

        // Enviar archivo
        res.send(excelBuffer);
    } catch (err) {
        res.status(500).json({
            success: false,
            error: "Error al generar el archivo Excel",
        });
    }
};

module.exports = {
    exportarSesionesExcel,
};
