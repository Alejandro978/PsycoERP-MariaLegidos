export interface TokenValidation {
  valid: boolean;
  expires_at: string;
  clinic_id: number | null;
  clinic_name: string | null;
}

export interface PatientRegistration {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  birth_date: string;
  dni: string;
  gender: 'M' | 'F' | 'O';
  occupation?: string;
  street: string;
  street_number: string;
  door?: string;
  postal_code: string;
  city: string;
  province: string;
  // Campos de progenitores (solo para menores)
  progenitor1_full_name?: string;
  progenitor1_dni?: string;
  progenitor1_phone?: string;
  progenitor2_full_name?: string;
  progenitor2_dni?: string;
  progenitor2_phone?: string;
}

export interface RegistrationResponse {
  success: boolean;
  patient: any;
}
