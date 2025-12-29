export interface Clinic {
  id?: string;
  name: string;
  clinic_color: string;
  address: string;
  price: number;
  percentage: number;
  is_billable: boolean;
  cif?: string;
  fiscal_name?: string;
  billing_address?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}
