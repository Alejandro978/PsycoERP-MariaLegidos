const ExcelJS = require("exceljs");

// Paleta de colores corporativos
const COLORS = {
    primary: "FF6AA591",        // Verde principal
    primaryDark: "FF4A8571",    // Verde oscuro para hover/bordes
    primaryLight: "FF8BBAA7",   // Verde claro para alternado
    primaryVeryLight: "FFE8F3EF", // Verde muy claro para filas alternadas
    white: "FFFFFFFF",          // Blanco
    text: "FF2D3748",           // Texto oscuro
    border: "FFCBD5E0",         // Borde suave
    yellow: "FFFBBF24",         // Amarillo para totales
    yellowLight: "FFFEF3C7",    // Amarillo claro
};

/**
 * Genera un archivo Excel con las sesiones filtradas
 * @param {Array} sessions - Array de sesiones de la BD
 * @returns {Promise<Buffer>} Buffer del archivo Excel
 */
const generateSessionsExcel = async (sessions) => {
    // Crear nuevo workbook
    const workbook = new ExcelJS.Workbook();

    // Metadata del archivo
    workbook.creator = "PsycoERP";
    workbook.created = new Date();
    workbook.modified = new Date();

    // Crear hoja con zoom al 140%
    const worksheet = workbook.addWorksheet("Sesiones", {
        properties: { tabColor: { argb: COLORS.primary } },
        views: [{
            state: "frozen",
            xSplit: 0,
            ySplit: 1,           // Congelar primera fila
            zoomScale: 140,      // Zoom al 140%
            zoomScaleNormal: 140
        }],
    });

    // Definir columnas con anchos optimizados
    worksheet.columns = [
        { header: "Paciente", key: "patient_name", width: 32 },
        { header: "Tipo", key: "mode", width: 18 },
        { header: "Fecha", key: "session_date", width: 14 },
        { header: "Clínica", key: "clinic_name", width: 28 },
        { header: "Estado", key: "status", width: 16 },
        { header: "Precio", key: "price", width: 13 },
        { header: "Comisión", key: "commission", width: 13 },
        { header: "Neto", key: "net_price", width: 13 },
        { header: "Pago", key: "payment_method", width: 18 },
    ];

    // Estilo del encabezado con colores corporativos
    const headerRow = worksheet.getRow(1);
    headerRow.font = {
        bold: true,
        color: { argb: COLORS.white },
        size: 13,
        name: "Calibri"
    };
    headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COLORS.primary },
    };
    headerRow.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: false
    };
    headerRow.height = 35;

    // Bordes del encabezado
    headerRow.eachCell((cell) => {
        cell.border = {
            top: { style: "medium", color: { argb: COLORS.primaryDark } },
            left: { style: "thin", color: { argb: COLORS.primaryDark } },
            bottom: { style: "medium", color: { argb: COLORS.primaryDark } },
            right: { style: "thin", color: { argb: COLORS.primaryDark } },
        };
    });

    // Agregar datos
    sessions.forEach((session) => {
        worksheet.addRow({
            patient_name: session.patient_name,
            mode: session.mode,
            session_date: session.session_date,
            clinic_name: session.clinic_name,
            status: session.status,
            price: session.price,
            commission: session.commission,
            net_price: session.net_price,
            payment_method: session.payment_method,
        });
    });

    // Aplicar estilos a las filas de datos
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
            // Alternar colores de fila con paleta corporativa
            if (rowNumber % 2 === 0) {
                row.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: COLORS.primaryVeryLight },
                };
            }

            // Fuente y altura de fila
            row.font = {
                name: "Calibri",
                size: 11,
                color: { argb: COLORS.text }
            };
            row.height = 25;

            // Alineación general
            row.alignment = { vertical: "middle" };

            // Alineación específica por columna
            row.getCell(1).alignment = { vertical: "middle", horizontal: "left", indent: 1 }; // Paciente
            row.getCell(2).alignment = { vertical: "middle", horizontal: "center" }; // Tipo
            row.getCell(3).alignment = { vertical: "middle", horizontal: "center" }; // Fecha
            row.getCell(4).alignment = { vertical: "middle", horizontal: "left", indent: 1 }; // Clínica
            row.getCell(5).alignment = { vertical: "middle", horizontal: "center" }; // Estado
            row.getCell(6).alignment = { vertical: "middle", horizontal: "right", indent: 1 }; // Precio
            row.getCell(7).alignment = { vertical: "middle", horizontal: "right", indent: 1 }; // Comisión
            row.getCell(8).alignment = { vertical: "middle", horizontal: "right", indent: 1 }; // Neto
            row.getCell(9).alignment = { vertical: "middle", horizontal: "center" }; // Pago

            // Formato de moneda para columnas numéricas
            row.getCell(6).numFmt = '#,##0.00" €"'; // Precio
            row.getCell(7).numFmt = '#,##0.00" €"'; // Comisión
            row.getCell(8).numFmt = '#,##0.00" €"'; // Neto

            // Bordes suaves para todas las celdas
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: "thin", color: { argb: COLORS.border } },
                    left: { style: "thin", color: { argb: COLORS.border } },
                    bottom: { style: "thin", color: { argb: COLORS.border } },
                    right: { style: "thin", color: { argb: COLORS.border } },
                };
            });
        }
    });

    // Calcular totales
    const totalPrice = sessions.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);
    const totalCommission = sessions.reduce((sum, s) => sum + (parseFloat(s.commission) || 0), 0);
    const totalNetPrice = sessions.reduce((sum, s) => sum + (parseFloat(s.net_price) || 0), 0);

    // Agregar fila de totales al final con estilo enriquecido
    const totalRow = worksheet.addRow({
        patient_name: "TOTAL",
        mode: "",
        session_date: "",
        clinic_name: "",
        status: "",
        price: totalPrice,
        commission: totalCommission,
        net_price: totalNetPrice,
        payment_method: `${sessions.length} sesiones`,
    });

    // Estilo de la fila de totales
    totalRow.font = {
        bold: true,
        size: 12,
        color: { argb: COLORS.text },
        name: "Calibri"
    };
    totalRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COLORS.yellowLight },
    };
    totalRow.height = 30;
    totalRow.alignment = { vertical: "middle" };

    // Formato de moneda para totales
    totalRow.getCell(6).numFmt = '#,##0.00" €"';
    totalRow.getCell(7).numFmt = '#,##0.00" €"';
    totalRow.getCell(8).numFmt = '#,##0.00" €"';

    // Alineación específica de totales
    totalRow.getCell(1).alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    totalRow.getCell(1).font = { bold: true, size: 13, color: { argb: COLORS.text } };
    totalRow.getCell(6).alignment = { vertical: "middle", horizontal: "right", indent: 1 };
    totalRow.getCell(7).alignment = { vertical: "middle", horizontal: "right", indent: 1 };
    totalRow.getCell(8).alignment = { vertical: "middle", horizontal: "right", indent: 1 };
    totalRow.getCell(9).alignment = { vertical: "middle", horizontal: "center" };
    totalRow.getCell(9).font = { bold: true, size: 11, italic: true, color: { argb: COLORS.text } };

    // Bordes destacados para fila de totales
    totalRow.eachCell((cell) => {
        cell.border = {
            top: { style: "double", color: { argb: COLORS.yellow } },
            left: { style: "thin", color: { argb: COLORS.border } },
            bottom: { style: "double", color: { argb: COLORS.yellow } },
            right: { style: "thin", color: { argb: COLORS.border } },
        };
    });

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
};

module.exports = {
    generateSessionsExcel,
};
