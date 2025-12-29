// API Response interfaces for patient detail endpoint
export interface PatientDetailResponse {
  success: boolean;
  data: PatientDetailData;
}

export interface PatientDetailData {
  PatientResume: PatientResume;
  PatientData: PatientData;
  PatientMedicalRecord: PatientMedicalRecord[];
  PatientSessions: PatientSession[];
  PatientInvoice: any[];
  PatientDocuments: PatientDocument[];
}

export interface PatientMedicalRecord {
  id?: number;
  titulo: string;
  contenido: string;
  fecha: string; // "2025-08-26 07:48:17"
}

export interface PatientResume {
  id: number;
  email: string;
  phone: string;
  preferred_mode: string;
  PatientSessionsStatus: {
    completed_sessions: string;
    scheduled_sessions: string;
    cancelled_sessions: string;
  };
  PatientResumeSessions: PatientResumeSession[];
  PatientResumeInvoice: {
    total_spent_current_year: string;
    invoices_issued: number;
  };
}

export interface PatientResumeSession {
  tipo: string;
  fecha: string; // "15/01/2025"
  precio: string;
  metodo_pago: string;
}

export interface PatientSession {
  id?: number;
  fecha: string; // "2025-07-29"
  clinica: string;
  estado: 'completada' | 'cancelada';
  precio: string;
  precio_neto: string;
  tipo_pago: string;
  notas: string | null;
}

export interface PatientData {
  nombre: string;
  apellidos: string;
  dni: string;
  fecha_nacimiento: string; // "1995-01-14"
  estado: string; // "en curso"
  email: string;
  telefono: string;
  calle: string;
  numero: string;
  puerta: string;
  codigo_postal: string;
  ciudad: string;
  provincia: string;
  genero: 'M' | 'F' | 'O';
  ocupacion: string;
  clinic_id: number;
  fecha_inicio_tratamiento: string; // "2025-05-12"
  menor_edad: number; // 0 or 1
  nombre_clinica: string;
  tipo_clinica: string;
}

// Helper functions for data transformation
export class PatientDetailUtils {
  static transformPatientData(apiData: PatientData): Patient {
    return {
      id: undefined, // Will be set from PatientResume
      first_name: apiData.nombre,
      last_name: apiData.apellidos,
      email: apiData.email,
      phone: apiData.telefono,
      dni: apiData.dni,
      gender: apiData.genero,
      occupation: apiData.ocupacion,
      birth_date: apiData.fecha_nacimiento,
      street: apiData.calle,
      street_number: apiData.numero,
      door: apiData.puerta,
      postal_code: apiData.codigo_postal,
      city: apiData.ciudad,
      province: apiData.provincia,
      clinic_id: apiData.clinic_id,
      treatment_start_date: apiData.fecha_inicio_tratamiento,
      status: apiData.estado as 'en curso' | 'fin del tratamiento' | 'en pausa' | 'abandono' | 'derivación',
      nombre_clinica: apiData.nombre_clinica,
      tipo_clinica: apiData.tipo_clinica,
      is_minor: apiData.menor_edad === 1
    };
  }

  static transformResumeSessionToSession(resumeSession: PatientResumeSession): Session {
    return {
      type: this.capitalize(resumeSession?.tipo || ''),
      date: this.parseSpanishDate(resumeSession?.fecha || '01/01/2024'),
      price: parseFloat(resumeSession?.precio || '0'),
      netPrice: 0,
      paymentMethod: this.capitalize(resumeSession?.metodo_pago || ''),
      status: 'completada'
    };
  }

  static transformPatientSessionToSession(patientSession: PatientSession): Session {
    return {
      type: '',
      date: this.parseISODate(patientSession?.fecha || '2024-01-01'),
      price: parseFloat(patientSession?.precio || '0'),
      netPrice: parseFloat(patientSession?.precio_neto || '0'),
      paymentMethod: this.capitalize(patientSession?.tipo_pago || ''),
      status: patientSession?.estado || 'completada'
    };
  }

  static parseISODate(dateStr: string): Date {
    // Convert "2025-10-05" to Date
    if (!dateStr || dateStr.trim() === '') {
      return new Date();
    }
    return new Date(dateStr);
  }

  static parseSpanishDate(dateStr: string): Date {
    // Convert "15/01/2025" to Date
    if (!dateStr || dateStr.trim() === '') {
      return new Date(); // Return current date as fallback
    }

    const parts = dateStr.split('/');
    if (parts.length !== 3) {
      return new Date(); // Return current date if format is invalid
    }

    const [day, month, year] = parts.map(num => parseInt(num));
    return new Date(year, month - 1, day);
  }

  static capitalize(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

}

// Import the existing Patient interface
import { Patient } from './patient.model';

// Compatible interfaces for existing PatientSummary component
export interface Session {
  type: string;
  date: Date;
  price: number;
  netPrice: number;
  paymentMethod: string;
  status: 'completada' | 'cancelada';
}

export interface Invoice {
  id: string;
  patientId: number;
  patientName: string;
  patientDni: string;
  amount: number;
  date: Date;
  status: 'paid' | 'pending' | 'overdue';
}

export interface Bonus {
  id: string;
  patientId: number;
  patientName: string;
  type: string;
  amount: number;
  remaining: number;
  expiryDate: Date;
  status: 'active' | 'expired' | 'used';
}

export interface PatientDocument {
  id: number;
  name: string;
  type: string;
  size: string;
  upload_date: string;
  description?: string;
  file_url?: string;
}