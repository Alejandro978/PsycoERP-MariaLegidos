import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PendingInvoice, ExistingInvoice } from '../../models/billing.models';
import { ExistingInvoicesComponent } from '../existing-invoices/existing-invoices.component';

/**
 * Componente de facturación con subtabs
 * Gestiona la selección y generación masiva de facturas para pacientes
 * Incluye visualización de facturas existentes
 */
@Component({
  selector: 'app-bulk-invoicing',
  standalone: true,
  imports: [CommonModule, FormsModule, ExistingInvoicesComponent],
  templateUrl: './bulk-invoicing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkInvoicingComponent {
  // Subtab activo
  activeSubTab = signal<'generate' | 'existing'>('generate');
  /**
   * Mes seleccionado para filtrar facturas pendientes
   */
  private _pendingMonth = signal<number>(0);
  @Input({ required: true })
  set pendingMonth(value: number) {
    this._pendingMonth.set(value);
  }
  get pendingMonth(): number {
    return this._pendingMonth();
  }

  /**
   * Año seleccionado para filtrar facturas pendientes
   */
  private _pendingYear = signal<number>(0);
  @Input({ required: true })
  set pendingYear(value: number) {
    this._pendingYear.set(value);
  }
  get pendingYear(): number {
    return this._pendingYear();
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
   * Facturas pendientes de generar
   */
  private _pendingInvoices = signal<PendingInvoice[]>([]);
  @Input({ required: true })
  set pendingInvoices(value: PendingInvoice[]) {
    this._pendingInvoices.set(value);
  }
  get pendingInvoices(): PendingInvoice[] {
    return this._pendingInvoices();
  }

  /**
   * Estado de carga de facturas pendientes
   */
  private _isLoadingPending = signal<boolean>(false);
  @Input({ required: true })
  set isLoadingPending(value: boolean) {
    this._isLoadingPending.set(value);
  }
  get isLoadingPending(): boolean {
    return this._isLoadingPending();
  }

  /**
   * Pacientes seleccionados (DNIs)
   */
  private _selectedPatients = signal<string[]>([]);
  @Input({ required: true })
  set selectedPatients(value: string[]) {
    this._selectedPatients.set(value);
  }
  get selectedPatients(): string[] {
    return this._selectedPatients();
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
   * Evento emitido cuando se alterna la selección de un paciente
   */
  @Output() patientToggle = new EventEmitter<string>();

  /**
   * Evento emitido cuando se seleccionan/deseleccionan todos los pacientes
   */
  @Output() selectAllToggle = new EventEmitter<void>();

  /**
   * Evento emitido cuando se solicita generar facturas
   */
  @Output() generateInvoices = new EventEmitter<void>();

  /**
   * Evento emitido cuando se solicita vista previa de una factura
   */
  @Output() previewInvoice = new EventEmitter<PendingInvoice>();

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

  // Inputs para facturas existentes
  /**
   * Mes seleccionado para facturas existentes
   */
  private _existingMonth = signal<number>(0);
  @Input({ required: true })
  set existingMonth(value: number) {
    this._existingMonth.set(value);
  }
  get existingMonth(): number {
    return this._existingMonth();
  }

  /**
   * Año seleccionado para facturas existentes
   */
  private _existingYear = signal<number>(0);
  @Input({ required: true })
  set existingYear(value: number) {
    this._existingYear.set(value);
  }
  get existingYear(): number {
    return this._existingYear();
  }

  /**
   * Facturas existentes
   */
  private _existingInvoices = signal<ExistingInvoice[]>([]);
  @Input({ required: true })
  set existingInvoices(value: ExistingInvoice[]) {
    this._existingInvoices.set(value);
  }
  get existingInvoices(): ExistingInvoice[] {
    return this._existingInvoices();
  }

  /**
   * Estado de carga de facturas existentes
   */
  private _isLoadingExisting = signal<boolean>(false);
  @Input({ required: true })
  set isLoadingExisting(value: boolean) {
    this._isLoadingExisting.set(value);
  }
  get isLoadingExisting(): boolean {
    return this._isLoadingExisting();
  }

  // Outputs para facturas existentes
  /**
   * Evento emitido cuando cambia el mes de facturas existentes
   */
  @Output() existingMonthChange = new EventEmitter<number>();

  /**
   * Evento emitido cuando cambia el año de facturas existentes
   */
  @Output() existingYearChange = new EventEmitter<number>();

  /**
   * Evento emitido cuando se solicita vista previa de una factura existente
   */
  @Output() previewExistingInvoice = new EventEmitter<ExistingInvoice>();

  /**
   * Evento emitido cuando se solicita descarga masiva de facturas
   */
  @Output() downloadBulkInvoices = new EventEmitter<ExistingInvoice[]>();

  /**
   * Evento emitido cuando se activa el subtab de facturas existentes
   */
  @Output() existingSubTabActivated = new EventEmitter<void>();

  // Filtros locales
  pendingPatientFilter = signal('');
  pendingDniFilter = signal('');
  pendingEmailFilter = signal('');

  /**
   * Facturas filtradas según los criterios de búsqueda
   */
  filteredPendingInvoices = computed(() => {
    const invoices = this._pendingInvoices();
    const patientFilter = this.pendingPatientFilter().toLowerCase();
    const dniFilter = this.pendingDniFilter().toLowerCase();
    const emailFilter = this.pendingEmailFilter().toLowerCase();

    return invoices.filter((invoice) => {
      const matchesPatient = invoice.patient_full_name
        .toLowerCase()
        .includes(patientFilter);
      const matchesDni = invoice.dni.toLowerCase().includes(dniFilter);
      const matchesEmail = invoice.email.toLowerCase().includes(emailFilter);

      return matchesPatient && matchesDni && matchesEmail;
    });
  });

  /**
   * Indica si todos los pacientes están seleccionados
   */
  allSelected = computed(
    () =>
      this._pendingInvoices().length > 0 &&
      this._selectedPatients().length === this._pendingInvoices().length
  );

  /**
   * Número de pacientes seleccionados
   */
  selectedCount = computed(() => this._selectedPatients().length);

  /**
   * Total de la cantidad seleccionada
   */
  totalSelectedAmount = computed(() => {
    const selected = this._selectedPatients();
    return this._pendingInvoices()
      .filter((inv) => selected.includes(inv.dni))
      .reduce((sum, inv) => sum + inv.total_gross, 0);
  });

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
   * Alterna la selección de un paciente
   */
  togglePatientSelection(dni: string): void {
    this.patientToggle.emit(dni);
  }

  /**
   * Selecciona o deselecciona todos los pacientes
   */
  selectAllPatients(): void {
    this.selectAllToggle.emit();
  }

  /**
   * Genera facturas masivas
   */
  onGenerateInvoices(): void {
    this.generateInvoices.emit();
  }

  /**
   * Vista previa de una factura
   */
  onPreviewInvoice(invoice: PendingInvoice): void {
    this.previewInvoice.emit(invoice);
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
  getPendingMonthName(): string {
    return this.monthNames[this._pendingMonth() - 1];
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
      this.existingSubTabActivated.emit();
    }
  }

  /**
   * Maneja la vista previa de una factura existente
   */
  onPreviewExistingInvoice(invoice: ExistingInvoice): void {
    this.previewExistingInvoice.emit(invoice);
  }

  /**
   * Maneja la descarga masiva de facturas
   */
  onDownloadBulkInvoices(invoices: ExistingInvoice[]): void {
    this.downloadBulkInvoices.emit(invoices);
  }
}
