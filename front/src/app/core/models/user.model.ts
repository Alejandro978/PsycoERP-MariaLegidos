export interface User {
  id: number;
  email: string;
  name: string;
  last_login: string;
  license_number?: string;
  irpf?: string;
  iban?: string;
  dni?: string;
  street?: string;
  street_number?: string;
  door?: string;
  city?: string;
  province?: string;
  postal_code?: string;
}

export interface UserProfileResponse {
  data: User;
}

export interface UpdateUserProfileRequest {
  name: string;
  license_number?: string;
  irpf?: string;
  iban?: string;
  dni: string;
  street: string;
  street_number: string;
  door?: string;
  city: string;
  province: string;
  postal_code: string;
}
