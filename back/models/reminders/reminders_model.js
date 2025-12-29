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
      s.start_time,
      s.end_time,
      p.first_name as patient_name,
      IF(r.id IS NOT NULL, true, false) as reminder_sent
    FROM sessions s
    INNER JOIN patients p ON s.patient_id = p.id
    LEFT JOIN reminders r ON s.id = r.session_id
    WHERE s.session_date = ?
      AND s.status != 'cancelada'
      AND s.is_active = true
      AND p.is_active = true
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
      c.name as clinic_name,
      c.address as clinic_address,
      r.id as reminder_id
    FROM sessions s
    INNER JOIN patients p ON s.patient_id = p.id
    LEFT JOIN clinics c ON s.clinic_id = c.id
    LEFT JOIN reminders r ON s.id = r.session_id
    WHERE s.id = ? AND s.is_active = true AND p.is_active = true
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

module.exports = {
  getPendingReminders,
  createReminder,
};
