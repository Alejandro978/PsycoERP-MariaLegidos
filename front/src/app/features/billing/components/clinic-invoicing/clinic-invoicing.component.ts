import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicInvoiceData, ExistingClinicInvoice } from '../../models/billing.models';
import { ExistingClinicInvoicesComponent } from '../existing-clinic-invoices/existing-clinic-invoices.component';

/**
 * Componente de facturación de clínicas con subtabs
 * Gestiona la selección y generación de facturas para clínicas
 * Incluye visualización de facturas existentes de clínicas
 */
@Component({
  selector: 'app-clinic-invoicing',
  standalone: true,
  imports: [CommonModule, FormsModule, ExistingClinicInvoicesComponent],
  templateUrl: './clinic-invoicing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClinicInvoicingComponent {
  // Subtab activo
  activeSubTab = signal<'generate' | 'existing'>('generate');

  /**
   * Mes seleccionado para filtrar facturas de clínicas
   */
  private _clinicsMonth = signal<number>(0);
  @Input({ required: true })
  set clinicsMonth(value: number) {
    this._clinicsMonth.set(value);
  }
  get clinicsMonth(): number {
    return this._clinicsMonth();
  }

  /**
   * Año seleccionado para filtrar facturas de clínicas
   */
  private _clinicsYear = signal<number>(0);
  @Input({ required: true })
  set clinicsYear(value: number) {
    this._clinicsYear.set(value);
  }
  get clinicsYear(): number {
    return this._clinicsYear();
  }

  /**
   * Array con los nombres de los meses
   */
  @Input({ required: true }) monthNames!: string[];

  /**
   * Array con los años disponibles
   */
  @Input({ required: true }) years!: number[];

  /**
   * Facturas pendientes de clínicas
   */
  private _clinicInvoices = signal<ClinicInvoiceData[]>([]);
  @Input({ required: true })
  set clinicInvoices(value: ClinicInvoiceData[]) {
    this._clinicInvoices.set(value);
  }
  get clinicInvoices(): ClinicInvoiceData[] {
    return this._clinicInvoices();
  }

  /**
   * Estado de carga de facturas de clínicas
   */
  private _isLoadingClinics = signal<boolean>(false);
  @Input({ required: true })
  set isLoadingClinics(value: boolean) {
    this._isLoadingClinics.set(value);
  }
  get isLoadingClinics(): boolean {
    return this._isLoadingClinics();
  }

  /**
   * ID de la clínica seleccionada
   */
  private _selectedClinicId = signal<number | null>(null);
  @Input({ required: true })
  set selectedClinicId(value: number | null) {
    this._selectedClinicId.set(value);
  }
  get selectedClinicId(): number | null {
    return this._selectedClinicId();
  }

  /**
   * Prefijo para números de factura
   */
  @Input({ required: true }) invoicePrefix!: string;

  /**
   * Año para números de factura
   */
  @Input({ required: true }) invoiceYear!: number;

  /**
   * Próximo número de factura
   */
  @Input({ required: true }) invoiceNextNumber!: number;

  /**
   * Evento emitido cuando cambia el mes seleccionado
   */
  @Output() monthChange = new EventEmitter<number>();

  /**
   * Evento emitido cuando cambia el año seleccionado
   */
  @Output() yearChange = new EventEmitter<number>();

  /**
   * Evento emitido cuando se selecciona una clínica
   */
  @Output() clinicSelect = new EventEmitter<number>();

  /**
   * Evento emitido cuando se solicita generar factura de clínica
   */
  @Output() generateInvoice = new EventEmitter<void>();

  /**
   * Evento emitido cuando cambia el prefijo de factura
   */
  @Output() prefixChange = new EventEmitter<string>();

  /**
   * Evento emitido cuando cambia el año de factura
   */
  @Output() invoiceYearChange = new EventEmitter<number>();

  /**
   * Evento emitido cuando se valida el año de factura
   */
  @Output() invoiceYearValidate = new EventEmitter<void>();

  /**
   * Evento emitido cuando se solicita vista previa de una factura pendiente de clínica
   */
  @Output() previewClinicInvoice = new EventEmitter<number>();

  // Inputs para facturas existentes de clínicas
  /**
   * Mes seleccionado para facturas existentes de clínicas
   */
  private _existingClinicMonth = signal<number>(0);
  @Input({ required: true })
  set existingClinicMonth(value: number) {
    this._existingClinicMonth.set(value);
  }
  get existingClinicMonth(): number {
    return this._existingClinicMonth();
  }

  /**
   * Año seleccionado para facturas existentes de clínicas
   */
  private _existingClinicYear = signal<number>(0);
  @Input({ required: true })
  set existingClinicYear(value: number) {
    this._existingClinicYear.set(value);
  }
  get existingClinicYear(): number {
    return this._existingClinicYear();
  }

  /**
   * Facturas existentes de clínicas
   */
  private _existingClinicInvoices = signal<ExistingClinicInvoice[]>([]);
  @Input({ required: true })
  set existingClinicInvoices(value: ExistingClinicInvoice[]) {
    this._existingClinicInvoices.set(value);
  }
  get existingClinicInvoices(): ExistingClinicInvoice[] {
    return this._existingClinicInvoices();
  }

  /**
   * Estado de carga de facturas existentes de clínicas
   */
  private _isLoadingExistingClinics = signal<boolean>(false);
  @Input({ required: true })
  set isLoadingExistingClinics(value: boolean) {
    this._isLoadingExistingClinics.set(value);
  }
  get isLoadingExistingClinics(): boolean {
    return this._isLoadingExistingClinics();
  }

  // Outputs para facturas existentes de clínicas
  /**
   * Evento emitido cuando cambia el mes de facturas existentes de clínicas
   */
  @Output() existingClinicMonthChange = new EventEmitter<number>();

  /**
   * Evento emitido cuando cambia el año de facturas existentes de clínicas
   */
  @Output() existingClinicYearChange = new EventEmitter<number>();

  /**
   * Evento emitido cuando se solicita vista previa de una factura existente de clínica
   */
  @Output() previewExistingClinicInvoice = new EventEmitter<ExistingClinicInvoice>();

  /**
   * Evento emitido cuando se activa el subtab de facturas existentes de clínicas
   */
  @Output() existingClinicSubTabActivated = new EventEmitter<void>();

  /**
   * Maneja el cambio de mes en el filtro
   */
  onMonthChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.monthChange.emit(parseInt(select.value));
  }

  /**
   * Maneja el cambio de año en el filtro
   */
  onYearChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.yearChange.emit(parseInt(select.value));
  }

  /**
   * Selecciona una clínica
   */
  selectClinic(clinicId: number): void {
    this.clinicSelect.emit(clinicId);
  }

  /**
   * Genera factura de clínica
   */
  onGenerateInvoice(): void {
    this.generateInvoice.emit();
  }

  /**
   * Formatea un número como moneda EUR
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }

  /**
   * Obtiene el nombre del mes seleccionado
   */
  getClinicsMonthName(): string {
    return this.monthNames[this._clinicsMonth() - 1];
  }

  /**
   * Formatea número con padding
   */
  padNumber(num: number, length: number = 4): string {
    return num.toString().padStart(length, '0');
  }

  /**
   * Actualiza el prefijo de factura
   */
  onPrefixChange(newPrefix: string): void {
    this.prefixChange.emit(newPrefix);
  }

  /**
   * Actualiza el año de factura
   */
  onInvoiceYearChange(newYear: number): void {
    this.invoiceYearChange.emit(newYear);
  }

  /**
   * Valida el año de factura
   */
  onInvoiceYearBlur(): void {
    this.invoiceYearValidate.emit();
  }

  /**
   * Cambia el subtab activo
   */
  onSubTabChange(tab: 'generate' | 'existing'): void {
    this.activeSubTab.set(tab);
    if (tab === 'existing') {
      this.existingClinicSubTabActivated.emit();
    }
  }

  /**
   * Maneja la vista previa de una factura existente de clínica
   */
  onPreviewExistingClinicInvoice(invoice: ExistingClinicInvoice): void {
    this.previewExistingClinicInvoice.emit(invoice);
  }

  /**
   * Maneja la vista previa de una factura pendiente de clínica
   */
  onPreviewClinicInvoice(clinicId: number): void {
    this.previewClinicInvoice.emit(clinicId);
  }
}
