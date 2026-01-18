/**
 * Crear una nueva invitación
 * @param {Object} db - Pool de conexión a BD
 * @param {Object} data - Datos de la invitación
 * @returns {Object} - Invitación creada
 */
const createInvitation = async (db, data) => {
  const { token, expires_at } = data;

  const [result] = await db.execute(
    `INSERT INTO patient_invitations (token, status, expires_at, created_at)
     VALUES (?, 'pending', ?, NOW())`,
    [token, expires_at]
  );

  return {
    id: result.insertId,
    token,
    status: "pending",
    expires_at,
  };
};

/**
 * Obtener invitación por token
 * @param {Object} db - Pool de conexión a BD
 * @param {string} token - Token de invitación
 * @returns {Object|null} - Invitación o null si no existe
 */
const getInvitationByToken = async (db, token) => {
  const [rows] = await db.execute(
    `SELECT id, token, status, expires_at, used_at, created_at
     FROM patient_invitations
     WHERE token = ?`,
    [token]
  );

  return rows.length > 0 ? rows[0] : null;
};

/**
 * Obtener invitación por ID
 * @param {Object} db - Pool de conexión a BD
 * @param {number} id - ID de la invitación
 * @returns {Object|null} - Invitación o null si no existe
 */
const getInvitationById = async (db, id) => {
  const [rows] = await db.execute(
    `SELECT id, token, status, expires_at, used_at, created_at
     FROM patient_invitations
     WHERE id = ?`,
    [id]
  );

  return rows.length > 0 ? rows[0] : null;
};

/**
 * Obtener todas las invitaciones con filtros y paginación
 * @param {Object} db - Pool de conexión a BD
 * @param {Object} filters - Filtros opcionales
 * @returns {Object} - { total, rows }
 */
const getInvitations = async (db, filters = {}) => {
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const offset = (page - 1) * limit;

  let countQuery = `SELECT COUNT(*) as total FROM patient_invitations WHERE 1=1`;
  let dataQuery = `
    SELECT id, token, status, expires_at, used_at, created_at
    FROM patient_invitations
    WHERE 1=1
  `;

  const params = [];
  const conditions = [];

  // Filtro por status
  if (filters.status) {
    conditions.push("status = ?");
    params.push(filters.status);
  }

  // Filtro por fecha de creación (desde)
  if (filters.fecha_desde) {
    conditions.push("DATE(created_at) >= ?");
    params.push(filters.fecha_desde);
  }

  // Filtro por fecha de creación (hasta)
  if (filters.fecha_hasta) {
    conditions.push("DATE(created_at) <= ?");
    params.push(filters.fecha_hasta);
  }

  // Construir query con filtros
  if (conditions.length > 0) {
    const conditionString = " AND " + conditions.join(" AND ");
    countQuery += conditionString;
    dataQuery += conditionString;
  }

  // Ejecutar query de conteo
  const [countResult] = await db.execute(countQuery, params);
  const total = countResult[0].total;

  // Ejecutar query de datos con paginación
  dataQuery += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  const [rows] = await db.execute(dataQuery, [...params, limit, offset]);

  return { total, rows };
};

/**
 * Marcar invitación como usada
 * @param {Object} db - Pool de conexión a BD
 * @param {string} token - Token de invitación
 * @returns {boolean} - true si se actualizó
 */
const markInvitationAsUsed = async (db, token) => {
  const [result] = await db.execute(
    `UPDATE patient_invitations
     SET status = 'used', used_at = NOW()
     WHERE token = ? AND status = 'pending'`,
    [token]
  );

  return result.affectedRows > 0;
};

/**
 * Marcar invitación como expirada (soft delete)
 * @param {Object} db - Pool de conexión a BD
 * @param {number} id - ID de la invitación
 * @returns {boolean} - true si se actualizó
 */
const markInvitationAsExpired = async (db, id) => {
  const [result] = await db.execute(
    `UPDATE patient_invitations
     SET status = 'expired'
     WHERE id = ? AND status = 'pending'`,
    [id]
  );

  return result.affectedRows > 0;
};

module.exports = {
  createInvitation,
  getInvitationByToken,
  getInvitationById,
  getInvitations,
  markInvitationAsUsed,
  markInvitationAsExpired,
};
