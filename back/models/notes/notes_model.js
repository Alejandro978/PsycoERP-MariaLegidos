// Obtener todas las notas con filtros opcionales, paginación y KPIs
const getNotes = async (db, filters = {}) => {
    // Extraer parámetros de paginación
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const offset = (page - 1) * limit;

    // Query base para contar registros totales y KPIs
    let countQuery = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_notes,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_notes
    FROM notes
    WHERE is_active = true
  `;

    // Query principal para obtener datos
    let dataQuery = `
    SELECT
      id,
      message,
      status,
      DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at,
      DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') as updated_at
    FROM notes
    WHERE is_active = true
  `;

    const params = [];
    const conditions = [];

    // Filtro por status
    if (filters.status) {
        conditions.push("status = ?");
        params.push(filters.status);
    }

    // Aplicar condiciones adicionales a ambas queries
    if (conditions.length > 0) {
        const conditionsStr = " AND " + conditions.join(" AND ");
        countQuery += conditionsStr;
        dataQuery += conditionsStr;
    }

    // Ordenamiento: pending primero, completed después, por fecha de creación descendente
    dataQuery += `
    ORDER BY 
      CASE 
        WHEN status = 'pending' THEN 1 
        WHEN status = 'completed' THEN 2 
      END,
      created_at DESC
  `;

    // Paginación
    dataQuery += " LIMIT ? OFFSET ?";

    // Ejecutar query de conteo y KPIs
    const [countResult] = await db.execute(countQuery, params);
    const totalRecords = countResult[0].total;
    const pendingNotes = countResult[0].pending_notes || 0;
    const completedNotes = countResult[0].completed_notes || 0;

    // Ejecutar query de datos con paginación
    const dataParams = [...params, limit, offset];
    const [rows] = await db.execute(dataQuery, dataParams);

    // Calcular información de paginación
    const totalPages = Math.ceil(totalRecords / limit);

    return {
        kpis: {
            total_notes: totalRecords,
            pending_notes: pendingNotes,
            completed_notes: completedNotes,
        },
        pagination: {
            current_page: page,
            total_pages: totalPages,
            total_records: totalRecords,
            records_per_page: limit,
            has_next_page: page < totalPages,
            has_previous_page: page > 1,
        },
        data: rows,
    };
};

// Crear una nueva nota
const createNote = async (db, noteData) => {
    const query = `
    INSERT INTO notes (message)
    VALUES (?)
  `;

    const [result] = await db.execute(query, [noteData.message]);
    return { id: result.insertId };
};

// Completar una nota (cambiar status a 'completed')
const completeNote = async (db, id) => {
    const query = `
    UPDATE notes 
    SET status = 'completed'
    WHERE id = ? AND is_active = true AND status = 'pending'
  `;

    const [result] = await db.execute(query, [id]);

    if (result.affectedRows === 0) {
        return null;
    }

    return { success: true };
};

module.exports = {
    getNotes,
    createNote,
    completeNote,
}