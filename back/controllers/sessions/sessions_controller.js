const {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
  getSessionForWhatsApp,
  checkTimeOverlap,
  getSessionsKPIs,
} = require("../../models/sessions/sessions_model");

const { getRandomTemplate } = require("../../constants/whatsapp-templates");
const logger = require("../../utils/logger");

const obtenerSesiones = async (req, res) => {
  try {
    const {
      patient_id,
      status,
      clinic_id,
      session_date,
      fecha_desde,
      fecha_hasta,
      payment_method,
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
    if (patient_id) filters.patient_id = patient_id;
    if (status) filters.status = status;
    if (clinic_id) filters.clinic_id = clinic_id;
    if (payment_method) filters.payment_method = payment_method;

    // Parámetros de paginación
    filters.page = pageNum;
    filters.limit = limitNum;

    // Lógica inteligente para fechas
    if (session_date) {
      // Si envía fecha específica, usar esa
      filters.session_date = session_date;
    } else if (fecha_desde || fecha_hasta) {
      // Si envía rango, usar rango
      if (fecha_desde) filters.fecha_desde = fecha_desde;
      if (fecha_hasta) filters.fecha_hasta = fecha_hasta;
    }

    const result = await getSessions(req.db, filters);

    res.json({
      success: true,
      pagination: result.pagination,
      data: result.data,
    });
  } catch (err) {
    logger.error("Error al obtener sesiones:", err.message);
    res.status(500).json({
      success: false,
      error: "Error al obtener las sesiones",
    });
  }
};

const crearSesion = async (req, res) => {
  try {
    const {
      patient_id,
      clinic_id,
      session_date,
      start_time,
      end_time,
      mode,
      status = "completada",
      price = 0.0,
      payment_method = "tarjeta",
      notes,
    } = req.body;

    // Validar campos obligatorios
    if (
      !patient_id ||
      !clinic_id ||
      !session_date ||
      !start_time ||
      !end_time ||
      !mode
    ) {
      return res.status(400).json({
        success: false,
        error: "Faltan campos obligatorios",
        required_fields: [
          "patient_id",
          "clinic_id",
          "session_date",
          "start_time",
          "end_time",
          "mode",
        ],
      });
    }

    // Validar horario laboral (7:00 - 22:00)
    const startHour = parseInt(start_time.split(':')[0]);
    const startMinute = parseInt(start_time.split(':')[1]);
    const endHour = parseInt(end_time.split(':')[0]);
    const endMinute = parseInt(end_time.split(':')[1]);

    // Hora de inicio debe ser >= 07:00
    if (startHour < 7) {
      return res.status(400).json({
        success: false,
        error: "La hora de inicio no puede ser anterior a las 07:00",
      });
    }

    // Hora de fin debe ser <= 22:00
    if (endHour > 22 || (endHour === 22 && endMinute > 0)) {
      return res.status(400).json({
        success: false,
        error: "La hora de fin no puede ser posterior a las 22:00",
      });
    }

    // Validar que start_time sea anterior a end_time
    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = endHour * 60 + endMinute;

    if (startTimeMinutes >= endTimeMinutes) {
      return res.status(400).json({
        success: false,
        error: "La hora de inicio debe ser anterior a la hora de fin",
      });
    }

    // Validar duración máxima de 1 hora (60 minutos)
    const durationMinutes = endTimeMinutes - startTimeMinutes;
    if (durationMinutes > 60) {
      return res.status(400).json({
        success: false,
        error: "La duración de la sesión no puede exceder 1 hora (60 minutos)",
      });
    }

    // Verificar si hay solapamiento de horarios
    const overlappingSession = await checkTimeOverlap(req.db, session_date, start_time, end_time);

    if (overlappingSession) {
      return res.status(409).json({
        success: false,
        error: "El horario de esta sesión se solapa con otra sesión existente. Por favor, selecciona un horario diferente.",
        conflicting_session: {
          id: overlappingSession.id,
          start_time: overlappingSession.start_time,
          end_time: overlappingSession.end_time,
          status: overlappingSession.status,
          patient_id: overlappingSession.patient_id,
          patient_name: overlappingSession.patient_name,
        },
      });
    }

    const nuevaSesion = await createSession(req.db, {
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
    });

    res.status(201).json({
      success: true,
      message: "Sesión creada exitosamente",
      data: nuevaSesion,
    });
  } catch (err) {
    logger.error("Error al crear sesión:", err.message);
    res.status(500).json({
      success: false,
      error: "Error al crear la sesión",
    });
  }
};

const actualizarSesion = async (req, res) => {
  try {
    const { id } = req.params;

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
    } = req.body;

    // Validar que el ID sea válido
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: "ID de sesión inválido",
      });
    }

    // Construir objeto con solo los campos que se envían
    const updateData = {};
    if (patient_id) updateData.patient_id = patient_id;
    if (clinic_id) updateData.clinic_id = clinic_id;
    if (session_date) updateData.session_date = session_date;
    if (start_time) updateData.start_time = start_time;
    if (end_time) updateData.end_time = end_time;
    if (mode) updateData.mode = mode;
    if (status) updateData.status = status;
    if (price) updateData.price = price;
    if (payment_method) updateData.payment_method = payment_method;
    if (notes) updateData.notes = notes;

    // Verificar que se envió al menos un campo para actualizar
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No se proporcionaron campos para actualizar",
      });
    }

    // Si se está actualizando session_date, start_time o end_time, validar horarios
    if (session_date || start_time || end_time) {
      // Obtener sesión actual para tener todos los datos
      const [currentSession] = await req.db.execute(
        "SELECT session_date, start_time, end_time FROM sessions WHERE id = ? AND is_active = true",
        [parseInt(id)]
      );

      if (currentSession.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Sesión no encontrada",
        });
      }

      // Usar los valores nuevos si se proporcionan, o los actuales si no
      const finalSessionDate = session_date || currentSession[0].session_date;
      const finalStartTime = start_time || currentSession[0].start_time;
      const finalEndTime = end_time || currentSession[0].end_time;

      // Validar horario laboral (7:00 - 22:00) si se modifican las horas
      if (start_time || end_time) {
        const startHour = parseInt(finalStartTime.split(':')[0]);
        const startMinute = parseInt(finalStartTime.split(':')[1]);
        const endHour = parseInt(finalEndTime.split(':')[0]);
        const endMinute = parseInt(finalEndTime.split(':')[1]);

        // Hora de inicio debe ser >= 07:00
        if (startHour < 7) {
          return res.status(400).json({
            success: false,
            error: "La hora de inicio no puede ser anterior a las 07:00",
          });
        }

        // Hora de fin debe ser <= 22:00
        if (endHour > 22 || (endHour === 22 && endMinute > 0)) {
          return res.status(400).json({
            success: false,
            error: "La hora de fin no puede ser posterior a las 22:00",
          });
        }

        // Validar que start_time sea anterior a end_time
        const startTimeMinutes = startHour * 60 + startMinute;
        const endTimeMinutes = endHour * 60 + endMinute;

        if (startTimeMinutes >= endTimeMinutes) {
          return res.status(400).json({
            success: false,
            error: "La hora de inicio debe ser anterior a la hora de fin",
          });
        }

        // Validar duración máxima de 1 hora (60 minutos)
        const durationMinutes = endTimeMinutes - startTimeMinutes;
        if (durationMinutes > 60) {
          return res.status(400).json({
            success: false,
            error: "La duración de la sesión no puede exceder 1 hora (60 minutos)",
          });
        }
      }

      // Verificar solapamiento excluyendo la sesión actual
      const overlappingSession = await checkTimeOverlap(
        req.db,
        finalSessionDate,
        finalStartTime,
        finalEndTime,
        parseInt(id)
      );

      if (overlappingSession) {
        return res.status(409).json({
          success: false,
          error: "El horario de esta sesión se solapa con otra sesión existente. Por favor, selecciona un horario diferente.",
          conflicting_session: {
            id: overlappingSession.id,
            start_time: overlappingSession.start_time,
            end_time: overlappingSession.end_time,
            status: overlappingSession.status,
            patient_id: overlappingSession.patient_id,
            patient_name: overlappingSession.patient_name,
          },
        });
      }
    }

    const sesionActualizada = await updateSession(req.db, parseInt(id), updateData);

    res.json({
      success: true,
      message: "Sesión actualizada exitosamente",
      data: sesionActualizada,
    });
  } catch (err) {
    logger.error("Error al actualizar sesión:", err.message);
    res.status(500).json({
      success: false,
      error: "Error al actualizar la sesión",
    });
  }
};

const eliminarSesion = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea válido
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: "ID de sesión inválido",
      });
    }

    await deleteSession(req.db, parseInt(id));

    res.json({
      success: true,
      message: "Sesión eliminada exitosamente",
    });
  } catch (err) {
    logger.error("Error al eliminar sesión:", err.message);

    if (err.message === "Sesión no encontrada o ya está eliminada") {
      return res.status(404).json({
        success: false,
        error: "Sesión no encontrada o ya está eliminada",
      });
    }

    res.status(500).json({
      success: false,
      error: "Error al eliminar la sesión",
    });
  }
};

const obtenerEnlaceWhatsApp = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea válido
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: "ID de sesión inválido",
      });
    }

    // Obtener datos de la sesión con paciente
    const sessionData = await getSessionForWhatsApp(req.db, parseInt(id));

    if (!sessionData) {
      return res.status(404).json({
        success: false,
        error: "Sesión no encontrada o paciente inactivo",
      });
    }

    // Validar que la sesión no esté cancelada
    if (sessionData.status === "cancelada") {
      return res.status(400).json({
        success: false,
        error: "Solo se pueden generar enlaces para sesiones programadas",
      });
    }

    // Validar que el paciente tenga teléfono
    if (!sessionData.patient_phone) {
      return res.status(400).json({
        success: false,
        error: "El paciente no tiene número de teléfono registrado",
      });
    }

    // Limpiar número de teléfono (quitar espacios, guiones, etc.)
    const cleanPhone = sessionData.patient_phone
      .replace(/[\s\-\(\)]/g, "")
      .replace(/^\+/, "");

    // Validar formato de teléfono
    if (!/^\d{9,15}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        error: "Número de teléfono inválido",
      });
    }

    // Formatear fecha y hora
    const sessionDate = new Date(sessionData.session_date);
    const dateStr = sessionDate.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Obtener plantilla aleatoria y formatear mensaje
    const randomTemplate = getRandomTemplate();
    const message = randomTemplate.template(
      sessionData.patient_name, 
      dateStr, 
      sessionData.start_time
    );

    // Generar URL de WhatsApp con mensaje codificado
    const whatsappUrl = `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;

    res.json({
      success: true,
      data: {
        session_id: sessionData.id,
        patient_name: sessionData.patient_name,
        session_date: sessionData.session_date,
        start_time: sessionData.start_time,
        phone: sessionData.patient_phone,
        clean_phone: cleanPhone,
        whatsapp_url: whatsappUrl,
        message: message,
        template_used: randomTemplate.id,
      },
    });
  } catch (err) {
    logger.error("Error al generar enlace de WhatsApp:", err.message);
    res.status(500).json({
      success: false,
      error: "Error al generar enlace de WhatsApp",
    });
  }
};

const obtenerKPIsSesiones = async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta, clinic_id, status, payment_method } = req.query;

    const filters = {};
    if (fecha_desde) filters.fecha_desde = fecha_desde;
    if (fecha_hasta) filters.fecha_hasta = fecha_hasta;
    if (clinic_id) filters.clinic_id = clinic_id;
    if (status) filters.status = status;
    if (payment_method) filters.payment_method = payment_method;

    // Validación de rango de fechas no mayor a 3 años
    if (fecha_desde && fecha_hasta) {
      const startDate = new Date(fecha_desde);
      const endDate = new Date(fecha_hasta);
      const diffYears = (endDate - startDate) / (1000 * 60 * 60 * 24 * 365);
      if (diffYears > 3) {
        return res.status(400).json({
          success: false,
          error: "El rango de fechas no puede exceder los 3 años."
        });
      }
    }

    const kpis = await getSessionsKPIs(req.db, filters);

    res.json({
      success: true,
      data: kpis,
    });
  } catch (err) {
    logger.error("Error al obtener KPIs de sesiones:", err.message);
    res.status(500).json({
      success: false,
      error: "Error al obtener los KPIs de sesiones",
    });
  }
};

module.exports = {
  obtenerSesiones,
  crearSesion,
  actualizarSesion,
  eliminarSesion,
  obtenerEnlaceWhatsApp,
  obtenerKPIsSesiones,
};
