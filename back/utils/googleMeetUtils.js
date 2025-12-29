const { initializeGoogleAuth } = require("../config/googleMeet");
const logger = require("./logger");

/**
 * Crea una sesión de Google Meet para una sesión de psicología
 * @param {Object} sessionData - Datos de la sesión
 * @param {string} hostname - Hostname de la request para seleccionar credenciales apropiadas
 * @returns {string} URL del Google Meet creado
 */
const crearSesionGoogleMeet = async (sessionData, hostname) => {
  try {
    const calendar = await initializeGoogleAuth(hostname);

    logger.log("Datos recibidos:", {
      session_date: sessionData.session_date,
      start_time: sessionData.start_time,
      end_time: sessionData.end_time,
    });

    const fechaSesion = new Date(sessionData.session_date);
    const año = fechaSesion.getUTCFullYear();
    const mes = String(fechaSesion.getUTCMonth() + 1).padStart(2, "0");
    const dia = String(fechaSesion.getUTCDate()).padStart(2, "0");
    const fechaFormateada = `${año}-${mes}-${dia}`;

    const horaInicio = sessionData.start_time.substring(0, 5);
    const horaFin = sessionData.end_time.substring(0, 5);

    const startDateTime = new Date(`${fechaFormateada}T${horaInicio}:00`);
    const endDateTime = new Date(`${fechaFormateada}T${horaFin}:00`);

    logger.log("Fechas procesadas:", {
      fechaFormateada,
      horaInicio,
      horaFin,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
    });

    const event = {
      summary: `Sesión Psicológica - ${sessionData.patient_name}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: "Europe/Madrid",
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: "Europe/Madrid",
      },
      conferenceData: {
        createRequest: {
          requestId: `psico-${sessionData.session_id}-${Date.now()}`,
          conferenceSolution: {
            key: {
              type: "hangoutsMeet",
            },
          },
        },
      },
    };

    logger.log("Evento a crear:", JSON.stringify(event, null, 2));

  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
  logger.log("Using calendarId:", calendarId);
    const response = await calendar.events.insert({
      calendarId,
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: "all",
    });

    logger.log(
      "Respuesta completa de Google:",
      JSON.stringify(response.data, null, 2)
    );
    logger.log("Conference data:", response.data.conferenceData);

    const meetLink = response.data.conferenceData?.entryPoints?.[0]?.uri;
    logger.success("Google Meet creado exitosamente:", meetLink);

    return meetLink;
  } catch (error) {
    logger.error("Error detallado:", error.message);
    if (error.response && error.response.data) {
      logger.error("Google API response:", JSON.stringify(error.response.data, null, 2));
    }
    logger.error("Causa:", error.cause?.message);
    throw new Error("No se pudo crear la sesión de Google Meet");
  }
};

module.exports = { crearSesionGoogleMeet };
