const WHATSAPP_MESSAGE_TEMPLATES = {
  REMINDER_1: {
    id: "reminder_1",
    template: (patientName, dateStr, startTime) =>
      `Hola ${patientName}, 

Te recordamos tu cita de psicología:
📅 Fecha: ${dateStr}
🕐 Hora: ${startTime}

¡Te esperamos!`,
  },

  REMINDER_2: {
    id: "reminder_2",
    template: (patientName, dateStr, startTime) =>
      `Buenos días ${patientName} 👋

Tu próxima sesión está programada para:
📆 ${dateStr}
⏰ ${startTime}

¡Nos vemos pronto!`,
  },

  REMINDER_3: {
    id: "reminder_3",
    template: (patientName, dateStr, startTime) =>
      `¡Hola ${patientName}! 🌟

No olvides tu cita:
• Fecha: ${dateStr}
• Hora: ${startTime}

Estamos aquí para apoyarte. ¡Te esperamos!`,
  },

  REMINDER_4: {
    id: "reminder_4",
    template: (patientName, dateStr, startTime) =>
      `Estimado/a ${patientName},

Le recordamos su cita de terapia:
📋 Fecha: ${dateStr}
🕒 Horario: ${startTime}

Quedamos a su disposición.`,
  },

  REMINDER_5: {
    id: "reminder_5",
    template: (patientName, dateStr, startTime) =>
      `👋 ${patientName}

Recordatorio amistoso de tu sesión:
🗓️ ${dateStr} a las ${startTime}

¡Que tengas un excelente día y nos vemos pronto!`,
  },
};

const getRandomTemplate = () => {
  const templates = Object.values(WHATSAPP_MESSAGE_TEMPLATES);
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
};

module.exports = {
  WHATSAPP_MESSAGE_TEMPLATES,
  getRandomTemplate,
};
