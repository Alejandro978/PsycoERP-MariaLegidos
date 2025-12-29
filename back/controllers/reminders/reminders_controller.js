const {
  getPendingReminders,
  createReminder,
} = require("../../models/reminders/reminders_model");

const { crearSesionGoogleMeet } = require("../../utils/googleMeetUtils");
const logger = require("../../utils/logger");

const obtenerRecordatoriosPendientes = async (req, res) => {
  try {
    const result = await getPendingReminders(req.db);

    // Determinar el día de la semana actual para el mensaje
    const today = new Date();
    const dayOfWeek = today.getDay();

    let dayDescription;
    if (dayOfWeek >= 1 && dayOfWeek <= 4) {
      dayDescription = "mañana";
    } else {
      dayDescription = "el próximo lunes";
    }

    res.json({
      success: true,
      data: result.sessions,
      total: result.total,
      message: `Sesiones programadas para ${dayDescription} (${result.targetDate})`,
      metadata: {
        targetDate: result.targetDate,
        currentDay: dayOfWeek,
        description: `Sesiones de ${dayDescription}`,
      },
    });
  } catch (err) {
    logger.error("Error al obtener recordatorios pendientes:", err.message);
    res.status(500).json({
      success: false,
      error: "Error al obtener los recordatorios pendientes",
      message: "Ha ocurrido un error interno del servidor",
    });
  }
};

const crearRecordatorio = async (req, res) => {
  try {
    const { session_id } = req.body;

    // Validar que se proporcione el session_id
    if (!session_id || isNaN(session_id)) {
      return res.status(400).json({
        success: false,
        error: "session_id es requerido y debe ser un número válido",
        message: "Debe proporcionar un ID de sesión válido",
      });
    }

    const reminderData = await createReminder(req.db, parseInt(session_id));

    // Generar mensaje de WhatsApp personalizado (pasa hostname para Google Meet)
    const whatsappMessage = await generarMensajeWhatsApp(reminderData, req.hostname);

    // Generar deeplink de WhatsApp
    const whatsappDeeplink = generarDeeplinkWhatsApp(
      reminderData.patient_phone,
      whatsappMessage
    );

    res.status(201).json({
      success: true,
      data: {
        whatsapp_deeplink: whatsappDeeplink,
      },
      message: "Recordatorio creado exitosamente con deeplink de WhatsApp",
    });
  } catch (err) {
    logger.error("Error al crear recordatorio:", err.message);

    // Manejar errores específicos
    if (err.message === "Session not found or not scheduled") {
      return res.status(404).json({
        success: false,
        error: "Sesión no encontrada o está cancelada",
        message: "La sesión debe existir y estar en estado distinto de 'cancelada'",
      });
    }

    if (err.message === "Reminder already exists for this session") {
      return res.status(409).json({
        success: false,
        error: "Ya existe un recordatorio para esta sesión",
        message: "No se puede crear un recordatorio duplicado",
      });
    }

    res.status(500).json({
      success: false,
      error: "Error al crear el recordatorio",
      message: "Ha ocurrido un error interno del servidor",
    });
  }
};

// Función para generar mensaje de WhatsApp personalizado
const generarMensajeWhatsApp = async (sessionData, hostname) => {
  const fecha = new Date(sessionData.session_date);
  const fechaFormateada = fecha.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const horaInicio = sessionData.start_time.slice(0, 5);

  let mensaje = `*RECORDATORIO DE CITA PSICOLÓGICA*\n\n`;
  mensaje += `Hola ${sessionData.patient_name},\n\n`;
  mensaje += `Te recuerdo que tienes una cita programada para:\n\n`;
  mensaje += `*Fecha:* ${fechaFormateada}\n`;
  mensaje += `*Hora:* ${horaInicio}\n`;
  mensaje += `*Modalidad:* ${
    sessionData.mode === "presencial" ? "Presencial" : "Online"
  }\n`;

  if (sessionData.mode === "presencial" && sessionData.clinic_name) {
    mensaje += `*Clínica:* ${sessionData.clinic_name}\n`;
    if (sessionData.clinic_address) {
      mensaje += `*Dirección:* ${sessionData.clinic_address}\n`;
    }
  } else if (sessionData.mode === "online") {
    try {
      // Crear Google Meet REAL (con hostname para seleccionar credenciales)
      const meetLink = await crearSesionGoogleMeet(sessionData, hostname);
      mensaje += `*Enlace de la sesión:* ${meetLink}\n`;
      logger.log("Google Meet creado exitosamente");
    } catch (error) {
      // Fallback al enlace falso
      logger.warn("Fallback a enlace falso:", error.message);
      const meetId = generarIdGoogleMeet();
      mensaje += `*Enlace de la sesión:* https://meet.google.com/${meetId}\n`;
    }
  }

  mensaje += `¡Confírmame asistencia cuando puedas!\n\n`;
  return mensaje;
};

// Función para generar ID aleatorio de Google Meet
const generarIdGoogleMeet = () => {
  const caracteres = "abcdefghijklmnopqrstuvwxyz";
  const generarSegmento = (longitud) => {
    let resultado = "";
    for (let i = 0; i < longitud; i++) {
      resultado += caracteres.charAt(
        Math.floor(Math.random() * caracteres.length)
      );
    }
    return resultado;
  };

  return `${generarSegmento(3)}-${generarSegmento(4)}-${generarSegmento(3)}`;
};

// Función para generar deeplink de WhatsApp
const generarDeeplinkWhatsApp = (telefono, mensaje) => {
  // Limpiar el número de teléfono (solo números)
  const telefonoLimpio = telefono.replace(/\D/g, "");

  // Asegurar que el código de país esté presente (España por defecto)
  const telefonoFinal = telefonoLimpio.startsWith("34")
    ? telefonoLimpio
    : `34${telefonoLimpio}`;

  // Codificar el mensaje para URL manteniendo los emojis
  const mensajeCodificado = encodeURIComponent(mensaje);

  // Generar deeplink de WhatsApp
  return `https://wa.me/${telefonoFinal}?text=${mensajeCodificado}`;
};

module.exports = {
  obtenerRecordatoriosPendientes,
  crearRecordatorio,
};
