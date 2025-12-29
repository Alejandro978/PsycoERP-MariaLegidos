export interface Patient {
  id?: number; // Para edición

  // Datos personales básicos
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dni: string;
  gender: 'M' | 'F' | 'O';
  occupation: string;
  birth_date: string; // "1985-03-15"

  // Dirección completa
  street: string;
  street_number: string;
  door: string;
  postal_code: string;
  city: string;
  province: string;

  // Información del tratamiento
  clinic_id: number;
  treatment_start_date: string; // "2024-01-15"
  status:
    | 'en curso'
    | 'fin del tratamiento'
    | 'en pausa'
    | 'abandono'
    | 'derivación';

  // Información adicional de la clínica
  nombre_clinica?: string;
  tipo_clinica?: string;

  // Campos calculados/automáticos
  is_minor: boolean;

  // Timestamps del sistema
  created_at?: string; // ISO string format
  updated_at?: string; // ISO string format
}

// Interface for patient selector component
export interface PatientSelector {
  idPaciente: number;
  nombreCompleto: string;
  idClinica: number;
  nombreClinica: string;
  precioSesion: number;
  porcentaje: number;
  presencial?: boolean; // Added to handle mode selection
}

// Backward compatibility interface for existing code
export interface PatientLegacy {
  id?: number;
  name: string;
  surname?: string;
  email: string;
  phone: string;
  dni: string;
  birth_date: string;
  gender?: string;
  occupation?: string;
  street?: string;
  number?: string;
  door?: string;
  postal_code?: string;
  city?: string;
  province?: string;
  clinic_id?: string | number;
  treatment_start_date?: string;
  treatment_status?: string;
  is_minor?: boolean;
  status?: string;
  session_type?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_history?: string;
  current_medication?: string;
  allergies?: string;
  referred_by?: string;
  insurance_provider?: string;
  insurance_number?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PatientsResponse {
  data: Patient[];
}

// Interface for filtering patients
export interface PatientFilters {
  first_name?: string;
  last_name?: string;
  email?: string;
  dni?: string;
  gender?: 'M' | 'F' | 'O';
  clinic_id?: number;
  status?:
    | 'en curso'
    | 'fin del tratamiento'
    | 'en pausa'
    | 'abandono'
    | 'derivación';
}

// Create patient interface (without id and timestamps)
export type CreatePatientRequest = Omit<
  Patient,
  'id' | 'created_at' | 'updated_at'
>;

// Update patient interface
export type UpdatePatientRequest = Partial<Patient> & { id: number };
