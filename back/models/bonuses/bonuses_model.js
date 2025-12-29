// Obtener todos los bonuses con filtros opcionales y paginación
const getBonuses = async (db, filters = {}) => {
  // Extraer parámetros de paginación
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const offset = (page - 1) * limit;

  // Query base para contar registros totales
  let countQuery = `
        SELECT COUNT(*) as total
        FROM bonuses
    `;

  // Query principal para obtener datos
  let dataQuery = `
        SELECT 
            id,
            patient_id,
            total_sessions,
            price_per_session,
            total_price,
            used_sessions,
            status,
            DATE_FORMAT(purchase_date, '%Y-%m-%d') as purchase_date,
            DATE_FORMAT(expiry_date, '%Y-%m-%d') as expiry_date,
            DATE_FORMAT(created_at,'%Y-%m-%d') as created_at,
            updated_at
        FROM bonuses
    `;

  const params = [];
  const conditions = [];

  // Aplicar filtros
  if (filters.patient_id) {
    conditions.push("patient_id = ?");
    params.push(filters.patient_id);
  }

  if (filters.status) {
    conditions.push("status = ?");
    params.push(filters.status);
  }

  if (filters.fecha_desde) {
    conditions.push("purchase_date >= ?");
    params.push(filters.fecha_desde);
  }

  if (filters.fecha_hasta) {
    conditions.push("purchase_date <= ?");
    params.push(filters.fecha_hasta);
  }

  // Aplicar condiciones a ambas queries
  if (conditions.length > 0) {
    const conditionsStr = " WHERE " + conditions.join(" AND ");
    countQuery += conditionsStr;
    dataQuery += conditionsStr;
  }

  // Agregar ordenamiento y paginación solo a la query de datos
  dataQuery += " ORDER BY created_at DESC";
  dataQuery += " LIMIT ? OFFSET ?";
  
  // Ejecutar ambas queries
  const [countResult] = await db.execute(countQuery, params);
  const totalRecords = countResult[0].total;
  
  const [dataRows] = await db.execute(dataQuery, [...params, limit, offset]);
  
  // Calcular información de paginación
  const totalPages = Math.ceil(totalRecords / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    data: dataRows,
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      totalRecords: totalRecords,
      recordsPerPage: limit,
      hasNextPage: hasNextPage,
      hasPrevPage: hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null
    }
  };
};

// Obtener bonuses por patient_id con KPIs y detalles
const getBonusesByPatientId = async (db, patientId) => {
  // Consulta para obtener KPIs
  const kpisQuery = `
        SELECT 
            COUNT(*) as total_bonos,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as total_activos,
            SUM(CASE WHEN status = 'consumed' THEN 1 ELSE 0 END) as total_consumidos,
            SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as total_expirados
        FROM bonuses
        WHERE patient_id = ?
    `;

  const [kpisRows] = await db.execute(kpisQuery, [patientId]);
  const kpis = kpisRows[0];

  // Consulta para obtener detalles de cada bono
  const bonusesQuery = `
        SELECT 
            id as idBono,
            total_sessions as sesiones_totales,
            price_per_session as euros_por_sesion,
            total_price as precio_total,
            DATE_FORMAT(purchase_date, '%Y-%m-%d') as fecha_compra,
            DATE_FORMAT(expiry_date, '%Y-%m-%d') as fecha_expiracion,
            (total_sessions - used_sessions) as sesiones_restantes,
            used_sessions as sesiones_utilizadas,
            status as estado_bono
        FROM bonuses
        WHERE patient_id = ?
        ORDER BY purchase_date DESC
    `;

  const [bonusesRows] = await db.execute(bonusesQuery, [patientId]);

  return {
    kpis: {
      total_bonos: parseInt(kpis.total_bonos) || 0,
      total_activos: parseInt(kpis.total_activos) || 0,
      total_consumidos: parseInt(kpis.total_consumidos) || 0,
      total_expirados: parseInt(kpis.total_expirados) || 0,
    },
    bonuses: bonusesRows,
  };
};

// Obtener historial completo de un bono por ID
const getBonusHistoryById = async (db, bonusId) => {
  // Consulta principal del bono con KPIs calculados
  const bonusQuery = `
    SELECT 
      b.id,
      b.patient_id,
      b.total_sessions,
      b.price_per_session,
      b.total_price,
      b.used_sessions,
      (b.total_sessions - b.used_sessions) as remaining_sessions,
      ROUND((b.used_sessions / b.total_sessions) * 100, 2) as progress_percentage,
      b.status,
      DATE_FORMAT(b.purchase_date, '%Y-%m-%d') as purchase_date,
      DATE_FORMAT(b.expiry_date, '%Y-%m-%d') as expiry_date,
      DATE_FORMAT(b.created_at, '%Y-%m-%d %H:%i:%s') as created_at
    FROM bonuses b
    WHERE b.id = ?
  `;

  // Consulta del historial de uso
  const historyQuery = `
    SELECT 
      h.id,
      DATE_FORMAT(h.used_date, '%Y-%m-%d') as used_date
    FROM bonus_usage_history h
    WHERE h.bonus_id = ?
    ORDER BY h.used_date DESC, h.created_at DESC
  `;

  try {
    const [bonusRows] = await db.execute(bonusQuery, [bonusId]);

    if (bonusRows.length === 0) {
      return null;
    }

    const [historyRows] = await db.execute(historyQuery, [bonusId]);

    const bonus = bonusRows[0];

    return {
      used_sessions: bonus.used_sessions,
      remaining_sessions: bonus.remaining_sessions,
      progress_percentage: bonus.progress_percentage,
      sessions_history: historyRows.map((row) => ({
        used_date: row.used_date,
        session_id: row.session_id
      })),
    };
  } catch (error) {
    throw error;
  }
};

// Registrar uso de una sesión del bonus
const useBonusSession = async (db, bonusId) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Verificar que el bonus existe y está activo
    const [bonusRows] = await connection.execute(
      "SELECT id, used_sessions, total_sessions, status FROM bonuses WHERE id = ?",
      [bonusId]
    );

    if (bonusRows.length === 0) {
      throw new Error("Bonus no encontrado");
    }

    const bonus = bonusRows[0];

    if (bonus.status !== "active") {
      throw new Error("El bonus no está activo");
    }

    if (bonus.used_sessions >= bonus.total_sessions) {
      throw new Error("El bonus ya ha consumido todas las sesiones");
    }

    // Obtener fecha actual
    const today = new Date();
    const usedDate = today.toISOString().split("T")[0]; // Formato YYYY-MM-DD

    // Insertar registro en el historial de uso
    const [historyResult] = await connection.execute(
      `
      INSERT INTO bonus_usage_history (
        bonus_id,
        used_date
      ) VALUES (?, ?)
    `,
      [bonusId, usedDate]
    );

    // Actualizar el contador de sesiones usadas en el bonus
    const newUsedSessions = bonus.used_sessions + 1;
    const newStatus =
      newUsedSessions >= bonus.total_sessions ? "consumed" : "active";

    await connection.execute(
      `
      UPDATE bonuses 
      SET used_sessions = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `,
      [newUsedSessions, newStatus, bonusId]
    );

    await connection.commit();

    return {
      id: historyResult.insertId,
      bonus_id: bonusId,
      new_used_sessions: newUsedSessions,
      new_status: newStatus,
      remaining_sessions: bonus.total_sessions - newUsedSessions,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Crear un nuevo bonus
const createBonus = async (db, bonusData) => {
  // Calcular fecha de expiración (1 año desde la compra por defecto)
  const purchaseDate = new Date();
  const expiryDate = new Date(purchaseDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  const query = `
        INSERT INTO bonuses (
            patient_id,
            total_sessions,
            price_per_session,
            total_price,
            used_sessions,
            status,
            purchase_date,
            expiry_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

  const params = [
    bonusData.patient_id,
    bonusData.total_sessions,
    bonusData.price_per_session,
    bonusData.total_price,
    0, // used_sessions siempre empieza en 0
    "active", // status siempre active para nuevos bonuses
    purchaseDate.toISOString().split("T")[0], // fecha actual en formato YYYY-MM-DD
    expiryDate.toISOString().split("T")[0], // fecha de expiración en formato YYYY-MM-DD
  ];

  const [result] = await db.execute(query, params);
  return result.insertId;
};

module.exports = {
  getBonuses,
  getBonusesByPatientId,
  getBonusHistoryById,
  useBonusSession,
  createBonus,
};
