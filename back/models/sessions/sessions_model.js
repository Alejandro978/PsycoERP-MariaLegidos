// Obtener todas las sesiones con filtros opcionales y paginación
const getSessions = async (db, filters = {}) => {
  // Extraer parámetros de paginación
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const offset = (page - 1) * limit;

  // Query base para contar registros totales
  let countQuery = `
        SELECT COUNT(*) as total
        FROM sessions s
        LEFT JOIN patients p ON s.patient_id = p.id AND p.status = 'en curso'
        LEFT JOIN clinics c ON s.clinic_id = c.id AND c.is_active = true
        WHERE s.is_active = true
    `;

  // Query principal para obtener datos
  let dataQuery = `
        SELECT
            s.id AS session_id,
            s.session_date,
            s.start_time,
            s.end_time,
            s.mode,
            s.status,
            s.price,
            s.payment_method,
            s.notes,
            p.id AS patient_id,
            CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
            c.id AS clinic_id,
            c.name AS clinic_name,
            c.clinic_color,
            c.percentage AS clinic_percentage
        FROM sessions s
        LEFT JOIN patients p ON s.patient_id = p.id AND p.status = 'en curso'
        LEFT JOIN clinics c ON s.clinic_id = c.id AND c.is_active = true
        WHERE s.is_active = true
    `;
  const params = [];
  const conditions = [];

  if (filters.patient_id) {
    conditions.push("s.patient_id = ?");
    params.push(filters.patient_id);
  }

  if (filters.status) {
    conditions.push("s.status = ?");
    params.push(filters.status);
  }

  if (filters.clinic_id) {
    conditions.push("s.clinic_id = ?");
    params.push(filters.clinic_id);
  }

  if (filters.session_date) {
    conditions.push("s.session_date = ?");
    params.push(filters.session_date);
  }

  if (filters.payment_method) {
    conditions.push("s.payment_method = ?");
    params.push(filters.payment_method);
  }

  // Lógica inteligente de fechas
  if (filters.session_date) {
    // Fecha específica
    conditions.push("s.session_date = ?");
    params.push(filters.session_date);
  } else {
    // Rango de fechas
    if (filters.fecha_desde) {
      conditions.push("s.session_date >= ?");
      params.push(filters.fecha_desde);
    }

    if (filters.fecha_hasta) {
      conditions.push("s.session_date <= ?");
      params.push(filters.fecha_hasta);
    }
  }

  // Aplicar condiciones adicionales a ambas queries
  if (conditions.length > 0) {
    const conditionsStr = " AND " + conditions.join(" AND ");
    countQuery += conditionsStr;
    dataQuery += conditionsStr;
  }

  // Agregar ordenamiento y paginación solo a la query de datos
  dataQuery += " ORDER BY s.session_date DESC, s.start_time DESC";
  dataQuery += " LIMIT ? OFFSET ?";

  // Ejecutar ambas queries
  const [countResult] = await db.execute(countQuery, params);
  const totalRecords = countResult[0].total;

  const [rows] = await db.execute(dataQuery, [...params, limit, offset]);

  // Transformar datos a estructura organizada
  const transformedData = await Promise.all(
    rows.map(async (row) => {
      // Calcular el precio neto (lo que recibe el psicólogo)
      // net_price = price_bruto * (percentage / 100)
      // Ejemplo: price=60, percentage=70 -> net_price = 60 * 0.70 = 42
      let netPrice = null;
      if (row.price && row.clinic_percentage) {
        const brutePrice = parseFloat(row.price);
        const percentage = parseFloat(row.clinic_percentage);
        if (!isNaN(brutePrice) && !isNaN(percentage) && percentage > 0 && percentage <= 100) {
          netPrice = brutePrice * (percentage / 100);
          // Redondear a 2 decimales
          netPrice = Math.round(netPrice * 100) / 100;
        }
      }

      return {
        SessionDetailData: {
          session_id: row.session_id,
          session_date: row.session_date,
          start_time: row.start_time,
          end_time: row.end_time,
          mode: row.mode,
          status: row.status,
          price: row.price,
          net_price: netPrice,
          payment_method: row.payment_method,
          notes: row.notes,
          PatientData: {
            id: row.patient_id,
            name: row.patient_name,
          },
          ClinicDetailData: {
            clinic_id: row.clinic_id,
            clinic_name: row.clinic_name,
            clinic_color: row.clinic_color,
            clinic_percentage: row.clinic_percentage,
          }
        },
      };
    })
  );

  // Calcular información de paginación
  const totalPages = Math.ceil(totalRecords / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    data: transformedData,
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      totalRecords: totalRecords,
      recordsPerPage: limit,
      hasNextPage: hasNextPage,
      hasPrevPage: hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
    },
  };
};

// Crear nueva sesión
const createSession = async (db, sessionData) => {
  const {
    patient_id,
    clinic_id,
    session_date,
    start_time,
    end_time,
    mode,
    status,
    price,
    payment_method,
    notes,
  } = sessionData;

  const query = `
    INSERT INTO sessions (
      patient_id,
      clinic_id,
      session_date,
      start_time,
      end_time,
      mode,
      status,
      price,
      payment_method,
      notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    patient_id,
    clinic_id,
    session_date,
    start_time,
    end_time,
    mode,
    status,
    price,
    payment_method,
    notes,
  ];

  const [result] = await db.execute(query, params);

  // Retornar la sesión creada con su ID
  const [newSession] = await db.execute("SELECT * FROM sessions WHERE id = ?", [
    result.insertId,
  ]);

  return newSession[0];
};

// Actualizar sesión existente
const updateSession = async (db, sessionId, updateData) => {
  // Construir query dinámicamente basado en los campos recibidos
  const fields = Object.keys(updateData);

  // Crear la parte SET de la query
  const setClause = fields.map((field) => `${field} = ?`).join(", ");

  const query = `
    UPDATE sessions
    SET ${setClause}
    WHERE id = ? AND is_active = true
  `;

  // Crear array de parámetros: valores + ID al final
  const params = [...Object.values(updateData), sessionId];

  await db.execute(query, params);

  // Retornar la sesión actualizada
  const [updatedSession] = await db.execute(
    "SELECT * FROM sessions WHERE id = ? AND is_active = true",
    [sessionId]
  );

  return updatedSession[0];
};

// Eliminar sesión (soft delete)
const deleteSession = async (db, sessionId) => {
  // Realizar soft delete marcando is_active = false
  const [result] = await db.execute(
    "UPDATE sessions SET is_active = false WHERE id = ? AND is_active = true",
    [sessionId]
  );

  if (result.affectedRows === 0) {
    throw new Error("Sesión no encontrada o ya está eliminada");
  }

  return true;
};

// Obtener datos de sesión con paciente para WhatsApp
const getSessionForWhatsApp = async (db, sessionId) => {
  const query = `
    SELECT
      s.id,
      s.session_date,
      s.start_time,
      s.status,
      CONCAT(p.first_name, ' ', p.last_name) as patient_name,
      p.phone as patient_phone
    FROM sessions s
    INNER JOIN patients p ON s.patient_id = p.id AND p.status = 'en curso'
    WHERE s.id = ? AND s.is_active = true
  `;

  const [rows] = await db.execute(query, [sessionId]);

  if (rows.length === 0) {
    return null;
  }

  return rows[0];
};

// Verificar si existe una sesión con solapamiento de horarios
// Verifica conflictos independientemente del paciente (control de horarios del psicólogo)
// Una sesión se solapa si:
// - La nueva sesión empieza antes de que termine una existente Y
// - La nueva sesión termina después de que empiece una existente
const checkTimeOverlap = async (db, session_date, start_time, end_time, excludeSessionId = null) => {
  let query = `
    SELECT s.id, s.start_time, s.end_time, s.status, s.patient_id,
           CONCAT(p.first_name, ' ', p.last_name) as patient_name
    FROM sessions s
    LEFT JOIN patients p ON s.patient_id = p.id
    WHERE s.session_date = ?
      AND s.is_active = true
      AND s.status != 'cancelada'
      AND (
        -- La nueva sesión empieza antes de que termine una existente
        (? < s.end_time AND ? > s.start_time)
        OR
        -- La nueva sesión termina después de que empiece una existente
        (? > s.start_time AND ? < s.end_time)
        OR
        -- La nueva sesión contiene completamente a una existente
        (? <= s.start_time AND ? >= s.end_time)
      )
  `;

  const params = [session_date, start_time, start_time, end_time, end_time, start_time, end_time];

  // Si estamos actualizando, excluir la sesión actual
  if (excludeSessionId) {
    query += " AND s.id != ?";
    params.push(excludeSessionId);
  }

  const [rows] = await db.execute(query, params);
  return rows.length > 0 ? rows[0] : null;
};

// Obtener KPIs globales de sesiones con filtros opcionales (fechaDesde / fechaHasta / session_date / clinic_id)
const getSessionsKPIs = async (db, filters = {}) => {
  const params = [];
  let where = 'WHERE s.is_active = 1';

  // Lógica de fechas: rango fecha_desde/fecha_hasta
  if (filters.fecha_desde) {
    where += ' AND s.session_date >= ?';
    params.push(filters.fecha_desde);
  }
  if (filters.fecha_hasta) {
    where += ' AND s.session_date <= ?';
    params.push(filters.fecha_hasta);
  }

  // Filtrado por clínica
  if (filters.clinic_id) {
    where += ' AND s.clinic_id = ?';
    params.push(filters.clinic_id);
  }

  // Filtrado por estado de la sesión
  if (filters.status) {
    where += ' AND s.status = ?';
    params.push(filters.status);
  }

  // Filtrado por método de pago
  if (filters.payment_method) {
    where += ' AND s.payment_method = ?';
    params.push(filters.payment_method);
  }

  const query = `
    SELECT
      SUM(CASE WHEN s.status = 'completada' THEN 1 ELSE 0 END) as completed_sessions,
      SUM(CASE WHEN s.status = 'cancelada' THEN 1 ELSE 0 END) as cancelled_sessions,
      COALESCE(SUM(CASE WHEN s.payment_method != 'pendiente' THEN s.price ELSE 0 END), 0) as gross_income,
      COALESCE(SUM(CASE WHEN s.payment_method != 'pendiente' THEN s.price * (COALESCE(c.percentage,0) / 100) ELSE 0 END), 0) as net_income
    FROM sessions s
    LEFT JOIN clinics c ON s.clinic_id = c.id AND c.is_active = true
    ${where}
  `;

  const [rows] = await db.execute(query, params);

  const completed = parseInt(rows[0].completed_sessions) || 0;
  const cancelled = parseInt(rows[0].cancelled_sessions) || 0;
  const gross = parseFloat(rows[0].gross_income) || 0;
  const net = parseFloat(rows[0].net_income) || 0;

  return {
    sesiones_completadas: completed,
    sesiones_canceladas: cancelled,
    ingresos_brutos: parseFloat(gross.toFixed(2)),
    ingresos_netos: parseFloat(net.toFixed(2)),
  };
};

module.exports = {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
  getSessionForWhatsApp,
  checkTimeOverlap,
  getSessionsKPIs,
};
