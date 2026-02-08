const getPendingReminders = async (db) => {
  // Calcular la fecha objetivo según la lógica especial de días
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

  let targetDate;

  if (dayOfWeek >= 1 && dayOfWeek <= 4) {
    // Lunes a Jueves
    // Mostrar sesiones del día siguiente
    targetDate = new Date(today);
    targetDate.setDate(today.getDate() + 1);
  } else {
    // Viernes (5), Sábado (6), Domingo (0)
    // Mostrar sesiones del lunes siguiente
    const daysUntilMonday = (8 - dayOfWeek) % 7;
    targetDate = new Date(today);
    targetDate.setDate(
      today.getDate() + (daysUntilMonday === 0 ? 7 : daysUntilMonday)
    );
  }

  // Formatear fecha para MySQL (YYYY-MM-DD)
  const formattedDate = targetDate.toISOString().split("T")[0];

  const query = `
    SELECT 
      s.id as session_id,
      s.session_date,
      s.start_time,
      s.end_time,
      s.mode,
      p.id as patient_id,
      CONCAT(p.first_name, ' ', p.last_name) as patient_name,
      p.phone as patient_phone,
      c.id as clinic_id,
      c.name as clinic_name,
      c.address as clinic_address,
      IF(r.id IS NOT NULL, true, false) as reminder_sent
    FROM sessions s
    INNER JOIN patients p ON s.patient_id = p.id
    INNER JOIN clinics c ON s.clinic_id = c.id
    LEFT JOIN reminders r ON s.id = r.session_id AND DATE(r.created_at) = CURDATE()
    WHERE s.session_date = ?
      AND s.status != 'cancelada'
      AND s.is_active = true
      AND p.status = 'en curso'
      AND c.is_active = true
      AND c.is_external = 0
      AND p.phone IS NOT NULL
      AND p.phone != ''
    ORDER BY s.start_time ASC
  `;

  const [rows] = await db.execute(query, [formattedDate]);

  return {
    targetDate: formattedDate,
    total: rows.length,
    sessions: rows,
  };
};

const createReminder = async (db, sessionId) => {
  // Verificar que no existe ya un reminder para esta sesión y obtener datos de la sesión
  const checkSessionQuery = `
    SELECT
      s.id as session_id,
      s.session_date,
      s.start_time,
      s.end_time,
      s.mode,
      s.status,
      p.first_name as patient_name,
      p.phone as patient_phone,
      cli.name as clinic_name,
      cli.address as clinic_address,
      r.id as reminder_id
    FROM sessions s
    INNER JOIN patients p ON s.patient_id = p.id
    INNER JOIN clinics cli ON p.clinic_id = cli.id
    LEFT JOIN reminders r ON s.id = r.session_id
    WHERE s.id = ? 
      AND s.is_active = true 
      AND p.is_active = true
      AND cli.is_active = true
      AND cli.is_external = 0
  `;

  const [sessionResult] = await db.execute(checkSessionQuery, [sessionId]);

  if (sessionResult.length === 0) {
    throw new Error("Session not found or not scheduled");
  }

  const sessionData = sessionResult[0];

  // Verificar que no existe ya un reminder
  if (sessionData.reminder_id) {
    throw new Error("Reminder already exists for this session");
  }

  // Insertar el nuevo reminder
  const insertQuery = `
    INSERT INTO reminders (session_id)
    VALUES (?)
  `;

  const [result] = await db.execute(insertQuery, [sessionId]);

  // Retornar toda la información necesaria para el WhatsApp deeplink
  return {
    id: result.insertId,
    session_id: sessionId,
    session_date: sessionData.session_date,
    start_time: sessionData.start_time,
    end_time: sessionData.end_time,
    mode: sessionData.mode,
    patient_name: sessionData.patient_name,
    patient_phone: sessionData.patient_phone,
    clinic_name: sessionData.clinic_name,
    clinic_address: sessionData.clinic_address,
    created_at: new Date(),
  };
};

/**
 * Guardar log de recordatorio WhatsApp en reminder_logs
 * @param {Object} db - Pool de conexión
 * @param {Object} data - Datos del log (session_id, patient_phone, message_sent, status, twilio_sid, error_message)
 * @returns {Promise<Object>} Resultado de la inserción
 */
const saveReminderLog = async (db, data) => {
  const query = `
    INSERT INTO reminder_logs 
    (session_id, patient_phone, message_sent, status, twilio_sid, error_message, sent_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW())
  `;

  const [result] = await db.execute(query, [
    data.session_id,
    data.patient_phone,
    data.message_sent,
    data.status,
    data.twilio_sid || null,
    data.error_message || null,
  ]);

  return result;
};

/**
 * Obtener logs de recordatorios con filtros opcionales
 * @param {Object} db - Pool de conexión
 * @param {Object} filters - Filtros opcionales (fecha_desde, fecha_hasta, status, session_id)
 * @returns {Promise<Array>} Array de logs
 */
const getReminderLogs = async (db, filters = {}) => {
  let query = `
    SELECT 
      rl.id,
      rl.session_id,
      rl.patient_phone,
      rl.status,
      rl.twilio_sid,
      rl.error_message,
      rl.sent_at,
      s.session_date,
      s.start_time,
      CONCAT(p.first_name, ' ', p.last_name) as patient_name
    FROM reminder_logs rl
    LEFT JOIN sessions s ON rl.session_id = s.id
    LEFT JOIN patients p ON s.patient_id = p.id
    WHERE rl.is_active = true
  `;

  const params = [];
  const conditions = [];

  if (filters.status) {
    conditions.push("rl.status = ?");
    params.push(filters.status);
  }

  if (filters.session_id) {
    conditions.push("rl.session_id = ?");
    params.push(filters.session_id);
  }

  if (filters.fecha_desde) {
    conditions.push("DATE(rl.sent_at) >= ?");
    params.push(filters.fecha_desde);
  }

  if (filters.fecha_hasta) {
    conditions.push("DATE(rl.sent_at) <= ?");
    params.push(filters.fecha_hasta);
  }

  if (conditions.length > 0) {
    query += " AND " + conditions.join(" AND ");
  }

  query += " ORDER BY rl.sent_at DESC";

  const [rows] = await db.execute(query, params);
  return rows;
};

module.exports = {
  getPendingReminders,
  createReminder,
  saveReminderLog,
  getReminderLogs,
};
