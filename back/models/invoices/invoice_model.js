// Obtener KPIs de facturación con filtros opcionales de mes/año
const getInvoicesKPIs = async (db, filters = {}) => {
  const { month, year } = filters;

  // Por defecto usar mes y año actual si no se especifican
  const currentDate = new Date();
  const targetMonth = month || (currentDate.getMonth() + 1);
  const targetYear = year || currentDate.getFullYear();

  // ============================================
  // CARD 1: Total de facturas emitidas (histórico)
  // ============================================
  const [totalInvoicesResult] = await db.execute(
    `SELECT COUNT(*) as total_invoices FROM invoices WHERE is_active = true`
  );
  const totalInvoices = parseInt(totalInvoicesResult[0].total_invoices) || 0;

  // ============================================
  // CARD 2: Total facturado bruto (histórico)
  // ============================================
  const [totalGrossResult] = await db.execute(
    `SELECT COALESCE(SUM(s.price), 0) as total_gross
     FROM sessions s
     INNER JOIN clinics c ON s.clinic_id = c.id AND c.is_active = true
     WHERE s.is_active = true`
  );
  const totalGrossHistoric = parseFloat(totalGrossResult[0].total_gross) || 0;

  // ============================================
  // CARD 3: Total facturado bruto (filtrado por mes/año)
  // ============================================
  const [totalGrossFilteredResult] = await db.execute(
    `SELECT COALESCE(SUM(s.price), 0) as total_gross_filtered
     FROM sessions s
     INNER JOIN clinics c ON s.clinic_id = c.id AND c.is_active = true
     WHERE s.is_active = true
       AND MONTH(s.session_date) = ?
       AND YEAR(s.session_date) = ?`,
    [targetMonth, targetYear]
  );
  const totalGrossFiltered = parseFloat(totalGrossFilteredResult[0].total_gross_filtered) || 0;

  // ============================================
  // CARD 4: Total facturado NETO (filtrado por mes/año)
  // Calculado con: sessions.price * (clinics.percentage / 100)
  // ============================================
  const [totalNetFilteredResult] = await db.execute(
    `SELECT COALESCE(SUM(s.price * (c.percentage / 100)), 0) as total_net_filtered
     FROM sessions s
     INNER JOIN clinics c ON s.clinic_id = c.id AND c.is_active = true
     WHERE s.is_active = true
       AND MONTH(s.session_date) = ?
       AND YEAR(s.session_date) = ?`,
    [targetMonth, targetYear]
  );
  const totalNetFiltered = parseFloat(totalNetFilteredResult[0].total_net_filtered) || 0;

  // ============================================
  // CARD 5: Total facturado NETO por clínica (filtrado por mes/año)
  // ============================================
  const [totalNetByClinicResult] = await db.execute(
    `SELECT
       c.name as clinic_name,
       c.percentage as clinic_percentage,
       COUNT(s.id) as total_sessions,
       COALESCE(SUM(s.price), 0) as total_gross,
       COALESCE(SUM(s.price * (c.percentage / 100)), 0) as total_net
     FROM clinics c
     LEFT JOIN sessions s ON s.clinic_id = c.id
       AND s.is_active = true
       AND MONTH(s.session_date) = ?
       AND YEAR(s.session_date) = ?
     WHERE c.is_active = true
     GROUP BY c.id, c.name, c.percentage
     ORDER BY total_net DESC`,
    [targetMonth, targetYear]
  );

  const totalNetByClinic = totalNetByClinicResult.map(row => ({
    clinic_name: row.clinic_name,
    total_sessions: parseInt(row.total_sessions) || 0,
    total_gross: parseFloat(row.total_gross) || 0,
    clinic_percentage: parseFloat(row.clinic_percentage) || 0,
    total_net: parseFloat(row.total_net) || 0
  }));

  return {
    filters_applied: {
      month: targetMonth,
      year: targetYear
    },
    card1_total_invoices_issued: totalInvoices,
    card2_total_gross_historic: parseFloat(totalGrossHistoric.toFixed(2)),
    card3_total_gross_filtered: parseFloat(totalGrossFiltered.toFixed(2)),
    card4_total_net_filtered: parseFloat(totalNetFiltered.toFixed(2)),
    card5_total_net_by_clinic: totalNetByClinic
  };
};

// Obtener sesiones pendientes de facturar agrupadas por paciente
const getPendingInvoices = async (db, filters = {}) => {
  const { month, year } = filters;

  // Por defecto usar mes y año actual si no se especifican
  const currentDate = new Date();
  const targetMonth = month || (currentDate.getMonth() + 1);
  const targetYear = year || currentDate.getFullYear();

  // Obtener pacientes con sesiones pendientes y detalles de sesiones en una sola query
  const [pendingSessionsResult] = await db.execute(
    `SELECT
       p.id as patient_id,
       CONCAT(p.first_name, ' ', p.last_name) as patient_full_name,
       p.dni,
       p.email,
       CONCAT_WS(' ', p.street, p.street_number, p.door) as patient_address_line1,
       CONCAT_WS(' ', p.city, p.postal_code) as patient_address_line2,
       c.name as clinic_name,
       COUNT(s.id) as pending_sessions_count,
       COALESCE(SUM(s.price), 0) as total_gross,
       JSON_ARRAYAGG(
         JSON_OBJECT(
           'session_id', s.id,
           'session_date', DATE_FORMAT(s.session_date, '%Y-%m-%d'),
           'price', s.price
         ) ORDER BY s.session_date ASC
       ) as sessions
     FROM patients p
     INNER JOIN sessions s ON s.patient_id = p.id
       AND s.is_active = true
       AND s.invoiced = 0
       AND s.payment_method != 'pendiente'
       AND MONTH(s.session_date) = ?
       AND YEAR(s.session_date) = ?
     INNER JOIN clinics c ON s.clinic_id = c.id AND c.is_active = true
     WHERE p.is_active = true AND c.is_billable = false
     GROUP BY p.id, p.first_name, p.last_name, p.dni, p.email, p.street, p.street_number, p.door, p.city, p.postal_code, c.name
     ORDER BY patient_full_name ASC`,
    [targetMonth, targetYear]
  );

  // Mapear resultados parseando el JSON de sesiones
  const pendingInvoices = pendingSessionsResult.map(row => ({
    patient_id: parseInt(row.patient_id),
    patient_full_name: row.patient_full_name,
    dni: row.dni || '',
    email: row.email || '',
    patient_address_line1: row.patient_address_line1 || '',
    patient_address_line2: row.patient_address_line2 || '',
    clinic_name: row.clinic_name,
    sessions: JSON.parse(row.sessions).map(session => ({
      session_id: parseInt(session.session_id),
      session_date: session.session_date,
      price: parseFloat(session.price)
    })),
    pending_sessions_count: parseInt(row.pending_sessions_count),
    total_gross: parseFloat(row.total_gross)
  }));

  return {
    filters_applied: {
      month: targetMonth,
      year: targetYear
    },
    pending_invoices: pendingInvoices
  };
};

// Generar factura y marcar sesiones como facturadas
const createInvoice = async (db, invoiceData) => {
  const {
    invoice_number,
    invoice_date,
    patient_id,
    session_ids,
    concept
  } = invoiceData;

  // Validar que existan sesiones
  if (!session_ids || session_ids.length === 0) {
    throw new Error('Debe proporcionar al menos una sesión para facturar');
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Obtener información de las sesiones a facturar
    const placeholders = session_ids.map(() => '?').join(',');
    const [sessionsData] = await connection.execute(
      `SELECT id, price, session_date
       FROM sessions
       WHERE id IN (${placeholders})
         AND is_active = true
         AND invoiced = 0`,
      session_ids
    );

    if (sessionsData.length === 0) {
      throw new Error('No se encontraron sesiones válidas para facturar');
    }

    if (sessionsData.length !== session_ids.length) {
      throw new Error('Algunas sesiones no están disponibles para facturar (ya facturadas o inactivas)');
    }

    // Calcular total (suma de precios de todas las sesiones)
    const total = sessionsData.reduce((sum, s) => sum + parseFloat(s.price), 0);

    // Extraer mes y año de la fecha de factura
    const invoiceDateObj = new Date(invoice_date);
    const month = invoiceDateObj.getMonth() + 1;
    const year = invoiceDateObj.getFullYear();

    // 2. Crear la factura
    const [invoiceResult] = await connection.execute(
      `INSERT INTO invoices
       (invoice_number, invoice_date, patient_id, concept, total, month, year)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [invoice_number, invoice_date, patient_id, concept, total, month, year]
    );

    const invoice_id = invoiceResult.insertId;

    // 3. Insertar relaciones en invoice_sessions
    const invoiceSessionsValues = session_ids.map(session_id => [invoice_id, session_id]);
    await connection.query(
      `INSERT INTO invoice_sessions (invoice_id, session_id) VALUES ?`,
      [invoiceSessionsValues]
    );

    // 4. Marcar sesiones como facturadas
    await connection.execute(
      `UPDATE sessions SET invoiced = 1 WHERE id IN (${placeholders})`,
      session_ids
    );

    await connection.commit();

    // Retornar la factura creada
    const [createdInvoice] = await connection.execute(
      `SELECT * FROM invoices WHERE id = ?`,
      [invoice_id]
    );

    return {
      invoice: createdInvoice[0],
      sessions_invoiced_count: sessionsData.length
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Obtener listado de facturas emitidas con filtros
const getIssuedInvoices = async (db, filters = {}) => {
  const { month, year } = filters;

  // Por defecto usar mes y año actual si no se especifican
  const currentDate = new Date();
  const targetMonth = month || (currentDate.getMonth() + 1);
  const targetYear = year || currentDate.getFullYear();

  // Primero obtenemos las facturas con información del paciente
  const [invoicesResult] = await db.execute(
    `SELECT
       i.id,
       i.invoice_number,
       i.invoice_date,
       i.patient_id,
       CONCAT(p.first_name, ' ', p.last_name) as patient_full_name,
       p.dni,
       p.email,
       CONCAT_WS(' ', p.street, p.street_number, p.door) as patient_address_line1,
       CONCAT_WS(' ', p.city, p.postal_code) as patient_address_line2,
       i.total,
       i.concept,
       i.month,
       i.year,
       i.created_at
     FROM invoices i
     INNER JOIN patients p ON i.patient_id = p.id AND p.is_active = true
     WHERE i.is_active = true
       AND i.month = ?
       AND i.year = ?
     ORDER BY i.invoice_date DESC, i.invoice_number DESC`,
    [targetMonth, targetYear]
  );

  // Para cada factura, obtener los detalles de las sesiones
  const invoices = await Promise.all(
    invoicesResult.map(async (row) => {
      const [sessionsDetails] = await db.execute(
        `SELECT
           s.id as session_id,
           DATE_FORMAT(s.session_date, '%Y-%m-%d') as session_date,
           s.price
         FROM invoice_sessions ist
         INNER JOIN sessions s ON ist.session_id = s.id AND s.is_active = true
         WHERE ist.invoice_id = ?
         ORDER BY s.session_date ASC`,
        [row.id]
      );

      // Formatear fecha a dd/mm/yyyy
      const date = new Date(row.invoice_date);
      const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

      return {
        id: parseInt(row.id),
        invoice_number: row.invoice_number,
        invoice_date: formattedDate,
        patient_id: parseInt(row.patient_id),
        patient_full_name: row.patient_full_name,
        dni: row.dni || '',
        email: row.email || '',
        patient_address_line1: row.patient_address_line1 || '',
        patient_address_line2: row.patient_address_line2 || '',
        sessions: sessionsDetails.map(session => ({
          session_id: parseInt(session.session_id),
          session_date: session.session_date,
          price: parseFloat(session.price)
        })),
        sessions_count: sessionsDetails.length,
        total: parseFloat(row.total) || 0,
        concept: row.concept || ''
      };
    })
  );

  return {
    filters_applied: {
      month: targetMonth,
      year: targetYear
    },
    total_invoices: invoices.length,
    invoices: invoices
  };
};

// Obtener el último número de factura del año especificado
const getLastInvoiceNumber = async (db, year) => {
  const [result] = await db.execute(
    `SELECT invoice_number
     FROM invoices
     WHERE is_active = true
       AND invoice_number LIKE ?
     ORDER BY CAST(SUBSTRING_INDEX(invoice_number, '-', -1) AS UNSIGNED) DESC
     LIMIT 1`,
    [`FAC-${year}-%`]
  );

  if (result.length === 0) {
    return 0;
  }

  // Extraer el número secuencial del formato FAC-YYYY-NNNN
  const invoiceNumber = result[0].invoice_number;
  const parts = invoiceNumber.split('-');

  if (parts.length === 3) {
    return parseInt(parts[2]) || 0;
  }

  return 0;
};

const getPendingInvoicesOfClinics = async (db, filters = {}) => {
  const { month, year } = filters;

  // Por defecto usar mes y año actual si no se especifican
  const currentDate = new Date();
  const targetMonth = month || (currentDate.getMonth() + 1);
  const targetYear = year || currentDate.getFullYear();

  // Obtener clínicas facturables con sesiones pendientes agrupadas por clínica con desglose por precio
  const [pendingClinicsResult] = await db.execute(
    `SELECT
       c.id as clinic_id,
       c.name as clinic_name,
       COUNT(s.id) as total_sessions,
       COALESCE(SUM(s.price * (c.percentage / 100)), 0) as total_net_clinic,
       JSON_ARRAYAGG(
         JSON_OBJECT(
           'unit_price', s.price * (c.percentage / 100),
           'sessions_count', sessions_by_price.sessions_count,
           'total_net', sessions_by_price.total_net
         ) ORDER BY s.price ASC
       ) as sessions_data
     FROM clinics c
     INNER JOIN sessions s ON s.clinic_id = c.id
       AND s.is_active = true
       AND s.invoiced = 0
       AND s.payment_method != 'pendiente'
       AND MONTH(s.session_date) = ?
       AND YEAR(s.session_date) = ?
     INNER JOIN (
       SELECT 
         clinic_id,
         price,
         COUNT(*) as sessions_count,
         COALESCE(SUM(price * (SELECT percentage FROM clinics WHERE id = clinic_id) / 100), 0) as total_net
       FROM sessions
       WHERE is_active = true
         AND invoiced = 0
         AND payment_method != 'pendiente'
         AND MONTH(session_date) = ?
         AND YEAR(session_date) = ?
       GROUP BY clinic_id, price
     ) as sessions_by_price ON sessions_by_price.clinic_id = c.id AND sessions_by_price.price = s.price
     WHERE c.is_active = true AND c.is_billable = true
     GROUP BY c.id, c.name
     ORDER BY clinic_name ASC`,
    [targetMonth, targetYear, targetMonth, targetYear]
  );

  // Mapear resultados parseando el JSON y eliminando duplicados
  const pendingInvoicesOfClinics = pendingClinicsResult.map(row => {
    // Parsear sessions_data y eliminar duplicados por unit_price
    const sessionsData = JSON.parse(row.sessions_data);
    const uniqueSessionsData = [];
    const seenPrices = new Set();

    sessionsData.forEach(session => {
      if (!seenPrices.has(session.unit_price)) {
        seenPrices.add(session.unit_price);
        uniqueSessionsData.push({
          unit_price: parseFloat(session.unit_price),
          sessions_count: parseInt(session.sessions_count),
          total_net: parseFloat(session.total_net)
        });
      }
    });

    return {
      clinic_id: parseInt(row.clinic_id),
      clinic_name: row.clinic_name,
      total_sessions: parseInt(row.total_sessions),
      total_net_clinic: parseFloat(row.total_net_clinic),
      sessions_data: uniqueSessionsData
    };
  });

  return pendingInvoicesOfClinics;
};

const createInvoiceOfClinics = async (db, invoiceData) => {
  const {
    clinic_id,
    invoice_number,
    invoice_date,
    concept,
    total,
    month,
    year
  } = invoiceData;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // VALIDACIÓN: Verificar que no exista ya una factura para esta clínica en este mes/año
    const [existingInvoice] = await connection.execute(
      `SELECT id, invoice_number FROM invoices 
       WHERE clinic_id = ? AND month = ? AND year = ? AND is_active = true`,
      [clinic_id, month, year]
    );

    if (existingInvoice.length > 0) {
      throw new Error(`Ya existe una factura para esta clínica en ${month}/${year} (Factura: ${existingInvoice[0].invoice_number})`);
    }

    // 1. Obtener sesiones pendientes de la clínica para el mes/año especificado
    const [sessionsData] = await connection.execute(
      `SELECT s.id, s.price, s.session_date
       FROM sessions s
       INNER JOIN clinics c ON s.clinic_id = c.id
       WHERE s.clinic_id = ?
         AND s.is_active = true
         AND s.invoiced = 0
         AND s.payment_method != 'pendiente'
         AND MONTH(s.session_date) = ?
         AND YEAR(s.session_date) = ?
         AND c.is_active = true
         AND c.is_billable = true`,
      [clinic_id, month, year]
    );

    if (sessionsData.length === 0) {
      throw new Error('No se encontraron sesiones pendientes para facturar en esta clínica');
    }

    // Extraer los session_ids para las operaciones posteriores
    const session_ids = sessionsData.map(s => s.id);

    // 2. Crear la factura (usando el total proporcionado por el front)
    const [invoiceResult] = await connection.execute(
      `INSERT INTO invoices
       (invoice_number, invoice_date, clinic_id, concept, total, month, year)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [invoice_number, invoice_date, clinic_id, concept, total, month, year]
    );

    const invoice_id = invoiceResult.insertId;

    // 3. Insertar relaciones en invoice_sessions
    const invoiceSessionsValues = session_ids.map(session_id => [invoice_id, session_id]);
    await connection.query(
      `INSERT INTO invoice_sessions (invoice_id, session_id) VALUES ?`,
      [invoiceSessionsValues]
    );

    // 4. Marcar sesiones como facturadas
    const placeholders = session_ids.map(() => '?').join(',');
    await connection.execute(
      `UPDATE sessions SET invoiced = 1 WHERE id IN (${placeholders})`,
      session_ids
    );

    await connection.commit();

    // Retornar la factura creada
    const [createdInvoice] = await connection.execute(
      `SELECT * FROM invoices WHERE id = ?`,
      [invoice_id]
    );

    return {
      invoice: createdInvoice[0],
      sessions_invoiced_count: sessionsData.length
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getIssuedInvoicesOfClinics = async (db, filters = {}) => {
  const { month, year } = filters;

  // Por defecto usar mes y año actual si no se especifican
  const currentDate = new Date();
  const targetMonth = month || (currentDate.getMonth() + 1);
  const targetYear = year || currentDate.getFullYear();

  // Obtener facturas de clínicas agrupadas por clínica con desglose de sesiones por precio
  const [invoicesResult] = await db.execute(
    `SELECT
       c.id as clinic_id,
       c.name as clinic_name,
       c.fiscal_name,
       c.cif,
       c.billing_address,
       GROUP_CONCAT(DISTINCT i.invoice_number ORDER BY i.invoice_date DESC) as invoice_numbers,
       MIN(i.invoice_date) as first_invoice_date,
       MAX(i.invoice_date) as last_invoice_date,
       GROUP_CONCAT(DISTINCT i.concept ORDER BY i.invoice_date DESC) as concepts,
       COUNT(DISTINCT i.id) as total_invoices,
       COALESCE(SUM(i.total), 0) as total_invoiced,
       JSON_ARRAYAGG(
         JSON_OBJECT(
           'unit_price', sessions_by_price.unit_price,
           'sessions_count', sessions_by_price.sessions_count,
           'total_net', sessions_by_price.total_net,
           'concept', sessions_by_price.concept
         ) ORDER BY sessions_by_price.unit_price ASC
       ) as sessions_data
     FROM clinics c
     INNER JOIN invoices i ON i.clinic_id = c.id
       AND i.is_active = true
       AND i.month = ?
       AND i.year = ?
     INNER JOIN (
       SELECT 
         i2.clinic_id,
         s.price * (c2.percentage / 100) as unit_price,
         COUNT(s.id) as sessions_count,
         COALESCE(SUM(s.price * (c2.percentage / 100)), 0) as total_net,
         CONCAT('(', COUNT(s.id), ') Sesión psicoterapia') as concept
       FROM invoices i2
       INNER JOIN invoice_sessions ist ON ist.invoice_id = i2.id
       INNER JOIN sessions s ON ist.session_id = s.id AND s.is_active = true
       INNER JOIN clinics c2 ON i2.clinic_id = c2.id AND c2.is_active = true
       WHERE i2.is_active = true
         AND i2.clinic_id IS NOT NULL
         AND i2.month = ?
         AND i2.year = ?
       GROUP BY i2.clinic_id, s.price, c2.percentage
     ) as sessions_by_price ON sessions_by_price.clinic_id = c.id
     WHERE c.is_active = true
     GROUP BY c.id, c.name, c.fiscal_name, c.cif, c.billing_address
     ORDER BY clinic_name ASC`,
    [targetMonth, targetYear, targetMonth, targetYear]
  );

  // Mapear resultados parseando el JSON y calculando totales
  const invoices = invoicesResult.map(row => {
    // Parsear sessions_data y eliminar duplicados por unit_price
    const sessionsData = JSON.parse(row.sessions_data);
    const uniqueSessionsData = [];
    const seenPrices = new Set();

    let totalSessions = 0;
    let totalNetClinic = 0;

    sessionsData.forEach(session => {
      if (!seenPrices.has(session.unit_price)) {
        seenPrices.add(session.unit_price);
        const sessionCount = parseInt(session.sessions_count);
        const sessionNet = parseFloat(session.total_net);

        uniqueSessionsData.push({
          unit_price: parseFloat(session.unit_price),
          sessions_count: sessionCount,
          total_net: sessionNet,
          concept: session.concept
        });

        totalSessions += sessionCount;
        totalNetClinic += sessionNet;
      }
    });

    // Formatear fecha más reciente a dd/mm/yyyy
    const lastDate = new Date(row.last_invoice_date);
    const formattedLastDate = `${String(lastDate.getDate()).padStart(2, '0')}/${String(lastDate.getMonth() + 1).padStart(2, '0')}/${lastDate.getFullYear()}`;

    return {
      clinic_id: parseInt(row.clinic_id),
      clinic_name: row.clinic_name,
      fiscal_name: row.fiscal_name || '',
      cif: row.cif || '',
      billing_address: row.billing_address || '',
      invoice_numbers: row.invoice_numbers ? row.invoice_numbers.split(',') : [],
      last_invoice_date: formattedLastDate,
      concepts: row.concepts ? row.concepts.split(',') : [],
      total_invoices: parseInt(row.total_invoices),
      total_sessions: totalSessions,
      total_net_clinic: totalNetClinic,
      total_invoiced: parseFloat(row.total_invoiced),
      sessions_data: uniqueSessionsData
    };
  });

  return invoices;
};

module.exports = {
  getInvoicesKPIs,
  getPendingInvoices,
  getPendingInvoicesOfClinics,
  createInvoice,
  createInvoiceOfClinics,
  getIssuedInvoices,
  getIssuedInvoicesOfClinics,
  getLastInvoiceNumber
};
