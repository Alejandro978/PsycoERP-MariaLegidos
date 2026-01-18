export interface TokenValidation {
  valid: boolean;
  expires_at: string;
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
}

export interface RegistrationResponse {
  success: boolean;
  patient: any;
}
