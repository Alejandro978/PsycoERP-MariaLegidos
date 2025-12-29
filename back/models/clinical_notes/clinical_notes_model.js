// Obtener notas clínicas por ID de paciente
const getClinicalNotesByPatientId = async (db, patientId) => {
  const query = `
    SELECT
      cn.id,
      cn.title,
      cn.content,
      DATE_FORMAT(cn.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
      DATE_FORMAT(cn.updated_at, '%Y-%m-%d %H:%i:%s') as updated_at
    FROM clinical_notes cn
    INNER JOIN patients p ON cn.patient_id = p.id
    WHERE cn.patient_id = ? AND p.is_active = true
    ORDER BY cn.created_at DESC
  `;

  const [rows] = await db.execute(query, [patientId]);
  return rows;
};

// Crear nueva nota clínica
const createClinicalNote = async (db, clinicalNoteData) => {
  const { patient_id, title, content } = clinicalNoteData;

  const query = `
    INSERT INTO clinical_notes (
      patient_id,
      title,
      content
    ) VALUES (?, ?, ?)
  `;

  const params = [patient_id, title, content];

  const [result] = await db.execute(query, params);

  // Retornar la nota clínica creada con su ID
  const [newNote] = await db.execute(
    `SELECT 
      id,
      patient_id,
      title,
      content,
      DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at,
      DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') as updated_at
    FROM clinical_notes 
    WHERE id = ?`,
    [result.insertId]
  );

  return newNote[0];
};

// Actualizar nota clínica
const updateClinicalNote = async (db, noteId, updateData) => {
  const fields = Object.keys(updateData);
  const setClause = fields.map((field) => `${field} = ?`).join(", ");

  const query = `
    UPDATE clinical_notes 
    SET ${setClause}
    WHERE id = ?
  `;

  const params = [...Object.values(updateData), noteId];
  const [result] = await db.execute(query, params);

  if (result.affectedRows === 0) {
    throw new Error("Nota clínica no encontrada");
  }

  // Retornar la nota actualizada directamente
  const [updatedNote] = await db.execute(
    `SELECT 
      id,
      patient_id,
      title,
      content,
      DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at,
      DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') as updated_at
    FROM clinical_notes 
    WHERE id = ?`,
    [noteId]
  );

  return updatedNote[0];
};

// Eliminar nota clínica
const deleteClinicalNote = async (db, noteId) => {
  const [result] = await db.execute(
    "DELETE FROM clinical_notes WHERE id = ?",
    [noteId]
  );

  if (result.affectedRows === 0) {
    throw new Error("Nota clínica no encontrada");
  }

  return true;
};

module.exports = {
  getClinicalNotesByPatientId,
  createClinicalNote,
  updateClinicalNote,
  deleteClinicalNote,
};