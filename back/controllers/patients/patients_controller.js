const {
  getPatients,
  getPatientById,
  getInactivePatients,
  deletePatient,
  createPatient,
  restorePatient,
  updatePatient,
  getActivePatientsWithClinicInfo,
  hasFutureSessions,
} = require("../../models/patients/patients_model");
const logger = require("../../utils/logger");

const obtenerPacientes = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      dni,
      status,
      gender,
      occupation,
      clinic_id,
      is_minor,
      birth_date,
      fecha_desde,
      fecha_hasta,
      page,
      limit,
    } = req.query;

    // Validar parámetros de paginación
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10000;

    // Validaciones de límites
    if (pageNum < 1) {
      return res.status(400).json({
        success: false,
        error: "El número de página debe ser mayor a 0",
      });
    }

    if (limitNum < 1) {
      return res.status(400).json({
        success: false,
        error: "El límite debe ser mayor a 0",
      });
    }

    // Construir filtros incluyendo paginación
    const filters = {};
    if (first_name) filters.first_name = first_name;
    if (last_name) filters.last_name = last_name;
    if (email) filters.email = email;
    if (dni) filters.dni = dni;
    if (status) filters.status = status;
    if (gender) filters.gender = gender;
    if (occupation) filters.occupation = occupation;
    if (clinic_id) filters.clinic_id = clinic_id;
    if (is_minor !== undefined) filters.is_minor = is_minor;

    // Parámetros de paginación
    filters.page = pageNum;
    filters.limit = limitNum;

    // Lógica inteligente para fechas de nacimiento
    if (birth_date) {
      // Si envía fecha específica, usar esa
      filters.birth_date = birth_date;
    } else if (fecha_desde || fecha_hasta) {
      // Si envía rango, usar rango para fecha de creación
      if (fecha_desde) filters.fecha_desde = fecha_desde;
      if (fecha_hasta) filters.fecha_hasta = fecha_hasta;
    }

    const result = await getPatients(req.db, filters);

    res.json({
      success: true,
      pagination: result.pagination,
      data: result.data,
    });
  } catch (err) {
    logger.error("Error al obtener pacientes:", err.message);
    res.status(500).json({
      success: false,
      error: "Error al obtener los pacientes",
    });
  }
};

const obtenerPacientePorId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "ID del paciente es requerido",
      });
    }

    const pacienteData = await getPatientById(req.db, id);

    if (!pacienteData.PatientResume) {
      return res.status(404).json({
        success: false,
        error: "Paciente no encontrado",
      });
    }

    res.json({
      success: true,
      data: {
        PatientResume: pacienteData.PatientResume,
        PatientData: pacienteData.PatientData,
        PatientMedicalRecord: pacienteData.PatientMedicalRecord,
        PatientSessions: pacienteData.PatientSessions,
        PatientDocuments: pacienteData.PatientDocuments,
        PatientInvoice: [],
      },
    });
  } catch (err) {
    logger.error("Error al obtener paciente por ID:", err.message);
    res.status(500).json({
      success: false,
      error: "Error al obtener el paciente",
    });
  }
};

const obtenerPacientesInactivos = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      dni,
      status,
      gender,
      occupation,
      clinic_id,
      is_minor,
      birth_date,
      fecha_desde,
      fecha_hasta,
      page,
      limit,
    } = req.query;

    // Validar parámetros de paginación
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10000;

    // Validaciones de límites
    if (pageNum < 1) {
      return res.status(400).json({
        success: false,
        error: "El número de página debe ser mayor a 0",
      });
    }

    if (limitNum < 1) {
      return res.status(400).json({
        success: false,
        error: "El límite debe ser mayor a 0",
      });
    }

    // Construir filtros incluyendo paginación
    const filters = {};
    if (first_name) filters.first_name = first_name;
    if (last_name) filters.last_name = last_name;
    if (email) filters.email = email;
    if (dni) filters.dni = dni;
    if (status) filters.status = status;
    if (gender) filters.gender = gender;
    if (occupation) filters.occupation = occupation;
    if (clinic_id) filters.clinic_id = clinic_id;
    if (is_minor !== undefined) filters.is_minor = is_minor;

    // Parámetros de paginación
    filters.page = pageNum;
    filters.limit = limitNum;

    // Lógica inteligente para fechas de nacimiento
    if (birth_date) {
      // Si envía fecha específica, usar esa
      filters.birth_date = birth_date;
    } else if (fecha_desde || fecha_hasta) {
      // Si envía rango, usar rango para fecha de creación
      if (fecha_desde) filters.fecha_desde = fecha_desde;
      if (fecha_hasta) filters.fecha_hasta = fecha_hasta;
    }

    const result = await getInactivePatients(req.db, filters);

    res.json({
      success: true,
      pagination: result.pagination,
      data: result.data,
    });
  } catch (err) {
    logger.error("Error al obtener pacientes inactivos:", err.message);
    res.status(500).json({
      success: false,
      error: "Error al obtener los pacientes inactivos",
    });
  }
};

const eliminarPaciente = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "ID del paciente es requerido",
      });
    }
    // Comprobar si el paciente tiene sesiones futuras programadas
    const tieneSesionesFuturas = await hasFutureSessions(req.db, id);
    if (tieneSesionesFuturas) {
      return res.status(400).json({
        success: false,
        error: "No se puede eliminar el paciente: tiene sesiones programadas en el futuro",
      });
    }

    const eliminado = await deletePatient(req.db, id);

    if (!eliminado) {
      return res.status(404).json({
        success: false,
        error: "Paciente no encontrado o ya está eliminado",
      });
    }

    res.json({
      success: true,
      message: "Paciente eliminado correctamente",
    });
  } catch (err) {
    logger.error("Error al eliminar paciente:", err.message);
    res.status(500).json({
      success: false,
      error: "Error al eliminar el paciente",
    });
  }
};

const crearPaciente = async (req, res) => {
  try {
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
    } = req.body;

    // Validaciones obligatorias
    if (!first_name || !last_name || !email || !phone || !dni) {
      return res.status(400).json({
        success: false,
        error: "Los campos first_name, last_name, email, phone y dni son obligatorios",
      });
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "El formato del email no es válido",
      });
    }

    // Validación de género
    if (gender && !["M", "F", "O"].includes(gender)) {
      return res.status(400).json({
        success: false,
        error: "El género debe ser M, F o O",
      });
    }

    // Validación de status
    const validStatuses = ["en curso", "fin del tratamiento", "en pausa", "abandono", "derivación"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "El status debe ser uno de: " + validStatuses.join(", "),
      });
    }

    // Validación de clinic_id
    if (clinic_id && isNaN(clinic_id)) {
      return res.status(400).json({
        success: false,
        error: "El clinic_id debe ser un número válido",
      });
    }


    // Validación de is_minor
    if (is_minor !== undefined && typeof is_minor !== "boolean") {
      return res.status(400).json({
        success: false,
        error: "El campo is_minor debe ser un valor booleano",
      });
    }

    const patientData = {
      first_name,
      last_name,
      email,
      phone,
      dni,
      gender: gender || "O",
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
      status: status || "en curso",
      is_minor,
    };

    const nuevoPaciente = await createPatient(req.db, patientData);

    res.status(201).json({
      success: true,
      data: nuevoPaciente,
      message: "Paciente creado exitosamente",
    });
  } catch (err) {
    logger.error("Error al crear paciente:", err.message);

    // Manejo de errores específicos de base de datos
    if (err.code === 'ER_DUP_ENTRY') {
      if (err.message.includes('email')) {
        return res.status(409).json({
          success: false,
          error: "El email ya está registrado para otro paciente",
        });
      }
      if (err.message.includes('dni')) {
        return res.status(409).json({
          success: false,
          error: "El DNI ya está registrado para otro paciente",
        });
      }
    }

    res.status(500).json({
      success: false,
      error: "Error al crear el paciente",
    });
  }
};

const restaurarPaciente = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "ID del paciente es requerido",
      });
    }

    // Validar que el ID sea un número válido
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "ID del paciente debe ser un número válido",
      });
    }

    const restaurado = await restorePatient(req.db, id);

    if (!restaurado) {
      return res.status(500).json({
        success: false,
        error: "Error interno al activar el paciente",
      });
    }

    res.json({
      success: true,
      message: "Paciente activado exitosamente. Status cambiado a 'en curso'",
    });
  } catch (err) {
    logger.error("Error al activar paciente:", err.message);

    if (err.message === "Patient not found") {
      return res.status(404).json({
        success: false,
        error: "Paciente no encontrado",
      });
    }

    if (err.message === "Patient already active") {
      return res.status(409).json({
        success: false,
        error: "El paciente ya está activo (status: en curso)",
      });
    }

    res.status(500).json({
      success: false,
      error: "Error al activar el paciente",
    });
  }
};

const actualizarPaciente = async (req, res) => {
  try {
    const { id } = req.params;
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
    } = req.body;

    // Validar que se proporcione el ID y sea un número válido
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "ID es requerido y debe ser un número válido",
      });
    }

    // Crear objeto con los datos a actualizar (solo campos no undefined)
    const updateData = {};
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (dni !== undefined) updateData.dni = dni;
    if (gender !== undefined) updateData.gender = gender;
    if (occupation !== undefined) updateData.occupation = occupation;
    if (birth_date !== undefined) updateData.birth_date = birth_date;
    if (street !== undefined) updateData.street = street;
    if (street_number !== undefined) updateData.street_number = street_number;
    if (door !== undefined) updateData.door = door;
    if (postal_code !== undefined) updateData.postal_code = postal_code;
    if (city !== undefined) updateData.city = city;
    if (province !== undefined) updateData.province = province;
    if (clinic_id !== undefined) updateData.clinic_id = clinic_id;
    if (treatment_start_date !== undefined) updateData.treatment_start_date = treatment_start_date;
    if (status !== undefined) updateData.status = status;
    if (is_minor !== undefined) updateData.is_minor = is_minor;

    // Validar que se envíe al menos un campo
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: "Debe proporcionar al menos un campo para actualizar",
      });
    }

    // Validaciones de formato si se proporcionan los campos
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: "El formato del email no es válido",
      });
    }

    if (gender && !["M", "F", "O"].includes(gender)) {
      return res.status(400).json({
        success: false,
        error: "El género debe ser M, F o O",
      });
    }

    const validStatuses = ["en curso", "fin del tratamiento", "en pausa", "abandono", "derivación"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "El status debe ser uno de: " + validStatuses.join(", "),
      });
    }

    if (clinic_id && isNaN(clinic_id)) {
      return res.status(400).json({
        success: false,
        error: "El clinic_id debe ser un número válido",
      });
    }


    if (is_minor !== undefined && typeof is_minor !== "boolean") {
      return res.status(400).json({
        success: false,
        error: "El campo is_minor debe ser un valor booleano",
      });
    }

    const pacienteActualizado = await updatePatient(req.db, parseInt(id), updateData);

    if (!pacienteActualizado) {
      return res.status(404).json({
        success: false,
        error: "Paciente no encontrado o no está activo",
      });
    }

    res.json({
      success: true,
      data: pacienteActualizado,
      message: "Paciente actualizado exitosamente",
    });
  } catch (err) {
    logger.error("Error al actualizar paciente:", err.message);

    // Manejo de errores específicos de base de datos
    if (err.code === 'ER_DUP_ENTRY') {
      if (err.message.includes('email')) {
        return res.status(409).json({
          success: false,
          error: "El email ya está registrado para otro paciente",
        });
      }
      if (err.message.includes('dni')) {
        return res.status(409).json({
          success: false,
          error: "El DNI ya está registrado para otro paciente",
        });
      }
    }

    res.status(500).json({
      success: false,
      error: "Error al actualizar el paciente",
    });
  }
};

const obtenerPacientesActivosConClinica = async (req, res) => {
  try {
    const datos = await getActivePatientsWithClinicInfo(req.db);

    res.json({
      success: true,
      total: datos.length,
      data: datos,
    });
  } catch (err) {
    logger.error("Error al obtener pacientes activos con clínica:", err.message);
    res.status(500).json({
      success: false,
      error: "Error al obtener pacientes activos con información de clínica",
    });
  }
};

module.exports = {
  obtenerPacientes,
  obtenerPacientePorId,
  obtenerPacientesInactivos,
  eliminarPaciente,
  crearPaciente,
  restaurarPaciente,
  actualizarPaciente,
  obtenerPacientesActivosConClinica,
};