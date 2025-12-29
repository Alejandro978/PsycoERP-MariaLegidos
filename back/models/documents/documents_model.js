// Get all documents for a specific patient
const getDocumentsByPatientId = async (db, patientId) => {
  const query = `
    SELECT
      id,
      name,
      type,
      size,
      DATE_FORMAT(uploaded_at, '%Y-%m-%d') as upload_date,
      description,
      url as file_url
    FROM documents
    WHERE patient_id = ? AND is_active = true
    ORDER BY uploaded_at DESC
  `;

  const [rows] = await db.execute(query, [patientId]);

  // Format size from bytes to human-readable format
  const formattedRows = rows.map((doc) => {
    const sizeInBytes = doc.size;
    let formattedSize;

    if (sizeInBytes < 1024) {
      formattedSize = `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      formattedSize = `${(sizeInBytes / 1024).toFixed(1)} KB`;
    } else if (sizeInBytes < 1024 * 1024 * 1024) {
      formattedSize = `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    } else {
      formattedSize = `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }

    return {
      ...doc,
      size: formattedSize,
    };
  });

  return formattedRows;
};

// Upload document
const uploadDocument = async (db, documentData) => {
  const { patient_id, name, type, size, description, file_url } = documentData;

  const query = `
    INSERT INTO documents (
      patient_id,
      name,
      type,
      size,
      description,
      url
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;

  const params = [patient_id, name, type, size, description, file_url];

  const [result] = await db.execute(query, params);

  // Return the created document
  const [newDocument] = await db.execute(
    `SELECT
      id,
      name,
      type,
      size,
      DATE_FORMAT(uploaded_at, '%Y-%m-%d') as upload_date,
      description,
      url as file_url
    FROM documents
    WHERE id = ?`,
    [result.insertId]
  );

  // Format size
  const doc = newDocument[0];
  const sizeInBytes = doc.size;
  let formattedSize;

  if (sizeInBytes < 1024) {
    formattedSize = `${sizeInBytes} B`;
  } else if (sizeInBytes < 1024 * 1024) {
    formattedSize = `${(sizeInBytes / 1024).toFixed(1)} KB`;
  } else if (sizeInBytes < 1024 * 1024 * 1024) {
    formattedSize = `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  } else {
    formattedSize = `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  return {
    ...doc,
    size: formattedSize,
  };
};

// Obtener documento por ID
const getDocumentById = async (db, documentId) => {
  const query = `
    SELECT
      id,
      name,
      type,
      size,
      url as file_url
    FROM documents
    WHERE id = ? AND is_active = true
  `;
  const [rows] = await db.execute(query, [documentId]);
  return rows[0] || null;
};

// Eliminar documento (soft delete)
const deleteDocumentById = async (db, documentId) => {
  const query = `
    UPDATE documents
    SET is_active = false
    WHERE id = ? AND is_active = true
  `;

  const [result] = await db.execute(query, [documentId]);
  return result.affectedRows > 0;
};

module.exports = {
  getDocumentsByPatientId,
  uploadDocument,
  getDocumentById,
  deleteDocumentById,
};
