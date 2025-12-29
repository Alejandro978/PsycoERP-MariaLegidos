// Internal model for component use
export interface Reminder {
  id: string;
  sessionId: number;
  patientName: string;
  startTime: string;
  endTime: string;
  sent: boolean;
}

// Model from GET /api/reminders/pending endpoint
export interface PendingReminderFromAPI {
  session_id: number;
  start_time: string;
  end_time: string;
  patient_name: string;
  reminder_sent: boolean;
}

// Response from GET /api/reminders/pending endpoint
export interface PendingRemindersResponse {
  data: PendingReminderFromAPI[];
}

// Response from POST /api/reminders endpoint
export interface SendReminderResponse {
  data: {
    whatsapp_deeplink: string;
  };
}