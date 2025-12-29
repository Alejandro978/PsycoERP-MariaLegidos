/**
 * Modelos de datos para el módulo de facturación
 */

export interface ClinicTotal {
  clinic_name: string;
  total_sessions: number;
  total_gross: number;
  clinic_percentage: number;
  total_net: number;
}

export interface InvoiceKPIs {
  filters_applied: {
    month: number;
    year: number;
  };
  card1_total_invoices_issued: number;
  card2_total_gross_historic: number;
  card3_total_gross_filtered: number;
  card4_total_net_filtered: number;
  card5_total_net_by_clinic: ClinicTotal[];
}

export interface ClinicInfo {
  clinic_name: string;
  color: string;
}

export interface SessionDetail {
  session_id: number;
  session_date: string;
  price: number;
}

export interface PendingInvoice {
  patient_id: number;
  patient_full_name: string;
  dni: string;
  email: string;
  patient_address_line1: string;
  patient_address_line2: string;
  clinic_name: string;
  sessions: SessionDetail[];
  pending_sessions_count: number;
  total_gross: number;
}

export interface PendingInvoicesResponse {
  filters_applied: {
    month: number;
    year: number;
  };
  pending_invoices: PendingInvoice[];
}

export interface ExistingInvoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  patient_id: number;
  patient_full_name: string;
  dni: string;
  email: string;
  patient_address_line1: string;
  patient_address_line2: string;
  sessions: SessionDetail[];
  sessions_count: number;
  total: number;
  concept: string;
}

export interface ExistingInvoicesResponse {
  filters_applied: {
    month: number;
    year: number;
  };
  total_invoices: number;
  invoices: ExistingInvoice[];
}

export interface ApiResponse<T> {
  data: T;
}

/**
 * Request para crear una factura individual
 */
export interface CreateInvoiceRequest {
  invoice_number: string;
  invoice_date: string;
  patient_id: number;
  session_ids: number[];
  concept: string;
}

/**
 * Request para crear facturas en bulk
 */
export type CreateBulkInvoicesRequest = CreateInvoiceRequest[];

/**
 * Response de creación de factura
 */
export interface CreateInvoiceResponse {
  success: boolean;
  message: string;
  invoice_id?: number;
}

/**
 * Desglose de sesiones por precio unitario
 */
export interface SessionsByPrice {
  unit_price: number;
  sessions_count: number;
  total_net: number;
  concept: string;
}

/**
 * Datos de facturación pendiente por clínica
 */
export interface ClinicInvoiceData {
  clinic_id: number;
  clinic_name: string;
  total_sessions: number;
  total_net_clinic: number;
  sessions_data: SessionsByPrice[];
}

/**
 * Response de facturas pendientes de clínicas
 * El API devuelve directamente un array en el campo data
 */
export type PendingClinicInvoicesResponse = ClinicInvoiceData[];

/**
 * Datos agregados de facturas de clínica por período
 * Representa un resumen de todas las facturas de una clínica en un mes/año específico
 */
export interface ExistingClinicInvoice {
  clinic_id: number;
  clinic_name: string;
  fiscal_name: string;
  cif: string;
  billing_address: string;
  invoice_numbers: string[];
  last_invoice_date: string;
  concepts: string[];
  total_invoices: number;
  total_sessions: number;
  total_net_clinic: number;
  total_invoiced: number;
  sessions_data: SessionsByPrice[];
}

/**
 * Response de facturas existentes de clínicas
 */
export interface ExistingClinicInvoicesResponse {
  filters_applied: {
    month: number;
    year: number;
  };
  total_clinics: number;
  clinics: ExistingClinicInvoice[];
}
