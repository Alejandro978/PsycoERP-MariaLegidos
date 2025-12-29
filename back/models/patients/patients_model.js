const { getDocumentsByPatientId } = require("../documents/documents_model");

// Obtener todos los pacientes con filtros opcionales y paginación
const getPatients = async (db, filters = {}) => {
  // Extraer parámetros de paginación
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const offset = (page - 1) * limit;

  // Query base para contar registros totales
  let countQuery = `
        SELECT COUNT(*) as total
        FROM patients
        WHERE is_active = true AND status = 'en curso'
    `;

  // Query principal para obtener datos
  let dataQuery = `
        SELECT
            id,
            first_name,
            last_name,
            email,
            phone,
            dni,
            gender,
            occupation,
            status,
            DATE_FORMAT(birth_date, '%Y-%m-%d') as birth_date,
            street,
            street_number,
            door,
            postal_code,
            city,
            province,
            clinic_id,
            DATE_FORMAT(treatment_start_date, '%Y-%m-%d') as treatment_start_date,
            is_minor,
            DATE_FORMAT(created_at,'%Y-%m-%d') as created_at,
            DATE_FORMAT(updated_at,'%Y-%m-%d') as updated_at
        FROM patients
        WHERE is_active = true AND status = 'en curso'
    `;

  const params = [];
  const conditions = [];

  // Aplicar filtros
  if (filters.first_name) {
    conditions.push("first_name LIKE ?");
    params.push(`%${filters.first_name}%`);
  }

  if (filters.last_name) {
    conditions.push("last_name LIKE ?");
    params.push(`%${filters.last_name}%`);
  }

  if (filters.email) {
    conditions.push("email LIKE ?");
    params.push(`%${filters.email}%`);
  }

  if (filters.dni) {
    conditions.push("dni = ?");
    params.push(filters.dni);
  }

  if (filters.status) {
    conditions.push("status = ?");
    params.push(filters.status);
  }

  if (filters.gender) {
    conditions.push("gender = ?");
    params.push(filters.gender);
  }

  if (filters.occupation) {
    conditions.push("occupation LIKE ?");
    params.push(`%${filters.occupation}%`);
  }

  if (filters.clinic_id) {
    conditions.push("clinic_id = ?");
    params.push(filters.clinic_id);
  }

  if (filters.is_minor !== undefined) {
    conditions.push("is_minor = ?");
    params.push(filters.is_minor);
  }

  if (filters.birth_date) {
    conditions.push("birth_date = ?");
    params.push(filters.birth_date);
  }

  // Lógica inteligente de fechas para created_at
  if (filters.fecha_desde) {
    conditions.push("created_at >= ?");
    params.push(filters.fecha_desde);
  }

  if (filters.fecha_hasta) {
    conditions.push("created_at <= ?");
    params.push(filters.fecha_hasta);
  }
  
  // Aplicar condiciones a ambas queries
  if (conditions.length > 0) {
    const conditionsStr = " AND " + conditions.join(" AND ");
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

// Obtener un paciente por ID con información específica para PatientResume
const getPatientById = async (db, id) => {
  // Consulta para obtener datos básicos del paciente con modo preferido basado en la clínica
  const patientQuery = `
        SELECT
            p.id,
            p.email,
            p.phone,
            CASE
                WHEN c.address IS NULL OR c.address = '' THEN 'Online'
                ELSE 'Presencial'
            END as preferred_mode
        FROM patients p
        LEFT JOIN clinics c ON p.clinic_id = c.id AND c.is_active = true
        WHERE p.id = ? AND p.is_active = true
    `;

  const [patientRows] = await db.execute(patientQuery, [id]);

  if (patientRows.length === 0) {
    return {
      PatientResume: null
    };
  }

  // Consulta para obtener conteo de sesiones por estado (PatientSessionsStatus)
  const sessionsStatusQuery = `
        SELECT
            COALESCE(SUM(CASE WHEN status = 'completada' THEN 1 ELSE 0 END), 0) as completed_sessions,
            COALESCE(SUM(CASE WHEN status = 'cancelada' THEN 1 ELSE 0 END), 0) as cancelled_sessions
        FROM sessions
        WHERE patient_id = ? AND is_active = 1
    `;

  const [sessionsStatusRows] = await db.execute(sessionsStatusQuery, [id]);

  // Consulta para obtener sesiones del paciente con todos los detalles (PatientResumeSessions)
  const sessionsQuery = `
        SELECT
            mode as tipo,
            DATE_FORMAT(session_date, '%d/%m/%Y') as fecha,
            price as precio,
            payment_method as metodo_pago
        FROM sessions
        WHERE patient_id = ? AND is_active = 1
        ORDER BY session_date DESC
        LIMIT 10
    `;

  const [sessionsRows] = await db.execute(sessionsQuery, [id]);

  // Consulta para obtener información financiera del año actual (PatientResumeInvoice)
  const currentYear = new Date().getFullYear();
  const invoiceQuery = `
        SELECT
            COALESCE(SUM(price), 0) as total_spent_current_year,
            0 as invoices_issued
        FROM sessions
        WHERE patient_id = ? AND is_active = 1 AND YEAR(session_date) = ?
    `;

  const [invoiceRows] = await db.execute(invoiceQuery, [id, currentYear]);
  
  // Consulta para obtener datos detallados del paciente con información de clínica
  const patientDataQuery = `
        SELECT
            p.first_name as nombre,
            p.last_name as apellidos,
            p.dni,
            DATE_FORMAT(p.birth_date, '%Y-%m-%d') as fecha_nacimiento,
            p.status as estado,
            p.email,
            p.phone as telefono,
            p.street as calle,
            p.street_number as numero,
            p.door as puerta,
            p.postal_code as codigo_postal,
            p.city as ciudad,
            p.province as provincia,
            p.gender as genero,
            p.occupation as ocupacion,
            p.clinic_id,
            DATE_FORMAT(p.treatment_start_date, '%Y-%m-%d') as fecha_inicio_tratamiento,
            p.is_minor as menor_edad,
            c.name as nombre_clinica,
            CASE
                WHEN c.address IS NULL OR c.address = '' THEN 'Online'
                ELSE 'Presencial'
            END as tipo_clinica
        FROM patients p
        LEFT JOIN clinics c ON p.clinic_id = c.id AND c.is_active = true
        WHERE p.id = ? AND p.is_active = true
    `;

  const [patientDataRows] = await db.execute(patientDataQuery, [id]);
  
  // Consulta para obtener sesiones extendidas para PatientSessions
  const patientSessionsQuery = `
        SELECT
            DATE_FORMAT(s.session_date, '%Y-%m-%d') as fecha,
            c.name as clinica,
            s.status as estado,
            s.price as precio,
            ROUND(s.price * (c.percentage / 100), 2) as precio_neto,
            s.payment_method as tipo_pago,
            s.notes as notas
        FROM sessions s
        LEFT JOIN clinics c ON s.clinic_id = c.id
        WHERE s.patient_id = ? AND s.is_active = 1
        ORDER BY s.session_date DESC
    `;
  
  const [patientSessionsRows] = await db.execute(patientSessionsQuery, [id]);
  

  // Consulta para obtener notas clínicas del paciente
  const clinicalNotesQuery = `
        SELECT
            cn.id,
            cn.title as titulo,
            cn.content as contenido,
            DATE_FORMAT(cn.created_at, '%Y-%m-%d %H:%i:%s') as fecha
        FROM clinical_notes cn
        INNER JOIN patients p ON cn.patient_id = p.id
        WHERE cn.patient_id = ? AND p.is_active = true
        ORDER BY cn.created_at DESC
    `;
  
  const [clinicalNotesRows] = await db.execute(clinicalNotesQuery, [id]);

  // Obtener documentos del paciente
  const patientDocuments = await getDocumentsByPatientId(db, id);

  const patientResumeData = patientRows[0];
  patientResumeData.PatientSessionsStatus = sessionsStatusRows[0];
  patientResumeData.PatientResumeSessions = sessionsRows;
  patientResumeData.PatientResumeInvoice = invoiceRows[0];

  return {
    PatientResume: patientResumeData,
    PatientData: patientDataRows[0] || {},
    PatientMedicalRecord: clinicalNotesRows,
    PatientSessions: patientSessionsRows,
    PatientDocuments: patientDocuments
  };
};

// Obtener pacientes inactivos (status != 'en curso') con filtros opcionales y paginación
const getInactivePatients = async (db, filters = {}) => {
  // Extraer parámetros de paginación
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const offset = (page - 1) * limit;

  // Query base para contar registros totales
  let countQuery = `
        SELECT COUNT(*) as total
        FROM patients
        WHERE is_active = true AND status != 'en curso'
    `;

  // Query principal para obtener datos
  let dataQuery = `
        SELECT
            id,
            first_name,
            last_name,
            email,
            phone,
            dni,
            gender,
            occupation,
            status,
            DATE_FORMAT(birth_date, '%Y-%m-%d') as birth_date,
            street,
            street_number,
            door,
            postal_code,
            city,
            province,
            clinic_id,
            DATE_FORMAT(treatment_start_date, '%Y-%m-%d') as treatment_start_date,
            is_minor,
            DATE_FORMAT(created_at,'%Y-%m-%d') as created_at,
            DATE_FORMAT(updated_at,'%Y-%m-%d') as updated_at
        FROM patients
        WHERE is_active = true AND status != 'en curso'
    `;

  const params = [];
  const conditions = [];

  // Aplicar filtros
  if (filters.first_name) {
    conditions.push("first_name LIKE ?");
    params.push(`%${filters.first_name}%`);
  }

  if (filters.last_name) {
    conditions.push("last_name LIKE ?");
    params.push(`%${filters.last_name}%`);
  }

  if (filters.email) {
    conditions.push("email LIKE ?");
    params.push(`%${filters.email}%`);
  }

  if (filters.dni) {
    conditions.push("dni = ?");
    params.push(filters.dni);
  }

  if (filters.status) {
    conditions.push("status = ?");
    params.push(filters.status);
  }

  if (filters.gender) {
    conditions.push("gender = ?");
    params.push(filters.gender);
  }

  if (filters.occupation) {
    conditions.push("occupation LIKE ?");
    params.push(`%${filters.occupation}%`);
  }

  if (filters.clinic_id) {
    conditions.push("clinic_id = ?");
    params.push(filters.clinic_id);
  }

  if (filters.is_minor !== undefined) {
    conditions.push("is_minor = ?");
    params.push(filters.is_minor);
  }

  if (filters.birth_date) {
    conditions.push("birth_date = ?");
    params.push(filters.birth_date);
  }

  // Lógica inteligente de fechas para created_at
  if (filters.fecha_desde) {
    conditions.push("created_at >= ?");
    params.push(filters.fecha_desde);
  }

  if (filters.fecha_hasta) {
    conditions.push("created_at <= ?");
    params.push(filters.fecha_hasta);
  }
  
  // Aplicar condiciones a ambas queries
  if (conditions.length > 0) {
    const conditionsStr = " AND " + conditions.join(" AND ");
    countQuery += conditionsStr;
    dataQuery += conditionsStr;
  }

  // Agregar ordenamiento y paginación solo a la query de datos
  dataQuery += " ORDER BY updated_at DESC";
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

// Soft delete de un paciente (actualizar is_active = false)
const deletePatient = async (db, id) => {
  const query = `
    UPDATE patients 
    SET is_active = false, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ? AND is_active = true
  `;
  
  const [result] = await db.execute(query, [id]);
  return result.affectedRows > 0;
};

// Comprueba si un paciente tiene sesiones programadas en el futuro
const hasFutureSessions = async (db, patientId) => {
  const query = `
    SELECT COUNT(*) as total
    FROM sessions
    WHERE patient_id = ?
      AND is_active = 1
      AND status != 'cancelada'
      AND (
        session_date > CURDATE()
        OR (session_date = CURDATE() AND start_time > CURTIME())
      )
  `;
  const [rows] = await db.execute(query, [patientId]);
  return rows[0].total > 0;
};

// Crear un nuevo paciente
const createPatient = async (db, patientData) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    dni,
    gender,
    occupation,
    birth_date,
    street,
    street_number,
    door,
    postal_code,
    city,
    province,
    clinic_id,
    treatment_start_date,
    status,
    is_minor,
  } = patientData;

  const query = `
    INSERT INTO patients (
      first_name,
      last_name,
      email,
      phone,
      dni,
      gender,
      occupation,
      birth_date,
      street,
      street_number,
      door,
      postal_code,
      city,
      province,
      clinic_id,
      treatment_start_date,
      status,
      is_minor,
      is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true)
  `;

  const params = [
    first_name,
    last_name,
    email,
    phone,
    dni,
    gender,
    occupation,
    birth_date,
    street,
    street_number,
    door,
    postal_code,
    city,
    province,
    clinic_id,
    treatment_start_date,
    status,
    is_minor,
  ];

  const [result] = await db.execute(query, params);

  // Obtener el paciente recién creado
  const getPatientQuery = `
    SELECT
      id,
      first_name,
      last_name,
      email,
      phone,
      dni,
      gender,
      occupation,
      DATE_FORMAT(birth_date, '%Y-%m-%d') as birth_date,
      street,
      street_number,
      door,
      postal_code,
      city,
      province,
      clinic_id,
      DATE_FORMAT(treatment_start_date, '%Y-%m-%d') as treatment_start_date,
      status,
      is_minor,
      DATE_FORMAT(created_at,'%Y-%m-%d') as created_at,
      DATE_FORMAT(updated_at,'%Y-%m-%d') as updated_at
    FROM patients
    WHERE id = ? AND is_active = true
  `;

  const [patientRows] = await db.execute(getPatientQuery, [result.insertId]);
  return patientRows[0];
};

// Restaurar un paciente (activar cambiando status a "en curso")
const restorePatient = async (db, id) => {
  // Primero verificar si el paciente existe y su status actual
  const checkQuery = `
    SELECT id, status, is_active
    FROM patients
    WHERE id = ? AND is_active = true
  `;

  const [patientRows] = await db.execute(checkQuery, [id]);

  if (patientRows.length === 0) {
    throw new Error("Patient not found");
  }

  const patient = patientRows[0];

  // Verificar si el paciente ya está activo (status "en curso")
  if (patient.status === "en curso") {
    throw new Error("Patient already active");
  }

  // Actualizar el status a "en curso" para reactivar al paciente
  const updateQuery = `
    UPDATE patients
    SET status = 'en curso', updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND is_active = true
  `;

  const [result] = await db.execute(updateQuery, [id]);
  return result.affectedRows > 0;
};

// Actualizar un paciente existente
const updatePatient = async (db, id, updateData) => {
  // Verificar que hay campos para actualizar
  if (Object.keys(updateData).length === 0) {
    throw new Error("No hay campos para actualizar");
  }

  // Construir la query dinámicamente
  const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
  const values = Object.values(updateData);

  const query = `
    UPDATE patients
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND is_active = true
  `;

  values.push(id);

  const [result] = await db.execute(query, values);

  if (result.affectedRows === 0) {
    return null;
  }

  // Obtener el paciente actualizado
  const getPatientQuery = `
    SELECT
      id,
      first_name,
      last_name,
      email,
      phone,
      dni,
      gender,
      occupation,
      DATE_FORMAT(birth_date, '%Y-%m-%d') as birth_date,
      street,
      street_number,
      door,
      postal_code,
      city,
      province,
      clinic_id,
      DATE_FORMAT(treatment_start_date, '%Y-%m-%d') as treatment_start_date,
      status,
      is_minor,
      DATE_FORMAT(created_at,'%Y-%m-%d') as created_at,
      DATE_FORMAT(updated_at,'%Y-%m-%d') as updated_at
    FROM patients
    WHERE id = ? AND is_active = true
  `;

  const [patientRows] = await db.execute(getPatientQuery, [id]);
  return patientRows[0];
};

// Obtener pacientes activos con información de clínica
const getActivePatientsWithClinicInfo = async (db) => {
  const query = `
    SELECT
      p.id as idPaciente,
      CONCAT(p.first_name, ' ', p.last_name) as nombreCompleto,
      p.clinic_id as idClinica,
      c.name as nombreClinica,
      c.price as precioSesion,
      c.percentage as porcentaje,
      CASE
        WHEN c.address IS NULL OR c.address = '' THEN 0
        ELSE 1
      END as presencial
    FROM patients p
    LEFT JOIN clinics c ON p.clinic_id = c.id
    WHERE p.is_active = 1 AND p.status = 'en curso' AND c.is_active = 1
    ORDER BY CONCAT(p.first_name, ' ', p.last_name)
  `;

  const [rows] = await db.execute(query);

  // Convert presencial from 0/1 to boolean
  return rows.map(row => ({
    ...row,
    presencial: Boolean(row.presencial)
  }));
};

module.exports = {
  getPatients,
  getPatientById,
  getInactivePatients,
  deletePatient,
  createPatient,
  restorePatient,
  updatePatient,
  getActivePatientsWithClinicInfo,
  hasFutureSessions,
};